import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { PqUiModule } from 'pq-ui';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { NgxPaginationModule } from 'ngx-pagination';

import { SharedModule } from '../../../shared/shared.module';
import { MovementWidgetModule } from '../dashboards/business-service/movement-widget.module';

import { DashboardHomeComponent } from './dashboard-home.component';
import { JobStatusComponent } from '../job-movement/job-status/job-status.component';
import { JobDetailsComponent } from '../job-details/job-details.component';
import { JobsTableComponent } from '../jobs-table/jobs-table.component';
import { DashboardFeedbackComponent } from '../feedback/dashboard-feedback/dashboard-feedback.component';
import { FeedbackHomeComponent } from '../feedback-home/feedback-home.component';
import { JobRatingComponent } from '../job-rating/job-rating.component';
import { JobQueriesComponent } from '../queries/job-queries/job-queries.component';
import { QueriesHomeComponent } from '../queries/queries-home/queries-home.component';
import { InlineAttachmentComponent } from '../components/inline-attachment/inline-attachment.component';
import { AdminQueriesComponent } from '../queries/admin-queries/admin-queries.component';
import { AssociateQueriesComponent } from '../queries/associate-queries/associate-queries.component';
import { NewQueriesComponent } from '../queries/new-queries/new-queries.component';
import { QueriesStatisticsComponent } from '../queries/queries-statistics/queries-statistics.component';
import { CardQueryRepliesComponent } from '../queries/components/card-query-replies/card-query-replies.component';
import { CardQueryMetaComponent } from '../queries/components/card-query-meta/card-query-meta.component';
import { QueryStatisticsComponent } from '../queries/components/query-statistics/query-statistics.component';
import { DashboardInsightsComponent } from '../dashboard-insights/dashboard-insights.component';
import { DashboardRealtimeComponent } from '../dashboard-realtime/dashboard-realtime.component';

// Split out of DashboardModule since this page (and its Movement/Queries/Feedback/
// Insights tabs) pulls in Chart.js, CKEditor, SweetAlert2 and html2canvas — heavy
// deps that shouldn't have to load just to visit a lightweight /dashboard/* page.
const routes: Routes = [
  { path: '', component: DashboardHomeComponent }
];

@NgModule({
  declarations: [
    DashboardHomeComponent,
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
    DashboardInsightsComponent,
    DashboardRealtimeComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    CKEditorModule,
    NgxPaginationModule,
    PqUiModule,
    MovementWidgetModule,
    RouterModule.forChild(routes)
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [DatePipe]
})
export class DashboardHomeModule { }
