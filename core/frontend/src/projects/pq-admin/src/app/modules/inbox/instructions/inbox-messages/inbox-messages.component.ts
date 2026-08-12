import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ToastService } from 'pq-ui';
import { JobInstruction } from 'projects/pq-admin/src/app/models/inbox';
import { StorageService } from 'projects/pq-admin/src/app/services/app/storage/storage.service';
import { CommentsService } from 'projects/pq-admin/src/app/services/inbox/comments.service';

interface Comments {
  comment_id: number;
  job_id: number;
  user_id: number;
  comment: string;
  commented_date: Date;
  status: 0 | 1;
}

interface CommentCode {
  code: number;
  title: string;
}

class CommentCode {
  static defaultCommentCode() {
    return {
      code: 0,
      title: ""
    } as CommentCode;
  }
}


@Component({
  selector: 'app-inbox-messages',
  templateUrl: './inbox-messages.component.html',
  styleUrls: ['./inbox-messages.component.scss']
})
export class InboxMessagesComponent implements OnInit {

  @Output() sentComment: EventEmitter<boolean> = new EventEmitter();
  @Output() loaded: EventEmitter<number> = new EventEmitter();
  @Input() job: JobInstruction = JobInstruction.defaultJobInstructionList();
  @Input() jobID: any;
  @Input() project_id: number = 0;
  @Input() comments: any;
  @Input() isCommentsLoading: boolean = false;

  originalComments: CommentCode[] = [];
  dropDownComments: {
    list: CommentCode[],
    selectedComment: CommentCode,
    keys: { key: string, value: string }
  } = {
    list: [],
    selectedComment: CommentCode.defaultCommentCode(),
    keys: { key: 'index', value: 'title' }
  };
  comment: string = '';
  isCustomInstruction: boolean = false;
  customInstruction: string = '';
  isCommentCodesLoading: boolean = false;
  isCommentCodesLoaded: boolean = false;

  isSendingComment: boolean = false;
  user_id: number = 0;

  @Input() toggleNewView: boolean = false;
  maxCharsForComments = 150;

  commentsError: string = '';

  constructor(
    private localStorageService: StorageService,
    private commentsService: CommentsService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.getCommentCodes();
  }
  
  ngAfterViewInit(): void {
    this.setupAmbience();
  }

  setupAmbience() {
    this.user_id = this.localStorageService.getItem('userdata').user_id;
    // this.getComments();
  }


  getCommentCodes() {
    this.isCommentCodesLoading = true;
    this.commentsService.getCommentCodes().subscribe((res: any) => {
      this.isCommentCodesLoaded = true;
      this.isCommentCodesLoading = false;
      this.dropDownComments.list = res.data;
      this.originalComments = res.data;
      this.dropDownComments.selectedComment = res.data[0];
    });
  }

  getComments(job_id: number = 0) {
    this.isCommentsLoading = true;
    if(job_id != 0 ) this.jobID = job_id;
    const body = {
      job_id: this.jobID
    };

    this.commentsService.getCommentsByJobId(body).subscribe((res: any) => {
      this.isCommentsLoading = false;
      if(res.status) {
        console.log('get comments ', res);
        this.comments = res.data;
      }
    }, error => {
      this.isCommentsLoading = false;
    });
  }

  sendComment() {
    if(this.comment) {
      this.isSendingComment = true;
      const body = {
        job_id: this.jobID,
        user_id: this.localStorageService.getItem('userdata').user_id,
        client_id: this.project_id,
        comment_type: 1,
        comments: this.dropDownComments.selectedComment.title,
        comment_code: this.dropDownComments.selectedComment.code,
        code: 0
      };
      
      console.log('send ', body);
      this.commentsService.sendComment(body).subscribe({
        next: (res: any) => {
          this.isSendingComment = false;
          if(res.status) {
            this.resetComment();
            // this.getComments();
            this.sentComment.emit(true);
          }
        },
        error: (err: any) => {
          this.isSendingComment = false;
          this.toastService.show('Something went wrong', 'Some error occured while sending your comment. Please contact your system administrator.', 'error', true);
        }
      });
    }
  }

  handleInstruction(event: any) {
    if(this.dropDownComments.list.filter(comment => comment.title.toLowerCase() === event.toLowerCase()).length > 0) {
      this.dropDownComments.selectedComment = this.dropDownComments.list.filter(comment => comment.title.toLowerCase() === event.toLowerCase())[0]
    }
    else  {
      this.dropDownComments.selectedComment.code = 999;
      this.dropDownComments.selectedComment.title = event;
    }
    this.dropDownComments.list = this.originalComments;
  }

  markAsRead() {
    const body = {
      job_id: this.job.Aid,
      comment_viewed_by: this.localStorageService.getItem('userdata').user_id,
      comment_view_status: 1
    };
    this.commentsService.updateCommentStatus(body).subscribe({
      next: (res: any) => {},
      error: (err: any) => {}
    });
  }

  resetComment() {
    this.dropDownComments.selectedComment = CommentCode.defaultCommentCode();
    this.isCustomInstruction = false;
    this.customInstruction = '';
  }
}
