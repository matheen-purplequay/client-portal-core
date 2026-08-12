import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QueryTemplateSelectorComponent } from './query-template-selector.component';

describe('QueryTemplateSelectorComponent', () => {
  let component: QueryTemplateSelectorComponent;
  let fixture: ComponentFixture<QueryTemplateSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QueryTemplateSelectorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QueryTemplateSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
