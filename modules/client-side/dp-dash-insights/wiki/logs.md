# Logs

## 2026-06-26 — Feature: Animated spinner for tab loading states

- Replaced the plain text `Loading…` `LoadingState` in all 4 tab components (UtilizationTab, FeedbackTab, AppreciationTab, KeyUpdatesTab) with a centered maroon SVG spinner using Tailwind's `animate-spin`

## 2026-06-25 — Fix: Key Updates API returning `Unknown database 'metrics_report'`

- Backend `POST /api/client/dashboard/insights/key-updates` was using `DB::connection('records_mysql')` to query the `metrics_report` schema, which only exists on the Works Manager MySQL server, not the local records DB
- Fixed by changing both `DB::connection` calls in the `key-updates` route handler (`routes/dashboard/insights.php`) to `wm_mysql`

## 2026-06-25 — Fix: `process is not defined` error in browser (Vite build)

- Added `define: { 'process.env.NODE_ENV': JSON.stringify('production') }` to `vite.config.ts`
- Root cause: IIFE build format for browser use, but a dependency referenced `process.env.NODE_ENV` which doesn't exist in browsers; Vite does not replace it automatically unless explicitly defined
- Requires a rebuild and redeploy of `dist/widget.js` to prod server

## 2026-06-24 — Key Updates tab added

- Added `'key-updates'` to `TabId` union in `AppContext.tsx`; set as the default active tab
- Added `KeyUpdatesTab.tsx` — fetches from new `POST /client/dashboard/insights/key-updates` endpoint; does NOT use `useTabData` to avoid vertical fan-out (key updates are month-level data, not vertical-scoped)
- Items from DB: first item rendered as intro card (light blue bg, `#1e3c72` top border); subsequent items as gradient-left-bordered cards with ✓ badge
- Descriptions rendered via `dangerouslySetInnerHTML` (DB content may contain HTML markup)
- Images deferred: `image_count` returned from API; renders N grey placeholder boxes (`Image unavailable`) per item
- Added `keyUpdates` to `apiRoutes.insights` in `api-routes.ts`
- Added Key Updates as first tab in `TabNav.tsx` ROW1_TABS
- Added `<KeyUpdatesTab />` panel in `App.tsx` (all panels stay mounted for cache preservation)
- Backend: new `POST /client/dashboard/insights/key-updates` route in `insights.php`; queries `metrics_report.tbl_keyupdate` JOIN `tbl_keyupdatelist` via `records_mysql` connection; converts `MM-yyyy` → `yyyy-MM` for DB query; counts `tbl_keyupdatelistimage` rows per item; returns `[{ id, description, image_count }]`

## 2026-06-24 — UtilizationTab: handle SP sentinel rows (TOTAL + CAPACITY)

- SP returns two special rows at the end of every result: `ContractType: "TOTAL"` (aggregate totals) and `ContractType: "CAPACITY"` (capacity percentage)
- These are now filtered out of the table body using `tableRows` — only associate rows are rendered
- CAPACITY row's `Capacity_Total` (e.g. `"95 %"`) is read directly for the Monthly Capacity KPI card; removed stale `%` append since SP already includes it
- TOTAL row values are used directly in the tfoot instead of the old client-side `sum()` function; `sum()` removed
- Footer falls back to `'—'` if the TOTAL row is absent

## 2026-06-24 — FeedbackTab and UtilizationTab: fix SP field name mismatches + KPI wiring

### FeedbackTab
- Updated `FeedbackRow` interface to use actual SP column names with spaces (`'Feedback Given By'`, `'Feedback Given To'`, `'Feedback Given Date'`, `'Job Name'`); all JSX references updated to bracket notation
- Added `FeedbackSummary` interface with correct SP column names: `Feedback`, `TotalJobs`, `Percentage` (from `SP_Feedback_Percentage_shibu`)
- Added new backend endpoint `POST /client/dashboard/insights/feedback-summary` in `insights.php` calling `SP_Feedback_Percentage_shibu`
- Added `feedbackSummary` to `apiRoutes.insights` in `api-routes.ts`
- Added second `useTabData` call in `FeedbackTab` for summary data; KPI cards now read from `summaryData[0]` with correct field names

### UtilizationTab
- Updated `UtilizationRow` interface: `ModeOfContract` → `ContractType`, `CommittedHrs` → `MonthBudget`, `CapacityPercent` → `Capacity_Total`; added index signature for dynamic month keys
- Added `spMonthKey()` utility in `month.ts` — formats a month value as `Mar-2026` to match SP dynamic column names
- Fixed dynamic month column data access: replaced `row.Month2Hrs/Month1Hrs/MonthHrs` with `row[spKey0/1/2]` using computed SP key strings
- Fixed month column headers: now subtracts 3/2/1 from selected month (was 2/1/0), aligning with what the SP actually returns (3 months prior to selected month)

## 2026-06-24 — AppreciationTab: fix SP field name mismatches + crash

