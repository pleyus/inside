
import { Component } from '@angular/core';
import { WebService } from '../../services/web-service';

@Component({
  selector: 'app-file-manager',
  templateUrl: './file-manager.component.html',
  styleUrls: ['./file-manager.component.css']
})
export class FileManagerComponent {

  FileList: FileList;

  constructor(private W: WebService) { }

  onSelectedFile(event) {
    if (event.target.files.length > 0) {
      this.W.Upload(event.target.files[0], '');
    }
  }
}
