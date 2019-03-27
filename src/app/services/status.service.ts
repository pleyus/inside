import { Injectable } from '@angular/core';
import { Button } from '../core/class/button';
import { WebService } from '../services/web-service';
import { Configuration } from '../app.service';
import { NewsAdapter } from '../core/class/news';

@Injectable( {providedIn: 'root'} )
export class StatusService {

  //  Statuses
  public readonly ERROR = 0;
  public readonly SUCCESS = 1;
  public readonly WARNING = 2;
  public readonly UNKNOW = 3;
  public readonly PROGRESS = 4;
  public readonly QUESTION = 5;

  //  Loading
  private loadingTick = 0;

  //  Alerts
  public PromptCallback = null;
  PromptPlaceholder = '';

  //  properties
  private timing;
  making = '';
  public CurrentProgress = -1;
  public Input = '';
  public Icon = '';
  public Message = '';
  public Type = -1;
  public Buttons: Array<Button> = [];

  public get IsLoading() { return this.making === 'loading'; }
  public get IsPrompting() { return this.making === 'prompt'; }
  public get Showing() { return this.making !== ''; }
  public get LoadingTimeOut() { return this.loadingTick > 10; }

  public KeyEvent(e) {
    if (e.keyCode === 27) {
      if (this.PromptCallback !== null ) {
        this.PromptCallback(false, this.Input);
      }
    } else if (e.keyCode === 13) {
      if (this.PromptCallback !== null ) {
        this.PromptCallback(true, this.Input);
      }
      this.Clear();
    }
  }

  /**
   * Dispara el temporizador para quitar la alerta
   * @param time Tiempo en milisegundos que durará la alerta hasta eliminarse por si sola
   */
  private alertTiming(time) {
    this.making = 'alert';

    //  Si hay un tiempo establecido para quitar la alerta, entonces lo asignamos
    if (time > 0) {
      this.timing = setTimeout( () => { this.Clear(); }, time );
    }
  }

  /**
   * Muestra un mensaje de warning en $.State
   * @param message Texto que se mostrará en la alerta emergente
   * @param time Duración de la alerta en ms (def: 3000)
   */
  public ShowWarning(message, time = 2500) {
    this.Clear();
    this.Icon = 'icon-attention';
    this.Message = message;
    this.Type = this.WARNING;

    this.alertTiming(time);
  }
  /**
   * Muestra un mensaje de error en $.State
   * @param message Texto que se mostrará en la alerta emergente
   * @param time Duración de la alerta en ms (def: 3000)
   */
  public ShowError(message, time = 2500) {
    this.Clear();
    this.Icon = 'icon-close';
    this.Message = message;
    this.Type = this.ERROR;

    this.alertTiming(time);
  }
  /**
   * Muestra un mensaje de exito en $.State
   * @param message Texto que se mostrará en la alerta emergente
   * @param time Duración de la alerta en ms (def: 3000)
   */
  public ShowSuccess(message, time = 2500) {
    this.Clear();
    this.Icon = 'icon-ok';
    this.Message = message;
    this.Type = this.SUCCESS;

    this.alertTiming(time);
  }

  /**
   * Muestra una alerta, dependiendo del tipo muestra de uno u otro color
   * @param message Mensaje para mostrar
   * @param type Tipo de alerta (0 > Success) (1 > Error) (2 > Warning)
   * @param time Tiempo de la alerta en ms (def: 3000ms)
   */
  public ShowAlert(message, type = this.SUCCESS, time = 2500) {
    this.Clear();

    this.Type = type;

    if (this.Type === this.SUCCESS) {
      this.ShowSuccess(message, time);
    } else if (this.Type === this.ERROR) {
      this.ShowError(message, time);
    } else if (this.Type === this.WARNING) {
      this.ShowWarning(message, time);
    } else {
      this.Icon = 'icon-attention-alt';
      this.Message = message;
      this.Type = -1;

      this.alertTiming(time);
    }
  }

