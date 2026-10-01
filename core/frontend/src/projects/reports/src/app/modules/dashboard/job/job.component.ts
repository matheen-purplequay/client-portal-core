import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ClientService } from '../../../services/entities/client.service';
import { ReportService } from '../../../services/reports/report.service';
import { LocalStorageService } from '../../../services/app/storage/local-storage.service';
import { ClientUserService } from '../../../shared/services/navquery/wm-client.service';

/**
 * "Job" — Job Status landing page. Select a vertical, see the Open/Closed
 * jobs summary cards. Reuses the same SP as the Home page's Jobs panel for
 * Open Jobs (Sp_JobListingLiveCounts) and a dedicated SP for Closed Jobs
 * (Sp_JobListingClosedCounts).
 */
@Component({
  selector: 'app-job',
  templateUrl: './job.component.html',
  styleUrls: ['./job.component.scss']
})
export class JobComponent implements OnInit, OnDestroy {
  private clientUserSub?: Subscription;

  verticals: { id: number, title: string }[] = [];
  selectedServiceId = 0;
  isLoadingVerticals = true;

  isLoadingOpen = true;
  totalLiveJobs: number | string = '-';
  withCarisma: number | string = '-';
  withClient: number | string = '-';

  isLoadingClosed = true;
  totalClosed: number | string = '-';
  closedThisMonth: number | string = '-';
  closedLastMonth: number | string = '-';

  constructor(
    private clientService: ClientService,
    private reportService: ReportService,
    private localStorageService: LocalStorageService,
    private clientUserService: ClientUserService
  ) { }

  ngOnInit(): void {
    this.fetchVerticals();
    this.loadOpenCounts();
    this.loadClosedCounts();

    // Keep the counts in sync when the navbar's client-user (Cid) dropdown
    // changes, since this page otherwise only reads it once via
    // getSelectedContactId() inside ReportService.
    this.clientUserSub = this.clientUserService.userChanged$.subscribe(() => {
      this.loadOpenCounts();
      this.loadClosedCounts();
    });
  }

  ngOnDestroy(): void {
    this.clientUserSub?.unsubscribe();
  }

  // Mirrors DashboardPageComponent.fetchVerticals() / BudgetOverviewComponent.fetchVerticals().
  fetchVerticals() {
    this.isLoadingVerticals = true;
    const body = {
      client_id: this.localStorageService.getItem('userdata').company_id
    };
    this.clientService.getClientVerticals(body).subscribe({
      next: (res: any) => {
        this.isLoadingVerticals = false;
        const rows = (res.status && Array.isArray(res.data)) ? res.data : [];
        const byId = new Map<number, string>();
        rows.forEach((row: any) => {
          if (row.new_service_id != null && !byId.has(row.new_service_id)) {
            byId.set(row.new_service_id, row.title);
          }
        });
        this.verticals = Array.from(byId, ([id, title]) => ({ id, title }));
      },
      error: () => {
        this.isLoadingVerticals = false;
        this.verticals = [];
      }
    });
  }

  selectVertical(id: number) {
    if (this.selectedServiceId === id) return;
    this.selectedServiceId = id;
    this.loadOpenCounts();
    this.loadClosedCounts();
  }

  loadOpenCounts() {
    this.isLoadingOpen = true;
    this.reportService.getJobsLiveCounts(this.selectedServiceId).subscribe({
      next: (res: any) => {
        this.isLoadingOpen = false;
        if (res?.status && res.data) {
          this.totalLiveJobs = res.data.total_live_jobs ?? 0;
          this.withCarisma = res.data.with_carisma ?? 0;
          this.withClient = res.data.with_client ?? 0;
        }
      },
      error: () => {
        this.isLoadingOpen = false;
      }
    });
  }

  loadClosedCounts() {
    this.isLoadingClosed = true;
    this.reportService.getJobsClosedCounts(this.selectedServiceId).subscribe({
      next: (res: any) => {
        this.isLoadingClosed = false;
        if (res?.status && res.data) {
          this.totalClosed = res.data.closed ?? 0;
          this.closedThisMonth = res.data.this_month_closed ?? 0;
          this.closedLastMonth = res.data.last_month_closed ?? 0;
        }
      },
      error: () => {
        this.isLoadingClosed = false;
      }
    });
  }
}
