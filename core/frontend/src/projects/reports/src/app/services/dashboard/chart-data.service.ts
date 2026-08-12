import { Injectable } from '@angular/core';
import { DataService } from '../app/data.service';
import { environment as env } from 'projects/reports/src/environments/environment';

const ACCOUNTS_HOST = env.api_production.hosts.accounts_server;
const REPORTS_HOST = env.api_production.hosts.reports_server;
const GET_ALL_SUB_CLIENTS = `${REPORTS_HOST}/get-all-sub-clients`;
const GET_AGREED_JOB_STATUS = `${REPORTS_HOST}/get-agreed-job-status`;
const GET_AGREED_LAST_THREE_MONTH_DATA = `${REPORTS_HOST}/get-agreed-last-three-month-data`;
const GET_LAST_AGREED_UPLOADED_MONTH = `${REPORTS_HOST}/get-last-agreed-uploaded-month`;
const GET_TOUCH_POINTS_LAST_UPDATED = `${REPORTS_HOST}/get-touch-points-last-updated`;

@Injectable({
  providedIn: 'root'
})
export class ChartDataService {

  constructor(
    private dataService: DataService
  ) { }

  getWorkflowStatus(filters: any) {
    return this.dataService.doPost(`${REPORTS_HOST}/charts/workflow/date`, filters);
  }

  getToAStatus(body: any) {
    return this.dataService.doPost(`${REPORTS_HOST}/charts/toa/month`, body);
  }

  getJFTStatus(body: any) {
    return this.dataService.doPost(`${REPORTS_HOST}/charts/jft/month`, body);
  }
  
  getMetrics(body: any) {
    return this.dataService.doPost(`${REPORTS_HOST}/get-metrics`, body);
  }
  
  getOverall(body: any) {
    return this.dataService.doPost(`${REPORTS_HOST}/get-overall`, body);
  }

  getJobStatus(body: any) {
    return this.dataService.doPost(`${REPORTS_HOST}/get-jobstatus`, body);
  }

  getJobStatusByContract(body: any) {
    return this.dataService.doPost(`${REPORTS_HOST}/charts/job-status/by-contract`, body);
  }

  getMonthlyProductivity(body: any) {
    return this.dataService.doPost(`${REPORTS_HOST}/charts/monthly-productivity/by-contract`, body);
  }

  getBudgetVsActual(body: any) {
    return this.dataService.doPost(`${REPORTS_HOST}/charts/budget-actual/by-contract`, body);
  }

  getUser() {
    return this.dataService.doGet(`${ACCOUNTS_HOST}/user`);
  }

  getContracts(body: any) {
    return this.dataService.doPost(`${REPORTS_HOST}/get-contracts`, body);
  }

  // Job Movement Services
  // GET TOUCH POINT COUNT
  getTouchPointCount(body: any) {
    return this.dataService.doPost(`${REPORTS_HOST}/show-touch-point-count`, body);
  }
  
  getTouchPointDetails(body: any) {
    return this.dataService.doPost(`${REPORTS_HOST}/show-touch-point-job-details`, body);
  }

  getOnlyTouchPointCount(body: any) {
    return this.dataService.doPost(`${REPORTS_HOST}/only-touch-point-count`, body);
  }

  getOnlyTouchPointCountClosed(body: any) {
    return this.dataService.doPost(`${REPORTS_HOST}/only-touch-point-closed`, body);
  }

  getAllSubClients(body: any) {
    return this.dataService.doPost(`${GET_ALL_SUB_CLIENTS}`, body);
  }

  getLastAgreedUploadedMonth(body: any) {
    return this.dataService.doPost(`${GET_LAST_AGREED_UPLOADED_MONTH}`, body);
  }

  getAgreedLastThreeMonthData(body: any) {
    return this.dataService.doPost(`${GET_AGREED_LAST_THREE_MONTH_DATA}`, body);
  }
  
  getAgreedJobStatus(body: any) {
    return this.dataService.doPost(`${GET_AGREED_JOB_STATUS}`, body);
  }
  
  getTouchPointsLastUpdated(body: any) {
    return this.dataService.doPost(`${GET_TOUCH_POINTS_LAST_UPDATED}`, body);
  }
}
