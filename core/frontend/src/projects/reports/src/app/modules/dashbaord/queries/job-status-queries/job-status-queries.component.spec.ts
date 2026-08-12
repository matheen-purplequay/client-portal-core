import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobStatusQueriesComponent } from './job-status-queries.component';

describe('JobStatusQueriesComponent', () => {
  let component: JobStatusQueriesComponent;
  let fixture: ComponentFixture<JobStatusQueriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobStatusQueriesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobStatusQueriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
