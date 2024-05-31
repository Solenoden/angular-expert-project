import { ModuleWithProviders }  from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {MainPageComponent} from './components/main-page/main-page.component';
import {ForecastsListComponent} from './components/forecasts-list/forecasts-list.component';

const appRoutes: Routes = [
  {
    path: '', component: MainPageComponent
  },
  {
    path: 'forecast/:zipcode', component: ForecastsListComponent
  }
];
export const routing: ModuleWithProviders<unknown> = RouterModule.forRoot(appRoutes, {});
