import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { JobQueries } from '../models/queries';

@Component({
  selector: 'app-job-queries',
  templateUrl: './job-queries.component.html',
  styleUrls: ['./job-queries.component.scss']
})
export class JobQueriesComponent implements OnInit {

  @Output() jobSelected = new EventEmitter<JobQueries>();
  @Output() raiseQueryForJob = new EventEmitter<JobQueries>();
  @Input() jobQueries: JobQueries[] = [];

  pagination: any[] = [];
  currentPage: number = 1;
  config = {
    id: 'custom',
    itemsPerPage: 10,
    currentPage: 1,
    totalItems: 0
  };

  constructor() { }

  ngOnInit(): void {
  }

  emitJobSelected(job: JobQueries) {
    this.jobSelected.emit(job);
  }

  raiseNewQuery(job: JobQueries) {
    this.raiseQueryForJob.emit(job);
  }

}
