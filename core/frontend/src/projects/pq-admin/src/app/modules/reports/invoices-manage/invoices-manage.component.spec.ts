import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoicesManageComponent } from './invoices-manage.component';

describe('InvoicesManageComponent', () => {
  let component: InvoicesManageComponent;
  let fixture: ComponentFixture<InvoicesManageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvoicesManageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvoicesManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
