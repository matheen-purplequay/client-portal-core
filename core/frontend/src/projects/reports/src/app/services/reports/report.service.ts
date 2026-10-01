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
const GET_TURNAROUND_MANAGER_WISE = `${REPORTS_HOST}/client/business-services/reports/get-turnaround-manager-wise`;
const GET_TURNAROUND_MANAGER_JOBS = `${REPORTS_HOST}/client/business-services/reports/get-turnaround-manager-jobs`;
const GET_BUDGET_OVERVIEW = `${REPORTS_HOST}/client/business-services/reports/get-budget-overview`;
const EXPORT_BUDGET_OVERVIEW = `${REPORTS_HOST}/client/business-services/reports/export-budget-overview`;
const GET_CLOSED_JOBS_FEEDBACK = `${REPORTS_HOST}/client/business-services/reports/get-closed-jobs-feedback`;
const GET_CLOSED_JOBS_FEEDBACK_COUNT = `${REPORTS_HOST}/client/business-services/reports/get-closed-jobs-feedback-count`;
const SAVE_JOB_SURVEY = `${REPORTS_HOST}/client/business-services/reports/save-job-survey`;
const GET_JOB_SURVEY = `${REPORTS_HOST}/client/business-services/reports/get-job-survey`;
const GET_MOVEMENT_REPORT = `${REPORTS_HOST}/client/business-services/reports/get-movement-report`;
const EXPORT_MOVEMENT_REPORT = `${REPORTS_HOST}/client/business-services/reports/export-movement-report`;
const GET_MOVEMENT_PARTNERS = `${REPORTS_HOST}/client/business-services/reports/get-movement-partners`;
const GET_MOM_REPORT = `${REPORTS_HOST}/client/business-services/reports/get-mom-report`;
const GET_MOM_COUNT = `${REPORTS_HOST}/client/business-services/reports/get-mom-count`;
const GET_WORKFLOW_STANDUP = `${REPORTS_HOST}/client/business-services/reports/get-workflow-standup`;
const GET_JOBS_SUMMARY = `${REPORTS_HOST}/client/business-services/reports/get-jobs-summary`;
const GET_BUDGET_OVERVIEW_COUNT = `${REPORTS_HOST}/client/business-services/reports/get-budget-overview-count`;
const GET_MOVEMENT_SUMMARY = `${REPORTS_HOST}/client/business-services/reports/get-movement-summary`;
const GET_MOVEMENT_WORKSTATUS_SUMMARY = `${REPORTS_HOST}/client/business-services/reports/get-movement-workstatus-summary`;
const GET_DAILY_PLANNER_COUNTS = `${REPORTS_HOST}/client/business-services/reports/get-daily-planner-counts`;
const GET_DAILY_PLANNER_DETAILS = `${REPORTS_HOST}/client/business-services/reports/get-daily-planner-details`;
const GET_DAILY_PLANNER_COLOUR_COUNTS = `${REPORTS_HOST}/client/business-services/reports/get-daily-planner-colour-counts`;
const GET_JOBS_LIVE_COUNTS = `${REPORTS_HOST}/client/business-services/reports/get-jobs-live-counts`;
const GET_FEEDBACK_COUNTS = `${REPORTS_HOST}/client/business-services/reports/get-feedback-counts`;
const GET_YESTERDAY_SENT_COUNTS = `${REPORTS_HOST}/client/business-services/reports/get-yesterday-sent-counts`;
// Same endpoint the real Jobs page (dp-dash-movement React widget, fetch-counts.ts)
// uses for its per-status tile counts - note the /dashboard/ path, not /reports/.
const GET_TOTAL_JOB_STATUS_COUNT = `${REPORTS_HOST}/client/business-services/dashboard/total-job-status-count`;
// Corrected version (sp_totaljobstatuscountbyclientwiseNew) - counts jobs by
// their current Wsid only, so the tiles sum to the same total as
// Sp_JobListingLiveCounts, unlike the cumulative original above.
const GET_TOTAL_JOB_STATUS_COUNT_NEW = `${REPORTS_HOST}/client/business-services/dashboard/total-job-status-count-new`;
// Real Jobs page grid endpoint (dp-dash-movement's bs-job-table.tsx, jobAPI) -
// CALL SP_FetchBSjobDashboardWithCounts_final(user_id, project_id, service_id, limit, offset, where, status_id).
// Note the /client/dashboard/ path (no business-services segment).
const GET_MOVEMENT_WITH_COUNTS = `${REPORTS_HOST}/client/dashboard/get-movement-with-counts`;
// Open Jobs page grid, purpose-built - CALL SP_GetJobStatusstatuswise(pid, Cid, Serviceid, status).
const GET_JOB_STATUS_STATUSWISE = `${REPORTS_HOST}/client/business-services/dashboard/get-job-status-statuswise`;
const GET_JOB_STATUS_STATUSWISE_CLOSED = `${REPORTS_HOST}/client/business-services/dashboard/get-job-status-statuswise-closed`;
const GET_PARTNER_WISE_JOBS_STATUS_CLOSED = `${REPORTS_HOST}/client/business-services/dashboard/get-partner-wise-jobs-status-closed`;
// Open Jobs page's Manager View matrix - CALL Sp_PartnerWiseJobsStatus(pid, Cid, ServiceId).
const GET_PARTNER_WISE_JOBS_STATUS = `${REPORTS_HOST}/client/business-services/dashboard/get-partner-wise-jobs-status`;
const GET_HOME_TURNAROUND_SUMMARY = `${REPORTS_HOST}/client/business-services/reports/get-home-turnaround-summary`;
const GET_JOBS_CLOSED_COUNTS = `${REPORTS_HOST}/client/business-services/reports/get-jobs-closed-counts`;
// Job Information popup (same endpoints the real Jobs page's job-information.tsx uses) -
// reused here so the Angular job-details popup can show the same Job Timeline / Budget /
// Instructions / Appreciation content instead of the older, thinner get-details-by-id call.
const GET_JOB_STATUS_HISTORY = `${REPORTS_HOST}/client/business-services/job/get-job-status-history`;
const GET_JOB_BUDGET_SUMMARY = `${REPORTS_HOST}/client/business-services/job/get-job-budget-summary`;
const GET_JOB_APPRECIATION = `${REPORTS_HOST}/client/business-services/job/get-job-appreciation`;
const GET_JOB_FEEDBACK = `${REPORTS_HOST}/client/business-services/job/get-job-feedback`;


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

  getTurnaroundManagerWise(serviceId: number = 0) {
    const body = {
      project_id: this.project_id,
      service_id: serviceId,
      client_id: this.getSelectedContactId()
    };
    return this.dataService.doPost(`${GET_TURNAROUND_MANAGER_WISE}`, body);
  }

  getTurnaroundManagerJobs(serviceId: number = 0, managerCid: number = 0) {
    const body = {
      project_id: this.project_id,
      service_id: serviceId,
      manager_cid: managerCid
    };
    return this.dataService.doPost(`${GET_TURNAROUND_MANAGER_JOBS}`, body);
  }

  getJobStatusHistory(jobId: number) {
    return this.dataService.doPost(`${GET_JOB_STATUS_HISTORY}`, { job_id: jobId });
  }

  getJobBudgetSummary(jobId: number) {
    return this.dataService.doPost(`${GET_JOB_BUDGET_SUMMARY}`, { job_id: jobId });
  }

  getJobAppreciation(jobId: number) {
    return this.dataService.doPost(`${GET_JOB_APPRECIATION}`, { job_id: jobId });
  }

  getJobFeedback(jobId: number) {
    return this.dataService.doPost(`${GET_JOB_FEEDBACK}`, { job_id: jobId });
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

  // Movement page's Manager View - Status x Partner matrix.
  getMovementPartners(period: string, fromDate?: string, toDate?: string, serviceId: number = 0) {
    const body = {
      project_id: this.project_id,
      service_id: serviceId,
      client_id: this.getSelectedContactId(),
      period: period,
      from_date: fromDate,
      to_date: toDate
    };
    return this.dataService.doPost(`${GET_MOVEMENT_PARTNERS}`, body);
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

  // Home page's Daily Planner tile counts. serviceId is the active vertical's
  // wm_vertical_id (see ClientService.getClientVerticalsSP).
  getDailyPlannerCounts(serviceId: number) {
    const body = {
      project_id: this.project_id,
      client_id: this.getSelectedContactId(),
      service_id: serviceId
    };
    return this.dataService.doPost(`${GET_DAILY_PLANNER_COUNTS}`, body);
  }

  // Home page's Daily Planner — associate counts by today's colour group
  // (Sufficient / Insufficient / No Jobs). Same Cid/Pid/Service convention.
  getDailyPlannerColourCounts(serviceId: number) {
    const body = {
      project_id: this.project_id,
      client_id: this.getSelectedContactId(),
      service_id: serviceId
    };
    return this.dataService.doPost(`${GET_DAILY_PLANNER_COLOUR_COUNTS}`, body);
  }

  // Home page's "Yesterday's Workflow" table — the per-job rows behind the
  // Daily Planner counts above. Same Cid/Pid/Service convention.
  getDailyPlannerDetails(serviceId: number) {
    const body = {
      project_id: this.project_id,
      client_id: this.getSelectedContactId(),
      service_id: serviceId
    };
    return this.dataService.doPost(`${GET_DAILY_PLANNER_DETAILS}`, body);
  }

  // Home page's Jobs panel tile counts. Same Cid/Pid/Service convention.
  getJobsLiveCounts(serviceId: number) {
    const body = {
      project_id: this.project_id,
      client_id: this.getSelectedContactId(),
      service_id: serviceId
    };
    return this.dataService.doPost(`${GET_JOBS_LIVE_COUNTS}`, body);
  }

  // Home page's Feedback panel tile counts. Same Cid/Pid/Service convention.
  getFeedbackCounts(serviceId: number) {
    const body = {
      project_id: this.project_id,
      client_id: this.getSelectedContactId(),
      service_id: serviceId
    };
    return this.dataService.doPost(`${GET_FEEDBACK_COUNTS}`, body);
  }

  // Yesterday's Workflow header's Sent for Query / Sent for Review counts.
  // Same Cid/Pid/Service convention.
  getYesterdaySentCounts(serviceId: number) {
    const body = {
      project_id: this.project_id,
      client_id: this.getSelectedContactId(),
      service_id: serviceId
    };
    return this.dataService.doPost(`${GET_YESTERDAY_SENT_COUNTS}`, body);
  }

  // Per-status job counts (jobInYetToStart, wipProcessing, sentForQueries,
  // sentForReview, sentForFinalReview, onHold, internalReview,
  // wipQueryReplies, wipReviewReplies, wipInternalReviewReplies,
  // jobCompleted, cancelled, ...). Same call the real Jobs page
  // (dash-movement widget) uses - CALL sp_totaljobstatuscountbyclientwise(project_id, service_id, user_id, where).
  getTotalJobStatusCount(serviceId: number) {
    const body = {
      id: this.project_id,
      service_id: serviceId,
      user_id: this.getSelectedContactId()
    };
    return this.dataService.doPost(`${GET_TOTAL_JOB_STATUS_COUNT}`, body);
  }

  // Corrected version - CALL sp_totaljobstatuscountbyclientwiseNew(...);
  // counts by current Wsid only, so tiles sum to the same total as
  // Sp_JobListingLiveCounts. Used by the Open Jobs page.
  getTotalJobStatusCountNew(serviceId: number) {
    const body = {
      id: this.project_id,
      service_id: serviceId,
      user_id: this.getSelectedContactId()
    };
    return this.dataService.doPost(`${GET_TOTAL_JOB_STATUS_COUNT_NEW}`, body);
  }

  // Real Jobs page grid (Open Jobs page reuses it). statusId follows the
  // real widget's contract: 0 = no filter, -1 = "live" (excludes Job
  // Completed/Cancelled inside the proc), any other value = that Wsid only.
  // "All"/0/undefined sentinels are omitted from `filters`, exactly like
  // bs-job-table.tsx's getFilters() does - the backend's buildJobFilters()
  // treats a literal "All" string as a real filter value (matches nothing),
  // so it must never be sent.
  getMovementWithCounts(serviceId: number, statusId: number = -1) {
    const filters: any = {};
    if (statusId !== 0) filters.status_id = statusId;
    const body = {
      project_id: this.project_id,
      service_id: serviceId,
      user_id: this.getSelectedContactId(),
      filters: JSON.stringify(filters)
    };
    return this.dataService.doPost(`${GET_MOVEMENT_WITH_COUNTS}`, body);
  }

  // Open Jobs page grid. wsid 0 = all jobs (still excludes the 35-42 overhead
  // bucket but NOT Job Completed - callers filter that out client-side for
  // the default "open" view); any other value = that Wsid only, applied
  // server-side by the procedure itself.
  getJobStatusStatuswise(serviceId: number, wsid: number = 0) {
    const body = {
      project_id: this.project_id,
      client_id: this.getSelectedContactId(),
      service_id: serviceId,
      status: wsid
    };
    return this.dataService.doPost(`${GET_JOB_STATUS_STATUSWISE}`, body);
  }

  // Closed Jobs page's grid - same shape/contract as getJobStatusStatuswise,
  // just scoped to closed jobs by the proc itself.
  getJobStatusStatuswiseClosed(serviceId: number, wsid: number = 0) {
    const body = {
      project_id: this.project_id,
      client_id: this.getSelectedContactId(),
      service_id: serviceId,
      status: wsid
    };
    return this.dataService.doPost(`${GET_JOB_STATUS_STATUSWISE_CLOSED}`, body);
  }

  // Closed Jobs page's Manager View - Partner Wise Jobs matrix, scoped to
  // the same From/To date range as the grid above it.
  getPartnerWiseJobsStatusClosed(serviceId: number, fromDate: string, toDate: string) {
    const body = {
      project_id: this.project_id,
      client_id: this.getSelectedContactId(),
      service_id: serviceId,
      from_date: fromDate,
      to_date: toDate
    };
    return this.dataService.doPost(`${GET_PARTNER_WISE_JOBS_STATUS_CLOSED}`, body);
  }

  // Open Jobs page's Manager View - Partner Wise Jobs matrix.
  getPartnerWiseJobsStatus(serviceId: number) {
    const body = {
      project_id: this.project_id,
      client_id: this.getSelectedContactId(),
      service_id: serviceId
    };
    return this.dataService.doPost(`${GET_PARTNER_WISE_JOBS_STATUS}`, body);
  }

  // Home page's Turnaround panel: Total Jobs Closed + Average Days in Carisma.
  getHomeTurnaroundSummary(serviceId: number) {
    const body = {
      project_id: this.project_id,
      client_id: this.getSelectedContactId(),
      service_id: serviceId
    };
    return this.dataService.doPost(`${GET_HOME_TURNAROUND_SUMMARY}`, body);
  }

  // Job Status landing page's Closed Jobs card. Same Cid/Pid/Service convention.
  getJobsClosedCounts(serviceId: number) {
    const body = {
      project_id: this.project_id,
      client_id: this.getSelectedContactId(),
      service_id: serviceId
    };
    return this.dataService.doPost(`${GET_JOBS_CLOSED_COUNTS}`, body);
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

  // Movement page's 13-card breakdown (+ All Movement), straight from
  // Sp_WorkStatusMovements — same period/vertical/client params as
  // getMovementReport(), since it needs to stay in sync with the detail rows.
  getMovementWorkStatusSummary(period: string, fromDate?: string, toDate?: string, serviceId: number = 0) {
    const body = {
      project_id: this.project_id,
      service_id: serviceId,
      client_id: this.getSelectedContactId(),
      period: period,
      from_date: fromDate,
      to_date: toDate
    };
    return this.dataService.doPost(`${GET_MOVEMENT_WORKSTATUS_SUMMARY}`, body);
  }
}
