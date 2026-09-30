# Client Portal Prototype — Stage 1 Plan

**Phase:** 1
**Status:** In Progress
**Owner:** matheen
**Source:** direct requirements from the user in this session (no `requirements/` doc yet for this work)

## Goal

Build a static, clickable HTML/CSS/JS prototype of the client-facing portal (the Angular `reports` project + the `dp-dash-movement` React module) so the team, managers and bosses can review the UI/UX before any real development starts. No Angular, no backend, no database — htmx + Alpine.js + Tailwind CSS (CDN), mock JSON data, two demo clients.

See [[architecture]] for the technical design, [[screens]] for what each screen covers, [[data]] for the mock data, and [[issues]] for open assumptions and fixed bugs.

## Scope

**Included:** Login/OTP (with autofill demo credentials), app shell (sidebar + top bar), Delivery Dashboard (Movement, Job Status, Queries), Reports (Connect, Weekly, Invoices), Newsletter, Knowledge Center, IT Guidelines, Team, Calendar, About Carisma, FAQ, Contact Us, My Profile.

**Excluded (not built):** System/version page, chat, forgot-password flow, and the dashboard tabs dropped from the original Angular app (Monthly Connect, Job Status [old chart version], Feedback Status, Insights) — see Stage 1 tasks below for why.

---

## Tasks

### Stage 1 — First iteration: scope, structure, Tailwind mockup ✅

- [x] Explored the Angular `reports` project and the `dp-dash-movement` / `dp-dash-insights` React modules to learn the real screens, routes and data shapes
- [x] Agreed scope with the user: client-side (`reports`) only, multiple HTML files, JSON mock data, Tailwind CSS, organised folders
- [x] Built first pass: plain HTML + vanilla JS + Tailwind CDN, Chart.js dashboards (Job Movement, Monthly Connect, Job Status, Feedback Status, Queries, Insights), Reports, Account and content pages
- [x] Two demo clients with autofill login (Northwind Advisory, Harbourline Wealth Partners) and mock OTP
- [x] Verified with a headless-browser smoke test (login, every route, no console/network errors)

### Stage 2 — Rebuild on htmx + Alpine.js to match the real UI ✅

- [x] User supplied screenshots of the real Job Status, Job detail, Movement and Queries (jobs list + query cards) screens; asked for a close match, htmx + Alpine.js, one master page, dashboard tabs limited to **Movement / Job Status / Queries only**, no client/user dropdowns, mock names only
- [x] Rebuilt as one master page (`app.html`) with a hash router and htmx-loaded view fragments; removed the Chart.js dashboards and their data (Monthly Connect, Feedback, Insights)
- [x] Regenerated mock data to match the real shapes: 24-column jobs table, touch points (Movement), queries with reply threads
- [x] Built Movement, Job Status (status strip, vertical switcher, 24-column table, job-detail tabs, instructions panel), and Queries (KPI tiles, jobs list, query cards with reply) to match the screenshots
- [x] Shared components (`legends`, `table-toolbar`, `pagination-status`, `pager`) as htmx fragments; shared table logic (`CP.makeTable`)
- [x] Pushed to branch `prototype-v1`

### Stage 3 — Polish: login redesign, horizontal scroll fix, Node/pm2 setup ✅

- [x] Made the job timeline in Job Status scroll horizontally instead of wrapping
- [x] Added `ecosystem.config.js` for pm2, with `.env`-based `PORT` support
- [x] Replaced the Python static server with a dependency-free Node `server.js` (Windows servers may not have `python3`); fixed a request-path crash found while testing
- [x] Redesigned login and OTP pages to match the real split-layout login (banner image, gradient, Carisma branding); shared `auth-hero` component; kept prototype-only autofill helpers on both pages

### Stage 4 — Documentation ✅

- [x] Created this wiki (`core/prototype/wiki`): index, architecture, screens, data, issues, logs, tasks
- [x] Drafted an introduction email for the team/managers/bosses, covering purpose, included screens, and a login guide
- [x] Reviewed a separate ITR Workflow v8 prototype built by the user's manager (`wiki/docs/ITR-Workflow-v8-Prototype.html`) — a different, internal-operations-facing prototype (firm/Carisma/AI workflow steps), not integrated with this one

### Stage 5 — Incorporate teammate's changes (pending — details to follow)

- [ ] **Dashboard tabs → separate pages.** The teammate has restructured the client dashboard so Movement, Job Status and Queries are no longer tabs under one Delivery Dashboard page — each is now its own page. Once details arrive: update the sidebar navigation, the router (`ROUTES` in `assets/js/core.js`), `app.html`'s pill-tab bar (currently shown only for `/dashboard/*` routes), and [[screens]] / [[architecture]] to match.
- [ ] Capture any other significant changes the teammate made (not yet described)
- [ ] Re-verify the affected screens with a smoke test after the change

---

## Open Questions

1. **Dashboard restructure details** — waiting on the user to describe the teammate's separate-pages change fully before implementing (Stage 5).
2. **Movement "Balance"** — implemented as `actual − target` (negative shown red). Not confirmed against the real portal's definition. ([[issues]] ISS-009)
3. **Job Status: 24-column set and "Report" toggle** — only ~12 of the 24 columns and no "Report" view were visible in the supplied screenshots; the rest were invented to fill the UI. Needs confirmation against the real table. ([[issues]] ISS-008)
4. **Yellow status tiles = client-held job** — inferred from the legend chips and the user's description ("chip tells which side holds the job"); the exact set of client-held statuses (Sent For Queries / Review / Final Review) was read from screenshot colouring, not confirmed explicitly. ([[issues]] ISS-007)
5. **Relationship to the ITR Workflow v8 prototype** — that prototype (internal operations view: firm/Carisma/AI steps, 40-step workflow) overlaps conceptually with our Job Status page but serves a different audience. Not clear yet whether/how the two should align (e.g. shared step/status vocabulary) or stay independent.
6. **Production readiness of the stack** — htmx/Alpine/Tailwind are all loaded from CDN (Tailwind via the Play CDN, not meant for production). Fine for a review prototype; would need vendoring or a real build step if this code is ever reused beyond the demo.
