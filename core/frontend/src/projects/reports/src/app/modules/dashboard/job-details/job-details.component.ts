import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { JobData, Job } from '../../../models/jobs';
import { JobStatusService } from '../../../services/dashboard/job-status/job-status.service';
import { LocalStorageService } from '../../../services/app/storage/local-storage.service';

@Component({
  selector: 'app-job-details',
  templateUrl: './job-details.component.html',
  styleUrls: ['./job-details.component.scss']
})
export class JobDetailsComponent implements OnInit {

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
