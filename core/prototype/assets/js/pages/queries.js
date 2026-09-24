/* Queries page: KPI tiles → jobs with queries → query cards for a job */
document.addEventListener('alpine:init', () => {
  const COLS = [
    { key: 'job_id', label: 'Id' }, { key: 'job_name', label: 'Name' }, { key: 'group_job_name', label: 'Sub Client' },
    { key: 'vertical', label: 'Vertical' }, { key: 'financial_year', label: 'FY' }, { key: 'received_date', label: 'JY' },
    { key: 'last_at', label: 'Last Query' }, { key: 'total', label: 'Total Queries' }, { key: 'open', label: 'Open' }, { key: 'resolved', label: 'Resolved' },
  ];
  const STATUS_TILES = [['Open', 'border-amber-400'], ['Responded', 'border-blue-500'], ['Resolved', 'border-green-500'], ['Closed', 'border-emerald-700']];
  const AGING_TILES = [['0 - 5 days', 'border-amber-300', (e) => e <= 5], ['5 - 10 days', 'border-orange-400', (e) => e > 5 && e <= 10], ['> 10 days', 'border-red-500', (e) => e > 10]];
  const CRIT_TILES = [['Low', 'border-yellow-400'], ['Normal', 'border-cyan-400'], ['Medium', 'border-orange-400'], ['High', 'border-red-500']];

  Alpine.data('queriesPage', () => ({
    loading: true, jobs: [], queries: [], view: 'jobs', jobId: null, kf: null, qq: '', layout: 'card', dlOpen: false,
    exp: {}, replyOpen: {}, replyText: {}, tbl: null, cols: COLS, statusTiles: STATUS_TILES, agingTiles: AGING_TILES, critTiles: CRIT_TILES,

    async init() {
      [this.jobs, this.queries] = await Promise.all([CP.clientData('jobs'), CP.clientData('queries')]);
      this.tbl = CP.makeTable({ rows: () => this.jobRows, columns: COLS, size: 10, searchKeys: ['job_id', 'job_name', 'vertical', 'title_last'] });
      this.loading = false;
      /* deep link from a job's detail (#/dashboard/queries?job=<id>) lands straight on that job's queries, like the real portal's ?jobId= */
      const deep = /[?&]job=(\d+)/.exec(location.hash);
      if (deep && this.jobs.some((j) => j.job_id === +deep[1])) this.openJob(+deep[1]);
    },

    elapsed(q) { return CP.daysBetween(q.posted_on.slice(0, 10), CP.TODAY); },
    /* KPI tiles */
    countStatus(s) { return this.queries.filter((q) => q.status === s).length; },
    countAging(i) { return this.queries.filter((q) => this.agingTiles[i][2](this.elapsed(q))).length; },
    countCrit(c) { return this.queries.filter((q) => q.criticality === c).length; },
    setKf(type, value) { this.kf = this.kf && this.kf.type === type && this.kf.value === value ? null : { type, value }; if (this.tbl) this.tbl.reset(); },
    isKf(type, value) { return this.kf && this.kf.type === type && this.kf.value === value; },
    pass(q) {
      if (!this.kf) return true;
      if (this.kf.type === 'status') return q.status === this.kf.value;
      if (this.kf.type === 'crit') return q.criticality === this.kf.value;
      return this.agingTiles.find((a) => a[0] === this.kf.value)[2](this.elapsed(q));
    },

    /* job list */
    get jobRows() {
      const byJob = {};
      this.queries.filter((q) => this.pass(q)).forEach((q) => (byJob[q.job_id] ||= []).push(q));
      return Object.entries(byJob).map(([id, qs]) => {
        const j = this.jobs.find((x) => x.job_id === +id); if (!j) return null;
        const last = [...qs].sort((a, b) => b.posted_on.localeCompare(a.posted_on))[0];
        return { ...j, last, last_at: last.posted_on, title_last: last.id + ' ' + last.title, total: qs.length,
                 open: qs.filter((q) => q.status === 'Open').length, resolved: qs.filter((q) => q.status === 'Resolved').length };
      }).filter(Boolean);
    },
    get job() { return this.jobs.find((j) => j.job_id === this.jobId); },
    openJob(id) { this.jobId = id; this.view = 'job'; this.qq = ''; this.exp = {}; this.kf = null; },
    back() { this.view = 'jobs'; },

    /* query cards */
    get jobQueries() {
      const s = this.qq.trim().toLowerCase();
      return this.queries.filter((q) => q.job_id === this.jobId && this.pass(q) && (!s || (q.id + ' ' + q.title + ' ' + q.description).toLowerCase().includes(s)))
        .sort((a, b) => b.posted_on.localeCompare(a.posted_on));
    },
    get jobStats() { const qs = this.queries.filter((q) => q.job_id === this.jobId); return { total: qs.length, open: qs.filter((q) => q.status === 'Open').length, closed: qs.filter((q) => q.status === 'Closed').length }; },
    isOpen(q, i) { return q.id in this.exp ? this.exp[q.id] : i === 0; },
    toggle(q, i) { this.exp[q.id] = !this.isOpen(q, i); },
    sendReply(q) {
      const t = (this.replyText[q.id] || '').trim(); if (!t) return;
      q.thread.push({ side: 'client', name: Alpine.store('app').user.first_name + ' ' + Alpine.store('app').user.last_name, at: CP.TODAY + 'T11:00:00', text: t });
      if (q.status === 'Open') q.status = 'Responded';
      this.replyText[q.id] = ''; this.replyOpen[q.id] = false; CP.toast('Reply sent (prototype)');
    },
    dt: CP.fmt.dt, dm: CP.fmt.dm, dmy: CP.fmt.dmy,
  }));
});
