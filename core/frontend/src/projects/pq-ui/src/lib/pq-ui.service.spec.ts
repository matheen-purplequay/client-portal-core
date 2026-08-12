import { TestBed } from '@angular/core/testing';

import { PqUiService } from './pq-ui.service';

describe('PqUiService', () => {
  let service: PqUiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PqUiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
