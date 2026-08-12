import { Component, OnInit } from '@angular/core';
import { MasterService } from '../../../services/app/base/master.service';

@Component({
  selector: 'app-masters-home',
  templateUrl: './masters-home.component.html',
  styleUrls: ['./masters-home.component.scss']
})
export class MastersHomeComponent implements OnInit {

  isMasterGroupsLoaded: boolean = false;
  isLoadingModules: boolean = false;
  filterHomeViews: { list: [], selectedView: any, keys: { key: string, value: string } } = {
    list: [],
    selectedView: undefined,
    keys: { key: 'code', value: 'title' }
  };

  selectedModule: any;

  constructor(
    private masterService: MasterService
  ) { }

  ngOnInit(): void {
    this.setupAmbience();
  }

  setupAmbience() {
  }

  getMasterGroupByModule() {
    this.isLoadingModules = true;
    const body = {
      module_id: this.selectedModule.id
    };
    this.masterService.getMasterGroupsByModule(body).subscribe({
      next: (res: any) => {
        this.isLoadingModules = false;
        if(res.status && res.data.length > 0) {
          this.filterHomeViews.list = res.data;
          this.filterHomeViews.selectedView = res.data[0];
          this.isMasterGroupsLoaded = true;
        }
      },
      error: (err: any) => {
        this.isLoadingModules = false;
      }
    });
  }
}
