import { Voivodeship } from '../models/voivodeship';
import { Station } from '../models/air-quality';

export const Voivodeships: Voivodeship[] = [
  { id: 1, name: 'Zachodniopomorskie' },
  { id: 2, name: 'Pomorskie' },
  { id: 3, name: 'Warmińsko-mazurskie' },
  { id: 4, name: 'Podlaskie' },
  { id: 5, name: 'Mazowieckie' },
  { id: 6, name: 'Kujawsko-pomorskie' },
  { id: 7, name: 'Wielkopolskie' },
  { id: 8, name: 'Lubuskie' },
  { id: 9, name: 'Łódzkie' },
  { id: 10, name: 'Dolnośląskie' },
  { id: 11, name: 'Opolskie' },
  { id: 12, name: 'Śląskie' },
  { id: 13, name: 'Małopolskie' },
  { id: 14, name: 'Podkarpackie' },
  { id: 15, name: 'Świętokrzyskie' },
  { id: 16, name: 'Lubelskie' },
];
/** Województwo po identyfikatorze z adresu (`/wojewodztwo/:id`). */
export function findVoivodeship(id: number | string): Voivodeship | undefined {
  return Voivodeships.find((v) => v.id === Number(id));
}

/** Województwo stacji: GIOŚ zapisuje je WIELKIMI LITERAMI, np. "MAŁOPOLSKIE". */
export function voivodeshipOfProvince(province: string): Voivodeship | undefined {
  const upper = province.toLocaleUpperCase('pl');
  return Voivodeships.find((v) => v.name.toLocaleUpperCase('pl') === upper);
}

/** Stacje województwa posortowane po mieście i nazwie stacji. */
export function stationsIn(voivodeship: Voivodeship, stations: readonly Station[]): Station[] {
  const province = voivodeship.name.toLocaleUpperCase('pl');
  return stations
    .filter((station) => station.province === province)
    .sort((a, b) => a.city.localeCompare(b.city, 'pl') || a.name.localeCompare(b.name, 'pl'));
}

/** Nazwa województwa w miejscowniku do zdań „w województwie …”: "małopolskim". */
export function voivodeshipLocative(voivodeship: Voivodeship): string {
  return voivodeship.name.toLocaleLowerCase('pl').replace(/ie$/, 'im');
}
