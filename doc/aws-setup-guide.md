# AWS 設定教學 — 鵝頭官網（S3 + CloudFront + EC2）

> **用途：** 從零建立正式站基礎設施（T15 前置）。  
> **對齊：** [`web_plan.md`](web_plan.md) §4、[`web_backend_express.md`](web_backend_express.md) §10、[`web_frontend_react.md`](web_frontend_react.md) §5。  
> **部署操作：** 資源建好後改看 [`aws-manual-deploy.md`](aws-manual-deploy.md) 與 `ops/` 腳本。  
> **不要做：** GitHub Actions／OIDC（屬 T16，見 [`ci-cd-runbook.md`](ci-cd-runbook.md)）。  
> **文件版本：** v1.0　**最後更新：** 2026-07-20

本專案架構：

```
瀏覽器
  │
  ├─ HTTPS ─► CloudFront ─► S3（Vite SPA：HTML／JS／models／press-kit）
  │
  └─ HTTPS ─► 域名／ALB 或 EC2:443 ─► nginx ─► Node pm2 :3001 ─► MongoDB Atlas
```

建議區域（任選其一，全文一致即可）：`ap-southeast-2`（雪梨）或 `ap-northeast-1`（東京）。下文以 **`ap-southeast-2`** 為例。

---

## 0. 事前準備

| 項目 | 說明 |
|------|------|
| AWS 帳號 | 已開通；建議開 IAM 使用者做日常操作，勿長期用 root |
| AWS CLI | 本機已安裝並 `aws configure`（Access Key + 預設 region） |
| 網域（可選） | 例：`myhandisagoose.com`；可先用 CloudFront／EC2 預設網域驗收 |
| MongoDB Atlas | 已有 cluster；稍後把 EC2 Elastic IP 加入 Network Access |
| SSH 金鑰 | 本機一組金鑰對（`.pem`），EC2 建立時選用 |

檢查 CLI：

```bash
aws sts get-caller-identity
aws configure get region
```

---

## 1. IAM：本機手動部署用使用者（最小權限）

控制台：**IAM → Users → Create user**（例：`goose-web-deployer`）。

附加自訂政策（把 `ACCOUNT_ID`、`BUCKET_NAME`、`DISTRIBUTION_ID` 換成實際值；尚未建資源時可先給較寬的 S3／CloudFront，建完再收斂）：

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "FrontendS3",
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket",
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject"
      ],
      "Resource": [
        "arn:aws:s3:::BUCKET_NAME",
        "arn:aws:s3:::BUCKET_NAME/*"
      ]
    },
    {
      "Sid": "CloudFrontInvalidate",
      "Effect": "Allow",
      "Action": ["cloudfront:CreateInvalidation", "cloudfront:GetInvalidation"],
      "Resource": "arn:aws:cloudfront::ACCOUNT_ID:distribution/DISTRIBUTION_ID"
    }
  ]
}
```

建立 **Access key**（CLI），本機：

```bash
aws configure
# AWS Access Key ID / Secret / Default region / output=json
```

後端部署用 **SSH**，不必給此 IAM 使用者 EC2 管理權限。

---

## 2. 前端：S3 靜態網站 Bucket

### 2.1 建立 Bucket

```bash
export AWS_REGION=ap-southeast-2
export S3_BUCKET=goose-web-frontend-prod   # 全域唯一，請自行改名

aws s3api create-bucket \
  --bucket "$S3_BUCKET" \
  --region "$AWS_REGION" \
  --create-bucket-configuration LocationConstraint="$AWS_REGION"
```

（`us-east-1` 不需 `LocationConstraint`；其他區域需要。）

### 2.2 封鎖公開存取（交給 CloudFront OAC）

建議：**Block all public access = ON**。訪客只經 CloudFront，不直接開 S3 網站 endpoint。

```bash
aws s3api put-public-access-block \
  --bucket "$S3_BUCKET" \
  --public-access-block-configuration \
  BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
```

可選：開啟 **Versioning**（方便手動回滾前端）。

```bash
aws s3api put-bucket-versioning \
  --bucket "$S3_BUCKET" \
  --versioning-configuration Status=Enabled
