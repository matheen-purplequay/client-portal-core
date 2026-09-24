// PM2 config for the static prototype.
// Start:  pm2 start ecosystem.config.js
// Custom port:  PORT=9000 pm2 start ecosystem.config.js
const PORT = process.env.PORT || 8000;

module.exports = {
  apps: [
    {
      name: 'client-portal-prototype',
      script: 'python3',
      args: `-m http.server ${PORT}`,
      interpreter: 'none',
      cwd: __dirname,
      autorestart: true,
      watch: false,
    },
  ],
};
