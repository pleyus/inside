import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient, HttpEvent, HttpErrorResponse, HttpEventType} from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WebService {
  constructor( private http: HttpClient ) { }
  private Url = 'https://unitam.edu.mx/api/?';

  /**
   * Se encarga de descargar datos desde internet (Api rest)
   * @param using Define el modulo de la api que se usará para la obtencion de datos
   * @param make Es la acción a realizar dentro del modulo de la api
   * @param params Parametros que pudiera necesitar el modulo para realizar la acción
   * @param callback Funcion que se llama al terminar la petición
   * @param onerr Funcion que se llama en caso de error en la petición
   */
  Web( using, make, params, callback: (r) => void, onerr: (r) => void = (r) => {}) {
    try {
      const Api = this.Url + 'using=' + using + '&make=' + make,

        headers = new HttpHeaders( {
          'Content-Type': 'application/x-www-form-urlencoded'
        } ),

        options = {
          headers: headers,
          method: 'post',
          withCredentials: true
        };

      this.http.post(Api, params, options)
        .subscribe(callback, onerr);
    } catch (x) {
      onerr({status: 0, data: 'No se pudo completar la solicitud: <br> – ' + x});
    }
  }

  Post( page, params, callback: (r) => void, onerr: (r) => void = (r) => {} ) {
    try {
      const Url = page,

        headers = new HttpHeaders( {
          'Content-Type': 'application/x-www-form-urlencoded'
        } ),

        options = {
          headers: headers,
          method: 'post',
          withCredentials: true
        };

      this.http.post(Url, params, options)
        .subscribe(callback, onerr);
    } catch (x) {
      onerr({status: 0, data: 'No se pudo completar la solicitud: <br> – ' + x});
    }
  }

  Get( page, callback: (r) => void, onerr: (r) => void = (r) => {} ) {
    try {
      const Url = page,

        options = {
          method: 'get',
          withCredentials: true
        };

      this.http.get(Url, options)
        .subscribe(callback, onerr);
    } catch (x) {
      onerr({status: 0, data: 'No se pudo completar la solicitud: <br> – ' + x});
    }
  }

  /**
   * Sube un archivo al servidor utilizando la Api
   * @param file Objeto de archivo que se subira al servidor
   * @param params Parametros GET extra de la petición
   */
  Upload(file: File, params: string = '') {

    //  Preparamos el form que vamos a enviar
    const FileData = new FormData();
    FileData.append('the-file', file, file.name);  //  Acuerdate prro!! Se llama the-file el archivo

    //  Retornamos un Observable para llevar el control del la carga
    return this.http.post(this.Url + 'using=general&make=debug&' + params, FileData, {
        reportProgress: true,
        observe: 'events',
        withCredentials: true
      }).pipe(
        //  Mapeamos el evento
        map(event => this.UploadStatus(event)),

        //  En caso de error...
        catchError(this.handleError)
      );
  }

  //  Manejamos el estado actual de la subida
  private UploadStatus(event: HttpEvent<any>) {
    switch (event.type) {
      //  Si se reporta el progreso
      case HttpEventType.UploadProgress:
        return this.FileUploadProgress(event);

      //  Si termina
      case HttpEventType.Response:
        //  Revisamos si devuelve algo la api
        if (event.body !== undefined) {
          //  Si tiene el formato correcto
          if (event.body.data !== undefined) {
            //  Ahi ta...
            return event.body;
          }
        }
        //  Si no devuelve datos entendibles, devolvemos un error...
        return { status: 0, data: 'Algo salió mal al subir el archivo' };
    }
  }

  private FileUploadProgress(event) {
    const percentDone = Math.round(100 * event.loaded / event.total);
    //  Devolvemos el estatus de progress en StatusService.PROGRESS = 4
    return { status: 4, data: percentDone };
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(`Backend returned code ${error.status}, ` + `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    return throwError('Something bad happened. Please try again later.');
  }
}
