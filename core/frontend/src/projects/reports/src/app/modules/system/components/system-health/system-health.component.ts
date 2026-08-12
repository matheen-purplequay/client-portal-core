import { Component, OnInit } from '@angular/core';
import { StorageService } from 'projects/pq-admin/src/app/services/app/storage/storage.service';
import { LocalStorageService } from 'projects/reports/src/app/services/app/storage/local-storage.service';
import { SystemService } from 'projects/reports/src/app/services/app/system/system.service';

interface ServerHealth { 
  status: "healthy" | "network-issues" | "unhealthy" | undefined;
  serverHealth: "Operational" | "Unreachable";
  databaseHealth: "Operational" | "Unreachable";
  data: any;
}

class ServerHealth {
  static defaultServerHealth() {
    return {
      status: undefined, serverHealth: "Operational", databaseHealth: "Operational", data: {}
    } as ServerHealth;
  }
}

@Component({
  selector: 'app-system-health',
  templateUrl: './system-health.component.html',
  styleUrls: ['./system-health.component.scss']
})
export class SystemHealthComponent implements OnInit {

  isGettingHealth: boolean = false;

  clientApp: ServerHealth = ServerHealth.defaultServerHealth();
  worksManagerServer: ServerHealth = ServerHealth.defaultServerHealth();
  health: any;
  portalHealth: any;
  jobsServerHealth: any;
  appStatus: any;

  isGettingPortalHealth: boolean = false;
  isGettingJobsServerHealth: boolean = false;

  constructor(
    private systemService: SystemService,
    private storageService: LocalStorageService
  ) { }

  ngOnInit(): void {
    this.setupAmbience();
  }

  setupAmbience() {
    if(this.storageService.isItemExists('portaldetails') && this.storageService.getItem('portaldetails')) {
      this.appStatus = this.storageService.getItem('portaldetails');
    }

    this.getAppStatus();
    this.getSystemHealth();
  }

  getAppStatus() {
    this.systemService.getAppStatus().subscribe({
      next: (res: any) => {
        if(res.status && res.data) {
          this.appStatus = res.data;
          this.storageService.setItem('portaldetails', res.data);
        }
      },
      error: (err: any) => {}
    });
  }

  getSystemHealth() {
    this.isGettingHealth = true;
    this.isGettingPortalHealth = true;
    this.isGettingJobsServerHealth = true;
    this.systemService.getClientPortalHealth().subscribe({
      next: (res: any) => {
        this.isGettingPortalHealth = false;
        this.isGettingHealth = false;
        if(res.status) {
          if(res.data.portalHealth) {
            this.portalHealth = res.data.portalHealth;
            console.log('portal health ', this.portalHealth);
          } else {
            this.portalHealth = { code: -1, message: 'Critical' };
          }
          if(res.data.client) {
            this.clientApp.status = res.data.client.status;
            this.clientApp.serverHealth = "Operational";
            this.clientApp.databaseHealth = "Operational";
            this.clientApp.data = res.data.client;
          } else {
            this.clientApp.status = "network-issues";
            this.clientApp.serverHealth = "Operational";
            this.clientApp.databaseHealth = "Unreachable";
            this.clientApp.data = { name: "Client Portal", type: "App Server", "version": "" };
          }
        }
      },
      error: (err: any) => {
        this.isGettingHealth = false;
        this.isGettingPortalHealth = false;
        this.setAllUnhealthy();
      }
    });

    this.systemService.getJobServerHealth().subscribe({
      next: (res: any) => {
        this.isGettingJobsServerHealth = false;
        this.isGettingHealth = false;
        if(res.status) {
          if(res.data.worksManager) {
            this.jobsServerHealth = res.data.worksManager;
            console.log('jobs server health ', this.jobsServerHealth);
          } else {
            this.jobsServerHealth = { code: -1, message: 'Critical' };
          }
        }
      },
      error: (err: any) => {
        this.isGettingJobsServerHealth = false;
        this.isGettingHealth = false;
        this.setAllUnhealthy();
      }
    });
  }

  setAllUnhealthy() {
    this.clientApp.status = "unhealthy";
    this.clientApp.serverHealth = "Unreachable";
    this.clientApp.databaseHealth = "Unreachable";
    this.clientApp.data = { name: "Client Portal", type: "App Server", "version": "" };

    this.worksManagerServer.status = "unhealthy";
    this.worksManagerServer.serverHealth = "Unreachable";
    this.worksManagerServer.databaseHealth = "Unreachable";
    this.worksManagerServer.data = { name: "Works Manager Server", type: "Jobs Server", "version": "" };
  }

}
