import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardQueryMetaComponent } from './card-query-meta.component';

describe('CardQueryMetaComponent', () => {
  let component: CardQueryMetaComponent;
  let fixture: ComponentFixture<CardQueryMetaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CardQueryMetaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardQueryMetaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
