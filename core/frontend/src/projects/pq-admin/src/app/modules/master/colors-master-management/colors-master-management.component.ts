import { Component, Input, OnInit } from '@angular/core';
import { MasterService } from '../../../services/app/base/master.service';

@Component({
  selector: 'app-colors-master-management',
  templateUrl: './colors-master-management.component.html',
  styleUrls: ['./colors-master-management.component.scss']
})
export class ColorsMasterManagementComponent implements OnInit {

  @Input() selectedModule: any;

  colorsViewList = {
    dashboardCharts: { index: 1, label: 'Dashboard Chart' }
  };

  filterColorsView = {
    list: Object.values(this.colorsViewList),
    selectedView: this.colorsViewList.dashboardCharts,
    keys: { key: 'index', value: 'label' }
  };

  colors: any;

  constructor(
    private masterService: MasterService
  ) { }

  ngOnInit(): void {
    this.setupAmbiance();
  }

  setupAmbiance() {
    this.getMasterData();
  }

  getMasterData() {
    const body = {
      group_id: 5,
      category: 'job_status'
    };
    this.masterService.getMasterData(body).subscribe({
      next: (res: any) => {
        if(res.status) this.colors = res.data;
      },
      error: (err: any) => {}
    });
  }

}
