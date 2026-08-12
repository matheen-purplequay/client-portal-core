import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveQueriesComponent } from './approve-queries.component';

describe('ApproveQueriesComponent', () => {
  let component: ApproveQueriesComponent;
  let fixture: ComponentFixture<ApproveQueriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApproveQueriesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApproveQueriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
