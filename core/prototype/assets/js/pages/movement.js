/* Movement page: touch points and completed DWP for a date range */
document.addEventListener('alpine:init', () => {
  Alpine.data('movementPage', () => ({
    loading: true, days: [], updatedAt: '', from: '2026-09-23', to: '2026-09-23', drawer: null, spin: false,

    async init() {
      const mv = await CP.clientData('movement');
      this.days = mv.days; this.updatedAt = mv.updated_at; this.loading = false;
    },

    get inRange() { return this.days.filter((d) => d.date >= this.from && d.date <= this.to); },
    get working() { return this.inRange.filter((d) => d.target > 0).length; },
    get tp() { const r = this.inRange; return { target: r.reduce((a, d) => a + d.target, 0), actual: r.reduce((a, d) => a + d.actual, 0), rows: r.flatMap((d) => d.touchpoints) }; },
    get dwp() { const r = this.inRange; return { target: r.reduce((a, d) => a + d.dwp_target, 0), actual: r.reduce((a, d) => a + d.dwp_actual, 0), rows: r.flatMap((d) => d.dwp) }; },
    get updated() { const t = this.updatedAt; return t ? `${t.slice(8, 10)}-${t.slice(5, 7)}-${t.slice(2, 4)} ${t.slice(11)} IST` : ''; },
    range() { return this.from === this.to ? CP.fmt.dmy(this.from) : `${CP.fmt.dmy(this.from)} to ${CP.fmt.dmy(this.to)}`; },
    refresh() { this.spin = true; setTimeout(() => (this.spin = false), 700); },
    show(title, rows) { if (rows.length) this.drawer = { title, rows }; },
    time(iso) { return CP.fmt.dt(iso); },
  }));
});
