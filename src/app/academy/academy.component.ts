import { Component, OnInit } from '@angular/core';
import { AppComponent } from '../app.component';
import { StatusService } from '../services/status.service';

@Component({
  selector: 'app-academy',
  templateUrl: './academy.component.html',
  styleUrls: ['./academy.component.css']
})
export class AcademyComponent implements OnInit {

  constructor(
    public $: AppComponent,
    public S: StatusService
  ) { }

  ngOnInit() {
  }

}
