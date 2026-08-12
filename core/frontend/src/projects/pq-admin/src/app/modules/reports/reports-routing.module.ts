import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReportsListComponent } from './reports-list/reports-list.component';
import { ReportsUploadComponent } from './reports-upload/reports-upload.component';
import { ReportManageComponent } from './report-manage/report-manage.component';

const routes: Routes = [
  { path: '', redirectTo: 'list', pathMatch: 'full' },
  { path: 'list', component: ReportsListComponent, data: { page: 'list', activity: 'reports' } },
  { path: 'invoices/list', component: ReportsListComponent, data: { page: 'invoices', activity: 'list' }},
  { path: 'teams/list', component: ReportsListComponent, data: { page: 'teams', activity: 'list' }}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule { }
