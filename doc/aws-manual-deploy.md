# 手動部署 — S3（前端）+ EC2／pm2（後端）

> **Task：** T15（不含 GitHub Actions，見 T16／[`ci-cd-runbook.md`](ci-cd-runbook.md)）  
> **前置：** 先完成 [`aws-setup-guide.md`](aws-setup-guide.md)（S3、CloudFront SPA fallback、EC2、nginx、`/etc/goose-web.env`）。  
> **腳本：** repo 根目錄 `ops/`  
> **文件版本：** v1.1　**最後更新：** 2026-07-21

---

## 架構回顧

| 端 | 產物 | 目標 |
|----|------|------|
| 前端 | `web/frontend/dist/` | `aws s3 sync` → S3 → CloudFront invalidate |
| 後端 | `web/backend/dist/` + `package.json`／lock | SCP／rsync → EC2 → `npm ci --omit=dev` → `pm2 reload` |

機密只在 EC2 **`/etc/goose-web.env`**；前端僅注入公開的 `VITE_API_BASE_URL`。

---

## 0. 本機環境變數（部署用）

在 shell 中 export（勿 commit）：

```bash
# 通用
export AWS_REGION=ap-southeast-2

# 前端
export S3_BUCKET=goose-web-frontend-prod
export CLOUDFRONT_DISTRIBUTION_ID=E1234567890ABC
export VITE_API_BASE_URL=https://api.example.com   # 或 https://example.com 若同域反代

# 後端
export EC2_HOST=203.0.113.10
export EC2_USER=ec2-user
export EC2_SSH_KEY=$HOME/.ssh/goose-web.pem
# 可選：遠端目錄（預設 /opt/goose-web/backend）
# export EC2_APP_DIR=/opt/goose-web/backend
```

Windows：建議在 **Git Bash** 或 **WSL** 執行 `ops/*.sh`。

---

## 1. 前端：build → S3 → invalidate

### 一鍵腳本

於 **repo 根目錄**：

```bash
chmod +x ops/deploy-frontend.sh
./ops/deploy-frontend.sh
```

腳本會：

1. `npm ci` + `npm run build`（於 `web/frontend`，帶入 `VITE_API_BASE_URL`）
2. `aws s3 sync dist/ s3://$S3_BUCKET/ --delete`
3. 若有設 `CLOUDFRONT_DISTRIBUTION_ID`：invalidate `/index.html`、`/assets/*`、`/models/*`、`/press-kit/*`

### 手動等效指令

```bash
cd web/frontend
npm ci
VITE_API_BASE_URL="$VITE_API_BASE_URL" npm run build

aws s3 sync dist/ "s3://${S3_BUCKET}/" --delete --region "$AWS_REGION"

aws cloudfront create-invalidation \
  --distribution-id "$CLOUDFRONT_DISTRIBUTION_ID" \
  --paths "/index.html" "/assets/*" "/models/*" "/press-kit/*"
```

### 驗收（前端）

- [ ] 瀏覽器開 CloudFront／自訂網域首頁正常
- [ ] 進入 `/levels/0` 後 **重整** 仍顯示頁面（SPA fallback）
- [ ] Network 中 API 打到預期的 `VITE_API_BASE_URL`

---

## 2. 後端：build → 上傳 EC2 → pm2

### 一鍵腳本

```bash
chmod +x ops/deploy-backend.sh
./ops/deploy-backend.sh
```

腳本會：

1. 本機 `web/backend`：`npm ci` → `npm run build`
2. 打包／rsync：`dist/`、`package.json`、`package-lock.json`、`ops/pm2/ecosystem.config.cjs`（至遠端 app 目錄；**不要**上傳本機 `node_modules`）
3. SSH 遠端：**先** `npm ci --omit=dev`（必做，否則缺 `cookie-parser` 等套件）→ 再 `pm2 reload`／首次 `pm2 start`

