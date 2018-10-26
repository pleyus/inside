import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AppComponent } from 'src/app/app.component';
import { Tools } from 'src/app/app.service';

@Component({
  selector: 'app-happy-birthday',
  templateUrl: './happy-birthday.component.html',
  styleUrls: ['./happy-birthday.component.css']
})
export class HappyBirthdayComponent {
  public Show = false;
  public ShowingCanvas = false;

  public UserObject = { firstname: '', lastname: '', birthday: 0, sex: 0 };

  happy_birthday_song: HTMLAudioElement;
  CHBMessage = 0;
  Message = '';

  @Output() ChangedUser = new EventEmitter();
  @Input('User') get User() {
    return this.UserObject;
  }
  set User(val) {
    this.UserObject = val;
    this.UserChange();
  }

  private UserChange( ) {
    this.Show = this.UserObject.birthday !== 0
      ? this.T.HappyB(this.UserObject.birthday * 1000)
      : false;

    //  Si se va a mostrar el hbd, cargamos la musica
    if ( this.Show ) {
      this.happy_birthday_song = new Audio('assets/happyb.mp3');
    }
    this.ChangedUser.emit(this.UserObject);
  }

  constructor(public $: AppComponent, public T: Tools) { }

  public ShowThis() {
    //  Cargamos la canción
    this.happy_birthday_song = new Audio('assets/happyb.mp3');

    //  Preparamos los mensajes a mostrar
    const HBMessages = [
      '<b>+1 vuelta al sol completada</b><br>Disfruta de este paseo por el cosmos porque solo se puede viajar una vez.',
      'Hace 65 millones de años habian dinosaurios en la Tierra...<br>Algun dia, ' +
        (this.UserObject.firstname.split(' ')[0]) + '´s del futuro' +
        ' dirán:<br> <i>«Hace 65 millones de años habian humanos en la Tierra»</i><br>... y tu tendras 65 millones de años :D',
      'Han pasado ' + Math.floor(((new Date().getTime() / 1000) - this.UserObject.birthday) / 86400) +
        ' dias desde que llegaste a este mundo... <br>¿Te hacemos prueba de carbono 14?',
      this.mSex(this.UserObject.sex, 'Ahora estas un año mas acian') + '... <br>Pero tienes un año mas de <b>experiencia.</b>',
      '¡Alguien se está poniendo pasita! :D <br>Una pasita con un año mas de experiencia en la vida'
    ];

    //  Revisamos el indice del mensaje que se va a mostrar
    this.CHBMessage = this.CHBMessage >= HBMessages.length
      ? 0
      : this.CHBMessage;

    //  cargamos el mensaje
    this.Message = HBMessages[this.CHBMessage];

    //  Subimos el indice del mensaje
    this.CHBMessage++;

    //  Tocamos la musica
    this.happy_birthday_song.play();

    //  Mostramos el canvas
    this.ShowingCanvas = true;
  }
  public HideThis() {
    this.ShowingCanvas = false;
    this.happy_birthday_song.pause();
    this.happy_birthday_song = null;
  }

  mSex(sex, message, end = { male: 'o', female: 'a', undef: 'x'}) {
    if (sex === this.$.SEX_MALE) {
      return message + end.male;

    } else if (sex === this.$.SEX_FEMALE) {
      return message + end.female;
    } else if (sex === this.$.SEX_UNDEFINED) {
      return message + end.undef;
    }
  }
}
