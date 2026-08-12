import { ChangeDetectionStrategy, Component, ComponentFactoryResolver, Injector, OnInit, ViewContainerRef } from '@angular/core';
import { ReportsService } from '../../../services/reports/reports.service';
import { DataService } from '../../../services/app/base/data.service';
import { StorageService } from '../../../services/app/storage/storage.service';
import { ToastService } from 'pq-ui';
import { DashboardGroupDirectorComponent } from '../role-based/dashboard-group-director/dashboard-group-director.component';
import { DashboardAdminComponent } from '../role-based/dashboard-admin/dashboard-admin.component';
import { DashboardApproverComponent } from '../role-based/dashboard-approver/dashboard-approver.component';
import { DashboardUploaderComponent } from 'projects/pq-admin/src/app/modules/dashboard/role-based/dashboard-uploader/dashboard-uploader.component';

@Component({
  selector: 'app-dashboard-home',
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.scss']
})
export class DashboardHomeComponent implements OnInit {

  currentYear = new Date().getFullYear();
  startYear: number = 2023;
  currentMonth = new Date().getMonth();
  availableYears: number[] = Array.from({ length: this.currentYear - this.startYear + 1 }, (_, index) => this.startYear + index);
  selectedYear: number = (this.currentMonth == 0)? this.availableYears[this.availableYears.length - 2] : this.availableYears[this.availableYears.length - 1];
  isReportsLoading: boolean = false;

  period: { 
    years: number[],
    monthNames: string[],
    selectedPeriod: { date: number, month: number, year: number }
  } = {
    years: [2023],
    monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    selectedPeriod: { date: new Date().getDate(), month: 0, year: this.selectedYear }
  };

  companiesWithReports : any;
  companiesWithoutReports : any;
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

  user: any;
  componentMap: any = {
    admin: DashboardGroupDirectorComponent,
    client_lead: DashboardApproverComponent,
    group_director: DashboardGroupDirectorComponent,
    team_lead: DashboardUploaderComponent,
  };
  greeting: string = '';

  constructor(
    private reportService : ReportsService,
    private storageService: StorageService,
    private toastService: ToastService,
  ) { 
    this.setupAmbience();
  }

  ngOnInit(): void {
    var today = new Date()
    var curHr = today.getHours()
    
    if (curHr < 11) this.greeting = 'Pleasant morning, ';
    else if (curHr >= 11 && curHr < 15) this.greeting = 'Good Day, ';
    else if (curHr >= 15 && curHr < 19) this.greeting = 'Good Evening, ';
    else this.greeting = 'Howdy! ';
    // this.setComponent();
  }

  setupAmbience(){
    this.user = this.storageService.getItem('userdata');
    // this.getReportByMonthYear();
  }

  getComponentByType(role: string): any {
    if (this.componentMap[role]) {
      return this.componentMap[role];
    } else {
      // Handle default or invalid role
    }
  }

  getReportByMonthYear() {
    this.isReportsLoading = true;
    const body={
      month : this.period.monthNames[this.period.selectedPeriod.month],
      year : this.selectedYear
    }

    this.reportService.getReportByMonthYear(body).subscribe((res:any)=>{
      this.isReportsLoading = false;
      this.companiesWithReports = res.data.companiesWithReports;
      this.companiesWithoutReports = res.data.companiesWithoutReports;



    })
  }

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
    const columns = Object.values(this.companiesWithReports.columns);
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
}
