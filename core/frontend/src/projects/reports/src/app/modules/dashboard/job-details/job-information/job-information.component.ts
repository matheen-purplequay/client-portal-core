import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ReportService } from '../../../../services/reports/report.service';
import { CommentsService } from '../../../../services/entities/comments.service';
import { LocalStorageService } from '../../../../services/app/storage/local-storage.service';

interface JobStatusHistoryRow {
  Aid: number;
  NewWorkStatus: string;
  LastModdate: string;
  duration: number;
  TimeTaken?: string;
}

interface JobAppreciationRow {
  id: number;
  received_date: string;
  message: string;
  appreciation_for: string;
}

/**
 * Same job-information content as the real Jobs page (dp-dash-movement React
 * widget's job-information.tsx / job-details.tsx): a header info bar, the Job
 * Timeline, and Budget/Instructions/Queries/Appreciation cards. Reuses the
 * same backend endpoints that widget calls (get-job-status-history,
 * get-job-budget-summary, get-job-appreciation) so the two stay consistent.
 */
@Component({
  selector: 'app-job-information',
  templateUrl: './job-information.component.html',
  styleUrls: ['./job-information.component.scss']
})
export class JobInformationComponent implements OnInit, OnChanges {

  // Loosely typed on purpose — each page that opens this popup (Turnaround,
  // Open Jobs, ...) has its own row shape from its own stored procedure, so
  // this reads whichever of these fields that row happens to carry.
  @Input() job: {
    Aid: number, JobName: string, Status: string, GroupJobName?: string, NatureOfJob?: string,
    ReceivedFrom?: string, ReceivedDate?: string, Accountant?: string, LastModified?: string
  } = { Aid: 0, JobName: '', Status: '' };

  // Turnaround-specific (days with Carisma / with client / total) — only
  // Turnaround report rows carry this, so the "Turnaround" card only shows
  // when a page passes it in.
  @Input() turnaround: { withCarisma: number, withClient: number, total: number } | null = null;

  isLoadingTimeline = false;
  timeline: JobStatusHistoryRow[] = [];

  isLoadingBudget = false;
  budget: { budgetSeconds: number, timeTakenSeconds: number } | null = null;

  isLoadingAppreciation = false;
  appreciation: JobAppreciationRow[] = [];

  isLoadingInstructions = false;
  instructions: any[] = [];
  newInstruction = '';
  isSendingInstruction = false;

  constructor(
    private reportService: ReportService,
    private commentsService: CommentsService,
    private localStorageService: LocalStorageService
  ) { }

  ngOnInit(): void {
    this.fetchAll();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const jobChange = changes['job'];
    if (jobChange && !jobChange.firstChange && jobChange.previousValue?.Aid !== jobChange.currentValue?.Aid) {
      this.fetchAll();
    }
  }

  private fetchAll() {
    if (!this.job?.Aid) return;
    this.fetchTimeline();
    this.fetchBudget();
    this.fetchAppreciation();
    this.fetchInstructions();
  }

  fetchTimeline() {
    this.isLoadingTimeline = true;
    this.reportService.getJobStatusHistory(this.job.Aid).subscribe({
      next: (res: any) => {
        this.isLoadingTimeline = false;
        this.timeline = (res?.status && Array.isArray(res.data)) ? res.data : [];
      },
      error: () => {
        this.isLoadingTimeline = false;
        this.timeline = [];
      }
    });
  }

  fetchBudget() {
    this.isLoadingBudget = true;
    this.reportService.getJobBudgetSummary(this.job.Aid).subscribe({
      next: (res: any) => {
        this.isLoadingBudget = false;
        this.budget = res?.status ? {
          budgetSeconds: Number(res.data?.budget_seconds) || 0,
          timeTakenSeconds: Number(res.data?.time_taken_seconds) || 0
        } : null;
      },
      error: () => {
        this.isLoadingBudget = false;
        this.budget = null;
      }
    });
  }

  fetchAppreciation() {
    this.isLoadingAppreciation = true;
    this.reportService.getJobAppreciation(this.job.Aid).subscribe({
      next: (res: any) => {
        this.isLoadingAppreciation = false;
        this.appreciation = (res?.status && Array.isArray(res.data)) ? res.data : [];
      },
      error: () => {
        this.isLoadingAppreciation = false;
        this.appreciation = [];
      }
    });
  }

  fetchInstructions() {
    this.isLoadingInstructions = true;
    this.commentsService.getComments({ job_id: this.job.Aid }).subscribe({
      next: (res: any) => {
        this.isLoadingInstructions = false;
        this.instructions = (res?.status && Array.isArray(res.data)) ? res.data.slice().reverse() : [];
      },
      error: () => {
        this.isLoadingInstructions = false;
        this.instructions = [];
      }
    });
  }

  sendInstruction() {
    const message = this.newInstruction.trim();
    if (!message) return;
    this.isSendingInstruction = true;
    const userdata = this.localStorageService.getItem('userdata');
    const body = {
      job_id: this.job.Aid,
      user_id: userdata?.user_id,
      client_id: userdata?.project_id,
      comment_type: 1,
      comments: message,
      comment_code: 999
    };
    this.commentsService.sendComment(body).subscribe({
      next: () => {
        this.isSendingInstruction = false;
        this.newInstruction = '';
        this.fetchInstructions();
      },
      error: () => {
        this.isSendingInstruction = false;
      }
    });
  }

  get isOverBudget(): boolean {
    return !!this.budget && this.budget.timeTakenSeconds > this.budget.budgetSeconds;
  }

  get utilisationPct(): number {
    if (!this.budget || this.budget.budgetSeconds <= 0) return 0;
    return Math.round((this.budget.timeTakenSeconds / this.budget.budgetSeconds) * 100);
  }

  // The timeline's TimeTaken comes back as a raw MySQL TIME string
  // ("HH:MM:SS" or "HH:MM:SS.ffffff") — trim it down to "HH:MM".
  formatTimeTaken(value: string): string {
    if (!value) return '00:00';
    const [hh = '00', mm = '00'] = value.split(':');
    return `${hh.padStart(2, '0')}:${mm.padStart(2, '0')}`;
  }

  formatHM(seconds: number): string {
    const total = Math.max(0, Math.round(seconds / 60));
    const hh = Math.floor(total / 60);
    const mm = total % 60;
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
  }

  get varianceLabel(): string {
    if (!this.budget) return '00:00';
    return this.formatHM(Math.abs(this.budget.budgetSeconds - this.budget.timeTakenSeconds));
  }
}
