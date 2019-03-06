import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Tools } from '../../app.service';
import { WebService } from '../../services/web-service';
import { Router } from '../../../../node_modules/@angular/router';
import { StatusService } from '../../services/status.service';

@Component({
  selector: 'linker-box',
  templateUrl: './linker.component.html',
  styleUrls: ['./linker.component.css']
})
export class LinkerComponent {
  reset = true;

  //  Alavado Two-Way-Data-Binding
    object_value = null;
    @Output() ObjectChange = new EventEmitter();
    @Input('object') get object() {
      return this.object_value;
    }
    set object(val) {
      this.object_value = val;
      this.ObjectChange.emit(this.object_value);
    }

    //  Parametros extra de la consulta, se le da prioridad a estos sobre @Input() Param
    dynparam = '';
    @Output() ParamChange = new EventEmitter();
    @Input('dynamic-params') get dyn_param() {
      return this.dynparam;
    }
    set dyn_param(val) {
      this.dynparam = val;
      this.ParamChange.emit(this.dynparam);
    }

  @Input('disabled') Disabled = false;
  @Input('required') Required = false;
  @Input('show-image') ShowImage = true;

  search_string = '';
  @Input('placeholder') Placeholder = '';
  @Input('using') Using = '';
  @Input('make') Make = '';
  @Input('params') Params = '';	// Parametros extra de la consulta
  @Input('link') link = ''; // Es el link que se le asignará al momento de seleccionar un elemento
  @Input('iusing') iusing = ''; //  Reemplaza el Using de imagenes /upload/{Using}/ por otro

  @Input('button1.caption') Button1Text = '';
  @Input('button2.caption') Button2Text = '';
  @Input('button1.link') Button1Link = '';
  @Input('button1.link.target') Button1Target = '_self';
  @Input('button2.link') Button2Link = '';
  @Input('button2.link.target') Button2Target = '_self';

  @Output('button1.click') Button1Click = new EventEmitter();
  @Output('button2.click') Button2Click = new EventEmitter();
  @Output('pickedup') onSelect = new EventEmitter();


  Items = [];
  isLoading = false;
  private Timer = null;

  r(b) {
    if (b) {
      setTimeout(() => this.reset = b, 250)
    } else {
      this.reset = false;
    }

  } // Parche porque al perder o dar el foco no deja seleccionar
  Search(e) {
    if ( (this.Disabled || e.key.length > 1)
        && e.keyCode !== 13
        && e.keyCode !== 27
        && e.keyCode !== 8
        && e.keyCode !== 46) { return; }

    if (this.Timer !== null) {
      clearTimeout(this.Timer);
    }

    if (e.keyCode === 13 && this.Items.length > 0) {
      this.SelectThis(this.Items[0]);
      this.search_string = '';
      this.Items = [];
      this.S.Clear();
      return;
    }

    if (this.search_string.length === 0 || e.keyCode === 27) {
      this.search_string = '';
      this.Items = [];
      this.S.Clear();
    } else {
      this.isLoading = true;
      this.Timer = setTimeout(() => {
        this.W.Web(this.Using, this.Make,
          's=' + this.search_string
            + (
              this.dynparam.length > 0
                ? '&' + this.dynparam
                : (
                  this.Params.length > 0
                  ? '&' + this.Params
                  : ''
                )
            )
          , (r) => {
            this.isLoading = false;
            if (r.status === this.S.SUCCESS) {
              this.Items = r.data;
            }
          });
      } , 500);
    }
  }
  SelectThis(item = null) {
    if (this.Disabled) { return; }

    if (item !== null) {
      this.Items = [];
      this.search_string = '';
    }

    this.object_value = item;
    this.onSelect.emit(item);
  }
  Link(id) {
    this.R.navigate([this.link.replace('$id', id)]);
  }
  constructor(
    private S: StatusService,
    private W: WebService,
    public T: Tools,
    private R: Router
  ) {}
}
