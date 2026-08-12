import { NgModule } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';

import { ReportsRoutingModule } from './reports-routing.module';
import { ReportsMasterComponent } from './reports-master/reports-master.component';
import { ReportsUploadComponent } from './reports-upload/reports-upload.component';
import { SharedModule } from '../shared/shared.module';
import { ReportsListComponent } from './reports-list/reports-list.component';
import { PqUiModule } from 'pq-ui';
import { ReportManageComponent } from './report-manage/report-manage.component';
import { AgreedListComponent } from './agreed-list/agreed-list.component';
import { TeamsComponent } from './teams/teams.component';
import { InvoicesUploadComponent } from './invoices-upload/invoices-upload.component';
import { InvoicesListComponent } from './invoices-list/invoices-list.component';
import { InvoicesManageComponent } from './invoices-manage/invoices-manage.component';
import { ContactRecipientsComponent } from './contact-recipients/contact-recipients.component';
import { FormsModule } from '@angular/forms';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';


@NgModule({
  declarations: [
    ReportsMasterComponent,
    ReportsUploadComponent,
    ReportsListComponent,
    ReportManageComponent,
    AgreedListComponent,
    TeamsComponent,
    InvoicesUploadComponent,
    InvoicesListComponent,
    InvoicesManageComponent,
    ContactRecipientsComponent
  ],
  imports: [
    CommonModule,
    PqUiModule,
    FormsModule,
    SharedModule,
    CKEditorModule,
    ReportsRoutingModule
  ],
  providers: [TitleCasePipe]
})
export class ReportsModule { }
