import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { PqUiModule } from 'pq-ui';
import { TurnaroundReportComponent } from './turnaround-report.component';
import { JobDetailsModule } from '../job-details/job-details.module';
import { FilterPanelPositionModule } from '../../../shared/directives/filter-panel-position.module';

const routes: Routes = [
  { path: '', component: TurnaroundReportComponent }
];

@NgModule({
  declarations: [
    TurnaroundReportComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    PqUiModule,
    JobDetailsModule,
    FilterPanelPositionModule,
    RouterModule.forChild(routes)
  ]
})
export class TurnaroundReportModule { }
