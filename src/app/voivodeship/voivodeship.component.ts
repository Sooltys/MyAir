import { Component, OnInit } from '@angular/core';
import { Voivodeship } from "../../assets/voivodeship";
import { Voivodeships } from "../../assets/voivodeships";
import { ActivatedRoute } from '@angular/router';
import { VoivodeshipService } from "../voivodeship.service";

@Component({
  selector: 'app-voivodeship',
  templateUrl: './voivodeship.component.html',
  styleUrls: ['./voivodeship.component.scss']
})
export class VoivodeshipComponent implements OnInit {
  voivodeship!: Voivodeship;

  constructor(
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    const voivodeId = Number(this.route.snapshot.paramMap.get('id'));
    this.voivodeship = Voivodeships.find(voivodeship => voivodeship.id === voivodeId)!;
  }
}
