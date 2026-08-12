import { TestBed } from '@angular/core/testing';

import { CloudMessagingService } from './cloud-messaging.service';

describe('CloudMessagingService', () => {
  let service: CloudMessagingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CloudMessagingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
