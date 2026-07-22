# CI/CD Runbook — GitHub Actions → AWS（S3 + EC2）

> **對齊規格：** [`web_plan.md`](web_plan.md) §4、[`web_dev_tasks.md`](web_dev_tasks.md) T15／T16、前後端部署章節。  
> **分支模型：** 以 **`main` = 正式站（PROD）**；不另開 `develop`／DEV AWS（省成本）。  
> **時機：** 先完成本機功能 → T15 手動上架一次 → 最後再做 T16（本 runbook）。不要提早做 Actions。  
> **文件版本：** v1.2　**最後更新：** 2026-07-20

本 repo 的 pipeline（`.github/workflows/`，尚待 T16 建立）會：PR 跑品質閘門；`main` 通過後部署到 **PROD**（前端 S3／CloudFront、後端 EC2＋pm2）。建議用 **GitHub OIDC → AWS IAM Role**，避免長期 Access Key 放在 Secrets。

Workflow 程式碼進 git 後，下列步驟仍須由有 **AWS＋GitHub 管理權** 的人在控制台／CLI 完成，pipeline 才會真正能跑。

---

## 與參考專案（GCP／多環境）的差異

| 參考（Stickybeak 類） | 本專案（goose 官網） |
|----------------------|---------------------|
| GCP Cloud Run + Artifact Registry | 前端 S3＋CloudFront；後端 EC2＋nginx＋pm2 |
| Workload Identity Federation（GCP） | GitHub OIDC → AWS IAM Role（或 Access Key 備援） |
| `develop`／`release`／`v*` → DEV／TEST／PROD | **僅 PROD**：PR → CI；`push` `main` → 部署 |
| 映像 tag（`admin:dev-<sha>` 等） | 前端 `dist/` sync；後端上傳後 `npm ci --omit=dev` + `pm2 reload` |
| 多專案 terraform／WIF | 本階段以手動／既有 AWS 資源為主（T15 先驗） |

**刻意不做 `develop`／第二套 AWS：** 少一份 S3／CloudFront／EC2 帳單；整合與驗收以本機＋PR CI 為主，確認後再 merge 進 `main` 上正式站。

---

## Workflows（對應 T16）

| 檔案 | Trigger | 做什麼 |
|------|---------|--------|
| `ci.yml` | `pull_request`／`push` → `main` | 前後端：`npm ci` → lint → typecheck → test → build |
| `deploy-frontend.yml` | `push` → `main`（且 CI 成功／`needs: ci`） | OIDC → `aws s3 sync` `web/frontend/dist` → CloudFront invalidate |
| `deploy-backend.yml` | `push` → `main`（且 CI 成功） | SSH 或 SSM → 上傳 → 遠端 `npm ci --omit=dev` → `pm2 reload` |

也可合成單一 `deploy.yml`，用 `needs: ci` 串前後端部署。

可選 path filter：只改 `web/frontend/**` 只部署前端；只改 `web/backend/**` 只部署後端；只改 `doc/**` 可 skip。

套件路徑（本 repo）：

```
web/frontend/     # Vite SPA → S3
web/backend/      # Express → EC2
.github/workflows/
  ci.yml
  deploy-frontend.yml
  deploy-backend.yml
```

（`.github` 必須在 **repo 根目錄**，GitHub 才會辨識。）

---

## 分支與上線節奏

長期分支只要 **`main`**。功能用短命 feature 分支，經 PR 進 `main`：

```bash
git checkout main
git pull
git checkout -b feature/t05-landing
# …開發、本機驗收…
git push -u origin HEAD
gh pr create --base main   # PR 觸發 ci.yml；綠燈後 merge
# merge 進 main → CI 再跑 → 自動部署 PROD
```

版本標籤可選（僅發佈紀錄／GitHub Release；部署仍由 `push` `main` 觸發）：

```bash
git tag v1.2.0
git push origin v1.2.0
```

Gotchas：

