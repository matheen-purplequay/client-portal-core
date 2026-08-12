# Dashboard Module

**Type:** module
**Last updated:** 2026-06-23
**Related pages:** [[module-reports]], [[concept-data-service]], [[entity-job]], [[entity-client]], [[concept-web-components]]

---

## Overview

The Dashboard module is the core of the `reports` project. It provides clients with a multi-view, filterable dashboard showing job metrics, charts, and reports for their wealth management work. It lives at the `/dashboard` route and is lazy-loaded.

**Source:** `projects/reports/src/app/modules/dashboard/`

---

## Routes

| Path | Component | Purpose |
|------|-----------|---------|
| `dashboard/home` | `DashboardHomeComponent` | Main metrics dashboard (default) |
| `dashboard/connect-reports` | `ConnectReportComponent` | Monthly connect reports listing |
| `dashboard/weekly-reports` | `WeeklyReportComponent` | Weekly reports listing |
| `dashboard/newsletters` | `NewslettersComponent` | RSS newsletters |
| `dashboard/knowledge-center` | `KnowledgeCenterComponent` | Knowledge center |
| `dashboard/my-team` | `MyTeamComponent` | Team members view |
| `dashboard/it` | `ItComponent` | IT support |
| `dashboard/faq` | `AboutComponent` | FAQ page |
| `dashboard/calendar` | `HolidaysComponent` | Holidays calendar |
| `dashboard/chat` | `ChatComponent` | Chat interface |

---

## Dashboard Home — `DashboardHomeComponent`

The main component (`dashboard-home.component.ts`) is ~2000 lines and is the most complex component in the module. It manages all filtering state, data fetching, and chart rendering.

### Dashboard Types (tabs)

Users switch between these views via the `filterDashboardType` tab group.

**5 active tabs shown to clients:**

| Name | Description |
|------|-------------|
| Job Movement | Touch-point counts and job details in real-time |
| Monthly Connect | Job status, productivity, and budget vs actual by month |
| Job Status | Job status breakdown |
| Feedback Status | Feedback metrics |
| Queries | Client queries |

**Not currently shown:**
- Realtime (Workflow status charts, ToA line chart, JFT) — exists in code but not active in client-facing build
- Business Service Movement — BS-specific movement dashboard, not active in client-facing build

### Contract Type Filter (tabs)

Filters all data by contract type:

| Index | Contract |
|-------|---------|
| 1 | Staff |
| 2 | Hourly |
| 3 | Agreed |

### Vertical Filter

Users can filter by business vertical (e.g. Business Services, SMSF, Bookkeeping). Verticals are fetched from the API and populated per client. The `selectedVertical` object drives all downstream data fetches.

### Job Movement Dashboard

Displays touch-point counts in five buckets: **In Progress**, **Query**, **DWP**, **RDWP**, **Total**. Also shows job details with sub-client filtering. Timestamps show when data was last updated.

Key methods:
- `getJobMovementDashboardData()` — orchestrates all job movement fetches
- `getTouchPointCountFromService()` — fetches counts
- `getTouchPointDetailsFromService()` — fetches per-job rows
- `getJobStatusFromService()` — fetches job status breakdown

### Monthly Dashboard

Three panels shown together:
1. **Job Status by Contract Type** — `jsConfig` (Chart.js)
2. **Monthly Productivity** — committed hours, job hours, overheads → `mpConfig`
3. **Budget vs Actual** — `bvaFilters` → `bvaConfig`
4. **Agreed Jobs (3-month view)** — `agreedJobs` table

### Realtime Dashboard

Three charts:
1. **Workflow Status** — `wfConfig`, fetched via `getWFStatusFromService()`
2. **Time on Activity (ToA)** — `toaConfig`, line chart
3. **Jobs Flow Throughput (JFT)** — `jftConfig`

### Chart Refresh Pattern

Charts are refreshed via BehaviorSubject, not direct DOM calls:
```typescript
refreshChart(type: string) // emits on a BehaviorSubject
// child chart components subscribe and re-render on emission
```

### Visibility Rules

`getRulesByClient()` fetches per-client visibility rules. `getVisibilityRule(rule)` checks if a given dashboard section should be shown. This is how certain clients see/hide specific panels.

### Export

`exportJobStatusDetails()` exports the job status table as an Excel file.

---

## Connect Report Component

Displays monthly "Connect Reports" (PDF files). Features:
- Month/year selector with Australian financial year logic
- Lists reports for the selected period
- Integrates with `ReportService.getConnectReports(month, year)`

---

## Weekly Report Component

Same pattern as Connect Reports but scoped to weekly reports. Uses `ReportService.getWeeklyReports(month, year)`.

---

## Key Dependencies

| Service | Used for |
|---------|---------|
| `ChartDataService` | All dashboard metric and chart data fetching |
| `ReportService` | Connect and weekly report file fetching |
| `ClientService` | Verticals and client user data |
| `DataService` | Underlying HTTP wrapper for all calls (see [[concept-data-service]]) |

**Third-party libraries:**
- **Chart.js** + `chartjs-plugin-datalabels` — all charts
- **date-fns** / **moment-timezone** — date filtering
- **html2canvas** — screenshot/export capability
- **CKEditor5** — rich text in feedback/chat
- **NgxPagination** — paginated tables

---

## References
- Module: `projects/reports/src/app/modules/dashboard/dashboard.module.ts`
- Routing: `projects/reports/src/app/modules/dashboard/dashboard-routing.module.ts`
- Main component: `projects/reports/src/app/modules/dashboard/dashboard-home/dashboard-home.component.ts`
- Chart data service: `projects/reports/src/app/services/dashboard/chart-data.service.ts`
