import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EngagementMasterComponent } from './engagement-master.component';

describe('EngagementMasterComponent', () => {
  let component: EngagementMasterComponent;
  let fixture: ComponentFixture<EngagementMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EngagementMasterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EngagementMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
