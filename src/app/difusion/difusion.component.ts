import { Component, OnInit } from '@angular/core';
import { AppComponent } from '../app.component';
import { AppStatus } from '../app.service';

@Component({
  selector: 'app-difusion',
  templateUrl: './difusion.component.html',
  styleUrls: ['./difusion.component.css']
})
export class ApplicantsComponent implements OnInit {

  constructor(
    public $: AppComponent,
    public S: AppStatus
  ) { }

  ngOnInit() {
  }

}
