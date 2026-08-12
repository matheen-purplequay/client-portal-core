import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { BulkApproveQueryRequest, DraftJobQueries, DraftQueryRequest, JobQueries, MAX_ATTACHMENT_LIMIT, Query, QueryFilters, QueryReply } from '../models/queries';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { StorageService } from 'projects/pq-admin/src/app/services/app/storage/storage.service';
import { QueriesService } from 'projects/pq-admin/src/app/services/inbox/queries.service';
import { CommonService } from 'projects/pq-admin/src/app/services/common/common.service';

@Component({
  selector: 'app-approve-queries',
  templateUrl: './approve-queries.component.html',
  styleUrls: ['./approve-queries.component.scss']
})
export class ApproveQueriesComponent implements OnInit, OnChanges {
  @Output() refresh: EventEmitter<boolean> = new EventEmitter();
  @Output() isJobSelected: EventEmitter<JobQueries> = new EventEmitter();
  @Input() draftJobQueries: DraftJobQueries[] = [];
  @Input() job: JobQueries = JobQueries.defaultJobQuery();
  @Input() queries: Query[] = [];
  @Input() isEditMode: boolean = false;
  @Input() client_id: number = 0;
  @Input() activity: { index: number, code: string, label: string } = {
    index: 0, code: '', label: ''
  };

  jobs: { list: DraftJobQueries[], selectedJob: DraftJobQueries, isJobSelected: boolean } = {
    list: [],
    selectedJob: DraftJobQueries.defaultDraftJobQueries(),
    isJobSelected: false
  };

  isQueryModified: boolean = false;
  originalQuery: Query = Query.defaultQuery();
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

  query: { isQuerySelected: boolean, selectedQuery: Query } = {
    isQuerySelected: false,
    selectedQuery: Query.defaultQuery()
  };
  doesReplyQueryRequiresResponse: boolean = false;
  queryReplies: QueryReply[] = [];

  user: any;
  showRejectReason: boolean = false;
  queryApprovedOrRejected: boolean = false;

  draftQueryRequest: DraftQueryRequest = DraftQueryRequest.defaultDraftQueryRequest();
  updatedQuery: Query = Query.defaultQuery();

