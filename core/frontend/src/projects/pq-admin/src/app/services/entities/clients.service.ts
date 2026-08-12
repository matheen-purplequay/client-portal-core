import { Injectable } from '@angular/core';
import { environment as env } from 'projects/pq-admin/src/environments/environment';
import { DataService } from '../app/base/data.service';
import { routes } from 'projects/pq-admin/src/environments/routes';

const ACCOUNTS_HOST = env.api_production.hosts.accounts_server;
const REPORTS_HOST = env.api_production.hosts.reports_server;

const GET_ALL_CLIENTS = `${REPORTS_HOST}${routes.api_production.clients_api.get_all_clients}`;
const GET_CP_CLIENTS = `${REPORTS_HOST}${routes.api_production.clients_api.get_cp_clients}`;
const GET_WM_CLIENTS = `${REPORTS_HOST}${routes.api_production.clients_api.get_wm_clients}`;
const GET_CLIENT = `${REPORTS_HOST}${routes.api_production.clients_api.get_client}`;
const GET_CONTRACTS = `${REPORTS_HOST}${routes.api_production.clients_api.get_contracts}`;
const GET_COMPANY_FROM_DASHBOARD = `${ACCOUNTS_HOST}${routes.api_production.clients_api.get_company_from_dashboard}`;
const GET_COMPANY_FROM_DASHBOARD_BY_ID = `${ACCOUNTS_HOST}${routes.api_production.clients_api.get_company_from_dashboard_id}`;
const ADD_COMPANY_DETAILS = `${ACCOUNTS_HOST}${routes.api_production.clients_api.add_company_details}`;
const UPDATE_COMPANY_DETAILS = `${ACCOUNTS_HOST}${routes.api_production.clients_api.update_company_details}`;
const GET_ALL_CLIENT_USERS = `${ACCOUNTS_HOST}${routes.api_production.clients_api.get_all_client_users}`;
const GET_ALL_CLIENTS_FROM_DASHBOARD_DB = `${ACCOUNTS_HOST}${routes.api_production.clients_api.get_all_clients_from_dashboard_db}`;
const GET_ALL_CLIENTS_FROM_WM_DB = `${ACCOUNTS_HOST}${routes.api_production.clients_api.get_all_clients_from_wm}`;
const GET_CLIENT_USERS_BY_PROJECT = `${ACCOUNTS_HOST}${routes.api_production.clients_api.get_all_clients_users_by_project}`;

const GET_CLIENT_MANAGEMENT_USERS = `${ACCOUNTS_HOST}${routes.api_production.clients_api.get_client_management_users}`;

// Activities Routes
const GET_CLIENT_LOGIN_ACTIVITIES = `${ACCOUNTS_HOST}${routes.api_production.clients_api.get_client_login_activities}`;

const SYNC_BASIC_COMPANY_DETAILS = `${ACCOUNTS_HOST}${routes.api_production.clients_api.sync_basic_company_details}`;


@Injectable({
  providedIn: 'root'
})
export class ClientsService {

  constructor(
    private dataService: DataService
  ) { }

  getAllClients() {
    return this.dataService.doGet(`${GET_ALL_CLIENTS}`);
  }

  getAllClientsFromWM() {
    return this.dataService.doGet(`${GET_ALL_CLIENTS_FROM_WM_DB}`);
  }

  getCPClients(body: any) {
    return this.dataService.doPost(`${GET_CP_CLIENTS}`, body);
  }

  getWMClients() {
    return this.dataService.doGet(`${GET_WM_CLIENTS}`);
  }

  getClient(body: any) {
    return this.dataService.doPost(`${GET_CLIENT}`, body);
  }

  getAllClientUsers(){
    return this.dataService.doGet(`${GET_ALL_CLIENT_USERS}`);
  }

  getAllClientsFromDashboardDb(){
    return this.dataService.doGet(`${GET_ALL_CLIENTS_FROM_DASHBOARD_DB}`);
  }

  getClientUsersByProjectId(body: any) {
    return this.dataService.doPost(`${GET_CLIENT_USERS_BY_PROJECT}`, body);
  }

  getContracts(body: any) {
    return this.dataService.doPost(`${GET_CONTRACTS}`, body);
  }

  getCompanyFromDashboard(body: any){
    return this.dataService.doPost(`${GET_COMPANY_FROM_DASHBOARD}`, body);
  }

  getCompanyFromDashboardByID(body: any){
    return this.dataService.doPost(`${GET_COMPANY_FROM_DASHBOARD_BY_ID}`, body);
  }

  addCompanyDetails(body: any){
    return this.dataService.doPost(`${ADD_COMPANY_DETAILS}`,body);
  }

  updateCompanyDetails(body: any){
    return this.dataService.doPost(`${UPDATE_COMPANY_DETAILS}`,body);
  }
  
  getClientManagementUsers(body: any) {
    return this.dataService.doPost(`${GET_CLIENT_MANAGEMENT_USERS}`,body);
  }
  
  // Activities
  getClientLoginActivities(body: any, page_number: number = 1) {
    return this.dataService.doPost(`${GET_CLIENT_LOGIN_ACTIVITIES}${(page_number > 1)? '?page=' + page_number : ''}`, body);
  }
  
  syncBasicCompanyDetails(body: any) {
    return this.dataService.doPost(`${SYNC_BASIC_COMPANY_DETAILS}`, body);
  }
}
