import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReportService } from '../../../services/reports/report.service';
import { ClientService } from '../../../services/entities/client.service';
import { LocalStorageService } from '../../../services/app/storage/local-storage.service';

interface VerticalOption {
  id: number;
  title: string;
}

type MovementCategory = 'new' | 'queries' | 'review' | 'closed' | 'other';
// 'otherStatus' means "a specific status within the 'other' bucket" — which
// one is tracked separately in selectedOtherStatus, since there's no fixed
// set of them (see otherStatusBreakdown).
type MovementSelection = 'all' | 'new' | 'queries' | 'review' | 'closed' | 'otherStatus';
type MovementPeriod = '7d' | '14d' | '1m' | 'custom';
type MultiSelectFilterKey = 'receivedFrom' | 'natureOfJob' | 'movement' | 'fromStatus' | 'toStatus';

interface MovementRow {
  receivedFrom: string;
  jobName: string;
  natureOfJob: string;
  category: MovementCategory;
  movementBadge: string;
  fromStatus: string;
  toStatus: string;
  date: string;
}

interface MovementFilters {
  // Empty array = "All" (no filter) for the multi-select columns.
  receivedFrom: string[];
  jobName: string;
  natureOfJob: string[];
  movement: string[];
  fromStatus: string[];
  toStatus: string[];
  date: string;
}

const PERIOD_LABELS: Record<MovementPeriod, string> = {
  '7d': 'Last 7 days',
  '14d': 'Last 14 days',
  '1m': 'Last 1 month',
  'custom': 'Custom range'
};

@Component({
  selector: 'app-movement',
  templateUrl: './movement.component.html',
  styleUrls: ['./movement.component.scss']
})
export class MovementComponent implements OnInit {

  period: MovementPeriod = '7d';
  customFrom = '';
  customTo = '';

  fromDate = '';
  toDate = '';

  rows: MovementRow[] = [];
  isLoading = false;
  isExporting = false;

  selection: MovementSelection = 'all';
  selectedOtherStatus: string | null = null;

  filters: MovementFilters = {
    receivedFrom: [], jobName: '', natureOfJob: [], movement: [],
    fromStatus: [], toStatus: [], date: ''
  };

  receivedFromOptions: string[] = [];
  natureOfJobOptions: string[] = [];
  movementOptions: string[] = [];
  fromStatusOptions: string[] = [];
  toStatusOptions: string[] = [];

  openFilterDropdown: MultiSelectFilterKey | null = null;

  // Search box text per dropdown, used to narrow the option list shown
  // (Select All / actual filtering still apply to the full option set).
  filterSearch: Record<MultiSelectFilterKey, string> = {
    receivedFrom: '', natureOfJob: '', movement: '', fromStatus: '', toStatus: ''
  };

  selectedServiceId = 0; // 0 = all verticals

  // Same client-scoped vertical source (and same tab UI) as the dashboard
  // home page / Turnaround Report / Budget Overview / Feedback.
  verticals: VerticalOption[] = [];
  isLoadingVerticals = false;

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
    if (key === 'movement') return this.movementOptions;
    if (key === 'fromStatus') return this.fromStatusOptions;
    return this.toStatusOptions;
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

