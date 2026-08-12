# Wiki Skill — Project Knowledge Base

## What This Skill Does

This skill turns Claude into a persistent knowledge curator for this project.
Instead of re-reading and re-deriving the codebase from scratch every session,
Claude maintains a structured wiki that compounds knowledge over time.

The codebase (`src/`) is the raw source — read-only, never modified.
The wiki (`wiki/`) is Claude-owned and continuously updated.

---

## Wiki File Structure

```
wiki/
  index.md                          ← Start here every session (navigation + instructions)
  architecture.md                   ← High-level system map (updated when structure changes)
  issues.md                         ← Known bugs/issues with status tracking
  logs.md                           ← Running log of sessions, decisions, changes
  feature-updates/
    phase-1/
      <plan-name>.md                ← Feature plans per phase
    phase-2/
      <plan-name>.md
```

---

## How to Add This as a Skill in Claude Code

1. Copy the contents of this file into `.claude/skills/wiki.md` at your project or user level.
2. Invoke it in any session by typing `/wiki` followed by an action:
   - `/wiki init` — analyze the project and create all wiki files from scratch
   - `/wiki update` — re-read the codebase and refresh outdated wiki pages
   - `/wiki log <message>` — append a log entry to `logs.md`
   - `/wiki issue <title>` — add a new issue entry to `issues.md`
   - `/wiki plan <phase> <name>` — create a new feature plan file

---

## Skill Instructions (for Claude)

When this skill is invoked, follow the relevant action below.

### On every session start (before doing any task)
1. Read `wiki/index.md` to orient yourself.
2. Read `wiki/architecture.md` to understand the system.
3. Skim `wiki/issues.md` for known open issues relevant to the task.
4. Check relevant `wiki/feature-updates/` plans if the task involves a feature.

### `/wiki init` — Initialize the wiki
Analyze the project codebase and create all wiki files. Steps:
1. Read `src/` structure: package.json, tsconfig, src/src/ files, config, modules, shell, core.
2. Create `wiki/architecture.md` — see template below.
3. Create `wiki/issues.md` — start empty with header only.
4. Create `wiki/logs.md` — log this init session.
5. Create `wiki/index.md` — navigation guide for Claude.
6. Do NOT create feature-updates files unless the user provides plans to document.

### `/wiki update` — Refresh the wiki
Re-read the parts of the codebase that have likely changed and update affected wiki pages.
Always append an entry to `logs.md` describing what was updated and why.

### `/wiki log <message>` — Append a log entry
Append to `wiki/logs.md` under today's date. Format:
```
## YYYY-MM-DD
- <message>
```

### `/wiki issue <title>` — Add an issue
Append to `wiki/issues.md`. Format:
```
### <title>
- **Status:** Open
- **Description:** <description>
- **Steps to Reproduce:** <steps>
- **Fix:** Pending
```

### `/wiki plan <phase> <name>` — Create a feature plan
Create `wiki/feature-updates/phase-<phase>/<name>.md`. Format:
```
# <Plan Name>
**Phase:** <phase>
**Status:** Draft

## Goal
<what this feature achieves>

## Scope
<what is included / excluded>

## Approach
<how it will be implemented>

## Tasks
- [ ] <task 1>
- [ ] <task 2>

## Notes
<any context, constraints, or decisions>
```

---

## File Templates

### `wiki/architecture.md`
```markdown
# Architecture

## Overview
<1-2 sentence description of what this project does>

## Tech Stack
- <key dependency and its role>

## Project Structure
<tree of key folders and what they contain>

## Data Flow
<how data moves through the system — user action → component → service → output>

## Key Modules
<brief description of each major module>

## External Dependencies / Integrations
<APIs, databases, services this project talks to>

## Known Constraints
<performance limits, browser targets, auth requirements, etc.>
```

### `wiki/issues.md`
```markdown
# Issues

<!-- Each issue: Status can be Open, In Progress, Resolved -->

### <Issue Title>
- **Status:** Open | In Progress | Resolved
- **Description:** <what is wrong>
- **Steps to Reproduce:** <how to trigger it>
- **Fix:** <what was done, or Pending>
```

### `wiki/logs.md`
```markdown
# Logs

## YYYY-MM-DD
- <what happened, what was analyzed, what was changed, what decisions were made>
```

### `wiki/index.md`
```markdown
# Wiki Index — Navigation Guide for Claude

## Start Every Session Here
1. Read this file first.
2. Read architecture.md for system context.
3. Check issues.md for known problems.
4. Check feature-updates/ for relevant plans.

## Files
- architecture.md — system map, tech stack, data flow
- issues.md — bug tracker with status and fix notes
- logs.md — session history and decision trail
- feature-updates/ — phase-organized feature plans

## Update Rules
- Update architecture.md when modules, data flow, or stack change.
- Update issues.md when a bug is found, worked on, or fixed.
- Always append to logs.md at the end of a session or after a significant action.
- Create feature-updates/ entries when a new feature is being planned.
```

---

## Why This Works

Normally every Claude session starts cold — the codebase gets re-read,
the architecture re-derived, known issues re-discovered. This wiki breaks that cycle:

- Claude reads the wiki first (fast) instead of crawling the source (slow)
- Knowledge from past sessions carries forward
- Issues don't get re-investigated from scratch
- Feature plans have context and history

The LLM handles the bookkeeping (keeping wiki files current, consistent, cross-linked).
The human focuses on deciding what to build and reviewing what changed.
