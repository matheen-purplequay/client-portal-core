import { Component, OnInit } from '@angular/core';
import { Settings } from 'projects/reports/src/environments/settings';

@Component({
  selector: 'app-connect-report',
  templateUrl: './connect-report.component.html',
  styleUrls: ['./connect-report.component.scss']
})
export class ConnectReportComponent implements OnInit {

  reportMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  reportYears: number[] = [];
  currentMonth = new Date().getMonth() + 1;
  currentYear = new Date().getFullYear();
  fy = Settings.getAustralianFinancialYear();
  
  constructor() {
    this.reportYears = this.getYears(1980);
   }

  ngOnInit(): void {
  }

  getYears(startYear: number) {
    var currentYear = new Date().getFullYear(), years = [];
    startYear = startYear || 1980;
    while (startYear <= currentYear) {
      years.push(startYear++);
    }
    return years;
  }

}
