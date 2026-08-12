import { Component, OnInit } from '@angular/core';
import { LocalStorageService } from 'projects/reports/src/app/services/app/storage/local-storage.service';
import { QueriesService } from 'projects/reports/src/app/services/dashboard/queries/queries.service';

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
export class QueryStatisticsComponent implements OnInit {

  isGettingQueriesCounts: boolean = false;
  queryCounts: { aging: QueryCount[], criticality: QueryCount[], status: QueryCount[] } = {
    aging: [], criticality: [], status: []
  };
  user: any;

  constructor(
    private queriesService: QueriesService,
    private localStorageService: LocalStorageService
  ) { }

  ngOnInit(): void {
    this.user = this.localStorageService.getItem('userdata');
    this.setupAmbiance();
  }

  setupAmbiance() {
    this.getQueryCounts();
  }

  getQueryCounts() {
    this.isGettingQueriesCounts = true;
    console.log('project id ', this.user?.project_id);
    this.queriesService.getQueryCounts(this.user?.project_id).subscribe({
      next: (res: any) => {
        console.log('query counts ', res);
        this.isGettingQueriesCounts = false;
        // Filter out unwanted statuses
        res.status = res.status.filter((s: any) =>
          s.code !== 'draft' && s.code !== 'draft_rejected'
        );
        this.queryCounts = res;

      },
      error: (err: any) => {
        this.isGettingQueriesCounts = false;
      }
    });
  }

  getMetaDataClass = (meta_data: any) => meta_data ? JSON.parse(meta_data).class : "";

}
