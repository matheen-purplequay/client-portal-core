import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ClientService } from '../../../../services/entities/client.service';
import { ReportService } from '../../../../services/reports/report.service';
import { LocalStorageService } from '../../../../services/app/storage/local-storage.service';
import { ClientUserService } from '../../../../shared/services/navquery/wm-client.service';
import { Job, JobData } from '../../../../models/jobs';

interface VerticalOption {
  id: number;
  title: string;
}

interface ClosedJobRow {
  aid: number;
  groupJobName: string;
  jobName: string;
  status: string;
  natureOfJob: string;
  receivedFrom: string;
  partner: string;
  associate: string;
  fy: number;
  received: string;
  commenced: string;
  jobCompleted: string;
  budgetTime: string;
  timeTaken: string;
}

type MultiSelectFilterKey = 'status' | 'natureOfJob' | 'receivedFrom' | 'partner' | 'associate' | 'fy';
type FilterState = Record<MultiSelectFilterKey, any[]>;

/**
 * "Closed Jobs" — reached from the Job Status page's Closed Jobs card.
 * CALL SP_GetJobStatusstatuswiseclosedjob(pid, Cid, Serviceid, status) - same
 * column shape as the Open Jobs page's SP_GetJobStatusstatuswise, just
 * scoped to wsid 11 (Job Completed) by the proc itself.
 */
@Component({
  selector: 'app-closed-jobs',
  templateUrl: './closed-jobs.component.html',
  styleUrls: ['./closed-jobs.component.scss']
})
export class ClosedJobsComponent implements OnInit, OnDestroy {
  private clientUserSub?: Subscription;

  verticals: VerticalOption[] = [];
  selectedServiceId = 0; // 0 = all verticals
  isLoadingVerticals = false;
  viewMode: 'status' | 'manager' = 'status';

  dateFrom = '';
  dateTo = '';
  jobNameSearch = '';

  rows: ClosedJobRow[] = [];
  isLoadingRows = true;
  isExporting = false;

  filters: FilterState = {
    status: [], natureOfJob: [], receivedFrom: [], partner: [], associate: [], fy: []
  };
  openFilterDropdown: MultiSelectFilterKey | null = null;
  filterSearch: Record<MultiSelectFilterKey, string> = {
    status: '', natureOfJob: '', receivedFrom: '', partner: '', associate: '', fy: ''
  };

  // Job Details popup — same app-job-information component/modal used on
  // the Open Jobs/Turnaround pages, opened by clicking a row's job name.
  job: JobData = Job.defaultJob();

  constructor(
    private clientService: ClientService,
    private reportService: ReportService,
    private localStorageService: LocalStorageService,
    private clientUserService: ClientUserService
  ) { }

  ngOnInit(): void {
    // Default to "start of last month -> today" rather than just the
    // current month, so the grid isn't dumped with the entire history on
    // first load but also isn't empty right after a new month starts
    // (closed jobs skew toward month-end, so the first few days of a
    // month genuinely have none yet under a current-month-only default).
    // Still overridable/clearable via the filter.
    const today = new Date();
    const rangeStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    this.dateFrom = this.toDateInputValue(rangeStart);
    this.dateTo = this.toDateInputValue(today);

    this.fetchVerticals();
    this.loadJobs();

    this.clientUserSub = this.clientUserService.userChanged$.subscribe(() => {
      this.loadJobs();
      if (this.viewMode === 'manager') this.loadPartnerWiseJobs();
    });
  }

  ngOnDestroy(): void {
    this.clientUserSub?.unsubscribe();
  }

  @HostListener('document:click')
  onDocumentClick() {
    if (this.openFilterDropdown) {
      this.openFilterDropdown = null;
    }
  }

