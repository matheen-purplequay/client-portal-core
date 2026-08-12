import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { MAX_ATTACHMENT_LIMIT, QUERYRESPONSETYPE, Query, QueryReply } from '../../models/queries';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { StorageService } from 'projects/pq-admin/src/app/services/app/storage/storage.service';
import { QueriesService } from 'projects/pq-admin/src/app/services/inbox/queries.service';
import { SimpleTab } from 'pq-ui';
import { sub } from 'date-fns';

@Component({
  selector: 'app-card-query-replies',
  templateUrl: './card-query-replies.component.html',
  styleUrls: ['./card-query-replies.component.scss']
})
export class CardQueryRepliesComponent implements OnInit, OnChanges {

  @Output() queryReplied = new EventEmitter<QueryReply>();
  @Output() typed = new EventEmitter<boolean>();
  @Output() queryEdited = new EventEmitter<string>();
  @Output() queryResolved = new EventEmitter<Query>();
  @Output() subQueryNeedsApproval = new EventEmitter<Boolean>(false);
  @Input() query: Query = Query.defaultQuery();
  @Input() hideReplies: boolean = false;
  @Input() isEditMode: boolean = false;
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
  doesReplyQueryRequiresResponse: boolean = false;
  user: any;

  queryReplies: QueryReply[] = [];
  queryReply: QueryReply = QueryReply.defaultQueryReply();

  requiredResponse = {
    type: '',
    description: '',
    value: ''
  };

  editorData: string = '';


  newQueryResponseType: { tabs: SimpleTab[], selectedTab: SimpleTab } = {
    tabs: QUERYRESPONSETYPE,
    selectedTab: QUERYRESPONSETYPE[0]
  };

  // progress / status variables
  isGettingQueryReplies: boolean = false;
  isSendingQueryReply: boolean = false;
  showQueryReply: boolean = false;
  isResolvingQuery: boolean = false;

  isSubQueryNeedApprove: boolean = false;

  constructor(
    private storageService: StorageService,
    private queriesService: QueriesService
  ) { }

