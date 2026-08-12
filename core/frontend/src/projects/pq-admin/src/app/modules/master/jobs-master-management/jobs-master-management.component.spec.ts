import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobsMasterManagementComponent } from './jobs-master-management.component';

describe('JobsMasterManagementComponent', () => {
  let component: JobsMasterManagementComponent;
  let fixture: ComponentFixture<JobsMasterManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobsMasterManagementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobsMasterManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
