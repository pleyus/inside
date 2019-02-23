import { Component } from '@angular/core';
import { AppComponent } from '../app.component';
import { Tools, Configuration } from '../app.service';
import { Router } from '../../../node_modules/@angular/router';
import { StatusService, InsideListenerService } from '../services/status.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  StatusString = [ '', 'Inactivo', 'Baja', 'Egresado', '' ];
  StatusClass = ['', 'disabled', 'disabled fade', 'upgrade', '' ];

  TodaysB = [];
  NextB = [];
  constructor(
    public $: AppComponent,
    public T: Tools,
    private C: Configuration,
    public S: StatusService,
    private R: Router,
    public L: InsideListenerService
  ) {
    if ( $.isAdmin() ) {
      $.ngOnInit();  //  Para que?...

      //  Para mejorar el muestreo de cumpleaños
      L.UpdateNews(true, (B) => {
        // Todo
      });

      //  Enviamos señales de vida...
      L.Alive(null);
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
