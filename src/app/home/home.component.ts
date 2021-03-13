import { Component, OnInit } from '@angular/core';
import { VoivodeshipService } from "../voivodeship.service";
import { DeviceDetectorService } from "ngx-device-detector";
import { Coordinates } from "../../assets/coordinates";
import { Coordinate } from 'src/assets/coordinate';
import { Voivodeships } from "../../assets/voivodeships";
import { Voivodeship } from 'src/assets/voivodeship';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  coordinates: Coordinate;
  voivodeships: Voivodeship[] = Voivodeships;

  constructor(
    private deviceService: DeviceDetectorService
  ) { 
      this.coordinates = Coordinates[(this.isMobile()? 1 : 0)];
   }

  ngOnInit(): void { 
  
  }

  isMobile(): boolean {
    return this.deviceService.isMobile();
  }

}
