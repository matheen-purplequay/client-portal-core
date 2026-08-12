import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportsMasterComponent } from './reports-master.component';

describe('ReportsMasterComponent', () => {
  let component: ReportsMasterComponent;
  let fixture: ComponentFixture<ReportsMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportsMasterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportsMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
