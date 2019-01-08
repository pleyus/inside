import { Component } from '@angular/core';
import { AppComponent } from '../../app.component';
import { WebService, AppStatus, Configuration } from '../../app.service';

@Component({
  selector: 'app-applicant-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.css']
})
export class ApplicantsStatsComponent {

  readonly COLOR_BLUE = {
    backgroundColor: '#009ec988',
    hoverBackgroundColor: '#009ec9',
    borderColor: '#009ec9',
    pointBackgroundColor: '#009ec988',
    pointBorderColor: '#fff',
    pointHoverBackgroundColor: '#fff',
    pointHoverBorderColor: '#009ec9BB'
  };
  readonly COLOR_BOO = {
    backgroundColor: '#009ec922',
    borderColor: '#009ec9',
    pointBackgroundColor: '#009ec922',
    pointBorderColor: '#fff',
    pointHoverBackgroundColor: '#fff',
    pointHoverBorderColor: '#009ec9BB'
  };
  readonly COLOR_LAD = {
    backgroundColor: '#ff910022',
    borderColor: '#ff9100',
    pointBackgroundColor: '#ff910022',
    pointBorderColor: '#fff',
    pointHoverBackgroundColor: '#fff',
    pointHoverBorderColor: '#ff9100BB'
  };
  readonly COLOR_LAG = {
    backgroundColor: '#004a0022',
    borderColor: '#004a00',
    pointBackgroundColor: '#004a0022',
    pointBorderColor: '#fff',
    pointHoverBackgroundColor: '#fff',
    pointHoverBorderColor: '#004a00BB'
  };
  readonly COLOR_LCO = {
    backgroundColor: '#466f7b22',
    borderColor: '#466f7b',
    pointBackgroundColor: '#466f7b22',
    pointBorderColor: '#fff',
    pointHoverBackgroundColor: '#fff',
    pointHoverBorderColor: '#466f7bBB'
  };
  readonly COLOR_LDE = {
    backgroundColor: '#62391d22',
    borderColor: '#62391d',
    pointBackgroundColor: '#62391d22',
    pointBorderColor: '#fff',
    pointHoverBackgroundColor: '#fff',
    pointHoverBorderColor: '#62391dBB'
  };
  readonly COLOR_LSC = {
    backgroundColor: '#9f0b0722',
    borderColor: '#9f0b07',
    pointBackgroundColor: '#9f0b0722',
    pointBorderColor: '#fff',
    pointHoverBackgroundColor: '#fff',
    pointHoverBorderColor: '#9f0b07BB'
  };
  readonly COLOR_LTS = {
    backgroundColor: '#54006c22',
    borderColor: '#54006c',
    pointBackgroundColor: '#54006c22',
    pointBorderColor: '#fff',
    pointHoverBackgroundColor: '#fff',
    pointHoverBorderColor: '#54006cBB'
  };
  readonly COLOR_ROSA = {
    backgroundColor: '#F28CF988',
    borderColor: '#F28CF9',
    pointBackgroundColor: '#F28CF9',
    pointBorderColor: '#fff',
    pointHoverBackgroundColor: '#fff',
    pointHoverBorderColor: '#F28CF9'
  };
  readonly COLOR_GRIS = {
    backgroundColor: '#666666AA',
    borderColor: '#666666AA',
    pointBackgroundColor: '#666666AA',
    pointBorderColor: '#fff',
    pointHoverBackgroundColor: '#fff',
    pointHoverBorderColor: '#666666AA'
  };

  OP_SCALES = {
    yAxes: [ {
        ticks: {
          min: 0,
          beginAtZero: true,
          callback: (value, index, values) => {
            if (Math.floor(value) === value) {
              return value;
            }
          }
        }
      }
    ]
  };

  RegistredData = [];
  RegistredLabels = [];
  RegistredColor = []; // Para la de dona

  ViasData = [];
  ViasLabels = [];

  InterestedData = [];
  InterestedColor = [];
  InterestedLabels = [];

