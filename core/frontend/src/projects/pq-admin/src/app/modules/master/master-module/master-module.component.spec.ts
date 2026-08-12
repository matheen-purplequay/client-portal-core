import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterModuleComponent } from './master-module.component';

describe('MasterModuleComponent', () => {
  let component: MasterModuleComponent;
  let fixture: ComponentFixture<MasterModuleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MasterModuleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MasterModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
