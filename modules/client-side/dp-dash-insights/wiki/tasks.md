# Tasks

## 2026-06-23

- [TSK-20260623-01] [no-req] Analyzed Insights Dashboard screenshots; wrote requirements doc with REQ-001 to REQ-010 in req-insights-dashboard.md and req-tasks.md — complete
- [TSK-20260623-02] [no-req] Initialized dp-dash-insights wiki (architecture.md, index.md, issues.md, logs.md) and wrote Phase 1 five-stage implementation plan — complete
- [TSK-20260623-03] [no-req] Converted Vite scaffold to web component; installed Tailwind; rewired main.tsx and index.html for custom element registration — complete
- [TSK-20260623-04] [no-req] Set up backend insights.php routes in api-reports: changed GET to POST, removed auth:sanctum middleware, read client_id from request body — complete
- [TSK-20260623-05] [no-req] Created core/seeds/user-data.ts for dev preview; fixed index.html to use div#root; switched vertical identifier to new_service_id; added deduplication in FilterBar dropdown — complete
- [TSK-20260623-06] [no-req] Replaced hardcoded VERTICALS array with live /get-verticals API fetch in FilterBar; changed verticals type to number[]; fixed POST method and clientId passing — complete
- [TSK-20260623-07] [no-req] Updated backend and frontend wiki with architecture context, active Angular projects, module mapping, and insights.php route registration — complete
- [TSK-20260623-08] [no-req] Documented resolved hardcoded database names issue (27 occurrences across 5 backend files); user applied the env() fix — complete

---

## 2026-06-24

- [TSK-20260624-01] [no-req] Threaded company_id from userdata attribute through main.tsx → App → AppContext → FilterBar; fixed Laravel get-verticals route to read company_id — complete
- [TSK-20260624-02] [no-req] Refactored all insights endpoints and AppContext to use project_id in place of client_id throughout frontend and backend — complete
- [TSK-20260624-03] [no-req] Analyzed C# LoadKeyUpdates() data model; added backend POST /client/dashboard/insights/key-updates route with JOIN query, image count, and month format conversion (MM-yyyy → yyyy-MM) — complete
- [TSK-20260624-04] [no-req] Built KeyUpdatesTab component using direct fetch (not useTabData); wired into AppContext, App.tsx, TabNav, and tab panel renderer — complete
- [TSK-20260624-05] [no-req] Fixed AppreciationTab crash when PersonName undefined; rewrote interface with real SP column names using quoted keys; switched to initials-only avatar; logged ISS-001 — complete
- [TSK-20260624-06] [no-req] Fixed field name mismatches in FeedbackTab and UtilizationTab; added spMonthKey() helper to format month as Mar-2026 for SP dynamic column names — complete
- [TSK-20260624-07] [no-req] Added feedback-summary backend route calling SP_Feedback_Percentage_shibu; wired to FeedbackTab KPI cards — complete
- [TSK-20260624-08] [no-req] Fixed sentinel row filtering in FeedbackTab and UtilizationTab (TOTAL and CAPACITY rows excluded from table body); logged ISS-002 and ISS-003 — complete

---

## 2026-06-25

- [TSK-20260625-01] [no-req] Diagnosed key-updates route failing due to wrong DB connection (records_mysql has no access to metrics_report) — analysis only
- [TSK-20260625-02] [no-req] Fixed key-updates wrong DB connection (records_mysql → wm_mysql); logged resolved issue in backend and dp-dash-insights wikis — complete
- [TSK-20260625-03] [no-req] Fixed attribute name mismatch in main.tsx connectedCallback (Angular sets user-data with hyphen; component was reading userdata without) — complete
- [TSK-20260625-04] [no-req] Added setTimeout defer in main.tsx connectedCallback for Angular attribute binding timing; fixed FilterBar verticals POST body sending project_id under wrong key (client_id) — complete
- [TSK-20260625-05] [no-req] Diagnosed widget.js 404 on prod (file not deployed to /var/www/dp-tools/dp-insights/); investigated CORS error post-deployment — complete
- [TSK-20260625-06] [no-req] Fixed Vite config: added process.env.NODE_ENV define block to resolve 'process is not defined' browser error on prod; logged ISS-004 — complete
- [TSK-20260625-07] [no-req] Investigated dashboard master is_active filter in Angular; resolved as a prod DB data issue, no code change needed — complete
- [TSK-20260625-08] [no-req] Diagnosed missing insights entry in Angular dashboardTypes object causing Insights tab not to render; analysis only per user instruction — complete

---

## 2026-06-26

- [TSK-20260626-01] [no-req] Replaced plain text LoadingState with centered animated maroon SVG spinner in all 4 tab components — complete
- [TSK-20260626-02] [no-req] Updated dp-dash-insights wiki/logs.md with spinner change entry — complete
- [TSK-20260626-03] [no-req] Scanned all 17 prior chat transcripts to compile complete task history for tasks.md — complete
- [TSK-20260626-04] [no-req] Proposed disabling Apply button in FilterBar when no verticals are selected (awaiting confirmation)

---
