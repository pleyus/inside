import { Component } from '@angular/core';
import { Tools, WebService, AppStatus, Configuration } from '../../app.service';
import { AppComponent } from '../../app.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-announcers',
  templateUrl: './announcers.component.html',
  styleUrls: ['./announcers.component.css']
})
export class RadioAnnouncersComponent {

  Announcer = {
    user: null,
    uid: 0,
    alias: ''
  };
  Announcers = [];

  LoadMore = false;

  SearchParams = 'in=radio.announcer&exclude=';

  search_timer = null;
  search_string = '';

  SetUser(u = null) {
    this.Announcer.user = u;
    this.Announcer.uid = u != null ? u.id : 0;
  }

  public GetAnnouncers( making = 'get' ): void {
    if (making !== 'more') {
      this.SetOption('announcers-list.last', 0);
    }

    this.S.ShowLoading
    (
      making === 'search' || this.search_string !== ''
      ? 'Buscando «' + this.search_string + '»...'
      : 'Cargando ' + (making === 'more' ? ' mas locutores' : 'lista de locutores') + '...'
    );


    // Hablamos con la API
    this.W.Web( 'radio', 'list-announcers',

    // Mandamos el ultimo que tenemos
    'last=' + this.GetOption('announcers-list.last') +
    // '&filter=' + this.GetOption('announcers-list.filter') +

    //  Buscar
    (making === 'search' || this.search_string !== '' ? '&s=' + this.search_string : ''),


    // Cuando conteste
    (r): void => {
      this.S.ClearState();

      // Revisamos que nos diga 1
      if (r.status === 1) {
        this.Announcers =
          making === 'more'
          ? this.Announcers.concat(r.data)
          : r.data;

        this.LoadMore = r.data.length > 5;

        const announs = this.Announcers.map( (a) => a.uid );
        this.SearchParams = 'in=radio.announcer&exclude=' + announs.join(',');

      } else {
        this.S.ShowError(r.data, 0);
      }

      this.SetOption('announcers-list.last', this.Announcers.length);

    });
  }

  Search() {
    // Limpiamos el timer para evitar que cargue mas de la cuenta
    if ( this.search_timer !== null ) {
      clearTimeout(this.search_timer);
    }

    if (this.search_string === '') {
      this.GetAnnouncers();
    } else {
      this.search_timer = setTimeout( () => { this.GetAnnouncers('search'); }, 500);
    }

  }

  AddAnnouncer() {
    this.S.ShowLoading('Agregando locutor...');
    this.W.Web('radio', 'save-announcer', 'announcer=' + JSON.stringify(this.Announcer), (r) => {
      this.S.ShowAlert(r.data, r.status);
      if (r.status === 1) {
        // this.user_search = '';
        // this.Search();
        this.GetAnnouncers();
        this.Announcer = {
          user: null,
          alias: '',
          uid: 0
        };
      }
    });
  }
  RemoveAnnouncer(H) {
    if (!confirm('Esta a punto de quitar a ' + H.alias +
      ' de locutor, esto lo quitará tambien de los programas en los que participe. ¿Continuar?')) {
      return;
    }

    this.S.ShowLoading('Eliminando locutor...');

    this.W.Web('radio', 'remove-announcer', 'id=' + H.id, (r) => {

      this.S.ShowAlert(r.data, r.status);
      if (r.status === 1) {
        setTimeout(() => { this.GetAnnouncers(); }, 2000);
      }

    });
  }

  public isFilter(value) {
    return this.GetOption('announcers-list.filter') === value;
  }
  public setFilter(value) {
    this.SetOption('announcers-list.filter', value);
  }
  public FilterText() {
    let text = '';
    if ( this.isFilter('') ) { text = 'Todos'; }
    if ( this.isFilter('unsetted') ) { text = 'Libres'; }
    return text;
  }

  public GetOption(option, context = 'radio', def = false) {
    return this.C.GetOption(option, context, def);
  }
  public SetOption(option, value, context = 'radio') {
    this.C.SetOption(option, value, context);
  }

  constructor(
    public $: AppComponent,
    public T: Tools,
    private W: WebService,
    private R: Router,
    private S: AppStatus,
    private C: Configuration
  ) {
    if ( $.isAdmin() && $.CanDo('radio') ) {
      C.SetOption('selected.tab', 'announcers', 'radio');
      $.ST.radio = 'announcers';
      this.GetAnnouncers();
    } else {
      S.ShowError('No tienes permiso de edición para los announcerers', 0);
      R.navigate(['/home']);
    }
  }

}
