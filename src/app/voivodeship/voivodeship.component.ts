import { Component, OnInit, DoCheck } from '@angular/core';
import { Voivodeship } from "../../assets/voivodeship";
import { Voivodeships } from "../../assets/voivodeships";
import { HeaderComponent } from "../header/header.component";
import { ActivatedRoute } from '@angular/router';
import { VoivodeshipService } from "../voivodeship.service";
import { StationsAPI } from "../../assets/stationsAPI";
import { SensorsAPI } from "../../assets/sensorsAPI";
import { DataAPI } from "../../assets/dataAPI";

@Component({
  selector: 'app-voivodeship',
  templateUrl: './voivodeship.component.html',
  styleUrls: ['./voivodeship.component.scss'],
  providers: [HeaderComponent]
})
export class VoivodeshipComponent implements OnInit {
  voivodeId!: number;
  oldVoivodeId: number = -1;
  voivodeship!: Voivodeship;

  stations!: StationsAPI[];
  sensors!: SensorsAPI[];
  dataFromSensor!: DataAPI;
  isStationView: boolean = true;
  activeCity!: string;

  constructor(
    private route: ActivatedRoute,
    private voivodeService: VoivodeshipService,
    private head: HeaderComponent
  ) { }

  ngOnInit(): void {
    this.voivodeId = Number(this.route.snapshot.paramMap.get('id'));
    this.voivodeship = Voivodeships.find(voivodeship => voivodeship.id === this.voivodeId)!;
    if(!this.stations) {
      this.getStations();
    }
    //this.head.changeActiveVoivodeship(this.voivodeship.name)
  }

  ngDoCheck(): void {
    this.voivodeId = Number(this.route.snapshot.paramMap.get('id'));
    if(this.voivodeId !== this.oldVoivodeId) {
      this.voivodeship = Voivodeships.find(voivodeship => voivodeship.id === this.voivodeId)!;
      this.oldVoivodeId = this.voivodeId;
      this.isStationView = true;
      //this.head.changeActiveVoivodeship(this.voivodeship.name)
    }
  }

  getStations(): void {
    this.voivodeService.getStations()
      .subscribe(stations => this.stations = stations);
  }

  getSensors(id: number): void {
    this.voivodeService.getSensors(id)
      .subscribe(sensors => this.sensors = sensors);
  }

  getData(id: number): void {
    this.voivodeService.getData(id)
      .subscribe(data => this.dataFromSensor = data);
  }
}
