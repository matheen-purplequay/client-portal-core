import { TitleCasePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from 'pq-ui';
import { ConnectReportData, Report } from 'projects/pq-admin/src/app/models/reports';
import { StorageService } from 'projects/pq-admin/src/app/services/app/storage/storage.service';
import { DashboardService } from 'projects/pq-admin/src/app/services/dashboard/dashboard.service';
import { ClientsService } from 'projects/pq-admin/src/app/services/entities/clients.service';
import { UserService } from 'projects/pq-admin/src/app/services/entities/user.service';
import { ReportsService } from 'projects/pq-admin/src/app/services/reports/reports.service';
import { BehaviorSubject } from 'rxjs';
import party from "party-js";

@Component({
  selector: 'app-dashboard-approver',
  templateUrl: './dashboard-approver.component.html',
  styleUrls: ['./dashboard-approver.component.scss']
})
export class DashboardApproverComponent implements OnInit {
  
  selectedClient: { Pid: number; ClientName: string; } = { Pid: 0, ClientName: "" };

  monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  currentYear = new Date().getFullYear();
  startYear: number = 2023;
  currentMonth = new Date().getMonth();
  availableYears: number[] = Array.from({ length: this.currentYear - this.startYear + 1 }, (_, index) => this.startYear + index);
  selectedYear: number = (this.currentMonth == 0) ? this.availableYears[this.availableYears.length - 2] : this.availableYears[this.availableYears.length - 1];
  selectedMonth: number = (this.currentMonth == 0) ? this.monthNames.indexOf('December') : this.currentMonth - 1;
  isReportsLoading: boolean = false;

  period: { 
    years: number[],
    monthNames: string[],
    selectedPeriod: { date: number, month: number, year: number }
  } = {
    years: this.availableYears,
    monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    selectedPeriod: { date: new Date().getDate(), month: this.selectedMonth, year: this.selectedYear }
  };

  availableReports : any;
  filteredReports : any;
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

  tabs = {
    all: { index: 0, label: 'All', },
    pending: { index: 1, label: 'Pending', },
    approved: { index: 2, label: 'Approved', },
    rejected: { index: 3, label: 'Rejected' }
  };

  filterTabs = {
    tabs: Object.values(this.tabs),
    selectedTab: this.tabs.all
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
  searchReportTerm: string = '';
  availableCompanies: any[] = [];

  config = {
    id: 'custom',
    itemsPerPage: 10,
    currentPage: 1,
    totalItems: 0
  };

  constructor(
    private reportService : ReportsService,
    private storageService: StorageService,
    private toastService: ToastService,
    private dashboardService: DashboardService,
    private reportsService: ReportsService,
    private clientsService: ClientsService,
    private activatedRoute: ActivatedRoute,
    private titleCasePipe: TitleCasePipe,
    private router: Router,
    private sanitizer: DomSanitizer,
    private userService: UserService
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
    this.resetCounts();
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
      this.filteredReports = this.availableReports.data;
      this.companiesWithReports = res.data.companiesWithReports;
      this.companiesWithoutReports = res.data.companiesWithoutReports;
      this.availableCompanies = res.data.availableCompanies;

      this.counts.totalClients = res.data.availableCompanies.length;
      this.counts.availableReports = res.data.availableReports.data.length;
      this.counts.unavailableReports = res.data.companiesWithoutReports.data.length;

      for (const item of res.data.availableReports.data) {
        if (item.status_type === 'approved') this.counts.approvedReports++;
        else if(item.status_type === 'rejected') this.counts.rejectedReports++;
        else if(item.status_type === 'pending') this.counts.pendingApproval++;
      }
    });
  }

  getReport(report: any, reportDetails: any) {

    this.report = report;
    this.previewReport();
    this.showReportPopup = true;
    reportDetails.getClient(); reportDetails.getClientManagementUsers();
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

  approveReport() {
    if(!this.isConfirmed) return;
    this.isApproving = true;

    const body = {
      report_id: this.report.id,
      role: this.user.role,
      user_id: this.user.user_id,
      type: 'approved'
    };
    this.reportsService.approveReport(body).subscribe({
      next: (res: any) => {
        this.isApproving = false;
        this.showConfetti();
        this.toastService.show('Report has been approved.', 'Approved', 'success', true);
        this.getReportByMonthYear();
        this.refreshReport();
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
          this.toastService.show('Report has been rejected.', 'Rejected', 'success', true);
          this.getReportByMonthYear();
          this.refreshReport();
        },
        error: (error: any) => {
          this.isRejecting = false;
          this.toastService.show('Something went wrong while rejecting report. Please contact system administrator.', 'Something went wrong', 'warning', true);
        }
      });
    } else this.isRejecting = false;
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

  onFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      this.reportFile = target.files[0];

    }
  }
   
  toNumber(value: string) {
    return Number.parseInt(value);
  }

  goBack() {
    this.router.navigate(['reports', this.page.toLowerCase(), 'list', (this.report.client_id != 0)? this.report.client_id : '']);
  }

  handleFilterTabs(event: any) {
    if(this.filterTabs.selectedTab == event) this.filterTabs.selectedTab = this.tabs.all;
    else this.filterTabs.selectedTab = {...event};
    this.filterAvailableReports();
  }

  filterAvailableReports() {
    let code = 'all';
    switch(this.filterTabs.selectedTab.index) {
      case this.tabs.approved.index:  code = 'approved';  break;
      case this.tabs.pending.index:   code = 'pending';   break;
      case this.tabs.rejected.index:  code = 'rejected';  break;
    }
    if(code == 'all')
      this.filteredReports = this.availableReports.data;
    else
      this.filteredReports = this.availableReports.data.filter((report: any) => report.status_type === code);
  }

  showConfetti() {
    setTimeout(() => {
      const button = document.getElementById('confetti-container') as HTMLElement;
      party.confetti(button);
    }, 500);
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

  resetCounts() {
    this.counts = {
      totalClients: 0,
      availableReports: 0,
      unavailableReports: 0,
      rejectedReports: 0,
      approvedReports: 0,
      pendingApproval: 0
    };
  }
}
