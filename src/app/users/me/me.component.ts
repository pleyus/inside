import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AppComponent } from '../../app.component';
import { AppStatus, Tools, Configuration } from '../../app.service';
import { WebService } from '../../services/web-service';

@Component({
  selector: 'app-me',
  templateUrl: './me.component.html',
  styleUrls: ['./me.component.css']
})
export class UsersMeComponent {

  //  Clases y textos que reciben los status del usuario de acuerdo a su num.
  StatusClass = ['active', 'inactive', 'error', 'upgrade', 'special' ];
  StatusString = [ 'activo', 'suspendido', 'dado de baja', 'egresado', '' ];

  //  Para la grafica de actividades
  ChartData = [];
  ChartLabels = [];
  ChartOptions = { scaleShowVerticalLines: false, responsive: true };
  ChartColors =
  [
    {
      backgroundColor: '#4dabf5',
      borderColor: '#1769aa',
      hoverBackgroundColor: '#2196f3',
      hoverBorderColor: '#1769aa'
    }
  ];

  //  Redirecciona al feedback de reporte
  Feed(Block) {
    this.SetOption('pre', 'Hay un problema con mis datos «' + Block + '»');
    this.R.navigate(['/feedback/']);
  }

  //#region Options
  public GetOption(option, context = 'users', def = false) {
    return this.C.GetOption(option, context, def);
  }
  public SetOption(option, value, context = 'users') {
    this.C.SetOption(option, value, context);
  }
  //#endregion

  constructor(
    public $: AppComponent,
    private R: Router,
    private W: WebService,
    private S: AppStatus,
    public T: Tools,
    private C: Configuration) {
    $.ngOnInit();
    this.GetPlatformInfo( () => this.GetStats() );
  }
  private GetStats( callback: () => void = () => {} ) {
    // Cargamos sus estadisticas, si es que tiene.
    if (this.$.Me.uid > 0) {
      // Cargando...
      this.S.ShowLoading( 'Leyendo actividad...' );

      // Platica
      this.W.Web('users', 'stats', 'id=' + this.$.Me.uid, (s) => {
        // Listo!
        this.S.ClearState();

        // Todo bien?
        if (s.status === this.S.SUCCESS ) {
          this.ChartLabels = s.data.map( it => it.days + ' ' + it.dates );
          this.ChartData = [{ data: s.data.map( it => it.events ), label: 'Interacciones' }];
        }

        callback();

      },
      (e) => { this.S.ShowError('Se perdió la conexión', 0); });
    } else {
      callback();
    }
  }
  private GetPlatformInfo( callback: () => void = () => {} ) {
    if (this.$.Me.uid < 1) {
      callback();
      return;
    }

    // Mostramos el loading
    this.S.ShowLoading('Cargando vinculo de plataforma...');

    // Cargamos usuario
    this.W.Web( 'users', 'get-platform',
    'id=' + this.$.Me.uid,
    (u) => {
      // Listo
      this.S.ClearState();

      // Todo bien?
      if (u.status === this.S.SUCCESS) {
        // Cargamos el usuario en datos
        this.$.Me.platform = u.data;
        callback();
      } else {
        this.S.ShowError('Error al obtener información:<br> –' + u.data);
      }
    },
    (e) => { this.S.ShowError('Se perdió la conexión', 0); });
  }
}
