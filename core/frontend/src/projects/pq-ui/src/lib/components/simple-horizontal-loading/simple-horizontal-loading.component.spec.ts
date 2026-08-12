import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimpleHorizontalLoadingComponent } from './simple-horizontal-loading.component';

describe('SimpleHorizontalLoadingComponent', () => {
  let component: SimpleHorizontalLoadingComponent;
  let fixture: ComponentFixture<SimpleHorizontalLoadingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SimpleHorizontalLoadingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SimpleHorizontalLoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