- Updated `AppreciationRow` interface to match real SP column names (all have spaces: `Appreciation Given To`, `Appreciation Given By`, `Job Name`, `Appreciation Given Date`, `Vertical`, `Description`)
- Removed `PersonName`, `JobLabel`, `AppreciationDate`, `Message`, `ImageUrl` — all were placeholder guesses that caused the blank page crash (`initials()` received `undefined`)
- Added null guard to `initials()` to prevent crash if name is ever missing
- Card now displays: recipient name + job, vertical badge, date, message blockquote, and "Appreciated by" attribution line

## 2026-06-24 — Switch from client_id to project_id

- All three `insights.php` endpoints (utilization, feedback, appreciation) now read `project_id` from the request body instead of `client_id`; the value is passed as the second argument to each stored procedure (the Works Manager company ID)
- `main.tsx` now parses `project_id` from the `userdata` attribute alongside `client_id` and `company_id`
- `App.tsx` and `AppProvider` updated to accept and thread `projectId` through the React tree
- `AppContext` updated: `projectId: string | null` added to context interface and provider value
- `FilterBar.tsx` updated: verticals fetch body changed from `{ client_id: companyId }` to `{ project_id: projectId }`
- `useTabData.ts` updated: API request body now sends `project_id` instead of `client_id`; cache key uses `projectId` instead of `clientId`
- In dev seed data (`user-data.ts`), `project_id: 33` is the relevant value (previously `client_id: 1012` was incorrectly used)

## 2026-06-23 — company_id + vertical id changes

- Extracted `company_id` from `userdata` attribute in `main.tsx` alongside `client_id`; both now flow through `App.tsx` → `AppContext` as `companyId` and `clientId`
- `FilterBar` now POSTs `{ company_id }` (not `client_id`) to `/api/client/get-verticals`; backend (`routes/common.php`) updated to read `$request->input('company_id')` accordingly
- `index.html` changed from a hardcoded `<dp-dash-insights userdata='...'>` element to `<div id="root">` — dev preview block in `main.tsx` now owns element creation with full seed data (fixes `company_id` being null in dev)
- Vertical identifier changed from `wm_vertical_id` → `new_service_id`; `Vertical` interface, toggle/remove/lookup logic, and dropdown option values all updated in `FilterBar.tsx`
- Deduplication by `new_service_id` added to the verticals fetch handler — prevents duplicate titles from appearing when the same vertical has multiple `engagement_id` rows (e.g. `code: "staff"` and `code: "agreed"`)

## 2026-06-23 — Dev seed data

- Created `src/src/core/seeds/user-data.ts` (copied from dp-dash-movement) with mock user including `client_id: 1012`
- Updated `main.tsx` dev preview block to instantiate `<dp-dash-insights>` with `userdata` attribute set from seed data — mirrors dp-dash-movement pattern

## 2026-06-23
- Wiki initialised for `dp-dash-insights`
- Project is a freshly scaffolded Vite + React 19 + TypeScript 6 project (default Vite starter, App.tsx not yet customised)
- Tailwind CSS not yet installed (REQ-001 pending)
- No custom components exist yet — all Phase 1 work (filter bar, tabs, Laravel endpoints) is planned but not started
- Requirements documented in `requirements/phase-4/insights-dashboard/`

### Stage 1 — Project Foundation (REQ-001, REQ-002)
- Installed Tailwind CSS v4, `@tailwindcss/postcss`, `autoprefixer`, `vite-plugin-css-injected-by-js`
- Note: Tailwind v4 requires `@tailwindcss/postcss` (not `tailwindcss`) in PostCSS config, and `@import "tailwindcss"` in CSS (replaces the v3 `@tailwind` directives)
- Created `postcss.config.cjs` using `@tailwindcss/postcss`
- Replaced `src/index.css` with `@import "tailwindcss"` — all Vite scaffold styles removed
- Updated `vite.config.ts` for library mode: IIFE format, single `dist/widget.js` output, CSS inlined by plugin
- Rewrote `main.tsx` to register `<dp-dash-insights>` as a Custom Element; parses `userdata` attribute on `connectedCallback` and extracts `client_id`; mounts React into a Light DOM child `<div>`
- Updated `App.tsx` to accept `clientId` prop; renders a Tailwind smoke-test paragraph (to be replaced in Stage 2)
- Build verified: `dist/widget.js` produced, no separate CSS file, TypeScript clean

