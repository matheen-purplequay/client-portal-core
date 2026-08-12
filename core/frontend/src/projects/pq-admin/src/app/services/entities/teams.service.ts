import { Injectable } from '@angular/core';
import { environment as env } from 'projects/pq-admin/src/environments/environment';
import { DataService } from '../app/base/data.service';
import { routes } from 'projects/pq-admin/src/environments/routes';

const REPORTS_HOST = env.api_production.hosts.reports_server;
const ACCOUNTS_HOST = env.api_production.hosts.accounts_server;

const GET_VERTICALS = `${REPORTS_HOST}${routes.api_production.teams_api.get_verticals}`;
const GET_ROLES = `${REPORTS_HOST}${routes.api_production.teams_api.get_roles}`;
const GET_TEAMS = `${REPORTS_HOST}${routes.api_production.teams_api.get_team}`;
const GET_TEAM = `${REPORTS_HOST}${routes.api_production.teams_api.get_team}`;
const GET_SELF_USERS = `${ACCOUNTS_HOST}${routes.api_production.user_api.get_self_users}`;
const GET_TEAM_USERS = `${ACCOUNTS_HOST}${routes.api_production.user_api.get_team_users}`;
const ADD_TEAM_MEMBER = `${REPORTS_HOST}${routes.api_production.teams_api.add_team}`;
const TOGGLE_STATUS_TEAM_MEMBER = `${REPORTS_HOST}${routes.api_production.teams_api.toggle_status_team}`;
const DELETE_TEAM_MEMBER = `${REPORTS_HOST}${routes.api_production.teams_api.delete_team}`;

@Injectable({
  providedIn: 'root'
})
export class TeamsService {

  constructor(
    private dataService: DataService
  ) { }

  getVerticals() {
    return this.dataService.doGet(`${GET_VERTICALS}`);
  }

  getRoles(body: any) {
    return this.dataService.doPost(`${GET_ROLES}`, body);
  }
  
  getSelfUsers(body: any) {
    return this.dataService.doPost(`${GET_SELF_USERS}`, body);
  }
  
  getTeamUsers(body: any) {
    return this.dataService.doPost(`${GET_TEAM_USERS}`, body);
  }

  getTeams(body: any) {
    return this.dataService.doPost(`${GET_TEAMS}`, body);
  }

  getTeam(body: any) {
    return this.dataService.doPost(`${GET_TEAM}`, body);
  }
  
  addToTeam(body: any) {
    return this.dataService.doPost(`${ADD_TEAM_MEMBER}`, body);
  }

  toggleStatusTeamMember(body: any) {
    return this.dataService.doPost(`${TOGGLE_STATUS_TEAM_MEMBER}`, body);
  }

  deleteTeamMember(body: any) {
    return this.dataService.doPost(`${DELETE_TEAM_MEMBER}`, body);
  }
}
