import {Component, effect, Injector, OnInit} from '@angular/core';
import {LocationService} from './location.service';
import {WeatherService} from './weather.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    constructor(
        private locationService: LocationService,
        private weatherService: WeatherService,
        private injector: Injector
    ) {}

    ngOnInit(): void {
        this.locationService.syncLocationsWithCache(this.injector);
        this.autoRetrieveConditionsForLocations();
    }

    private autoRetrieveConditionsForLocations(): void {
        effect(() => {
            const locationsAdded = this.locationService.locationsAdded();
            locationsAdded?.forEach(zipcode => this.weatherService.addCurrentConditions(zipcode));
        }, { injector: this.injector, allowSignalWrites: true });

        effect(() => {
            const locationsRemoved = this.locationService.locationsRemoved();
            locationsRemoved?.forEach(zipcode => this.weatherService.removeCurrentConditions(zipcode));
        }, { injector: this.injector, allowSignalWrites: true });
    }
}
