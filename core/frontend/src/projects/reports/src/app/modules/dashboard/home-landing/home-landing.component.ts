import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { LocalStorageService } from '../../../services/app/storage/local-storage.service';
import { ClientService } from '../../../services/entities/client.service';
import { ReportService } from '../../../services/reports/report.service';
import { ClientUserService } from '../../../shared/services/navquery/wm-client.service';
import { CommonService } from '../../../services/app/common/common.service';

interface VerticalOption {
  title: string;
  serviceId: number;
}

interface HolidayDisplay {
  name: string;
  meta: string;
}

/**
 * "Home" landing screen — matches the prototype's landing page design.
 * Greeting/date, the vertical tabs and the Daily Planner tile counts are wired
 * to real data; the remaining panel figures below are still hardcoded per the
 * approved mock-up.
 */
@Component({
  selector: 'app-home-landing',
  templateUrl: './home-landing.component.html',
  styleUrls: ['./home-landing.component.scss']
})
export class HomeLandingComponent implements OnInit, OnDestroy {
  firstName = '';
  today = new Date();

  verticalOptions: VerticalOption[] = [];
  activeVertical = '';
  isLoadingVerticals = true;

  isLoadingPlanner = true;
  standUpJobsToday: number | string = '-';
  estTimeToday: string = '-';
  finishingToday: number | string = '-';

  isLoadingHolidays = true;
  ausHoliday: HolidayDisplay | null = null;
  indiaHoliday: HolidayDisplay | null = null;

  private clientUserSub!: Subscription;

  constructor(
    private localStorageService: LocalStorageService,
    private clientService: ClientService,
    private reportService: ReportService,
    private clientUserService: ClientUserService,
    private commonService: CommonService
  ) { }

  ngOnInit(): void {
    const userdata = this.localStorageService.isItemExists('userdata') ? this.localStorageService.getItem('userdata') : null;
    this.firstName = userdata?.first_name || '';
    this.loadVerticals(userdata?.company_id);
    this.setVertical('All');
    this.loadHolidays();

    // Keep the Daily Planner counts in sync when the navbar's client-user
    // (Cid) dropdown changes, since it only reads localStorage once above
    // otherwise (same pattern as dashboard-bs-movement.component.ts).
    this.clientUserSub = this.clientUserService.userChanged$.subscribe(() => {
      const option = this.verticalOptions.find(o => o.title === this.activeVertical);
      this.loadDailyPlanner(option?.serviceId || 0);
      this.loadDailyPlannerColourCounts(option?.serviceId || 0);
      this.loadYesterdayWorkflow(option?.serviceId || 0);
      this.loadJobsLiveCounts(option?.serviceId || 0);
      this.loadBudget(option?.serviceId || 0);
      this.loadFeedback(option?.serviceId || 0);
      this.loadYesterdaySentCounts(option?.serviceId || 0);
      this.loadTurnaroundSummary(option?.serviceId || 0);
    });
  }

  ngOnDestroy(): void {
    this.clientUserSub?.unsubscribe();
  }

  get verticals(): string[] {
    return this.verticalOptions.map(v => v.title);
  }

  loadVerticals(clientId: number): void {
    this.isLoadingVerticals = true;
    this.clientService.getClientVerticalsSP({ client_id: clientId }).subscribe({
      next: (res: any) => {
        this.isLoadingVerticals = false;
        const rows = (res?.status && Array.isArray(res.data)) ? res.data : [];
        const options = rows
          .filter((r: any) => !!r.title)
          // new_service_id (services.service_id) is what Sp_StandUpDailyPlannerTodayCounts
          // expects as "Service" — not wm_vertical_id.
          .map((r: any) => ({ title: r.title, serviceId: r.new_service_id }));
        // "All" (serviceId 0) matches the same convention used by the other
        // report pages, e.g. budget-overview.component.ts's selectedServiceId.
        this.verticalOptions = [{ title: 'All', serviceId: 0 }, ...options];
        if (!this.verticals.includes(this.activeVertical)) {
          this.setVertical('All');
        }
      },
      error: () => {
        this.isLoadingVerticals = false;
        this.verticalOptions = [];
      }
    });
  }

  isLoadingYesterday = true;
  yesterdayRows: { job: string, yesterday: string, current: string, billable: string }[] = [];
  yesterdayMeta = '';

