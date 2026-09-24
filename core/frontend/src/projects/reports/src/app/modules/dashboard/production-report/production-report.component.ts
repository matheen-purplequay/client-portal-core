import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReportService } from '../../../services/reports/report.service';
import { ClientService } from '../../../services/entities/client.service';
import { LocalStorageService } from '../../../services/app/storage/local-storage.service';

interface ProductivityRow {
  name: string;
  total_jobs: number;
  total_hours: number;
  productive_hours: number;
  prev_total_jobs: number;
  prev_total_hours: number;
  prev_productive_hours: number;
  job_trend: number;
  time_trend: number;
}

interface MonthOption {
  value: string; // 'MM-YYYY', matches sp_FetchProductivityComparisonReport's contract
  label: string; // 'MMM YYYY'
}

interface VerticalOption {
  id: number;
  title: string;
}

interface TimeUtilisationRow {
  metric: string;
  values: string[]; // formatted 'HH:MM', one per associateNames entry
  total: string;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_OPTIONS_COUNT = 12;

@Component({
  selector: 'app-production-report',
  templateUrl: './production-report.component.html',
  styleUrls: ['./production-report.component.scss']
})
export class ProductionReportComponent implements OnInit {

  monthYear: string;
  currentMonthLabel = '';
  previousMonthLabel = '';
  monthOptions: MonthOption[] = [];

  verticals: VerticalOption[] = [];
  selectedServiceId = 0; // 0 = all verticals, per the proc's own contract

  rows: ProductivityRow[] = [];
  isLoading = false;
  isLoadingVerticals = false;

  associateNames: string[] = [];
  timeUtilisationRows: TimeUtilisationRow[] = [];
  isLoadingTimeUtilisation = false;

  constructor(
    private reportService: ReportService,
    private route: ActivatedRoute,
    private clientService: ClientService,
    private localStorageService: LocalStorageService
  ) {
    // The current (in-progress) month's figures aren't final yet, so both the
    // default selection and the dropdown's range stop at the previous month.
    const now = new Date();
    const lastCompleteMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    this.monthYear = `${String(lastCompleteMonth.getMonth() + 1).padStart(2, '0')}-${lastCompleteMonth.getFullYear()}`;
    this.monthOptions = this.buildMonthOptions(lastCompleteMonth);

    // Arriving from the dashboard home's vertical tabs (?service_id=...)
    // should land here already scoped to that vertical, not "All Verticals".
    const serviceIdParam = Number(this.route.snapshot.queryParamMap.get('service_id'));
    if (!isNaN(serviceIdParam)) {
      this.selectedServiceId = serviceIdParam;
    }
  }

  ngOnInit(): void {
    this.setMonthLabels();
    this.fetchVerticals();
    this.fetchProductivityReport();
    this.fetchTimeUtilisation();
  }

  buildMonthOptions(from: Date): MonthOption[] {
    const options: MonthOption[] = [];
    for (let i = 0; i < MONTH_OPTIONS_COUNT; i++) {
      const d = new Date(from.getFullYear(), from.getMonth() - i, 1);
      const month = d.getMonth() + 1;
      const year = d.getFullYear();
      options.push({
        value: `${String(month).padStart(2, '0')}-${year}`,
        label: `${MONTH_NAMES[d.getMonth()]} ${year}`
      });
    }
    return options;
  }

  setMonthLabels() {
    const [month, year] = this.monthYear.split('-').map(Number);
    this.currentMonthLabel = `${MONTH_NAMES[month - 1]} ${year}`;

    const prevDate = new Date(year, month - 2, 1); // month is 1-based; -2 lands on previous month
    this.previousMonthLabel = `${MONTH_NAMES[prevDate.getMonth()]} ${prevDate.getFullYear()}`;
  }

  // Client-scoped vertical list (same source as the dashboard home page) —
  // NOT the global coemaster list (get-productivity-verticals), which
  // returns every business vertical in the system regardless of whether
  // this client is actually engaged for it.
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

  onMonthChange() {
    this.setMonthLabels();
    this.fetchProductivityReport();
    this.fetchTimeUtilisation();
  }

  onVerticalChange() {
    this.fetchProductivityReport();
    this.fetchTimeUtilisation();
  }

  fetchProductivityReport() {
    this.isLoading = true;
    this.reportService.getProductivityReport(this.monthYear, this.selectedServiceId).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res.status && Array.isArray(res.data)) {
          this.rows = res.data.map((row: any) => {
            const total_jobs = Number(row.ReceivedJobs) || 0;
            const prev_total_jobs = Number(row.Prev_ReceivedJobs) || 0;
            const total_hours = Number(row.total_hours) || 0;
            const prev_total_hours = Number(row.prev_total_hours) || 0;
            return {
              name: row.name,
              total_jobs,
              total_hours,
              productive_hours: Number(row.total_hours_without_overheads) || 0,
              prev_total_jobs,
              prev_total_hours,
              prev_productive_hours: Number(row.prev_total_hours_without_overheads) || 0,
              job_trend: total_jobs - prev_total_jobs,
              time_trend: Math.round((total_hours - prev_total_hours) * 100) / 100
            } as ProductivityRow;
          });
        } else {
          this.rows = [];
        }
      },
      error: () => {
        this.isLoading = false;
        this.rows = [];
      }
    });
  }

  fetchTimeUtilisation() {
    this.isLoadingTimeUtilisation = true;
    // The proc treats an empty vertical as "all teams"; unlike the productivity
    // proc it doesn't use 0 for that, so map our shared "0 = all" selection here.
    const vertical = this.selectedServiceId === 0 ? '' : String(this.selectedServiceId);

    this.reportService.getAssociateTimeUtilisation(this.monthYear, vertical).subscribe({
      next: (res: any) => {
        this.isLoadingTimeUtilisation = false;
        const data = (res.status && Array.isArray(res.data)) ? res.data : [];

        if (data.length === 0) {
          this.associateNames = [];
          this.timeUtilisationRows = [];
          return;
        }

        this.associateNames = Object.keys(data[0]).filter(key => key !== 'Location' && key !== 'Metric' && key !== 'Total');

        this.timeUtilisationRows = data.map((row: any) => ({
          metric: row.Metric,
          values: this.associateNames.map(name => this.formatTime(row[name])),
          total: this.formatTime(row.Total)
        }));
      },
      error: () => {
        this.isLoadingTimeUtilisation = false;
        this.associateNames = [];
        this.timeUtilisationRows = [];
      }
    });
  }

  // 'HH:MM:SS' (as returned by the proc, hours not zero-padded on the Total
  // column) -> 'HH:MM', zero-padded, matching the rest of the table.
  formatTime(value: string): string {
    if (!value) return '00:00';
    const [h, m] = value.split(':');
    return `${h.padStart(2, '0')}:${m}`;
  }

  get totals() {
    return this.rows.reduce((acc, row) => {
      acc.total_jobs += row.total_jobs;
      acc.total_hours += row.total_hours;
      acc.productive_hours += row.productive_hours;
      acc.prev_total_jobs += row.prev_total_jobs;
      acc.prev_total_hours += row.prev_total_hours;
      acc.prev_productive_hours += row.prev_productive_hours;
      acc.job_trend += row.job_trend;
      acc.time_trend += row.time_trend;
      return acc;
    }, { total_jobs: 0, total_hours: 0, productive_hours: 0, prev_total_jobs: 0, prev_total_hours: 0, prev_productive_hours: 0, job_trend: 0, time_trend: 0 });
  }

}
