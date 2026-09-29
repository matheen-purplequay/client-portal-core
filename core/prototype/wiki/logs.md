# Logs

## 2026-09-25 — Wiki brought up to date with dev-branch screens

- Documented everything added since the first iteration: Home landing page, dev-style Jobs page + job popup, Workflow / Movement report / Budget / Turnaround / Feedback / MOM / Production / Overview screens, Job Allocation, responsive shell, navy theme, new mock data files. See `screens.md`, `architecture.md`, `data.md`, `issues.md` (ISS-010..019).
- Nothing committed to git yet.

## 2026-09-24/25 — Dev-branch alignment and Home (many user-driven iterations)

- Brought the dev branch screens in (all screens; kept touch-point Movement/Jobs/Queries and added SMSF + job-detail updates). Added Workflow (stand-up), Job Allocation (Stage 1 / Allocate with checklist), Home landing page (default route) with Workflow, Jobs, Movement, Budget, Holidays, Feedback and Yesterday's Workflow.
- Jobs page rebuilt on the dev model (14 BS statuses, BK/FP set, SMSF combined cards, 26 columns, Filters drawer, Manager View); job detail became accordions (Timeline, Budget, Turnaround, Instructions, Queries, Appreciation/Feedback) and opens as a popup from every job name.
- UI passes: compact grids, two-colour Home, equal-size cards, responsive drawer sidebar, navy theme, sidebar reorder, Jobs top-bar/tiles redesign, default legend "Jobs with <client>".
- Testing: headless Chrome (playwright-core) — no page errors, no horizontal overflow at 390/768/1024/1500 px.

## 2026-09-24 — OTP autofill restyled (user change)

- User changed the OTP page's autofill from a small text link to a bordered card button ("Autofill OTP / Fill mock otp to continue login") matching the login page's demo buttons. Behaviour unchanged (`#fill` still fills the mock OTP).
- Minor: the button carries `w-50`, which is not a default Tailwind spacing class, so it has no effect (button sizes to content).

## 2026-09-24 — Wiki created

- Created `core/prototype/wiki` (index, architecture, screens, data, issues, logs, tasks) documenting the prototype as built on branch `prototype-v1`.

## 2026-09-24 — Login/OTP redesigned to match real login

- Split layout: form column with white-fade background + banner card. Banner (`login-banner.jpg`) copied from the Angular `reports` assets; right card extracted to `components/auth-hero.html` and loaded with htmx on both pages.
- Fixed forms-plugin input styling overrides (ISS-004). Two autofill demo buttons kept below the footer.
- Commit: `fc78a0f updated login`.

## 2026-09-24 — Static Node server and pm2 config

- Replaced `python3 -m http.server` with `server.js` (Node, no deps) because Windows servers may not have `python3`. Fixed a `//` path crash found while testing (ISS-003).
- `ecosystem.config.js` runs `server.js`; port from `PORT` env → `.env` (manual parser) → 8000. README updated. Commits `30ebae3`, `0aa223e`.

## 2026-09-24 — Job timeline scrolls horizontally

- Timeline is a single scrollable row instead of wrapping (ISS-001).

## 2026-09-24 — Rebuild on htmx + Alpine.js to match real UI

- User supplied screenshots of the real Job Status, Job detail, Movement and Queries (jobs + query cards) screens and asked for an exact match, htmx + Alpine.js, one master page, top tabs limited to Movement / Job Status / Queries, no client/user dropdowns, mock names only.
- Removed the first-iteration UI (Chart.js dashboards: Monthly Connect, Feedback, Insights) and its data; regenerated jobs (24-column shape), movement (touch points) and queries (threads).
- Decisions: hash router + htmx fragments in a single master page; components as htmx fragments sharing the parent Alpine scope; `CP.makeTable` shared table logic; fixed prototype date 2026-09-24; Source Sans 3 font as in the real portal.
- Bugs found/fixed during testing: ISS-002 (label `x-text`), KPI filter hiding a card after reply.
- Committed to branch `prototype-v1` (`f4c634e` first iteration).

## 2026-09-24 — First iteration (Tailwind + vanilla JS) — superseded

- Initial prototype scoped from the Angular `reports` project: two clients (Northwind Advisory, Harbourline Wealth) with autofill login, dashboards, reports and content pages, mock JSON data. Replaced the same day by the htmx + Alpine rebuild above.
