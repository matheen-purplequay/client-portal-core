import { Component, OnInit } from '@angular/core';
import { ToastService } from 'pq-ui';
import { JobFeedback, SubProcessArea } from 'projects/pq-admin/src/app/models/job';
import { StorageService } from 'projects/pq-admin/src/app/services/app/storage/storage.service';
import { FeedbackService } from 'projects/pq-admin/src/app/services/inbox/feedback.service';

@Component({
  selector: 'app-feedbacks-home',
  templateUrl: './feedbacks-home.component.html',
  styleUrls: ['./feedbacks-home.component.scss']
})
export class FeedbacksHomeComponent implements OnInit {

  feedback: JobFeedback[] = [];
  isFeedbackLoading: boolean = false;
  subProcessAreasList = Object.values(SubProcessArea);
  subProcessAreas: { list: string[], selected: string } = {
    list: [],
    selected: ''
  };

  constructor(
    private feedbackService: FeedbackService,
    private storageService: StorageService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.setupAmbiance();
  }

  setupAmbiance() {
    this.getFeedback();
  }

  saveFeedback() {

  }

  getFeedback() {
    this.isFeedbackLoading = true;
    const start_date = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1);
    const end_date = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
    const sdate = this.getDateAsString(start_date.getFullYear(), start_date.getMonth(), start_date.getDate());
    const edate = this.getDateAsString(end_date.getFullYear(), end_date.getMonth(), end_date.getDate());

    console.log('dates ', sdate, edate);
    
    const body = {
      user_id: this.storageService.getItem('userdata').wm_user_id,
      start_date: "2024-06-01",
      end_date: "2024-06-30",
    };

    this.feedbackService.getFeedbackByUserId(body).subscribe({
      next: (res: any) => {
        this.isFeedbackLoading = false;
        if(res.status) this.feedback = res.data;
      },
      error: (err: any) => {
        this.isFeedbackLoading = false;
      }
    });
  }

  markAsResolved(feedback: any) {
    if(!feedback.SubProcessArea) { alert('Please select a sub process area and try again.'); }
    else {
      const body = {
        feedback_id: feedback.FeedbackId,
        dt_comments: feedback.DTComments,
        sub_process_area: feedback.SubProcessArea
      };
      this.feedbackService.updateFeedbackClosure(body).subscribe({
        next: (res: any) => {
          if(res.status) {
            this.toastService.show(`Feedback for ${feedback.JobDescription} has been marked for closed.`, 'Feedback closed', 'success', true);
            this.getFeedback();
          } else {
            this.toastService.show('Something went wrong while saving feedback. If problem persists, please contact your system administrator.', 'Something went wrong', 'success', true);
          }
        },
        error: (err: any) => {
          this.toastService.show('Something went wrong while saving feedback. If problem persists, please contact your system administrator.', 'Something went wrong', 'success', true);
        }
      });
    }
  }

  getSubProcessArea(processArea: string) {
    this.subProcessAreas.list = this.subProcessAreasList.filter(item => item.code === processArea.toLowerCase())[0].sub_process;
    if(this.subProcessAreas.list.length > 0) {
      this.subProcessAreas.selected = this.subProcessAreas.list[0];
      return this.subProcessAreas.list;
    } else return [];
  }

  getDateAsString(date: number, month: number, year: number) {
    return `${year}-${String(month).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
  }
}
