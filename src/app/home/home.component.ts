import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { map } from 'rxjs';

import { Coordinates } from '../data/coordinates';
import { Voivodeships } from '../data/voivodeships';

/** Mapa na desktop ma 709 px szerokości – poniżej tej szerokości pokazujemy mniejszą wersję. */
const SMALL_SCREEN = '(max-width: 719.98px)';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  private readonly breakpoints = inject(BreakpointObserver);

  private readonly isSmallScreen = toSignal(
    this.breakpoints.observe(SMALL_SCREEN).pipe(map((state) => state.matches)),
    { initialValue: this.breakpoints.isMatched(SMALL_SCREEN) },
  );

  protected readonly voivodeships = Voivodeships;
  protected readonly map = computed(() => Coordinates[this.isSmallScreen() ? 1 : 0]);
}
