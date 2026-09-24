/* Screens added from the dev branch: Workflow, Budget Overview, Turnaround Report, Movement (report), MOM, Feedback,
   Production Report and Overview. Most of them are one config-driven grid (`gridPage`) — vertical tabs, stat cards,
   a maroon-header table with a per-column filter row — because that is what the real screens share.
   Rows are derived from jobs.json wherever the real screen derives them from the same data, so numbers stay consistent. */
document.addEventListener('alpine:init', () => {
  const p2 = (n) => String(n).padStart(2, '0');
  const store = () => Alpine.store('app');
  const statusOf = (j) => j.smsf_status || j.work_status;                       // SMSF shows tbl_smsfjobstatus names
  const isClosed = (j) => j.work_status === 'Job Completed';
  const hhmm = (h) => { const neg = h < 0, a = Math.abs(h), m = Math.round((a % 1) * 60), hh = Math.floor(a) + (m === 60 ? 1 : 0); return `${neg ? '-' : ''}${p2(hh)}:${p2(m === 60 ? 0 : m)}`; };
  const addDays = (iso, n) => { const d = new Date(iso + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
  const turnaround = (j) => Math.max(0, CP.daysBetween(j.received_date, isClosed(j) ? j.last_modified : CP.TODAY));
  const clientDays = (j, days) => Math.round(days * [0.15, 0.3, 0.45, 0.2][j.job_id % 4]);   // days the job sat with the client
  const vjobs = (jobs, v) => (v ? jobs.filter((j) => j.vertical === v) : jobs);
  const uniq = (rows, k) => [...new Set(rows.map((r) => r[k]).filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b)));

  /* movement category for one status change (SP_clientportalMovementReport buckets) */
  const moveCat = (to, first) => {
    if (first) return 'New Jobs Received';
    if (/Sent For Queries|Awaiting Queries/.test(to)) return 'Sent for Queries';
    if (/Sent For (Final )?Review|Workpapers Completed/.test(to)) return 'Sent for Review';
    if (/Job Completed|Moved to Audit/.test(to)) return 'Closed';
    return 'Other Status Changed';
  };
  const movements = (jobs) => jobs.flatMap((j) => j.timeline.map((t, i) => ({
    job_id: j.job_id, received_from: j.received_from, job_name: j.job_name, nature_of_job: j.nature_of_job, vertical: j.vertical,
    movement: moveCat(t.status, i === 0), from_status: i ? j.timeline[i - 1].status : '-', to_status: t.status, date: t.on,
  })));

  /* ------------------------------------------------------------------ per-screen configs ------------------------------------------------------------------ */
  const CARD_TONES = { blue: 'border-blue-500 text-blue-700', green: 'border-green-500 text-green-700', maroon: 'border-brand text-brand', teal: 'border-teal-500 text-teal-700',
    orange: 'border-orange-400 text-orange-600', purple: 'border-purple-500 text-purple-700', red: 'border-red-500 text-red-600', amber: 'border-amber-400 text-amber-700' };

  const CONFIGS = {
    workflow: {
      title: "Workflow", tableTitle: "Today's Stand-Up", tabs: false, refresh: true,
      empty: 'No stand-up logged for today.',
      columns: [
        { key: 'job_description', label: 'Job Description', filter: 'text', bold: true },
        { key: 'team_name', label: 'Team Name', filter: 'select', all: 'All Teams' },
        { key: 'name_a', label: 'Associate', filter: 'select', all: 'All Associates' },
        { key: 'workstatus', label: 'Work Status', filter: 'select', all: 'All Statuses' },
        { key: 'time_will_take', label: 'Est.Time' },
        { key: 'expected_finish_date', label: 'Est. Delivery', date: true },
      ],
      async load() { this.raw = await CP.clientData('workflow'); },
      rows() { return this.raw.filter((r) => r.job_description || r.time_will_take); },   // stand-up placeholder rows dropped, as on the real page
    },

    'budget-overview': {
      title: 'Budget Overview - Open Jobs', tabs: true, export: true,
      desc: 'Budget time against time booked to date for every open job. Jobs past their budget are highlighted. Select a card to filter the list.',
      tableTitle() { return `Open Jobs · ${this.vertical || 'All Verticals'}`; },
      columns: [
        { key: 'received_from', label: 'Received From', filter: 'select', all: 'All' },
        { key: 'job_name', label: 'Job Name', filter: 'text', bold: true },
        { key: 'nature_of_job', label: 'Nature of Job', filter: 'select', all: 'All' },
        { key: 'accountant', label: 'Accountant', filter: 'select', all: 'All' },
        { key: 'job_status', label: 'Job Status', filter: 'select', all: 'All' },
        { key: 'budget', label: 'Budget Time' }, { key: 'taken', label: 'Time Taken' }, { key: 'variance', label: 'Variance', variance: true },
      ],
      async load() { this.raw = await CP.clientData('jobs'); },
      rows() {
        return vjobs(this.raw, this.vertical).filter((j) => !isClosed(j)).map((j) => ({
          received_from: j.received_from, job_name: j.job_name, nature_of_job: j.nature_of_job, accountant: j.associate, job_status: statusOf(j),
          budget: hhmm(j.budget_hours), taken: hhmm(j.actual_hours), variance: hhmm(j.budget_hours - j.actual_hours), over: j.actual_hours > j.budget_hours,
        }));
      },
      cards() {
        const r = this.baseRows, sum = (k) => r.reduce((a, x) => a + (k === 'b' ? this.hoursOf(x.budget) : this.hoursOf(x.taken)), 0);
        return [
          { key: 'all', label: 'Open Jobs', value: r.length, unit: 'Jobs', tone: 'blue', test: () => true },
          { key: 'within', label: 'Within Budget', value: r.filter((x) => !x.over).length, unit: 'Jobs', tone: 'green', test: (x) => !x.over },
          { key: 'over', label: 'Over Budget', value: r.filter((x) => x.over).length, unit: 'Jobs', tone: 'maroon', test: (x) => x.over },
          { key: 'bvb', label: 'Budget vs Booked', value: hhmm(sum('b')), unit: hhmm(sum('t')) + ' Booked', tone: 'teal', static: true },
        ];
      },
    },

    'turnaround-report': {
      title: 'Turnaround by Bucket', tabs: true, export: true, cardsFirst: 'toggle',
      desc: 'Closed jobs grouped by elapsed time against the agreed turnaround standard.',
      tableTitle() { return `${this.jobStatus === 'open' ? 'Open' : 'Closed'} Jobs · Turnaround`; },
      columns: [
        { key: 'received_from', label: 'Received From', filter: 'select', all: 'All' },
        { key: 'job_name', label: 'Job Name', filter: 'text', bold: true },
        { key: 'nature_of_job', label: 'Nature of Job', filter: 'select', all: 'All' },
        { key: 'accountant', label: 'Accountant', filter: 'select', all: 'All' },
        { key: 'job_status', label: 'Job Status', filter: 'select', all: 'All' },
        { key: 'days', label: 'Turnaround (Days)' }, { key: 'in_carisma', label: 'Turnaround in Carisma' }, { key: 'in_client', label: 'Turnaround in Client' },
        { key: 'budget', label: 'Budget Hrs (hh:mm)' }, { key: 'taken', label: 'Time Taken (hh:mm)' },
      ],
      async load() { this.raw = await CP.clientData('jobs'); this.jobStatus = 'closed'; },
      rows() {
        return vjobs(this.raw, this.vertical).filter((j) => (this.jobStatus === 'open' ? !isClosed(j) : isClosed(j))).map((j) => {
          const d = turnaround(j), c = clientDays(j, d);
          return { received_from: j.received_from, job_name: j.job_name, nature_of_job: j.nature_of_job, accountant: j.associate, job_status: statusOf(j),
            days: d, in_carisma: d - c, in_client: c, budget: hhmm(j.budget_hours), taken: hhmm(j.actual_hours) };
        });
      },
      buckets() {
        const r = this.baseRows, n = (lo, hi) => r.filter((x) => x.days >= lo && x.days <= hi).length;
        return [{ label: `Total Jobs ${this.jobStatus === 'open' ? 'Open' : 'Closed'}`, value: r.length, tone: 'blue' }, { label: '0 to 5 Days', value: n(0, 5), tone: 'green' },
          { label: '6 to 10 Days', value: n(6, 10), tone: 'teal' }, { label: '11 to 20 Days', value: n(11, 20), tone: 'blue' }, { label: '21 to 30 Days', value: n(21, 30), tone: 'orange' },
          { label: '31 to 60 Days', value: n(31, 60), tone: 'maroon' }, { label: 'Above 60 Days', value: r.filter((x) => x.days > 60).length, tone: 'red' }];
      },
    },

    movement: {
      title: 'Movement', tabs: true, export: true, period: true,
      tableTitle() { return `Job Movement · ${this.vertical || 'All Verticals'}`; },
      columns: [
        { key: 'received_from', label: 'Received From', filter: 'select', all: 'All' },
        { key: 'job_name', label: 'Job Name', filter: 'text', bold: true },
        { key: 'nature_of_job', label: 'Nature of Job', filter: 'select', all: 'All' },
        { key: 'movement', label: 'Movement', filter: 'select', all: 'All' },
        { key: 'from_status', label: 'From Status' }, { key: 'to_status', label: 'To Status', filter: 'select', all: 'All' },
        { key: 'date', label: 'Date', date: true },
      ],
      async load() { this.raw = await CP.clientData('jobs'); },
      rows() {
        const from = this.periodFrom;
        return movements(vjobs(this.raw, this.vertical)).filter((m) => m.date >= from && m.date <= this.periodTo).sort((a, b) => b.date.localeCompare(a.date));
      },
      cards() {
        const r = this.baseRows, c = (k) => r.filter((x) => x.movement === k).length;
        return [
          { key: 'new', label: 'New Jobs Received', value: c('New Jobs Received'), unit: 'Jobs', tone: 'green', test: (x) => x.movement === 'New Jobs Received' },
          { key: 'queries', label: 'Sent for Queries', value: c('Sent for Queries'), unit: 'Jobs', tone: 'orange', test: (x) => x.movement === 'Sent for Queries' },
          { key: 'review', label: 'Sent for Review', value: c('Sent for Review'), unit: 'Jobs', tone: 'purple', test: (x) => x.movement === 'Sent for Review' },
          { key: 'closed', label: 'Closed', value: c('Closed'), unit: 'Jobs', tone: 'teal', test: (x) => x.movement === 'Closed' },
          { key: 'other', label: 'Other Status Changed', value: c('Other Status Changed'), unit: 'Jobs', tone: 'maroon', test: (x) => x.movement === 'Other Status Changed' },
          { key: 'all', label: 'All Movement', value: r.length, unit: 'Records', tone: 'blue', test: () => true },
        ];
      },
    },

    mom: {
      title: 'Meeting', tableTitle: 'Meetings', tabs: false, dateRange: true,
      empty: 'No meetings found.',
      columns: [
        { key: 'client_name', label: 'Client', bold: true }, { key: 'date', label: 'Date', date: true }, { key: 'client_present', label: 'Client Present' },
        { key: 'purpose', label: 'Purpose' }, { key: 'description', label: 'Description', view: true }, { key: 'vertical', label: 'Vertical' },
      ],
      async load() { this.raw = await CP.clientData('mom'); this.dateTo = CP.TODAY; this.dateFrom = addDays(CP.TODAY, -30); },
      rows() { return this.raw.filter((m) => (!this.dateFrom || m.date >= this.dateFrom) && (!this.dateTo || m.date <= this.dateTo)).sort((a, b) => b.date.localeCompare(a.date)); },
    },

    'closed-jobs-feedback': {
      title: 'Closed Jobs - Feedback', tableTitle: 'Closed Jobs', tabs: true, survey: true,
      desc: 'All closed jobs for this engagement. Add feedback on service quality for any job.',
      columns: [
        { key: 'received_from', label: 'Received From', filter: 'select', all: 'All' },
        { key: 'job_name', label: 'Job Name', filter: 'text', bold: true },
        { key: 'nature_of_job', label: 'Nature of Job', filter: 'select', all: 'All' },
        { key: 'budget', label: 'Budget' }, { key: 'taken', label: 'Time Taken' }, { key: 'days', label: 'Turnaround (Days)' },
        { key: 'job_status', label: 'Job Status' }, { key: 'action', label: 'Action', action: true },
      ],
      async load() {
        [this.raw, this.surveyList] = await Promise.all([CP.clientData('jobs'), CP.clientData('surveys')]);
        this.surveys = Object.fromEntries(this.surveyList.map((s) => [s.job_id, s]));
      },
      rows() {
        return vjobs(this.raw, this.vertical).filter(isClosed).map((j) => ({ job_id: j.job_id, received_from: j.received_from, job_name: j.job_name, nature_of_job: j.nature_of_job,
          budget: hhmm(j.budget_hours), taken: hhmm(j.actual_hours), days: turnaround(j), job_status: 'Closed', action: this.surveys[j.job_id] ? 'Edit Feedback' : 'Add Feedback' }));
      },
    },
  };

  Alpine.data('gridPage', (name) => {
    const cfg = CONFIGS[name];
    return {
      cfg, name, loading: true, raw: [], vertical: '', card: null, filters: {}, tbl: null, jobStatus: 'closed', refreshing: false,
      // movement period / mom date range
      period: '14d', periodFrom: addDays(CP.TODAY, -14), periodTo: CP.TODAY, customFrom: '', customTo: '', dateFrom: '', dateTo: '',
      // modals
      viewRow: null, surveyRow: null, survey: {}, surveys: {}, surveyList: [], ratings: ['Extremely satisfied', 'Very satisfied', 'Somewhat satisfied', 'Dissatisfied', 'Very dissatisfied'],
      surveyError: '',

      async init() {
        await cfg.load.call(this);
        this.tbl = CP.makeTable({ rows: () => this.filteredRows, columns: cfg.columns.map((c) => ({ key: c.key, label: c.label })), size: 10 });
        this.loading = false;
      },
      get verticals() { return store().client.verticals; },
      get baseRows() { return cfg.rows.call(this); },                       // rows before card / column filters
      get cards() { return cfg.cards ? cfg.cards.call(this) : []; },
      get buckets() { return cfg.buckets ? cfg.buckets.call(this) : []; },
      get openCount() { return vjobs(this.raw, this.vertical).filter((j) => !isClosed(j)).length; },     // turnaround Open/Closed toggle cards
      get closedCount() { return vjobs(this.raw, this.vertical).filter(isClosed).length; },
      get tableTitle() { return typeof cfg.tableTitle === 'function' ? cfg.tableTitle.call(this) : cfg.tableTitle; },
      hoursOf(s) { const [h, m] = String(s).split(':').map(Number); return h + m / 60; },
      get filteredRows() {
        const card = this.cards.find((c) => c.key === this.card);
        return this.baseRows.filter((r) => (!card || !card.test || card.test(r)) &&
          Object.entries(this.filters).every(([k, v]) => !v || (cfg.columns.find((c) => c.key === k).filter === 'text' ? String(r[k]).toLowerCase().includes(v.toLowerCase()) : String(r[k]) === v)));
      },
      opts(k) { return uniq(this.baseRows, k); },
      get hasFilters() { return !!(this.card || Object.values(this.filters).some(Boolean)); },
      clearFilters() { this.card = null; this.filters = {}; this.tbl.reset(); },
      setVertical(v) { this.vertical = v; this.card = null; this.filters = {}; this.tbl.reset(); },
      selectCard(c) { if (c.static) return; this.card = this.card === c.key ? null : c.key; this.tbl.reset(); },
      setJobStatus(s) { this.jobStatus = s; this.filters = {}; this.tbl.reset(); },
      refresh() { this.refreshing = true; setTimeout(() => (this.refreshing = false), 700); },
      cell(r, c) { const v = r[c.key]; return c.date ? CP.fmt.dmy(v) : (v === '' || v == null ? '-' : v); },

      /* movement period */
      applyPeriod() {
        this.periodTo = CP.TODAY;
        if (this.period === 'custom') { this.periodFrom = this.customFrom || addDays(CP.TODAY, -30); this.periodTo = this.customTo || CP.TODAY; }
        else this.periodFrom = addDays(CP.TODAY, { '7d': -7, '14d': -14, '1m': -30 }[this.period]);
        this.card = null; this.tbl.reset(); this.refresh();
      },

      /* feedback survey (in memory only) */
      openSurvey(r) {
        this.surveyRow = r; this.surveyError = '';
        this.survey = { overall_satisfaction: '', overall_insights: '', responsiveness: '', responsiveness_insights: '', improvements: '', ...(this.surveys[r.job_id] || {}) };
      },
      submitSurvey() {
        if (!this.survey.overall_satisfaction || !this.survey.responsiveness) { this.surveyError = 'Please answer questions 1 and 3 before submitting.'; return; }
        this.surveys[this.surveyRow.job_id] = { job_id: this.surveyRow.job_id, ...this.survey };
        this.surveyRow.action = 'Edit Feedback'; this.surveyRow = null; CP.toast('Feedback submitted (prototype)');
      },
      D: CP.fmt.dmy, tones: CARD_TONES,
    };
  });

  /* ------------------------------------------------------------------ Production Report ------------------------------------------------------------------ */
  Alpine.data('productionPage', () => ({
    loading: true, data: { rows: [] }, vertical: '', month: 'cur',
    async init() { this.data = await CP.clientData('production'); this.loading = false; },
    get verticals() { return store().client.verticals; },
    get rows() { return this.data.rows.filter((r) => !this.vertical || r.vertical === this.vertical); },
    fx(n) { return Number(n).toFixed(2); },
    pct(c, p) { return p ? Math.round(((c - p) / p) * 100) : 0; },
    total(period, k) { return this.rows.reduce((a, r) => a + r[period][k], 0); },
  }));

  /* ------------------------------------------------------------------ Overview ------------------------------------------------------------------ */
  Alpine.data('overviewPage', () => ({
    loading: true, jobs: [], surveys: [], mom: [], prod: { rows: [] }, vertical: '',
    async init() {
      [this.jobs, this.surveys, this.mom, this.prod] = await Promise.all([CP.clientData('jobs'), CP.clientData('surveys'), CP.clientData('mom'), CP.clientData('production')]);
      this.loading = false;
    },
    get verticals() { return store().client.verticals; },
    get vj() { return vjobs(this.jobs, this.vertical); },
    get s() {
      const vj = this.vj, open = vj.filter((j) => !isClosed(j)), closed = vj.filter(isClosed), days = closed.map(turnaround);
      const moves = movements(vj).filter((m) => m.date >= addDays(CP.TODAY, -14));
      const surveyed = new Set(this.surveys.map((x) => x.job_id));
      return {
        open: open.length, closed: closed.length,
        prodJobs: this.prod.rows.filter((r) => !this.vertical || r.vertical === this.vertical).reduce((a, r) => a + r.current.jobs, 0),
        prodHours: this.prod.rows.filter((r) => !this.vertical || r.vertical === this.vertical).reduce((a, r) => a + r.current.productive, 0).toFixed(2),
        avgTat: days.length ? (days.reduce((a, b) => a + b, 0) / days.length).toFixed(1) : '0.0',
        within: open.filter((j) => j.actual_hours <= j.budget_hours).length, over: open.filter((j) => j.actual_hours > j.budget_hours).length,
        fbClosed: closed.length, fbPending: closed.filter((j) => !surveyed.has(j.job_id)).length,
        newJobs: moves.filter((m) => m.movement === 'New Jobs Received').length, allMoves: moves.length,
        meetings: this.mom.filter((m) => m.date >= addDays(CP.TODAY, -30)).length,
      };
    },
    go(route) { location.hash = '#' + route; },
  }));

  /* ------------------------------------------------------------------ Landing page ------------------------------------------------------------------ */
  /* Home: today's workflow, movement for the last 7 days, and the jobs sitting in Queries / Review / Final Review.
     Buckets follow the status names (SMSF: Awaiting Queries*, Workpapers Completed Initial / Final). */
  const IN_QUERIES = (s) => /Sent For Queries|Awaiting Queries/.test(s);
  const IN_REVIEW = (s) => s === 'Sent For Review' || s === 'Workpapers Completed Initial';
  const IN_FINAL = (s) => s === 'Sent For Final Review' || s === 'Workpapers Completed Final';
  Alpine.data('landingPage', () => ({
    loading: true, jobs: [], flow: [], queries: [],
    async init() { [this.jobs, this.flow, this.queries] = await Promise.all([CP.clientData('jobs'), CP.clientData('workflow'), CP.clientData('queries')]); this.loading = false; },
    get user() { return store().user; },
    get live() { return this.jobs.filter((j) => !isClosed(j)); },
    /* the jobs currently in a bucket, oldest-in-status first, with how long they've been there */
    bucket(test) {
      return this.live.filter((j) => test(statusOf(j))).map((j) => ({ ...j, status: statusOf(j), days: Math.max(0, CP.daysBetween(j.timeline[j.timeline.length - 1].on, CP.TODAY)),
        open_q: this.queries.filter((q) => q.job_id === j.job_id && (q.status === 'Open' || q.status === 'Responded')).length })).sort((a, b) => b.days - a.days);
    },
    get inQueries() { return this.bucket(IN_QUERIES); },
    get inReview() { return this.bucket(IN_REVIEW); },
    get inFinal() { return this.bucket(IN_FINAL); },
    /* open queries, longest-waiting first (query cards live on the Queries screen) */
    get openQueries() {
      return this.queries.filter((q) => q.status === 'Open').map((q) => ({ ...q, job_name: (this.jobs.find((x) => x.job_id === q.job_id) || {}).job_name || '-', days: Math.max(0, CP.daysBetween(q.posted_on.slice(0, 10), CP.TODAY)) })).sort((a, b) => b.days - a.days);
    },
    get workflowRows() { return this.flow.filter((r) => r.job_description || r.time_will_take); },
    /* movement, last 7 days */
    get moves() { const from = addDays(CP.TODAY, -6); return movements(this.jobs).filter((m) => m.date >= from && m.date <= CP.TODAY); },
    get perDay() {
      const days = Array.from({ length: 7 }, (_, i) => addDays(CP.TODAY, i - 6)), max = Math.max(1, ...days.map((d) => this.moves.filter((m) => m.date === d).length));
      return days.map((d) => { const n = this.moves.filter((m) => m.date === d).length; return { d, n, h: Math.round((n / max) * 100) }; });
    },
    cat(k) { return this.moves.filter((m) => m.movement === k).length; },
    dow(iso) { return CP.fmt.weekday(iso).slice(0, 3); },
    go(route) { location.hash = '#' + route; }, D: CP.fmt.dmy,
  }));

  /* ------------------------------------------------------------------ Job Allocation ------------------------------------------------------------------ */
  /* Pick a job (name or number — they stay linked) and an associate, "+" adds it to the grid; the two buttons then
     save the rows as Stage 1 or allocate them. Prototype only: state lives in memory. */
  Alpine.data('allocationPage', () => ({
    loading: true, jobs: [], sel: { job_name: '', job_no: '', associate: '' }, rows: [], error: '',
    async init() { this.jobs = (await CP.clientData('jobs')).filter((j) => !isClosed(j)); this.loading = false; },
    get associates() { return uniq(this.jobs, 'associate'); },
    /* Job Name and Job No are free-text boxes; a Job No that matches an open job fills in a blank name as a convenience */
    lookupNo() {
      const j = this.jobs.find((x) => String(x.job_id) === this.sel.job_no.trim());
      if (j && !this.sel.job_name.trim()) this.sel.job_name = j.job_name;
    },
    add() {
      this.error = '';
      const name = this.sel.job_name.trim(), no = this.sel.job_no.trim();
      if (!name || !no || !this.sel.associate) { this.error = 'Enter the job name and job no, choose an associate, then click +.'; return; }
      if (this.rows.some((r) => String(r.job_id).toLowerCase() === no.toLowerCase())) { this.error = 'This job no is already in the grid.'; return; }
      this.rows.push({ job_id: no, job_name: name, associate: this.sel.associate, stage: 'Pending', pick: false });
      this.sel = { job_name: '', job_no: '', associate: '' };
    },
    remove(i) { this.rows.splice(i, 1); },

    /* Each job can go its own way: Stage 1 straight away, or Allocate after the 3-question checklist.
       Allocating is only allowed once every answer is Yes; jobs that aren't ready can drop to Stage 1 instead. */
    questions: [
      { key: 'access', label: 'Access to accounting software given' },
      { key: 'docs', label: 'Documents loaded to OneDrive' },
      { key: 'notes', label: 'Client notes added' },
    ],
    alloc: null,                                              // { rows, answers: { [job_id]: { access, docs, notes } } }
    get open() { return this.rows.filter((r) => r.stage !== 'Allocated'); },
    get picks() { return this.open.filter((r) => r.pick); },
    get allPicked() { return this.open.length > 0 && this.open.every((r) => r.pick); },
    togglePickAll() { const v = !this.allPicked; this.open.forEach((r) => (r.pick = v)); },
    stage1(list) {
      const t = (list || this.picks).filter((r) => r.stage === 'Pending');
      if (!t.length) { CP.toast(list ? 'Already in Stage 1' : 'Tick the jobs to save as Stage 1'); return; }
      t.forEach((r) => { r.stage = 'Stage 1'; r.pick = false; }); CP.toast(`${t.length} job${t.length > 1 ? 's' : ''} saved as Stage 1 (prototype)`);
    },
    openAllocate(list) {
      const t = list || this.picks; if (!t.length) { CP.toast('Tick the jobs to allocate'); return; }
      this.alloc = { rows: t, answers: Object.fromEntries(t.map((r) => [r.job_id, { access: false, docs: false, notes: false }])) };
    },
    ready(r) { return this.questions.every((q) => this.alloc.answers[r.job_id][q.key]); },
    get allReady() { return this.alloc && this.alloc.rows.every((r) => this.ready(r)); },
    get readyCount() { return this.alloc ? this.alloc.rows.filter((r) => this.ready(r)).length : 0; },
    setAll(key) { const v = !this.alloc.rows.every((r) => this.alloc.answers[r.job_id][key]); this.alloc.rows.forEach((r) => (this.alloc.answers[r.job_id][key] = v)); },
    confirmAllocate(splitRest) {
      const a = this.alloc; let done = 0, staged = 0;
      a.rows.forEach((r) => {
        r.pick = false;
        if (this.ready(r)) { r.stage = 'Allocated'; r.checks = { ...a.answers[r.job_id] }; done++; }
        else if (splitRest) { r.stage = 'Stage 1'; staged++; }
      });
      this.alloc = null;
      CP.toast(`${done} allocated${staged ? `, ${staged} saved as Stage 1` : ''} (prototype)`);
    },
    tone(s) { return { Pending: 'bg-slate-100 text-slate-600', 'Stage 1': 'bg-amber-100 text-amber-800', Allocated: 'bg-green-100 text-green-700' }[s]; },
  }));
});
