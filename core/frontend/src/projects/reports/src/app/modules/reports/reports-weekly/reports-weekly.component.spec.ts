import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportsWeeklyComponent } from './reports-weekly.component';

describe('ReportsWeeklyComponent', () => {
  let component: ReportsWeeklyComponent;
  let fixture: ComponentFixture<ReportsWeeklyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportsWeeklyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportsWeeklyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
