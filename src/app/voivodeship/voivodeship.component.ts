import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { findVoivodeship, stationsIn } from '../data/voivodeships';
import { AirIndex, IndexLevel, Station } from '../models/air-quality';
import { IconComponent } from '../ui/icon.component';
import { IndexBadgeComponent } from '../ui/index-badge.component';
import { VoivodeshipService } from '../voivodeship.service';

type SortMode = 'az' | 'worst';

/** Układ widoku województwa: lista stacji z indeksem GIOŚ i miejsce na podsumowanie lub stację. */
@Component({
  selector: 'app-voivodeship',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, IconComponent, IndexBadgeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './voivodeship.component.html',
  styleUrl: './voivodeship.component.scss',
})
export class VoivodeshipComponent {
  private readonly service = inject(VoivodeshipService);

  /** Parametr `:id` z trasy `wojewodztwo/:id`. */
  readonly id = input.required<string>();

  protected readonly voivodeship = computed(() => findVoivodeship(this.id()));

  protected readonly stations = rxResource({
    stream: () => this.service.getStations(),
  });

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

  protected readonly sort = signal<SortMode>('az');

  protected readonly sortedStations = computed<Station[]>(() => {
    const stations = this.voivodeshipStations();
    if (this.sort() === 'az' || !this.indexes.hasValue()) {
      return stations;
    }
    const rank = (station: Station) => {
      const level = this.levelOf(station.id);
      return typeof level === 'number' ? level : -1;
    };
    // Stabilne sortowanie: przy tym samym poziomie zostaje kolejność alfabetyczna.
    return [...stations].sort((a, b) => rank(b) - rank(a));
  });

  /** `undefined` = wczytywanie, `null` = brak indeksu, `'error'` = nie udało się pobrać. */
  protected levelOf(stationId: number): IndexLevel | null | 'error' | undefined {
    if (this.indexes.error()) {
      return 'error';
    }
    if (!this.indexes.hasValue()) {
      return undefined;
    }
    const index: AirIndex | 'error' | undefined = this.indexes.value().get(stationId);
    return index === undefined || index === 'error' ? 'error' : index.level;
  }
}
