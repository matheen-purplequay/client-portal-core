import { Injectable } from '@angular/core';
import { DataService } from '../data.service';
import { environment as env } from 'projects/reports/src/environments/environment';

const REPORTS_HOST = env.api_production.hosts.reports_server;
const ACCOUNTS_HOST = env.api_production.hosts.accounts_server;
const GET_RULES_BY_CLIENT = `${REPORTS_HOST}/client/rules/get-rules-by-client`;

@Injectable({
  providedIn: 'root'
})
export class RulesService {

  constructor(
    private dataService: DataService
  ) { }

  getRulesByClient(body: any) {
    return this.dataService.doPost(`${GET_RULES_BY_CLIENT}`, body);
  }
}
