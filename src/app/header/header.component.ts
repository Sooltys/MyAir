import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { StationSearchComponent } from '../search/station-search.component';
import { IconComponent } from '../ui/icon.component';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive, StationSearchComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {}
