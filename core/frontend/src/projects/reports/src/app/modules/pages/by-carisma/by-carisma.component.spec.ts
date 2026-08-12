import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ByCarismaComponent } from './by-carisma.component';

describe('ByCarismaComponent', () => {
  let component: ByCarismaComponent;
  let fixture: ComponentFixture<ByCarismaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ByCarismaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ByCarismaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
