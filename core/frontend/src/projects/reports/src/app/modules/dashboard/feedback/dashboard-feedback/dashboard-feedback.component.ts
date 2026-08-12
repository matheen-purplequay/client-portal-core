import { Component, OnInit } from '@angular/core';
import { MonthType, CommonDataTypes } from '../../../../models/common-data-types';
import { JobData, Job, JobFeedback } from '../../../../models/jobs';
import { DatePipe } from '@angular/common';
import { ToastService } from 'pq-ui';
import { LocalStorageService } from '../../../../services/app/storage/local-storage.service';
import { DateService } from '../../../../services/app/utilities/date.service';
import { JobStatusService } from '../../../../services/dashboard/job-status/job-status.service';
import { JobMovementService } from '../../../../services/dashboard/movement/job-movement.service';
import { CommentsService } from '../../../../services/entities/comments.service';
import { FeedbackService } from 'projects/reports/src/app/services/dashboard/feedback/feedback.service';
import { feedbackTypesList, filterFeedbackTypesList } from '../models/feedback';
import { PaginationInstance } from 'ngx-pagination';

@Component({
  selector: 'app-dashboard-feedback',
  templateUrl: './dashboard-feedback.component.html',
  styleUrls: ['./dashboard-feedback.component.scss']
})
export class DashboardFeedbackComponent implements OnInit {

  public config: PaginationInstance = {
    id: 'custom',
    itemsPerPage: 10,
    currentPage: 1
  };

  feedback: any[] = [];
  originalFeedbacks: JobFeedback[] = [];
  jobFeedback: JobFeedback = Job.defaultJobFeedback();
  isFeedbacksLoading: boolean = false;
  isFeedbacksLoaded: boolean = false;
  isExportingFeedbacks: boolean = false;

  feedbackComments: any[] = [];
  selectedFeedbackComment: any;
  isLoadingFeedbackComments: boolean = false;

  feedbackSearchTerm: string = '';
  toggleNewView: boolean = false;

  feedbackTypesList = filterFeedbackTypesList;
  feedbackTypes = {
    list: Object.values(this.feedbackTypesList),
    selectedType: this.feedbackTypesList.all,
    keys: { key: 'index', value: 'label' }
  };

  allMonths: MonthType[] = CommonDataTypes.getAllMonthsWithIndex();
  currentYear = new Date().getFullYear();
  showDateError = false;
  currentMonth = new Date().getMonth();
  currentMonthText = this.allMonths.filter(month => month.index == ((this.currentMonth == 0) ? 1 : this.currentMonth))[0].name;
  currentDate = new Date().getDate();
  startYear: number = 2023;
  availableYears: number[] = Array.from({ length: this.currentYear - this.startYear + 1 }, (_, index) => this.startYear + index);
  selectedYear: number = (this.currentMonth == 0) ? this.availableYears[this.availableYears.length - 2] : this.availableYears[this.availableYears.length - 1];

  typeOfJobs: "priority" | "all" | "weekly" = "priority";
  priorityJobsAvailable: boolean = false;
  isPriorityMasterLoading: boolean = false;
  priorityMaster: {
    list: { Code: number, Priority: string }[], selectedPriority: { Code: number, Priority: string }, keys: { key: string, value: string }
  } = {
    list: [], selectedPriority: { Code: 0, Priority: "All" },
    keys: { key: 'Code', value: 'Priority' }
  };

  jobStatusFilter = {
    0: { index: 0, label: 'All Status' },
    1: { index: 1, label: 'Not Yet Taken' },
    2: { index: 2, label: 'In Progress Initial' },
    3: { index: 3, label: 'Awaiting Queries - Initial' },
    4: { index: 4, label: 'In Progress Final' },
    5: { index: 5, label: 'Awaiting Queries Final' },
    6: { index: 6, label: 'Workpapers Completed Initial' },
    7: { index: 7, label: 'Workpapers Completed Final' },
    8: { index: 8, label: 'Workpapers Changes Required' },
    9: { index: 9, label: 'Moved to Audit' }
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
    this_year: { index: 'lastSixMonths', label: 'Current Year' },
    last_year: { index: 'currentYear', label: 'Last Year' },
    all_Jobs: { index: 'all', label: 'All Jobs' },
  };

  filterDays = {
    list: Object.values(this.f_Days),
    selectedDays: this.f_Days.all_Jobs,
    keys: { key: 'index', value: 'label' }
  };

  filterWeekDays: { list: string[], selectedDay: string } = {
    list: [],
    selectedDay: `${(new Date().getDate() < 10) ? '0' + new Date().getDate() : new Date().getDate()}-${(new Date().getMonth() < 10) ? '0' + new Date().getMonth() : new Date().getMonth()}-${new Date().getFullYear()}`
  };

  filterJobStatus = {
    list: Object.values(this.jobStatusFilter),
    selectedJobStatus: this.jobStatusFilter[0],
    keys: { key: 'index', value: 'label' }
  };

