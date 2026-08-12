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
}
