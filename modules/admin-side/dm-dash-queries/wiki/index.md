# Wiki Index — Navigation Guide for Claude

## Start Every Session Here
1. Read this file first.
2. Read `architecture.md` for system context.
3. Check `issues.md` for known problems.
4. Check `feature-updates/` for relevant plans.

## Files
- [architecture.md](architecture.md) — system map, tech stack, data flow, API backends, context providers
- [issues.md](issues.md) — bug tracker with status and fix notes
- [logs.md](logs.md) — session history and decision trail
- [feature-updates/](feature-updates/) — phase-organized feature plans

## Key Facts (Quick Reference)
- **What it is**: React Web Component (`<dash-queries>`) micro-frontend embedded in Angular host
- **Entry point**: `src/main.tsx` defines the custom element; `src/App.tsx` is the React root
- **Routing**: CSS `block/hidden` toggle via `PageContext` — no React Router
- **3 backends**: WM API (core queries), Accounts API (client admin), Reports API (stats/templates)
- **Build output**: `dist/assets/query-widget.js` (single bundle, CSS injected)
- **Dev server**: port 5174

## Update Rules
- Update `architecture.md` when modules, data flow, API routes, or contexts change.
- Update `issues.md` when a bug is found, worked on, or fixed.
- Always append to `logs.md` at the end of a session or after a significant action.
- Create `feature-updates/` entries when a new feature is being planned.
