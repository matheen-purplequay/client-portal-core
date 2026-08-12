import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportsUploadComponent } from './reports-upload.component';

describe('ReportsUploadComponent', () => {
  let component: ReportsUploadComponent;
  let fixture: ComponentFixture<ReportsUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportsUploadComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportsUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
