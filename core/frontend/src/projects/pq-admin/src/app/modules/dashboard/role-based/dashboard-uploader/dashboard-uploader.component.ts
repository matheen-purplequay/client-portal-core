import { Component, Input, OnInit } from '@angular/core';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { ToastService } from 'pq-ui';
import { ConnectReportData, Report } from 'projects/pq-admin/src/app/models/reports';
import { StorageService } from 'projects/pq-admin/src/app/services/app/storage/storage.service';
import { ClientsService } from 'projects/pq-admin/src/app/services/entities/clients.service';
import { ReportsService } from 'projects/pq-admin/src/app/services/reports/reports.service';
import { settings } from 'projects/pq-admin/src/environments/settings';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-dashboard-uploader',
  templateUrl: './dashboard-uploader.component.html',
  styleUrls: ['./dashboard-uploader.component.scss']
})
export class DashboardUploaderComponent implements OnInit {

  selectedClient: { Pid: number; ClientName: string; } = { Pid: 0, ClientName: "" };

  monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  currentYear = new Date().getFullYear();
  startYear: number = 2023;
  currentMonth = new Date().getMonth();
  availableYears: number[] = Array.from({ length: this.currentYear - this.startYear + 1 }, (_, index) => this.startYear + index);
  selectedYear: number = (this.currentMonth == 0)? this.availableYears[this.availableYears.length - 2] : this.availableYears[this.availableYears.length - 1];
  selectedMonth: number = (this.currentMonth == 0) ? this.monthNames.indexOf('December') : this.currentMonth - 1;
  isReportsLoading: boolean = false;

  period: { 
    years: number[],
    monthNames: string[],
    selectedPeriod: { date: number, month: number, year: number }
  } = {
    years: [2023, 2024],
    monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    selectedPeriod: { date: new Date().getDate(), month: 0, year: this.selectedYear }
  };

  availableReports : any;
  companiesWithoutReports : any;
  companiesWithReports: any;

  sortedColumn = '';
  isAsc = true;

  // Filters & Tabs
  filterMainViewList = {
    connect_reports: { index: 0, label: 'Connect Report' },
    clients: { index: 1, label: 'Clients' }
  };

  filterMainView = {
    list: Object.values(this.filterMainViewList),
    selectedView: this.filterMainViewList.connect_reports,
    keys: { key: 'index', value: 'label' }
  };
  isSendingRequest: boolean = false;

  counts = {
    totalClients: 0,
    availableReports: 0,
    unavailableReports: 0,
    rejectedReports: 0,
    approvedReports: 0,
    pendingApproval: 0
  };

  userPermissions: any;

  page: string = '';
  reportId: number = 0;
  @Input() report: ConnectReportData = Report.defaultConnectReportData();
  reportFile: File | undefined = undefined;
  @Input() client: any;

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

  showReportPopup: boolean = false;
  availableCompanies: any[] = [];

  constructor(
    private reportService : ReportsService,
    private storageService: StorageService,
    private toastService: ToastService,
    private reportsService: ReportsService,
    private clientsService: ClientsService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.userPermissions = this.storageService.getItem('permissions').connect_report;
    this.user = this.storageService.getItem('userdata');
    this.setupAmbience();
  }

  setupAmbience(){
    this.getReportByMonthYear();
  }

  checkDuplicateExists(report: any) {
    let isDuplicate: boolean = false;
    let count = 0;
    this.availableReports.data.forEach((availableReport: any) => {
      if(availableReport.company_id == report.company_id) {
        count++;
        if(count > 1) {
          isDuplicate = true;
          return;
        }
      }
    });
    return isDuplicate;
  }

  getReportByMonthYear() {
    this.isReportsLoading = true;
    const body={
      month : this.period.monthNames[this.period.selectedPeriod.month],
      year : this.selectedYear,
      user_id: this.storageService.getItem('userdata').user_id,
      role: this.storageService.getItem('userdata').role
    }

    this.reportService.getReportByMonthYear(body).subscribe((res:any)=>{
      this.isReportsLoading = false;
      this.availableReports = res.data.availableReports;
      this.companiesWithReports = res.data.companiesWithReports;
      this.companiesWithoutReports = res.data.companiesWithoutReports;
      this.availableCompanies = res.data.availableCompanies;

      this.counts.totalClients = res.data.availableCompanies.length;
      this.counts.availableReports = res.data.availableReports.data.length;
      this.counts.unavailableReports = res.data.companiesWithoutReports.data.length;

      for (const item of res.data.availableReports.data) {
        if (item.status_type === 'approved') this.counts.approvedReports++;
        else if(item.status_type === 'rejected') this.counts.rejectedReports++;
        else if(item.status === 0) this.counts.pendingApproval++;
      }
    });
  }

  getReport(report: any) {

    this.report = report;
    this.previewReport();
    this.showReportPopup = true;
  }

  getClient() {
    this.isClientLoading = true;
    const body = {
      client_id: this.report.client_id
    };
    this.clientsService.getClient(body).subscribe((res: any) => {
      this.isClientLoading = false;
      if(res.status) this.client = res.company;
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
          this.report = res.data.report;
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

  toNumber(value: string) {
    return Number.parseInt(value);
  }

  goBack() {
    this.router.navigate(['reports', this.page.toLowerCase(), 'list', (this.report.client_id != 0)? this.report.client_id : '']);
  }

  convertToNumber = (value: string) => Number(value);

  setSelectedMonth(event: any) {
    const index = this.period.monthNames.indexOf(event);
    this.period.selectedPeriod.month = event;
    
    return this.period.monthNames[index];
  }

  handleYearChange(event: number) {
    this.selectedYear = event;
  }

  parseInt(value: string) {
    return parseInt(value);
  }

  getObjectValuesAsArray(object: Object) {
    return Object.values(object);
  }
 
  getObjectKeysAsArray(object: Object) {
    return Object.keys(object);
    
  }

  checkIfColumnExists(column: string) {
    let flag = false;
    const columns = Object.values(this.availableReports.columns);
    columns.forEach((col: any) => {
      if(col.id == column && col.showColumn) {
        flag = true;
        return;
      }
    });
    return flag;
  }

  sendApprovalRequestById(data:any) {

    this.isSendingRequest = true;
    const body={
      report_id: data.id,
      user_id: this.storageService.getItem('userdata').user_id
    }
    this.reportService.sendApprovalById(body).subscribe({
      next: (res:any)=>{
        this.isSendingRequest = false;
        this.toastService.show(res.message, 'Reminder email sent', 'success', true);
      },
      error: (error: any) => {
        this.isSendingRequest = false;
        this.toastService.show('Something went wrong while sending email. Please contact system administrator.', 'Something went wrong.', 'warning', true);
      }
    });
  }

  sortBy(propertyName: string) {

    
    if (this.sortedColumn === propertyName) {
      this.isAsc = !this.isAsc;
    } else {
      this.sortedColumn = propertyName;
      this.isAsc = true;
    }

    this.availableReports.data.sort((a: any, b: any) => {
      const valueA = a[propertyName];
      const valueB = b[propertyName];

      let comparison = 0;
      if (valueA < valueB) {
        comparison = -1;
      } else if (valueA > valueB) {
        comparison = 1;
      }

      return this.isAsc ? comparison : -comparison;
    });
  }

}
