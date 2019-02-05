import { Component } from '@angular/core';
import { AppComponent } from '../../../app.component';
import { Tools, AppStatus, Configuration } from '../../../app.service';
import { WebService } from '../../../services/web-service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-radio-guide-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class RadioGuideEditorComponent {

  Dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado' ];
  Horas = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
  Minutos = [0, 10, 20, 30, 40, 50];

  search_timer = null;
  announcers_searching = false;
  announcer_search = '';
  announcers_found = [];


  Id = 0;
  Guide = {
    name: '',
    summary: '',
    status: 0,
    days: [],
    announcers: [],
    img: ''
  };
  Transmision = {
    day: 0,
    start: {
      h: 7,
      m: 0
    },
    end: {
      h: 8,
      m: 0
    }
  };

  GetGuide() {
    if (this.Id < 1) {
      return;
    } else {
      this.S.ShowLoading('Cargando programa...');

      // Hablamos con la API
      this.W.Web( 'radio', 'get-guide',

      // Id
      'id=' + this.Id,

      // Cuando conteste
      (r): void => {
        this.S.ClearState();
        // Revisamos que nos diga 1
        if (r.status === 1) {
          this.Guide = r.data;
        } else { // Si no, mostramos el mensaje
          this.R.navigate(['/radio/']);
        }
      });
    }
  }
  AddTime(T) {
    this.Guide.days.push(
      {
        day: T.day,
        start: {
          h: T.start.h,
          m: T.start.m
        },
        end: {
          h: T.end.h,
          m: T.end.m
        }
      }
    );
  }


  AddAnnouncer(H, i = null) {
    this.Guide.announcers.push(H);
    if (i != null) {
      this.announcers_found.splice(i, 1);
    }
  }

  RemoveTime(i) {
    this.Guide.days.splice(i, 1);
  }
  RemoveAnnouncer(i) {
    this.Guide.announcers.splice(i, 1);
    if ( this.announcer_search !== '' ) {
      this.Search();
    }
  }
  RemoveImg()	{
    if (!confirm('Esta a punto de quitar la imagen actual del programa. ¿Continuar?')) {
      return;
    }

    this.W.Web('radio', 'remove-img', 'id=' + this.Id, (r) => {
      // Si todo salio bien, de lujo
      if (r.status === this.S.SUCCESS) {
        this.S.ShowSuccess( 'Se ha borrado la imagen', 2000 );
        this.Guide.img = '';
      } else {
        this.S.ShowError(r.data, 0);
      }
    },
    (e) => { this.S.ShowError('Se perdió la conexión', 0); });
  }

  Save() {
    this.S.ShowLoading('Guardando ' + this.Guide.name);

    // Hablamos con la API
    this.W.Web( 'radio', 'save-guide',

    // Id
    'data=' + JSON.stringify(this.Guide),


    // Cuando conteste
    (r): void => {
      this.S.ClearState();
      this.S.ShowAlert(r.data, r.status);
      if ( !(this.Id > 0) && r.status === 1 ) {
        setTimeout(() => { this.R.navigate(['/radio/guide']); }, 2000);
      }
    });
  }

  Remove() {
    if (this.Id < 1) {
      return;
    }

    if (confirm('Esta a punto de eliminar toda la información de –' + this.Guide.name + '– ¿Continuar?')) {
      this.S.ShowLoading('Eliminando programa. Espere...');
      // Hablamos con la API
      this.W.Web( 'radio', 'remove-guide',

      // Id
      'id=' + this.Id,


      // Cuando conteste
      (r): void => {
        this.S.ClearState();
        this.S.ShowAlert(r.data, r.status);
        if (r.status === 1) {
          setTimeout(() => { this.R.navigate(['/radio/guide']); }, 2000);
        }
      });
    }
  }


  public SelectImage(e) {
    // Si se ha seleccionado un archivo
    if (e.target.files.length && this.Id > 0) {
      // Empecemos...
      const file = e.target.files[0];
      this.S.ShowLoading('Subiendo archivo ' + file.name + '...');
      // Checamos que pese lo correcto

      if ( file.size > 3072000 ) {
        this.S.ShowError('El archivo es mas grande lo permitido');
      } else {
        // Preparamos el lector de archivos
        const	reader = new FileReader();

        // Le pegamos el evento...
        reader.onload = () => {
          // Preparamos el envio
          const data = {
            content: reader.result,
            name:  file.name
          };

          // Lo enviamos...
          this.W.Web('radio', 'upload', 'id=' + this.Id + '&data=' + JSON.stringify(data), (r) => {
            // Si todo salio bien, de lujo
            if (r.status === this.S.SUCCESS) {
              this.S.ShowSuccess( 'Se ha subido la imagen', 2000 );
              this.Guide.img = r.data;
            } else {
              this.S.ShowError(r.data, 0);
            }
          },
          () => { this.S.ShowError('Se perdió la conexión', 0); });
        };

        reader.readAsDataURL(file);
      }
    }

  }

  Search() {
    // Guardamos el ultimo elemento buscado
    this.announcers_searching = true;

    // Limpiamos el timer para evitar que cargue mas de la cuenta
    if (this.search_timer !== null) {
      clearTimeout(this.search_timer);
    }

    // Si se vació la busqueda, entonces se quitan los announcers
    if (this.announcer_search === '') {
      this.announcers_found = [];
      this.announcers_searching = false;
    } else {
      // Si no, se prepara un timer de atraso de busqueda
      this.search_timer = setTimeout(() => {
        // Buscando...
        this.S.ShowLoading('Buscando...');

        // Para excluir los existentes
        let exclude = '';
        for (let i = 0; i < this.Guide.announcers.length; i++) {
          exclude += this.Guide.announcers[i].id + ';';
        }

        // Platicamos con la api
        this.W.Web('radio',
          'list-announcers',
          's=' + this.announcer_search +
          '&exclude=' + exclude,
        (r) => {
          // Limpiamos el mensaje de cargando...
          this.S.ClearState();
          this.announcers_searching = false;

          // Dependiendo de la respuesta, do.
          if (r.status === 1) {
            // Asignamos los announcerers encontrado
            this.announcers_found = r.data;
          } else {
            this.announcers_found = [];
          }
        });
      }, 500);
    }
  }

  SetOption(option, value) {
    this.C.SetOption(option, value, 'radio.guide');
  }
  GetOption(option, def = '') {
    return this.C.GetOption(option, 'radio.guide', def);
  }



  constructor(
    private $: AppComponent,
    private W: WebService,
    public T: Tools,
    private R: Router,
    private AR: ActivatedRoute,
    private S: AppStatus,
    private C: Configuration
  ) {
    this.AR.params.subscribe(params => {
      this.Id = params['id'] > 0 ? params['id'] : 0;
      this.init();
    });
  }
  init() {
    if ( this.$.isAdmin() && this.$.CanDo('radio') ) {
      this.C.SetOption('selected.tab', 'guide', 'radio');
      this.$.ST.radio = 'guide';
      this.GetGuide();
    } else {
      this.S.ShowError('No tienes permiso para modificar los programas de radio', 0);
      this.R.navigate(['/home']);
    }
  }
}
