import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InlineAlertComponent } from './inline-alert.component';

describe('InlineAlertComponent', () => {
  let component: InlineAlertComponent;
  let fixture: ComponentFixture<InlineAlertComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InlineAlertComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InlineAlertComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
