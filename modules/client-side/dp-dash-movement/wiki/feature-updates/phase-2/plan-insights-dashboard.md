# Plan: Insights Dashboard Module (Phase 2)

**Status:** Planning
**Source screenshots:** `docs/phase-2-requirements/insight-dashboard/`

---

## Overview

A new top-level module called **Insights** (or "Engagement Delivery Dashboard") to be added alongside the existing Movement, Dashboard, and Reports modules. It displays engagement, performance, and relationship data for a selected client, organised as a two-row tab navigation across 11 views.

The module is scoped per: **Month**, **Client**, **Vertical** (multi-select), **Budget vs Actual** toggle, and **Compare** period. Filters sit at the top and are applied with an Apply button.

---

## Global Filters Bar

| Filter | Type | Notes |
|--------|------|-------|
| Month | Dropdown | Format MM-YYYY (e.g. 05-2026) |
| Client | Dropdown | Single client selection |
| Vertical | Multi-select tag input | e.g. Business services, SMSF |
| Budget vs Actual | Dropdown | Yes / No |
| Compare | Dropdown | Previous Month, etc. |
| Apply | Button | Triggers data fetch for all tabs |

---

## Tab Structure

Two rows of tabs — 11 tabs total. Only 6 are covered by screenshots; the remaining 5 are listed as stubs.

### Row 1
| # | Tab | Screenshot | Status |
|---|-----|-----------|--------|
| 1 | Key Updates | ✅ | Planned |
| 2 | SLA Adherence | ✅ | Planned |
| 3 | Know Your Client | ❌ | TBD |
| 4 | Utilization | ✅ | Planned |
| 5 | Feedback | ✅ | Planned |
| 6 | Resource Continuity | ❌ | TBD |

### Row 2
| # | Tab | Screenshot | Status |
|---|-----|-----------|--------|
| 7 | Appreciation | ✅ | Planned |
| 8 | Client CSAT Report | ❌ | TBD |
| 9 | Engagement Frequency & Challenges | ✅ | Planned |
| 10 | IT Infra Updates | ❌ | TBD |
| 11 | TAT | ❌ | TBD (overlaps existing reports module) |
| 12 | Budget VS Actual | ❌ | TBD |

---

## Tab Specifications

### Tab 1 — Key Updates

**Purpose:** Monthly narrative updates / announcements from Carisma to the client.

**Components:**
- Section header with megaphone icon: "Key Monthly Updates"
- Numbered list of update items — each item has a title (bold) and body text (rich text / HTML)

**Data fields per item:**
- `item_number`
- `title`
- `body` (rich text)

**Data source:** Stored procedure (TBD — confirm SP name)

---

### Tab 2 — SLA Adherence

**Purpose:** Job pipeline status counts + monthly client report cards.

**Components:**

**A. Job Pipeline Status Bar**
- Horizontal scrollable row of stat boxes
- Each box: label + count
- Statuses: Job Received, Yet To Start, WIP Processing, Sent for Queries, Query Replies Received, WIP Query Replies, Internal Review, WIP Internal Review Replies, Sent for Review, Review Replies Received, WIP Review Replies, Sent for Final Review, Job Completed, On Hold, Cancelled, Total Jobs
- Color-coded border/indicator: Carisma (red) | Client (green) | Total (navy) — legend shown top right

**B. Client Report Cards (per month)**
- Section header: "Client Report : {Month} {Year}"
- Repeats for current + comparison period
- 8 metric cards per section:
  - Total Contracts
  - Total Staff Contracts (with F/H/O breakdown sub-label)
  - Total Hourly Contracts
  - Total Agreed Contracts
  - Total Received Jobs
  - Total Completed Jobs
  - Total Hands On Jobs
  - Total Production Hours
- Each card shows: current value + delta vs comparison (▼/▲ with number)

**Data fields:**
- All job status counts per vertical/client/month
- Contract breakdown (F=Full-time, H=Half-time, O=Other)
- Delta values calculated from comparison period

**Data source:** Stored procedure (TBD)

---

### Tab 3 — Know Your Client

**Purpose:** TBD — no screenshot available.

**Placeholder:** Stub component with "Coming soon" until requirements are confirmed.

---

### Tab 4 — Utilization

**Purpose:** FTE capacity and productivity tracking over the last 3 months.

**Components:**

**A. Monthly Capacity Stat Card**
- Single stat: "Monthly Capacity" — percentage value (e.g. 96%)
- Icon badge

**B. Productivity for FTE Table**
- Header: "Productivity for FTE (Last 3 Months)"
- Dark navy header row
- Columns: Mode of Contract | Vertical | Associate Name | Committed Hrs | [Month-2] | [Month-1] | [Current Month] | Average
- Month column headers are dynamic (e.g. Mar-2026, Apr-2026, May-2026)
- Total row at bottom
- Hours displayed in HH:MM format

**Data fields per row:**
- `mode_of_contract`
- `vertical`
- `associate_name`
- `committed_hrs`
- `hours_month_1`, `hours_month_2`, `hours_month_3`
- `average_hrs`

**Data source:** Stored procedure (TBD)

---

### Tab 5 — Feedback

**Purpose:** Quality & accuracy feedback tracking — feedback instances and performance score.

**Components:**

**A. Stats Row (3 cards)**
- Feedback count for current month (e.g. "Feedback (May 2026): 1")
- Total Jobs Received (e.g. 106)
- Performance % (e.g. 99.06%)

**B. Client Feedback Details Table**
- Header: "Client Feedback Details ({date range})"
- Dark maroon header row
- Columns: Feedback Given By | Feedback Given To | Vertical | Feedback Given Date | Job Name | Description | ActionTaken | Hours | Comments
- ActionTaken: interactive — currently shows red ✕ icon (likely a toggle/button for marking action taken)

