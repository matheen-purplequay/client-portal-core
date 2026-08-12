import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItPolicyComponent } from './it-policy.component';

describe('ItPolicyComponent', () => {
  let component: ItPolicyComponent;
  let fixture: ComponentFixture<ItPolicyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ItPolicyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ItPolicyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
