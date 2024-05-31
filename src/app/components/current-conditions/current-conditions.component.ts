import {Component, inject, Signal} from '@angular/core';
import {WeatherService} from "../../services/weather.service";
import {LocationService} from "../../services/location.service";
import {Router} from "@angular/router";
import {ConditionsAndZip} from '../../conditions-and-zip.type';
import {TabId} from '../../directives/app-tab.directive';

@Component({
  selector: 'app-current-conditions',
  templateUrl: './current-conditions.component.html',
  styleUrls: ['./current-conditions.component.css']
})
export class CurrentConditionsComponent {
  private router = inject(Router);
  protected weatherService = inject(WeatherService);
  protected locationService = inject(LocationService);
  protected currentConditionsByZip: Signal<ConditionsAndZip[]> = this.weatherService.getCurrentConditions();

  showForecast(zipcode : string){
    this.router.navigate(['/forecast', zipcode])
  }

  protected removeLocation(zipcode: TabId) {
    this.locationService.removeLocation(zipcode as string);
  }
}
