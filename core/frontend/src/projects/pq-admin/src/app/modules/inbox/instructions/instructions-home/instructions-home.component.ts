import { Component, OnInit } from '@angular/core';
import { JobInstruction } from 'projects/pq-admin/src/app/models/inbox';
import { StorageService } from 'projects/pq-admin/src/app/services/app/storage/storage.service';
import { CommentsService } from 'projects/pq-admin/src/app/services/inbox/comments.service';

@Component({
  selector: 'app-instructions-home',
  templateUrl: './instructions-home.component.html',
  styleUrls: ['./instructions-home.component.scss']
})
export class InstructionsHomeComponent implements OnInit {

  jobInstruction: JobInstruction = JobInstruction.defaultJobInstructionList();
  comments: any[] = [];
  isCommentsLoading: boolean = false;
  conversationUsers: any[] = [];

  constructor(
    private commentsService: CommentsService,
    private storageService: StorageService
  ) { }

  ngOnInit(): void {
  }

  setupAmbience() {
    this.getJobInstructions(this.jobInstruction);
  }

  getJobInstructions(jobInstruction: JobInstruction) {
    this.isCommentsLoading = true;
    this.jobInstruction = jobInstruction;
    const body = {
      job_id: jobInstruction.Aid
    };
    this.commentsService.getCommentsByJobId(body).subscribe((res: any) => {
      this.isCommentsLoading = false;
      this.comments = res.data;
      this.comments = this.comments.reverse();

      if(res.users && res.users.length > 0) this.conversationUsers = res.users;

      setTimeout(() => {
        document.getElementById('comments')!.scrollTo({ top: document.getElementById('comments')!.scrollHeight, behavior: 'smooth' });
        console.log('comments element ', document.getElementById('comments')!.scrollHeight);
        console.log('comments-list element ', document.getElementById('comments-list')!.scrollHeight);
      }, 100);
    });
  }

  getJobInstructionNotes(jobInstruction: JobInstruction) {
    const body = {
      job_id: jobInstruction.Aid
    };

    
  }

  refreshJobInstructions() {
    this.getJobInstructions(this.jobInstruction);
  }

}
