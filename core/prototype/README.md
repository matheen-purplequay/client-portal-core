# Client Portal — HTML Prototype

Static mockup of the client-facing portal, styled to match the real dashboard. Built with **htmx + Alpine.js + Tailwind CSS** (all from CDN, no build step).

## Run

`fetch()` needs HTTP, so serve the folder (don't open files directly). A dependency-free Node server is included (works on Windows and Linux):

```bash
cd core/prototype
node server.js                        # http://localhost:8000
PORT=9000 node server.js              # custom port
```

With pm2:

```bash
pm2 start ecosystem.config.js         # port from PORT env var, or PORT in .env, default 8000
pm2 logs client-portal-prototype
```

To change the port for pm2, put `PORT=9000` in `core/prototype/.env`, then `pm2 delete client-portal-prototype && pm2 start ecosystem.config.js`.

## Demo logins

Use the two autofill buttons on the login page (password `Client@123`, OTP `123456`).

| Client | Email | Verticals |
|---|---|---|
| Northwind Advisory Pty Ltd | olivia.bennett@northwind.example | Business Services, SMSF, Bookkeeping |
| Harbourline Wealth Partners | daniel.reyes@harbourline.example | Financial Planning, Bookkeeping |

Both see the same screens (Movement, Job Status, Queries, Reports, …) with their own data.

## How it works

- **`app.html` is the master page** — header, sidebar and dashboard tab bar. Pages never reload.
- **Views are HTML fragments** in `views/`. A tiny hash router (`#/dashboard/job-status`) in `assets/js/core.js` loads them into `#content` with `htmx.ajax`, so deep links and refresh work on a static server.
- **Components** in `components/` are fragments pulled in with a custom `x-component="'name'"` directive (built on htmx `hx-get`). A component is written against the variables of the Alpine scope it is placed in (each file lists what it needs in its first comment), e.g. `pagination-status`, `pager`, `table-toolbar`, `legends`.
- **Alpine components** hold page state and logic in `assets/js/pages/` (`jobStatusPage`, `queriesPage`, `movementPage`, `content`). `CP.makeTable()` in `core.js` gives every table search, sort, paging and a column chooser.

## Structure

```
prototype/
├── index.html            redirects to login or app
├── app.html              MASTER PAGE (shell)
├── pages/auth/           login.html, otp.html (standalone, no shell)
├── views/
│   ├── dashboard/        movement, job-status, queries
│   ├── reports/          connect, weekly, invoices
│   └── content/          newsletters, knowledge-center, it-guidelines, team,
│                         calendar, faq, about, profile, contact
├── components/           legends, table-toolbar, pagination-status, pager
├── assets/
│   ├── js/               core.js (router, auth, table helper), pages/*.js
│   ├── css/app.css
│   └── img/cs_logo.png
└── data/
    ├── auth/             users.json, clients.json
    ├── clients/<id>/     jobs, movement, queries, reports, invoices, team, profile, notifications
    └── shared/           newsletters, knowledge-center, it-guidelines, faq, holidays, about
```

## Adding a page

1. Create `views/<group>/<name>.html` (root element with `x-data`).
2. Add a route to `ROUTES` in `assets/js/core.js` and a link in `app.html`.

## Notes

- Session is in `sessionStorage`; Logout clears it. Downloads, replies, instructions and contact form are simulated (state kept in memory, toast only).
- The prototype "today" is fixed at 24 Sep 2026 (`CP.TODAY`) so the mock data stays consistent.
- Yellow status tiles mean the job is with the client (Sent For Queries / Review / Final Review); green is completed; white is with Carisma.
- Not included: System/version page, chat, forgot-password flow. "Job Filters / Query Filters Coming Soon" are placeholders, as in the real portal.
