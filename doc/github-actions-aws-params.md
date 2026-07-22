# GitHub Actions 部署用 AWS／環境參數（PROD）

> **用途：** T16 設定 GitHub Variables／Secrets 時對照用。  
> **對齊：** [`ci-cd-runbook.md`](ci-cd-runbook.md) §3、[`aws-manual-deploy.md`](aws-manual-deploy.md)。  
> **最後更新：** 2026-07-21（依目前 PROD 實機）

---

## GitHub Variables（可公開）

| 名稱 | 目前實際值 | 用途 |
|------|------------|------|
| `AWS_REGION` | `us-west-1` | S3／CLI region |
| `S3_BUCKET` | `<frontend-s3-bucket>` | 前端 `s3 sync` |
| `CLOUDFRONT_DISTRIBUTION_ID` | `<cloudfront-distribution-id>` | 前端 invalidate（`<frontend-cloudfront-domain>`） |
| `VITE_API_BASE_URL` | `https://<api-cloudfront-domain>` | 前端 build 注入的 API 根 |
| `EC2_USER` | `ec2-user` | SSH 使用者（也可放 Secret） |
| `EC2_APP_DIR`（可選） | `/opt/goose-web/backend` | 遠端 app 目錄 |

---

## GitHub Secrets（機密）

| 名稱 | 說明 |
|------|------|
| `AWS_ROLE_ARN` | OIDC assume role（建議；T16 建好後填） |
| `AWS_ACCESS_KEY_ID`／`AWS_SECRET_ACCESS_KEY` | 僅備援（無 OIDC 時） |
| `EC2_HOST` | 目前：`<ec2-elastic-ip>`（或之後的 DNS） |
| `EC2_SSH_KEY` | `.pem` 私鑰全文（部署後端用） |

---

## 不要放進 Actions

留在 EC2 **`/etc/goose-web.env`**，不要寫進 GitHub：

- `MONGO_URI`、`RESEND_*`、`VOTE_IP_HASH_SECRET`、`OCULUS_*`、`META_APP_ID` 等業務機密
- `PORT`（PROD 為 `3002`）、`CORS_ORIGIN`、`PUBLIC_ASSET_BASE_URL` 也在機上維護即可

---

## 相關資源對照（通常不進 Actions 變數）

| 項目 | 值 |
|------|-----|
| AWS 帳號 | `<aws-account-id>` |
| 前端 CloudFront | `https://<frontend-cloudfront-domain>`（Distribution `<cloudfront-distribution-id>`） |
| API CloudFront | `https://<api-cloudfront-domain>`（origin → EC2） |
| EC2 Elastic IP | `<ec2-elastic-ip>` |
| IAM OIDC trust `sub` | `repo:MagicDogGuo/myhandisagooseWebsite:*`（見 ci-cd-runbook） |

---

## Workflow 各自需要哪些

| Job | 需要的參數 |
|-----|------------|
| 前端 → S3／CloudFront | `AWS_REGION`、`AWS_ROLE_ARN`（或 Access Key）、`S3_BUCKET`、`CLOUDFRONT_DISTRIBUTION_ID`、`VITE_API_BASE_URL` |
| 後端 → EC2／pm2 | `EC2_HOST`、`EC2_USER`、`EC2_SSH_KEY`（可選 `EC2_APP_DIR`）；**不必**給 S3／CloudFront 權限（除非改走 SSM） |

設定位置：GitHub repo → **Settings → Secrets and variables → Actions**。
