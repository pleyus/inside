import { Component, OnInit } from '@angular/core';
import { AppComponent } from '../app.component';
import { StatusService, InsideListenerService } from '../services/status.service';

@Component({
  selector: 'app-radio',
  templateUrl: './radio.component.html',
  styleUrls: ['./radio.component.css']
})
export class RadioComponent implements OnInit {
  constructor(
    public $: AppComponent,
    public S: StatusService,
    public L: InsideListenerService
  ) { }
  ngOnInit() { }
}
