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
  /* with-client statuses (yellow tiles on Job Status) vs with Carisma (everything else) */
  const isClientStatus = (s) => /Sent For Queries|Awaiting Queries|Sent For (Final )?Review|Workpapers Completed|On Hold/.test(s);
  const TA_BUCKETS = [[0, 5, '0-5'], [6, 10, '6-10'], [11, 20, '11-20'], [21, 30, '21-30'], [31, 60, '31-60'], [61, Infinity, '61+']];
  const avgOf = (rows, k) => (rows.length ? Math.round(rows.reduce((a, x) => a + x[k], 0) / rows.length) : 0);

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
  const CARD_TONES = { blue: 'border-navy text-navy', green: 'border-green-500 text-green-700', maroon: 'border-brand text-brand', teal: 'border-navy text-navy',
    orange: 'border-orange-400 text-orange-600', purple: 'border-navy text-navy', red: 'border-red-500 text-red-600', amber: 'border-amber-400 text-amber-700' };

  const CONFIGS = {
    workflow: {
      title: "Workflow", tableTitle: "Today's Stand-Up", tabs: false, refresh: true, groupCol: 'name_a', pageSize: 200,
      empty: 'No stand-up logged for today.',
      columns: [
        { key: 'name_a', label: 'Accountant Name', bold: true },
        { key: 'job_description', label: 'Job Name', jobLink: true },
        { key: 'workstatus', label: 'Activity' },
        { key: 'time_will_take', label: 'Est. Time' },
        { key: 'expected_finish_date', label: 'Est. Delivery', date: true },
      ],
      async load() { this.raw = await CP.clientData('workflow'); },
      // stand-up placeholder rows dropped, as on the real page; sorted by accountant so their jobs group together
      rows() { return this.raw.filter((r) => r.job_description || r.time_will_take).sort((a, b) => a.name_a.localeCompare(b.name_a)); },
    },

    'budget-overview': {
      title: 'Budget Overview - Open Jobs', tabs: true, export: true,
      desc: 'Budget time against time booked to date for every open job. Jobs past their budget are highlighted. Select a card to filter the list.',
      tableTitle() { return `Open Jobs · ${this.vertical || 'All Verticals'}`; },
      columns: [
        { key: 'received_from', label: 'Received From', filter: 'select', all: 'All' },
        { key: 'job_name', label: 'Job Name', filter: 'text', bold: true, jobLink: true },
        { key: 'nature_of_job', label: 'Nature of Job', filter: 'select', all: 'All' },
        { key: 'accountant', label: 'Accountant', filter: 'select', all: 'All' },
        { key: 'job_status', label: 'Job Status', filter: 'select', all: 'All' },
        { key: 'budget', label: 'Budget Time' }, { key: 'taken', label: 'Time Taken' }, { key: 'variance', label: 'Variance', variance: true },
      ],
      async load() { this.raw = await CP.clientData('jobs'); },
      rows() {
        return vjobs(this.raw, this.vertical).filter((j) => !isClosed(j)).map((j) => ({
          job_id: j.job_id, received_from: j.received_from, job_name: j.job_name, nature_of_job: j.nature_of_job, accountant: j.associate, job_status: statusOf(j),
          budget: hhmm(j.budget_hours), taken: hhmm(j.actual_hours), variance: hhmm(j.budget_hours - j.actual_hours), over: j.actual_hours > j.budget_hours,
        }));
      },
      cards() {
        const r = this.baseRows, within = r.filter((x) => !x.over).length, over = r.filter((x) => x.over).length, pct = (n) => (r.length ? Math.round((n / r.length) * 100) : 0);
        return [
          { key: 'all', label: 'Total', value: r.length, unit: 'Open Jobs', tone: 'blue', test: () => true },
          { key: 'within', label: 'Within Budget', value: pct(within) + '%', unit: within + ' jobs', tone: 'blue', test: (x) => !x.over },
          { key: 'over', label: 'Over Budget', value: pct(over) + '%', unit: over + ' jobs', tone: 'maroon', test: (x) => x.over },
        ];
      },
    },

    'turnaround-report': {
      title: 'Turnaround by Bucket', tabs: true, export: true, cardsFirst: 'toggle', manager: true,
      tableTitle() { return `${this.jobStatus === 'open' ? 'Open' : 'Closed'} Jobs · Turnaround`; },
      columns: [
        { key: 'received_from', label: 'Received From', filter: 'select', all: 'All' },
        { key: 'job_name', label: 'Job Name', filter: 'text', bold: true, jobLink: true },
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
          return { job_id: j.job_id, received_from: j.received_from, job_name: j.job_name, nature_of_job: j.nature_of_job, accountant: j.associate, job_status: statusOf(j),
            days: d, in_carisma: d - c, in_client: c, budget: hhmm(j.budget_hours), taken: hhmm(j.actual_hours) };
        });
      },
      /* Manager view: each manager x day-bucket, showing job count + average days spent with Carisma / with the client */
      taBuckets: TA_BUCKETS,
      taManagers() { return uniq(this.baseRows, 'accountant'); },
      taStats(manager, lo, hi) {
        const jobs = this.baseRows.filter((r) => (manager === null || r.accountant === manager) && r.days >= lo && r.days <= hi);
        return { count: jobs.length, total: avgOf(jobs, 'days'), carisma: avgOf(jobs, 'in_carisma'), client: avgOf(jobs, 'in_client') };
      },
      buckets() {
        const r = this.baseRows, n = (lo, hi) => r.filter((x) => x.days >= lo && x.days <= hi).length;
        return [{ label: `Total Jobs ${this.jobStatus === 'open' ? 'Open' : 'Closed'}`, value: r.length, tone: 'blue' }, { label: '0 to 5 Days', value: n(0, 5), tone: 'green' },
          { label: '6 to 10 Days', value: n(6, 10), tone: 'teal' }, { label: '11 to 20 Days', value: n(11, 20), tone: 'blue' }, { label: '21 to 30 Days', value: n(21, 30), tone: 'orange' },
          { label: '31 to 60 Days', value: n(31, 60), tone: 'maroon' }, { label: 'Above 60 Days', value: r.filter((x) => x.days > 60).length, tone: 'red' }];
      },
    },

    movement: {
      title: 'Movement', tabs: true, export: true, period: true, manager: true,
      tableTitle() { return `Job Movement · ${this.vertical || 'All Verticals'}`; },
      columns: [
        { key: 'received_from', label: 'Received From', filter: 'select', all: 'All' },
        { key: 'job_name', label: 'Job Name', filter: 'text', bold: true, jobLink: true },
        { key: 'nature_of_job', label: 'Nature of Job', filter: 'select', all: 'All' },
        { key: 'movement', label: 'Movement', filter: 'select', all: 'All' },
        { key: 'from_status', label: 'From Status' }, { key: 'to_status', label: 'To Status', filter: 'select', all: 'All' },
        { key: 'date', label: 'Date', date: true },
      ],
      async load() { this.raw = await CP.clientData('jobs'); },
      rows() {
        const from = this.periodFrom, nonSmsf = this.raw.filter((j) => j.vertical !== 'SMSF');       // SMSF's own status names don't belong in this report
        return movements(vjobs(nonSmsf, this.vertical)).filter((m) => m.date >= from && m.date <= this.periodTo).sort((a, b) => b.date.localeCompare(a.date));
      },
      cards() {
        const r = this.baseRows;
        /* with-client statuses (yellow tiles on Job Status) go brown; everything else (with Carisma) goes blue */
        const newCount = r.filter((x) => x.movement === 'New Jobs Received').length;
        const statuses = uniq(r.filter((x) => x.movement !== 'New Jobs Received'), 'to_status');
        const statusCards = statuses.map((s) => ({
          key: 'status:' + s, label: s, value: r.filter((x) => x.movement !== 'New Jobs Received' && x.to_status === s).length, unit: 'Jobs',
          tone: isClientStatus(s) ? 'maroon' : 'blue', test: (x) => x.movement !== 'New Jobs Received' && x.to_status === s,
        }));
        return [
          { key: 'new', label: 'New Jobs Received', value: newCount, unit: 'Jobs', tone: 'blue', test: (x) => x.movement === 'New Jobs Received' },
          ...statusCards,
          { key: 'all', label: 'All Movement', value: r.length, unit: 'Records', tone: 'blue', test: () => true },
        ];
      },
    },

    mom: {
      title: 'Meeting', tableTitle: 'Meetings', tabs: false, dateRange: true,
      empty: 'No meetings found.',
      columns: [
        { key: 'date', label: 'Date', date: true, bold: true }, { key: 'client_present', label: 'Manager' }, { key: 'attendees', label: 'Attendees' },
        { key: 'purpose', label: 'Purpose' }, { key: 'description', label: 'Description', view: true }, { key: 'vertical', label: 'Vertical' },
      ],
      async load() { this.raw = await CP.clientData('mom'); this.dateTo = CP.TODAY; this.dateFrom = addDays(CP.TODAY, -30); },
      rows() { return this.raw.filter((m) => (!this.dateFrom || m.date >= this.dateFrom) && (!this.dateTo || m.date <= this.dateTo)).sort((a, b) => b.date.localeCompare(a.date)); },
    },

    'closed-jobs-feedback': {
      title: 'Closed Jobs - Feedback', tableTitle: 'Closed Jobs', tabs: true,
      desc: 'All closed jobs for this engagement. Rate service quality and leave a comment directly in the grid.',
      columns: [
        { key: 'received_from', label: 'Received From', filter: 'select', all: 'All' },
        { key: 'job_name', label: 'Job Name', filter: 'text', bold: true, jobLink: true },
        { key: 'nature_of_job', label: 'Nature of Job', filter: 'select', all: 'All' },
        { key: 'budget', label: 'Budget' }, { key: 'taken', label: 'Time Taken' }, { key: 'days', label: 'Turnaround (Days)' },
        { key: 'rating', label: 'Feedback', stars: true }, { key: 'comment', label: 'Comments', commentBox: true },
      ],
      async load() {
        [this.raw, this.surveyList] = await Promise.all([CP.clientData('jobs'), CP.clientData('surveys')]);
        this.surveys = Object.fromEntries(this.surveyList.map((s) => [s.job_id, s]));
      },
      rows() {
        return vjobs(this.raw, this.vertical).filter(isClosed).map((j) => { const s = this.surveys[j.job_id]; return { job_id: j.job_id, received_from: j.received_from, job_name: j.job_name, nature_of_job: j.nature_of_job,
          budget: hhmm(j.budget_hours), taken: hhmm(j.actual_hours), days: turnaround(j), action: s && s.overall_satisfaction ? 'Edit Feedback' : 'Add Feedback',
          rating: s ? this.starCount(s.overall_satisfaction) : 0, comment: (s && s.improvements) || '' }; });
      },
      cards() {
        const r = this.baseRows, given = r.filter((x) => x.action === 'Edit Feedback').length;
        return [
          { key: 'all', label: 'Total Jobs', value: r.length, unit: 'Closed Jobs', tone: 'blue', test: () => true },
          { key: 'given', label: 'Feedback Given', value: given, unit: 'Jobs', tone: 'blue', test: (x) => x.action === 'Edit Feedback' },
          { key: 'not', label: 'Feedback Not Given', value: r.length - given, unit: 'Jobs', tone: 'maroon', test: (x) => x.action === 'Add Feedback' },
        ];
      },
    },
  };

  Alpine.data('gridPage', (name) => {
    const cfg = CONFIGS[name];
    return {
      cfg, name, loading: true, raw: [], vertical: '', card: null, filters: {}, tbl: null, jobStatus: 'closed', refreshing: false, viewMode: 'status',
      // movement period / mom date range
      period: '14d', periodFrom: addDays(CP.TODAY, -14), periodTo: CP.TODAY, customFrom: '', customTo: '', dateFrom: '', dateTo: '',
      // modals
      viewRow: null, surveys: {}, surveyList: [], ratings: ['Extremely satisfied', 'Very satisfied', 'Somewhat satisfied', 'Dissatisfied', 'Very dissatisfied'],
      hoverStars: {},

      async init() {
        await cfg.load.call(this);
        this.tbl = CP.makeTable({ rows: () => this.filteredRows, columns: cfg.columns.map((c) => ({ key: c.key, label: c.label })), size: cfg.pageSize || 10 });
        this.loading = false;
      },
      get verticals() { const v = store().client.verticals; return name === 'movement' ? v.filter((x) => x.code !== 'SMSF') : v; },
      get baseRows() { return cfg.rows.call(this); },                       // rows before card / column filters
      /* group consecutive rows sharing cfg.groupCol (e.g. one accountant's jobs) under a single merged cell */
      get displayRows() {
        const col = cfg.groupCol, rows = this.tbl.slice;
        if (!col) return rows.map((r) => ({ r, show: true, span: 1 }));
        const out = [];
        for (let i = 0; i < rows.length; i++) {
          if (i > 0 && rows[i][col] === rows[i - 1][col]) { out.push({ r: rows[i], show: false, span: 0 }); continue; }
          let span = 1; while (i + span < rows.length && rows[i + span][col] === rows[i][col]) span++;
          out.push({ r: rows[i], show: true, span });
        }
        return out;
      },
      get cards() { return cfg.cards ? cfg.cards.call(this) : []; },
      get buckets() { return cfg.buckets ? cfg.buckets.call(this) : []; },
      // turnaround manager view: manager x day-bucket, job count + average days with Carisma / with client; a trailing "All Jobs" group totals every bucket for that manager
      get taBuckets() { return cfg.taBuckets || []; },
      get taGroups() { return [...this.taBuckets, [0, Infinity, 'All Jobs']]; },
      // flattened bucket x sub-column list so each <th>/<td> comes from its own x-for iteration (a <template x-for> with several sibling elements only clones the first one correctly)
      get taCols() { return this.taGroups.flatMap((b) => [{ b, k: 'total', label: 'Total' }, { b, k: 'carisma', label: 'With Carisma' }, { b, k: 'client', label: 'With Client' }]); },
      get taManagers() { return cfg.taManagers ? cfg.taManagers.call(this) : []; },
      taStats(manager, lo, hi) { return cfg.taStats.call(this, manager, lo, hi); },
      taCell(manager, c) { const s = this.taStats(manager, c.b[0], c.b[1]); return s.count ? s[c.k] : '-'; },
      taExpanded: null,
      toggleTaExpanded(m) { this.taExpanded = this.taExpanded === m ? null : m; },
      taJobsFor(m) { return this.taExpanded === m ? this.baseRows.filter((r) => r.accountant === m) : []; },
      // one job's value under a given bucket column — blank outside that job's own bucket, so it lines up under the matching group; Total = that job's total turnaround days
      taJobCell(job, c) { if (job.days < c.b[0] || job.days > c.b[1]) return '-'; return c.k === 'total' ? job.days : job[c.k === 'carisma' ? 'in_carisma' : 'in_client']; },
      get openCount() { return vjobs(this.raw, this.vertical).filter((j) => !isClosed(j)).length; },     // turnaround Open/Closed toggle cards
      get closedCount() { return vjobs(this.raw, this.vertical).filter(isClosed).length; },
      get tableTitle() { return typeof cfg.tableTitle === 'function' ? cfg.tableTitle.call(this) : cfg.tableTitle; },
      /* Manager view (movement only): partner x status/movement-type breakdown, mirrors Job Status' Partner Wise Jobs grid */
      get partners() { return uniq(this.baseRows, 'received_from'); },
      get managerCols() { return this.cards.filter((c) => c.key !== 'all'); },
      get managerRows() { return this.managerCols.map((c) => { const counts = Object.fromEntries(this.partners.map((p) => [p, this.baseRows.filter((r) => r.received_from === p && c.test(r)).length])); return { c, counts, total: Object.values(counts).reduce((a, b) => a + b, 0) }; }); },
      partnerTotal(p) { return this.baseRows.filter((r) => r.received_from === p).length; },
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

      /* feedback (in memory only) is set directly in the grid: stars = overall_satisfaction, the comment box = improvements.
         star 1 = last entry in `ratings`, star 5 = first */
      starCount(label) { const i = this.ratings.indexOf(label); return i === -1 ? 0 : this.ratings.length - i; },
      starLabel(n) { return this.ratings[this.ratings.length - n] || 'Not rated'; },
      surveyFor(r) { return this.surveys[r.job_id] || (this.surveys[r.job_id] = { job_id: r.job_id, overall_satisfaction: '', overall_insights: '', responsiveness: '', responsiveness_insights: '', improvements: '' }); },
      rate(r, n) {
        const s = this.surveyFor(r);
        s.overall_satisfaction = this.starCount(s.overall_satisfaction) === n ? '' : this.starLabel(n);
        r.rating = this.starCount(s.overall_satisfaction); r.action = s.overall_satisfaction ? 'Edit Feedback' : 'Add Feedback';
      },
      setComment(r, val) {
        this.surveyFor(r).improvements = val; r.comment = val;
        r.action = this.surveys[r.job_id].overall_satisfaction ? 'Edit Feedback' : 'Add Feedback';
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
  const IN_WIP_REVIEW = (s) => s === 'WIP - Review Replies';
  Alpine.data('landingPage', () => ({
    loading: true, jobs: [], flow: [], queries: [], surveys: [], appr: [], mom: [], prod: { rows: [] }, holidays: [], flowYest: [], vertical: '',
    async init() { [this.jobs, this.flow, this.queries, this.surveys, this.appr, this.mom, this.prod, this.holidays, this.flowYest] = await Promise.all([CP.clientData('jobs'), CP.clientData('workflow'), CP.clientData('queries'), CP.clientData('surveys'), CP.clientData('appreciation'), CP.clientData('mom'), CP.clientData('production'), CP.sharedData('holidays'), CP.clientData('workflow_yesterday')]); this.vertical = this.verticals[0].title; this.loading = false; },
    get user() { return store().user; },
    get verticals() { return store().client.verticals; },
    setVertical(v) { this.vertical = v; },
    get live() { return this.jobs.filter((j) => !isClosed(j)); },
    /* the jobs currently in a bucket, oldest-in-status first, with how long they've been there */
    bucket(test) {
      return this.live.filter((j) => test(statusOf(j))).map((j) => ({ ...j, status: statusOf(j), days: Math.max(0, CP.daysBetween(j.timeline[j.timeline.length - 1].on, CP.TODAY)),
        open_q: this.queries.filter((q) => q.job_id === j.job_id && (q.status === 'Open' || q.status === 'Responded')).length })).sort((a, b) => b.days - a.days);
    },
    get inQueries() { return this.bucket(IN_QUERIES); },
    get inReview() { return this.bucket(IN_REVIEW); },
    get inFinal() { return this.bucket(IN_FINAL); },
    get inWipReview() { return this.bucket(IN_WIP_REVIEW); },
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
    /* the next holiday in each region (Australia / India), from the shared calendar */
    get nextHolidays() {
      const tone = { Australia: 'border-slate-300 text-slate-800', India: 'border-slate-300 text-slate-800' };
      return ['Australia', 'India'].map((region) => {
        const h = this.holidays.filter((x) => x.date >= CP.TODAY && (x.region === region || x.region === 'Both')).sort((a, b) => a.date.localeCompare(b.date))[0];
        if (!h) return null;
        const d = CP.daysBetween(CP.TODAY, h.date);
        return { l: region + ' holiday', v: h.name, u: h.date.slice(8) + '-' + h.date.slice(5, 7) + ' · ' + (d === 0 ? 'today' : d === 1 ? 'tomorrow' : 'in ' + d + 'd'), tone: tone[region], small: true };
      }).filter(Boolean);
    },
    /* feedback received, if any: the client's submitted surveys with the job they belong to */
    get feedbackList() { return this.surveys.map((s) => ({ ...s, job_name: (this.jobs.find((x) => x.job_id === s.job_id) || {}).job_name || '-' })); },
    /* yesterday's stand-up, each job with the status it had then and its current status */
    /* section order chosen so rows pack to 7 cards each: Daily Planner | Jobs(3) + Movement(1) + Budget(3) = 7 | Holidays(2) + Feedback(3) */
    get layout() { const o = ['Daily Planner', 'Jobs', 'Movement', 'Budget', 'Holidays', 'Feedback']; return [...this.sections].sort((a, b) => o.findIndex((n) => a.t.startsWith(n)) - o.findIndex((n) => b.t.startsWith(n))); },
    /* 12-column grid: Daily Planner 5 | Jobs 5 + Movement 2 + Budget 5 | Holidays 4 + Feedback 3 */
    span(s) { return ({ Daily: 5, Jobs: 5, Movement: 2, Budget: 5, Holidays: 4, Feedback: 3 })[s.t.split(' ')[0]] || 6; },
    /* rows: 1 Daily Planner (+ Yesterday's Workflow) | 2 Jobs + Movement + Budget (7 cards) | 3 Holidays + Feedback */
    get layoutRows() { const l = this.layout; return [[l[0]], [l[1], l[2], l[3]], [l[4], l[5]]]; },
    get addYesterday() { return addDays(CP.TODAY, -1); },
    get yesterdayRows() {
      return this.flowYest.map((r) => { const j = this.jobs.find((x) => x.job_id === r.job_id); const cur = j ? statusOf(j) : r.workstatus; return { ...r, current: cur, moved: cur !== r.workstatus }; });
    },
    /* Home cards, grouped by the screen they summarise (Jobs, Movement, Budget, Turnaround, Feedback, Daily Planner, Overview); each opens that screen */
    /* two colours only (blue for everything else); only the manager-side cards in Jobs (not WIP Review Replies, which is with Carisma) and Over Budget keep the brand maroon */
    get sections() {
      const M = 'border-brand text-brand', BLUE = 'border-navy text-navy';
      const SEC = { Jobs: BLUE, Movement: BLUE, Budget: BLUE, Daily: BLUE, Holidays: BLUE, Feedback: BLUE };   // just two colours on Home: maroon (manager side) and blue (the rest)
      return this.rawSections.map((sec) => { const acc = SEC[sec.t.split(' ')[0]] || M; return { ...sec, cards: sec.cards.map((c) => ((sec.t === 'Jobs' && c.tone === M && !c.l.startsWith('WIP Review Replies')) || c.l === 'Over Budget' ? { ...c, tone: M } : { ...c, tone: acc })) }; });
    },
    get rawSections() {
      const live = this.live, closed = this.jobs.filter(isClosed), sum = (a, k) => a.reduce((t, x) => t + x[k], 0);
      const over = live.filter((j) => j.actual_hours > j.budget_hours), tat = closed.map(turnaround);
      const surveyed = new Set(this.surveys.map((s) => s.job_id)), mins = (t) => { const [h, m] = String(t || '0:0').split(':').map(Number); return h + m / 60; };
      const flow = this.workflowRows, monthAgo = addDays(CP.TODAY, -30);
      /* two-tone palette: brand maroon = manager-action cards, neutral slate = the rest */
      const N = 'border-slate-300 text-slate-800', M = 'border-brand text-brand';
      const B = N, G = N, C = N, O = N, R = N, I = M, A = M, P = M, T = M;
      return [
        { t: 'Jobs', icon: 'work_outline', r: '/dashboard/job-status', cards: (() => { const withClient = this.inQueries.length + this.inReview.length + this.inFinal.length; return [
          { l: 'Total Live Jobs', v: live.length, u: 'jobs', tone: B, strong: true },
          { l: 'With Carisma', v: live.length - withClient, u: 'jobs', tone: N, strong: true },
          { l: 'With Client', v: withClient, u: 'jobs', tone: A, strong: true }]; })() },
        { t: 'Movement', icon: 'swap_horiz', r: '/dashboard/movement', cards: [
          { l: 'All Movement', v: this.moves.length, u: 'last 7 days', tone: C, strong: true }] },
        { t: 'Budget', icon: 'account_balance_wallet', r: '/dashboard/budget-overview', cards: (() => { const within = live.length - over.length, pct = (n) => (live.length ? Math.round((n / live.length) * 100) : 0); return [
          { l: 'Total', v: live.length, u: 'open jobs', tone: B, strong: true },
          { l: 'Within Budget', v: pct(within) + '%', u: within + ' jobs', tone: G, strong: true },
          { l: 'Over Budget', v: pct(over.length) + '%', u: over.length + ' jobs', tone: M, strong: true }]; })() },
        { t: 'Feedback', icon: 'feedback', r: '/dashboard/closed-jobs-feedback', cards: [
          { l: 'Feedback Received', v: closed.filter((x) => surveyed.has(x.job_id)).length, u: 'closed jobs', tone: G },
          { l: 'Improvement', v: this.surveys.filter((s) => s.improvements).length, u: 'suggestions', tone: G },
          { l: 'Appreciation', v: this.appr.length, u: 'received', tone: G }] },
        { t: 'Daily Planner', icon: 'view_kanban', r: '/dashboard/workflow', cards: [
          { l: 'Stand-Up Jobs Today', v: flow.length, u: 'jobs', tone: M }, { l: 'Est. Time Today', v: hhmm(flow.reduce((a, r) => a + mins(r.time_will_take), 0)), u: 'hh:mm', tone: I },
          { l: 'Finishing Today', v: flow.filter((r) => r.expected_finish_date === CP.TODAY).length, u: 'jobs', tone: T }] },
        { t: 'Holidays', icon: 'event_available', r: '/calendar', cards: this.nextHolidays },
      ];
    },
    dow(iso) { return CP.fmt.weekday(iso).slice(0, 3); },
    go(route) { location.hash = '#' + route; }, D: CP.fmt.dmy,
  }));

  /* ------------------------------------------------------------------ Job Allocation ------------------------------------------------------------------ */
  /* Pick a job (name or number — they stay linked) and an associate, "+" adds it to the grid; the two buttons then
     save the rows as Stage 1 or allocate them. Prototype only: state lives in memory. */
  Alpine.data('allocationPage', () => ({
    loading: true, jobs: [], sel: { job_name: '', job_no: '', associate: '', financial_year: CP.TODAY.slice(0, 4), budget: '', deadline: '', comments: '' }, rows: [], error: '',
    async init() { this.jobs = (await CP.clientData('jobs')).filter((j) => !isClosed(j)); this.loading = false; },
    get associates() { return uniq(this.jobs, 'associate'); },
    get fyOptions() { const y = Number(CP.TODAY.slice(0, 4)); return Array.from({ length: y - 2021 }, (_, i) => String(2022 + i)); },
    /* Job Name and Job No are free-text boxes; a Job No that matches an open job fills in a blank name as a convenience */
    lookupNo() {
      const j = this.jobs.find((x) => String(x.job_id) === this.sel.job_no.trim());
      if (j && !this.sel.job_name.trim()) this.sel.job_name = j.job_name;
    },
    add() {
      this.error = '';
      const name = this.sel.job_name.trim(), no = this.sel.job_no.trim();
      if (!name || !no) { this.error = 'Enter the job name and job no, then click +.'; return; }                    // associate is optional
      if (this.rows.some((r) => String(r.job_id).toLowerCase() === no.toLowerCase())) { this.error = 'This job no is already in the grid.'; return; }
      this.rows.push({ job_id: no, job_name: name, associate: this.sel.associate, financial_year: this.sel.financial_year, budget: this.sel.budget, deadline: this.sel.deadline, comments: this.sel.comments.trim(), stage: 'Pending', pick: false });
      this.sel = { job_name: '', job_no: '', associate: '', financial_year: this.sel.financial_year, budget: '', deadline: '', comments: '' };
    },
    remove(i) { this.rows.splice(i, 1); },

    /* Each job can go its own way: Stage 1 straight away, or Allocate after the 3-question checklist.
       Allocating is only allowed once every answer is Yes; jobs that aren't ready can drop to Stage 1 instead. */
    questions: [
      { key: 'access', label: 'Access to accounting software given' },
      { key: 'docs', label: 'Documents loaded to sharedrive' },
      { key: 'notes', label: 'Client notes added', optional: true },   // not needed to allocate
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
    ready(r) { return this.questions.filter((q) => !q.optional).every((q) => this.alloc.answers[r.job_id][q.key]); },   // optional points (client notes) never block allocation
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
