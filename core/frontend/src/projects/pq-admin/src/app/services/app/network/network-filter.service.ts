import { Injectable } from '@angular/core';
import { environment as env } from 'projects/pq-admin/src/environments/environment';
import { routes } from 'projects/pq-admin/src/environments/routes';
import { DataService } from '../base/data.service';

const REPORTS_HOST = env.api_production.hosts.reports_server;
const ACCOUNTS_HOST = env.api_production.hosts.accounts_server;

const GET_WHITELISTED_IPS_REQUESTS = `${ACCOUNTS_HOST}${routes.api_production.network_api.get_whitelist_ips_requests}`;
const GET_WHITELISTED_IPS_BY_ID = `${ACCOUNTS_HOST}${routes.api_production.network_api.get_whitelisted_ips_by_id}`;
const REPLACE_WHITELIST_IP = `${ACCOUNTS_HOST}${routes.api_production.network_api.replace_whitelist_ip}`;

@Injectable({
  providedIn: 'root'
})
export class NetworkFilterService {

  constructor(
    private dataService: DataService
  ) { }

  getWhitelistedIPsRequests() {
    return this.dataService.doGet(`${GET_WHITELISTED_IPS_REQUESTS}`);
  }

  getWhitelistedIPsByUserId(body: any) {
    return this.dataService.doPost(`${GET_WHITELISTED_IPS_BY_ID}`, body);
  }

  replaceWhitelistIP(body: any) {
    return this.dataService.doPost(`${REPLACE_WHITELIST_IP}`, body);
  }
}
