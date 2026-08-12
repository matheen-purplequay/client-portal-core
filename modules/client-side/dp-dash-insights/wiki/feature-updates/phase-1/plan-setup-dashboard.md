# Insights Dashboard — Phase 1 Setup Plan

**Phase:** 1
**Status:** In Progress

## Goal

Build and embed the `dp-dash-insights` React web component into the client portal, delivering three tabs — Utilization, Feedback, and Appreciation — backed by Laravel API endpoints that call existing stored procedures.

Refer /requirements/phase-4/insights-dashboard/req-tasks.md and /requirements/phase-4/insights-dashboard/req-insights-dashboard.md for more details.

## Folders you have to work with

### Frontend - React web component

modules/client-side/dp-dash-insights/
├── CLAUDE.md
├── wiki/
│   ├── architecture.md
│   ├── issues.md
│   ├── logs.md
│   ├── index.md
│   └── feature-updates/phase-1/plan-setup-dashboard.md
└── src/                          ← Vite + React project root
    ├── vite.config.ts
    ├── package.json
    ├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
    ├── eslint.config.js
    ├── index.html
    ├── public/
    │   ├── favicon.svg
    │   └── icons.svg
    └── src/                      ← application source
        ├── main.tsx              ← entry point (web component registration goes here)
        ├── App.tsx
        ├── App.css
        ├── index.css             ← Tailwind directives go here
        └── assets/


### Backend - Laravel API

core/backend/api-reports/routes/dashboard/
├── dashboard-home.php
├── movement.php                  ← reference pattern for insights.php
├── reports.php
└── insights.php                  ← to be created (Stage 3)


## Scope

**Included:**
- Tailwind CSS setup
- Web component bootstrap (userdata from Angular)
- Global filter bar (Month + Vertical)
- Tab navigation with lazy data fetching
- Utilization, Feedback, and Appreciation tabs
- Laravel route file with 3 endpoints

**Excluded:**
- PDF download (REQ-008, P2 — deferred)
- All other tabs (SLA Adherence, Key Updates, Know Your Client, etc.)

---

## Tasks

### Stage 1 — Project Foundation ✅

- [x] **[REQ-001]** Install Tailwind CSS
  - Installed `tailwindcss` v4, `@tailwindcss/postcss`, `autoprefixer`, `vite-plugin-css-injected-by-js`
  - Created `tailwind.config.js` and `postcss.config.cjs` (v4 uses `@tailwindcss/postcss` plugin, not `tailwindcss` directly)
  - Replaced `src/index.css` with `@import "tailwindcss"` (v4 single import)
  - Smoke-test class renders correctly in `App.tsx`

- [x] **[REQ-002]** Bootstrap web component with Angular `userdata` integration
  - `vite.config.ts` configured for library mode — IIFE format, single `dist/widget.js`, CSS inlined by plugin
  - `<dp-dash-insights>` registered as Custom Element in `main.tsx`
  - `connectedCallback` parses `userdata` attribute and extracts `client_id`
  - `client_id` passed as prop to `App` — never rendered or exposed

---

### Stage 2 — Shell UI ✅

- [x] **[REQ-003]** Implement global filter bar
  - `Month` dropdown — format `MM-YYYY`, default to current month
  - `Vertical` multi-select tag input with removable tags; list hardcoded for now (swapped in Stage 4 when API is ready)
  - `Apply` button — sets `appliedFilters` in context, which tabs watch to trigger fetches
  - Filter state lives in `AppContext`, passed to all children

- [x] **[REQ-004]** Implement tab navigation
  - Two-row tab layout (Row 1: Utilization, Feedback, Appreciation; Row 2: reserved — empty placeholder)
  - Active tab highlighted with dark maroon (`#8B1A2E`) underline indicator via `border-maroon` Tailwind token
  - `activeTab` stored in context; lazy fetch logic wired in Stage 4 when tab content components exist

---

### Stage 3 — Backend API ✅

