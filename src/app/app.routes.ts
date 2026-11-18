import { Routes } from '@angular/router';

import { HomeComponent } from './home/home.component';
import { VoivodeshipComponent } from './voivodeship/voivodeship.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  // `:id` trafia do `VoivodeshipComponent.id` dzięki `withComponentInputBinding()`.
  { path: 'wojewodztwo/:id', component: VoivodeshipComponent },
  { path: '**', redirectTo: '' },
];
