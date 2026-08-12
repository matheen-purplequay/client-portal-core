import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardLoginActivityComponent } from './dashboard-login-activity.component';

describe('DashboardLoginActivityComponent', () => {
  let component: DashboardLoginActivityComponent;
  let fixture: ComponentFixture<DashboardLoginActivityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardLoginActivityComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardLoginActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
