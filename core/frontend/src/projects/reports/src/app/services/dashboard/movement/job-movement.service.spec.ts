import { TestBed } from '@angular/core/testing';

import { JobMovementService } from './job-movement.service';

describe('JobMovementService', () => {
  let service: JobMovementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JobMovementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
