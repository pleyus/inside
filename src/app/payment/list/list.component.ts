import { Component } from '@angular/core';
import { AppStatus, Tools, Configuration } from '../../app.service';
import { WebService } from '../../services/web-service';
import { AppComponent } from '../../app.component';
import { Router } from '@angular/router';

@Component({
	selector: 'app-list',
	templateUrl: './list.component.html',
	styleUrls: ['./list.component.css']
})
export class PaymentListComponent {

	Title : string = "Control de pagos";
	Pays = [];
	LoadMore = true;

	public readonly VIEW_STANDARD = 0;
	public readonly VIEW_SELECTIVE = 1;

	public Result = 0;

	constructor(
		private W : WebService,
		public $ : AppComponent,
		private R : Router,
		private S : AppStatus,
		public T: Tools,
		private C: Configuration
	){
		this.SetOption('last', 0);

		this._Order = this.GetOption('order');
		this._OrderBy = this.GetOption('order_by');

		this.init();
	}

	//#region Order
	_Order = 'DESC';
	_OrderBy = 'at';
	Order( column )
	{
		//	Checamos, si la columna es la misma que la anterior
		if(column == this._OrderBy)
			//	Solo alternamos el order
			this._Order = this._Order === 'DESC' ? 'ASC' : 'DESC';

		//	Si no, ponemos la nueva columna y seteamos a ascendente el orden
		else
		{
			this._OrderBy = column;
			this._Order = 'ASC';
		}

		this._OrderBy = this._OrderBy.toLowerCase();
		this._Order = this._Order.toUpperCase();

		this.SetOption('order', this._Order);
		this.SetOption('order_by', this._OrderBy);

		this.GetPays();
	}
	//#endregion


	//#region Checks!
	CheckedAll = 0;
	CheckAll(){
		this.CheckedAll = this.CheckedAll == 0 ? 1 : 0;
		this.Pays = this.Pays.map(P => {
			P.checked = this.CheckedAll;
			return P;
		});
	}
	CheckSingle(i){
		this.Pays[i].checked = this.Pays[i].checked == 1 ? 0 : 1;

		if(this.Checkeds() < this.Pays.length)
			this.CheckedAll = 0;
		else
			this.CheckedAll = 1;
	}
	CheckedPays()
	{
		return this.Pays.filter((P) => P.checked == 1)
	}
	Checkeds(){
		return this.CheckedPays().length;
	}
	//#endregion

	init()
	{
		this.search_string = this.GetOption('search');
		if( (this.$.isAdmin() && this.$.CanDo('payment') ) || this.$.isStudent() )
		{
			this.Title = this.$.isStudent() ? 'Mis pagos' : 'Control de pagos';
			this.GetPays(  );
		}
		else
		{
			this.S.ShowError('No tienes autorización para entrar al modulo de pagos.', 0);
			this.R.navigate(['/home']);
		}
	}

	public GetPays( making = 'get' ) : void
	{
		let search = this.search_string;

		if(making != 'more')
			this.SetOption('last', 0);

		this.S.ShowLoading
		(
			making == 'search' || search != ''
			? 'Buscando «' + search + '»...'
			: 'Cargando pagos' + (making == 'more' ? ' anteriores' : '') + '...'
		);


		//	Hablamos con la API
		this.W.Web( "payment", 'list',

		//	Mandamos el ultimo que tenemos
		'last=' + this.GetOption('last') +
		'&filter_status=' + this.GetOption('filter_status') +

		//	Lanzamos el orden
		'&order=' + this._Order +
		'&order_by=' + this._OrderBy +

		//	Si se esta buscando algo le decimos
		(making == 'search' || search != '' ? '&search=' + search : ''),


		//	Cuando conteste
		(r) :void =>
		{
			this.S.ClearState();

			//	Revisamos que nos diga 1
			if(r.status == 1)
			{
				if( typeof r.data == 'object' )
					this.Pays =
						making == 'more'
						? this.Pays.concat(r.data)
						: r.data;
				else
					this.S.ShowWarning('No se pudo completar la consulta. Intente de nuevo en un momento', 0)
			}

			//	Si no, mostramos el mensaje
			else
				this.S.ShowError(r.data, 0);

			if(this.CheckedAll == 1)
				this.Pays.map(P => P.checked = 1);

			this.SetOption('last', this.Pays.length );
			this.LoadMore = r.data.length >= 10 ;
			// this.Checkeds = this.Pays.filter(P => P.checked == 1).length;

			//	Si se esta buscando algo, sacamos el primer user id para ponerlo cuando creemos un nuevo pago
			this.Result =
				(this.Pays.length > 0 && (making == 'search' || search != '') )
					? this.Pays[0].uid
					: 0;

		});
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
			this.GetPays();

		else
			this.search_timer = setTimeout( () => { this.GetPays('search'); }, 500);

	}

	//#region Filter
	public isFilter(value)
	{
		return this.GetOption('filter_status') == value;
	}
	public setFilter(value)
	{
		this.SetOption('filter_status', value);
	}
	public FilterText()
	{
		let text = "";
		if ( this.isFilter(-1) ) text = "Todos";
		if ( this.isFilter(this.$.PAID) ) text = 'Pagados';
		if ( this.isFilter(this.$.UNPAID) ) text = 'Pendientes';
		return text;
	}
	//#endregion

	public GetOption(option, context = 'payment', def = false){
		return this.C.GetOption(option, context, def);
	}
	public SetOption(option, value, context = 'payment'){
		this.C.SetOption(option, value, context);
	}
}
