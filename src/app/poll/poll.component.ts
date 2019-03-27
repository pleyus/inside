import { AppComponent } from './../app.component';
import { WebService } from './../services/web-service';
import { Component } from '@angular/core';
import { Configuration } from '../app.service';
import { StatusService } from '../services/status.service';

@Component({
  selector: 'app-poll',
  templateUrl: './poll.component.html',
  styleUrls: ['./poll.component.css']
})
export class PollComponent {

  Polls = [];
  LoadMore = true;
  _Order = 'DESC';
  _OrderBy = 'at';

  private search_timer;
  search_string = '';


  constructor(
    private W: WebService,
    public $: AppComponent,
    private C: Configuration,
    private S: StatusService) {
      C.RequireOption('polls', 'last', 0);
      C.RequireOption('polls', 'order', 'ASC');
      C.RequireOption('polls', 'order_by', 'cr.name');
      C.RequireOption('polls', 'search', '');


      this.SetOption('last', 0);

      this._Order = this.GetOption('order');
      this._OrderBy = this.GetOption('order_by');
      this.search_string = this.GetOption('search');

      this.GetPolls();
    }

  //#region Order


  public GetPolls( making = 'get' ): void {
    const search = this.search_string;

    if (making !== 'more') {
      this.SetOption('last', 0);
    }

    this.S.ShowLoading(
      making === 'search' || search !== ''
      ? 'Buscando «' + search + '»...'
      : 'Cargando encuestas' + (making === 'more' ? ' anteriores' : '') + '...'
    );

    //  Hablamos con la API
    this.W.Web( 'polls', 'list',

    //  Mandamos el ultimo que tenemos
    'last=' + this.GetOption('last') +

    //  Lanzamos el orden
    '&order=' + this._Order +
    '&order_by=' + this._OrderBy +

    //  Si se esta buscando algo le decimos
    (making === 'search' || search !== '' ? '&s=' + search : ''),


    //  Cuando conteste
    (r): void => {
      this.S.Clear();

      //  Revisamos que nos diga 1
      if (r.status === 1) {
        if ( typeof r.data === 'object' ) {
          this.Polls =
            making === 'more'
            ? this.Polls.concat(r.data)
            : r.data;
        } else {
          this.S.ShowWarning('No se pudo completar la consulta. Intente de nuevo en un momento', 0);
        }
      } else {
        this.S.ShowError(r.data, 0);
      }

      this.SetOption('last', this.Polls.length );
      this.LoadMore = r.data.length >= 10;

    });
  }

  Order( column ) {

    //  Checamos, si la columna es la misma que la anterior
    if (column === this._OrderBy) {
      //  Solo alternamos el order
      this._Order = this._Order === 'DESC' ? 'ASC' : 'DESC';

    } else {
      //  Si no, ponemos la nueva columna y seteamos a ascendente el orden
      this._OrderBy = column;
      this._Order = 'ASC';
    }

    this._OrderBy = this._OrderBy.toLowerCase();
    this._Order = this._Order.toUpperCase();

    this.SetOption('order', this._Order);
    this.SetOption('order_by', this._OrderBy);

    this.GetPolls();
  }
  //#endregion

  public search() {
    this.SetOption('search', this.search_string);

    if (this.search_timer !== undefined) {
      clearTimeout(this.search_timer);
    }

    if (this.search_string === '') {
      this.GetPolls();
    } else {
      this.search_timer = setTimeout( () => { this.GetPolls('search'); }, 500);
    }

}


  public GetOption(option, context = 'polls', def = false) {
    return this.C.GetOption(option, context, def);
  }
  public SetOption(option, value, context = 'polls') {
    this.C.SetOption(option, value, context);
  }
}
