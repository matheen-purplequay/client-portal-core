import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-dashboard-report-counts',
  templateUrl: './dashboard-report-counts.component.html',
  styleUrls: ['./dashboard-report-counts.component.scss']
})
export class DashboardReportCountsComponent implements OnInit {

  @Output() tabSelected: EventEmitter<any> = new EventEmitter();

  tabs = {
    all: { index: 0, label: 'All', code: 'all' },
    pending: { index: 1, label: 'Pending', code: 'pending' },
    approved: { index: 2, label: 'Approved', code: 'approved' },
    rejected: { index: 3, label: 'Rejected', code: 'rejected' }
  };

  filterTabs = {
    tabs: Object.values(this.tabs),
    selectedTab: this.tabs.all
  };

  @Input() counts = {
    totalClients: 0,
    availableReports: 0,
    unavailableReports: 0,
    rejectedReports: 0,
    approvedReports: 0,
    pendingApproval: 0
  };

  constructor() { }

  ngOnInit(): void {
    this.setupAmbience();
  }

  setupAmbience() {

  }

  emitTabSelected(tab: string) {
    this.tabSelected.emit(tab);
  }

  handleFilterTabs(event: any) {
    if(this.filterTabs.selectedTab == event) this.filterTabs.selectedTab = this.tabs.all;
    else this.filterTabs.selectedTab = event;

    this.tabSelected.emit(this.filterTabs.selectedTab);
  }

}
