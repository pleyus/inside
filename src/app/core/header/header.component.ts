import { Component, Inject } from '@angular/core';
import { AppComponent } from '../../app.component';
import { DOCUMENT } from '@angular/common';
import { Tools, AppStatus } from '../../app.service';

@Component({
  selector: 'app-core-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  public MENU_RESPONSIVE = false;

  constructor(
    public $: AppComponent,
    public T: Tools,
    public S: AppStatus,
    @Inject(DOCUMENT) document) {}

  public MenuClick(Set: boolean = null) {
    this.MENU_RESPONSIVE = Set === null ? !this.MENU_RESPONSIVE : Set;
  }
}
