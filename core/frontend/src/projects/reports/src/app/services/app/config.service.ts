import { Injectable } from '@angular/core';
import { DataService } from './data.service';
import { environment as env } from 'projects/reports/src/environments/environment';

const ACCOUNTS_HOST = env.api_production.hosts.accounts_server;
const REPORTS_HOST = env.api_production.hosts.reports_server;

const GET_MASTER_COMPANY = `${ACCOUNTS_HOST}/get-master-company`;
const GET_DASHBOARD_RULES = `${ACCOUNTS_HOST}/client/get-company-rules`;

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  constructor(
    private dataService: DataService
  ) { }

  getJSONData(data: string) {
    return this.dataService.doGet(`assets/json/${data}.json`);
  }

  getHTMLData(data: string) {
    return this.dataService.readHtmlFile(`assets/html/${data}.html`);
  }
  
  getPDFAsArrayBuffer(url: string) {
    return this.dataService.doGetAsArrayBuffer(url);
  }

  getMasterCompany(body: any) {
    return this.dataService.doPost(`${GET_MASTER_COMPANY}`, body);
  }
  
  getDashboardRules(body: any) {
    return this.dataService.doPost(`${GET_DASHBOARD_RULES}`, body);
  }
}
