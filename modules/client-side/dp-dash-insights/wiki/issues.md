# Issues

<!-- Each issue: Status can be Open, In Progress, Resolved -->

## ISS-004 — `process is not defined` browser error after deploy

- **Status:** Resolved (2026-06-25)
- **Symptom:** Widget failed to load in the browser with `Uncaught ReferenceError: process is not defined` thrown from inside `widget.js`.
- **Root cause:** The widget is built as an IIFE (browser format) but a dependency internally references `process.env.NODE_ENV`. Node.js provides `process` globally; browsers do not. Vite does not substitute `process.env.*` references unless explicitly told to via the `define` config option.
- **Fix:** Added `define: { 'process.env.NODE_ENV': JSON.stringify('production') }` to `vite.config.ts`. Vite replaces the reference at build time, eliminating the runtime error.

## ISS-003 — UtilizationTab: Monthly Capacity KPI showing "—" and TOTAL/CAPACITY rows appearing in table body

- **Status:** Resolved (2026-06-24)
- **Symptom:** The Monthly Capacity card always showed "—". The TOTAL and CAPACITY sentinel rows from the SP were rendered as regular data rows in the table body, and the footer computed incorrect totals via client-side `sum()`.
- **Root cause:** `Capacity_Total` was read from `data[0]` (the first row), but the SP places the CAPACITY row last. The TOTAL and CAPACITY rows were not filtered out before rendering, and the client-side `sum()` was doubling the TOTAL row's values into the footer.
- **Fix:** Filter `data` into `tableRows` (excluding `ContractType === 'TOTAL'` and `'CAPACITY'`); locate CAPACITY row by `ContractType` to read `Capacity_Total` for the KPI card; use TOTAL row values directly in tfoot; removed `sum()` helper.

## ISS-002 — FeedbackTab and UtilizationTab: missing data in table columns

- **Status:** Resolved (2026-06-24)
- **Symptom:** Most columns in both the Feedback and Utilization tables showed blank values. In Feedback, only Vertical, Description, and Action Taken rendered. In Utilization, only Vertical, Associate Name, and Average rendered. KPI cards in Feedback tab always showed "—".
- **Root cause:** SP column names did not match the placeholder field names assumed in the TypeScript interfaces. Specific mismatches:
  - `FeedbackTab`: SP returns `Feedback Given By`, `Feedback Given To`, `Feedback Given Date`, `Job Name` (with spaces); interface had `FeedbackGivenBy`, `FeedbackGivenTo`, `FeedbackDate`, `JobName`.
  - `UtilizationTab`: SP returns `ContractType`, `MonthBudget`, `Capacity_Total` and dynamic month columns named `Mar-2026` style; interface had `ModeOfContract`, `CommittedHrs`, `CapacityPercent`, and static `Month2Hrs/Month1Hrs/MonthHrs` which never exist on the row object.
  - Month column headers were also off by one month (showing Apr/May/Jun instead of Mar/Apr/May).
  - KPI cards (Feedback Count, Total Jobs Received, Performance) were reading from the feedback detail SP which doesn't return those fields — they come from a separate SP `SP_Feedback_Percentage_shibu` with no endpoint wired up.
- **Fix:** Updated `FeedbackRow` interface to use quoted keys with spaces; updated `UtilizationRow` to use real SP field names plus an index signature for dynamic month keys; added `spMonthKey()` util to generate `Mar-2026` format keys; fixed month header range (subtract 3/2/1 not 2/1/0); added new backend endpoint `POST /client/dashboard/insights/feedback-summary` calling `SP_Feedback_Percentage_shibu`; added second `useTabData` call in `FeedbackTab` for summary data; updated `FeedbackSummary` interface to `Feedback`, `TotalJobs`, `Percentage`.

## ISS-001 — AppreciationTab blank page crash

- **Status:** Resolved (2026-06-24)
- **Symptom:** Switching to the Appreciation tab caused a blank page with `Uncaught TypeError: can't access property "split", name is undefined` in the browser console.
- **Root cause:** `AppreciationRow` interface used placeholder field names (`PersonName`, `JobLabel`, `AppreciationDate`, `Message`) that did not match the real SP output. SP returns columns with spaces (`Appreciation Given To`, `Job Name`, etc.), so all fields were `undefined` at runtime. `initials()` then called `.split()` on `undefined`.
- **Fix:** Updated interface to match real SP column names; added null guard to `initials()`; updated all JSX references; added `Appreciation Given By` and `Vertical` fields to the card display.

