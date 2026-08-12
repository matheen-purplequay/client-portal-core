import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstructionsHomeComponent } from './instructions-home.component';

describe('InstructionsHomeComponent', () => {
  let component: InstructionsHomeComponent;
  let fixture: ComponentFixture<InstructionsHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InstructionsHomeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstructionsHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
