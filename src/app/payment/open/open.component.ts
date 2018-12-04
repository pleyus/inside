import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AppComponent } from './../../app.component';
import { Tools, WebService, AppStatus, Configuration } from './../../app.service';

@Component({
  selector: 'app-open',
  templateUrl: './open.component.html',
  styleUrls: ['./open.component.css']
})
export class PaymentOpenComponent {
  public Pay = {
    id: 0,
    user: null,
    uid: 0,

    concept: '',
    amount: 0,
    charge: 0,

    cid: 0,
    collector: { firstname : '', lastname: '' },
    cat: 0,
    gid: 0,
    generator: { firstname : '', lastname: '' },
    at: 0,


    ref: '',
    payment: '',
    status: 0
  };
  public Id: any;
  private UID = 0;
  public ConceptList = [
    'Inscripción ',
    'Reinscripción ',
    'Constancia de Estudios ',
    'Credencial ',
    'Examen extraordinario ',
    'Mensualidad de ',
    'Abono a mensualidad de ',
    'Finiquito ',
    'Baja definitiva'
  ];


  check_pay = false;

  constructor(
    private W: WebService,
    public T: Tools,
    private R: ActivatedRoute,
    public $: AppComponent,
    private RT: Router,
    private S: AppStatus,
    private C: Configuration) {

      this.SetOption('view', 0);
      R.params.subscribe( params => {
        this.Id = params['id'] > 0 ? params['id'] : 0;
        this.UID = params['uid'] ? params['uid'] : 0;
        // Arranca!
        this.init();
      });
  }

  init() {
    // Verificamos que seamos admin
    if ( this.$.isAdmin() && this.$.CanDo('payment') ) {
      // Revisamos si se va a crear una ficha para determinado usuario
      if (this.UID > 0 && this.Id === 0) {
        this.W.Web('users', 'get', 'id=' + this.UID, (r) => {
          if (r.status === this.S.SUCCESS) {
            // PATCH: Para soportar el nuevo linker de la v3.2
            r.data.link_title = r.data.firstname + ' ' + r.data.lastname;
            r.data.link_subtitle = (r.data.cid > 0 ? r.data.course.name + ' ' + this.T.Romanize(r.data.level) : r.data.personal_phone );
            r.data.link_body = '';
            r.data.link_imgurl = r.data.picture.filename !== undefined ? r.data.picture.filename : r.data.image;

            this.Pay.user = r.data;
            this.Pay.uid = this.UID;
          } else {
            this.RT.navigate(['/payment/0']);
          }
        },
        (e) => { this.S.ShowError('Se perdió la conexión', 0); });
      }


      // Obtenemos datos del pago // Siempre y cuando se pida alguno
      this.getPayData();
    } else {
      this.RT.navigate(['/payment/']);
    }
  }

  /**
	 * Obtiene los datos del usuario y los mete en this.Pay
	 */
  private getPayData (): void {
    // Si es un id valido
    if ( this.Id > 0 ) {
      this.S.ShowLoading('Cargando datos del pago...');

      // Obtenemos el pago
      this.W.Web('payment', 'get', 'id=' + this.Id, (r) => {
        this.S.ClearState();

        // Si el status == OK
        if (r.status === this.S.SUCCESS) {
          // PATCH: Para soportar el nuevo linker de la v3.2
          r.data.user.link_title = r.data.user.firstname + ' ' + r.data.user.lastname;
          r.data.user.link_subtitle = (r.data.user.cid > 0 ?
            r.data.user.course.name + ' ' + this.T.Romanize(r.data.user.level)
            : r.data.user.personal_phone);
          r.data.user.link_body = '';
          r.data.user.link_imgurl = r.data.user.picture.filename !== undefined ? r.data.user.picture.filename : r.data.user.image;

          // Asignamos lo que viene en data
          this.Pay = r.data;
          this.Id = this.Pay.id;
          this.check_pay = this.Pay.cid > 1;
        } else {
          this.RT.navigate(['/payment/0']);
        }
      },
      (e) => { this.S.ShowError('Se perdió la conexión', 0); });
    }
  }

