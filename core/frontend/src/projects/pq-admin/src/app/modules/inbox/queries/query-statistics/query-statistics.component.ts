import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { QueriesService } from 'projects/pq-admin/src/app/services/inbox/queries.service';
import { LocalStorageService } from 'projects/reports/src/app/services/app/storage/local-storage.service';

interface QueryCount {
  label: string;
  count: number;
  meta_Data: string;
}

@Component({
  selector: 'app-query-statistics',
  templateUrl: './query-statistics.component.html',
  styleUrls: ['./query-statistics.component.scss']
})
export class QueryStatisticsComponent implements OnInit, OnChanges {

  @Input() selectedClientId: number = 0;
  isGettingQueriesCounts: boolean = false;
  queryCounts: { aging: QueryCount[], criticality: QueryCount[], status: QueryCount[] } = {
    aging: [], criticality: [], status: []
  };
  user: any;

  constructor(
    private queriesService: QueriesService,
    private localStorageService: LocalStorageService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedClientId'] && changes['selectedClientId'].currentValue) {
      this.getQueryCounts();
    }
  }

  ngOnInit(): void {
    this.user = this.localStorageService.getItem('userdata');
    console.log('user ', this.user);
    this.setupAmbiance();
  }

  setupAmbiance() {
    this.getQueryCounts();
  }

  getQueryCounts() {
    this.isGettingQueriesCounts = true;
    this.queriesService.getQueryCounts(this.selectedClientId).subscribe({
      next: (res: any) => {
        console.log('query counts ', res);
        this.isGettingQueriesCounts = false;
        this.queryCounts = res;
      },
      error: (err: any) => {
        this.isGettingQueriesCounts = false;
      }
    });
  }

  getMetaDataClass = (meta_data: any) => meta_data ? JSON.parse(meta_data).class : "";
}