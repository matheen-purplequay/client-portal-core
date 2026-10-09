import { Component } from '@angular/core';

interface AllocationJob {
  id: number;
  jobName: string;
  jobNo: string;
  associateName: string;
  financialYear: string;
  budgetHours: number;
  deadline: string;
  comments: string;
  status: 'Pending' | 'Stage 1' | 'Allocated';
  selected: boolean;
}

interface AllocationForm {
  jobName: string;
  jobNo: string;
  associateName: string;
  financialYear: string;
  budgetHours: number | null;
  deadline: string;
  comments: string;
}

// Design-only page (no backend yet) - jobs are kept in local component
// state, not persisted. The Associate dropdown is a placeholder list until
// a real source (e.g. the team/accountant master data) is wired in.
@Component({
  selector: 'app-job-allocation',
  templateUrl: './job-allocation.component.html',
  styleUrls: ['./job-allocation.component.scss']
})
export class JobAllocationComponent {

  readonly associateOptions = ['Monty', 'Andrew', 'Dario', 'Adam', 'Matt', 'Krishna Vuppala'];

  jobs: AllocationJob[] = [];
  private nextId = 1;

  form: AllocationForm = JobAllocationComponent.emptyForm();

  private static emptyForm(): AllocationForm {
    return {
      jobName: '',
      jobNo: '',
      associateName: '',
      financialYear: String(new Date().getFullYear()),
      budgetHours: null,
      deadline: '',
      comments: ''
    };
  }

  get canAddJob(): boolean {
    return this.form.jobName.trim().length > 0 && this.form.jobNo.trim().length > 0;
  }

  addJob(): void {
    if (!this.canAddJob) return;
    this.jobs.push({
      id: this.nextId++,
      jobName: this.form.jobName.trim(),
      jobNo: this.form.jobNo.trim(),
      associateName: this.form.associateName,
      financialYear: this.form.financialYear.trim(),
      budgetHours: Number(this.form.budgetHours) || 0,
      deadline: this.form.deadline,
      comments: this.form.comments.trim(),
      status: 'Pending',
      selected: false
    });
    this.form = JobAllocationComponent.emptyForm();
  }

  removeJob(job: AllocationJob): void {
    this.jobs = this.jobs.filter(j => j !== job);
  }

  get selectedJobs(): AllocationJob[] {
    return this.jobs.filter(j => j.selected);
  }

  get isAllSelected(): boolean {
    return this.jobs.length > 0 && this.jobs.every(j => j.selected);
  }

  toggleSelectAll(): void {
    const next = !this.isAllSelected;
    this.jobs.forEach(j => j.selected = next);
  }

  moveToStage1(): void {
    this.selectedJobs.forEach(j => j.status = 'Stage 1');
  }

  allocate(): void {
    this.selectedJobs.forEach(j => j.status = 'Allocated');
  }

}
