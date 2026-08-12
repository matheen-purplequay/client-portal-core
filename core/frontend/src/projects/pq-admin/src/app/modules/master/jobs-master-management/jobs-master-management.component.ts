import { Component, OnInit } from '@angular/core';
import { ToastService } from 'pq-ui';

@Component({
  selector: 'app-jobs-master-management',
  templateUrl: './jobs-master-management.component.html',
  styleUrls: ['./jobs-master-management.component.scss']
})
export class JobsMasterManagementComponent implements OnInit {

  masterItems = {
    jobStatus: 'Job Status',
    standardInstructions: 'Standard Instructions'
  };

  filterMasterItems = {
    list: Object.values(this.masterItems),
    selectedItem: 'Job Status'
  };

  constructor(
    private toastService: ToastService
  ) { }

  ngOnInit(): void {
    this.setupAmbiance();
  }

  setupAmbiance() {
    this.getJobStatus();
    this.getStandardInstructions();
  }

  // Job Status
  getJobStatus() {}
  setJobStatus() {}

  // Standard Instructions
  getStandardInstructions() {}
  setStandardInstructions() {}
}
