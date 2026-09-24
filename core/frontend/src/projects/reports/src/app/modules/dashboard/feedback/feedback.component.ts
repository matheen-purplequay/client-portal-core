import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { ReportService } from '../../../services/reports/report.service';
import { ClientService } from '../../../services/entities/client.service';
import { LocalStorageService } from '../../../services/app/storage/local-storage.service';

type MultiSelectFilterKey = 'receivedFrom' | 'natureOfJob';

interface VerticalOption {
  id: number;
  title: string;
}

interface ClosedJobRow {
  jobId: number;
  surveySubmitted: boolean;
  receivedFrom: string;
  jobName: string;
  natureOfJob: string;
  budgetTime: string;
  timeTaken: string;
  turnaroundDays: number;
}

type SatisfactionRating = 'Extremely satisfied' | 'Very satisfied' | 'Somewhat satisfied' | 'Dissatisfied' | 'Very dissatisfied';

interface FeedbackSurvey {
  overallSatisfaction: SatisfactionRating | '';
  overallInsights: string;
  responsiveness: SatisfactionRating | '';
  responsivenessInsights: string;
  improvements: string;
}

interface ClosedJobFilters {
  // Empty array = "All" (no filter) for the multi-select columns.
  receivedFrom: string[];
  jobName: string;
  natureOfJob: string[];
}

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss']
})
export class FeedbackComponent implements OnInit {

  rows: ClosedJobRow[] = [];
  isLoading = false;

  // Same client-scoped vertical source (and same tab UI) as the dashboard
  // home page / Turnaround Report / Budget Overview.
  verticals: VerticalOption[] = [];
  isLoadingVerticals = false;
  selectedServiceId = 0; // 0 = all verticals

  filters: ClosedJobFilters = { receivedFrom: [], jobName: '', natureOfJob: [] };
  receivedFromOptions: string[] = [];
  natureOfJobOptions: string[] = [];
  openFilterDropdown: MultiSelectFilterKey | null = null;
  filterSearch: Record<MultiSelectFilterKey, string> = { receivedFrom: '', natureOfJob: '' };

  isPopupOpen = false;
  selectedJob: ClosedJobRow | null = null;

  readonly ratingOptions: SatisfactionRating[] = [
    'Extremely satisfied', 'Very satisfied', 'Somewhat satisfied', 'Dissatisfied', 'Very dissatisfied'
  ];
  survey: FeedbackSurvey = FeedbackComponent.emptySurvey();
  isSubmitting = false;
  submitError = '';

  constructor(
    private reportService: ReportService,
    private clientService: ClientService,
    private localStorageService: LocalStorageService,
    private elementRef: ElementRef
  ) { }

  ngOnInit(): void {
    this.fetchVerticals();
    this.fetchClosedJobs();
  }

  // Mirrors DashboardPageComponent.fetchVerticals() / the same pattern on
  // Turnaround Report and Budget Overview.
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
    this.fetchClosedJobs();
  }

  // Close whichever multi-select panel is open when clicking outside it.
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
    return key === 'receivedFrom' ? this.receivedFromOptions : this.natureOfJobOptions;
  }

  filteredOptionsFor(key: MultiSelectFilterKey): string[] {
    const term = this.filterSearch[key].trim().toLowerCase();
    const options = this.optionsFor(key);
    return term ? options.filter(o => o.toLowerCase().includes(term)) : options;
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

  get filteredRows(): ClosedJobRow[] {
    const f = this.filters;
    return this.rows.filter(row =>
      (f.receivedFrom.length === 0 || f.receivedFrom.includes(row.receivedFrom)) &&
      row.jobName.toLowerCase().includes(f.jobName.trim().toLowerCase()) &&
      (f.natureOfJob.length === 0 || f.natureOfJob.includes(row.natureOfJob))
    );
  }

  fetchClosedJobs() {
    this.isLoading = true;
    this.filters = { receivedFrom: [], jobName: '', natureOfJob: [] };
    this.reportService.getClosedJobsFeedback(this.selectedServiceId).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        const data = (res.status && Array.isArray(res.data)) ? res.data : [];
        this.rows = data.map((row: any) => ({
          jobId: row.job_id,
          surveySubmitted: !!row.survey_submitted,
          receivedFrom: row.received_from || '',
          jobName: row.job_name || '',
          natureOfJob: row.nature_of_job || '',
          budgetTime: row.budget_time || '00:00',
          timeTaken: row.time_taken || '00:00',
          turnaroundDays: Number(row.turnaround_days) || 0
        } as ClosedJobRow));

        const distinct = (values: string[]) => values.filter((v, i, self) => v && self.indexOf(v) === i);
        this.receivedFromOptions = distinct(this.rows.map(r => r.receivedFrom));
        this.natureOfJobOptions = distinct(this.rows.map(r => r.natureOfJob));
      },
      error: () => {
        this.isLoading = false;
        this.rows = [];
      }
    });
  }

  private static emptySurvey(): FeedbackSurvey {
    return { overallSatisfaction: '', overallInsights: '', responsiveness: '', responsivenessInsights: '', improvements: '' };
  }

  openFeedbackPopup(row: ClosedJobRow) {
    this.selectedJob = row;
    this.survey = FeedbackComponent.emptySurvey();
    this.submitError = '';
    this.isPopupOpen = true;

    // Show the answers already given for this job, if any.
    if (row.surveySubmitted) {
      this.reportService.getJobSurvey(row.jobId).subscribe({
        next: (res: any) => {
          if (this.selectedJob !== row || !res?.data) return;
          this.survey = {
            overallSatisfaction: res.data.overall_satisfaction || '',
            overallInsights: res.data.overall_insights || '',
            responsiveness: res.data.responsiveness || '',
            responsivenessInsights: res.data.responsiveness_insights || '',
            improvements: res.data.improvements || ''
          };
        }
      });
    }
  }

  submitFeedback() {
    if (!this.selectedJob || this.isSubmitting) return;
    if (!this.survey.overallSatisfaction || !this.survey.responsiveness) {
      this.submitError = 'Please answer questions 1 and 3 before submitting.';
      return;
    }

    const job = this.selectedJob;
    this.isSubmitting = true;
    this.submitError = '';
    this.reportService.saveJobSurvey({
      job_id: job.jobId,
      overall_satisfaction: this.survey.overallSatisfaction,
      overall_insights: this.survey.overallInsights,
      responsiveness: this.survey.responsiveness,
      responsiveness_insights: this.survey.responsivenessInsights,
      improvements: this.survey.improvements
    }).subscribe({
      next: (res: any) => {
        this.isSubmitting = false;
        if (res?.status) {
          job.surveySubmitted = true;
          this.closeFeedbackPopup();
        } else {
          this.submitError = res?.message || 'Could not submit the feedback. Please try again.';
        }
      },
      error: () => {
        this.isSubmitting = false;
        this.submitError = 'Could not submit the feedback. Please try again.';
      }
    });
  }

  closeFeedbackPopup() {
    this.isPopupOpen = false;
    this.selectedJob = null;
    this.survey = FeedbackComponent.emptySurvey();
  }

}
