import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { PqUiModule } from 'pq-ui';
import { DashboardPageComponent } from './dashboard-page.component';
import { SimpleDateInputComponent } from './simple-date-input/simple-date-input.component';

const routes: Routes = [
  { path: '', component: DashboardPageComponent }
];

@NgModule({
  declarations: [
    DashboardPageComponent,
    SimpleDateInputComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    PqUiModule,
    RouterModule.forChild(routes)
  ]
})
export class DashboardPageModule { }
