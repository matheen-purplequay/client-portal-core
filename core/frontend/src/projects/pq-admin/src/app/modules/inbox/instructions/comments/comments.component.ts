import { Component, Input, OnInit } from '@angular/core';
import { ToastService } from 'pq-ui';
import { StorageService } from 'projects/pq-admin/src/app/services/app/storage/storage.service';
import { CommentsService } from 'projects/pq-admin/src/app/services/inbox/comments.service';

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss']
})
export class CommentsComponent implements OnInit {

  @Input() jobID: number = 0;
  
  commentsStatus = {
    1: { index: 1, label: 'Standard Instructions 1' },
    2: { index: 2, label: 'Standard Instructions 2' },
    3: { index: 3, label: 'Standard Instructions 3' },
    4: { index: 4, label: 'Custom Instruction' }
  }

  dropDownComments = {
    list: Object.values(this.commentsStatus),
    selectedComment: this.commentsStatus[1],
    keys: { key: 'index', value: 'label' }
  };
  isCustomInstruction: boolean = false;
  customInstruction: string = '';

  comments: any[] = [];
  isCommentsLoading: boolean = false;
  isSendingComment: boolean = false;
  user_id: number = 0;

  @Input() toggleNewView: boolean = false;

  constructor(
    private localStorageService: StorageService,
    private commentsService: CommentsService,
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
  }
  
  ngAfterViewInit(): void {
  this.setupAmbience();
  }

  setupAmbience() {
    this.user_id = this.localStorageService.getItem('userdata').user_id;
    this.getComments();
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
        document.getElementById('jobDetailsPopupContent')!.scrollTo({ top: document.getElementById('jobDetailsPopupContentColumn')!.scrollHeight, behavior: 'smooth' });
      }
    }, error => {
      this.isCommentsLoading = false;
    });
  }

  sendComment() {
    this.isSendingComment = true;
    const body = {
      job_id: this.jobID,
      user_id: this.localStorageService.getItem('userdata').user_id,
      comment: (this.isCustomInstruction)? this.customInstruction : this.dropDownComments.selectedComment.label
    };

    this.commentsService.sendComment(body).subscribe((res: any) => {
      this.isSendingComment = false;
      if(res.status) {
        this.resetComment();
        this.getComments();
      }
    });
  }

  handleInstruction(event: any) {
    this.dropDownComments.selectedComment = event;
    this.isCustomInstruction = (this.dropDownComments.selectedComment.index == this.commentsStatus[4].index);
  }

  resetComment() {
    this.dropDownComments.selectedComment = this.commentsStatus[1];
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
