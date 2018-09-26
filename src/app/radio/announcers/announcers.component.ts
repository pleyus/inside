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

  SetUser(u = null) {
    this.Announcer.user = u;
    this.Announcer.uid = u != null ? u.id : 0;
    // console.log(this.Announcer);

    // this.user_search = '';
    // this.users_found = [];
  }

  public GetAnnouncers( making = 'get' ): void {
    if (making !== 'more') {
      this.SetOption('announcers.last', 0);
    }

    this.S.ShowLoading
    (
      (making === 'more'
      ? ' Cargando'
      : ' Obteniendo lista de usuarios') + '...'
    );


    // Hablamos con la API
    this.W.Web( 'radio', 'list-announcers',

    // Mandamos el ultimo que tenemos
    'last=' + this.GetOption('announcers.last'),


    // Cuando conteste
    (r): void => {
      this.S.ClearState();

      // Revisamos que nos diga 1
      if (r.status === 1) {
        this.Announcers =
          making === 'more'
          ? this.Announcers.concat(r.data)
          : r.data;

        this.LoadMore = r.data.length > 9;
      } else {
        this.S.ShowError(r.data, 0);
      }

      this.SetOption('last', this.Announcers.length);

    });
  }

  // search_timer = null;
  // users_searching = false;
  // user_search = '';
  // users_found = [];
  // Search(){
  // 	// Guardamos el ultimo elemento buscado
  // 	this.users_searching = true;

  // 	// Limpiamos el timer para evitar que cargue mas de la cuenta
  // 	if(this.search_timer !== null)
  // 		clearTimeout(this.search_timer);

  // 	// Si se vació la busqueda, entonces se quitan los users
  // 	if(this.user_search == ''){
  // 		this.users_found = [];
  // 		this.users_searching = false;
  // 	}

  // 	else
  // 		// Si no, se prepara un timer de atraso de busqueda
  // 		this.search_timer = setTimeout(() => {
  // 			// Platicamos con la api
  // 			this.W.Web('users',
  // 				'search',
  // 				's=' + this.user_search +
  // 				'&in=radio.announcer',
  // 			(r)=>{
  // 				// Limpiamos el mensaje de cargando...
  // 				this.users_searching = false;

  // 				// Dependiendo de la respuesta, do.
  // 				if(r.status == 1){
  // 					// Asignamos los userers encontrado
  // 					this.users_found = r.data;
  // 				}
  // 				else
  // 					this.users_found = [];
  // 			})
  // 		}, 500);

  // }

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
