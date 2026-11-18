/**
 * Surowe typy odpowiedzi API GIOŚ v1 (`/pjp-api/v1/rest/...`, przez proxy pod `/api/...`).
 * Klucze są po polsku, dokładnie tak, jak zwraca je API. Poza serwisem używaj modeli z
 * `air-quality.ts`.
 */

/** Wspólna część każdej strony wyników (lista jest pod kluczem zależnym od endpointu). */
export interface GiosPage {
  totalPages?: number;
  [listKey: string]: unknown;
}

export interface GiosStationDto {
  'Identyfikator stacji': number;
  'Kod stacji': string;
  'Nazwa stacji': string;
  'Nazwa miasta': string;
  Województwo: string;
  Ulica: string | null;
}

export interface GiosSensorDto {
  'Identyfikator stanowiska': number;
  'Identyfikator stacji': number;
  Wskaźnik: string;
  'Wskaźnik - kod': string;
}

export interface GiosMeasurementDto {
  'Kod stanowiska': string;
  Data: string;
  Wartość: number | null;
}

export interface GiosErrorDto {
  error_code?: string;
  error_reason?: string;
}

export const GIOS_LIST_KEYS = {
  stations: 'Lista stacji pomiarowych',
  sensors: 'Lista stanowisk pomiarowych dla podanej stacji',
  measurements: 'Lista danych pomiarowych',
} as const;

/**
 * Odpowiedź `aqindex/getIndex/{stationId}` pod kluczem `AqIndex`. Klucze indeksów cząstkowych
 * mają postać „Wartość indeksu dla wskaźnika PM10” (por. `giosIndexKeys`). Uwaga: GIOŚ pisze
 * „wskażnika” z literówką w kluczu nazwy kategorii, a klucz daty indeksu ogólnego jest ucięty
 * („…dla wskaźnika st”).
 */
export type GiosIndexDto = Record<string, string | number | boolean | null | undefined>;

export const GIOS_INDEX_KEY = 'AqIndex';

export const GIOS_INDEX_FIELDS = {
  stationId: 'Identyfikator stacji pomiarowej',
  calculatedAt: 'Data wykonania obliczeń indeksu',
  value: 'Wartość indeksu',
  sourceDate: 'Data danych źródłowych, z których policzono wartość indeksu dla wskaźnika st',
  critical: 'Kod zanieczyszczenia krytycznego',
} as const;

/** Klucze indeksu cząstkowego dla wskaźnika (np. "PM2.5"). */
export function giosIndexKeys(code: string) {
  return {
    value: `Wartość indeksu dla wskaźnika ${code}`,
    sourceDate: `Data danych źródłowych, z których policzono wartość indeksu dla wskaźnika ${code}`,
  };
}

/** Stanowisko manualne – GIOŚ nie udostępnia dla niego bieżących danych (HTTP 400). */
export const GIOS_NO_CURRENT_DATA = 'API-ERR-100003';