  public Save(): void {
    // Loading...
    this.S.ShowLoading(this.Id > 0 ? 'Actualizando pago...' : 'Guardando nuevo pago, espere...');

    // Solo podremos guardar si viene el uid
    if (this.Pay.uid > 1 && this.Pay.concept.trim() !== '') {
      // Generamos la referencia si es que no se ha creado
      this.Pay.ref = this.Pay.ref !== '' ? this.Pay.ref : this.GetReference();

      // Checamos que se haya marcado o no como pagado
      this.Pay.cid = this.Pay.cid > 0 ? this.Pay.cid : (this.check_pay ? -1 : 0);

      // Hablamos con la api para que guarde data
      this.W.Web('payment', 'save', 'data=' + JSON.stringify(this.Pay), (r) => {

        // Si contesta con 1
        if (r.status === this.S.SUCCESS) {
          // Mostramos el mensaje de guardado
          this.S.ShowSuccess('Datos guardados' + (this.Id < 1 ? '... Espera un momento' : ''), 2000);

          // Esperamos un rato para redirigir
          setTimeout(() => {
            // Si el id devuelto es > 0, cargamos el pago recien creado... si no, volvemos a la lista
            this.RT.navigate(['/payment' + (r.data.id > 0 ? '/' + r.data.id : '')]);
          }, 1000);

        } else {
          this.S.ShowError(r.data, 0);
        }
      },
      (e) => { this.S.ShowError('Se perdió la conexión', 0); });
    } else {
      this.S.ShowWarning('No se puede crear la ficha, hay campos que son requeridos.', 0);
    }
  }
  private Delete(): void {
    if (this.Id > 0) {
      if ( confirm('Esta a punto de eliminar esta ficha de pago. ¿Desea continuar?') ) {
        // Loading...
        this.S.ShowLoading('Eliminando pago ' + this.Pay.concept + '...');

        // Hablamos con la api para que "borre" al id
        this.W.Web('payment', 'delete', 'id=' + this.Pay.id,
        (r) => {

          // Si contesta con 1
          if (r.status === this.S.SUCCESS) {
            // Redireccionamos a aplicantes
            this.RT.navigate(['/payment']);
          } else {
            this.S.ShowError(r.data, 0);
          }
        },
        (e) => { this.S.ShowError('Se perdió la conexión', 0); });
      }
    }
  }
  public CreateUser(num) {
    // Aspirante
    if (num === 0) {
      this.SetOption('goto', '/payment/0/');
      this.RT.navigate(['/applicants/open/0']);
    }

    // Usuario normal
    if (num === 1) {
      this.SetOption('goto', '/payment/0/');
      this.RT.navigate(['/users/0']);
    }
  }

  UserSelected(item) {
    this.Pay.user = item !== null ? item : null;
    this.Pay.uid = item !== null ? item.id : 0;
  }
  private GoBack(): void  {
    this.RT.navigate(['/Pays']);
  }
  protected GetReference(): string {
    /*
		 * Ejemplo:
		 *      BASE:    			      REF
		 * 		  Condensed User Id: 	0AV
		 *      lastnameA:		    	FE
		 *      lastnameB:			    P
		 *      firstname:			    H
		 *      RandStr4:			      XYZ
		 *
		 * 		REF0AVFEPHVWXYZ
		 */

    // Partimos el nombre completo en cachitos
    const sname = this.T.SepareName(this.Pay.user.firstname + ' ' + this.Pay.user.lastname);

    // Base REF
    const Ref = 'REF' +
      this.T.Base36( this.Pay.user.id ).padStart(3, '0') +
      sname[1].substr(0, 2).toUpperCase() +
      sname[2].substr(0, 1).toUpperCase() +
      sname[0].substr(0, 1).toUpperCase() +
      this.T.RandString(5);
    return Ref.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  public GetOption(option, context = 'payment', def = false) {
    return this.C.GetOption(option, context, def);
  }
  public SetOption(option, value, context = 'payment') {
    this.C.SetOption(option, value, context);
  }
}
