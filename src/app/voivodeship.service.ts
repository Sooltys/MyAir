import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  Observable,
  catchError,
  forkJoin,
  map,
  of,
  shareReplay,
  switchMap,
  throwError,
} from 'rxjs';

import { API_BASE_URL } from './api.config';
import {
  AirIndex,
  INDEX_POLLUTANTS,
  IndexEntry,
  IndexLevel,
  Measurement,
  Reading,
  Sensor,
  Station,
} from './models/air-quality';
import {
  GIOS_INDEX_FIELDS,
  GIOS_INDEX_KEY,
  GIOS_LIST_KEYS,
  GIOS_NO_CURRENT_DATA,
  GiosErrorDto,
  GiosIndexDto,
  GiosMeasurementDto,
  GiosPage,
  GiosSensorDto,
  GiosStationDto,
  giosIndexKeys,
} from './models/gios-api';

/** Maksymalny rozmiar strony w API GIOŚ v1. */
const PAGE_SIZE = 500;
/** Ostatnia doba pomiarów godzinowych: najnowsza wartość, wykres i średnie do porównań z normami. */
const READINGS_SIZE = 24;
/** Tyle samo trzyma odpowiedzi proxy (Pages Function); GIOŚ liczy indeks raz na godzinę. */
const INDEX_TTL_MS = 10 * 60 * 1000;

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

export function toMeasurement(dto: GiosMeasurementDto): Measurement {
  const value = dto['Wartość'];
  return { date: dto['Data'], value: value === null || value === undefined ? null : value };
}

/** Najnowszy pomiar z wartością (API sortuje malejąco po dacie; ostatnie godziny bywają puste). */
export function latestReading(measurements: Measurement[]): Reading | null {
  const latest = measurements.find((m) => m.value !== null);
  return latest ? { date: latest.date, value: latest.value as number } : null;
}

function toLevel(value: unknown): IndexLevel | null {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 5
    ? (value as IndexLevel)
    : null;
}

function toText(value: unknown): string | null {
  return typeof value === 'string' && value.trim() !== '' ? value : null;
}

/** Indeks GIOŚ bez interpretacji: wartości, daty i kod zanieczyszczenia krytycznego. */
export function toAirIndex(stationId: number, dto: GiosIndexDto | null | undefined): AirIndex {
  const source = dto ?? {};
  const pollutants: Partial<Record<(typeof INDEX_POLLUTANTS)[number], IndexEntry>> = {};
  for (const code of INDEX_POLLUTANTS) {
    const keys = giosIndexKeys(code);
    const level = toLevel(source[keys.value]);
    const sourceDate = toText(source[keys.sourceDate]);
    if (level !== null || sourceDate !== null) {
      pollutants[code] = { level, sourceDate };
    }
  }
  return {
    stationId,
    level: toLevel(source[GIOS_INDEX_FIELDS.value]),
    calculatedAt: toText(source[GIOS_INDEX_FIELDS.calculatedAt]),
    sourceDate: toText(source[GIOS_INDEX_FIELDS.sourceDate]),
    critical: toText(source[GIOS_INDEX_FIELDS.critical]),
    pollutants,
  };
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
  private readonly indexCache = new Map<number, { at: number; index$: Observable<AirIndex> }>();

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

  /**
   * Pomiary godzinowe stanowiska z ostatniej doby, od najnowszego. `null`, gdy GIOŚ nie ma dla
   * niego bieżących danych (stanowisko manualne).
   */
  getMeasurements(sensorId: number): Observable<Measurement[] | null> {
    return this.http
      .get<GiosPage>(`${API_BASE_URL}/data/getData/${sensorId}`, {
        params: { size: READINGS_SIZE },
      })
      .pipe(
        map((page) =>
          listFrom<GiosMeasurementDto>(page, GIOS_LIST_KEYS.measurements).map(toMeasurement),
        ),
        catchError((error: unknown) => {
          const body =
            error instanceof HttpErrorResponse ? (error.error as GiosErrorDto | null) : null;
          return body?.error_code === GIOS_NO_CURRENT_DATA ? of(null) : throwError(() => error);
        }),
      );
  }

  /**
   * Indeks jakości powietrza stacji. Wynik jest współdzielony przez 10 minut (lista stacji i widok
   * stacji pytają o te same indeksy); po błędzie kolejne wywołanie pyta API od nowa.
   */
  getIndex(stationId: number): Observable<AirIndex> {
    const cached = this.indexCache.get(stationId);
    if (cached && Date.now() - cached.at < INDEX_TTL_MS) {
      return cached.index$;
    }
    const index$ = this.http.get<GiosPage>(`${API_BASE_URL}/aqindex/getIndex/${stationId}`).pipe(
      map((page) => toAirIndex(stationId, page[GIOS_INDEX_KEY] as GiosIndexDto | undefined)),
      catchError((error: unknown) => {
        this.indexCache.delete(stationId);
        return throwError(() => error);
      }),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
    this.indexCache.set(stationId, { at: Date.now(), index$ });
    return index$;
  }

  /**
   * Indeksy wielu stacji naraz. Błąd jednej stacji nie psuje reszty: dostaje wartość `'error'`.
   */
  getIndexes(stationIds: readonly number[]): Observable<ReadonlyMap<number, AirIndex | 'error'>> {
    if (stationIds.length === 0) {
      return of(new Map());
    }
    return forkJoin(
      stationIds.map((id) =>
        this.getIndex(id).pipe(
          map((index): [number, AirIndex | 'error'] => [id, index]),
          catchError(() => of<[number, AirIndex | 'error']>([id, 'error'])),
        ),
      ),
    ).pipe(map((entries) => new Map(entries)));
  }

  /** Zapomina indeks stacji, żeby „Odśwież” zapytał GIOŚ (przez proxy) od nowa. */
  forgetIndex(stationId: number): void {
    this.indexCache.delete(stationId);
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
