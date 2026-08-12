# Architecture

## Overview
`cp-client-setup` is the admin-side "Client Setup" module of the Client Portal monorepo. It is an embeddable Web Component widget for managing client companies, client portal users, internal teams, query reviewers, and per-client rules/dashboard mappings.

## Tech Stack
- **Vite 8** — build tool, outputs a widget bundle (`vite-plugin-css-injected-by-js` injects CSS at runtime so the widget is self-contained).
- **React 19** + **TypeScript** — UI.
- **TailwindCSS 4** — styling (via `@tailwindcss/vite`).
- **Zustand** — reactive state (`useClientStore`).
- **TanStack React Query** — server-state/data fetching.
- **Axios** — HTTP client with request interceptor for auth.
- **react-hook-form** — form handling.
- **shadcn/base-ui** — UI primitives in `src/components/ui/`.

## Project Structure
Actual source lives under `source/` (not repo root):
```
source/
  index.html, vite.config.ts, package.json, tsconfig*.json
  src/
    main.tsx              — Web Component entrypoint (<client-setup>)
    App.tsx                — mounts ClientMaster
    components/ui/         — shadcn-style UI primitives
    core/seeds/user-data.ts — sample UserData for `npm run dev` preview
    hooks/useUserData.ts   — getUserData/isAdmin/splitName helpers
    pages/clients/
      client-master/ClientMaster.tsx     — hub: sidebar + tabs
      company-setup/CompanySetup.tsx     — dashboards/verticals/job-status mapping
      company-rules/CompanyRules.tsx     — per-client rule toggles
      client-setup/ClientSetup.tsx (+components/) — client portal user CRUD
      client-teams/ClientTeams.tsx       — internal team member management
      client-reviewers/ClientReviewers.tsx — query approver management
    services/               — one file per API domain (see below)
    store/useClientStore.ts — Zustand store (selected client, WM list, edit state, tabs)
    stores/userStore.ts     — plain in-memory module for current UserData (NOT Zustand)
    types/index.ts          — shared domain types
docs/     — currently empty
wiki/     — this wiki
.env / .env.staging — per-environment API base URLs
```

## Data Flow
1. Parent portal instantiates `<client-setup>` and passes `UserData` (JSON) via attribute/property (`main.tsx`). In `npm run dev` standalone mode, seed data from `core/seeds/user-data.ts` is used instead.
2. Widget renders inside a Shadow DOM root (style isolation) and mounts `App.tsx` → `ClientMaster.tsx`.
3. `ClientMaster` is the hub: left sidebar lists Portal or Works Manager (WM) clients, right panel shows tabs (Setup, Settings/Rules, Users, Teams, Reviewers) driven by `useClientStore` (selected client, active tab, edit-lock state).
4. Each tab's page component calls the matching `services/*.service.ts` function, which hits one of three backends via Axios (`services/api.ts`), with a Bearer token from `localStorage` and `logged_in_user` auto-injected from `stores/userStore.ts`.
5. Drag-and-drop UI (dashboards → engagement verticals, job status mappings, WM contact → client user mapping) writes back through the same service layer.

## Key Modules
- **services/api.ts** — Axios instances for three backends + auth/user-injection interceptor.
- **services/clients.service.ts** — portal/WM client list, company CRUD, sync from WM.
- **services/master.service.ts** — dashboard master data, job status mappings.
- **services/queries.service.ts** — query/reviewer approvers.
- **services/rules.service.ts** — client-specific rule get/save/reset.
- **services/teams.service.ts** — verticals, roles, internal team CRUD.
- **services/user.service.ts** — client portal user CRUD, access generation, WM contact mapping.
- **store/useClientStore.ts** — Zustand: selected client, WM client list, sync mode, active tab, edit-lock, loading flags.
- **stores/userStore.ts** — plain getter/setter module for the logged-in `UserData`.

## External Dependencies / Integrations
Three backend APIs, base URLs from env vars:
- `VITE_ACCOUNTS_SERVER` — AccountsApi (users/teams/clients).
- `VITE_REPORTS_SERVER` — ReportsApi (master data, rules, company details).
- `VITE_WM_API_SERVER` — Works Manager query API (`clientqueryapi` dev / `deliveryportal-wmapi` staging).

Dev (`.env`): `pqaccountsapi.welingkaronline.org`, `pqreports.welingkaronline.org`, `clientqueryapi.purplequay.com.au`.
Staging (`.env.staging`): `deliveryportal-accountsapi.purplequay.com`, `deliveryportal-reportsapi.purplequay.com`, `deliveryportal-wmapi.purplequay.com`.

Auth: Bearer token read from `localStorage.getItem('token')` — set by the parent portal that embeds this widget, not by this module itself.

## Known Constraints
- This module does not own authentication — do not modify auth/token handling here (see project-level CLAUDE.md rule: never touch auth/CORS).
- Widget must stay self-contained (CSS injected via JS, Shadow DOM) since it's embedded in a host portal — avoid assumptions about global stylesheet access.
- Two parallel state patterns exist (`store/` Zustand vs `stores/` plain module) — see [[issues]] for consolidation note.
