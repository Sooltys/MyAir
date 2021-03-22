import { Component, OnInit } from '@angular/core';
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
    this.activeVoivodeship = "Województwa";
  }

  ngOnInit(): void {
  }

}
