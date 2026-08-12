# Architecture

## Overview
`dm-dash-queries` is a React Web Component (Custom Element `<dash-queries>`) that provides the admin-side queries management dashboard for the Carisma client portal. It is designed to be embedded inside an Angular host application as a micro-frontend widget.

## Tech Stack
- **React 19** — UI rendering
- **TypeScript 5.8** — type safety
- **Vite 7 + vite-plugin-react-swc** — build tooling with SWC compiler
- **Tailwind CSS v4** — utility-first styling, injected via shadow DOM
- **Redux Toolkit + React-Redux** — state management (available but minimal use; context-first approach)
- **MUI X Charts** — charting components for statistics panels
- **TipTap (ProseMirror)** — rich text editor used in query/template forms
- **HeadlessUI** — accessible UI primitives (dialogs, dropdowns)
- **Axios** — HTTP client for API calls
- **crypto-js** — encrypting user data stored in localStorage
- **xlsx** — Excel import/export for query templates
- **vite-plugin-css-injected-by-js** — CSS injected via JS for shadow DOM isolation

## Build Output
- Bundles to a single JS file: `dist/assets/query-widget.js`
- CSS injected into the JS bundle (no separate CSS file needed)
- Dev server runs on port 5174

## Project Structure
```
src/                        ← git root, contains all source code
  src/
    main.tsx                ← Web Component definition + dev preview entry
    App.tsx                 ← Root React component (context providers, layout)
    config/
      api-routes.ts         ← All API endpoint constants (3 backends)
    core/
      models/               ← TypeScript interfaces (query.ts, master.ts, template.ts, user.ts)
      seeds/                ← Static seed data (pages config, user-data for dev, FAQs)
      utils/
        helpers/            ← fetch.ts (getData/getPostData), localStorage.ts, validations.ts
        stores/             ← React Context providers (AppContext, PageContext, QueryMasterContext, ClientSelectionContext)
    modules/
      home/                 ← Page router (renders active page based on PageContext)
      inbox/                ← Query Inbox page (query-lists, job-queries sub-modules)
      draft-queries/        ← Draft Queries page
      rejected-queries/     ← Rejected Queries page
      reports/              ← Query Reports page
      templates/            ← Query Templates page
      components/
        statistics-panel-home/ ← Top statistics panel (cards, progress, quick-links, associate-status)
    shell/
      components/
        atoms/              ← Reusable primitives: buttons, inputs, dropdowns, loaders, dividers
        collections/        ← Reusable composites: card, table, tabs, toolbar, panels, toast
        dialogs/            ← Modal dialog wrapper
        tools/              ← TipTap rich-text editor wrapper
```

## Data Flow
1. **Bootstrapping**: Angular host sets `user-data` JSON attribute on `<dash-queries>`. The Web Component reads it in `connectedCallback`, parses it, and mounts the React app via `ReactDOM.createRoot`.
2. **User context**: `App.tsx` wraps everything in `AppContext.Provider` with `userData` and `isClient` flag (derived from `userData.isTester`).
3. **Page routing**: `PageContext` holds the active page string. Navigation changes this string; `Home/index.tsx` uses CSS `block/hidden` to show/hide module panels (no React Router).
4. **Master data**: On mount, `Home/index.tsx` fetches classification master data (category, sub_category, criticality, response_type) via `RetrieveAllMasters` API and stores it in `QueryMasterContext` — available app-wide.
5. **Client selection**: `ClientSelectionContext` fetches the user's job queries on mount to derive a unique client list. Selected client IDs are stored as a comma-separated string and used to filter views.
6. **API calls**: `core/utils/helpers/fetch.ts` provides `getData` (GET with query params) and `getPostData` (POST) wrappers over Axios hitting 3 backend services (WM API, Accounts API, Reports API).
7. **Statistics panel**: Rendered unconditionally at the top of every page via `App.tsx`.

## Key Modules

| Module | Purpose |
|---|---|
| `inbox` | Main query list view. Shows job-level queries (`jobs.tsx`) and flat query lists (`queries.tsx`). Supports creating new queries (`new-query.tsx`) and sub-queries. |
| `draft-queries` | Shows queries in draft status pending approval/rejection. |
| `rejected-queries` | Shows queries that have been rejected. |
| `reports` | Query reporting/analytics view. |
| `templates` | Manage query templates; supports Excel import/export. |
| `statistics-panel-home` | Dashboard header panel: progress indicator, quick links, associate status summary. |

## Context Providers (Stores)

| Context | Data |
|---|---|
| `AppContext` | `userData` (staff_id, full_name, etc.), `isClient` flag |
| `PageContext` | Active page ID string |
| `QueryMasterContext` | Classification master lists (category, sub_category, criticality, response_type) |
| `ClientSelectionContext` | Available clients list + currently selected client IDs (comma-separated) |

## External Dependencies / Integrations

Three backend APIs (all under `purplequay.com` domain):

| Service | Base URL | Responsibility |
|---|---|---|
| WM API | `deliveryportal-wmapi.purplequay.com/api` | Core query CRUD, master data, templates |
| Accounts API | `deliveryportal-accountsapi.purplequay.com/api` | Client admin queries, query review, client user lookups |
| Reports API | `deliveryportal-reportsapi.purplequay.com/api` | Statistics, rejected queries, draft sub-queries, template management, verticals |

## Known Constraints
- Runs inside a Shadow DOM — Tailwind and custom CSS are injected via JS to ensure style isolation from the Angular host.
- No React Router — page navigation is done via CSS `block/hidden` toggling controlled by `PageContext`. All panels mount on initial load.
- `userData` is passed as a JSON-stringified HTML attribute from Angular; the Web Component parses it with a `setTimeout(0)` to let Angular set attributes first.
- Dev preview seeds user data from `core/seeds/user-data.ts` and encrypts it to localStorage via `crypto-js`.
- Version is injected via `VITE_APP_VERSION` env variable and displayed in the footer.
