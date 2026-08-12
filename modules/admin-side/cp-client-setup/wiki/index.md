# Wiki Index — Navigation Guide for Claude

## Start Every Session Here
1. Read this file first.
2. Read architecture.md for system context.
3. Check issues.md for known problems.
4. Check feature-updates/ for relevant plans (none yet as of init).

## About This Module
`cp-client-setup` is the admin-side client-setup widget in the larger client-portal monorepo. Real source lives under `source/` (not repo root) — see architecture.md for the full path map. This module also has module-specific rules in the root project CLAUDE.md (`/home/matheensv/projects/internal/client-portal/CLAUDE.md`) which take precedence — read it before making changes, especially the rules about not touching auth/CORS and confirming before database/model/migration changes.

## Files
- architecture.md — system map, tech stack, data flow
- issues.md — bug tracker with status and fix notes
- logs.md — session history and decision trail
- feature-updates/ — phase-organized feature plans (create as needed)

## Update Rules
- Update architecture.md when modules, data flow, or stack change.
- Update issues.md when a bug is found, worked on, or fixed.
- Always append to logs.md at the end of a session or after a significant action.
- Create feature-updates/ entries when a new feature is being planned.
