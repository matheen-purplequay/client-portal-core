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

### Stage 5 — Merge teammate's changes (DevBranch / `prototype-v1`) ✅

- [x] **Dashboard tabs → separate pages.** Confirmed and merged: Movement, Job Status ("Jobs") and Queries are no longer tabs under one Delivery Dashboard page — the sidebar grew from 3 dashboard links to 11 (Home, Jobs, Job Allocation, Queries, Movement, Budget Overview, MOM, Production Report, Turnaround Report, Feedback, Workflow), each its own route/page; default route is now `/dashboard/landing` (Home)
- [x] Found the teammate's work was actually pushed to `prototype-v1` (not the literal `DevBranch`, which only held this session's wiki-only commit); reconciled by rebasing local `prototype-v1` onto origin and pushing — clean, no conflicts
- [x] Reviewed what was added: a shared config-driven `gridPage` component (`assets/js/pages/dev-screens.js` + `views/dashboard/grid.html`) powering most of the new screens, and a reusable job-detail popup (`job-popup.js` + `components/job-detail.html`) opened from any job name
- [x] Confirmed the teammate already documented the change thoroughly themselves in [[screens]], [[issues]] (ISS-010–ISS-019), [[data]], [[architecture]] and [[tasks]] — no rework needed there
- [x] Smoke-tested the merged branch (both demo clients, every sidebar route)

### Stage 6 — Follow-up from the Stage 5 merge (pending)

- [ ] **Fix the MOM page bug.** `#/dashboard/mom` throws `Cannot read properties of undefined (reading 'call')` in the console (`dev-screens.js` `taStats`/`taCell`, `views/dashboard/grid.html` ~line 196-198). Page still renders correctly. Fix: guard `cfg.taStats` so grid configs without it (everything except Turnaround Report) don't hit `.call()` on `undefined`.
- [ ] **Root-cause why only MOM reproduces it.** The same unguarded pattern sits in `grid.html` for every `gridPage` screen; other `tabs:false` screens (e.g. Workflow) didn't throw in testing. Worth confirming MOM is really the only instance before considering it closed.
- [ ] **Resolve the teammate's open assumptions** (ISS-010–ISS-019 in [[issues]]): sidebar order, Manager View visibility by role, SMSF's "Not Yet Taken" status, derived mock values (turnaround Carisma/client split, production figures), and the rest — needs the user's or teammate's confirmation against the real portal, not something to resolve unilaterally.
- [ ] **Update this plan's Stage 5/6 record** as each of the above closes.
- [ ] **Decide on the orphaned `DevBranch`** (local + origin) — one commit behind, unrelated to `prototype-v1`'s real history now. Delete it, or keep it?
- [ ] **ITR Workflow v8 prototype** (`wiki/docs/ITR-Workflow-v8-Prototype.html`) — separate discussion: whether/how to bring any of its ideas (its Jobs page, step/stage model, lane badges) into this prototype. See Stage 7 below — now in progress.

### Stage 7 — "Job Intake" page, adapted from the ITR Workflow v8 prototype (agreed scope, not yet built)

