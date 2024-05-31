import {Injectable, Signal, signal} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {CurrentConditions} from './current-conditions/current-conditions.type';
import {ConditionsAndZip} from './conditions-and-zip.type';
import {Forecast} from './forecasts-list/forecast.type';
import {CacheStore} from './cache-store';
import {CacheStoreName} from './cache-store.enum';

@Injectable()
export class WeatherService {
  static URL = 'https://api.openweathermap.org/data/2.5';
  static APPID = '5a4b2d457ecbef9eb2a71e480b947604';
  static ICON_URL = 'https://raw.githubusercontent.com/udacity/Sunshine-Version-2/sunshine_master/app/src/main/res/drawable-hdpi/';

  private currentConditions = signal<ConditionsAndZip[]>([]);

  private readonly currentConditionsCache: CacheStore<CurrentConditions>;
  private readonly forecastCache: CacheStore<Forecast>;

  constructor(
      private http: HttpClient,
      globalCacheStore: CacheStore
  ) {
    this.currentConditionsCache = globalCacheStore.partitionStore<CurrentConditions>({ cacheKeyPrefix: CacheStoreName.CONDITIONS });
    this.forecastCache = globalCacheStore.partitionStore<Forecast>({ cacheKeyPrefix: CacheStoreName.FORECAST });
  }

  public addCurrentConditions(zipcode: string): void {
    this.currentConditionsCache.getOrProvide(
        zipcode,
        this.http.get<CurrentConditions>(`${WeatherService.URL}/weather?zip=${zipcode},us&units=imperial&APPID=${WeatherService.APPID}`)
    ).subscribe(currentConditions => {
      this.currentConditions.update(conditions => [...conditions, { zip: zipcode, data: currentConditions }]);
    });
  }

  public removeCurrentConditions(zipcode: string) {
    this.currentConditions.update(conditions => {
      return [...conditions].filter(x => x.zip !== zipcode);
    });
  }

  public getCurrentConditions(): Signal<ConditionsAndZip[]> {
    return this.currentConditions.asReadonly();
  }

  public getForecast(zipcode: string): Observable<Forecast> {
    return this.forecastCache.getOrProvide(
        zipcode,
        this.http.get<Forecast>(`${WeatherService.URL}/forecast/daily?zip=${zipcode},us&units=imperial&cnt=5&APPID=${WeatherService.APPID}`)
    );
  }

  public getWeatherIcon(id: number): string {
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
}
