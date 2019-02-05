import { Component } from '@angular/core';
import { Tools, AppStatus, Configuration } from '../../app.service';
import { WebService } from '../../services/web-service';
import { Router } from '@angular/router';
import { AppComponent } from '../../app.component';


@Component({
  selector: 'app-list',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class FeedbackListComponent {

  Title = 'Feedback';
  Feeds = [];
  Feed =
  {
    id: 0,
    hide: 0,
    gannouncer: 0,
    comment: '',
    uid: 0,
    response: '',
    status: 0,
    rat: 0,
    user: {
      cid: 0,
      firstname: '',
      level: 0,
      course: '',
      lastname: '',
    },
    at: 0
  };
  LoadMore = true;

  public FeedbackHeading = '';
  private feedbackheadings = [
    '¿Tienes algun comentario para nosotros?',
    'Escribe un comentario',
    '¿Tienes algo que decirnos?',
    'Haz una retroalimentación de nuestro servicio'
  ];
  public LoadingFeeds: Boolean = false;
  public LoadingMore: Boolean = false;

  constructor(
    private W: WebService,
    public $: AppComponent,
    private RT: Router,
    public T: Tools,
    private C: Configuration,
    private S: AppStatus ) {
      this.SetOption('last', 0);
      //  Is logged
      if (this.$.Me.type >= 1) {
        this.FeedbackHeading = this.feedbackheadings[ this.T.Random(0, this.feedbackheadings.length) ];
        this.GetFeeds(  );

        // En caso de que se desee reportar algun bug
        if (this.GetOption('pre', 'users') !== '') {
          this.Feed.comment = this.GetOption('pre', 'users');
          this.Feed.hide = 0;
          this.SetOption('pre', '', 'users');
        }
    } else {
      this.S.ShowError('No tienes autorización para entrar en este modulo o tu sesión expiró', 0);
    }
  }

  public GetFeeds( making = 'get' ): void {
    //  Cargando
    this.S.ShowLoading('Cargando comentarios...');

    //  Hablamos con la API
    this.W.Web( 'feedback', 'list',

    //     Mandamos el ultimo que tenemos
    'last=' + this.GetOption('last'),

    // Cuando conteste
    (r): void => {
      if (!r.data) {
        r.data = [];
      }

      // Listo
      this.S.ClearState();

      // Revisamos que nos diga 1
      if (r.status === this.S.SUCCESS) {
        this.Feeds =
          making === 'more'
          ? this.Feeds.concat(r.data)
         : r.data;
      } else {
        this.S.ShowError( r.data, 0 );
      }

      // Mostramos u ocultamos el boton de mas
      this.LoadMore = r.data.length > 9;

      // Asignamos el ultimo comentario a la configuración
      this.SetOption('last', this.Feeds.length);
    });
  }
  public Load( id = 0 ): void {
    if (id < 1) {
      return;
    }

    this.S.ShowLoading('Cargando comentario...');

    // Hablamos con la API
    this.W.Web( 'feedback', 'get',

    // Mandamos el ultimo que tenemos
    'id=' + id,

    // Cuando conteste
    (r): void => {
      this.S.ClearState();

      // Revisamos que nos diga 1
      if (r.status === this.S.SUCCESS) {
        this.Feed = r.data;
        this.Feed.gannouncer = this.Feed.uid > 1 ? 0 : 1;
        this.SetOption('lfs', id);
      } else {
        this.S.ShowError(r.data, 0);
        this.Close();
      }

    },
    (e) => { this.S.ShowError('Se perdió la conexión', 0); });
  }
  private Save(): void {
    // Loading...
    this.S.ShowLoading('Enviando comentario...');

    // Sacamos una foto para que sea mas facil trabajar
    this.Feed.comment = this.Feed.comment.trim();

    // Checamos los campos requeridos
    if ( this.Feed.comment !== '' ) {

      // Hablamos con la api para que guarde data
      this.W.Web('feedback', 'save', 'data=' + JSON.stringify(this.Feed), (r) => {

        // Si contesta con 1
        if (r.status === this.S.SUCCESS) {
          this.Close();
          this.SetOption('last', 0);
          this.GetFeeds();

          // Mostramos el mensaje de guardado
          this.S.ShowSuccess('Se ha guardado correctamente');
        } else {
          this.S.ShowError(r.data, 0);
        }
      });
    } else {
      this.S.ShowWarning('Para enviarnos un <b>comentario</b> es necesario escribirlo ¿No?');
    }
  }
  private Respond(): void {
    // Loading...
    this.S.ShowLoading('Enviando respuesta...');

    // Sacamos una foto para que sea mas facil trabajar
    // let F = { id: this.Feed.id, response: this.Feed.response };

    // Checamos los campos requeridos
    if ( this.Feed.response !== '' ) {
      // Hablamos con la api para que guarde data
      this.W.Web('feedback', 'save', 'data=' + JSON.stringify( this.Feed ), (r) => {

        // Si contesta con 1
        if (r.status === this.S.SUCCESS) {
          this.Close();
          this.SetOption('last', 0);
          this.GetFeeds();

          // Mostramos el mensaje de guardado
          this.S.ShowSuccess('Se ha enviado tu respuesta');
        } else {
          this.S.ShowError(r.data);
        }
      });
    } else {
      this.S.ShowWarning('Es necesario escribir una respuesta');
    }
  }
  public Close(): void {
    this.Feed = {
      id: 0,
      hide: 0,
      gannouncer: 0,
      comment: '',
      uid: 0,
      response: '',
      status: 0,
      rat: 0,
      user: {
        cid: 0,
        course: '',
        level: 0,
        firstname: '',
        lastname: '',
      },
      at: 0
    };
  }

  public GetOption(option, context = 'feedback', def = false) {
    return this.C.GetOption(option, context, def);
  }
  public SetOption(option, value, context = 'feedback') {
    this.C.SetOption(option, value, context);
  }

}
