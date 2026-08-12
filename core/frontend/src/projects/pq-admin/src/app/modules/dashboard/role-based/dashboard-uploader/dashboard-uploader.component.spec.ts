import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardUploaderComponent } from './dashboard-uploader.component';

describe('DashboardUploaderComponent', () => {
  let component: DashboardUploaderComponent;
  let fixture: ComponentFixture<DashboardUploaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DashboardUploaderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardUploaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
