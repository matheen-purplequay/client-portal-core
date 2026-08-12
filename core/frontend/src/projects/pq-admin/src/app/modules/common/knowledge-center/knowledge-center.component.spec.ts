import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KnowledgeCenterComponent } from './knowledge-center.component';

describe('KnowledgeCenterComponent', () => {
  let component: KnowledgeCenterComponent;
  let fixture: ComponentFixture<KnowledgeCenterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ KnowledgeCenterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KnowledgeCenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
