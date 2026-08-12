import { Injectable } from '@angular/core';
import { environment as env } from 'projects/pq-admin/src/environments/environment';
import { DataService } from '../app/base/data.service';
import { Observable, map } from 'rxjs';
import { routes } from 'projects/pq-admin/src/environments/routes';
import { StorageService } from '../app/storage/storage.service';

const REPORTS_HOST = env.api_production.hosts.reports_server;
const ACCOUNTS_HOST = env.api_production.hosts.accounts_server;

const GENERATE_ACCESS = `${ACCOUNTS_HOST}${routes.api_production.user_api.generate_access}`;
const GENERATE_INTERNAL_ACCESS = `${ACCOUNTS_HOST}${routes.api_production.user_api.generate_internal_access}`;
const UPDATE_CLIENT_USER = `${ACCOUNTS_HOST}${routes.api_production.user_api.update_client_user}`;
const REMOVE_CLIENT_USER = `${ACCOUNTS_HOST}${routes.api_production.user_api.removeUser}`;
const SYNC_WM_CLIENT_ID = `${ACCOUNTS_HOST}${routes.api_production.user_api.sync_wm_client_id}`;
const CHECK_IF_USER_EXISTS = `${ACCOUNTS_HOST}${routes.api_production.user_api.check_if_user_exists}`;

const GET_USERS = `${ACCOUNTS_HOST}${routes.api_production.user_api.get_users}`;
const GET_CLIENT_USERS = `${ACCOUNTS_HOST}${routes.api_production.user_api.get_client_users}`;
const GET_ALL_CLIENTS_BY_FILTERS = `${ACCOUNTS_HOST}${routes.api_production.user_api.get_all_client_users_by_filters}`;
const GET_ALL_CLIENT_USERS = `${ACCOUNTS_HOST}${routes.api_production.user_api.get_all_client_users}`;
const GET_PERMISSIONS = `${ACCOUNTS_HOST}${routes.api_production.login_api.get_permissions}`;
const GET_USER_BY_WM_EMAIL = `${REPORTS_HOST}${routes.api_production.teams_api.get_user_by_wm_email}`;

const LOAD_USERS = `${REPORTS_HOST}${routes.api_production.user_api.load_users}`;
const CHECK_CLIENT_IF_EXISTS = `${ACCOUNTS_HOST}${routes.api_production.user_api.check_client_if_exists}`;

const GET_USER_WISE_CLIENT = `${REPORTS_HOST}${routes.api_production.user_api.get_user_wise_clients}`;
const GET_WM_INTERNAL_USERS = `${ACCOUNTS_HOST}${routes.api_production.user_api.get_wm_internal_users}`;

@Injectable({
  providedIn: 'root'
})
export class UserService {
  userPermissions: any;

  constructor(
    private dataService: DataService,
    private storageService: StorageService
  ) { 
  }

  checkClientIfExists(body:any){
    return this.dataService.doPost(`${CHECK_CLIENT_IF_EXISTS}`,body);
  }

  getUserPermissionsFromLocalStorage() {
    return this.storageService.getItem('permissions');
  }

  getUserPermission(): Observable<any> {
    return this.dataService.doGetJSONData('roles').pipe(
      map((data: any) => {
        this.userPermissions = data[this.storageService.getItem('userdata').role];
        console.log('permissions in user service ', this.userPermissions);
        
        return this.userPermissions;
      })
    );
  }

  getPermissions(body: any): Observable<any> {
    return this.dataService.doPost(`${GET_PERMISSIONS}`, body).pipe(
      map((response: any) => {
        this.userPermissions = response.data;
        return this.userPermissions;
      })
    );
  }

  getUserWiseClient(body: any) {
    return this.dataService.doPost(`${GET_USER_WISE_CLIENT}`, body);
  }

  /**
 * This function used to get user by their email id in wm.
 * @param {any} body - Body should contain email address.
 * @returns {Observable} object - Returns observable object with data from api.
 */
  getUserByWMEmail(body: any) {
    return this.dataService.doPost(`${GET_USER_BY_WM_EMAIL}`, body);
  }

  getUsers(body: any) {
    return this.dataService.doPost(`${GET_USERS}`, body);
  }
  
  getClientUsers(body: any) {
    return this.dataService.doPost(`${GET_CLIENT_USERS}`, body);
  }

  getAllClientUsers() {
    return this.dataService.doGet(`${GET_ALL_CLIENT_USERS}`);
  }

  getAllClientsByFilters(body: any) {
    return this.dataService.doPost(`${GET_ALL_CLIENTS_BY_FILTERS}`, body);
  }


  getUserRoles() {
    return this.dataService.doGetJSONData('roles');
  }

  checkIfUserExists(body: any) {
    return this.dataService.doPost(`${CHECK_IF_USER_EXISTS}`, body);
  }

  generateAccess(body: any) {
    return this.dataService.doPost(`${GENERATE_ACCESS}`, body);
  }

  generateInternalAccess(body: any) {
    return this.dataService.doPost(`${GENERATE_INTERNAL_ACCESS}`, body);
  }
  
  updateClientUser(body: any) {
    return this.dataService.doPost(`${UPDATE_CLIENT_USER}`, body);
  }

  removeClientUser(body: any) {
    return this.dataService.doPost(`${REMOVE_CLIENT_USER}`, body);
  }

  syncWorksManagerID(body: any) {
    return this.dataService.doPost(`${SYNC_WM_CLIENT_ID}`, body);
  }
  
  getWMInternalUsers() {
    return this.dataService.doGet(`${GET_WM_INTERNAL_USERS}`);
  }
  
  loadUsers(body: any, file: File, fileParam: string = 'file') {
    return this.dataService.doUploadFormData(`${LOAD_USERS}`, body, file, fileParam);
  }
}
