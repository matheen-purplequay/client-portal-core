import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { PqUiModule } from 'pq-ui';
import { WorkflowComponent } from './workflow.component';

const routes: Routes = [
  { path: '', component: WorkflowComponent }
];

@NgModule({
  declarations: [
    WorkflowComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    PqUiModule,
    RouterModule.forChild(routes)
  ]
})
export class WorkflowModule { }
