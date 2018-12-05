import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-checkin',
  templateUrl: './checkin.component.html',
  styleUrls: ['./checkin.component.css']
})
export class CheckinComponent implements OnInit {
  public Sessions = [
    {
      h: 7, m: 0,
      subject: 'Programación Orientada a Objetos II',
      teacher: 'Harim Felix Perez',
      classroom: 'Aula 4', course: 'Sistemas', level: 'III',
      checkin: 0
    },
    {
      h: 16, m: 40,
      subject: 'Base de datos I',
      teacher: 'Harim Felix Perez',
      classroom: 'Aula 8', course: 'Sistemas', level: 'VII',
      checkin: 0
    },
    {
      h: 14, m: 30,
      subject: 'Puericultura',
      teacher: 'Mary Sanjuan Briceño',
      classroom: 'Aula 2', course: 'Trabajo Social', level: 'V',
      checkin: 0
    },
    {
      h: 7, m: 0,
      subject: 'Matemáticas',
      teacher: 'Armando Cisneros Chupachups',
      classroom: 'Aula 3', course: 'Bachillerato', level: 'I',
      checkin: 0
    },
  ];
  public Session = null;

  public CheckIn(item, inout) {
    // Si viene 1 o 2 // 1: Ok  2: No
    if (inout !== 0) {
      item.checkin = inout === item.checkin ? 0 : inout;
    }
    this.Session = item;
  }
  constructor() { }

  ngOnInit() {
  }

}
