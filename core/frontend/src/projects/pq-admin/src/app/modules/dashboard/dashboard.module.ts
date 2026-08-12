import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardMasterComponent } from './dashboard-master/dashboard-master.component';
import { DashboardHomeComponent } from './dashboard-home/dashboard-home.component';
import { PqUiModule } from 'pq-ui';
import { SharedModule } from '../shared/shared.module';
import { DashboardGroupDirectorComponent } from './role-based/dashboard-group-director/dashboard-group-director.component';
import { DashboardAdminComponent } from './role-based/dashboard-admin/dashboard-admin.component';
import { DashboardApproverComponent } from './role-based/dashboard-approver/dashboard-approver.component';
import { FormsModule } from '@angular/forms';
import { DashboardUploaderComponent } from './role-based/dashboard-uploader/dashboard-uploader.component';
import { DashboardReportCountsComponent } from './components/dashboard-report-counts/dashboard-report-counts.component';
import { SimpleLoadingTextComponent } from '../../components/simple-loading-text/simple-loading-text.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { DashboardLoginActivityComponent } from './components/dashboard-login-activity/dashboard-login-activity.component';
import { DashboardCompaniesListComponent } from './components/dashboard-companies-list/dashboard-companies-list.component';

@NgModule({
  declarations: [
    DashboardMasterComponent,
    DashboardHomeComponent,
    DashboardGroupDirectorComponent,
    DashboardAdminComponent,
    DashboardApproverComponent,
    DashboardUploaderComponent,
    DashboardReportCountsComponent,
    DashboardLoginActivityComponent,
    DashboardCompaniesListComponent
  ],
  imports: [
    CommonModule,
    PqUiModule,
    SharedModule,
    FormsModule,
    NgxPaginationModule,
    DashboardRoutingModule
  ]
})
export class DashboardModule { }
