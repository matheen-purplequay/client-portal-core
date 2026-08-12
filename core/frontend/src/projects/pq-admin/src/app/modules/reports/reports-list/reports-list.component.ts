import { TitleCasePipe, Location } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConnectReportData, Report } from '../../../models/reports';
import { ReportsService } from '../../../services/reports/reports.service';
import { ClientsService } from '../../../services/entities/clients.service';
import { TimeScale } from 'chart.js';
import { BehaviorSubject } from 'rxjs';
import { Activities, Activity } from '../../../models/activities';
import { UserService } from '../../../services/entities/user.service';
import { StorageService } from '../../../services/app/storage/storage.service';
import { ReportService } from 'projects/reports/src/app/services/reports/report.service';
import { ToastService } from 'pq-ui';

@Component({
  selector: 'app-reports-list',
  templateUrl: './reports-list.component.html',
  styleUrls: ['./reports-list.component.scss']
})
export class ReportsListComponent implements OnInit {

  @Output() activityChangedEvent: EventEmitter<number> = new EventEmitter();
  @Input() refresh: BehaviorSubject<boolean> = new BehaviorSubject(false);
  @Input() selectedClient: BehaviorSubject<{ works_manager_client_id: number; name: string; }> = new BehaviorSubject({ works_manager_client_id: 0, name: '' });

  page: string = '';
  reports: ConnectReportData[] = [];
  selectedReport: ConnectReportData = Report.defaultConnectReportData();
  userPermissions: any;
  user: any;

  reportFilters = {
    types: [
      { index: 1, label: 'connect' },
      { index: 2, label: 'weekly' }
    ]
  };

  activity: { list: Activities, current: number } = {
    list: Activity.defaultActivities(),
    current: Activity.defaultActivity()
  };

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
    years: [2023],
    monthNames: ['All Months', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    selectedPeriod: { date: new Date().getDate(), month: 0, year: this.selectedYear }
  };

  isClientsLoading = false;
  isReportsLoading = false;
  reportAlertText: BehaviorSubject<string> = new BehaviorSubject('');
  deleteReason: string = '';

  constructor(
    private activatedRoute: ActivatedRoute,
    private titleCasePipe: TitleCasePipe,
    private reportService: ReportsService,
    private toastService: ToastService,
    private router: Router,
    private location: Location,
    private userService: UserService,
    private storageService: StorageService,
  ) { 
  }
  
  ngOnInit(): void {
    this.userPermissions = this.storageService.getItem('permissions');
    this.user = this.storageService.getItem('userdata');
    // this.userService.getUserPermissionsFromLocalStorage().subscribe((permissions: any) => this.userPermissions = permissions);
    this.page = this.titleCasePipe.transform(this.activatedRoute.snapshot.data['page'] ?? 'Reports');
    this.refresh.subscribe(data => {
      this.activity.current = this.activity.list['connectList'].index;
      this.getReportByClient();
    });
    this.setupAmbience();
  }

  setupAmbience() {
    this.getUserPermission();
    this.getReportByClient();
  }

  getUserPermission() {
    const body = {
      role: this.storageService.getItem('userdata').role
    };
    this.userService.getPermissions(body).subscribe(res => {
      console.log('getting permissions in login ', res);
      this.userService.userPermissions = res;
      this.storageService.setItem('permissions', res);
    });
  }

  getReportByClient() {
    this.isReportsLoading = true;
    this.reports = [];
    const month = (this.period.selectedPeriod.month != 0)? this.period.monthNames[this.period.selectedPeriod.month] : 0
    const body = {
      client_id: this.selectedClient.value.works_manager_client_id,
      year: this.period.selectedPeriod.year,
      month: month,
      type: 'connect'
    };
    
    // this.updateUrl(`/reports/${this.page.toLowerCase()}/list/${this.selectedClient.works_manager_client_id}`);
    
    this.reportService.getReport(body).subscribe((res: any) => {
      this.isReportsLoading = false;
      if(res.status) this.reports = res.data;
    }, error => {this.isReportsLoading = false; });
  }

  openReportById(report: any, month: string) {
    this.selectedReport = report;
    console.log('selected report ', report, this.selectedReport, month);
    this.setActivity(this.activity.list['connectView'].index);
  }

  setSelectedMonth(event: any) {
    const index = this.period.monthNames.indexOf(event);
    this.period.selectedPeriod.month = index;
    return this.period.monthNames[index];
  }

  goToAddReport(id: number) {
    this.router.navigate(['reports', this.page.toLowerCase(), 'upload', id]);
  }

  updateUrl(url: string) {
    this.location.go(url)
  }

  setActivity(activity: number) {
    this.activity.current = activity;
    this.activityChangedEvent.emit(activity);
  }

  handleYearChange(event: number) {
    this.selectedYear = event;
    this.period.selectedPeriod.year = event;
    this.getReportByClient();
  }

  parseInt(value: string) {
    return parseInt(value);
  }

  checkDuplicateExists(report: any) {
    let isDuplicate: boolean = false;
    let count = 0;
    
    this.reports.forEach((r: any) => {
      if((r.month.toLowerCase() === report.month.toLowerCase()) && (r.year.toLowerCase() === report.year.toLowerCase()) ) {
        count++;
        if(count > 1) {
          isDuplicate = true;
          return;
        }
      }
    });
    // if(this.user.role_category == 'admin' || this.user.role_category == 'management') return false;
    // else return isDuplicate;
    return true;
  }

  deleteReport(report: ConnectReportData) {
    if(report) {
      if(confirm("Do you confirm, you are about to delete the report?")) {  
        const body = {
          report_id: report.id,
          reason: this.deleteReason
        };
        this.reportService.deleteReport(body).subscribe({
          next: (res: any) => {
            if(res.status) {
              this.getReportByClient();
              this.deleteReason = '';
              this.selectedReport = Report.defaultConnectReportData();
            }
          },
          error: (err: any) => {
            this.toastService.show('Something went wrong!', 'Could not delete the report. Please contact your administrator.', 'error', true);
            this.selectedReport = Report.defaultConnectReportData();
          }
        });
      }
    }
  }
}
