import { AfterViewInit, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ClientService } from '../../../../services/entities/client.service';
import { ReportService } from '../../../../services/reports/report.service';
import { LocalStorageService } from '../../../../services/app/storage/local-storage.service';
import { ClientUserService } from '../../../../shared/services/navquery/wm-client.service';
import { Job, JobData } from '../../../../models/jobs';

interface VerticalOption {
  title: string;
  serviceId: number;
}

/**
 * "Open Jobs" — reached from the Job Status page's Open Jobs card.
 * Everything on this page is wired to real data: the vertical tabs, the
 * With Carisma / With Client counts, the status tiles, and the job grid
 * below (SP_GetJobStatusstatuswise, purpose-built for this page - clicking a
 * status tile filters the grid server-side via its own __status param).
 */
@Component({
  selector: 'app-open-jobs-by-holder',
  templateUrl: './open-jobs-by-holder.component.html',
  styleUrls: ['./open-jobs-by-holder.component.scss']
})
export class OpenJobsByHolderComponent implements OnInit, OnDestroy, AfterViewInit {
  private clientUserSub?: Subscription;

  verticalOptions: VerticalOption[] = [];
  // 'All' (service_id 0) is the default, same scope as the Home page's
  // vertical tabs - previously this page had no "All" option and silently
  // defaulted to the first specific vertical, which made its counts (e.g.
  // With Carisma) disagree with Home's all-verticals total.
  activeVertical = 'All';
  isLoadingVerticals = true;
  viewMode = 'status';

  isLoadingOpenCounts = true;
  totalLiveJobs: number | string = '-';
  withCarisma: number | string = '-';
  withClient: number | string = '-';

  // Job Details popup — same app-job-details component/modal used on the
  // Job Status page, opened by clicking a row's job name.
  job: JobData = Job.defaultJob();

  constructor(
    private clientService: ClientService,
    private reportService: ReportService,
    private localStorageService: LocalStorageService,
    private clientUserService: ClientUserService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // Arriving from the Home page's With Carisma/With Client tile (?holder=...)
    // should land with that holder already selected, instead of always
    // defaulting to 'client' regardless of which tile was clicked.
    const holderParam = this.route.snapshot.queryParamMap.get('holder');
    if (holderParam === 'carisma' || holderParam === 'client') {
      this.selectedHolder = holderParam;
    }
    this.fetchVerticals();

    // Keep the page in sync when the navbar's client-user (Cid) dropdown
    // changes, since this page otherwise only reads it once via
    // getSelectedContactId() inside ReportService.
    this.clientUserSub = this.clientUserService.userChanged$.subscribe(() => {
      this.setVertical(this.activeVertical);
    });
  }

  ngOnDestroy(): void {
    this.clientUserSub?.unsubscribe();
    document.getElementById('openJobsDetailsPopup')?.removeEventListener('hidden.bs.modal', this.reopenManagerPopupOnJobPopupClose);
  }

  // Bootstrap only tracks one modal/backdrop at a time by default, so
  // opening the job-details popup on top of the Manager View drill-down
  // popup and then closing the job-details one cascades into closing both.
  // Re-showing the manager popup here (only when we're actually mid
  // drill-down) makes closing the job popup return to the manager popup
  // instead of dropping out of it entirely.
  private reopenManagerPopupOnJobPopupClose = (): void => {
    if (!this.managerDrillDown) return;
    const el = document.getElementById('managerCellJobsPopup');
    const bs = (window as any).bootstrap;
    if (el && bs?.Modal) {
      bs.Modal.getOrCreateInstance(el).show();
    }
  };

  ngAfterViewInit(): void {
    document.getElementById('openJobsDetailsPopup')?.addEventListener('hidden.bs.modal', this.reopenManagerPopupOnJobPopupClose);
  }

  get verticals(): string[] {
    return this.verticalOptions.map(v => v.title);
  }

