# Architecture

## Overview

`dp-dash-insights` is a React web component that renders the Engagement Delivery Dashboard — a tabbed, filterable view of client performance data (Utilization, Feedback, Appreciation) embedded into the Angular client portal.

## Tech Stack

- **React 19** — UI framework
- **TypeScript 6** — type safety
- **Vite 8** — build tool (library mode: IIFE output → `dist/widget.js`)
- **Tailwind CSS v4** — utility-first styling; configured via `@tailwindcss/postcss` + `vite-plugin-css-injected-by-js` (CSS inlined into widget.js)
- **ESLint** — linting (eslint-plugin-react-hooks, react-refresh)

## Project Structure

```
dp-dash-insights/
  src/                        ← Vite project root (library mode — outputs dist/widget.js)
    src/
      main.tsx                ← Entry point — registers <dp-dash-insights> Custom Element; parses userdata (client_id + company_id + project_id); dev preview block uses seed data
      App.tsx                 ← Root — wraps AppProvider (clientId + companyId + projectId), renders FilterBar + TabNav + TabPanels
      index.css               ← Global styles (@import "tailwindcss" + @theme maroon token)
      App.css                 ← (retained from scaffold, not actively used)
      assets/                 ← Static assets (hero.png, svgs)
      core/
        seeds/
          user-data.ts        ← Dev mock user data (copied from dp-dash-movement); used by dev preview block in main.tsx
      components/
        FilterBar.tsx         ← Month dropdown + Vertical tag multi-select (live fetch using project_id; deduped by new_service_id) + Apply button
        TabNav.tsx            ← Two-row tab nav; maroon underline on active tab
        UtilizationTab.tsx    ← Capacity % KPI card + rolling 3-month FTE table + TOTAL footer
        FeedbackTab.tsx       ← 3 KPI cards + Client Feedback Details table with date range header
        AppreciationTab.tsx   ← Reverse-chronological card list; initials avatar fallback
      context/
        AppContext.tsx        ← Holds clientId, companyId, projectId, month, verticals, appliedFilters, activeTab; applyFilters()
      hooks/
        useTabData.ts         ← Generic lazy-fetch + per-filter cache; fans out per selected vertical
      config/
        api-routes.ts         ← Base URL config (dev: localhost:8001; prod: pqreports.welingkaronline.org)
      utils/
        month.ts              ← parseMonth, subtractMonths, formatMonthValue, monthShortLabel helpers
    public/
      favicon.svg
      icons.svg
    index.html                ← HTML shell — contains <div id="root">; dev preview block in main.tsx mounts the web component
    vite.config.ts            ← Library mode: IIFE format, single dist/widget.js, CSS inlined by plugin
    postcss.config.cjs        ← @tailwindcss/postcss (Tailwind v4 requirement)
    tsconfig.json / tsconfig.app.json / tsconfig.node.json
    package.json
  wiki/                       ← Claude-maintained knowledge base
```

## Data Flow

1. Angular shell passes `userdata` JSON attribute (containing `client_id`, `company_id`, and `project_id`) to `<dp-dash-insights>` at initialisation; in dev, `main.tsx` seed block uses `core/seeds/user-data.ts`
2. `main.tsx` extracts `client_id`, `company_id`, and `project_id`; passes all three to `App` → `AppProvider` → context
3. `FilterBar` on mount POSTs `{ project_id }` to `/api/client/get-verticals`; response is deduplicated by `new_service_id` before populating the dropdown
4. User selects Month and Vertical filters (stored as `new_service_id` values), clicks Apply
5. Active tab triggers a POST request to the Laravel `api-reports` backend with `month`, `vertical_id` (`new_service_id`), and `project_id`
6. Laravel calls the relevant stored procedure and returns JSON
7. Tab component renders KPI cards / tables / cards from the response

## Key Modules

| Module | Status | Purpose |
|---|---|---|
| `FilterBar` | Implemented | Month dropdown (last 13 months) + Vertical tag multi-select (live fetch from `/client/get-verticals`) + Apply button |
| `TabNav` | Implemented | Two-row tab nav; maroon underline on active tab; Row 2 is a placeholder strip |
| `UtilizationTab` | Implemented | Capacity % KPI card + rolling 3-month FTE table with dynamic headers + TOTAL footer |
| `FeedbackTab` | Implemented | 3 KPI cards (Feedback Count, Total Jobs, Performance%) + Client Feedback Details table with date range header |
| `AppreciationTab` | Implemented | Reverse-chronological card list; initials avatar fallback for missing profile pictures |
| `AppContext` | Implemented | Shared state: clientId, companyId, projectId, month, verticals (number[] of new_service_id), appliedFilters (null until Apply), activeTab |
| `useTabData` | Implemented | Generic lazy-fetch hook; only fetches when tab is active AND filters applied; caches results per filter key (keyed on projectId); fans out per selected vertical |

## External Dependencies / Integrations

- **Laravel `api-reports`** — backend API at `core/backend/api-reports/`
- **Endpoints** (live at `routes/dashboard/insights.php`, registered in `api.php`):
  - `POST /api/client/dashboard/insights/utilization` → `SP_AssociateProductivity_Last3Months(month, project_id, vertical_id)` via `wm_mysql`
  - `POST /api/client/dashboard/insights/feedback` → `sp_ClientFeedback_ClientDelivery_shibu_1(month, project_id, vertical_id)` via `wm_mysql`
  - `POST /api/client/dashboard/insights/appreciation` → `sp_ClientAppreciation_ClientDelivery(month, project_id, vertical_id)` via `wm_mysql`
- **Endpoint for verticals** (existing): `POST /api/client/get-verticals` — fetched on FilterBar mount; request body sends `{ project_id }`; returns `{ id, service_id, engagement_id, title, code, wm_vertical_id, new_service_id }[]`; frontend deduplicates by `new_service_id` and uses `new_service_id` as the vertical identifier throughout
- **Stored procedures** called by Laravel via `wm_mysql` connection (WorksManager database):
  - `SP_AssociateProductivity_Last3Months(month, project_id, vertical_id)`
  - `sp_ClientFeedback_ClientDelivery_shibu_1(month, project_id, vertical_id)`
  - `sp_ClientAppreciation_ClientDelivery(month, project_id, vertical_id)`
- **Angular shell** — embeds this project as a web component; passes `userdata` JSON attribute containing `client_id`, `company_id`, and `project_id`

## Known Constraints

- `client_id`, `company_id`, and `project_id` are all extracted from the Angular `userdata` attribute and passed through the React tree. None are derived server-side from the auth session — a potential security concern worth revisiting.
- `project_id` (the Works Manager company ID) is used for all insights endpoints and for the verticals fetch. It maps to `project_id` in the seed data (value: `33`).
- Verticals are identified by `new_service_id` throughout the frontend (selection, fan-out, cache keys). The `id` field from the API response is not used.
- `vertical_id: 0` is the no-filter sentinel (fetches all verticals). When multiple verticals are selected, `useTabData` fans out one POST request per vertical ID and merges results.
- SP field names in `UtilizationTab`, `FeedbackTab`, `AppreciationTab` are placeholder guesses based on plan documents — must be verified against real SP output in Stage 5.
- Build output is a single `dist/widget.js` (IIFE, ~610 kB) consumed by the Angular shell. No separate CSS file — styles are inlined by `vite-plugin-css-injected-by-js`.
- `api-routes.ts` is currently in **dev mode** (`localhost:8001`). Production URL (`pqreports.welingkaronline.org`) is commented out — must be toggled before deployment.
- Brand color: dark maroon `#8B1A2E` — exposed as Tailwind token `--color-maroon` in `index.css`
