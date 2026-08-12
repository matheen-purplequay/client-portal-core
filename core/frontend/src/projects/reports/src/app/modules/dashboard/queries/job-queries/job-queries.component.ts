import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { JobQueries, Query, QueryFilters } from '../models/queries';
import { Queries } from 'projects/reports/src/app/models/queries';
import { QueriesService } from 'projects/reports/src/app/services/dashboard/queries/queries.service';

@Component({
  selector: 'app-job-queries',
  templateUrl: './job-queries.component.html',
  styleUrls: ['./job-queries.component.scss']
})
export class JobQueriesComponent implements OnInit {

  @Output() jobSelected = new EventEmitter<JobQueries>();
  @Output() raiseQueryForJob = new EventEmitter<JobQueries>();
  @Input() job_id: number = 0;
  @Input() jobQueries: JobQueries[] = [];
  queryFilters: QueryFilters = QueryFilters.defaultQueryFilters();

  pagination: any[] = [];
  currentPage: number = 1;
  config = {
    id: 'custom',
    itemsPerPage: 10,
    currentPage: 1,
    totalItems: 0
  };

  // Status Variables
  isGettingQueries: boolean = false;

  constructor(
    private queriesService: QueriesService
  ) { }

  ngOnInit(): void {
    this.setupAmbiance();
    console.log('selected job in job queries === ', this.job_id);
  }

  setupAmbiance() {
    // this.getQueries()
  }

  getQueries() {
    this.isGettingQueries = true;
    const body = {
      jobId: this.job_id,
      filters: Object.values(this.queryFilters)
    };
    this.queriesService.getQueriesForJob(body).subscribe({
      next: (res: any) => {
        this.isGettingQueries = false;
        this.jobQueries = res.queries;
      },
      error: (err: any) => {
        this.isGettingQueries = false;
      }
    });
  }

  emitJobSelected(job: JobQueries) {
    this.jobSelected.emit(job);
  }

  raiseNewQuery(job: JobQueries) {
    this.raiseQueryForJob.emit(job);
  }
}
