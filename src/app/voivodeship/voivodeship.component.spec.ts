import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';

import { AirIndex, Station } from '../models/air-quality';
import { VoivodeshipService } from '../voivodeship.service';
import { VoivodeshipComponent } from './voivodeship.component';

const STATIONS: Station[] = [
  { id: 2, name: 'B', city: 'Wrocław', street: 'ul. B', province: 'DOLNOŚLĄSKIE' },
  { id: 1, name: 'A', city: 'Legnica', street: null, province: 'DOLNOŚLĄSKIE' },
  { id: 4, name: 'D', city: 'Zgorzelec', street: 'ul. D', province: 'DOLNOŚLĄSKIE' },
  { id: 3, name: 'C', city: 'Kraków', street: 'ul. C', province: 'MAŁOPOLSKIE' },
];

function index(stationId: number, level: AirIndex['level']): AirIndex {
  return { stationId, level, calculatedAt: null, sourceDate: null, critical: null, pollutants: {} };
}

describe('VoivodeshipComponent', () => {
  let fixture: ComponentFixture<VoivodeshipComponent>;

  async function render(id: string, service: Partial<VoivodeshipService>) {
    await TestBed.configureTestingModule({
      imports: [VoivodeshipComponent],
      providers: [provideRouter([]), { provide: VoivodeshipService, useValue: service }],
    }).compileComponents();
    fixture = TestBed.createComponent(VoivodeshipComponent);
    fixture.componentRef.setInput('id', id);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  const indexes = (): Observable<ReadonlyMap<number, AirIndex | 'error'>> =>
    of(
      new Map<number, AirIndex | 'error'>([
        [1, index(1, 0)],
        [2, index(2, 4)],
        [4, 'error'],
      ]),
    );

  it('lists stations of the voivodeship A–Z with their GIOŚ index', async () => {
    const el = await render('10', { getStations: () => of(STATIONS), getIndexes: indexes });
    const rows = Array.from(el.querySelectorAll('a.station'));
    expect(rows.map((r) => r.querySelector('.city')?.textContent)).toEqual([
      'Legnica',
      'Wrocław',
      'Zgorzelec',
    ]);
    expect(rows[0].getAttribute('href')).toBe('/stacja/1');
    expect(rows[0].textContent).toContain('Bardzo dobry');
    expect(rows[1].textContent).toContain('Zły');
    expect(rows[2].textContent).toContain('Brak danych');
  });

  it('sorts the worst stations first on request', async () => {
    const el = await render('10', { getStations: () => of(STATIONS), getIndexes: indexes });
    const worstFirst = el.querySelectorAll<HTMLButtonElement>('.segmented button')[1];
    worstFirst.click();
    await fixture.whenStable();
    expect(worstFirst.getAttribute('aria-pressed')).toBe('true');
    const cities = Array.from(el.querySelectorAll('a.station .city')).map((c) => c.textContent);
    expect(cities).toEqual(['Wrocław', 'Legnica', 'Zgorzelec']);
  });

  it('shows an error with a retry button when the API fails', async () => {
    const el = await render('10', { getStations: () => throwError(() => new Error('504')) });
    expect(el.querySelector('[role="alert"]')?.textContent).toContain('Nie udało się pobrać');
    expect(el.querySelector('[role="alert"] button')).toBeTruthy();
  });

  it('handles an unknown voivodeship id', async () => {
    const el = await render('99', { getStations: () => of(STATIONS) });
    expect(el.textContent).toContain('Nie ma takiego województwa');
  });
});
