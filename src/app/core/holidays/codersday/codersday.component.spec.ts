import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CodersdayComponent } from './codersday.component';

describe('CodersdayComponent', () => {
  let component: CodersdayComponent;
  let fixture: ComponentFixture<CodersdayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CodersdayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CodersdayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
