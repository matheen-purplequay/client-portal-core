import { Component, ElementRef, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ReportService } from '../../../services/reports/report.service';
import { ClientService } from '../../../services/entities/client.service';
import { LocalStorageService } from '../../../services/app/storage/local-storage.service';
import { ClientUserService } from '../../../shared/services/navquery/wm-client.service';
import { Job, JobData } from '../../../models/jobs';

interface VerticalOption {
  id: number;
  title: string;
}

type MultiSelectFilterKey = 'receivedFrom' | 'natureOfJob' | 'accountant' | 'jobStatus';

interface BudgetRow {
  aid: number;
  receivedFrom: string;
  jobName: string;
  natureOfJob: string;
  accountant: string;
  jobStatus: string;
  budgetSeconds: number;
  timeTakenSeconds: number;
  varianceSeconds: number;
  receivedDate: string;
}

interface BudgetFilters {
  // Empty array = "All" (no filter) for the multi-select columns.
  receivedFrom: string[];
  jobName: string;
  natureOfJob: string[];
  accountant: string[];
  jobStatus: string[];
  budgetTime: string;
  timeTaken: string;
  variance: string;
}

type BudgetSelection = 'all' | 'within' | 'over';

@Component({
  selector: 'app-budget-overview',
  templateUrl: './budget-overview.component.html',
  styleUrls: ['./budget-overview.component.scss']
})
export class BudgetOverviewComponent implements OnInit, OnDestroy {
  private clientUserSub?: Subscription;

  rows: BudgetRow[] = [];
  isLoading = false;
  isExporting = false;

  selection: BudgetSelection = 'all';

  filters: BudgetFilters = {
    receivedFrom: [], jobName: '', natureOfJob: [], accountant: [], jobStatus: [],
    budgetTime: '', timeTaken: '', variance: ''
  };

  receivedFromOptions: string[] = [];
  natureOfJobOptions: string[] = [];
  accountantOptions: string[] = [];
  jobStatusOptions: string[] = [];

  openFilterDropdown: MultiSelectFilterKey | null = null;

  // Search box text per dropdown, used to narrow the option list shown
  // (Select All / actual filtering still apply to the full option set).
  filterSearch: Record<MultiSelectFilterKey, string> = {
    receivedFrom: '', natureOfJob: '', accountant: '', jobStatus: ''
  };

  // Counts for the 3 summary cards, fetched from SP_clientportalBudgetOverviewCount
  // — the SAME proc the Home page's Budget panel uses — instead of being
  // derived client-side from `rows`.
  budgetCounts = { underBudget: 0, overBudget: 0 };
  isLoadingCounts = false;

  selectedServiceId = 0; // 0 = all verticals

  // Job Details popup — same app-job-information component/modal used on
  // the Open Jobs/Closed Jobs/Turnaround pages, opened by clicking a row's
  // job name.
  job: JobData = Job.defaultJob();

  // Same client-scoped vertical source (and same tab UI) as the dashboard
  // home page / Turnaround Report, so this page can be scoped to the same
  // vertical as the Jobs page instead of always defaulting to "All".
  verticals: VerticalOption[] = [];
  isLoadingVerticals = false;

  constructor(
    private reportService: ReportService,
    private route: ActivatedRoute,
    private elementRef: ElementRef,
    private clientService: ClientService,
    private localStorageService: LocalStorageService,
    private clientUserService: ClientUserService
  ) { }

  // Close whichever multi-select panel is open when clicking outside it.
  // The toggle button and the panel itself both stopPropagation() on
  // click, so any click that reaches here is guaranteed to be outside
  // both.
  @HostListener('document:click')
  onDocumentClick() {
    if (this.openFilterDropdown) {
      this.openFilterDropdown = null;
    }
  }

  toggleFilterDropdown(key: MultiSelectFilterKey) {
    const opening = this.openFilterDropdown !== key;
    this.openFilterDropdown = opening ? key : null;
    if (opening) this.filterSearch[key] = '';
  }

  isOptionSelected(key: MultiSelectFilterKey, option: string): boolean {
    return this.filters[key].includes(option);
  }

  toggleFilterOption(key: MultiSelectFilterKey, option: string) {
    const current = this.filters[key];
    this.filters[key] = current.includes(option)
      ? current.filter(v => v !== option)
      : [...current, option];
  }

  optionsFor(key: MultiSelectFilterKey): string[] {
    if (key === 'receivedFrom') return this.receivedFromOptions;
    if (key === 'natureOfJob') return this.natureOfJobOptions;
    if (key === 'jobStatus') return this.jobStatusOptions;
    return this.accountantOptions;
  }

  filteredOptionsFor(key: MultiSelectFilterKey): string[] {
    const term = this.filterSearch[key].trim().toLowerCase();
    const options = this.optionsFor(key);
    return term ? options.filter(o => o.toLowerCase().includes(term)) : options;
  }

