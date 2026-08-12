import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobQueriesComponent } from './job-queries.component';

describe('JobQueriesComponent', () => {
  let component: JobQueriesComponent;
  let fixture: ComponentFixture<JobQueriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobQueriesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobQueriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
