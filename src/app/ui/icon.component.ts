import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type IconName =
  | 'search'
  | 'chevron-left'
  | 'chevron-right'
  | 'close'
  | 'refresh'
  | 'external'
  | 'check'
  | 'alert'
  | 'info'
  | 'minus'
  | 'heart';

/** Ikony liniowe 24×24, obrys 1.75, w kolorze tekstu. Zawsze dekoracyjne (aria-hidden). */
@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true', class: 'icon' },
  template: `
    <svg
      viewBox="0 0 24 24"
      [attr.width]="size()"
      [attr.height]="size()"
      fill="none"
      stroke="currentColor"
      stroke-width="1.75"
      stroke-linecap="round"
      stroke-linejoin="round"
      focusable="false"
    >
      @switch (name()) {
        @case ('search') {
          <circle cx="11" cy="11" r="6.5" />
          <path d="m20 20-4.4-4.4" />
        }
        @case ('chevron-left') {
          <path d="m14.5 18-6-6 6-6" />
        }
        @case ('chevron-right') {
          <path d="m9.5 18 6-6-6-6" />
        }
        @case ('close') {
          <path d="M17.5 6.5l-11 11M6.5 6.5l11 11" />
        }
        @case ('refresh') {
          <path d="M19.5 12a7.5 7.5 0 1 1-2.2-5.3" />
          <path d="M19.5 4.5v5h-5" />
        }
        @case ('external') {
          <path d="M8 16 16 8" />
          <path d="M9.5 8H16v6.5" />
        }
        @case ('check') {
          <path d="m5.5 12.5 4 4 9-9.5" />
        }
        @case ('alert') {
          <path
            d="M10.3 4.6 3.2 17a2 2 0 0 0 1.7 3h14.2a2 2 0 0 0 1.7-3L13.7 4.6a2 2 0 0 0-3.4 0Z"
          />
          <path d="M12 9.5v4" />
          <path d="M12 16.8h.01" />
        }
        @case ('info') {
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 11v5" />
          <path d="M12 7.8h.01" />
        }
        @case ('minus') {
          <path d="M6.5 12h11" />
        }
        @case ('heart') {
          <path
            fill="currentColor"
            d="M12 20s-7.5-4.4-7.5-10a4.2 4.2 0 0 1 7.5-2.6A4.2 4.2 0 0 1 19.5 10c0 5.6-7.5 10-7.5 10Z"
          />
        }
      }
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      flex: none;
      line-height: 0;
    }
  `,
})
export class IconComponent {
  readonly name = input.required<IconName>();
  readonly size = input(20);
}
