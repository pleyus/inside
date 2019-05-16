import { Component, Input, EventEmitter, Output } from '@angular/core';
import { WebService } from '../../services/web-service';
import { StatusService } from 'src/app/services/status.service';
import { Configuration, Tools } from 'src/app/app.service';
import { Button } from '../class/button';

@Component({
  selector: 'app-file-manager',
  templateUrl: './file-manager.component.html',
  styleUrls: ['./file-manager.component.css']
})
export class FileManagerComponent {

  /**
   * Texto del boton que devuelve los archivos
   * - Por default: 'Seleccionar archivo...'
   */
  @Input() ButtonText = 'Seleccionar archivo...';

  /**
   * Titulo del dialogo
   */
  @Input() Title = 'Seleccione un archivo';

  /**
   * Input que indica si se mostrará desde que carga el componente
   */
  @Input() Showing = false;

  /**
   * Id del registro al que esta vinculado el archivo del modulo
   * Modulos disponibles:
   * - user: UId (User Id)
   * - library: BId (Book Id)
   * - payments: PId (Pay Id)
   */
  @Input() XId = 0;

  /**
   * Archivos seleccionados.
   */
  @Input() Files = [];

  /**
   * Modulo en el cual se ejecuta el Dialogo
   */
  @Input() Module = '';

  /**
   * Indica si se utilizara con la selección multiple
   */
  @Input() MultiSelect = false;

  /**
   * Evento que se dispara al dar click en el Boton de Seleccionar archivo
   * - retorna this.Files si Multiselect = true
   * - o this.Files[0] si Multiselect = false
   */
  @Output() Select = new EventEmitter();

  /**
   * Archivos que se obtienen mediante el método GetFiles(...)
   */
  ServedFiles = [];

  /**
   * Limite de archivos mostrados (LIMIT n, 12)
   */
  Limit = 0;

  /**
   * Indica si se pueden seguir cargando mas archivos en la lista o si se llegó al final
   */
  LoadMore = true;

  /**
   * Internal: Se utiliza para crear un pequeño retraso para ejecutar la busqueda al momento de terminar de teclear
   */
  private search_timer;

  /**
   * Lo que se está buscando
   */
  search_string = '';

  /**
   * Internal: Se utiliza para limpara el nombre del archivo seleccionado
   * Un pequeño hack para poder seleccionar varias veces el mismo archivo
   */
  files_model = '';

  /**
   * Lista de archivos a subir al servidor: Los archivos que nos entrega el FileDialog al dar click en subir
   */
  private FilesToUpload: FileList = null;

  /**
   * Indice del FileList que se esta subiendo.
   */
  private CurrentFileUpload = -1;

  constructor(
    private W: WebService,
    private S: StatusService,
    private C: Configuration,
    public T: Tools) { }

  /**
   * Obtiene la lista de archivos que se requieren
   * @param making Indica lo que se esta realizando al momento de cargar el Metodo
   */
  GetFiles( making = 'get' ) {
    this.S.ShowLoading('Obteniendo archivos...');

    //  Preparamos el parametro base (limite: en caso de que se quieran cargar mas datos)
    let param = 'limit=' + this.Limit;

    //  Si se esta buscando algo, se ignora el modulo y el xid (para ampliar a toda la tabla)
    if (making === 'search' || this.search_string !== '') {
      param += '&s=' + this.search_string;

    //  Si no, se carga el modulo y el xid
    } else {
      param += '&module=' + this.Module +
      '&xid=' + this.XId;
    }

    this.W.Web('files', 'list', param,

    (r) => {
      this.S.Clear();
      if (r.status === this.S.SUCCESS) {

        this.ServedFiles = making === 'more'
          ? this.ServedFiles.concat(r.data)
          : r.data;

        this.Limit = this.ServedFiles.length;
        this.LoadMore = r.data.length >= 10;

      }
    });
  }

  /**
   * Envía los archivos seleccionados al componente que los pide
   */
  public SetFiles() {
    //  Verificamos que haya archivos
    if (this.Files.length > 0) {
      //  Los enviamos mediante el evento Select para que sean capturados en el
      //  Componente padre
      this.Select.emit( this.Files );

      //  Cerramos...
      this.Cancel();
    }
  }

  /**
   * Se ejecuta al escribir dentro del cuadro de busqueda
   */
  public search() {

    //  Movemos a 0 el limite, ya que se requieren nuevos resultados
    this.Limit = 0;

    //  Si hay una busqueda esperando (con el delay)
    if (this.search_timer !== undefined) {

      //  Lo quitamos para que no se busquen varias cosas de putazo
      clearTimeout(this.search_timer);
    }

    //  Si se limpió la caja de busqueda
    if (this.search_string === '') {
      //  Cargamos la lista por default
      this.GetFiles();

    } else {
      //  Si no, disparamos el delay de busqueda.
      this.search_timer = setTimeout(() => { this.GetFiles('search'); }, 500);
    }
  }

