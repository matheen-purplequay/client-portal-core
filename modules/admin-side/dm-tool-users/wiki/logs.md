# Logs

## 2026-07-01
- Ran `/wiki init`. Explored the module: a React/Vite widget (`<dm-tool-user>`) that lists existing
  Client Portal internal users and lets an admin sync new ones in from Works Manager, assigning a role.
- Created `wiki/architecture.md`, `wiki/issues.md`, `wiki/index.md`, and root `CLAUDE.md`.
- Noted for future sessions: `react-query`, `zustand`, and `react-router-dom` are installed but not
  actually used the way their names imply (fetching is manual useState/useEffect, the "store" is a
  plain module variable, there's no routing). `wmApi` axios instance exists but no service currently
  calls it — WM internal users come through the Accounts API instead. `generateInternalAccess` sends
  a hardcoded `password: 'password'` and `wm_user_id: 0`, which looks like a placeholder worth
  flagging if touched. `.env` and `.env.staging` currently point at the same URLs.
