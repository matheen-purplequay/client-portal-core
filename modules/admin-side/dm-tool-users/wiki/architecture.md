# Architecture

## Overview
`dm-tool-users` is a standalone widget module of the Carisma Client Portal. It renders as a
custom element (`<dm-tool-user>`) that lets internal Carisma admins view existing Portal users
and sync new internal users in from Works Manager (an external system), assigning them a role.

## Tech Stack
- React 19 + TypeScript, built with Vite 8
- Tailwind CSS 4 (via `@tailwindcss/vite`) for styling
- `@base-ui/react` + `shadcn`-style components for UI primitives (`src/src/components/ui`)
- `@tanstack/react-query` — installed and wired via `QueryClientProvider` in `App.tsx`, but data
  fetching is currently done with plain `useState`/`useEffect` in `UserList.tsx`, not `useQuery`
- `axios` for HTTP, with a small wrapper adding a Bearer token interceptor
- `zustand` is a dependency but the actual user store (`stores/userStore.ts`) is a plain module-level
  variable, not a zustand store
- `vite-plugin-css-injected-by-js` — inlines built CSS into the JS bundle so the widget can inject
  styles into its Shadow DOM without a separate `<link>` tag
- `sonner` — toast notifications (wrapped by local `ToastProvider` in `components/ui/toast.tsx`)

## Project Structure
```
dm-tool-users/
  src/                        ← Vite project root
    src/
      App.tsx                 ← Root React component, wraps UserList in QueryClientProvider + ToastProvider
      main.tsx                ← Defines the `dm-tool-user` custom element (web component) and dev-mode bootstrap
      core/seeds/user-data.ts ← Fake/sample UserData used only in local `npm run dev` preview
      components/
        SyncUserConfirmDialog.tsx  ← Confirmation modal before creating a WM→Portal user
        ui/                        ← shadcn-style primitives (button, card, dialog, combobox, etc.)
      hooks/useUserData.ts     ← getUserData() / isAdmin() helpers reading from the store
      pages/users/UserList.tsx ← The entire feature: two-pane user browser + WM sync flow
      services/
        api.ts                 ← axios instances (accountsApi, reportsApi, wmApi) + withUser() helper
        user.service.ts        ← get-users, get-internal-wm-users, generate-internal-access, get-user-wise-client
        clients.service.ts     ← get/clients-from-portal
        teams.service.ts       ← get-roles
      stores/userStore.ts      ← module-level singleton holding the logged-in user's UserData
      types/index.ts           ← Role, PortalUser, WMInternalUser, GenerateInternalAccessPayload, UserData
    dist/                      ← Build output (users-widget.js / users-widget.css), consumed by host app
    .env / .env.staging        ← VITE_ACCOUNTS_SERVER, VITE_REPORTS_SERVER, VITE_WM_API_SERVER
    vite.config.ts             ← Builds a single-file widget bundle (fixed entry/asset names, CSS injected into JS)
```

## Data Flow
1. Host application (Angular/other shell) mounts `<dm-tool-user>` and sets the `user-data` attribute
   or `.userData` property to a JSON `UserData` payload (contains `user_id`, `role_id`, `company_id`, etc.).
2. `main.tsx`'s `UsersWidget` custom element parses that payload and renders `<App userData={...} />`
   into a Shadow DOM root (with injected CSS so host page styles don't leak in/out).
3. `App.tsx` calls `setUserData(userData)` to populate the module-level store in `stores/userStore.ts`,
   then renders `UserList`.
4. `UserList` on mount fires three fetches in parallel: existing Portal users (`accountsApi`), roles
   (`reportsApi`), and Works Manager internal users (`accountsApi`).
5. All outgoing POST bodies are passed through `withUser()` (`services/api.ts`), which reads the
   current user from the store and attaches it as `logged_in_user` — this is how the backend knows
   who is performing the action (no separate auth flow in this module; it trusts the host-provided data).
6. Axios request interceptor attaches `Bearer <token>` from `localStorage.getItem('token')` on every
   call to any of the three API instances.
7. "Sync" flow: admin switches to Works Manager tab, picks a role for an unsynced WM user via a
   `Combobox`, which opens `SyncUserConfirmDialog`. Confirming calls
   `userService.generateInternalAccess(...)` with a hardcoded `password: 'password'` and
   `wm_user_id: 0` — then refetches the Portal user list.

## Key Modules
- **UserList.tsx** — the entire UI/business logic for this widget lives in this one page component
  (state, fetch, filter, sync flow). No routing (`react-router-dom` is a dependency but unused here).
- **services/api.ts** — three separate axios instances because this module talks to three different
  backend services (accounts, reports, and Works Manager's own API), each with its own base URL from env.
- **stores/userStore.ts** + **hooks/useUserData.ts** — minimal in-memory storage for the host-supplied
  logged-in user, used solely to stamp outgoing requests and (via `isAdmin()`) for role checks.

## External Dependencies / Integrations
- **Accounts API** (`VITE_ACCOUNTS_SERVER`) — get-users, get-internal-wm-users, generate-internal-access
- **Reports API** (`VITE_REPORTS_SERVER`) — get-roles, get-user-wise-clients, get/clients-from-portal
- **Works Manager API** (`VITE_WM_API_SERVER`) — configured (`wmApi` instance) but not currently called
  directly by any service; WM internal users are actually fetched through the Accounts API instead
- Both current `.env` and `.env.staging` point at the same (production-looking) hosts — no distinct
  staging URLs are configured yet.

## Known Constraints
- Ships as a single-file widget bundle (`users-widget.js` / `users-widget.css`) with fixed names —
  the host app expects those exact asset filenames from `dist/`.
- Renders inside a Shadow DOM, so global page styles won't reach it and its Tailwind styles won't leak out.
- No client-side routing or auth guard — it fully trusts the `userData` passed in by the host shell.
- Per root `CLAUDE.md`: do not touch anything auth/CORS-related, and confirm with the user before any
  DB/model/migration changes (though this module has no direct DB access — it's API-consumer only).
