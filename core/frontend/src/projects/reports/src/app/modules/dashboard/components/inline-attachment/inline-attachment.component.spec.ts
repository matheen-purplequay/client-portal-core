import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InlineAttachmentComponent } from './inline-attachment.component';

describe('InlineAttachmentComponent', () => {
  let component: InlineAttachmentComponent;
  let fixture: ComponentFixture<InlineAttachmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InlineAttachmentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InlineAttachmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