### 首次上機額外步驟（只做一次）

詳見 [`aws-setup-guide.md`](aws-setup-guide.md) §4：

1. 寫好 `/etc/goose-web.env`（範本：`ops/env/goose-web.env.example`）
2. 安裝 nginx：本機 `scp` `ops/nginx/goose-web.conf` → EC2，再 `sudo cp` 到 `/etc/nginx/conf.d/`（見 setup guide §4.6）
3. 遠端 `npm ci --omit=dev` → `pm2 start ecosystem.config.cjs` → `pm2 startup`（貼上印出的 sudo 指令）→ `pm2 save`

### 手動等效（bash／Git Bash）

```bash
cd web/backend
npm ci && npm run build

rsync -avz -e "ssh -i $EC2_SSH_KEY" \
  --exclude node_modules \
  dist package.json package-lock.json \
  "${EC2_USER}@${EC2_HOST}:/opt/goose-web/backend/"

scp -i "$EC2_SSH_KEY" ops/pm2/ecosystem.config.cjs \
  "${EC2_USER}@${EC2_HOST}:/opt/goose-web/backend/"

ssh -i "$EC2_SSH_KEY" "${EC2_USER}@${EC2_HOST}" <<'EOF'
set -euo pipefail
cd /opt/goose-web/backend
npm ci --omit=dev
if pm2 describe goose-web >/dev/null 2>&1; then
  pm2 reload ecosystem.config.cjs --update-env
else
  pm2 start ecosystem.config.cjs
  pm2 save
fi
pm2 status
EOF
```

### 手動等效（Windows PowerShell）

> **注意：** 不要用 `$host`（PowerShell 唯讀內建變數）。用 `$ec2`。

```powershell
cd D:\_myproject_WebsitePorjects\myhandisagooseWebsite\web\backend
npm ci
npm run build

$pem = "<path-to-ec2-pem>"
$ec2 = "ec2-user@EC2_ELASTIC_IP"   # 換成實際 IP

scp -i $pem -r dist package.json package-lock.json "${ec2}:/opt/goose-web/backend/"
scp -i $pem "..\..\ops\pm2\ecosystem.config.cjs" "${ec2}:/opt/goose-web/backend/"

ssh -i $pem $ec2
# 進入 EC2 後：
#   cd /opt/goose-web/backend
#   npm ci --omit=dev          # 必做
#   pm2 start ecosystem.config.cjs   # 或 pm2 restart goose-web --update-env
#   pm2 save
```
### 驗收（後端／全站）

```bash
# 公網 health（依你的 API 網域調整）
curl -fsS "https://api.example.com/health"
# 預期含 ok／healthy 類狀態（與本專案 HealthController 一致）
```

- [ ] `curl` health 成功
- [ ] 前端頁面可打通 API（關卡列表等）
- [ ] EC2 上 `pm2 logs goose-web` 無持續錯誤；`NODE_ENV=production`
- [ ] Atlas 可見連線；安全組未對公網開 `3002`

---

## 3. 回滾（手動）

| 端 | 做法 |
|----|------|
| 前端 | 用已知良好的 `dist/` 再跑一次 `deploy-frontend.sh`；或 S3 Versioning 還原後 invalidate |
| 後端 | 重部署上一個 git commit 的 build；或保留 `/opt/goose-web/backend.prev` 再 `pm2 reload` |

---

## 4. 與 T16 的邊界

| 本文件（T15） | T16 |
|---------------|-----|
| 手動／本機腳本上架 | GitHub Actions `ci.yml`／`deploy-*.yml` |
| IAM Access Key 本機使用可接受 | 建議改 OIDC Role |
| 驗收：公網站 + API health | 另加：PR CI 綠燈、main 自動部署 |

T15 完成定義：文件與腳本齊備，且依 [`aws-setup-guide.md`](aws-setup-guide.md) 建好資源後，**實際跑一次腳本**能通過上方驗收清單。
