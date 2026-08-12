import { Injectable } from '@angular/core';
import { environment as env } from 'projects/pq-admin/src/environments/environment';
import { DataService } from './data.service';
import { routes } from 'projects/pq-admin/src/environments/routes';

const REPORTS_HOST = env.api_production.hosts.reports_server;
const ACCOUNTS_HOST = env.api_production.hosts.accounts_server;
const GET_DASHBOARD_MASTER_BY_ID = `${REPORTS_HOST}${routes.api_production.master_api.get_dashboard_master_by_id}`;
const GET_DASHBOARD_MASTER = `${REPORTS_HOST}${routes.api_production.master_api.get_dashboard_master}`;

// Master Groups
const GET_ALL_MASTER_GROUPS = `${REPORTS_HOST}${routes.api_production.master_api.get_all_master_groups}`;
const GET_MASTER_GROUPS_BY_MODULE = `${REPORTS_HOST}${routes.api_production.master_api.get_master_groups_my_module}`;
const GET_MASTER_CATEGORIES = `${REPORTS_HOST}${routes.api_production.master_api.get_master_categories}`;
const GET_MASTER_DATA = `${REPORTS_HOST}${routes.api_production.master_api.get_master_data}`;

// Modules
const GET_ALL_MODULES = `${REPORTS_HOST}${routes.api_production.master_api.get_all_modules}`;

// Job Status Masters
const GET_MAPPED_STATUS_LIST = `${REPORTS_HOST}${routes.api_production.master_api.get_mapped_status_list}`
const GET_PRIMARY_JOB_STATUS = `${REPORTS_HOST}${routes.api_production.master_api.get_primary_job_status}`;
const GET_SECONDARY_JOB_STATUS = `${REPORTS_HOST}${routes.api_production.master_api.get_secondary_job_status}`;
const MAP_PRIMARY_JOB_STATUS = `${REPORTS_HOST}${routes.api_production.master_api.map_primary_job_status}`;
const REMOVE_PRIMARY_JOB_STATUS_MAPPING = `${REPORTS_HOST}${routes.api_production.master_api.remove_primary_job_status_mapping}`;

// Colors Master


@Injectable({
  providedIn: 'root'
})
export class MasterService {

  constructor(
    private dataService: DataService
  ) { }

  getDashbaordMasterById(body: any) {
    return this.dataService.doPost(`${GET_DASHBOARD_MASTER_BY_ID}`, body);
  }
  
  getAllMasterGroups() {
    return this.dataService.doGet(`${GET_ALL_MASTER_GROUPS}`);
  }

  getMasterGroupsByModule(body: any) {
    return this.dataService.doPost(`${GET_MASTER_GROUPS_BY_MODULE}`, body);
  }
  
  getMasterCategories(body: any) {
    return this.dataService.doPost(`${GET_MASTER_CATEGORIES}`, body);
  }
  
  getMasterData(body: any) {
    return this.dataService.doPost(`${GET_MASTER_DATA}`, body);
  }

  getDashbaordMaster() {
    return this.dataService.doGet(`${GET_DASHBOARD_MASTER}`);
  }
  
  getAllModules() {
    return this.dataService.doGet(`${GET_ALL_MODULES}`);
  }
  
  mapPrimarytoSecondaryStatus(body: any) {
    return this.dataService.doPost(`${MAP_PRIMARY_JOB_STATUS}`, body);
  }

  getMappedStatusList(body: any) {
    return this.dataService.doPost(`${GET_MAPPED_STATUS_LIST}`, body);
  }
  
  getPrimaryJobStatus() {
    return this.dataService.doGet(`${GET_PRIMARY_JOB_STATUS}`);
  }
  
  getSecondaryJobStatus() {
    return this.dataService.doGet(`${GET_SECONDARY_JOB_STATUS}`);
  }

  removePrimaryStatusMapping(body: any) {
    return this.dataService.doPost(`${REMOVE_PRIMARY_JOB_STATUS_MAPPING}`, body);
  }
}
