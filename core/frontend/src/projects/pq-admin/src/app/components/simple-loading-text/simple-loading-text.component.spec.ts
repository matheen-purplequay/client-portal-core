import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimpleLoadingTextComponent } from './simple-loading-text.component';

describe('SimpleLoadingTextComponent', () => {
  let component: SimpleLoadingTextComponent;
  let fixture: ComponentFixture<SimpleLoadingTextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SimpleLoadingTextComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SimpleLoadingTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
