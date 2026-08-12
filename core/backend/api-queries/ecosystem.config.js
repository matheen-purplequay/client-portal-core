module.exports = {
  apps: [
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
