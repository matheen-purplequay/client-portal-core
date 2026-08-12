# Hybrid Angular + React Web Components Architecture

**Type:** concept
**Last updated:** 2026-06-23
**Related pages:** [[module-dashboard]]

---

## Overview

The frontend uses a hybrid architecture: Angular projects serve as the **app shell** (routing, auth, layout), while specific feature panels are built as standalone **React apps** and embedded into Angular as native web components (custom elements).

This allows React modules to have independent build and deployment cycles without redeploying the entire Angular app.

---

## Project Layout

```
client-portal/
├── core/frontend/src/    ← Angular monorepo
│   ├── projects/pq-admin/    ← admin shell
│   ├── projects/reports/     ← client-facing shell
│   └── projects/pq-ui/       ← shared UI library
│
└── modules/              ← Standalone React web components
    ├── admin-side/       ← embedded into pq-admin
    │   ├── cp-client-setup/
    │   ├── dm-dash-queries/
    │   └── dm-tool-users/
    └── client-side/      ← embedded into reports
        └── dp-dash-movement/
```

---

## React Modules

| Module | Embeds into | Purpose |
|--------|------------|---------|
| `cp-client-setup` | `pq-admin` | Client setup / onboarding widget |
| `dm-dash-queries` | `pq-admin` | Queries dashboard panel (admin view) |
| `dm-tool-users` | `pq-admin` | Users management tool |
| `dp-dash-movement` | `reports` | Job Movement dashboard panel (client view) |

---

## Build & Deploy Pattern

Each React module is:
1. Built independently (produces a JS bundle)
2. Deployed to the production server separately
3. Registered as a custom element (web component) — Angular embeds it via the custom element tag

Angular does **not** need to be rebuilt when a React module is updated.

---

## References
- Modules root: `modules/`
- Angular monorepo: `core/frontend/src/`
