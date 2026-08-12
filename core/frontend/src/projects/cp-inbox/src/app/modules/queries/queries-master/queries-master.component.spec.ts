import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QueriesMasterComponent } from './queries-master.component';

describe('QueriesMasterComponent', () => {
  let component: QueriesMasterComponent;
  let fixture: ComponentFixture<QueriesMasterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QueriesMasterComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QueriesMasterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
