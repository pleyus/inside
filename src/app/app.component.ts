// ng build --base-href=/inside/ --prod --build-optimizer

import { Component, OnInit } from '@angular/core';
import { Tools, Configuration } from './app.service';
import { WebService } from './services/web-service';
import { Router } from '@angular/router';
import { StatusService, InsideListenerService } from './services/status.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  public Me = {
    id : 0,
    type : 0,
    uid : 0,
    username: '',
    announcerOf: 0,
    status : 0,
    birthday: 0,
    pid: 0,
    firstname: '',
    lastname: '',
    email: '',
    personal_phone: '',
    tutor_phone: '',
    address: '',
    sex: 0,
    picture: { filename: '' },
    image: '',
    radio: [],
    platform: null,
    location: {
      asentamiento: '',
      municipio: '',
      estado: ''
    },
    capabilities: {
      payment: 0,
      applicants: 0,
      courses: 0,
      vias: 0,
      campaigns: 0,
      institutions: 0,
      radio: 0,
      docs: 1,
      user: 0
    }
  };
  public VERSION = '3.9.0';

  /**
   * Define las urls dinamicas que pueden ser utilizadas con las SelectedTabs dentro de los componentes
   */
  public ST = {
    radio: '',
    categories: ''
  };

  /**
   * Define los temporizadores o actualizadores que actuan en el sitio
   */
  public Updaters = {
    radioMessages: null
  };

  //#region Constantes
  public readonly ACTIVE = 0;

  public readonly REG_BANNED = 1; public readonly IN_BREAK = 1;
  public readonly DELETED = 2; 	public readonly DROPPED = 2;

  public readonly IS_GRADUATED = 3;
  public readonly IS_APPLICANT = 4;

  public readonly UNPAID = 0;
  public readonly PAID = 1;

  public readonly SEX_UNDEFINED = 0;
  public readonly SEX_FEMALE = 1;
  public readonly SEX_MALE = 2;

  public readonly T_QUEST = 0;
  public readonly T_LOGGED = 1;
  public readonly T_STUDENT = 2;
  public readonly T_TEACHER = 3;
  public readonly T_ADMIN = 4;

  public readonly T_VIA = 0;
  public readonly T_CAMPAIGN = 1;
  public readonly T_COURSE = 2;
  //#endregion

  public Loading = true;



  //#region Privilegios y permisos
    /**
     * Verifica si se tienen privilegios de acceso a un modulo especifico
     * @param module Modulo al que se quiere comprabar si se tiene permiso
     * @param user El objeto de usuario (este debe contener la propiedad «capabilities»),
     * si no se asigna, se interpreta como el usuario actual
     */
    public CanDo( module, user = null ) {
      return (user === null ? this.Me : user ).capabilities[module] === 1;
    }
    /**
     * Verifica si el usuario dado es administrador
     * @param user El objeto de usuario (este debe contener la propiedad «type»), si no se asigna, se interpreta como el usuario actual
     */
    public isAdmin( user = null ) {
      return this.T_ADMIN === (user == null ? this.Me.type : user.type);
    }
    /**
     * Verifica si el usuario dado es estudiante
     * @param user El objeto de usuario (este debe contener la propiedad «type»), si no se asigna, se interpreta como el usuario actual
     */
    public isStudent( user = null ) {
      return this.T_STUDENT === (user == null ? this.Me.type : user.type);
    }
    /**
     * Verifica si el usuario dado es maestro
     * @param user El objeto de usuario (este debe contener la propiedad «type»), si no se asigna, se interpreta como el usuario actual
     */
    public isTeacher( user = null ) {
      return this.T_TEACHER === (user == null ? this.Me.type : user.type);
    }


  constructor(
    private W: WebService,
    private R: Router,
    public S: StatusService,
    public L: InsideListenerService,
    private C: Configuration ) { }
  public Now() { return new Date(); }

  public ngOnInit( ) {
    //  Mostramos el loading...
    this.S.ShowLoading('Iniciando Inside v' + this.VERSION + ' espere...');

    //  Configuración necesaria
    this.defaultConfig();

    //  SelectedTabs
    this.ST.radio = localStorage.getItem('radio.selected.tab') + '',
    this.ST.categories = localStorage.getItem('categories.selected.tab') + '';

    this.ST.radio = this.ST.radio.length > 2 ? this.ST.radio.substr(2) : 'messages';
    this.ST.categories = this.ST.categories.length > 2 ? this.ST.categories.substr(2) : 'courses';

    //  Obtenemos el usuario actual mediante login
    this.loadUser( success => {
      this.Loading = false;
      this.S.ClearState();
    });
  }
  public loadUser( callback: (success) => void = s => {} ) {
    this.W.Web( 'users', 'get', 'id=0',
      (r) => {
        if (r.status === this.S.SUCCESS) {

          //  Si esta todo bien, cargamos los datos que obtuvimos.
          this.Me = r.data;
        }
        //  else {
        //   location.href = 'https://unitam.edu.mx/plataforma/logger.php?url=/inside/';
        // }

        callback(r.status === this.S.SUCCESS);
      },
      (e) => {
        this.S.ShowError('No se pudo conectar al servidor, intente de nuevo en un momento.');
      }
    );
  }
  defaultConfig() {
    this.C.RequireOption('payment', 'search', '');
    this.C.RequireOption('payment', 'last', 0);
    this.C.RequireOption('payment', 'filter_status', -1);
    this.C.RequireOption('payment', 'order', 'desc');
    this.C.RequireOption('payment', 'order_by', 'p.id');
    this.C.RequireOption('payment', 'view', 0);

    this.C.RequireOption('feedback', 'search', '');
    this.C.RequireOption('feedback', 'last', 0);
    this.C.RequireOption('feedback', 'pre', '');

    this.C.RequireOption('users', 'search', '');
    this.C.RequireOption('users', 'last', 0);
    this.C.RequireOption('users', 'sids', ''); // 3.5.2
    this.C.RequireOption('users', 'goto', '');
    this.C.RequireOption('users', 'listview', 'normal');
    this.C.RequireOption('users', 'order', 'desc');
    this.C.RequireOption('users', 'order_by', 'u.idnumber');
    this.C.RequireOption('users', 'selected_tab', 'personal');
    this.C.RequireOption('users', 'card.only-active', true);
    this.C.RequireOption('users', 'card.card.without-photo', false);
    this.C.DisposeOption('users', 'filter');

    this.C.RequireOption('applicants', 'search', '');
    this.C.RequireOption('applicants', 'last', 0);
    this.C.RequireOption('applicants', 'filter_type', '');
    this.C.RequireOption('applicants', 'order', 'desc');
    this.C.RequireOption('applicants', 'order_by', 'a.at');
    this.C.RequireOption('applicants', 'goto', '');
    this.C.RequireOption('applicants', 'period', '');
    this.C.RequireOption('applicants', 'selected_admin', 0);
    this.C.RequireOption('applicants', 'pre-fn', '');
    this.C.RequireOption('applicants', 'pre-ln', '');
    this.C.RequireOption('applicants', 'pre-ph', '');
    this.C.RequireOption('applicants', 'pre-em', '');
    this.C.RequireOption('applicants', 'pre-at', 0);
    this.C.RequireOption('applicants', 'pre-contact-id', 0);
    this.C.RequireOption('applicants', 'stats.view', 'register');
    this.C.RequireOption('applicants', 'stats.since', '');
    this.C.RequireOption('applicants', 'stats.until', '');

    this.C.RequireOption('radio', 'announcers-list.last', 0);
    this.C.RequireOption('radio', 'announcers-list.filter', '');
    this.C.RequireOption('radio', 'lmt', 0);
    this.C.RequireOption('radio', 'selected.tab');

    this.C.RequireOption('main', 'version', '');
    this.C.RequireOption('feedback', 'lfs', 0);
    this.C.RequireOption('payment', 'lpt', 0);
    this.C.RequireOption('categories', 'selected.tab');
  }

  isActive(instruction: any[]): boolean {
    // Set the second parameter to true if you want to require an exact match.
    return this.R.isActive(this.R.createUrlTree(instruction), false);
  }

  TodayIs(Day: number, Month: number): boolean {
    const now = new Date();
    return ( now.getMonth() === Day && now.getDate() === Day );
  }
}