  feedbackStatus = {
    open: { index: 1, label: 'Open' },
    closed: { index: 0, label: 'Closed' }
  };

  filterFeedbackStatus = {
    list: Object.values(this.feedbackStatus),
    selectedStatus: this.feedbackStatus.open
  };

  isNewFeedback: boolean = false;
  resolvingFeedback: boolean = false;
  resolvingFeedbackId: number = -1;
  user: any;

  constructor(
    private jobStatusService: JobStatusService,
    private feedbackService: FeedbackService,
    private jobMovementService: JobMovementService,
    private localStorageService: LocalStorageService,
    private toastService: ToastService,
    private commentsService: CommentsService,
    private dateService: DateService,
    private datePipe: DatePipe
  ) { }

  ngOnInit(): void {
    this.user = this.localStorageService.getItem('userdata');
    this.setupAmbiance();
  }

  setupAmbiance() {
    this.getFeedbackStatus();
  }

  getFeedbackStatus() {
    this.isFeedbacksLoading = true;
    const body = {
      user_id: (this.user.is_tester)? this.user.staff_id : this.user.client_id,
      project_id: this.localStorageService.getItem('userdata').project_id,
      start_date: `${new Date().getFullYear()}-${String(new Date().getMonth()).padStart(2, '0')}-01`,
      end_date: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`,
    };
    this.feedbackService.getFeedbackStatus(body).subscribe((res: any) => {
      this.feedback = res.data;
      this.originalFeedbacks = this.feedback;
      this.filterFeedback();
      this.isFeedbacksLoading = false;
      this.isFeedbacksLoaded = true;
    });
  }

  filterFeedback() {
    if(this.filterFeedbackStatus.selectedStatus == this.feedbackStatus.closed) {
      this.feedback = this.originalFeedbacks.filter(fb => fb.FeedbackStatus == 3 || fb.FeedbackStatus == 4);
    } else {
      this.feedback = this.originalFeedbacks.filter(fb => fb.FeedbackStatus != 3 && fb.FeedbackStatus != 4);
    }
  }

  loadFeedbackComments(job: JobFeedback) {
    this.isLoadingFeedbackComments = true;
    this.jobFeedback = job;
    const body = {
      job_id: job.Aid,
      user_id: this.localStorageService.getItem('userdata').client_id
    };
    this.feedbackService.getFeedback(body).subscribe({
      next: (res: any) => {
        this.isLoadingFeedbackComments = false;
        this.feedbackComments = res.data;
        console.log('feedback comments ', this.feedbackComments, res);
      },
      error: (err: any) => {
        this.isLoadingFeedbackComments = false;
      }
    });
  }

  getBodyForFeedbackData() {
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
    if (this.localStorageService.getItem('userdata').partner_id)
      user_id = this.localStorageService.getItem('userdata').partner_id;

    // console.log('in get body for job status ', sDate, eDate);

    let body: any = {
      project_id: this.localStorageService.getItem('userdata').project_id,
      status: this.filterJobStatus.selectedJobStatus.index,
      user_id: user_id
    };
    
    body.all = (this.filterDays.selectedDays.index == this.f_Days.all_Jobs.index) ? 1 : 0;
    body.start_date = `${startDate.getFullYear()}-${sMonth}-${sDate}`;
    body.end_date = `${endDate.getFullYear()}-${eMonth}-${eDate}`;
    body.feedback_code = this.priorityMaster.selectedPriority.Code;

    console.log('request body for feedback status ', body);
    return body;
  }

  getPriorityMaster() {
    this.isPriorityMasterLoading = true;
    this.jobStatusService.getPriorityMaster().subscribe((res: any) => {
      this.isPriorityMasterLoading = false;
      if (res && res.status) this.priorityMaster.list = res.data;
      this.priorityMaster.list.unshift({ Code: 0, Priority: 'All' });
      this.priorityMaster.selectedPriority = this.priorityMaster.list[0];
    });
  }

  markAsResolved(feedback: any) {
    this.resolvingFeedback = true;
    this.resolvingFeedbackId = feedback.id;
    const body = {
      feedback_id: feedback.id
    };
    this.feedbackService.updateFeedbackClosure(body).subscribe({
      next: (res: any) => {
        this.resolvingFeedback = false;
        this.resolvingFeedbackId = -1;
        this.toastService.show(`${feedback.JobDescription} feebdack has been marked as closed`, 'Feedback closed', 'success', true);
        this.getFeedbackStatus();
      },
      error: (err: any) => {
        this.resolvingFeedback = false;
        this.resolvingFeedbackId = -1;
        this.toastService.show(`${(err.message)? err.message : 'Something went wrong while updating feedback. If problem persists, please contact system administrator.'}`, 'Something went wrong', 'warning', true);
      }
    });
  }


}