  TownsData = [];
  TownsLabels = [];

  TownsEnrollData = [];
  TownsEnrollLabels = [];

  V = 'register';

  DATE_SINCE = this.$.Now().getFullYear() + '-01-01';
  DATE_UNTIL = this.$.Now().getFullYear() + '-01-01';
  REG_LINE = true;

  INTERES = [];
  TYPE = 'gen';
  VIAS = [];
  VIASTYPE = 'gen';

  EspColor(esp) {
    if (esp.indexOf('Bachi') > -1 || esp.indexOf('Prep') > -1) {
      return this.COLOR_BOO.borderColor;
    } else if (esp.indexOf('Admin') > -1) {
        return this.COLOR_LAD.borderColor;
      } else if (esp.indexOf('Agro') > -1) {
          return this.COLOR_LAG.borderColor;
        } else if (esp.indexOf('Cont') > -1) {
            return this.COLOR_LCO.borderColor;
          } else if (esp.indexOf('Dere') > -1) {
              return this.COLOR_LDE.borderColor;
            } else if (esp.indexOf('Siste') > -1) {
                return this.COLOR_LSC.borderColor;
              } else if (esp.indexOf('Trab') > -1) {
                  return this.COLOR_LTS.borderColor;
                } else {
                  return this.COLOR_GRIS.borderColor;
                }
  }

  View(option) {
    this.V = option;
    this.SetOption('stats.view', option);
  }
  isView(option) {
    return this.V === option;
  }

  Update() {
    this.SetOption('stats.since', this.DATE_SINCE);
    this.SetOption('stats.until', this.DATE_UNTIL);

    this.RegistredData = [];
    this.RegistredLabels = [];

    this.ViasData = [];
    this.ViasLabels = [];

    this.InterestedData = [];
    this.InterestedColor = [];
    this.InterestedLabels = [];

    this.TownsData = [];
    this.TownsEnrollData = [];
    this.TownsEnrollLabels = [];
    this.TownsLabels = [];

    this.S.ShowLoading('Cargando estadisticas...');

    this.W.Web('applicants', 'stats', 'since=' + this.DATE_SINCE + '&until=' + this.DATE_UNTIL,
      (r) => {
        this.S.ClearState();

        if (r.status === this.S.SUCCESS) {
          this.ProcessData(r.data);
        } else {
          this.S.ShowAlert(r.data, r.status);
        }
      }
    );
  }

  ProcessData(data) {
    const reg = data.register,
          townsbrute = data.towns.sort( (current, next) => next.total * 1 - current.total * 1 ).slice(0, 10),
          townsenroll = data.towns.sort( (current, next) => next.enrolled * 1 - current.enrolled * 1 ).slice(0, 10);


    //  Register
      let e = 0, r = 0, a = 0, x = 0;
      if (reg.length > 1) {
        this.REG_LINE = true;
        this.RegistredLabels = reg.map( i => i.month.substring(0, 3) + ' / ' + i.year );
        this.RegistredData = [
          { data: reg.map( i => { e += i.enrolled * 1; return 1 * i.enrolled; } ),
            label: 'Inscritos (' + e + ')', lineTension: 0, fill: false },
          { data: reg.map( i => { r += i.retired * 1; return 1 * i.retired; }),
            label: 'Dados de baja (' + r + ')', lineTension: 0, fill: false },
          { data: reg.map( i => { a += i.applicants * 1; return 1 * i.applicants; }),
            label: 'Aspirantes (' + a + ')', lineTension: 0, fill: false },
          { data: reg.map( i => { x += i.excluded * 1; return 1 * i.excluded; }),
            label: 'Excluidos (' + x + ')', lineTension: 0, fill: false },
        ];

      } else if (reg.length === 1) {
        this.REG_LINE = false;
        this.RegistredData = [
          reg[0].enrolled * 1,
          reg[0].retired * 1,
          reg[0].applicants * 1,
          reg[0].excluded * 1,
        ];
        this.RegistredLabels = ['Inscritos (' + this.RegistredData[0] + ')',
        'Dados de baja (' + this.RegistredData[1] + ')',
        'Aspirantes (' + this.RegistredData[2] + ')',
        'Excluidos (' + this.RegistredData[3] + ')'];

        this.RegistredColor = [ {
          backgroundColor: [
            this.COLOR_LAD.borderColor + 'AA',
            this.COLOR_LSC.borderColor + 'AA',
            this.COLOR_BOO.borderColor + 'AA',
            this.COLOR_GRIS.borderColor + 'AA'
          ],
          hoverBackgroundColor: [
            this.COLOR_LAD.borderColor,
            this.COLOR_LSC.borderColor,
            this.COLOR_BOO.borderColor,
            this.COLOR_GRIS.borderColor
          ]
        }];
      }
    //  Vias
      this.VIAS = data.vias;
      this.Vias();

    //  Intereses
      this.INTERES = data.interested;
      this.Interes();

    //  Pueblos
      this.TownsData = [{ data: townsbrute.map(i => i.total * 1), label: 'Top 10 origen de registros' }];
      this.TownsEnrollData = [{ data: townsenroll.map(i => i.enrolled * 1), label: 'Top 10 origen de inscritos' }];

    this.TownsLabels = townsbrute.map(i => i.municipios);
    this.TownsEnrollLabels = townsenroll.map(i => i.municipios);
  }

