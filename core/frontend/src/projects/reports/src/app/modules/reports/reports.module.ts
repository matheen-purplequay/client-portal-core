import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportsRoutingModule } from './reports-routing.module';
import { ReportsMasterComponent } from './reports-master/reports-master.component';
import { ReportsConnectComponent } from './reports-connect/reports-connect.component';
import { ReportsWeeklyComponent } from './reports-weekly/reports-weekly.component';
import { FormsModule } from '@angular/forms';
import { PqUiModule } from 'pq-ui';
import { SharedModule } from '../../shared/shared.module';
import { AlertbarComponent } from '../../layouts/alertbar/alertbar.component';
import { InvoicesComponent } from './invoices/invoices.component';
import { AngularDraggableModule } from 'angular2-draggable';


@NgModule({
  declarations: [
    ReportsMasterComponent,
    ReportsConnectComponent,
    ReportsWeeklyComponent,
    InvoicesComponent
  ],
  imports: [
    CommonModule,
    ReportsRoutingModule,
    SharedModule,
    FormsModule,
    AngularDraggableModule,
    PqUiModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ReportsModule { }
