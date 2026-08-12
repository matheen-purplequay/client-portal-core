import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HtmlFrameComponent } from './html-frame.component';

describe('HtmlFrameComponent', () => {
  let component: HtmlFrameComponent;
  let fixture: ComponentFixture<HtmlFrameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HtmlFrameComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HtmlFrameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
