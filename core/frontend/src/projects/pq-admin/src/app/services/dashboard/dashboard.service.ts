import { Injectable } from '@angular/core';
import { environment as env } from 'projects/pq-admin/src/environments/environment';
import { DataService } from '../app/base/data.service';
import { routes } from 'projects/pq-admin/src/environments/routes';

const REPORTS_HOST = env.api_production.hosts.reports_server;
const ACCOUNTS_HOST = env.api_production.hosts.accounts_server;

const GET_AVAILABLE_COMPANIES = `${REPORTS_HOST}${routes.api_production.dashboard_api.get_available_companies}`;

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(
    private dataService: DataService
  ) { }

  getAvailableCompanies(body: any) {
    return this.dataService.doPost(`${GET_AVAILABLE_COMPANIES}`, body);
  }
}