  Interes(type = 'gen') {
    this.TYPE = type;
    this.InterestedColor = this.InterestedData = this.InterestedLabels = [];

    this.InterestedLabels = this.INTERES.map( i => '' + i.course );
    this.InterestedColor = [{
      backgroundColor: this.INTERES.map(i => this.EspColor(i.course) + 'AA'),
      hoverBackgroundColor: this.INTERES.map(i => this.EspColor(i.course))
    }];

    if (type === 'gen') {
      this.InterestedData = this.INTERES.map( i => i.total);
    } else if ( type === 'male' ) {
      this.InterestedData = this.INTERES.map( i => i.sex_male);
    } else if ( type === 'female' ) {
      this.InterestedData = this.INTERES.map( i => i.sex_female);
    } else if ( type === 'undefined' ) {
      this.InterestedData = this.INTERES.map( i => i.sex_undefined);
    }
  }


  Vias(type = 'gen') {
    this.VIASTYPE = type;
    this.ViasData = [];

    this.ViasData = this.VIAS.map(i => {
      return {
        data: [
          (type === 'gen'
          ? i.total
          : (type === 'enrolled'
          ? i.enrolled
          : (type === 'retired'
          ? i.retired
          : (type === 'applicants'
          ? i.applicants
          : (type === 'excluded'
          ? i.excluded : 0)))))],
        label: i.via,
        lineTension: 0,
        fill: false
      };
    });
  }

  constructor(
    public $: AppComponent,
    private S: AppStatus,
    private W: WebService,
    private C: Configuration
  ) {
    this.V = this.GetOption('stats.view');
    this.DATE_SINCE = this.GetOption('stats.since');
    this.DATE_UNTIL = this.GetOption('stats.until');

    // Para los filtros
    if (this.DATE_UNTIL === '') {
      const y: any = this.$.Now().getFullYear();
      let m: any = this.$.Now().getMonth() + 1,
          d: any = this.$.Now().getDate();
      m = m > 9 ? m : '0' + m;
      d = d > 9 ? d : '0' + d;

      this.DATE_UNTIL = y + '-' + m + '-' + d;
    }
    if ( this.DATE_SINCE === '') {
      this.DATE_SINCE = this.$.Now().getFullYear() + '-01-01';
    }
    //  LoadStats
      this.Update();
  }

  public GetOption(option, context = 'applicants', def = false) {
    return this.C.GetOption(option, context, def);
  }
  public SetOption(option, value, context = 'applicants') {
    this.C.SetOption(option, value, context);
  }
}
