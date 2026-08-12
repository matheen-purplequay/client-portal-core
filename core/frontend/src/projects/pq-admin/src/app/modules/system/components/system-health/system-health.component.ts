import { Component, OnInit } from '@angular/core';
import { SystemService } from 'projects/pq-admin/src/app/services/app/system/system.service';

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
  adminApp: ServerHealth = ServerHealth.defaultServerHealth();
  worksManagerServer: ServerHealth = ServerHealth.defaultServerHealth();

  constructor(
    private systemService: SystemService
  ) { }

  ngOnInit(): void {
    this.setupAmbience();
  }

  setupAmbience() {
    this.getSystemHealth();
  }

  getSystemHealth() {
    this.isGettingHealth = true;
    this.systemService.getSystemHealth().subscribe({
      next: (res: any) => {
        this.isGettingHealth = false;
        if(res.status) {
          if(res.data.client) {
            this.clientApp.status = res.data.client.status;
            this.clientApp.serverHealth = "Operational";
            this.clientApp.databaseHealth = "Operational";
            this.clientApp.data = res.data.client;
          } else {
            this.clientApp.status = "network-issues";
            this.clientApp.serverHealth = "Operational";
            this.clientApp.databaseHealth = "Unreachable";
            this.clientApp.data = { name: "Client Portal", type: "Web Server", "version": "" };
          }
          if(res.data.admin) {
            this.adminApp.status = res.data.admin.status;
            this.adminApp.serverHealth = "Operational";
            this.adminApp.databaseHealth = "Operational";
            this.adminApp.data = res.data.admin;
          } else {
            this.adminApp.status = "network-issues";
            this.adminApp.serverHealth = "Operational";
            this.adminApp.databaseHealth = "Unreachable";
            this.adminApp.data = { name: "Admin Portal", type: "Web Server", "version": "" };
          }
          if(res.data.worksmanager) {
            this.worksManagerServer.status = res.data.worksmanager.status;  
            this.worksManagerServer.databaseHealth = "Operational";
            this.worksManagerServer.serverHealth = "Unreachable";
            this.worksManagerServer.data = res.data.worksmanager;
          } else {
            this.worksManagerServer.status = "unhealthy";
            this.worksManagerServer.serverHealth = "Unreachable";
            this.worksManagerServer.databaseHealth = "Unreachable";
            this.worksManagerServer.data = { name: "Works Manager Server", type: "Database Server", "version": "" };
          }
          console.log('system health ', this.worksManagerServer);
        }
      },
      error: (err: any) => {
        this.isGettingHealth = false;
        this.setAllUnhealthy();
      }
    });
  }

  setAllUnhealthy() {
    this.clientApp.status = "unhealthy";
    this.clientApp.serverHealth = "Unreachable";
    this.clientApp.databaseHealth = "Unreachable";
    this.clientApp.data = { name: "Client Portal", type: "Web Server", "version": "" };

    this.adminApp.status = "unhealthy";
    this.adminApp.serverHealth = "Unreachable";
    this.adminApp.databaseHealth = "Unreachable";
    this.adminApp.data = { name: "Admin Portal", type: "Web Server", "version": "" };

    this.worksManagerServer.status = "unhealthy";
    this.worksManagerServer.serverHealth = "Unreachable";
    this.worksManagerServer.databaseHealth = "Unreachable";
    this.worksManagerServer.data = { name: "Works Manager Server", type: "Database Server", "version": "" };
  }

}
