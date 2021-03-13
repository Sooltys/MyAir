import { Component, OnInit } from '@angular/core';
import { Voivodeship } from "../../assets/voivodeship";
import { Voivodeships } from "../../assets/voivodeships";
import { ActivatedRoute } from '@angular/router';
import { VoivodeshipService } from "../voivodeship.service";
import { StationsAPI } from "../../assets/stationsAPI";
import { SensorsAPI } from "../../assets/sensorsAPI";
import { DataAPI } from "../../assets/dataAPI";

@Component({
  selector: 'app-voivodeship',
  templateUrl: './voivodeship.component.html',
  styleUrls: ['./voivodeship.component.scss']
})
export class VoivodeshipComponent implements OnInit {
  voivodeship!: Voivodeship;

  stations!: StationsAPI[];
  sensors!: SensorsAPI[];
  dataFromSensor!: DataAPI;

  constructor(
    private route: ActivatedRoute,
    private voivodeService: VoivodeshipService
  ) { }

  ngOnInit(): void {
    const voivodeId = Number(this.route.snapshot.paramMap.get('id'));
    this.voivodeship = Voivodeships.find(voivodeship => voivodeship.id === voivodeId)!;

    this.getStations();
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
