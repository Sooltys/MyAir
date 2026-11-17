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
  'Województwo': string;
  'Ulica': string | null;
}

export interface GiosSensorDto {
  'Identyfikator stanowiska': number;
  'Identyfikator stacji': number;
  'Wskaźnik': string;
  'Wskaźnik - kod': string;
}

export interface GiosMeasurementDto {
  'Kod stanowiska': string;
  'Data': string;
  'Wartość': number | null;
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

/** Stanowisko manualne – GIOŚ nie udostępnia dla niego bieżących danych (HTTP 400). */
export const GIOS_NO_CURRENT_DATA = 'API-ERR-100003';
