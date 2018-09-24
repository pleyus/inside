import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgForm } from '@angular/forms';

import { AppComponent } from './../../app.component';
import { WebService, AppStatus, Configuration } from './../../app.service';


@Component({
  selector: 'app-open',
  templateUrl: './open.component.html',
  styleUrls: ['./open.component.css']
})
export class ApplicantsOpenComponent {

	//	Información sobre el aspirante
	public Applicant = 
	{ 
		id: 0,
		uid: 0,
		via: 0,
		rid: 0,

		excluded: 0,
		origin: '',
		campaign: {id: -1, name: 'Estándar' },
		notes: [],
		user: {
			id: 0,
			firstname: '',
			lastname: '',
			sex: 0,
	
			personal_phone: '',
			tutor_phone: '',
			email: '',
	
			cid: 0,
			at: 0,
			
			rid: 0,
			regby: {
				id: 0,
				firstname: '',
				lastname: '',
			},
	
			lid: 0,
			location: null,
			address: '',
	
			institution: null,
			iid: 0,
			
			type: this.$.T_STUDENT,
			status: this.$.IS_APPLICANT
		}
	};

	Id = 0;
	ContactId = 0;

	
	public NewNote = "";

	public Courses = [];
	public Vias = [];
	public check_excluded = false;
	
	constructor( 
		private W : WebService, 
		private R : ActivatedRoute, 
		public $ : AppComponent, 
		private RT : Router,
		private S : AppStatus,
		private C: Configuration
	){
		R.params.subscribe( params => 
			{
				this.Id = params['id'];
				this.init();
			} );
		
	}
	
	init() 
	{
		if( this.$.isAdmin() && this.$.CanDo('applicants') )
		{
			this.getCategories('vias'); // Vias
			this.getCategories('courses'); // Vias
			
			if(this.Id > 0)
				this.getApplicant();
			else
			{
				if(this.GetOption('pre-fn') !== ''){
					this.Applicant.user.firstname = this.GetOption('pre-fn');
					this.Applicant.user.lastname = this.GetOption('pre-ln');
					this.Applicant.user.personal_phone = this.GetOption('pre-ph');
					this.Applicant.user.email = this.GetOption('pre-em');
					this.Applicant.user.at = this.GetOption('pre-at');
					this.ContactId = this.GetOption('pre-contact-id');
	
					this.SetOption('pre-fn', '');
					this.SetOption('pre-ln', '');
					this.SetOption('pre-ph', '');
					this.SetOption('pre-em', '');
					this.SetOption('pre-at', 0);
					this.SetOption('pre-contact-id', 0);
				}
			}
		}
		
		else
		{
			this.S.ShowError( 'No tienes autorización para modificar los aspirantes', 0 );
			this.RT.navigate(['/home']);
		}
	}

	private getApplicant( callback : () => void = () => {})
	{
		this.S.ShowLoading('Cargando aspirante...');

		
		this.W.Web('applicants', 'get', 'id=' + this.Id,
		(a) => 
		{
			this.S.ClearState();
			if( a.status == this.S.SUCCESS )
			{
				this.Applicant = a.data
				//	Obtenemos el usuario
				this.check_excluded = this.Applicant.excluded > 0;
			}

		},
		(e)=> { this.S.ShowError("No hay conexión", 0);});
	}

	/**
	 * Obtiene categorias de la base de datos
	 * @param type Tipo de Categoria que se obtendrá, 0 = Vias de Difusion, 1 = Promociones activas
	 */
	private getCategories( type : string ) : void
	{
		this.W.Web('categories', 'list', 'type=' + type, (r) => 
		{
			let tmp = [];
			if(r.status == this.S.SUCCESS)
				tmp = r.data;
			
			if(type == 'vias') this.Vias = tmp;
			else if(type == 'courses') this.Courses = tmp;
			else if(type == 'courses') this.Courses = tmp;

		},
		(e)=> { this.S.ShowError("No hay conexión", 0);});
	}

