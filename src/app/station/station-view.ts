import { POLLUTANTS, POLLUTANT_ORDER, pollutantLabel } from '../data/air-index';
import { formatDerived, formatRatio } from '../lib/format';
import { NORMS, NormCheck, basisLabel, checkNorms, worstExceedance } from '../lib/norms';
import {
  AirIndex,
  INDEX_POLLUTANTS,
  IndexEntry,
  IndexPollutant,
  Reading,
  SensorSeries,
} from '../models/air-quality';
import { latestReading } from '../voivodeship.service';

/** Karta wskaźnika z bieżącymi pomiarami (PM2.5, PM10, NO₂…). */
export interface PollutantCard {
  series: SensorSeries;
  code: string;
  label: string;
  name: string;
  latest: Reading | null;
  /** Indeks cząstkowy GIOŚ, jeśli GIOŚ go liczy dla tego wskaźnika. */
  index: IndexEntry | null;
  checks: NormCheck[];
}

/** Stanowisko bez karty: inne wskaźniki, pomiary manualne, brak danych. */
export interface OtherSensor {
  series: SensorSeries;
  label: string;
  latest: Reading | null;
}

export interface StationReadings {
  cards: PollutantCard[];
  others: OtherSensor[];
}

function isIndexPollutant(code: string): code is IndexPollutant {
  return (INDEX_POLLUTANTS as readonly string[]).includes(code);
}

/** Dzieli stanowiska stacji na karty głównych wskaźników i resztę. */
export function buildReadings(
  series: readonly SensorSeries[],
  index: AirIndex | null,
): StationReadings {
  const cards: PollutantCard[] = [];
  const others: OtherSensor[] = [];

  for (const item of series) {
    const code = item.sensor.paramCode;
    const measurements = item.measurements ?? [];
    const latest = latestReading(measurements);
    const hasNorms = code in NORMS;

    if (hasNorms && (latest || item.failed)) {
      cards.push({
        series: item,
        code,
        label: pollutantLabel(code),
        name: POLLUTANTS[code]?.name ?? item.sensor.paramName,
        latest,
        index: isIndexPollutant(code) ? (index?.pollutants[code] ?? null) : null,
        checks: latest ? checkNorms(code, measurements) : [],
      });
    } else {
      others.push({ series: item, label: pollutantLabel(code), latest });
    }
  }

  const order = (code: string) => {
    const position = POLLUTANT_ORDER.indexOf(code);
    return position === -1 ? POLLUTANT_ORDER.length : position;
  };
  cards.sort((a, b) => order(a.code) - order(b.code) || a.series.sensor.id - b.series.sensor.id);
  others.sort(
    (a, b) =>
      Number(b.latest !== null) - Number(a.latest !== null) ||
      order(a.series.sensor.paramCode) - order(b.series.sensor.paramCode) ||
      a.series.sensor.paramName.localeCompare(b.series.sensor.paramName, 'pl'),
  );
  return { cards, others };
}

const NORM_NAME_INSTRUMENTAL = {
  WHO: 'wytyczną WHO',
  UE: 'normą UE',
  UE_TARGET: 'poziomem docelowym UE',
} as const;

/** Jedno zdanie odpowiedzi „jak jest?” na podstawie porównań z normami. */
export function normHeadline(cards: readonly PollutantCard[]): string {
  const checks = cards.flatMap((card) => card.checks.map((check) => ({ card, check })));
  const worst = worstExceedance(checks.map((c) => c.check));
  if (worst) {
    const card = checks.find((c) => c.check === worst)?.card;
    const norm = worst.norm;
    const name =
      norm.body === 'WHO'
        ? NORM_NAME_INSTRUMENTAL.WHO
        : norm.target
          ? NORM_NAME_INSTRUMENTAL.UE_TARGET
          : NORM_NAME_INSTRUMENTAL.UE;
    const others = [
      ...new Set(
        checks
          .filter((c) => c.check.status === 'above' && c.card !== card)
          .map((c) => c.card.label),
      ),
    ];
    const sentence =
      `${card?.label ?? ''} ponad ${name}: ${basisLabel(norm.averaging)} ` +
      `${formatDerived(worst.measured ?? 0)} µg/m³ przy ${formatDerived(norm.limit)} µg/m³ ` +
      `(${formatRatio(worst.ratio ?? 0)}×).`;
    return others.length > 0 ? `${sentence} Normy przekracza też: ${others.join(', ')}.` : sentence;
  }
  if (checks.some((c) => c.check.status === 'within')) {
    return 'Wszystkie porównywalne pomiary mieszczą się w wytycznych WHO i normach UE.';
  }
  if (cards.length === 0) {
    return 'Ta stacja nie ma teraz bieżących pomiarów wskaźników objętych normami.';
  }
  return 'Za mało pomiarów z ostatniej doby, żeby porównać je z normami.';
}
