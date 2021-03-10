import { Component, OnInit } from '@angular/core';
import { Voivodeship } from "../../assets/voivodeship";
import { Voivodeships } from "../../assets/voivodeships";
import { ActivatedRoute } from '@angular/router';
import { VoivodeshipService } from "../voivodeship.service";
import { StationsAPI } from "../../assets/stationsAPI";

@Component({
  selector: 'app-voivodeship',
  templateUrl: './voivodeship.component.html',
  styleUrls: ['./voivodeship.component.scss']
})
export class VoivodeshipComponent implements OnInit {
  voivodeship!: Voivodeship;

  array!: StationsAPI[];

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
      .subscribe(stations => this.array = stations);
  }

}
