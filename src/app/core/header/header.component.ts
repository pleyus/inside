import { Component, Inject } from '@angular/core';
import { AppComponent } from '../../app.component';
import { DOCUMENT } from '@angular/common';
import { Tools } from '../../app.service';

@Component({
  selector: 'app-core-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  CodersDayText = '';
  chars = '¤AWkjx#$%!?ªÝ@¦÷ƒ£‗¿æ×þµÚ²a¬±ã¾';
  ShowCoder = false;
  EasterEgg = 0;

  Canvas: HTMLCanvasElement;
  Ctx: CanvasRenderingContext2D;
  font_size = 10;
  drops = [];
  columns = 1;
  chinese = '田由甲申甴电甶男甸甹町画甼甽甾甿畀畁畂畃畄畅畆畇畈畉畊畋界畍畎畏畐畑'.split('');
  Interval = null;

  constructor( public $: AppComponent, public T: Tools, @Inject(DOCUMENT) document ) {
    if ($.isCodersDay()) {
      this.CodersDayText = this.T.RandString(this.chars, 8);

      setInterval(() => {
        const i = T.Random(0, 8);
        const l = this.chars[ T.Random(0, this.chars.length - 1) ];
        this.CodersDayText = this.ReplaceAt(this.CodersDayText, i, l);
      }, 50);
    }
  }

  ReplaceAt (str, index, replacement) {
      return str.substr(0, index) + replacement + str.substr(index + replacement.length);
  }
  RunMadafaca() {
    console.log('¡Mira mamá, soy programador! Keep coding (x8)');

    this.ShowCoder = true;
    this.Canvas = <HTMLCanvasElement>document.getElementById('codersday');
    this.Ctx = this.Canvas.getContext('2d');

    //  making the canvas full screen
    this.Canvas.height = window.innerHeight;
    this.Canvas.width = window.innerWidth;

    this.columns = this.Canvas.width / this.font_size; //  number of columns for the rain
    //  an array of drops - one per column
    //  x below is the x coordinate
    //  1 = y co-ordinate of the drop(same for every drop initially)
    for (let x = 0; x < this.columns; x++) {
      this.drops[x] = 1;
    }

    this.Interval = setInterval(() => { this.Draw(); } , 33);
  }
  StopMadafaca() {
    clearInterval(this.Interval);
    this.EasterEgg = 0;
    this.ShowCoder = false;
  }
  Draw() {
    this.Ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    this.Ctx.fillRect(0, 0, this.Canvas.width, this.Canvas.height);

    this.Ctx.fillStyle = '#0F0'; //  green text
    this.Ctx.font = this.font_size + 'px arial';
    for (let i = 0; i < this.drops.length; i++) {
      const text = this.chinese[Math.floor(Math.random() * this.chinese.length)];
      this.Ctx.fillText(text, i * this.font_size, this.drops[i] * this.font_size);

      if (this.drops[i] * this.font_size > this.Canvas.height && Math.random() > 0.975) {
        this.drops[i] = 0;
      }

      this.drops[i]++;
    }
  }
}
