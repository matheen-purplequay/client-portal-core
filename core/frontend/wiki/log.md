# Wiki Log — pq-wm-frontend

Append-only chronological record of all wiki operations. Never delete entries.
Format: one section per operation (INGEST / QUERY / LINT).

---

## ISSUE — 2026-07-06
**Source:** Live production debugging session (CORS check + stale `accounts_server` URL investigation)
**Pages updated:** [[issues]] (new entry: reports app serving stale build after `accounts_server` URL change)
**Pages created:** none
**Notes:** Root cause was the long-running `cp-reports-app` pm2 `serve` process holding a stale in-memory reference to old build files even after fresh files were deployed to disk — fixed with `pm2 restart cp-reports-app`. Proposed but not-yet-applied follow-up: replace pm2/`serve` proxy in nginx with direct static-file serving (`root` + `try_files`) to remove this caching layer permanently. See [[issues]] for full write-up.

---

## INGEST — 2026-06-23
**Source:** User-provided project overview and directory exploration
**Pages updated:** [[module-dashboard]] (corrected active dashboard tabs to 5; marked Realtime and Business Service Movement as inactive), [[index]] (added project overview, active/inactive projects, React modules section, catalog entries)
**Pages created:** [[concept-web-components]]
**Notes:** Clarified hybrid Angular+React architecture — React modules live in `modules/` (outside `core/frontend`), built as web components and embedded into Angular shell. Only reports, pq-admin, pq-ui are active Angular projects; cp-inbox is inactive.

---

## INGEST — 2026-06-02
**Source:** Initial wiki setup
**Pages updated:** none
**Pages created:** none
**Notes:** Wiki scaffolded with CLAUDE.md schema, index.md, log.md, and pages/ directory. Ready for first ingest.
