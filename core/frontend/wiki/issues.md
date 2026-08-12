# Issues Log

Chronological record of production issues investigated and resolved. Newest entries at the top.

---

## 2026-07-06 — Reports app serving stale build after `accounts_server` URL update

**Status:** Resolved

**Symptom:** After updating `accounts_server` in `projects/reports/src/environments/environment.ts` and `environment.prod.ts` from `https://pqaccountsapi.welingkaronline.org/api` to `https://deliveryportal-accountsapi.purplequay.com/api`, production (`https://clientportal.carisma-solutions.com.au`) kept calling the old URL despite the new URL being deployed to the server.

**Investigation:**
- Confirmed DNS/routing was correct — `clientportal.carisma-solutions.com.au` resolves to the right prod server (`209.38.82.217`), and nginx correctly proxies `/` to `localhost:8002`.
- Ruled out CORS config, `angular.json` `fileReplacements`, and auth/guest middleware as causes — all correctly configured.
- Compared the live `index.html` against the on-disk build: even after uploading a fresh `dist/reports` build to `/var/www/client-portal/production/frontend/build/apps/reports/` (confirmed correct `main.4d69a0fbd8d35da1.js` with the new URL baked in via `grep`), the live site kept serving an older bundle (`main.9609cd742b370e5d.js`, old URL).
- Root cause: the `cp-reports-app` pm2 process (`serve -s apps/reports -l 8002`, `exec cwd: /var/www/client-portal/production/frontend/build`) had been running for 4 days and was holding a stale in-memory/ETag reference to the old build files. Replacing files on disk was not sufficient — the long-running `serve` process needed to be restarted to pick up the new files.

**Fix:** `pm2 restart cp-reports-app` after redeploying the build. Confirmed live site then served `main.4d69a0fbd8d35da1.js` with the correct new URL.

**Follow-up / prevention:**
- A permanent fix was proposed but not yet applied: replace the pm2 `serve` proxy in nginx with a direct static-file `root` + `try_files $uri $uri/ /index.html` block pointing at `/var/www/client-portal/production/frontend/build/apps/reports/`. This removes the pm2/`serve` caching layer entirely so future deploys only require replacing files on disk, with no restart step.
- Recommend always running `pm2 restart cp-reports-app` as a standard last step of any deploy to this app until/unless the nginx direct-serve change is made.
- Noted in passing: `angular.json`'s `staging` build configuration for the `reports` project references `projects/reports/src/environments/environment.staging.ts`, which does not exist on disk — `ng build reports --configuration staging` would fail if ever run.

**Related pages:** [[log]]
