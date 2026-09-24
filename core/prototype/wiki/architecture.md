# Architecture — prototype

## Overview

A static, dependency-free mockup of the client portal. Every page is plain HTML; interactivity comes from **htmx** (loading HTML fragments) and **Alpine.js** (state/behaviour), styled with **Tailwind CSS via the Play CDN**. Data is read from JSON files with `fetch()`, so it must be served over HTTP (not opened via `file://`).

| Concern | Choice |
|---|---|
| Fragments / navigation | htmx 2.0.4 (unpkg CDN) |
| State & behaviour | Alpine.js 3.14.8 (jsDelivr CDN, `defer`) |
| Styling | Tailwind CDN + forms plugin; config in `assets/js/tailwind-config.js`; extra CSS in `assets/css/app.css` |
| Fonts / icons | Source Sans 3 (same as the real portal), EB Garamond (login banner title), Material Symbols Outlined (class `.msym`) |
| Data | JSON in `data/` |
| Server | `server.js` (Node, no deps) — run directly or via pm2 |

All CDN assets need internet access; the prototype does not work fully offline.

## Folder structure

```
prototype/
├── index.html            redirect: login or app.html depending on session
├── app.html              MASTER PAGE (header, sidebar, dashboard tab bar, #content)
├── pages/auth/           login.html, otp.html — standalone, no shell
├── views/
│   ├── dashboard/        movement, job-status, queries
│   ├── reports/          connect, weekly, invoices
│   └── content/          newsletters, knowledge-center, it-guidelines, team, calendar, faq, about, profile, contact
├── components/           htmx fragments: legends, table-toolbar, pagination-status, pager, auth-hero
├── assets/
│   ├── js/               core.js, tailwind-config.js, pages/{movement,job-status,queries,content}.js
│   ├── css/app.css
│   └── img/              cs_logo.png, login-banner.jpg
├── data/                 mock JSON (see data.md)
├── server.js             static file server
├── ecosystem.config.js   pm2 config
├── README.md             quick start
└── wiki/                 this knowledge base
```

## Master page + router

`app.html` is loaded once after login. It contains the header (logo, date, bell, user), the sidebar, the dashboard pill-tab bar (visible only for `/dashboard/*` routes) and an empty `<main id="content">`.

- **Routes** are declared in the `ROUTES` object in `assets/js/core.js` (path → view file, group, title). Hash based: `app.html#/dashboard/job-status`.
- On load and on `hashchange`, `route()` sets `Alpine.store('app').route/group` and calls `htmx.ajax('GET', <view>, { target: '#content' })`. Hash routing means deep links and refresh work on any static server.
- Sidebar/tab active state is driven by `$store.app.route` (`isActive(prefix)`), not by htmx.
- The default route is `/dashboard/movement`.

## Components

Two kinds:

1. **HTML fragments** in `components/`, included with the custom Alpine directive `x-component="'name'"` (defined in `core.js`). It sets `hx-get`, `hx-trigger="load"`, `hx-swap="outerHTML"` on the element and calls `htmx.process(el)` (needed because Alpine-created nodes are not auto-processed by htmx). The swapped-in fragment **inherits the surrounding Alpine scope**, so each fragment is written against the variables of the page it sits in; the required variables are listed in a comment at the top of each fragment.
   - `legends` — client-vs-Carisma legend chips (uses `$store.app.client`)
   - `table-toolbar` — column chooser, selected-status chip, filters, refresh, download, search (needs `tbl`, `statusLabel`, `clearStatus()`, `filters`, `filterOpts`, `filtersOpen`, `refresh()`, `refreshing`)
   - `pagination-status` — page-size pills, "Showing x–y of n", bookmark, first/prev/next/last (needs `tbl`)
   - `pager` — numbered pager used on Queries (needs `tbl`)
   - `auth-hero` — right-hand banner card on login/OTP (loaded with plain `hx-get`, no Alpine)
2. **Alpine components** (`Alpine.data`) in `assets/js/pages/` hold page state/logic: `jobStatusPage`, `queriesPage`, `movementPage`, `content(kind, name)`.

`CP.makeTable({ rows, columns, size, searchKeys })` (in `core.js`) is the shared table state: search, sort, paging, column visibility. Pages create it in `init()` with `rows: () => this.<getter>`; templates read `tbl.slice`, `tbl.cols`, `tbl.from/to/total`, etc.

## Script load order (`app.html`)

`htmx` → `core.js` (defines global `CP`, registers `alpine:init` handlers) → `pages/*.js` (register `Alpine.data`) → Alpine (`defer`, starts last). `Alpine.data` must be registered before Alpine starts, which is why page scripts are loaded up-front instead of inside fragments.

`core.js` registers on `alpine:init`: the `app` store (`user`, `client`, `route`, `group`, `today`), the `x-component` directive, and the `shell` component (bell, logout). On `alpine:initialized` it runs the first `route()`.

## Auth flow (mock)

1. `pages/auth/login.html` — email + password validated against `data/auth/users.json` via `CP.login()`; result stored as `cp_pending` in `sessionStorage`.
2. `pages/auth/otp.html` — 120 s countdown; code compared with `otp` from `users.json` (`123456`) via `CP.verifyOtp()`; on success the session (`cp_session` = user + client) is stored.
3. `app.html` redirects to login if `cp_session` is missing (inline script in `<head>`). Logout clears `sessionStorage`.

Login page has two autofill buttons (one per demo client) and OTP page has an autofill link — prototype-only conveniences.

## Prototype "today"

`CP.TODAY = '2026-09-24'` is used everywhere (header date, "Jobs status as of Today", query elapsed days, touch-point ranges). Mock data is generated relative to this date, so do not switch to the real clock.

## Running & deploying

- Dev: `node server.js` (default port 8000, `PORT` env var overrides). `server.js` serves files under the prototype folder only (path traversal → 403), no caching (`Cache-Control: no-cache`).
- pm2: `pm2 start ecosystem.config.js` — app name `client-portal-prototype`, runs `server.js`. Port resolution: `PORT` env var → `PORT` in `core/prototype/.env` (parsed by the config itself, no dotenv) → 8000. After changing `.env`: `pm2 delete client-portal-prototype && pm2 start ecosystem.config.js`.
- Python is deliberately not used (Windows servers may lack `python3`).

## Adding a page

1. Create `views/<group>/<name>.html` with a root element carrying `x-data`.
2. Add the route in `ROUTES` (`core.js`) and a link in `app.html`.
3. If it needs new logic, add an `Alpine.data` in `assets/js/pages/` and reference the file in `app.html`.
