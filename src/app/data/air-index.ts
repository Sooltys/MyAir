import { IndexLevel } from '../models/air-quality';

/** Nazwy kategorii Polskiego Indeksu Jakości Powietrza (GIOŚ), od 0 do 5. */
export const INDEX_LEVEL_NAMES: Readonly<Record<IndexLevel, string>> = {
  0: 'Bardzo dobry',
  1: 'Dobry',
  2: 'Umiarkowany',
  3: 'Dostateczny',
  4: 'Zły',
  5: 'Bardzo zły',
};

export const NO_INDEX_NAME = 'Brak indeksu';

export const INDEX_LEVELS: readonly IndexLevel[] = [0, 1, 2, 3, 4, 5];

export function indexLevelName(level: IndexLevel | null): string {
  return level === null ? NO_INDEX_NAME : INDEX_LEVEL_NAMES[level];
}

export interface PollutantInfo {
  /** Zapis z indeksami dolnymi, np. „NO₂”. */
  label: string;
  /** Nazwa w mianowniku, np. „dwutlenek azotu”. */
  name: string;
}

/** Wskaźniki z bieżącymi pomiarami godzinowymi, w kolejności wyświetlania. */
export const POLLUTANTS: Readonly<Record<string, PollutantInfo>> = {
  'PM2.5': { label: 'PM2.5', name: 'pył zawieszony PM2.5' },
  PM10: { label: 'PM10', name: 'pył zawieszony PM10' },
  NO2: { label: 'NO₂', name: 'dwutlenek azotu' },
  O3: { label: 'O₃', name: 'ozon' },
  SO2: { label: 'SO₂', name: 'dwutlenek siarki' },
  CO: { label: 'CO', name: 'tlenek węgla' },
  C6H6: { label: 'C₆H₆', name: 'benzen' },
  NO: { label: 'NO', name: 'tlenek azotu' },
  NOx: { label: 'NOₓ', name: 'tlenki azotu' },
};

export const POLLUTANT_ORDER: readonly string[] = Object.keys(POLLUTANTS);

export function pollutantLabel(code: string): string {
  return POLLUTANTS[code]?.label ?? code;
}

/** Kody zanieczyszczenia krytycznego z API GIOŚ → nazwa do zdania „Decyduje: …”. */
const CRITICAL_NAMES: Readonly<Record<string, string>> = {
  OZON: 'ozon (O₃)',
  O3: 'ozon (O₃)',
  PM10: 'pył PM10',
  'PM2.5': 'pył PM2.5',
  PM25: 'pył PM2.5',
  PYL: 'pył zawieszony',
  NO2: 'dwutlenek azotu (NO₂)',
  SO2: 'dwutlenek siarki (SO₂)',
};

export function criticalPollutantName(code: string | null): string | null {
  if (!code) {
    return null;
  }
  return CRITICAL_NAMES[code.toUpperCase()] ?? code;
}
