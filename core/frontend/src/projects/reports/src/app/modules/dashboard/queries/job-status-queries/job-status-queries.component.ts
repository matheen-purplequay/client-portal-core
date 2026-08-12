import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Job, JobData } from 'projects/reports/src/app/models/jobs';
import { LocalStorageService } from 'projects/reports/src/app/services/app/storage/local-storage.service';
import { QueriesService } from 'projects/reports/src/app/services/dashboard/queries/queries.service';

@Component({
  selector: 'app-job-status-queries',
  templateUrl: './job-status-queries.component.html',
  styleUrls: ['./job-status-queries.component.scss']
})
export class JobStatusQueriesComponent implements OnInit, OnChanges {

  @Input() job: JobData = Job.defaultJob();
  user: any;

  constructor(
    private queriesService: QueriesService,
    private localStorageService: LocalStorageService
  ) { }

  ngOnInit(): void {
    this.user = this.localStorageService.getItem('userdata');
    console.log('user details ', this.user);
    this.setupAmbiance();
  }

  ngOnChanges(changes: SimpleChanges): void {
      this.getQueries();
  }

  setupAmbiance() {
  }

  getQueries() {
    console.log('get quries in job status queries');

    // const body = {
    //   "jobId": this.job.JobId,
    //   "filters": [
    //   ],
    //   "projectId": this.user.
    // }
    // this.queriesService.getQueriesForJob()
  }

/**
 * Converts a string to a number.
 *
 * This function attempts to parse a string into a number. It handles
 * various cases, including:
 *   - Integers
 *   - Floating-point numbers
 *   - Exponential notation
 *   - Leading/trailing whitespace
 *   - NaN (Not-a-Number)
 *   - Invalid input (returns undefined if the string cannot be converted)
 *
 * @param str The string to convert to a number.
 * @returns The number representation of the string, or undefined if the
 *   string cannot be converted to a number.
 */
stringToNumber(str: string): number | undefined {
  if (typeof str !== 'string') {
    return undefined; // Return undefined for non-string input
  }

  const trimmedStr = str.trim(); // Remove leading/trailing whitespace

  if (trimmedStr === '') {
    return undefined; // Return undefined for empty string after trimming
  }

  const num = Number(trimmedStr);

  if (isNaN(num)) {
    return undefined; // Return undefined if the string is not a valid number
  }

  return num;
}

}