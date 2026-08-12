import { Injectable } from '@angular/core';
import { DataService } from '../data.service';
import { environment as env } from 'projects/reports/src/environments/environment';

const REPORTS_HOST = env.api_production.hosts.reports_server;
const ACCOUNTS_HOST = env.api_production.hosts.accounts_server;
const VERISON_UPDATE_SHOWN = `${ACCOUNTS_HOST}/client/app-updates/set-version-update-shown`;

@Injectable({
  providedIn: 'root'
})
export class PortalService {

  constructor(private dataService: DataService) { }

  updateVersionShown(body: any) {
    return this.dataService.doPost(`${VERISON_UPDATE_SHOWN}`, body);
  }
}
