import { Component, Inject } from '@angular/core';
import { AppComponent } from '../../app.component';
import { DOCUMENT } from '@angular/common';
import { Tools } from '../../app.service';

@Component({
  selector: 'app-core-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  constructor(
    public $: AppComponent,
    public T: Tools,
    @Inject(DOCUMENT) document) {}
}