- **merge 進 `main` 即上正式站。** 建議 `production` Environment 加 required reviewers，或 merge 前一定要本機／預覽驗完。
- 後端機密（`MONGO_URI`、`RESEND_*`、`OCULUS_*` 等）放在 EC2 **`/etc/goose-web.env`**，不要寫進 Actions，也不要進前端 bundle。
- 前端 build 必須注入 `VITE_API_BASE_URL`（Actions Variables／Secrets）。

### 回滾（第一階段手動為主）

| 端 | 做法 |
|----|------|
| 前端 | 重新 `s3 sync` 已知良好的 `dist/`；或 S3 versioning 還原；再 invalidate CloudFront |
| 後端 | EC2 指回上一版目錄／`pm2 reload`；或重部署上一個 `main` commit |
| 流程 | 在 `main` 上 hotfix PR 修復後再發；避免 force-push `main` |

---

## 1. 先完成 T15（手動上架）

在寫／開 workflow 之前，確認手動路徑已通：

- [ ] 前端 `npm run build` → `aws s3 sync` → 公網可開；SPA fallback（404 → `index.html`）
- [ ] 後端上傳 EC2 → `npm ci --omit=dev` → `pm2`；nginx；`NODE_ENV=production`
- [ ] EC2 `/etc/goose-web.env` 已填齊；Atlas allowlist 含 EC2 Elastic IP
- [ ] 公網 health ok

**T15 文件／腳本：** [`aws-setup-guide.md`](aws-setup-guide.md)（從零建 AWS）、[`aws-manual-deploy.md`](aws-manual-deploy.md)（上架步驟）、repo `ops/`（`deploy-*.sh`、nginx、pm2、env 範本）。  
細節亦見 `web_backend_express.md` §10、`web_frontend_react.md` §5。

---

## 2. AWS：OIDC（建議）或 Access Key

### 2.1 建議：GitHub OIDC → IAM Role

1. 在 AWS IAM 建立 OIDC Identity Provider：  
   URL `https://token.actions.githubusercontent.com`，Audience `sts.amazonaws.com`
2. 建立 Role（例：`github-actions-goose-web`），信任本 repo：

```json
{
  "Effect": "Allow",
  "Principal": { "Federated": "arn:aws:iam::ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com" },
  "Action": "sts:AssumeRoleWithWebIdentity",
  "Condition": {
    "StringEquals": {
      "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
    },
    "StringLike": {
      "token.actions.githubusercontent.com:sub": "repo:MagicDogGuo/myhandisagooseWebsite:*"
    }
  }
}
```

3. 權限建議最小集：
   - 前端：目標 bucket 的 `s3:PutObject`／`DeleteObject`／`ListBucket`；`cloudfront:CreateInvalidation`
   - 後端若用 SSH：Role 可不碰 EC2；若用 SSM：加對應權限

GitHub 設 `AWS_ROLE_ARN`。

### 2.2 備援：長期 Access Key

僅在無法開 OIDC 時使用：`AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY`。權限同上，且定期輪替。

---

## 3. 設定 GitHub Variables／Secrets

實際 PROD 填值見 [`github-actions-aws-params.md`](github-actions-aws-params.md)。

`Settings → Secrets and variables → Actions`

| 名稱 | 類型 | 用途 |
|------|------|------|
| `AWS_ROLE_ARN` | Secret（或 Variable） | OIDC assume role（建議） |
| `AWS_ACCESS_KEY_ID`／`AWS_SECRET_ACCESS_KEY` | Secret | 僅備援 |
| `AWS_REGION` | Variable | 例如 `ap-southeast-2`／`ap-northeast-1` |
| `S3_BUCKET` | Variable | 前端靜態站 bucket |
| `CLOUDFRONT_DISTRIBUTION_ID` | Variable | invalidate 用 |
| `VITE_API_BASE_URL` | Variable／Secret | 前端 build 注入 |
| `EC2_HOST`／`EC2_USER`／`EC2_SSH_KEY` | Secret | 後端 SSH 部署 |
| （可選）SSM 相關 | — | 若改用 Session Manager，免開 22 |

