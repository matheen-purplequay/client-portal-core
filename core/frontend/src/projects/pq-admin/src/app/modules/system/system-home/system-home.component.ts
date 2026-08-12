import { Component, OnInit } from '@angular/core';
import { StorageService } from '../../../services/app/storage/storage.service';
import { SystemService } from '../../../services/app/system/system.service';

@Component({
  selector: 'app-system-home',
  templateUrl: './system-home.component.html',
  styleUrls: ['./system-home.component.scss']
})
export class SystemHomeComponent implements OnInit {

  isUnderMaintenance: boolean = false;
  isChangingAppStatus: boolean = false;
  app: any | undefined;
  user: any;

  constructor(
    private storageService: StorageService,
    private systemService: SystemService
  ) { }

  ngOnInit(): void {
    this.user = this.storageService.getItem('userdata');
    this.getAppStatus();
  }

  getAppStatus() {
    this.systemService.getAppStatus().subscribe({
      next: (res: any) => {
        if(res.status && res.data) {
          this.app = res.data;
          if(res.data.status == 'maintenance') this.isUnderMaintenance = true;
        }
      },
      error: (err: any) => {}
    });
  }

  setUnderMaintenance() {
    this.isUnderMaintenance = !this.isUnderMaintenance;
    this.isChangingAppStatus = true;

    if(this.isUnderMaintenance) {
      this.systemService.setUnderMaintenance().subscribe({
        next: (res: any) => {
          this.isChangingAppStatus = false;
        },
        error: (err: any) => {
          this.isChangingAppStatus = false;
        }
      });
    } else {
      this.systemService.setLive().subscribe({
        next: (res: any) => {
          this.isChangingAppStatus = false;
        },
        error: (err: any) => {
          this.isChangingAppStatus = false;
        }
      });
    }
  }

}
