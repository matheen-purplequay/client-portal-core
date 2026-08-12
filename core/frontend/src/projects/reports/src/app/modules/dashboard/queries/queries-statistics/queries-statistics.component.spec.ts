import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QueriesStatisticsComponent } from './queries-statistics.component';

describe('QueriesStatisticsComponent', () => {
  let component: QueriesStatisticsComponent;
  let fixture: ComponentFixture<QueriesStatisticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QueriesStatisticsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QueriesStatisticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
