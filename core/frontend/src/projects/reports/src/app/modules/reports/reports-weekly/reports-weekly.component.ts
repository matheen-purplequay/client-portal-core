import { Component, OnInit } from '@angular/core';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';
import { ConnectReportData, WeeklyReportData } from '../../../models/reports';
import { ReportService } from '../../../services/reports/report.service';
import { MonthType, CommonDataTypes } from '../../../models/common-data-types';
import { LocalStorageService } from '../../../services/app/storage/local-storage.service';
import { Settings } from 'projects/reports/src/environments/settings';

@Component({
  selector: 'app-reports-weekly',
  templateUrl: './reports-weekly.component.html',
  styleUrls: ['./reports-weekly.component.scss']
})
export class ReportsWeeklyComponent implements OnInit {

  pdfURL: SafeUrl =  '';
  pdfData: BehaviorSubject<Uint8Array | ArrayBuffer | undefined> = new BehaviorSubject<Uint8Array | ArrayBuffer | undefined>(undefined);
  
  weeklyReports: WeeklyReportData[] = [];
  reportMonths: MonthType[] = CommonDataTypes.getAllMonthsWithIndex();
  reportYears: number[] = [];
  currentYear = new Date().getFullYear();
  currentMonthIndex = new Date().getMonth() + 1;
  currentMonth = this.reportMonths.filter(m => m.index == (this.currentMonthIndex - 1))[0];
  isLoading = false;
  isPDFLoading = false;

  fy = Settings.getAustralianFinancialYear();

  constructor(
    private reportService: ReportService,
    private sanitizer: DomSanitizer,
    private localStorageService: LocalStorageService
  ) {
    this.setupAmbience();
   }

  ngOnInit(): void {
  }

  setupAmbience() {
    this.reportYears = this.getYears(1980);
    this.reportMonths.unshift({ index: 13, name: 'All Months' });
    this.getReport();
  }

  getYears(startYear: number) {
    var currentYear = new Date().getFullYear(), years = [];
    startYear = startYear || 1980;
    while (startYear <= currentYear) {
      years.push(startYear++);
    }
    return years;
  }

  getReport() {
    console.log('current month ', this.currentMonth.index);
    
    if(this.currentMonth.index == 13) this.getAllWeeklyReports();
    else this.getWeeklyReports();
  }

  getWeeklyReports() {
    this.isLoading = true;
    this.reportService.getWeeklyReports(this.currentMonth.name, this.currentYear.toString()).subscribe((res: any) => {
      this.weeklyReports = res;
      this.isLoading = false;
      console.log('reports connect from db ', res);
    });
  }

  getAllWeeklyReports() {
    this.isLoading = true;
    this.reportService.getAllWeeklyReports(this.currentYear.toString()).subscribe((res: any) => {
      this.weeklyReports = res;
      this.isLoading = false;
      console.log('reports connect from db ', res);
    });
  }

  downloadReport(report: ConnectReportData) {
    let body = {
      report_id: report.id,
      report_type: 'weekly',
      project_id: this.localStorageService.getItem('userdata').project_id
    };
    this.reportService.getReport(body).subscribe((data: any) => {
      const blob = new Blob([data], {type: 'application/pdf'});
      console.log('blob from api ', blob);
      

      var downloadURL = window.URL.createObjectURL(data);
      var link = document.createElement('a');
      link.href = downloadURL;
      link.download = "report.xlsx";
      link.click();
    });
  }

  previewReport(report: ConnectReportData) {
    this.isPDFLoading = true;
    let body = {
      report_id: report.id,
      report_type: 'weekly',
      project_id: this.localStorageService.getItem('userdata').project_id
    };
    this.reportService.previewConnectReports(body).subscribe((data: any) => {
      console.log('preview data ', data);
      this.pdfData.next(data);
      this.createPdfBlobUrl(data);
      this.isPDFLoading = false;
    });
  }

 
  private createPdfBlobUrl(data: Uint8Array | ArrayBuffer): void {
    const blob = new Blob([data], { type: 'application/pdf' });

    // Use the DomSanitizer to create a safe URL
    this.pdfURL = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(blob));
  }

  parseInt(val: string) {
    return parseInt(val);
  }

}
