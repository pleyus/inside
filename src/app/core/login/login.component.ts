import { Component } from '@angular/core';
import { Tools } from '../../app.service';
import { WebService } from '../../services/web-service';
import { AppComponent } from '../../app.component';
import { InsideListenerService } from 'src/app/services/status.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  public Username = '';
  public Password = '';
  public ShowPass = false;

  public LOGIN_TEXT = 'Ingresa tus credenciales para entrar al modulo';

  public Placeholder = '';
  private placeholders = ['4831234567', 'elaguila94', 'correo@ejemplo.com', '5551234567', 'miusuario'];
  private interval = null;

  public Loading = false;
  public ResponseMessage = {
    loginCorrect: 0, //  0: aun no  1: Correcto  2: Error
    loginMessage: ''
  };

  constructor(
    private W: WebService,
    public $: AppComponent,
    private T: Tools,
    private L: InsideListenerService
  ) {
    this.LOGIN_TEXT = this.Expired()
      ? 'Tu sesión expiró, vuelve a iniciarla para continuar'
      : 'Ingresa tus credenciales para entrar al modulo';

    this.init();
  }
  private setPlaceholder() {
    const rand = this.T.Random(0, this.placeholders.length);
    this.Placeholder = this.placeholders[ rand ];
  }

  private init() {
    this.Username = this.$.Me.username;
    this.setPlaceholder();

    if (this.interval !== null) {
      clearInterval( this.interval );
    }

    this.interval = setInterval(() => { this.setPlaceholder(); }, 3000);
  }

  public Login() {
    //  Si se esta cargando, terminamos
    if (this.Loading) {
      return;
    }

    if (this.Username.trim() === '') {
      this.ResponseMessage = {
        loginCorrect: 2,
        loginMessage: 'El nombre de usuario es obligatorio'
      };
      return;
    }

    if (this.Password.trim() === '') {
      this.ResponseMessage = {
        loginCorrect: 2,
        loginMessage: 'Falta tu contraseña'
      };
      return;
    }

    this.ResponseMessage = {
      loginCorrect: -1,
      loginMessage: ''
    };

    //  Cargando...
    this.Loading = true;

    //  Platicamos con la api
    this.W.Post('https://unitam.edu.mx/plataforma/login/index.php?inside=1',
      'username=' + this.Username +
      '&password=' + this.Password +
      '&anchor',
      (r) => this.check_loggin(),
      (r) => this.check_loggin());
  }
  private check_loggin() {
    //  Checamos si se carga el usuario correctamente
    this.$.loadUser( (s) => {
      this.Loading = false;
      if (s) {

        //  Mostramos un mensaje en lo que termina de cargar todo...
        this.ResponseMessage = {
          loginCorrect: 1,
          loginMessage: 'Sesión iniciada, espera...'
        };

        setTimeout(() =>  {
          this.L.UpdateNews(true);
        }, 1000);
      } else {

        this.ResponseMessage = {
          loginCorrect: 2,
          loginMessage: 'Usuario y/o contraseña incorrectos'
        };

      }
    });
  }
  public Expired(): boolean {
    return this.$.Me.id > 0 && !this.L.News.LoggedIn;
  }
}
