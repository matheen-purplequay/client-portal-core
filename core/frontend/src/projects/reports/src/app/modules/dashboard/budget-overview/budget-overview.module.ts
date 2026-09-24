import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { PqUiModule } from 'pq-ui';
import { BudgetOverviewComponent } from './budget-overview.component';

const routes: Routes = [
  { path: '', component: BudgetOverviewComponent }
];

@NgModule({
  declarations: [
    BudgetOverviewComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    PqUiModule,
    RouterModule.forChild(routes)
  ]
})
export class BudgetOverviewModule { }
