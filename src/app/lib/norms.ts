import { Measurement } from '../models/air-quality';

/**
 * Okres uśredniania normy. Porównujemy wyłącznie w tym samym okresie: pojedyncza godzina nigdy
 * nie jest „przekroczeniem” normy dobowej, a normy rocznej nie da się sprawdzić danymi z doby.
 */
export type Averaging = '1h' | '8h' | '24h' | 'year';

export interface Norm {
  body: 'WHO' | 'UE';
  averaging: Averaging;
  /** µg/m³, w tej samej jednostce co pomiary GIOŚ. */
  limit: number;
  /** Ozon w UE ma poziom docelowy, nie dopuszczalny. */
  target?: boolean;
}

/**
 * WHO: wytyczne jakości powietrza z 2021 r. (AQG 2021).
 * UE: normy obowiązujące w Polsce według dyrektywy 2008/50/WE (PM2.5: 20 µg/m³ od 2020 r.).
 */
export const NORMS: Readonly<Record<string, readonly Norm[]>> = {
  'PM2.5': [
    { body: 'WHO', averaging: '24h', limit: 15 },
    { body: 'UE', averaging: 'year', limit: 20 },
  ],
  PM10: [
    { body: 'WHO', averaging: '24h', limit: 45 },
    { body: 'UE', averaging: '24h', limit: 50 },
  ],
  NO2: [
    { body: 'WHO', averaging: '24h', limit: 25 },
    { body: 'UE', averaging: '1h', limit: 200 },
  ],
  O3: [
    { body: 'WHO', averaging: '8h', limit: 100 },
    { body: 'UE', averaging: '8h', limit: 120, target: true },
  ],
  SO2: [
    { body: 'WHO', averaging: '24h', limit: 40 },
    { body: 'UE', averaging: '24h', limit: 125 },
  ],
  CO: [
    { body: 'WHO', averaging: '24h', limit: 4000 },
    { body: 'UE', averaging: '8h', limit: 10000 },
  ],
  C6H6: [{ body: 'UE', averaging: 'year', limit: 5 }],
};

/** Średnia dobowa liczy się, gdy jest co najmniej 18 z 24 godzin (75%, jak w ocenie GIOŚ/UE). */
export const MIN_HOURS_24H = 18;
/** Średnia 8-godzinna liczy się z co najmniej 6 z 8 godzin. */
export const MIN_HOURS_8H = 6;

export type NormStatus = 'within' | 'above' | 'insufficient' | 'annual';

export interface NormCheck {
  norm: Norm;
  status: NormStatus;
  /** Wartość porównywana z normą (np. średnia z 24 h); `null`, gdy nie da się jej policzyć. */
  measured: number | null;
  /** `measured / limit`. */
  ratio: number | null;
  /** Ile godzin z pomiarem weszło do porównania. */
  hours: number;
}

function values(measurements: readonly Measurement[]): number[] {
  return measurements.filter((m) => m.value !== null).map((m) => m.value as number);
}

function mean(list: readonly number[]): number {
  return list.reduce((sum, v) => sum + v, 0) / list.length;
}

/** Najwyższa średnia krocząca z 8 kolejnych godzin, w których jest co najmniej 6 pomiarów. */
function maxEightHourMean(
  measurements: readonly Measurement[],
): { value: number; hours: number } | null {
  let best: { value: number; hours: number } | null = null;
  for (let start = 0; start + 8 <= measurements.length; start++) {
    const window = values(measurements.slice(start, start + 8));
    if (window.length >= MIN_HOURS_8H) {
      const value = mean(window);
      if (!best || value > best.value) {
        best = { value, hours: window.length };
      }
    }
  }
  return best;
}

/**
 * Porównuje pomiary z ostatniej doby (od najnowszego) z normą w jej własnym okresie uśredniania.
 */
export function checkNorm(norm: Norm, measurements: readonly Measurement[]): NormCheck {
  const result = (measured: number | null, hours: number): NormCheck => {
    if (measured === null) {
      return { norm, status: 'insufficient', measured: null, ratio: null, hours };
    }
    return {
      norm,
      status: measured > norm.limit ? 'above' : 'within',
      measured,
      ratio: measured / norm.limit,
      hours,
    };
  };

  switch (norm.averaging) {
    case 'year':
      return { norm, status: 'annual', measured: null, ratio: null, hours: 0 };
    case '1h': {
      const latest = measurements.find((m) => m.value !== null);
      return result(latest ? (latest.value as number) : null, latest ? 1 : 0);
    }
    case '24h': {
      const day = values(measurements.slice(0, 24));
      return result(day.length >= MIN_HOURS_24H ? mean(day) : null, day.length);
    }
    case '8h': {
      const best = maxEightHourMean(measurements.slice(0, 24));
      return result(best ? best.value : null, best ? best.hours : 0);
    }
  }
}

export function checkNorms(code: string, measurements: readonly Measurement[]): NormCheck[] {
  return (NORMS[code] ?? []).map((norm) => checkNorm(norm, measurements));
}

/** Najmocniej przekroczona norma spośród podanych porównań (albo `null`, gdy żadna). */
export function worstExceedance(checks: readonly NormCheck[]): NormCheck | null {
  return checks
    .filter((c) => c.status === 'above')
    .reduce<NormCheck | null>(
      (worst, c) => (!worst || (c.ratio ?? 0) > (worst.ratio ?? 0) ? c : worst),
      null,
    );
}

/** „średnia z 24 h”, „ostatnia godzina”… – na czym oparto porównanie. */
export function basisLabel(averaging: Averaging): string {
  switch (averaging) {
    case '1h':
      return 'ostatnia godzina';
    case '8h':
      return 'najwyższa średnia 8 h z doby';
    case '24h':
      return 'średnia z 24 h';
    case 'year':
      return 'norma roczna';
  }
}

/** „norma dobowa”, „norma 8-godzinna”… */
export function periodLabel(averaging: Averaging): string {
  switch (averaging) {
    case '1h':
      return 'godzinowa';
    case '8h':
      return '8-godzinna';
    case '24h':
      return 'dobowa';
    case 'year':
      return 'roczna';
  }
}

/** „wytyczna WHO” / „norma UE” / „poziom docelowy UE”. */
export function normName(norm: Norm): string {
  if (norm.body === 'WHO') {
    return 'wytyczna WHO';
  }
  return norm.target ? 'poziom docelowy UE' : 'norma UE';
}
