import { Component, OnInit } from '@angular/core';
import { ReportService } from '../../../services/reports/report.service';

interface MOMRow {
  clientName: string;
  clientPresent: string;
  purpose: string;
  description: string;
  date: string;
  vertical: string;
}

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

  constructor(private reportService: ReportService) { }

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
    if (!this.dateFrom && !this.dateTo) return this.rows;
    return this.rows.filter(row => {
      const rowDate = this.toComparable(row.date);
      if (!rowDate) return false;
      if (this.dateFrom && rowDate < this.dateFrom) return false;
      if (this.dateTo && rowDate > this.dateTo) return false;
      return true;
    });
  }

  clearDateFilter() {
    this.dateFrom = '';
    this.dateTo = '';
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
