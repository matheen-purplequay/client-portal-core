import { Component, OnInit } from '@angular/core';
import { AngularDeviceInformationService } from 'angular-device-information';
import { DataService } from '../../services/app/base/data.service';
import { catchError, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { StorageService } from '../../services/app/storage/storage.service';

@Component({
  selector: 'app-floating-support',
  templateUrl: './floating-support.component.html',
  styleUrls: ['./floating-support.component.scss']
})
export class FloatingSupportComponent implements OnInit {

  isShowTicketFormContainer: boolean = false;
  isTicketFormContainerMinimize: boolean = false;
  currentURL: string = '';

  tabs = {
    new: { index: 1, label: 'New Ticket' },
    tickets: { index: 2, label: 'All Tickets' }
  };

  filterTabs: {
    tabs: any[],
    selectedTab: {index: number, label: string},
  } = {
    tabs: Object.values(this.tabs),
    selectedTab: { index: 1, label: 'New Ticket' }
  };

  supportType = {
    list: [
      { index: 1, value: 'Feedback' },
      { index: 2, value: 'Issues' }
    ],
    selectedSupportType: { index: 1, value: 'Feedback' },
    keys: { key: 'index', value: 'value' }
  };

  issues = {
    list: [
      { index: 1, value: 'Data mismatch' },
      { index: 2, value: 'Data not loading' },
      { index: 3, value: 'Page is empty' },
      { index: 4, value: 'Page not found error' },
      { index: 5, value: 'File not uploading' },
      { index: 6, value: 'Form not saving' }
    ],
    selectedIssue: { index: 1, value: 'Data mismatch' },
    keys: { key: 'index', value: 'value' }
  };

  deviceType: any;
  deviceInfo: any;
  user: any;

  constructor(
    private deviceInformationService: AngularDeviceInformationService,
    private dataService: DataService,
    private storageService: StorageService
  ) { 
  }
  
  ngOnInit(): void {
    this.currentURL = window.location.href;
    this.deviceInfo = this.deviceInformationService.getDeviceInfo();
    this.deviceType = this.deviceInformationService.getDeviceType();
    this.user = this.storageService.getItem('userdata');
  }

  handleFilterTab(event: any) {
    this.filterTabs.selectedTab = event;
  }

  minimizeTicketContainer() {
    this.isTicketFormContainerMinimize = !this.isTicketFormContainerMinimize;
  }

  resetTicketForm() {
    this.isTicketFormContainerMinimize = false;
    this.isShowTicketFormContainer = false;
  }
}
