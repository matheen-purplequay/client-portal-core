import { Injectable } from '@angular/core';
import { environment as env } from 'projects/pq-admin/src/environments/environment';
import { DataService } from './data.service';
import { routes } from 'projects/pq-admin/src/environments/routes';

const REPORTS_HOST = env.api_production.hosts.reports_server;
const ACCOUNTS_HOST = env.api_production.hosts.accounts_server;

const GET_RULE_MASTER = `${REPORTS_HOST}${routes.api_production.rules_api.get_rule_master}`;
const GET_RULES = `${REPORTS_HOST}${routes.api_production.rules_api.get_rules}`;
const GET_RULES_BY_CLIENT = `${REPORTS_HOST}${routes.api_production.rules_api.get_rules_by_client}`;
const SET_RULES_BY_CLIENT = `${REPORTS_HOST}${routes.api_production.rules_api.set_rules_by_client}`;
const SAVE_RULES_BY_CLIENT = `${REPORTS_HOST}${routes.api_production.rules_api.save_rules_by_client}`;
const RESET_RULES_BY_CLIENT = `${REPORTS_HOST}${routes.api_production.rules_api.reset_rules_for_client}`;

@Injectable({
  providedIn: 'root'
})
export class RulesService {

  constructor(
    private dataService: DataService
  ) { }

  getRuleMaster() {
    return this.dataService.doGet(`${GET_RULE_MASTER}`);
  }

  getRules(body: any) {
    return this.dataService.doPost(`${GET_RULES}`, body);
  }
  
  getRulesByClient(body: any) {
    return this.dataService.doPost(`${GET_RULES_BY_CLIENT}`, body);
  }
  
  setRulesByClient(body: any) {
    return this.dataService.doPost(`${SET_RULES_BY_CLIENT}`, body);
  }

  saveRulesByClient(body: any) {
    return this.dataService.doPost(`${SAVE_RULES_BY_CLIENT}`, body);
  }
  
  resetRulesForClient(body: any) {
    return this.dataService.doPost(`${RESET_RULES_BY_CLIENT}`, body);
  }
}