  public ShowDialog(message: string, buttons: Array<Button> = [], type = -1, icon: string = 'icon-attention-alt') {
    this.Clear();
    this.making = 'dialog';
    this.Type = type;
    this.Icon = icon;
    this.Message = message;
    this.Buttons = buttons;
  }

  public ShowPrompt(
    message: string,
    actions: any,
    defaultInput: string = '',
    placeholder = 'Escribe tu respuesta',
    type = -1,
    icon: string = 'icon-comment') {

    this.Clear();
    this.making = 'prompt';

    this.Input = defaultInput;
    this.Message = message;
    this.Type = type;
    this.Icon = icon;
    this.PromptPlaceholder = placeholder;

    if ( actions[0] instanceof Button ) {
      this.PromptCallback = null;
      this.Buttons = actions;
    } else {
      this.PromptCallback = actions;
      this.Buttons = [];
    }
  }

  /**
   * Limpia las alertas mostradas
   */
  public Clear(PostAction = false) {
    if (PostAction) {
      this.PromptCallback(true, this.Input);
    }

    //  Del prompt
    this.Input = '';
    this.PromptCallback = null;
    this.PromptPlaceholder = '';

    //  De loading
    clearTimeout( this.timing );
    this.loadingTick = 0;
    this.CurrentProgress = -1;

    this.Buttons = [];
    this.Icon = '';
    this.Message = '';
    this.Type = -1;

    this.making = '';
  }

  /**
   * Muestra la alerta de 'Cargando...'
   * @param message Mensaje para mostrar en el Loading... (def: 'Cargando...')
   * @param type Tipo de alerta (def: -1)
   */
  public ShowLoading(message = 'Cargando...', type = -1, progress = -1) {
    this.Clear();
    this.making = 'loading';
    this.CurrentProgress = progress;
    this.Icon = 'icon-loading animate-spin';

    this.Message = message;
    this.Type = type;

    this.timing = setInterval( () => {
      this.loadingTick++;
    }, 1000);
  }
}
@Injectable({
  providedIn: 'root'
})
export class InsideListenerService {

  HeartBeat = 0;
  public News = new NewsAdapter();

  public TrackingApplicantId = 0;

  constructor( private W: WebService, private C: Configuration, private S: StatusService ) {
    //  Cargamos el primer status
    this.Alive(null);
    this.UpdateNews();

    //  Ponemos un intervalo que obtenga el status cada 5s
    setInterval( () => { this.UpdateNews(); }, 5000);
  }

  public Alive(e) {
    this.HeartBeat = new Date().getTime();
  }

  public UpdateNews(force = false, callback: (r) => void = (r) => {}) {
    // Vemos si el usuario sigue con vida Checando que no tenga mas de 10s sin mover el inside
    if ( new Date().getTime() < this.HeartBeat + 1000 || force ) {
      this.W.Web('general', 'get-counters',

        'lmt=' + this.C.GetOption('lmt', 'radio', 0) +
        '&lfs=' + this.C.GetOption('lfs', 'feedback', 0) +
        '&lpt=' + this.C.GetOption('lpt', 'payment', 0) +
        '&tai=' + this.TrackingApplicantId,

        (r) => {
          if (r.status === this.S.SUCCESS) {
            if (force) {
              this.News = r.data;
            } else {
              this.News.Applicants = r.data.Applicants;
              this.News.Feedbacks = r.data.Feedbacks;
              this.News.Messages = r.data.Messages;
              this.News.RadioMessages = r.data.RadioMessages;
              this.News.LoggedIn = r.data.LoggedIn;
              this.News.ApplicantsTracking = r.data.ApplicantsTracking;
              this.News.Config = r.data.Config;

              if (this.News.Polls.length !== r.data.Polls.length) {
                this.News.Polls = r.data.Polls;
              }

              if (this.News.Birthdays.length !== r.data.Birthdays.length) {
                this.News.Birthdays = r.data.Birthdays;
              }
            }
          }
          callback(r.data);
        }
      );
    }
  }
}
