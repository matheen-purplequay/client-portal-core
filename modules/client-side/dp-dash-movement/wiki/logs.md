# Activity Log

Append-only chronological record of significant changes, fixes, and decisions. Most recent entries at the top.

---

## 2026-06-30

**Removed default job filters**
- Changed initial filter state in all 4 job table components (`bs-job-table`, `smsf-job-table`, `fp-job-table`, `bk-job-table`) from pre-set Financial Year and Job Status defaults to `{ financial_year: "All", status_id: 0 }` (no filters applied on load)
- Removed unused `getPreviousFinancialYear` and `getFinancialYear` helper functions from the affected files

---

## 2026-06-11

**Wiki initialised**
- Created `wiki/` folder with `index.md`, `architecture.md`, `issues.md`, `logs.md`
- Created `CLAUDE.md` in project root with collaboration instructions
- Architecture documented: Web Component embedding model, business verticals, module structure, dev vs production data flow
