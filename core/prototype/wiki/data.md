# Mock Data

All data lives in `data/` as static JSON, loaded with `fetch()` through `CP.json / CP.clientData(name) / CP.sharedData(name)` (`core.js`). `clientData` resolves to `data/clients/<session.client_id>/<name>.json`, so switching client means logging in as the other demo user.

The JSON was generated once with seeded one-off scripts (not kept in the repo) relative to the prototype date **2026-09-24**. Edit the JSON directly, or write a new generator — there is none to re-run. All names are invented; example emails use `.example` domains.

## Demo clients

| | Northwind Advisory Pty Ltd (`northwind`) | Harbourline Wealth Partners (`harbourline`) |
|---|---|---|
| Login | olivia.bennett@northwind.example | daniel.reyes@harbourline.example |
| Password / OTP | `Client@123` / `123456` | `Client@123` / `123456` |
| Verticals | Business Services, SMSF, Bookkeeping | Financial Planning, Bookkeeping |
| Jobs | 181 | 70 |
| Queries | 240 | 66 |

Both clients see the same screens; only verticals and data differ.

## `data/auth/`

- `users.json` — `{ otp, users: [{ email, password, first_name, last_name, designation, phone, client_id }] }`
- `clients.json` — `[{ id, name, short, color, verticals: [{ id, code, title }], contracts, sub_clients, city, abn, account_manager }]`. `verticals` drives the Job Status vertical buttons; `name` (minus "Pty Ltd") is used in the legend chip. Other fields are currently unused by the UI (see issues).

## `data/clients/<id>/`

| File | Shape | Used by |
|---|---|---|
| `jobs.json` | `[{ job_id, group_job_name ("-" if none), job_name, nature_of_job, received_from, partner, director, manager, associate, reviewer, financial_year, job_year, received_date, commenced_date, yet_to_start_date, due_date, work_status, priority, budget_hours, actual_hours, last_modified, vertical, vertical_code, sub_client, timeline: [{ status, on }] }]` sorted newest received first | Job Status (table, detail, report), Queries (job lookup) |
| `movement.json` | `{ updated_at, days: [{ date, target, actual, dwp_target, dwp_actual, touchpoints: [row], dwp: [row] }] }`, row = `{ job_id, job_name, vertical, status, by, at }`; 14 days, weekends have target 0 | Movement |
| `queries.json` | `[{ id ("Q12345"), title, job_id, category, sub_category, raised_by, criticality (Low/Normal/Medium/High), status (Open/Responded/Resolved/Closed), posted_on (ISO datetime), description, documents (count), thread: [{ side: carisma|client, name, at, text }] }]` — `job_id` joins to `jobs.json` | Queries |
| `reports.json` | `{ connect: [{ id, title, month, published_on, size, type, summary }], weekly: [{ id, title, week_start, size, type }] }` | Reports |
| `invoices.json` | `[{ invoice_no, period, issued_on, due_on, amount, gst, total, currency, status (Paid/Due/Overdue) }]` | Reports → Invoices |
| `team.json` | `[{ name, role, group, email }]` (group "Leadership" or a vertical) | Team |
| `profile.json` | `{ company, abn, city, contracts, verticals, engagement_start, account_manager, support_email, support_phone }` | Profile, Contact Us |
| `notifications.json` | `[{ title, body, route, action_title }]` — `route` is an app route such as `/dashboard/queries` | Bell menu |

### Job work statuses

`WIP - Processing`, `Sent For Queries`, `WIP - Query Replies`, `Sent For Review`, `WIP - Review Replies`, `Sent For Final Review`, `Job Completed`. "Live" = everything except `Job Completed`. The client-held statuses (yellow tiles) are `Sent For Queries`, `Sent For Review`, `Sent For Final Review` — this is a hard-coded list in `assets/js/pages/job-status.js` (`STATUS_TILES`), not in the data.

## `data/shared/`

`newsletters.json`, `knowledge-center.json` (`{ categories, articles }`), `it-guidelines.json`, `faq.json`, `holidays.json` (AU + India), `about.json` — identical for both clients.

## Conventions

- Dates are ISO strings (`YYYY-MM-DD` or `YYYY-MM-DDTHH:MM:SS`), parsed manually in `CP.fmt` to avoid timezone drift. Display formats: `dmy` → 24-09-2026, `dm` → 24-9-2026, `dt` → 24-9-2026 12:31 PM, `long` → September 24, 2026.
- Keep `queries.job_id` values valid against `jobs.json`; the Queries screen silently drops queries whose job is missing.
- Job status names are matched as exact strings in the code — changing one in JSON requires updating `STATUS_TILES` and the KPI logic.
