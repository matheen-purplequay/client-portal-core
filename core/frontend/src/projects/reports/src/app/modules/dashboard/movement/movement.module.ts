import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { PqUiModule } from 'pq-ui';
import { MovementComponent } from './movement.component';
import { FilterPanelPositionModule } from '../../../shared/directives/filter-panel-position.module';
import { JobDetailsModule } from '../job-details/job-details.module';

const routes: Routes = [
  { path: '', component: MovementComponent }
];

@NgModule({
  declarations: [
    MovementComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    PqUiModule,
    FilterPanelPositionModule,
    JobDetailsModule,
    RouterModule.forChild(routes)
  ]
})
export class MovementModule { }
