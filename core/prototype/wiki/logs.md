# Logs

## 2026-10-05 — Job Intake: queue reorder moved into the table (icons only)

- After the Move up / Move down buttons came off the job tab, the user (who also moved Allocate to Carisma to the top of the tab themselves) asked for reordering to live in the table instead: when the "In prioritisation queue" tile is selected, show up/down arrows at the end of each row, icons only.
- Added a trailing column (header + cell both `x-show="status === 'queued'"`) with `arrow_upward` / `arrow_downward` icon buttons, disabled at the ends of the queue; `@click.stop` so they don't trigger the row's open-tab click. Restored `move()` in `job-intake.js` with two small helpers (`queuedJobs`, `queueIndex`), and it clears `tbl.sortKey` so the visible order is the queue order after a move.
- Verified against the already-running server on 8000 (not started/stopped by me): arrows hidden without the filter, shown for both queued rows with the right ends disabled, a move swaps the rows, no tab opens, no console errors.

## 2026-10-05 — Job Intake: removed Move up / Move down

- User said the queue reorder buttons aren't needed. Removed the ▲ Move up / ▼ Move down buttons from the job tab's actions and the now-unused `move()` method in `job-intake.js`. Queue position is still assigned (appended) when a job is moved to the prioritisation queue, and still shown as "Queue #" in the table and "Queue position" in Job details — there is just no manual reordering any more.

## 2026-10-01 — Job Intake: side drawer replaced with folder tabs, two-column detail

