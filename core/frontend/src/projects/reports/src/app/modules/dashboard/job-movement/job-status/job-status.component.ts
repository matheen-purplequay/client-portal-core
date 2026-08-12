import { DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import * as moment from 'moment';
import { PaginationInstance } from 'ngx-pagination';
import { ToastService } from 'pq-ui';
import { Clients, Client } from 'projects/reports/src/app/models/client';
import { MonthType, CommonDataTypes } from 'projects/reports/src/app/models/common-data-types';
import { CommentCode, Job, JobData } from 'projects/reports/src/app/models/jobs';
import { LocalStorageService } from 'projects/reports/src/app/services/app/storage/local-storage.service';
import { DateService } from 'projects/reports/src/app/services/app/utilities/date.service';
import { LoginService } from 'projects/reports/src/app/services/authentication/login.service';
import { JobStatusService } from 'projects/reports/src/app/services/dashboard/job-status/job-status.service';
import { JobMovementService } from 'projects/reports/src/app/services/dashboard/movement/job-movement.service';
import { ClientService } from 'projects/reports/src/app/services/entities/client.service';
import { CommentsService } from 'projects/reports/src/app/services/entities/comments.service';
import { DashboardSettingLables, Settings } from 'projects/reports/src/environments/settings';

@Component({
  selector: 'app-job-status',
  templateUrl: './job-status.component.html',
  styleUrls: ['./job-status.component.scss']
})
export class JobStatusComponent implements OnInit {

  @Input() isContractsLoading: boolean = false;
  public pgiJobStatus: PaginationInstance = {
    id: 'custom',
    itemsPerPage: 10,
    currentPage: 1
  };

  jobs: JobData[] = [];
  originalJobs: JobData[] = [];
  job: JobData = Job.defaultJob();
  isJobsLoading: boolean = false;
  isJobsLoaded: boolean = false;
  isExportingJobStatus: boolean = false;
  jobSearchTerm: string = '';
  toggleNewView: boolean = false;

  allMonths: MonthType[] = CommonDataTypes.getAllMonthsWithIndex();
  currentYear = new Date().getFullYear();
  showDateError = false;
  currentMonth = new Date().getMonth();
  currentMonthText = this.allMonths.filter(month => month.index == ((this.currentMonth == 0) ? 1 : this.currentMonth))[0].name;
  currentDate = new Date().getDate();
  startYear: number = 2023;
  availableYears: number[] = Array.from({ length: this.currentYear - this.startYear + 1 }, (_, index) => this.startYear + index);
  selectedYear: number = (this.currentMonth == 0) ? this.availableYears[this.availableYears.length - 2] : this.availableYears[this.availableYears.length - 1];

  views = {
    tableView: { index: 1, label: '<span class="material-symbols-rounded">table</span>' },
    jobView: { index: 2, label: '<span class="material-symbols-rounded">transition_slide</span>' }
  };

  filterView = {
    list: Object.values(this.views),
    selectedView: this.views.tableView
  };

  dateInterval: 'today' | 'currentWeek' | 'lastWeek' | 'currentMonth' | 'lastMonth' | 'currentQuarter' | 'lastQuarter' | 'lastSixMonths' | 'currentYear' | 'lastYear' = 'today';
  f_Days = {
    today: { index: 'today', label: 'Today' },
    this_Week: { index: 'currentWeek', label: 'This Week' },
    last_Week: { index: 'lastWeek', label: 'Last Week' },
    this_Month: { index: 'currentMonth', label: 'This Month' },
    last_Month: { index: 'lastMonth', label: 'Last Month' },
    this_Quarter: { index: 'currentQuarter', label: 'Current Quarter' },
    last_Quarter: { index: 'lastQuarter', label: 'Last Quarter' },
    last_Six_months: { index: 'lastSixMonths', label: 'Last Six Months' },
    this_year: { index: 'currentYear', label: 'Current Year' },
    q1: { index: 'q1', label: 'Q1' },
    q2: { index: 'q2', label: 'Q2' },
    q3: { index: 'q3', label: 'Q3' },
    q4: { index: 'q4', label: 'Q4' },
    last_year: { index: 'previousYear', label: 'Previous Year' },
    custom: { index: 'custom', label: 'Custom Range' },
    all_Jobs: { index: 'all', label: 'All' }
  };

  filterDays = {
    list: Object.values(this.f_Days),
    selectedDays: this.f_Days.all_Jobs,
    keys: { key: 'index', value: 'label' }
  };

  filterJY: { list: any[], selectedDays: any, selectedCustomDate: any, filterDate: any, keys: { key: string, value: string } } = {
    list: Object.values(this.f_Days),
    selectedDays: this.f_Days.all_Jobs,
    selectedCustomDate: {
      startDate: new Date(),
      endDate: new Date(),
      isCustom: false
    },
    filterDate: {
      startDate: '',
      endDate: ''
    },
    keys: { key: 'index', value: 'label' }
  };

  filterFY: { list: any[], selectedFY: number } = {
    list: [], 
    selectedFY: new Date().getFullYear()
  };

  filterWeekDays: { list: string[], selectedDay: string } = {
    list: [],
    selectedDay: `${(new Date().getDate() < 10) ? '0' + new Date().getDate() : new Date().getDate()}-${(new Date().getMonth() < 10) ? '0' + new Date().getMonth() : new Date().getMonth()}-${new Date().getFullYear()}`
  };

  priorityWeeks = {
    weekly: { index: 1, value: 'Previous Weeks' },
    current: { index: 2, value: 'Current Week' }
  };

  filterPriorityWeeks = {
    list: Object.values(this.priorityWeeks),
    selectedFilter: this.priorityWeeks.current,
    keys: { key: 'index', value: 'value' }
  };

  inboxViewList = {
    default: { index: -1, label: 'Default', hide: true },
    details: { index: 0, label: 'Info', hide: false, data: { id: 'jobDetails' } },
    instuctions: { index: 1, label: 'Instructions', hide: false, data: { id: 'jobInstructions' }},
    feedback: { index: 2, label: 'Feedback', hide: false, data: { id: 'jobFeedback' } },
    rating: { index: 3, label: 'Rating', hide: false, data: { id: 'jobRating' } },
    // queries: { index: 4, label: 'Queries', hide: false, data: { id: 'jobQueries' } },
  };

  inboxViews: { list: any[], selectedView: any } = {
    list: Object.values(this.inboxViewList),
    selectedView: this.inboxViewList.instuctions
  };

  user: any;

  newJobStatusFilter = {
    0: { index: 0, label: 'All', code: 'All' },
    1: { index: 1, label: 'In Progress', code: 'In Progress' },
    2: { index: 2, label: 'Queries', code: 'Queries' },
    3: { index: 3, label: 'Workpapers', code: 'Workpapers' },
    4: { index: 4, label: 'Workpapers Changes Required', code: 'WP Change Req' }
  };

  newFilterJobStatus = {
    list: Object.values(this.newJobStatusFilter),
    selectedJobStatus: this.newJobStatusFilter[0],
    keys: { key: 'index', value: 'label' }
  };

  // jobStatusFilter = {
  //   0: { index: 0, label: 'All Status', code: 'All', length: 0 },
  //   1: { index: 1, label: 'Not Yet Taken', code: 'Nt Yet Taken', length: 0 },
  //   2: { index: 2, label: 'In Progress Initial', code: 'In Prog Intl', length: 0 },
  //   3: { index: 3, label: 'Awaiting Queries - Initial', code: 'Awt Queries Intl', length: 0 },
  //   4: { index: 4, label: 'In Progress Final', code: 'In Prog Final', length: 0 },
  //   5: { index: 5, label: 'Awaiting Queries Final', code: 'Awt Queries Final', length: 0 },
  //   6: { index: 6, label: 'Workpapers Completed Initial', code: 'WP Comp Intl', length: 0 },
  //   7: { index: 7, label: 'Workpapers Completed Final', code: 'WP Comp Final', length: 0 },
  //   8: { index: 8, label: 'Workpapers Changes Required', code: 'WP Changes Req', length: 0 },
  //   9: { index: 9, label: 'Moved to Audit', code: 'Moved to Audit', length: 0 }
  // };

  filterJobStatus: {
    list: { Id: number, Name: string, ShortName: string, Count: number }[],
    selectedJobStatus: { Id: number, Name: string, ShortName: string, Count: number },
    isJobsStatusCountLoading: boolean
  } = {
    list: [],
    selectedJobStatus: { Id: 0, Name: '', ShortName: '', Count: 0 },
    isJobsStatusCountLoading: true
  };

  dropDownComments: {
    list: CommentCode[],
    selectedComment: CommentCode,
    keys: { key: string, value: string }
  } = {
      list: [],
      selectedComment: CommentCode.defaultCommentCode(),
      keys: { key: 'code', value: 'title' }
    };
  isCustomInstruction: boolean = false;
  isCommentCodesLoading: boolean = false;
  isCommentCodesLoaded: boolean = false;

  sortedColumn = '';
  isAsc = true;

  // MAKE SURE TO REPLICATE CHANGES IN COLUMNS TO PRIORITYCOLUMNS IF NEEDED
  columns = [
    { code: 'sno', title: 'S.No', sortable: false, class: '' },
    { code: 'JobId', title: 'Id', sortable: true, class: '' },
    { code: 'JobName', title: 'Name', sortable: true, class: '' },
    { code: 'SubClientName', title: 'Sub Client', sortable: true, class: '' },
    // { code: 'ClientContact', title: 'Contact', sortable: true, class: '' },
    { code: 'FinancialYear', title: 'FY', sortable: false, class: '' },
    { code: 'Datereceived', title: 'JY', sortable: true, class: '' },
    // { code: 'LastTouch', title: 'Last Touch', sortable: true, class: '' },
    { code: 'Status', title: 'Current Touch', sortable: true, class: '' },
    { code: 'Elapseddate', title: 'Elp. Days', sortable: true, class: '' },
    { code: 'commentcode', title: 'Instructions', sortable: false, class: '' },
    { code: 'feedbackcode', title: 'Feedback', sortable: false, class: 'text-center' },
    { code: 'ratingcode', title: 'Rating', sortable: false, class: 'text-center' },
  ];

  priorityTableColumns = [
    { code: 'sno', title: 'S.No', sortable: false, class: '' },
    { code: 'JobId', title: 'Id', sortable: true, class: '' },
    { code: 'Priority', title: 'Priority', sortable: true, class: '' },
    { code: 'JobName', title: 'Name', sortable: true, class: '' },
    { code: 'SubClientName', title: 'Sub Client', sortable: true, class: '' },
    // { code: 'ClientContact', title: 'Contact', sortable: true, class: '' },
    { code: 'FinancialYear', title: 'FY', sortable: false, class: '' },
    { code: 'Datereceived', title: 'JY', sortable: true, class: '' },
    { code: 'LastTouch', title: 'Prev. Touch', sortable: true, class: '' },
    { code: 'Status', title: 'Current Touch', sortable: true, class: '' },
    { code: 'Reviewer', title: 'Reviewer', sortable: true, class: '' },
    { code: 'Elapseddate', title: 'Elp. Days', sortable: true, class: '' },
    { code: 'commentcode', title: 'Instructions', sortable: false, class: '' },
    { code: 'feedbackcode', title: 'Feedback', sortable: false, class: 'text-center' },
    { code: 'ratingcode', title: 'Rating', sortable: false, class: 'text-center' },
  ];

  nonPriorityColumns = this.columns;


  fetchingJobs: { interval: number, callback: any } = {
    interval: 60000,
    callback: (() => { })
  };

  onlyPriorityJobs: boolean = false;
  isPageRefreshRequired: boolean = false;

  typeOfJobs: "priority" | "all" | "weekly" = "priority";
  priorityJobsAvailable: boolean = false;
  isPriorityMasterLoading: boolean = false;
  priorityMaster: {
    list: { Code: number, Priority: string }[], selectedPriority: { Code: number, Priority: string }, keys: { key: string, value: string }
  } = {
      list: [], selectedPriority: { Code: 0, Priority: "All" },
      keys: { key: 'Code', value: 'Priority' }
    };

  weeklyJobs: any[] = [];
  jobWeeks: any;
  jobKeys: any;
  isFetchingWeeklyJobs: boolean = false;

  totalJobs: number = 0;
  isNoJobID: boolean = false;

  fy = Settings.getAustralianFinancialYear();
  jobStatusSetting = DashboardSettingLables.job_status;

  clientUsers: { list: any[], selectedUser: any, keys: { key: string, value: string } } = {
    list: [],
    selectedUser: undefined,
    keys: { key: 'id', value: 'name' }
  };

  ratingStarFilled = '&#9733;';
  ratingStarUnFilled = '&#9734;';
  loadingText: string = '';
  isJobStatusCountLoading: boolean = false;

  constructor(
    private jobStatusService: JobStatusService,
    private jobMovementService: JobMovementService,
    private localStorageService: LocalStorageService,
    private toastService: ToastService,
    private commentsService: CommentsService,
    private dateService: DateService,
    private clientService: ClientService,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {
    this.user = this.localStorageService.getItem('userdata');
    console.log('userdata ', this.localStorageService.getItem('userdata'));

    if(!this.localStorageService.isItemExists(this.jobStatusSetting.key)) this.setJobStatusSetting();
    else this.jobStatusSetting.setting = this.localStorageService.getItem(this.jobStatusSetting.key);

    if (this.user.is_tester === undefined || this.user.is_tester === null || this.user.is_tester == false) {
      this.priorityTableColumns = this.priorityTableColumns.filter(col => col.code !== 'Reviewer');
    }

    if(this.user.company_id != 6) {
      this.priorityTableColumns = this.priorityTableColumns.filter(item => item.code != 'SubClientName');
      this.nonPriorityColumns = this.nonPriorityColumns.filter(item => item.code != 'SubClientName');
    }

    this.clientUsers.selectedUser = this.localStorageService.getItem('wm_user');

    this.setupAmbience();
  }
  
  setupAmbience() {
    this.onlyPriorityJobs = this.jobStatusSetting.setting.isPriority;
  
    this.getPriorityMaster();
    this.setOnlyPriority();

    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 (Sunday) to 6 (Saturday)

    // Calculate the starting date of the current week (Monday)
    const weekStart = new Date(today.setDate(today.getDate() - dayOfWeek));

    // Add dates for the entire week (Monday to Sunday)
    for (let i = 0; i < 7; i++) {
      const newDate = ((weekStart.getDate() + i) < 10) ? `0${weekStart.getDate() + i}` : `${weekStart.getDate() + i}`;
      const newMonth = ((weekStart.getMonth() + i) < 10) ? `0${weekStart.getMonth() + i}` : `${weekStart.getMonth() + i}`;
      const newYear = weekStart.getFullYear();
      this.filterWeekDays.list.push(`${newYear}-${newMonth}-${newDate}`);
    }

    // Set the initially selected day (optional)
    this.filterWeekDays.list.unshift('All');
    this.filterWeekDays.selectedDay = this.filterWeekDays.list[0];

    // this.fetchingJobs.callback = setInterval(() => {
    // }, this.fetchingJobs.interval)
  }

  getClientUserList() {
    this.loadingText = 'Getting client user list...';
    const body = {
      client_id: this.user.company_id
    };
    this.clientService.getClientUsers(body).subscribe((res: any) => {
      if(res.status) {
        this.clientUsers.list = res.data;
        this.clientUsers.selectedUser = res.data[0];
        this.localStorageService.setItem('wm_user', res.data[0]);
        // this.getJobsStatusCount();
        this.getCommentCodes();
      } 
    });
  }

  getJobsStatusCount(refresh: boolean = false) {
    this.isJobStatusCountLoading = true;
    console.log('inside job status count...');
    
    // this.loadingText = 'Retrieving job status metrics...';
    this.filterJobStatus.isJobsStatusCountLoading = true;

    this.jobStatusService.getJobsStatusCount(this.getBodyForJobStatusData()).subscribe({
      next: (res: any) => {
        this.filterJobStatus.isJobsStatusCountLoading = false;
        // this.filterJobStatus.list = res.data;
        let allCount = 0;
        this.filterJobStatus.list = [];
        res.data.forEach((element: any, index: number) => {
          if(index != 0) this.filterJobStatus.list.push(element)
        });
        this.filterJobStatus.list.forEach((js, index) => {
          allCount += js.Count;
        });
        this.filterJobStatus.list.unshift({
          Id: 0, Name: 'All', ShortName: 'All', Count: allCount
        });
        this.filterJobStatus.selectedJobStatus = this.filterJobStatus.list[0];
        this.isJobStatusCountLoading = false;
      },
      error: (err: any) => {
        this.filterJobStatus.isJobsStatusCountLoading = false;
        this.toastService.show('Something went wrong while getting job status details. Please contact your administrator with a screenshot.', 'Something went wrong', 'error', true);
      }
    });
  }

  getPriorityMaster() {
    this.loadingText = 'Getting priority list...';
    this.isPriorityMasterLoading = true;
    this.jobStatusService.getPriorityMaster().subscribe((res: any) => {
      if (res && res.status) this.priorityMaster.list = res.data;
      this.priorityMaster.list.unshift({ Code: 0, Priority: 'All' });
      this.priorityMaster.selectedPriority = this.priorityMaster.list[0];
      // if(this.user.role == 'tester' || this.user.is_tester) this.getClientUserList();
      // else {
        // }
      this.isPriorityMasterLoading = false;
      this.getCommentCodes();
    });
  }

  getCommentCodes() {
    this.isCommentCodesLoading = true;
    this.loadingText = 'Organizing filters...';
    this.commentsService.getCommentCodes().subscribe((res: any) => {
      this.isCommentCodesLoaded = true;
      this.isCommentCodesLoading = false;
      this.dropDownComments.list = res.data;
      const all_codes = {
        id: 0,
        code: 0,
        title: "Any Code",
        description: ""
      };
      this.dropDownComments.list.push(all_codes);

      
      this.toggleColumns();
    });
  }

  async getJobs() {
    this.loadingText = 'Getting all jobs...';
    this.isJobsLoading = true;
    this.pgiJobStatus.currentPage = 1;
    this.resetJobs();
    if (this.onlyPriorityJobs) {
      setTimeout(() => {
        this.isPageRefreshRequired = true;
      }, 30000);

      this.jobStatusService.getPriorityJobs(this.getBodyForJobStatusData()).subscribe((res: any) => {
        if (res.status && res.data) {
          this.totalJobs = this.jobs.length;
          if (res.data.length > 0) {
            this.priorityJobsAvailable = true;
            this.jobs = res.data;
            if(this.user.company_id != 6) {
              this.jobs.forEach(job => {
                job.Status = this.getNewStatusName(job.Status)
              });
            }
            this.originalJobs = this.jobs;
            if (this.job.Aid != 0) this.job = this.jobs[0];
          } else {
            this.priorityJobsAvailable = false;
          }
          this.isJobsLoading = false;
          this.isJobsLoaded = true;
        }
        this.getJobsStatusCount();
      }, error => this.toastService.show('Something went wrong. Please try again after few minutes.', 'Something went wrong', 'warning', true));
    }
    else {
      this.jobMovementService.getJobStatus(this.getBodyForJobStatusData()).subscribe((res: any) => {
        this.totalJobs = this.jobs.length;
        if (res.status && res.data) {
          if (res.data.length > 0) {
            this.jobs = res.data;
            let epdays = 0;
            res.data.forEach((e:any) => {
              if(e.Elapseddate <= 0) epdays += 1;
            });
            console.log('elapsed days count === ', epdays);
            if(this.user.company_id != 6) {
              this.jobs.forEach(job => {
                job.Status = this.getNewStatusName(job.Status);
                if(!job.JobId) {
                  this.isNoJobID = true;
                  this.columns = this.columns.filter(c => c.code != 'JobId');
                }
              });
            }
            this.originalJobs = this.jobs;
            if (this.job.Aid != 0) this.job = this.jobs[0];
            
          }
          this.isJobsLoading = false;
          this.isJobsLoaded = true;
        }
        this.getJobsStatusCount();
      }, error => this.toastService.show('Something went wrong. Please try again after few minutes.', 'Something went wrong', 'warning', true));
    }

    if(this.jobs.length > 0) {
          // Get FY Filter Options
          this.filterFY.list = [...new Set(this.jobs.map((item) => item['FinancialYear']))];
          this.filterFY.list.sort((a, b) => b - a);
          this.filterFY.selectedFY = this.filterFY.list[0];
    }
  }

  toggleRating() {
    // HARD CODED RULES TO HIDE RATING FOR SPECIFIC JOB STATUS AND AID
    if(!this.job.Status.toLowerCase().includes('9.') && !this.job.Status.toLowerCase().includes('6.') && this.job.Aid !== 249473)
      this.inboxViewList.rating.hide = true; 
    else
      this.inboxViewList.rating.hide = false;

    this.inboxViews.list = Object.values(this.inboxViewList);
  }

  showJobDetailsPopup(job: JobData, instructions: any) {
    this.job = job;
    this.toggleRating();
    this.inboxViews.selectedView = this.inboxViewList.details;
    this.loadAllJobDetails(instructions);
  }

  showJobInstructionsPopup(job: JobData, ele: any) {
    this.job = job;
    this.toggleRating();
    this.inboxViews.selectedView = this.inboxViewList.instuctions;
    // ele.getComments(this.job);
    this.loadAllJobDetails(ele);
  }

  showJobFeedback(job: JobData) {
    this.job = job;
    console.log('selected job = ', job, this.job);
    this.toggleRating();
    this.inboxViews.selectedView = this.inboxViewList.feedback;
  }

  showJobRating(job: JobData) {
    this.job = job;
    this.toggleRating();
    this.inboxViews.selectedView = this.inboxViewList.rating;
  }

  loadAllJobDetails(ele: any) {
    try {
      ele.resetComment();
      ele.getComments(this.job);
      // ele.loadFeedbackComments();
    } catch (e) {

    }
  }

  handleJobPopupTabs(event: any) {
    this.inboxViews.selectedView = event;
  }

  toggleColumns() {
    if (this.onlyPriorityJobs) {
      this.columns = this.priorityTableColumns;
      // this.dropDownComments.selectedComment = this.dropDownComments.list.filter(code => code.code == 200)[0];
    }
    else {
      this.columns = this.nonPriorityColumns;
      // this.dropDownComments.selectedComment = this.dropDownComments.list.filter(code => code.code == 0)[0];
    }
    this.getJobs();
  }

  sortJobs() {
    this.getJobs();
  }

  changeView(view: any, jobComments2: any) {
    jobComments2.comments = [];
    if (this.filterView.selectedView != view) {
      this.toggleNewView = !this.toggleNewView;
      this.filterView.selectedView = view;
      if (this.filterView.selectedView == this.views.jobView) {
        if (this.jobs.length > 0) {
          this.job = this.jobs[0];
          jobComments2.getComments(this.job);
        }
      }
    }
  }

  refreshJobs() {
    if(this.typeOfJobs == "priority" || this.typeOfJobs == "all") {
      this.getJobs();
    } else {
      this.getWeeklyMovement();
    }
  }

  async searchJobByName(searchTerm: string) {
    this.jobSearchTerm = searchTerm;
    
    if (searchTerm && searchTerm != '') this.jobs = this.jobs.filter((job: any) =>
      job.JobName.toLowerCase().includes(searchTerm.toLowerCase())
    );
    else {
      this.jobSearchTerm = '';
      this.jobs = this.originalJobs;
    }
  }

  getBodyForJobStatusData() {
    let startDate = new Date();
    let endDate = new Date();

    if (this.filterDays.selectedDays.index != this.f_Days.all_Jobs.index) {
      startDate = this.dateService.getStartAndEndDate(this.filterDays.selectedDays.index).startDate;
      endDate = this.dateService.getStartAndEndDate(this.filterDays.selectedDays.index).endDate;
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);
    }

    let sDate = ((startDate.getDate()) < 10) ? `0${startDate.getDate()}` : `${startDate.getDate()}`;
    let eDate = ((endDate.getDate()) < 10) ? `0${endDate.getDate()}` : `${endDate.getDate()}`;

    let sMonth = ((startDate.getMonth() + 1) < 10) ? `0${startDate.getMonth() + 1}` : `${startDate.getMonth() + 1}`;
    let eMonth = ((endDate.getMonth() + 1) < 10) ? `0${endDate.getMonth() + 1}` : `${endDate.getMonth() + 1}`;

    let user_id = this.localStorageService.getItem('userdata').user_id;

    if (this.localStorageService.getItem('userdata').client_id) user_id = this.localStorageService.getItem('userdata').client_id;
    
    let body: any = {
      project_id: this.localStorageService.getItem('userdata').project_id,
      comment_code: this.dropDownComments.selectedComment.code,
    };

    if(this.user.role == 'tester' || this.user.is_tester) {
      if (!this.localStorageService.getItem('wm_user')) {
        this.getClientUserList(); 
      }
      this.clientUsers.selectedUser = this.localStorageService.getItem('wm_user');
      body.user_id = this.clientUsers.selectedUser.wm_client_id;
    } else {
      body.user_id = user_id;
    }

    const company_id = this.localStorageService.getItem('userdata').company_id;

    if(company_id == 6) {
      body.job_status = this.filterJobStatus.selectedJobStatus.Id;
    } else {
      body.job_status = this.newFilterJobStatus.selectedJobStatus.index;
    }

    if (this.onlyPriorityJobs) {
      body.priority_code = this.priorityMaster.selectedPriority.Code;
      body.all = (this.filterWeekDays.selectedDay == 'All') ? 1 : 0;
      if (this.filterWeekDays.selectedDay == 'All') {
        body.start_date = `${startDate.getFullYear()}-${sMonth}-${sDate}`;
        body.end_date = `${endDate.getFullYear()}-${eMonth}-${eDate}`;
      } else {
        body.start_date = this.filterWeekDays.selectedDay;
        body.end_date = this.filterWeekDays.selectedDay;
      }
    } else {
      body.all = (this.filterDays.selectedDays.index == this.f_Days.all_Jobs.index) ? 1 : 0;
      body.start_date = `${startDate.getFullYear()}-${sMonth}-${sDate}`;
      body.end_date = `${endDate.getFullYear()}-${eMonth}-${eDate}`;
    }

    // this.setCustomJYDate();
    console.log('job dates === ', this.filterJY);
    body.jobStartDate = this.filterJY.filterDate.startDate;
    body.jobEndDate = this.filterJY.filterDate.endDate;

    return body;
  }

  async handleFilterPriorityWeeks(event: any) {
    this.filterPriorityWeeks.selectedFilter = event;
    this.jobSearchTerm = '';
    if (this.filterPriorityWeeks.selectedFilter == this.priorityWeeks.weekly) {
      this.typeOfJobs = "weekly";
      this.getWeeklyMovement();
    } else if(this.filterPriorityWeeks.selectedFilter == this.priorityWeeks.current) {
      this.typeOfJobs = 'priority';
      this.onlyPriorityJobs = true;
      this.getJobs();
    }
  }

  async getWeeklyMovement() {
    this.isFetchingWeeklyJobs = true;
    const year = new Date().getFullYear();
    const month = new Date().getMonth();

    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    let sDate = ((startDate.getDate()) < 10) ? `0${startDate.getDate()}` : `${startDate.getDate()}`;
    let eDate = ((endDate.getDate()) < 10) ? `0${endDate.getDate()}` : `${endDate.getDate()}`;

    let sMonth = ((startDate.getMonth() + 1) < 10) ? `0${startDate.getMonth() + 1}` : `${startDate.getMonth() + 1}`;
    let eMonth = ((endDate.getMonth() + 1) < 10) ? `0${endDate.getMonth() + 1}` : `${endDate.getMonth() + 1}`;

    const start_date = `${year}-${sMonth}-${sDate}`;
    const end_date = `${year}-${eMonth}-${eDate}`;

    this.weeklyJobs = [];
    const body = {
      project_id: this.localStorageService.getItem('userdata').project_id,
      start_date: start_date,
      end_date: end_date
    };
    this.jobStatusService.getWeeklyMovement(body).subscribe((res: any) => {
      this.isFetchingWeeklyJobs = false;
      
      if (res.status && res.data && res.data.length > 0) {
        this.weeklyJobs = res.data;
        this.jobKeys = Object.keys(this.weeklyJobs[0]);
        this.jobWeeks = this.jobKeys.filter((key: any) => { return key.toLowerCase().includes('week') });
        this.totalJobs = this.weeklyJobs.length;
        
      }
    });
  }

  getJobStatusofWeek(week: string, index: number, i: number) {
    let jki = 0;
    for (let i = 0; i < this.jobKeys.length; i++) {
      if (week === this.jobKeys[i]) {
        jki = i;
        break;
      }
    }
  
    jki = jki + 2;
    if(jki <= 0) jki = 0;
    if(jki >= this.jobKeys.length - 1) jki = this.jobKeys.length - 1;
    const w = this.jobKeys[jki];
    if(!this.isWithinCurrentWeek(week)) return this.weeklyJobs[index][w];
    else '-';
  }

  getJobStatusofWeekHeader(week: string) {
    const header = week.split(',');
    if(header.length < 2) 
      return week;
    else {
      let current = '';
      if(header.length >= 2) {
        const sd = parseInt(header[1].split('-')[0]);
        const ed = parseInt(header[2].split('-')[0]);
        const cd = new Date();
        if(cd.getDate() >= sd && cd.getDate() <= ed) current = '(current)';
        else current = '';
      }
      return `
        <div class="small vstack justify-content-center align-items-center">
          <div class="fw-500">${header[0]} ${current}</div>
          <div>${header[1]} - ${header[2]}</div>
        </div>
      `;
    }
  }

  isWithinCurrentWeek(week: string) {
    const header = week.split(',');
    let current = false;
    if(header.length >= 2) {
      const sd = parseInt(header[1].split('-')[0]);
      const ed = parseInt(header[2].split('-')[0]);
      const cd = new Date();
      if(cd.getDate() <= ed){
        current = true;
      } 
      else current = false;
    }
    return current;
  }

  exportJobStatus() {
    this.isExportingJobStatus = true;
    if (this.onlyPriorityJobs)
      this.jobMovementService.exportPriorityJobStatus(this.getBodyForJobStatusData()).subscribe((data: any) => this.dowloadExcel(data));
    else
      this.jobMovementService.exportJobStatus(this.getBodyForJobStatusData()).subscribe((data: any) => this.dowloadExcel(data));
  }

  dowloadExcel(data: any) {
    var downloadURL = window.URL.createObjectURL(data);
    var link = document.createElement('a');
    link.href = downloadURL;
    link.download = "Job_Movement_Export.xlsx";
    link.click();
    this.isExportingJobStatus = false;
  }

  async sortBy(propertyName: string) {
    
    if (this.sortedColumn === propertyName) {
      this.isAsc = !this.isAsc;
    } else {
      this.sortedColumn = propertyName;
      this.isAsc = true;
    }

    this.jobs.sort((a, b) => {
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

  getPriorityCount() {
    return this.jobs.filter(job => job.commentcode === 200).length;
  }

  setOnlyPriority() {
    if (this.onlyPriorityJobs) {
      this.typeOfJobs = "priority";
      this.filterDays.list = [this.f_Days.this_Week, this.f_Days.last_Week];
      this.filterDays.selectedDays = this.f_Days.this_Week;
    }
    else {
      this.typeOfJobs = "all";
      this.filterDays.list = Object.values(this.f_Days)
      this.filterDays.selectedDays = this.f_Days.all_Jobs;
    }
    this.setJobStatusSetting();
  }

  setJobStatusSetting() {
    this.jobStatusSetting.setting.isPriority = this.onlyPriorityJobs;
    this.localStorageService.setItem(this.jobStatusSetting.key, this.jobStatusSetting.setting);
  }

  async resetSearchByJobname() {
    this.jobSearchTerm = '';
    this.jobs = this.originalJobs;
    // this.getJobs();
  }

  resetJobs() {
    this.jobs = [];
  }

  getNewStatusName(oldStatus: string) {
    let newStatus = '';
    if(oldStatus == '5. Awaiting Queries Final' || oldStatus == '3. Awaiting Queries - Initial') newStatus = 'Queries';
    else if(oldStatus == '2. In Progress Initial' || oldStatus == '4. In Progress Final') newStatus = 'In Progress';
    else if(oldStatus == '6. Workpapers Completed Initial' || oldStatus == '7. Workpapers Completed Final') newStatus = 'Workpapers';
    else if(oldStatus == '8. Workpapers Changes Required') newStatus = 'Workpapers Changes Required';
    else newStatus = oldStatus;

    return newStatus;
  }

  async filterNewJobStatus() {
    this.isJobsLoading = true;
    if(this.newFilterJobStatus.selectedJobStatus.index != 0)
      this.jobs = this.originalJobs.filter(job => job.Status == this.newFilterJobStatus.selectedJobStatus.label);
    else 
      this.jobs = this.originalJobs;
    this.isJobsLoading = false;
  }

  // setJYFilter(option: any) {
  //   console.log('selected date option ', option);
  //   this.filterJY.selectedDays = option;
  //   this.isJobsLoaded = false;
  //   if(option.index == 'custom') this.filterJY.selectedCustomDate.isCustom = true;
  //   else this.getJobs();
  // }

  // setCustomJYDate() {
  //   this.filterJY.selectedCustomDate.isCustom = false;
  //   let startDate = this.filterJY.selectedCustomDate.startDate;
  //   let endDate = this.filterJY.selectedCustomDate.endDate;
  //   startDate.setHours(0, 0, 0, 0);
  //   endDate.setHours(0, 0, 0, 0);

  //   let sDate = ((startDate.getDate()) < 10) ? `0${startDate.getDate()}` : `${startDate.getDate()}`;
  //   let eDate = ((endDate.getDate()) < 10) ? `0${endDate.getDate()}` : `${endDate.getDate()}`;

  //   this.filterJY.filterDate.startDate = sDate;
  //   this.filterJY.filterDate.endDate = eDate;

  //   this.getJobs();
  // }

  parseDate(event: Event, type: "start" | "end", value: string) {
    const newDate = new Date(value);
    if (type == "start") this.filterJY.selectedCustomDate.startDate = newDate;
    else if (type == "end") this.filterJY.selectedCustomDate.endDate = newDate;

    return new Date(value);
  }
}
