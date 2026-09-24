import { Component, OnInit } from '@angular/core';
import { ReportService } from '../../../services/reports/report.service';

interface WorkflowRow {
  jobDescription: string;
  teamName: string;
  nameA: string;
  workstatus: string;
  timeWillTake: string;
  expectedFinishDate: string;
}

@Component({
  selector: 'app-workflow',
  templateUrl: './workflow.component.html',
  styleUrls: ['./workflow.component.scss']
})
export class WorkflowComponent implements OnInit {

  rows: WorkflowRow[] = [];
  isLoading = false;

  // Filters
  searchTerm = '';
  selectedTeam = '';
  selectedAssociate = '';
  selectedStatus = '';

  constructor(private reportService: ReportService) { }

  ngOnInit(): void {
    this.fetchWorkflowStandUp();
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
          .map((row: any) => ({
            jobDescription: row.job_description || '',
            teamName: row.team_name || '',
            nameA: row.name_a || '',
            workstatus: row.workstatus || '',
            timeWillTake: row.time_will_take || '',
            expectedFinishDate: this.toDDMMYYYY(row.expected_finish_date)
          } as WorkflowRow));
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

  // Dropdown options are derived from whatever the grid actually has, rather
  // than a separate master list endpoint — sorted, blank values dropped
  // (a contract with no stand-up logged today has blank team/associate/status).
  private uniqueSorted(values: (string)[]): string[] {
    return Array.from(new Set(values.filter(v => !!v))).sort((a, b) => a.localeCompare(b));
  }

  get teamOptions(): string[] {
    return this.uniqueSorted(this.rows.map(r => r.teamName));
  }

  get associateOptions(): string[] {
    return this.uniqueSorted(this.rows.map(r => r.nameA));
  }

  get statusOptions(): string[] {
    return this.uniqueSorted(this.rows.map(r => r.workstatus));
  }

  get filteredRows(): WorkflowRow[] {
    const term = this.searchTerm.trim().toLowerCase();
    return this.rows.filter(row => {
      if (term && !row.jobDescription.toLowerCase().includes(term)) return false;
      if (this.selectedTeam && row.teamName !== this.selectedTeam) return false;
      if (this.selectedAssociate && row.nameA !== this.selectedAssociate) return false;
      if (this.selectedStatus && row.workstatus !== this.selectedStatus) return false;
      return true;
    });
  }

  get hasActiveFilters(): boolean {
    return !!(this.searchTerm || this.selectedTeam || this.selectedAssociate || this.selectedStatus);
  }

  clearFilters() {
    this.searchTerm = '';
    this.selectedTeam = '';
    this.selectedAssociate = '';
    this.selectedStatus = '';
  }

}
