import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemMasterComponent } from './system-master.component';

describe('SystemMasterComponent', () => {
  let component: SystemMasterComponent;
  let fixture: ComponentFixture<SystemMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SystemMasterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SystemMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