  isLoadingPlannerColours = true;
  sufficientCount: number | string = '-';
  insufficientCount: number | string = '-';
  noJobsCount: number | string = '-';

  isLoadingJobsCounts = true;
  totalLiveJobs: number | string = '-';
  withCarisma: number | string = '-';
  withClient: number | string = '-';
  newJobs: number | string = '-';

  isLoadingBudget = true;
  totalOpenJobs: number | string = '-';
  withinBudgetPct: number | string = '-';
  overBudgetPct: number | string = '-';
  overBudgetJobs = 0;
  withinBudgetJobs = 0;

  setVertical(v: string): void {
    this.activeVertical = v;
    const option = this.verticalOptions.find(o => o.title === v);
    this.loadDailyPlanner(option?.serviceId || 0);
    this.loadDailyPlannerColourCounts(option?.serviceId || 0);
    this.loadYesterdayWorkflow(option?.serviceId || 0);
    this.loadJobsLiveCounts(option?.serviceId || 0);
    this.loadBudget(option?.serviceId || 0);
    this.loadFeedback(option?.serviceId || 0);
    this.loadYesterdaySentCounts(option?.serviceId || 0);
    this.loadTurnaroundSummary(option?.serviceId || 0);
  }

  loadDailyPlannerColourCounts(serviceId: number): void {
    this.isLoadingPlannerColours = true;
    this.reportService.getDailyPlannerColourCounts(serviceId).subscribe({
      next: (res: any) => {
        this.isLoadingPlannerColours = false;
        if (res?.status && res.data) {
          this.sufficientCount = res.data.sufficient ?? 0;
          this.insufficientCount = res.data.insufficient ?? 0;
          this.noJobsCount = res.data.no_jobs ?? 0;
        }
      },
      error: () => {
        this.isLoadingPlannerColours = false;
      }
    });
  }

  loadJobsLiveCounts(serviceId: number): void {
    this.isLoadingJobsCounts = true;
    this.reportService.getJobsLiveCounts(serviceId).subscribe({
      next: (res: any) => {
        this.isLoadingJobsCounts = false;
        if (res?.status && res.data) {
          this.totalLiveJobs = res.data.total_live_jobs ?? 0;
          this.withCarisma = res.data.with_carisma ?? 0;
          this.withClient = res.data.with_client ?? 0;
          this.newJobs = res.data.new_jobs ?? 0;
        }
      },
      error: () => {
        this.isLoadingJobsCounts = false;
      }
    });
  }

  // Same stored procedure the Budget Overview page's summary card uses
  // (SP_clientportalBudgetOverviewCount via ReportService.getBudgetOverviewCount,
  // also reused by dashboard-page.component.ts) - just derives the
  // total/percentages the Home tiles show from its under/over counts.
  loadBudget(serviceId: number): void {
    this.isLoadingBudget = true;
    this.reportService.getBudgetOverviewCount(serviceId).subscribe({
      next: (res: any) => {
        this.isLoadingBudget = false;
        if (res?.status && res.data) {
          const under = res.data.under_budget ?? 0;
          const over = res.data.over_budget ?? 0;
          const total = under + over;
          this.totalOpenJobs = total;
          this.overBudgetJobs = over;
          this.withinBudgetJobs = under;
          this.withinBudgetPct = total ? Math.round((under / total) * 100) : 0;
          this.overBudgetPct = total ? Math.round((over / total) * 100) : 0;
        }
      },
      error: () => {
        this.isLoadingBudget = false;
      }
    });
  }

  loadDailyPlanner(serviceId: number): void {
    this.isLoadingPlanner = true;
    this.reportService.getDailyPlannerCounts(serviceId).subscribe({
      next: (res: any) => {
        this.isLoadingPlanner = false;
        if (res?.status && res.data) {
          this.standUpJobsToday = res.data.stand_up_jobs_today ?? 0;
          this.estTimeToday = res.data.est_time_today ?? '00:00';
          this.finishingToday = res.data.finishing_today ?? 0;
        }
      },
      error: () => {
        this.isLoadingPlanner = false;
      }
    });
  }

