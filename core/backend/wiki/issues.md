# Issues

<!-- Each issue: Status can be Open, In Progress, Resolved -->

### Key updates endpoint: wrong DB connection (records_mysql instead of wm_mysql)
- **Status:** Resolved
- **Date:** 2026-06-25
- **Description:** `POST /api/client/dashboard/insights/key-updates` was using `DB::connection('records_mysql')` (local `cp_reports` DB) to query `metrics_report.tbl_keyupdate` and `metrics_report.tbl_keyupdatelist`. The `metrics_report` schema does not exist on the records MySQL server, causing `SQLSTATE[42000]: Unknown database 'metrics_report'`.
- **Root cause:** The `metrics_report` schema lives on the Works Manager server (172.16.29.11), accessible via `wm_mysql`, not `records_mysql`.
- **Affected file:** `routes/dashboard/insights.php` (lines 126 and 136)
- **Fix:** Changed both `DB::connection('records_mysql')` calls in the `key-updates` route handler to `DB::connection('wm_mysql')`.

### Hardcoded database names in api-reports route files
- **Status:** Resolved
- **Description:** 27 occurrences of hardcoded database names (`welinnwd_pqaccounts`, `welinnwd_pqreports`) were spread across 5 route files in `api-reports`. Two patterns existed: (1) fully hardcoded strings in cross-DB joins (e.g. `->leftJoin('welinnwd_pqaccounts.services as s', ...)`), and (2) `env()` calls with hardcoded fallbacks (`env('ACCOUNTS_BASE_TABLE', 'welinnwd_pqaccounts')`). Fully hardcoded occurrences were in `cms-routes.php` (lines 158, 202, 247), `feedback-status.php` (lines 117, 240, 398), `job-status/instructions.php` (lines 31, 180, 331, 364), and raw SQL in `report-routes.php` (lines 858–882).
- **Affected files:** `routes/cms-routes.php`, `routes/common.php`, `routes/report-routes.php`, `routes/feedback-status.php`, `routes/job-status/instructions.php`
- **Fix:** Replaced hardcoded strings with `env()` calls throughout — `env('ACCOUNTS_BASE_TABLE', 'welinnwd_pqaccounts')` and `env('REPORTS_BASE_TABLE', 'welinnwd_pqreports')`. Database names defined in `.env`. The fallback values remain so the code degrades gracefully if the env vars are missing.
