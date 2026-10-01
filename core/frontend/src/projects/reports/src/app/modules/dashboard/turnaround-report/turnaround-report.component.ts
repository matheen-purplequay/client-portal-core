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

interface BucketCard {
  key: 'total_jobs_closed' | 'bucket_0_5' | 'bucket_6_10' | 'bucket_11_20' | 'bucket_21_30' | 'bucket_31_60' | 'bucket_above_60';
  label: string;
  variant: string;
  value: number;
}

interface TurnaroundJobRow {
  aid: number;
  receivedFrom: string;
  jobName: string;
  natureOfJob: string;
  accountant: string;
  jobStatus: string;
  turnaroundDays: number;
  turnaroundInCarisma: number;
  turnaroundInClient: number;
  // 'HH:MM' strings, already formatted by the stored procedure.
  budgetTime: string;
  timeTaken: string;
  receivedDate: string;
}

interface TurnaroundManagerBucket {
  total: number | null;
  carisma: number | null;
  client: number | null;
}

interface TurnaroundManagerRow {
  managerCid: number | null;
  manager: string;
  isTotal: boolean;
  b0_5: TurnaroundManagerBucket;
  b6_10: TurnaroundManagerBucket;
  b11_20: TurnaroundManagerBucket;
  b21_30: TurnaroundManagerBucket;
  b31_60: TurnaroundManagerBucket;
  b61: TurnaroundManagerBucket;
}

interface TurnaroundManagerJobRow {
  aid: number;
  jobName: string;
  receivedFrom: string;
  budgetTime: string;
  timeTaken: string;
  bucketKey: string | null;
  turnaroundDays: number | null;
  turnaroundInCarisma: number | null;
  turnaroundInClient: number | null;
}

interface TurnaroundJobFilters {
  // Empty array = "All" (no filter) for the multi-select columns.
  receivedFrom: string[];
  jobName: string;
  natureOfJob: string[];
  accountant: string[];
  jobStatus: string[];
}

@Component({
  selector: 'app-turnaround-report',
  templateUrl: './turnaround-report.component.html',
  styleUrls: ['./turnaround-report.component.scss']
})
export class TurnaroundReportComponent implements OnInit, OnDestroy {

  private clientUserSub?: Subscription;

  isLoading = false;

  buckets: BucketCard[] = [
    { key: 'total_jobs_closed', label: 'Total Jobs Closed', variant: 'total', value: 0 },
    { key: 'bucket_0_5', label: '0 to 5 Days', variant: 'green', value: 0 },
    { key: 'bucket_6_10', label: '6 to 10 Days', variant: 'teal', value: 0 },
    { key: 'bucket_11_20', label: '11 to 20 Days', variant: 'blue', value: 0 },
    { key: 'bucket_21_30', label: '21 to 30 Days', variant: 'orange', value: 0 },
    { key: 'bucket_31_60', label: '31 to 60 Days', variant: 'maroon', value: 0 },
    { key: 'bucket_above_60', label: 'Above 60 Days', variant: 'red', value: 0 }
  ];

  // null = no bucket filter (the "Total Jobs Closed/Open" card).
  selectedBucket: BucketCard['key'] | null = null;

  viewMode: 'status' | 'manager' = 'status';

  isLoadingManager = false;
  managerRows: TurnaroundManagerRow[] = [];
  managerBuckets: { key: 'b0_5' | 'b6_10' | 'b11_20' | 'b21_30' | 'b31_60' | 'b61', label: string }[] = [
    { key: 'b0_5', label: '0-5 Days' },
    { key: 'b6_10', label: '6-10 Days' },
    { key: 'b11_20', label: '11-20 Days' },
    { key: 'b21_30', label: '21-30 Days' },
    { key: 'b31_60', label: '31-60 Days' },
    { key: 'b61', label: 'Above 60 Days' }
  ];

  // Manager View drill-down — jobs for one manager (or all managers, when
  // clicking the Total row), optionally narrowed to the bucket whose count
  // cell was clicked. The pivot table stays visible above it, matching the
  // Manager View pattern already used on the Jobs/Movement pages.
  managerDrillDown: { managerCid: number, managerLabel: string, bucketKey: string | null, bucketLabel: string | null } | null = null;
  isLoadingManagerJobs = false;
  managerJobRows: TurnaroundManagerJobRow[] = [];

  managerJobFilters: { receivedFrom: string[], jobName: string } = { receivedFrom: [], jobName: '' };
  managerReceivedFromOptions: string[] = [];
  openManagerFilterDropdown = false;
  managerFilterSearch = '';

  selectedServiceId = 0; // 0 = all verticals