  // Same client-scoped vertical source as the Turnaround/Open Jobs pages.
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
    this.loadJobs();
    if (this.viewMode === 'manager') this.loadPartnerWiseJobs();
  }

  setViewMode(mode: 'status' | 'manager') {
    this.viewMode = mode;
    this.managerDrillDown = null;
    if (mode === 'manager' && !this.managerPartners.length) this.loadPartnerWiseJobs();
  }

  // Both the grid (client-side, via filteredRows) and the Manager View
  // matrix (server-side, via its own SP call) are scoped to the same
  // From/To range, so a date change needs to re-trigger the matrix too.
  onDateFilterChange() {
    if (this.viewMode === 'manager') this.loadPartnerWiseJobs();
  }

  isLoadingPartnerWise = false;
  managerPartners: string[] = [];
  managerStatuses: string[] = [];
  managerMatrix: { [status: string]: { [partner: string]: number } } = {};
  managerTotalsByPartner: { [partner: string]: number } = {};
  managerDrillDown: { partner: string, status: string | null } | null = null;

  loadPartnerWiseJobs() {
    this.isLoadingPartnerWise = true;
    this.reportService.getPartnerWiseJobsStatusClosed(this.selectedServiceId, this.dateFrom, this.dateTo).subscribe({
      next: (res: any) => {
        this.isLoadingPartnerWise = false;
        const rows = (res?.status && Array.isArray(res.data)) ? res.data : [];

        const matrix: { [status: string]: { [partner: string]: number } } = {};
        const totals: { [partner: string]: number } = {};
        const partners = new Set<string>();
        const statuses: string[] = [];

        rows.forEach((r: any) => {
          const partner = r.ReceivedFrom || 'Unknown';
          const status = r.Status || 'Unknown';
          const count = Number(r.Count) || 0;
          partners.add(partner);
          if (!matrix[status]) {
            matrix[status] = {};
            statuses.push(status);
          }
          matrix[status][partner] = (matrix[status][partner] || 0) + count;
          totals[partner] = (totals[partner] || 0) + count;
        });

        this.managerPartners = Array.from(partners).sort();
        this.managerStatuses = statuses.sort();
        this.managerMatrix = matrix;
        this.managerTotalsByPartner = totals;
      },
      error: () => {
        this.isLoadingPartnerWise = false;
        this.managerPartners = [];
        this.managerStatuses = [];
        this.managerMatrix = {};
        this.managerTotalsByPartner = {};
      }
    });
  }

  managerCount(status: string, partner: string): number {
    return this.managerMatrix[status]?.[partner] ?? 0;
  }

  managerTotalForPartner(partner: string): number {
    return this.managerTotalsByPartner[partner] ?? 0;
  }

  managerTotalForStatus(status: string): number {
    return this.managerPartners.reduce((sum, p) => sum + this.managerCount(status, p), 0);
  }

  get managerGrandTotal(): number {
    return this.managerPartners.reduce((sum, p) => sum + this.managerTotalForPartner(p), 0);
  }

  // Clicking a cell (a specific status) or a totals-row cell (status = null,
  // meaning every status) drills into the job grid below the matrix, which
  // stays visible - same pattern as the Open Jobs/Movement Manager Views.
  showManagerCellJobs(status: string | null, partner: string) {
    this.managerDrillDown = { partner, status };
  }

  backToPartnerWise() {
    this.managerDrillDown = null;
  }

  get managerDrillDownRows(): ClosedJobRow[] {
    if (!this.managerDrillDown) return [];
    const { partner, status } = this.managerDrillDown;
    return this.filteredRows.filter(r => r.receivedFrom === partner && (!status || r.status === status));
  }

  loadJobs() {
    this.isLoadingRows = true;
    this.reportService.getJobStatusStatuswiseClosed(this.selectedServiceId).subscribe({
      next: (res: any) => {
        this.isLoadingRows = false;
        const data = (res?.status && Array.isArray(res.data)) ? res.data : [];
        this.rows = data.map((r: any) => ({
          aid: r.aid,
          groupJobName: r.GroupJobName || '',
          jobName: r.Jobdescription || '',
          status: r.Workstatus || '',
          natureOfJob: r.Naturejob || '',
          receivedFrom: r.ReceivedFrom || r.contactname || '',
          partner: r.Partner || '',
          associate: r.EmployeeA || '',
          fy: r.FinancialYear,
          received: r.Daterecieved || '',
          commenced: r.CommencedDate || '',
          jobCompleted: r.Job_Completed || '',
          budgetTime: r.Budgettime || '',
          timeTaken: r.Timetaken || ''
        } as ClosedJobRow));
      },
      error: () => {
        this.isLoadingRows = false;
        this.rows = [];
      }
    });
  }

  // 'DD-MM-YYYY' -> 'YYYY-MM-DD' so it compares correctly as a plain string
  // against the <input type="date"> values (same approach as the MOM grid).
  // Date -> 'YYYY-MM-DD', the format <input type="date"> expects.
  private toDateInputValue(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private toComparable(ddmmyyyy: string): string {
    const [d, m, y] = (ddmmyyyy || '').split('-');
    return d && m && y ? `${y}-${m}-${d}` : '';
  }

  toggleFilterDropdown(key: MultiSelectFilterKey) {
    const opening = this.openFilterDropdown !== key;
    this.openFilterDropdown = opening ? key : null;
    if (opening) this.filterSearch[key] = '';
  }

  optionsFor(key: MultiSelectFilterKey): any[] {
    return this.rows
      .map(r => r[key])
      .filter((v, i, self) => v !== '' && v != null && self.indexOf(v) === i);
  }

  filteredOptionsFor(key: MultiSelectFilterKey): any[] {
    const term = this.filterSearch[key].trim().toLowerCase();
    const options = this.optionsFor(key);
    return term ? options.filter(o => String(o).toLowerCase().includes(term)) : options;
  }

  isOptionSelected(key: MultiSelectFilterKey, option: any): boolean {
    return this.filters[key].includes(option);
  }

  toggleFilterOption(key: MultiSelectFilterKey, option: any) {
    const current = this.filters[key];
    this.filters[key] = current.includes(option)
      ? current.filter(v => v !== option)
      : [...current, option];
  }

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
    if (selected.length === 1) return String(selected[0]);
    return `${selected.length} selected`;
  }

  get filteredRows(): ClosedJobRow[] {
    const f = this.filters;
    const term = this.jobNameSearch.trim().toLowerCase();
    return this.rows.filter(row => {
      if (this.dateFrom || this.dateTo) {
        const rowDate = this.toComparable(row.received);
        if (!rowDate) return false;
        if (this.dateFrom && rowDate < this.dateFrom) return false;
        if (this.dateTo && rowDate > this.dateTo) return false;
      }
      if (term && !row.jobName.toLowerCase().includes(term)) return false;
      return (f.status.length === 0 || f.status.includes(row.status)) &&
        (f.natureOfJob.length === 0 || f.natureOfJob.includes(row.natureOfJob)) &&
        (f.receivedFrom.length === 0 || f.receivedFrom.includes(row.receivedFrom)) &&
        (f.partner.length === 0 || f.partner.includes(row.partner)) &&
        (f.associate.length === 0 || f.associate.includes(row.associate)) &&
        (f.fy.length === 0 || f.fy.includes(row.fy));
    });
  }

  get hasActiveFilters(): boolean {
    return !!this.dateFrom || !!this.dateTo || !!this.jobNameSearch ||
      Object.values(this.filters).some(v => v.length > 0);
  }

  clearDateFilter() {
    this.dateFrom = '';
    this.dateTo = '';
    this.onDateFilterChange();
  }

  clearFilters() {
    this.dateFrom = '';
    this.dateTo = '';
    this.jobNameSearch = '';
    this.filters = { status: [], natureOfJob: [], receivedFrom: [], partner: [], associate: [], fy: [] };
    this.onDateFilterChange();
  }

  openJobDetails(row: ClosedJobRow) {
    this.job = {
      ...Job.defaultJob(),
      Aid: row.aid,
      JobName: row.jobName,
      Status: row.status,
      ClientContact: row.receivedFrom,
      Datereceived: row.received,
      GroupJobName: row.groupJobName,
      NatureOfJob: row.natureOfJob,
      ReceivedFrom: row.receivedFrom,
      ReceivedDate: row.received,
      Accountant: row.partner
    };
  }

  // Client-side export of the currently filtered rows — this grid has no
  // dedicated backend export endpoint, so it builds the CSV from what's
  // already loaded (same approach as the Turnaround page).
  exportToExcel() {
    this.isExporting = true;
    const headers = [
      'Group Job Name', 'Job Name', 'Job Status', 'Nature of Job', 'Received From', 'Partner', 'Associate',
      'FY', 'Received Date', 'Commenced Date', 'Job Completed', 'Budget Time', 'Time Taken', 'Variance'
    ];
    const escapeCsv = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
    const rows = this.filteredRows.map(r => [
      r.groupJobName, r.jobName, r.status, r.natureOfJob, r.receivedFrom, r.partner, r.associate,
      r.fy, r.received, r.commenced, r.jobCompleted, r.budgetTime, r.timeTaken, this.varianceLabel(r)
    ]);
    const csv = [headers, ...rows].map(row => row.map(escapeCsv).join(',')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const downloadURL = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadURL;
    link.download = 'Closed Jobs.csv';
    link.click();
    window.URL.revokeObjectURL(downloadURL);
    this.isExporting = false;
  }

  // Exports the currently drilled-into job list if one is open, otherwise
  // the Job Status x Partner matrix itself (same CSV-blob approach as the
  // Status View's export).
  exportManagerView() {
    this.isExporting = true;
    const escapeCsv = (value: string | number) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    let csv: string;
    let filename: string;

    if (this.managerDrillDown) {
      const headers = [
        'Job Name', 'Group Job Name', 'Job Status', 'Nature of Job', 'Received From', 'Partner', 'Associate',
        'FY', 'Received Date', 'Commenced Date', 'Job Completed', 'Budget Time', 'Time Taken', 'Variance'
      ];
      const rows = this.managerDrillDownRows.map(r => [
        r.jobName, r.groupJobName, r.status, r.natureOfJob, r.receivedFrom, r.partner, r.associate,
        r.fy, r.received, r.commenced, r.jobCompleted, r.budgetTime, r.timeTaken, this.varianceLabel(r)
      ]);
      csv = [headers, ...rows].map(row => row.map(escapeCsv).join(',')).join('\r\n');
      filename = `Closed Jobs - ${this.managerDrillDown.partner}.csv`;
    } else {
      const headers = ['Job Status', ...this.managerPartners, 'Total'];
      const rows = this.managerStatuses.map(s => [
        s, ...this.managerPartners.map(p => this.managerCount(s, p)), this.managerTotalForStatus(s)
      ]);
      csv = [headers, ...rows].map(row => row.map(escapeCsv).join(',')).join('\r\n');
      filename = 'Closed Jobs by Partner.csv';
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const downloadURL = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadURL;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(downloadURL);
    this.isExporting = false;
  }

  // 'HH:MM:SS' -> total seconds.
  private toSeconds(hhmmss: string): number {
    const [h, m, s] = (hhmmss || '00:00:00').split(':').map(Number);
    return (h || 0) * 3600 + (m || 0) * 60 + (s || 0);
  }

  private varianceSeconds(row: ClosedJobRow): number {
    return this.toSeconds(row.budgetTime) - this.toSeconds(row.timeTaken);
  }

  isOverBudget(row: ClosedJobRow): boolean {
    return this.varianceSeconds(row) < 0;
  }

  // Budget - Time Taken, signed, formatted 'HH:MM' (matches the Budget
  // Overview page's variance column).
  varianceLabel(row: ClosedJobRow): string {
    const seconds = Math.abs(this.varianceSeconds(row));
    const hh = Math.floor(seconds / 3600);
    const mm = Math.floor((seconds % 3600) / 60);
    const sign = this.varianceSeconds(row) < 0 ? '-' : '+';
    return `${sign}${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
  }
}
