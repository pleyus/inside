import { Component } from '@angular/core';
import { Tools, AppStatus, Configuration } from '../../app.service';
import { WebService } from '../../services/web-service';
import { AppComponent } from '../../app.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-institutions',
  templateUrl: './institutions.component.html',
  styleUrls: ['./institutions.component.css']
})
export class CategoryInstitutionsComponent {
	Institution = {
		id: -1,
		name : '',
		lid: 0,
		location: null,
		phone1: '',
		phone2: '',
		director: '',
		address: ''
	};
	List = [];
	LoadMore = false;
	Last = 0;

	public Save() : void
	{
		//	Loading...
		this.S.ShowLoading( this.Institution.id > 0 ? 'Actualizando categoría...' : 'Guardando categoria...' );

		let C = this.Institution;

		//	Hablamos con la api para que guarde data
		this.W.Web('categories', 'save', 'type=institution&data=' + JSON.stringify(C), (r) => {

			//	Si contesta con 1
			if(r.status == this.S.SUCCESS)
			{
				//	Mostramos el mensaje de guardado
				this.S.ShowSuccess('¡Elemento guardado!');

				//	Ponemos un temporizador para quitar el mensaje
				this.Institution = {
					id: -1,
					name : '',
					lid: 0,
					location: null,
					phone1: '',
					phone2: '',
					director: '',
					address: ''
				};
				this.Last = 0;
				this.GetInstitutions();
			}
			else
				this.S.ShowError(r.data, 0)

		},
		(e)=> { this.S.ShowError("Se perdió la conexión", 0);});
	}
	private Delete() : void
	{
		if(this.Institution.id >  0)
		if( confirm('Ya no se podrá utilizar este elemento, pero no se borrará por completo. ¿Desea continuar?') )
		{
			//	Loading...
			this.S.ShowLoading('Eliminando ' + this.Institution.name + '...');

			//	Hablamos con la api para que "borre" al id
			this.W.Web
			('categories', 'delete', 'id=' + this.Institution.id + '&type=institution',
				(r) =>
				{
					//	Si contesta con 1
					if(r.status == this.S.SUCCESS)
					{
						this.S.ShowSuccess('Elemento borrado');

						this.Institution = {
							id: -1,
							name : '',
							lid: 0,
							location: null,
							phone1: '',
							phone2: '',
							director: '',
							address: ''
						};
						this.Last = 0;
						this.GetInstitutions();
					}
					else
						this.S.ShowError(r.data, 0)
				},
				(e)=> { this.S.ShowError("Se perdió la conexión", 0);});
		}
	}
	SetCategory(Item = null)
	{
		if(Item == null)
		{
			this.Institution = {
				id: -1,
				name : '',
				lid: 0,
				location: null,
				phone1: '',
				phone2: '',
				director: '',
				address: ''
			};
			return;
		}

		this.S.ShowLoading("Cargando información de " + Item.name);
		this.W.Web('categories', 'get', 'id='+Item.id + '&type=institution', (r)=>
		{
			this.S.ClearState();
			if(r.status == this.S.SUCCESS)
				this.Institution = r.data;
			else
			{
				this.S.ShowAlert(r.data, r.status);
				this.Institution = {
					id: -1,
					name : '',
					lid: 0,
					location: null,
					phone1: '',
					phone2: '',
					director: '',
					address: ''
				};
			}
		});
	}
	public GetInstitutions( making = 'get' ) : void
	{
		this.S.ShowLoading(
			making === 'search' || this.search_string !== ''
				? 'Buscando «' + this.search_string + '»...'
				: (making === 'more' ? ' Cargando' : ' Obteniendo instituciones...') + '...'
		);
		if(making != 'more')
			this.Last = 0;

		//	Hablamos con la API
		this.W.Web( "categories", 'list',

		//	Pedimos solo el typo de categoria
		'type=institution&last=' + this.Last +

		//	Lanzamos el orden
		'&order=' + this._Order +
		'&order_by=' + this._OrderBy +

		// Si se esta buscando algo le decimos
		(making === 'search' || this.search_string !== '' ? '&s=' + this.search_string : ''),

		//	Cuando conteste
		(r) :void =>
		{
			this.S.ClearState();

			//	Revisamos que nos diga 1
			if(r.status == this.S.SUCCESS)
				if( typeof r.data == 'object')
				{
					this.List =
						making == 'more'
						? this.List.concat(r.data)
						: r.data;
					this.LoadMore = r.data.length > 9;
				}
				else
					this.S.ShowWarning('No se pudo completar la consulta. Intente de nuevo en un momento', 0)


			//	Si no, mostramos el mensaje
			else
				this.S.ShowError(r.data, 0);

			this.Last = this.List.length;

		},
		(e)=> { this.S.ShowError("Se perdió la conexión", 0);});
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

		this.GetInstitutions();
	}
	//#endregion


	private search_timer;
	search_string = '';
	public search() {

		if (this.search_timer != undefined)
			clearTimeout(this.search_timer);

		if (this.search_string == '')
			this.GetInstitutions();

		else
			this.search_timer = setTimeout(() => { this.GetInstitutions('search'); }, 500);
	}


	SetLocation(item)
	{
		this.Institution.lid = item !== null ? item.id : 0;
	}

	constructor(
		private $ : AppComponent,
		private W : WebService,
		private T : Tools,
		private R : Router,
		private S : AppStatus,
		private C: Configuration
	)
	{
		if( $.CanDo('institutions') ){
			C.SetOption('selected.tab', 'institution', 'categories');
			$.ST.categories = 'institution';
			this.GetInstitutions();
		}
		else
		{
			S.ShowError("No tienes autorización para modificar las instituciones.", 0);

			//	Asignamos la primer categoria a la que tenemos acceso
			let cat_type = $.CanDo('courses')
				? 'courses'
				:($.CanDo('vias')
					? 'vias'
					:($.CanDo('campaigns')
						? 'campaigns'
						:($.CanDo('insitutions')
							? 'institutions'
							: '')));

			C.SetOption('selected.tab', cat_type, 'categories')
			$.ST.categories = cat_type;

			//	Redireccionamos
			R.navigate(['/home']);
		}
	}
}
