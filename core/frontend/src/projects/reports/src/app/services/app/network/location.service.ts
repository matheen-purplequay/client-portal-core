import { Injectable } from '@angular/core';
import { DataService } from './../data.service';
import { environment as env } from 'projects/reports/src/environments/environment';
import { LocalStorageService } from '../storage/local-storage.service';

const REPORTS_HOST = env.api_production.hosts.reports_server;
const ACCOUNTS_HOST = env.api_production.hosts.accounts_server;

const GET_REGION = `${ACCOUNTS_HOST}/client/app/get-region`;

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  constructor(
    private dataService: DataService
  ) { }

  getRegion(body: any) {
    return this.dataService.doPost(`${GET_REGION}`, body);
  }
}
