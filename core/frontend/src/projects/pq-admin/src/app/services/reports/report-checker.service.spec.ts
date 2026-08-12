import { TestBed } from '@angular/core/testing';

import { ReportCheckerService } from './report-checker.service';

describe('ReportCheckerService', () => {
  let service: ReportCheckerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReportCheckerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
