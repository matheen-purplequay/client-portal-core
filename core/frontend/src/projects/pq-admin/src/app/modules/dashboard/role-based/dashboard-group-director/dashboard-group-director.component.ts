import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ToastService } from 'pq-ui';
import { ConnectReportData, Report } from 'projects/pq-admin/src/app/models/reports';
import { StorageService } from 'projects/pq-admin/src/app/services/app/storage/storage.service';
import { ClientsService } from 'projects/pq-admin/src/app/services/entities/clients.service';
import { ReportsService } from 'projects/pq-admin/src/app/services/reports/reports.service';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-dashboard-group-director',
  templateUrl: './dashboard-group-director.component.html',
  styleUrls: ['./dashboard-group-director.component.scss']
})
export class DashboardGroupDirectorComponent implements OnInit {

  @ViewChild('dataTable', { static: false }) dataTable: ElementRef | undefined;
  @Input() report: ConnectReportData = Report.defaultConnectReportData();

  config = {
    id: 'custom',
    itemsPerPage: 10,
    currentPage: 1,
    totalItems: 0
  };
  monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  currentYear = new Date().getFullYear();
  startYear: number = 2023;
  currentMonth = new Date().getMonth();
  availableYears: number[] = Array.from({ length: this.currentYear - this.startYear + 1 }, (_, index) => this.startYear + index);
  selectedYear: number = (this.currentMonth == 0) ? this.availableYears[this.availableYears.length - 2] : this.availableYears[this.availableYears.length - 1];
  selectedMonth: number = (this.currentMonth == 0) ? this.monthNames.indexOf('December') : this.currentMonth - 1;
  isReportsLoading: boolean = false;

  isClientLoading = false;
  isReportLoading = false;

