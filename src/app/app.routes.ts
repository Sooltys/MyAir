import { Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { StationComponent } from './station/station.component';
import { VoivodeshipSummaryComponent } from './voivodeship-summary/voivodeship-summary.component';
import { VoivodeshipComponent } from './voivodeship/voivodeship.component';

export const HOME_TITLE = 'My Air – bieżąca jakość powietrza w Polsce';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: HOME_TITLE },
  {
    // `:id` i `:stationId` trafiają do inputów komponentów dzięki `withComponentInputBinding()`;
    // `paramsInheritanceStrategy: 'always'` przekazuje `:id` także do tras potomnych.
    path: 'wojewodztwo/:id',
    component: VoivodeshipComponent,
    children: [
      { path: '', component: VoivodeshipSummaryComponent },
      { path: 'stacja/:stationId', component: StationComponent },
    ],
  },
  { path: '**', redirectTo: '' },
];
