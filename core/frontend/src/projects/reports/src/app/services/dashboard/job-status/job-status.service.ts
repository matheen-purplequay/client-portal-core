import { Injectable } from '@angular/core';
import { DataService } from '../../app/data.service';
import { environment as env } from 'projects/reports/src/environments/environment';

const ACCOUNTS_HOST = env.api_production.hosts.accounts_server;
const REPORTS_HOST = env.api_production.hosts.reports_server;

const GET_JOBS_STATUS_COUNT = `${REPORTS_HOST}/client/jobs/get-jobs-status-count`;

const GET_COMMENT_CODES = `${REPORTS_HOST}/get-comment-codes`;
const GET_PRIORITY_MASTER = `${REPORTS_HOST}/client/jobs/get-priority-master`;
const GET_PRIORITY_JOBS = `${REPORTS_HOST}/jobs/get-priority-jobs`;
const GET_WEEKLY_MOVEMENT = `${REPORTS_HOST}/client/jobs/get-weekly-movement`;

// Details
const GET_JOB_DETAILS_BY_ID = `${REPORTS_HOST}/client/details/get-details-by-id`;

// Rating
const RATING_BY_JOB_ID = `${REPORTS_HOST}/client/rating/by-job-id`;
const SAVE_RATING = `${REPORTS_HOST}/client/rating/save-rating`;

@Injectable({
  providedIn: 'root'
})
export class JobStatusService {

  constructor(
    private dataService: DataService
  ) { }

  getJobsStatusCount(body: any) {
    return this.dataService.doPost(`${GET_JOBS_STATUS_COUNT}`, body);
  }
  
  getPriorityJobs(body: any) {
    return this.dataService.doPost(`${GET_PRIORITY_JOBS}`, body);
  }

  getPriorityMaster() {
    return this.dataService.doGet(`${GET_PRIORITY_MASTER}`);
  }
  
  getWeeklyMovement(body: any) {
    return this.dataService.doPost(`${GET_WEEKLY_MOVEMENT}`, body);
  }
  
  // Details
  getJobDetails(body: any) {
    return this.dataService.doPost(`${GET_JOB_DETAILS_BY_ID}`, body);
  }

  // Rating
  getRatingByJobID(body: any) {
    return this.dataService.doPost(`${RATING_BY_JOB_ID}`, body);
  }

  saveRating(body: any) {
    return this.dataService.doPost(`${SAVE_RATING}`, body);
  }

}