  /**
   * Evento disparado despues de seleccionar los archivos a subir
   */
  onSelectedFile(event) {
    //  Total de archivos seleccionados
    const len = event.target.files.length;

    //  Si hay al menos un archivo
    if (len > 0) {

      //  Preguntamos su vamos a subir el archivo
      this.S.ShowDialog(
        'Se seleccion' + (len > 1 ? 'aron ' : 'ó ') + len + ' archivo' + (len > 1 ? 's' : '') +
        ' para subir. <br><br>¿Deseas continuar?', [
          new Button('Continuar', (e) => {
            this.FilesToUpload = event.target.files;
            this.CurrentFileUpload = 0;
            this.UploadFiles();

            this.files_model = '';
          }, 'success'),

          new Button('Cancelar', () => {
            this.FilesToUpload = null;
            this.CurrentFileUpload = 0;

            this.files_model = '';
          })
        ]);
    }
  }

  /**
   * Guarda el Nombre del archivo y la descripción del mismo en la base de datos
   */
  SaveInfo() {

    //  Verificamos a lo wey si hay al menos un archivo seleccionado
    if (this.Files.length > 0) {
      //  Loading...
      this.S.ShowLoading('Actualizando información...');

      //  Enviamos la actualización
      this.W.Web('files', 'update',
        'id=' + this.Files[0].id +
        '&filename=' + this.Files[0].filename +
        '&description=' + this.Files[0].description,
        (r) => {
          //  Mostramos el mensaje que devuelva el servidor
          this.S.ShowAlert(r.data, r.status);
        });
    }
  }

  /**
   * Evento que tiene lugar al dar click en el boton de seleccion de archivos
   * Del componente.
   */
  ShowDialog() {
    this.Showing = true;
    this.Limit = 0;
    this.search_string = '';
    this.GetFiles();

    const ind = [];
    this.Files.forEach((v, i) => {
      if (!v.url){
        ind.push(i);
      }
    });

    ind.reverse().forEach(v => this.Files.splice(v, 1) );
  }

  /**
   * Cancela o cierra la ventana de dialogo de seleccion de archivos
   */
  Cancel() {
    this.Showing = false;
  }

  /**
   * Verifica si un mimetype es imagen
   */
  isImage(mimetype) {
    if (mimetype) {
      return mimetype.startsWith('image');
    }
    return false;

  }

  /**
   * Sube los archivos de uno por uno hasta terminar
   */
  private UploadFiles() {

    //  Preparamos el archivo actual
    const file = this.FilesToUpload[this.CurrentFileUpload];

    //  Subimos
    this.W.Upload( file, '&module=' + this.Module + '&xid=' + this.XId ).subscribe((r) => {

      //  Si hay hay respuesta
      if (r !== undefined) {

        //  Si se reporta el progeso
        if (r.status === this.S.PROGRESS) {
          //  Mostramos...
          this.S.ShowLoading('Subiendo archivo ' + file.name + '...', -1, r.data);

        //  Si se terminó de subir el archivo actual
        } else if (r.status === this.S.SUCCESS) {

          //  Incrementamos el indice del archivo actual
          this.CurrentFileUpload++;

          //  Si el archivo actual supera al numero de archivos a subir, quiere decir que terminamos.
          if ( this.CurrentFileUpload > this.FilesToUpload.length ) {
            this.S.ShowSuccess('Se completo la carga de archivos...' + r.data);
            setTimeout(() => { this.GetFiles(); }, 2000 );

          //  Si no, continuamos subiendo
          } else {
            this.UploadFiles();
          }
        } else {
          this.S.ShowAlert(r.data, r.status, 0);
        }
      }
    });
  }


  /**
   * Agrega un elemento a la lista de archivos seleccionados
   * @param FileToAdd Archivo a seleccionar o a agregar a la lista de seleccionados
   */
  public SelectThis(FileToAdd) {

    if (this.MultiSelect) {
      if (!this.Added(FileToAdd)) {
        this.Files.push(FileToAdd);
      } else {
        this.Remove(FileToAdd);
      }
    } else {
      this.Files = [FileToAdd];
    }
  }

  /**
   * Verifica si un archivo ya se encuentra en this.Files mediante su id
   * @param file Archivo a verificar
   */
  public Added(file) {
    const founded = this.Files.filter(i => i.id === file.id);
    return founded.length > 0;
  }

  /**
   * Elimina un archivo de this.Files de acuerdo a su Id
   * @param file Archivo a quitar (debe traer id)
   */
  private Remove(file) {
    let ind = -1;

    this.Files.forEach( (v, i) => {
      if (v.id === file.id) {
        ind = i;
      }
    });

    if ( ind > -1 ) {
      this.Files.splice(ind, 1);
    }
  }
}
