import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { JobInstruction } from 'projects/pq-admin/src/app/models/inbox';
import { StorageService } from 'projects/pq-admin/src/app/services/app/storage/storage.service';
import { CommentsService } from 'projects/pq-admin/src/app/services/inbox/comments.service';

@Component({
  selector: 'app-inbox-list',
  templateUrl: './inbox-list.component.html',
  styleUrls: ['./inbox-list.component.scss']
})
export class InboxListComponent implements OnInit {

  @Output() selected: EventEmitter<JobInstruction> = new EventEmitter();

  jobInstructions: JobInstruction[] = [];
  jobInstruction: JobInstruction = JobInstruction.defaultJobInstructionList();
  isJobInstructionsLoading: boolean = false;
  conversationUsers: any[] = [];

  viewStatusTypes = {
    0: { index: 0, label: 'Unread' },
    1: { index: 1, label: 'Read' }
  };

  filterViewStatusTypes = {
    list: Object.values(this.viewStatusTypes),
    selectedViewStatus: this.viewStatusTypes[0]
  };

  constructor(
    private commentsService: CommentsService,
    private storageService: StorageService
  ) { }

  ngOnInit(): void {
    this.setupAmbience();
  }

  setupAmbience() {
    this.getJobInstructions();
  }

  getJobInstructions() {
    this.isJobInstructionsLoading = true;
    const body = {
      wm_user_id: this.storageService.getItem('userdata').wm_user_id,
      status: this.filterViewStatusTypes.selectedViewStatus.index
    };
    this.commentsService.getComments(body).subscribe((res: any) => {
      this.isJobInstructionsLoading = false;
      if(res.status) {
        this.jobInstructions = res.data;
        if(res.data.length > 0) {
          this.setSelectedJobInstruction(res.data[0]);
        }
      }
    });
  }

  setSelectedJobInstruction(jobInstruction: JobInstruction) {
    this.jobInstruction = jobInstruction;
    this.selected.emit(jobInstruction);
  }

}