  ngOnInit(): void {
    this.user = this.storageService.getItem('userdata');
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['query']) {
      this.queryReply = QueryReply.defaultQueryReply();
      this.queryReply.parent_query_id = this.query.id!;
      this.queryReply.raised_by_id = this.storageService.getItem('userdata').staff_id;
      if (this.isEditMode) this.editorData = this.query.query;
      this.queryReply.posted_date = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
      if (this.storageService.getItem('userdata').role == 'associate') {
        this.queryReply.raised_by_name = `Carisma Associate`;
      } else {
        this.queryReply.raised_by_name = `${this.storageService.getItem('userdata').first_name} ${this.storageService.getItem('userdata').last_name}`;
      }
      this.queryReply.query_code = this.query.query_code;
      console.log('query in query replies ', this.query, this.queryReply);
      this.setupAmbiance();
    }
    if (changes['isEditMode']) {
      if (this.isEditMode) {
        this.editorData = this.query.query;
      }
    }
  }

  setupAmbiance() {
    if (this.query.id != undefined && this.query.id != 0) {
      this.getSubQueries();
    } else console.log('query id is not defined or zero, cannot get sub queries');
  }

  getSubQueries() {
    this.isGettingQueryReplies = true;
    this.queryReplies = [];
    const body = {
      filters: [
        { key: 'parent_query_id', value: this.query.id },
      ],
      queryId: this.query.id
    };
    this.queriesService.getSubQueries(body).subscribe({
      next: (res: any) => {
        this.isGettingQueryReplies = false;
        this.queryReplies = res.queries;
        this.isSubQueryNeedApprove = this.queryReplies.some(reply => {
          console.log(' reply status id ', reply.status_id, reply.status_code, this.isSubQueryNeedApprove);
          return reply.status_id == 66;
        });
        if (res.status) {
          if (this.queryReplies.length > 0) {
            this.requiredResponse.description = this.queryReplies[this.queryReplies.length - 1].response_type_description;
            this.requiredResponse.type = this.queryReplies[this.queryReplies.length - 1].response_type;
          } else {
            this.requiredResponse.description = this.query.response_type_description;
            this.requiredResponse.type = this.query.response_type;
          }
        } else {
          this.requiredResponse.description = this.query.response_type_description;
          this.requiredResponse.type = this.query.response_type;
        }
        console.log('response type ', this.requiredResponse);
      },
      error: (err: any) => {
        if (err.error && !err.error.status) {
          this.requiredResponse.description = this.query.response_type_description;
          this.requiredResponse.type = this.query.response_type;
          console.log('response type ', this.requiredResponse, err);
        }
        this.queryReplies = [];
        this.isGettingQueryReplies = false;
      }
    });
  }

  setNewQueryAttachment(attachment: { title: string, link: string }) {
    const attachmentTitle = attachment.title ? attachment.title : `Document ${this.query.attachments.length + 1}`;
    const attachmentLink = attachment.link;
    if (attachmentLink) {
      this.queryReply.attachments.push({
        title: attachmentTitle, link: attachmentLink, user_id: this.user.staff_id
      });
      this.queryReply.show_attachment_input = false;
    }
  }

  resetQueryReply() {
    this.queryReply.query = "";
    this.editorData = "";
    this.queryReply.response_type = QUERYRESPONSETYPE[0].data.code;
    this.queryReply.response_type_description = "";
    this.queryReply.response_value = "";
    this.doesReplyQueryRequiresResponse = false;
  }

  removeQueryAttachment = (index: number) => this.query.attachments.splice(index, 1);

  sendReply() {
    this.isSendingQueryReply = true;
    let reply: QueryReply = this.queryReply;
    delete reply.show_attachment_input;
    reply.raised_by_type = "internal";
    this.queriesService.sendQueryReply(reply).subscribe({
      next: (res: any) => {
        this.isSendingQueryReply = false;
        this.resetQueryReply();
        this.queryReplied.emit(this.queryReply);
        this.getSubQueries();
      },
      error: (err: any) => {
        this.isSendingQueryReply = false;
      }
    });
  }

  saveQuery() {
    this.typed.emit(true);
  }



  emitModified(event: any) {
    const editorData = event.editor.getData();
    this.editorData = editorData; // Update local variable only
    this.queryReply.query = editorData;
    this.queryEdited.emit(editorData);
    this.saveQuery();
  }



  getQueryDescription(): string {
    // If there's an edited value, return that
    if (this.query.query && this.query.query.trim().length > 0) {
      return this.query.query;
    }

    // Otherwise, fallback to original
    return this.query.query;
  }

  markAsResolved() {
    if (this.query.id) {
      this.isResolvingQuery = true;

      this.queriesService.resolveQuery(this.query.id).subscribe({
        next: (res: any) => {
          this.isResolvingQuery = false;
          this.queryResolved.emit();
          this.query.query_status_id = 4;
          this.query.query_status_name = "Resolved";
        },
        error: (err: any) => {
          this.isResolvingQuery = false;
        }
      });
    }
  }

  approveSubQuery(subQuery: QueryReply) {
    console.log('sub query ', subQuery);
    subQuery.query_id = subQuery.id;
    subQuery.status_id = 67;
    subQuery.user_id = this.storageService.getItem('userdata').staff_id;
    subQuery.user_name = `${this.storageService.getItem('userdata').first_name} ${this.storageService.getItem('userdata').last_name}`;
    subQuery.edited_reason = '';
    subQuery.reject_reason = '';
    this.queriesService.approveDraftSubQuery(subQuery).subscribe({
      next: (res: any) => {
        this.subQueryNeedsApproval.emit(false);
        this.isSubQueryNeedApprove = false;
        this.getSubQueries();
        console.log('approved sub query === ', res);
      },
      error: (err: any) => {
        console.log('error approving sub query === ', err);
      }
    });
  }

  rejectSubQuery(subQuery: QueryReply) {
    console.log('sub query ', subQuery);
    subQuery.query_id = subQuery.id;
    subQuery.status_id = 68;
    subQuery.user_id = this.storageService.getItem('userdata').staff_id;
    subQuery.user_name = `${this.storageService.getItem('userdata').first_name} ${this.storageService.getItem('userdata').last_name}`;
    subQuery.edited_reason = '';
    const subDraftRejectReason = prompt("Please provide a reason for rejection:");

    if (subDraftRejectReason === null) {
      // User pressed Cancel
      alert("Sub query not rejected due to user cancellation.");
      return;
    } else if (subDraftRejectReason.trim().length === 0) {
      // User pressed OK but gave empty input (or just spaces)
      alert("Please provide a reason for rejection");
      return;
    } else {
      // Valid input
      subQuery.reject_reason = subDraftRejectReason;
    }

    this.queriesService.rejectDraftSubQuery(subQuery).subscribe({
      next: (res: any) => {
        this.subQueryNeedsApproval.emit(false);
        this.isSubQueryNeedApprove = false;
        this.getSubQueries();
        console.log('rejected sub query === ', res);
      },
      error: (err: any) => {
        console.log('error rejecting sub query === ', err);
      }
    });
  }

}
