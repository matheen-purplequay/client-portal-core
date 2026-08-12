import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemHomeComponent } from './system-home.component';

describe('SystemHomeComponent', () => {
  let component: SystemHomeComponent;
  let fixture: ComponentFixture<SystemHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SystemHomeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SystemHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
