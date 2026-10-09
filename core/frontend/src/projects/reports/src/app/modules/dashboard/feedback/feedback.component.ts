import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { ReportService } from '../../../services/reports/report.service';
import { ClientService } from '../../../services/entities/client.service';
import { LocalStorageService } from '../../../services/app/storage/local-storage.service';

type MultiSelectFilterKey = 'receivedFrom' | 'natureOfJob';
type FeedbackSelection = 'all' | 'given' | 'pending';

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
  // Inline grid rating (1-5 stars, 0 = not yet rated) + comment, replacing
  // the old popup's 5-question survey - mapped onto the same
  // save-job-survey/get-job-survey API (overall_satisfaction doubles as
  // responsiveness since there's only one rating control now, and the
  // comment is stored in overall_insights) so no backend change was needed.
  rating: number;
  comment: string;
  isSaving: boolean;
}

type SatisfactionRating = 'Extremely satisfied' | 'Very satisfied' | 'Somewhat satisfied' | 'Dissatisfied' | 'Very dissatisfied';

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

  // Index 0 = 1 star ... index 4 = 5 stars, matching the legend row.
  private static readonly STAR_LABELS: SatisfactionRating[] = [
    'Very dissatisfied', 'Dissatisfied', 'Somewhat satisfied', 'Very satisfied', 'Extremely satisfied'
  ];

  readonly legendItems = FeedbackComponent.STAR_LABELS.map((label, i) => ({ stars: i + 1, label }));

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

  // Total Jobs / Feedback Given / Feedback Not Given chip row, same counts
  // the dashboard home summary card already uses.
  isLoadingCounts = false;
  feedbackCounts = { closedJobs: 0, pendingFeedback: 0 };
  selection: FeedbackSelection = 'all';

  constructor(
    private reportService: ReportService,
    private clientService: ClientService,
    private localStorageService: LocalStorageService,
    private elementRef: ElementRef
  ) { }

  ngOnInit(): void {
    this.fetchVerticals();
    this.fetchClosedJobs();
    this.fetchFeedbackCounts();
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
    this.fetchFeedbackCounts();
  }

  selectCard(sel: FeedbackSelection) {
    this.selection = sel;
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

  get feedbackGivenCount(): number {
    return Math.max(0, this.feedbackCounts.closedJobs - this.feedbackCounts.pendingFeedback);
  }

  get feedbackNotGivenCount(): number {
    return this.feedbackCounts.pendingFeedback;
  }

  get filteredRows(): ClosedJobRow[] {
    const f = this.filters;
    return this.rows.filter(row =>
      (f.receivedFrom.length === 0 || f.receivedFrom.includes(row.receivedFrom)) &&
      row.jobName.toLowerCase().includes(f.jobName.trim().toLowerCase()) &&
      (f.natureOfJob.length === 0 || f.natureOfJob.includes(row.natureOfJob)) &&
      (this.selection === 'all' || (this.selection === 'given' ? row.surveySubmitted : !row.surveySubmitted))
    );
  }

  fetchFeedbackCounts() {
    this.isLoadingCounts = true;
    this.reportService.getClosedJobsFeedbackCount(this.selectedServiceId).subscribe({
      next: (res: any) => {
        this.isLoadingCounts = false;
        this.feedbackCounts = res.status
          ? { closedJobs: Number(res.data.closed_jobs) || 0, pendingFeedback: Number(res.data.pending_feedback) || 0 }
          : { closedJobs: 0, pendingFeedback: 0 };
      },
      error: () => {
        this.isLoadingCounts = false;
        this.feedbackCounts = { closedJobs: 0, pendingFeedback: 0 };
      }
    });
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
          turnaroundDays: Number(row.turnaround_days) || 0,
          rating: 0,
          comment: '',
          isSaving: false
        } as ClosedJobRow));

        const distinct = (values: string[]) => values.filter((v, i, self) => v && self.indexOf(v) === i);
        this.receivedFromOptions = distinct(this.rows.map(r => r.receivedFrom));
        this.natureOfJobOptions = distinct(this.rows.map(r => r.natureOfJob));

        // Only the jobs that already have feedback need their rating/comment
        // preloaded - bounded by the (small) Feedback Given count, not every
        // row on the page.
        this.rows.filter(r => r.surveySubmitted).forEach(r => this.loadRowSurvey(r));
      },
      error: () => {
        this.isLoading = false;
        this.rows = [];
      }
    });
  }

  private loadRowSurvey(row: ClosedJobRow) {
    this.reportService.getJobSurvey(row.jobId).subscribe({
      next: (res: any) => {
        if (!res?.data) return;
        const idx = FeedbackComponent.STAR_LABELS.indexOf(res.data.overall_satisfaction);
        row.rating = idx >= 0 ? idx + 1 : 0;
        row.comment = res.data.overall_insights || '';
      }
    });
  }

  rate(row: ClosedJobRow, stars: number) {
    row.rating = stars;
    this.saveRowFeedback(row);
  }

  onCommentBlur(row: ClosedJobRow) {
    // The backend requires a rating to accept the save (it's one survey
    // record per job/user) - a comment typed before rating is kept locally
    // and sent as soon as a star is picked.
    if (row.rating > 0) this.saveRowFeedback(row);
  }

  private saveRowFeedback(row: ClosedJobRow) {
    if (!row.rating || row.isSaving) return;
    const label = FeedbackComponent.STAR_LABELS[row.rating - 1];
    row.isSaving = true;
    this.reportService.saveJobSurvey({
      job_id: row.jobId,
      overall_satisfaction: label,
      overall_insights: row.comment || '',
      responsiveness: label,
      responsiveness_insights: '',
      improvements: ''
    }).subscribe({
      next: (res: any) => {
        row.isSaving = false;
        if (res?.status) {
          const wasSubmitted = row.surveySubmitted;
          row.surveySubmitted = true;
          if (!wasSubmitted) this.fetchFeedbackCounts();
        }
      },
      error: () => {
        row.isSaving = false;
      }
    });
  }

}
