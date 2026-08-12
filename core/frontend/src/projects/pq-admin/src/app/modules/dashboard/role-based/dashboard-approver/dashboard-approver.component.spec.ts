import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardApproverComponent } from './dashboard-approver.component';

describe('DashboardApproverComponent', () => {
  let component: DashboardApproverComponent;
  let fixture: ComponentFixture<DashboardApproverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardApproverComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardApproverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
