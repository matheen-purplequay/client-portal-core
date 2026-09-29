/* Job popup: click a job name anywhere (Home, Workflow, Budget, Turnaround, Movement, Feedback, Allocation, Queries)
   and the same job details as on the Jobs page open in a window. CP.showJob(ref) — ref is a job id, or a job name when no id is known. */
document.addEventListener('alpine:init', () => {
  const D = (iso) => CP.fmt.dmy(iso);
  Alpine.store('jobpop', { ref: null });
  CP.showJob = (ref) => { if (ref !== undefined && ref !== null && ref !== '') Alpine.store('jobpop').ref = ref; };

  Alpine.data('jobPopup', () => ({
    jobs: [], appr: [], surveys: [], queries: [], loaded: false, instr: {}, newInstr: '', feedbackOpen: false, D,
    async ensure() {
      if (this.loaded) return;
      [this.jobs, this.appr, this.surveys, this.queries] = await Promise.all([CP.clientData('jobs'), CP.clientData('appreciation'), CP.clientData('surveys'), CP.clientData('queries')]);
      this.loaded = true;
    },
    get ref() { return Alpine.store('jobpop').ref; },
    /* resolves the reference the caller had: an id (number or numeric text), else the first job with that name */
    get job() { const r = this.ref; if (r === null) return null; return this.jobs.find((j) => String(j.job_id) === String(r)) || this.jobs.find((j) => j.job_name === r) || null; },
    get active() { return this.job ? this.job.job_id : null; },
    close() { Alpine.store('jobpop').ref = null; this.feedbackOpen = false; },
    closeJob() { this.close(); },
    statusOf(j) { return j.smsf_status || j.work_status; },
    gap(i) { const t = this.job.timeline; return i <= 0 || !t[i] ? 0 : CP.daysBetween(t[i - 1].on, t[i].on); },
    hm(h) { const neg = h < 0, a = Math.abs(h), m = Math.round((a % 1) * 60); return (neg ? '-' : '') + String(Math.floor(a) + (m === 60 ? 1 : 0)).padStart(2, '0') + ':' + String(m === 60 ? 0 : m).padStart(2, '0'); },
    get stepTimes() { const j = this.job, n = j.timeline.length, last = n > 1 ? n - 1 : -1; const w = j.timeline.map((_, i) => (i === last ? 0 : ((j.job_id + i * 7) % 5) + 1)), t = w.reduce((a, b) => a + b, 0) || 1; return w.map((x) => (j.actual_hours * x) / t); },
    get turnaround() { const j = this.job, total = Math.max(0, CP.daysBetween(j.received_date, j.work_status === 'Job Completed' ? j.last_modified : CP.TODAY)), client = Math.round(total * [0.15, 0.3, 0.45, 0.2][j.job_id % 4]); return { total, client, carisma: total - client }; },
    get jobQueryCount() { return this.queries.filter((q) => q.job_id === this.active).length; },
    get jobAppreciation() { return this.appr.filter((a) => a.job_id === this.active); },
    get jobSurvey() { return this.surveys.find((s) => s.job_id === this.active); },
    pct(j) { return Math.min(100, Math.round((j.actual_hours / j.budget_hours) * 100)); },
    sendInstr() { if (!this.newInstr.trim()) return; (this.instr[this.active] ||= []).push({ text: this.newInstr.trim(), at: CP.TODAY + 'T10:15:00' }); this.newInstr = ''; },
    openQueries() { const id = this.active; this.close(); location.hash = '#/dashboard/queries?job=' + id; },
  }));
});
