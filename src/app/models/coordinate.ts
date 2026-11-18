export interface Coordinate {
  /** Ścieżka do obrazka mapy w `public/`. */
  image: string;
  /** Współrzędne obszarów `<area shape="poly">` w kolejności `Voivodeship.id` (1..16). */
  cords: string[];
}
