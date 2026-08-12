import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QueriesHomeComponent } from './queries-home.component';

describe('QueriesHomeComponent', () => {
  let component: QueriesHomeComponent;
  let fixture: ComponentFixture<QueriesHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QueriesHomeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QueriesHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
