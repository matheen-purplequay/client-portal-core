import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { JobComponent } from './job.component';
import { OpenJobsByHolderComponent } from './open-jobs-by-holder/open-jobs-by-holder.component';
import { ClosedJobsComponent } from './closed-jobs/closed-jobs.component';
import { JobDetailsModule } from '../job-details/job-details.module';
import { FilterPanelPositionModule } from '../../../shared/directives/filter-panel-position.module';

const routes: Routes = [
  { path: '', component: JobComponent },
  { path: 'open', component: OpenJobsByHolderComponent },
  { path: 'closed', component: ClosedJobsComponent }
];

@NgModule({
  declarations: [
    JobComponent,
    OpenJobsByHolderComponent,
    ClosedJobsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    JobDetailsModule,
    FilterPanelPositionModule,
    RouterModule.forChild(routes)
  ]
})
export class JobModule { }
