import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobApproveQueriesComponent } from './job-approve-queries.component';

describe('JobApproveQueriesComponent', () => {
  let component: JobApproveQueriesComponent;
  let fixture: ComponentFixture<JobApproveQueriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobApproveQueriesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobApproveQueriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
