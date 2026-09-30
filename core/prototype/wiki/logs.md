# Logs

## 2026-09-30 — Built Job Intake, adapted from the ITR Workflow v8 prototype

- Agreed scope with the user through discussion (logged as Stage 7 in [[../feature-updates/phase-1/plan-stage-1|plan-stage-1]]): a new **Job Intake** sidebar page (before Jobs), covering only the firm-visible slice of the ITR prototype's Stage 1 ("Intake & collection") — document/checklist collection before a job is allocated to Carisma. Internal-only steps (auto-fill, checklist generation, gap analysis, Carisma review, reminder emails) are not shown as steps; they surface only as a weighted completion % and missing-Mandatory count, same as the source prototype's own Jobs table (M=3/E=2/I=1, ready at 85% with zero Mandatory missing, urgent at 90% with a Mandatory still missing).
- Built `views/dashboard/job-intake.html` + `assets/js/pages/job-intake.js`: KPI tiles, searchable/filterable card list, expandable checklist per job (toggle received/missing, completion recomputes live), Send reminder / Move to prioritisation queue / Allocate to Carisma actions, queue reordering, and a **New Job** modal (named "New Job", not "New ITR job" — Carisma does more than ITR work) that creates an intake entry with a checklist built from the chosen profession.
- Ported the document/profession catalogue (8 professions, ~20 documents) and weighting/threshold constants from the ITR prototype into `job-intake.js`.
- Generated `data/clients/<id>/intake.json` for both demo clients (9 Northwind, 6 Harbourline).
- **Handoff is simulated, not wired up:** clicking Allocate to Carisma removes the card and shows a toast; it does not add a row to `jobs.json`, so the job will not actually appear on the Jobs page. Flagged in [[screens]].
- **Bug found and fixed while smoke-testing:** `scoreOf()` returned a `pct` field but the template read `j.completion_pct` (from the static JSON) — toggling a checklist item changed the underlying data but the completion bar never visibly moved. Renamed the computed field to match.
- Verified with a headless browser: KPI tile filters, checklist toggle updates the bar, New Job creates a card, queue reordering, and Allocate to Carisma removes a card — for both demo clients, no console errors.

## 2026-09-30 — Reconciled with teammate's push to `prototype-v1`

