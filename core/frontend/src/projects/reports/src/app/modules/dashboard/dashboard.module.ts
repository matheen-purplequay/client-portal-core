import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardMasterComponent } from './dashboard-master/dashboard-master.component';
import { DashboardHomeComponent } from './dashboard-home/dashboard-home.component';
import { PqUiModule } from 'pq-ui';
import { FormsModule } from '@angular/forms';
import { ConnectReportComponent } from './connect-report/connect-report.component';
import { WeeklyReportComponent } from './weekly-report/weekly-report.component';
import { NewslettersComponent } from './newsletters/newsletters.component';
import { SidebarComponent } from '../../layouts/sidebar/sidebar.component';
import { NavbarComponent } from '../../layouts/navbar/navbar.component';
import { SharedModule } from '../../shared/shared.module';
import { AboutComponent } from './about/about.component';
import { ChatComponent } from './chat/chat.component';
import { HolidaysComponent } from './holidays/holidays.component';
import { DashboardRealtimeComponent } from './dashboard-realtime/dashboard-realtime.component';
import { KnowledgeCenterComponent } from './knowledge-center/knowledge-center.component';
import { MyTeamComponent } from './my-team/my-team.component';
import { ItComponent } from './it/it.component';
import { JobStatusComponent } from './job-movement/job-status/job-status.component';
import { JobDetailsComponent } from './job-details/job-details.component';
import { JobsTableComponent } from './jobs-table/jobs-table.component';
import { DashboardFeedbackComponent } from './feedback/dashboard-feedback/dashboard-feedback.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { NgxPaginationModule } from 'ngx-pagination';
import { FeedbackHomeComponent } from './feedback-home/feedback-home.component';
import { JobRatingComponent } from './job-rating/job-rating.component';
import { JobQueriesComponent } from './queries/job-queries/job-queries.component';
import { QueriesHomeComponent } from './queries/queries-home/queries-home.component';
import { InlineAttachmentComponent } from './components/inline-attachment/inline-attachment.component';
import { AdminQueriesComponent } from './queries/admin-queries/admin-queries.component';
import { AssociateQueriesComponent } from './queries/associate-queries/associate-queries.component';
import { NewQueriesComponent } from './queries/new-queries/new-queries.component';
import { QueriesStatisticsComponent } from './queries/queries-statistics/queries-statistics.component';
import { CardQueryRepliesComponent } from './queries/components/card-query-replies/card-query-replies.component';
import { CardQueryMetaComponent } from './queries/components/card-query-meta/card-query-meta.component';
import { QueryStatisticsComponent } from './queries/components/query-statistics/query-statistics.component';
import { DashboardBsMovementComponent } from './dashboards/business-service/dashboard-bs-movement/dashboard-bs-movement.component';
import { DashboardInsightsComponent } from './dashboard-insights/dashboard-insights.component';

@NgModule({
  declarations: [
    DashboardMasterComponent,
    DashboardHomeComponent,
    ConnectReportComponent,
    WeeklyReportComponent,
    NewslettersComponent,
    AboutComponent,
    ChatComponent,
    HolidaysComponent,
    DashboardRealtimeComponent,
    KnowledgeCenterComponent,
    MyTeamComponent,
    ItComponent,
    JobStatusComponent,
    JobDetailsComponent,
    JobsTableComponent,
    DashboardFeedbackComponent,
    FeedbackHomeComponent,
    JobRatingComponent,
    JobQueriesComponent,
    QueriesHomeComponent,
    InlineAttachmentComponent,
    AdminQueriesComponent,
    AssociateQueriesComponent,
    NewQueriesComponent,
    QueriesStatisticsComponent,
    CardQueryRepliesComponent,
    CardQueryMetaComponent,
    QueryStatisticsComponent,
    DashboardBsMovementComponent,
    DashboardInsightsComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    CKEditorModule,
    DashboardRoutingModule,
    NgxPaginationModule,
    PqUiModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [DatePipe]
})
export class DashboardModule { }
