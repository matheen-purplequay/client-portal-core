# Issues

<!-- Each issue: Status can be Open, In Progress, Resolved -->

### Dual state-management pattern (store/ vs stores/)
- **Status:** Open
- **Description:** `source/src/store/useClientStore.ts` (singular, Zustand) and `source/src/stores/userStore.ts` (plural, plain in-memory getter/setter module) are two separate, inconsistently-named state patterns doing the same kind of job (app-level state).
- **Steps to Reproduce:** N/A — structural observation from `/wiki init` codebase scan.
- **Fix:** Pending — consider consolidating to a single pattern/folder naming convention.
