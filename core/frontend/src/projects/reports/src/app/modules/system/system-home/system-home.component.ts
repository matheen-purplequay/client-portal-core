import { Component, OnInit } from '@angular/core';
import { LocalStorageService } from '../../../services/app/storage/local-storage.service';
import { SystemService } from '../../../services/app/system/system.service';

@Component({
  selector: 'app-system-home',
  templateUrl: './system-home.component.html',
  styleUrls: ['./system-home.component.scss']
})
export class SystemHomeComponent implements OnInit {

  user: any;
  loginTime: any;
  loginDate: any;

  appMessage: any;
  appUpdates: any[] = [];
  appStatus: any;

  isGettingAppUpdates: boolean = false;
  isGettingAppMessage: boolean = false;

  constructor(
    private localStorageService: LocalStorageService,
    private systemService: SystemService
  ) { }

  ngOnInit(): void {
    this.user = this.localStorageService.getItem('userdata');    
    this.loginDate = this.localStorageService.getItem('login_date');
    this.appStatus = this.localStorageService.getItem('portaldetails');
    console.log('user ', this.user);
    
    this.setupAmbience();
  }

  setupAmbience() {
    this.getAppMessage();
    this.getAppUpdates();
  }

  getAppMessage() {
    this.isGettingAppMessage = true;
    this.appMessage = undefined;
    this.systemService.getAppMessage().subscribe({
      next: (res: any) => {
        this.isGettingAppMessage = false;
        if(res.status) this.appMessage = res.data;
      },
      error: (err: any) => {
        this.isGettingAppMessage = false;
      }
    });
  }

  getAppUpdates() {
    this.isGettingAppUpdates = true;
    this.appUpdates = [];
    const body = {
      portal_id: 1,
      sub_portal_id: 1
    };
    this.systemService.getRecentAppUpdates(body).subscribe({
      next: (res: any) => {
        this.isGettingAppUpdates = false;
        if(res.status) this.appUpdates = res.data;
      },
      error: (err: any) => {
        this.isGettingAppUpdates = false;
      }
    });
  }

}
