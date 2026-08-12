import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardReportCountsComponent } from './dashboard-report-counts.component';

describe('DashboardReportCountsComponent', () => {
  let component: DashboardReportCountsComponent;
  let fixture: ComponentFixture<DashboardReportCountsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardReportCountsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardReportCountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
