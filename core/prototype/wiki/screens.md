# Screens

Screens were first matched to screenshots of the real portal (Angular shell + `dp-dash-movement`), then brought up to the **dev branch** (`origin/DevBranch` @ `a2d4017`) on 2026-09-24/25. Colours: brand maroon `#811331`, navy `#1f2a6b`, panel `#f5f5f6`. Cool hues (blue/teal/purple/cyan) were replaced by navy tints; **yellow = with client, green = completed/paid, amber/red = due/over budget** are kept as status meaning.

## Shell (`app.html`)

- Header: hamburger (below `lg`), Carisma logo (links to Home), weekday + date (hidden on phones), calendar icon, notification bell, user avatar (links to profile).
- **Sidebar order:** Home · Jobs · Job Allocation · Queries · Movement · Budget Overview · MOM · Production Report · Turnaround Report · Feedback · Workflow · Reports — divider — Newsletter · Knowledge Center · IT Guidelines · Team · Calendar — divider — About Carisma. Bottom: Version 1.5, FAQ, Contact Us, Logout. "Delivery Dashboard" and "Overview" links are **hidden** (their routes still exist).
- **Responsive:** below `lg` the sidebar is a slide-in drawer (overlay + hamburger, closes on navigation); content padding is `px-3 → sm:px-5 → lg:px-8`; the rounded corner/left border only apply when the sidebar is docked. Checked at 390/768/1024/1500 px: no horizontal page overflow on the ten main screens.
- The dashboard pill-tab bar (`Movement | Job Status | Queries`) only shows on the touch-point Movement and Queries routes (hidden on Jobs).
- **Job popup** (`app.html` bottom): `CP.showJob(idOrName)` opens the Jobs-page detail in a window (Esc/Close/outside click closes).

## Home — `#/dashboard/landing` (default route) · `views/dashboard/landing.html` · `landingPage`

"Good day, <first name>" + date. Section panels in rows on the **default order Workflow, Jobs | Movement, Budget | Holidays, Feedback, Yesterday's Workflow**, sized by card count (3+6 / 5+4 / 2+1+6) so each row spans the full width; cards are the same height (88px) and flex to equal widths. Section headings are extra-bold and click through to their screen; every card opens its screen.

| Section | Cards |
|---|---|
| Workflow | Stand-Up Jobs Today, Est. Time Today, Finishing Today |
| Jobs | **Live Jobs**, **Yet to Start Jobs** (both bold), Jobs in Manager Queries, Sent for Manager Review, WIP Review Replies(Carisma), Sent for Manager Final Review |
| Movement · Last 7 Days | All Movement, New Jobs Received, Sent for Queries, Sent for Review, Closed |
| Budget | Total Jobs, Within Budget, Within Budget %, Over Budget |
| Holidays | next Australia and India holiday (date + "tomorrow / in Nd") |
| Feedback | Feedback Received |
| Yesterday's Workflow (panel) | Job (click → popup) · Yesterday's status · Current status; moved-on jobs highlighted maroon; scrolls inside its box |

Palette: two colours only — **navy** for normal cards, **maroon** for the manager-side cards (Jobs in Manager Queries, Sent for Manager Review, Sent for Manager Final Review) and Over Budget. WIP Review Replies is Carisma-side, so it is navy. Status buckets: queries = Sent For Queries + Awaiting Queries*; review = Sent For Review + Workpapers Completed Initial; final = Sent For Final Review + Workpapers Completed Final.

## Job Intake — `#/dashboard/job-intake` · `views/dashboard/job-intake.html` · `jobIntakePage`

The firm-facing slice of Stage 1 ("Intake & collection") adapted from the ITR Workflow v8 prototype (renamed `wiki/docs/job-intake-reference.html`) — see [[../feature-updates/phase-1/plan-stage-1|plan-stage-1]] Stage 7 for how the scope was agreed. Placed in the sidebar just before Jobs, since it covers the stage before a job reaches the Jobs page.

- Purpose: track document/checklist collection for a job **before** it is allocated to Carisma — "how we get jobs from our client" — not the internal Carisma processing pipeline (auto-fill, gap analysis, reviewer checks), which only surfaces as the checklist completion % and missing-Mandatory count, same as the source prototype's own Jobs table.
- KPI tiles: Collecting documents, Needs attention (Mandatory missing, ≥90% complete — "urgent" in the source prototype), In prioritisation queue, Ready to allocate (≥85% complete, weighted M=3/E=2/I=1, with zero Mandatory missing). Click a tile to filter the table.
- **List is a table** (first built as cards; changed after the user compared it against the reference design, which lists jobs in a table like our own Jobs/Queries pages). Reuses the same `table-toolbar`/`pagination-status` components and `CP.makeTable` as Jobs: column chooser, one filter (Profession, via a Filters side-drawer + removable chip), search, Refresh/Download (toast), page-size pills. Columns: ID, Client, Profession, Status, Complete (bar + %), Missing (M), Started, Updated, Queue #.
- **Row click opens a side drawer** (not a popup/modal) with the client/profession header, status badge, completion bar, and the full checklist (document, M/E/I weight chip, category) — checking an item toggles received/missing and recomputes the completion % live. Drawer actions: **Send reminder** (toast), **Move to prioritisation queue** (once ready), **Allocate to Carisma** (removes the row — the handoff onward is simulated with a toast, *not* wired into `jobs.json`; a real job with this name will not appear on the Jobs page), and ▲/▼ to reorder queued jobs (sets `priority`).
- **New Job** button opens a modal (name, profession, optional notes) — creates a new intake entry with an empty checklist built from the chosen profession's document list (same catalogue as the source prototype, trimmed to 8 professions). Named "New Job", not "New ITR job", since Carisma handles more than ITR work.
- State is in-memory only (like the rest of the prototype) — reload resets everything to `intake.json`.

