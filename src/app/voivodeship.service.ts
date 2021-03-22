import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { StationsAPI } from "../assets/stationsAPI";
import { SensorsAPI } from "../assets/sensorsAPI";
import { DataAPI } from "../assets/dataAPI";
import { Voivodeship } from 'src/assets/voivodeship';


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
    return this.http.get<StationsAPI[]>(`${this.urlAPI}/station/findAll`)
      .pipe(
      tap(_ => console.log('loaded Stations')),
      catchError(this.handleError<StationsAPI[]>('getStations', []))
      );
  }

  getSensors(stationId: number): Observable<SensorsAPI[]> {
    return this.http.get<SensorsAPI[]>(`${this.urlAPI}/station/sensors/${stationId}`)
      .pipe(
      tap(_ => console.log('loaded Sensors')),
      catchError(this.handleError<SensorsAPI[]>('getSensors', []))
    );
  }

  getData(sensorId: number): Observable<DataAPI> {
    return this.http.get<DataAPI>(`${this.urlAPI}/data/getData/${sensorId}`)
      .pipe(
      tap(_ => console.log('loaded data')),
      catchError(this.handleError<DataAPI>('getData'))
    );
  }

  /**
  * @param operation - name of the operation that failed
  * @param result - optional value to return as the observable result
  */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead
      // TODO: better job of transforming error for user consumption
      console.log(`${operation} failed: ${error.message}`);
      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

}
