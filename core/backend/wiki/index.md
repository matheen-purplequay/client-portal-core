# Wiki Index — Navigation Guide for Claude

## Start Every Session Here
1. Read this file first.
2. Read `architecture.md` for system context.
3. Check `issues.md` for known problems.
4. Check `feature-updates/` for relevant plans.

## Project at a Glance
Two Laravel 10 microservices under `backend/`:
- **api-accounts** — auth, users, companies, RBAC, Works Manager integration
- **api-reports** — report workflows, invoices, feedback, CMS, Excel/PDF export

Both use Sanctum tokens, Spatie RBAC, MySQL, Firebase, and Pusher.

## Files
- [architecture.md](architecture.md) — system map, tech stack, modules, data flow, constraints
- [issues.md](issues.md) — bug tracker with status and fix notes
- [logs.md](logs.md) — session history and decision trail
- [feature-updates/](feature-updates/) — phase-organized feature plans

## Update Rules
- Update `architecture.md` when modules, data flow, DB connections, or stack change.
- Update `issues.md` when a bug is found, worked on, or fixed.
- Always append to `logs.md` at the end of a session or after a significant action.
- Create `feature-updates/` entries when a new feature is being planned.
