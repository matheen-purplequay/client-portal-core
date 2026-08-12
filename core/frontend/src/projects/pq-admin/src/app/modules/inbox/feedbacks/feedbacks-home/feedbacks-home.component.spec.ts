import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedbacksHomeComponent } from './feedbacks-home.component';

describe('FeedbacksHomeComponent', () => {
  let component: FeedbacksHomeComponent;
  let fixture: ComponentFixture<FeedbacksHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FeedbacksHomeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeedbacksHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
