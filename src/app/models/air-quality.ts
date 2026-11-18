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

export interface Reading {
  /** Czas lokalny w formacie "RRRR-MM-DD GG:MM:SS". */
  date: string;
  value: number;
}

export interface SensorReading {
  sensor: Sensor;
  /** `null` = brak bieżących danych (np. stanowisko manualne). */
  reading: Reading | null;
  failed: boolean;
}
