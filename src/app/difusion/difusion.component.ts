import { Component, OnInit } from '@angular/core';
import { AppComponent } from '../app.component';
import { StatusService, InsideListenerService } from '../services/status.service';

@Component({
  selector: 'app-difusion',
  templateUrl: './difusion.component.html',
  styleUrls: ['./difusion.component.css']
})
export class ApplicantsComponent implements OnInit {

  constructor(
    public $: AppComponent,
    public S: StatusService,
    public L: InsideListenerService
  ) { }

  ngOnInit() {
  }

}
