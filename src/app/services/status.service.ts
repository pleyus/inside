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
  private loadingTimeOut;
  private loadingTick = 0;
  private loading = false;

  //  Alerts
  private alertTimeOut;

  //  properties
  public CurrentProgress = -1;
  public Icon = '';
  public Message = '';
  public Type = -1;
  public Buttons: Array<Button> = [];

  public get IsLoading() { return this.loading; }
  public get Showing() { return this.loading || this.Message.length > 0; }
  public get LoadingTimeOut() { return this.loadingTick > 10; }

  /**
   * Dispara el temporizador para quitar la alerta
   * @param time Tiempo en milisegundos que durará la alerta hasta eliminarse por si sola
   */
  private alertTiming(time) {

    //  Limpiamos el loading que puediera existir
    this.loading = false;
    this.CurrentProgress = -1;
    clearTimeout( this.loadingTimeOut );
    this.loadingTick = 0;
    this.Buttons = [];

    //  Si existe el timeout de alertTimeOut, lo reseteamos
    if (this.alertTimeOut !== undefined) {
      clearTimeout( this.alertTimeOut );
    }

    //  Si hay un tiempo establecido para quitar la alerta, entonces lo asignamos
    if (time > 0) {
      this.alertTimeOut = setTimeout( () => { this.ClearState(); }, time );
    }
  }

  /**
   * Muestra un mensaje de warning en $.State
   * @param message Texto que se mostrará en la alerta emergente
   * @param time Duración de la alerta en ms (def: 3000)
   */
  public ShowWarning(message, time = 2500) {
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
    this.Type = type;
    this.Icon = icon;
    this.Message = message;
    this.Buttons = buttons;
  }

  /**
   * Limpia las alertas mostradas
   */
  public ClearState() {
    this.Icon = '';
    this.Message = '';

    this.loading = false;
    clearTimeout( this.loadingTimeOut );
    this.loadingTick = 0;
    this.CurrentProgress = -1;

    this.Type = -1;
  }

  /**
   * Muestra la alerta de 'Cargando...'
   * @param message Mensaje para mostrar en el Loading... (def: 'Cargando...')
   * @param type Tipo de alerta (def: -1)
   */
  public ShowLoading(message = 'Cargando...', type = -1, progress = -1) {
    this.CurrentProgress = progress;
    this.Icon = 'icon-loading animate-spin';

    this.Message = message;
    this.Type = type;

    if (this.loadingTimeOut !== null) {
      clearInterval( this.loadingTimeOut );
      this.loadingTick = 0;
    }

    this.loading = true;
    this.loadingTimeOut = setInterval( () => {
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
        '&lpt=' + this.C.GetOption('lpt', 'payment', 0),
        (r) => {
          if (r.status === this.S.SUCCESS) {
            if (force) {
              this.News = r.data;
            } else {
              this.News.Applicants = r.data.Applicants;
              this.News.Feedbacks = r.data.Feedbacks;
              this.News.Messages = r.data.Messages;
              this.News.RadioMessages = r.data.RadioMessages;

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
