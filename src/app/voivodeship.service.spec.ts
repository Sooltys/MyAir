import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { Reading } from './models/air-quality';
import { VoivodeshipService, latestReading } from './voivodeship.service';

const STATION_DTO = {
  'Identyfikator stacji': 52,
  'Kod stacji': 'DsLegAlRzecz',
  'Nazwa stacji': 'Legnica, Al. Rzeczypospolitej',
  'Nazwa miasta': 'Legnica',
  'Województwo': 'DOLNOŚLĄSKIE',
  'Ulica': 'Al. Rzeczypospolitej 10/12',
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
    http
      .expectOne('/api/station/findAll?page=1&size=500')
      .flush({
        'Lista stacji pomiarowych': [{ ...STATION_DTO, 'Identyfikator stacji': 53, 'Ulica': null }],
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
          'Wskaźnik': 'dwutlenek azotu',
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

  it('returns the latest non-empty reading', async () => {
    const result = firstValueFrom(service.getLatestReading(291));
    http.expectOne('/api/data/getData/291?size=24').flush({
      'Lista danych pomiarowych': [
        { 'Kod stanowiska': 'X', 'Data': '2026-11-17 21:00:00', 'Wartość': null },
        { 'Kod stanowiska': 'X', 'Data': '2026-11-17 20:00:00', 'Wartość': 15.4 },
      ],
    });
    expect(await result).toEqual<Reading>({ date: '2026-11-17 20:00:00', value: 15.4 });
  });

  it('returns null for a manual sensor (GIOŚ 400 API-ERR-100003)', async () => {
    const result = firstValueFrom(service.getLatestReading(276));
    http
      .expectOne('/api/data/getData/276?size=24')
      .flush({ error_code: 'API-ERR-100003' }, { status: 400, statusText: 'Bad Request' });
    expect(await result).toBeNull();
  });

  it('propagates proxy errors (e.g. 504)', async () => {
    const result = firstValueFrom(service.getLatestReading(291));
    http
      .expectOne('/api/data/getData/291?size=24')
      .flush({ error: 'gios_timeout' }, { status: 504, statusText: 'Gateway Timeout' });
    await expect(result).rejects.toMatchObject({ status: 504 });
  });
});

describe('latestReading', () => {
  it('returns null when there is no value', () => {
    expect(latestReading([])).toBeNull();
    expect(
      latestReading([{ 'Kod stanowiska': 'X', 'Data': '2026-11-17 21:00:00', 'Wartość': null }]),
    ).toBeNull();
  });

  it('keeps a measured zero', () => {
    expect(
      latestReading([{ 'Kod stanowiska': 'X', 'Data': '2026-11-17 21:00:00', 'Wartość': 0 }]),
    ).toEqual({ date: '2026-11-17 21:00:00', value: 0 });
  });
});
