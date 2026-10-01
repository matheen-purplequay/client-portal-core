# Tasks

## 2026-09-24

- [TSK-20260924-01] [no-req] Explored Angular `reports` project and React client modules; agreed scope, structure and stack with the user — complete
- [TSK-20260924-02] [no-req] Built first prototype iteration (Tailwind + vanilla JS): login/OTP with two demo clients, dashboards, reports, content pages, mock JSON — complete (superseded)
- [TSK-20260924-03] [no-req] Rebuilt on htmx + Alpine.js: master page + hash router, fragment components, shared table logic — complete
- [TSK-20260924-04] [no-req] Matched Job Status (24-column table, status strip, legends, job-detail tabs), Movement and Queries (KPI tiles, jobs list, query cards) to supplied screenshots — complete
- [TSK-20260924-05] [no-req] Regenerated mock data for jobs, movement and queries; removed Monthly Connect / Feedback / Insights data — complete
- [TSK-20260924-06] [no-req] Pushed branch `prototype-v1` to origin — complete
- [TSK-20260924-07] [no-req] Made the job timeline horizontally scrollable — complete
- [TSK-20260924-08] [no-req] Added `ecosystem.config.js` for pm2 with `.env` port support; replaced Python server with dependency-free Node `server.js` — complete
- [TSK-20260924-09] [no-req] Redesigned login and OTP pages to match the real split-layout login; shared `auth-hero` component — complete
- [TSK-20260924-10] [no-req] Created the prototype wiki (index, architecture, screens, data, issues, logs, tasks) — complete
- [TSK-20260924-11] [no-req] User restyled the OTP page autofill button to a card button; wiki updated — complete

## 2026-09-25

- [TSK-20260925-01] [no-req] Brought dev-branch screens into the prototype (Workflow, Movement report, Budget Overview, Turnaround, Feedback, MOM, Production, Overview) with generated mock data — complete
- [TSK-20260925-02] [no-req] Added SMSF status model and rebuilt Jobs page on the dev model (status tiles, 26 columns, Filters drawer, Manager View) — complete
- [TSK-20260925-03] [no-req] Job detail as accordions incl. Turnaround, Queries link and Appreciation/Feedback; reusable job popup from every job name — complete
- [TSK-20260925-04] [no-req] Added Job Allocation (Stage 1 / Allocate, checklist with optional client notes) — complete
- [TSK-20260925-05] [no-req] Added Home landing page (default route) with Workflow, Jobs, Movement, Budget, Holidays, Feedback and Yesterday's Workflow sections — complete
- [TSK-20260925-06] [no-req] Responsive shell (drawer sidebar), navy theme, sidebar reorder, compact layouts — complete
- [TSK-20260925-07] [no-req] Updated wiki (screens, architecture, data, issues, logs, tasks) — complete

---

## 2026-09-30

- [TSK-20260930-01] [no-req] Investigated "DevBranch" per user request; found teammate's actual changes were pushed to `prototype-v1` instead; rebased local branch onto origin and pushed (clean, no conflicts) — complete
- [TSK-20260930-02] [no-req] Smoke-tested the merged `prototype-v1` (both demo clients, all sidebar routes); found and documented a reproducible console error on the MOM page (`taStats`/`taCell`, ungarded in `grid.html`) — complete (fix pending)
- [TSK-20260930-03] [no-req] Discussed and agreed scope for bringing the ITR Workflow v8 prototype's Jobs page into this prototype: named "Job Intake", scoped to firm-visible Stage 1 only, handoff to Jobs page simulated, new intake.json data model — complete
- [TSK-20260930-04] [no-req] Built and smoke-tested the Job Intake page (view, Alpine page, mock data, sidebar/router wiring); fixed a completion-percent field-name bug found during testing — complete

## 2026-10-01

- [TSK-20261001-01] [no-req] Rebuilt Job Intake's job list from cards to a table (reusing table-toolbar/pagination-status/CP.makeTable), row click opens a side drawer for the checklist, after comparing against the renamed job-intake-reference.html — complete
- [TSK-20261001-02] [no-req] Matched the table-toolbar component's updated contract (Filters drawer + chips, from the Stage 5 merge) and renamed Job Intake's per-row drawer state to avoid a naming clash — complete
- [TSK-20261001-03] [no-req] Expanded the Job Intake drawer into a gap-resolution view: completeness donut + M/E/I counts, reminders/timers, Still needed/Received/Doesn't-apply sections with Client sent it / Upload / Doesn't apply actions, add-a-document form; three-state checklist status (received/missing/na) — complete
- [TSK-20261001-04] [no-req] Fixed completeness-gauge text centering, added a truncated Job column, and replaced the Filters button with Stage/Waiting on/Step inline dropdowns (synthetic, derived from status) — complete
- [TSK-20261001-05] [no-req] Moved Stage/Waiting on/Step filters into the toolbar before Refresh, restyled as Show-Columns-style toggle buttons instead of native selects — complete
