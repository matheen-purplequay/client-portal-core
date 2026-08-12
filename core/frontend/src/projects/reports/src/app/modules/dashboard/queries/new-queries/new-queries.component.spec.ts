import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewQueriesComponent } from './new-queries.component';

describe('NewQueriesComponent', () => {
  let component: NewQueriesComponent;
  let fixture: ComponentFixture<NewQueriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NewQueriesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewQueriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
