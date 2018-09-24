import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RadioAnnouncersComponent } from './announcers.component';

describe('AnnouncersComponent', () => {
  let component: RadioAnnouncersComponent;
  let fixture: ComponentFixture<RadioAnnouncersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RadioAnnouncersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RadioAnnouncersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
