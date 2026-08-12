import { Injectable } from '@angular/core';
import { environment as env } from 'projects/pq-admin/src/environments/environment';
import { routes } from 'projects/pq-admin/src/environments/routes';
import { DataService } from '../base/data.service';

const REPORTS_HOST = env.api_production.hosts.reports_server;
const ACCOUNTS_HOST = env.api_production.hosts.accounts_server;

const GET_SYSTEM_HEALTH = `${REPORTS_HOST}${routes.api_production.system_api.get_server_health}`;
const GET_APP_STATUS = `${ACCOUNTS_HOST}${routes.api_production.system_api.get_app_status}`;
const SET_UNDER_MAINTENANCE = `${ACCOUNTS_HOST}${routes.api_production.system_api.set_under_maintenance}`;
const SET_LIVE = `${ACCOUNTS_HOST}${routes.api_production.system_api.set_live}`;

// App Updates
const GET_ALL_PORTALS = `${ACCOUNTS_HOST}${routes.api_production.app_api.get_all_portals}`;
const GET_ALL_SUB_PORTALS = `${ACCOUNTS_HOST}${routes.api_production.app_api.get_all_sub_portals}`;
const GET_APP_UPDATES = `${ACCOUNTS_HOST}${routes.api_production.app_api.get_app_updates}`;
const GET_APP_UPDATE = `${ACCOUNTS_HOST}${routes.api_production.app_api.get_app_update}`;
const SAVE_APP_UPDATES = `${ACCOUNTS_HOST}${routes.api_production.app_api.save_app_updates}`;
const ACTIVATE_UPDATE = `${ACCOUNTS_HOST}${routes.api_production.app_api.activate_update}`;
const DELETE_UPDATE = `${ACCOUNTS_HOST}${routes.api_production.app_api.delete_update}`;


@Injectable({
  providedIn: 'root'
})
export class SystemService {

  constructor(
    private dataService: DataService
  ) { }

  getSystemHealth() {
    return this.dataService.doGet(`${GET_SYSTEM_HEALTH}`);
  }
  
  getAppStatus() {
    return this.dataService.doGet(`${GET_APP_STATUS}`);
  }

  setUnderMaintenance() {
    return this.dataService.doGet(`${SET_UNDER_MAINTENANCE}`);
  }

  setLive() {
    return this.dataService.doGet(`${SET_LIVE}`);
  }
  
  // App Updates 
  getAllPortals() {
    return this.dataService.doGet(`${GET_ALL_PORTALS}`);
  }

  getAllSubPortals() {
    return this.dataService.doGet(`${GET_ALL_SUB_PORTALS}`);
  }

  getAppUpdates(body: any) {
    return this.dataService.doPost(`${GET_APP_UPDATES}`, body);
  }

  getAppUpdate(body: any) {
    return this.dataService.doPost(`${GET_APP_UPDATE}`, body);
  }

  saveAppUpdates(body: any) {
    return this.dataService.doPost(`${SAVE_APP_UPDATES}`, body);
  }

  activateUpdate(body: any) {
    return this.dataService.doPost(`${ACTIVATE_UPDATE}`, body);
  }

  deleteUpdate(body: any) {
    return this.dataService.doPost(`${DELETE_UPDATE}`, body);
  }
}
