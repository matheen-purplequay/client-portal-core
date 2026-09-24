import { Injectable } from '@angular/core';
import { DataService } from '../app/data.service';
import { environment as env } from 'projects/reports/src/environments/environment';
import { LocalStorageService } from '../app/storage/local-storage.service';

const ACCOUNTS_HOST = env.api_production.hosts.accounts_server;
const REPORTS_HOST = env.api_production.hosts.reports_server;

const GET_REPORT = `${REPORTS_HOST}/reports/download`;
const PREVIEW_REPORT = `${REPORTS_HOST}/reports/preview`;
const GET_ALL_CONNECT_REPORTS = `${REPORTS_HOST}/reports/connect/all`;
const GET_CONNECT_REPORTS = `${REPORTS_HOST}/reports/get`;
const GET_ALL_WEEKLY_REPORTS = `${REPORTS_HOST}/reports/weekly/all`;
const GET_WEEKLY_REPORTS = `${REPORTS_HOST}/reports/weekly`;
const GET_ALL_INVOICES = `${REPORTS_HOST}/invoices/all`;
const GET_PRODUCTIVITY_REPORT = `${REPORTS_HOST}/client/business-services/reports/get-productivity-report`;
const EXPORT_PRODUCTIVITY_REPORT = `${REPORTS_HOST}/client/business-services/reports/export-productivity-report`;
const GET_PRODUCTIVITY_VERTICALS = `${REPORTS_HOST}/client/business-services/reports/get-productivity-verticals`;
const GET_ASSOCIATE_TIME_UTILISATION = `${REPORTS_HOST}/client/business-services/reports/get-associate-time-utilisation`;
const GET_TURNAROUND_REPORT = `${REPORTS_HOST}/client/business-services/reports/get-turnaround-report`;
const GET_TURNAROUND_JOBS_LIST = `${REPORTS_HOST}/client/business-services/reports/get-turnaround-jobs-list`;
const GET_BUDGET_OVERVIEW = `${REPORTS_HOST}/client/business-services/reports/get-budget-overview`;
const EXPORT_BUDGET_OVERVIEW = `${REPORTS_HOST}/client/business-services/reports/export-budget-overview`;
const GET_CLOSED_JOBS_FEEDBACK = `${REPORTS_HOST}/client/business-services/reports/get-closed-jobs-feedback`;
const GET_CLOSED_JOBS_FEEDBACK_COUNT = `${REPORTS_HOST}/client/business-services/reports/get-closed-jobs-feedback-count`;
const SAVE_JOB_SURVEY = `${REPORTS_HOST}/client/business-services/reports/save-job-survey`;
const GET_JOB_SURVEY = `${REPORTS_HOST}/client/business-services/reports/get-job-survey`;
const GET_MOVEMENT_REPORT = `${REPORTS_HOST}/client/business-services/reports/get-movement-report`;
const EXPORT_MOVEMENT_REPORT = `${REPORTS_HOST}/client/business-services/reports/export-movement-report`;
const GET_MOM_REPORT = `${REPORTS_HOST}/client/business-services/reports/get-mom-report`;
const GET_MOM_COUNT = `${REPORTS_HOST}/client/business-services/reports/get-mom-count`;
const GET_WORKFLOW_STANDUP = `${REPORTS_HOST}/client/business-services/reports/get-workflow-standup`;
const GET_JOBS_SUMMARY = `${REPORTS_HOST}/client/business-services/reports/get-jobs-summary`;
const GET_BUDGET_OVERVIEW_COUNT = `${REPORTS_HOST}/client/business-services/reports/get-budget-overview-count`;
const GET_MOVEMENT_SUMMARY = `${REPORTS_HOST}/client/business-services/reports/get-movement-summary`;


@Injectable({
  providedIn: 'root'
})
export class ReportService {
  project_id = 0;

  constructor(
    private dataService: DataService,
    private localStorageService: LocalStorageService
  ) {
    this.project_id = this.localStorageService.getItem('userdata').project_id;
  }

