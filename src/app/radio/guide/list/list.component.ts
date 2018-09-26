import { Component } from '@angular/core';
import { AppComponent } from '../../../app.component';
import { WebService, AppStatus, Tools, Configuration } from '../../../app.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-radio-guide-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class RadioGuideListComponent {
  public Guides = [];
  public Dias = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
  LoadMore = false;

  InTime(Days, n) {
    let title = [];
    for (let i = 0; i < Days.length; i++) {
      if ( (Days[i].day * 1) === n) {
        title.push('de ' + this.xx(Days[i].start.h) + ':' + this.xx(Days[i].start.m) +
        ' a ' + this.xx(Days[i].end.h) + ':' + this.xx(Days[i].end.m) );
      }
    }
    return title.join(', ');
  }
  InDays(Days, n) {

    for (let i = 0; i < Days.length; i++) {
      if ( (Days[i].day * 1) === n) {
        return 'active';
      }
    }
    return '';
  }

  xx(number) {
    return number > 9 ? '' + number : (number < -9 ? '' + number : '0' + number );
  }

  public GetGuides( making = 'get' ) {
    this.S.ShowLoading('Cargando programas' + (making === 'more' ? ' anteriores' : '') + '...');

    // Si se e
    if (making === 'get') {
      this.C.SetOption('last', 0);
    }


    // Hablamos con la API
    this.W.Web( 'radio', 'list-guide',

    // Mandamos el ultimo que tenemos
    'last=' + this.C.GetOption('last'),


    // Cuando conteste
    (r): void => {
      this.S.ClearState();
      // Revisamos que nos diga 1
      if (r.status === 1) {
        this.Guides =
          making === 'more'	// Si se estan cargando mas
          ? this.Guides.concat(r.data)	// Concatenamos los actuales + antiguos
          : r.data;
      } else { // Si no, mostramos el mensaje
        this.S.ShowError(r.data, 0);
      }


      this.C.SetOption('last', this.Guides.length );
      // En caso de que se este actualizando, loadmore no cambia, sino si
      this.LoadMore = making === 'update' ? this.LoadMore : r.data.length >= 10 ;
    });
  }

  constructor(
    private $: AppComponent,
    private W: WebService,
    private R: Router,
    private S: AppStatus,
    public T: Tools,
    private C: Configuration
  ) {
    if ( $.isAdmin() && $.CanDo('radio') ) {
      this.C.SetOption('selected.tab', 'guide', 'radio');
      this.$.ST.radio = 'guide';
      this.GetGuides();
    } else {
      S.ShowError('No tienes permisos suficientes para ver la lista de programas, ' +
        'pero puedes hacerlo desde nuestra <a href="https://unitam.edu.mx/radio">página de radio</a>', 0);
      R.navigate(['/home']);
    }
  }
}
