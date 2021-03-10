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

  private urlAPI:string = '/api';
  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  private stations!: StationsAPI[];

  constructor(
    private http: HttpClient
  ) { 
    this.getStations().subscribe(stations => this.stations = stations);
  }

  getStations(): Observable<StationsAPI[]> {
    return this.http.get<StationsAPI[]>(`${this.urlAPI}/station/findAll`);
  }
}
