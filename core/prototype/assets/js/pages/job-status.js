/* Jobs page (mirrors the dev branch's /dashboard/job-status → dash-movement job tables):
   "Job Details" heading, Status / Manager view, legend filter, tinted status cards (zero-count cards hidden),
   the real procedure's column set (ending in one date column per status), filter chips + Filters drawer, job-detail tabs. */
document.addEventListener('alpine:init', () => {
  const D = (iso) => CP.fmt.dmy(iso);
  const p2 = (n) => String(n).padStart(2, '0');
  const iso = (d) => `${d.getUTCFullYear()}-${p2(d.getUTCMonth() + 1)}-${p2(d.getUTCDate())}`;
  const dayOf = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(Date.UTC(y, m - 1, d)); };
  const add = (s, n) => { const d = dayOf(s); d.setUTCDate(d.getUTCDate() + n); return iso(d); };

  /* ---- columns: the dashboard procedure's output — job facts, Workstatus, then one date per status ---- */
  const DATE_COLS = [
    ['YetToStartDate', 'Job-In Yet To Start'], ['WipProcessingDate', 'WIP - Processing'], ['SentForQueriesDate', 'Sent For Queries'], ['SentForFinalReviewDate', 'Sent For Final Review'],
    ['JobCompletedDate', 'Job Completed'], ['WipQueryRepliesDate', 'WIP - Query Replies'], ['WipReviewRepliesDate', 'WIP - Review Replies'], ['InternalReviewDate', 'Internal Review'],
    ['QueryRepliesReceivedYetToAttendDate', 'Query Replies Received - Yet To Attend'], ['WipInternalReviewRepliesDate', 'WIP - Internal Review Replies'], ['SentForReviewDate', 'Sent For Review'],
    ['ReviewRepliesReceivedYetToAttendDate', 'Review Replies Received - Yet To Attend'], ['OnHoldDate', 'On Hold'], ['CancelledDate', 'Cancelled'],
  ];
  const JOB_COLS = [
    { key: '#', label: '#' },
    { key: 'group_job_name', label: 'GroupJobName' },
    { key: 'job_name', label: 'Jobname', link: true },
    { key: 'nature_of_job', label: 'Naturejob' },
    { key: 'received_from', label: 'ReceivedFrom' },
    { key: 'partner', label: 'Partner' },
    { key: 'director', label: 'Director' },
    { key: 'associate', label: 'AssociateName' },
    { key: 'financial_year', label: 'FinancialYear' },
    { key: 'received_date', label: 'ReceivedDate', date: true },
    { key: 'commenced_date', label: 'CommencedDate', date: true },
    { key: 'work_status', label: 'Workstatus' },
    ...DATE_COLS.map(([label, status]) => ({ key: label, label, dateOf: status })),
  ];
  /* SMSF timeline statuses feed the same date columns through the generic Wsid bucket each one maps to (tbl_smsfjobstatus.Wsid) */
  const SMSF_TO_GENERIC = { 'Not Yet Taken': 'Job-In Yet To Start', 'In Progress Initial': 'WIP - Processing', 'In Progress Final': 'WIP - Processing', 'Awaiting Queries - Initial': 'Sent For Queries',
    'Awaiting Queries Final': 'Sent For Queries', 'Workpapers Completed Initial': 'Sent For Final Review', 'Workpapers Completed Final': 'Sent For Final Review', 'Workpapers Changes Required': 'WIP - Query Replies', 'Moved to Audit': 'Job Completed' };

  /* ---- status cards per vertical. tone: 'y' = with the client (yellow), 'g' = completed (green), '' = with Carisma ---- */
  const tile = (key, label, tone = '', members) => ({ key, label, tone, members: members || [key] });
  const BS_TILES = [
    tile('Job-In Yet To Start', 'Job In Yet To Start'), tile('WIP - Processing', 'WIP Processing'), tile('Sent For Queries', 'Sent For Queries', 'y'),
    tile('Query Replies Received - Yet To Attend', 'Query Replies Rcvd. Yet To Attend'), tile('WIP - Query Replies', 'WIP Query Replies'), tile('Internal Review', 'Internal Review'),
    tile('WIP - Internal Review Replies', 'WIP Internal Review Replies'), tile('Sent For Review', 'Sent For Review', 'y'), tile('Review Replies Received - Yet To Attend', 'Review Replies Rcvd. Yet To Attend'),
    tile('WIP - Review Replies', 'WIP Review Replies'), tile('Sent For Final Review', 'Sent For Final Review', 'y'), tile('Job Completed', 'Job Completed', 'g'), tile('On Hold', 'On Hold', 'y'), tile('Cancelled', 'Cancelled'),
  ];
  const simple = (queryReply) => [
    tile('Job-In Yet To Start', 'Job In Yet To Start'), tile('WIP - Processing', 'WIP Processing'), tile('Sent For Queries', 'Query Sent', 'y'), tile('WIP - Query Replies', queryReply),
    tile('Sent For Review', 'Sent For Review', 'y'), tile('Internal Review', 'Review notes received'), tile('Sent For Final Review', 'Review notes attended', 'y'), tile('Job Completed', 'Job Completed', 'g'),
  ];
  /* SMSF: tbl_smsfjobstatus names combined as on the real page (2+4, 3+5, 6+7); "Not Yet Taken" has no card */
  const SMSF_TILES = [
    tile('In Progress', 'In Progress', '', ['In Progress Initial', 'In Progress Final']), tile('Awaiting Queries', 'Awaiting Queries', 'y', ['Awaiting Queries - Initial', 'Awaiting Queries Final']),
    tile('Workpapers Completed', 'Workpapers Completed', '', ['Workpapers Completed Initial', 'Workpapers Completed Final']), tile('Workpapers Changes Required', 'Workpapers Changes Required', 'y'), tile('Moved to Audit', 'Moved to Audit', 'g'),
  ];
  const statusOf = (j) => j.smsf_status || j.work_status;
  const isDone = (j) => j.work_status === 'Job Completed' || j.work_status === 'Cancelled';      // Live Jobs = everything else

  /* status card colours = the Legends pill colours (yellow client, green completed, blue Carisma) */
  const COLOR = { y: { bg: 'bg-yellow-50', accent: 'bg-yellow-400', text: 'text-yellow-800' }, g: { bg: 'bg-green-50', accent: 'bg-green-500', text: 'text-green-700' }, '': { bg: 'bg-blue-50', accent: 'bg-blue-400', text: 'text-blue-800' } };

  /* filter-drawer period options → [from, to] relative to the prototype's "today" */
  const PERIODS = [['today', 'Today'], ['yesterday', 'Yesterday'], ['currentWeek', 'Current Week'], ['lastWeek', 'Last Week'], ['currentMonth', 'Current Month'], ['lastMonth', 'Last Month'],
    ['currentQuarter', 'Current Quarter'], ['lastQuarter', 'Last Quarter'], ['currentFinancialYear', 'Current Financial Year'], ['lastFinancialYear', 'Last Financial Year']];
  const range = (key) => {
    const t = dayOf(CP.TODAY), y = t.getUTCFullYear(), m = t.getUTCMonth(), dow = (t.getUTCDay() + 6) % 7, q = Math.floor(m / 3), fyStart = m >= 6 ? y : y - 1;
    const d = (yy, mm, dd) => iso(new Date(Date.UTC(yy, mm, dd)));
    return {
      today: [CP.TODAY, CP.TODAY], yesterday: [add(CP.TODAY, -1), add(CP.TODAY, -1)], currentWeek: [add(CP.TODAY, -dow), add(CP.TODAY, 6 - dow)], lastWeek: [add(CP.TODAY, -dow - 7), add(CP.TODAY, -dow - 1)],
      currentMonth: [d(y, m, 1), d(y, m + 1, 0)], lastMonth: [d(y, m - 1, 1), d(y, m, 0)], currentQuarter: [d(y, q * 3, 1), d(y, q * 3 + 3, 0)], lastQuarter: [d(y, q * 3 - 3, 1), d(y, q * 3, 0)],
      currentFinancialYear: [d(fyStart, 6, 1), d(fyStart + 1, 5, 30)], lastFinancialYear: [d(fyStart - 1, 6, 1), d(fyStart, 5, 30)],
    }[key];
  };
  const inRange = (date, key) => { if (!key) return true; const [a, b] = range(key); return !!date && date >= a && date <= b; };
  const FILTER_DEFAULTS = () => ({ financial_year: String(dayOf(CP.TODAY).getUTCFullYear()), nature_of_job: 'All', received_from: 'All', accountant: 'All', received_range: '', commenced_range: '' });

  Alpine.data('jobStatusPage', () => ({
    loading: true, jobs: [], vertical: '', mode: 'live', status: 'live', legend: null, viewMode: 'status', isManager: true,
    open: [], active: 'list', instr: {}, newInstr: '', refreshing: false,
    filters: FILTER_DEFAULTS(), draft: null, drawer: false, periods: PERIODS,
    tbl: null, appr: [], surveys: [], queries: [], feedbackOpen: false,

    async init() {
      [this.jobs, this.appr, this.surveys, this.queries] = await Promise.all([CP.clientData('jobs'), CP.clientData('appreciation'), CP.clientData('surveys'), CP.clientData('queries')]);
      this.vertical = $store_client().verticals[0].title;
      this.tbl = CP.makeTable({ rows: () => this.rows, columns: JOB_COLS, size: 10,
        searchKeys: ['job_name', 'group_job_name', 'partner', 'director', 'received_from', 'work_status', 'smsf_status', 'job_id', 'nature_of_job'] });
      this.loading = false;
    },

    /* ---------- vertical, filters, cards ---------- */
    get verticals() { return $store_client().verticals; },
    get vJobs() { return this.jobs.filter((j) => j.vertical === this.vertical); },
    get isSmsf() { return this.vertical === 'SMSF'; },
    get allTiles() { const c = (this.verticals.find((v) => v.title === this.vertical) || {}).code; return c === 'SMSF' ? SMSF_TILES : c === 'BS' ? BS_TILES : simple(c === 'FP' ? 'Response Received' : 'Query Response Received'); },
    passesFilters(j) {
      const f = this.filters;
      return (f.financial_year === 'All' || String(j.financial_year) === f.financial_year) && (f.nature_of_job === 'All' || j.nature_of_job === f.nature_of_job) &&
        (f.received_from === 'All' || j.received_from === f.received_from) && (f.accountant === 'All' || j.associate === f.accountant) &&
        inRange(j.received_date, f.received_range) && inRange(j.commenced_date, f.commenced_range);
    },
    get baseJobs() { return this.vJobs.filter((j) => this.passesFilters(j)); },                // counts follow the filters (not the status)
    count(t) { return this.baseJobs.filter((j) => t.members.includes(statusOf(j))).length; },
    get tiles() { return this.allTiles.filter((t) => this.legend === null || (this.legend === 'client' ? t.tone === 'y' : t.tone === '')); },
    get shownTiles() { return this.tiles.filter((t) => this.count(t) > 0); },                   // hideIfNoValue
    get liveCount() { return this.allTiles.filter((t) => t.tone !== 'g' && t.key !== 'Cancelled').reduce((a, t) => a + this.count(t), 0); },
    get allCount() { return this.allTiles.reduce((a, t) => a + this.count(t), 0); },
    color(t) { return COLOR[t.tone]; },
    setLegend(l) { this.legend = l; this.tbl.reset(); },
    statusOf,

    /* ---------- rows ---------- */
    get rows() {
      const tiles = this.allTiles, legendKeys = this.legend === null ? null : new Set(this.tiles.flatMap((t) => t.members));
      return this.baseJobs.filter((j) => {
        if (legendKeys && !legendKeys.has(statusOf(j))) return false;
        if (this.status === 'all') return true;
        if (this.status === 'live') return !isDone(j);
        return (tiles.find((t) => t.key === this.status) || { members: [] }).members.includes(statusOf(j));
      });
    },
    get statusLabel() { return this.status === 'live' ? 'Live Jobs' : this.status === 'all' ? 'All Jobs' : (this.allTiles.find((t) => t.key === this.status) || {}).label || this.status; },
    setStatus(s) { this.status = s; this.tbl.reset(); },
    clearStatus() { this.status = 'live'; this.tbl.reset(); },
    setVertical(v) { this.vertical = v; this.status = 'live'; this.legend = null; this.filters = { ...FILTER_DEFAULTS(), financial_year: this.filters.financial_year }; this.tbl.reset(); this.open = []; this.active = 'list'; this.viewMode = 'status'; },
    refresh() { this.refreshing = true; setTimeout(() => (this.refreshing = false), 700); },
    statusDate(j, status) {
      const hit = j.timeline.find((t) => (j.smsf_status ? SMSF_TO_GENERIC[t.status] : t.status) === status);
      return hit ? D(hit.on) : '';
    },
    cell(row, col) {
      if (col.dateOf) return this.statusDate(row, col.dateOf);
      const v = col.key === 'work_status' ? statusOf(row) : row[col.key];
      return col.date ? D(v) : (v === '-' ? '' : v);
    },

    /* ---------- Manager view: work status x partner grid; a cell drills back into the list ---------- */
    get partners() { return [...new Set(this.baseJobs.map((j) => j.received_from))].sort(); },
    get gridRows() { return this.allTiles.map((t) => { const counts = Object.fromEntries(this.partners.map((p) => [p, this.baseJobs.filter((j) => j.received_from === p && t.members.includes(statusOf(j))).length])); return { t, counts, total: Object.values(counts).reduce((a, b) => a + b, 0) }; }); },
    partnerTotal(p) { return this.gridRows.reduce((a, r) => a + r.counts[p], 0); },
    cellClick(p, t) { this.filters.received_from = p; this.status = t.key; this.viewMode = 'status'; this.tbl.reset(); },

    /* ---------- filter chips + drawer ---------- */
    get chips() {
      const f = this.filters, label = (k) => (PERIODS.find((x) => x[0] === k) || [])[1] || '', out = [];
      if (f.financial_year !== 'All') out.push({ key: 'financial_year', label: 'FY', value: f.financial_year });
      if (f.received_from !== 'All') out.push({ key: 'received_from', label: 'From', value: f.received_from });
      if (f.accountant !== 'All') out.push({ key: 'accountant', label: 'Accountant', value: f.accountant });
      if (f.nature_of_job !== 'All') out.push({ key: 'nature_of_job', label: 'Nature', value: f.nature_of_job });
      if (f.received_range) out.push({ key: 'received_range', label: 'Received', value: label(f.received_range) });
      if (f.commenced_range) out.push({ key: 'commenced_range', label: 'Commenced', value: label(f.commenced_range) });
      return out;
    },
    removeChip(k) { this.filters[k] = ['received_range', 'commenced_range'].includes(k) ? '' : 'All'; this.tbl.reset(); },
    get fyOptions() { const y = dayOf(CP.TODAY).getUTCFullYear(); return ['All', ...Array.from({ length: y - 2021 }, (_, i) => String(2022 + i))]; },
    opts(k) { return ['All', ...[...new Set(this.vJobs.map((j) => j[k]).filter(Boolean))].sort()]; },
    openDrawer() { this.draft = { ...this.filters, status: this.status }; this.drawer = true; },
    applyDrawer() { const { status, ...f } = this.draft; this.filters = f; this.status = status; this.drawer = false; this.tbl.reset(); },
    clearDrawer() { this.draft = { ...FILTER_DEFAULTS(), financial_year: 'All', status: 'live' }; },

    /* ---------- job tabs + detail ---------- */
    get job() { return this.jobs.find((j) => j.job_id === this.active); },
    openJob(j, ev) {
      if (!this.open.includes(j.job_id)) this.open.push(j.job_id);
      if (!(ev && ev.shiftKey)) { this.active = j.job_id; this.newInstr = ''; } else CP.toast('Opened in background tab');
    },
    closeJob(id) { this.open = this.open.filter((x) => x !== id); if (this.active === id) this.active = 'list'; },
    jobOf(id) { return this.jobs.find((j) => j.job_id === id); },
    gap(i) { const t = this.job.timeline; return i <= 0 || !t[i] ? 0 : CP.daysBetween(t[i - 1].on, t[i].on); },
    sendInstr() {
      if (!this.newInstr.trim()) return;
      (this.instr[this.active] ||= []).push({ text: this.newInstr.trim(), at: CP.TODAY + 'T10:15:00' });
      this.newInstr = '';
    },
    hm(h) { const neg = h < 0, a = Math.abs(h), m = Math.round((a % 1) * 60); return (neg ? '-' : '') + String(Math.floor(a) + (m === 60 ? 1 : 0)).padStart(2, '0') + ':' + String(m === 60 ? 0 : m).padStart(2, '0'); },
    get stepTimes() {   // time taken per timeline step: the job's booked hours spread over its steps (mock)
      const j = this.job, n = j.timeline.length, last = n > 1 ? n - 1 : -1;   // the current step has no time booked yet
      const w = j.timeline.map((_, i) => (i === last ? 0 : ((j.job_id + i * 7) % 5) + 1)), t = w.reduce((a, b) => a + b, 0) || 1;
      return w.map((x) => (j.actual_hours * x) / t);
    },
    get jobQueryCount() { return this.queries.filter((q) => q.job_id === this.active).length; },
    get jobAppreciation() { return this.appr.filter((a) => a.job_id === this.active); },
    get jobSurvey() { return this.surveys.find((s) => s.job_id === this.active); },
    openQueries() { location.hash = '#/dashboard/queries?job=' + this.active; },
    pct(j) { return Math.min(100, Math.round((j.actual_hours / j.budget_hours) * 100)); },
    D,
  }));

  const $store_client = () => Alpine.store('app').client;
});
