import { Injectable } from '@angular/core';
import { DataService } from './../data.service';
import { environment as env } from 'projects/reports/src/environments/environment';
import { LocalStorageService } from '../storage/local-storage.service';

const REPORTS_HOST = env.api_production.hosts.reports_server;
const ACCOUNTS_HOST = env.api_production.hosts.accounts_server;

const GET_CLIENT_PORTAL_HEALTH = `${REPORTS_HOST}/client/server/get-client-portal-health`;
const GET_JOBS_SERVER_HEALTH = `${REPORTS_HOST}/client/server/get-jobs-server-health`;
const GET_APP_STATUS = `${ACCOUNTS_HOST}/client/app/get-app-status`;
const GET_APP_MESSAGE = `${REPORTS_HOST}/client/app/get-client-portal-message`;
const GET_APP_RECENT_UDPATES = `${ACCOUNTS_HOST}/client/app-updates/get-app-updates`;
const GET_APP_RECENT_UDPATE = `${ACCOUNTS_HOST}/client/app-updates/get-app-update-by-id`;

@Injectable({
  providedIn: 'root'
})
export class SystemService {

  constructor(
   private dataService : DataService,
   private localStorageService: LocalStorageService
  ) { }

  getClientPortalHealth() {
    return this.dataService.doGet(`${GET_CLIENT_PORTAL_HEALTH}`)
  }

  getJobServerHealth() {
    return this.dataService.doGet(`${GET_JOBS_SERVER_HEALTH}`)
  }
  
  getAppStatus() {
    return this.dataService.doGet(`${GET_APP_STATUS}`)
  }
  
  getAppMessage() {
    return this.dataService.doGet(`${GET_APP_MESSAGE}`)
  }
  
  getRecentAppUpdates(body: any) {
    return this.dataService.doPost(`${GET_APP_RECENT_UDPATES}`, body);
  }
  
  getRecentAppUpdate(body: any) {
    return this.dataService.doPost(`${GET_APP_RECENT_UDPATE}`, body);
  }

}
