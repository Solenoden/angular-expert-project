import {effect, Injectable, Signal, signal} from '@angular/core';
import {from, Observable} from 'rxjs';

import {HttpClient} from '@angular/common/http';
import {CurrentConditions} from './current-conditions/current-conditions.type';
import {ConditionsAndZip} from './conditions-and-zip.type';
import {Forecast} from './forecasts-list/forecast.type';
import {LocationService} from './location.service';
import {CacheStore} from './cache-store';
import {tap} from 'rxjs/operators';

const CACHE_PREFIX = 'WEATHER_SERVICE';

@Injectable()
export class WeatherService {
  static URL = 'http://api.openweathermap.org/data/2.5';
  static APPID = '5a4b2d457ecbef9eb2a71e480b947604';
  static ICON_URL = 'https://raw.githubusercontent.com/udacity/Sunshine-Version-2/sunshine_master/app/src/main/res/drawable-hdpi/';

  private currentConditions = signal<ConditionsAndZip[]>([]);

  private currentConditionsCacheStore = new CacheStore<CurrentConditions>(CACHE_PREFIX + '_CONDITIONS');
  private forecastCacheStore = new CacheStore<Forecast>(CACHE_PREFIX + '_FORECASTS');

  constructor(
      private http: HttpClient,
      private locationService: LocationService
  ) {
    this.autoRetrieveLocationConditions();
  }

  private addCurrentConditions(zipcode: string): void {
    const cachedConditions = this.currentConditionsCacheStore.get(zipcode);

    const conditionsUrl = `${WeatherService.URL}/weather?zip=${zipcode},us&units=imperial&APPID=${WeatherService.APPID}`;
    const conditions$ = cachedConditions ? from([cachedConditions]) : this.http.get<CurrentConditions>(conditionsUrl);

    conditions$.subscribe(data => {
      if (!cachedConditions) this.currentConditionsCacheStore.set(zipcode, data);
      this.currentConditions.update(conditions => [...conditions, { zip: zipcode, data }]);
    });
  }

  private removeCurrentConditions(zipcode: string) {
    this.currentConditions.update(conditions => {
      return [...conditions].filter(x => x.zip !== zipcode);
    })
  }

  public getCurrentConditions(): Signal<ConditionsAndZip[]> {
    return this.currentConditions.asReadonly();
  }

  public getForecast(zipcode: string): Observable<Forecast> {
    const cachedForecast = this.forecastCacheStore.get(zipcode);

    const forecastUrl = `${WeatherService.URL}/forecast/daily?zip=${zipcode},us&units=imperial&cnt=5&APPID=${WeatherService.APPID}`;
    const forecast$ = cachedForecast ? from([cachedForecast]) : this.http.get<Forecast>(forecastUrl);

    return forecast$.pipe(tap(forecast => {
      if (!cachedForecast) this.forecastCacheStore.set(zipcode, forecast);
    }));
  }

  public getWeatherIcon(id): string {
    if (id >= 200 && id <= 232)
      return WeatherService.ICON_URL + "art_storm.png";
    else if (id >= 501 && id <= 511)
      return WeatherService.ICON_URL + "art_rain.png";
    else if (id === 500 || (id >= 520 && id <= 531))
      return WeatherService.ICON_URL + "art_light_rain.png";
    else if (id >= 600 && id <= 622)
      return WeatherService.ICON_URL + "art_snow.png";
    else if (id >= 801 && id <= 804)
      return WeatherService.ICON_URL + "art_clouds.png";
    else if (id === 741 || id === 761)
      return WeatherService.ICON_URL + "art_fog.png";
    else
      return WeatherService.ICON_URL + "art_clear.png";
  }

  // TODO: Possibly move to appropriate high up component to decouple LocationService from WeatherService
  private autoRetrieveLocationConditions(): void {
    effect(() => {
      const locationsAdded = this.locationService.locationsAdded();
      locationsAdded?.forEach(zipcode => this.addCurrentConditions(zipcode));
    }, { allowSignalWrites: true });

    effect(() => {
      const locationsRemoved = this.locationService.locationsRemoved();
      locationsRemoved?.forEach(zipcode => this.removeCurrentConditions(zipcode));
    }, { allowSignalWrites: true });
  }
}