  // Loaded via the sp_get_client_verticals stored procedure (same source as
  // the Home page's vertical tabs), just without an "All" option.
  fetchVerticals(): void {
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
        this.verticalOptions = Array.from(byTitle, ([title, serviceId]) => ({ title, serviceId }));
        // setVertical resolves any title it doesn't recognize (including the
        // 'All' default) to service_id 0, so this covers both the "no
        // verticals configured" case and the normal "start on All" case.
        this.setVertical(this.activeVertical);
      },
      error: () => {
        this.isLoadingVerticals = false;
        this.verticalOptions = [];
        this.setVertical(this.activeVertical);
      }
    });
  }

  loadOpenCounts(serviceId: number): void {
    this.isLoadingOpenCounts = true;
    this.reportService.getJobsLiveCounts(serviceId).subscribe({
      next: (res: any) => {
        this.isLoadingOpenCounts = false;
        if (res?.status && res.data) {
          this.totalLiveJobs = res.data.total_live_jobs ?? 0;
          this.withCarisma = res.data.with_carisma ?? 0;
          this.withClient = res.data.with_client ?? 0;
        }
      },
      error: () => {
        this.isLoadingOpenCounts = false;
      }
    });
  }

  // holder + wsid: which party is currently sitting on jobs in that status
  // (drives the With Carisma / With Client filter) and the workstatus.wno -
  // also what gets passed as SP_GetJobStatusstatuswise's __status param when
  // a tile is clicked, so the grid below is filtered server-side. Classification
  // confirmed against both the `workstatus` table's WithCarisma/WithClient
  // flags and the real Jobs widget's yellow="client held" tiles
  // (bs-job-table.tsx) - On Hold is client-held, not Carisma, despite how it
  // may look at a glance.
  statusTiles = [
    { label: 'Sent for Queries', wsid: 5, value: 0, holder: 'client' },
    { label: 'Sent for Review', wsid: 32, value: 0, holder: 'client' },
    { label: 'Sent for Final Review', wsid: 6, value: 0, holder: 'client' },
    { label: 'On Hold', wsid: 34, value: 0, holder: 'client' },
    { label: 'WIP - Processing', wsid: 4, value: 0, holder: 'carisma' },
    { label: 'Internal Review', wsid: 28, value: 0, holder: 'carisma' },
    { label: 'WIP - Query Replies', wsid: 24, value: 0, holder: 'carisma' },
    { label: 'WIP - Review Replies', wsid: 25, value: 0, holder: 'carisma' },
  ];

  isLoadingStatusTiles = true;
  selectedHolder: 'carisma' | 'client' | null = 'client';

  // sp_totaljobstatuscountbyclientwiseNew - a single GROUP BY J.wsid query
  // scoped exactly like Sp_JobListingLiveCounts (same tbl_clientcontactmaping
  // FIND_IN_SET join, same date cutoff, same closed/overhead wsid exclusion),
  // so these tiles now sum to the same total as the With Carisma / With
  // Client cards above. Returns one row per wsid that has jobs, columns
  // Wsid/NewWorkStatus/count/WithCarisma/WithClient.
  loadStatusCounts(serviceId: number): void {
    this.isLoadingStatusTiles = true;
    this.reportService.getTotalJobStatusCountNew(serviceId).subscribe({
      next: (res: any) => {
        this.isLoadingStatusTiles = false;
        const rows = (res?.status && Array.isArray(res.data)) ? res.data : [];
        // holder comes from the SP's own WithClient/WithCarisma flags (same
        // columns Sp_PartnerWiseJobsStatus and the workstatus table expose),
        // not a hardcoded guess - "With Client" tiles are whichever statuses
        // the data itself flags WithClient = 1, and likewise for Carisma.
        const byKey = new Map<number, { count: number, holder: 'client' | 'carisma' | null }>();
        rows.forEach((row: any) => {
          const holder: 'client' | 'carisma' | null = row.WithClient ? 'client' : row.WithCarisma ? 'carisma' : null;
          byKey.set(row.Wsid, { count: row.count, holder });
        });
        this.statusTiles = this.statusTiles.map(t => {
          const found = byKey.get(t.wsid);
          // Fall back to the tile's existing holder when this Wsid has no
          // rows this time (e.g. genuinely zero jobs in it right now).
          return { ...t, value: found?.count ?? 0, holder: found?.holder ?? t.holder };
        });
      },
      error: () => {
        this.isLoadingStatusTiles = false;
      }
    });
  }

  get visibleStatusTiles() {
    return this.selectedHolder ? this.statusTiles.filter(t => t.holder === this.selectedHolder) : this.statusTiles;
  }

  selectHolder(holder: 'carisma' | 'client'): void {
    // No toggle-off: clicking the already-selected holder is a no-op, not a
    // "show all" reset. Toggling meant a double-click (two rapid clicks on
    // the same button) selected it then immediately deselected it back to
    // null, which showed every status tile (Carisma + Client) at once -
    // exactly the reported bug.
    if (this.selectedHolder === holder) return;
    this.selectedHolder = holder;
    this.selectedWsid = null;
    this.loadJobs(this.currentServiceId, 0);
  }

  selectedWsid: number | null = null;

  selectStatus(wsid: number): void {
    this.selectedWsid = this.selectedWsid === wsid ? null : wsid;
    this.loadJobs(this.currentServiceId, this.selectedWsid || 0);
  }

  get breadcrumbs(): string[] {
    const crumbs = ['Open Jobs', this.viewMode === 'manager' ? 'Manager View' : 'Status View'];
    if (this.selectedHolder) crumbs.push(this.selectedHolder === 'client' ? 'With Client' : 'With Carisma');
    if (this.managerDrillPartner) crumbs.push(this.managerDrillPartner);
    if (this.selectedWsid) {
      const statusLabel = Object.keys(this.managerStatusToWsid).find(k => this.managerStatusToWsid[k] === this.selectedWsid)
        ?? this.statusTiles.find(t => t.wsid === this.selectedWsid)?.label;
      if (statusLabel) crumbs.push(statusLabel);
    }
    return crumbs;
  }

  isFullscreen = false;

  @HostListener('document:fullscreenchange')
  onFullscreenChange(): void {
    this.isFullscreen = !!document.fullscreenElement;
  }

  toggleFullscreen(): void {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  }

  // --- Column filter row ---------------------------------------------------
  // Text filters (GroupJobName, Job Name) and multi-select-with-checkboxes
  // filters (Job Status, Naturejob, ReceivedFrom, Partner, Associate, FY).
  // All applied client-side against the already-loaded grid.
  textFilters: { groupJobName: string, jobDescription: string } = { groupJobName: '', jobDescription: '' };

  multiSelectFields: { key: 'status' | 'natureOfJob' | 'receivedFrom' | 'partner' | 'associate' | 'fy', label: string }[] = [
    { key: 'status', label: 'Job Status' },
    { key: 'natureOfJob', label: 'Naturejob' },
    { key: 'receivedFrom', label: 'ReceivedFrom' },
    { key: 'partner', label: 'Partner' },
    { key: 'associate', label: 'Associate' },
    { key: 'fy', label: 'FY' },
  ];

  // A field with no entry here (or an empty Set) means "all" - not filtered.
  columnFilters: { [key: string]: Set<any> } = {};
  openFilterKey: string | null = null;

  // Options come from the currently loaded (server-scoped) rows, not from
  // the column-filtered result, so the dropdown list itself stays stable
  // while other filters are toggled.
  fieldOptions(field: string): any[] {
    const values = new Set<any>();
    this.rows.forEach((r: any) => {
      const v = r[field];
      if (v !== '' && v !== null && v !== undefined) values.add(v);
    });
    return Array.from(values).sort();
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.openFilterKey = null;
  }

  toggleFilterDropdown(field: string): void {
    if (this.openFilterKey === field) {
      this.openFilterKey = null;
      return;
    }
    if (!this.columnFilters[field]) {
      this.columnFilters[field] = new Set(this.fieldOptions(field));
    }
    this.openFilterKey = field;
  }

  isOptionChecked(field: string, value: any): boolean {
    return !this.columnFilters[field] || this.columnFilters[field].has(value);
  }

  toggleOption(field: string, value: any): void {
    if (!this.columnFilters[field]) {
      this.columnFilters[field] = new Set(this.fieldOptions(field));
    }
    const set = this.columnFilters[field];
    if (set.has(value)) set.delete(value); else set.add(value);
  }

  isAllChecked(field: string): boolean {
    const set = this.columnFilters[field];
    return !set || set.size >= this.fieldOptions(field).length;
  }

  toggleAll(field: string): void {
    this.columnFilters[field] = this.isAllChecked(field) ? new Set() : new Set(this.fieldOptions(field));
  }

  filterSummary(field: string): string {
    const options = this.fieldOptions(field);
    const set = this.columnFilters[field];
    // Unchecking every box is treated as "All" (see isFieldFiltered) rather
    // than showing an empty grid, so the label matches that behaviour.
    if (!set || set.size === 0 || set.size >= options.length) return 'All';
    if (set.size === 1) return String(set.values().next().value);
    return `${set.size} selected`;
  }

  isFieldFiltered(field: string): boolean {
    const set = this.columnFilters[field];
    // size === 0 (every box unchecked) is treated the same as "all selected" -
    // otherwise the grid would go blank the moment someone clears every box,
    // which reads as broken rather than "no results".
    return !!set && set.size > 0 && set.size < this.fieldOptions(field).length;
  }

  // With Carisma / With Client scope the grid to jobs whose current status is
  // one of that holder's tiles (matched case-insensitively against the tile
  // labels, since SP_GetJobStatusstatuswise's __status only accepts a single
  // Wsid - it can't filter to a whole holder group server-side). When a
  // specific status tile is picked instead, the grid is already scoped to
  // just that Wsid server-side, so the holder filter is skipped (it's
  // redundant, and the tile could belong to a holder other than the one
  // still visually selected above it).
  get visibleRows() {
    let rows = this.rows;

    if (!this.selectedWsid && this.selectedHolder) {
      const labels = new Set(
        this.statusTiles.filter(t => t.holder === this.selectedHolder).map(t => t.label.toLowerCase())
      );
      rows = rows.filter(r => labels.has(r.status.toLowerCase()));
    }

    const gj = this.textFilters.groupJobName.trim().toLowerCase();
    if (gj) rows = rows.filter(r => r.groupJobName.toLowerCase().includes(gj));

    const jd = this.textFilters.jobDescription.trim().toLowerCase();
    if (jd) rows = rows.filter(r => r.jobDescription.toLowerCase().includes(jd));

    for (const f of this.multiSelectFields) {
      if (this.isFieldFiltered(f.key)) {
        const set = this.columnFilters[f.key];
        rows = rows.filter((r: any) => set.has(r[f.key]));
      }
    }

    return rows;
  }

  isLoadingRows = true;
  isExporting = false;
  currentServiceId = 0;
  // Every column SP_GetJobStatusstatuswise returns, one field per column -
  // the per-status date columns (yetToStart..jobCompleted) are the same
  // status-change history the Home page's Yesterday's Workflow and the real
  // Jobs page show, just all present here at once per job.
  rows: {
    aid: number, groupJobName: string, jobDescription: string, associate: string, director: string, receivedFrom: string,
    natureOfJob: string, partner: string, fy: number, commenced: string,
    received: string, deadline: string,
    yetToStart: string, wipProcessing: string, sentForQueries: string, queryRepliesReceivedYetToAttend: string,
    wipQueryReplies: string, internalReview: string, wipInternalReviewReplies: string, sentForReview: string,
    reviewRepliesReceivedYetToAttend: string, wipReviewReplies: string, sentForFinalReview: string,
    onHold: string, jobCompleted: string,
    budgetTime: string, timeTaken: string, underBudget: string, status: string
  }[] = [];

  // Open Jobs page grid - CALL SP_GetJobStatusstatuswise(pid, Cid, Serviceid, status);
  // purpose-built for this page. wsid 0 = all (see visibleRows note above);
  // any other value = the procedure itself filters to that Wsid server-side.
  loadJobs(serviceId: number, wsid: number = 0): void {
    this.currentServiceId = serviceId;
    this.isLoadingRows = true;
    this.textFilters = { groupJobName: '', jobDescription: '' };
    this.columnFilters = {};
    this.openFilterKey = null;
    this.reportService.getJobStatusStatuswise(serviceId, wsid).subscribe({
      next: (res: any) => {
        this.isLoadingRows = false;
        const data = (res?.status && Array.isArray(res.data)) ? res.data : [];
        this.rows = data.map((r: any) => ({
          aid: r.aid,
          groupJobName: r.GroupJobName || '',
          jobDescription: r.Jobdescription || '',
          associate: r.AssociateName || r.EmployeeA || '',
          director: r.Asdirector || '',
          receivedFrom: r.ReceivedFrom || r.contactname || '',
          natureOfJob: r.Naturejob || '',
          partner: r.Partner || '',
          fy: r.FinancialYear,
          commenced: r.CommencedDate || '',
          received: r.Daterecieved || '',
          deadline: r.Deadlinebyclient || '',
          yetToStart: r.Job_In_Yet_To_Start || '',
          wipProcessing: r.WIP_Processing || '',
          sentForQueries: r.Sent_For_Queries || '',
          queryRepliesReceivedYetToAttend: r.Query_Replies_Received_Yet_To_Attend || '',
          wipQueryReplies: r.WIP_Query_Replies || '',
          internalReview: r.Internal_Review || '',
          wipInternalReviewReplies: r.WIP_Internal_Review_Replies || '',
          sentForReview: r.Sent_For_Review || '',
          reviewRepliesReceivedYetToAttend: r.Review_Replies_Received_Yet_To_Attend || '',
          wipReviewReplies: r.WIP_Review_Replies || '',
          sentForFinalReview: r.Sent_For_Final_Review || '',
          onHold: r.On_Hold || '',
          jobCompleted: r.Job_Completed || '',
          budgetTime: r.Budgettime || '',
          timeTaken: r.Timetaken || '',
          underBudget: r.UnderBudget || '',
          status: r.Workstatus || ''
        }));
      },
      error: () => {
        this.isLoadingRows = false;
        this.rows = [];
      }
    });
  }

  setVertical(v: string): void {
    this.activeVertical = v;
    const option = this.verticalOptions.find(o => o.title === v);
    this.loadOpenCounts(option?.serviceId || 0);
    this.loadStatusCounts(option?.serviceId || 0);
    this.selectedWsid = null;
    this.loadJobs(option?.serviceId || 0, 0);
    this.loadPartnerWiseJobs(option?.serviceId || 0);
  }

  setViewMode(mode: string): void {
    this.viewMode = mode;
    this.managerDrillDown = false;
    this.managerDrillPartner = null;
  }

  openJobDetails(row: {
    aid: number, groupJobName: string, jobDescription: string, status: string, natureOfJob: string,
    receivedFrom: string, received: string, partner: string
  }): void {
    this.job = {
      ...Job.defaultJob(),
      Aid: row.aid,
      JobName: row.jobDescription,
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

  // --- Manager View: Partner Wise Jobs matrix -------------------------------
  // Fixed row order matching the real Jobs page's status list (same order as
  // total-job-status-count's StatusName list / SP_GetJobStatusstatuswise's
  // per-status date columns).
  managerStatuses = [
    'Job In Yet To Start', 'WIP Processing', 'Sent For Queries',
    'Query Replies Rcvd. Yet To Attend', 'WIP Query Replies', 'Internal Review',
    'WIP Internal Review Replies', 'Sent For Review', 'Review Replies Rcvd. Yet To Attend',
    'WIP Review Replies', 'Sent For Final Review', 'On Hold', 'Cancelled'
  ];

  // Sp_PartnerWiseJobsStatus's Status text uses the workstatus table's
  // NewWorkStatus spelling (e.g. "WIP - Processing", "Job-In Yet To Start") -
  // this maps each to the managerStatuses label above it's pivoted under.
  private managerStatusAliases: { [key: string]: string } = {
    'job-in yet to start': 'Job In Yet To Start',
    'wip - processing': 'WIP Processing',
    'sent for queries': 'Sent For Queries',
    'query replies received - yet to attend': 'Query Replies Rcvd. Yet To Attend',
    'wip - query replies': 'WIP Query Replies',
    'internal review': 'Internal Review',
    'wip - internal review replies': 'WIP Internal Review Replies',
    'sent for review': 'Sent For Review',
    'review replies received - yet to attend': 'Review Replies Rcvd. Yet To Attend',
    'wip - review replies': 'WIP Review Replies',
    'sent for final review': 'Sent For Final Review',
    'job completed': 'Job Completed',
    'on hold': 'On Hold',
    'cancelled': 'Cancelled'
  };

  // Which holder each status belongs to (from the workstatus table's
  // WithClient/WithCarisma flags) - only "Sent For..."/On Hold/Cancelled are
  // client-held, everything else sits with Carisma. Used to scope the
  // Partner Wise matrix's rows/totals to the selected holder card.
  // Not private - the matrix template uses this directly for the row-accent
  // left border (client = brand maroon, carisma = navy).
  managerStatusHolder: { [label: string]: 'client' | 'carisma' } = {
    'Job In Yet To Start': 'carisma',
    'WIP Processing': 'carisma',
    'Sent For Queries': 'client',
    'Query Replies Rcvd. Yet To Attend': 'carisma',
    'WIP Query Replies': 'carisma',
    'Internal Review': 'carisma',
    'WIP Internal Review Replies': 'carisma',
    'Sent For Review': 'client',
    'Review Replies Rcvd. Yet To Attend': 'carisma',
    'WIP Review Replies': 'carisma',
    'Sent For Final Review': 'client',
    'Job Completed': 'carisma',
    'On Hold': 'client',
    'Cancelled': 'client'
  };

  get visibleManagerStatuses(): string[] {
    let statuses = this.managerStatuses;
    if (this.selectedHolder) {
      statuses = statuses.filter(s => this.managerStatusHolder[s] === this.selectedHolder);
    }
    return statuses.filter(s => this.managerPartners.some(p => this.managerCount(s, p) > 0));
  }

  managerTotalForPartner(partner: string): number {
    return this.visibleManagerStatuses.reduce((sum, s) => sum + this.managerCount(s, partner), 0);
  }

  // Same Total column/grand-total design as the Movement page's Manager
  // View matrix (managerTotalForStatus/managerGrandTotal there).
  managerTotalForStatus(status: string): number {
    return this.managerPartners.reduce((sum, p) => sum + this.managerCount(status, p), 0);
  }

  get managerGrandTotal(): number {
    return this.managerPartners.reduce((sum, p) => sum + this.managerTotalForPartner(p), 0);
  }

  // The Wsid each managerStatuses row corresponds to, so clicking a cell can
  // reopen Status View filtered to that exact status server-side (same Wsid
  // numbering as workstatus.wno / the status tiles above).
  private managerStatusToWsid: { [label: string]: number } = {
    'Job In Yet To Start': 1,
    'WIP Processing': 4,
    'Sent For Queries': 5,
    'Query Replies Rcvd. Yet To Attend': 30,
    'WIP Query Replies': 24,
    'Internal Review': 28,
    'WIP Internal Review Replies': 31,
    'Sent For Review': 32,
    'Review Replies Rcvd. Yet To Attend': 33,
    'WIP Review Replies': 25,
    'Sent For Final Review': 6,
    'Job Completed': 11,
    'On Hold': 34,
    'Cancelled': 35
  };

  isLoadingPartnerWise = true;
  managerPartners: string[] = [];
  managerMatrix: { [status: string]: { [partner: string]: number } } = {};
  managerTotalsByPartner: { [partner: string]: number } = {};

  loadPartnerWiseJobs(serviceId: number): void {
    this.isLoadingPartnerWise = true;
    this.reportService.getPartnerWiseJobsStatus(serviceId).subscribe({
      next: (res: any) => {
        this.isLoadingPartnerWise = false;
        const rows = (res?.status && Array.isArray(res.data)) ? res.data : [];

        const matrix: { [status: string]: { [partner: string]: number } } = {};
        this.managerStatuses.forEach(s => matrix[s] = {});
        const totals: { [partner: string]: number } = {};
        const partners = new Set<string>();

        rows.forEach((r: any) => {
          const partner = r.ReceivedFrom || 'Unknown';
          const status = this.managerStatusAliases[(r.Status || '').toLowerCase()];
          const count = Number(r.Count) || 0;
          partners.add(partner);
          totals[partner] = (totals[partner] || 0) + count;
          // status can alias to a label no longer in managerStatuses (e.g.
          // 'Job Completed', deliberately excluded from the matrix rows) -
          // guard against writing into a matrix slot that doesn't exist,
          // which would otherwise throw mid-loop and abort before
          // managerPartners/managerTotalsByPartner below ever get set.
          if (status && matrix[status]) {
            matrix[status][partner] = (matrix[status][partner] || 0) + count;
          }
        });

        this.managerPartners = Array.from(partners).sort();
        this.managerMatrix = matrix;
        this.managerTotalsByPartner = totals;
      },
      error: () => {
        this.isLoadingPartnerWise = false;
        this.managerPartners = [];
        this.managerMatrix = {};
        this.managerTotalsByPartner = {};
      }
    });
  }

  managerCount(status: string, partner: string): number {
    return this.managerMatrix[status]?.[partner] ?? 0;
  }

  // Clicking a cell (a specific status) or a totals-row cell (status = null,
  // meaning every status) drills into the job grid without leaving Manager
  // View (the tab stays active), reloads the grid scoped to that exact Wsid
  // server-side (0 = all, same as the totals row), and filters it down to
  // just that one partner via the existing ReceivedFrom column filter - same
  // behaviour for both With Carisma and With Client cells, since it's driven
  // entirely by the clicked status/Wsid. selectedHolder is left as-is (not
  // forced to null): the "Total Jobs" figure itself is already scoped to
  // whichever holder card is active (see managerTotalForPartner), so the
  // grid it opens must stay scoped the same way via visibleRows' existing
  // holder filter - otherwise the grid would show more jobs than the total
  // it was opened from implied.
  managerDrillDown = false;
  managerDrillPartner: string | null = null;

  showManagerCellJobs(status: string | null, partner: string): void {
    const wsid = status ? (this.managerStatusToWsid[status] || 0) : 0;
    this.managerDrillDown = true;
    this.managerDrillPartner = partner;
    this.selectedWsid = wsid || null;
    this.loadJobs(this.currentServiceId, wsid);
    this.columnFilters['receivedFrom'] = new Set([partner]);
  }

  backToPartnerWise(): void {
    this.managerDrillDown = false;
    this.managerDrillPartner = null;
    this.selectedWsid = null;
  }

  // Client-side export of the currently visible (filtered) rows — this grid
  // has no dedicated backend export endpoint, so it builds the CSV from
  // what's already loaded (same approach as the Turnaround/Closed Jobs pages).
  exportToExcel(): void {
    this.isExporting = true;
    const headers = [
      'Group Job Name', 'Job Name', 'Job Status', 'Nature of Job', 'Received From', 'Partner', 'Associate', 'Director',
      'FY', 'Received Date', 'Commenced Date', 'Yet To Start', 'WIP Processing', 'Sent For Queries',
      'Query Replies Rcvd/Yet To Attend', 'WIP Query Replies', 'Internal Review', 'WIP Internal Review Replies',
      'Sent For Review', 'Review Replies Rcvd/Yet To Attend', 'WIP Review Replies', 'Sent For Final Review', 'On Hold'
    ];
    const escapeCsv = (value: string | number) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const rows = this.visibleRows.map((r: any) => [
      r.groupJobName, r.jobDescription, r.status, r.natureOfJob, r.receivedFrom, r.partner, r.associate, r.director,
      r.fy, r.received, r.commenced, r.yetToStart, r.wipProcessing, r.sentForQueries, r.queryRepliesReceivedYetToAttend,
      r.wipQueryReplies, r.internalReview, r.wipInternalReviewReplies, r.sentForReview, r.reviewRepliesReceivedYetToAttend,
      r.wipReviewReplies, r.sentForFinalReview, r.onHold
    ]);
    const csv = [headers, ...rows].map(row => row.map(escapeCsv).join(',')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const downloadURL = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadURL;
    link.download = 'Open Jobs.csv';
    link.click();
    window.URL.revokeObjectURL(downloadURL);
    this.isExporting = false;
  }
}
