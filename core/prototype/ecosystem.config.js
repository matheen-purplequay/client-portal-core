// PM2 config for the static prototype.
// Start:  pm2 start ecosystem.config.js
// Port:   set PORT in core/prototype/.env (e.g. PORT=9000) or in the shell. Default 8000.
// After changing .env:  pm2 delete client-portal-prototype && pm2 start ecosystem.config.js
const fs = require('fs');
const path = require('path');

const envFile = path.join(__dirname, '.env');
const fileEnv = {};
if (fs.existsSync(envFile)) {
  fs.readFileSync(envFile, 'utf8').split(/\r?\n/).forEach((line) => {
    const m = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/.exec(line);
    if (m && !line.trim().startsWith('#')) fileEnv[m[1]] = m[2].replace(/^(['"])(.*)\1$/, '$2');
  });
}

const PORT = process.env.PORT || fileEnv.PORT || 8000;

module.exports = {
  apps: [
    {
      name: 'client-portal-prototype',
      script: 'server.js',
      env: { PORT },
      cwd: __dirname,
      autorestart: true,
      watch: false,
    },
  ],
};
