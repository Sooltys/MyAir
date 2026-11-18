import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { Station } from '../models/air-quality';
import { VoivodeshipService } from '../voivodeship.service';
import { HeaderComponent } from './header.component';

const STATIONS: Station[] = [
  {
    id: 400,
    name: 'Kraków, Al. Krasińskiego',
    city: 'Kraków',
    street: 'Al. Krasińskiego',
    province: 'MAŁOPOLSKIE',
  },
  {
    id: 401,
    name: 'Kraków, ul. Bujaka',
    city: 'Kraków',
    street: 'ul. Bujaka',
    province: 'MAŁOPOLSKIE',
  },
  { id: 9, name: 'Łódź, ul. Czernika', city: 'Łódź', street: 'ul. Czernika', province: 'ŁÓDZKIE' },
];

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>;
  let el: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        provideRouter([]),
        { provide: VoivodeshipService, useValue: { getStations: () => of(STATIONS) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    await fixture.whenStable();
    el = fixture.nativeElement as HTMLElement;
  });

  async function type(text: string) {
    const input = el.querySelector('input[role="combobox"]') as HTMLInputElement;
    input.dispatchEvent(new Event('focus'));
    input.value = text;
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    return input;
  }

  it('links to the portfolio author page', () => {
    expect(el.querySelector('a[href="https://puzyna.pl"]')).toBeTruthy();
  });

  it('finds stations without Polish characters', async () => {
    const input = await type('lodz');
    expect(input.getAttribute('aria-expanded')).toBe('true');
    const options = Array.from(el.querySelectorAll('[role="option"]')).map(
      (o) => o.textContent ?? '',
    );
    expect(options.length).toBe(1);
    expect(options[0]).toContain('Łódź');
    expect(options[0]).toContain('łódzkie');
  });

  it('opens the chosen station with the keyboard', async () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const input = await type('krakow buj');
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(navigate).toHaveBeenCalledWith(['/wojewodztwo', 13, 'stacja', 401]);
  });

  it('says when nothing matches', async () => {
    await type('xyz');
    expect(el.querySelector('[role="status"]')?.textContent).toContain('Brak stacji dla „xyz”');
  });
});
