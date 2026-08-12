import { TestBed } from '@angular/core/testing';

import { NetworkFilterService } from './network-filter.service';

describe('NetworkFilterService', () => {
  let service: NetworkFilterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NetworkFilterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
