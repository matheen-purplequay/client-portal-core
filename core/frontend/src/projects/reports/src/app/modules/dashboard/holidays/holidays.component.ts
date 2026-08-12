import { Component, OnInit } from '@angular/core';
import { DataService } from '../../../services/app/data.service';
import { CommonService } from '../../../services/app/common/common.service';
import { Settings } from 'projects/reports/src/environments/settings';

@Component({
  selector: 'app-holidays',
  templateUrl: './holidays.component.html',
  styleUrls: ['./holidays.component.scss']
})
export class HolidaysComponent implements OnInit {

  fy = Settings.getAustralianFinancialYear();
  
  holidays: any;
  indianHolidays: any;
  australianHolidays: any;

  isHolidaysLoading = false;

  constructor(
    private commonServices: CommonService
  ) { }

  ngOnInit(): void {
    this.setupAmbience();
  }

  setupAmbience() {
    this.getHolidays();
  }

  getHolidays() {
    this.isHolidaysLoading = true;
    this.commonServices.getHolidaysData().subscribe((res: any) => {
      this.isHolidaysLoading = false;
      this.indianHolidays = res.data.indian;
      this.australianHolidays = res.data.australian;
    });
  }

}
