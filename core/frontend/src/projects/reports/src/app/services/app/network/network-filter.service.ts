import { Injectable } from '@angular/core';
import { DataService } from './../data.service';
import { environment as env } from 'projects/reports/src/environments/environment';
import { LocalStorageService } from '../storage/local-storage.service';

const REPORTS_HOST = env.api_production.hosts.reports_server;
const ACCOUNTS_HOST = env.api_production.hosts.accounts_server;

const GET_WHITELISTED_IPS = `${ACCOUNTS_HOST}/client/whitelist-ip/get-whitelisted-ips-by-user-id`;
const REQUEST_NEW_IP = `${ACCOUNTS_HOST}/client/whitelist-ip/request-new-ip-approval`;

@Injectable({
  providedIn: 'root'
})
export class NetworkFilterService {

  constructor(
    private dataService: DataService
  ) { }

  getWhitelistedIPs(body: any) {
    return this.dataService.doPost(`${GET_WHITELISTED_IPS}`, body);
  }

  requestNewIP(body: any) {
    return this.dataService.doPost(`${REQUEST_NEW_IP}`, body);
  }
}
