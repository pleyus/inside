import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { WebService } from './services/web-service';

@Injectable()
export class Tools {
  constructor(@Inject(DOCUMENT) document) {}

  private CharList: string[] = [
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
    'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
    'U', 'V', 'W', 'X', 'Y', 'Z'];

  public Base36(input: number): string {
    if (input < 0) {
      return '0';
    }

    let result = '';
    while (input !== 0) {
      result += ( this.CharList[ input % 36 ] );
      input = Math.round( input / 36 );
    }

    return result;
  }


  public leapYear(year) {
    return ((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0);
  }
  public isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }


  /**
   * Envia un elemento al impresor principal de la aplicación
   * @param container Es el id del contenedor que se desea imprimir
   * @param css_class La clase que se le asignará al contenedor
   * @param printer El id del elemento que se usara para imprimir
   */
  public Print(container: string, css_class: string = '', printer: string = 'printer') {
    //  Sacamos los elementos
    const from = document.getElementById(container),
      to = document.getElementById(printer);

    //  Preparamos el destino
    to.className = css_class;
    to.innerHTML = from.innerHTML;


    //  Enviamos la impresion
    window.print();


    //  Ahora reseteamos el destino para prepararlo para otra impresion
    to.innerHTML = '';
    to.className = '';
  }

  public Range(Size: number): Array<number> {
    const a = [];
    for (let i = 0; i < Size; i++) {
      a.push(i);
    }
    return a;
  }

  public SepareName( FullName: string ): string[] {
    const Separado = ['', '', ''],
          Tokens = [ 'DE', 'LA', 'DEL', 'LAS', 'LOS', 'Y', 'I', 'SAN', 'SANTA' ];
    let Bloques = FullName.replace('  ', ' ').split( ' ' );

    if ( FullName.trim().length < 4 ) {
      return Separado;
    }

    for (let i = Bloques.length - 1; i >= 0; i--) {
      if ( Tokens.includes(Bloques[i].toUpperCase()) && i < Bloques.length - 1) {
        Bloques[i + 1] = Bloques[i]  + ' ' + Bloques[i + 1];
        Bloques.slice(i, 1);
      }
    }

    Bloques = Bloques.reverse();

    for (let i = 0; i < Bloques.length; i++) {
      if (i > 1) {
        Separado[2] = (Bloques[i] + ' ' + Separado[2]).replace('  ', ' ').trim();
      } else {
        Separado[i] = Bloques[i].trim();
      }
    }

    return Separado.reverse();
  }
  /**
   * Genera un string aleatorio de tamaño «input»
   * @param input Tamaño del string o string a utilizar
   * @param size  En caso de que input sea string, se necesitará un tamaño para randomizar
   */
  public RandString( input: any, size: number = 0 ): string {
    let rs = '';
    if ( this.isNumeric(input) ) {
      for (let i = 0; i < input; i++) {
        rs += this.CharList[ this.Random(0, this.CharList.length) ];
      }
    } else if ( typeof(input) === 'string' ) {
      for (let i = 0; i < size; i++) {
        rs += input[ this.Random(0, input.length) ];
      }
    }
    return rs;
  }
  public Random(min: number, max: number) {
    return Math.floor(Math.random() * max) + min;
  }
  public Romanize(num: number): string {
    if (num === 1) {
      return 'I';
    }
    if (num === 2) {
      return 'II';
    }
    if (num === 3) {
      return 'III';
    }
    if (num === 4) {
      return 'IV';
    }
    if (num === 5) {
      return 'V';
    }
    if (num === 6) {
      return 'VI';
    }
    if (num === 7) {
      return 'VII';
    }
    if (num === 8) {
      return 'VIII';
    }
    if (num === 9) {
      return 'IX';
    }
    if (num === 10) {
      return 'X';
    }

    return '';
  }
  public Age( birthday ) {
    const now = new Date(),
      ageDifMs = now.getTime() - birthday,
      ageDate = new Date(ageDifMs), // miliseconds from epoch
      year = ageDate.getFullYear();

      return Math.abs(year - 1970);

  }
  public HappyB( date ) {
    if (date > 0 || date < 0) {
      const b = new Date(date),
        bd = b.getDate(),
        bm = b.getMonth() + 1,
        t = new Date(),
        td = t.getDate(),
        tm = t.getMonth() + 1,

        now = ('' + tm + td),
        happy = ('' + bm + bd);
      //
      return now === happy;

    }
    return false;
  }

  public CreateUrl( filename: string, using: string ) {

    if (filename === undefined) {
      return '';
    }

    if ( filename === '' || filename === null ) {
      return '';
    }

    if ( filename.indexOf('/') > 0 ) {
      return filename;
    }

    return 'https://unitam.edu.mx/uploads/' + using + '/' + filename;
  }

  private Unidades(num): string {

    switch (num) {
      case 1: return 'UN';
      case 2: return 'DOS';
      case 3: return 'TRES';
      case 4: return 'CUATRO';
      case 5: return 'CINCO';
      case 6: return 'SEIS';
      case 7: return 'SIETE';
      case 8: return 'OCHO';
      case 9: return 'NUEVE';
    }

    return '';
  }