  // 'YYYY-MM-DD' (or a datetime with that prefix) -> 'DD-MM-YYYY'.
  formatDate(value: string): string {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value || '');
    return match ? `${match[3]}-${match[2]}-${match[1]}` : (value || '');
  }

  ngOnInit(): void {
    // Arriving from the dashboard home's vertical tabs (?service_id=...)
    // should scope this page to that vertical, not all verticals.
    const serviceIdParam = Number(this.route.snapshot.queryParamMap.get('service_id'));
    if (!isNaN(serviceIdParam)) {
      this.selectedServiceId = serviceIdParam;
    }
    this.fetchVerticals();
    this.fetchMovementReport();
  }

  // Mirrors DashboardPageComponent.fetchVerticals().
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
    this.fetchMovementReport();
  }

  get isCustomPeriod(): boolean {
    return this.period === 'custom';
  }

  applyFilter() {
    this.fetchMovementReport();
  }

  fetchMovementReport() {
    this.isLoading = true;
    this.reportService.getMovementReport(this.period, this.customFrom, this.customTo, this.selectedServiceId).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        const data = (res.status && Array.isArray(res.data)) ? res.data : [];
        this.fromDate = res.from_date || '';
        this.toDate = res.to_date || '';
        this.rows = data.map((row: any) => ({
          receivedFrom: row.received_from || '',
          jobName: row.job_name || '',
          natureOfJob: row.nature_of_job || '',
          category: row.category,
          movementBadge: row.movement_badge || '',
          fromStatus: row.from_status || '',
          toStatus: row.to_status || '',
          date: this.formatDate(row.date || '')
        } as MovementRow));

        const distinct = (values: string[]) => values.filter((v, i, self) => v && self.indexOf(v) === i);
        this.receivedFromOptions = distinct(this.rows.map(r => r.receivedFrom));
        this.natureOfJobOptions = distinct(this.rows.map(r => r.natureOfJob));
        this.movementOptions = distinct(this.rows.map(r => r.movementBadge));
        this.fromStatusOptions = distinct(this.rows.map(r => r.fromStatus));
        this.toStatusOptions = distinct(this.rows.map(r => r.toStatus));
      },
      error: () => {
        this.isLoading = false;
        this.rows = [];
      }
    });
  }

  selectCard(selection: MovementSelection) {
    this.selection = selection;
    this.selectedOtherStatus = null;
  }

  selectOtherStatus(status: string) {
    this.selection = 'otherStatus';
    this.selectedOtherStatus = status;
  }

  rowsFor(category: MovementCategory): MovementRow[] {
    return this.rows.filter(row => row.category === category);
  }

  // One row per distinct "to" status among jobs the 4 fixed cards don't
  // already cover (New/Queries/Review/Closed), each with its own count —
  // replaces a single catch-all "Other Status Changed" bucket.
  get otherStatusBreakdown(): { status: string; count: number }[] {
    const counts = new Map<string, number>();
    for (const row of this.rowsFor('other')) {
      const status = row.toStatus || 'Unknown';
      counts.set(status, (counts.get(status) || 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count);
  }

  get selectedRows(): MovementRow[] {
    if (this.selection === 'all') return this.rows;
    if (this.selection === 'otherStatus') {
      return this.rowsFor('other').filter(row => row.toStatus === this.selectedOtherStatus);
    }
    return this.rowsFor(this.selection);
  }

  get filteredRows(): MovementRow[] {
    const f = this.filters;
    return this.selectedRows.filter(row =>
      (f.receivedFrom.length === 0 || f.receivedFrom.includes(row.receivedFrom)) &&
      row.jobName.toLowerCase().includes(f.jobName.trim().toLowerCase()) &&
      (f.natureOfJob.length === 0 || f.natureOfJob.includes(row.natureOfJob)) &&
      (f.movement.length === 0 || f.movement.includes(row.movementBadge)) &&
      (f.fromStatus.length === 0 || f.fromStatus.includes(row.fromStatus)) &&
      (f.toStatus.length === 0 || f.toStatus.includes(row.toStatus)) &&
      row.date.toLowerCase().includes(f.date.trim().toLowerCase())
    );
  }

  get tableTitle(): string {
    switch (this.selection) {
      case 'new': return 'New Jobs Received';
      case 'queries': return 'Sent for Queries';
      case 'review': return 'Sent for Review';
      case 'closed': return 'Closed';
      case 'otherStatus': return this.selectedOtherStatus || 'Status Changed';
      default: return 'All Movement';
    }
  }

  get periodLabel(): string {
    return PERIOD_LABELS[this.period];
  }

  exportToExcel() {
    this.isExporting = true;
    this.reportService.exportMovementReport(this.period, this.customFrom, this.customTo, this.selectedServiceId).subscribe({
      next: (data: any) => {
        const downloadURL = window.URL.createObjectURL(data);
        const link = document.createElement('a');
        link.href = downloadURL;
        link.download = 'Movement Report.xlsx';
        link.click();
        this.isExporting = false;
      },
      error: () => {
        this.isExporting = false;
      }
    });
  }

}
