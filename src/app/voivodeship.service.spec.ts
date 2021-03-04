import { TestBed } from '@angular/core/testing';

import { VoivodeshipService } from './voivodeship.service';

describe('VoivodeshipService', () => {
  let service: VoivodeshipService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VoivodeshipService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
