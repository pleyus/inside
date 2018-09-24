import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewNormalComponent } from './view-normal.component';

describe('ViewNormalComponent', () => {
  let component: ViewNormalComponent;
  let fixture: ComponentFixture<ViewNormalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewNormalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewNormalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
