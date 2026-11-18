import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { indexLevelName } from '../data/air-index';
import { IndexLevel } from '../models/air-quality';

/**
 * Plakietka poziomu indeksu GIOŚ. `level`: `null` = „Brak indeksu”, `undefined` = jeszcze się
 * wczytuje, `'error'` = nie udało się pobrać.
 */
@Component({
  selector: 'app-index-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @switch (state()) {
      @case ('loading') {
        <span
          class="skeleton"
          [style.width.px]="small() ? 64 : 88"
          [style.height.px]="small() ? 22 : 26"
        >
          <span class="visually-hidden">Wczytywanie indeksu</span>
        </span>
      }
      @case ('error') {
        <span
          class="badge"
          data-level="none"
          [class.is-sm]="small()"
          title="Nie udało się pobrać indeksu"
        >
          Brak danych
        </span>
      }
      @default {
        <span class="badge" [attr.data-level]="levelAttr()" [class.is-sm]="small()">{{
          name()
        }}</span>
      }
    }
  `,
  styles: `
    :host {
      display: inline-flex;
      flex: none;
    }
  `,
})
export class IndexBadgeComponent {
  readonly level = input<IndexLevel | null | 'error' | undefined>(undefined);
  readonly small = input(false);

  protected readonly state = computed(() => {
    const level = this.level();
    return level === undefined ? 'loading' : level === 'error' ? 'error' : 'ready';
  });

  protected readonly levelAttr = computed(() => {
    const level = this.level();
    return typeof level === 'number' ? String(level) : 'none';
  });

  protected readonly name = computed(() => {
    const level = this.level();
    return indexLevelName(typeof level === 'number' ? level : null);
  });
}
