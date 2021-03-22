import { Component, OnInit } from '@angular/core';
import { StationsAPI } from "../../assets/stationsAPI";
import { VoivodeshipService } from "../voivodeship.service";
import {FormControl} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';


@Component({
  selector: 'app-city-search',
  templateUrl: './city-search.component.html',
  styleUrls: ['./city-search.component.scss']
})
export class CitySearchComponent implements OnInit {

  cities!: string[];

  constructor(
    private voivodeService: VoivodeshipService
  ) { }

  ngOnInit(): void {
    
  }

  getCities(): void {
    
  }

}
