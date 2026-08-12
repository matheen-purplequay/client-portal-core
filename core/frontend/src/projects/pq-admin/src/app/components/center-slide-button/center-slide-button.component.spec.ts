import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CenterSlideButtonComponent } from './center-slide-button.component';

describe('CenterSlideButtonComponent', () => {
  let component: CenterSlideButtonComponent;
  let fixture: ComponentFixture<CenterSlideButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CenterSlideButtonComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CenterSlideButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
