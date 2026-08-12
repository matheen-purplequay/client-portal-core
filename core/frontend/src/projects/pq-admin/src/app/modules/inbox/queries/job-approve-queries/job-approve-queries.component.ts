import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { JobQueries, Query } from '../models/queries';
import { ApproveQueriesComponent } from '../approve-queries/approve-queries.component';
import { QueriesService } from 'projects/pq-admin/src/app/services/inbox/queries.service';

@Component({
  selector: 'app-job-approve-queries',
  templateUrl: './job-approve-queries.component.html',
  styleUrls: ['./job-approve-queries.component.scss']
})
export class JobApproveQueriesComponent implements OnInit {

  @ViewChild(ApproveQueriesComponent) approveQueriesComponent!: ApproveQueriesComponent;
  @Input() queries: JobQueries[] = []; 
  @Input() jobQueries : any[] = [];
  @Output() onBulkApproveSuccess = new EventEmitter<void>();


  selectedJobId: number | undefined = undefined 

  pagination: any[] = [];
  currentPage: number = 1;
  config = {
    id: 'custom',
    itemsPerPage: 10,
    currentPage: 1,
    totalItems: 0
  };

  draftQueries: Query[] = [];

  constructor(
   private queriesService : QueriesService
  ) {}

  ngOnInit(): void {
  }

  setSelectedJobId(jobId: number | undefined) {
    this.selectedJobId = jobId;
    this.getDraftQueries();
  }

  getDraftQueries() {
    const selectedJob = this.jobQueries.find(jq => jq.job_id === this.selectedJobId);
    this.draftQueries = selectedJob?.queries ?? [];
  }

  bulkApproveQueries(){
    const selectedQueries = this.approveQueriesComponent.getBulkApproveQueryRequests();

    if (selectedQueries.length === 0) {
      alert("Please select at least one query to approve.");
      return;
    }

    console.log("Selected Queries for Approval: ", selectedQueries);

    this.queriesService.bulkApproveDraftQuery(selectedQueries).subscribe({
      next: (res: any) => {
        console.log("Bulk Approve Response: ", res);
        if (res.status) {
          alert("Queries approved successfully.");
          this.onBulkApproveSuccess.emit();
          this.approveQueriesComponent.onRefreshBulkApproveQueries(); // Reset selected queries in the approve component
          this.selectedJobId = undefined; // Reset selected job ID after approval
        } else {
          alert("Failed to approve queries. Please try again.");
        }
      }
      , error: (err: any) => {
        console.error("Bulk Approve Error: ", err);
        alert("Failed to approve queries. Please try again.");
      }
    });
  }  

}