## Jobs — `#/dashboard/job-status` · `views/dashboard/job-status.html` · `jobStatusPage`

Mirrors the dev `/dashboard/job-status` (dash-movement job tables).

- One compact top row: "Job Details", **Status View / Manager View**, **Legends** (All Jobs / Jobs with <client> / Jobs with Carisma) and the vertical buttons. **Opens on "Jobs with <client>"** (also after switching vertical).
- **Status tiles:** even grid (≈8 per row), white tiles with a left bar (navy = with Carisma, yellow = with client, green = completed); zero-count tiles hidden; Total Live / Total All (outlined, maroon bar) only when no legend is selected. Business Services shows the 14 dev statuses; Bookkeeping/Financial Planning the 8-status set with dev labels (Query Sent, Query Response Received / Response Received, Review notes received/attended); **SMSF** shows 5 combined cards (In Progress, Awaiting Queries, Workpapers Completed, Workpapers Changes Required, Moved to Audit — `tbl_smsfjobstatus` names without the "N. " prefix; "Not Yet Taken" has no card). Counts follow the drawer filters.
- **Manager View:** Partner Wise Jobs grid (status × received-from); a cell drops back to the list filtered to that partner + status. Shown for both demo clients (ISS-010).
- **Table:** the dev procedure's 26 columns (`#`, GroupJobName … Workstatus, then one date per status: YetToStartDate … CancelledDate; SMSF timelines feed the same columns through their Wsid bucket), column chooser, search, paging, Refresh/Download. Filter chips (FY, From, Accountant, Nature, Received, Commenced) beside the status chip; **Filters** opens a side drawer (FY default 2026, Status, Nature of Job, Received/Commenced period, Received From, Accountant).
- **Job detail** (click a job name; Shift+click = background tab): header facts (Accountant, Job Status, Group Job Name, Nature of Job, Received From) then **accordion sections, all closed by default, full width**: Job Timeline (left-to-right: date, dot on a line, "N days" pill, status, time taken), Under/Over Budget, **Turnaround** (With Carisma / With Client / Total, days — same split as the Turnaround screen), Instructions, Queries (count → `#/dashboard/queries?job=<id>`), Appreciation and Feedback (View Feedback appears only when a survey exists). Received Date is intentionally not shown.

## Other dev screens — `views/dashboard/grid.html` (config-driven `gridPage`, `assets/js/pages/dev-screens.js`)

Shared layout: title, vertical tabs (All + client verticals), optional stat cards (click to filter), maroon-header table with a per-column filter row, paging. Compact spacing (cards ~46px, one-row Period filter). **Job-name cells are links that open the job popup.**

- **Workflow** `#/dashboard/workflow` — today's stand-up: Job Description, Team Name, Associate, Work Status, Est.Time, Est. Delivery (DD-MM-YYYY); placeholder rows (no job and no time) dropped; filters under headers.
- **Movement** `#/dashboard/movement` (status-change report, not the touch-point screen) — period select (7d/14d/1m/custom + Apply), cards New Jobs Received / Sent for Queries / Sent for Review / Closed / Other Status Changed / All Movement; rows derived from job timelines.
- **Budget Overview** `#/dashboard/budget-overview` — open jobs; cards Open Jobs / Within / Over / Budget vs Booked; variance red when over.
- **Turnaround Report** `#/dashboard/turnaround-report` — Open/Closed toggle, 0-5 … above-60-day bucket cards, table with Turnaround (Days), in Carisma, in Client.
- **Feedback** `#/dashboard/closed-jobs-feedback` — closed jobs; Add/Edit Feedback opens the 5-question survey (Q1 and Q3 required; in memory only).
- **MOM** `#/dashboard/mom` — date range (default last 30 days), description viewer modal.
- **Production Report** `#/dashboard/production-report` (`productionPage`, `views/dashboard/production.html`) — associate month-on-month table with job/time trend and totals.
- **Overview** `#/dashboard/overview` (`overviewPage`) — summary cards linking to the screens above; not in the sidebar.

## Job Allocation — `#/dashboard/job-allocation` · `views/dashboard/job-allocation.html` · `allocationPage`

- Add-job form: **Job Name** (text), **Job No** (text; a known job no fills a blank name), **Associate Name** (dropdown) and **+**; duplicates by job no rejected.
- Grid: checkbox, #, Job Name (popup link), Job No, Associate, Status chip (Pending / Stage 1 / Allocated), per-row **Stage 1** and **Allocate**; header **Stage 1 / Allocate** act on ticked rows.
- **Allocate** opens the checklist ("Tick the respective box to allocate."): *Access to accounting software given*, *Documents loaded to sharedrive*, *Client notes added (optional)*. A job can be allocated when the two required boxes are ticked; if only some jobs are ready the modal offers "Allocate ready, others to Stage 1". Allocated rows are locked and show "✔ Checks done". In memory only.

## Queries — `#/dashboard/queries` · `views/dashboard/queries.html` · `queriesPage`

Unchanged design (KPI tiles → jobs with queries → query cards). New: `?job=<id>` on the hash opens that job's queries directly; the job heading on the query cards is a link to the job popup.

## Touch-point Movement — `#/dashboard/home` · `views/dashboard/movement.html`

The original prototype Movement screen (touch points / DWP, target vs actual, drawer). Kept as is, only reachable from the pill tab bar now (sidebar link hidden).

## Auth (`pages/auth/`), Reports, Content pages

Unchanged (login/OTP split layout, Reports tables, Newsletter … Contact Us). The login/OTP pages had blue accents recoloured to navy.

## Not built

System/version page, chat, forgot-password flow, saving of allocations/feedback/instructions (all in-memory).
