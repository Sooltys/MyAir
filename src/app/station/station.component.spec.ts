import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { AirIndex, Measurement, Station } from '../models/air-quality';
import { VoivodeshipService } from '../voivodeship.service';
import { StationComponent } from './station.component';

const STATIONS: Station[] = [
  {
    id: 401,
    name: 'Kraków, ul. Bujaka',
    city: 'Kraków',
    street: 'ul. Bujaka',
    province: 'MAŁOPOLSKIE',
  },
];

const INDEX: AirIndex = {
  stationId: 401,
  level: 4,
  calculatedAt: '2026-11-18 21:25:00',
  sourceDate: '2026-11-18 21:00:00',
  critical: 'PM2.5',
  pollutants: { 'PM2.5': { level: 4, sourceDate: '2026-11-18 21:00:00' } },
};

function day(value: number): Measurement[] {
  return Array.from({ length: 24 }, (_, i) => ({
    date: `2026-11-18 ${String(23 - i).padStart(2, '0')}:00:00`,
    value,
  }));
}

describe('StationComponent', () => {
  let fixture: ComponentFixture<StationComponent>;

  async function render(service: Partial<VoivodeshipService>, stationId = '401') {
    await TestBed.configureTestingModule({
      imports: [StationComponent],
      providers: [provideRouter([]), { provide: VoivodeshipService, useValue: service }],
    }).compileComponents();
    fixture = TestBed.createComponent(StationComponent);
    fixture.componentRef.setInput('id', '13');
    fixture.componentRef.setInput('stationId', stationId);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  const service: Partial<VoivodeshipService> = {
    getStations: () => of(STATIONS),
    getIndex: () => of(INDEX),
    forgetIndex: () => undefined,
    getSensors: () =>
      of([
        { id: 1, stationId: 401, paramName: 'pył zawieszony PM2.5', paramCode: 'PM2.5' },
        { id: 2, stationId: 401, paramName: 'tlenki azotu', paramCode: 'NOx' },
        { id: 3, stationId: 401, paramName: 'arsen w PM10', paramCode: 'As(PM10)' },
      ]),
    getMeasurements: (id: number) => of(id === 1 ? day(60) : id === 2 ? day(51.6) : null),
  };

  it('leads with the GIOŚ verdict and floods the hero when the air is bad', async () => {
    const el = await render(service);
    const hero = el.querySelector('.hero');
    expect(hero?.classList).toContain('is-alarm');
    expect(hero?.querySelector('.disc-level')?.textContent).toContain('Zły');
    expect(hero?.querySelector('h1')?.textContent).toContain('Kraków, ul. Bujaka');
    expect(hero?.textContent).toContain('pył PM2.5');
  });

  it('compares the daily mean with WHO and never checks the annual EU norm', async () => {
    const el = await render(service);
    expect(el.querySelector('.headline')?.textContent).toContain('PM2.5 ponad wytyczną WHO');
    expect(el.querySelector('.headline')?.textContent).toContain('(4×)');

    const card = el.querySelector('app-pollutant-card');
    expect(card?.textContent).toContain('60');
    const norms = Array.from(card?.querySelectorAll('.norms li') ?? []).map(
      (li) => li.textContent ?? '',
    );
    expect(norms[0]).toContain('4× normy');
    expect(norms[1]).toContain('nie porównujemy go z jedną dobą');
  });

  it('folds sensors without norms or current data into “Pozostałe stanowiska”', async () => {
    const el = await render(service);
    const others = el.querySelector('details.others');
    expect(el.querySelectorAll('app-pollutant-card').length).toBe(1);
    expect(others?.textContent).toContain('tlenki azotu');
    expect(others?.textContent).toContain('51,6');
    expect(others?.textContent).toContain('pomiar manualny, bez bieżących danych');
  });

  it('keeps showing readings when the index cannot be loaded', async () => {
    const el = await render({ ...service, getIndex: () => throwError(() => new Error('502')) });
    expect(el.querySelector('.inline-error')?.textContent).toContain(
      'Nie udało się pobrać indeksu',
    );
    expect(el.querySelectorAll('app-pollutant-card').length).toBe(1);
  });

  it('says so when the station is not in this voivodeship', async () => {
    const el = await render(service, '999');
    expect(el.textContent).toContain('Nie ma takiej stacji');
  });
});
