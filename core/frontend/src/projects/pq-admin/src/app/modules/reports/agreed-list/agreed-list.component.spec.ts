import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgreedListComponent } from './agreed-list.component';

describe('AgreedListComponent', () => {
  let component: AgreedListComponent;
  let fixture: ComponentFixture<AgreedListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AgreedListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgreedListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
