import { Component } from '@angular/core';
import { StatusService } from '../../services/status.service';

@Component({
  selector: 'app-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.css']
})

export class StatusComponent {
  constructor(public S: StatusService) { }

  ButtonClick(callback: () => void) {
    callback();
    this.S.ClearState();
  }
}
