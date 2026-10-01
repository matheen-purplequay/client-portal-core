import { Component, ElementRef, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { ReportService } from '../../../services/reports/report.service';
import { ClientService } from '../../../services/entities/client.service';
import { LocalStorageService } from '../../../services/app/storage/local-storage.service';
import { ClientUserService } from '../../../shared/services/navquery/wm-client.service';
import { Job, JobData } from '../../../models/jobs';

interface VerticalOption {
  id: number;
  title: string;
}

// The 13 fixed buckets Sp_WorkStatusMovements groups NewWsid/Wsid into
// (+ 'other' for any row outside all of them, which the proc's own Total
// doesn't count either). Mirrors movementCategory() in movement.php.
type MovementCategory =
  | 'job_in_yet_to_start' | 'wip_processing' | 'sent_for_queries'
  | 'query_replies_received_yet_to_attend' | 'wip_query_replies' | 'internal_review'
  | 'wip_internal_review_replies' | 'sent_for_review' | 'review_replies_received_yet_to_attend'
  | 'wip_review_replies' | 'sent_for_final_review' | 'on_hold' | 'job_completed' | 'other';
// 'carisma'/'client' are the two holder totals — an aggregate over every
// bucket with that accent, not one of Sp_WorkStatusMovements' own buckets.
type MovementSelection = 'all' | 'carisma' | 'client' | MovementCategory;
type MovementPeriod = '7d' | '14d' | '1m' | 'custom';

interface MovementCard {
  key: MovementCategory;
  label: string;
  // Which side currently holds the job — 'carisma' (blue): received/being
  // worked on internally; 'client' (brown): sent out, waiting on the
  // client. Same two-holder split as the Jobs page's With Carisma/With
  // Client cards, applied here per status instead of per job.
  accent: 'carisma' | 'client';
}

// Same 13 buckets/labels as movementCategory() in movement.php, in the
// EXACT column order Sp_WorkStatusMovements returns them.
const MOVEMENT_CARDS: MovementCard[] = [
  { key: 'job_in_yet_to_start', label: 'New Jobs Received', accent: 'carisma' },
  { key: 'wip_processing', label: 'WIP - Processing', accent: 'carisma' },
  { key: 'sent_for_queries', label: 'Sent For Queries', accent: 'client' },
  { key: 'query_replies_received_yet_to_attend', label: 'Query Replies Received - Yet To Attend', accent: 'carisma' },
  { key: 'wip_query_replies', label: 'WIP - Query Replies', accent: 'carisma' },
  { key: 'internal_review', label: 'Internal Review', accent: 'carisma' },
  { key: 'wip_internal_review_replies', label: 'WIP - Internal Review Replies', accent: 'carisma' },
  { key: 'sent_for_review', label: 'Sent For Review', accent: 'client' },
  { key: 'review_replies_received_yet_to_attend', label: 'Review Replies Received - Yet To Attend', accent: 'carisma' },
  { key: 'wip_review_replies', label: 'WIP - Review Replies', accent: 'carisma' },
  { key: 'sent_for_final_review', label: 'Sent For Final Review', accent: 'client' },
  { key: 'on_hold', label: 'On Hold', accent: 'carisma' },
  { key: 'job_completed', label: 'Job Completed', accent: 'carisma' }
];
// Manager View's Sp_WorkStatusMovementsforpartners returns raw workstatus
// text, normalized here to our MOVEMENT_CARDS keys so the same 13 cards/
// labels/accents drive both views. Confirmed live against real data: only
// "Job-In Yet To Start" differs from our own label wording; every other
// status already matches verbatim.
const MANAGER_STATUS_ALIASES: Record<string, MovementCategory> = {
  'job-in yet to start': 'job_in_yet_to_start',
  'wip - processing': 'wip_processing',
  'sent for queries': 'sent_for_queries',
  'query replies received - yet to attend': 'query_replies_received_yet_to_attend',
  'wip - query replies': 'wip_query_replies',
  'internal review': 'internal_review',
  'wip - internal review replies': 'wip_internal_review_replies',
  'sent for review': 'sent_for_review',
  'review replies received - yet to attend': 'review_replies_received_yet_to_attend',
  'wip - review replies': 'wip_review_replies',
  'sent for final review': 'sent_for_final_review',
  'on hold': 'on_hold',
  'job completed': 'job_completed'
};

type MultiSelectFilterKey = 'receivedFrom' | 'natureOfJob' | 'movement' | 'fromStatus' | 'toStatus';

interface MovementRow {
  aid: number;
  receivedFrom: string;
  jobName: string;
  natureOfJob: string;
  category: MovementCategory;
  movementBadge: string;
  fromStatus: string;
  toStatus: string;
  date: string;
  receivedDate: string;
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
export class MovementComponent implements OnInit, OnDestroy {
  private clientUserSub?: Subscription;

  // Job Details popup — same app-job-information component/modal used on
  // the Jobs/Turnaround/Closed Jobs pages, opened by clicking a row's job
  // name.
  job: JobData = Job.defaultJob();

  openJobDetails(row: MovementRow) {
    this.job = {
      ...Job.defaultJob(),
      Aid: row.aid,
      JobName: row.jobName,
      Status: row.toStatus,
      ClientContact: row.receivedFrom,
      NatureOfJob: row.natureOfJob,
      ReceivedFrom: row.receivedFrom,
      Datereceived: row.receivedDate,
      ReceivedDate: row.receivedDate
    };
  }

  period: MovementPeriod = '7d';
  customFrom = '';
  customTo = '';

  fromDate = '';
  toDate = '';

  rows: MovementRow[] = [];
  isLoading = false;
  isExporting = false;

  // Defaults to "With Carisma" rather than "All", so the grid opens already
  // filtered to the jobs the firm is actively holding.
  selection: MovementSelection = 'carisma';

  movementCards = MOVEMENT_CARDS;
  // Authoritative counts from Sp_WorkStatusMovements, keyed by category —
  // displayed on the cards. Row-level filtering still uses `rows`/`category`
  // (from get-movement-report), which uses the identical bucket definitions.
  summaryCounts: Record<MovementCategory, number> = {
    job_in_yet_to_start: 0, wip_processing: 0, sent_for_queries: 0,
    query_replies_received_yet_to_attend: 0, wip_query_replies: 0, internal_review: 0,
    wip_internal_review_replies: 0, sent_for_review: 0, review_replies_received_yet_to_attend: 0,
    wip_review_replies: 0, sent_for_final_review: 0, on_hold: 0, job_completed: 0, other: 0
  };
  totalMovementCount = 0;
  isLoadingSummary = false;

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

  viewMode: 'status' | 'manager' = 'status';

  // --- Manager View: Status x Partner matrix ------------------------------
  isLoadingManager = false;
  managerPartners: string[] = [];
  managerMatrix: Partial<Record<MovementCategory, Record<string, number>>> = {};
  managerWithCarisma = 0;
  managerWithClient = 0;
  managerSelection: MovementSelection = 'all';
  managerDrillDown: { status: MovementCategory | null; partner: string } | null = null;

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
    // Movement data isn't fetched until fetchVerticals() settles on a final
    // selectedServiceId (it defaults to the first vertical once loaded) —
    // fetching here too raced it: an "all verticals" count would flash
    // briefly before being overwritten by the real single-vertical one a
    // moment later.
    this.fetchVerticals();

    // Keep the page in sync when the navbar's client-user (Cid) dropdown
    // changes, since this page otherwise only reads it once via
    // getSelectedContactId() inside ReportService.
    this.clientUserSub = this.clientUserService.userChanged$.subscribe(() => {
      this.applyFilter();
    });
  }

  ngOnDestroy(): void {
    this.clientUserSub?.unsubscribe();
  }

  fetchWorkStatusSummary() {
    this.isLoadingSummary = true;
    this.reportService.getMovementWorkStatusSummary(this.period, this.customFrom, this.customTo, this.selectedServiceId).subscribe({
      next: (res: any) => {
        this.isLoadingSummary = false;
        const data = (res.status && res.data) ? res.data : null;
        if (data) {
          this.movementCards.forEach(card => {
            this.summaryCounts[card.key] = Number(data[card.key]) || 0;
          });
          this.totalMovementCount = Number(data.total) || 0;
        }
      },
      error: () => {
        this.isLoadingSummary = false;
      }
    });
  }

  // Loaded via the sp_get_client_verticals stored procedure — same source
  // as the Jobs page (open-jobs-by-holder) and the Home landing page,
  // instead of the query-builder-based client/get-verticals endpoint.
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

        // No "All" tab anymore — default to the first vertical, same as
        // the Jobs page, unless we already arrived scoped to a valid one
        // (e.g. via ?service_id= from the dashboard home's tabs). Set it
        // directly rather than via selectVertical() so the movement data
        // is only ever fetched once, already scoped to the final vertical.
        if (this.verticals.length && !this.verticals.some(v => v.id === this.selectedServiceId)) {
          this.selectedServiceId = this.verticals[0].id;
        }
        this.fetchMovementReport();
        this.fetchWorkStatusSummary();
      },
      error: () => {
        this.isLoadingVerticals = false;
        this.verticals = [];
        this.fetchMovementReport();
        this.fetchWorkStatusSummary();
      }
    });
  }

  selectVertical(id: number) {
    if (this.selectedServiceId === id) return;
    this.selectedServiceId = id;
    this.fetchMovementReport();
    this.fetchWorkStatusSummary();
    this.fetchMovementPartners();
  }

  get isCustomPeriod(): boolean {
    return this.period === 'custom';
  }

  applyFilter() {
    this.fetchMovementReport();
    this.fetchWorkStatusSummary();
    this.fetchMovementPartners();
  }

  // Manager View is lazy-loaded on first switch to it, then kept in sync by
  // applyFilter()/selectVertical() like everything else on the page.
  setViewMode(mode: 'status' | 'manager') {
    if (this.viewMode === mode) return;
    this.viewMode = mode;
    if (mode === 'manager' && !this.managerPartners.length && !this.isLoadingManager) {
      this.fetchMovementPartners();
    }
  }

  fetchMovementPartners() {
    this.isLoadingManager = true;
    this.reportService.getMovementPartners(this.period, this.customFrom, this.customTo, this.selectedServiceId).subscribe({
      next: (res: any) => {
        this.isLoadingManager = false;
        const data = (res.status && Array.isArray(res.data)) ? res.data : [];

        const matrix: Partial<Record<MovementCategory, Record<string, number>>> = {};
        const partners = new Set<string>();
        let withCarisma = 0;
        let withClient = 0;

        data.forEach((row: any) => {
          const partner = row.received_from || 'Unknown';
          partners.add(partner);
          const count = Number(row.count) || 0;
          if (row.with_carisma != null) withCarisma += Number(row.with_carisma) || 0;
          if (row.with_client != null) withClient += Number(row.with_client) || 0;

          const key = MANAGER_STATUS_ALIASES[(row.status || '').trim().toLowerCase()];
          if (key) {
            if (!matrix[key]) matrix[key] = {};
            matrix[key]![partner] = (matrix[key]![partner] || 0) + count;
          }
        });

        this.managerPartners = Array.from(partners).sort();
        this.managerMatrix = matrix;
        this.managerWithCarisma = withCarisma;
        this.managerWithClient = withClient;
      },
      error: () => {
        this.isLoadingManager = false;
        this.managerPartners = [];
        this.managerMatrix = {};
        this.managerWithCarisma = 0;
        this.managerWithClient = 0;
      }
    });
  }

  selectManagerCard(selection: MovementSelection) {
    this.managerSelection = selection;
    this.managerDrillDown = null;
  }

  get managerActiveHolder(): 'carisma' | 'client' | null {
    if (this.managerSelection === 'carisma' || this.managerSelection === 'client') return this.managerSelection;
    if (this.managerSelection === 'all') return null;
    return this.movementCards.find(c => c.key === this.managerSelection)?.accent ?? null;
  }

  get visibleManagerCards(): MovementCard[] {
    const holder = this.managerActiveHolder;
    const cards = holder ? this.movementCards.filter(c => c.accent === holder) : this.movementCards;
    // Same loading guard as visibleMovementCards — nothing's loaded yet
    // means every count is 0, which would otherwise hide the whole row.
    if (this.isLoadingManager) return cards;
    return cards.filter(c => this.managerPartners.some(p => this.managerCount(c.key, p) > 0));
  }

  managerCount(status: MovementCategory, partner: string): number {
    return this.managerMatrix[status]?.[partner] ?? 0;
  }

  managerTotalForPartner(partner: string): number {
    return this.visibleManagerCards.reduce((sum, c) => sum + this.managerCount(c.key, partner), 0);
  }

  // Angular templates can't use arrow functions inline, so this replaces
  // the `managerPartners.reduce((s, p) => ...)` expressions that used to
  // live directly in the template.
  managerTotalForStatus(status: MovementCategory): number {
    return this.managerPartners.reduce((sum, p) => sum + this.managerCount(status, p), 0);
  }

  get managerGrandTotal(): number {
    return this.managerPartners.reduce((sum, p) => sum + this.managerTotalForPartner(p), 0);
  }

  // Clicking a cell drills into the already-loaded Status View rows
  // (SP_clientportalMovementReport), filtered to that exact status/partner —
  // no extra fetch needed since it's the same underlying data, just grouped
  // differently. status = null (a partner's Total cell) means every status.
  showManagerCellJobs(status: MovementCategory | null, partner: string): void {
    this.managerDrillDown = { status, partner };
  }

  backToPartnerMatrix(): void {
    this.managerDrillDown = null;
  }

  get managerDrillDownRows(): MovementRow[] {
    if (!this.managerDrillDown) return [];
    const { status, partner } = this.managerDrillDown;
    return this.rows.filter(r => r.receivedFrom === partner && (status === null || r.category === status));
  }

  // Same filter row/state as Status View's grid (filters, ms-filter
  // dropdowns, Job Name search, Date search) reused here.
  get managerDrillDownFilteredRows(): MovementRow[] {
    const f = this.filters;
    return this.managerDrillDownRows.filter(row =>
      (f.receivedFrom.length === 0 || f.receivedFrom.includes(row.receivedFrom)) &&
      row.jobName.toLowerCase().includes(f.jobName.trim().toLowerCase()) &&
      (f.natureOfJob.length === 0 || f.natureOfJob.includes(row.natureOfJob)) &&
      (f.movement.length === 0 || f.movement.includes(row.movementBadge)) &&
      (f.fromStatus.length === 0 || f.fromStatus.includes(row.fromStatus)) &&
      (f.toStatus.length === 0 || f.toStatus.includes(row.toStatus)) &&
      row.date.toLowerCase().includes(f.date.trim().toLowerCase())
    );
  }

  get managerDrillDownTitle(): string {
    if (!this.managerDrillDown) return '';
    const label = this.managerDrillDown.status
      ? (this.movementCards.find(c => c.key === this.managerDrillDown!.status)?.label || 'Status')
      : 'All Statuses';
    return `${label} · ${this.managerDrillDown.partner}`;
  }

  fetchMovementReport() {
    this.isLoading = true;
    this.reportService.getMovementReport(this.period, this.customFrom, this.customTo, this.selectedServiceId).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        const data = (res.status && Array.isArray(res.data)) ? res.data : [];
        this.fromDate = res.from_date || '';
        this.toDate = res.to_date || '';
        this.rows = data
          .map((row: any) => ({
            aid: Number(row.aid) || 0,
            receivedFrom: row.received_from || '',
            jobName: row.job_name || '',
            natureOfJob: row.nature_of_job || '',
            category: row.category,
            movementBadge: row.movement_badge || '',
            fromStatus: row.from_status || '',
            toStatus: row.to_status || '',
            date: this.formatDate(row.date || ''),
            receivedDate: this.formatDate(row.received_date || '')
          } as MovementRow))
          // Cancelled jobs don't belong in the grid — they're not one of
          // Sp_WorkStatusMovements' 13 tracked buckets either.
          .filter((row: MovementRow) => !/cancel/i.test(row.fromStatus) && !/cancel/i.test(row.toStatus));

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
  }

  rowsFor(category: MovementCategory): MovementRow[] {
    return this.rows.filter(row => row.category === category);
  }

  // Aggregates over every bucket with the given accent — 'other' rows
  // (no card, no accent) are excluded from both, same as they're excluded
  // from Sp_WorkStatusMovements' own Total.
  rowsForHolder(holder: 'carisma' | 'client'): MovementRow[] {
    const keys = this.movementCards.filter(c => c.accent === holder).map(c => c.key);
    return this.rows.filter(row => keys.includes(row.category));
  }

  holderCount(holder: 'carisma' | 'client'): number {
    return this.movementCards
      .filter(c => c.accent === holder)
      .reduce((sum, c) => sum + (this.summaryCounts[c.key] || 0), 0);
  }

  get selectedRows(): MovementRow[] {
    if (this.selection === 'all') return this.rows;
    if (this.selection === 'carisma' || this.selection === 'client') return this.rowsForHolder(this.selection);
    return this.rowsFor(this.selection);
  }

  // The holder currently scoping the status-card row: either selected
  // directly (With Carisma/With Client), or inherited from whichever
  // individual status card is selected — so picking a card within an
  // already-narrowed row keeps it narrowed instead of snapping back to all
  // 13 on every click. Only 'all' (Total) shows everything.
  get activeHolder(): 'carisma' | 'client' | null {
    if (this.selection === 'carisma' || this.selection === 'client') return this.selection;
    if (this.selection === 'all') return null;
    return this.movementCards.find(c => c.key === this.selection)?.accent ?? null;
  }

  get visibleMovementCards(): MovementCard[] {
    const holder = this.activeHolder;
    const cards = holder ? this.movementCards.filter(c => c.accent === holder) : this.movementCards;
    // Don't hide zero-count cards while the counts are still loading —
    // they're all 0 at that point (nothing fetched yet), which would empty
    // the whole row until the real data arrives.
    if (this.isLoadingSummary) return cards;
    return cards.filter(c => this.summaryCounts[c.key] > 0);
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

  get selectedVerticalLabel(): string {
    if (this.selectedServiceId === 0) return 'All Verticals';
    return this.verticals.find(v => v.id === this.selectedServiceId)?.title || 'All Verticals';
  }

  get hasActiveFilters(): boolean {
    const f = this.filters;
    return f.receivedFrom.length > 0 || !!f.jobName || f.natureOfJob.length > 0 ||
      f.movement.length > 0 || f.fromStatus.length > 0 || f.toStatus.length > 0 || !!f.date ||
      this.selection !== 'carisma';
  }

  clearFilters() {
    this.filters = {
      receivedFrom: [], jobName: '', natureOfJob: [], movement: [],
      fromStatus: [], toStatus: [], date: ''
    };
    this.selection = 'carisma';
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
