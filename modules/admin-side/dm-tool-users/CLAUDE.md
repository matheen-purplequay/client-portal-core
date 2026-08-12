# CLAUDE.md — dm-tool-users

This module has a wiki at `wiki/` — read it before making changes.

## On every session start
1. Read `wiki/index.md` first.
2. Read `wiki/architecture.md` for system context.
3. Skim `wiki/issues.md` for known open issues relevant to the task.
4. Check `wiki/feature-updates/` for relevant plans if the task involves a feature.

## After making changes
- Update `wiki/architecture.md` if modules, data flow, or stack change.
- Update `wiki/issues.md` when a bug is found, worked on, or fixed.
- Append to `wiki/logs.md` describing what was done and why.

## Also see
- Root project instructions: `/home/matheensv/projects/internal/client-portal/CLAUDE.md` — in
  particular: do not touch auth/CORS-related code, and confirm with the user before any DB/model/
  migration changes.
