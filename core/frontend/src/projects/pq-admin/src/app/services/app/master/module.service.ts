import { Injectable } from '@angular/core';
import { DataService } from '../base/data.service';
import { environment as env } from 'projects/pq-admin/src/environments/environment';
import { routes } from 'projects/pq-admin/src/environments/routes';

const ACCOUNTS_HOST = env.api_production.hosts.accounts_server;

const GET_ALL_MODULES = `${ACCOUNTS_HOST}${routes.api_production.modules_api.get_all_modules}`;
const ADD_MODULE = `${ACCOUNTS_HOST}${routes.api_production.modules_api.add_module}`;


@Injectable({
  providedIn: 'root'
})
export class ModuleService {

  constructor(
    private dataService: DataService
  ) { }

  getAllModules() {
    return this.dataService.doGet(`${GET_ALL_MODULES}`);
  }

  addModule(body: any) {
    return this.dataService.doPost(`${ADD_MODULE}`, body);
  }
}
