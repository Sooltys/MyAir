import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';

import { INDEX_LEVELS, criticalPollutantName, indexLevelName } from '../data/air-index';
import { findVoivodeship } from '../data/voivodeships';
import { formatHour, formatValue, formatWhen } from '../lib/format';
import { SensorSeries } from '../models/air-quality';
import { IconComponent } from '../ui/icon.component';
import { VoivodeshipService } from '../voivodeship.service';
import { PollutantCardComponent } from './pollutant-card.component';
import { buildReadings, normHeadline } from './station-view';

/** Kolor paska przeglądarki na telefonie: przy złym powietrzu przejmuje kolor indeksu. */
const THEME_COLOR_DEFAULT = '#ffffff';
const THEME_COLOR_ALARM: Readonly<Record<number, string>> = { 4: '#e50000', 5: '#990000' };

@Component({
  selector: 'app-station',
  imports: [RouterLink, IconComponent, PollutantCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './station.component.html',
  styleUrl: './station.component.scss',
})
export class StationComponent {
  private readonly service = inject(VoivodeshipService);

  /** `:id` województwa (dziedziczony z trasy nadrzędnej) i `:stationId` stacji. */
  readonly id = input.required<string>();
  readonly stationId = input.required<string>();

  protected readonly levels = INDEX_LEVELS;
  protected readonly levelName = indexLevelName;
  protected readonly formatValue = formatValue;
  protected readonly formatHour = formatHour;

  protected readonly voivodeship = computed(() => findVoivodeship(this.id()));
  private readonly stationNumber = computed(() => Number(this.stationId()));

  private readonly stations = rxResource({ stream: () => this.service.getStations() });

  protected readonly station = computed(() => {
    const voivodeship = this.voivodeship();
    if (!voivodeship || !this.stations.hasValue()) {
      return undefined;
    }
    const station = this.stations.value().find((s) => s.id === this.stationNumber());
    return station && station.province === voivodeship.name.toLocaleUpperCase('pl')
      ? station
      : null;
  });

  protected readonly stationsLoading = computed(() => this.stations.isLoading());
  protected readonly stationsError = computed(() => this.stations.error());

  protected readonly index = rxResource({
    params: () => (this.station() ? this.stationNumber() : undefined),
    stream: ({ params: stationId }) => this.service.getIndex(stationId),
  });

  protected readonly series = rxResource({
    params: () => (this.station() ? this.stationNumber() : undefined),
    stream: ({ params: stationId }) =>
      this.service.getSensors(stationId).pipe(
        switchMap((sensors) =>
          sensors.length === 0
            ? of<SensorSeries[]>([])
            : forkJoin(
                sensors.map((sensor) =>
                  this.service.getMeasurements(sensor.id).pipe(
                    map((measurements): SensorSeries => ({ sensor, measurements, failed: false })),
                    catchError(() => of<SensorSeries>({ sensor, measurements: [], failed: true })),
                  ),
                ),
              ),
        ),
      ),
  });

  protected readonly readings = computed(() =>
    this.series.hasValue()
      ? buildReadings(this.series.value(), this.index.hasValue() ? this.index.value() : null)
      : null,
  );

  protected readonly headline = computed(() => {
    const readings = this.readings();
    return readings ? normHeadline(readings.cards) : null;
  });

  /** Poziom indeksu stacji: liczba, `null` = brak indeksu, `undefined` = jeszcze nie wiadomo. */
  protected readonly level = computed(() =>
    this.index.hasValue() ? this.index.value().level : undefined,
  );

  protected readonly levelAttr = computed(() => {
    const level = this.level();
    return typeof level === 'number' ? String(level) : 'none';
  });

  protected readonly critical = computed(() =>
    this.index.hasValue() && this.index.value().level !== null
      ? criticalPollutantName(this.index.value().critical)
      : null,
  );

  protected readonly indexTime = computed(() => {
    const date = this.index.hasValue() ? this.index.value().sourceDate : null;
    return date ? formatWhen(date) : null;
  });

  protected readonly title = computed(() => {
    const station = this.station();
    if (!station) {
      return null;
    }
    return station.street ? `${station.city}, ${station.street}` : station.name;
  });

  protected readonly otherCount = computed(() => this.readings()?.others.length ?? 0);

  protected when(date: string): string {
    return formatWhen(date);
  }

  protected refresh(): void {
    this.service.forgetIndex(this.stationNumber());
    this.index.reload();
    this.series.reload();
  }

  constructor() {
    const title = inject(Title);
    const document = inject(DOCUMENT);

    effect(() => {
      const name = this.title();
      if (name) {
        title.setTitle(`${name} – jakość powietrza · My Air`);
      }
    });

    const themeColor = () => document.querySelector('meta[name="theme-color"]');
    effect(() => {
      const level = this.level();
      themeColor()?.setAttribute(
        'content',
        typeof level === 'number'
          ? (THEME_COLOR_ALARM[level] ?? THEME_COLOR_DEFAULT)
          : THEME_COLOR_DEFAULT,
      );
    });
    inject(DestroyRef).onDestroy(() => themeColor()?.setAttribute('content', THEME_COLOR_DEFAULT));
  }
}
