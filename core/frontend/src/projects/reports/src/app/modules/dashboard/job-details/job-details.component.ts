import { AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { JobData, Job } from '../../../models/jobs';
import { JobStatusService } from '../../../services/dashboard/job-status/job-status.service';
import { LocalStorageService } from '../../../services/app/storage/local-storage.service';

@Component({
  selector: 'app-job-details',
  templateUrl: './job-details.component.html',
  styleUrls: ['./job-details.component.scss']
})
export class JobDetailsComponent implements OnInit, OnChanges {

  @Input() job: JobData = Job.defaultJob();
  rating = 0;
  ratingStarFilled = '&#9733;';
  ratingStarUnFilled = '&#9734;';

  improvements: { list: string[], selectedImprovements: string[] } = {
    list: ['Processor Skills', 'Job Quality', 'TAT', 'Presentation', 'Organizing'],
    selectedImprovements: []
  };
  customRatingFeedback: string = '';

  showRatingView: boolean = false;
  timeline: any[] = [];

  isGettingDetails: boolean = false;
  user: any;
  
  constructor(
    private localStorageService: LocalStorageService,
    private jobStatusService: JobStatusService
  ) { 
    
  }

  ngOnInit(): void {
    this.user = this.localStorageService.getItem('userdata');
    this.setupAmbiance();
  }

  // The popup on some pages (Turnaround, Open Jobs) mounts this component
  // once for the whole page instead of recreating it per open (as the Job
  // Status page's *ngIf-toggled usage does), so a changed [job] input is
  // the only signal that a different job was clicked — refetch on it.
  ngOnChanges(changes: SimpleChanges): void {
    const jobChange = changes['job'];
    if (jobChange && !jobChange.firstChange && jobChange.previousValue?.Aid !== jobChange.currentValue?.Aid) {
      this.timeline = [];
      this.getJobDetails();
    }
  }

  setupAmbiance() {
    this.getJobDetails();
  }

  getJobDetails() {
    if(this.timeline.length <= 0) {
      this.isGettingDetails = true;
      const body = {
        job_id: this.job.Aid
      };
      this.jobStatusService.getJobDetails(body).subscribe({
        next: (res: any) => {
          this.isGettingDetails = false;
          if(res.status) this.timeline = res.data;
        },
        error: (err: any) => {
          this.isGettingDetails = false;
        }
      });
    }
  }

}
