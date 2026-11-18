import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

import { INDEX_LEVELS, NO_INDEX_NAME, indexLevelName } from '../data/air-index';
import { findVoivodeship, stationsIn, voivodeshipLocative } from '../data/voivodeships';
import { formatWhen } from '../lib/format';
import { plural } from '../lib/plural';
import { AirIndex, IndexLevel, Station } from '../models/air-quality';
import { IconComponent } from '../ui/icon.component';
import { IndexBadgeComponent } from '../ui/index-badge.component';
import { VoivodeshipService } from '../voivodeship.service';

interface LevelCount {
  key: string;
  level: IndexLevel | null;
  name: string;
  count: number;
}

/** Stan województwa: najgorszy indeks GIOŚ i rozkład poziomów na stacjach. */
@Component({
  selector: 'app-voivodeship-summary',
  imports: [RouterLink, IconComponent, IndexBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './voivodeship-summary.component.html',
  styleUrl: './voivodeship-summary.component.scss',
})
export class VoivodeshipSummaryComponent {
  private readonly service = inject(VoivodeshipService);

  /** `:id` województwa, dziedziczony z trasy nadrzędnej. */
  readonly id = input.required<string>();

  protected readonly voivodeship = computed(() => findVoivodeship(this.id()));

  private readonly stations = rxResource({ stream: () => this.service.getStations() });

  protected readonly voivodeshipStations = computed<Station[]>(() => {
    const voivodeship = this.voivodeship();
    return voivodeship && this.stations.hasValue()
      ? stationsIn(voivodeship, this.stations.value())
      : [];
  });

  protected readonly indexes = rxResource({
    params: () => {
      const ids = this.voivodeshipStations().map((s) => s.id);
      return ids.length > 0 ? ids : undefined;
    },
    stream: ({ params: ids }) => this.service.getIndexes(ids),
  });

  private readonly loaded = computed<{ station: Station; index: AirIndex }[]>(() => {
    if (!this.indexes.hasValue()) {
      return [];
    }
    const indexes = this.indexes.value();
    return this.voivodeshipStations().flatMap((station) => {
      const index = indexes.get(station.id);
      return index && index !== 'error' ? [{ station, index }] : [];
    });
  });

  protected readonly worstLevel = computed<IndexLevel | null>(() =>
    this.loaded().reduce<IndexLevel | null>(
      (worst, { index }) =>
        index.level !== null && (worst === null || index.level > worst) ? index.level : worst,
      null,
    ),
  );

  protected readonly worstStations = computed(() => {
    const worst = this.worstLevel();
    return worst === null
      ? []
      : this.loaded()
          .filter(({ index }) => index.level === worst)
          .map((e) => e.station);
  });

  protected readonly withIndex = computed(
    () => this.loaded().filter(({ index }) => index.level !== null).length,
  );

  protected readonly failed = computed(() =>
    this.indexes.hasValue()
      ? [...this.indexes.value().values()].filter((v) => v === 'error').length
      : 0,
  );

  protected readonly distribution = computed<LevelCount[]>(() => {
    const loaded = this.loaded();
    const rows: LevelCount[] = INDEX_LEVELS.map((level) => ({
      key: String(level),
      level,
      name: indexLevelName(level),
      count: loaded.filter(({ index }) => index.level === level).length,
    }));
    rows.push({
      key: 'none',
      level: null,
      name: NO_INDEX_NAME,
      count: loaded.filter(({ index }) => index.level === null).length,
    });
    return rows;
  });

  protected readonly distributionLabel = computed(
    () =>
      'Indeks GIOŚ na stacjach: ' +
      this.distribution()
        .filter((row) => row.count > 0)
        .map((row) => `${row.name.toLocaleLowerCase('pl')} ${row.count}`)
        .join(', '),
  );

  /** Najnowsza godzina danych, z których GIOŚ policzył indeksy. */
  protected readonly dataTime = computed(() => {
    const dates = this.loaded()
      .map(({ index }) => index.sourceDate)
      .filter((d): d is string => d !== null)
      .sort();
    return dates.length > 0 ? formatWhen(dates[dates.length - 1]) : null;
  });

  protected readonly locative = computed(() => {
    const voivodeship = this.voivodeship();
    return voivodeship ? voivodeshipLocative(voivodeship) : '';
  });

  protected stationsWord(count: number): string {
    return plural(count, 'stacja', 'stacje', 'stacji');
  }

  constructor() {
    const title = inject(Title);
    effect(() => {
      const voivodeship = this.voivodeship();
      if (voivodeship) {
        title.setTitle(`${voivodeship.name} – jakość powietrza · My Air`);
      }
    });
  }
}
