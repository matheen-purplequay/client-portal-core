import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardRealtimeComponent } from './dashboard-realtime.component';

describe('DashboardRealtimeComponent', () => {
  let component: DashboardRealtimeComponent;
  let fixture: ComponentFixture<DashboardRealtimeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardRealtimeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardRealtimeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
