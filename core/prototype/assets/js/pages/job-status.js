/* Job Status page: vertical switcher, status strip, 24-column jobs table, job-detail tabs */
document.addEventListener('alpine:init', () => {
  const D = (iso) => CP.fmt.dmy(iso);
  const JOB_COLS = [
    { key: '#', label: '#' },
    { key: 'group_job_name', label: 'GroupJobName' },
    { key: 'job_name', label: 'Jobname', link: true },
    { key: 'nature_of_job', label: 'Naturejob' },
    { key: 'received_from', label: 'ReceivedFrom' },
    { key: 'partner', label: 'Partner' },
    { key: 'director', label: 'Director' },
    { key: 'financial_year', label: 'FinancialYear' },
    { key: 'received_date', label: 'ReceivedDate', date: true },
    { key: 'commenced_date', label: 'CommencedDate', date: true },
    { key: 'work_status', label: 'Workstatus' },
    { key: 'yet_to_start_date', label: 'YetToStartDate', date: true },
    { key: 'due_date', label: 'DueDate', date: true },
    { key: 'manager', label: 'Manager' },
    { key: 'associate', label: 'Associate' },
    { key: 'reviewer', label: 'Reviewer' },
    { key: 'job_year', label: 'JobYear' },
    { key: 'priority', label: 'Priority' },
    { key: 'budget_hours', label: 'BudgetHrs' },
    { key: 'actual_hours', label: 'ActualHrs' },
    { key: 'last_modified', label: 'LastModified', date: true },
    { key: 'job_id', label: 'JobID' },
    { key: 'vertical', label: 'Vertical' },
    { key: 'sub_client', label: 'SubClient' },
  ];
  // Yellow = job is with the client, green = done, white = with Carisma
  const STATUS_TILES = [
    { key: 'WIP - Processing', label: 'WIP Processing', tone: '' },
    { key: 'Sent For Queries', label: 'Sent For Queries', tone: 'bg-amber-100' },
    { key: 'WIP - Query Replies', label: 'WIP Query Replies', tone: '' },
    { key: 'Sent For Review', label: 'Sent For Review', tone: 'bg-amber-100' },
    { key: 'WIP - Review Replies', label: 'WIP Review Replies', tone: '' },
    { key: 'Sent For Final Review', label: 'Sent For Final Review', tone: 'bg-amber-100' },
    { key: 'Job Completed', label: 'Job Completed', tone: 'bg-green-100' },
  ];
  const STANDARD_INSTRUCTIONS = [
    'Thank you team. Please mark as sent to audit.',
    'Please start this fund as a priority.',
    'Please proceed with lodgement once approved.',
    'Kindly hold this job until further notice.',
  ];

  Alpine.data('jobStatusPage', () => ({
    loading: true, jobs: [], vertical: '', mode: 'live', status: 'live',
    tiles: STATUS_TILES, today: CP.TODAY, todayLabel: D(CP.TODAY),
    open: [], active: 'list', instr: {}, newInstr: '', priority: {},
    filters: { partner: '', director: '', financial_year: '' }, filtersOpen: false, refreshing: false,
    standard: STANDARD_INSTRUCTIONS, tbl: null,

    async init() {
      this.jobs = await CP.clientData('jobs');
      this.vertical = $store_client().verticals[0].title;
      this.tbl = CP.makeTable({ rows: () => this.rows, columns: JOB_COLS, size: 10,
        searchKeys: ['job_name', 'group_job_name', 'partner', 'director', 'received_from', 'work_status', 'job_id', 'nature_of_job'] });
      this.loading = false;
    },

    get verticals() { return $store_client().verticals; },
    get vJobs() { return this.jobs.filter((j) => j.vertical === this.vertical); },
    get liveCount() { return this.vJobs.filter((j) => j.work_status !== 'Job Completed').length; },
    count(key) { return this.vJobs.filter((j) => j.work_status === key).length; },
    get rows() {
      return this.vJobs.filter((j) =>
        (this.status === 'all' || (this.status === 'live' ? j.work_status !== 'Job Completed' : j.work_status === this.status)) &&
        Object.entries(this.filters).every(([k, v]) => !v || String(j[k]) === v));
    },
    get statusLabel() { return this.status === 'live' ? 'Live Jobs' : this.status === 'all' ? 'All Jobs' : this.status; },
    get filterOpts() {
      const u = (k) => [...new Set(this.vJobs.map((j) => j[k]))].sort();
      return [{ key: 'partner', label: 'Partner', options: u('partner') }, { key: 'director', label: 'Director', options: u('director') }, { key: 'financial_year', label: 'Financial Year', options: u('financial_year') }];
    },
    setStatus(s) { this.status = s; this.tbl.reset(); },
    clearStatus() { this.status = 'all'; this.tbl.reset(); },
    setVertical(v) { this.vertical = v; this.status = 'live'; this.tbl.reset(); this.open = []; this.active = 'list'; },
    refresh() { this.refreshing = true; setTimeout(() => (this.refreshing = false), 700); },
    cell(row, col) { const v = row[col.key]; return col.date ? D(v) : (v === '-' ? '' : v); },

    /* report mode: work status by partner */
    get report() {
      const partners = [...new Set(this.vJobs.map((j) => j.partner))].sort();
      return { partners, rows: STATUS_TILES.map((t) => ({ label: t.label, cells: partners.map((p) => this.vJobs.filter((j) => j.partner === p && j.work_status === t.key).length) })) };
    },

    /* job tabs */
    get job() { return this.jobs.find((j) => j.job_id === this.active); },
    openJob(j, ev) {
      if (!this.open.includes(j.job_id)) this.open.push(j.job_id);
      if (!(ev && ev.shiftKey)) { this.active = j.job_id; this.newInstr = ''; } else CP.toast('Opened in background tab');
    },
    closeJob(id) { this.open = this.open.filter((x) => x !== id); if (this.active === id) this.active = 'list'; },
    jobOf(id) { return this.jobs.find((j) => j.job_id === id); },
    gap(i) { const t = this.job.timeline; return i === 0 ? 0 : CP.daysBetween(t[i - 1].on, t[i].on); },
    sendInstr() {
      if (!this.newInstr.trim()) return;
      (this.instr[this.active] ||= []).push({ text: this.newInstr.trim(), at: CP.TODAY + 'T10:15:00' });
      this.newInstr = '';
    },
    requestPriority() { this.priority[this.active] = true; CP.toast('Priority request sent'); },
    pct(j) { return Math.min(100, Math.round((j.actual_hours / j.budget_hours) * 100)); },
    D,
  }));

  const $store_client = () => Alpine.store('app').client;
});
