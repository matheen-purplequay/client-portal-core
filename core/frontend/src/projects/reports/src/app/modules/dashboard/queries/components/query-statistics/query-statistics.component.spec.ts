import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QueryStatisticsComponent } from './query-statistics.component';

describe('QueryStatisticsComponent', () => {
  let component: QueryStatisticsComponent;
  let fixture: ComponentFixture<QueryStatisticsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QueryStatisticsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QueryStatisticsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
