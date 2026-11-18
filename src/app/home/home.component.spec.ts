import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { Station } from '../models/air-quality';
import { VoivodeshipService } from '../voivodeship.service';
import { HomeComponent } from './home.component';

const STATIONS: Station[] = [
  { id: 1, name: 'A', city: 'Kraków', street: 'ul. A', province: 'MAŁOPOLSKIE' },
  { id: 2, name: 'B', city: 'Tarnów', street: null, province: 'MAŁOPOLSKIE' },
  { id: 3, name: 'C', city: 'Łódź', street: 'ul. C', province: 'ŁÓDZKIE' },
];

describe('HomeComponent', () => {
  let fixture: ComponentFixture<HomeComponent>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideRouter([]),
        { provide: VoivodeshipService, useValue: { getStations: () => of(STATIONS) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    await fixture.whenStable();
    el = fixture.nativeElement as HTMLElement;
  });

  it('draws a linked map region for each of the 16 voivodeships', () => {
    const regions = el.querySelectorAll('svg a.region');
    expect(regions.length).toBe(16);
    expect(regions[0].getAttribute('href')).toBe('/wojewodztwo/1');
    expect(regions[0].getAttribute('aria-label')).toBe('Zachodniopomorskie');
    expect(regions[0].querySelector('path')?.getAttribute('d')).toMatch(/^M[\d.]+,[\d.]+L/);
  });

  it('lists voivodeships with their station counts', () => {
    const items = Array.from(el.querySelectorAll('nav.list a')).map((a) => a.textContent ?? '');
    expect(items.length).toBe(16);
    expect(items.find((t) => t.includes('Małopolskie'))).toContain('2 stacje');
    expect(items.find((t) => t.includes('Łódzkie'))).toContain('1 stacja');
    expect(items.find((t) => t.includes('Opolskie'))).toContain('0 stacji');
  });

  it('states how many GIOŚ stations feed the data', () => {
    expect(el.querySelector('.lead')?.textContent).toContain('3');
  });
});
