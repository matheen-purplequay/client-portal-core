import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardQueryRepliesComponent } from './card-query-replies.component';

describe('CardQueryRepliesComponent', () => {
  let component: CardQueryRepliesComponent;
  let fixture: ComponentFixture<CardQueryRepliesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CardQueryRepliesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardQueryRepliesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
