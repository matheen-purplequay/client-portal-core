import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssociateQueriesComponent } from './associate-queries.component';

describe('AssociateQueriesComponent', () => {
  let component: AssociateQueriesComponent;
  let fixture: ComponentFixture<AssociateQueriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssociateQueriesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssociateQueriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
