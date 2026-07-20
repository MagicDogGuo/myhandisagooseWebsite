#!/usr/bin/env bash
# Deploy backend: build locally → rsync to EC2 → npm ci --omit=dev → pm2 reload/start.
# Requires: ssh, rsync, Node 20+ locally; remote Node + pm2 already installed.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT/web/backend"
EC2_APP_DIR="${EC2_APP_DIR:-/opt/goose-web/backend}"

: "${EC2_HOST:?Set EC2_HOST}"
: "${EC2_USER:?Set EC2_USER}"
: "${EC2_SSH_KEY:?Set EC2_SSH_KEY (path to .pem)}"

if [[ ! -f "$EC2_SSH_KEY" ]]; then
  echo "error: EC2_SSH_KEY file not found: $EC2_SSH_KEY" >&2
  exit 1
fi

SSH=(ssh -i "$EC2_SSH_KEY" -o StrictHostKeyChecking=accept-new)
RSYNC_RSH="ssh -i ${EC2_SSH_KEY} -o StrictHostKeyChecking=accept-new"

echo "==> Backend install + build"
cd "$BACKEND_DIR"
npm ci
npm run build

if [[ ! -d dist ]]; then
  echo "error: dist/ missing after build" >&2
  exit 1
fi

echo "==> Ensure remote app dir ${EC2_APP_DIR}"
"${SSH[@]}" "${EC2_USER}@${EC2_HOST}" "mkdir -p '${EC2_APP_DIR}'"

echo "==> Rsync dist + package manifests"
rsync -avz -e "$RSYNC_RSH" \
  --delete \
  --exclude node_modules \
  "$BACKEND_DIR/dist/" \
  "${EC2_USER}@${EC2_HOST}:${EC2_APP_DIR}/dist/"

rsync -avz -e "$RSYNC_RSH" \
  "$BACKEND_DIR/package.json" \
  "$BACKEND_DIR/package-lock.json" \
  "$ROOT/ops/pm2/ecosystem.config.cjs" \
  "${EC2_USER}@${EC2_HOST}:${EC2_APP_DIR}/"

echo "==> Remote npm ci + pm2"
"${SSH[@]}" "${EC2_USER}@${EC2_HOST}" bash -s -- "$EC2_APP_DIR" <<'EOF'
set -euo pipefail
APP_DIR="$1"
cd "$APP_DIR"

if [[ ! -f /etc/goose-web.env ]]; then
  echo "error: missing /etc/goose-web.env — copy ops/env/goose-web.env.example on the server first" >&2
  exit 1
fi

npm ci --omit=dev

if pm2 describe goose-web >/dev/null 2>&1; then
  pm2 reload ecosystem.config.cjs --update-env
else
  pm2 start ecosystem.config.cjs
fi
pm2 save
pm2 status goose-web
EOF

echo "==> Backend deploy done"
echo "    Verify: curl -fsS https://<api-host>/health"
