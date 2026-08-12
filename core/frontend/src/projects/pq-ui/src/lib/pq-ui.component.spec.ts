import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PqUiComponent } from './pq-ui.component';

describe('PqUiComponent', () => {
  let component: PqUiComponent;
  let fixture: ComponentFixture<PqUiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PqUiComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PqUiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
