import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardGroupDirectorComponent } from './dashboard-group-director.component';

describe('DashboardGroupDirectorComponent', () => {
  let component: DashboardGroupDirectorComponent;
  let fixture: ComponentFixture<DashboardGroupDirectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardGroupDirectorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardGroupDirectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
