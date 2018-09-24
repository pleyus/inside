import { Component } from '@angular/core';
import { AppComponent } from '../../app.component';
import { WebService, Tools, AppStatus, Configuration } from '../../app.service';
import { Router } from '@angular/router';

@Component({ 
  selector: 'radio-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class RadioMessagesComponent {
	Mensajes = [];
	Updater = null;
	RELATED = {listid: ''}
	LoadMore = false;
	
	public GetMessages( making = 'get' ) : void
	{
		let send_at = '';
		
		//	Si estamos actualizando solamente la lista de mensajes
		if(making == 'update'){
			if(this.Mensajes.length > 0)	//checamos que haya mensajes mostrandose
				// Si los hay tomamos la fecha del primero y la enviamos para obtener los mas recientes.
				send_at = '&at=' + this.Mensajes[0].at;
			else
				//	Si no solo terminamos...
				return;
		}
		else
			this.S.ShowLoading('Cargando mensajes' + (making == 'more' ? ' anteriores' : '') + '...');

		//	Si se e
		if(making == 'get')
			this.SetOption('last', 0);
		

		//	Hablamos con la API
		this.W.Web( "radio", 'list-messages', 
		
		//	Mandamos el ultimo que tenemos
		'last=' + this.GetOption('last') +
		
		//	Mandamos send_at, si es que tiene algo...
		send_at,


		//	Cuando conteste
		(r) :void =>
		{
			this.S.ClearState();
			
			//	Revisamos que nos diga 1
			if(r.status == 1)
			{
				this.Mensajes = 
					making == 'more'	// Si se estan cargando mas
					? this.Mensajes.concat(r.data)	// Concatenamos los actuales + antiguos
					: (
						making == 'update'	//	Si se esta actualizando 
						? [].concat(r.data, this.Mensajes)	//	Concatenamos los nuevos + actuales
						: r.data	//	Sino, solo asignamos los mensajes
					);
				
				//	Altualizamos nuestro ultimo mensaje leido
				if(this.Mensajes.length > 0){
					this.SetOption('lmt', this.Mensajes[0].at);
					this.S.UpdateNews();
				}
			}

			//	Si no, mostramos el mensaje
			else
				this.S.ShowError(r.data, 0);

				
			this.SetOption('last', this.Mensajes.length );
			//	En caso de que se este actualizando, loadmore no cambia, sino si
			this.LoadMore = making == 'update' ? this.LoadMore : r.data.length >= 10 ;
			
		}); 
	}

	GetOption(option, context = 'radio', def = false){
		return this.C.GetOption(option, context, def);
	}
	SetOption(option, value, context = 'radio'){
		this.C.SetOption(option, value, context); 
	}

	ShowMe(M)
	{
		if(M == this.RELATED)
			this.RELATED = {listid: ''};
		else
			this.RELATED = M;
	}
	Ban(M){
		if(confirm("Está a pundo de " + (M.status == 0 ? '' : 'des') + "bloquear los mensajes de " + M.name + "." +
		(M.status == 0 
			? "Esto no garantiza que dejará de comunicarse ya que aun puede comunicarse desde otro dispositivo."
			: "Ya podrá enviar mensajes nuevamente"
		) + "¿Continuar?"))
		{
			this.S.ShowLoading( (M.status == 0 ? 'B' : 'Desb') + 'loqueando a ' + M.name + '. Espere...');
			this.W.Web('radio', 'toggle-ban-state', 'listid=' + M.listid, r => {
				if(r.status == 1)
				{
					this.Mensajes.forEach( (v,i) => {
						if(v.listid == M.listid)
							v.status = v.status == 1 ? 0 : 1;
					});
				}
				this.S.ShowAlert(r.data, r.status);
			});
		}
	}

	constructor(
		private $ : AppComponent,
		private W : WebService,
		private T : Tools,
		private R : Router,
		private S: AppStatus,
		private C: Configuration
	) 
	{ 
		if( ($.isAdmin() && $.CanDo('radio')) || $.Me.radio.length > 0 )
		{
			this.C.SetOption('selected.tab', 'messages', 'radio');
			this.$.ST.radio = 'messages';
			
			this.GetMessages();

			if(this.$.Updaters.radioMessages != null)
				clearInterval(this.$.Updaters.radioMessages);
			
			this.$.Updaters.radioMessages = setInterval( ()=>{ 
				if( this.$.isActive(['/radio', 'messages']) )
					this.GetMessages('update');
			}, 5000 );
		}
		else
		{
			S.ShowError('No tienes autorización para leer los mensajes de radio', 0);
			R.navigate(['/home']);
		}
	}
}
