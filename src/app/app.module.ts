import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import {LocationService} from "./services/location.service";
import {WeatherService} from "./services/weather.service";
import {RouterModule} from "@angular/router";
import {routing} from "./app.routing";
import {HttpClientModule} from "@angular/common/http";
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import {AppTabDirective} from './directives/app-tab.directive';
import {CACHE_STORE_CONFIG, CacheStore, CacheStoreConfig} from './services/cache-store';
import {CacheStoreName} from './enums/cache-store.enum';
import {ForecastsListComponent} from './components/forecasts-list/forecasts-list.component';
import {ZipcodeEntryComponent} from './components/zipcode-entry/zipcode-entry.component';
import {CurrentConditionsComponent} from './components/current-conditions/current-conditions.component';
import {MainPageComponent} from './components/main-page/main-page.component';
import {TabsComponent} from './components/tabs/tabs.component';

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
