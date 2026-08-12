import { Injectable } from '@angular/core';
import { DataService } from '../app/base/data.service';
import { environment as env } from 'projects/pq-admin/src/environments/environment';
import { routes } from 'projects/pq-admin/src/environments/routes';

const REPORTS_HOST = env.api_production.hosts.reports_server;
const ACCOUNTS_HOST = env.api_production.hosts.accounts_server;

const SAVE_CONNECT_REPORTS = `${REPORTS_HOST}${routes.api_production.reports_api.save_report}`;
const GET_REPORT = `${REPORTS_HOST}${routes.api_production.reports_api.get_report}`;
const DOWNLOAD_AGREED_TEMPLATE = `${REPORTS_HOST}${routes.api_production.reports_api.download_agreed_template}`;
const GET_REPORT_BY_ID = `${REPORTS_HOST}${routes.api_production.reports_api.get_report_by_id}`;
const PREVIEW_REPORT = `${REPORTS_HOST}${routes.api_production.reports_api.preview_report}`;
const ACTION_ON_REPORT = `${REPORTS_HOST}${routes.api_production.reports_api.action_on_report}`;
const APPROVE_REPORT = `${REPORTS_HOST}${routes.api_production.reports_api.approve_report}`;
const REJECT_REPORT = `${REPORTS_HOST}${routes.api_production.reports_api.reject_report}`;
const RESET_REPORT = `${REPORTS_HOST}${routes.api_production.reports_api.reset_report}`;
const DELETE_REPORT = `${REPORTS_HOST}${routes.api_production.reports_api.delete_report}`;
const SAVE_AGREED = `${REPORTS_HOST}${routes.api_production.reports_api.save_agreed}`;
const INSERT_AGREED_WITHOUT_JOBS = `${REPORTS_HOST}${routes.api_production.reports_api.insert_agreed_without_jobs}`;
const GET_AGREED_JOBS = `${REPORTS_HOST}${routes.api_production.reports_api.get_agreed_jobs}`;
const GET_AGREED_JOB_DETAILS = `${REPORTS_HOST}${routes.api_production.reports_api.get_agreed_job_details}`;
const GET_REPORTS_LIST_BY_MONTH_YEAR = `${REPORTS_HOST}${routes.api_production.reports_api.get_report_list_by_month_year}`;
const SEND_APPROVAL_BY_ID = `${REPORTS_HOST}${routes.api_production.reports_api.send_approval_by_id}`;

const EXPORT_REPORTS_MONTH_YEAR = `${REPORTS_HOST}${routes.api_production.reports_api.export_reports_month_year}`;

@Injectable({
  providedIn: 'root'
})
export class ReportsService {

  constructor(
    private dataService: DataService
  ) { }

  saveReport(body: any, file: File, fileParam: string = 'file') {
    return this.dataService.doUploadFormData(`${SAVE_CONNECT_REPORTS}`, body, file, fileParam);
  }

  sendApprovalById(body:any){
    return this.dataService.doPost(`${SEND_APPROVAL_BY_ID}`,body);
  }

  getReport(body: any) {
    return this.dataService.doPost(`${GET_REPORT}`, body);
  }

  getReportByMonthYear(body: any){
    return this.dataService.doPost(`${GET_REPORTS_LIST_BY_MONTH_YEAR}`,body)
  }
  
  exportReportsByMonthYear(body: any) {
    return this.dataService.doGetAsBlobByPost(`${EXPORT_REPORTS_MONTH_YEAR}`,body)
  }

  downloadAgreedTemplate() {
    return this.dataService.doGetAsBlobByPost(`${DOWNLOAD_AGREED_TEMPLATE}`, {});
  }

  getReportByID(body: any) {
    return this.dataService.doPost(`${GET_REPORT_BY_ID}`, body);
  }

  getReportPreview(body: any) {
    return this.dataService.doPostAsArrayBuffer(`${PREVIEW_REPORT}`, body);
  }

  actionOnReport(body: any) {
    return this.dataService.doPost(`${ACTION_ON_REPORT}`, body);
  }

  approveReport(body: any) {
    return this.dataService.doPost(`${APPROVE_REPORT}`, body);
  }

  rejectReport(body: any) {
    return this.dataService.doPost(`${REJECT_REPORT}`, body);
  }

  resetReport(body: any) {
    return this.dataService.doPost(`${RESET_REPORT}`, body);
  }

  deleteReport(body: any) {
    return this.dataService.doPost(`${DELETE_REPORT}`, body);
  }
  
  saveAgreed(body: any, file: File, fileParam: string = 'excel_file') {
    return this.dataService.doUploadFormData(`${SAVE_AGREED}`, body, file, fileParam);
  }

  saveAgreedWithoutJobs(body: any) {
    return this.dataService.doPost(`${INSERT_AGREED_WITHOUT_JOBS}`, body);
  }
  
  getAgreedJobs(body: any) {
    return this.dataService.doPost(`${GET_AGREED_JOBS}`, body);
  }

  getAgreedJobDetails(body: any) {
    return this.dataService.doPost(`${GET_AGREED_JOB_DETAILS}`, body);
  }
  
}
