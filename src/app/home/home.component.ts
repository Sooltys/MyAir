import { Component, OnInit } from '@angular/core';
import { VoivodeshipService } from "../voivodeship.service";
import { VoivodeshipComponent } from '../voivodeship/voivodeship.component';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(
    private voivodeService: VoivodeshipService
    ) { }

  ngOnInit(): void { }

}
