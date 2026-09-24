import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MovementWidgetModule } from '../dashboards/business-service/movement-widget.module';
import { JobStatusViewComponent } from './job-status-view.component';

const routes: Routes = [
  { path: '', component: JobStatusViewComponent }
];

@NgModule({
  declarations: [
    JobStatusViewComponent
  ],
  imports: [
    CommonModule,
    MovementWidgetModule,
    RouterModule.forChild(routes)
  ]
})
export class JobStatusViewModule { }
