# Screens

Every screen was matched to screenshots of the real portal supplied by the user (Angular shell + `dp-dash-movement`). Colours: brand maroon `#811331`, navy `#1f2a6b`, panel `#f5f5f6`.

## Shell (`app.html`)

- Header: Carisma logo, weekday + date ("September 24, 2026"), calendar icon, notification bell (per-client `notifications.json`), user name + initials avatar (links to profile).
- Sidebar (no box): Delivery Dashboard, Reports, —, Newsletter, Knowledge Center, IT Guidelines, Team, Calendar, —, About Carisma; bottom: Version 1.5, FAQ, Contact Us, —, Logout.
- Content sits in a large rounded panel. Dashboard routes show the pill-tab bar `Job ▸ · Movement | Job Status | Queries`; Movement also shows a "Help" pill (non-functional).
- No client/user dropdowns (the real observer-mode dropdowns were intentionally left out).

## Auth (`pages/auth/`)

Split layout copied from the real login: form column on the left over a white-fade background, banner card on the right (`components/auth-hero.html`). Banner image is a copy of `login-banner-1.jpg` from the Angular `reports` assets. Prototype-only helpers: two demo-credential buttons on the login page and an "Autofill OTP" card button on the OTP page (fills the mock OTP `123456`).

## Dashboard

### Movement — `#/dashboard/movement` · `views/dashboard/movement.html` · `movementPage`
- Date range (From/To, default 2026-09-23), read-only "Touch Points Updated On", refresh.
- Legends: DWP = Draft Work Paper, RDWP = Revised Draft Work Paper.
- **Total** card = actual touch points in range.
- Two summary tables (Touch Points, Completed DWP): Target `n ( x Nd)` (N = working days in range), Actual (clickable → side drawer listing the jobs), Balance = actual − target (negative shown red).
- Data: `clients/<id>/movement.json` (14 days; weekends have target 0).

### Job Status — `#/dashboard/job-status` · `views/dashboard/job-status.html` · `jobStatusPage`
- Vertical segmented buttons (per client) and Live Data / Report toggle. Changing vertical resets status filter and closes job tabs.
- Status strip: WIP Processing, Sent For Queries, WIP Query Replies, Sent For Review, WIP Review Replies, Sent For Final Review, Job Completed, Total Live Jobs, Total All Jobs. Clicking a tile filters the table. **Yellow = job is with the client, green = completed, white = with Carisma**; the legend chips ("<Client>" / "Carisma Solutions") explain this.
- Jobs List table: 24 columns (`#` + 23 fields), column chooser, Filters (Partner/Director/Financial Year), Refresh (spinner only), Download (toast), search, page size 10/20/30, Bookmark Page (toast), first/prev/next/last.
- Job detail opens as an extra folder tab beside "Jobs List" (Shift+click opens in background). Detail: header (Close, name, last modified, associate, status), **horizontal-scrolling** timeline with "N day" gaps, Basic Details, Financial Information, Budget bar (actual/budget hours), Job Details, Instructions panel (in-memory instructions, standard instructions, "Request to mark as priority").
- Report mode: work status × partner matrix for the selected vertical. (Not in the real screenshots — a simple stand-in.)

### Queries — `#/dashboard/queries` · `views/dashboard/queries.html` · `queriesPage`
- KPI tiles: Query Status (Open/Responded/Resolved/Closed), Query Aging (0–5 / 5–10 / >10 days), Query Criticality (Low/Normal/Medium/High). Click a tile to filter the job list (click again to clear).
- Level 1 — jobs with queries: maroon-header table (Id, Name, Sub Client, Vertical, FY, JY, Last Query, Total Queries, Open, Resolved), search, numbered pager. "Job Filters / Query Filters Coming Soon…" bars are static placeholders, as in the real portal.
- Level 2 — queries for a job ("All Jobs / Queries for the job"): job header chips, Card View / Table View, query cards (Needs Attention badge for Open, category, raised by, criticality, elapsed, status, posted on, description, Documents button, thread). First card expanded by default; "Reply back" adds a client message (status Open → Responded). Opening a job clears any KPI filter.

## Reports — `#/reports/connect|weekly|invoices` · `views/reports/*` · `content('client','reports'|'invoices')`
Pill sub-tabs; searchable/paged tables with simulated Download (toast). Invoices show Outstanding / Overdue / Paid totals.

## Content pages — `views/content/*`
Newsletter, Knowledge Center (category chips), IT Guidelines, Team (client-specific), Calendar (holidays table), FAQ (accordion), About Carisma, My Profile, Contact Us (form → toast). All load one JSON file through the generic `content(kind, name)` component.

## Not built
System/version page, chat, forgot-password flow, the removed dashboard tabs (Monthly Connect, Status, Feedback, Insights).
