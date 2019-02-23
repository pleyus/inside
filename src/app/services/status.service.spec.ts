import { TestBed } from '@angular/core/testing';

import { InsideListenerService } from './inside-listener.service';

describe('InsideListenerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: InsideListenerService = TestBed.get(InsideListenerService);
    expect(service).toBeTruthy();
  });
});
