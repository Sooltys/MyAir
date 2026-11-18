import { VOIVODESHIP_SHAPES } from './voivodeship-shapes';

export { MAP_HEIGHT, MAP_WIDTH } from './voivodeship-shapes';

/** Podział długich nazw na dwie linie. */
const LINES: Readonly<Record<number, readonly string[]>> = {
  1: ['zachodnio-', 'pomorskie'],
  3: ['warmińsko-', 'mazurskie'],
  6: ['kujawsko-', 'pomorskie'],
  15: ['święto-', 'krzyskie'],
};

/** Ręczne przesunięcia podpisów tam, gdzie punkt najdalszy od granic wypada niezgrabnie. */
const NUDGE: Readonly<Record<number, readonly [number, number]>> = {};

export interface MapRegion {
  d: string;
  x: number;
  y: number;
  lines: readonly string[];
}

/** Kształt i podpis województwa dla mapy SVG. */
export function mapRegion(id: number, name: string): MapRegion {
  const shape = VOIVODESHIP_SHAPES[id - 1];
  const [dx, dy] = NUDGE[id] ?? [0, 0];
  return {
    d: shape.d,
    x: shape.label[0] + dx,
    y: shape.label[1] + dy,
    lines: LINES[id] ?? [name.toLocaleLowerCase('pl')],
  };
}
