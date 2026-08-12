import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectReportComponent } from './connect-report.component';

describe('ConnectReportComponent', () => {
  let component: ConnectReportComponent;
  let fixture: ComponentFixture<ConnectReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConnectReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConnectReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
