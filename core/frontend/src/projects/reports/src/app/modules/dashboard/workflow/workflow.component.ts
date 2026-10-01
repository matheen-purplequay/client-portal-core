import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ReportService } from '../../../services/reports/report.service';
import { ClientService } from '../../../services/entities/client.service';
import { LocalStorageService } from '../../../services/app/storage/local-storage.service';
import { ClientUserService } from '../../../shared/services/navquery/wm-client.service';

interface WorkflowRow {
  jobDescription: string;
  teamName: string;
  nameA: string;
  workstatus: string;
  timeWillTake: string;
  expectedFinishDate: string;
  budgetTime: string;
  totalBillable: string;
  remainingBalance: string;
  isOverBudget: boolean;
  serviceId: number | null;
  statusColour: string;
  statusContent: string;
}

interface VerticalOption {
  id: number;
  title: string;
}

interface WorkflowGroup {
  associate: string;
  rows: (WorkflowRow & { sno: number })[];
  statusColour: string;
  statusContent: string;
}

type MultiSelectFilterKey = 'teamName' | 'nameA' | 'workstatus';

@Component({
  selector: 'app-workflow',
  templateUrl: './workflow.component.html',
  styleUrls: ['./workflow.component.scss']
})
export class WorkflowComponent implements OnInit, OnDestroy {

  private clientUserSub?: Subscription;

  rows: WorkflowRow[] = [];
  isLoading = false;

  searchTerm = '';

  filters: Record<MultiSelectFilterKey, string[]> = {
    teamName: [], nameA: [], workstatus: []
  };
  openFilterDropdown: MultiSelectFilterKey | null = null;
  filterSearch: Record<MultiSelectFilterKey, string> = {
    teamName: '', nameA: '', workstatus: ''
  };

  verticals: VerticalOption[] = [];
  isLoadingVerticals = false;
  selectedServiceId = 0; // 0 = all verticals

  constructor(
    private reportService: ReportService,
    private clientService: ClientService,
    private localStorageService: LocalStorageService,
    private clientUserService: ClientUserService
  ) { }

  ngOnInit(): void {
    this.fetchVerticals();
    this.fetchWorkflowStandUp();

    this.clientUserSub = this.clientUserService.userChanged$.subscribe(() => {
      this.fetchWorkflowStandUp();
    });
  }

  ngOnDestroy(): void {
    this.clientUserSub?.unsubscribe();
  }

  // Same sp_get_client_verticals source as the Turnaround/Job pages.
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
    this.selectedServiceId = id;
  }

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

  optionsFor(key: MultiSelectFilterKey): string[] {
    return this.rows
      .map(r => r[key])
      .filter((v, i, self) => v && self.indexOf(v) === i)
      .sort((a, b) => a.localeCompare(b));
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

  fetchWorkflowStandUp() {
    this.isLoading = true;
    this.reportService.getWorkflowStandUp().subscribe({
      next: (res: any) => {
        this.isLoading = false;
        const data = (res.status && Array.isArray(res.data)) ? res.data : [];
        this.rows = data
          // A contract with no stand-up logged today comes back as a row
          // with every stand-up field null (see SP_FullJobListingStandUp) -
          // drop those placeholder rows rather than showing a blank line.
          .filter((row: any) => row.job_description || row.time_will_take)
          .map((row: any) => {
            const remainingMinutes = this.toMinutes(row.budget_time) - this.toMinutes(row.total_billable);
            return {
              jobDescription: row.job_description || '',
              teamName: row.team_name || '',
              nameA: row.name_a || '',
              workstatus: row.workstatus || '',
              timeWillTake: row.time_will_take || '',
              expectedFinishDate: this.toDDMMYYYY(row.expected_finish_date),
              budgetTime: this.toHHMM(row.budget_time),
              totalBillable: this.toHHMM(row.total_billable),
              remainingBalance: this.minutesToHHMM(remainingMinutes),
              isOverBudget: remainingMinutes < 0,
              serviceId: row.service_id ?? null,
              statusColour: row.status_colour || '',
              statusContent: row.status_content || ''
            } as WorkflowRow;
          });
      },
      error: () => {
        this.isLoading = false;
        this.rows = [];
      }
    });
  }

  // Backend returns 'YYYY-MM-DD' (the raw SP_FullJobListingStandUp date) -
  // displayed as 'DD-MM-YYYY' to match the date format used elsewhere in
  // this app (e.g. the MOM grid).
  private toDDMMYYYY(value: string): string {
    if (!value) return '';
    const [y, m, d] = value.split('-');
    return (y && m && d) ? `${d}-${m}-${y}` : value;
  }

  // 'HH:MM:SS' or 'HH:MM' -> 'HH:MM'.
  private toHHMM(value: string): string {
    if (!value) return '00:00';
    const [h, m] = value.split(':');
    return `${h.padStart(2, '0')}:${(m || '00').padStart(2, '0')}`;
  }

  // 'HH:MM:SS' or 'HH:MM' -> total minutes, so Budget Time and Total
  // Billable can be subtracted without string parsing on the diff itself.
  private toMinutes(value: string): number {
    if (!value) return 0;
    const [h, m] = value.split(':');
    return (Number(h) || 0) * 60 + (Number(m) || 0);
  }

  // Negative minutes (over budget) render as '-HH:MM' rather than wrapping.
  private minutesToHHMM(totalMinutes: number): string {
    const sign = totalMinutes < 0 ? '-' : '';
    const abs = Math.abs(totalMinutes);
    const h = Math.floor(abs / 60);
    const m = abs % 60;
    return `${sign}${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  get filteredRows(): WorkflowRow[] {
    const term = this.searchTerm.trim().toLowerCase();
    const f = this.filters;
    return this.rows.filter(row => {
      if (this.selectedServiceId !== 0 && row.serviceId !== this.selectedServiceId) return false;
      if (term && !row.jobDescription.toLowerCase().includes(term)) return false;
      if (f.teamName.length > 0 && !f.teamName.includes(row.teamName)) return false;
      if (f.nameA.length > 0 && !f.nameA.includes(row.nameA)) return false;
      if (f.workstatus.length > 0 && !f.workstatus.includes(row.workstatus)) return false;
      return true;
    });
  }

  // Jobs grouped under each Associate, with the per-associate status
  // (colour + content, same value on every one of their rows from the SP)
  // surfaced once below the group instead of repeated on every job line.
  get groupedRows(): WorkflowGroup[] {
    const groups: WorkflowGroup[] = [];
    const indexByAssociate = new Map<string, number>();
    let sno = 0;
    for (const row of this.filteredRows) {
      sno++;
      const key = row.nameA || '-';
      let idx = indexByAssociate.get(key);
      if (idx === undefined) {
        idx = groups.length;
        indexByAssociate.set(key, idx);
        groups.push({ associate: key, rows: [], statusColour: row.statusColour, statusContent: row.statusContent });
      }
      groups[idx].rows.push({ ...row, sno });
    }
    return groups;
  }

  get hasActiveFilters(): boolean {
    return !!this.searchTerm || this.selectedServiceId !== 0 || this.filters.teamName.length > 0 ||
      this.filters.nameA.length > 0 || this.filters.workstatus.length > 0;
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedServiceId = 0;
    this.filters = { teamName: [], nameA: [], workstatus: [] };
  }

}
