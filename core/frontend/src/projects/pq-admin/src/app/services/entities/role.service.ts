import { Injectable } from '@angular/core';
import { DataService } from '../app/base/data.service';
import { environment as env } from 'projects/pq-admin/src/environments/environment';
import { routes } from 'projects/pq-admin/src/environments/routes';

const ACCOUNTS_HOST = env.api_production.hosts.accounts_server;
const REPORTS_HOST = env.api_production.hosts.reports_server;

const GET_ALL_ROLES = `${ACCOUNTS_HOST}${routes.api_production.user_api.all_roles}`;
const GET_ROLES_BY_TYPE = `${ACCOUNTS_HOST}${routes.api_production.user_api.roles_by_type}`;
const GET_PERMISSIONS_BY_ROLE = `${ACCOUNTS_HOST}${routes.api_production.user_api.permissions_by_role}`;


@Injectable({
  providedIn: 'root'
})
export class RoleService {

  constructor(
    private dataService: DataService
  ) { }

  getAllRoles() {
    return this.dataService.doGet(`${GET_ALL_ROLES}`);
  }

  getRolesByType(body: any) {
    return this.dataService.doPost(`${GET_ROLES_BY_TYPE}`, body);
  }

  getPermissionsByRole(body: any) {
    return this.dataService.doPost(`${GET_PERMISSIONS_BY_ROLE}`, body);
  }
}
