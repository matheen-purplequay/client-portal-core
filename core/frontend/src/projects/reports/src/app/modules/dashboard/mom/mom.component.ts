import { Component, HostListener, OnInit } from '@angular/core';
import { ReportService } from '../../../services/reports/report.service';

interface MOMRow {
  clientName: string;
  clientPresent: string;
  purpose: string;
  description: string;
  date: string;
  vertical: string;
}

type MultiSelectFilterKey = 'clientName' | 'clientPresent' | 'purpose' | 'vertical';

@Component({
  selector: 'app-mom',
  templateUrl: './mom.component.html',
  styleUrls: ['./mom.component.scss']
})
export class MOMComponent implements OnInit {

  rows: MOMRow[] = [];
  isLoading = false;

  // Row's 'date' comes from the backend already formatted as 'DD-MM-YYYY'
  // (see get-mom-report), so the range filter below is compared against
  // that same format rather than a Date object.
  dateFrom = '';
  dateTo = '';

  selectedRow: MOMRow | null = null;

  filters: Record<MultiSelectFilterKey, string[]> = {
    clientName: [], clientPresent: [], purpose: [], vertical: []
  };
  openFilterDropdown: MultiSelectFilterKey | null = null;
  filterSearch: Record<MultiSelectFilterKey, string> = {
    clientName: '', clientPresent: '', purpose: '', vertical: ''
  };

  constructor(private reportService: ReportService) { }

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
      .filter((v, i, self) => v && self.indexOf(v) === i);
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

  ngOnInit(): void {
    // Default to the last month so the grid isn't dumped with the entire
    // history on first load; still overridable/clearable via the filter.
    const today = new Date();
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    this.dateTo = this.toDateInputValue(today);
    this.dateFrom = this.toDateInputValue(monthAgo);
    this.fetchMOMReport();
  }

  // Date -> 'YYYY-MM-DD', the format <input type="date"> expects.
  private toDateInputValue(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  viewDescription(row: MOMRow) {
    this.selectedRow = row;
  }

  // 'DD-MM-YYYY' -> 'YYYY-MM-DD' so it sorts/compares correctly as a plain string.
  private toComparable(ddmmyyyy: string): string {
    const [d, m, y] = (ddmmyyyy || '').split('-');
    return d && m && y ? `${y}-${m}-${d}` : '';
  }

  get filteredRows(): MOMRow[] {
    const f = this.filters;
    return this.rows.filter(row => {
      if (this.dateFrom || this.dateTo) {
        const rowDate = this.toComparable(row.date);
        if (!rowDate) return false;
        if (this.dateFrom && rowDate < this.dateFrom) return false;
        if (this.dateTo && rowDate > this.dateTo) return false;
      }
      return (f.clientName.length === 0 || f.clientName.includes(row.clientName)) &&
        (f.clientPresent.length === 0 || f.clientPresent.includes(row.clientPresent)) &&
        (f.purpose.length === 0 || f.purpose.includes(row.purpose)) &&
        (f.vertical.length === 0 || f.vertical.includes(row.vertical));
    });
  }

  get hasActiveFilters(): boolean {
    return !!this.dateFrom || !!this.dateTo ||
      this.filters.clientName.length > 0 || this.filters.clientPresent.length > 0 ||
      this.filters.purpose.length > 0 || this.filters.vertical.length > 0;
  }

  clearDateFilter() {
    this.dateFrom = '';
    this.dateTo = '';
  }

  clearFilters() {
    this.dateFrom = '';
    this.dateTo = '';
    this.filters = { clientName: [], clientPresent: [], purpose: [], vertical: [] };
  }

  fetchMOMReport() {
    this.isLoading = true;
    this.reportService.getMOMReport().subscribe({
      next: (res: any) => {
        this.isLoading = false;
        const data = (res.status && Array.isArray(res.data)) ? res.data : [];
        this.rows = data.map((row: any) => ({
          clientName: row.client_name || '',
          clientPresent: row.client_present || '',
          purpose: row.purpose || '',
          description: row.description || '',
          date: row.date || '',
          vertical: row.vertical || ''
        } as MOMRow));
      },
      error: () => {
        this.isLoading = false;
        this.rows = [];
      }
    });
  }

}
