import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PqUiModule } from 'pq-ui';
import { JobDetailsComponent } from './job-details.component';
import { JobInformationComponent } from './job-information/job-information.component';

// Split out on its own so lightweight report pages (Turnaround, Open Jobs, and
// later Movement/Budget Overview) can reuse the same job-details popups as
// the Job Status page without importing the much heavier DashboardHomeModule
// (Chart.js/CKEditor/etc.) or declaring the components into the widely-shared
// SharedModule (which broke every consumer when tried — see git history).
@NgModule({
  declarations: [
    JobDetailsComponent,
    JobInformationComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    PqUiModule
  ],
  exports: [
    JobDetailsComponent,
    JobInformationComponent
  ]
})
export class JobDetailsModule { }
