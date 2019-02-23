import { Component } from '@angular/core';
import { Tools, Configuration } from '../../app.service';
import { WebService } from '../../services/web-service';
import { AppComponent } from '../../app.component';
import { Router } from '@angular/router';
import { StatusService, InsideListenerService } from '../../services/status.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class UsersListComponent {

  //  Variable para lista de usuarios
    Users = [];      //  Los usuarios obtenidos desde el servidor
    LoadMore = true; //  Muestra o no el link para cargar mas usuarios
    Checkeds = [];   //  Es la lista de los usuarios marcados (ckecks)

  //  La lista de carreras que tenemos (para llenar los select box)
  COURSES = [];

  //  Ayuda a mostrar u ocultar los acordeones disponibles en el componente
  public Acordeon = {
    card: false,
    list: false
  };




  //#region  ONCHECKEDS

    //  Al momento de marcar algun usuario de la lista (Checkeds.lenght > 0)
    //  se muestra por un lado un conjunto de tabs con las cuales se pueden
    //  realizar acciones sobre los usuarios seleccionados

    public SELECTED_TAB = 'selection';  //  Es la tab seleccionada actualmente

    //#region SELECTED_TAB = 'selection'

      //  Se encarga de almacenar los ids guardados, para posteriormente cargarlos
      //  desde el metodo GetUsers('load-ids').
      SavedIds = [];

    //#endregion

    //#region SELECTED_TAB = 'print'

      //  Opciones de la impresión de lista de asistencia
      ListOptions = {

        // El titulo que llevará la lista
        Title : 'Asistencia',

        // En caso de necesitarse filas extra al final de la lista.
        ExtraRows : 5

      };

      //  Es un rango de columnas a imprimir
      Cols = [];

      //  Opciones de la impresión de credenciales
      CardOptions = {

        //  Solo imprime usuarios activos (User.status = 0)
        OnlyActive: true,

        //  Imprime usuarios sin foto
        WithOutPhoto: false,

        //  Vigencia de la credencial
        Valid: 'Diciembre 2018'
      };
    //#endregion

    //#region SELECTED_TAB = 'edit'

      //  La configuración para poder modificar masivamente los usuarios marcados
      //  cada propiedad tiene 2 valores
      //    checked: indica si se va a editar dicha propiedad
      //    val:     indica el valor a asignar a la propiedad
      MasiveEditor = {
        sex: { checked: 0, val: 0 },
        type: {checked: 0, val: 0 },
        status: {checked: 0, val: 0 },
        cid: { checked: 0, val: 0 },
        level: { checked: 0, val: 0 },
        idnumber: {checked: 0, val: '' }
      };

    //#endregion
  //#endregion



  //  Define la ordenación de los usuarios en la lista
  _Order = 'DESC';
  _OrderBy = 'idnumber';



  //  Variables para busqueda

    //  Permite hacer un pequeño delay al momento de escribir en el cuadro de busqueda
    //  Es usada como handler de setTimeout(...)
    private search_timer;

    search_string = '';  // La busqueda que se realiza


  constructor(
    private W: WebService,
    public $: AppComponent,
    public T: Tools,
    private R: Router,
    private S: StatusService,
    private C: Configuration
  ) {
    //  Primero se limpian los usuarios que esten en cache
    this.Users = [];

    //  Se reinicia el last de la ultima consulta
    this.SetOption('last', 0);

    //  Revisamos permisos...
    if ($.isAdmin() && $.CanDo('user')) {
      this.init();
    } else {
      S.ShowError('No tienes autorización para entrar al modulo de usuarios', 0);
      R.navigate(['/home']);
    }
  }


  private init() {
    //  Cargamos el ultimo orden que se utilizó
    this._Order = this.GetOption('order');
    this._OrderBy = this.GetOption('order_by');

    //  Cargamos las opciones guardadas de la ultima impresion de credenciales
    this.CardOptions.OnlyActive = this.GetOption('card.only-active');
    this.CardOptions.WithOutPhoto = this.GetOption('card.without-photo');

    //  Cargamos los Ids guardados
    this.SavedIds = this.GetSavedIds();


    //  Preparamos la nueva fecha de vigencia de las credenciales
    const m = this.$.Now().getMonth(),
        y = this.$.Now().getFullYear();

    //  Si el mes esta entre enero y junio, postergamos a agosto del mismo año
    if ( m >= 0 && m <= 6 ) {
      this.CardOptions.Valid = 'Agosto ' + y;

    //  Si el mes es despues de julio y noviembre, postergamos a diciembre del mismo año
    } else if ( m >= 7 && m < 11) {
      this.CardOptions.Valid = 'Diciembre ' + y;

    //  Si no, quiere decir que es diciembre y lo ponemos a agosto del siguiente año.
    } else {
      this.CardOptions.Valid = 'Agosto ' + (y + 1);
    }

    //  Cargamos la ultima busqueda (para mantener la lista anterior)
    this.search_string = this.GetOption('search');

    //  Cargamos la lista de cursos que tenemos, al cargarlos, continuamos con los usuarios.
    //  Esto debido a que la api nos devuelve el usuario con User.cid (id del curso) y con
    //  el mismo seleccionamos el curso de un select box, que tiene que estar cargado previamente
    this.GetCourses( () => { this.GetUsers(); } );

    //  Generamos el rango de columnas de la impresión. (ver la definicion de this.Cols)
    this.Cols = this.T.Range(10);

  }

  /**
   * Muestra en un Alert (StatusService) información sobre algun elemento del componente
   * @param num Numero del bloque de información a mostrar
   */
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

  /**
   * Obtiene la lista de usuarios dependiendo de la acción.
   * @param making Define la acción a realizar con el metodo.
   * get: Solo carga la lista con los filtros existentes |
   * search: forza al realizar una busqueda (depende de this.search_string) |
   * more: indica que se cargara la siguiente parte de la lista (usa this.GetOption('last'))
   */
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

  /**
   * Obtiene la lista de cursos o carreras
   * @param callback Funcion a realizar si se completa correctamente el metodo
   */
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

  /**
   * Evento disparado por el evento (changed-checkers) del subcomponente <users-normal-view>
   * @param c Son los usuarios marcados devueltos por el subcomponente
   */
  onChangeChecks(c) {

    //  Solo se puede checkear si la vista esta en normal.
    if (this.isView('normal')) {

      //  Se asigna lo que nos envia el evento a checkeds
      this.Checkeds = c;

      //  Cambiamos la Tab actual a selection (ver definicion de this.SELECTED_TAB)
      this.SELECTED_TAB = 'selection';

    } else {
      //  Si estamos en otra vista, quitamos los checkeds
      this.Checkeds = [];
    }
  }

  /** Gestiona el evento de aplicar las modificaciones masivas (ver definición de this.MasiveEditor) */
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

  /** Limpia los Ids guardados */
  public ClearSavedList() {
    this.SavedIds = [];
    this.SetOption( 'sids', '' );
  }
  /**
   * Guarda los Ids de Checkeds en el localStorage
   * @param flush Si es true limpia los Ids guardados previamente y guarda los nuevos,
   * si es false los agrega a la lista guardada.
   */
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
  /** Carga los Ids guardados en localStorage*/
  private GetSavedIds() {
    const ids = this.GetOption('sids').trim();
    if (ids.length > 0) {
      return ids.split(',').map(v => v * 1);
    } else {
      return [];
    }
  }

  /**
   * Hace la petición para descargar los usuarios marcados (Checkeds)
   * con el formato listo para Generar credenciales en Adobe Photoshop CC 2017
   */
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
   * Muestra la lista de usuarios guardados con this.SavedIds
   */
  public LoadSavedIds(event) {

    //  Si se presiona la tecla de control al cargarlos, se eliminan.
    if ( event.ctrlKey ) {
      this.ClearSavedList();

    } else {
      this.search_string = '';
      this.SetOption('last', 0);
      this.GetUsers('load-ids');

    }
  }

  /**
   * Gestiona el evento de ordenamiento
   * @param e Objeto {order: 'ASC|DESC', order_by: '...' } Enviado por el generador
   */
  Order(e) {
    this._Order = e.order;
    this._OrderBy = e.order_by;
    this.SetOption('order', e.order);
    this.SetOption('order_by', e.order_by);
    this.GetUsers();
  }

  /** Evento que se ejecuta al escribir en la caja de busqueda */
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

  /** Muestra un el texto del list-drop dentro de filtros para cambiar la vista */
  public ViewText() {
    let text = '';
    if (this.isView('normal')) {
      text = 'Normal';
    }
    if (this.isView('contacts')) {
      text = 'Contacto';
    }
    return text;
  }

  /**
   * Comprueba si una vista es la que actualmente se está mostrando
   * @param value El nombre de la vista que se va a comprobar
   */
  public isView(value) {
    return this.GetOption('listview') === value;
  }

  /**
   * Asigna una vista a la lista actual
   * @param value Nombre de la vista
   */
  public setView(value) {
    this.SetOption('listview', value);

    if (value !== 'normal') {
      this.Checkeds = [];
      this.Users.map(User => User.checked = 0);
    }
  }

  /**
   * Verifica si se puede imprimir la credencial de User segun this.CardOptions
   * @param User Usuario a comprobar
   */
  canPrint(User) {
    if (this.CardOptions.OnlyActive) {
      if (User.status !== 0) { return false; }
    }

    if ( !this.CardOptions.WithOutPhoto ) {
      if ( !(User.pid > 0) ) { return false; }
    }

    return true;
  }

  /** Cambia la propiedad OnlyActive de CardOptions y guarda la configuración */
  SetOnlyActive() {
    this.CardOptions.OnlyActive = !this.CardOptions.OnlyActive;
    this.SetOption('card.only-active', this.CardOptions.OnlyActive);
  }
  /** Cambia la propiedad WithOutPhoto de CardOptions y guarda la configuración */
  SetWithOutPhoto() {
    this.CardOptions.WithOutPhoto = !this.CardOptions.WithOutPhoto;
    this.SetOption('card.without-photo', this.CardOptions.WithOutPhoto);
  }

  /**
   * Shothand al metodo GetOption con el contexto actual
   * @param option Opcion a obtener
   * @param context Contexto de la opcion
   * @param def Valor por defecto en caso de que no se encuentre la opcion
   */
  public GetOption(option, context = 'users', def = false) {
    return this.C.GetOption(option, context, def);
  }
  /**
   * Shothand al metodo SetOption con el contexto actual
   * @param option Nombre de la opción
   * @param value Valor a guardar
   * @param context Contexto de la opcion (def: actual)
   */
  public SetOption(option, value, context = 'users') {
    this.C.SetOption(option, value, context);
  }
}
