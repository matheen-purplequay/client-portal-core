import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InboxRoutingModule } from './inbox-routing.module';
import { InboxMasterComponent } from './inbox-master/inbox-master.component';
import { PqUiModule } from 'pq-ui';
import { SharedModule } from '../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { InboxListComponent } from './instructions/inbox-list/inbox-list.component';
import { InboxMessagesComponent } from './instructions/inbox-messages/inbox-messages.component';
import { InboxToolbarComponent } from './instructions/inbox-toolbar/inbox-toolbar.component';
import { CommentsComponent } from './instructions/comments/comments.component';
import { InstructionsHomeComponent } from './instructions/instructions-home/instructions-home.component';
import { FeedbacksHomeComponent } from './feedbacks/feedbacks-home/feedbacks-home.component';
import { QueriesHomeComponent } from './queries/queries-home/queries-home.component';
import { InlineAttachmentComponent } from './components/inline-attachment/inline-attachment.component';
import { AssociateQueriesComponent } from './queries/associate-queries/associate-queries.component';
import { AdminQueriesComponent } from './queries/admin-queries/admin-queries.component';
import { JobQueriesComponent } from './queries/job-queries/job-queries.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { NewQueryComponent } from './queries/new-query/new-query.component';
import { QueryStatisticsComponent } from './queries/query-statistics/query-statistics.component';
import { CardQueryRepliesComponent } from './queries/components/card-query-replies/card-query-replies.component';
import { CardQueryMetaComponent } from './queries/components/card-query-meta/card-query-meta.component';
import { QueryTemplateSelectorComponent } from './queries/components/query-template-selector/query-template-selector.component';
import { ApproveQueriesComponent } from './queries/approve-queries/approve-queries.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { JobApproveQueriesComponent } from './queries/job-approve-queries/job-approve-queries.component';


@NgModule({
  declarations: [
    InboxMasterComponent,
    InboxListComponent,
    InboxMessagesComponent,
    InboxToolbarComponent,
    CommentsComponent,
    InstructionsHomeComponent,
    FeedbacksHomeComponent,
    QueriesHomeComponent,
     InlineAttachmentComponent,
     AssociateQueriesComponent,
     AdminQueriesComponent,
     JobQueriesComponent,
     NewQueryComponent,
     QueryStatisticsComponent,
     CardQueryRepliesComponent,
     CardQueryMetaComponent,
     QueryTemplateSelectorComponent,
     ApproveQueriesComponent,
     JobApproveQueriesComponent,
  ],
  imports: [
    CommonModule,
    PqUiModule,
    FormsModule,
    SharedModule,
    CKEditorModule,
    NgxPaginationModule,
    InboxRoutingModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class InboxModule { }
