import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactRecipientsComponent } from './contact-recipients.component';

describe('ContactRecipientsComponent', () => {
  let component: ContactRecipientsComponent;
  let fixture: ComponentFixture<ContactRecipientsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContactRecipientsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactRecipientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
