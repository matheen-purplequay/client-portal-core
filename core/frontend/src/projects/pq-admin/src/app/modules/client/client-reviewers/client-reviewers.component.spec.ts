import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientReviewersComponent } from './client-reviewers.component';

describe('ClientReviewersComponent', () => {
  let component: ClientReviewersComponent;
  let fixture: ComponentFixture<ClientReviewersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClientReviewersComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientReviewersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