  // Same client-scoped vertical source (and same tab UI) as the dashboard
  // home page, so switching to the same vertical here shows the same Open
  // Jobs count instead of this page silently defaulting to "All Verticals".
  verticals: VerticalOption[] = [];
  isLoadingVerticals = false;

  jobStatus: 'open' | 'closed' = 'open';
  openJobsCount = 0;
  closedJobsCount = 0;

  jobRows: TurnaroundJobRow[] = [];
  isLoadingJobs = false;
  isExporting = false;

  filters: TurnaroundJobFilters = {
    receivedFrom: [], jobName: '', natureOfJob: [], accountant: [], jobStatus: []
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

  // Pagination for the jobs grid.
  pageSizeOptions = [10, 20, 30];
  pageSize = 10;
  currentPage = 1;

  // Job Details popup — same app-job-details component/modal used on the
  // Job Status page, opened by clicking a row's job name.
  job: JobData = Job.defaultJob();
  jobTurnaround: { withCarisma: number, withClient: number, total: number } | null = null;

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
  // both — including clicks elsewhere on the page (table rows, other
  // filters, etc.), not just outside this whole component.
  @HostListener('document:click')
  onDocumentClick() {
    if (this.openFilterDropdown) {
      this.openFilterDropdown = null;
    }
    if (this.openManagerFilterDropdown) {
      this.openManagerFilterDropdown = false;
    }
  }

  toggleFilterDropdown(key: MultiSelectFilterKey) {
    const opening = this.openFilterDropdown !== key;
    this.openFilterDropdown = opening ? key : null;
    if (opening) this.filterSearch[key] = '';
  }

  filteredOptionsFor(key: MultiSelectFilterKey): string[] {
    const term = this.filterSearch[key].trim().toLowerCase();
    const options = this.optionsFor(key);
    return term ? options.filter(o => o.toLowerCase().includes(term)) : options;
  }

  isOptionSelected(key: MultiSelectFilterKey, option: string): boolean {
    return this.filters[key].includes(option);
  }

  toggleFilterOption(key: MultiSelectFilterKey, option: string) {
    const current = this.filters[key];
    this.filters[key] = current.includes(option)
      ? current.filter(v => v !== option)
      : [...current, option];
    this.currentPage = 1;
  }

  optionsFor(key: MultiSelectFilterKey): string[] {
    if (key === 'receivedFrom') return this.receivedFromOptions;
    if (key === 'natureOfJob') return this.natureOfJobOptions;
    if (key === 'jobStatus') return this.jobStatusOptions;
    return this.accountantOptions;
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
    this.currentPage = 1;
  }

  filterSummaryLabel(key: MultiSelectFilterKey): string {
    const selected = this.filters[key];
    if (selected.length === 0 || selected.length === this.optionsFor(key).length) return 'All';
    if (selected.length === 1) return selected[0];
    return `${selected.length} selected`;
  }

  setViewMode(mode: 'status' | 'manager') {
    this.viewMode = mode;
  }

  formatDate(value: string): string {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value || '');
    return match ? `${match[3]}-${match[2]}-${match[1]}` : (value || '');
  }

  openJobDetails(row: TurnaroundJobRow) {
    this.job = {
      ...Job.defaultJob(),
      Aid: row.aid,
      JobName: row.jobName,
      Status: row.jobStatus,
      ClientContact: row.receivedFrom,
      Accountant: row.accountant,
      NatureOfJob: row.natureOfJob,
      ReceivedFrom: row.receivedFrom,
      Datereceived: row.receivedDate,
      ReceivedDate: row.receivedDate
    };
    this.jobTurnaround = {
      withCarisma: row.turnaroundInCarisma,
      withClient: row.turnaroundInClient,
      total: row.turnaroundDays
    };
  }

