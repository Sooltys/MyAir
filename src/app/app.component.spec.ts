import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should credit GIOŚ as the data source', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    await fixture.whenStable();
    const footer = (fixture.nativeElement as HTMLElement).querySelector('footer');
    expect(footer?.textContent).toContain('Główny Inspektorat Ochrony Środowiska');
  });

  it('should credit the author with a link to puzyna.pl', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    await fixture.whenStable();
    const footer = (fixture.nativeElement as HTMLElement).querySelector('footer');
    expect(footer?.querySelector('a[href="https://puzyna.pl"]')?.textContent).toBe('puzyna.pl');
    expect(footer?.querySelector('.credit')?.getAttribute('lang')).toBe('en');
    expect(footer?.textContent).toContain('Made with');
    expect(footer?.textContent).not.toContain('Wróć do portfolio');
  });
});
