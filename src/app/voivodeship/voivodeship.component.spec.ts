import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { Station } from '../models/air-quality';
import { VoivodeshipService } from '../voivodeship.service';
import { VoivodeshipComponent } from './voivodeship.component';

const STATIONS: Station[] = [
  { id: 2, name: 'B', city: 'Wrocław', street: 'ul. B', province: 'DOLNOŚLĄSKIE' },
  { id: 1, name: 'A', city: 'Legnica', street: null, province: 'DOLNOŚLĄSKIE' },
  { id: 3, name: 'C', city: 'Kraków', street: 'ul. C', province: 'MAŁOPOLSKIE' },
];

describe('VoivodeshipComponent', () => {
  let fixture: ComponentFixture<VoivodeshipComponent>;
  let service: Partial<VoivodeshipService>;

  async function render(id: string) {
    await TestBed.configureTestingModule({
      imports: [VoivodeshipComponent],
      providers: [provideRouter([]), { provide: VoivodeshipService, useValue: service }],
    }).compileComponents();
    fixture = TestBed.createComponent(VoivodeshipComponent);
    fixture.componentRef.setInput('id', id);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it('lists stations of the voivodeship, sorted by city', async () => {
    service = { getStations: () => of(STATIONS) };
    const el = await render('10'); // Dolnośląskie
    const stations = Array.from(el.querySelectorAll('.station')).map((s) => s.textContent);
    expect(stations.length).toBe(2);
    expect(stations[0]).toContain('Legnica');
    expect(stations[1]).toContain('Wrocław');
  });

  it('shows an error with a retry button when the API fails', async () => {
    service = { getStations: () => throwError(() => new Error('504')) };
    const el = await render('10');
    expect(el.querySelector('[role="alert"]')?.textContent).toContain('Nie udało się pobrać');
    expect(el.querySelector('[role="alert"] button')).toBeTruthy();
  });

  it('shows sensor readings, including sensors without current data', async () => {
    service = {
      getStations: () => of(STATIONS),
      getSensors: () =>
        of([
          { id: 10, stationId: 1, paramName: 'dwutlenek azotu', paramCode: 'NO2' },
          { id: 11, stationId: 1, paramName: 'arsen w PM10', paramCode: 'As(PM10)' },
        ]),
      getLatestReading: (id: number) =>
        of(id === 10 ? { date: '2026-11-17 20:00:00', value: 15.4 } : null),
    };
    const el = await render('10');
    (el.querySelector('.station') as HTMLButtonElement).click();
    await fixture.whenStable();

    const sensors = Array.from(el.querySelectorAll('.sensor')).map((s) => s.textContent ?? '');
    expect(sensors.length).toBe(2);
    expect(sensors[0]).toContain('NO2');
    expect(sensors[0]).toContain('15.4');
    expect(sensors[1]).toContain('brak bieżących danych');
  });

  it('handles an unknown voivodeship id', async () => {
    service = { getStations: () => of(STATIONS) };
    const el = await render('99');
    expect(el.textContent).toContain('Nie ma takiego województwa');
  });
});
