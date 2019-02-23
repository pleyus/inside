import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Configuration } from '../../app.service';
import { WebService } from '../../services/web-service';
import { AppComponent } from '../../app.component';
import { StatusService, InsideListenerService } from '../../services/status.service';

@Component({
  selector: 'app-open',
  templateUrl: './open.component.html',
  styleUrls: ['./open.component.css']
})
export class CategoriesOpenComponent {

	cat_type = '';

	Category = { id: 0, name: '', slug: '', param1:'', type: 0, status: 0 };


	//	Lista de elementos
	List = [];

	constructor
	(
		public $:AppComponent,
		private R:ActivatedRoute,
		private W:WebService,
		private RT:Router,
		private S : StatusService,
		private C: Configuration
	){
		R.params.subscribe( params =>
		{
			this.cat_type = params['open'];

			if( $.CanDo(this.cat_type) ){
				C.SetOption('selected.tab', this.cat_type, 'categories');
				$.ST.categories = this.cat_type;
				this.init();
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
				RT.navigate(['/home']);
			}
		} );
	}
	init(){
		this.C.SetOption('selected.tab', this.cat_type, 'categories');
		this.$.ST.categories = this.cat_type;
		this.SetCategory();
		this.GetCategories();
	}
	public Save() : void
	{
		//	Loading...
		this.S.ShowLoading( this.Category.id > 0 ? 'Actualizando categoría...' : 'Guardando categoria...' );

		let C = this.Category;

		//	Hablamos con la api para que guarde data
		this.W.Web('categories', 'save', 'type=' + this.cat_type + '&data=' + JSON.stringify(C), (r) => {

			//	Si contesta con 1
			if(r.status == this.S.SUCCESS)
			{
				//	Mostramos el mensaje de guardado
				this.S.ShowSuccess('¡Elemento guardado!');

				//	Ponemos un temporizador para quitar el mensaje
				this.Category = { id: 0, name: '', slug: '', param1:'', type: 0, status: 0 };
				this.GetCategories();
			}
			else
				this.S.ShowError(r.data, 0)

		},
		(e)=> { this.S.ShowError("Se perdió la conexión", 0);});
	}
	private Delete() : void
	{
		if(this.Category.id >  0)
		if( confirm('Ya no se podrá utilizar este elemento, pero no se borrará por completo. ¿Desea continuar?') )
		{
			//	Loading...
			this.S.ShowLoading('Eliminando ' + this.Category.name + '...');

			//	Hablamos con la api para que "borre" al id
			this.W.Web
			('categories', 'delete', 'id=' + this.Category.id + '&type=' + this.cat_type,
				(r) =>
				{
					//	Si contesta con 1
					if(r.status == this.S.SUCCESS)
					{
						this.S.ShowSuccess('Elemento borrado');

						this.Category = { id: 0, name: '', slug: '', param1:'', type: 0, status: 0 };
						this.GetCategories();
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
			this.Category = { id: 0, name: '', slug: '', param1:'', type: 0, status: 0 };
			return;
		}

		this.Category =
		{
			id: Item.id,
			name: Item.name,
			slug: Item.slug,
			param1: Item.param1,
			type: Item.type,
			status: Item.status
		}
	}
	public GetCategories( making = 'get' ) : void
	{
		this.S.ShowLoading();

		//	Hablamos con la API
		this.W.Web( "categories", 'list',

		//	Pedimos solo el typo de categoria
		'type=' + this.cat_type,

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
				}
				else
					this.S.ShowWarning('No se pudo completar la consulta. Intente de nuevo en un momento', 0)

			//	Si no, mostramos el mensaje
			else
				this.S.ShowError(r.data, 0);

		},
		(e)=> { this.S.ShowError("Se perdió la conexión", 0);});
	}
}
