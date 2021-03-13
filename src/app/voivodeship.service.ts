import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { StationsAPI } from "../assets/stationsAPI";
import { SensorsAPI } from "../assets/sensorsAPI";
import { DataAPI } from "../assets/dataAPI";


@Injectable({
  providedIn: 'root'
})
export class VoivodeshipService {

  private urlAPI: string = '/api';

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json'})
  };

  constructor(
    private http: HttpClient
  ) { 
  }

  getStations(): Observable<StationsAPI[]> {
    return this.http.get<StationsAPI[]>(`${this.urlAPI}/station/findAll`);
  }

  getSensors(stationId: number): Observable<SensorsAPI[]> {
    return this.http.get<SensorsAPI[]>(`${this.urlAPI}/station/sensors/${stationId}`)
  }

  getData(sensorId: number): Observable<DataAPI> {
    return this.http.get<DataAPI>(`${this.urlAPI}/data/getData/${sensorId}`)
  }
}
