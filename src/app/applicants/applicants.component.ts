import { Component, OnInit } from '@angular/core';
import { AppComponent } from '../app.component';
import { AppStatus } from '../app.service';

@Component({
  selector: 'app-applicants',
  templateUrl: './applicants.component.html',
  styleUrls: ['./applicants.component.css']
})
export class ApplicantsComponent implements OnInit {

  constructor(
	  public $: AppComponent,
	  public S: AppStatus
  ) { }

  ngOnInit() {
  }

}