- User asked for the Jobs page's own folder-tab pattern (click a row → opens as a tab, "Jobs List"-equivalent tab always present, × to close) instead of a side drawer, pointing at `modules/client-side/dp-dash-movement`'s screenshots. Confirmed in the real source: `JobTabBar`/`JobTabButton` components, shared across all four vertical job tables (`bs/smsf/fp/bk-job-table`) — a permanent "Jobs List" tab + one numbered tab per opened job, selected tab lifted/solid-coloured, Shift+click opens a background tab (confirmed via the seed copy "Use SHIFT + Click to open job details in background tab"). Matches what we'd already built for our own Jobs page from earlier screenshots, so reused that same `open[]`/`active`/`openJob(j, ev)`/`closeJob(id)` pattern directly rather than inventing a new one.
- Replaced the side drawer with a permanent "Job Intake / All jobs" tab plus per-job tabs (title = client name, subtitle = profession).
- User specified the tab content layout: **left column** — Received documents, Customer follow-up documents (renamed from "Still needed"), Timeline; **right column** — Basic job details, Document completeness, Reminder details. Built as a two-column grid inside the tab panel, reusing all the gap-resolution content from the former drawer (completeness donut, Still needed/Received/Doesn't-apply, add-a-document form, reminders, queue/allocate actions) rearranged into those two columns.
- Added a **Timeline** section (not in the drawer before) — a two-point horizontal timeline ("Job started" → current status), in the same dot/gap visual style as the Jobs page's own Job Timeline. We don't keep a full event history for intake jobs, so this is deliberately minimal rather than invented.
- **Bug found and fixed while smoke-testing:** the timeline's day-gap calculation (`CP.daysBetween(timeline(job)[i-1].on, ...)`) ran for every entry regardless of `x-show="i > 0"` — same class of bug as the earlier MOM page issue (Alpine evaluates `x-text` bindings even when the element is hidden by `x-show`). Fixed with an inline ternary guard instead of relying on `x-show` to prevent evaluation.
- Verified with a headless browser on both demo clients: opening a tab, Shift+click opening a background tab without switching, multiple tabs open at once, closing a tab, and the two-column content rendering correctly — no console errors.

## 2026-10-01 — Job Intake: filters moved into the toolbar, "Show Columns"-style

- User asked for Stage/Waiting on/Step to sit inline in the toolbar before Refresh, styled like the "Show Columns" toggle (button + floating panel) instead of native `<select>` dropdowns in their own row above the table.
- Moved the three into the toolbar's right-hand group (Status chip → Stage → Waiting on → Step → Refresh/Download → Search). Replaced the `<select>` elements with the same toggle-button + absolute panel pattern as Show Columns, using radio-style rows (`radio_button_checked`/`_unchecked`) since each is single-select. Added `stageOpts`/`waitingOpts` option arrays alongside the existing `stepOpts`, a shared `filterOpen` state (only one panel open at a time), and a `pick(field, value)` helper.
- Verified with a headless browser: all three open/close correctly, filtering still works (e.g. Waiting on → Client → 6 rows), no console errors.

## 2026-10-01 — Job Intake polish: gauge centering, Job column, Stage/Waiting on/Step filters

- **Gauge centering:** the completeness donut's `%`/"weighted" text wasn't pixel-centered — `.gauge > div` used `display:grid;place-items:center` over two sibling elements (`<b>` + `<span>`), each centred independently rather than as one block. Switched both `.gauge` and `.gauge > div` to flex column centering; fixed.
- **Job column added:** a constant `job_title` ("Individual Tax Return 2025-26") per intake record, shown truncated (ellipsis + tooltip) between Client and Profession — matches the reference's "Client / job" idea without duplicating the client name.
- **Filters button replaced with three inline dropdowns** (Stage / Waiting on / Step), per the user's request to pull these from the reference, styled with the existing minimal `.field` select look. Since this page only covers Stage 1 (firm view) and doesn't track real per-job steps, all three are synthetic/derived from the existing 4-value status rather than new tracked state: Stage is always "Stage 1" (cosmetic, no-op filter); Waiting on maps to Client (collecting/urgent) or Firm (ready/queued); Step borrows the reference's own step numbers (08 / 11 / 12) for the nearest matching status. Flagged this mapping to the user rather than assuming silently. Dropped the reference's fourth dropdown (Accounting firm) since this page is already scoped to one firm.
- Since the Filters-drawer/Profession-filter is gone, this page no longer uses the shared `table-toolbar` component — built a bespoke inline toolbar instead (Show Columns, Status chip, Refresh/Download, Search), so the shared component used by Jobs/other pages is untouched.
- Verified with a headless browser on both demo clients: Job column renders and truncates, all three new dropdowns filter correctly (Waiting on=Client, Step=12 etc.), gauge text is now centred — no console errors.

## 2026-10-01 — Job Intake drawer: added gap-resolution view, completeness donut, reminders/timers

- User asked where the reference's full job-detail page (stage bar, step banner, "Admin collects & adds files" gap-resolution screen, document-completeness donut, loops/reminders/timers) shows up in our prototype — answer was: the side drawer, but it was much thinner than the reference.
- Agreed scope for what to add: category-aware "Still needed" list (missing documents only) with a **Why** reason column and three actions (Client sent it / Upload / Doesn't apply), a document-completeness donut with Mandatory/Essential/Info breakdown replacing the flat bar, and a reminders/timers strip (reminders sent of 5 — the reference's own cap, next reminder date, time in Stage 1). Left out: stage progress bar, current-step banner, persona switching, XPM link, Auto-filled data/Timeline tabs, Stage 1/2/3 loop counters — all multi-stage/internal-lane concepts outside this page's agreed scope.
- Decided "Client sent it" and "Upload" should have the same effect (mark received) — Upload additionally attaches a fake filename for visual realism, no real file storage. Decided to skip the reference's drag-and-drop "Other files the client sent" zone and its "Re-run analysis" button — no real file handling or separate analysis step exists to simulate meaningfully in this prototype (completion recomputes live on every action already).
- Checklist status became three-state: `received` / `missing` / `na` ("Doesn't apply" excludes a document from both sides of the completion % — mirrors the reference's own `metrics()` filtering out `na` items). Added a `reason` field per document ("Required for every return", "Shown in the ATO pre-fill", "Usual for a `<profession>`", etc.), back-filled at load time for existing `intake.json` rows so the JSON files didn't need regenerating. Added an inline "Add a document to the checklist" mini-form (name + M/E/I weight).
- Verified with a headless browser on both demo clients: completeness gauge/counts update live on Client sent it / Upload / Doesn't apply / undo, custom document add, Send reminder increments the counter — no console errors.

## 2026-10-01 — Job Intake redesigned: cards → table + side drawer

- User renamed `wiki/docs/ITR-Workflow-v8-Prototype.html` to `job-intake-reference.html` and pointed out a structural mismatch: the reference's Jobs list is a table (Job ID, Client/job, Complete, Days in stage, etc.), but Job Intake (built last session) used a stack of expandable cards.
- Discussed and agreed: rebuild the list as a **table**, reusing the same `table-toolbar`/`pagination-status` components and `CP.makeTable` already used on Jobs — not a 1:1 copy of the reference's columns, since several don't apply to our narrower scope (Firm, Stage, Waiting-on, Loops S1/S2/S3 are all multi-stage/internal-lane concepts; we only cover Stage 1, firm view). Kept: ID, Client, Profession, Status, Complete, Missing (M), Started, Updated, Queue #.
- Row click opens the checklist + actions in a **side drawer** (matches the Movement page's details drawer pattern), not a popup — the alternative considered was a Jobs-style popup like `job-popup.js`, but a drawer fit better since it's a simpler single-job form, not a multi-field job record.
- Kept the KPI tiles (reference doesn't have them, but Queries/Job Status already use the same click-to-filter tile pattern — consistency with the rest of this prototype won out).
- While rebuilding, discovered `table-toolbar.html`'s contract had changed in the Stage 5 merge (now expects `chips`/`removeChip(key)`/`openDrawer()` for a Filters *drawer*, not the old inline `filters`/`filterOpts` dropdown) — matched it, including renaming Job Intake's own per-row drawer state (`drawer` → `view` / `openJob()` / `closeJob()`) to avoid clashing with the toolbar's `openDrawer()` (which now opens a small Filters drawer with a single Profession select, mirroring Jobs' FilterSidebar pattern).
- Verified with a headless browser: table renders and sorts, Filters drawer + chip + clear, column chooser, row click opens the drawer, checklist toggle updates completion %, New Job still works — no console errors, both demo clients.

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
