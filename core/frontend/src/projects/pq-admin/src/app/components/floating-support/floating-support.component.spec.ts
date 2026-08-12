import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FloatingSupportComponent } from './floating-support.component';

describe('FloatingSupportComponent', () => {
  let component: FloatingSupportComponent;
  let fixture: ComponentFixture<FloatingSupportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FloatingSupportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FloatingSupportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
