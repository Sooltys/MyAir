import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    await fixture.whenStable();
  });

  it('renders a clickable area for each of the 16 voivodeships', () => {
    const areas = (fixture.nativeElement as HTMLElement).querySelectorAll('area');
    expect(areas.length).toBe(16);
    expect(areas[0].getAttribute('href')).toBe('/wojewodztwo/1');
    expect(areas[0].getAttribute('coords')).toBeTruthy();
  });
});
