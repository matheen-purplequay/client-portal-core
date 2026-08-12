import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColorsMasterManagementComponent } from './colors-master-management.component';

describe('ColorsMasterManagementComponent', () => {
  let component: ColorsMasterManagementComponent;
  let fixture: ComponentFixture<ColorsMasterManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ColorsMasterManagementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ColorsMasterManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