- [x] Read and understood `wiki/docs/ITR-Workflow-v8-Prototype.html`'s Jobs page: 40-step, 3-stage internal workflow (Intake & collection / Processing & workpaper / Agent review), lanes (client, firm, Carisma, Cluster Head, platform/AI, mail), weighted document checklist, Stage/Waiting-on/Complete/Days-in-stage/Loops columns.
- [x] **Naming clash resolved:** new page is called **Job Intake**, distinct from the existing client-facing **Jobs** page and from the unrelated **Workflow** (daily stand-up) sidebar item.
- [x] **Purpose confirmed:** solves "how we get jobs from our client" — document/checklist collection before a job is ready for delivery. Not the full internal production pipeline.
- [x] **Scope agreed: Stage 1 (Intake & collection) only, and only the slice visible to the firm/client persona** — i.e. what an accounting firm (our logged-in client, e.g. Northwind Advisory — equivalent to the ITR prototype's firm-admin persona "Megan Clarke") would see of their own jobs:
  - Visible/actionable steps: **Initiate job** (step 1, via a **New Job** button/form — named "New Job", not "New ITR job", since Carisma handles more than ITR work), **Upload profession, PY, CY & docs** (step 2), **Admin collects & adds files** (step 8), **Prioritisation queue** (step 12), **Allocate job to Carisma** (step 13).
  - Carisma-internal steps (auto-fill, weighted checklist generation, gap analysis, Carisma's data review, reminder/notification emails — steps 3-7, 9-11) are **not shown as steps**; their outcome surfaces the same way the ITR prototype's own Jobs table does it: a weighted checklist-completion % and a missing-Mandatory-document count per job.
- [x] **Handoff confirmed:** once a job is allocated to Carisma (step 13 / "Move to Stage 2"), it **drops off Job Intake and appears on the existing Jobs page** instead — mirrors the real intake → delivery handoff. No dual-listing.
- [x] **Data confirmed:** a new `data/clients/<id>/intake.json` per client (not an extension of `jobs.json`) — one entry per job-in-intake, with its checklist items (doc name, category, weight M/E/I, received/missing), computed completion %, current intake step/status, and creation metadata (client name, profession, submitted via the New Job form). Jobs created via New Job live only here until allocated; on allocation they'd need a matching entry added to `jobs.json` (simulated — no real handoff logic, this is a prototype).
- [ ] Still to decide before building: sidebar placement/icon/route (proposed: `Job Intake`, positioned **before** Jobs in the sidebar since it's the earlier stage, route `#/dashboard/job-intake`); whether verticals apply the same way as Jobs; exact checklist item set per profession (reuse the ITR prototype's `PROFESSIONS`/`ITEMS` catalogue, translated to our mock sub-clients).
- [ ] Build: `views/dashboard/job-intake.html` + `assets/js/pages/job-intake.js` (list + New Job form + checklist/gap view), `intake.json` mock data, sidebar/router entry, [[screens]]/[[architecture]]/[[data]] updates.
- [ ] Smoke-test and update this stage to ✅ once built.

---

## Open Questions

1. ~~Dashboard restructure details~~ — resolved: merged in Stage 5.
2. **Movement "Balance"** — implemented as `actual − target` (negative shown red). Not confirmed against the real portal's definition. ([[issues]] ISS-009)
3. **Job Status: 24-column set and "Report" toggle** — only ~12 of the 24 columns and no "Report" view were visible in the supplied screenshots; the rest were invented to fill the UI. Needs confirmation against the real table. ([[issues]] ISS-008) — note: the teammate's merged Jobs table now uses a different, dev-branch-sourced 26-column set (ISS-010); re-check whether this question is still live or superseded.
4. **Yellow status tiles = client-held job** — inferred from the legend chips and the user's description ("chip tells which side holds the job"); the exact set of client-held statuses was read from screenshot colouring, not confirmed explicitly. ([[issues]] ISS-007)
5. **Relationship to the ITR Workflow v8 prototype** — now being actively discussed (Stage 7): the prototype's "Jobs" page (internal operations view: firm/Carisma/AI workflow steps, 40 steps) overlaps by name and by subject with our own Jobs page. Naming and scope to be settled in that discussion.
6. **Production readiness of the stack** — htmx/Alpine/Tailwind are all loaded from CDN (Tailwind via the Play CDN, not meant for production). Fine for a review prototype; would need vendoring or a real build step if this code is ever reused beyond the demo.
7. **MOM page bug** — see Stage 6; root cause partly understood (unguarded `cfg.taStats`), not yet fixed or fully explained.
8. **Teammate's ISS-010–ISS-019 assumptions** — a batch of open assumptions from the Stage 5 merge, not yet reviewed with the user or teammate (Stage 6).
9. **`DevBranch` disposition** — delete or keep the now-orphaned branch (Stage 6).
