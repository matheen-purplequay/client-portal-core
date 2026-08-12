import { Component, Input, OnInit } from '@angular/core';
import { JobInstruction } from 'projects/pq-admin/src/app/models/inbox';

@Component({
  selector: 'app-inbox-toolbar',
  templateUrl: './inbox-toolbar.component.html',
  styleUrls: ['./inbox-toolbar.component.scss']
})
export class InboxToolbarComponent implements OnInit {

  @Input() job: JobInstruction = JobInstruction.defaultJobInstructionList();

  constructor() { }

  ngOnInit(): void {
  }

}
