import { Component, OnInit } from '@angular/core';
import { AppStatus, WebService, Configuration } from '../app.service';
import { AppComponent } from '../app.component';
import { Router } from '../../../node_modules/@angular/router';
import { shallowEqual } from '../../../node_modules/@angular/router/src/utils/collection';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit {
	Messages = [];
	Message =
	{
		id: 0,
		at: 0,
		firstname: '',
		lastname: '',
		phone: '',
		email: '',
		message: '',
		ip: '',
		seen_at: 0,
		seen_by: 0,
		aid: 0,
		enrolled: false,
		response: ''
	}

	LoadMore = false;

	GetMessages(making = 'get'){
		const search = this.search_string;

		if (making !== 'more')
			this.SetOption('last', 0);

		this.S.ShowLoading
			(
			making === 'search' || search !== ''
				? 'Buscando «' + search + '»...'
				: (making === 'more' ? ' Cargando' : ' Obteniendo ultimos mensajes') + '...'
			);


		// Hablamos con la API
		this.W.Web('messages', 'list',

			// Mandamos el ultimo que tenemos
			'last=' + this.GetOption('last') +

			// Si se esta buscando algo le decimos
			(making === 'search' || search !== '' ? '&s=' + search : ''),


			// Cuando conteste
			(r): void =>
			{
				this.S.ClearState();

				// Revisamos que nos diga 1
				if (r.status === 1)
					if( typeof r.data == 'object' )
					{
						this.Messages =
							making === 'more'
								? this.Messages.concat(r.data)
								: r.data;

						this.LoadMore = r.data.length > 9;
					}
					else
						this.S.ShowWarning('No se pudo completar la consulta. Intente de nuevo en un momento', 0)
				else
					this.S.ShowError(r.data, 0);

				this.SetOption('last', this.Messages.length);

			});
	}
	SelectMessage(index = -1)
	{
		let m = {
			id: 0,
			at: 0,
			firstname: '',
			lastname: '',
			phone: '',
			email: '',
			message: '',
			ip: '',
			seen_at: 0,
			seen_by: 0,
			aid: 0,
			enrolled: false,
			response: ''
		};

		if(index < 0)
			this.Message = m;
		else
		{
			if(this.Messages[index].seen_at > 0)
				this.Message = this.Messages[index];
			else
				this.W.Web('messages', 'seen', 'id=' + this.Messages[index].id,(r) => {

					if(r.status !== this.S.SUCCESS)
						this.S.ShowAlert(r.data, r.status);
					else
					{
						this.Messages[index].seen_at = r.data.at;
						this.Messages[index].seen_by = r.data.uid;
					}
					this.Message = this.Messages[index];

				});
		}
	}

	Timer = null;
	search_string = '';
	Search(e)
	{
		if( e.key.length > 1 && e.keyCode !== 13 && e.keyCode !== 27 && e.keyCode !== 8 && e.keyCode !== 46)
			return;

		if(this.Timer !== null)
			clearTimeout(this.Timer);

		if(e.keyCode === 13 && this.Messages.length > 0){
			this.SelectMessage(this.Messages[0]);
			this.search_string = '';
			this.Messages = [];
			this.S.ClearState();
			return;
		}

		if(this.search_string.length === 0 || e.keyCode === 27)
			this.GetMessages();

		else
			this.Timer = setTimeout(() => { this.GetMessages('search'); } , 500)
	}

	public GetOption(option, context = 'messages', def = false) {
		return this.C.GetOption(option, context, def);
	}
	public SetOption(option, value, context = 'messages') {
		this.C.SetOption(option, value, context);
	}

	Delete()
	{
		if( confirm('Esta a punto de eliminar este mensaje ¿Desea continuar?') ){
			this.W.Web('messages', 'delete', 'id=' + this.Message.id, r => {
				if(r.status === this.S.SUCCESS)
				{
					this.S.ShowSuccess(r.data);
					this.Message = {
						id: 0,
						at: 0,
						firstname: '',
						lastname: '',
						phone: '',
						email: '',
						message: '',
						ip: '',
						seen_at: 0,
						seen_by: 0,
						aid: 0,
						enrolled: false,
						response: ''
					};
					this.GetMessages();
				}
				else
					this.S.ShowAlert(r.data, r.status);
			});
		}
	}
	ToApplicant(){
		if(this.Message.aid > 0)
			this.R.navigate(['/applicants/open/' + this.Message.aid]);
		else
		{
			this.SetOption('pre-fn', this.Message.firstname, 'applicants');
			this.SetOption('pre-ln', this.Message.lastname, 'applicants');
			this.SetOption('pre-ph', this.Message.phone, 'applicants');
			this.SetOption('pre-em', this.Message.email, 'applicants');
			this.SetOption('pre-at', this.Message.at, 'applicants');
			this.SetOption('pre-contact-id', this.Message.id, 'applicants');

			this.R.navigate(['/applicants/open/0']);
		}
	}

	constructor(
		private S: AppStatus,
		private R: Router,
		private $: AppComponent,
		private W: WebService,
		private C: Configuration
	) {
		if( $.CanDo('messages') )
			this.GetMessages();
		else
		{
			S.ShowError( 'No tienes autorización para ver los mensajes', 0 );
			R.navigate(['/home']);
		}
	}

	ngOnInit() {
	}

}
