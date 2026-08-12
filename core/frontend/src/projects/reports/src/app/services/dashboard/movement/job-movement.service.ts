import { Injectable } from '@angular/core';
import { DataService } from '../../app/data.service';
import { environment as env } from 'projects/reports/src/environments/environment';

const ACCOUNTS_HOST = env.api_production.hosts.accounts_server;
const REPORTS_HOST = env.api_production.hosts.reports_server;
const GET_MOVEMENT_JOB_STATUS = `${REPORTS_HOST}/get-movement-job-status-by-user-id`;
const EXPORT_JOB_STATUS = `${REPORTS_HOST}/export/movement-job-status`;
const EXPORT_PRIORITY_JOB_STATUS = `${REPORTS_HOST}/export/priority-job-status`;
const EXPORT_JOB_STATUS_DETAILS = `${REPORTS_HOST}/export/movement-job-status-details`;

@Injectable({
  providedIn: 'root'
})
export class JobMovementService {

  constructor(
    private dataService: DataService
  ) { }

  getJobStatus(body: any) {
    return this.dataService.doPost(`${GET_MOVEMENT_JOB_STATUS}`, body);
  }

  exportJobStatus(body: any) {
    return this.dataService.doGetAsBlobByPost(`${EXPORT_JOB_STATUS}`, body);
  }

  exportPriorityJobStatus(body: any) {
    return this.dataService.doGetAsBlobByPost(`${EXPORT_PRIORITY_JOB_STATUS}`, body);
  }

  exportJobStatusDetails(body: any) {
    return this.dataService.doGetAsBlobByPost(`${EXPORT_JOB_STATUS_DETAILS}`, body);
  }
}
