import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InboxToolbarComponent } from './inbox-toolbar.component';

describe('InboxToolbarComponent', () => {
  let component: InboxToolbarComponent;
  let fixture: ComponentFixture<InboxToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InboxToolbarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InboxToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