**Data fields per row:**
- `feedback_given_by`
- `feedback_given_to`
- `vertical`
- `feedback_given_date`
- `job_name`
- `description`
- `action_taken` (boolean / status)
- `hours`
- `comments`

**Data source:** Stored procedure (TBD)

---

### Tab 6 — Resource Continuity

**Purpose:** TBD — no screenshot available.

**Placeholder:** Stub component.

---

### Tab 7 — Appreciation

**Purpose:** Feed of positive client/staff appreciation messages.

**Components:**

**Feed list (card per item):**
- Avatar (initials-based if no image)
- Associate name + entity/job name + date (right-aligned)
- Message body with left border accent

**Data fields per item:**
- `associate_name`
- `entity_name` (e.g. "GRO Enterprise Pty Ltd")
- `job_ref` (e.g. "Mar 2026 BAS")
- `date`
- `message`

**Data source:** Stored procedure (TBD)

---

### Tab 8 — Client CSAT Report

**Purpose:** TBD — no screenshot available.

**Placeholder:** Stub component.

---

### Tab 9 — Engagement Frequency & Challenges

**Purpose:** Relationship health tracking — engagement cadence, challenges, needs, trends, call history.

**Components:**

**A. Four-panel grid (upper section)**
| Panel | Content |
|-------|---------|
| Engagement Frequency | Text/list of engagement details |
| Challenges | Text/list of recorded challenges |
| Needs & Pain Points | Two subsections: Needs (green ✅) + Pain Points (orange ⚠️) |
| Engagement Trends | Compact stat/chart tile |

**B. Strategic Insights panel**
- Two sub-sections side by side: Future Potential | Value Addition
- Text content

**C. Call Summary Table**
- Header: "Call Summary" with phone icon
- Columns: Call Date | Nature of Call | Attendees - Client | Attendees - Carisma | Purpose of the Call | MoM
- MoM column: "View" button (likely opens minutes of meeting detail/modal)

**Data fields:**

*Call Summary rows:*
- `call_date`
- `nature_of_call`
- `attendees_client`
- `attendees_carisma`
- `purpose`
- `mom_link` or `mom_id`

*Engagement/Challenges/Needs/Trends/Strategic:* structured text fields from SP

**Data source:** Stored procedure (TBD)

---

### Tabs 10–12 — IT Infra Updates / TAT / Budget VS Actual

**Purpose:** TBD — no screenshots available.

**Note on TAT:** Overlaps with the existing TAT report in the `reports-home` module. Confirm whether this is a read-only view of the same data or a different scope.

**Placeholder:** Stub components for all three.

---

## Proposed Module File Structure

```
src/src/modules/insights-home/
├── insights-home.tsx                 Module entry + tab router
├── insights-filters.tsx              Global filter bar (Month, Client, Vertical, etc.)
├── tabs/
│   ├── key-updates/
│   │   └── key-updates-tab.tsx
│   ├── sla-adherence/
│   │   ├── sla-adherence-tab.tsx
│   │   ├── job-pipeline-bar.tsx
│   │   └── client-report-card.tsx
│   ├── know-your-client/
│   │   └── know-your-client-tab.tsx   (stub)
│   ├── utilization/
│   │   ├── utilization-tab.tsx
│   │   └── fte-productivity-table.tsx
│   ├── feedback/
│   │   ├── feedback-tab.tsx
│   │   └── feedback-details-table.tsx
│   ├── resource-continuity/
│   │   └── resource-continuity-tab.tsx (stub)
│   ├── appreciation/
│   │   └── appreciation-tab.tsx
│   ├── client-csat-report/
│   │   └── client-csat-tab.tsx         (stub)
│   ├── engagement-frequency/
│   │   ├── engagement-frequency-tab.tsx
│   │   └── call-summary-table.tsx
│   ├── it-infra-updates/
│   │   └── it-infra-tab.tsx            (stub)
│   ├── tat/
│   │   └── tat-tab.tsx                 (stub / reuse from reports-home)
│   └── budget-vs-actual/
│       └── budget-vs-actual-tab.tsx    (stub)
└── helpers/
    └── insights-api.ts               API calls for all SP data
```

---

## Integration into Existing App

1. **Add `insights` page** to `core/seeds/pages.tsx` alongside existing pages (movement, dashboard, reports)
2. **Update `PageContext`** to include `'insights'` as a valid page value
3. **Update `home/`** router to render `<InsightsHome />` when page is `'insights'`
4. **Navigation** — add Insights tab to whatever top-level nav renders in `App.tsx` / `StatisticsPanel`

---

## Open Questions

| # | Question | Owner |
|---|----------|-------|
| 1 | What are the stored procedure names for each tab? | Backend |
| 2 | What API base URL do insights SPs use — WM API, Reports API, or Client API? | Backend |
| 3 | Know Your Client, Resource Continuity, Client CSAT Report, IT Infra Updates — no screenshots provided. Confirm requirements. | Product |
| 4 | TAT tab — is this the same data as the existing TAT report in movement module, or different scope? | Product |
| 5 | MoM (Minutes of Meeting) on Call Summary — does clicking "View" open a modal, a new page, or a PDF? | Product |
| 6 | ActionTaken column in Feedback — is this editable from this view or read-only? | Product |
| 7 | Should the module be called "Insights" in the nav or "Engagement Delivery Dashboard"? | Product |

---

## Build Order (suggested)

1. Scaffold `insights-home.tsx` with filter bar + two-row tab nav (no data yet)
2. Implement tabs with screenshots first: SLA Adherence → Utilization → Feedback → Appreciation → Engagement Frequency & Challenges → Key Updates
3. Wire SP connections once SP names are confirmed
4. Implement stub tabs as requirements come in
5. Confirm TAT tab reuse strategy