	public Save() : void
	{

		//	Loading...
		this.S.ShowLoading('Guardando información...');

		this.Applicant.excluded = this.check_excluded ? 1 : 0;

		//	Solo podremos guardar si viene el nombre, mail y telefono
		if(this.Applicant.user.firstname != '' && this.Applicant.user.email != '' && this.Applicant.user.personal_phone != '')
		{
			if(this.Id < 1)
				this.do_new()
			else if(this.Applicant.user.id > 0 && this.Applicant.id > 0)
				this.SaveNote( () => this.do_update() );
			else
				this.RT.navigate(['/applicants/']);
		}
		else
			this.S.ShowWarning(
				'Algunos campos no deben estar vacios: ' +
				(this.Applicant.user.firstname ? '': '<br> – Nombre') +
				(this.Applicant.user.email ? '': '<br> – Correo electrónico') +
				(this.Applicant.user.personal_phone ? '': '<br> – Teléfono personal')
				,0);
	}
	private do_new()
	{
		this.W.Web('applicants', 'save', 
			'data=' + JSON.stringify( this.Applicant ) + 
			(this.ContactId > 0 ? '&contact-id=' + this.ContactId : ''), 
			r => 
			{
				//	Si contesta con 1
				if(r.status == this.S.SUCCESS)
				{
					
					//	Mostramos el mensaje de guardado
					this.S.ShowSuccess( 'Se guardó correctamente la información de ' + this.Applicant.user.firstname + ', espere...' );
		
					//	Ponemos un temporizador para quitar el mensaje
					setTimeout(() => 
					{
						//	Si es nuevo, cargamos el chucho
						if(this.Id < 1)
						{ 
							let go = '/applicants/' + r.data.id,
								goto = this.GetOption('goto');
		
							if( goto != '' )
							{
								go = goto + r.data.uid
								this.SetOption('goto', '');
							}
		
							setTimeout(() => { this.RT.navigate([ go ]); }, 2000 );		
						}
							
					}, 2000);
				}
				else
					this.S.ShowError(r.data,0);
		
			},
			(e)=> { this.S.ShowError("Se perdió la conexión", 0);});
	}
	private do_update()
	{
		this.W.Web('applicants', 'save', 
			'data=' + JSON.stringify( this.Applicant ) + 
			(this.ContactId > 0 ? '&contact-id=' + this.ContactId : ''), 
			r => 
			{
				//	Si contesta con 1
				if(r.status == this.S.SUCCESS)
					this.S.ShowSuccess( 'Cambios guardados correctamente...' );
				else
					this.S.ShowAlert(r.data, r.status, 0);
	
			},
			(e)=> { this.S.ShowError("Se perdió la conexión", 0);});
	}

	public Delete() : void
	{
		//	Para poder borrarlo es necesario que no sea aplicante
		if( this.Applicant.user.status != this.$.IS_APPLICANT )
		{
			this.S.ShowWarning('Los aspirantes que se han inscrito ya no se pueden eliminar', 0)
		}
		else if(this.Id > 0)
		{
			if( confirm('Esta a punto de eliminar este registro, tenga en cuenta que se borrarán tambien los datos ligados al usuario. ¿Desea continuar?') )
			{
				//	Loading...
				this.S.ShowLoading('Eliminando a ' + this.Applicant.user.firstname + ' de la lista de aspirantes...');
				
				//	Hablamos con la api para que "borre" al id
				this.W.Web('applicants', 'delete', 'id=' + this.Id, (r) => 
				{
					//	Si contesta con 1
					if(r.status == this.S.SUCCESS)
						//	Redireccionamos a aplicantes
						this.RT.navigate(['/applicants']);
			
					else
						this.S.ShowError(r.data,0);
				});
			}
		}
	}

	public GetNotes(quiet = false,  callback : () => void = () => {})
	{
		//	Solo se pueden sacar las notas cuando el aplicante ya esta registrado
		if(this.Id > 0)
		{
			//	Verificamos que no sea una peticion silenciosa
			if(!quiet)
				//	Para mostrar el loading
				this.S.ShowLoading('Cargando notas del aspirante...');

			//	Llamamos a la api
			this.W.Web('applicants', 'list-notes', 'aid=' + this.Id, (r) => {

				//	Limpiamos si es que no es silenciosa
				if(!quiet)
					this.S.ClearState();

				//	Si sale todo bien
				if(r.status == this.S.SUCCESS)
					this.Applicant.notes = r.data;
				else
				{
					this.S.ShowError('No se pudieron cargar las notas');
					this.Applicant.notes = []; 
				}
				callback();
					
			});
		}
		else
			callback();
	}

	public SaveNote( callback : () => void = () => {})
	{
		if(this.NewNote.trim() != '' && this.Id > 0)
		{
			this.S.ShowLoading("Guardando nueva nota. Espere...");
			this.W.Web('applicants', 'save-note', 'note=' + this.NewNote + '&aid=' + this.Id, (r) => {
				if(r.status == this.S.SUCCESS)
				{
					this.S.UpdateNews();
					this.NewNote = "";
					this.S.ShowSuccess('Nota guardada correctamente', 2000);
					this.GetNotes(true, callback);
				}
				else
					this.S.ShowError(r.data, 0);
			});
		}
		else
			callback();
	}
	public DeleteNote(index)
	{
		let note = this.Applicant.notes[index];
		this.S.ShowLoading('Borrando nota <i>' + note.note + '</i>...');

		this.W.Web('applicants', 'delete-note', 'id=' + note.id, (r) => {
			if(r.status == this.S.SUCCESS)
			{
				this.S.UpdateNews();
				this.GetNotes(true);
				this.Applicant.notes[index].note = 'Elemento eliminado...';
				this.S.ShowSuccess('Se borro correctamente la nota', 2000);
			}
			else
				this.S.ShowError(r.data, 0);
		});
	}

	public GoBack() : void 
	{
		this.RT.navigate(['/applicants']);
	}

	InstitutionSelected(item){
		this.Applicant.user.iid = 
			item !== null 
			? item.id 
			: 0;
	}
	LocationSelected(item){
		this.Applicant.user.lid = 
			item !== null
			? item.id
			: 0;
	}

	public GetOption(option, context = 'applicants', def = false){
		return this.C.GetOption(option, context, def);
	}
	public SetOption(option, value, context = 'applicants'){
		this.C.SetOption(option, value, context);
	}
}