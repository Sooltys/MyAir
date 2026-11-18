import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { Measurement } from './models/air-quality';
import { VoivodeshipService, latestReading, toAirIndex } from './voivodeship.service';

const STATION_DTO = {
  'Identyfikator stacji': 52,
  'Kod stacji': 'DsLegAlRzecz',
  'Nazwa stacji': 'Legnica, Al. Rzeczypospolitej',
  'Nazwa miasta': 'Legnica',
  Województwo: 'DOLNOŚLĄSKIE',
  Ulica: 'Al. Rzeczypospolitej 10/12',
};

describe('VoivodeshipService', () => {
  let service: VoivodeshipService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(VoivodeshipService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('maps GIOŚ v1 stations and fetches every page', async () => {
    const result = firstValueFrom(service.getStations());

    const first = http.expectOne('/api/station/findAll?page=0&size=500');
    first.flush({ 'Lista stacji pomiarowych': [STATION_DTO], totalPages: 2 });
    http.expectOne('/api/station/findAll?page=1&size=500').flush({
      'Lista stacji pomiarowych': [{ ...STATION_DTO, 'Identyfikator stacji': 53, Ulica: null }],
      totalPages: 2,
    });

    expect(await result).toEqual([
      {
        id: 52,
        name: 'Legnica, Al. Rzeczypospolitej',
        city: 'Legnica',
        street: 'Al. Rzeczypospolitej 10/12',
        province: 'DOLNOŚLĄSKIE',
      },
      {
        id: 53,
        name: 'Legnica, Al. Rzeczypospolitej',
        city: 'Legnica',
        street: null,
        province: 'DOLNOŚLĄSKIE',
      },
    ]);
  });

  it('maps sensors of a station', async () => {
    const result = firstValueFrom(service.getSensors(52));
    http.expectOne('/api/station/sensors/52?page=0&size=500').flush({
      'Lista stanowisk pomiarowych dla podanej stacji': [
        {
          'Identyfikator stanowiska': 291,
          'Identyfikator stacji': 52,
          Wskaźnik: 'dwutlenek azotu',
          'Wskaźnik - wzór': 'NO2',
          'Wskaźnik - kod': 'NO2',
          'Id wskaźnika': 6,
        },
      ],
      totalPages: 1,
    });
    expect(await result).toEqual([
      { id: 291, stationId: 52, paramName: 'dwutlenek azotu', paramCode: 'NO2' },
    ]);
  });

  it('returns the last day of measurements, empty hours included', async () => {
    const result = firstValueFrom(service.getMeasurements(291));
    http.expectOne('/api/data/getData/291?size=24').flush({
      'Lista danych pomiarowych': [
        { 'Kod stanowiska': 'X', Data: '2026-11-17 21:00:00', Wartość: null },
        { 'Kod stanowiska': 'X', Data: '2026-11-17 20:00:00', Wartość: 15.4 },
      ],
    });
    expect(await result).toEqual<Measurement[]>([
      { date: '2026-11-17 21:00:00', value: null },
      { date: '2026-11-17 20:00:00', value: 15.4 },
    ]);
  });

  it('returns null for a manual sensor (GIOŚ 400 API-ERR-100003)', async () => {
    const result = firstValueFrom(service.getMeasurements(276));
    http
      .expectOne('/api/data/getData/276?size=24')
      .flush({ error_code: 'API-ERR-100003' }, { status: 400, statusText: 'Bad Request' });
    expect(await result).toBeNull();
  });

  it('propagates proxy errors (e.g. 504)', async () => {
    const result = firstValueFrom(service.getMeasurements(291));
    http
      .expectOne('/api/data/getData/291?size=24')
      .flush({ error: 'gios_timeout' }, { status: 504, statusText: 'Gateway Timeout' });
    await expect(result).rejects.toMatchObject({ status: 504 });
  });

  it('shares one index request per station', async () => {
    const first = firstValueFrom(service.getIndex(400));
    const second = firstValueFrom(service.getIndex(400));
    http.expectOne('/api/aqindex/getIndex/400').flush({ AqIndex: INDEX_DTO });
    expect((await first).level).toBe(0);
    expect(await second).toEqual(await first);
  });

  it('marks a failed index as an error without failing the other stations', async () => {
    const result = firstValueFrom(service.getIndexes([400, 401]));
    http.expectOne('/api/aqindex/getIndex/400').flush({ AqIndex: INDEX_DTO });
    http
      .expectOne('/api/aqindex/getIndex/401')
      .flush({ error: 'gios_unreachable' }, { status: 502, statusText: 'Bad Gateway' });
    const map = await result;
    expect(map.get(400)).toMatchObject({ level: 0 });
    expect(map.get(401)).toBe('error');
  });
});

const INDEX_DTO = {
  'Identyfikator stacji pomiarowej': 400,
  'Data wykonania obliczeń indeksu': '2026-11-18 01:25:18',
  'Wartość indeksu': 0,
  'Nazwa kategorii indeksu': 'Bardzo dobry',
  'Data danych źródłowych, z których policzono wartość indeksu dla wskaźnika st':
    '2026-11-18 01:00:00',
  'Wartość indeksu dla wskaźnika NO2': 0,
  'Nazwa kategorii indeksu dla wskażnika NO2': 'Bardzo dobry',
  'Data danych źródłowych, z których policzono wartość indeksu dla wskaźnika NO2':
    '2026-11-18 01:00:00',
  'Wartość indeksu dla wskaźnika PM2.5': null,
  'Nazwa kategorii indeksu dla wskażnika PM2.5': null,
  'Data danych źródłowych, z których policzono wartość indeksu dla wskaźnika PM2.5': null,
  'Status indeksu ogólnego dla stacji pomiarowej': true,
  'Kod zanieczyszczenia krytycznego': 'OZON',
};

describe('toAirIndex', () => {
  it('maps the overall and per-pollutant GIOŚ index as published', () => {
    expect(toAirIndex(400, INDEX_DTO)).toEqual({
      stationId: 400,
      level: 0,
      calculatedAt: '2026-11-18 01:25:18',
      sourceDate: '2026-11-18 01:00:00',
      critical: 'OZON',
      pollutants: { NO2: { level: 0, sourceDate: '2026-11-18 01:00:00' } },
    });
  });

  it('treats an empty GIOŚ index as “Brak indeksu”', () => {
    const empty = toAirIndex(391, {
      'Identyfikator stacji pomiarowej': null,
      'Wartość indeksu': null,
    });
    expect(empty.level).toBeNull();
    expect(empty.pollutants).toEqual({});
  });
});

describe('latestReading', () => {
  it('returns null when there is no value', () => {
    expect(latestReading([])).toBeNull();
    expect(latestReading([{ date: '2026-11-17 21:00:00', value: null }])).toBeNull();
  });

  it('keeps a measured zero', () => {
    expect(latestReading([{ date: '2026-11-17 21:00:00', value: 0 }])).toEqual({
      date: '2026-11-17 21:00:00',
      value: 0,
    });
  });
});
