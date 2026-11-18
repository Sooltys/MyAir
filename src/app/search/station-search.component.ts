import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

import { voivodeshipOfProvince } from '../data/voivodeships';
import { normalizeText } from '../lib/format';
import { Station } from '../models/air-quality';
import { IconComponent } from '../ui/icon.component';
import { VoivodeshipService } from '../voivodeship.service';

const MAX_RESULTS = 8;

interface SearchResult {
  station: Station;
  voivodeshipId: number;
  voivodeshipName: string;
}

interface IndexedStation {
  station: Station;
  haystack: string;
  city: string;
  voivodeshipId: number;
  voivodeshipName: string;
}

@Component({
  selector: 'app-station-search',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './station-search.component.html',
  styleUrl: './station-search.component.scss',
  host: { '(focusout)': 'onFocusOut($event)' },
})
export class StationSearchComponent {
  private readonly service = inject(VoivodeshipService);
  private readonly router = inject(Router);

  protected readonly query = signal('');
  protected readonly open = signal(false);
  protected readonly active = signal(-1);

  /** Lista stacji jest w cache serwisu; pobieramy ją dopiero, gdy ktoś zacznie szukać. */
  private readonly wanted = signal(false);
  private readonly stations = rxResource({
    params: () => (this.wanted() ? true : undefined),
    stream: () => this.service.getStations(),
  });

  private readonly indexed = computed<IndexedStation[]>(() =>
    (this.stations.hasValue() ? this.stations.value() : []).flatMap((station) => {
      const voivodeship = voivodeshipOfProvince(station.province);
      if (!voivodeship) {
        return [];
      }
      return [
        {
          station,
          haystack: normalizeText(`${station.city} ${station.street ?? ''} ${station.name}`),
          city: normalizeText(station.city),
          voivodeshipId: voivodeship.id,
          voivodeshipName: voivodeship.name.toLocaleLowerCase('pl'),
        },
      ];
    }),
  );

  protected readonly results = computed<SearchResult[]>(() => {
    const terms = normalizeText(this.query())
      .split(/[\s,]+/)
      .filter(Boolean);
    if (terms.length === 0) {
      return [];
    }
    return this.indexed()
      .filter((entry) => terms.every((term) => entry.haystack.includes(term)))
      .sort(
        (a, b) =>
          Number(!a.city.startsWith(terms[0])) - Number(!b.city.startsWith(terms[0])) ||
          a.station.city.localeCompare(b.station.city, 'pl') ||
          a.station.name.localeCompare(b.station.name, 'pl'),
      )
      .slice(0, MAX_RESULTS)
      .map(({ station, voivodeshipId, voivodeshipName }) => ({
        station,
        voivodeshipId,
        voivodeshipName,
      }));
  });

  protected readonly status = computed(() => {
    if (!this.query().trim()) {
      return null;
    }
    if (this.stations.isLoading()) {
      return 'Wczytywanie listy stacji…';
    }
    if (this.stations.error()) {
      return 'Nie udało się pobrać listy stacji.';
    }
    return this.results().length === 0 ? `Brak stacji dla „${this.query().trim()}”.` : null;
  });

  protected readonly expanded = computed(
    () => this.open() && (this.results().length > 0 || this.status() !== null),
  );

  protected optionId(index: number): string {
    return `station-search-option-${index}`;
  }

  protected onFocus(): void {
    this.wanted.set(true);
    this.open.set(true);
  }

  protected onInput(value: string): void {
    this.query.set(value);
    this.open.set(true);
    this.active.set(-1);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const count = this.results().length;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.open.set(true);
        this.active.set(count === 0 ? -1 : (this.active() + 1) % count);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.active.set(count === 0 ? -1 : (this.active() - 1 + count) % count);
        break;
      case 'Enter': {
        const pick = this.results()[this.active() >= 0 ? this.active() : 0];
        if (pick) {
          event.preventDefault();
          this.go(pick);
        }
        break;
      }
      case 'Escape':
        if (this.open() && this.query()) {
          event.preventDefault();
          this.open.set(false);
        } else {
          this.clear();
        }
        break;
    }
  }

  protected go(result: SearchResult): void {
    this.clear();
    (document.activeElement as HTMLElement | null)?.blur();
    void this.router.navigate(['/wojewodztwo', result.voivodeshipId, 'stacja', result.station.id]);
  }

  protected clear(): void {
    this.query.set('');
    this.active.set(-1);
    this.open.set(false);
  }

  protected onFocusOut(event: FocusEvent): void {
    const next = event.relatedTarget as Node | null;
    const host = event.currentTarget as HTMLElement;
    if (!next || !host.contains(next)) {
      this.open.set(false);
    }
  }
}
