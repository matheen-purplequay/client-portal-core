module.exports = {
  apps: [
    {
      name: "api-accounts",
      cwd: "/var/www/client-portal/production/backend/api-accounts",
      script: "php",
      args: "artisan serve --host=127.0.0.1 --port=8001",
      interpreter: "none",
      env: {
        APP_ENV: "production",
      },
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000,
    },
    {
      name: "api-reports",
      cwd: "/var/www/client-portal/production/backend/api-reports",
      script: "php",
      args: "artisan serve --host=127.0.0.1 --port=8002",
      interpreter: "none",
      env: {
        APP_ENV: "production",
      },
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000,
    },
    {
      name: "api-queries",
      cwd: "/var/www/client-portal/production/backend/api-queries",
      script: "dotnet",
      args: "WMAPI.dll",
      interpreter: "none",
      env: {
        ASPNETCORE_ENVIRONMENT: "Production",
        ASPNETCORE_URLS: "http://127.0.0.1:5064",
      },
      autorestart: true,
      max_restarts: 10,
      restart_delay: 3000,
    },
  ],
};
