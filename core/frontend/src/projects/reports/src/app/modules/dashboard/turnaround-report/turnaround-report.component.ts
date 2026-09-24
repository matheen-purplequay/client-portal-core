import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReportService } from '../../../services/reports/report.service';
import { ClientService } from '../../../services/entities/client.service';
import { LocalStorageService } from '../../../services/app/storage/local-storage.service';

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
export class TurnaroundReportComponent implements OnInit {

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

  constructor(
    private reportService: ReportService,
    private route: ActivatedRoute,
    private elementRef: ElementRef,
    private clientService: ClientService,
    private localStorageService: LocalStorageService
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
    this.fetchStatusCounts();
    this.fetchTurnaroundReport();
    this.fetchTurnaroundJobsList();
  }

  // Mirrors DashboardPageComponent.fetchVerticals(): same client-scoped
  // engagement_verticals source, keyed on new_service_id (the id the
  // job-filtering stored procedures expect via jobmonitor.serviceid).
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
    this.fetchStatusCounts();
    this.fetchTurnaroundReport();
    this.fetchTurnaroundJobsList();
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
          receivedFrom: row.received_from || '',
          jobName: row.job_name || '',
          natureOfJob: row.nature_of_job || '',
          accountant: row.accountant || '',
          jobStatus: row.job_status || '',
          turnaroundDays: Number(row.turnaround_days) || 0,
          turnaroundInCarisma: Number(row.turnaround_in_carisma) || 0,
          turnaroundInClient: Number(row.turnaround_in_client) || 0,
          budgetTime: row.budget_time || '00:00',
          timeTaken: row.time_taken || '00:00'
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

  get filteredJobRows(): TurnaroundJobRow[] {
    const f = this.filters;
    return this.jobRows.filter(row =>
      (f.receivedFrom.length === 0 || f.receivedFrom.includes(row.receivedFrom)) &&
      row.jobName.toLowerCase().includes(f.jobName.trim().toLowerCase()) &&
      (f.natureOfJob.length === 0 || f.natureOfJob.includes(row.natureOfJob)) &&
      (f.accountant.length === 0 || f.accountant.includes(row.accountant)) &&
      (f.jobStatus.length === 0 || f.jobStatus.includes(row.jobStatus))
    );
  }

}
