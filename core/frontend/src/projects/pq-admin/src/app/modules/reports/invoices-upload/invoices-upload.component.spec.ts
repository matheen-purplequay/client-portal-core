import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoicesUploadComponent } from './invoices-upload.component';

describe('InvoicesUploadComponent', () => {
  let component: InvoicesUploadComponent;
  let fixture: ComponentFixture<InvoicesUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvoicesUploadComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvoicesUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
