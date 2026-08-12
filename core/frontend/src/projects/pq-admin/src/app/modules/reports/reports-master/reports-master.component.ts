import { Component, OnInit, ViewChild } from '@angular/core';
import { ReportsService } from '../../../services/reports/reports.service';
import { ClientsService } from '../../../services/entities/clients.service';
import { ActivatedRoute } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { Activities, Activity } from '../../../models/activities';
import { ReportsListComponent } from '../reports-list/reports-list.component';
import { BehaviorSubject } from 'rxjs';
import { Client, Clients } from '../../../models/client';
import { UserService } from '../../../services/entities/user.service';
import { StorageService } from '../../../services/app/storage/storage.service';

@Component({
  selector: 'app-reports-master',
  templateUrl: './reports-master.component.html',
  styleUrls: ['./reports-master.component.scss']
})
export class ReportsMasterComponent implements OnInit {

  refresh: BehaviorSubject<boolean> = new BehaviorSubject(false);
  tab: number = 0;
  user: any;
  activities: Activities = Activity.defaultActivities();
  activity: number = 0;
  clients: BehaviorSubject<Clients> = new BehaviorSubject(Client.defaultClients());
  selectedClient: BehaviorSubject<{ works_manager_client_id: number; name: string; }> = new BehaviorSubject({ works_manager_client_id: 0, name: '' });
  isClientsLoading = false;
  isContract: { isStaff: boolean, isHourly: boolean, isAgreed: boolean } = {
    isStaff: false, isHourly: false, isAgreed: false
  };
  isContractLoaded: boolean = false;

  tabs: {[key: string]: { index: number, label: string }} = {
    connect_report: { index: 1, label: 'Connect Reports' },
    agreed: { index: 2, label: 'Agreed' },
    // team: { index: 3, label: 'Team' },
    // contact: { index: 4, label: 'Contact Recipients' }
  };

  filterTabs: {
    tabs: any[],
    selectedTab: {index: number, label: string},
  } = {
    tabs: Object.values(this.tabs),
    selectedTab: { index: 1, label: 'Connect Reports' }
  };

  period: { 
    years: number[],
    monthNames: string[],
    selectedPeriod: { date: number, month: number, year: number }
  } = {
    years: [2023],
    monthNames: ['All Months', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    selectedPeriod: { date: new Date().getDate(), month: 0, year: new Date().getFullYear() }
  };

  roleModules = ['connect_report', 'agreed', 'team', 'contact'];

  constructor(
    private reportService: ReportsService,
    private clientsService: ClientsService,
    private activatedRoute: ActivatedRoute,
    private storageService: StorageService,
    private userService: UserService,
    private titleCasePipe: TitleCasePipe
  ) { }

  ngOnInit(): void {
    this.activity = this.activatedRoute.snapshot.data['activity'];
    this.user = this.storageService.getItem('userdata');

    this.setupAmbience();
  }

  setupAmbience() {
    this.getAllClients();
    this.removeAgreedFromFilter();
  }

  getAllClients() {
    this.isClientsLoading = true;
    const body = {
      user_id: this.storageService.getItem('userdata').user_id
    };
    this.clientsService.getCPClients(body).subscribe((res: any) => {
      this.isClientsLoading = false;
      if(res.status) this.clients.value.companies = res.companies;
    });
  }

  handleFilterTab(event: any) {
    this.filterTabs.selectedTab = event;
    this.setPage(this.filterTabs.selectedTab.index);
    switch(event.index) {
      case 1:
        this.activity = this.activities['connectList'].index;
        break;
    }

    
  }

  setPage(tab: number) {

    this.tab = tab;
  }

  setClient(client: any) {
    this.tab = 1;
    this.clients.value.selectedClient = client;
    this.selectedClient.next(client);
    this.getContracts();
    this.refresh.next(!this.refresh.value);

  }

  getContracts() {
    this.isContractLoaded = false;
    const body = {
      project_id: this.clients.value.selectedClient.works_manager_client_id
    };
    this.clientsService.getContracts(body).subscribe((res: any) => {
      this.isContractLoaded = true;

      if(res[0].Staff == 1) this.isContract.isStaff = true; else this.isContract.isStaff = false;
      if(res[0].Hourly == 1) this.isContract.isHourly = true; else this.isContract.isHourly = false;
      if(res[0].Agreed == 1) this.isContract.isAgreed = true; else this.isContract.isAgreed = false;

      if(!this.isContract.isAgreed) this.filterTabs.tabs = this.removeAgreedFromFilter();
      else this.filterTabs.tabs = Object.values(this.tabs);
      if(this.user.role == 'admin') this.filterTabs.tabs.filter(tab => tab.index !== 4);
      this.checkRolesAndFilterContacts();

    });
  }

  checkRolesAndFilterContacts() {
    const permissions = this.storageService.getItem('permissions');
    

    
    this.roleModules.forEach(module => {
      let indices = this.filterTabs.tabs.reduce((acc, item, index) => {
        if (item.index === this.tabs[module].index && !permissions[module].read) {
          acc.push(index);
        }
        return acc;
      }, []);
      for (var i = indices.length -1; i >= 0; i--)
        this.filterTabs.tabs.splice(indices[i],1);
    });

  }

  removeAgreedFromFilter() {
    return this.filterTabs.tabs.filter(tab => tab.index !== 2);
  }

}
