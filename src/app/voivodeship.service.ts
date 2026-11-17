import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, forkJoin, map, of, shareReplay, switchMap, throwError } from 'rxjs';

import { API_BASE_URL } from './api.config';
import { Reading, Sensor, Station } from './models/air-quality';
import {
  GIOS_LIST_KEYS,
  GIOS_NO_CURRENT_DATA,
  GiosErrorDto,
  GiosMeasurementDto,
  GiosPage,
  GiosSensorDto,
  GiosStationDto,
} from './models/gios-api';

/** Maksymalny rozmiar strony w API GIOŚ v1. */
const PAGE_SIZE = 500;
/** Ostatnia doba pomiarów godzinowych – wystarczy, by znaleźć najnowszą niepustą wartość. */
const READINGS_SIZE = 24;

export function toStation(dto: GiosStationDto): Station {
  return {
    id: dto['Identyfikator stacji'],
    name: dto['Nazwa stacji'],
    city: dto['Nazwa miasta'],
    street: dto['Ulica'],
    province: dto['Województwo'],
  };
}

export function toSensor(dto: GiosSensorDto): Sensor {
  return {
    id: dto['Identyfikator stanowiska'],
    stationId: dto['Identyfikator stacji'],
    paramName: dto['Wskaźnik'],
    paramCode: dto['Wskaźnik - kod'],
  };
}

/** Najnowszy pomiar z wartością (API sortuje malejąco po dacie; ostatnie godziny bywają puste). */
export function latestReading(measurements: GiosMeasurementDto[]): Reading | null {
  const latest = measurements.find((m) => m['Wartość'] !== null && m['Wartość'] !== undefined);
  return latest ? { date: latest['Data'], value: latest['Wartość'] as number } : null;
}

function listFrom<T>(page: GiosPage, key: string): T[] {
  const list = page[key];
  return Array.isArray(list) ? (list as T[]) : [];
}

@Injectable({
  providedIn: 'root',
})
export class VoivodeshipService {
  private readonly http = inject(HttpClient);

  /** Lista stacji jest wspólna dla wszystkich województw – pobieramy ją raz na sesję. */
  private readonly stations$ = this.getAllPages<GiosStationDto>(
    'station/findAll',
    GIOS_LIST_KEYS.stations,
  ).pipe(
    map((dtos) => dtos.map(toStation)),
    // resetOnError: po błędzie kolejna subskrypcja (np. „Spróbuj ponownie”) pyta API od nowa.
    shareReplay({ bufferSize: 1, refCount: false }),
  );

  getStations(): Observable<Station[]> {
    return this.stations$;
  }

  getSensors(stationId: number): Observable<Sensor[]> {
    return this.getAllPages<GiosSensorDto>(
      `station/sensors/${stationId}`,
      GIOS_LIST_KEYS.sensors,
    ).pipe(map((dtos) => dtos.map(toSensor)));
  }

  /** Najnowszy odczyt stanowiska albo `null`, gdy GIOŚ nie ma bieżących danych. */
  getLatestReading(sensorId: number): Observable<Reading | null> {
    return this.http
      .get<GiosPage>(`${API_BASE_URL}/data/getData/${sensorId}`, {
        params: { size: READINGS_SIZE },
      })
      .pipe(
        map((page) => latestReading(listFrom<GiosMeasurementDto>(page, GIOS_LIST_KEYS.measurements))),
        catchError((error: unknown) => {
          const body = error instanceof HttpErrorResponse ? (error.error as GiosErrorDto | null) : null;
          return body?.error_code === GIOS_NO_CURRENT_DATA ? of(null) : throwError(() => error);
        }),
      );
  }

  private getAllPages<T>(path: string, listKey: string): Observable<T[]> {
    const getPage = (page: number) =>
      this.http.get<GiosPage>(`${API_BASE_URL}/${path}`, { params: { page, size: PAGE_SIZE } });

    return getPage(0).pipe(
      switchMap((first) => {
        const items = listFrom<T>(first, listKey);
        const totalPages = first.totalPages ?? 1;
        if (totalPages <= 1) {
          return of(items);
        }
        const rest = Array.from({ length: totalPages - 1 }, (_, i) => getPage(i + 1));
        return forkJoin(rest).pipe(
          map((pages) => items.concat(...pages.map((p) => listFrom<T>(p, listKey)))),
        );
      }),
    );
  }
}