  // Currently selected client contact (navbar "view as contact" dropdown),
  // same fallback chain used across the app (e.g. bs-job-table.tsx) — read
  // live per-call since the dropdown can change it without a page reload.
  private getSelectedContactId(): number {
    const wmUser = this.localStorageService.getItem('wm_user');
    const userdata = this.localStorageService.getItem('userdata');
    return wmUser?.wm_client_id ?? userdata?.client_id ?? 0;
  }

  getLastReportUpdatedMonth(body: any) {
    return this.dataService.doPost(`${REPORTS_HOST}/reports/get-last-updated-month`, body);
  }
  
  getAvailableReportYears(body: any) {
    return this.dataService.doPost(`${REPORTS_HOST}/report/get-available-report-years`, body);
  }
  
  getAvailableReportMonths(body: any) {
    return this.dataService.doPost(`${REPORTS_HOST}/report/get-available-report-months`, body);
  }

  getConnectReports(month: number | string, year: string) {
    let body = {
      month: month,
      year: year,
      client_id: this.project_id,
      type: 'connect'
    };
    return this.dataService.doPost(`${GET_CONNECT_REPORTS}`, body);
  }

  getAllConnectReports(year: string) {
    let body = {
      client_id: this.project_id,
      year: year,
      month: 0,
      type: 'connect'
    };
    return this.dataService.doPost(`${GET_ALL_CONNECT_REPORTS}`, body);
  }

  getWeeklyReports(month: string, year: string) {
    let body = {
      month: month,
      year: year,
      project_id: this.project_id
    };
    return this.dataService.doPost(`${GET_WEEKLY_REPORTS}`, body);
  }

  getAllWeeklyReports(year: string) {
    let body = {
      project_id: this.project_id,
      year: year
    };
    return this.dataService.doPost(`${GET_ALL_WEEKLY_REPORTS}`, body);
  }

  getReport(body: any) {
    return this.dataService.doGetAsBlobByPost(`${GET_REPORT}`, body);
  }

  previewConnectReports(body: any) {
    return this.dataService.doPostAsArrayBuffer(`${PREVIEW_REPORT}`, body);
  }

  previewConnectReportsbyGet(link: string) {
    return this.dataService.doGetAsArrayBuffer(`${PREVIEW_REPORT}` + link);
  }

  getInvoices() {
    return this.dataService.doGet(GET_ALL_INVOICES);
  }

  getProductivityReport(month_year: string, service_id: number = 0) {
    const body = {
      month_year: month_year,
      project_id: this.project_id,
      service_id: service_id
    };
    return this.dataService.doPost(`${GET_PRODUCTIVITY_REPORT}`, body);
  }

  exportProductivityReport(month_year: string, service_id: number = 0) {
    const body = {
      month_year: month_year,
      project_id: this.project_id,
      service_id: service_id
    };
    return this.dataService.doGetAsBlobByPost(`${EXPORT_PRODUCTIVITY_REPORT}`, body);
  }

  getProductivityVerticals() {
    return this.dataService.doPost(`${GET_PRODUCTIVITY_VERTICALS}`, {});
  }

  getAssociateTimeUtilisation(month_year: string, service_id: number | string = '') {
    const body = {
      month_year: month_year,
      project_id: this.project_id,
      service_id: service_id
    };
    return this.dataService.doPost(`${GET_ASSOCIATE_TIME_UTILISATION}`, body);
  }

  getTurnaroundReport(serviceId: number = 0, status: 'open' | 'closed' = 'closed') {
    const body = {
      project_id: this.project_id,
      service_id: serviceId,
      client_id: this.getSelectedContactId(),
      status: status
    };
    return this.dataService.doPost(`${GET_TURNAROUND_REPORT}`, body);
  }

  getTurnaroundJobsList(serviceId: number = 0, status: 'open' | 'closed' = 'closed') {
    const body = {
      project_id: this.project_id,
      service_id: serviceId,
      client_id: this.getSelectedContactId(),
      status: status
    };
    return this.dataService.doPost(`${GET_TURNAROUND_JOBS_LIST}`, body);
  }

