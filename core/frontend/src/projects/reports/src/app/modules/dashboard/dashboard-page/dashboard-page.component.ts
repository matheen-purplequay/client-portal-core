import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ClientService } from '../../../services/entities/client.service';
import { LocalStorageService } from '../../../services/app/storage/local-storage.service';
import { ReportService } from '../../../services/reports/report.service';
import { ClientUserService } from '../../../shared/services/navquery/wm-client.service';

interface VerticalOption {
  id: number;
  title: string;
}

@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.scss']
})
export class DashboardPageComponent implements OnInit, OnDestroy {

  jobsSummary = {
    open: 0,
    closed: 0
  };
  isLoadingJobsSummary = false;

  productionSummary = {
    jobsThisMonth: 0,
    productiveHours: '0'
  };
  isLoadingProductionSummary = false;

  // Production Report shows the last COMPLETED month, not the current
  // (possibly partial) one — e.g. on any day of September this reads August.
  previousMonthYear = this.formatMonthYear(new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1));

  turnaroundSummary = {
    averageTat: '0 days',
    totalClosedJobs: 0
  };
  isLoadingTurnaroundSummary = false;

  budgetSummary = {
    underBudget: 0,
    overBudget: 0
  };
  isLoadingBudgetSummary = false;

  feedbackSummary = {
    closedJobs: 0,
    pendingFeedback: 0
  };
  isLoadingFeedbackSummary = false;

  movementSummary = {
    newJobs: 0,
    allMovement: 0
  };
  isLoadingMovementSummary = false;

  momSummary = {
    meetingsThisMonth: 0
  };
  isLoadingMomSummary = false;

  dashboardFilters = {
    fromDate: this.formatDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
    toDate: this.formatDate(new Date())
  };

  // Same client-scoped vertical source the Job Status menu uses
  // (ClientService.getClientVerticals, backed by engagement_verticals) —
  // NOT the global coemaster list, since that includes verticals the
  // current client isn't actually engaged for.
  verticals: VerticalOption[] = [];
  selectedVerticalId = 0; // 0 = All
  isLoadingVerticals = false;

  private wmUserSubscription?: Subscription;

  constructor(
    private router: Router,
    private clientService: ClientService,
    private localStorageService: LocalStorageService,
    private reportService: ReportService,
    private clientUserService: ClientUserService
  ) { }

  ngOnInit(): void {
    this.fetchVerticals();
    this.fetchAllSummaries();

    // The navbar resolves the selected client contact (wm_user, used for
    // __Cid) asynchronously after login and only then emits this event —
    // on first load that can land after the fetches above already ran
    // with a stale/missing contact id, so refetch once it arrives.
    this.wmUserSubscription = this.clientUserService.userChanged$.subscribe(() => {
      this.fetchAllSummaries();
    });
  }

  ngOnDestroy(): void {
    this.wmUserSubscription?.unsubscribe();
  }

  fetchAllSummaries() {
    this.fetchJobsSummary();
    this.fetchProductionSummary();
    this.fetchBudgetSummary();
    this.fetchMovementSummary();
    this.fetchTurnaroundSummary();
    this.fetchFeedbackSummary();
    this.fetchMomSummary();
  }

  fetchMomSummary() {
    this.isLoadingMomSummary = true;
    this.reportService.getMOMCount().subscribe({
      next: (res: any) => {
        this.isLoadingMomSummary = false;
        if (res.status && res.data) {
          this.momSummary = { meetingsThisMonth: res.data.meetings_this_month ?? 0 };
        }
      },
      error: () => {
        this.isLoadingMomSummary = false;
      }
    });
  }

  fetchFeedbackSummary() {
    this.isLoadingFeedbackSummary = true;
    this.reportService.getClosedJobsFeedbackCount(this.selectedVerticalId).subscribe({
      next: (res: any) => {
        this.isLoadingFeedbackSummary = false;
        if (res.status && res.data) {
          this.feedbackSummary = {
            closedJobs: res.data.closed_jobs ?? 0,
            pendingFeedback: res.data.pending_feedback ?? 0
          };
        }
      },
      error: () => {
        this.isLoadingFeedbackSummary = false;
      }
    });
  }

  fetchTurnaroundSummary() {
    this.isLoadingTurnaroundSummary = true;
    this.reportService.getTurnaroundReport(this.selectedVerticalId).subscribe({
      next: (res: any) => {
        this.isLoadingTurnaroundSummary = false;
        if (res.status && res.data) {
          this.turnaroundSummary = {
            averageTat: `${res.data.avg_working_days ?? 0} days`,
            totalClosedJobs: res.data.total_jobs_closed ?? 0
          };
        }
      },
      error: () => {
        this.isLoadingTurnaroundSummary = false;
      }
    });
  }

  fetchMovementSummary() {
    this.isLoadingMovementSummary = true;
    this.reportService.getMovementSummary(this.dashboardFilters.fromDate, this.dashboardFilters.toDate, this.selectedVerticalId).subscribe({
      next: (res: any) => {
        this.isLoadingMovementSummary = false;
        if (res.status && res.data) {
          this.movementSummary = {
            newJobs: res.data.new_jobs ?? 0,
            allMovement: res.data.all_movement ?? 0
          };
        }
      },
      error: () => {
        this.isLoadingMovementSummary = false;
      }
    });
  }

  fetchBudgetSummary() {
    this.isLoadingBudgetSummary = true;
    this.reportService.getBudgetOverviewCount(this.selectedVerticalId).subscribe({
      next: (res: any) => {
        this.isLoadingBudgetSummary = false;
        if (res.status && res.data) {
          this.budgetSummary = {
            underBudget: res.data.under_budget ?? 0,
            overBudget: res.data.over_budget ?? 0
          };
        }
      },
      error: () => {
        this.isLoadingBudgetSummary = false;
      }
    });
  }

  fetchProductionSummary() {
    this.isLoadingProductionSummary = true;
    this.reportService.getProductivityReport(this.previousMonthYear, this.selectedVerticalId).subscribe({
      next: (res: any) => {
        this.isLoadingProductionSummary = false;
        const rows = (res.status && Array.isArray(res.data)) ? res.data : [];

        const totalJobs = rows.reduce((sum: number, row: any) => sum + (Number(row.ReceivedJobs) || 0), 0);
        const totalProductiveHours = rows.reduce((sum: number, row: any) => sum + (Number(row.total_hours_without_overheads) || 0), 0);

        this.productionSummary = {
          jobsThisMonth: totalJobs,
          productiveHours: Math.round(totalProductiveHours).toLocaleString('en-US')
        };
      },
      error: () => {
        this.isLoadingProductionSummary = false;
      }
    });
  }

  fetchJobsSummary() {
    this.isLoadingJobsSummary = true;
    this.reportService.getJobsSummary(this.dashboardFilters.fromDate, this.dashboardFilters.toDate, this.selectedVerticalId).subscribe({
      next: (res: any) => {
        this.isLoadingJobsSummary = false;
        if (res.status && res.data) {
          this.jobsSummary = {
            open: res.data.open ?? 0,
            closed: res.data.closed ?? 0
          };
        }
      },
      error: () => {
        this.isLoadingJobsSummary = false;
      }
    });
  }

  fetchVerticals() {
    this.isLoadingVerticals = true;
    const body = {
      client_id: this.localStorageService.getItem('userdata').company_id
    };
    this.clientService.getClientVerticals(body).subscribe({
      next: (res: any) => {
        this.isLoadingVerticals = false;
        const rows = (res.status && Array.isArray(res.data)) ? res.data : [];

        // Keyed on new_service_id (cp_accounts_dev.services.service_id) —
        // the id the job-filtering stored procedures actually expect via
        // jobmonitor.serviceid. wm_vertical_id is a different id space
        // (engagement_verticals) and must not be sent as service_id.
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
    this.selectedVerticalId = id;
    this.fetchAllSummaries();
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private formatMonthYear(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${month}-${date.getFullYear()}`;
  }

  applyDashboardFilters() {
    this.fetchAllSummaries();
  }

  openJobsWidget() {
    this.router.navigate(['/dashboard/job-status']);
  }

  openProductionReport() {
    this.router.navigate(['/dashboard/production-report'], { queryParams: { service_id: this.selectedVerticalId } });
  }

  openTurnaroundReport() {
    this.router.navigate(['/dashboard/turnaround-report'], { queryParams: { service_id: this.selectedVerticalId } });
  }

  openBudgetOverview() {
    this.router.navigate(['/dashboard/budget-overview'], { queryParams: { service_id: this.selectedVerticalId } });
  }

  openFeedback() {
    this.router.navigate(['/dashboard/closed-jobs-feedback']);
  }

  openMovement() {
    this.router.navigate(['/dashboard/movement'], { queryParams: { service_id: this.selectedVerticalId } });
  }

  openMOM() {
    this.router.navigate(['/dashboard/mom']);
  }

}
