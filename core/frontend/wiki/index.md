# Wiki Index — pq-wm-frontend

Content catalog for the pq-wm-frontend knowledge base. Every page in `pages/` has an entry here.
Organized by category. Update this file whenever a page is created or removed.

---

## Project Overview

**Product:** A wealth management client portal. Clients use it to view job details, monitor job status across dashboards, reply to queries, and give job instructions.

**Angular monorepo projects (active):**
- `pq-admin` — internal/admin-facing panel
- `reports` — client-facing dashboard app
- `pq-ui` — shared UI component library
- ~~`cp-inbox`~~ — inactive, not in use

**React web components (`modules/`):**
Standalone React apps built and deployed separately, embedded into Angular projects as custom elements.
- `modules/admin-side/` → embeds into `pq-admin`
- `modules/client-side/` → embeds into `reports`

See [[concept-web-components]] for the full hybrid architecture pattern.

---

## Modules

_Pages documenting what each Angular/React module does, its components, services, and routes._

| Page | Summary |
|------|---------|
| [module-dashboard](pages/module-dashboard.md) | Core client dashboard in `reports` — 5 active tabs: Job Movement, Monthly Connect, Job Status, Feedback Status, Queries |

---

## Features

_Pages documenting end-to-end product features from a user perspective._

| Page | Summary |
|------|---------|
| _(none yet — add via INGEST)_ | |

---

## Concepts & Architecture

_Pages documenting patterns, architectural decisions, and conventions._

| Page | Summary |
|------|---------|
| [concept-web-components](pages/concept-web-components.md) | Hybrid Angular + React architecture — React modules built as web components and embedded into Angular shell |

---

## Entities & Data Models

_Pages documenting domain entities, their shape, and relationships._

| Page | Summary |
|------|---------|
| _(none yet — add via INGEST)_ | |

---

## Q&A

_Pages created from valuable questions and their synthesized answers._

| Page | Summary |
|------|---------|
| _(none yet — add via QUERY)_ | |

---

_Last catalog update: 2026-06-23_
