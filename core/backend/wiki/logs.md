# Logs

## 2026-06-23 (hardcoded DB names — resolved)
- Replaced all hardcoded `welinnwd_pqaccounts` / `welinnwd_pqreports` strings in api-reports routes with `env('ACCOUNTS_BASE_TABLE', ...)` / `env('REPORTS_BASE_TABLE', ...)` calls; database names now defined in `.env`
- Logged in issues.md as resolved

## 2026-06-23 (wiki update — second pass)
- Updated architecture.md: added `dashboard/insights.php` to route file listing; noted `dashboard/dashboard-home.php` is an orphaned file not required by api.php
- Added Insights Dashboard module to api-reports Key Modules table (utilization/feedback/appreciation endpoints; wm_mysql SPs)
- Added wm_mysql constraint note (WorksManager DB used by Insights Dashboard SPs)
- Added hardcoded database names constraint: 27 occurrences of `welinnwd_pqaccounts`/`welinnwd_pqreports` across 5 api-reports route files (cms-routes.php:158/202/247; common.php:99/121/278; report-routes.php:51/86/143/193/299/322/531/675/723/846 area; feedback-status.php:117/240/398; job-status/instructions.php:31/180/331/364); most use env() fallback but some are fully hardcoded strings

## 2026-06-23 (wiki update)
- Updated architecture.md with product context: wealth management client portal for viewing job details, monitoring dashboards, replying to queries, and giving job instructions. Frontend is hybrid Angular + React web component architecture.

## 2026-06-23
- Fixed local mail sending error on `get-token` endpoint. Root cause: `MAIL_FROM_ADDRESS` in `.env.local` did not match `MAIL_USERNAME`, causing Exchange/O365 to reject the message with `554 5.2.252 SendAsDenied`. The authenticated SMTP account (`projects@carisma-solutions.com.au`) was not permitted to send as the From address (`clientportalsupport@carisma-solutions.com.au`). Resolved by aligning `.env.local` credentials to match production — both `MAIL_USERNAME` and `MAIL_FROM_ADDRESS` must use the same account (`clientportalsupport@carisma-solutions.com.au`).

## 2026-06-22
- Wiki initialized. Analyzed full backend project structure: two Laravel 10 microservices (api-accounts, api-reports). Documented tech stack, module breakdown, data flow, cross-DB dependencies, and known constraints. No issues logged yet.
