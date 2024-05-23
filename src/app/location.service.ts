import {effect, Injectable, signal, Signal, WritableSignal} from '@angular/core';

export const LOCATIONS : string = "locations";

@Injectable()
export class LocationService {
  private readonly _locations: WritableSignal<string[]> = signal([]);
  public readonly locations: Signal<string[]> = this._locations.asReadonly();

  private readonly _locationsAdded: WritableSignal<string[]> = signal(null);
  public readonly locationsAdded: Signal<string[]> = this._locationsAdded.asReadonly();

  private readonly _locationsRemoved: WritableSignal<string[]> = signal(null);
  public readonly locationsRemoved: Signal<string[]> = this._locationsRemoved.asReadonly();

  constructor() {
    this.syncCache();
  }

  public addLocations(zipcodes: string[]): void {
    const zipcodesToAdd = zipcodes.filter(zipcode => !this._locations().includes(zipcode));
    if (zipcodesToAdd.length === 0) return;

    this._locations.update((locations) => [...locations, ...zipcodes]);
    this._locationsAdded.set(zipcodes);
  }

  public addLocation(zipcode : string) {
    this.addLocations([zipcode]);
  }

  public removeLocation(zipcode : string) {
    let index = this.locations().indexOf(zipcode);
    if (index !== -1) {
      this._locations.update((locations) => [...locations].splice(index, 1));
      this._locationsRemoved.set([zipcode]);
    }
  }

  private syncCache(): void {
    let locString = localStorage.getItem(LOCATIONS);
    if (locString) this.addLocations(JSON.parse(locString));

    effect(() => localStorage.setItem(LOCATIONS, JSON.stringify(this.locations())))
  }
}
