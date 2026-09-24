/* Core: data access, formatting, auth, hash router, Alpine store + helpers.
   Load order (app.html): htmx → core.js → pages/*.js → Alpine (defer). */
const CP = (() => {
  const ROOT = new URL('../../', document.currentScript.src).href;
  const TODAY = '2026-09-24';
  const SKEY = 'cp_session', PKEY = 'cp_pending';
  const url = (p) => ROOT + p;
  const read = (k) => JSON.parse(sessionStorage.getItem(k) || 'null');
  const session = () => read(SKEY);

  const json = async (p) => {
    const r = await fetch(url('data/' + p));
    if (!r.ok) throw new Error('Failed to load ' + p);
    return r.json();
  };
  const clientData = (name) => json(`clients/${session().client_id}/${name}.json`);
  const sharedData = (name) => json(`shared/${name}.json`);

  /* ---------- formatting (ISO strings parsed manually to avoid timezone drift) ---------- */
  const p2 = (n) => String(n).padStart(2, '0');
  const parts = (iso) => { const m = /(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/.exec(iso || ''); return m ? m.slice(1).map((x) => (x === undefined ? null : +x)) : null; };
  const fmt = {
    dmy: (iso) => { const t = parts(iso); return t ? `${p2(t[2])}-${p2(t[1])}-${t[0]}` : '—'; },
    dm: (iso) => { const t = parts(iso); return t ? `${t[2]}-${t[1]}-${t[0]}` : '—'; },
    dt: (iso) => { const t = parts(iso); if (!t) return '—'; const h = t[3] % 12 || 12; return `${t[2]}-${t[1]}-${t[0]} ${p2(h)}:${p2(t[4])} ${t[3] >= 12 ? 'PM' : 'AM'}`; },
    long: (iso) => { const t = parts(iso); return new Date(t[0], t[1] - 1, t[2]).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }); },
    weekday: (iso) => { const t = parts(iso); return new Date(t[0], t[1] - 1, t[2]).toLocaleDateString('en-US', { weekday: 'long' }); },
    money: (n, c = 'AUD') => new Intl.NumberFormat('en-AU', { style: 'currency', currency: c }).format(n),
  };
  const daysBetween = (a, b) => Math.round((Date.UTC(...[parts(b)[0], parts(b)[1] - 1, parts(b)[2]]) - Date.UTC(...[parts(a)[0], parts(a)[1] - 1, parts(a)[2]])) / 864e5);

  /* ---------- auth ---------- */
  async function login(email, password) {
    const { users, otp } = await json('auth/users.json');
    const user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password);
    if (!user) return { ok: false, message: 'Invalid email or password.' };
    sessionStorage.setItem(PKEY, JSON.stringify({ user, otp }));
    return { ok: true };
  }
  async function verifyOtp(code) {
    const p = read(PKEY);
    if (!p) return { ok: false, message: 'Session expired. Please log in again.' };
    if (code.trim() !== p.otp) return { ok: false, message: 'Incorrect passcode. Please try again.' };
    const client = (await json('auth/clients.json')).find((c) => c.id === p.user.client_id);
    sessionStorage.setItem(SKEY, JSON.stringify({ ...p.user, client }));
    sessionStorage.removeItem(PKEY);
    return { ok: true };
  }
  const logout = () => { sessionStorage.clear(); location.href = url('pages/auth/login.html'); };

  /* ---------- routes: one master page (app.html), each view is an HTML fragment swapped in by htmx ---------- */
  const ROUTES = {
    '/dashboard/movement': { view: 'views/dashboard/movement.html', group: 'dashboard', title: 'Movement' },
    '/dashboard/job-status': { view: 'views/dashboard/job-status.html', group: 'dashboard', title: 'Job Status' },
    '/dashboard/queries': { view: 'views/dashboard/queries.html', group: 'dashboard', title: 'Queries' },
    '/reports/connect': { view: 'views/reports/connect.html', group: 'reports', title: 'Reports' },
    '/reports/weekly': { view: 'views/reports/weekly.html', group: 'reports', title: 'Reports' },
    '/reports/invoices': { view: 'views/reports/invoices.html', group: 'reports', title: 'Reports' },
    '/newsletters': { view: 'views/content/newsletters.html', group: 'content', title: 'Newsletter' },
    '/knowledge-center': { view: 'views/content/knowledge-center.html', group: 'content', title: 'Knowledge Center' },
    '/it-guidelines': { view: 'views/content/it-guidelines.html', group: 'content', title: 'IT Guidelines' },
    '/team': { view: 'views/content/team.html', group: 'content', title: 'Team' },
    '/calendar': { view: 'views/content/calendar.html', group: 'content', title: 'Calendar' },
    '/about': { view: 'views/content/about.html', group: 'content', title: 'About Carisma' },
    '/faq': { view: 'views/content/faq.html', group: 'content', title: 'FAQ' },
    '/contact': { view: 'views/content/contact.html', group: 'content', title: 'Contact Us' },
    '/profile': { view: 'views/content/profile.html', group: 'content', title: 'My Profile' },
  };
  const DEFAULT = '/dashboard/movement';

  function route() {
    const path = (location.hash.slice(1) || DEFAULT).split('?')[0];
    const r = ROUTES[path] || ROUTES[DEFAULT];
    const app = Alpine.store('app');
    app.route = ROUTES[path] ? path : DEFAULT; app.group = r.group;
    document.title = `${r.title} · Client Portal`;
    htmx.ajax('GET', url(r.view), { target: '#content', swap: 'innerHTML' });
  }

  /* ---------- reusable table state (search, sort, paging, column chooser) ---------- */
  function makeTable({ rows, columns, size = 10, searchKeys }) {
    return {
      columns, size, page: 1, q: '', sortKey: null, dir: 1, colsOpen: false,
      visible: Object.fromEntries(columns.map((c) => [c.key, true])),
      get cols() { return this.columns.filter((c) => this.visible[c.key]); },
      get selectedCount() { return this.cols.length; },
      get filtered() {
        const keys = searchKeys || this.columns.map((c) => c.key);
        const q = this.q.trim().toLowerCase();
        let r = rows();
        if (q) r = r.filter((x) => keys.some((k) => String(x[k] ?? '').toLowerCase().includes(q)));
        if (this.sortKey) r = [...r].sort((a, b) => (a[this.sortKey] > b[this.sortKey] ? 1 : a[this.sortKey] < b[this.sortKey] ? -1 : 0) * this.dir);
        return r;
      },
      get total() { return this.filtered.length; },
      get pages() { return Math.max(1, Math.ceil(this.total / this.size)); },
      get cur() { return Math.min(this.page, this.pages); },
      get slice() { const s = (this.cur - 1) * this.size; return this.filtered.slice(s, s + this.size); },
      get from() { return this.total ? (this.cur - 1) * this.size + 1 : 0; },
      get to() { return Math.min(this.cur * this.size, this.total); },
      get pageList() { const c = this.cur, n = this.pages, s = Math.max(1, Math.min(c - 3, n - 6)); return Array.from({ length: Math.min(7, n) }, (_, i) => s + i); },
      go(p) { this.page = Math.min(Math.max(1, p), this.pages); },
      setSize(n) { this.size = n; this.page = 1; },
      sortBy(k) { this.dir = this.sortKey === k ? -this.dir : 1; this.sortKey = k; },
      reset() { this.page = 1; },
    };
  }

  function toast(msg) {
    const t = document.createElement('div');
    t.className = 'fixed bottom-6 right-6 z-[100] rounded-lg bg-slate-900 px-4 py-2 text-sm text-white shadow-lg fade-in';
    t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), 2200);
  }
  const download = (name) => toast(`Prototype only — "${name}" would download here.`);

  /* ---------- Alpine wiring ---------- */
  document.addEventListener('alpine:init', () => {
    const s = session();
    Alpine.store('app', {
      user: s, client: s && s.client, route: '', group: '', today: TODAY,
      isActive(prefix) { return this.route.startsWith(prefix); },
    });

    /* x-component="'name'" → pulls components/name.html in through htmx and swaps it in place.
       The fragment inherits the surrounding Alpine scope, so it is written against that scope's variables. */
    Alpine.directive('component', (el, { expression }, { evaluate }) => {
      el.setAttribute('hx-get', url(`components/${evaluate(expression)}.html`));
      el.setAttribute('hx-trigger', 'load');
      el.setAttribute('hx-swap', 'outerHTML');
      htmx.process(el);
    });

    Alpine.data('shell', () => ({
      bell: false, menu: false, notifications: [],
      async init() { this.notifications = await clientData('notifications').catch(() => []); },
      logout,
    }));
  });
  document.addEventListener('alpine:initialized', () => { if (document.getElementById('content')) route(); });
  window.addEventListener('hashchange', () => { if (window.Alpine && Alpine.store('app')) route(); });

  return { ROOT, TODAY, url, session, json, clientData, sharedData, fmt, daysBetween, login, verifyOtp, logout, makeTable, toast, download };
})();
