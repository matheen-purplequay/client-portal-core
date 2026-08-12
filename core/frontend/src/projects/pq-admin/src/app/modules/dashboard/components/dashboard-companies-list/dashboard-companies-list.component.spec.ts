import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardCompaniesListComponent } from './dashboard-companies-list.component';

describe('DashboardCompaniesListComponent', () => {
  let component: DashboardCompaniesListComponent;
  let fixture: ComponentFixture<DashboardCompaniesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardCompaniesListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardCompaniesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
