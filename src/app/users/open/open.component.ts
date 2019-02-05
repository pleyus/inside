import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppComponent } from './../../app.component';
import { Tools, AppStatus, Configuration } from './../../app.service';
import { WebService } from '../../services/web-service';


@Component({
  selector: 'app-open',
  templateUrl: './open.component.html',
  styleUrls: ['./open.component.css']
})
export class UsersOpenComponent
{

	//#region Vars
		public Title = "Información de usuario";
		public Id;
		public ImageFile: File;


		// public ActivityDays = [];
		// public MaxActivityEvents = 0;

		public TODAY = new Date();

		public COURSES = [];
		public Pictures = [];

		public User =
		{
			id: 0,
			idnumber: '',
			firstname: '',
			lastname:'',
			sex: 0,
			birthday: 0,
			type: 2,

			pid: 0,
			picture: null,

			eid: 0,
			mid: 0,
			lid: 0,
			location: null,
			address: '',

			email: '',
			personal_phone: '',
			tutor_phone: '',
			phones: [],

			uid: 0,
			platform: null,

			iid: 0,
			institution: null,

			cid: 0,
			level: 0,
			status:0,

			capabilities:{
				payment: 0,
				applicants: 0,
				courses: 0,
				vias: 0,
				campaigns: 0,
				institutions: 0,
				radio: 0,
				docs: 0,
				user: 0,
				feedback: 0
			}
		}
	//#endregion
	getCourse()
	{
		if(this.COURSES.length > 0)
			return this.COURSES.find(r => r.id == this.User.cid).name + ' ' + this.T.Romanize(this.User.level);
		return '';
	}
	addPhone()
	{
		this.User.phones.push({name: '', phone: ''});
	}
	removePhone(i)
	{
		this.User.phones.splice(i, 1);
	}

	constructor
	(
		private R: Router,
		private AR: ActivatedRoute,
		public T: Tools,
		private W: WebService,
		public $ : AppComponent,
		private S: AppStatus,
		private C: Configuration
	)
	{
		AR.params.subscribe((p) =>
		{

			this.Id = p['uid'] > 0 ? p['uid'] : 0;
			this.init();

		})
	}
  CardOptions = { Valid: 'Diciembre 2018' };

	init()
	{
		if (this.$.isAdmin() && this.$.CanDo('user')) {
      this.GetCourses();

    const m = this.$.Now().getMonth(),
      y = this.$.Now().getFullYear();

    if ( m >= 0 && m < 6 ) {
      this.CardOptions.Valid = 'Agosto ' + y;
    } else if ( m >= 7 && m < 11) {
      this.CardOptions.Valid = 'Diciembre ' + y;
    } else {
      this.CardOptions.Valid = 'Agosto ' + (y + 1);
    }

			if(this.Id > 0)
				this.GetUserInfo();
		} else {
			this.S.ShowError('No tienes autorización para modificar' + (this.$.CanDo('applicants') ? ' directamente los ' : '') + ' usuarios', 0);
			this.R.navigate(['/home']);
		}
	}
  public PrintCard() {
    const valid = prompt('Escriba la vigencia para la credencial', this.CardOptions.Valid);
    if (valid !== '') {
      this.CardOptions.Valid = valid;
    }
    setTimeout(() => {this.T.Print('printable-cards', 'print-user');}, 500);
  }
	//#region Getters
		private GetUserInfo()
		{
			//	Mostramos el loading
			this.S.ShowLoading( this.$.Me.id == this.Id ? 'Cargando tus datos...' : 'Obteniendo datos de usuario...' );

			//	Cargamos usuario
			this.W.Web( 'users', 'get',
			'id=' + ( (this.$.isAdmin() && this.$.Me.status == this.$.ACTIVE) ? this.Id : this.$.Me.id ),
			(u)=>
			{
				//	Listo
				this.S.ClearState();

				//	Todo bien?
				if(u.status == this.S.SUCCESS)
				{
					//	Cargamos el usuario en datos
					this.User = u.data;

					//	Sacamos la fecha de nacimiento
					let birthday = new Date(this.User.birthday*1000),
						y = birthday.getFullYear(),
						m = (birthday.getMonth()+1),
						d = birthday.getDate();
					this.HUMAN_BIRTHDAY = y + "-" + ( m > 9 ? m : '0' + m) + "-" + ( d > 9 ? d : '0' + d);

					this.GetPictures(() => {
						this.GetPlatformInfo(() => {
							this.GetStats();
							/*() => {
								this.GetLocation();
							});*/
						});
					});
				}
				else
					this.S.ShowError('Error al obtener información:<br> –' + u.data)
			},
			(e)=> { this.S.ShowError("Se perdió la conexión", 0);});
		}

