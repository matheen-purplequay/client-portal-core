import { Component, OnInit } from '@angular/core';
import { JobInstruction } from '../../../models/inbox';
import { StorageService } from '../../../services/app/storage/storage.service';
import { CommentsService } from '../../../services/inbox/comments.service';

@Component({
  selector: 'app-inbox-master',
  templateUrl: './inbox-master.component.html',
  styleUrls: ['./inbox-master.component.scss']
})
export class InboxMasterComponent implements OnInit {

  data: any;

  inboxViewsList = {
    instructions: { index: 1, label: 'Instructions' },
    queries: { index: 3, label: 'Queries' },
    feedback: { index: 2, label: 'Feedback' },
  };

  inboxViews = {
    list: Object.values(this.inboxViewsList),
    selectedView: this.inboxViewsList.queries,
    keys: { key: 'index', value: 'label' }
  };
  
  constructor(
    private storageService: StorageService
  ) { }

  ngOnInit(): void {
    this.setupAmbience();
  }

  setupAmbience() {
    this.data = this.storageService.getItem('userdata');

  }
  
}
