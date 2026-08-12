import { Component, Input, OnInit } from '@angular/core';
import { MAX_ATTACHMENT_LIMIT, Query, QueryReply, QUERYRESPONSETYPE } from '../../models/queries';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { LocalStorageService } from 'projects/reports/src/app/services/app/storage/local-storage.service';
import { QueriesService } from 'projects/reports/src/app/services/dashboard/queries/queries.service';
import { SimpleTab, ToastService } from 'pq-ui';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-card-query-replies',
  templateUrl: './card-query-replies.component.html',
  styleUrls: ['./card-query-replies.component.scss']
})
export class CardQueryRepliesComponent implements OnInit {

  @Input() query: Query = Query.defaultQuery();
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
    value:  ''
  };

  newQueryResponseType: { tabs: SimpleTab[], selectedTab: SimpleTab } = {
    tabs: QUERYRESPONSETYPE,
    selectedTab: QUERYRESPONSETYPE[0]
  };

  // progress / status variables
  isGettingQueryReplies: boolean = false;
  isSendingQueryReply: boolean = false;
  showQueryReply: boolean = false;
  isTester: boolean = false;
  isTesterCanReply: boolean = false;

  constructor(
    private localStorageService: LocalStorageService,
    private queriesService: QueriesService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.user = this.localStorageService.getItem('userdata');
    this.queryReply.parent_query_id = this.query.id!;
    this.queryReply.posted_date = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
    if(this.user.is_tester) {
      this.isTester = true;
      this.queryReply.raised_by_name = this.localStorageService.getItem('wm_user').name;
      this.queryReply.raised_by_id = this.localStorageService.getItem('wm_user').wm_client_id;
    } else {
      this.queryReply.raised_by_id = this.user.client_id;
      this.queryReply.raised_by_name = `${this.user.first_name} ${this.user.last_name}`;
    }
    this.queryReply.query_code = this.query.query_code;
    this.queryReply.query = '';
    if(
      this.user.is_tester
    ) {
      if(
        this.localStorageService.getItem('userdata').role == 'admin' ||
        this.localStorageService.getItem('userdata').role == 'manager' ||
        this.localStorageService.getItem('userdata').role == 'team_lead'
      ) {
        this.isTesterCanReply = true;
      } else this.isTesterCanReply = false;
    } else {
      this.isTesterCanReply = true;
    }
    this.setupAmbiance();
  }

  setupAmbiance() {
    this.getSubQueries();
  }

  getSubQueries() {
    this.isGettingQueryReplies = true;
    this.queryReplies = [];
    const body = {
      queryId: this.query.id
    };
    this.queriesService.getSubQueriesForJob(body).subscribe({
      next: (res: any) => {
        this.isGettingQueryReplies = false;
        this.queryReplies = res.queries;
        if(res.status) {
          if(this.queryReplies.length > 0) {
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
        if(err.error && !err.error.status) {
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
    const attachmentTitle = attachment.title? attachment.title : `Document ${this.query.attachments.length + 1}`;
    const attachmentLink = attachment.link;
    if(attachmentLink) {
      this.queryReply.attachments.push({
        title: attachmentTitle, link: attachmentLink, user_id: this.user.client_id
      });
      this.queryReply.show_attachment_input = false;
    }
  }

  removeQueryAttachment = (index: number) => this.query.attachments.splice(index, 1);

  setReponseValue() {
    this.queryReply.response_value = this.requiredResponse.value;
  }

  confirmSendReply() {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to send this reply?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, send it',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.sendReply(); // Call actual send method
      }
    });
  }



  sendReply() {
    this.isSendingQueryReply = true;
    this.setReponseValue();
    let reply: QueryReply = this.queryReply;
    delete reply.show_attachment_input;
    reply.raised_by_type = "client";
    if(this.user.is_tester) {
      this.isTester = true;
      this.queryReply.raised_by_name = this.localStorageService.getItem('wm_user').name;
      this.queryReply.raised_by_id = this.localStorageService.getItem('wm_user').wm_client_id;
    } else {
      this.queryReply.raised_by_id = this.user.client_id;
      this.queryReply.raised_by_name = `${this.user.first_name} ${this.user.last_name}`;
    }
    console.log('query reply ', this.queryReply, this.user);
    this.queriesService.sendQueryReply(this.queryReply).subscribe({
      next: (res: any) => {
        this.isSendingQueryReply = false;
        Swal.close();
        Swal.fire('Sent!', 'Your reply has been sent.', 'success');
        this.queryReply = QueryReply.defaultQueryReply();
        this.showQueryReply = false;
        this.getSubQueries();
      },
      error: (err: any) => {
        this.isSendingQueryReply = false;
        Swal.close();
        Swal.fire('Error', 'Failed to send the reply.', 'error');
      }
    });
  }

  copyDescription(query: string) {
    navigator.clipboard.writeText(query);
    this.toastService.show('Description copied to clipboard', 'Copied', 'success');
  }
}
