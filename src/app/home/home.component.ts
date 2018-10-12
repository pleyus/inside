import { Component } from '@angular/core';
import { AppComponent } from '../app.component';
import { UsersListComponent } from '../users/list/list.component';
import { Tools, Configuration, AppStatus } from '../app.service';
import { Router } from '../../../node_modules/@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  constructor(
    public $: AppComponent,
    public T: Tools,
    private C: Configuration,
    public S: AppStatus,
    private R: Router
  ) {
    if ( $.isAdmin() ) {
      $.ngOnInit();
      S.UpdateNews(true);
      S.Alive(null);
    } else {
      R.navigate(['/me']);
    }
  }
  public GetOption(option, context = 'main', def = false) {
    return this.C.GetOption(option, context);
  }
  public SetOption(option, value, context = 'main') {
    this.C.SetOption(option, value, context);
  }
}
