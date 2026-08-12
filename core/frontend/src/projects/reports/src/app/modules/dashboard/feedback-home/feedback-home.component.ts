import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { JobFeedback, Job, JobData } from '../../../models/jobs';
import { processAreasList } from '../feedback/models/feedback';
import { FeedbackService } from '../../../services/dashboard/feedback/feedback.service';
import { LocalStorageService } from '../../../services/app/storage/local-storage.service';
import { ToastService } from 'pq-ui';

@Component({
  selector: 'app-feedback-home',
  templateUrl: './feedback-home.component.html',
  styleUrls: ['./feedback-home.component.scss']
})
export class FeedbackHomeComponent implements OnInit, AfterViewInit {

  feedback: any[] = [];
  originalFeedbacks: JobFeedback[] = [];
  @Input() job: JobData = Job.defaultJob();
  isFeedbacksLoading: boolean = false;
  isFeedbacksLoaded: boolean = false;
  isExportingFeedbacks: boolean = false;

  newFeedback: JobFeedback = Job.defaultJobFeedback();
  isSavingFeedback: boolean = false;

  feedbackSearchTerm: string = '';
  toggleNewView: boolean = false;

  processAareasList = processAreasList;
  filterProcessAreas = {
    list: Object.values(this.processAareasList),
    selectedType: this.processAareasList.query,
    keys: { key: 'index', value: 'label' }
  };

  resolvingFeedback: boolean = false;
  resolvingFeedbackId: number = -1;

  isNewFeedback: boolean = false;

  sampleFeedbacks = [
    { id: 0, title: 'Test feedback 1', remark1: 'Test remark 1', remark2: 'Test remark 2', created: '20-04-2024' },
    { id: 1, title: 'Test feedback 2', remark1: 'Test remark 1', created: '20-04-2024' },
    { id: 2, title: 'Test feedback 3', remark1: 'Test remark 1', remark2: 'Test remark 2', created: '20-04-2024' },
  ];

  constructor(
    private feedbackService: FeedbackService,
    private localStorageService: LocalStorageService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.setupAmbiance();
    console.log('job details in feedback home ', this.job);
  }
  
  ngAfterViewInit(): void {
  }

  setupAmbiance() {
    this.resetNewFeedback();
    this.loadFeedback();
  }

  loadFeedback() {
    this.isFeedbacksLoading = true;
    const body = {
      job_id: this.job.Aid,
      user_id: this.localStorageService.getItem('userdata').client_id
    };
    this.feedbackService.getFeedback(body).subscribe({
      next: (res: any) => {
        this.isFeedbacksLoading = false;
        if(res.status) this.feedback = res.data;
      },
      error: (err: any) => {
        this.isFeedbacksLoading = false;
      }
    });
  }

  saveFeedback() {
    this.isSavingFeedback = true;
    const body = this.newFeedback;
    this.feedbackService.postFeedback(body).subscribe({
      next: (res: any) => {
        this.isSavingFeedback = false;
        if(res.status) {
          this.isNewFeedback = false;
          this.feedback.unshift(this.newFeedback);
          this.newFeedback = Job.defaultJobFeedback();
          this.loadFeedback();
        }
      },
      error: (err: any) => {
        this.isSavingFeedback = false;
      }
    })
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
        this.loadFeedback();
      },
      error: (err: any) => {
        this.resolvingFeedback = false;
        this.resolvingFeedbackId = -1;
        this.toastService.show(`${(err.message)? err.message : 'Something went wrong while updating feedback. If problem persists, please contact system administrator.'}`, 'Something went wrong', 'warning', true);
      }
    });
  }

  resetNewFeedback() {
    this.newFeedback.Aid = this.job.Aid;
    this.newFeedback.UserId = this.localStorageService.getItem('userdata').client_id;
    this.newFeedback.Pid = this.localStorageService.getItem('userdata').project_id;
    this.newFeedback.ProcessArea = this.filterProcessAreas.selectedType.label;
    this.newFeedback.Date = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
    this.newFeedback.Status = this.job.Status;
  }
}