- [x] **[REQ-009]** Create Laravel route file `core/backend/api-reports/routes/dashboard/insights.php`
  - Follows the `routes/dashboard/movement.php` prefix pattern
  - Grouped under `Route::prefix('client')` → `Route::prefix('dashboard')` → `Route::prefix('insights')`
  - All routes protected with `auth:sanctum` middleware (applied at the group level)
  - Response envelope: `['status' => true/false, 'data' => [...]]`
  - Registered in `dashboard-home.php`

- [x] **[REQ-010]** Implement the 3 endpoints — each resolves `client_id` from auth session
  - `GET /client/dashboard/insights/utilization` → calls `SP_AssociateProductivity_Last3Months(month, client_id, vertical_id)`
  - `GET /client/dashboard/insights/feedback` → calls `sp_ClientFeedback_ClientDelivery_shibu_1(month, client_id, vertical_id)`
  - `GET /client/dashboard/insights/appreciation` → calls `sp_ClientAppreciation_ClientDelivery(month, client_id, vertical_id)`
  - `client_id` resolved via `UserDetails → Companies.works_manager_client_id` from Sanctum auth — query param `client_id` is never read
  - `vertical_id` defaults to `0` when omitted (no-filter sentinel, consistent with movement.php SP contract)

---

### Stage 4 — Tab Components ✅

- [x] **[REQ-005]** Implement Utilization tab
  - KPI card: **Monthly Capacity %** with icon — reads `CapacityPercent` from first SP row
  - Table: **Productivity for FTE (Last 3 Months)**
    - Dynamic column headers derived from `appliedFilters.month` via `month.ts` utilities
    - Columns: Mode of Contract, Vertical, Associate Name, Committed Hrs, [Month-2], [Month-1], [Month], Average
    - Footer TOTAL row summing all numeric columns

- [x] **[REQ-006]** Implement Feedback tab
  - 3 KPI summary cards: Feedback count, Total Jobs Received, Performance % — read from first SP row
  - Table: **Client Feedback Details**
    - Header date range: 6 months before selected month → selected month
    - Columns: Feedback Given By, Feedback Given To, Vertical, Feedback Date, Job Name, Description, Action Taken (✗/✓ icon), Hours, Comments

- [x] **[REQ-007]** Implement Appreciation tab
  - Scrollable card list, reverse-chronological order
  - Each card: avatar circle with initials fallback, person name, job label, date (right-aligned), blockquote message

- [x] Supporting infrastructure
  - `config/api-routes.ts` — API base URL + 3 endpoint paths (same pattern as dp-dash-movement)
  - `utils/month.ts` — `parseMonth`, `subtractMonths`, `formatMonthValue`, `monthShortLabel`
  - `hooks/useTabData.ts` — lazy fetch + per-filter cache + vertical fan-out; only fetches when tab is active and filters applied; no re-fetch on revisit
  - SP field names are placeholders from plan — must be verified against real SP output in Stage 5

---

### Stage 5 — Integration & Verification 🔄

- [x] Register `insights.php` in `api.php` — added `require __DIR__.'/dashboard/insights.php'` alongside `dashboard/movement.php`
  - Note: `dashboard-home.php` was discovered to be an orphaned aggregator (never required by api.php); insights.php require was removed from it to avoid future double-registration
- [ ] Test all 3 endpoints with real SP calls against dev database — verify field names match SP output and correct any mismatches in tab components
- [ ] Verify web component mounts correctly inside Angular shell with `userdata` attribute
- [ ] Verify filter Apply triggers correct API calls with right params
- [ ] Verify tab lazy-fetch — switching tabs does not re-fetch when filters haven't changed
- [ ] Verify Vertical multi-select fans out to separate SP calls per vertical

---

## Notes

- `client_id` must never appear in the UI or be passed as a query param — always session-derived server-side
- The Vertical filter may require multiple parallel API calls when more than one vertical is selected (fan-out pattern)
- Build output (`dist/`) must be a single `widget.js` — vite library mode config is required in Stage 1
- PDF download (REQ-008, P2) is intentionally deferred and not part of this plan