  setPageSize(size: number) {
    this.pageSize = size;
    this.currentPage = 1;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredJobRows.length / this.pageSize));
  }

  get pagedJobRows(): TurnaroundJobRow[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredJobRows.slice(start, start + this.pageSize);
  }

  get pageRangeStart(): number {
    return this.filteredJobRows.length === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get pageRangeEnd(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredJobRows.length);
  }

  goToPage(page: number) {
    this.currentPage = Math.min(Math.max(1, page), this.totalPages);
  }

  ngOnInit(): void {
    // Arriving from the dashboard home's vertical tabs (?service_id=...)
    // should scope this page to that vertical, not all verticals.
    const serviceIdParam = Number(this.route.snapshot.queryParamMap.get('service_id'));
    if (!isNaN(serviceIdParam)) {
      this.selectedServiceId = serviceIdParam;
    }
    this.fetchVerticals();
    this.fetchStatusCounts();
    this.fetchTurnaroundReport();
    this.fetchTurnaroundJobsList();
    this.fetchTurnaroundManagerWise();

    this.clientUserSub = this.clientUserService.userChanged$.subscribe(() => {
      this.selectedBucket = null;
      this.currentPage = 1;
      this.backToManagerPivot();
      this.fetchStatusCounts();
      this.fetchTurnaroundReport();
      this.fetchTurnaroundJobsList();
      this.fetchTurnaroundManagerWise();
    });
  }

  ngOnDestroy(): void {
    this.clientUserSub?.unsubscribe();
  }

  // Same sp_get_client_verticals source as the Job page's Open Jobs view
  // (open-jobs-by-holder.component.ts's fetchVerticals()), keyed on
  // new_service_id (the id the job-filtering stored procedures expect via
  // jobmonitor.serviceid).
  fetchVerticals() {
    this.isLoadingVerticals = true;
    const body = {
      client_id: this.localStorageService.getItem('userdata').company_id
    };
    this.clientService.getClientVerticalsSP(body).subscribe({
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
    this.selectedBucket = null;
    this.currentPage = 1;
    this.fetchStatusCounts();
    this.fetchTurnaroundReport();
    this.fetchTurnaroundJobsList();
    this.fetchTurnaroundManagerWise();
    this.backToManagerPivot();
  }

  // Both toggle cards show their own count regardless of which one is
  // currently selected, so fetch both totals independently of jobStatus.
  fetchStatusCounts() {
    this.reportService.getTurnaroundReport(this.selectedServiceId, 'open').subscribe({
      next: (res: any) => {
        this.openJobsCount = (res.status && res.data) ? (Number(res.data.total_jobs_closed) || 0) : 0;
      },
      error: () => { this.openJobsCount = 0; }
    });
    this.reportService.getTurnaroundReport(this.selectedServiceId, 'closed').subscribe({
      next: (res: any) => {
        this.closedJobsCount = (res.status && res.data) ? (Number(res.data.total_jobs_closed) || 0) : 0;
      },
      error: () => { this.closedJobsCount = 0; }
    });
  }

  selectStatus(status: 'open' | 'closed') {
    if (this.jobStatus === status) return;
    this.jobStatus = status;
    // Filter options/selections are specific to the previous job list
    // (e.g. an accountant who only shows up in open jobs) so they no
    // longer make sense once the underlying rows change.
    this.filters = { receivedFrom: [], jobName: '', natureOfJob: [], accountant: [], jobStatus: [] };
    this.openFilterDropdown = null;
    this.selectedBucket = null;
    this.currentPage = 1;
    this.fetchTurnaroundReport();
    this.fetchTurnaroundJobsList();
  }

  get bucketTotalLabel(): string {
    return this.jobStatus === 'open' ? 'Total Jobs Open' : 'Total Jobs Closed';
  }

  get jobsTableTitle(): string {
    return this.jobStatus === 'open' ? 'All Open Jobs' : 'All Closed Jobs';
  }

  fetchTurnaroundReport() {
    this.isLoading = true;
    this.reportService.getTurnaroundReport(this.selectedServiceId, this.jobStatus).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        const data = (res.status && res.data) ? res.data : {};
        this.buckets = this.buckets.map(bucket => ({
          ...bucket,
          label: bucket.key === 'total_jobs_closed' ? this.bucketTotalLabel : bucket.label,
          value: Number(data[bucket.key]) || 0
        }));
      },
      error: () => {
        this.isLoading = false;
        this.buckets = this.buckets.map(bucket => ({ ...bucket, value: 0 }));
      }
    });
  }

  fetchTurnaroundJobsList() {
    this.isLoadingJobs = true;
    this.reportService.getTurnaroundJobsList(this.selectedServiceId, this.jobStatus).subscribe({
      next: (res: any) => {
        this.isLoadingJobs = false;
        const data = (res.status && Array.isArray(res.data)) ? res.data : [];
        this.jobRows = data.map((row: any) => ({
          aid: Number(row.aid) || 0,
          receivedFrom: row.received_from || '',
          jobName: row.job_name || '',
          natureOfJob: row.nature_of_job || '',
          accountant: row.accountant || '',
          jobStatus: row.job_status || '',
          turnaroundDays: Number(row.turnaround_days) || 0,
          turnaroundInCarisma: Number(row.turnaround_in_carisma) || 0,
          turnaroundInClient: Number(row.turnaround_in_client) || 0,
          budgetTime: row.budget_time || '00:00',
          timeTaken: row.time_taken || '00:00',
          receivedDate: this.formatDate(row.received_date || '')
        } as TurnaroundJobRow));

        const distinct = (values: string[]) => values.filter((v, i, self) => v && self.indexOf(v) === i);
        this.receivedFromOptions = distinct(this.jobRows.map(r => r.receivedFrom));
        this.natureOfJobOptions = distinct(this.jobRows.map(r => r.natureOfJob));
        this.accountantOptions = distinct(this.jobRows.map(r => r.accountant));
        this.jobStatusOptions = distinct(this.jobRows.map(r => r.jobStatus));
      },
      error: () => {
        this.isLoadingJobs = false;
        this.jobRows = [];
      }
    });
  }

  fetchTurnaroundManagerWise() {
    this.isLoadingManager = true;
    const toBucket = (b: any): TurnaroundManagerBucket => ({
      total: b?.total ?? null,
      carisma: b?.carisma ?? null,
      client: b?.client ?? null
    });
    this.reportService.getTurnaroundManagerWise(this.selectedServiceId).subscribe({
      next: (res: any) => {
        this.isLoadingManager = false;
        const data = (res?.status && Array.isArray(res.data)) ? res.data : [];
        this.managerRows = data.map((row: any) => ({
          managerCid: row.manager_cid,
          manager: row.manager,
          isTotal: !!row.is_total,
          b0_5: toBucket(row.b0_5),
          b6_10: toBucket(row.b6_10),
          b11_20: toBucket(row.b11_20),
          b21_30: toBucket(row.b21_30),
          b31_60: toBucket(row.b31_60),
          b61: toBucket(row.b61)
        } as TurnaroundManagerRow));
      },
      error: () => {
        this.isLoadingManager = false;
        this.managerRows = [];
      }
    });
  }

  get managerRowsList(): TurnaroundManagerRow[] {
    return this.managerRows.filter(r => !r.isTotal);
  }

  get managerTotalRow(): TurnaroundManagerRow | undefined {
    return this.managerRows.find(r => r.isTotal);
  }

  showManagerJobs(managerCid: number | null, managerLabel: string, bucketKey: string | null = null, bucketLabel: string | null = null) {
    const cid = managerCid ?? 0;
    this.managerDrillDown = { managerCid: cid, managerLabel, bucketKey, bucketLabel };
    this.managerJobFilters = { receivedFrom: [], jobName: '' };
    this.openManagerFilterDropdown = false;
    this.isLoadingManagerJobs = true;
    this.reportService.getTurnaroundManagerJobs(this.selectedServiceId, cid).subscribe({
      next: (res: any) => {
        this.isLoadingManagerJobs = false;
        const data = (res?.status && Array.isArray(res.data)) ? res.data : [];
        this.managerJobRows = data.map((row: any) => ({
          aid: Number(row.aid) || 0,
          jobName: row.job_name || '',
          receivedFrom: row.received_from || '',
          budgetTime: row.budget_time || '00:00',
          timeTaken: row.time_taken || '00:00',
          bucketKey: row.bucket_key,
          turnaroundDays: row.turnaround_days,
          turnaroundInCarisma: row.turnaround_in_carisma,
          turnaroundInClient: row.turnaround_in_client
        } as TurnaroundManagerJobRow));
        this.managerReceivedFromOptions = this.managerJobRows
          .map(r => r.receivedFrom)
          .filter((v, i, self) => v && self.indexOf(v) === i);
      },
      error: () => {
        this.isLoadingManagerJobs = false;
        this.managerJobRows = [];
        this.managerReceivedFromOptions = [];
      }
    });
  }

  get managerDrillDownRows(): TurnaroundManagerJobRow[] {
    const f = this.managerJobFilters;
    return this.managerJobRows.filter(row =>
      (!this.managerDrillDown?.bucketKey || row.bucketKey === this.managerDrillDown!.bucketKey) &&
      (f.receivedFrom.length === 0 || f.receivedFrom.includes(row.receivedFrom)) &&
      row.jobName.toLowerCase().includes(f.jobName.trim().toLowerCase())
    );
  }

  toggleManagerFilterDropdown() {
    this.openManagerFilterDropdown = !this.openManagerFilterDropdown;
    if (this.openManagerFilterDropdown) this.managerFilterSearch = '';
  }

  get managerFilteredReceivedFromOptions(): string[] {
    const term = this.managerFilterSearch.trim().toLowerCase();
    return term ? this.managerReceivedFromOptions.filter(o => o.toLowerCase().includes(term)) : this.managerReceivedFromOptions;
  }

  isManagerReceivedFromSelected(option: string): boolean {
    return this.managerJobFilters.receivedFrom.includes(option);
  }

  toggleManagerReceivedFromOption(option: string) {
    const current = this.managerJobFilters.receivedFrom;
    this.managerJobFilters.receivedFrom = current.includes(option)
      ? current.filter(v => v !== option)
      : [...current, option];
  }

  isManagerReceivedFromAllSelected(): boolean {
    return this.managerReceivedFromOptions.length > 0 && this.managerJobFilters.receivedFrom.length === this.managerReceivedFromOptions.length;
  }

  toggleManagerReceivedFromSelectAll() {
    this.managerJobFilters.receivedFrom = this.isManagerReceivedFromAllSelected() ? [] : [...this.managerReceivedFromOptions];
  }

  managerReceivedFromSummaryLabel(): string {
    const selected = this.managerJobFilters.receivedFrom;
    if (selected.length === 0 || selected.length === this.managerReceivedFromOptions.length) return 'All';
    if (selected.length === 1) return selected[0];
    return `${selected.length} selected`;
  }

  backToManagerPivot() {
    this.managerDrillDown = null;
    this.managerJobRows = [];
    this.managerJobFilters = { receivedFrom: [], jobName: '' };
    this.openManagerFilterDropdown = false;
  }

  openManagerJobDetails(row: TurnaroundManagerJobRow) {
    this.job = {
      ...Job.defaultJob(),
      Aid: row.aid,
      JobName: row.jobName,
      ReceivedFrom: row.receivedFrom,
      ClientContact: row.receivedFrom
    };
    this.jobTurnaround = {
      withCarisma: row.turnaroundInCarisma || 0,
      withClient: row.turnaroundInClient || 0,
      total: row.turnaroundDays || 0
    };
  }

  selectBucket(key: BucketCard['key']) {
    // "Total Jobs Closed/Open" clears the filter; any day-range bucket
    // toggles (clicking the same one again clears it too).
    this.selectedBucket = key === 'total_jobs_closed' ? null : (this.selectedBucket === key ? null : key);
    this.currentPage = 1;
  }

  matchesSelectedBucket(turnaroundDays: number): boolean {
    switch (this.selectedBucket) {
      case 'bucket_0_5': return turnaroundDays <= 5;
      case 'bucket_6_10': return turnaroundDays >= 6 && turnaroundDays <= 10;
      case 'bucket_11_20': return turnaroundDays >= 11 && turnaroundDays <= 20;
      case 'bucket_21_30': return turnaroundDays >= 21 && turnaroundDays <= 30;
      case 'bucket_31_60': return turnaroundDays >= 31 && turnaroundDays <= 60;
      case 'bucket_above_60': return turnaroundDays > 60;
      default: return true;
    }
  }

  get filteredJobRows(): TurnaroundJobRow[] {
    const f = this.filters;
    return this.jobRows.filter(row =>
      (f.receivedFrom.length === 0 || f.receivedFrom.includes(row.receivedFrom)) &&
      row.jobName.toLowerCase().includes(f.jobName.trim().toLowerCase()) &&
      (f.natureOfJob.length === 0 || f.natureOfJob.includes(row.natureOfJob)) &&
      (f.accountant.length === 0 || f.accountant.includes(row.accountant)) &&
      (f.jobStatus.length === 0 || f.jobStatus.includes(row.jobStatus)) &&
      this.matchesSelectedBucket(row.turnaroundDays)
    );
  }

  // Client-side export of the currently filtered rows — this grid has no
  // dedicated backend export endpoint (unlike Budget Overview's), so it
  // builds the CSV from what's already loaded instead of another API call.
  exportToExcel() {
    this.isExporting = true;
    const headers = [
      'Received From', 'Job Name', 'Nature of Job', 'Accountant', 'Job Status',
      'Turnaround (Days)', 'Turnaround in Carisma', 'Turnaround in Client', 'Budget Hrs', 'Time Taken'
    ];
    const escapeCsv = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
    const rows = this.filteredJobRows.map(r => [
      r.receivedFrom, r.jobName, r.natureOfJob, r.accountant, r.jobStatus,
      r.turnaroundDays, r.turnaroundInCarisma, r.turnaroundInClient, r.budgetTime, r.timeTaken
    ]);
    const csv = [headers, ...rows].map(row => row.map(escapeCsv).join(',')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const downloadURL = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadURL;
    link.download = `${this.jobStatus === 'closed' ? 'Closed' : 'Open'} Jobs Turnaround.csv`;
    link.click();
    window.URL.revokeObjectURL(downloadURL);
    this.isExporting = false;
  }

}
