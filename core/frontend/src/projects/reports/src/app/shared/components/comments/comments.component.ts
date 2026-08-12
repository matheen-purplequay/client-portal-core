import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { LocalStorageService } from '../../../services/app/storage/local-storage.service';
import { CommentsService } from '../../../services/entities/comments.service';
import { ToastService } from 'pq-ui';
import { BehaviorSubject, Observable } from 'rxjs';
import { CommentCode, Job } from '../../../models/jobs';
import { JobStatusService } from '../../../services/dashboard/job-status/job-status.service';

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss']
})
export class CommentsComponent implements OnInit, AfterViewInit {

  @Output() sentComment: EventEmitter<Job> = new EventEmitter();
  @Output() loaded: EventEmitter<number> = new EventEmitter();
  @Input() job: any | undefined = undefined;

  commentsStatus = {
    1: { index: 100, label: '100 - Thank you team. Please mark as sent to audit.' },
    2: { index: 200, label: '200 - Please start this fund as a priority.' },
    3: { index: 300, label: '300 - Responses now received. Please continue processing the 2023 fund.' },
    4: { index: 400, label: 'Custom Instruction' }
  }

  dropDownComments: {
    list: Comment[],
    selectedComment: CommentCode,
    keys: { key: string, value: string }
  } = {
    list: [],
    selectedComment: CommentCode.defaultCommentCode(),
    keys: { key: 'index', value: 'title' }
  };
  isCustomInstruction: boolean = false;
  customInstruction: string = '';
  isCommentCodesLoading: boolean = false;
  isCommentCodesLoaded: boolean = false;

  comments: any[] = [];
  isCommentsLoading: boolean = false;
  isSendingComment: boolean = false;
  user_id: number = 0;

  @Input() toggleNewView: boolean = false;
  maxCharsForComments = 150;

  commentMessage: { message: string, type: "success" | "error" } = {
    message: "",
    type: "success"
  };

  constructor(
    private localStorageService: LocalStorageService,
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
    this.getComments(this.job);
  }

  getCommentCodes() {
    this.isCommentCodesLoading = true;
    this.commentsService.getCommentCodes().subscribe((res: any) => {
      this.isCommentCodesLoaded = true;
      this.isCommentCodesLoading = false;
      this.dropDownComments.list = res.data;
      this.dropDownComments.selectedComment = res.data[0];
    });
  }

  getComments(job?: any) {
    if(!job) this.job = job;
    this.isCommentsLoading = true;
    // console.log('job in comments ', job, this.job, (!job));
    const body = {
      job_id: job.Aid
    };

    this.commentsService.getComments(body).subscribe((res: any) => {
      this.isCommentsLoading = false;
      // this.loaded.emit(document.getElementById('jobDetailsPopupContentColumn')!.scrollHeight);
      if(res.status) {
        const users = res.users;
        
        res.data.forEach((comment: any) => {
          const user = users.find((u: any) => u.id === comment.UserId);
          console.log('comment in loop ', comment, user, users);
          if (user) {
            comment['username'] = user.first_name + ' ' + user.last_name;
            comment['profile_picture'] = user.profile_picture;
          }
        });
        this.comments = res.data.reverse();
        setTimeout(() => {
          document.getElementById('jobCommentsPopup')!.scrollTo({ top: document.getElementById('jobDetailsPopupContentColumn')!.scrollHeight, behavior: 'smooth' });
        }, 100);
        setTimeout(() => {
          if(this.job.CommentViewStatus == 2) this.markAsRead();
        }, 1000);
        // console.log('get comments ', this.comments);
      }
    });
  }

  sendComment() {
    const comment = (this.isCustomInstruction)? this.customInstruction : this.dropDownComments.selectedComment.title;
    if(comment == '') {
      this.toastService.show('Please add a valid comment and try again.', 'Need valid comment', 'warning', true);
      return;
    }
    this.isSendingComment = true;
    const job = this.job;
    const body = {
      job_id: this.job.Aid,
      user_id: this.localStorageService.getItem('userdata').user_id,
      client_id: this.localStorageService.getItem('userdata').project_id,
      comment_type: 1,
      comments: (this.isCustomInstruction)? this.customInstruction : this.dropDownComments.selectedComment.title,
      comment_code: (this.isCustomInstruction)? 999 : this.dropDownComments.selectedComment.code,
      code: (this.job.code)? this.job.code : 0
    };

    this.commentsService.sendComment(body).subscribe({
      next: (res: any) => {
        this.isSendingComment = false;
        if(res.status) {
          this.sentComment.emit(job);
          this.commentMessage.type = "success";
          this.commentMessage.message = 'Your instruction has been posted';
          this.resetComment();
          this.getComments(job);
        } else {
          this.commentMessage.type = "error";
          this.commentMessage.message = 'Something went wrong while sending the instruction. Please try again after some time.';
        }
        setTimeout(() => {
          this.commentMessage.message = '';
        }, 2000);
      },
      error: (err: any) => {
        this.isSendingComment = false;
        this.commentMessage.type = "error";
        this.commentMessage.message = 'Something went wrong while sending the instruction. Please try again after some time.';
        setTimeout(() => {
          this.commentMessage.message = '';
        }, 2000);
      }
    });
  }

  markAsRead() {
    console.log('marking comments as read');
    const body = {
      job_id: this.job.Aid,
      comment_viewed_by: this.localStorageService.getItem('userdata').user_id
    };
    this.commentsService.markAsRead(body).subscribe({
      next: (res: any) => {

      },
      error: (err: any) => {}
    });
  }

  handleCharsForComments() {
    if(this.customInstruction.length > this.maxCharsForComments) this.customInstruction.substring(0, this.maxCharsForComments);
  }

  handleInstruction(event: any) {
    this.dropDownComments.selectedComment = event;
    this.isCustomInstruction = (this.dropDownComments.selectedComment.code == this.commentsStatus[4].index);
  }

  resetComment() {
    this.dropDownComments.selectedComment = CommentCode.defaultCommentCode();
    this.comments = [];
    this.isCustomInstruction = false;
    this.customInstruction = '';
  }

  setComments(comment: string) {
    this.comments.push({
      user: `${this.localStorageService.getItem('userdata').first_name} ${this.localStorageService.getItem('userdata').last_name}`,
      comment: comment,
      timestamp: `Sent on ${new Date().getDate()}-${new Date().getMonth() + 1}-${new Date().getFullYear()} ${new Date().getHours()}:${new Date().getMinutes()}`
    })
  }
}
