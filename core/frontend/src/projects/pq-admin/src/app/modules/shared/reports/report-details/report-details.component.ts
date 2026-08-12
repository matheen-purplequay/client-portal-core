import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import party from "party-js";
import { ToastService } from 'pq-ui';
import { Client } from 'projects/pq-admin/src/app/models/client';
import { ConnectReportData, Report } from 'projects/pq-admin/src/app/models/reports';
import { DataService } from 'projects/pq-admin/src/app/services/app/base/data.service';
import { StorageService } from 'projects/pq-admin/src/app/services/app/storage/storage.service';
import { ClientsService } from 'projects/pq-admin/src/app/services/entities/clients.service';
import { ReportsService } from 'projects/pq-admin/src/app/services/reports/reports.service';
import { settings } from 'projects/pq-admin/src/environments/settings';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-report-details',
  templateUrl: './report-details.component.html',
  styleUrls: ['./report-details.component.scss']
})
export class ReportDetailsComponent implements OnInit {

  userPermissions: any;
  @Output() reportApproved: EventEmitter<boolean> = new EventEmitter();
  @Output() reportRejected: EventEmitter<boolean> = new EventEmitter();

  @Input() report: ConnectReportData = Report.defaultConnectReportData();
  @Input() client: any;
  @Input() client_id: number = 0;
  @Input() roleCategory: "employee" | "management" = 'employee';

  page: string = '';
  reportId: number = 0;
  reportFile: File | undefined = undefined;

  isClientLoading = false;
  isReportLoading = false;

  pdfURL: SafeUrl =  '';
  pdfData: BehaviorSubject<Uint8Array | ArrayBuffer | undefined> = new BehaviorSubject<Uint8Array | ArrayBuffer | undefined>(undefined);
  isPDFLoading = false;

  user: any;
  isApproving = false;
  isRejecting = false;

  isConfirmed: boolean = false;

  rejectReason: string = '';
  deleteReason: string = '';

  toggleRejectMode: boolean = false;
  toggleDeleteMode: boolean = false;

  isReportsLoading: boolean = false;

  currentYear = new Date().getFullYear();
  startYear: number = 2023;
  currentMonth = new Date().getMonth();
  availableYears: number[] = Array.from({ length: this.currentYear - this.startYear + 1 }, (_, index) => this.startYear + index);
  selectedYear: number = (this.currentMonth == 0)? this.availableYears[this.availableYears.length - 2] : this.availableYears[this.availableYears.length - 1];

  period: { 
    years: number[],
    monthNames: string[],
    selectedPeriod: { date: number, month: number, year: number }
  } = {
    years: [2023, 2024],
    monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    selectedPeriod: { date: new Date().getDate(), month: 0, year: this.selectedYear }
  };

  sortedColumn = '';
  isAsc = true;
  portal_links: any;

  maxEmails = settings.emails.max_emails[this.roleCategory];
  public Editor = ClassicEditor;
  public config = {
    placeholder: 'Add custom sections for report here...',
    toolbar: {
      items: [
        'undo', 'redo',
        '|', 'heading',
        '|', 'bold', 'italic',
        '|', 'link', 'insertTable', 'blockQuote',
        '|', 'bulletedList', 'numberedList', 'outdent', 'indent'
      ]
    },
  }

  clientManagementUsers: any;
  isClientManagementUsersLoaded: boolean = false;
  notifyClientUsers: boolean = true;

  constructor(
    private storageService: StorageService,
    private toastService: ToastService,
    private reportsService: ReportsService,
    private clientsService: ClientsService,
    private router: Router,
    private sanitizer: DomSanitizer,
    private dataService: DataService
  ) { }

  ngOnInit(): void {
    this.userPermissions = this.storageService.getItem('permissions').connect_report;
    this.user = this.storageService.getItem('userdata');

    this.getClientManagementUsers();
    this.getClient();
    this.setupAmbience();
  }

  setupAmbience() {
    this.dataService.doGetJSONData('links').subscribe({
      next: (res: any) => {
        this.portal_links = res;
      }
    });
  }

  setIsConfirmed(isConfirmed: boolean) {
    this.isConfirmed = isConfirmed;
  }
  
  getReport(report: any) {
    this.report = report;
    this.previewReport();
  }

  getClient() {
    this.isClientLoading = true;
    const body = {
      client_id: this.client_id
    };
    this.clientsService.getCompanyFromDashboardByID(body).subscribe((res: any) => {
      this.isClientLoading = false;
      if(res.status) this.client = res.data.company;
    });
  }

