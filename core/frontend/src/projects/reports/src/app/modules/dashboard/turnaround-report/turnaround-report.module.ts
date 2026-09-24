import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { PqUiModule } from 'pq-ui';
import { TurnaroundReportComponent } from './turnaround-report.component';

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
    RouterModule.forChild(routes)
  ]
})
export class TurnaroundReportModule { }
