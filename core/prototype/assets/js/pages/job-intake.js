/* Job Intake: firm-facing slice of Stage 1 (Intake & collection) from the ITR Workflow v8 prototype.
   Tracks document/checklist collection for a job before it is allocated to Carisma; once allocated it
   drops off this list (the handoff to the real Jobs page is simulated, not wired into jobs.json).
   List is a table (table-toolbar/pagination-status components, CP.makeTable), matching Jobs/Queries;
   the checklist + actions for one job open in a side drawer. */
document.addEventListener('alpine:init', () => {
  const W = { M: 3, E: 2, I: 1 };
  const THRESHOLD = 85, URGENT_AT = 90;

  /* Document catalogue + profession → checklist mapping, adapted from the ITR Workflow v8 prototype */
  const ITEMS = {
    prefill: ['ATO Pre-fill report 2025-26', 'Firm inputs', 'M'], pyitr: ['Prior-year tax return & notice of assessment', 'Firm inputs', 'M'],
    incstmt: ['Income statement(s) from employer(s)', 'Income', 'M'], interest: ['Bank interest statements', 'Income', 'E'],
    dividends: ['Dividend statements', 'Income', 'E'], ess: ['Employee share scheme statement', 'Income', 'E'],
    shift: ['Shift allowance letter from employer', 'Income', 'I'], superinc: ['Super income stream statement', 'Income', 'M'],
    amit: ['Managed fund AMIT statements', 'Income', 'E'], cgt: ['Share sale / CGT records', 'Capital gains', 'M'],
    rental: ['Rental property annual statement (agent)', 'Rental property', 'M'], loanint: ['Investment loan interest statement', 'Rental property', 'M'],
    rates: ['Council & water rates', 'Rental property', 'E'], depn: ['Depreciation schedule', 'Rental property', 'E'],
    repairs: ['Repairs & maintenance receipts', 'Rental property', 'I'], bizinc: ['Business income records / invoices', 'Business', 'M'],
    bizbank: ['Business bank statements', 'Business', 'M'], mvlog: ['Motor vehicle logbook (12 weeks)', 'Business', 'M'],
    tools: ['Tools & equipment receipts', 'Business', 'E'], bizins: ['Business & public liability insurance', 'Business', 'E'],
    bas: ['BAS lodged for 2025-26', 'Business', 'E'], uber: ['Rideshare annual tax summary (Uber / DiDi)', 'Business', 'M'],
    abn: ['ABN & GST registration', 'Business', 'E'], carexp: ['Car running expenses (fuel, rego, service)', 'Business', 'E'],
    uniform: ['Uniform & laundry records', 'Deductions', 'E'], ahpra: ['AHPRA registration fee receipt', 'Deductions', 'E'],
    union: ['Union / professional association fees', 'Deductions', 'I'], wfh: ['Work-from-home hours log', 'Deductions', 'M'],
    phoneinet: ['Phone & internet bills with work-use %', 'Deductions', 'E'], equip: ['Equipment receipts (laptop, monitor)', 'Deductions', 'E'],
    subs: ['Professional subscriptions', 'Deductions', 'I'], supplies: ['Classroom supplies receipts', 'Deductions', 'E'],
    pd: ['Professional development / course fees', 'Deductions', 'I'], wwcc: ['Working with children check renewal', 'Deductions', 'I'],
    phi: ['Private health insurance tax statement', 'Offsets & levies', 'E'], bank: ['Refund bank account confirmation', 'Identity & contact', 'E'],
  };
  const COMMON = ['prefill', 'pyitr', 'incstmt', 'interest', 'phi', 'bank'];
  const PROFESSIONS = [
    ['nurse', 'Registered nurse', ['uniform', 'ahpra', 'union', 'shift']],
    ['swe', 'Software engineer (employee)', ['wfh', 'phoneinet', 'equip', 'subs', 'ess']],
    ['teacher', 'Primary / secondary teacher', ['supplies', 'wfh', 'pd', 'wwcc', 'union']],
    ['elec', 'Electrician (sole trader)', ['bizinc', 'bizbank', 'mvlog', 'tools', 'bizins', 'bas']],
    ['ride', 'Rideshare / delivery driver', ['uber', 'mvlog', 'abn', 'carexp', 'phoneinet']],
    ['retiree', 'Retiree with investments', ['superinc', 'dividends', 'amit', 'cgt']],
    ['investor', 'Property investor (employee)', ['rental', 'loanint', 'rates', 'depn', 'repairs']],
    ['retail', 'Retail or hospitality worker', ['uniform', 'union', 'shift']],
  ];
  const checklistFor = (profId) => {
    const p = PROFESSIONS.find((x) => x[0] === profId) || PROFESSIONS[0];
    const keys = [...new Set([...COMMON, ...p[2]])];
    return keys.map((k) => ({ key: k, doc: ITEMS[k][0], category: ITEMS[k][1], weight: ITEMS[k][2], status: 'missing' }));
  };
  const scoreOf = (checklist) => {
    const tot = checklist.reduce((a, c) => a + W[c.weight], 0);
    const rec = checklist.filter((c) => c.status === 'received').reduce((a, c) => a + W[c.weight], 0);
    const pct = tot ? Math.round((100 * rec) / tot) : 0;
    const mMissing = checklist.filter((c) => c.weight === 'M' && c.status !== 'received');
    return { completion_pct: pct, mandatory_missing: mMissing.length, mMissing, ready: pct >= THRESHOLD && mMissing.length === 0, urgent: pct >= URGENT_AT && mMissing.length > 0 };
  };
  const deriveStatus = (job) => {
    if (job.status === 'queued') return 'queued'; // stays queued once sent, regardless of later edits
    const s = scoreOf(job.checklist);
    return s.ready ? 'ready' : s.urgent ? 'urgent' : 'collecting';
  };
  const STATUS_META = {
    collecting: { label: 'Collecting documents', tone: 'amber' }, urgent: { label: 'Needs attention', tone: 'red' },
    queued: { label: 'In prioritisation queue', tone: 'blue' }, ready: { label: 'Ready to allocate', tone: 'green' },
  };
  const COLS = [
    { key: 'intake_id', label: 'ID' }, { key: 'client_name', label: 'Client', bold: true }, { key: 'profession_label', label: 'Profession' },
    { key: 'status', label: 'Status' }, { key: 'completion_pct', label: 'Complete' }, { key: 'mandatory_missing', label: 'Missing (M)' },
    { key: 'created_on', label: 'Started', date: true }, { key: 'last_update', label: 'Updated', date: true }, { key: 'priority', label: 'Queue #' },
  ];

  Alpine.data('jobIntakePage', () => ({
    /* `status` = active KPI-tile filter (table-toolbar reads/clears this); `view` = the job open in the checklist
       side-drawer; `drawer` = the Filters drawer (table-toolbar's "Filters" button), separate from `view`. */
    loading: true, jobs: [], status: '', view: null, showNew: false,
    filters: { profession_label: '' }, draft: null, drawer: false, refreshing: false, tbl: null,
    professions: PROFESSIONS.map(([id, label]) => ({ id, label })), form: { name: '', profession: 'nurse', notes: '' }, cols: COLS, meta: STATUS_META,

    async init() {
      const raw = await CP.clientData('intake');
      this.jobs = raw.map((j) => ({ ...j, ...scoreOf(j.checklist) }));
      this.tbl = CP.makeTable({ rows: () => this.rows, columns: COLS, size: 10, searchKeys: ['intake_id', 'client_name', 'profession_label'] });
      this.loading = false;
    },

    recompute(j) { Object.assign(j, scoreOf(j.checklist), { status: deriveStatus(j) }); },
    tone(j) { return this.meta[j.status].tone; },
    label(s) { return this.meta[s].label; },
    cell(r, c) { const v = r[c.key]; return c.date ? CP.fmt.dmy(v) : (v === null || v === undefined || v === '' ? '—' : v); },

    count(s) { return this.jobs.filter((j) => j.status === s).length; },
    get rows() {
      return this.jobs.filter((j) => (!this.status || j.status === this.status) && (!this.filters.profession_label || j.profession_label === this.filters.profession_label))
        .sort((a, b) => (a.priority || 99) - (b.priority || 99) || b.last_update.localeCompare(a.last_update));
    },
    get statusLabel() { return this.status ? this.label(this.status) : ''; },
    clearStatus() { this.status = ''; this.tbl.reset(); },
    setTile(s) { this.status = this.status === s ? '' : s; this.tbl.reset(); },
    refresh() { this.refreshing = true; setTimeout(() => (this.refreshing = false), 700); },

    /* ---------- Filters drawer (table-toolbar contract: chips, removeChip, openDrawer) ---------- */
    get professionOpts() { return [...new Set(this.jobs.map((j) => j.profession_label))].sort(); },
    get chips() { return this.filters.profession_label ? [{ key: 'profession_label', label: 'Profession', value: this.filters.profession_label }] : []; },
    removeChip(k) { this.filters[k] = ''; this.tbl.reset(); },
    openDrawer() { this.draft = { ...this.filters }; this.drawer = true; },
    clearDrawer() { this.draft = { profession_label: '' }; },
    applyDrawer() { this.filters = this.draft; this.drawer = false; this.tbl.reset(); },

    /* ---------- checklist side-drawer for one job ---------- */
    openJob(j) { this.view = j; },
    closeJob() { this.view = null; },
    toggleDoc(j, c) { c.status = c.status === 'received' ? 'missing' : 'received'; this.recompute(j); },
    remind(j) { CP.toast(`Reminder sent — ${j.client_name} is ${j.completion_pct}% complete.`); j.last_update = CP.TODAY; },
    queueIt(j) { j.status = 'queued'; j.priority = this.jobs.filter((x) => x.status === 'queued').length; CP.toast('Moved to the prioritisation queue.'); },
    allocate(j) {
      this.jobs = this.jobs.filter((x) => x.intake_id !== j.intake_id);
      this.closeJob();
      CP.toast(`${j.client_name}'s job allocated to Carisma — it will appear on the Jobs page (prototype: not wired to live data).`);
    },
    move(j, dir) {
      const q = this.jobs.filter((x) => x.status === 'queued').sort((a, b) => a.priority - b.priority);
      const i = q.indexOf(j), k = i + dir; if (k < 0 || k >= q.length) return;
      [q[i].priority, q[k].priority] = [q[k].priority, q[i].priority];
    },

    openNew() { this.form = { name: '', profession: 'nurse', notes: '' }; this.showNew = true; },
    createJob() {
      if (!this.form.name.trim()) return;
      const prof = this.professions.find((p) => p.id === this.form.profession);
      const job = {
        intake_id: 'NEW-' + Math.floor(Math.random() * 9000 + 1000), client_name: this.form.name.trim(), profession: prof.id, profession_label: prof.label,
        created_on: CP.TODAY, last_update: CP.TODAY, priority: null, notes: this.form.notes.trim(),
        checklist: checklistFor(prof.id),
      };
      this.recompute(job);
      this.jobs.unshift(job);
      this.showNew = false;
      CP.toast('New job started — checklist created from the profession template.');
    },
  }));
});