		ChartData = [];
		ChartLabels = [];
		ChartOptions = { scaleShowVerticalLines: false, responsive: true }
		ChartColors =
		[
			{
				backgroundColor: '#4dabf5',
				borderColor: '#1769aa',
				hoverBackgroundColor: '#2196f3',
				hoverBorderColor: '#1769aa'
			}
		];
		private GetStats( callback : () => void = () => {} )
		{
			//	Cargamos sus estadisticas, si es que tiene.
			if(this.User.uid > 0)
			{
				//	Cargando...
				this.S.ShowLoading( 'Leyendo actividad...' );

				//	Platica
				this.W.Web('users', 'stats', 'id=' + this.User.uid, (s) =>
				{
					//	Listo!
					this.S.ClearState();

					//	Todo bien?
					if( s.status == this.S.SUCCESS )
					{
						this.ChartLabels = s.data.map( it => it.days + ' ' + it.dates );
						this.ChartData = [{ data: s.data.map( it => it.events ), label: 'Interacciones' }];
						// this.ActivityDays = s.data;
						// this.MaxActivityEvents = Math.max.apply(Math, this.ActivityDays.map( (o) => { return o.events } ));

					}

					callback();

				},
				(e)=> { this.S.ShowError("Se perdió la conexión", 0);});
			}
			else
				callback();
		}
		private GetCourses(callback : () => void = () => {})
		{
			//	Primero estados
			this.S.ShowLoading( 'Cargando cursos...' );

			this.W.Web('categories', 'list', 'type=courses',
			(r) => {

				if( r.status == this.S.SUCCESS )
					this.COURSES = r.data;
				else
					this.COURSES = [];

				this.S.ClearState();
			},
			(e)=> { this.S.ShowError("Se perdió la conexión", 0);});
		}
		private GetPlatformInfo( callback : () => void = () => {} )
		{
			if(this.User.uid < 1){
				callback();
				return;
			}

			//	Mostramos el loading
			this.S.ShowLoading('Cargando vinculo de plataforma...');

			//	Cargamos usuario
			this.W.Web( 'users', 'get-platform',
			'id=' + ( (this.$.isAdmin() && this.$.Me.status == this.$.ACTIVE) ? this.User.uid : this.$.Me.uid ),
			(u)=>
			{
				//	Listo
				this.S.ClearState();

				//	Todo bien?
				if(u.status == this.S.SUCCESS)
				{
					//	Cargamos el usuario en datos
					this.User.platform = u.data;
					callback();
				}
				else
					this.S.ShowError('Error al obtener información:<br> –' + u.data)
			},
			(e)=> { this.S.ShowError("Se perdió la conexión", 0);});
		}
		private GetPictures( callback : () => void = () => {} )
		{
			if(this.User.id < 1){
				callback();
				return;
			}

			//	Mostramos el loading
			this.S.ShowLoading('Obteniendo imagenes...');

			//	Cargamos usuario
			this.W.Web( 'users', 'get-pictures',
			'id=' + ( (this.$.isAdmin() && this.$.Me.status == this.$.ACTIVE) ? this.User.id : this.$.Me.id ),
			(u)=>
			{
				//	Listo
				this.S.ClearState();

				//	Todo bien?
				if(u.status == this.S.SUCCESS)
				{
					//	Cargamos el usuario en datos
					this.Pictures = u.data;
					callback();
				}
				else
					this.S.ShowError('Error al obtener imágenes:<br> –' + u.data)
			},
			(e)=> { this.S.ShowError("Se perdió la conexión", 0);});
		}
	//#endregion
	public Save()
	{
		this.S.ShowLoading('Guardando datos de ' + this.User.firstname + '...');

		if( this.User.firstname != '' && this.User.email != '' && this.User.personal_phone != '')
		{
			this.W.Web('users', 'save', 'data=' + JSON.stringify(this.User), (r) =>
			{
				this.S.ShowSuccess(
					(this.Id > 0
					? 'Se actualizó la información de ' + this.User.firstname
					: 'Se ha creado el expediente de ' + this.User.firstname + ' correctamente, espere...')
				);

				if(r.status == this.S.SUCCESS)
				{
					if(this.Id < 1)
					{
						let go = '/users/' + r.data.uid,
							goto = this.GetOption('goto');

						this.SetOption('goto', '');
						if( goto != '' )
							go = goto + r.data.uid

						setTimeout(() => { this.R.navigate([ go ]); }, 2000 );
					}
					//	Si es el id del usuario, recargamos la aplicacion
					else if( this.Id == this.$.Me.id)
						// location.reload();
						this.$.ngOnInit();
				}
				else
					this.S.ShowError(r.data, 0);
			},
			(e)=> { this.S.ShowError("Se perdió la conexión", 0);});
		}
		else
			this.S.ShowWarning(
				'Algunos campos no deben estar vacios: ' +
				(this.User.firstname ? '': '<br> – Nombre') +
				(this.User.email ? '': '<br> – Correo electrónico') +
				(this.User.personal_phone ? '': '<br> – Teléfono personal')
				,0);
	}
	public SetPicture(Pic, Action = 'set')
	{
		if(Action == 'set')
		{
			if(Pic != this.User.pid)
			{
				this.S.ShowLoading('Cambiando imagen de ' + this.User.firstname + '...');
				this.W.Web('users', 'set-picture',
					'id=' + Pic.id +
					'&action=set' +
					'&uid=' + this.User.id,
				(r) =>
				{
					if(r.status == this.S.SUCCESS)
					{
						this.User.pid = Pic.id;
						this.User.picture = Pic;
            this.S.ClearState();
            this.$.loadUser();
					}
					else
						this.S.ShowError(r.data);
				});
			}
		}
		if(Action == 'delete')
		{
			if(confirm("Esta a punto de eliminar una imagen. ¿Continuar?"))
			{
				this.S.ShowLoading('Borrando imagen de ' + this.User.firstname + '...');
				this.W.Web('users', 'set-picture',
					'id=' + Pic.id +
					'&action=delete' +
					'&uid=' + this.User.id,
				(r) =>
				{
					if(r.status == this.S.SUCCESS)
					{
						if(this.Pictures.length > 1)
						{
							for(let i = 0; i < this.Pictures.length; i++)
								if(this.Pictures[i].id == Pic.id)
								{
									this.Pictures.splice(i, i+1);
									break;
								}

							if(this.User.pid == Pic.id)
							{
								this.User.pid = this.Pictures[0].id;
								this.User.picture = this.Pictures[0];
							}
						}
						else
						{
							this.Pictures = [];
							this.User.picture = null;
							this.User.pid = 0;
						}
						this.S.ShowSuccess(r.data);
					}
					else
						this.S.ShowError(r.data);
				});
			}
		}
	}
	public UploadPicture(event)
	{
		//	Si se ha seleccionado un archivo
		if(event.target.files.length)
		{
			//	Empecemos...
			let file = event.target.files[0];
			this.S.ShowLoading("Subiendo archivo " + file.name + "...");

			//	Checamos que pese lo correcto
			if( file.size > 3072000 )
				this.S.ShowError("El archivo es mas grande lo permitido");

			else
			{
				//	Preparamos el lector de archivos
				let	reader = new FileReader();

				//	Le pegamos el evento...
				reader.onload = () =>
				{
					//	Preparamos el envio
					let data =
					{
						content: reader.result,
						name:  file.name
					};

					//	Lo enviamos...
					this.W.Web('users', 'upload', 'uid=' + this.User.id + '&data=' + JSON.stringify(data), (r) =>
					{
						//	Si todo salio bien, de lujo
						if(r.status == this.S.SUCCESS)
						{
							this.S.ShowSuccess( 'Se ha subido la imagen', 2000 );
							this.User.picture = r.data;
							this.User.pid = r.data.id;
							this.GetPictures(() => {
								this.S.ShowSuccess("Se ha subido la imagen correctamente...");
							 });
						}
						else
							this.S.ShowError(r.data, 0);
					},
					(e)=> { this.S.ShowError("Se perdió la conexión", 0);});
				}

				reader.readAsDataURL(file);
			}
		}
	}
	//#region Setters
		public HUMAN_BIRTHDAY = "2000-01-01 12:00:00";
		public SetBirthday( )
		{
			let new_date = new Date(this.HUMAN_BIRTHDAY + ' 12:00:00').getTime();
			this.User.birthday = Math.floor( Math.round(new_date/1000) );
		}
		public LevelSetter()
		{
			if(this.User.level < 0)
				this.User.level = 0;
			if(this.User.level > 10)
				this.User.level = 10;
		}
	//#endregion

