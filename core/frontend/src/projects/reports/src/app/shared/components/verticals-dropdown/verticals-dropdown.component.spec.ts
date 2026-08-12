import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerticalsDropdownComponent } from './verticals-dropdown.component';

describe('VerticalsDropdownComponent', () => {
  let component: VerticalsDropdownComponent;
  let fixture: ComponentFixture<VerticalsDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerticalsDropdownComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VerticalsDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
