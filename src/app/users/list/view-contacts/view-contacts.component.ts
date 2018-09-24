import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Tools } from '../../../app.service';

@Component({
  selector: 'users-contacts-view',
  templateUrl: './view-contacts.component.html',
  styleUrls: ['./view-contacts.component.css']
})
export class UsersContactsViewComponent implements OnInit {
	Users = [];
	@Output() _users_change = new EventEmitter();
	@Input('users-list') 
		get user_list(){
			return this.Users;
		}
		set user_list(val){
			this.Users = val;
			this._users_change.emit(this.Users)
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

	constructor(
		public T: Tools
	 ) { }

  ngOnInit() {
  }

}
