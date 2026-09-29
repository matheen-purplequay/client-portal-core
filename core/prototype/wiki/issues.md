# Issues

<!-- Status can be Open, In Progress, Resolved. "Assumption" = guessed from screenshots, needs user confirmation. -->

## ISS-019 — Derived mock values (assumption)

- **Status:** Open (assumption)
- **Detail:** Per-step "time taken", turnaround Carisma/Client split, production figures, yesterday's workflow and appreciation/survey content are generated (formula in `data.md`). Replace with real API values when wired.

## ISS-018 — Sidebar order and hidden links (decision)

- **Status:** Open (needs confirmation)
- **Detail:** The requested order omitted Workflow and Reports; they were kept at the end of the first group. Overview and Delivery Dashboard links were removed at the user's request but the routes still work (touch-point Movement via the pill tab). "Sent for Manager Review" assumes the user's "view" was a typo for "review".

## ISS-017 — Home rows wrap on narrow screens

- **Status:** Open (cosmetic)
- **Detail:** Section panels are sized by card count with `flex-wrap`; on phones/tablets each section takes a full row, so the page is longer than on desktop.

## ISS-016 — Manager View / SMSF "Not Yet Taken" assumptions

- **Status:** Open (assumption)
- **Detail:** Manager View (partner × status) is shown for both demo users although the real portal may restrict it by role. SMSF "Not Yet Taken" has no status card (per user list) but those jobs count under All/Live. Card totals equal the sum of visible cards.

## ISS-015 — "sharedrive" spelling

- **Status:** Open (cosmetic)
- **Detail:** Allocation checklist reads "Documents loaded to sharedrive" exactly as the user typed it.

## ISS-014 — Alpine/scripting pitfalls found during testing

- **Status:** Resolved (2026-09-25)
- **Detail:** `x-if` modals threw on close with null state (guarded with `?.`); `<select x-model>` with `x-for` options showed the wrong initial value (added `:selected`); Home section matching failed because the Movement title has a suffix (now `startsWith`); SMSF "Changes Required" timeline wrongly included "Moved to Audit" (fixed); timeline `gap(i)` out of range fixed.

## ISS-013 — Job queries link reloaded the whole page

- **Status:** Resolved (2026-09-25)
- **Detail:** Link is now `#/dashboard/queries?job=<id>`; `queries.js` reads the param, so the client is not re-selected and the page is not refreshed.

## ISS-012 — Job-name click opens popup everywhere

- **Status:** Resolved (2026-09-25)
- **Detail:** All job-name cells (Jobs, Workflow, Budget, Turnaround, Movement, Feedback, Allocation, Queries, Home yesterday table) call `CP.showJob()`; rows without `job_id` (Workflow) fall back to name lookup.

## ISS-011 — Backend/Angular work outside the prototype

- **Status:** Open (deployment)
- **Detail:** Same session also added the Angular Workflow module, Laravel `get-workflow-standup` and `get-job-feedback` routes, React widget job-information changes and a batched attachments call in `api-queries` (`QueryRepository.cs`) that must be published to the hosted .NET service. Not part of the prototype.

## ISS-010 — Dev-branch model assumptions

- **Status:** Open (assumption)
- **Detail:** 26-column Jobs table and BS/BK/FP status sets follow the dev branch as read on 2026-09-24. Filters drawer defaults to FY 2026; Received/Commenced period filters are inclusive.

## ISS-009 — Balance definition on Movement (assumption)

- **Status:** Open (assumption)
- **Detail:** The real Movement screenshots only show zeros. Balance is implemented as `actual − target` (negative = short, red). The real portal may define it as `target − actual` or remaining work.

## ISS-008 — 24 column set and Report mode on Job Status (assumption)

- **Status:** Open (assumption)
- **Detail:** Only the first 12 columns are visible in the screenshots (GroupJobName … YetToStartDate). The remaining 12 (DueDate, Manager, Associate, Reviewer, JobYear, Priority, BudgetHrs, ActualHrs, LastModified, JobID, Vertical, SubClient) are invented to reach "24/24 selected". The "Report" toggle was not shown in any screenshot; it renders a status × partner matrix as a stand-in.

## ISS-007 — Yellow status tiles = client-held (assumption)

- **Status:** Open (assumption)
- **Detail:** Derived from the legend chips (client name vs Carisma Solutions). Confirmed by the user's description that the chip "tells which side holds the job". Which exact statuses are client-held (Sent For Queries / Review / Final Review) was inferred from the screenshot colouring.

## ISS-006 — Prototype needs internet (CDN)

- **Status:** Open (by design)
- **Detail:** Tailwind Play CDN, htmx, Alpine, and Google Fonts (including Material Symbols) all load from CDNs. Offline or firewalled servers render unstyled/blank pages. If needed, vendor the files into `assets/vendor/` and repoint `app.html` and the auth pages. The Tailwind Play CDN is also not intended for production use — acceptable for a prototype.

## ISS-005 — Unused fields left in `auth/clients.json`

- **Status:** Open (cosmetic)
- **Detail:** `contracts`, `sub_clients`, `city`, `abn`, `account_manager` remain from the first iteration and are not read by the current UI (profile data comes from `clients/<id>/profile.json`). Safe to delete when convenient.

## ISS-004 — Login page: input borders/placeholders too dark

- **Status:** Resolved (2026-09-24)
- **Root cause:** The Tailwind forms plugin sets border colour and font size on inputs and outranked `.auth-input`.
- **Fix:** `.auth-input` uses `!important` for border, padding and font size (`assets/css/app.css`).

## ISS-003 — Static server crashed on `//` request paths

- **Status:** Resolved (2026-09-24)
- **Symptom:** `GET //` made `new URL('//', base)` throw and killed `server.js` (pm2 would restart it, dropping requests).
- **Fix:** Parse the path with `req.url.split('?')[0]` inside try/catch; bad percent-encoding returns 400; traversal outside the folder returns 403. Verified with curl.

## ISS-002 — Filters dropdown broke Job Status table toolbar

- **Status:** Resolved (2026-09-24)
- **Symptom:** Alpine errors `filters is not defined` / `f is not defined` when rendering the toolbar.
- **Root cause:** `x-text` was placed on the `<label>` that also contained the `<select>`; `x-text` replaced the label's children, destroying the select mid-initialisation.
- **Fix:** Label text moved into its own `<span x-text>`. Lesson: never put `x-text` on an element that contains other bound elements.

## ISS-001 — Job timeline wrapped onto several lines

- **Status:** Resolved (2026-09-24)
- **Symptom:** Jobs with many status changes wrapped the horizontal timeline.
- **Fix:** Container is `flex-nowrap overflow-x-auto`, items `shrink-0` (`views/dashboard/job-status.html`); verified scroll width > client width.

## Known behaviours (not bugs)

- Replying to a query changes its status to Responded, which can remove it from an active KPI-filtered list; opening a job therefore clears the KPI filter.
- Instructions, replies, bookmarks and downloads are simulated; state lives in memory and resets on reload.
- The Alpine `x-component` fragments depend on the parent scope's variable names; renaming a page variable can silently break a component.
