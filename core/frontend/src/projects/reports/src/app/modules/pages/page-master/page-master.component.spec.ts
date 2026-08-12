import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageMasterComponent } from './page-master.component';

describe('PageMasterComponent', () => {
  let component: PageMasterComponent;
  let fixture: ComponentFixture<PageMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PageMasterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PageMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
