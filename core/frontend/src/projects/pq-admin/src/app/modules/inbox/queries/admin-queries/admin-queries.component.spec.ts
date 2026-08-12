import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminQueriesComponent } from './admin-queries.component';

describe('AdminQueriesComponent', () => {
  let component: AdminQueriesComponent;
  let fixture: ComponentFixture<AdminQueriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminQueriesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminQueriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
