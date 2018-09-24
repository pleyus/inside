import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkerComponent } from './linker.component';

describe('LinkerComponent', () => {
  let component: LinkerComponent;
  let fixture: ComponentFixture<LinkerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LinkerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LinkerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
