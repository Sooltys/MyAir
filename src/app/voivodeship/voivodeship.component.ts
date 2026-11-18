import { UpperCasePipe } from '@angular/common';
import { Component, computed, inject, input, linkedSignal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';

import { Voivodeships } from '../data/voivodeships';
import { SensorReading, Station } from '../models/air-quality';
import { VoivodeshipService } from '../voivodeship.service';

/** Krótkie nazwy wskaźników pokazujemy w całości, dłuższe zastępujemy kodem (np. „PM2.5”). */
const MAX_PARAM_NAME_LENGTH = 10;

@Component({
  selector: 'app-voivodeship',
  imports: [RouterLink, UpperCasePipe, MatButtonModule, MatIconModule],
  templateUrl: './voivodeship.component.html',
  styleUrl: './voivodeship.component.scss',
})
export class VoivodeshipComponent {
  private readonly service = inject(VoivodeshipService);

  /** Parametr `:id` z trasy `wojewodztwo/:id`. */
  readonly id = input.required<string>();

  protected readonly voivodeship = computed(() =>
    Voivodeships.find((v) => v.id === Number(this.id())),
  );

  protected readonly stations = rxResource({
    stream: () => this.service.getStations(),
  });

  protected readonly voivodeshipStations = computed<Station[]>(() => {
    const voivodeship = this.voivodeship();
    if (!voivodeship || !this.stations.hasValue()) {
      return [];
    }
    const province = voivodeship.name.toUpperCase();
    return this.stations
      .value()
      .filter((station) => station.province === province)
      .sort((a, b) => a.city.localeCompare(b.city, 'pl') || a.name.localeCompare(b.name, 'pl'));
  });

  /** Wybrana stacja; zmiana województwa wraca do listy stacji. */
  protected readonly selectedStation = linkedSignal<string, Station | null>({
    source: this.id,
    computation: () => null,
  });

  protected readonly readings = rxResource({
    params: () => this.selectedStation()?.id,
    stream: ({ params: stationId }) =>
      this.service.getSensors(stationId).pipe(
        switchMap((sensors) =>
          sensors.length === 0
            ? of<SensorReading[]>([])
            : forkJoin(
                sensors.map((sensor) =>
                  this.service.getLatestReading(sensor.id).pipe(
                    map((reading): SensorReading => ({ sensor, reading, failed: false })),
                    catchError(() => of<SensorReading>({ sensor, reading: null, failed: true })),
                  ),
                ),
              ),
        ),
      ),
  });

  protected selectStation(station: Station): void {
    this.selectedStation.set(station);
  }

  protected backToStations(): void {
    this.selectedStation.set(null);
  }

  protected paramLabel(item: SensorReading): string {
    const { paramName, paramCode } = item.sensor;
    return paramName.length <= MAX_PARAM_NAME_LENGTH ? paramName : paramCode;
  }
}
