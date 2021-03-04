import { Component, OnInit } from '@angular/core';
import { Voivodeship } from "../../assets/voivodeship";
import { Voivodeships } from "../../assets/voivodeships";
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-voivodeship',
  templateUrl: './voivodeship.component.html',
  styleUrls: ['./voivodeship.component.scss']
})
export class VoivodeshipComponent implements OnInit {
  voivodeship!: Voivodeship;

  constructor(
    private route: ActivatedRoute,
  ) {
   }

  ngOnInit(): void {
    //this.voivodeship = 
  }
  

}
