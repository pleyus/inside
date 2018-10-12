import { Component } from '@angular/core';
import { WebService, Tools, AppStatus, Configuration } from '../../app.service';
import { AppComponent } from '../../app.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class UsersListComponent {
  Title = 'Usuarios';
  Users = [];
  LoadMore = true;

  ListOptions = {
    Title : 'Lista de usuarios',
    ExtraRows : 5
  };
  Cols = [];
  Columns = 10;

  COURSES = [];

  Checkeds = [];
  MasiveEditor = {
    sex: { checked: 0, val: 0 },
    type: {checked: 0, val: 0 },
    status: {checked: 0, val: 0 },
    cid: { checked: 0, val: 0 },
    level: { checked: 0, val: 0 },
    idnumber: {checked: 0, val: '' }
  };

  _Order = 'DESC';
  _OrderBy = 'idnumber';

  private search_timer;
  search_string = '';

  PrintType = '';
  CardOptions = {
    OnlyActive: true,
    WithOutPhoto: false,
    Valid: 'Diciembre 2018'
  };

  SavedIds = [];

  constructor(
    private W: WebService,
    public $: AppComponent,
    public T: Tools,
    private R: Router,
    private S: AppStatus,
    private C: Configuration
  ) {
    this.Users = [];
    this.SetOption('last', 0);

    if ($.isAdmin() && $.CanDo('user')) {
      this.init();
    } else {
      S.ShowError('No tienes autorización para entrar al modulo de usuarios', 0);
      R.navigate(['/home']);
    }
  }

  private InitCols() {
    this.Cols = [];

    for (let i = 0; i < this.Columns; i++) {
      this.Cols.push(i);
    }
  }

  private init() {
    this._Order = this.GetOption('order');
    this._OrderBy = this.GetOption('order_by');

    this.CardOptions.OnlyActive = this.GetOption('card.only-active');
    this.CardOptions.WithOutPhoto = this.GetOption('card.without-photo');

    //  Cargamos los Ids guardados
    this.SavedIds = this.GetSavedIds();


    const m = this.$.Now().getMonth(),
        y = this.$.Now().getFullYear();

    if ( m >= 0 && m < 6 ) {
      this.CardOptions.Valid = 'Agosto ' + y;
    } else if ( m >= 7 && m < 11) {
      this.CardOptions.Valid = 'Diciembre ' + y;
    } else {
      this.CardOptions.Valid = 'Agosto ' + (y + 1);
    }

    this.search_string = this.GetOption('search');
    this.GetCourses( () => { this.GetUsers(); } );
    this.InitCols();
  }

  public Info(num) {
    let mess = 'Ahora puedes utilizar comodines de busqueda, estos ayudan a filtrar resultados de las busquedas:<br>' +

    '<b>nivel:# | level:#</b><br>' +
    'Ej:<br> <em>level:4</em> <br><small><i>(Muestra solo resultados donde los usuarios esten' +
    ' en 4to semestre/cuatrimestre)</i></small><br><br>' +

    '<b>control:% </b><br>' +
    'Ej:<br> <em>control:18lde</em> <br><small><i>(Muestra solo los usuarios con numero de control 18LDE... )</i></small><br><br>' +

    '<b>pic | foto | confoto</b><br>' +
    'Ej:<br> <em>foto</em> <br><small><i>Muestra solo los usuarios con foto de perfil</i></small><br><br>' +

    '<b>activos | active</b><br> » Solo muestra los usuarios que estan o no activos.<br><br>' +
    '<b>plataforma | plat</b><br> » Solo muestra los usuarios que estan ligados o no a plataforma.<br><br>' +

    'Todos los comodines pueden excluir la condición anteponiendo el signo de <b>!</b>.<br>' +
    'Ej:<br> <em>!pic</em><br> » Muestra usuarios SIN foto';
    if (num === 1) {
      mess = 'Sirve para generar automaticamente los numeros de control, basado en un patron ' +
      'utilizando el signo de # para serializar y se rellenará con 0s hasta alcanzar la longituda ' +
      'de los signos.' +
      '<br><br>Ej: <em><b>18LTS###</b></em><br><br>' +
      '<i>Creará los numeros de control:<br> –18LTS001<br> –18LTS002<br> –18LTS...</i>' +
      '<br><br>Hasta el ultimo de la lista en el orden actual, en caso de que la cifra ' +
      'de la cantidad de usuarios supere el numero de signos #, se lleará con ceros hasta ' +
      'igualar el numero de cifras.';
    }
    this.S.ShowAlert(mess, -1, 0);
  }
  public GetUsers(making = 'get'): void {
    const search = this.search_string;
    if (making !== 'more') {
      this.SetOption('last', 0);
    }

    this.S.ShowLoading
      (
      making === 'search' || search !== ''
        ? 'Buscando «' + search + '»...'
        : (making === 'more' ? ' Cargando' : ' Obteniendo lista de usuarios') + '...'
      );


    // Hablamos con la API
    this.W.Web('users', 'list',

      // Mandamos el ultimo que tenemos
      'last=' + this.GetOption('last') +

      //  Lanzamos el orden
      '&order=' + this._Order +
      '&order_by=' + this._OrderBy +

      //  En caso de que se quiera mostrar
      (making === 'load-ids' && this.SavedIds.length > 0
        ? '&ids=' + this.SavedIds.join(',')
        : ''
      ) +

      // Si se esta buscando algo le decimos
      (making === 'search' || search !== '' ? '&s=' + search : ''),


      // Cuando conteste
      (r): void => {
        this.S.ClearState();

        // Revisamos que nos diga 1
        if (r.status === 1) {
          if ( typeof r.data === 'object' ) {
            this.Users =
              making === 'more'
                ? this.Users.concat(r.data)
                : r.data;

            if (making !== 'more') {
              this.Checkeds = [];
            }

            this.LoadMore = r.data.length > 9;
          } else {
            this.S.ShowWarning('No se pudo completar la consulta. Intente de nuevo en un momento', 0);
          }
        } else {
          // Si no, mostramos el mensaje
          this.S.ShowError(r.data, 0);
        }

        this.SetOption('last', this.Users.length);

      });
  }

  GetCourses(callback: () => void = () => {}) {
    //  Primero estados
    this.S.ShowLoading( 'Cargando cursos...' );

    this.W.Web('categories', 'list', 'type=courses',
    (r) => {
      if ( r.status === this.S.SUCCESS ) {
        this.COURSES = r.data;
      } else {
        this.COURSES = [];
      }

      this.S.ClearState();
      callback();
    },
    (e) => { this.S.ShowError('Se perdió la conexión', 0); });
  }

  onChangeChecks(c) {
    if (this.isView('normal')) {
      this.Checkeds = c;
      if (this.Checkeds.length < 1) {
        this.PrintType = '';
      }
    } else {
      this.Checkeds = [];
      this.PrintType = '';
    }
  }

  Apply() {
    const ids = [];
    this.Checkeds.forEach(user => {
      ids.push(user.id);
    });

    this.W.Web('users', 'masive-save',
    'ids=' + JSON.stringify(ids) +
    '&fields=' + JSON.stringify(this.MasiveEditor),

    (r) => {
      if ( r.status === this.S.SUCCESS ) {
        this.S.ShowSuccess(r.data);
        setTimeout(() => {
          this.MasiveEditor = {
            sex: { checked: 0, val: 0 },
            type: {checked: 0, val: 1 },
            status: {checked: 0, val: 0 },
            cid: { checked: 0, val: 0 },
            level: { checked: 0, val: 0 },
            idnumber: { checked: 0, val: '' }
          };
          this.GetUsers();
        }, 1000);
      } else {
        this.S.ShowAlert(r.data, r.status, 0);
      }
    });
  }

  public ClearSavedList() {
    this.SavedIds = [];
    this.SetOption( 'sids', '' );
  }
  public SaveList(flush = false) {

    //  Si se va a borrar todo:
    if (flush) {
      this.ClearSavedList();
    }

    //  Si no, entonces unimos los guardados con los checkeados
    this.SavedIds = [];
    this.SavedIds = this.SavedIds.concat(this.GetSavedIds(), this.Checkeds.map( r => r.id ));

    //  Ahora quitamos los repetidos.
    this.SavedIds = this.SavedIds.filter( (val, index, self) => self.indexOf(val) === index);

    this.SetOption( 'sids', this.SavedIds.join(',') );
  }
  private GetSavedIds() {
    const ids = this.GetOption('sids').trim();
    if (ids.length > 0) {
      return ids.split(',').map(v => v * 1);
    } else {
      return [];
    }
  }

  DownloadPSD() {
    this.S.ShowLoading('Preparando para descargar...');

    //  Si se ha seleccionado algo...
    if ( this.Checkeds.length > 0 ) {
      //  Hablamos con la api
      this.W.Web('users', 'card-data',
      //  Mapeamos los seleccionados y sacamos los ids, despues los juntamos con comas (,)
      'ids=' + (this.Checkeds.map( (c) => c.id ).join(',')),
      (r) => {
        if (r.status === this.S.SUCCESS) {
          this.S.ShowSuccess('Su descarga esta disponible desde:<br>' +
          '<a title="Descargar ahora" href="' + r.data + '" target="_blank">' +
          r.data + '</a>', 0);
        } else {
          this.S.ShowAlert(r.data, r.status, 0);
        }
      });
    }
  }
  /**
   * Muestra la información de los usuarios guardados
   */
  public LoadSavedIds(event) {

    if ( event.ctrlKey ) {
      this.ClearSavedList();

    } else {
      this.search_string = '';
      this.SetOption('last', 0);
      this.GetUsers('load-ids');

    }
  }

  Order(e) {
    this._Order = e.order;
    this._OrderBy = e.order_by;
    this.SetOption('order', e.order);
    this.SetOption('order_by', e.order_by);
    this.GetUsers();
  }

  /**
     * Evento que se ejecuta al escribir en la caja de busqueda
     */
  public search() {
    this.SetOption('search', this.search_string);

    if (this.search_timer !== undefined) {
      clearTimeout(this.search_timer);
    }

    if (this.search_string === '') {
      this.GetUsers();
    } else {
      this.search_timer = setTimeout(() => { this.GetUsers('search'); }, 500);
    }
  }

  public ViewText() {
    let text = '';
    if (this.isView('normal')) {
      text = 'Normal';
    }
    if (this.isView('contacts')) {
      text = 'Agenda';
    }
    return text;
  }

  public isView(value) {
    return this.GetOption('listview') === value;
  }

  public setView(value) {
    this.SetOption('listview', value);

    if (value !== 'normal') {
      this.Checkeds = [];
      this.PrintType = '';
      this.Users.map(User => User.checked = 0);
    }
  }

  canPrint(User) {
    if (this.CardOptions.OnlyActive) {
      if (User.status !== 0) { return false; }
    }

    if ( !this.CardOptions.WithOutPhoto ) {
      if ( !(User.pid > 0) ) { return false; }
    }

    return true;
  }
  SetOnlyActive() {
    this.CardOptions.OnlyActive = !this.CardOptions.OnlyActive;
    this.SetOption('card.only-active', this.CardOptions.OnlyActive);
  }
  SetWithOutPhoto() {
    this.CardOptions.WithOutPhoto = !this.CardOptions.WithOutPhoto;
    this.SetOption('card.without-photo', this.CardOptions.WithOutPhoto);
  }

  public GetOption(option, context = 'users', def = false) {
    return this.C.GetOption(option, context, def);
  }
  public SetOption(option, value, context = 'users') {
    this.C.SetOption(option, value, context);
  }
}
