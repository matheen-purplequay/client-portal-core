# CLAUDE.md — Client Portal Backend

## Project Overview
Two Laravel 10 microservices (PHP 8.1+):
- **api-accounts** — user/company management, authentication, RBAC, Works Manager integration
- **api-reports** — report workflows, invoices, feedback, CMS, Excel/PDF export

## Start Every Session
Read the wiki before making any changes or starting any task:
1. `wiki/index.md` — orientation
2. `wiki/architecture.md` — system map
3. `wiki/issues.md` — known bugs
4. Relevant `wiki/feature-updates/` plans

**Before fixing a bug:** always read `wiki/issues.md` first — it may contain prior investigation notes, root cause analysis, or partial fixes relevant to the bug.

**Updating the wiki:** only update the wiki after completing a reasonable amount of work **and** after the user explicitly confirms the changes are done. Do not update the wiki speculatively or mid-task.

## Important Instructions
- Do not change anything related to authentication, cors, or anything that might break the existing functionality.
- If you have to change anything related to databse, models, migrations ask the user for confirmation first.

## Key Technical Facts
- Auth: Laravel Sanctum (365-day tokens)
- Authorization: Spatie Laravel Permission (RBAC)
- api-reports reads the accounts DB via `accounts_mysql` connection
- ThrottleRequests is disabled in api-reports
- Deployment: cPanel manual file-copy (no CI/CD)
- Real-time: Firebase + Pusher (both services)

## Working Conventions
- Routes are split across many files — check the routes directory, not just `api.php`
- Models in api-reports may reference `accounts_mysql` for cross-service user data
- Both services share the same `.env.example` pattern

## Wiki Commands
- `/wiki update` — refresh wiki after codebase changes
- `/wiki log <message>` — append a session note
- `/wiki issue <title>` — record a new bug
- `/wiki plan <phase> <name>` — create a feature plan
