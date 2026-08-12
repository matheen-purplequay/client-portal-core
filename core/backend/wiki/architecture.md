# Architecture

## Overview
A Laravel-based client portal backend composed of two independent microservices: **api-accounts** (user/company/auth management) and **api-reports** (report generation, analytics, and approval workflows). Both expose RESTful APIs consumed by a separate frontend client portal.

**Product context:** The portal is used by wealth management clients to view job details, monitor job status across multiple dashboards (Job Movement, Monthly Connect, Job Status, Feedback Status, Queries), reply to queries, and give job instructions. The frontend is a hybrid Angular + React web component app.

## Tech Stack
- **Framework**: Laravel 10.10+ (PHP 8.1+)
- **Authentication**: Laravel Sanctum (API token, 365-day expiry) + Laravel Breeze (accounts only)
- **Authorization**: Spatie Laravel Permission (RBAC — roles, permissions, policies)
- **Database**: MySQL (primary), with cross-service `accounts_mysql` connection in api-reports
- **Real-time**: Firebase Real-time Database + Pusher (broadcasting)
- **Excel/PDF**: Maatwebsite Excel 3.1, smalot/pdfparser (reports service only)
- **HTTP Client**: Guzzle 7
- **Async**: Spatie Async (accounts service)
- **Location**: stevebauman/location (IP-based, accounts service)
- **API Docs**: L5-Swagger / Scribe (accounts service)
- **Frontend tooling**: Vite 4, TailwindCSS 3, AlpineJS 3 (blade views within each service)
- **Deployment**: cPanel file-copy deploy

## Project Structure

```
backend/
├── api-accounts/       # Service 1 — User, company, auth, permissions
│   ├── app/
│   │   ├── Http/Controllers/   # AuthController, UserController, CompaniesController, RolesController, etc.
│   │   ├── Models/             # 37 models (User, Company, Projects, Apps, Teams, Devices, …)
│   │   ├── Mail/               # OTP, dynamic, contact emails
│   │   ├── Policies/           # Fine-grained authorization
│   │   └── Providers/          # AppServiceProvider (Swagger), RouteServiceProvider
│   ├── routes/
│   │   ├── api.php             # Main API (61 KB)
│   │   ├── admin.php / admin/  # Admin dashboard routes
│   │   ├── client.php / client/
│   │   ├── wm_api/             # Works Manager integration
│   │   ├── common/, auth.php, onboard.php
│   ├── database/migrations/    # Users, companies, permissions, jobs, devices, …
│   ├── config/                 # 22 files — l5-swagger, firebase, permission, sanctum, error_codes
│   └── public/docs/            # Generated API docs
│
└── api-reports/        # Service 2 — Reports, analytics, invoices, CMS
    ├── app/
    │   ├── Http/Controllers/   # 27 controllers — Reports, Weekly, Connect, Invoices, Comments, etc.
    │   ├── Models/             # 58 models (ConnectReports, WeeklyReports, Invoices, FeedbackStatus, …)
    │   ├── Exports/            # ExcelExport.php
    │   ├── Imports/            # Excel imports
    │   └── Mail/               # Report approval, comment update emails
    ├── routes/                 # 20+ route files
    │   ├── api.php             # Dispatcher — requires all sub-route files
    │   ├── report-routes.php   # Reports (51 KB — largest)
    │   ├── common.php          # Shared endpoints (19 KB)
    │   ├── feedback-status.php # Feedback (21 KB)
    │   ├── cms-routes.php      # Knowledge Center, Articles (14 KB)
    │   ├── movement-routes.php # Job movement (11 KB)
    │   ├── monthly-routes.php  # Monthly dashboard
    │   ├── realtime-routes.php # Real-time updates
    │   ├── dashboard/
    │   │   ├── movement.php    # Job movement dashboard endpoints
    │   │   ├── insights.php    # Insights dashboard endpoints (utilization/feedback/appreciation)
    │   │   ├── reports.php     # Reports dashboard endpoints
    │   │   └── dashboard-home.php  # Orphaned — not required by api.php
    │   ├── rules.php, client/, job-status/, queries/
    ├── database/migrations/    # Reports, invoices, feedback, sessions, …
    ├── storage/json/           # JSON file storage
    └── config/                 # 18 files — excel, variables, firebase, sanctum
```

