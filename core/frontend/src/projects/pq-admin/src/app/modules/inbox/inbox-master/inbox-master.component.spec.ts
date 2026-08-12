import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InboxMasterComponent } from './inbox-master.component';

describe('InboxMasterComponent', () => {
  let component: InboxMasterComponent;
  let fixture: ComponentFixture<InboxMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InboxMasterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InboxMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