  // Treat "every option explicitly selected" the same as "none selected"
  // (both mean no filtering is applied), so Select All and the empty
  // default state look and behave identically.
  isAllSelected(key: MultiSelectFilterKey): boolean {
    const options = this.optionsFor(key);
    return options.length > 0 && this.filters[key].length === options.length;
  }

  toggleSelectAll(key: MultiSelectFilterKey) {
    this.filters[key] = this.isAllSelected(key) ? [] : [...this.optionsFor(key)];
  }

  filterSummaryLabel(key: MultiSelectFilterKey): string {
    const selected = this.filters[key];
    if (selected.length === 0 || selected.length === this.optionsFor(key).length) return 'All';
    if (selected.length === 1) return selected[0];
    return `${selected.length} selected`;
  }

  ngOnInit(): void {
    // Arriving from the dashboard home's vertical tabs (?service_id=...)
    // should scope this page to that vertical, not all verticals.
    const serviceIdParam = Number(this.route.snapshot.queryParamMap.get('service_id'));
    if (!isNaN(serviceIdParam)) {
      this.selectedServiceId = serviceIdParam;
    }
    this.fetchVerticals();
    this.fetchBudgetOverview();
    this.fetchBudgetOverviewCount();

    // Keep the grid/counts in sync when the navbar's client-user (Cid)
    // dropdown changes, since this page otherwise only reads it once via
    // getSelectedContactId() inside ReportService.
    this.clientUserSub = this.clientUserService.userChanged$.subscribe(() => {
      this.fetchBudgetOverview();
      this.fetchBudgetOverviewCount();
    });
  }

  ngOnDestroy(): void {
    this.clientUserSub?.unsubscribe();
  }

  fetchBudgetOverviewCount() {
    this.isLoadingCounts = true;
    this.reportService.getBudgetOverviewCount(this.selectedServiceId).subscribe({
      next: (res: any) => {
        this.isLoadingCounts = false;
        const data = (res.status && res.data) ? res.data : null;
        this.budgetCounts = {
          underBudget: data ? Number(data.under_budget) || 0 : 0,
          overBudget: data ? Number(data.over_budget) || 0 : 0
        };
      },
      error: () => {
        this.isLoadingCounts = false;
        this.budgetCounts = { underBudget: 0, overBudget: 0 };
      }
    });
  }

  // Loaded via the sp_get_client_verticals stored procedure — same source
  // as the Jobs page (open-jobs-by-holder) and the Movement page, instead
  // of the query-builder-based client/get-verticals endpoint.
  fetchVerticals() {
    this.isLoadingVerticals = true;
    const body = {
      client_id: this.localStorageService.getItem('userdata').company_id
    };
    this.clientService.getClientVerticalsSP(body).subscribe({
      next: (res: any) => {
        this.isLoadingVerticals = false;
        const rows = (res.status && Array.isArray(res.data)) ? res.data : [];
        const byTitle = new Map<string, number>();
        rows.forEach((row: any) => {
          if (row.title && !byTitle.has(row.title)) {
            byTitle.set(row.title, row.new_service_id);
          }
        });
        this.verticals = Array.from(byTitle, ([title, id]) => ({ id, title }));
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
    this.fetchBudgetOverview();
    this.fetchBudgetOverviewCount();
  }

  fetchBudgetOverview() {
    this.isLoading = true;
    this.reportService.getBudgetOverview(this.selectedServiceId).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        const data = (res.status && Array.isArray(res.data)) ? res.data : [];
        this.rows = data.map((row: any) => ({
          aid: row.aid,
          receivedFrom: row.received_from || '',
          jobName: row.job_name || '',
          natureOfJob: row.nature_of_job || '',
          accountant: row.accountant || '',
          jobStatus: row.job_status || '',
          budgetSeconds: Number(row.budget_seconds) || 0,
          timeTakenSeconds: Number(row.time_taken_seconds) || 0,
          varianceSeconds: Number(row.variance_seconds) || 0,
          receivedDate: row.received_date || ''
        } as BudgetRow));

        const distinct = (values: string[]) => values.filter((v, i, self) => v && self.indexOf(v) === i);
        this.receivedFromOptions = distinct(this.rows.map(r => r.receivedFrom));
        this.natureOfJobOptions = distinct(this.rows.map(r => r.natureOfJob));
        this.accountantOptions = distinct(this.rows.map(r => r.accountant));
        this.jobStatusOptions = distinct(this.rows.map(r => r.jobStatus));
      },
      error: () => {
        this.isLoading = false;
        this.rows = [];
      }
    });
  }

  selectCard(selection: BudgetSelection) {
    this.selection = selection;
  }

  openJobDetails(row: BudgetRow) {
    this.job = {
      ...Job.defaultJob(),
      Aid: row.aid,
      JobName: row.jobName,
      Status: row.jobStatus,
      ClientContact: row.receivedFrom,
      NatureOfJob: row.natureOfJob,
      ReceivedFrom: row.receivedFrom,
      ReceivedDate: row.receivedDate,
      Accountant: row.accountant
    };
  }

