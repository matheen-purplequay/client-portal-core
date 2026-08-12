import { TestBed } from '@angular/core/testing';

import { TipsPopupService } from './tips-popup.service';

describe('TipsPopupService', () => {
  let service: TipsPopupService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TipsPopupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
