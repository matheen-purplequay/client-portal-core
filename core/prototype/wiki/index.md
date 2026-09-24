# Wiki Index — Navigation Guide for Claude

## Start Every Session Here
1. Read this file first.
2. Read `architecture.md` for how the prototype is built and run.
3. Read `screens.md` before touching UI — it maps each screen to the real portal screen it copies.
4. Read `data.md` before changing mock JSON.
5. Check `issues.md` for open assumptions and past bugs.

## What this project is

`core/prototype` is a **static HTML mockup of the client-facing portal** (the Angular `reports` project + the `dp-dash-movement` React module). It exists to review and agree UI/UX without running the Angular app or the Laravel backend. Stack: **htmx + Alpine.js + Tailwind CSS (CDN) + mock JSON**. No build step, no backend, no database.

## Files

- [architecture.md](architecture.md) — stack, master-page/router design, components, script load order, auth flow, run & deploy (Node server, pm2)
- [screens.md](screens.md) — every screen: route, view file, Alpine component, what real screen it mirrors, behaviours
- [data.md](data.md) — mock JSON files, field shapes, the two demo clients, how data relates
- [issues.md](issues.md) — open assumptions/limitations and resolved bugs
- [logs.md](logs.md) — session history and decision trail (newest first)
- [tasks.md](tasks.md) — task list by date

## Update Rules

- Update `architecture.md` when the router, components, load order, run/deploy setup or auth flow change.
- Update `screens.md` when a screen is added, removed or changes behaviour.
- Update `data.md` when a JSON file or field is added or changed.
- Update `issues.md` when a bug is found or resolved, or an assumption is confirmed/rejected by the user.
- Append to `logs.md` at the end of a session or after a significant change; add matching entries to `tasks.md`.
- Only update the wiki after the user confirms the work is done.

## Ground rules for this project

- Prototype only: never import from, or change, the Angular, React or Laravel projects. Assets copied from them (e.g. the login banner) are copies.
- Match the real portal's look; get the user's confirmation before deviating from a supplied screenshot.
- Mock names only — no real client, staff or company names in `data/`.
- No authentication, CORS or backend changes are ever needed here (see root `CLAUDE.md`).
