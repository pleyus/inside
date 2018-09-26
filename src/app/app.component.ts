// ng build --base-href=/inside/ --prod --build-optimizer

import { Component, OnInit } from '@angular/core';
import { WebService, AppStatus, Tools, Configuration } from './app.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  happy_birthday_song: HTMLAudioElement;
  public Me = {
    id : 0,
    type : 0,
    uid : 0,
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
  CHBMessage = 0;
  public VERSION = '3.6';

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
    public S: AppStatus,
    private T: Tools,
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
      this.S.ClearState();
    });
  }
  public loadUser( callback: (success) => void = s => {} ) {
    this.W.Web( 'users', 'get', 'id=0',
      (r) => {
        if (r.status === this.S.SUCCESS) {

          //  Si esta todo bien, cargamos los datos que obtuvimos.
          this.Me = r.data;

          //  Revisamos si es el hbd de alguien
          if ( this.T.HappyB(this.Me.birthday * 1000) ) {
            //  Para cargar los recursos que vamos a usar
            this.happy_birthday_song = new Audio('assets/happyb.mp3');
            const hbi = new Image(0, 0);
            hbi.src = 'assets/happyb.gif';
          }
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
    this.C.RequireOption('applicants', 'pre-fn', '');
    this.C.RequireOption('applicants', 'pre-ln', '');
    this.C.RequireOption('applicants', 'pre-ph', '');
    this.C.RequireOption('applicants', 'pre-em', '');
    this.C.RequireOption('applicants', 'pre-at', 0);
    this.C.RequireOption('applicants', 'pre-contact-id', 0);
    this.C.RequireOption('applicants', 'stats.view', 'register');
    this.C.RequireOption('applicants', 'stats.since', '');
    this.C.RequireOption('applicants', 'stats.until', '');

    this.C.RequireOption('main', 'version', '');
    this.C.RequireOption('radio', 'lmt', 0);
    this.C.RequireOption('feedback', 'lfs', 0);
    this.C.RequireOption('payment', 'lpt', 0);
    this.C.RequireOption('radio', 'selected.tab');
    this.C.RequireOption('categories', 'selected.tab');

    this.C.DisposeOption('feedback', 'last-feedback-seen'); // v3.5
    this.C.DisposeOption('radio', 'last-message-time');  // v3.5
    this.C.DisposeOption('applicants', 'current_view');  // v3.5
  }

  isActive(instruction: any[]): boolean {
    // Set the second parameter to true if you want to require an exact match.
    return this.R.isActive(this.R.createUrlTree(instruction), false);
  }

  HappyBirthdaySong() {
    this.happy_birthday_song = new Audio('assets/happyb.mp3');
    const HBMessages = [
      this.mSex(this.Me.sex, 'Ahora estas un año mas acian') + '... <br>Pero tienes un año mas de <b>experiencia.</b>',
      'Han pasado ' + Math.floor(((new Date().getTime() / 1000) - this.Me.birthday) / 86400) +
        ' dias desde que llegaste a este mundo... <br>¿Te hacemos prueba de carbono 14?',
      '¡Alguien se está poniendo pasita! :D <br>Una pasita con un año mas de experiencia en la vida',
      '<b>+1 vuelta al sol completada</b><br>Disfruta de este paseo por el cosmos porque solo se puede viajar una vez.',
      'Hace 65 millones de años habian dinosaurios en la Tierra...<br>Algun dia, ' + (this.Me.firstname.split(' ')[0]) + '´s del futuro' +
        ' dirán:<br> <i>«Hace 65 millones de años habian humanos en la Tierra»</i><br>... y tu tendras 65 millones de años :D'
    ];
    this.CHBMessage = this.CHBMessage >= HBMessages.length
      ? 0
      : this.CHBMessage;

    this.happy_birthday_song.play();
    this.S.ShowAlert(HBMessages[this.CHBMessage], 8, 15000);
    this.CHBMessage++;
  }
  mSex(sex, message, end = { male: 'o', female: 'a', undef: 'x'}) {
    if (sex === this.SEX_MALE) {
      return message + end.male;

    } else if (sex === this.SEX_FEMALE) {
      return message + end.female;
    } else if (sex === this.SEX_UNDEFINED) {
      return message + end.undef;
    }
  }
  isCodersDay(): boolean {
    const now = new Date();
    if ( this.T.leapYear( now.getFullYear() )) {
      return ( now.getMonth() === 8 && now.getDate() === 12 );
    }
    return ( now.getMonth() === 8 && now.getDate() === 13 );
  }
}
