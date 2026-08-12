# Architecture — dp-dash-movement

## Overview

`dp-dash-movement` is a React 19 application compiled as a single Web Component (`<dash-movement>`) and embedded into an Angular-based **client portal**. It renders a job/movement dashboard for multiple business verticals within a Shadow DOM, keeping its styles isolated from the host Angular app.

---

## Embedding Model

```
Angular Client Portal
└── <dash-movement user-data="..." />   ← Web Component (custom element)
    └── Shadow DOM
        ├── Injected Tailwind CSS
        ├── Injected main.css
        └── React App (mounted via ReactDOM.createRoot)
```

The Angular host passes data into the component via:
- **`user-data` attribute** — JSON-serialised user object, watched via `observedAttributes`
- **`selectedClientUser` property** — set as a DOM property (not attribute) from Angular, handled via a JavaScript setter

### Dev vs Production Data Flow

| Environment | User data source |
|-------------|-----------------|
| Local dev | Seed data from `core/seeds/user-data.ts`, stored in `localStorage` (encrypted) and passed as attribute |
| Production (Angular host) | Angular sets `user-data` attribute and `selectedClientUser` property on the element |

The entry point [`src/main.tsx`](../src/src/main.tsx) handles both cases:
- If a `#root` element exists in the HTML → dev mode, mounts with seed data
- Otherwise → production Web Component mode, waits for Angular to pass attributes

---

## Build Output

| Tool | Purpose |
|------|---------|
| Vite 7 + SWC | Fast bundler/transpiler |
| `vite-plugin-css-injected-by-js` | Inlines CSS into JS bundle for Shadow DOM injection |

**Output:** `dist/assets/widget.js` + `dist/assets/widget.css` — single-file bundle consumed by the Angular project.

Path alias: `#/*` → `src/src/*`

---

## Application Layers

```
src/src/
├── main.tsx                  Web Component wrapper (HTMLElement subclass)
├── App.tsx                   React root — context providers + layout
│
├── config/
│   └── api-routes.ts         Centralised API endpoint definitions
│
├── core/
│   ├── models/               TypeScript interfaces (movement, vertical, instruction, template)
│   ├── seeds/                Mock/constant data (verticals, pages, user-data, job-table)
│   └── utils/
│       ├── helpers/          fetch.ts, localStorage.ts (AES encryption), validations.ts
│       └── stores/           React Context providers (AppContext, PageContext, EngagementVerticalContext)
│
├── modules/                  Feature modules
│   ├── movement-home/        Primary job listing + detail views
│   ├── dashboard-home/       Statistics and reporting tables
│   ├── reports-home/         TAT reports and forms
│   └── components/           Shared module-level components (stats panels, filters)
│
└── shell/
    └── components/           Design system: atoms, collections, dialogs, rich-text editor
```

---

## State Management

Three React Context providers compose global state:

| Context | Manages |
|---------|---------|
| `AppContext` | Authenticated user data + selected client user |
| `PageContext` | Current top-level page (`movement`, `dashboard`, `reports`) |
| `EngagementVerticalContext` | Active business vertical + active sub-view |

Local `useState` handles component-level state. Redux Toolkit is installed but not yet integrated into the main data flow.

---

## Business Verticals

The dashboard supports four job/engagement verticals, each with its own job table component:

| Vertical | ID | Component |
|----------|----|-----------|
| OBS (Business Services) | 1 | `bs-job-table` |
| SMSF | 2 | `smsf-job-table` |
| FP (Financial Planning) | 5 | `fp-job-table` |
| BK (Bookkeeping) | 6 | `bk-job-table` |

---

## Module Views

Within the movement module, three active views exist:

| View | Description |
|------|-------------|
| `live-data` | Job listing with filters |
| `reports` | TAT report generation |
| `lodgement` | Lodgement data view |

---

## Security

- `localStorage` values are AES-encrypted via `crypto-js` before storage
- User data passed from Angular is JSON-parsed with try/catch error boundaries

---

## Key Dependencies

| Package | Version | Role |
|---------|---------|------|
| React | 19.1 | UI framework |
| TypeScript | 5.8 | Type safety |
| TailwindCSS | 4.1 | Styling |
| Vite | 7.0 | Build tool |
| TipTap | 3.0 | Rich text editor (instructions/queries) |
| Recharts / MUI X-Charts | 3.8 / 8.11 | Data visualisation |
| Axios | 1.10 | HTTP client |
| crypto-js | 4.2 | localStorage encryption |