  period: {
    years: number[],
    monthNames: string[],
    selectedPeriod: { date: number, month: number, year: number }
  } = {
      years: this.availableYears,
      monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      selectedPeriod: { date: new Date().getDate(), month: this.selectedMonth, year: this.selectedYear }
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

  availableReports: any;
  filteredReports: any;
  companiesWithoutReports: any;
  companiesWithReports: any;
  availableCompanies: any[] = [];
  isExportingReportStatus: boolean = false;

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

  masterCompanyList: { [key: string]: { index: number, label: string } } = {
    0: { index: 0, label: 'All' },
    1: { index: 1, label: 'Carisma Solutions' },
    2: { index: 2, label: 'Purple Quay' },
    3: { index: 3, label: 'Carisma Solutions - Purple Quay' }
  };

  masterCompany = {
    list: Object.values(this.masterCompanyList),
    selectedCompanyType: this.masterCompanyList[0],
    keys: { key: 'index', value: 'label' }
  };

  counts = {
    totalClients: 0,
    availableReports: 0,
    unavailableReports: 0,
    rejectedReports: 0,
    approvedReports: 0,
    pendingApproval: 0
  };

  reportResetCount: BehaviorSubject<boolean> = new BehaviorSubject(false);
  countReport: BehaviorSubject<boolean> = new BehaviorSubject(false);
  user: any;

  toggleNewView: boolean = false;
  showReportPopup: boolean = false;

  pdfURL: SafeUrl = '';
  pdfData: BehaviorSubject<Uint8Array | ArrayBuffer | undefined> = new BehaviorSubject<Uint8Array | ArrayBuffer | undefined>(undefined);
  isPDFLoading = false;

  seachReportTerm: string = '';
  selectedClient: any;
  selectedReportID: number = 0;

  constructor(
    private reportService: ReportsService,
    private storageService: StorageService,
    private clientsService: ClientsService,
    private toastService: ToastService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.user = this.storageService.getItem('userdata');
    this.setupAmbience();
  }

  setupAmbience() {
    this.getReportByMonthYear();
  }

  checkDuplicateExists(report: any) {
    let isDuplicate: boolean = false;
    let count = 0;
    this.availableReports.data.forEach((availableReport: any) => {
      if (availableReport.company_id == report.company_id) {
        count++;
        if (count > 1) {
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
    console.log('months and years ', this.period);
    const body = {
      month: this.period.monthNames[this.period.selectedPeriod.month],
      year: this.selectedYear,
      user_id: this.storageService.getItem('userdata').user_id,
      role: this.storageService.getItem('userdata').role
    }
    this.reportService.getReportByMonthYear(body).subscribe((res: any) => {
      this.isReportsLoading = false;
      this.availableReports = res.data.availableReports;
      this.filteredReports = this.availableReports.data;
      this.companiesWithReports = res.data.companiesWithReports;
      this.companiesWithoutReports = res.data.companiesWithoutReports;
      this.availableCompanies = res.data.availableCompanies;
      this.countReport.next(true);

      this.counts.totalClients = res.data.availableCompanies.length;
      this.counts.availableReports = res.data.availableReports.data.length;
      this.counts.unavailableReports = res.data.companiesWithoutReports.data.length;

      for (const item of res.data.availableReports.data) {
        if (item.status_type === 'approved') this.counts.approvedReports++;
        else if (item.status_type === 'rejected') this.counts.rejectedReports++;
        else if (item.status_type === 'pending') this.counts.pendingApproval++;
      }
    });
  }

  getReport(report: any, reportDetails: any) {
    this.selectedReportID = report.id;
    this.report = report;
    this.previewReport();
    this.showReportPopup = true;
    reportDetails.getClient(); reportDetails.getClientManagementUsers();
  }

  previewReport() {
    this.isPDFLoading = true;
    const body = {
      report_id: this.report.id,
      report_type: 'connect'
    }
    this.reportService.getReportPreview(body).subscribe((res: any) => {
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
    this.reportService.getReportByID(body).subscribe({
      next: (res: any) => {
        if (res.status && res.data) {
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

  setSelectedMonth(event: any) {
    const index = this.period.monthNames.indexOf(event);
    this.period.selectedPeriod.month = event;

    return this.period.monthNames[index];
  }

  exportReports() {
    this.isExportingReportStatus = true;
    const body = {
      month: this.period.monthNames[this.period.selectedPeriod.month],
      year: this.period.selectedPeriod.year
    };

    this.reportService.exportReportsByMonthYear(body).subscribe({
      next: (res: any) => {
        this.isExportingReportStatus = false;
        const blob = new Blob([res], { type: 'application/xlsx' });
        var downloadURL = window.URL.createObjectURL(res);
        var link = document.createElement('a');
        link.href = downloadURL;
        link.download = `Connect Reports stats for ${this.period.monthNames[this.period.selectedPeriod.month]} ${this.period.selectedPeriod.year}.xlsx`;
        link.click();
      },
      error: (err: any) => {
        this.isExportingReportStatus = false;
      }
    });
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
      if (col.id == column && col.showColumn) {
        flag = true;
        return;
      }
    });
    return flag;
  }

  sendApprovalRequestById(data: any) {
    let confirmMessage = (data.is_approval_mail_sent) ? 'Reminder already sent for this report. Are you sure you want to send it again?' : 'Are you sure you want to send reminder?';
    if (confirm(confirmMessage)) {
      this.isSendingRequest = true;
      const body = {
        report_id: data.id,
        user_id: this.storageService.getItem('userdata').user_id
      }
      this.reportService.sendApprovalById(body).subscribe({
        next: (res: any) => {
          this.isSendingRequest = false;
          this.toastService.show(res.message, 'Reminder email sent', 'success', true);
        },
        error: (error: any) => {
          this.isSendingRequest = false;
          this.toastService.show('Something went wrong while sending email. Please contact system administrator.', 'Something went wrong.', 'warning', true);
        }
      });
    }
  }

  sortBy(propertyName: string) {
    if (this.sortedColumn === propertyName) {
      this.isAsc = !this.isAsc;
    } else {
      this.sortedColumn = propertyName;
      this.isAsc = true;
    }

    this.companiesWithReports.data.sort((a: any, b: any) => {
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

  handleFilterTabs(event: any) {
    if (this.filterTabs.selectedTab == event) this.filterTabs.selectedTab = this.tabs.all;
    else this.filterTabs.selectedTab = { ...event };
    this.filterAvailableReports();
  }

  filterAvailableReports() {
    let code = 'all';
    switch (this.filterTabs.selectedTab.index) {
      case this.tabs.approved.index: code = 'approved'; break;
      case this.tabs.pending.index: code = 'pending'; break;
      case this.tabs.rejected.index: code = 'rejected'; break;
    }
    if (code == 'all')
      this.filteredReports = this.availableReports.data;
    else
      this.filteredReports = this.availableReports.data.filter((report: any) => report.status_type === code);
  }

  async filterMasterCompany(event: any) {
    this.masterCompany.selectedCompanyType = event;
    if (this.masterCompany.selectedCompanyType.index == this.masterCompanyList[0].index) {
      this.filteredReports = this.availableReports.data;
    } else {
      this.filteredReports = this.availableReports.data.filter((report: any) => report.master_company_id === this.masterCompany.selectedCompanyType.index);
    }
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

  async resetSearchReportTerm() {
    this.seachReportTerm = '';
    this.filterAvailableReports = this.availableReports.data;
  }
}
