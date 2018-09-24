import { Component } from '@angular/core';
import { AppComponent } from '../app.component';
import { Router } from '@angular/router';
import { AppStatus } from '../app.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class CategoriesListComponent {
	Title = "Administrador de Categorias";

	constructor(
		public $ : AppComponent,
		private R : Router,
		private S : AppStatus
	) 
	{ 
		if(!$.isAdmin())
		{
			this.S.ShowError('Solo los administradores pueden entrar a las categorías', 2000);
			this.R.navigate(['/home']);
		}
		//this.$.SetOption('selected.tab', 'institution', 'categories');
	}

}
