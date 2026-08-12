import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppMasterComponent } from './app-master.component';

describe('AppMasterComponent', () => {
  let component: AppMasterComponent;
  let fixture: ComponentFixture<AppMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppMasterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
