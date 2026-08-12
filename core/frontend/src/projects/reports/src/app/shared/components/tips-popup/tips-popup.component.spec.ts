import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TipsPopupComponent } from './tips-popup.component';

describe('TipsPopupComponent', () => {
  let component: TipsPopupComponent;
  let fixture: ComponentFixture<TipsPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TipsPopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TipsPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
