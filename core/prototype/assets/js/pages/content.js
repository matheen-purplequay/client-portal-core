/* Content pages (newsletter, knowledge center, team, reports, …): load one JSON file and render it */
document.addEventListener('alpine:init', () => {
  Alpine.data('content', (kind, name) => ({
    data: null, cat: '', q: '', tab: '', topic: 'General', sent: false, fmt: CP.fmt,
    async init() { this.data = await (kind === 'client' ? CP.clientData(name) : CP.sharedData(name)); },
    get user() { return Alpine.store('app').user; },
    get client() { return Alpine.store('app').client; },
    initials(n) { return n.split(' ').map((w) => w[0]).join(''); },
    sum(list, status) { return list.filter((i) => i.status === status).reduce((a, i) => a + i.total, 0); },
    /* reports: simple search + paging */
    page: 1, size: 8,
    list(items) { const s = this.q.trim().toLowerCase(); return items.filter((i) => !s || JSON.stringify(i).toLowerCase().includes(s)); },
    pageItems(items) { return this.list(items).slice((this.page - 1) * this.size, this.page * this.size); },
    pages(items) { return Math.max(1, Math.ceil(this.list(items).length / this.size)); },
    send() { this.sent = true; CP.toast('Message sent (prototype)'); },
    tone(s) { return { Paid: 'bg-green-100 text-green-700', Due: 'bg-amber-100 text-amber-800', Overdue: 'bg-red-100 text-red-700', Australia: 'bg-blue-100 text-blue-800', India: 'bg-amber-100 text-amber-800', Both: 'bg-brand-light text-brand' }[s] || 'bg-slate-100'; },
  }));
});