  editedQueriesList: { query_id: number, edited_reason: string | undefined }[] = [];

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
    private commonService: CommonService,
    private queriesService: QueriesService
  ) { }

  ngOnInit(): void {
    this.user = this.storageService.getItem('userdata');
    this.setupAmbiance();
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('job queries in approve queries component on changes : ', this.draftJobQueries);
    // if (changes['draftJobQueries'] && this.draftJobQueries) {
    //   this.jobs.list = this.draftJobQueries;
    //   this.jobs.isJobSelected = false;
    //   console.log('jobs list in approve queries component on changes : ', this.jobs.list);
    // }
  }

  setupAmbiance() {
    console.log('query in setup ambiance ', this.query.selectedQuery);
    this.draftQueryRequest.user_id = this.user.staff_id;
    this.draftQueryRequest.user_name = [
      this.user.first_name,
      this.user.middle_name,
      this.user.last_name
    ].filter(Boolean).join(' ');
    this.draftQueryRequest.reject_reason = '';
  }

  getDraftQueries() {
    this.queries = [];
    this.queriesService.getDraftQueries(this.user.staff_id, this.client_id).subscribe({
      next: (res: any) => {
        // this.draftQueries = this.groupByDraftJobs(res.queries);
        this.queries = res.queries;
        console.log('draft queries in queries home : ', res.queries);
        console.log('Draft Queries grouped by jobs in queries home : ', this.queries);
      },
      error: (err: any) => {}
    });
  }

  setSelectedJob(job: any) {
    this.jobs.selectedJob = job;
    this.isJobSelected.emit({...job});
    this.jobs.isJobSelected = true;
    this.queries = job.queries;
    this.config.totalItems = this.queries.length;
    this.setSelectedQuery(this.queries[0]);
    this.isEditMode = false;
    this.isQueryModified = false;
    this.queryApprovedOrRejected = false;
    this.showRejectReason = false;
    this.draftQueryRequest.reject_reason = '';
    this.draftQueryRequest.edited_reason = '';
    this.draftQueryRequest.status_id = 0;
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
    this.originalQuery = { ...query };
    console.log('selected query in set selected query === ', this.query.selectedQuery);
    this.query.isQuerySelected = true;
  }

  onQueryEdited(editedQuery: string) {
    console.log('Query received from child:', editedQuery);
    this.query.selectedQuery.query = editedQuery;
  }

  deselectQuery() {
    console.log("deselect called");

    this.query.selectedQuery = Query.defaultQuery();
    this.originalQuery = { ...Query.defaultQuery() };
    this.query.isQuerySelected = false;
    this.queryApprovedOrRejected = false;
    this.showRejectReason = false;
    this.draftQueryRequest.reject_reason = '';
    this.draftQueryRequest.edited_reason = '';
    this.draftQueryRequest.status_id = 0;
    this.isEditMode = false;
    this.isQueryModified = false;
    this.refresh.emit(true);
  }

  setNewQueryAttachment(attachment: { title: string, link: string }) {
    const attachmentTitle = attachment.title ? attachment.title : `Document ${this.query.selectedQuery.attachments.length + 1}`;
    const attachmentLink = attachment.link;
    if (attachmentLink) {
      this.query.selectedQuery.attachments.push({
        title: attachmentTitle, link: attachmentLink, user_id: this.user.staff_id
      });
      this.query.selectedQuery.show_attachment_input = false;
    }
  }

  removeQueryAttachment = (index: number) => this.query.selectedQuery.attachments.splice(index, 1);

  approveQuery() {
    this.draftQueryRequest.query_id = this.query.selectedQuery.id!;
    this.draftQueryRequest.status_id = 2;
    this.draftQueryRequest.title = this.query.selectedQuery.title;
    this.draftQueryRequest.query = this.query.selectedQuery.query;

    this.queriesService.approveDraftQuery(this.draftQueryRequest).subscribe({
      next: (res: any) => {
        this.showRejectReason = false;
        this.queryApprovedOrRejected = true;
        this.updatedQuery = this.query.selectedQuery;
        console.log('approved query === ', res);
      },
      error: (err: any) => {
        console.log('error approving query === ', err);
      }
    });
  }

  rejectQuery() {
    this.draftQueryRequest.query_id = this.query.selectedQuery.id!;
    this.draftQueryRequest.status_id = 5;
    if (this.draftQueryRequest.reject_reason == "") {
      alert('Rejection reason is required.');
      return;
    }
    this.queriesService.rejectDraftQuery(this.draftQueryRequest).subscribe({
      next: (res: any) => {
        this.showRejectReason = false;
        this.queryApprovedOrRejected = true;
        this.updatedQuery = this.query.selectedQuery;
        console.log('rejected query === ', res);
      },
      error: (err: any) => {
        console.log('error rejecting query === ', err);
      }
    });
  }

  saveQuery() {
    if (this.isQueryModified) {
      if (!this.draftQueryRequest.edited_reason || this.draftQueryRequest.edited_reason.trim() === '') {
        alert('Please provide a reason for the query modification.');

        // Optional: Focus on textbox
        setTimeout(() => {
          const reasonInput = document.getElementById('editedReasonInput');
          reasonInput?.focus();
        }, 0);

        return;
      }
      this.editedQueriesList.push({ query_id: this.query.selectedQuery.id!, edited_reason: this.draftQueryRequest.edited_reason });
      console.log('Edited Queries List:', this.editedQueriesList);

    }

    this.isEditMode = false;


    console.log('Query saved:', this.query.selectedQuery);
  }


  copyMessage(val: string) {
    this.commonService.copyMessage(val);
  }

  resetSelectedQuery() {
    this.query.selectedQuery = this.originalQuery;
    this.query.isQuerySelected = true;
    this.isQueryModified = false;
    this.isEditMode = false;
  }

  toggleSelectAll(event: any) {
    const isChecked = event.target.checked;
    this.queries.forEach(q => (q.selected = isChecked));

    console.log("which queries are selected", this.queries);
    console.log("which queries are selected", this.queries.filter(q => q.selected));
  }


  getSelectedQueries(): Query[] {
    return this.queries.filter(q => q.selected);
  }

  getBulkApproveQueryRequests(): BulkApproveQueryRequest[] {

    return this.queries
      .filter(q => q.selected)
      .map(q => {

        return {
          query_id: q.id!,
          status: 2, // Approval status
          query: q.query,
          title: q.title,
          user_id: this.user.staff_id,
          user_name: [
            this.user.first_name,
            this.user.middle_name,
            this.user.last_name
          ].filter(Boolean).join(' '),
          reject_reason: '',
          edited_reason: q.id === this.editedQueriesList.find(e => e.query_id === q.id)?.query_id ? this.editedQueriesList.find(e => e.query_id === q.id)?.edited_reason : ''
        };
      });
  }

  onRefreshBulkApproveQueries() {
    this.editedQueriesList = [];
  }

}
