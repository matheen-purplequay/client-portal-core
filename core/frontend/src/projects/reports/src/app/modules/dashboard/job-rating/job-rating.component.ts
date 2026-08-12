import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { JobData, Job } from '../../../models/jobs';
import { JobStatusService } from '../../../services/dashboard/job-status/job-status.service';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { LocalStorageService } from '../../../services/app/storage/local-storage.service';
import { ChangeEvent } from '@ckeditor/ckeditor5-angular';

@Component({
  selector: 'app-job-rating',
  templateUrl: './job-rating.component.html',
  styleUrls: ['./job-rating.component.scss']
})
export class JobRatingComponent implements OnInit {

  @Output() refreshJobs: EventEmitter<boolean> = new EventEmitter(false);
  @Input() job: JobData = Job.defaultJob();
  @Input() layout: "default" | "simple" | "grid" = 'default';
  rating: { average: number, quality: number, presentation: number, tat: number } = {
    average: 0, quality: 0, presentation: 0, tat: 0
  };
  ratingStarFilled = '&#9733;';
  ratingStarUnFilled = '&#9734;';
  
  improvements: { list: string[], selectedImprovements: string[] } = {
    list: ['Processor Skills', 'Job Quality', 'TAT', 'Presentation', 'Organizing'],
    selectedImprovements: []
  };
  
  showRatingView: boolean = false;
  isRatingLoading: boolean = false;
  showSuccessAlert: boolean = false;
  showWarningAlert: boolean = false;
  warningMessage: string = '';
  isSavingRating: boolean = false;
  
  public customRatingFeedback: string = '';
  public Editor = ClassicEditor;
  public config = {
    placeholder: 'Additional comments...',
    toolbar: {
      items: [
        'undo', 'redo',
        '|', 'heading',
        '|', 'bold', 'italic',
        '|', 'blockQuote',
        '|', 'bulletedList', 'numberedList', 'outdent', 'indent'
      ]
    },
  }

  constructor(
    private jobStatusService: JobStatusService,
    private localStorageService: LocalStorageService
  ) { }

  ngOnInit(): void {
    this.setupAmbiance();
  }

  setupAmbiance() {
    this.getRatingByJobID();
  }

  calculateAverageRating() {
    const categories = Object.values(this.rating).length - 1;
    const average = Math.round(((this.rating.quality + this.rating.presentation + this.rating.tat) / categories) * 100) / 100;
    this.rating.average = Math.round(average);

    console.log('average rating ', this.rating.average, categories, this.rating);
  }

  handleImprovmentSelection(improvement: string, index: number) {
    if(!this.improvements.selectedImprovements.includes(improvement)) {
      this.improvements.selectedImprovements.push(improvement);
    } else {
      this.improvements.selectedImprovements = this.improvements.selectedImprovements.filter(item => item != improvement);
    }
  }

  getRatingByJobID() {
    this.isRatingLoading = true;
    const body = {
      job_id: this.job.Aid
    };

    this.jobStatusService.getRatingByJobID(body).subscribe({
      next: (res: any) => {
        this.isRatingLoading = false;
        this.rating.quality = res.data.job_quality_rating;
        this.rating.presentation = res.data.presentation_rating;
        this.rating.tat = res.data.tat_rating;
        this.customRatingFeedback = res.data.overall_comments;
        this.calculateAverageRating();
      },
      error: (err: any) => {
        this.isRatingLoading = false;
      }
    });
  }

  saveRating() {
    if(this.rating.average < 4 && !this.customRatingFeedback) {
      this.showWarningAlert = true;
      this.warningMessage = 'Please give additional comments for us to improvise';
      setTimeout(() => { this.showWarningAlert = false; this.warningMessage = ''; }, 5000);
      return;
    }
    this.isSavingRating = true;
    const body = {
      job_id: this.job.Aid,
      job_quality_rating: this.rating.quality,
      presentation_rating: this.rating.presentation,
      tat_rating: this.rating.tat,
      overall_rating: this.rating.average,
      overall_comments: this.customRatingFeedback,
      user_id: this.localStorageService.getItem('userdata').user_id
    };
    this.jobStatusService.saveRating(body).subscribe({
      next: (res: any) => {
        if(res.status) {
          this.isSavingRating = false;
          this.showSuccessAlert = true;
          setTimeout(() => { this.showSuccessAlert = false; }, 5000);
          this.refreshJobs.emit(true);
        }
      },
      error: (err: any) => {
        this.isSavingRating = false;
      }
    });
  }

  resetRating() {
    this.rating = { average: 0, quality: 0, presentation: 0, tat: 0 };
    this.customRatingFeedback = '';
    this.improvements.selectedImprovements = [];
  }
}