### Stage 2 — Shell UI (REQ-003, REQ-004)
- Added `@theme { --color-maroon: #8B1A2E }` to `index.css` — exposes brand color as Tailwind token (`text-maroon`, `bg-maroon`, `border-maroon`, etc.)
- Created `src/context/AppContext.tsx` — holds `clientId`, `month`, `verticals`, `appliedFilters` (null until Apply clicked), `activeTab`; `applyFilters()` snapshots month+verticals into `appliedFilters`
- Created `src/components/FilterBar.tsx` — Month dropdown (last 13 months, MM-YYYY), Vertical tag multi-select (hardcoded list, to be replaced with API data in Stage 4), Apply button
- Created `src/components/TabNav.tsx` — two-row layout; Row 1 has Utilization/Feedback/Appreciation tabs with maroon underline on active; Row 2 is an empty placeholder strip
- Updated `App.tsx` to wrap everything in `AppProvider`, render `FilterBar` + `TabNav` + empty content panel (Stage 4)
- Fixed `verbatimModuleSyntax` errors: type-only imports use `import type`
- Build verified: `dist/widget.js` 595 kB, TypeScript clean

### Stage 3 — Backend API (REQ-009, REQ-010)
- Created `core/backend/api-reports/routes/dashboard/insights.php`
- Auth pattern: `auth:sanctum` applied at the route group level; `client_id` resolved via `UserDetails.company_id → Companies.works_manager_client_id` — never read from request params
- `vertical_id` defaults to `0` when absent (no-filter sentinel, same convention as movement.php)
- 3 GET endpoints:
  - `GET /api/client/dashboard/insights/utilization` → `SP_AssociateProductivity_Last3Months(month, client_id, vertical_id)`
  - `GET /api/client/dashboard/insights/feedback` → `sp_ClientFeedback_ClientDelivery_shibu_1(month, client_id, vertical_id)`
  - `GET /api/client/dashboard/insights/appreciation` → `sp_ClientAppreciation_ClientDelivery(month, client_id, vertical_id)`
- Registered in `dashboard-home.php` with `require __DIR__.'/insights.php'`

### Stage 4 — Tab Components (REQ-005, REQ-006, REQ-007)
- Created `src/config/api-routes.ts` — production base URL `https://pqreports.welingkaronline.org/api`; dev URL commented; 3 insights endpoint paths
- Created `src/utils/month.ts` — `parseMonth`, `subtractMonths`, `formatMonthValue`, `monthShortLabel`
- Created `src/hooks/useTabData.ts` — generic lazy-fetch hook; only fetches when tab is active AND filters applied; caches results per filter key (month|verticals); vertical fan-out structure in place (TODO: swap vertical names for IDs once verticals endpoint integrated)
- All 3 tab components stay mounted in App.tsx (hidden with `hidden` class when inactive) so cache is preserved across tab switches
- Created `UtilizationTab.tsx` — capacity % KPI card + rolling 3-month table with dynamic headers + TOTAL footer row
- Created `FeedbackTab.tsx` — 3 KPI cards + feedback details table; date range header computed from selected month
- Created `AppreciationTab.tsx` — reverse-chronological card list; initials avatar fallback; blockquote message style
- SP field names are placeholder guesses from plan column names — must be verified and corrected in Stage 5 against real SP output
- Build: `dist/widget.js` 610 kB, TypeScript clean

### Stage 5 — Verticals API Integration
- Replaced hardcoded `VERTICALS` string array in `FilterBar.tsx` with a live fetch from `GET /api/client/get-verticals`
- `FilterBar` fetches on mount; displays `title`, stores `id` (numeric) as the selected value
- Shows "Loading…" while fetching, inline error message on failure
- `AppContext` `verticals` and `AppliedFilters.verticals` changed from `string[]` to `number[]`
- `useTabData.ts` `targets` type tightened from `(string | null)[]` to `(number | null)[]`; TODO comment removed — `vertical_id` is now a real integer ID
- `apiRoutes.client.get.getVerticals` endpoint added to `api-routes.ts` (done by user prior to this change)

### Stage 5 — Integration & Verification (in progress)
- Discovered `dashboard-home.php` is an orphaned file — never required by `api.php`; removed the `insights.php` require from it to avoid future double-registration
- Registered `insights.php` directly in `routes/api.php` alongside `dashboard/movement.php` — this is the actual load point for all routes in this service
- Remaining steps are manual runtime verification (see plan Stage 5 checklist)

## 2026-06-23 (wiki update)
- Updated architecture.md to reflect current completed state: all 5 components implemented (FilterBar, TabNav, UtilizationTab, FeedbackTab, AppreciationTab), AppContext, useTabData hook, api-routes.ts, month.ts utils
- Project structure section updated with actual file tree
- Tailwind v4 noted as installed (not pending)
- Vite confirmed in library mode: IIFE output, dist/widget.js ~610 kB, CSS inlined
- Endpoints confirmed live: 3 POST routes via insights.php registered in api.php; all call SPs via wm_mysql connection
- SP field names (UtilizationRow, FeedbackRow, AppreciationTab) flagged as placeholder guesses — must be verified against real SP output
- api-routes.ts currently in dev mode (localhost:8001) — prod URL commented out; must toggle before deploy
- Security note added: client_id is currently trusted from request body (passed from Angular userdata attribute), not derived server-side from auth session — deviates from original design intent
