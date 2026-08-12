# Tasks — client-portal (frontend)

## 2026-06-29

- [TSK-20260629-01] [no-req] Explained why npm install consumes ~2GB RAM on low-memory servers and provided solutions including npm ci, swap space, and moving builds off production — complete
- [TSK-20260629-02] [no-req] Created PM2 ecosystem.config.js for Angular frontend projects (reports on port 8002, pq-admin on port 8003) placed inside core/frontend/src/dist — complete
- [TSK-20260629-03] [no-req] Fixed PM2 ecosystem config error (ENOTFOUND -l) by removing args and relying solely on PM2_SERVE_* env vars for built-in static server — complete
- [TSK-20260629-04] [no-req] Updated nginx config for deliveryportal.purplequay.com to reverse proxy to PM2 port 8002 instead of serving static files directly — complete
- [TSK-20260629-05] [no-req] Diagnosed nginx parse error caused by inline Certbot comments splitting across lines and provided clean configs with comments removed — complete
- [TSK-20260629-06] [no-req] Clarified that Laravel (PHP) backends do not use PM2 and are served via PHP-FPM + nginx instead — complete
- [TSK-20260629-07] [no-req] Provided separate nginx config files for api-reports and api-accounts Laravel backends with SSL, PHP-FPM, and symlink enable commands — complete
- [TSK-20260629-08] [no-req] Provided updated nginx config for deliveryportal-wmapi.purplequay.com (.NET reverse proxy on port 5000) with Certbot comments removed — complete

---