  get withinBudgetRows(): BudgetRow[] {
    return this.rows.filter(row => row.varianceSeconds <= 0);
  }

  get overBudgetRows(): BudgetRow[] {
    return this.rows.filter(row => row.varianceSeconds > 0);
  }

  get totalBudgetSeconds(): number {
    return this.rows.reduce((sum, row) => sum + row.budgetSeconds, 0);
  }

  get totalTimeTakenSeconds(): number {
    return this.rows.reduce((sum, row) => sum + row.timeTakenSeconds, 0);
  }

  get totalOpenJobsCount(): number {
    return this.budgetCounts.underBudget + this.budgetCounts.overBudget;
  }

  get withinBudgetPct(): number {
    const total = this.totalOpenJobsCount;
    return total > 0 ? Math.round((this.budgetCounts.underBudget / total) * 100) : 0;
  }

  get overBudgetPct(): number {
    const total = this.totalOpenJobsCount;
    return total > 0 ? Math.round((this.budgetCounts.overBudget / total) * 100) : 0;
  }

  get selectedVerticalLabel(): string {
    if (this.selectedServiceId === 0) return 'All Verticals';
    return this.verticals.find(v => v.id === this.selectedServiceId)?.title || 'All Verticals';
  }

  get selectedRows(): BudgetRow[] {
    if (this.selection === 'within') return this.withinBudgetRows;
    if (this.selection === 'over') return this.overBudgetRows;
    return this.rows;
  }

  get filteredRows(): BudgetRow[] {
    const f = this.filters;
    return this.selectedRows.filter(row =>
      (f.receivedFrom.length === 0 || f.receivedFrom.includes(row.receivedFrom)) &&
      row.jobName.toLowerCase().includes(f.jobName.trim().toLowerCase()) &&
      (f.natureOfJob.length === 0 || f.natureOfJob.includes(row.natureOfJob)) &&
      (f.accountant.length === 0 || f.accountant.includes(row.accountant)) &&
      (f.jobStatus.length === 0 || f.jobStatus.includes(row.jobStatus)) &&
      this.formatSigned(row.budgetSeconds).toLowerCase().includes(f.budgetTime.trim().toLowerCase()) &&
      this.formatSigned(row.timeTakenSeconds).toLowerCase().includes(f.timeTaken.trim().toLowerCase()) &&
      this.matchesVarianceFilter(row.varianceSeconds, f.variance)
    );
  }

  // Supports ">1", ">=2", "<1", "<=2" (hours, signed) as well as the plain
  // substring match the other time columns use — e.g. ">1" matches every
  // job more than 1 hour over budget, "<-1" matches jobs more than 1 hour
  // under budget.
  matchesVarianceFilter(varianceSeconds: number, filterText: string): boolean {
    const text = filterText.trim();
    if (!text) return true;

    const match = /^(>=|<=|>|<)\s*(-?\d+(?:\.\d+)?)$/.exec(text);
    if (match) {
      const operator = match[1];
      const hours = parseFloat(match[2]);
      const varianceHours = varianceSeconds / 3600;
      if (operator === '>') return varianceHours > hours;
      if (operator === '>=') return varianceHours >= hours;
      if (operator === '<') return varianceHours < hours;
      return varianceHours <= hours;
    }

    return this.formatSigned(varianceSeconds, true).toLowerCase().includes(text.toLowerCase());
  }

  get tableTitle(): string {
    if (this.selection === 'within') return 'Within Budget Jobs';
    if (this.selection === 'over') return 'Over Budget Jobs';
    return 'Open Jobs';
  }

  get hasActiveFilters(): boolean {
    const f = this.filters;
    return f.receivedFrom.length > 0 || !!f.jobName || f.natureOfJob.length > 0 ||
      f.accountant.length > 0 || f.jobStatus.length > 0 || !!f.budgetTime || !!f.timeTaken || !!f.variance ||
      this.selection !== 'all';
  }

  clearFilters() {
    this.filters = {
      receivedFrom: [], jobName: '', natureOfJob: [], accountant: [], jobStatus: [],
      budgetTime: '', timeTaken: '', variance: ''
    };
    this.selection = 'all';
  }

  formatSigned(seconds: number, showSign = false): string {
    const sign = seconds < 0 ? '-' : (showSign && seconds > 0 ? '+' : '');
    const abs = Math.abs(Math.round(seconds));
    const h = Math.floor(abs / 3600);
    const m = Math.floor((abs % 3600) / 60);
    return `${sign}${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  exportToExcel() {
    this.isExporting = true;
    this.reportService.exportBudgetOverview(this.selectedServiceId).subscribe({
      next: (data: any) => {
        const downloadURL = window.URL.createObjectURL(data);
        const link = document.createElement('a');
        link.href = downloadURL;
        link.download = 'Budget Overview.xlsx';
        link.click();
        this.isExporting = false;
      },
      error: () => {
        this.isExporting = false;
      }
    });
  }

}
