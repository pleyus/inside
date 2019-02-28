
import { Component } from '@angular/core';
import { WebService } from '../../services/web-service';
import { StatusService } from 'src/app/services/status.service';

@Component({
  selector: 'app-file-manager',
  templateUrl: './file-manager.component.html',
  styleUrls: ['./file-manager.component.css']
})
export class FileManagerComponent {

  FileList: FileList;

  constructor(private W: WebService, private S: StatusService) { }

  onSelectedFile(event) {
    if (event.target.files.length > 0) {
      this.W.Upload(event.target.files[0], '');
    }
  }
  public UploadPicture(event) {
    //  Si se ha seleccionado un archivo
    if (event.target.files.length) {
      //  Empecemos...
      const file = event.target.files[0];
      this.S.ShowLoading('Subiendo archivo ' + file.name + '...', -1, 0);

      this.W.Upload(file).subscribe((r) => {
        if (r !== undefined) {
          if (r.status === this.S.PROGRESS) {
            this.S.ShowLoading('Subiendo archivo ' + file.name + '...', -1, r.data);

          } else if (r.status === this.S.SUCCESS) {
            this.S.ShowSuccess('Se ha subido la imagen correctamente...' + r.data);

          } else {
            this.S.ShowAlert(r.data, r.status);
          }
        }
      });

    }
  }
}
