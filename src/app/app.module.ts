import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { ZipcodeEntryComponent } from './zipcode-entry/zipcode-entry.component';
import {LocationService} from "./location.service";
import { ForecastsListComponent } from './forecasts-list/forecasts-list.component';
import {WeatherService} from "./weather.service";
import { CurrentConditionsComponent } from './current-conditions/current-conditions.component';
import { MainPageComponent } from './main-page/main-page.component';
import {RouterModule} from "@angular/router";
import {routing} from "./app.routing";
import {HttpClientModule} from "@angular/common/http";
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import {TabsComponent} from './tabs/tabs.component';
import {AppTabDirective} from './app-tab.directive';
import {CACHE_STORE_CONFIG, CacheStore, CacheStoreConfig} from './cache-store';
import {CacheStoreName} from './cache-store.enum';

@NgModule({
  declarations: [
    AppComponent,
    ZipcodeEntryComponent,
    ForecastsListComponent,
    CurrentConditionsComponent,
    MainPageComponent,
    TabsComponent,
    AppTabDirective
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    RouterModule,
    routing,
    ServiceWorkerModule.register('/ngsw-worker.js', { enabled: environment.production })
  ],
  providers: [
      LocationService,
      WeatherService,
      CacheStore,
    {
      provide: CACHE_STORE_CONFIG,
      useValue: {
        cacheKeyPrefix: CacheStoreName.GLOBAL,
        cacheDurationSeconds: environment.globalCacheDurationSeconds
      } as CacheStoreConfig
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
