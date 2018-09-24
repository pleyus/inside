import { Component, OnInit } from '@angular/core';
import { AppComponent } from '../app.component';
import { AppStatus } from '../app.service';

@Component({
  selector: 'app-radio',
  templateUrl: './radio.component.html',
  styleUrls: ['./radio.component.css']
})
export class RadioComponent implements OnInit {

	Title = "Studio3.3 – Panel";

	constructor(
		public $ : AppComponent,
		public S: AppStatus
	) { }
	ngOnInit() { }
}
