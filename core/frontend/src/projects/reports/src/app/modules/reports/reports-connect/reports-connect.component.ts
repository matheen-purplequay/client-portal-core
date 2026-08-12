import { Component, OnInit } from '@angular/core';
import { ReportService } from '../../../services/reports/report.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';
import { ConnectReportData } from '../../../models/reports';
import { MonthType, CommonDataTypes } from '../../../models/common-data-types';
import { LocalStorageService } from '../../../services/app/storage/local-storage.service';
import { CommonService } from '../../../services/app/common/common.service';
import { Router } from '@angular/router';
import { Settings } from 'projects/reports/src/environments/settings';

@Component({
  selector: 'app-reports-connect',
  templateUrl: './reports-connect.component.html',
  styleUrls: ['./reports-connect.component.scss']
})
export class ReportsConnectComponent implements OnInit {

  pdfURL: SafeUrl =  '';
  pdfData: BehaviorSubject<Uint8Array | ArrayBuffer | undefined> = new BehaviorSubject<Uint8Array | ArrayBuffer | undefined>(undefined);
  
  connectReports: ConnectReportData[] = [];
  reportMonths: MonthType[] = CommonDataTypes.getAllMonthsWithIndex();
  reportYears: number[] = [];
  currentYear = new Date().getFullYear();
  selectedYear = new Date().getFullYear();
  currentMonthIndex: number = new Date().getMonth() + 1;
  currentMonth = this.reportMonths.filter(m => m.index == (this.currentMonthIndex - 1))[0];
  isLoading = false;
  isPDFLoading = false;
  nowDate: Date = new Date();

  isShowContactPopup: boolean = false;

  fy = Settings.getAustralianFinancialYear();

  constructor(
    private reportService: ReportService,
    private commonService: CommonService,
    private sanitizer: DomSanitizer,
    private localStorageService: LocalStorageService,
    private router: Router
  ) {
  }
  
  ngOnInit(): void {
    this.setupAmbience();
  }

  setupAmbience() {
    this.reportYears = this.getYears(2023);
    this.selectedYear = this.reportYears[this.reportYears.length - 1];

    this.reportMonths.unshift({ index: 13, name: 'All Months' });
    // this.currentMonthIndex = 0;
    this.currentMonth = this.reportMonths[0];
    if(this.currentMonthIndex == 0) this.selectedYear = this.reportYears[this.reportYears.length - 2];
    console.log('report years ', this.reportYears, this.selectedYear, this.currentMonthIndex);
    
    this.getReport();
    this.getTeam();
  }

  getYears(startYear: number) {
    var currentYear = new Date().getFullYear(), years = [];
    startYear = startYear || 2023;
    while (startYear <= currentYear) {
      years.push(startYear++);
    }
    return years;
  }

  getReport() {
    console.log('current month ', this.currentMonth.index);
    
    if(this.currentMonth.index == 13) this.getAllConnectReports();
    else this.getConnectReports();
  }

  getConnectReports() {
    this.isLoading = true;
    this.reportService.getConnectReports(this.currentMonth.name, this.selectedYear.toString()).subscribe((res: any) => {
      if(res.status) this.connectReports = res.data;
      this.isLoading = false;
      console.log('reports connect from db ', res);
    });
  }

  getAllConnectReports() {
    this.isLoading = true;
    this.reportService.getConnectReports(0, this.selectedYear.toString()).subscribe((res: any) => {
      this.isLoading = false;
      if(res.status) this.connectReports = res.data;
      console.log('reports connect from db ', res);
    });
  }

  downloadReport(report: ConnectReportData) {
    let body = {
      report_id: report.id,
      report_type: 'connect',
      project_id: this.localStorageService.getItem('userdata').project_id,
      user_id: this.localStorageService.getItem('userdata').user_id
    };
    this.reportService.getReport(body).subscribe((data: any) => {
      const blob = new Blob([data], {type: 'application/pdf'});
      console.log('blob from api ', blob);
      

      var downloadURL = window.URL.createObjectURL(data);
      var link = document.createElement('a');
      link.href = downloadURL;
      link.download = "reports.pdf";
      link.click();
    });
  }

  previewReport(report: ConnectReportData) {
    this.isPDFLoading = true;
    this.resetPDFData();
    let body = {
      report_id: report.id,
      report_type: 'connect',
      project_id: this.localStorageService.getItem('userdata').project_id,
      user_id: this.localStorageService.getItem('userdata').user_id
    };
    this.reportService.previewConnectReports(body).subscribe((data: any) => {
      console.log('preview data ', data);
      this.pdfData.next(data);
      this.createPdfBlobUrl(data);
      this.isPDFLoading = false;
    });
  }

 
  private createPdfBlobUrl(data: Uint8Array | ArrayBuffer): void {
    this.pdfURL = 'about:blank';
    const blob = new Blob([data], { type: 'application/pdf' });

    // Use the DomSanitizer to create a safe URL
    const timestamp = new Date().getTime();
    const blobUrl = URL.createObjectURL(blob);
    const urlWithTimestamp = `${blobUrl}`;
    this.pdfURL = this.sanitizer.bypassSecurityTrustResourceUrl(urlWithTimestamp);

    const iframe = document.getElementById('pdfFrame') as HTMLIFrameElement;
    iframe?.addEventListener('load', () => {
      const pdfWindow = iframe.contentWindow;

      console.log('pdf window ', pdfWindow);
      
      pdfWindow?.scrollTo(0, 0);
    });
  }

  getTeam() {
    const body = {
      project_id: this.localStorageService.getItem('userdata').company_id
    };
    this.commonService.getMyTeamData(body).subscribe((res: any) => {
      console.log('team data ', res);
      
    });
  }

  parseInt(val: string) {
    return parseInt(val);
  }

  resetPDFData() {
    this.pdfData.complete();
    this.pdfURL = 'about:blank';
  }

  goTo(page: string) {
    this.router.navigateByUrl(page);
  }

  showContactPopup() {
    this.isShowContactPopup = true;
  }

  hideContactPopup() {
    this.isShowContactPopup = false;
  }

}
