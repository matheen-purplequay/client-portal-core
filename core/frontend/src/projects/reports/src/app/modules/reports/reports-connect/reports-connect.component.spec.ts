import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportsConnectComponent } from './reports-connect.component';

describe('ReportsConnectComponent', () => {
  let component: ReportsConnectComponent;
  let fixture: ComponentFixture<ReportsConnectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportsConnectComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportsConnectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
