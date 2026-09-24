import { Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { format, utcToZonedTime } from 'date-fns-tz';
import * as moment from 'moment';
import * as tz from 'moment-timezone';
import { DefaultChart, BarChartData, ChartJS, ChartJSConfig, LineChartData, ToastService } from 'pq-ui';
import { BehaviorSubject, config, first } from 'rxjs';
import { ConfigService } from '../../../services/app/config.service';
import { ChartDataService } from '../../../services/dashboard/chart-data.service';
import { Chart } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { WorkFlowRequest, DefaultRequest, ToARequest, JobStatusRequest } from '../../../models/chartdata';
import { NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { CommonDataTypes, MonthType } from '../../../models/common-data-types';
import html2canvas from 'html2canvas';
import { LocalStorageService } from '../../../services/app/storage/local-storage.service';
import { ClientService } from '../../../services/entities/client.service';
import { DatePipe, formatDate } from '@angular/common';
import { parse } from 'date-fns';
import { JobMovementService } from '../../../services/dashboard/movement/job-movement.service';
import { ReportService } from '../../../services/reports/report.service';
import { Job, JobData } from '../../../models/jobs';
import { RulesService } from '../../../services/app/base/rules.service';
import { SystemService } from '../../../services/app/system/system.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PortalService } from '../../../services/app/base/portal.service';
import { CloudMessagingService } from '../../../services/app/notifications/cloud-messaging.service';

Chart.register(ChartDataLabels);

interface Rule {
  id: string;
  title: string;
  value: string;
  type: string;
  target: string;
  values: { [key: string]: string }[]
}

interface Sections {
  title: string;
  id: string;
  rules: Rule[]
}

@Component({
  selector: 'app-dashboard-home',
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.scss']
})
export class DashboardHomeComponent implements OnInit, OnDestroy {

  @Input() revalidate: BehaviorSubject<boolean> = new BehaviorSubject(false);
  @Input() refresh: BehaviorSubject<boolean> = new BehaviorSubject(false);
  @Input() hideIndex: BehaviorSubject<number> = new BehaviorSubject(-1);

  months = [];
  metaDetails: {
    localTime: string,
    otherTime: string,
    lastUpdated: string
  } = {
      localTime: '',
      otherTime: '',
      lastUpdated: ''
    };

  filterTabs: {
    tabs: { index: number, label: string }[],
    selectedTab: { index: number, label: string },
    legends: { STAFF: number, HOURLY: number, AGREED: number }
  } = {
      tabs: [
        { index: 1, label: 'Staff' },
        { index: 2, label: 'Hourly' },
        { index: 3, label: 'Agreed' }
      ],
      selectedTab: { index: 1, label: 'Staff' },
      legends: { STAFF: 1, HOURLY: 2, AGREED: 3 }
    };

  dashboardTypes = {
    insights: { index: 7, label: 'Insights', withDivider: false },
    jobMovement: { index: 0, label: 'Movement', withDivider: true },
    bsMovement: { index: 6, label: 'Job Status' },
    monthlyConnect: { index: 1, label: 'Monthly Connect' },
    jobStatus: { index: 3, label: 'Status' },
    queries: { index: 5, label: 'Queries' },
    feebdackStatus: { index: 4, label: 'Feedback', withDivider: true },
  };

  filterDashboardType: {
    tabs: { index: number, label: string }[],
    selectedTab: { index: number, label: string },
    legends: { JOB_MOVEMENT: number, MONTHLY_CONNECT: number, REALTIME: number, JOB_STATUS: number, FEEDBACK_STATUS: number, QUERIES: number, BS_MOVEMENT: number, INSIGHTS: number }
  } = {
      tabs: Object.values(this.dashboardTypes),
      selectedTab: { index: 0, label: 'Job Movement' },
      legends: { JOB_MOVEMENT: 0, MONTHLY_CONNECT: 1, REALTIME: 2, JOB_STATUS: 3, FEEDBACK_STATUS: 4, QUERIES: 5, BS_MOVEMENT: 6, INSIGHTS: 7 }
    };

  selectedVertical: {
    index: number, title: string, dashboards: { id: number, vertical_id: number, dashboard_id: number }[]
  } = { index: 0, title: '', dashboards: [] };

  dashboardVerticals: { id: number, vertical_id: number, dashboard_id: number }[] = [];

  verticals: {
    index: number, name: string
  }[] = [];

  clientVerticals: any[] = [];

  // verticals = [
  //   { index: 1, name: 'Business Services' },
  //   { index: 6, name: 'Book Keeping' },
  //   { index: 2, name: 'SMSF' },
  //   { index: 4, name: 'Internal Account' },
  //   { index: 5, name: 'Financial Planning' }
  // ];

  jmStatus = [
    { index: 1, name: 'In_Progress' },
    { index: 2, name: 'Query' },
    { index: 3, name: 'DWP' },
    { index: 4, name: 'RDWP' },
    { index: 5, name: 'Total' }
  ];

  durations: { index: number, label: string }[] = [
    { index: 2, label: 'Last 3 Months' },
    { index: 5, label: 'Last 6 Months' },
    { index: 11, label: 'Last 1 year' }
  ];

  allMonths: MonthType[] = CommonDataTypes.getAllMonthsWithIndex();

  currentYear = new Date().getFullYear();
  startYear: number = 2023;
  availableYears: number[] = Array.from({ length: this.currentYear - this.startYear + 1 }, (_, index) => this.startYear + index);

  showDateError = false;
  currentMonth = new Date().getMonth();
  currentMonthText = this.allMonths.filter(month => month.index == ((this.currentMonth == 0) ? 1 : this.currentMonth))[0].name;
  currentDate = new Date().getDate();
  selectedYear: number = (this.currentMonth == 0) ? this.availableYears[this.availableYears.length - 2] : this.availableYears[this.availableYears.length - 1];

  // monthsToShow = this.allMonths.slice(0, this.currentMonth);
  monthsToShow: { index: number, name: string }[] = [
    // { index: 9, name: 'September' },
    // { index: 10, name: 'October' },
    // { index: 11, name: 'November' },
    // { index: 12, name: 'December' },
  ];

  xaxis: string = '';
  yaxis: string = '';
  labels = [];
  chartType: string = 'bar';

  chartData: any[] = [];

  wfConfig: ChartJSConfig = ChartJS.defaultConfig('bar');
  @Input() wfRefresh: BehaviorSubject<boolean> = new BehaviorSubject(false);

  toaConfig: ChartJSConfig = ChartJS.defaultConfig('line');
  @Input() toaRefresh: BehaviorSubject<boolean> = new BehaviorSubject(false);

  jftConfig: ChartJSConfig = ChartJS.defaultConfig('bar');
  @Input() jftRefresh: BehaviorSubject<boolean> = new BehaviorSubject(false);

  barChart: BarChartData = DefaultChart.defaultBarChart();
  lineChartData: LineChartData = DefaultChart.defaultLineChart();
  jftBarChart: BarChartData = DefaultChart.defaultBarChart();

  filters: WorkFlowRequest = DefaultRequest.defaultWorkflowRequest();
  mpFilters: WorkFlowRequest = DefaultRequest.defaultWorkflowRequest();
  @Input() mpRefresh: BehaviorSubject<boolean> = new BehaviorSubject(false);
  @Input() ccRefresh: BehaviorSubject<boolean> = new BehaviorSubject(false);

  bvaFilters: WorkFlowRequest = DefaultRequest.defaultWorkflowRequest();
  workflowFilter: WorkFlowRequest = DefaultRequest.defaultWorkflowRequest();
  toaFilter: ToARequest = DefaultRequest.defaultToARequest();

  jobStatusFilter: JobStatusRequest = DefaultRequest.defaultJobStatusRequest();
  jsConfig: ChartJSConfig = ChartJS.defaultConfig('bar');
  mpConfig: ChartJSConfig = ChartJS.defaultConfig('bar');
  ccConfig: ChartJSConfig = ChartJS.defaultConfig('bar');
  @Input() jsRefresh: BehaviorSubject<boolean> = new BehaviorSubject(false);

  wfChartType: 'bar' | 'line' = 'bar';
  contracts: {
    Hourly: number,
    Staff: number,
    Agreed: number
  } = {
      Hourly: 0,
      Staff: 0,
      Agreed: 0
    };
  isContractsLoaded: boolean = false;
  isContractsLoading: boolean = false;

  sDateText: string = '';
  eDateText: string = '';
  previousDate: Date = new Date();

  metrics: {
    ReceivedCount: number,
    CompletedCount: number,
    ThroughPut: string
  } = {
      ReceivedCount: 0,
      CompletedCount: 0,
      ThroughPut: ""
    };

  overall: {
    Clientname: string,
    NotYetStarted: string,
    InProgress: string,
    Queries: string,
    ClientClosure: string
  } = {
      Clientname: "",
      NotYetStarted: "",
      InProgress: "",
      Queries: "",
      ClientClosure: ""
    };

  wfCheckboxes = {
    awaiting: true,
    closed: true,
    inprogress: true,
    hold: true
  };

  jobStatus: {
    clientName: string,
    JobName: string,
    TLName: string,
    TimeTaken: string,
    BudgetTime: string,
    WorkStatus: string,
    Receiveddate: string,
    EstDate: string,
    LastTouch: number,
  }[] = [];
  jobStatusLoading: boolean = true;
  showAsStackedChart: boolean = false;
  isJobStatusDataEmpty: boolean = false;
  jsLegends: { name: string, color: string }[] = [];

  monthlyProductivityData: {
    Committedhours: number,
    Jobhours: number,
    overheadshours: number,
    Overheads: number
  } = {
      Committedhours: 0,
      Jobhours: 0,
      overheadshours: 0,
      Overheads: 0
    };
  monthlyProductivityLoading = true;
  isCommittedHoursNull: boolean = false;
  isMonthlyProductivityDataEmpty: boolean = false;
  monthlyProductivity_ChartType: "bar" | "line" = "bar";

  comparitiveData: {
    Id: number,
    Jobhours: string,
    Month: string
  }[] = [];
  comparitiveDataLoading: boolean = false;
  comparitiveDataEmpty: boolean = false;

  budgetVsActualData: {
    Jobid: number,
    jobname: string,
    budgetTime: string,
    actualTime: string
  }[] = [];
  budgetVsActualLoading = false;
  isBudgetVsActualDataEmpty: boolean = true;

  agreedMonthData: {
    number_of_jobs: string,
    month: string,
  }[] = [];

  agreedJobs: {
    date_received: string,
    id: number,
    job_name: string,
    job_status: string,
    month: string
  }[] = [];
  isAgreedJobsLoading: boolean = false;
  doesAgreedExists: boolean = false;

  // Job Movement Variables
  isTouchPointsLoading: boolean = false;
  isTouchPointsLoaded: boolean = false;
  touchPointCounts: { Count: number, Status: string }[] = [];
  currentTouchPointCounts: { status: number, statusText: string } = { status: 0, statusText: '' };
  touchPointIcons: { [key: string]: string } = {
    in_progress: 'edit_document',
    query: 'contact_support',
    dwp: 'receipt_long',
    rdwp: 'article',
    total: 'folder'
  };
  touchPointDetails: any;
  touchPointJob: JobData = Job.defaultJob();
  originalTouchPointDetails: any;
  isLoadingTouchPointDetails = false;
  onlyTouchPointCounts: any;
  onlyTouchPointCountsClosed: any;
  currentJobMovementStatus: number = 0;
  subClients: { SubClientName: string, Id: number }[] = [];
  selectedSubClient: { SubClientName: string, Id: number } = { SubClientName: '', Id: 0 };
  touchPointsLastUpdated: string = '';
  touchPointDuration: number = 1;
  jobSearchTerm: string = '';
  isTouchPointsDetailsLoaded: boolean = false;
  isExportingJobStatusDetails: boolean = false;

  jobMovementTabs = {
    movement: { index: 1, label: 'Movement' },
    status: { index: 2, label: 'Status' }
  };
  filterJobMovementTabs = {
    tabs: Object.values(this.jobMovementTabs),
    selectedTab: Object.values(this.jobMovementTabs)[0],
    keys: Object.keys(Object.values(this.jobMovementTabs)[0])
  };

  pjpeSectionData: any = [];

  user: any;
  moment = 0;

  lastReportMonth: number = 0;
  lastReportYear: number = new Date().getFullYear();
  isLasrReportMonthLoading: boolean = false;
  hideAll: boolean = false;

  masterCompany: any;
  rules: { [key: string]: string }[] = [];
  isRulesApplied: boolean = false;
  isFetchingRules: boolean = false;
  bvaHiddenColumns: string[] = [];

  sections: Sections[] = [];
  selectedRule: Rule | null = null;
  hiddenSections: string[] = [];
  hiddenTableColumns: { table: string, column: string }[] = [];

  clientUsers: { list: any[], selectedUser: any, keys: { key: string, value: string } } = {
    list: [],
    selectedUser: undefined,
    keys: { key: 'id', value: 'name' }
  };

  showVersionUpdate: boolean = false;
  latestUpdate: any;
  app: any;

  activeField: string | null = null;

  constructor(
    private configService: ConfigService,
    private clientService: ClientService,
    private chartDataService: ChartDataService,
    private reportService: ReportService,
    private jobMovementService: JobMovementService,
    private localStorageService: LocalStorageService,
    private rulesService: RulesService,
    private toastService: ToastService,
    private systemService: SystemService,
    private router: Router,
    private portalService: PortalService,
    private cloudMessagingService: CloudMessagingService,
    private activatedRoute: ActivatedRoute
  ) {
  }

  // Set from ?tab=queries (sidebar's "Queries" link) so setupAmbience() can
  // select that tab once filterDashboardType.tabs is loaded/filtered —
  // reading it any earlier is pointless, since that method resets
  // selectedTab to tabs[0] synchronously as part of its own setup.
  private requestedTab: string | null = null;

  // Set from ?jobId=... (the movement widget's "View Queries" link) and
  // passed straight through to app-queries-home, which auto-selects that
  // job once its job list has loaded.
  requestedJobId: number | null = null;

  ngOnInit(): void {
    this.user = this.localStorageService.getItem('userdata');
    this.masterCompany = this.localStorageService.getItem('userdata').master_company || undefined;
    this.requestedTab = this.activatedRoute.snapshot.queryParamMap.get('tab');
    const jobId = this.activatedRoute.snapshot.queryParamMap.get('jobId');
    this.requestedJobId = jobId ? Number(jobId) : null;
    this.getLastReportMonth();
  }

  ngOnDestroy(): void {
    this.isTouchPointsLoaded = false;
  }

  handleFocus(field: string) {
    this.activeField = field;
  }

  handleBlur() {
    setTimeout(() => {
      this.activeField = null; // Reset the active field
      document.body.click();
    }, 200); // Timeout to ensure click outside is registered
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const target = event.target as HTMLElement;

    // Check if the target is an input element and a date input
    if (target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'date') {
      return; // It's a date input, so don't unfocus
    }

    this.activeField = null; // Unfocus if clicked outside
  }

  openPage(page: string) {
    this.router.navigate([page]);
  }

  getLastReportMonth() {

    this.isLasrReportMonthLoading = true;
    const body = {
      project_id: this.localStorageService.getItem('userdata').project_id,
      user_id: this.localStorageService.getItem('userdata').user_id
    };
    this.reportService.getAvailableReportYears(body).subscribe((res: any) => {
      this.isLasrReportMonthLoading = false;
      const is_tester = this.localStorageService.getItem('userdata').is_tester;
      let userdata = this.localStorageService.getItem('userdata');

      if (res.data && res.data.company) {
        if (res.data.company.dashboards) {
          userdata.dashboards = res.data.company.dashboards;
        }
        if (res.data.company.test_dashboards) {
          userdata.test_dashboards = res.data.company.test_dashboards;
        }
        this.localStorageService.setItem('userdata', userdata);
      }
      if (is_tester == null || is_tester == undefined || is_tester == false) {
        // this.monthsToShow = this.monthsToShow.filter(month => month.index >= res.data.month);
        this.lastReportMonth = res.data.month;
        this.lastReportYear = res.data.year;
      }


      if (res.status) {
        if (res.data.years) {
          this.availableYears = res.data.years;
          this.selectedYear = this.availableYears[this.availableYears.length - 1];
          this.monthsToShow = res.data.months;
        }

        this.setupAmbience();
        this.configService.getJSONData('jobstatus').subscribe((res: any) => {
          this.pjpeSectionData = res;
        });
      } else {
        if (this.localStorageService.getItem('userdata').role == "admin" || this.localStorageService.getItem('userdata').role == "group_director" || this.localStorageService.getItem('userdata').is_tester) {
          this.setupAmbience();
        } else {
          if (userdata.dashboards.includes('1')) this.hideAll = true;
          else this.setupAmbience();
        }
      }
    });
  }

  getAvailableMonthsForAgreed(event: number) {
    this.selectedYear = event;
    const monthBody = {
      project_id: this.localStorageService.getItem('userdata').project_id,
      year: event
    };
    this.reportService.getAvailableReportMonths(monthBody).subscribe((res: any) => {

      this.monthsToShow = res.data;
      this.filters.month = this.monthsToShow[this.monthsToShow.length - 1].index;
      this.currentMonth = this.filters.month;
      this.loadAgreed();
    });
  }

  getVerticalName(vertical: Number) {
    return this.verticals.filter(v => v.index == vertical)[0].name;
  }

  setupAmbience() {
    this.isContractsLoading = true;
    let getContractPayload = {
      project_id: this.localStorageService.getItem('userdata').project_id
    };
    this.chartDataService.getContracts(getContractPayload).subscribe((res: any) => {
      this.isContractsLoading = false;
      this.contracts = res.data[0];
      this.doesAgreedExists = res.does_agreed_exists;
      this.filterTabs.tabs = this.filterTabs.tabs.filter((tab: any) => this.contracts[tab.label as keyof {
        Hourly: number;
        Staff: number;
        Agreed: number;
      }] !== 0);
      if (!this.doesAgreedExists) this.filterTabs.tabs = this.filterTabs.tabs.filter((item => item.label !== "Agreed"));
      if (this.localStorageService.getItem('userdata').company_id == 6) {
        this.filterTabs.tabs = this.filterTabs.tabs.filter((item => item.label !== "Staff"));
      }
      if (this.localStorageService.getItem('userdata').company_id == 7 || this.localStorageService.getItem('userdata').company_id == 52) {
        this.filterTabs.tabs = this.filterTabs.tabs.filter((item => item.label !== "Hourly"));
      }

      if (this.filterTabs.tabs.length > 0) {
        this.filterTabs.selectedTab.index = this.filterTabs.tabs[0].index;
        this.filterTabs.selectedTab.label = this.filterTabs.tabs[0].label;
      }
      this.getVerticals();
    });


    const is_tester = this.localStorageService.getItem('userdata').is_tester ?? undefined;
    if (is_tester) {
      const testDashboards = (this.localStorageService.getItem('userdata').test_dashboards as string).split(',').map(d => parseInt(d));

      this.filterDashboardType.tabs = this.filterDashboardType.tabs.filter((tab: any) => {
        return testDashboards.includes(tab.index);
      });
    } else {
      const availableDashboards = (this.localStorageService.getItem('userdata').dashboards as string).split(',').map(d => parseInt(d));

      this.filterDashboardType.tabs = this.filterDashboardType.tabs.filter((tab: any) => {
        return availableDashboards.includes(tab.index);
      });
    }


    if (this.filterDashboardType.tabs.length > 0) {
      this.filterDashboardType.selectedTab = this.filterDashboardType.tabs[0];
    }

    // ?tab=queries (sidebar's "Queries" link) selects that tab directly,
    // if this user's dashboards actually include it.
    if (this.requestedTab === 'queries') {
      const queriesTab = this.filterDashboardType.tabs.find((tab: any) => tab.index === this.filterDashboardType.legends.QUERIES);
      if (queriesTab) this.filterDashboardType.selectedTab = queriesTab;
    }

    this.checkIfNeedsToBeUpdated();
    // this.getMonthlyDashboardFiltersFromLocalStorage();

    if (false) {
      this.filters = JSON.parse(this.localStorageService.getItem('chartfilters')!) as WorkFlowRequest;
    } else {
      let sdate = this.getDateFromWeek(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 1));
      let edate = this.getDateFromWeek(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 1));
      this.previousDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 1);
      this.filters.month = this.getFirstDateLastDateMonthText({ index: this.monthsToShow[this.monthsToShow.length - 1].index, value: this.monthsToShow[this.monthsToShow.length - 1].name }).month;
      this.filters.monthText = this.getFirstDateLastDateMonthText({ index: this.monthsToShow[this.monthsToShow.length - 1].index, value: this.monthsToShow[this.monthsToShow.length - 1].name }).monthText;
      this.filters.monthTextWithYear = this.getFirstDateLastDateMonthText({ index: this.monthsToShow[this.monthsToShow.length - 1].index, value: this.monthsToShow[this.monthsToShow.length - 1].name }).monthTextWithYear;

      this.filters.startDate = sdate;
      this.filters.endDate = edate;
      this.filters.vertical = 1;

      this.setLocalStorageFilters();
    }
    let getTime = setInterval(() => {
      this.getTime();
    }, 1000);

    this.metaDetails.lastUpdated = 'few seconds ago';

    let setMoment = setInterval(() => {
      this.moment = this.moment + 1;
      this.metaDetails.lastUpdated = (this.moment) + " min ago"
    }, 60000);

    // Job Movement Reports
    this.checkDates();
    this.getUserData();
  }

  // setupAmbience() {
  //   this.isContractsLoading = true;
  //   let getContractPayload = {
  //     project_id: this.localStorageService.getItem('userdata').project_id
  //   };
  //   this.chartDataService.getContracts(getContractPayload).subscribe((res: any) => {
  //     this.isContractsLoading = false;
  //     this.contracts = res.data[0];
  //     this.doesAgreedExists = res.does_agreed_exists;
  //     this.filterTabs.tabs = this.filterTabs.tabs.filter((tab: any) => this.contracts[tab.label as keyof {
  //       Hourly: number;
  //       Staff: number;
  //       Agreed: number;
  //     }] !== 0);
  //     if(!this.doesAgreedExists) this.filterTabs.tabs = this.filterTabs.tabs.filter((item => item.label !== "Agreed"));
  //     if (this.localStorageService.getItem('userdata').company_id == 6) {
  //       this.filterTabs.tabs = this.filterTabs.tabs.filter((item => item.label !== "Staff"));
  //     }
  //     if (this.localStorageService.getItem('userdata').company_id == 7 || this.localStorageService.getItem('userdata').company_id == 52) {
  //       this.filterTabs.tabs = this.filterTabs.tabs.filter((item => item.label !== "Hourly"));
  //     }

  //     if (this.filterTabs.tabs.length > 0) {
  //       this.filterTabs.selectedTab.index = this.filterTabs.tabs[0].index;
  //       this.filterTabs.selectedTab.label = this.filterTabs.tabs[0].label;
  //     }
  //     this.getVerticals();
  //   });

  //   this.setupFilterDashboardTypes();

  //   this.checkIfNeedsToBeUpdated();
  //   // this.getMonthlyDashboardFiltersFromLocalStorage();

  //   if (false) {
  //     this.filters = JSON.parse(this.localStorageService.getItem('chartfilters')!) as WorkFlowRequest;
  //   } else {
  //     let sdate = this.getDateFromWeek(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 1));
  //     let edate = this.getDateFromWeek(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 1));
  //     this.previousDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 1);
  //     this.filters.month = this.getFirstDateLastDateMonthText({ index: this.monthsToShow[this.monthsToShow.length - 1].index, value: this.monthsToShow[this.monthsToShow.length - 1].name }).month;
  //     this.filters.monthText = this.getFirstDateLastDateMonthText({ index: this.monthsToShow[this.monthsToShow.length - 1].index, value: this.monthsToShow[this.monthsToShow.length - 1].name }).monthText;
  //     this.filters.monthTextWithYear = this.getFirstDateLastDateMonthText({ index: this.monthsToShow[this.monthsToShow.length - 1].index, value: this.monthsToShow[this.monthsToShow.length - 1].name }).monthTextWithYear;

  //     this.filters.startDate = sdate;
  //     this.filters.endDate = edate;
  //     this.filters.vertical = 1;

  //     this.setLocalStorageFilters();
  //   }
  //   let getTime = setInterval(() => {
  //     this.getTime();
  //   }, 1000);

  //   this.metaDetails.lastUpdated = 'few seconds ago';

  //   let setMoment = setInterval(() => {
  //     this.moment = this.moment + 1;
  //     this.metaDetails.lastUpdated = (this.moment) + " min ago"
  //   }, 60000);

  //   // Job Movement Reports
  //   this.checkDates();
  //   this.getUserData();
  // }

  // setupFilterDashboardTypes () {
  //   const is_tester = this.localStorageService.getItem('userdata').is_tester ?? undefined;
  //   if(is_tester) {
  //     const availableTestDashboards = this.selectedVertical.dashboards.map(dashboard => dashboard.dashboard_id); 

  //     const testDashboards = (this.localStorageService.getItem('userdata').test_dashboards as string).split(',').map(d => parseInt(d));

  //     const finalTestDashboards = availableTestDashboards.filter(dashboard => testDashboards.includes(dashboard));

  //     this.filterDashboardType.tabs = this.filterDashboardType.tabs.filter((tab: any) => {
  //       return finalTestDashboards.includes(tab.index);
  //     });
  //   } else {
  //     const availableDashboards = this.selectedVertical.dashboards.map(dashboard => dashboard.dashboard_id);

  //     const dashboards = (this.localStorageService.getItem('userdata').dashboards as string).split(',').map(d => parseInt(d));

  //     const finalDashboards = availableDashboards.filter(dashboard => dashboards.includes(dashboard));

  //     this.filterDashboardType.tabs = this.filterDashboardType.tabs.filter((tab: any) => {
  //       return finalDashboards.includes(tab.index);
  //     });
  //   }

  //   if (this.filterDashboardType.tabs.length > 0) {
  //     this.filterDashboardType.selectedTab = this.filterDashboardType.tabs[0];
  //   }
  // }

  getDateFromWeek(date: Date) {
    var dayOfWeek = date.getDay();
    if (dayOfWeek === 6) return date = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1);
    else if (dayOfWeek === 0) return date = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 2);
    else return date;
  }

  getVerticals() {
    const body = {
      client_id: this.localStorageService.getItem('userdata').company_id
    };
    this.clientService.getClientVerticals(body).subscribe({
      next: (res: any) => {

        this.clientVerticals = res.data;
        // this.dashboardVerticals = [...res.dashboards];

        const agreedVerticals = this.clientVerticals.filter((vertical: any) => vertical.code.toLowerCase() == 'agreed');
        if (agreedVerticals.length < 0) {
          this.filterTabs.tabs = this.filterTabs.tabs.filter((tab: any) => tab.index != this.filterTabs.legends.AGREED);
        }

        const hourlyVerticals = this.clientVerticals.filter((vertical: any) => vertical.code.toLowerCase() == 'hourly');
        if (hourlyVerticals.length < 0) {
          this.filterTabs.tabs = this.filterTabs.tabs.filter((tab: any) => tab.index != this.filterTabs.legends.HOURLY);
        }



        this.setVerticals();

        // if (this.filterDashboardType.selectedTab.index == 0) this.getJobMovementDashboardData();
        // else if (this.filterDashboardType.selectedTab.index == 1) this.getMonthlyDashboardData();
        // else if (this.filterDashboardType.selectedTab.index == 2) this.getRealtimeDashboardData();
        this.isContractsLoaded = true;
      },
      error: (err: any) => {
        this.isContractsLoaded = true;
      },
    });
    // this.clientService.getVerticals(body).subscribe((res: any) => {

    //   this.verticals = [];
    //   if (res.status && res.data.length > 0) {
    //     res.data.forEach((data: any) => {
    //       this.verticals.push({ index: data.wm_vertical_id, name: data.title });
    //     });

    //     this.setVerticals();
    //   }

    //   if (this.filterDashboardType.selectedTab.index == 0) this.getJobMovementDashboardData();
    //   else if (this.filterDashboardType.selectedTab.index == 1) this.getMonthlyDashboardData();
    //   else if (this.filterDashboardType.selectedTab.index == 2) this.getRealtimeDashboardData();
    // });
  }

  setVerticals() {
    const selectedFilterTab = this.filterTabs.selectedTab.index;
    this.verticals = [];

    switch (selectedFilterTab) {
      case this.filterTabs.legends.STAFF:
        this.clientVerticals.forEach((vertical: any) => {
          if (vertical.code.toLowerCase() == 'staff') this.verticals.push({ index: vertical.wm_vertical_id, name: vertical.title });

        });
        break;
      case this.filterTabs.legends.HOURLY:
        this.clientVerticals.forEach((vertical: any) => {
          if (vertical.code.toLowerCase() == 'hourly') this.verticals.push({ index: vertical.wm_vertical_id, name: vertical.title });
        });
        break;
      case this.filterTabs.legends.AGREED:
        this.clientVerticals.forEach((vertical: any) => {
          if (vertical.code.toLowerCase() == 'agreed') this.verticals.push({ index: vertical.wm_vertical_id, name: vertical.title });
        });
        break;
    }

    // if(this.verticals.length > 0) {
    //   this.selectedVertical = {
    //     index: this.verticals[0].index,
    //     title: this.verticals[0].name,
    //     dashboards: this.dashboardVerticals.filter(dashboard => dashboard.vertical_id == this.verticals[0].index)
    //   };
    // } else {
    //   this.selectedVertical = { index: 0, title: '', dashboards: [] };
    // }

    if (this.verticals.length > 0) {
      this.jobStatusFilter.vertical = this.verticals[0].index;
      this.mpFilters.vertical = this.verticals[0].index;
      this.bvaFilters.vertical = this.verticals[0].index;
    } else {
      this.jobStatusFilter.vertical = 0;
      this.mpFilters.vertical = 0;
      this.bvaFilters.vertical = 0;
    }

    this.getRulesByClient();
    if (this.filterDashboardType.selectedTab.index == 0) {
      // if(this.user.role == 'tester' || this.user.is_tester) this.getClientUserList();
      // else 
      this.getJobMovementDashboardData();
    }
    else if (this.filterDashboardType.selectedTab.index == 1) this.getMonthlyDashboardData();
    else if (this.filterDashboardType.selectedTab.index == 2) this.getRealtimeDashboardData();

    // this.loadAgreed();
  }

  setSelectedVertical(vertical: { index: number, name: string }) {
    this.selectedVertical = {
      index: vertical.index,
      title: vertical.name,
      dashboards: this.dashboardVerticals.filter(dashboard => dashboard.vertical_id == vertical.index)
    };
  }

  changeVertical(vertical: any) {
    this.setSelectedVertical({
      index: vertical.service_id,
      name: vertical.title
    });
    this.jobStatusFilter.vertical = vertical.wm_vertical_id;
    this.mpFilters.vertical = vertical.wm_vertical_id;
    this.bvaFilters.vertical = vertical.wm_vertical_id;

    this.getRulesByClient();

    // this.setupFilterDashboardTypes();

    if (this.filterDashboardType.selectedTab.index == 0) {
      // if(this.user.role == 'tester' || this.user.is_tester) this.getClientUserList();
      // else 
      this.getJobMovementDashboardData();
    }
    else if (this.filterDashboardType.selectedTab.index == 1) this.getMonthlyDashboardData();
    else if (this.filterDashboardType.selectedTab.index == 2) this.getRealtimeDashboardData();

    // this.loadAgreed();
  }

  loadAgreed() {
    this.getMonthlyDashboardData();
  }

  setVerticalsAndRefreshAll(event: any) {
    this.jobStatusFilter.vertical = event.index;
    this.mpFilters.vertical = event.index;
    this.bvaFilters.vertical = event.index;
    this.getRulesByClient();
    this.loadAgreed();
  }

  checkIfNeedsToBeUpdated() {
    if (this.localStorageService.getItem('filtersUpdated') != '1') this.initMonthlyDashboardFiltersFromLocalStorage();
    this.localStorageService.setItem('filtersUpdated', '1');
  }

  getClientUserList() {
    const body = {
      client_id: this.user.company_id
    };
    this.clientService.getClientUsers(body).subscribe((res: any) => {
      if (res.status) {
        this.clientUsers.list = res.data;
        this.clientUsers.selectedUser = res.data[0];
        this.getJobMovementDashboardData();
      }
    });
  }

  getUserData() {
    this.user = this.localStorageService.getItem('userdata');
  }

  getRealtimeDashboardData() {
    setTimeout(() => {
      this.getWFStatusFromService();
    }, 1000);
    setTimeout(() => {
      this.getToAStatusFromService();
    }, 2000);
    setTimeout(() => {
      this.getJFTStatusFromService();
    }, 3000);
    this.getJobStatus();
    this.chartDataService.getMetrics(this.filters).subscribe((res: any) => {

      this.metrics = res[0];
    });

    this.getOverall();
  }

  getOverall() {
    const body = {
      project_id: this.localStorageService.getItem('userdata').project_id
    };
    this.chartDataService.getOverall(body).subscribe((res: any) => {

      this.overall = res[0];
    });
  }

  refreshAllCharts() {
    this.moment = 0;

    if (this.filterDashboardType.selectedTab.index == 0) this.getJobMovementDashboardData();
    else if (this.filterDashboardType.selectedTab.index == 1) this.getMonthlyDashboardData();
    else if (this.filterDashboardType.selectedTab.index == 2) this.getRealtimeDashboardData();

    this.chartDataService.getMetrics(this.filters).subscribe((res: any) => {

      this.metrics = res[0];
    });

    this.getOverall();
  }

  // For Job Movement Dashboard
  // parent function to get all job moviement data
  getJobMovementDashboardData() {
    this.getTouchPointsLastUpdatedFromService()
    this.getTouchPointCountFromService();
    this.getOnlyTouchPointCountFromService();
    this.getAllSubClientsFromService();
    this.getOnlyTouchPointCountClosedFromService();
  }

  searchJobByName(searchTerm: string) {
    this.jobSearchTerm = searchTerm;

    if (searchTerm && searchTerm != '') this.touchPointDetails = this.touchPointDetails.filter((job: any) =>
      job.JobName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    else this.resetSearchByJobname();
  }

  resetSearchByJobname() {
    this.touchPointDetails = this.originalTouchPointDetails;
    this.jobSearchTerm = '';
  }

  getTouchPointsLastUpdatedFromService() {
    this.touchPointsLastUpdated = '';
    const body = {
      project_id: this.localStorageService.getItem('userdata').project_id,
      end_date: this.filters.endDate
    };
    this.chartDataService.getTouchPointsLastUpdated(body).subscribe((res: any) => {

      this.touchPointsLastUpdated = res[0].Date;
    });
  }

  getTouchPointDurationInDays() {
    const startMoment = moment(this.filters.startDate);
    const endMoment = moment(this.filters.endDate);
    const days = moment.duration(endMoment.diff(startMoment));
    this.touchPointDuration = Math.round(days.asDays() + 1);
  }

  formatDate(date: string) {
    let d: Date;

    // Check if the date string follows the 'T' pattern
    if (/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(date)) {
      const dt = date.split("T")[0].split("-");
      d = new Date(parseInt(dt[0]), parseInt(dt[1]) - 1, parseInt(dt[2]));
    } else {
      // Parse the date string in the new format
      d = new Date(date);
    }


    // Check if the date is valid
    if (!isNaN(d.getTime())) {
      const rmonth = (d.getMonth() < 9) ? '0' + (d.getMonth() + 1) : (d.getMonth() + 1) + '';
      const rdate = (d.getDate() < 10) ? '0' + d.getDate() : d.getDate() + '';

      return `${d.getFullYear()}-${rmonth}-${rdate}`;
    } else {
      // Handle invalid date

      return null; // or handle it as needed
    }
  }

  // For Job Movement Dashboard
  // get touch point count from service
  getTouchPointCountFromService() {
    this.getTouchPointDurationInDays();
    this.isTouchPointsLoading = true;

    let body: any = {
      project_id: this.localStorageService.getItem('userdata').project_id,
      start_date: this.formatDate(this.filters.startDate.toString()),
      end_date: this.formatDate(this.filters.endDate.toString()),
      sub_client: this.selectedSubClient.Id
    };

    if (this.user.company_id != 6) {

      if (this.localStorageService.getItem('wm_user') && this.localStorageService.getItem('wm_user') != null && this.localStorageService.getItem('wm_user') != undefined) {
        this.clientUsers.selectedUser = this.localStorageService.getItem('wm_user');
        if (this.user.is_tester) {
          body.user_id = this.clientUsers.selectedUser.wm_client_id
        } else body.user_id = this.clientUsers.selectedUser.client_id;
      }
      else {
        this.clientUsers.selectedUser = this.localStorageService.getItem('userdata');
        if (this.user.is_tester) {
          body.user_id = this.clientUsers.selectedUser.wm_client_id
        } else body.user_id = this.clientUsers.selectedUser.client_id;
      }
    }



    this.touchPointDetails = [];
    this.chartDataService.getTouchPointCount(body).subscribe((res: any) => {
      this.isTouchPointsLoaded = true;
      this.isTouchPointsLoading = false;
      this.touchPointCounts = res;

    }, error => this.isTouchPointsLoading = false);
  }

  // For Job Movement Dashboard
  // get all sub clients
  getAllSubClientsFromService() {
    let body = {
      project_id: this.localStorageService.getItem('userdata').project_id,
    };
    this.chartDataService.getAllSubClients(body).subscribe((res: any) => {

      this.subClients = res;
      this.subClients.unshift({ Id: 0, SubClientName: 'All Clients' });
    });
  }

  getTouchPointDetailsBySubClientFromService(subClient: any) {
    this.selectedSubClient = subClient;
    this.getTouchPointCountFromService();
    this.touchPointDetails = [];
    this.currentTouchPointCounts.status = 0;
    this.currentTouchPointCounts.statusText = '';
    // this.getTouchPointDetailsFromService(this.currentTouchPointCounts.status, this.currentTouchPointCounts.statusText);
  }

  // For Job Movement Dashboard
  // get touch point count from service
  getTouchPointDetailsFromService(status: number, statusText: string) {
    this.isLoadingTouchPointDetails = true;
    this.currentTouchPointCounts.status = status;
    this.currentTouchPointCounts.statusText = statusText;
    this.touchPointDetails = [];

    const selectedStatusIndex = this.jmStatus.filter((status: any) => { return status.name === statusText })[0].index;

    let body: any = {
      project_id: this.localStorageService.getItem('userdata').project_id,
      start_date: this.formatDate(this.filters.startDate.toString()),
      end_date: this.formatDate(this.filters.endDate.toString()),
      status: selectedStatusIndex,
      sub_client: this.selectedSubClient.Id
    };

    if (this.user.company_id != 6) {
      if (this.localStorageService.getItem('wm_user') && this.localStorageService.getItem('wm_user') != null && this.localStorageService.getItem('wm_user') != undefined) {
        body.user_id = this.clientUsers.selectedUser.wm_client_id
      }
      else {
        body.user_id = this.localStorageService.getItem('userdata').client_id
      }
    }

    this.chartDataService.getTouchPointDetails(body).subscribe((res: any) => {
      this.isTouchPointsDetailsLoaded = true;
      this.isLoadingTouchPointDetails = false;
      this.touchPointDetails = res;
      this.originalTouchPointDetails = res;

    });
  }

  exportJobStatusDetails(statusText: string) {
    this.isExportingJobStatusDetails = true;
    const selectedStatusIndex = this.jmStatus.filter((status: any) => { return status.name === statusText })[0].index;
    let body: any = {
      project_id: this.localStorageService.getItem('userdata').project_id,
      start_date: this.formatDate(this.filters.startDate.toString()),
      end_date: this.formatDate(this.filters.endDate.toString()),
      status: selectedStatusIndex,
      sub_client: this.selectedSubClient.Id
    };

    if (this.user.company_id != 6) {
      body.user_id = this.clientUsers.selectedUser.wm_client_id
    }
    this.jobMovementService.exportJobStatusDetails(body).subscribe((data: any) => {
      const blob = new Blob([data], { type: 'application/xlsx' });
      var downloadURL = window.URL.createObjectURL(data);
      var link = document.createElement('a');
      link.href = downloadURL;
      link.download = "Job_Movement_Export.xlsx";
      link.click();
      this.isExportingJobStatusDetails = false;
    });
  }

  // For Job Movement Dashboard
  // get only touch point count from service
  getOnlyTouchPointCountFromService() {
    let body: any = {
      project_id: this.localStorageService.getItem('userdata').project_id,
      start_date: this.formatDate(this.filters.startDate.toString()),
      end_date: this.formatDate(this.filters.endDate.toString())
    };

    if (this.user.company_id != 6) {
      this.clientUsers.selectedUser = this.localStorageService.getItem('wm_user');
      if (this.user.is_tester) {
        body.user_id = this.clientUsers.selectedUser.wm_client_id
      } else {
        body.user_id = this.localStorageService.getItem('userdata').client_id;
      }
      // body.user_id = this.clientUsers.selectedUser.wm_client_id
    }
    this.chartDataService.getOnlyTouchPointCount(body).subscribe((res: any) => {
      this.onlyTouchPointCounts = res;
    });
  }

  // For Job Movement Dashboard
  // get only touch point count from service
  getOnlyTouchPointCountClosedFromService() {
    let body = {
      project_id: this.localStorageService.getItem('userdata').project_id,
      start_date: this.formatDate(this.filters.startDate.toString()),
      end_date: this.formatDate(this.filters.endDate.toString())
    };
    this.chartDataService.getOnlyTouchPointCountClosed(body).subscribe((res: any) => {

      this.onlyTouchPointCountsClosed = res;
    });
  }

  getTime() {
    // Get the current time in the local time zone
    this.metaDetails.localTime = moment().format('YYYY-MM-DD HH:mm:ss');

    // Get the current time in Melbourne time zone
    const melbourneTimezone = 'Australia/Melbourne';
    this.metaDetails.otherTime = tz.tz(melbourneTimezone).format('YYYY-MM-DD HH:mm:ss');
  }

  // For Monthly Dashboard
  // get filters from localStorage service
  getMonthlyDashboardFiltersFromLocalStorage() {
    if (this.localStorageService.getItem('monthlyDashboardFilters')) {
      this.jobStatusFilter = { ...this.localStorageService.getItem('monthlyDashboardFilters').jobStatusFilters };
      this.mpFilters = this.localStorageService.getItem('monthlyDashboardFilters').monthlyProductivityFilters;
      this.bvaFilters = this.localStorageService.getItem('monthlyDashboardFilters').budgetVsActualFilters;

    }
  }

  // For Monthly Dashboard
  // set filters from localStorage service
  setMonthlyDashboardFiltersFromLocalStorage() {
    const monthlyDashboardFilters = {
      jobStatusFilters: this.jobStatusFilter,
      monthlyProductivityFilters: this.mpFilters,
      budgetVsActualFilters: this.bvaFilters
    };
    this.localStorageService.setItem('monthlyDashboardFilters', monthlyDashboardFilters);
  }

  initMonthlyDashboardFiltersFromLocalStorage() {
    if (!this.localStorageService.getItem('monthlyDashboardFilters')) {
      this.jobStatusFilter.project_id = this.localStorageService.getItem('userdata').company_id;
      this.jobStatusFilter.contractType = this.filterTabs.selectedTab.index;
      this.jobStatusFilter.period = this.filters.monthTextWithYear;
      this.jobStatusFilter.vertical = this.filters.vertical;
      this.mpFilters = { ...this.filters };
      this.bvaFilters = { ...this.filters };

      const monthlyDashboardFilters = {
        jobStatusFilters: this.jobStatusFilter,
        monthlyProductivityFilters: this.mpFilters,
        budgetVsActualFilters: this.bvaFilters
      };

      this.localStorageService.setItem('monthlyDashboardFilters', monthlyDashboardFilters);
    }
  }

  // For Monthly Dashboard
  // parent function to get all monthly dashboard data
  getMonthlyDashboardData() {
    this.setMonthlyDashboardFiltersFromLocalStorage();

    // Monthly Report Data

    if (this.filterTabs.selectedTab.index != this.filterTabs.legends.AGREED) {

      this.getJobStatusFromService();
      this.getMonthlyProductivity();
      this.getBudgetVsActual();
    }
    if (this.filterTabs.selectedTab.index == this.filterTabs.legends.AGREED) {

      // this.getAgreedJobsFromService();
      this.getAgreedLastThreeMonthDataFromService();
    }

  }

  // For Monthly Dashboard
  // get Job Status From Service
  // getJobStatusFromService() {
  //   this.jobStatusLoading = true;
  //   this.isJobStatusDataEmpty = true;
  //   let filters = {
  //     project_id: this.localStorageService.getItem('userdata').project_id,
  //     period: this.filters.monthTextWithYear,
  //     contract_type: this.filterTabs.selectedTab.index,
  //     vertical: (this.showAsStackedChart) ? 0 : this.jobStatusFilter.vertical
  //   };
  //   this.chartDataService.getJobStatusByContract(filters).subscribe({
  //     next: (res: any) => {
  //       this.jobStatusLoading = false;

  //       if (res && res.length > 0 && res instanceof Array) {
  //         this.isJobStatusDataEmpty = false;
  //         const chartData = res[0];

  //         let datasets: any = [];
  //         let labels: any = [];
  //         const bgColors = ["#3366CC", "#f0ba69", "#FF9900", "#109618", "#990099", "#0099C6", "#DD4477", "#66AA00", "#bd5365", "#316395", "#994499", "#22AA99"];

  //         let categories = Object.keys(chartData).filter(key => key !== 'nature');
  //         labels = categories;
  //         this.jsLegends = [];

  //         const cleanedLegends = categories.map(item => {
  //           // Use a regular expression to remove the numbering and dot
  //           return item.split('. ')[1];
  //         });

  //         cleanedLegends.forEach((category, index) => {
  //           this.jsLegends.push({ name: category, color: bgColors[index] });
  //         });
  //         const dataValues = categories.map(category => chartData[category]);

  //         datasets.push({
  //           backgroundColor: bgColors,
  //           data: dataValues,
  //         });

  //         this.jsConfig.type = this.wfChartType;
  //         this.barChart.labels = cleanedLegends;
  //         this.barChart.datasets = datasets;
  //         // this.barChart.datasets = data;

  //         this.jsConfig.data = { ...this.barChart as BarChartData };
  //       } else {
  //         let datasets: any = [];
  //         let labels: any = [];
  //         this.jsConfig.type = this.wfChartType;
  //         this.barChart.labels = labels;
  //         this.barChart.datasets = datasets;
  //         this.jsConfig.data = { ...this.barChart as BarChartData };
  //       }

  //       this.refreshChart(1);
  //     },
  //     error: (err: any) => {
  //       this.jobStatusLoading = false;
  //       this.isJobStatusDataEmpty = true;
  //     }
  //   });
  // }

  // For Monthly Dashboard
  // get Job Status From Service
  getJobStatusFromService() {
    this.jobStatusLoading = true;
    this.isJobStatusDataEmpty = true;

    const filters = {
      project_id: this.localStorageService.getItem('userdata').project_id,
      period: this.filters.monthTextWithYear,
      contract_type: this.filterTabs.selectedTab.index,
      vertical: this.showAsStackedChart ? 0 : this.jobStatusFilter.vertical
    };

    this.chartDataService.getJobStatusByContract(filters).subscribe({
      next: (res: any) => {
        this.jobStatusLoading = false;

        if (!res || !Array.isArray(res) || res.length === 0) {
          this.isJobStatusDataEmpty = true;
          this.resetChart();
          this.refreshChart(1);
          return;
        }

        this.isJobStatusDataEmpty = false;

        // Group by workstatus
        const statusMap: { [key: string]: number } = {};

        res.forEach(row => {
          if (!statusMap[row.workstatus]) {
            statusMap[row.workstatus] = Number(row.nojob);
          } else {
            statusMap[row.workstatus] += Number(row.nojob);
          }
        });

        const bgColors = [
          "#3366CC", "#f0ba69", "#FF9900", "#109618", "#990099",
          "#0099C6", "#DD4477", "#66AA00", "#bd5365", "#316395",
          "#994499", "#22AA99"
        ];

        const workstatusList = Object.keys(statusMap);

        // Labels clean-up (remove numbering like "2. In progress")
        // const cleanedLabels = workstatusList.map(s => s.split('. ').slice(1).join('. '));
        const cleanedLabels = workstatusList;

        const values = workstatusList.map(s => statusMap[s]);

        this.jsLegends = cleanedLabels.map((label, index) => ({
          name: label,
          color: bgColors[index % bgColors.length]
        }));

        // Build dataset
        const datasets = [
          {
            backgroundColor: bgColors,
            data: values
          }
        ];

        this.barChart.labels = cleanedLabels;
        this.barChart.datasets = datasets;
        this.jsConfig.type = this.wfChartType;
        this.jsConfig.data = { ...this.barChart };

        this.refreshChart(1);
      },

      error: () => {
        this.jobStatusLoading = false;
        this.isJobStatusDataEmpty = true;
        this.resetChart();
      }
    });
  }

  private resetChart() {
    this.barChart.labels = [];
    this.barChart.datasets = [];
    this.jsConfig.data = { ...this.barChart };
  }

  // For Monthly Dashboard
  // get Monthly Productivity From Service
  getMonthlyProductivity() {
    this.isCommittedHoursNull = false;
    this.monthlyProductivityLoading = true;
    this.isMonthlyProductivityDataEmpty = true;
    let filters = {
      project_id: this.localStorageService.getItem('userdata').project_id,
      period: this.filters.monthTextWithYear,
      vertical: this.mpFilters.vertical,
      engagement_type: this.filterTabs.selectedTab.index
    };
    this.monthlyProductivityData.Committedhours = 0;
    this.monthlyProductivityData.Jobhours = 0;
    this.monthlyProductivityData.overheadshours = 0;
    this.monthlyProductivityData.Overheads = 0;
    this.mpConfig = ChartJS.defaultConfig('bar');
    this.chartDataService.getMonthlyProductivity(filters).subscribe({
      next: (res: any) => {

        if (res.status) {
          if (res.data.mp && res.data.mp.length > 0) {

            const mpc = res.data.mp[0];
            const cc = res.data.comparitive;
            this.isMonthlyProductivityDataEmpty = false;
            if (!mpc.Committedhours || mpc.Committedhours == undefined || mpc.Committedhours == null) this.isCommittedHoursNull = true;

            this.monthlyProductivityData.Committedhours = (mpc.Committedhours) ? this.convertTimeToHours(mpc.Committedhours) : 0;
            this.monthlyProductivityData.Jobhours = (mpc.Jobhours) ? this.convertTimeToHours(mpc.Jobhours) : 0;
            this.monthlyProductivityData.overheadshours = (mpc.overheadshours) ? this.convertTimeToHours(mpc.overheadshours) : 0;
            this.monthlyProductivityData.Overheads = (mpc.Overheads) ? this.convertTimeToHours(mpc.Overheads) : 0;

            this.comparitiveData = res.data.comparitive;

            let datasets: any = [];
            let cDatasets: any[] = [];

            let l: any = ['Committed Hours', 'Job Hours'];
            if (this.getVisibilityRule('visibility_monthly_productivity_overheads')) l.push('Overheads');
            if (this.getVisibilityRule('visibility_monthly_productivity_idle_hours')) l.push('Idle Hours');

            let labels = l;
            let cLabels: string[] = [];
            let customComparitiveLabels: string[] = [];

            let d = [
              this.monthlyProductivityData.Committedhours,
              this.monthlyProductivityData.Jobhours
            ];
            if (this.getVisibilityRule('visibility_monthly_productivity_overheads')) d.push(this.monthlyProductivityData.overheadshours);
            if (this.getVisibilityRule('visibility_monthly_productivity_idle_hours')) d.push(this.monthlyProductivityData.Overheads);

            datasets.push({
              backgroundColor: ['#DC3812', '#2E68CB', '#0E9718', '#FB9B05'],
              data: d,
              barThickness: 70
            });



            let cData: any[] = [];
            this.comparitiveData.forEach(c => { cData.push(this.convertTimeToHours(c.Jobhours)) });
            this.comparitiveData.forEach(c => {
              customComparitiveLabels.push(
                (c.Jobhours) ? this.splitToHoursAndMinutes(c.Jobhours) : '00:00'
              );
              cLabels.push(c.Month);
            });

            cDatasets.push({
              backgroundColor: ['#2E68CB', '#4179d9', '#98bcf9', '#b6cffa'],
              data: cData,
              barThickness: 70
            });

            this.mpConfig.type = this.wfChartType;
            let barChart: BarChartData = DefaultChart.defaultBarChart();
            barChart.labels = labels;
            barChart.datasets = datasets;

            this.ccConfig.type = this.wfChartType;
            let cBarChart: BarChartData = DefaultChart.defaultBarChart();
            cBarChart.labels = cLabels;
            cBarChart.datasets = cDatasets;

            this.mpConfig.type = this.monthlyProductivity_ChartType;
            let customLables = [
              (mpc.Committedhours) ? this.splitToHoursAndMinutes(mpc.Committedhours) : '00:00',
              (mpc.Jobhours) ? this.splitToHoursAndMinutes(mpc.Jobhours) : '00:00'
            ];

            if (mpc.overheadshours) {
              if (this.getVisibilityRule('visibility_monthly_productivity_overheads')) {
                customLables.push(this.splitToHoursAndMinutes(mpc.overheadshours));
              }
            } else customLables.push('00:00')


            if (mpc.Overheads) {
              if (this.getVisibilityRule('visibility_monthly_productivity_idle_hours')) {
                customLables.push(this.splitToHoursAndMinutes(mpc.Overheads));
              }
            } else customLables.push('00:00')

            this.mpConfig.data = {
              ...barChart as BarChartData,
              customLabel: true,
              customLabels: customLables
            };




            this.ccConfig.data = {
              ...cBarChart as BarChartData,
              customLabel: true,
              customLabels: customComparitiveLabels
            };
          }
        }
        if (res.comparitive) {

        }

        this.monthlyProductivityLoading = false;
        this.refreshChart(4);
      },
      error: (err: any) => {
        this.monthlyProductivityLoading = false;
        this.isMonthlyProductivityDataEmpty = true;
      }
    });
  }



  splitToHoursAndMinutes(value: string) {
    if (value.split(':').length >= 1) {
      return `${value.split(':')[0]}:${value.split(':')[1]}`;
    }
    else return value;
  }

  convertTimeToHours(timeString: string) {
    // Split the timeString into hours, minutes, and seconds
    const time = (timeString) ? timeString : '00:00:00';
    let [hours, minutes, seconds] = time.split(':').map(Number);

    if (isNaN(seconds)) {
      seconds = 0; // Default seconds to 0 if not provided
    }


    // Calculate the total hours
    const totalHours = hours + minutes / 60 + seconds / 3600;

    return totalHours;
  }

  // For Monthly Dashboard
  // get Budget vs. Actual From Service
  getBudgetVsActual() {
    this.budgetVsActualLoading = true;
    this.isBudgetVsActualDataEmpty = true;
    this.budgetVsActualData = [];

    let filters = {
      project_id: this.localStorageService.getItem('userdata').project_id,
      period: this.filters.monthTextWithYear,
      contract_type: this.filterTabs.selectedTab.index,
      vertical: this.bvaFilters.vertical
    };
    this.chartDataService.getBudgetVsActual(filters).subscribe({
      next: (res: any) => {
        if (res) {
          this.budgetVsActualData = res;
          this.isBudgetVsActualDataEmpty = false;
        }
        this.budgetVsActualLoading = false;
      },
      error: (err: any) => {
        this.budgetVsActualLoading = false;
        this.isBudgetVsActualDataEmpty = true;
      }
    });
  }

  getLastAgreedUploadedMonth() {
    const body = {
      project_id: this.localStorageService.getItem('userdata').project_id,
      year: new Date().getFullYear()
    };
    this.chartDataService.getAgreedLastThreeMonthData(body).subscribe((res: any) => {
      this.agreedMonthData = res;

    });
  }

  // For Monthly Dashboard
  // get Agreed Jobs From Service
  getAgreedLastThreeMonthDataFromService() {
    this.isAgreedJobsLoading = true;
    const month1 = (this.filters.month - 1 >= 0) ? this.allMonths[this.filters.month - 1].name : 'January';
    const month2 = (this.filters.month - 2 >= 0) ? this.allMonths[this.filters.month - 2].name : '';
    const month3 = (this.filters.month - 3 >= 0) ? this.allMonths[this.filters.month - 3].name : '';

    const body = {
      project_id: this.localStorageService.getItem('userdata').project_id,
      month: month1,
      month1: month1,
      month2: month2,
      month3: month3,
      year: this.selectedYear
    };

    this.chartDataService.getAgreedLastThreeMonthData(body).subscribe({
      next: (res: any) => {
        this.isAgreedJobsLoading = false;
        if (res.status) {
          this.agreedMonthData = res.months;
          this.agreedJobs = res.jobs;
        }
      },
      error: (err: any) => {
        this.agreedMonthData = [];
        this.agreedJobs = [];
        this.isAgreedJobsLoading = false;
      }
    });
  }

  // For Monthly Dashboard
  // get Agreed Jobs From Service
  getAgreedJobsFromService() {
    const body = {
      project_id: this.localStorageService.getItem('userdata').project_id,
      month: this.filters.monthText
    };
    this.chartDataService.getAgreedJobStatus(body).subscribe((res: any) => {
      this.agreedJobs = res;
      // this.monthsToShow = [
      //   {index: 12, name: "December"}
      // ];
    });
  }

  convertDateString(dateString: string): Date | null {
    const formats = ['dd-MM-yyyy', 'dd.MM.yyyy', 'dd/MM/yyyy'];
    let parsedDate: Date | null = null;

    formats.forEach(format => {
      const formattedDate = formatDate(dateString, format, 'en-US');
      if (formattedDate) {
        parsedDate = parse(formattedDate, 'dd-MM-yyyy', new Date());
      }
    });

    return parsedDate;
  }

  // WORKFLOW STATUS
  getWFStatusFromService() {
    this.chartDataService.getWorkflowStatus(this.filters).subscribe((res: any) => {
      const chartData = res;



      const labels = chartData[0].map((item: any) => {
        return item.Status;
      });

      const counts = chartData[0].map((item: any) => {
        return item.Count;
      });

      const backgroundColors = ["#FFA600", "#FF562F", "#37CB89", "#2FC1FF"];
      const backgrounds = chartData[0].map((item: any, index: number) => {
        return backgroundColors[Math.floor(Math.random() * backgroundColors.length)];
      });

      const data: any[] = [];
      data.push({
        label: "Workflow Status",
        backgroundColor: backgroundColors,
        borderRadius: 5,
        data: counts,
        legend: {
          display: false
        }
      });

      this.wfConfig.type = this.wfChartType;
      this.barChart.labels = labels;
      this.barChart.datasets = data;
      this.wfConfig.data = { ...this.barChart as BarChartData };



      this.refreshChart(1);
    });
  }

  getToAStatusFromService(duration = this.durations[0].index) {
    let body = {
      project_id: this.localStorageService.getItem('userdata').project_id,
      intervalId: duration
    };
    this.chartDataService.getToAStatus(body).subscribe((res: any) => {

      const chartData = res;

      const backgroundColors = ["#FFA600", "#FF562F", "#37CB89", "#2FC1FF"];
      const backgrounds = chartData[0].map((item: any, index: number) => {
        return backgroundColors[Math.floor(Math.random() * backgroundColors.length)];
      });

      const data = {
        labels: chartData[0].map((item: any) => item.Month),
        datasets: [
          {
            label: 'Closed jobs',
            data: chartData[0].map((item: any) => item.ClosedJobs),
            fill: false,
            borderColor: '#5CA9FF',
            tension: 0.1
          },
          {
            label: 'Near to close',
            data: chartData[0].map((item: any) => item.NearToClose),
            fill: false,
            borderColor: '#FB896B',
            tension: 0.1
          }
        ]
      };

      this.toaConfig.data = data as unknown as LineChartData;


      this.refreshChart(2);
    });
  }

  // Get Jobs Flow ThroughPut Ratio
  getJFTStatusFromService(duration = this.durations[0].index) {
    let body = {
      project_id: this.localStorageService.getItem('userdata').project_id,
      intervalId: duration
    };
    this.chartDataService.getJFTStatus(body).subscribe((res: any) => {

      const chartData = res;

      const backgroundColors = ["#FFA600", "#FF562F", "#37CB89", "#2FC1FF"];
      const backgrounds = chartData[0].map((item: any, index: number) => {
        return backgroundColors[Math.floor(Math.random() * backgroundColors.length)];
      });


      const data = {
        labels: chartData[0].map((item: any) => item.Month),
        datasets: [
          {
            label: "Received Jobs",
            data: chartData[0].map((item: any) => item.ReceivedCount),
            backgroundColor: '#2FC1FF', // Adjust the color as needed
            borderRadius: 100,
            borderColor: '#2FC1FF', // Adjust the color as needed
            borderWidth: 1
          },
          {
            label: "Completed Jobs",
            data: chartData[0].map((item: any) => item.CompletedCount),
            borderRadius: 100,
            backgroundColor: '#37CB89', // Adjust the color as needed
            borderColor: '#37CB89', // Adjust the color as needed
            borderWidth: 1
          },
          {
            label: "Percentage",
            data: chartData[0].map((item: any) => item.ThroughPut),
            borderRadius: 100,
            backgroundColor: '#FFA600', // Adjust the color as needed
            borderColor: '#FFA600', // Adjust the color as needed
            borderWidth: 1
          }
        ]
      };

      this.jftConfig.data = data as BarChartData;


      this.refreshChart(3);
    });
  }

  getJobStatus() {
    this.jobStatusFilter.project_id = this.localStorageService.getItem('userdata').project_id;
    this.jobStatusFilter.contractType = this.filterTabs.selectedTab.index + 1;

    this.chartDataService.getJobStatusByContract(this.jobStatusFilter).subscribe((res: any) => {
      this.jobStatus = res;
    });
  }

  handleFilterDashboardTypeTab(event: any) {
    this.filterDashboardType.selectedTab = event;
    if (event.index == this.filterDashboardType.legends.JOB_MOVEMENT || event.index == this.filterDashboardType.legends.MONTHLY_CONNECT || event.index == this.filterDashboardType.legends.REALTIME) this.refreshAllCharts();
    else this.isTouchPointsLoaded = false;
  }

  handleFilterJobMovementTab(event: any) {
    this.filterJobMovementTabs.selectedTab = event;
  }

  handleFilterTab(event: any) {
    this.filterTabs.selectedTab = event;
    this.workflowFilter.filterType = event.index;
    this.jobStatusFilter.contractType = event.index;

    this.setVerticals();

    if (event.index == 2) {
      let sdate = new Date(new Date().getFullYear(), 0, 1);
      let edate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

      this.sDateText = `${sdate.getFullYear()}-${sdate.getMonth()}-${sdate.getDate()}`;
      this.eDateText = `${sdate.getFullYear()}-${sdate.getMonth()}-${edate.getDate()}`;

      this.filters.startDate = sdate;
      this.filters.endDate = edate;
    } else if (event.index == 3) {
      let sdate = new Date(new Date().getFullYear(), 6, 1);
      let edate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

      this.sDateText = `${sdate.getFullYear()}-${sdate.getMonth()}-${sdate.getDate()}`;
      this.eDateText = `${sdate.getFullYear()}-${sdate.getMonth()}-${edate.getDate()}`;

      this.filters.startDate = sdate;
      this.filters.endDate = edate;

      this.refreshAllCharts();
    }
  }

  getFirstDateLastDateMonthText(event: any) {
    const firstDay: Date = new Date(this.selectedYear, event.index - 1, 1);
    const lastDay: Date = new Date(this.selectedYear, event.index, 0);
    const month = firstDay.getMonth() + 1;
    const monthText = this.allMonths.filter((item: any) => item.index == (month))[0].name;
    const monthTextWithYear = `${(month < 10) ? '0' + month : month}-${firstDay.getFullYear()}`;
    return { firstDay: firstDay, lastDay: lastDay, monthText: monthText, month: month, monthTextWithYear: monthTextWithYear };
  }

  handleMonthChange(event: any) {
    this.jobStatusFilter.period = this.getFirstDateLastDateMonthText(event).monthText;
    this.filters.month = this.getFirstDateLastDateMonthText(event).month;
    this.filters.monthText = this.getFirstDateLastDateMonthText(event).monthText;
    this.filters.monthTextWithYear = this.getFirstDateLastDateMonthText(event).monthTextWithYear;

    this.filters.startDate = this.getFirstDateLastDateMonthText(event).firstDay;
    this.filters.endDate = this.getFirstDateLastDateMonthText(event).firstDay;
    this.refreshAllCharts();
  }

  handleYearChange(event: number) {
    this.selectedYear = event;
    if (this.selectedYear > 2023) {
      this.monthsToShow = this.allMonths;
    } else {
      // this.monthsToShow = [
      //   { index: 9, name: 'September' },
      //   { index: 10, name: 'October' },
      //   { index: 11, name: 'November' },
      //   { index: 12, name: 'December' },
      // ];
    }
    this.refreshAllCharts();
  }

  convertToNgbDate(dt: Date) {
    return new NgbDate(dt.getFullYear(), dt.getMonth(), dt.getDate())
  }

  handleDateChange() {
    // this.filters[type] = new Date(event.timeStamp);
    this.setLocalStorageFilters();
  }

  setLocalStorageFilters() {
    localStorage.setItem('chartfilters', JSON.stringify(this.filters));
  }

  filterBarChart() {
    this.hideIndex.next(1);
  }

  refreshChart(type: number) {
    if (type == 1) {
      this.revalidate.next(!this.revalidate.value);
      this.wfRefresh.next(!this.wfRefresh.value);
      this.jsRefresh.next(!this.jsRefresh.value);
    }
    else if (type == 2) {
      this.revalidate.next(!this.revalidate.value);
      this.toaRefresh.next(!this.toaRefresh.value);
    }
    else if (type == 3) {
      this.revalidate.next(!this.revalidate.value);
      this.jftRefresh.next(!this.jftRefresh.value);
    }
    else if (type == 4) {
      this.revalidate.next(!this.revalidate.value);
      this.mpRefresh.next(!this.mpRefresh.value);
      this.ccRefresh.next(!this.ccRefresh.value);
    }
  }

  captureChartAsImage(id: string) {
    const chartElement = document.getElementById(id); // Replace 'your-chart-id' with the actual ID of your chart element

    html2canvas(chartElement!).then((canvas) => {
      // Convert canvas to data URL
      const chartImage = canvas.toDataURL('image/png');

      // Create a download link
      const a = document.createElement('a');
      a.href = chartImage;
      a.download = 'chart.png'; // Set the desired file name

      // Trigger a click event to initiate the download
      a.click();
    });
  }

  parseInt(value: string) {
    return parseInt(value);
  }

  parseDate(event: Event, type: "start" | "end", value: string) {
    const newDate = new Date(value);
    if (type == "start") this.filters.startDate = newDate;
    else if (type == "end") this.filters.endDate = newDate;
    this.setLocalStorageFilters();

    return new Date(value);
  }

  checkDates() {




    if (this.filters.startDate > this.filters.endDate) {

      this.showDateError = true;
    } else this.showDateError = false;
  }

  getUser() {
    this.chartDataService.getUser().subscribe((res: any) => {

    });
  }

  findVerticalNameByIndex(index: number): string | undefined {
    const vertical = this.verticals.find(v => v.index === index);
    return vertical ? vertical.name : '';
  }

  getRulesByClient() {
    this.rules = [];
    this.isFetchingRules = true;
    const body = {
      client_id: this.localStorageService.getItem('userdata').company_id,
      vertical_id: this.mpFilters.vertical,
      dashboard_id: this.filterDashboardType.selectedTab.index
    };
    this.rulesService.getRulesByClient(body).subscribe({
      next: (res: any) => {
        this.isFetchingRules = false;
        // this.sections = JSON.parse(res.data.rules.rule);
        try {
          if (res.data && res.data.rules) this.rules = JSON.parse(res.data.rules.rules);
        } catch (error) {

        }
        // this.applyRules();
        this.isRulesApplied = true;

      },
      error: (error: any) => {
        this.isFetchingRules = false;
        this.toastService.show('Some error occured while fetching app settings. Please refresh the page again.', 'Settings error', 'warning', true);
      }
    });
  }

  getVisibilityRule(rule: string) {
    if (this.rules.length > 0) {
      const index = this.getRuleIndex(rule);
      if (index > -1) return (this.rules[this.getRuleIndex(rule)][rule] == '1');
      else return true;
    } else return true;
  }

  getRuleIndex(rule: string) {
    const keys = this.rules.map(function (o) { return Object.keys(o)[0] });
    const index = keys.findIndex(k => k == rule);
    return index;
  }


  getRuleBySection(id: string) {
    if (this.sections.length > 0) {
      const rule = this.sections.filter((section: any) => section.id == id)[0];
      return rule.rules[0].value;
    } else {
      return "1";
    }
  }

  applyRules() {
    try {
      this.hiddenSections = [];
      this.hiddenTableColumns = [];
      this.sections.forEach(rule => {
        let sectionVisibleRule = rule.rules.filter(rule => (rule.type == 'visibility' && rule.target == 'section'));
        if (sectionVisibleRule.length > 0) {
          if (sectionVisibleRule[0].value === '0') {
            this.hiddenSections.indexOf(rule.id) === -1 ? this.hiddenSections.push(rule.id) : false;
          }
        }

        let columnVisibleRule = rule.rules.filter(rule => (rule.type == 'visibility' && rule.target == 'table-column'));
        if (columnVisibleRule.length > 0) {
          columnVisibleRule.forEach(column => {
            if (column.value === '0') {
              this.hiddenTableColumns.indexOf({ table: rule.id, column: column.id }) === -1 ? this.hiddenTableColumns.push({ table: rule.id, column: column.id }) : false;
            }
          })
        }
      });
      this.isRulesApplied = true;
    } catch (error) {
      this.toastService.show('Some error occured while applying app settings. Please refresh the page again.', 'Settings error', 'warning', true);
    }
  }

  hideTableColumn(column: string, table: string) {
    const hidden = this.hiddenTableColumns.filter(item => (item.table == table && item.column == column));
    return (hidden.length > 0);
  }
}