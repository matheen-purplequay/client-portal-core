import { Component, OnDestroy, OnInit } from '@angular/core';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';
import { MonthType, CommonDataTypes } from '../../../models/common-data-types';
import { ConnectReportData, InvoiceData } from '../../../models/reports';
import { ReportService } from '../../../services/reports/report.service';
import { LocalStorageService } from '../../../services/app/storage/local-storage.service';
import { LoginService } from '../../../services/authentication/login.service';
import { Settings } from 'projects/reports/src/environments/settings';

@Component({
  selector: 'app-invoices',
  templateUrl: './invoices.component.html',
  styleUrls: ['./invoices.component.scss']
})
export class InvoicesComponent implements OnInit, OnDestroy {

  pdfURL: SafeUrl =  '';
  pdfData: BehaviorSubject<Uint8Array | ArrayBuffer | undefined> = new BehaviorSubject<Uint8Array | ArrayBuffer | undefined>(undefined);

  invoices: InvoiceData[] = [];
  reportMonths: MonthType[] = CommonDataTypes.getAllMonthsWithIndex();
  reportYears: number[] = [];

  otpVerified = false;
  otpSent = false;
  otp: number = 0;
  resendOTPStatus = true;
  disableResendOTP = true;

  email = '';

  fy = Settings.getAustralianFinancialYear();

  constructor(
    private reportService: ReportService,
    private sanitizer: DomSanitizer,
    private localStorageService: LocalStorageService,
    private loginService: LoginService
  ) {
    this.setupAmbience();
  }

  ngOnDestroy(): void {
    this.resetOTPVerified();
  }

  ngOnInit(): void {
  }

  setupAmbience() {
    this.reportYears = this.getYears(1980);
    this.email = this.localStorageService.getItem('userdata').email;
    if(this.localStorageService.getItem('invoice_otp_verified')) this.otpVerified = this.localStorageService.getItem('invoice_otp_verified');
    if(this.otpVerified) this.getConnectReports();
    else {
      if(!this.otpSent) this.sendOTP();
    }
  }

  getYears(startYear: number) {
    var currentYear = new Date().getFullYear(), years = [];
    startYear = startYear || 1980;
    while (startYear <= currentYear) {
      years.push(startYear++);
    }
    return years;
  }

  getConnectReports() {
    this.reportService.getInvoices().subscribe((res: any) => {
      this.invoices = res;
      console.log('reports connect from db ', res);
    });
  }

  downloadReport(link: string) {
    this.reportService.getReport(link).subscribe((data: any) => {
      const blob = new Blob([data], {type: 'application/pdf'});

      var downloadURL = window.URL.createObjectURL(data);
      var link = document.createElement('a');
      link.href = downloadURL;
      link.download = "reports.pdf";
      link.click();
    });
  }

  previewReport(link: string) {
    this.reportService.previewConnectReports(link).subscribe((data: any) => {
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

  sendOTP() {
    this.loginService.sendOTP(this.email).subscribe((res: any) => {
      if(res.status) {
        this.otpSent = true;
      }
    });
  }

  verifyOTP() {
    const body = {
      email: this.email,
      otp: this.otp
    };
    this.loginService.verifyOTP(body).subscribe((res: any) => {
      if(res.status) {
        this.otpVerified = true;
        this.localStorageService.setItem('invoice_otp_verified', this.otpVerified);
      }
    });
  }

  resetOTPVerified() {
    setTimeout(() => {
      this.resetOTPStatus();
    }, 5000);
  }

  convertToNumber = (val: string) => { return parseInt(val) };

  resetOTPStatus() {
    this.otpSent = false;
    this.otpVerified = false;
    this.localStorageService.removeItem('invoice_otp_verified');
  }
}
