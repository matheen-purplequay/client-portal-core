import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimpleTimeLoadingComponent } from './simple-time-loading.component';

describe('SimpleTimeLoadingComponent', () => {
  let component: SimpleTimeLoadingComponent;
  let fixture: ComponentFixture<SimpleTimeLoadingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SimpleTimeLoadingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SimpleTimeLoadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
