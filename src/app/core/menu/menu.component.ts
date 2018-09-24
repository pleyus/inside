import { Component } from '@angular/core';
import { AppComponent } from '../../app.component';
import { AppStatus } from '../../app.service';

@Component({
  selector: 'core-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent {
	constructor( public $ : AppComponent, public S: AppStatus ) { }
}
