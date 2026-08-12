# Wiki Index — Navigation Guide for Claude

## Start Every Session Here
1. Read this file first.
2. Read architecture.md for system context.
3. Check issues.md for known problems.
4. Check feature-updates/ for relevant plans.

## Files
- architecture.md — system map, tech stack, data flow
- issues.md — bug tracker with status and fix notes
- logs.md — session history and decision trail
- feature-updates/ — phase-organized feature plans (none yet)

## Quick Orientation
This module (`dm-tool-users`) is a single-page widget: everything lives in
`src/src/pages/users/UserList.tsx`. It's mounted by a host app as the `<dm-tool-user>` custom
element (see `src/src/main.tsx`). It talks to three backend APIs (Accounts, Reports, Works Manager)
via `src/src/services/`, all configured through `.env` files.

## Update Rules
- Update architecture.md when modules, data flow, or stack change.
- Update issues.md when a bug is found, worked on, or fixed.
- Always append to logs.md at the end of a session or after a significant action.
- Create feature-updates/ entries when a new feature is being planned.
