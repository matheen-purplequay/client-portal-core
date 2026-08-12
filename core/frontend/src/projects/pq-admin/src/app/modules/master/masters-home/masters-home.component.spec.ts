import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MastersHomeComponent } from './masters-home.component';

describe('MastersHomeComponent', () => {
  let component: MastersHomeComponent;
  let fixture: ComponentFixture<MastersHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MastersHomeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MastersHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