  getClientManagementUsers() {
    this.isClientManagementUsersLoaded = true;
    const body = {
      heirarchy: 1,
      client_id: this.client_id
    };
    this.clientsService.getClientManagementUsers(body).subscribe({
      next: (res: any) => {
        this.isClientManagementUsersLoaded = false;
        if(res.status) this.clientManagementUsers = res.data;
      },
      error: (err: any) => { this.isClientManagementUsersLoaded = false; }
    });
  }

  previewReport() {
    this.isPDFLoading = true;

    const body = {
      report_id: this.report.id,
      report_type: 'connect'
    }
    this.reportsService.getReportPreview(body).subscribe((res: any) => {
      this.isPDFLoading = false;
      this.pdfData.next(res);
      this.createPdfBlobUrl(res);
    });
  }

  refreshReport() {
    this.isReportLoading = true;
     const body = {
       report_id: this.report.id,
     };

     this.reportsService.getReportByID(body).subscribe({
      next: (res: any) => {
        if(res.status && res.data) {

          this.isReportLoading = false;
          this.report = res.data;
        }
      },
      error: (err: any) => {
        this.isReportLoading = false;
        this.toastService.show('There is a problem in refreshing report details. Can you please close the popup and try opening again?', 'Alert', 'warning', true);
      }
     });
  }

  private createPdfBlobUrl(data: Uint8Array | ArrayBuffer): void {
    this.pdfURL = 'about:blank';
    const blob = new Blob([data], { type: 'application/pdf' });

    // Use the DomSanitizer to create a safe URL
    this.pdfURL = this.sanitizer.bypassSecurityTrustResourceUrl(URL.createObjectURL(blob));
  }

  approveReport() {
    if(!this.isConfirmed) return;
    this.isApproving = true;
    let clientEmails: string[] = [];
    if(this.notifyClientUsers) {
      this.clientManagementUsers.forEach((client: any) => {
        clientEmails.push(client.email);
      });
    }
    const body = {
      report_id: this.report.id,
      role: this.user.role,
      user_id: this.user.user_id,
      type: 'approved',
      notify: this.notifyClientUsers
    };
    this.reportsService.approveReport(body).subscribe({
      next: (res: any) => {
        this.isApproving = false;
        this.refreshReport();
        try {
          this.showConfetti();
          this.reportApproved.emit(true);
        } catch(err: any) {

        }
      },
      error: (error: any) => {
        this.isApproving = false;
        this.toastService.show('Something went wrong while approving report. Please contact system administrator.', 'Something went wrong', 'warning', true);
      }
    });
    // if(confirm("Do you confirm, you are about to approve the report?")) {  
    // } else this.isApproving = false;
  }

  rejectReport() {
    if(!this.isConfirmed) return;
    this.isRejecting = true;

    const body = {
      report_id: this.report.id,
      role: this.user.role,
      user_id: this.user.user_id,
      type: 'rejected',
      reason: this.rejectReason
    };
    if(confirm("Do you confirm, you are about to reject the report?")) {  
      this.reportsService.rejectReport(body).subscribe({
        next: (res: any) => {
          this.isRejecting = false;
          this.toggleRejectMode = false;
          this.toastService.show('Report has been rejected.', 'Rejected', 'success', true);
          this.reportRejected.emit(true);
          this.refreshReport();
        },
        error: (error: any) => {
          this.isRejecting = false;
          this.toggleRejectMode = false;
          this.toastService.show('Something went wrong while rejecting report. Please contact system administrator.', 'Something went wrong', 'warning', true);
        }
      });
    } else {
      this.isRejecting = false;
      this.toggleRejectMode = false;
    } 
  }

  deleteReport() {
    if(confirm("Do you confirm, you are about to reject the report?")) {  
      const body = {
        report_id: this.report.id,
        reason: this.deleteReason
      };
      this.reportsService.deleteReport(body).subscribe((res: any) => {
        if(res.status) {
        }
      });
    }
  }

     
  toNumber(value: string) {
    return Number.parseInt(value);
  }

  goBack() {
    this.router.navigate(['reports', this.page.toLowerCase(), 'list', (this.report.client_id != 0)? this.report.client_id : '']);
  }

  showConfetti() {
    setTimeout(() => {
      const button = document.getElementById('confetti-container') as HTMLElement;
      party.confetti(button);
    }, 500);
  }

  convertToNumber = (value: string) => Number(value);

  parseInt(value: string) {
    return parseInt(value);
  }

}