**不要**把 `MONGO_URI`、`RESEND_API_KEY`、`OCULUS_GRAPH_ACCESS_TOKEN` 等放進 Actions——它們留在 EC2 `/etc/goose-web.env`。

---

## 4. 建立 GitHub Environment（可選）

`Settings → Environments`：建立 `production`。  
部署 job 設 `environment: production`；可加 **required reviewers**，讓 merge 後仍需手動核准才真正 sync／reload。

---

## 5. Branch protection on `main`

`Settings → Branches → Add rule`（或 Rulesets）for `main`：

- Require a pull request before merging
- Require status checks to pass → 選 `ci.yml` 的檢查
- Require branches to be up to date（建議）
- 禁止直接 push／限制 bypass（建議）

CLI 示意（需 repo admin；檢查名稱以實際 workflow job 為準）：

```bash
gh api -X PUT repos/MagicDogGuo/myhandisagooseWebsite/branches/main/protection \
  -H "Accept: application/vnd.github+json" \
  -f 'required_status_checks[strict]=true' \
  -f 'required_status_checks[contexts][]=ci' \
  -F 'enforce_admins=true' \
  -F 'required_pull_request_reviews[required_approving_review_count]=1' \
  -F 'restrictions=null'
```

（若 job 拆成 `frontend`／`backend`，把 `contexts` 改成實際 check 名稱。）

---

## 6. CI 檢查項目（前後端各自）

| 步驟 | 指令（示意） | 失敗則 |
|------|--------------|--------|
| Install | `npm ci` | 中止 |
| Lint | `npm run lint` | 中止、不部署 |
| Typecheck | `npm run typecheck` | 中止 |
| Test | `npm test`（vitest） | 中止 |
| Build | `npm run build` | 中止 |
| （可選）Audit | `npm audit --audit-level=high` | 依 T16 是否納入 |

前端 build 環境需帶 `VITE_API_BASE_URL`。

---

## 7. 部署步驟摘要（workflow 實作時對齊）

### 前端 → S3／CloudFront

1. Checkout + setup Node + `npm ci` + `npm run build`（於 `web/frontend`）
2. `aws-actions/configure-aws-credentials`（OIDC）
3. `aws s3 sync dist/ s3://$S3_BUCKET/ …`
4. `aws cloudfront create-invalidation`：至少 `/index.html`、`/assets/*`、`/models/*`、`/press-kit/*`

### 後端 → EC2

1. CI 通過後上傳 `dist/`、`package.json`、`package-lock.json` 等
2. SSH／SSM：`npm ci --omit=dev` → `pm2 reload`
3. 環境變數只讀 EC2 `/etc/goose-web.env`；Actions 不注入業務 secret

驗收（T16）：PR 跑 CI 綠燈；`main` 可部署（或 dry-run 通過）；公網站與 API health ok。

建議 commit message（T16）：

```
ci: add github actions for test build and aws deploy
```

---

## 8. 推送含 workflow 的變更

推送 `.github/workflows/*` 需要 token 具備 **`workflow`** scope。若被拒：

```bash
gh auth refresh -s workflow
```

---

## 9. 已知限制／第一階段不做

- **尚未建立** `.github/workflows/`（屬 T16；T15 之前不要提早做）
- **不維護 `develop`／DEV AWS**（成本考量）；品質靠本機驗收 + PR CI
- Actions 失敗不會自動還原 S3／EC2 上一版
- `npm audit`、Request ID／body limit 等硬化可另開小 commit（T16 可選）

---

## 對照 Task

| Task | 內容 | 與本 runbook |
|------|------|----------------|
| T15 | 手動 S3＋EC2、nginx、`/etc/goose-web.env` | §1 前置條件 |
| T16 | `ci.yml` + `deploy-*.yml` | 全文；實作 workflow 時依 §6–§7 |

執行順序：`web_dev_tasks.md` 規定一次只做一個 Task；做到 T16 時再依本文件設定 Secrets／protection 並提交 workflow。
