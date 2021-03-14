import { Component, OnInit, DoCheck, Output } from '@angular/core';
import { Voivodeship } from 'src/assets/voivodeship';
import { Voivodeships } from "../../assets/voivodeships";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  voivodeships: Voivodeship[] = Voivodeships;
  activeVoivodeship!: string;

  constructor( ) { 
  }

  ngOnInit(): void {
    this.activeVoivodeship = "Województwa";
  }

  changeActiveVoivodeship(newActive: string): void {
    this.activeVoivodeship = newActive;
    console.log("chenging active voivode");
    console.log("active voivode: "+this.activeVoivodeship);
  }
}
