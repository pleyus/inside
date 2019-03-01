import { Component } from '@angular/core';
import { Configuration } from '../../app.service';
import { WebService } from '../../services/web-service';
import { AppComponent } from '../../app.component';
import { Router } from '@angular/router';
import { StatusService, InsideListenerService } from '../../services/status.service';

@Component({
  selector: 'applicants-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})

export class ApplicantsListComponent {

	Title : string = "Aspirantes";
	Applicants : Array<any>;
  LoadMore = true;

  CView = 'general';

	Period = 0;
	Periods = [];
	setPeriod(P)
	{
		this.Period = P;
		this.SetOption('period', P);
		this.GetApplicants();
  }
  viewName() {
    if (this.CView === 'general') {
      return 'General';
    } else if (this.CView === 'fast') {
      return 'S. Rápido';
    } else if (this.CView === 'assign') {
      return 'Asignaciones';
    }
  }
  setView(name) {
    this.CView = name;
  }

	constructor(
		private W : WebService,
		public $ : AppComponent,
    private S : StatusService,
    public L: InsideListenerService,
    private C: Configuration,
    private R: Router)
	{
		this.Applicants = [];
		this.SetOption('last', 0);

		//	Generamos los periodos posibles, empezando en 2017
		for(let i = 2017; i <= $.Now().getFullYear(); i++)
			this.Periods.push(i);
		this.Period = this.GetOption('period');

		this._Order = this.GetOption('order');
		this._OrderBy = this.GetOption('order_by');

		this.search_string = this.GetOption('search');
		this.L.UpdateNews();


		if( $.isAdmin() && this.$.CanDo('applicants') )
			this.GetApplicants(  );
		else
		{
			this.S.ShowError( 'No cuentas con permisos suficientes para ver la lista de aspirantes', 0 );
			R.navigate(['/home']);
		}
	}

	/**
	 * Obtiene la lista de aplicantes desde el server
	 * @param get 	Opcional: Array de parametros para interactuar con server
	 */
	public GetApplicants( making = 'get' ) : void
	{
		let search = this.search_string;
		if(making != 'more')
			this.SetOption('last', 0);

		this.S.ShowLoading
		(
			making == 'search' || search != ''
			? 'Buscando «' + search + '»...'
			: 'Cargando ' + (making == 'more' ? ' mas aspirantes' : 'lista de aspirantes') + '...'
		);

		//	Platicamos con la API para sacar la información
		this.W.Web( "applicants", 'list', 'last=' + this.GetOption('last') +

		//	Lanzamos el orden
		'&order=' + this._Order +
		'&order_by=' + this._OrderBy +

		//	Periodo
		'&period=' + this.Period +

		//	Si se esta buscando algo le decimos
		(making == 'search' || search != '' ? '&search=' + search : '') +
		('&filter_type=' + this.GetOption('filter_type')),

		(r) :void =>
		{
			this.S.ClearState();

			//	Si se completa correctamente la platica
			if(r.status == this.S.SUCCESS)
			{
				if( typeof r.data == 'object' )
				{
					//	Mostramos los elementos
					this.Applicants =
						making == 'more'
						? this.Applicants.concat(r.data)
						: r.data;

					this.LoadMore = r.data.length > 9;
				}
				else
					this.S.ShowWarning('No se pudo completar la consulta. Intente de nuevo en un momento', 0)

			}
			//	Si no, mostramos un error
			else
				this.S.ShowError(r.data, 0);

			//	Marcamos el ultimo
			this.SetOption('last', this.Applicants.length);
		},
		(e)=> { this.S.ShowError("No hay conexión", 0);});
	}
	/**
	 * Evento que se ejecuta al escribir en la caja de busqueda
	 */
	private search_timer;
	search_string = '';
	public search()
	{
		this.SetOption('search', this.search_string);

		if(this.search_timer != undefined)
			clearTimeout(this.search_timer);

		if(this.search_string == '')
			this.GetApplicants();

		else
			this.search_timer = setTimeout( () => { this.GetApplicants('search'); }, 500);

	}
	public GetTaggedClass(Applicant)
	{
		if(Applicant.excluded == 1)
			return 'excluded';

		let tclass = '',
			time = Applicant.note_at,
			now = new Date();

		if(time > 0)
		{
			//	Restamos el tiempo que tiene la nota con la actual entre 1000 (porque js trae milisegundos)
			let dias = now.getTime(); 	// Se obtiene el tiempo de hoy
			dias = dias / 1000;			//	Se parte entre 1000 porque js trae ms
			dias = dias - time; 		//	Se le resta el tiempo en el que se creó la nota
			dias = dias/(60*60*24);		//	Se divide entre los milisegundos de un dia, para convertirlo a dias
			dias = Math.round(dias);	//	Se redondean los dias

			if( dias <= 7 || Applicant.status == this.$.ACTIVE ) return 'recent';
			else if (dias <= 14 ) return 't' + (dias-7);
			else if (dias <= 25 ) return 'old';
			else return 'forgotten';
		}
		return tclass;
	}
	public GetTaggedTitle(Applicant)
	{
		let tclass = '',
			time = Applicant.note_at,
			now = new Date();

		if(time > 0)
		{
			//	Restamos el tiempo que tiene la nota con la actual entre 1000 (porque js trae milisegundos)
			let n = ( now.getTime() / 1000 ) - time,
				dia = 60*60*24;

			if( n <= (dia*7) ) tclass = 'Seguimiento reciente';
			else if (n <= (dia*15) ) tclass = 'Hace mas de una semana';
			else if (n <= (dia*20) ) tclass = 'Hace mas de dos semanas';
			else tclass = 'No se volvió a dar seguimiento';

			let D = new Date(time*1000),
				d = D.getDate(),
				M = D.getMonth()+1,
				y = D.getFullYear(),
				h = D.getHours(),
				m = D.getMinutes(),
				s = D.getSeconds();
			tclass += " » " +
				(d > 9 ? d : '0' + d) + '/' +
				(M > 9 ? M : '0' + M) + '/' +
				y + ' ' +
				(h > 9 ? h : '0' + h) + ':' +
				(m > 9 ? m : '0' + m) + ':' +
				(s > 9 ? s : '0' + s);
		}
		return tclass;
	}

	//#region Filters
	public isFilter(value)
	{
		return this.GetOption('filter_type') == value;
	}
	public setFilter(value)
	{
		this.SetOption('filter_type', value);
	}
	public FilterText()
	{
		let text = "";
		if ( this.isFilter("") ) text = "Todos";
		if ( this.isFilter("active") ) text = 'Inscritos';
		if ( this.isFilter("excluded") ) text = 'Descartados';

		if ( this.isFilter("recent") ) text = 'Recientes';
		if ( this.isFilter("week") ) text = 'Hace 1 semana';
		if ( this.isFilter("old") ) text = 'Mas de 15 dias';
		return text;
	}
	//#endregion

	//#region Views
	// public isView(value)
	// {
	// 	return this.GetOption('current_view') == value;
	// }
	// public setView(value)
	// {
	// 	this.SetOption('current_view', value);
	// }
	// public ViewText()
	// {
	// 	let text = "";
	// 	if ( this.isView("") ) text = "Normal";
	// 	if ( this.isView("tracker") ) text = 'Seguimiento';
	// 	if ( this.isView("linker") ) text = 'Vinculador';
	// 	return text;
	// }
	//#endregion

	public SaveNote(A)//Applicant
	{
		if(A.new_note.trim() != '' && A.id > 0)
		{
			this.S.ShowLoading("Guardando nueva nota. Espere...");
			this.W.Web('applicants', 'save-note', 'note=' + A.new_note + '&aid=' + A.id, (r) => {
				if(r.status == this.S.SUCCESS)
				{
					A.note = A.new_note;
					A.note_at = new Date().getTime() / 1000;
					A.note_saved = true;
					A.new_note = "";

					this.S.ShowSuccess('Nota guardada correctamente', 2000);
				}
				else
					this.S.ShowError(r.data, 0);
			});
		}
	}


	//#region Order
	_Order = 'DESC';
	_OrderBy = 'at';
	_order_count = 0;
	Order( column )
	{
		//	Checamos, si la columna es la misma que la anterior
		if(column == this._OrderBy)
		{
			this._order_count++;
			//	Solo alternamos el order
			this._Order = this._Order === 'DESC' ? 'ASC' : 'DESC';
		}

		//	Si no, ponemos la nueva columna y seteamos a ascendente el orden
		else
		{
			this._OrderBy = column;
			this._Order = 'ASC';
		}

		//	Si ya se orderno varias veces sobre la misma columna, quitamos el orden y ponemos el default
		if(this._order_count > 1)
		{
			this._order_count = 0;
			this._OrderBy = '';
			this._Order = '';
		}
		//	Acomodamos la salida mayusculas para el orden y minusculas para el order_by (columna)
		else
		{
			this._OrderBy = this._OrderBy.toLowerCase();
			this._Order = this._Order.toUpperCase();
		}

		this.SetOption('order', this._Order);
		this.SetOption('order_by', this._OrderBy);

		this.GetApplicants();
	}
	//#endregion


	public GetOption(option, context = 'applicants', def = false){
		return this.C.GetOption(option, context, def);
	}
	public SetOption(option, value, context = 'applicants'){
		this.C.SetOption(option, value, context);
	}
}
