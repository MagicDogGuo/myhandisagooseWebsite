#!/usr/bin/env bash
# Deploy frontend: build → S3 sync → optional CloudFront invalidation.
# Run from anywhere; resolves paths relative to repo root.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONTEND_DIR="$ROOT/web/frontend"

: "${S3_BUCKET:?Set S3_BUCKET}"
: "${AWS_REGION:?Set AWS_REGION}"
: "${VITE_API_BASE_URL:?Set VITE_API_BASE_URL (public API origin for the SPA build)}"

echo "==> Frontend install + build (VITE_API_BASE_URL=$VITE_API_BASE_URL)"
cd "$FRONTEND_DIR"
npm ci
VITE_API_BASE_URL="$VITE_API_BASE_URL" npm run build

if [[ ! -d dist ]]; then
  echo "error: dist/ missing after build" >&2
  exit 1
fi

echo "==> Sync dist/ → s3://${S3_BUCKET}/"
aws s3 sync dist/ "s3://${S3_BUCKET}/" \
  --delete \
  --region "$AWS_REGION"

if [[ -n "${CLOUDFRONT_DISTRIBUTION_ID:-}" ]]; then
  echo "==> Invalidate CloudFront ${CLOUDFRONT_DISTRIBUTION_ID}"
  aws cloudfront create-invalidation \
    --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
    --paths "/index.html" "/assets/*" "/models/*" "/press-kit/*"
else
  echo "==> Skip invalidation (CLOUDFRONT_DISTRIBUTION_ID unset)"
fi

echo "==> Frontend deploy done"
