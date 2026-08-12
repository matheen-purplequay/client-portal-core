import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimpleTabComponent } from './simple-tab.component';

describe('SimpleTabComponent', () => {
  let component: SimpleTabComponent;
  let fixture: ComponentFixture<SimpleTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SimpleTabComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SimpleTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
