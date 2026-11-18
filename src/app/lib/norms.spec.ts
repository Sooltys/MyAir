import { Measurement } from '../models/air-quality';
import { NORMS, checkNorm, checkNorms, worstExceedance } from './norms';

/** Od najnowszego: `values[0]` to ostatnia godzina. */
function hours(values: (number | null)[]): Measurement[] {
  return values.map((value, i) => ({
    date: `2026-11-18 ${String(23 - i).padStart(2, '0')}:00:00`,
    value,
  }));
}

describe('checkNorm', () => {
  it('compares the 24-hour mean with a daily norm, never a single hour', () => {
    // Jedna godzina 300 µg/m³, reszta 10: średnia 22 – poniżej normy dobowej PM10 WHO (45).
    const day = hours([300, ...Array<number>(23).fill(10)]);
    const check = checkNorm({ body: 'WHO', averaging: '24h', limit: 45 }, day);
    expect(check.status).toBe('within');
    expect(check.measured).toBeCloseTo((300 + 23 * 10) / 24);
    expect(check.hours).toBe(24);
  });

  it('flags a daily mean above the norm with its ratio', () => {
    const check = checkNorm(
      { body: 'WHO', averaging: '24h', limit: 15 },
      hours(Array(24).fill(60)),
    );
    expect(check.status).toBe('above');
    expect(check.ratio).toBeCloseTo(4);
  });

  it('needs at least 18 of 24 hours for a daily mean', () => {
    const sparse = hours([...Array<number>(17).fill(80), ...Array<null>(7).fill(null)]);
    const check = checkNorm({ body: 'UE', averaging: '24h', limit: 50 }, sparse);
    expect(check.status).toBe('insufficient');
    expect(check.measured).toBeNull();
    expect(check.hours).toBe(17);
  });

  it('uses the latest measured hour for an hourly norm, skipping empty recent hours', () => {
    const check = checkNorm({ body: 'UE', averaging: '1h', limit: 200 }, hours([null, 210, 50]));
    expect(check.status).toBe('above');
    expect(check.measured).toBe(210);
  });

  it('takes the highest 8-hour rolling mean with at least 6 hours', () => {
    const series = hours([...Array<number>(8).fill(130), ...Array<number>(16).fill(40)]);
    const check = checkNorm({ body: 'UE', averaging: '8h', limit: 120, target: true }, series);
    expect(check.status).toBe('above');
    expect(check.measured).toBe(130);
  });

  it('never checks an annual norm against one day of data', () => {
    const check = checkNorm(
      { body: 'UE', averaging: 'year', limit: 20 },
      hours(Array(24).fill(90)),
    );
    expect(check.status).toBe('annual');
    expect(check.measured).toBeNull();
  });
});

describe('checkNorms', () => {
  it('returns WHO and EU checks for PM2.5 and nothing for NOx', () => {
    expect(checkNorms('PM2.5', hours(Array(24).fill(20))).map((c) => c.norm.body)).toEqual([
      'WHO',
      'UE',
    ]);
    expect(checkNorms('NOx', hours(Array(24).fill(20)))).toEqual([]);
  });

  it('defines norms in µg/m³, including carbon monoxide', () => {
    expect(NORMS['CO']?.map((n) => n.limit)).toEqual([4000, 10000]);
  });
});

describe('worstExceedance', () => {
  it('picks the largest ratio among exceeded norms', () => {
    const day = hours(Array(24).fill(90));
    const checks = [...checkNorms('PM10', day), ...checkNorms('PM2.5', day)];
    const worst = worstExceedance(checks);
    expect(worst?.norm).toEqual({ body: 'WHO', averaging: '24h', limit: 15 });
    expect(worst?.ratio).toBeCloseTo(6);
  });

  it('returns null when nothing is exceeded', () => {
    expect(worstExceedance(checkNorms('PM10', hours(Array(24).fill(5))))).toBeNull();
  });
});
