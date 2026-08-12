import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyRulesComponent } from './company-rules.component';

describe('CompanyRulesComponent', () => {
  let component: CompanyRulesComponent;
  let fixture: ComponentFixture<CompanyRulesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompanyRulesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompanyRulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
