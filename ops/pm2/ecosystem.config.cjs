/**
 * pm2 ecosystem for goose-web backend on EC2.
 * Place next to package.json / dist/ (e.g. /opt/goose-web/backend/ecosystem.config.cjs).
 * Loads /etc/goose-web.env via dotenv in the app (dotenv/config in appConfig).
 *
 * Ensure the process environment includes vars from /etc/goose-web.env:
 *   set -a && source /etc/goose-web.env && set +a && pm2 start ecosystem.config.cjs
 * or use the helper below with env_file if your pm2 version supports it.
 */
const fs = require('node:fs');

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }
  const out = {};
  for (const line of fs.readFileSync(filePath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

const fileEnv = loadEnvFile('/etc/goose-web.env');

module.exports = {
  apps: [
    {
      name: 'goose-web',
      cwd: __dirname,
      script: 'dist/index.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        ...fileEnv,
        NODE_ENV: 'production',
      },
    },
  ],
};
