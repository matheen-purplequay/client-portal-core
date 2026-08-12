import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MastersMasterComponent } from './masters-master.component';

describe('MastersMasterComponent', () => {
  let component: MastersMasterComponent;
  let fixture: ComponentFixture<MastersMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MastersMasterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MastersMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
