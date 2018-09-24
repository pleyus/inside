import { Component } from '@angular/core';
import { AppStatus, WebService, Tools } from '../../app.service';
import { AppComponent } from '../../app.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  public Username = '';
  public Password = '';
  public ShowPass = false;

  public Placeholder = '';
  private placeholders = ['4831234567', 'elaguila94', 'correo@ejemplo.com', '5551234567', 'miusuario'];
  private interval = null;

  public LoginMessage = '';
  private loginmessages = [
    'Necesito saber quien eres, inicia sesión por favor :D',
    'Se requiere inicio de sesión para entrar a Inside.',
    'Ingresa tu usuario y contraseña para entrar a este modulo.',
    'Introduce tu usuario y contraseña para continuar'
  ];

  private errorCurrent = 0;
  private errorResponse = [
    'Mmm... Tus datos no coinciden',
    'Algo anda mal, verifica tus datos.',
    'No conosco a nadie con esos datos',
    'Revisa tus datos, algo no esta bien',
    'Datos incorrectos'
  ];
  private successResponse = [
    '¡Bien! Espera un momento...',
    'Listo, ahora se quien eres.',
    '(¡Bip!) Acceso correcto',
    '¡Bienvenido eze!',
    '¡Datos correctos! :D'
  ];
  public Loading = false;
  public ResponseMessage = {
    loginCorrect: 0, //  0: aun no  1: Correcto  2: Error
    loginMessage: ''
  };

  constructor(
    private S: AppStatus,
    private W: WebService,
    public $: AppComponent,
    private T: Tools,
    private R: Router
  ) {
    this.init();
  }
  private setPlaceholder() {
    const rand = this.T.Random(0, this.placeholders.length);
    this.Placeholder = this.placeholders[ rand ];
  }

  private init() {
    this.setPlaceholder();

    if (this.interval !== null) {
      clearInterval( this.interval );
    }

    this.interval = setInterval(() => { this.setPlaceholder(); }, 3000);
    this.LoginMessage = this.loginmessages[ this.T.Random( 0, this.loginmessages.length ) ];
  }

  public Login() {

    //  Si se esta cargando, terminamos
    if (this.Loading) {
      return;
    }

    //  Cargando...
    this.Loading = true;

    //  Platicamos con la api
    console.log('Logining...');
    this.W.Post('https://unitam.edu.mx/plataforma/login/index.php?inside=1',
      'username=' + this.Username +
      '&password=' + this.Password +
      '&anchor',
      r => {
        this.Loading = false;
          //  Mostramos un mensaje en lo que termina de cargar todo...
          this.ResponseMessage = {
            loginCorrect: 1,
            loginMessage: this.successResponse[ this.T.Random(0, this.successResponse.length) ]
          };

          //  Checamos si se carga el usuario correctamente
          this.$.loadUser( );
      });
  }

}
