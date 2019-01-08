import { Component, OnInit } from '@angular/core';
import { AppComponent } from 'src/app/app.component';
import { Router } from '@angular/router';
import { WebService, AppStatus, Configuration } from 'src/app/app.service';

@Component({
  selector: 'app-vias',
  templateUrl: './vias.component.html',
  styleUrls: ['./vias.component.css']
})
export class ViasComponent {
  public Category = { id: 0, name: '', slug: '', param1: '', type: 0, status: 0 };
  public List = [];

  constructor(
    public $: AppComponent,
    private W: WebService,
    private R: Router,
    private S: AppStatus,
    private C: Configuration) {
      if ($.CanDo('vias') ) {
        this.init();
      } else {
        S.ShowError('No tienes permiso para modificar las vias de difusión, solicita permiso con un administrador', 0);
        R.navigate(['/home']);
      }
  }
  init() {
    this.SetCategory();
    this.GetCategories();
  }
  public Save(): void {
    //  Loading...
    this.S.ShowLoading( this.Category.id > 0 ? 'Actualizando via...' : 'Guardando nueva via...' );

    //  Hablamos con la api para que guarde data
    this.W.Web('categories', 'save', 'type=vias&data=' + JSON.stringify(this.Category), (r) => {

      //  Si contesta con 1
      if (r.status === this.S.SUCCESS) {
        //  Mostramos el mensaje de guardado
        this.S.ShowSuccess('¡Elemento guardado!');

        //  Ponemos un temporizador para quitar el mensaje
        this.Category = { id: 0, name: '', slug: '', param1: '', type: 0, status: 0 };
        this.GetCategories();
      } else {
        this.S.ShowError(r.data, 0);
      }

    },
    (e) => { this.S.ShowError('Se perdió la conexión', 0); });
  }
  public Delete(): void {
    if (this.Category.id > 0) {
      if (confirm('Ya no se podrá utilizar este elemento, pero no se borrará por completo. ¿Desea continuar?') ) {
        //  Loading...
        this.S.ShowLoading('Eliminando ' + this.Category.name + '...');

        //  Hablamos con la api para que "borre" al id
        this.W.Web
        ('categories', 'delete', 'id=' + this.Category.id + '&type=vias',
          (r) =>  {
            //  Si contesta con 1
            if (r.status === this.S.SUCCESS) {
              this.S.ShowSuccess('Elemento borrado');
              this.Category = { id: 0, name: '', slug: '', param1: '', type: 0, status: 0 };
              this.GetCategories();
            } else {
              this.S.ShowError(r.data, 0);
            }
          },
          (e) => { this.S.ShowError('Se perdió la conexión', 0); });
      }
    }
  }
  SetCategory(Item = null) {
    if (Item == null) {
      this.Category = { id: 0, name: '', slug: '', param1: '', type: 0, status: 0 };
      return;
    }

    this.Category = {
      id: Item.id,
      name: Item.name,
      slug: Item.slug,
      param1: Item.param1,
      type: Item.type,
      status: Item.status
    };
  }
  public GetCategories( making = 'get' ): void {
    this.S.ShowLoading();

    // Hablamos con la API
    this.W.Web( 'categories', 'list', 'type=vias',

    // Cuando conteste
    (r): void => {
      this.S.ClearState();

      // Revisamos que nos diga 1
      if (r.status === this.S.SUCCESS) {
        if ( typeof r.data === 'object') {
          this.List =
            making === 'more'
            ? this.List.concat(r.data)
            : r.data;
        } else {
          this.S.ShowWarning('No se pudo completar la consulta. Intente de nuevo en un momento', 0);
        }
      } else {
        this.S.ShowError(r.data, 0);
      }

    },
    (e) => { this.S.ShowError('Se perdió la conexión', 0); });
  }

}
