import { Injectable } from '@angular/core';
import { environment as env } from 'projects/reports/src/environments/environment';
import { DataService } from '../app/data.service';
import { Client, Clients } from '../../models/client';
import { LoginService } from '../authentication/login.service';
import { LocalStorageService } from '../app/storage/local-storage.service';
import { Observable } from 'rxjs';

const ACCOUNTS_HOST = env.api_production.hosts.accounts_server;
const REPORTS_HOST = env.api_production.hosts.reports_server;

const GET_VERTICALS = `${REPORTS_HOST}/get-client-verticals`;
const GET_CLIENT_VERTICALS = `${REPORTS_HOST}/client/get-verticals`;
const GET_CLIENT_USERS_BY_CLIENT = `${ACCOUNTS_HOST}/client/get-users-by-client`;

@Injectable({
  providedIn: 'root'
})
export class ClientService {

  clients: Clients = Client.defaultClients();
  clientUsers: { list: any[], selectedUser: any, keys: { key: string, value: string } } = {
    list: [],
    selectedUser: undefined,
    keys: { key: 'id', value: 'name' }
  };

  constructor(
    private dataService: DataService,
    private loginService: LoginService,
    private localStorageService: LocalStorageService
  ) { 
    // this.getClientsList();
  }

  getVerticals(body: any) {
    return this.dataService.doPost(`${GET_VERTICALS}`, body);
  }

  getClientVerticals(body: any) {
    return this.dataService.doPost(`${GET_CLIENT_VERTICALS}`, body);
  }
  
  getClientUsers(body: any) {
    return this.dataService.doPost(`${GET_CLIENT_USERS_BY_CLIENT}`, body);
  }

  // getClientsList() {
  //   this.clients.companies = [];
  //   const master_company = sessionStorage.getItem('master_company');
  //   let master_id = 1;
  //   if(master_company != null && master_company == 'pq') master_id = 2;
  //   const body = {
  //     master_id: master_id
  //   };
  //   this.loginService.getClientsByMaster(body).subscribe((res: any) => {
  //     if(res.status) {
  //       this.clients.companies = res.data;
  //       const localCompanyId = this.localStorageService.getItem('userdata').project_id;
  //       this.clients.selectedClient = this.clients.companies.filter(company => company.works_manager_client_id === localCompanyId)[0];
  //       console.log('clients list get ', this.clients.companies, this.clients.selectedClient, this.localStorageService.getItem('userdata').project_id);
  //       // this.getClientUserList();
  //     } 
  //   });
  // }

  // getClientUserList(): Observable<any> {
  //   const body = {
  //     client_id: this.clients.selectedClient.id
  //   };
  //   return new Observable(observer => {
  //     this.getClientUsers(body).subscribe((res: any) => {
  //       if (res.status) {
  //         console.log('getting client user list from service ... ', res);
  //         this.clientUsers.list = res.data;
  //         this.clientUsers.selectedUser = res.data[0];
  //         if (this.localStorageService.isItemExists('wm_user')) {
  //           this.clientUsers.selectedUser = res.data.filter((user: any) => user.id == this.localStorageService.getItem('wm_user').id)[0];
  //           console.log('local storage client ', this.clientUsers.selectedUser);
  //         } else {
  //           this.clientUsers.selectedUser = res.data[0];
  //           this.localStorageService.setItem('wm_user', res.data[0]);
  //           console.log('new client from api ', this.clientUsers.selectedUser);
  //         }
  //         observer.next(this.clientUsers);
  //         observer.complete();
  //       } else {
  //         observer.error('Failed to fetch client user list');
  //       }
  //     });
  //   });
  // }

  setSelectedClientUser(user: any) {
    this.clientUsers.selectedUser = user;
    this.localStorageService.setItem('wm_user', user);
    return user;
  }

  getSelectedClientUser() {
    return this.clientUsers.selectedUser;
  }

  getSelectedClient() {
    return this.clients.selectedClient;
  }
}