  getBudgetOverview(serviceId: number = 0) {
    const body = {
      project_id: this.project_id,
      service_id: serviceId,
      client_id: this.getSelectedContactId()
    };
    return this.dataService.doPost(`${GET_BUDGET_OVERVIEW}`, body);
  }

  exportBudgetOverview(serviceId: number = 0) {
    const body = {
      project_id: this.project_id,
      service_id: serviceId,
      client_id: this.getSelectedContactId()
    };
    return this.dataService.doGetAsBlobByPost(`${EXPORT_BUDGET_OVERVIEW}`, body);
  }

  getClosedJobsFeedback(serviceId: number = 0) {
    const body = {
      project_id: this.project_id,
      service_id: serviceId,
      // Scoped to the logged-in/selected contact (manager-aware via
      // tbl_clientcontactmaping on the backend), not every client's jobs.
      client_id: this.getSelectedContactId()
    };
    return this.dataService.doPost(`${GET_CLOSED_JOBS_FEEDBACK}`, body);
  }

  getClosedJobsFeedbackCount(serviceId: number = 0) {
    const body = {
      project_id: this.project_id,
      service_id: serviceId,
      client_id: this.getSelectedContactId()
    };
    return this.dataService.doPost(`${GET_CLOSED_JOBS_FEEDBACK_COUNT}`, body);
  }

  saveJobSurvey(body: any) {
    return this.dataService.doPost(`${SAVE_JOB_SURVEY}`, { ...body, project_id: this.project_id, user_id: this.getPortalUserId() });
  }

  getJobSurvey(jobId: number) {
    return this.dataService.doPost(`${GET_JOB_SURVEY}`, { job_id: jobId, user_id: this.getPortalUserId() });
  }

  private getPortalUserId(): number {
    return this.localStorageService.getItem('userdata')?.user_id ?? 0;
  }

  getMovementReport(period: string, fromDate?: string, toDate?: string, serviceId: number = 0) {
    const body = {
      project_id: this.project_id,
      service_id: serviceId,
      client_id: this.getSelectedContactId(),
      period: period,
      from_date: fromDate,
      to_date: toDate
    };
    return this.dataService.doPost(`${GET_MOVEMENT_REPORT}`, body);
  }

  exportMovementReport(period: string, fromDate?: string, toDate?: string, serviceId: number = 0) {
    const body = {
      project_id: this.project_id,
      service_id: serviceId,
      client_id: this.getSelectedContactId(),
      period: period,
      from_date: fromDate,
      to_date: toDate
    };
    return this.dataService.doGetAsBlobByPost(`${EXPORT_MOVEMENT_REPORT}`, body);
  }

  getMOMCount() {
    const body = {
      project_id: this.project_id
    };
    return this.dataService.doPost(`${GET_MOM_COUNT}`, body);
  }

  getMOMReport() {
    const body = {
      project_id: this.project_id
    };
    return this.dataService.doPost(`${GET_MOM_REPORT}`, body);
  }

  getWorkflowStandUp() {
    const body = {
      project_id: this.project_id,
      client_id: this.getSelectedContactId()
    };
    return this.dataService.doPost(`${GET_WORKFLOW_STANDUP}`, body);
  }

  getJobsSummary(fromDate: string, toDate: string, serviceId: number = 0) {
    const body = {
      project_id: this.project_id,
      service_id: serviceId,
      from_date: fromDate,
      to_date: toDate,
      user_id: this.getSelectedContactId()
    };
    return this.dataService.doPost(`${GET_JOBS_SUMMARY}`, body);
  }

  getBudgetOverviewCount(serviceId: number = 0) {
    const body = {
      project_id: this.project_id,
      service_id: serviceId,
      client_id: this.getSelectedContactId()
    };
    return this.dataService.doPost(`${GET_BUDGET_OVERVIEW_COUNT}`, body);
  }

  getMovementSummary(fromDate: string, toDate: string, serviceId: number = 0) {
    const body = {
      project_id: this.project_id,
      service_id: serviceId,
      client_id: this.getSelectedContactId(),
      from_date: fromDate,
      to_date: toDate
    };
    return this.dataService.doPost(`${GET_MOVEMENT_SUMMARY}`, body);
  }
}