	//#region Options
		public GetOption(option, context = 'users', def = false){
			return this.C.GetOption(option, context, def);
		}
		public SetOption(option, value, context = 'users'){
			this.C.SetOption(option, value, context);
		}
	//#endregion


	//	For Linker
		LocationSelected(item)
		{
			this.User.location = item !== null ? item : null;
			this.User.lid = item !== null ? item.id : 0;
		}
		InstitutionSelected(item)
		{
			this.User.institution = item !== null ? item : null;
			this.User.iid = item !== null ? item.id : 0;
		}
		UserPlatSelected(item)
		{
			if(item !== null){
				this.User.platform = item;
				this.User.uid = item.id;
				this.GetStats();
			}
			else{
				this.User.platform = null;
				this.User.uid = 0;
			}
		}



	/**
	 * Devuelve un valor si es que este coincide con uno especifico dentro de un array de objetos
	 * @param TheArray El array de objetos que se va a mapear
	 * @param Return El nombre del objeto que se devolverá
	 * @param At El nombre del objeto que se quiere comparar
	 * @param With El valor que se comparará
	 */
	// Map( TheArray, Return, At, With ){
	// 	for(let i = 0; i < TheArray.length; i++)
	// 		if(TheArray[i][At] == With)
	// 			return TheArray[i][Return];
	// }

}
