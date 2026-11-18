export interface Station {
  id: number;
  name: string;
  city: string;
  street: string | null;
  /** Województwo WIELKIMI LITERAMI, np. "DOLNOŚLĄSKIE". */
  province: string;
}

export interface Sensor {
  id: number;
  stationId: number;
  paramName: string;
  paramCode: string;
}

/** Pomiar godzinowy. `value === null`, gdy GIOŚ nie ma jeszcze wyniku dla tej godziny. */
export interface Measurement {
  /** Czas lokalny w formacie "RRRR-MM-DD GG:MM:SS". */
  date: string;
  value: number | null;
}

/** Ostatni pomiar z wartością. */
export interface Reading {
  date: string;
  value: number;
}

/** Odczyty jednego stanowiska z ostatniej doby. */
export interface SensorSeries {
  sensor: Sensor;
  /** Od najnowszego. `null` = stanowisko manualne, GIOŚ nie udostępnia bieżących danych. */
  measurements: Measurement[] | null;
  /** Nie udało się pobrać odczytów (błąd sieci lub GIOŚ). */
  failed: boolean;
}

/** Poziom Polskiego Indeksu Jakości Powietrza: 0 = bardzo dobry … 5 = bardzo zły. */
export type IndexLevel = 0 | 1 | 2 | 3 | 4 | 5;

/** Wskaźniki, dla których GIOŚ liczy indeksy cząstkowe. */
export const INDEX_POLLUTANTS = ['PM10', 'PM2.5', 'NO2', 'SO2', 'O3'] as const;
export type IndexPollutant = (typeof INDEX_POLLUTANTS)[number];

export interface IndexEntry {
  /** `null` = brak indeksu. */
  level: IndexLevel | null;
  /** Data pomiaru, z którego GIOŚ policzył indeks. */
  sourceDate: string | null;
}

/** Indeks jakości powietrza stacji, dokładnie tak, jak policzył go GIOŚ. */
export interface AirIndex {
  stationId: number;
  /** Indeks ogólny stacji; `null` = „Brak indeksu”. */
  level: IndexLevel | null;
  calculatedAt: string | null;
  sourceDate: string | null;
  /** Kod zanieczyszczenia krytycznego z GIOŚ (np. "PM10", "OZON"). */
  critical: string | null;
  pollutants: Partial<Record<IndexPollutant, IndexEntry>>;
}
