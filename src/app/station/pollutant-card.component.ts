import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';

import { formatDerived, formatHour, formatRatio, formatValue, formatWhen } from '../lib/format';
import { MIN_HOURS_24H, NormCheck, basisLabel, normName, periodLabel } from '../lib/norms';
import { Measurement } from '../models/air-quality';
import { IconComponent } from '../ui/icon.component';
import { IndexBadgeComponent } from '../ui/index-badge.component';
import { PollutantCard } from './station-view';

const CHART_W = 240;
const CHART_H = 64;
const SLOT = CHART_W / 24;
const BAR = SLOT - 3;

interface ChartBar {
  x: number;
  y: number;
  height: number;
  /** `null` = brak pomiaru w tej godzinie. */
  measurement: Measurement;
  index: number;
}

/** Karta wskaźnika: ostatni pomiar, doba na wykresie i porównanie z normami WHO i UE. */
@Component({
  selector: 'app-pollutant-card',
  imports: [IconComponent, IndexBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './pollutant-card.component.html',
  styleUrl: './pollutant-card.component.scss',
})
export class PollutantCardComponent {
  readonly card = input.required<PollutantCard>();

  protected readonly chartWidth = CHART_W;
  protected readonly chartHeight = CHART_H;
  protected readonly barWidth = BAR;
  protected readonly value = formatValue;

  protected readonly headingId = computed(() => `pollutant-${this.card().series.sensor.id}`);

  /** Od najstarszej do najnowszej godziny. */
  private readonly chronological = computed(() =>
    [...(this.card().series.measurements ?? [])].reverse(),
  );

  private readonly values = computed(() =>
    this.chronological()
      .map((m) => m.value)
      .filter((v): v is number => v !== null),
  );

  protected readonly mean = computed(() => {
    const values = this.values();
    return values.length > 0 ? values.reduce((sum, v) => sum + v, 0) / values.length : null;
  });

  private readonly scaleMax = computed(() => Math.max(...this.values(), 0) * 1.08 || 1);

  protected readonly bars = computed<ChartBar[]>(() => {
    const series = this.chronological();
    const offset = 24 - series.length;
    return series.map((measurement, i) => {
      const x = (offset + i) * SLOT + 1.5;
      const height =
        measurement.value === null
          ? 2
          : Math.max((measurement.value / this.scaleMax()) * (CHART_H - 2), 1.5);
      return { x, y: CHART_H - height, height, measurement, index: i };
    });
  });

  /** Indeks ostatniego słupka z pomiarem. */
  protected readonly latestIndex = computed(() => {
    let last = -1;
    this.chronological().forEach((m, i) => {
      if (m.value !== null) {
        last = i;
      }
    });
    return last;
  });

  /**
   * Kolor ostatniego słupka: poziom indeksu cząstkowego GIOŚ, ale tylko gdy GIOŚ policzył go z tej
   * samej godziny co ostatni pomiar.
   */
  protected readonly latestLevel = computed(() => {
    const { index, latest } = this.card();
    return index && index.level !== null && latest && index.sourceDate === latest.date
      ? String(index.level)
      : null;
  });

  protected readonly meanY = computed(() => {
    const mean = this.mean();
    return mean === null ? null : CHART_H - (mean / this.scaleMax()) * (CHART_H - 2);
  });

  protected readonly firstHour = computed(() => {
    const first = this.chronological()[0];
    return first ? formatHour(first.date) : '';
  });

  protected readonly lastHour = computed(() => {
    const series = this.chronological();
    return series.length > 0 ? formatHour(series[series.length - 1].date) : '';
  });

  protected readonly chartLabel = computed(() => {
    const values = this.values();
    if (values.length === 0) {
      return 'Brak odczytów z ostatniej doby';
    }
    return (
      `Odczyty godzinowe z ostatniej doby (${values.length} h): od ${formatValue(Math.min(...values))} ` +
      `do ${formatValue(Math.max(...values))} µg/m³, średnio ${formatDerived(this.mean() ?? 0)} µg/m³. ` +
      'Strzałki w lewo i w prawo pokazują kolejne godziny.'
    );
  });

  // --- Odczyt godziny pod kursorem / palcem / strzałkami --------------------

  protected readonly active = signal<number | null>(null);

  protected readonly activeReading = computed(() => {
    const i = this.active();
    const measurement = i === null ? undefined : this.chronological()[i];
    if (!measurement) {
      return null;
    }
    return {
      hour: formatWhen(measurement.date),
      value:
        measurement.value === null ? 'brak pomiaru' : `${formatValue(measurement.value)} µg/m³`,
    };
  });

  protected readonly sliderText = computed(() => {
    const i = this.active() ?? this.latestIndex();
    const measurement = this.chronological()[i];
    if (!measurement) {
      return 'brak odczytów';
    }
    return `${formatWhen(measurement.date)}: ${
      measurement.value === null ? 'brak pomiaru' : `${formatValue(measurement.value)} µg/m³`
    }`;
  });

  protected onPointer(event: PointerEvent): void {
    const target = event.currentTarget as SVGElement;
    const box = target.getBoundingClientRect();
    const offset = 24 - this.chronological().length;
    const slot = Math.floor(((event.clientX - box.left) / box.width) * 24) - offset;
    this.active.set(slot >= 0 && slot < this.chronological().length ? slot : null);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const count = this.chronological().length;
    if (count === 0) {
      return;
    }
    const current = this.active() ?? this.latestIndex();
    const next: Record<string, number> = {
      ArrowLeft: Math.max(current - 1, 0),
      ArrowRight: Math.min(current + 1, count - 1),
      Home: 0,
      End: count - 1,
    };
    if (event.key in next) {
      event.preventDefault();
      this.active.set(next[event.key]);
    } else if (event.key === 'Escape') {
      this.active.set(null);
    }
  }

  protected onFocus(): void {
    if (this.active() === null) {
      this.active.set(this.latestIndex());
    }
  }

  protected when(date: string): string {
    return formatWhen(date);
  }

  protected derived(value: number): string {
    return formatDerived(value);
  }

  // --- Normy ------------------------------------------------------------------

  protected normTitle(check: NormCheck): string {
    const { norm } = check;
    if (norm.body === 'WHO') {
      return `WHO · wytyczna ${periodLabel(norm.averaging)}`;
    }
    return norm.target ? 'UE · poziom docelowy (8 h)' : `UE · norma ${periodLabel(norm.averaging)}`;
  }

  /** Jedna liczba do odczytania na pierwszy rzut oka: „24% normy” albo „1,3× normy”. */
  protected figure(check: NormCheck): string | null {
    if (check.ratio === null) {
      return null;
    }
    return check.ratio > 1
      ? `${formatRatio(check.ratio)}× normy`
      : `${Math.max(Math.round(check.ratio * 100), check.ratio > 0 ? 1 : 0)}% normy`;
  }

  /** Miernik: norma stoi zawsze w połowie skali, pełna skala = dwukrotność normy. */
  protected withinWidth(check: NormCheck): number {
    return Math.min(check.ratio ?? 0, 1) * 50;
  }

  protected aboveWidth(check: NormCheck): number {
    return Math.max(Math.min(check.ratio ?? 0, 2) - 1, 0) * 50;
  }

  protected meterText(check: NormCheck): string {
    return (
      `${basisLabel(check.norm.averaging)} ${formatDerived(check.measured ?? 0)} µg/m³, ` +
      `${this.figure(check)} (${normName(check.norm)} ${formatValue(check.norm.limit)} µg/m³)`
    );
  }

  protected basisText(check: NormCheck): string {
    const { norm } = check;
    switch (check.status) {
      case 'above':
      case 'within':
        return `${basisLabel(norm.averaging)}: ${formatDerived(check.measured ?? 0)} z ${formatValue(norm.limit)} µg/m³`;
      case 'annual':
        return `limit ${formatValue(norm.limit)} µg/m³ dotyczy średniej z roku – nie porównujemy go z jedną dobą`;
      case 'insufficient':
        return norm.averaging === '24h'
          ? `za mało pomiarów: średnia dobowa wymaga ${MIN_HOURS_24H} godzin, jest ${check.hours}`
          : norm.averaging === '8h'
            ? 'za mało pomiarów: średnia 8 h wymaga 6 godzin w oknie'
            : 'brak pomiaru z ostatniej doby';
    }
  }
}
