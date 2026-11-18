import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';

import { MAP_HEIGHT, MAP_WIDTH, mapRegion } from '../data/map';
import { Voivodeships, stationsIn } from '../data/voivodeships';
import { plural } from '../lib/plural';
import { Voivodeship } from '../models/voivodeship';
import { IconComponent } from '../ui/icon.component';
import { VoivodeshipService } from '../voivodeship.service';

@Component({
  selector: 'app-home',
  imports: [RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  private readonly service = inject(VoivodeshipService);

  protected readonly viewBox = `0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`;
  protected readonly regions = Voivodeships.map((v) => ({ ...v, ...mapRegion(v.id, v.name) }));
  protected readonly sorted = [...Voivodeships].sort((a, b) => a.name.localeCompare(b.name, 'pl'));

  private readonly stations = rxResource({ stream: () => this.service.getStations() });

  protected readonly total = computed(() =>
    this.stations.hasValue() ? this.stations.value().length : null,
  );

  protected countLabel(voivodeship: Voivodeship): string {
    if (!this.stations.hasValue()) {
      return '';
    }
    const count = stationsIn(voivodeship, this.stations.value()).length;
    return `${count} ${plural(count, 'stacja', 'stacje', 'stacji')}`;
  }
}
