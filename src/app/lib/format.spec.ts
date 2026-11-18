import {
  formatDerived,
  formatHour,
  formatRatio,
  formatValue,
  formatWhen,
  normalizeText,
} from './format';

describe('format', () => {
  it('keeps the published precision with a Polish decimal comma', () => {
    expect(formatValue(38.8)).toBe('38,8');
    expect(formatValue(0.46)).toBe('0,46');
    expect(formatValue(222)).toBe('222');
  });

  it('rounds derived values', () => {
    expect(formatDerived(71.29)).toBe('71');
    expect(formatDerived(4.27)).toBe('4,3');
    expect(formatRatio(4.7333)).toBe('4,7');
  });

  it('formats GIOŚ local times relative to today', () => {
    const now = new Date(2026, 10, 18, 9, 30);
    expect(formatHour('2026-11-18 21:00:00')).toBe('21:00');
    expect(formatWhen('2026-11-18 01:00:00', now)).toBe('dziś, 01:00');
    expect(formatWhen('2026-11-17 23:00:00', now)).toBe('wczoraj, 23:00');
    expect(formatWhen('2026-11-16 23:00:00', now)).toBe('16.11, 23:00');
  });

  it('normalizes Polish text for search', () => {
    expect(normalizeText('Łódź')).toBe('lodz');
    expect(normalizeText('  Kraków, AL. Krasińskiego ')).toBe('krakow, al. krasinskiego');
  });
});