## Data Flow

```
Client Portal (frontend)
    │
    ├─► api-accounts  (/api, /admin, /client, /wm_api)
    │       │
    │       ├─ Sanctum token auth
    │       ├─ Spatie RBAC check
    │       ├─ MySQL (accounts DB)
    │       ├─ Firebase (real-time events)
    │       └─ Pusher (broadcasting)
    │
    └─► api-reports   (/api → route files)
            │
            ├─ Sanctum token auth
            ├─ MySQL (reports DB) + accounts_mysql (cross-DB reads)
            ├─ Excel/PDF generation → response/download
            ├─ Firebase + Pusher (notifications)
            └─ Mail (approval workflows, comment updates)
```

## Key Modules

### api-accounts
| Module | Controllers / Key Models | Purpose |
|--------|--------------------------|---------|
| Auth | AuthController, OtpController | Login, OTP 2FA, Sanctum tokens |
| Users | UserController, ProfileController | CRUD, user details |
| Companies | CompaniesController | Company & master company management |
| RBAC | RolesController | Spatie roles, permissions, portal rules |
| Projects/Apps | ProjectsController, AppController | App/project associations |
| Works Manager | wm_api routes | External WM system integration |
| Real-time | Firebase + Pusher | Push notifications, device management |
| Location | stevebauman/location | IP-based location detection |

### api-reports
| Module | Controllers / Key Models | Purpose |
|--------|--------------------------|---------|
| Reports | ReportsController, ConnectReportsController | Weekly, monthly, connect reports |
| Approval workflow | SendReportApprovalRequest mail | Report approval request/response |
| Invoices | InvoicesController | Client invoicing |
| Feedback | FeedbackStatus routes | Status codes and feedback loops |
| CMS | KnowledgeCenterController | Articles, tools, knowledge base |
| Comments | CommentsController | Per-report comment threads |
| Job Movement | movement-routes.php | Job status transitions |
| Insights Dashboard | dashboard/insights.php | Utilization, Feedback, Appreciation endpoints for dp-dash-insights web component; calls SPs via wm_mysql |
| Excel/PDF | ExcelController, PDFCheckerController | Export and parse documents |
| Real-time | realtime-routes.php | Live updates |

## External Dependencies / Integrations
- **Works Manager** — external job management system; accessed via dedicated `wm_api` routes and `wm_mysql` DB connection in api-accounts
- **Firebase Real-time Database** — push notifications and real-time events (both services)
- **Pusher** — broadcasting driver (both services)
- **SMTP / Mailpit** — transactional email (dev: mailpit on port 1025)
- **cPanel** — production deployment host

## Known Constraints
- Token lifetime is set to 365 days in Sanctum config
- api-reports cross-queries the accounts database via `accounts_mysql` connection (User model in reports)
- api-reports also queries the WorksManager database via `wm_mysql` connection (used by Insights Dashboard SPs)
- ThrottleRequests middleware is commented out in api-reports — no rate limiting active
- Deployment is manual file-copy via cPanel `.cpanel.yml`; no CI/CD pipeline observed
- Both services share identical `.env.example` structure — likely deployed to same server with separate env files
- `dashboard/dashboard-home.php` is an orphaned file — it is NOT required by `api.php` and has no active load point; any routes placed there will not register
- Hardcoded database names (`welinnwd_pqaccounts`, `welinnwd_pqreports`) appear in 27 places across 5 route files in api-reports; most use `env()` fallbacks but cms-routes.php, feedback-status.php, instructions.php and raw SQL in report-routes.php:858–882 are fully hardcoded
