import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AppComponent } from '../../../app.component';
import { Tools } from '../../../app.service';

@Component({
  selector: 'users-normal-view',
  templateUrl: './view-normal.component.html',
  styleUrls: ['./view-normal.component.css']
})
export class UsersNormalViewComponent implements OnInit {
	Users = [];

	@Output() _users_change = new EventEmitter();
	@Input('users-list') 
		get user_list(){
			return this.Users;
		}
		set user_list(val){
			if(this.CheckedAll == 1)
				val.map(r => r.checked = 1);

			this.Users = val;
			this._changed_checkers.emit(this.CheckedUsers())
		}

	@Output('changed-checkers') _changed_checkers = new EventEmitter()
	
	CheckedAll = 0;
	CheckAll(){
		this.CheckedAll = this.CheckedAll == 0 ? 1 : 0;
		this.Users = this.Users.map(P => {
			P.checked = this.CheckedAll;
			return P;
		});

		this._changed_checkers.emit(this.CheckedUsers())
	}
	CheckSingle(i){
		this.Users[i].checked = this.Users[i].checked == 1 ? 0 : 1;

		if(this.Checkeds() < this.Users.length)
			this.CheckedAll = 0;
		else
			this.CheckedAll = 1;
		
		this._changed_checkers.emit(this.CheckedUsers())
	}
	CheckedUsers()
	{
		return this.Users.filter((P) => P.checked == 1)
	}
	Checkeds(){
		return this.CheckedUsers().length;
	}
	
	//#region Order
		@Output('onOrder') onOrder = new EventEmitter();
		@Input('order') order = 'DESC';
		@Input('order_by') order_by = 'idnumber';
		Order( column )
		{
			//	Sacamos los valores previos (el orden actual)
			let last_order = this.order,
				last_order_by = this.order_by;
	
			//	Checamos, si la columna es la misma que la anterior
			if(column == this.order_by)
				//	Solo alternamos el order
				this.order = this.order === 'DESC' ? 'ASC' : 'DESC';
	
			//	Si no, ponemos la nueva columna y seteamos a ascendente el orden
			else
			{
				this.order_by = column;
				this.order = 'ASC';
			}
	
			//	Acomodamos la salida mayusculas para el orden y minusculas para el order_by (columna)
			this.order_by = this.order_by.toLowerCase();
			this.order = this.order.toUpperCase();
	
			//	Lanzamos el evento, mandamos el orden anterior y el nuevo
			this.onOrder.emit({ 
				order: this.order, 
				order_by: this.order_by,
				last_order: last_order,
				last_order_by: last_order_by
			});
		}
	//#endregion

	StatusClass = ['active', 'inactive', 'error', 'upgrade', 'special']
	StatusString = ['activo', 'suspendido', 'dado de baja', 'egresado', '']
	public GetTypeString(u) 
	{
		let type = u.type;

		if (type == this.$.T_ADMIN)
			return "Administrativo";

		if (type == this.$.T_QUEST)
			return "Ninguno";

		if (type == this.$.T_LOGGED)
			return "Usuario estándard";

		if (type == this.$.T_STUDENT)
			return u.course ? u.course + ' ' + this.T.Romanize(u.level) : '(Ninguna)';

		if (type == this.$.T_TEACHER)
			return "Docente";

		return "";

	}
	constructor(
		public $: AppComponent,
		public T: Tools
	) { }
	ngOnInit() { }

}
