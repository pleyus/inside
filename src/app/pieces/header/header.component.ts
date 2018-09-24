import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  LogoUrl = 'https://www.bsale.com.au/catalogues/140104/entrevo-keypersonofinfluence-get-discovered-on-google_390x290.jpg';
  SchoolName = 'Inside School';
  constructor() { }

  ngOnInit() {
  }

}
