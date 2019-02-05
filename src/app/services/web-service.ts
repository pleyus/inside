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
  Web( using, make, params,
    callback: (r) => void,
    onerr: (r) => void = (r) => {}
  ) {
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

  Post( page, params,
    callback: (r) => void,
    onerr: (r) => void = (r) => {}
  ) {
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

  Upload(using, file: File, params: string,
    callback: (r) => void, onerr: (r) => void = (r) => {}) {
    try {
      const uploadData = new FormData();
      uploadData.append('the-file', file, file.name);

      this.http.post(this.Url + 'using=general&make=debug' + params, uploadData)
      .subscribe(callback, onerr);
    } catch (x) {
      onerr({status: 0, data: 'No se pudo completar la solicitud: <br> – ' + x});
    }
  }
}

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {

  apiUrl = 'https://unitam.edu.mx/api/?using=files&make=upload';

  constructor(private http: HttpClient) { }

  upload(formData) {
    return this.http.post<any>(`${this.apiUrl}`, formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      map(event => this.getEventMessage(event, formData)),
      catchError(this.handleError)
    );
  }

  private getEventMessage(event: HttpEvent<any>, formData) {

    switch (event.type) {

      case HttpEventType.UploadProgress:
        return this.fileUploadProgress(event);

      case HttpEventType.Response:
        return this.apiResponse(event);

      default:
        return `File "${formData.get('profile').name}" surprising upload event: ${event.type}.`;
    }
  }

  private fileUploadProgress(event) {
    const percentDone = Math.round(100 * event.loaded / event.total);
    return { status: 'progress', message: percentDone };
  }

  private apiResponse(event) {
    return event.body;
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