- User pointed at a branch "DevBranch" for the teammate's changes. The literal `DevBranch` (local + origin) only contained the wiki-only commit from the previous session (docs/, feature-updates/, index.md) — no app code. The actual teammate work was pushed straight to **`prototype-v1`** (commits `f0507d3`, `8e9b7f5`, `b9ae1fb`): sidebar grew from 3 dashboard links to 11 (Home, Jobs, Job Allocation, Queries, Movement, Budget Overview, MOM, Production Report, Turnaround Report, Feedback, Workflow) plus Reports; default route is now `/dashboard/landing` (Home); most new screens share one config-driven `gridPage` component (`assets/js/pages/dev-screens.js` + `views/dashboard/grid.html`); a reusable job-detail popup (`job-popup.js` + `components/job-detail.html`) now opens from any job name across screens. Teammate also rewrote `screens.md`, `issues.md` (ISS-010 through ISS-019), `data.md`, `architecture.md`, `tasks.md` themselves — thorough and consistent with this wiki's conventions, no rework needed.
- Local `prototype-v1` had diverged (one wiki-only commit not on origin). Rebased it onto `origin/prototype-v1` (clean, no conflicts) and pushed. History is linear again.
- **Bug found while smoke-testing the merge:** opening `#/dashboard/mom` throws `Cannot read properties of undefined (reading 'call')` in the browser console (`dev-screens.js:228-229`, `taStats`/`taCell`). The page still renders correctly despite the error. Cause: `views/dashboard/grid.html`'s turnaround-only "Manager view" totals row (~line 196-198) computes `taCols`/`taCell(null, c)` even while hidden by `x-show`, and `taCols` always includes a trailing "All Jobs" group even for configs with no `taStats` (only `turnaround-report` defines it) — `cfg.taStats.call(...)` then has nothing to call. Reproduced in isolation (fresh browser context, `/dashboard/mom` only); other `tabs:false`/no-manager grid pages (e.g. Workflow) did not reproduce it in the same test, cause of that difference not fully root-caused. Not fixed yet — flagged for the user/teammate.
- Awaiting the user's fuller description of the teammate's changes (mentioned: dashboard tabs are no longer tabs, now separate pages — consistent with what's found above) before rewriting [[screens]]/[[architecture]] further or updating [[plan-stage-1]] Stage 5.

## 2026-09-25 — Wiki brought up to date with dev-branch screens

- Documented everything added since the first iteration: Home landing page, dev-style Jobs page + job popup, Workflow / Movement report / Budget / Turnaround / Feedback / MOM / Production / Overview screens, Job Allocation, responsive shell, navy theme, new mock data files. See `screens.md`, `architecture.md`, `data.md`, `issues.md` (ISS-010..019).
- Nothing committed to git yet.

## 2026-09-24/25 — Dev-branch alignment and Home (many user-driven iterations)

- Brought the dev branch screens in (all screens; kept touch-point Movement/Jobs/Queries and added SMSF + job-detail updates). Added Workflow (stand-up), Job Allocation (Stage 1 / Allocate with checklist), Home landing page (default route) with Workflow, Jobs, Movement, Budget, Holidays, Feedback and Yesterday's Workflow.
- Jobs page rebuilt on the dev model (14 BS statuses, BK/FP set, SMSF combined cards, 26 columns, Filters drawer, Manager View); job detail became accordions (Timeline, Budget, Turnaround, Instructions, Queries, Appreciation/Feedback) and opens as a popup from every job name.
- UI passes: compact grids, two-colour Home, equal-size cards, responsive drawer sidebar, navy theme, sidebar reorder, Jobs top-bar/tiles redesign, default legend "Jobs with <client>".
- Testing: headless Chrome (playwright-core) — no page errors, no horizontal overflow at 390/768/1024/1500 px.

## 2026-09-24 — OTP autofill restyled (user change)

- User changed the OTP page's autofill from a small text link to a bordered card button ("Autofill OTP / Fill mock otp to continue login") matching the login page's demo buttons. Behaviour unchanged (`#fill` still fills the mock OTP).
- Minor: the button carries `w-50`, which is not a default Tailwind spacing class, so it has no effect (button sizes to content).

## 2026-09-24 — Wiki created

- Created `core/prototype/wiki` (index, architecture, screens, data, issues, logs, tasks) documenting the prototype as built on branch `prototype-v1`.

## 2026-09-24 — Login/OTP redesigned to match real login

- Split layout: form column with white-fade background + banner card. Banner (`login-banner.jpg`) copied from the Angular `reports` assets; right card extracted to `components/auth-hero.html` and loaded with htmx on both pages.
- Fixed forms-plugin input styling overrides (ISS-004). Two autofill demo buttons kept below the footer.
- Commit: `fc78a0f updated login`.

## 2026-09-24 — Static Node server and pm2 config

- Replaced `python3 -m http.server` with `server.js` (Node, no deps) because Windows servers may not have `python3`. Fixed a `//` path crash found while testing (ISS-003).
- `ecosystem.config.js` runs `server.js`; port from `PORT` env → `.env` (manual parser) → 8000. README updated. Commits `30ebae3`, `0aa223e`.

## 2026-09-24 — Job timeline scrolls horizontally

- Timeline is a single scrollable row instead of wrapping (ISS-001).

## 2026-09-24 — Rebuild on htmx + Alpine.js to match real UI

- User supplied screenshots of the real Job Status, Job detail, Movement and Queries (jobs + query cards) screens and asked for an exact match, htmx + Alpine.js, one master page, top tabs limited to Movement / Job Status / Queries, no client/user dropdowns, mock names only.
- Removed the first-iteration UI (Chart.js dashboards: Monthly Connect, Feedback, Insights) and its data; regenerated jobs (24-column shape), movement (touch points) and queries (threads).
- Decisions: hash router + htmx fragments in a single master page; components as htmx fragments sharing the parent Alpine scope; `CP.makeTable` shared table logic; fixed prototype date 2026-09-24; Source Sans 3 font as in the real portal.
- Bugs found/fixed during testing: ISS-002 (label `x-text`), KPI filter hiding a card after reply.
- Committed to branch `prototype-v1` (`f4c634e` first iteration).

## 2026-09-24 — First iteration (Tailwind + vanilla JS) — superseded

- Initial prototype scoped from the Angular `reports` project: two clients (Northwind Advisory, Harbourline Wealth) with autofill login, dashboards, reports and content pages, mock JSON data. Replaced the same day by the htmx + Alpine rebuild above.
