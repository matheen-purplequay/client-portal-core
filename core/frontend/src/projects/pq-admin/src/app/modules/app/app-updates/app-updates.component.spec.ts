import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppUpdatesComponent } from './app-updates.component';

describe('AppUpdatesComponent', () => {
  let component: AppUpdatesComponent;
  let fixture: ComponentFixture<AppUpdatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppUpdatesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppUpdatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
