import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { JobQueries, MAX_ATTACHMENT_LIMIT, Query, QueryFilters, QueryReply } from '../models/queries';
import { StorageService } from 'projects/pq-admin/src/app/services/app/storage/storage.service';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { QueriesService } from 'projects/pq-admin/src/app/services/inbox/queries.service';

@Component({
  selector: 'app-admin-queries',
  templateUrl: './admin-queries.component.html',
  styleUrls: ['./admin-queries.component.scss']
})
export class AdminQueriesComponent implements OnInit {

  @Input() job: JobQueries = JobQueries.defaultJobQuery();
  @Input() queries: Query[] = [];
  @Input() queryResolved = new EventEmitter<boolean>();
  @Input() queriesSearchTerm: string = '';
  @Input() activity: { index: number, code: string, label: string } = { 
    index: 0, code: '', label: ''
   };

  queryFilters: QueryFilters = QueryFilters.defaultQueryFilters();
  
  maxAttachments = MAX_ATTACHMENT_LIMIT;
  public Editor = ClassicEditor;
  public queryReplyEditorConfig = {
    placeholder: "Would you like to provide additional details? Share them here.",
    toolbar: {
      items: [
        'undo', 'redo',
        '|', 'heading',
        '|', 'bold', 'italic',
        '|', 'link', 'insertTable', 'blockQuote',
        '|', 'bulletedList', 'numberedList', 'outdent', 'indent'
      ]
    },
  }

  query: {isQuerySelected: boolean, selectedQuery: Query } = {
    isQuerySelected: false,
    selectedQuery: Query.defaultQuery()
  };
  doesReplyQueryRequiresResponse: boolean = false;
  queryReplies: QueryReply[] = [];

  user: any;
  approverRole = 'approver';

  pagination: any[] = [];
  currentPage: number = 1;
  config = {
    id: 'custom',
    itemsPerPage: 10,
    currentPage: 1,
    totalItems: 0
  };

  constructor(
    private storageService: StorageService,
    private queriesService: QueriesService
  ) { }

  ngOnInit(): void {
    this.user = this.storageService.getItem('userdata');
    console.log('queries from admin queries === ', this.queries, this.job);
  }

  setupAmbiance() {

  }

  // getQueries() {
  //   const body = {
  //     jobId: this.job.job_id,
  //     filters: this.queryFilters,
  //     projectId: this.job.client_id
  //   };
  //   this.queriesService.getQueriesForJob(body).subscribe({
  //     next: (res: any) => {
  //       console.log('queries from api === ', res);
  //       this.queries = [...res.queries];
  //       this.setSelectedQuery(this.queries[0]);
  //     },
  //     error: (err: any) => {
  //       console.log('error queries from api === ', err);
  //     }
  //   });
  // }

  setSelectedQuery(query: Query) {
    this.query.selectedQuery = query;
    this.query.isQuerySelected = true;
  }

  deselectQuery() {
    this.query.selectedQuery = Query.defaultQuery();
    this.query.isQuerySelected = false;
  }

  setNewQueryAttachment(attachment: { title: string, link: string }) {
    const attachmentTitle = attachment.title? attachment.title : `Document ${this.query.selectedQuery.attachments.length + 1}`;
    const attachmentLink = attachment.link;
    if(attachmentLink) {
      this.query.selectedQuery.attachments.push({
        title: attachmentTitle, link: attachmentLink, user_id: this.user.staff_id
      });
      this.query.selectedQuery.show_attachment_input = false;
    }
  }

  emitQueryResolved() {
    this.queryResolved.emit();
  }

  removeQueryAttachment = (index: number) => this.query.selectedQuery.attachments.splice(index, 1);

  onPageChange(page: number) {
    this.currentPage = page;
  }
}
