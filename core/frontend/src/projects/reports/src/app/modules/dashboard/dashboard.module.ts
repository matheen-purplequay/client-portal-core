import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardMasterComponent } from './dashboard-master/dashboard-master.component';
import { PqUiModule } from 'pq-ui';
import { FormsModule } from '@angular/forms';
import { ConnectReportComponent } from './connect-report/connect-report.component';
import { WeeklyReportComponent } from './weekly-report/weekly-report.component';
import { NewslettersComponent } from './newsletters/newsletters.component';
import { SharedModule } from '../../shared/shared.module';
import { AboutComponent } from './about/about.component';
import { ChatComponent } from './chat/chat.component';
import { HolidaysComponent } from './holidays/holidays.component';
import { KnowledgeCenterComponent } from './knowledge-center/knowledge-center.component';
import { MyTeamComponent } from './my-team/my-team.component';
import { ItComponent } from './it/it.component';

// Kept deliberately slim — DashboardHomeComponent and its tab dependencies
// (queries/feedback/insights/movement, plus Chart.js/CKEditor/SweetAlert2/
// html2canvas) live in their own lazy DashboardHomeModule (see
// dashboard-routing.module.ts's 'home' route) so that lighter pages under
// /dashboard/* don't have to download that weight just to render.
@NgModule({
  declarations: [
    DashboardMasterComponent,
    ConnectReportComponent,
    WeeklyReportComponent,
    NewslettersComponent,
    AboutComponent,
    ChatComponent,
    HolidaysComponent,
    KnowledgeCenterComponent,
    MyTeamComponent,
    ItComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    DashboardRoutingModule,
    PqUiModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class DashboardModule { }
