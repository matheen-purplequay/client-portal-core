import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardBsMovementComponent } from './dashboard-bs-movement.component';

describe('DashboardBsMovementComponent', () => {
  let component: DashboardBsMovementComponent;
  let fixture: ComponentFixture<DashboardBsMovementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardBsMovementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardBsMovementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
