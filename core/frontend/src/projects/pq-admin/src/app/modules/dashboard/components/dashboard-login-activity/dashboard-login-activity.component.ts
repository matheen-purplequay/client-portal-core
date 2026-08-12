import { Component, OnInit } from '@angular/core';
import { StorageService } from 'projects/pq-admin/src/app/services/app/storage/storage.service';
import { ClientsService } from 'projects/pq-admin/src/app/services/entities/clients.service';

@Component({
  selector: 'app-dashboard-login-activity',
  templateUrl: './dashboard-login-activity.component.html',
  styleUrls: ['./dashboard-login-activity.component.scss']
})
export class DashboardLoginActivityComponent implements OnInit {

  login_activities: any[] = [];
  original_login_activities: any[] = [];
  pagination: any[] = [];
  currentPage: number = 1;
  isGettingLoginActivities: boolean = false;
  user: any;

  portalTypeList= {
    0: { index: 0, label: 'All Portal' },
    1: { index: 1, label: 'Reports Portal' },
    2: { index: 2, label: 'SMSF Portal' }
  };

  config = {
    id: 'custom',
    itemsPerPage: 10,
    currentPage: 1,
    totalItems: 0
  };


  filterPortalTypes = {
    list: Object.values(this.portalTypeList),
    selected: this.portalTypeList[0]
  }

  constructor(
    private clientsService: ClientsService,
    private storageService: StorageService
  ) { 
    this.user = this.storageService.getItem('userdata');
  }

  ngOnInit(): void {
    this.setupAmbience();
  }

  setupAmbience() {
    this.getClientLoginActivities();
  }

  getClientLoginActivities(page_number: number = 1) {
    this.isGettingLoginActivities = true;
    const body = {
      portal_type: this.filterPortalTypes.selected.index
    };
    this.clientsService.getClientLoginActivities(body, page_number).subscribe({
      next: (res: any) => {
        this.isGettingLoginActivities = false;
        if(res.status) {
          this.login_activities = res.data.data;
          this.original_login_activities = this.login_activities;
          this.pagination = res.data.links;
          this.currentPage = res.data.current_page;
        }
      },
      error: (err: any) => {
        this.isGettingLoginActivities = false;
      }
    });
  }

  getJSONValue(value: string) {
    return JSON.parse(value);
  }

  getBrowserLogo(browser: string) {
    const path = '/assets/icons';
    let logo = 'browser'

    if(browser.toLowerCase().includes('chrome') || browser.toLowerCase().includes('microsoft') || browser.toLowerCase().includes('safari')) {
      logo = browser.split(' ').join('_').toLowerCase();
    }
    return `${path}/${logo}.png`;
  }

  resetLoginActivities() {
    this.login_activities = this.original_login_activities;
  }

  toNumber = (value: string) => parseInt(value);
}