  private Decenas(num): string {
    const decena = Math.floor(num / 10);
    const unidad = num - (decena * 10);

    switch (decena) {
      case 1:
        switch (unidad) {
          case 0: return 'DIEZ';
          case 1: return 'ONCE';
          case 2: return 'DOCE';
          case 3: return 'TRECE';
          case 4: return 'CATORCE';
          case 5: return 'QUINCE';
          default: return 'DIECI' + this.Unidades(unidad);
        }
      case 2:
        switch (unidad) {
          case 0: return 'VEINTE';
          default: return 'VEINTI' + this.Unidades(unidad);
        }
      case 3: return this.DecenasY('TREINTA', unidad);
      case 4: return this.DecenasY('CUARENTA', unidad);
      case 5: return this.DecenasY('CINCUENTA', unidad);
      case 6: return this.DecenasY('SESENTA', unidad);
      case 7: return this.DecenasY('SETENTA', unidad);
      case 8: return this.DecenasY('OCHENTA', unidad);
      case 9: return this.DecenasY('NOVENTA', unidad);
      case 0: return this.Unidades(unidad);
    }
  }

  private DecenasY(strSin: string, numUnidades: number) {
    if (numUnidades > 0) {
      return strSin + ' Y ' + this.Unidades(numUnidades);
    }

    return strSin;
  }

  private Centenas(num): string {
    const centenas = Math.floor(num / 100);
    const decenas = num - (centenas * 100);

    switch (centenas) {
      case 1:
        if (decenas > 0) {
          return 'CIENTO ' + this.Decenas(decenas);
        }
        return 'CIEN';
      case 2: return 'DOSCIENTOS ' + this.Decenas(decenas);
      case 3: return 'TRESCIENTOS ' + this.Decenas(decenas);
      case 4: return 'CUATROCIENTOS ' + this.Decenas(decenas);
      case 5: return 'QUINIENTOS ' + this.Decenas(decenas);
      case 6: return 'SEISCIENTOS ' + this.Decenas(decenas);
      case 7: return 'SETECIENTOS ' + this.Decenas(decenas);
      case 8: return 'OCHOCIENTOS ' + this.Decenas(decenas);
      case 9: return 'NOVECIENTOS ' + this.Decenas(decenas);
    }

    return this.Decenas(decenas);
  }

  private Seccion(num: number, divisor: number, strSingular: string, strPlural: string): string {
    const cientos = Math.floor(num / divisor);
    const resto = num - (cientos * divisor);

    let letras = '';

    if (cientos > 0) {
      if (cientos > 1) {
        letras = this.Centenas(cientos) + ' ' + strPlural;
      } else {
        letras = strSingular;
      }
    }

    if (resto > 0) {
      letras += '';
    }

    return letras;
  }

  private Miles(num): string {
    const divisor = 1000;
    const cientos = Math.floor(num / divisor);
    const resto = num - (cientos * divisor);

    const strMiles = this.Seccion(num, divisor, 'UN MIL', 'MIL');
    const strCentenas = this.Centenas(resto);

    if (strMiles === '') {
      return strCentenas;
    }

    return strMiles + ' ' + strCentenas;
  }

  private Millones(num): string {
    const divisor = 1000000;
    const cientos = Math.floor(num / divisor);
    const resto = num - (cientos * divisor);

    const strMillones = this.Seccion(num, divisor, 'UN MILLON DE', 'MILLONES DE');
    const strMiles = this.Miles(resto);

    if (strMillones === '') {
      return strMiles;
    }

    return strMillones + ' ' + strMiles;
  }

  public NumeroALetras(num): string {
    const data = {
      numero: num,
      enteros: Math.floor(num),
      centavos: (((Math.round(num * 100)) - (Math.floor(num) * 100))),
      letrasCentavos: '',
      letrasMonedaPlural: 'PESOS', //  'PESOS', 'Dólares', 'Bolívares', 'etcs'
      letrasMonedaSingular: 'PESO', //  'PESO', 'Dólar', 'Bolivar', 'etc'
    };

    data.letrasCentavos = data.centavos.toString().padEnd(2, '0') + '/100 MXN';

    if (data.enteros === 0) {
      return 'CERO ' + data.letrasMonedaPlural + ' ' + data.letrasCentavos;
    }
    if (data.enteros === 1) {
      return this.Millones(data.enteros) + ' ' + data.letrasMonedaSingular + ' ' + data.letrasCentavos;
    } else {
      return this.Millones(data.enteros) + ' ' + data.letrasMonedaPlural + ' ' + data.letrasCentavos;
    }
  }
}

@Injectable()
export class Configuration {
  /**
   * Permite comprobar nuevas configuraciones agregadas con actualizaciones
   * @param context Contexto de la configuración
   * @param option Nombre de la opción
   * @param setDefault El valor que se asignará si es que no existe la opción
   * @returns Devuelve true cuando la opción ya esta disponible o false cuando se crea por primera vez
   */
  public RequireOption(context, option, setDefault: any = '') {
    //  Sacamos el valor
    const val = localStorage.getItem(context + '.' + option);

    //  Si se va a asignar un valor porque no viene la opcion, adelante
    if (val === null ) {
      this.SetOption(option, setDefault, context);
    }

    return val !== null;
  }
  /**
   * Elimina opciones que ya no se utilizarán en la aplicación
   * @param context Contexto de la configuración
   * @param option Nombre de la opción
   */
  public DisposeOption(context, option) {
    //  Sacamos el valor
    localStorage.removeItem(context + '.' + option);
  }

  public GetOption(option, context = 'main', def = null) {
    const val = localStorage.getItem( context + '.' + option );

    if (val !== null) {
      const value = val.substring(2);

      if ( val.startsWith('n:') ) {
        return Number(value);
      }
      if (val.startsWith('b:')) {
        return value === 'true';
      }

      return value;
    } else {
      return def;
    }
  }
  public SetOption(option, value, context = 'main') {
    const type = typeof(value),
      val =
        (type === 'number' ? 'n:' + value : '') +
        (type === 'string' ? 's:' + value : '') +
        (type === 'boolean' ? 'b:' + (value === true ? 'true' : 'false') : '');
    localStorage.setItem(context + '.' + option, val);
  }
}
