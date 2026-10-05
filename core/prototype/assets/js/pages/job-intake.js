/* Job Intake: firm-facing slice of Stage 1 (Intake & collection) from the ITR Workflow v8 prototype
   (renamed wiki/docs/job-intake-reference.html). Tracks document/checklist collection for a job before
   it is allocated to Carisma; once allocated it drops off this list (handoff to the real Jobs page is
   simulated, not wired into jobs.json). List is a table (table-toolbar/pagination-status, CP.makeTable),
   matching Jobs; clicking a job opens it as a folder tab (same open[]/active pattern as the Jobs page), with a
   two-column detail: documents + timeline on the left, job details/completeness/reminders on the right — its
   gap-resolution content mirrors the reference's per-step action screen (e.g. "Admin collects & adds files"),
   scoped to what the firm itself would see. */
document.addEventListener('alpine:init', () => {
  const W = { M: 3, E: 2, I: 1 };
  const THRESHOLD = 85, URGENT_AT = 90, MAX_REMINDERS = 5, REMINDER_EVERY_DAYS = 3;

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
  /* Why a document is on the list — fixed reasons for the common/base documents, profession-driven for the rest */
  const REASON = {
    prefill: 'Required for every return', pyitr: 'Required for every return', bank: 'Required for refund processing',
    incstmt: 'Shown in the ATO pre-fill', interest: 'Shown in the ATO pre-fill', dividends: 'Shown in the ATO pre-fill', phi: 'Shown in the ATO pre-fill',
  };
  const reasonFor = (key, professionLabel) => REASON[key] || `Usual for a ${professionLabel}`;
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
    return keys.map((k) => ({ key: k, doc: ITEMS[k][0], category: ITEMS[k][1], weight: ITEMS[k][2], reason: reasonFor(k, p[1]), status: 'missing', file: null }));
  };
  const byWeight = (its, w) => { const g = its.filter((c) => c.weight === w); return { rec: g.filter((c) => c.status === 'received').length, tot: g.length }; };
  /* `na` ("Doesn't apply") documents are excluded from both the numerator and denominator, same as the reference's metrics() */
  const scoreOf = (checklist) => {
    const its = checklist.filter((c) => c.status !== 'na');
    const tot = its.reduce((a, c) => a + W[c.weight], 0);
    const rec = its.filter((c) => c.status === 'received').reduce((a, c) => a + W[c.weight], 0);
    const pct = tot ? Math.round((100 * rec) / tot) : 0;
    const mMissing = its.filter((c) => c.weight === 'M' && c.status !== 'received');
    return {
      completion_pct: pct, mandatory_missing: mMissing.length, mMissing,
      counts: { M: byWeight(its, 'M'), E: byWeight(its, 'E'), I: byWeight(its, 'I') },
      ready: pct >= THRESHOLD && mMissing.length === 0, urgent: pct >= URGENT_AT && mMissing.length > 0,
    };
  };
  const deriveStatus = (job) => {
    if (job.status === 'queued') return 'queued'; // stays queued once sent, regardless of later checklist edits
    const s = scoreOf(job.checklist);
    return s.ready ? 'ready' : s.urgent ? 'urgent' : 'collecting';
  };
  const STATUS_META = {
    collecting: { label: 'Collecting documents', tone: 'amber' }, urgent: { label: 'Needs attention', tone: 'red' },
    queued: { label: 'In prioritisation queue', tone: 'blue' }, ready: { label: 'Ready to allocate', tone: 'green' },
  };
  const TONE_HEX = { amber: '#d97706', red: '#dc2626', blue: '#2563eb', green: '#16a34a' };
  const COLS = [
    { key: 'intake_id', label: 'ID' }, { key: 'client_name', label: 'Client', bold: true }, { key: 'job_title', label: 'Job', truncate: true },
    { key: 'profession_label', label: 'Profession' }, { key: 'status', label: 'Status' }, { key: 'completion_pct', label: 'Complete' },
    { key: 'mandatory_missing', label: 'Missing (M)' }, { key: 'created_on', label: 'Started', date: true }, { key: 'last_update', label: 'Updated', date: true },
    { key: 'priority', label: 'Queue #' },
  ];
  const JOB_TITLE = 'Individual Tax Return 2025-26';
  /* Synthetic Stage/Waiting-on/Step, borrowed from the reference's own model, derived from our 4-value status
     (we don't track per-job steps — this page only covers Stage 1, firm view) */
  const STEP_MAP = {
    collecting: { n: 8, label: 'Admin collects & adds files' }, urgent: { n: 8, label: 'Admin collects & adds files' },
    ready: { n: 11, label: 'Notify firm: file ready' }, queued: { n: 12, label: 'Prioritisation queue' },
  };
  const WAITING_MAP = { collecting: 'client', urgent: 'client', ready: 'firm', queued: 'firm' };
  const STAGE_OPTS = [{ value: '', label: 'All stages' }, { value: '1', label: 'Stage 1 — Intake & collection' }];
  const WAITING_OPTS = [{ value: '', label: 'Anyone' }, { value: 'client', label: 'Client' }, { value: 'firm', label: 'Firm (you)' }];
  const STEP_OPTS = [{ value: '', label: 'Any step' }, ...[...new Map(Object.values(STEP_MAP).map((s) => [s.n, s])).values()].sort((a, b) => a.n - b.n)
    .map((s) => ({ value: String(s.n), label: `Step ${String(s.n).padStart(2, '0')} · ${s.label}` }))];
  const addDays = (iso, n) => { const d = new Date(iso + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
  const slug = (s) => s.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '');

  Alpine.data('jobIntakePage', () => ({
    /* `status` = active KPI-tile filter; `open`/`active` = the job-detail folder tabs (same pattern as the Jobs page).
       Stage/Waiting on/Step are plain inline dropdowns (no Filters drawer on this page — see job-intake.js header note). */
    loading: true, jobs: [], status: '', open: [], active: 'list', showNew: false, newDoc: { name: '', weight: 'E' },
    stageFilter: '', waitingOnFilter: '', stepFilter: '', filterOpen: null, refreshing: false, tbl: null,
    stageOpts: STAGE_OPTS, waitingOpts: WAITING_OPTS, stepOpts: STEP_OPTS,
    professions: PROFESSIONS.map(([id, label]) => ({ id, label })), form: { name: '', profession: 'nurse', notes: '' }, cols: COLS, meta: STATUS_META,

    async init() {
      const raw = await CP.clientData('intake');
      this.jobs = raw.map((j) => {
        j.checklist.forEach((c) => { if (!c.reason) c.reason = reasonFor(c.key, j.profession_label); if (c.file === undefined) c.file = null; });
        return { ...j, job_title: JOB_TITLE, reminders_sent: j.reminders_sent || 0, ...scoreOf(j.checklist) };
      });
      this.tbl = CP.makeTable({ rows: () => this.rows, columns: COLS, size: 10, searchKeys: ['intake_id', 'client_name', 'profession_label', 'job_title'] });
      this.loading = false;
    },

    recompute(j) { Object.assign(j, scoreOf(j.checklist), { status: deriveStatus(j) }); },
    tone(j) { return this.meta[j.status].tone; },
    toneHex(j) { return TONE_HEX[this.tone(j)]; },
    label(s) { return this.meta[s].label; },
    cell(r, c) { const v = r[c.key]; return c.date ? CP.fmt.dmy(v) : (v === null || v === undefined || v === '' ? '—' : v); },
    readyMsg(j) {
      if (j.status === 'queued' || j.ready) return { text: 'Ready — threshold 85% met and all Mandatory in.', cls: 'text-green-700' };
      if (j.mMissing.length) return { text: j.mMissing.length + ' Mandatory missing — cannot move on' + (j.urgent ? ' (urgent).' : '.'), cls: 'text-red-600' };
      return { text: 'Needs 85% to move on.', cls: 'text-amber-600' };
    },
    waitingOn(j) { return WAITING_MAP[j.status]; },
    stepOf(j) { const s = STEP_MAP[j.status]; return `Step ${String(s.n).padStart(2, '0')} · ${s.label}`; },
    get stageLabel() { return this.stageOpts.find((o) => o.value === this.stageFilter).label; },
    get waitingLabel() { return this.waitingOpts.find((o) => o.value === this.waitingOnFilter).label; },
    get stepLabel() { return this.stepOpts.find((o) => o.value === this.stepFilter).label; },
    pick(field, value) { this[field] = value; this.filterOpen = null; this.tbl.reset(); },

    count(s) { return this.jobs.filter((j) => j.status === s).length; },
    get rows() {
      return this.jobs.filter((j) => (!this.status || j.status === this.status) && (!this.waitingOnFilter || this.waitingOn(j) === this.waitingOnFilter)
        && (!this.stepFilter || String(STEP_MAP[j.status].n) === this.stepFilter))
        .sort((a, b) => (a.priority || 99) - (b.priority || 99) || b.last_update.localeCompare(a.last_update));
    },
    get statusLabel() { return this.status ? this.label(this.status) : ''; },
    clearStatus() { this.status = ''; this.tbl.reset(); },
    setTile(s) { this.status = this.status === s ? '' : s; this.tbl.reset(); },
    refresh() { this.refreshing = true; setTimeout(() => (this.refreshing = false), 700); },

    /* ---------- job-detail folder tabs (open[]/active, same pattern as the Jobs page) ---------- */
    get job() { return this.jobs.find((j) => j.intake_id === this.active); },
    jobOf(id) { return this.jobs.find((j) => j.intake_id === id); },
    openJob(j, ev) {
      if (!this.open.includes(j.intake_id)) this.open.push(j.intake_id);
      if (!(ev && ev.shiftKey)) { this.active = j.intake_id; this.newDoc = { name: '', weight: 'E' }; } else CP.toast('Opened in background tab');
    },
    closeJob(id) { this.open = this.open.filter((x) => x !== id); if (this.active === id) this.active = 'list'; },
    /* Two-point timeline (we don't keep a full event history) — "Job started" then its current status */
    timeline(j) { return [{ status: 'Job started', on: j.created_on }, { status: this.label(j.status), on: j.last_update }]; },
    get stillNeeded() { return this.job ? this.job.checklist.filter((c) => c.status === 'missing') : []; },
    get received() { return this.job ? this.job.checklist.filter((c) => c.status === 'received') : []; },
    get notApplicable() { return this.job ? this.job.checklist.filter((c) => c.status === 'na') : []; },
    markReceived(j, c, uploaded) { c.status = 'received'; c.file = uploaded ? slug(c.doc) + '.pdf' : null; this.recompute(j); },
    markNA(j, c) { c.status = 'na'; c.file = null; this.recompute(j); },
    markMissing(j, c) { c.status = 'missing'; c.file = null; this.recompute(j); },
    addChecklistItem(j) {
      if (!this.newDoc.name.trim()) return;
      j.checklist.push({ key: 'custom-' + Date.now(), doc: this.newDoc.name.trim(), category: 'Other', weight: this.newDoc.weight, reason: 'Added by the firm', status: 'missing', file: null });
      this.recompute(j);
      this.newDoc = { name: '', weight: 'E' };
    },

    remind(j) {
      j.reminders_sent = Math.min((j.reminders_sent || 0) + 1, MAX_REMINDERS);
      j.last_update = CP.TODAY;
      CP.toast(`Reminder sent — ${j.client_name} is ${j.completion_pct}% complete.`);
    },
    nextReminder(j) { return j.reminders_sent >= MAX_REMINDERS ? '—' : CP.fmt.dmy(addDays(j.last_update, REMINDER_EVERY_DAYS)); },
    daysInStage(j) { return CP.daysBetween(j.created_on, CP.TODAY) + ' d'; },

    queueIt(j) { j.status = 'queued'; j.priority = this.jobs.filter((x) => x.status === 'queued').length; CP.toast('Moved to the prioritisation queue.'); },
    /* queue order = ascending `priority`; arrows in the table (queue filter only) swap a job with its neighbour */
    get queuedJobs() { return this.jobs.filter((x) => x.status === 'queued').sort((a, b) => a.priority - b.priority); },
    queueIndex(j) { return this.queuedJobs.indexOf(j); },
    move(j, dir) {
      const q = this.queuedJobs, i = q.indexOf(j), k = i + dir;
      if (i < 0 || k < 0 || k >= q.length) return;
      [q[i].priority, q[k].priority] = [q[k].priority, q[i].priority];
      this.tbl.sortKey = null; // show the queue order, not whichever column was sorted last
    },
    allocate(j) {
      this.jobs = this.jobs.filter((x) => x.intake_id !== j.intake_id);
      this.closeJob(j.intake_id);
      CP.toast(`${j.client_name}'s job allocated to Carisma — it will appear on the Jobs page (prototype: not wired to live data).`);
    },

    openNew() { this.form = { name: '', profession: 'nurse', notes: '' }; this.showNew = true; },
    createJob() {
      if (!this.form.name.trim()) return;
      const prof = this.professions.find((p) => p.id === this.form.profession);
      const job = {
        intake_id: 'NEW-' + Math.floor(Math.random() * 9000 + 1000), client_name: this.form.name.trim(), profession: prof.id, profession_label: prof.label,
        job_title: JOB_TITLE, created_on: CP.TODAY, last_update: CP.TODAY, priority: null, notes: this.form.notes.trim(), reminders_sent: 0,
        checklist: checklistFor(prof.id),
      };
      this.recompute(job);
      this.jobs.unshift(job);
      this.showNew = false;
      CP.toast('New job started — checklist created from the profession template.');
    },
  }));
});