  loadYesterdayWorkflow(serviceId: number): void {
    this.isLoadingYesterday = true;
    this.reportService.getDailyPlannerDetails(serviceId).subscribe({
      next: (res: any) => {
        this.isLoadingYesterday = false;
        const rows = (res?.status && Array.isArray(res.data)) ? res.data : [];
        const moved = rows.filter((r: any) => r.yesterday !== r.current_status).length;
        // Backend-provided last working day (from the workingdays table, same
        // one the stored procedure itself compared against) - not just
        // today-minus-one-calendar-day, which can land on a weekend/holiday.
        const lastWorkingDay = res?.last_working_day ? new Date(`${res.last_working_day}T00:00:00`) : null;
        this.yesterdayMeta = rows.length && lastWorkingDay
          ? `${this.formatDDMMYYYY(lastWorkingDay)} · ${moved} of ${rows.length} moved on`
          : '';
        this.yesterdayRows = rows.map((r: any) => ({
          job: r.job || '',
          yesterday: r.yesterday || '-',
          current: r.current_status || '-',
          billable: r.billable || '-'
        }));
      },
      error: () => {
        this.isLoadingYesterday = false;
        this.yesterdayRows = [];
      }
    });
  }

  private formatDDMMYYYY(d: Date): string {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${dd}-${mm}-${d.getFullYear()}`;
  }

  isLoadingTurnaround = true;
  totalJobsClosed: number | string = '-';
  avgDaysInCarisma: number | string = '-';

  loadTurnaroundSummary(serviceId: number): void {
    this.isLoadingTurnaround = true;
    this.reportService.getHomeTurnaroundSummary(serviceId).subscribe({
      next: (res: any) => {
        this.isLoadingTurnaround = false;
        if (res?.status && res.data) {
          this.totalJobsClosed = res.data.total_jobs_closed ?? 0;
          this.avgDaysInCarisma = res.data.avg_days_in_carisma ?? 0;
        }
      },
      error: () => {
        this.isLoadingTurnaround = false;
      }
    });
  }

  isLoadingSentCounts = true;
  sentForQuery: number | string = '-';
  sentForReview: number | string = '-';

  loadYesterdaySentCounts(serviceId: number): void {
    this.isLoadingSentCounts = true;
    this.reportService.getYesterdaySentCounts(serviceId).subscribe({
      next: (res: any) => {
        this.isLoadingSentCounts = false;
        if (res?.status && res.data) {
          this.sentForQuery = res.data.sent_for_query ?? 0;
          this.sentForReview = res.data.sent_for_review ?? 0;
        }
      },
      error: () => {
        this.isLoadingSentCounts = false;
      }
    });
  }

  isLoadingFeedback = true;
  feedbackReceived: number | string = '-';
  improvements: number | string = '-';
  appreciation: number | string = '-';

  loadFeedback(serviceId: number): void {
    this.isLoadingFeedback = true;
    this.reportService.getFeedbackCounts(serviceId).subscribe({
      next: (res: any) => {
        this.isLoadingFeedback = false;
        if (res?.status && res.data) {
          this.feedbackReceived = res.data.feedback_received ?? 0;
          this.improvements = res.data.improvements ?? 0;
          this.appreciation = res.data.appreciation ?? 0;
        }
      },
      error: () => {
        this.isLoadingFeedback = false;
      }
    });
  }

  loadHolidays(): void {
    this.isLoadingHolidays = true;
    this.commonService.getNextHolidays().subscribe({
      next: (res: any) => {
        this.isLoadingHolidays = false;
        if (res?.status && res.data) {
          this.ausHoliday = this.toHolidayDisplay(res.data.australian);
          this.indiaHoliday = this.toHolidayDisplay(res.data.indian);
        }
      },
      error: () => {
        this.isLoadingHolidays = false;
      }
    });
  }

  // row.date is "DD-MM-YYYY" from both the holidays table and SP_GetIndianHolidays.
  private toHolidayDisplay(row: { reason: string, type?: string, date: string } | null): HolidayDisplay | null {
    if (!row?.date) return null;
    const [dd, mm, yyyy] = row.date.split('-').map((n: string) => parseInt(n, 10));
    const holidayDate = new Date(yyyy, mm - 1, dd);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.round((holidayDate.getTime() - today.getTime()) / 86400000);
    const when = diffDays === 0 ? 'Today' : diffDays === 1 ? 'Tomorrow' : `In ${diffDays}D`;
    const name = row.type && row.type !== 'National' ? `${row.reason} (${row.type})` : row.reason;
    return { name, meta: `${String(dd).padStart(2, '0')}-${String(mm).padStart(2, '0')} · ${when}` };
  }
}
