import { Component, OnInit } from '@angular/core';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';
import { MonthType, CommonDataTypes } from '../../../models/common-data-types';
import { ConnectReportData } from '../../../models/reports';
import { LocalStorageService } from '../../../services/app/storage/local-storage.service';
import { ReportService } from '../../../services/reports/report.service';
import { CommonService } from '../../../services/app/common/common.service';
import { Settings } from 'projects/reports/src/environments/settings';

interface ITLinks { id: number; title: string; date_of_issue: string; link: string };

@Component({
  selector: 'app-it',
  templateUrl: './it.component.html',
  styleUrls: ['./it.component.scss']
})
export class ItComponent implements OnInit {

  fy = Settings.getAustralianFinancialYear();

  pdfURL: SafeUrl =  '';
  pdfData: BehaviorSubject<Uint8Array | ArrayBuffer | undefined> = new BehaviorSubject<Uint8Array | ArrayBuffer | undefined>(undefined);
  isPDFLoading: boolean = false;
  
  itPDF: ITLinks[] = [];
  selectedITPolicy: ITLinks = this.resetITLinks();
  reportMonths: MonthType[] = CommonDataTypes.getAllMonthsWithIndex();
  reportYears: number[] = [];
  currentYear = new Date().getFullYear();
  currentMonthIndex = new Date().getMonth() + 1;
  currentMonth = this.reportMonths.filter(m => m.index == (this.currentMonthIndex - 1))[0];
  isITLoading = false;

  constructor(
    private reportService: ReportService,
    private commonService: CommonService,
    private sanitizer: DomSanitizer,
    private localStorageService: LocalStorageService
  ) {
    this.setupAmbience();
   }

  ngOnInit(): void {
  }

  setupAmbience() {
    this.getITPDFLinks();
  }

  resetITLinks() {
    return {
      id: 0,
      title: "",
      date_of_issue: "",
      link: ""
    } as ITLinks;
  }

  getITPDFLinks() {
    this.isITLoading = true;
    this.itPDF = [];
    this.commonService.getAllITPDF().subscribe((res: any) => {
      this.isITLoading = false;
      this.itPDF = res.data;
    });
  }

  previewReport(it: ITLinks) {
    this.isPDFLoading = true;
    this.selectedITPolicy = it;
    this.resetPDFData();
    let body = {
      it_id: it.id
    };
    this.commonService.getITPDFPreview(body).subscribe((data: any) => {
      this.isPDFLoading = false;
      console.log('preview data ', data);
      this.pdfData.next(data);
      this.createPdfBlobUrl(data);
    });
  }

 
  private createPdfBlobUrl(data: Uint8Array | ArrayBuffer): void {
    const blob = new Blob([data], { type: 'application/pdf' });

    // Use the DomSanitizer to create a safe URL
    this.pdfURL = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(blob));
  }

  resetPDFData() {
    this.pdfData.complete();
    this.pdfURL = 'about:blank';
  }

  parseInt(val: string) {
    return parseInt(val);
  }

}