```

### 2.3 先上傳空／測試檔（可選）

建好 CloudFront 後再用 [`aws-manual-deploy.md`](aws-manual-deploy.md) 的腳本 `ops/deploy-frontend.sh` 正式 sync。

---

## 3. 前端：CloudFront + SPA fallback

### 3.1 Origin Access Control（OAC）

控制台：**CloudFront → Origin access → Create control setting**  
或 CLI 建立後，在 Distribution 的 Origin 選該 OAC，並依提示更新 S3 bucket policy（允許 `cloudfront.amazonaws.com` 的 `s3:GetObject`，條件綁此 distribution ARN）。

### 3.2 Distribution 重點設定

| 項目 | 建議值 |
|------|--------|
| Origin | S3 bucket（用 OAC，非 legacy OAI） |
| Viewer protocol | Redirect HTTP → HTTPS |
| Default root object | `index.html` |
| Alternate domain（可選） | `www.example.com` + ACM 憑證（須在 **us-east-1** 申請給 CloudFront） |
| Price class | 視預算（例：PriceClass_200） |

### 3.3 SPA：403／404 → `/index.html`（必做）

Vite + React Router 深層路徑（如 `/levels/1`）直接重整時，S3 沒有該 key 會 403／404。在 CloudFront **Custom error responses**：

| HTTP error | Response page path | Response code |
|------------|--------------------|---------------|
| 403 | `/index.html` | 200 |
| 404 | `/index.html` | 200 |

否則驗收「公網可開站」時，只有首頁正常、子路由重整會失敗。

### 3.4 記下 Distribution ID

之後 invalidate 與腳本會用：

```bash
export CLOUDFRONT_DISTRIBUTION_ID=E1234567890ABC
```

---

## 4. 後端：EC2

### 4.1 安全組（Security Group）

入站建議：

| Type | Port | Source | 說明 |
|------|------|--------|------|
| SSH | 22 | 僅你的 IP／VPN | 或改用 SSM、關閉 22 |
| HTTP | 80 | `0.0.0.0/0` | Let's Encrypt／導向 HTTPS |
| HTTPS | 443 | `0.0.0.0/0` | nginx TLS |
| Custom TCP | 3001 | **不要**對公網開 | 只給本機 nginx 反代 |

出站：預設允許（需連 Atlas、Resend、Oculus GraphQL）。

### 4.2 啟動實例

| 項目 | 建議 |
|------|------|
| AMI | Amazon Linux 2023 或 Ubuntu 22.04 LTS |
| Instance type | `t3.micro`／`t4g.micro`（免費層／省錢） |
| Key pair | 本機持有的 `.pem` |
| Storage | 8–20 GB gp3 |
| Elastic IP | **建議綁定**，方便 Atlas allowlist 與 DNS |

記下：公網 IP／Elastic IP、SSH 使用者（Amazon Linux 多為 `ec2-user`，Ubuntu 多為 `ubuntu`）。

### 4.3 首次登入與系統套件

```bash
ssh -i /path/to/goose-web.pem ec2-user@EC2_ELASTIC_IP

# Amazon Linux 2023 示意
sudo dnf update -y
sudo dnf install -y nginx git
# Node 20 LTS（依官方 NodeSource／fnm／nvm 擇一）
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo dnf install -y nodejs
sudo npm install -g pm2
```

Ubuntu：

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx
# 再安裝 Node 20 + pm2
```

### 4.4 應用目錄

```bash
sudo mkdir -p /opt/goose-web/backend
sudo chown -R "$USER":"$USER" /opt/goose-web
```

### 4.5 `/etc/goose-web.env`（機密只放機上）

```bash
sudo install -m 600 /dev/null /etc/goose-web.env
sudo nano /etc/goose-web.env
```

欄位範本見 `ops/env/goose-web.env.example`（複製內容後填正式值）。重點：

- `NODE_ENV=production`
- `CORS_ORIGIN`／`PUBLIC_ASSET_BASE_URL` 指向前端正式網域（CloudFront 或自訂網域）
- `MONGO_URI` 等**不要**進 git、不要進前端 bundle

```bash
sudo chown root:root /etc/goose-web.env
sudo chmod 600 /etc/goose-web.env
# 若 pm2 以一般使用者跑，需讓該使用者可讀：
sudo chown root:ec2-user /etc/goose-web.env
sudo chmod 640 /etc/goose-web.env
```

### 4.6 nginx

將 repo 內 `ops/nginx/goose-web.conf` 放到 EC2（路徑依 distro 調整）：

```bash
sudo cp goose-web.conf /etc/nginx/conf.d/goose-web.conf
# 或 sites-available + sites-enabled（Ubuntu）
sudo nginx -t && sudo systemctl enable --now nginx
sudo systemctl reload nginx
```

HTTPS：用 **Certbot**（Let's Encrypt）或把憑證放到 nginx。第一階段可先 HTTP 驗 `/health`，再補 TLS。

### 4.7 pm2

首次部署後（見手動部署文件）：

```bash
cd /opt/goose-web/backend
pm2 start ops/pm2/ecosystem.config.cjs   # 或部署後目錄內的 ecosystem
pm2 save
pm2 startup   # 依提示執行 systemd 指令
```

確認環境變數來自 `/etc/goose-web.env`（ecosystem 的 `env_file` 或 shell `set -a; source …`）。

---

## 5. MongoDB Atlas

1. **Network Access**：加入 EC2 **Elastic IP**（`/32`）。開發機 IP 可另加。
2. **Database User**：強密碼；連線字串寫入 `/etc/goose-web.env` 的 `MONGO_URI`。
3. 避免長期 `0.0.0.0/0`（若暫時開放，務必 TLS + 強密碼，並盡快改回 IP allowlist）。

---

## 6. DNS（可選）

| 紀錄 | 指向 |
|------|------|
| `www`／apex | CloudFront distribution（Alias／A） |
| `api`（若 API 獨立子網域） | EC2 Elastic IP 或 Load Balancer |

前端 `VITE_API_BASE_URL` 建置時寫死為 API 公開根（例：`https://api.example.com`），須與 nginx／CORS 一致。

若前後端同網域（CloudFront 行為分流 `/api/*` → EC2）屬進階設定；第一階段可用 **不同網域／子網域** 較單純。

---

## 7. 設定完成檢查清單

- [ ] S3 bucket 建立；公開存取封鎖；CloudFront OAC + bucket policy
- [ ] CloudFront 403／404 → `/index.html`（SPA）
- [ ] EC2 + Elastic IP + 安全組（22 限縮、3001 不對公網）
- [ ] Node 20、nginx、pm2 已安裝
- [ ] `/etc/goose-web.env` 權限 600／640，含 `NODE_ENV=production`
- [ ] Atlas allowlist 含 EC2 IP
- [ ] 本機 AWS CLI 可對目標 bucket 做 `s3 sync`（權限足夠）

完成後 → [`aws-manual-deploy.md`](aws-manual-deploy.md) 執行首次上架與驗收。
