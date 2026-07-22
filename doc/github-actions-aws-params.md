# GitHub Actions 部署用參數（範本）

> **用途：** T16 設定 GitHub Variables／Secrets 時對照用。  
> **對齊：** [`ci-cd-runbook.md`](ci-cd-runbook.md) §3、[`aws-manual-deploy.md`](aws-manual-deploy.md)。  
> **公開 repo：** 本檔只放 placeholder；真實 PROD 數值請複製為  
> `github-actions-aws-params.local.md`（已列入 `.gitignore`，勿提交）。

```bash
cp doc/github-actions-aws-params.md doc/github-actions-aws-params.local.md
# 再把下列 <...> 換成實際值；填入 GitHub Settings → Secrets and variables → Actions
```

---

## GitHub Variables（可寫進 Actions Variables）

| 名稱 | 範例／placeholder | 用途 |
|------|-------------------|------|
| `AWS_REGION` | `<aws-region>`（例：`us-west-1`） | S3／CLI region |
| `S3_BUCKET` | `<frontend-s3-bucket>` | 前端 `s3 sync` |
| `CLOUDFRONT_DISTRIBUTION_ID` | `<cloudfront-distribution-id>` | 前端 invalidate |
| `VITE_API_BASE_URL` | `https://<api-cloudfront-or-domain>` | 前端 build 注入的 API 根 |
| `EC2_USER` | `ec2-user` | SSH 使用者（也可放 Secret） |
| `EC2_APP_DIR`（可選） | `/opt/goose-web/backend` | 遠端 app 目錄 |

---

## GitHub Secrets（機密）

| 名稱 | 說明 |
|------|------|
| `AWS_ROLE_ARN` | OIDC assume role（建議） |
| `AWS_ACCESS_KEY_ID`／`AWS_SECRET_ACCESS_KEY` | 僅備援（無 OIDC 時） |
| `EC2_HOST` | EC2 Elastic IP 或 DNS（**勿**把真實 IP 寫進公開文件） |
| `EC2_SSH_KEY` | `.pem` 私鑰全文（部署後端用；**勿**進 git） |

---

## 不要放進 Actions

留在 EC2 **`/etc/goose-web.env`**（本機對應 `ops/env/goose-web.env`，已 gitignore）：

- `MONGO_URI`、`RESEND_*`、`VOTE_IP_HASH_SECRET`、`OCULUS_*`、`META_APP_ID` 等業務機密
- `PORT`、`CORS_ORIGIN`、`PUBLIC_ASSET_BASE_URL` 也在機上維護即可

---

## 相關資源對照（寫在 `.local.md`，不要進公開檔）

| 項目 | placeholder |
|------|-------------|
| AWS 帳號 | `<aws-account-id>` |
| 前端 CloudFront | `https://<frontend-cloudfront-domain>` |
| API CloudFront | `https://<api-cloudfront-domain>` |
| EC2 Elastic IP | `<ec2-elastic-ip>` |
| IAM OIDC trust `sub` | `repo:<github-owner>/<repo>:*` |

---

## Workflow 各自需要哪些

| Job | 需要的參數 |
|-----|------------|
| 前端 → S3／CloudFront | `AWS_REGION`、`AWS_ROLE_ARN`（或 Access Key）、`S3_BUCKET`、`CLOUDFRONT_DISTRIBUTION_ID`、`VITE_API_BASE_URL` |
| 後端 → EC2／pm2 | `EC2_HOST`、`EC2_USER`、`EC2_SSH_KEY`（可選 `EC2_APP_DIR`） |

設定位置：GitHub repo → **Settings → Secrets and variables → Actions**。
