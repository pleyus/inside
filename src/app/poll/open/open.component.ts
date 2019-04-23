import { ActivatedRoute, Router } from '@angular/router';
import { AppComponent } from './../../app.component';
import { WebService } from './../../services/web-service';
import { Component } from '@angular/core';
import { StatusService } from 'src/app/services/status.service';
import { Button } from 'src/app/core/class/button';

@Component({
  selector: 'app-open',
  templateUrl: './open.component.html',
  styleUrls: ['./open.component.css']
})
export class PollOpenComponent {
  canSave = true;
  CID = 0;
  Poll = {
    // De la materia
    id: 0,
    name: '',
    area: '',
    level: '',
    levelid: 0,

    // del maestro de la materia
    tid: 0,
    tfirstname: '',
    tlastname: '',
    turl: '',

    // Del mejor maestro del nivel
    gid: 0,
    gfirstname: '',
    glastname: '',
    gurl: '',

    //  estadistica y notas
    dataset: [],
    notes: [],
    greats: []
  };
  MaxStudents = 0;

  Questions = [
    'El docente define claramente los objetivos de la sesión',
    'Existe una distribución adecuada del tiempo durante la sesión',
    'Utiliza medios auxiliares de enseñanza',
    'Explica claramente los procesos y criterios de evaluación',
    'Presenta dominio del contenido',
    'Cumplió con los objetivos planteados'
  ];
  Answers = [
    '(Seleccione)',
    'Nunca',
    'Casi nunca',
    'Casi siempre',
    'Siempre'
  ];

  Stats = [];

  DataSet = [];
  Note = '';
  Great = {
    isGreat: false,
    note: ''
  };

  constructor(
    private W: WebService,
    private S: StatusService,
    public $: AppComponent,
    private RA: ActivatedRoute,
    private R: Router
  ) {

    //  Verificamos la ruta de la encuesta
    RA.params.subscribe( params => {

      //  Si el id que viene de la materia es valido
      if (params['id'] > 0) {

        //  Lo asignamos al CID
        this.CID = params['id'];

        //  Inicializamos nuestra encuesta
        this.DataSet = [];
        this.Questions.forEach((v, i) => {
          this.DataSet.push({
            qindex: i,
            answer: 0,
          });

          this.Stats.push({
            percent: 0,
            average: 0,
            points: 0,
            total: 0,
            details: []
          });
        });

        this.GetPoll();

      } else {
        R.navigate(['/poll']);
      }
    });

  }

  GetPoll() {
    this.S.ShowLoading('Cargando encuesta...');

    this.W.Web('polls', 'get',
      'cid=' + this.CID,
      (r) => {
        this.S.Clear();

        if (r.status === this.S.SUCCESS) {
          this.Poll = r.data;

          //  Analitica si es que se viene el dataset
          if (this.Poll.dataset) {
            this.Poll.dataset.forEach(d => {
              this.Stats[d.qindex].total++;
              this.MaxStudents = this.Stats[d.qindex].total > this.MaxStudents ? this.Stats[d.qindex].total : this.MaxStudents;

              this.Stats[d.qindex].points += d.answer;
              this.Stats[d.qindex].details.push(d);

              this.Stats[d.qindex].percent = this.Stats[d.qindex].points * 100 / ( (this.Answers.length - 1) * this.MaxStudents);
              this.Stats[d.qindex].average = this.Stats[d.qindex].points / this.MaxStudents;
            });
          }

        } else {
          this.S.ShowAlert(r.data, r.status);
        }

      });
  }

  Save() {
    //  Solo pueden enviar datos los alumnos cuando esta disponible el envio
    if (this.$.isStudent() && this.canSave) {

      //  Mientras se esta intentando guardar no se puede volver a realizar la operación
      this.canSave = false;

      this.S.ShowLoading('Enviando encuesta...');

      //  Platicamos con el server y le enviamos a polls > save
      this.W.Web('polls', 'save',

        //  El id de la materia mdl_course.id
        'cid=' + this.CID +

        //  Lo que haya escrito el morro
        '&note=' + this.Note +

        //  El nivel en el que esta la materia o la categoria de la materia (Cuatrimestre II, Semestre VI, etc)
        '&lid=' + this.Poll.levelid +

        //  El id de este docente que se marca como Buen mestro (GreatId)
        '&gid=' + this.Poll.gid +

        //  Enviamos las respuestas de la encuesta
        '&dataset=' + JSON.stringify(this.DataSet),
        (r) => {

          // Si el server dice que chido
          if (r.status === this.S.SUCCESS) {

            //  Damos las gracias y esperamos para ir a las encuestas generales
            this.S.ShowSuccess('Gracias por tus comentarios para la materia de ' + this.Poll.name);
            setTimeout( () => {
              this.R.navigate(['/poll']);
            }, 3000);

          } else {

            // Si hay algun error, mostramos el error y volvemos a permitir el envio
            this.S.ShowAlert(r.data, r.status);
            this.canSave = true;
          }
        }, () => {
          // Idem
          this.S.ShowError('Se provoco un error interno. Intenta de nuevo.');
          this.canSave = true;
        });

    } else {
      this.S.ShowError('Lo siento, no puedes enviar esta encuesta ' +
      'ya que no estas considerado dentro de la plantilla de alumnos. ' +
      '<b>Por favor reporta este error en rectoria.</b>', 0);
    }
  }

  SetGreat() {
    if (this.Poll.gid !== this.Poll.tid && this.Poll.gid > 0) {
      this.S.ShowDialog(
        'Estas a punto de poner a ' + this.Poll.tfirstname +
        ' como mejor docente del ' + this.Poll.level +
        '. Anteriormente habias marcado a ' + this.Poll.gfirstname +
        '. ¿Deseas cambiarlo?',
        [
          new Button('Cambiar', () => {
            this.Poll.gid = this.Poll.tid;
          }, 'primary'),
          new Button('Cancelar', () => {})
        ]);
    }
    if (this.Poll.gid === this.Poll.tid) {
      this.S.ShowDialog(
        'Estas a punto de quitar como mejor docente a ' + this.Poll.tfirstname +
        '. ¿Deseas continuar?',
        [
          new Button('Si', () => {
            this.Poll.gid = 0;
          }, 'primary'),
          new Button('No', () => {})
        ]);
    }
  }

  Round(FNumber: number) {
    return Math.round(FNumber);
  }
}
