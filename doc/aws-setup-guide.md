# AWS 設定教學 — 鵝頭官網（S3 + CloudFront + EC2）

> **用途：** 從零建立正式站基礎設施（T15 前置）。  
> **對齊：** `[web_plan.md](web_plan.md)` §4、`[web_backend_express.md](web_backend_express.md)` §10、`[web_frontend_react.md](web_frontend_react.md)` §5。  
> **部署操作：** 資源建好後改看 `[aws-manual-deploy.md](aws-manual-deploy.md)` 與 `ops/` 腳本。  
> **不要做：** GitHub Actions／OIDC（屬 T16，見 `[ci-cd-runbook.md](ci-cd-runbook.md)`）。  
> **文件版本：** v1.4　**最後更新：** 2026-07-21

本專案架構：

```
瀏覽器
  │
  ├─ HTTPS ─► CloudFront ─► S3（Vite SPA：HTML／JS／models／press-kit）
  │
  └─ HTTPS ─► 域名／ALB 或 EC2:443 ─► nginx ─► Node pm2 :3002 ─► MongoDB Atlas
```

> 同機若另有服務佔用 `3001`（例：samcoffee），goose 固定用 **`PORT=3002`**，由 nginx 反代；兩個 Node 埠都**不要**對公網開放。

本專案區域：`us-west-1`（北加州）。S3、EC2、CLI 預設 region 一律用此；全文以此為準。

---

## 0. 事前準備


| 項目            | 說明                                               |
| ------------- | ------------------------------------------------ |
| AWS 帳號        | 已開通；建議開 IAM 使用者做日常操作，勿長期用 root                   |
| AWS CLI       | 本機已安裝並 `aws configure`（Access Key + 預設 region）   |
| 網域（可選）        | 例：`myhandisagoose.com`；可先用 CloudFront／EC2 預設網域驗收 |
| MongoDB Atlas | 已有 cluster；稍後把 EC2 Elastic IP 加入 Network Access  |
| SSH 金鑰        | 本機一組金鑰對（`.pem`），EC2 建立時選用                        |


檢查 CLI：

```bash
aws sts get-caller-identity
aws configure get region
```

---

## 1. IAM 與 CLI 登入（admin / deployer 分開）

本專案建議用 **兩個 IAM 使用者 + 兩個 CLI profile**，不要混在一起：


| Profile          | IAM 使用者（例）                     | 什麼時候用                             | 需要知道 BUCKET_NAME？                    |
| ---------------- | ------------------------------ | --------------------------------- | ------------------------------------ |
| `goose-admin`    | 有建置權限的管理帳（或你現有的 `TestDeloy_2`） | **§2–§4** 建 S3、CloudFront、EC2、IAM | **不需要** — 政策可給較寬的 S3／CloudFront 管理權限 |
| `goose-deployer` | `goose-web-deployer`（稍後新建）     | **日常** `s3 sync`、invalidate       | **需要** — §2 建好 bucket 後才套用 §1.3 最小權限 |


> **重點：**`BUCKET_NAME` **不是 AWS 發給你的 ID，是你在 §2 自己取的名字。**  
> 例如 `<frontend-s3-bucket>`（建議加帳號後綴避免全球重名）。  
> **goose-admin 建 bucket 時就決定了；goose-deployer 要等 bucket 存在後，才把這個名字寫進 IAM 政策。**

### 建議順序（照做就不會卡住）

```
1. 本機設定 goose-admin profile（§1.1）
2. 用 goose-admin 跑 §2 → 你自己取名並建立 S3 bucket
3. 用 goose-admin 跑 §3 → 建好 CloudFront，記下 DISTRIBUTION_ID
4. 用 goose-admin 在 IAM 建立 goose-web-deployer，套用 §1.3 最小權限
5. 本機設定 goose-deployer profile；之後部署只用它
```

各欄位從哪來：


| 變數                | 何時可知               | 怎麼取得                                                                            |
| ----------------- | ------------------ | ------------------------------------------------------------------------------- |
| `ACCOUNT_ID`      | 立刻                 | `aws sts get-caller-identity --query Account --output text`（你的是 `<aws-account-id>`） |
| `BUCKET_NAME`     | **§2.1 你自己取名**     | 不等 AWS 回傳；取名後 `create-bucket` 成功即確定                                             |
| `DISTRIBUTION_ID` | §3 建好 CloudFront 後 | 控制台，或 `aws cloudfront list-distributions`                                       |


### 1.1 goose-admin（建資源用，現在就做）

**不用**先寫死 `BUCKET_NAME`。用有足夠權限的 IAM 使用者即可（控制台可暫附 `AdministratorAccess`，或自訂較寬的 S3 + CloudFront 全帳號政策）。

本機建立 profile（PowerShell）：

```powershell
aws configure --profile goose-admin
# 輸入 admin 用 IAM 的 Access Key / Secret
# Default region: us-west-1
# Default output: json

aws sts get-caller-identity --profile goose-admin
```

之後跑 §2、§3 時指定 profile：

```powershell
$env:AWS_PROFILE = "goose-admin"

# 或每條指令加 --profile goose-admin
aws s3api create-bucket --bucket "你取的名字" ...
```

你目前的 `TestDeloy_2` 若權限夠建 S3／CloudFront，可直接當 `goose-admin` 用，不必再開新 user。

### 1.2 goose-deployer（日常部署用，§2、§3 完成後再做）

控制台：**IAM → Users → Create user**（`goose-web-deployer`）→ 建立 **Access key**（CLI）→ 附加 §1.3 政策。

本機：

```powershell
aws configure --profile goose-deployer
aws sts get-caller-identity --profile goose-deployer
```

後端部署走 **SSH**，不必給 deployer EC2 管理權限。

### 1.3 最小權限政策（僅 goose-deployer；§2、§3 完成後套用）

把 `ACCOUNT_ID`、`BUCKET_NAME`、`DISTRIBUTION_ID` 換成**已存在**的實際值（`BUCKET_NAME` = §2 你取的名字）：

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

範例（假設 bucket 取名 `<frontend-s3-bucket>`，Distribution ID 為 `E1234567890ABC`）：

```json
"Resource": [
  "arn:aws:s3:::<frontend-s3-bucket>",
  "arn:aws:s3:::<frontend-s3-bucket>/*"
]
```

```json
"Resource": "arn:aws:cloudfront::<aws-account-id>:distribution/E1234567890ABC"
```

---

## 2. 前端：S3 靜態網站 Bucket

### 2.1 建立 Bucket

先設好 profile（與 §1.1 相同）：

```powershell
$env:AWS_PROFILE = "goose-admin"
```

**PowerShell（Windows）：**

```powershell
$AWS_REGION = "us-west-1"
$S3_BUCKET = "<frontend-s3-bucket>"   # 全域唯一：自己取名，建議加帳號後綴

aws s3api create-bucket `
  --bucket $S3_BUCKET `
  --region $AWS_REGION `
  --create-bucket-configuration LocationConstraint=$AWS_REGION
```

**bash（macOS／Linux／Git Bash）：**

```bash
export AWS_REGION=us-west-1
export S3_BUCKET=<frontend-s3-bucket>   # 全域唯一：自己取名，建議加帳號後綴

aws s3api create-bucket \
  --bucket "$S3_BUCKET" \
  --region "$AWS_REGION" \
  --create-bucket-configuration LocationConstraint="$AWS_REGION"
```

（`us-east-1` 不需 `LocationConstraint`；其他區域需要。）

### 2.2 封鎖公開存取（交給 CloudFront OAC）

建議：**Block all public access = ON**。訪客只經 CloudFront，不直接開 S3 網站 endpoint。

**PowerShell：**

```powershell
aws s3api put-public-access-block `
  --bucket $S3_BUCKET `
  --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
```

**bash：**

```bash
aws s3api put-public-access-block \
  --bucket "$S3_BUCKET" \
  --public-access-block-configuration \
  BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
```

可選：開啟 **Versioning**（方便手動回滾前端）。

**PowerShell：**

```powershell
aws s3api put-bucket-versioning `
  --bucket $S3_BUCKET `
  --versioning-configuration Status=Enabled
```

**bash：**

```bash
aws s3api put-bucket-versioning \
  --bucket "$S3_BUCKET" \
  --versioning-configuration Status=Enabled
```

### 2.3 先上傳空／測試檔（可選）

建好 CloudFront 後再用 `[aws-manual-deploy.md](aws-manual-deploy.md)` 的腳本 `ops/deploy-frontend.sh` 正式 sync。

---

## 3. 前端：CloudFront + SPA fallback

### 3.1 Origin Access Control（OAC）＋建 Distribution

**OAC 是什麼：** S3 已封鎖公開存取後，用 OAC 當「專用鑰匙」——只有你指定的那台 CloudFront 能 `s3:GetObject`；訪客只能走 CloudFront，不能直接開 S3 URL。

建議順序：**(A) 建 OAC → (B) 建 Distribution 並掛 OAC → (C) 更新 S3 bucket policy**。建 Distribution 時也可順便現建 OAC。

#### A. 建立 OAC

控制台：[CloudFront](https://console.aws.amazon.com/cloudfront/v4/home) → 左側 **Origin access** → **Create control setting**


| 欄位               | 建議值                                 |
| ---------------- | ----------------------------------- |
| Name             | 例：`goose-web-s3-oac`                |
| Description      | 可空                                  |
| Signing behavior | **Sign requests (recommended)**（預設） |
| Origin type      | **S3**                              |


→ **Create**。記下 Name，下一步選用。

**CLI（可選，等同上面）：**

```powershell
aws cloudfront create-origin-access-control `
  --origin-access-control-config Name="goose-web-s3-oac",SigningProtocol=sigv4,SigningBehavior=always,OriginAccessControlOriginType=s3 `
  --profile goose-admin
```

輸出裡的 `Id`（例：`E1ABCD2EFGHIJ`）之後掛 Origin 會用到。

#### B. 建立 Distribution 並掛 OAC

控制台：CloudFront → **Distributions** → **Create distribution**

**Origin**


| 欄位                    | 建議值                                                              |
| --------------------- | ---------------------------------------------------------------- |
| Origin domain         | 下拉選你的 S3 bucket（**REST API**，例：`xxx.s3.us-west-1.amazonaws.com`） |
|                       | **不要**選 `xxx.s3-website-...`（網站端點不能用 OAC）                        |
| Origin access         | **Origin access control settings (recommended)**（不要用 legacy OAI） |
| Origin access control | 選 A 建好的 OAC，或按 **Create control setting** 現建                     |
| Name                  | 可留預設                                                             |


**Default cache behavior**


| 欄位                     | 建議值                        |
| ---------------------- | -------------------------- |
| Viewer protocol policy | **Redirect HTTP to HTTPS** |
| Allowed HTTP methods   | GET, HEAD（前端靜態夠用）          |
| Cache policy           | `CachingOptimized`         |


**Settings**


| 欄位                     | 建議值                                  |
| ---------------------- | ------------------------------------ |
| Default root object    | `index.html`                         |
| Price class            | 視預算（例：PriceClass_200／含亞太）            |
| Alternate domain + ACM | 可選；憑證須在 **us-east-1** 申請給 CloudFront |


→ **Create distribution**。建好後頁面常提示 **Copy policy**／更新 S3 bucket policy → **先複製那段 JSON**，下一步貼上。狀態會先是 **Deploying**，數分鐘後變 **Enabled**。

#### C. 更新 S3 bucket policy（必做，否則 CloudFront 讀不到檔）

控制台：[S3](https://console.aws.amazon.com/s3) → 你的 bucket → **Permissions** → **Bucket policy** → **Edit**

把下列三處換成實際值：


| 佔位符               | 從哪來                                                |
| ----------------- | -------------------------------------------------- |
| `BUCKET_NAME`     | §2 你取的名字                                           |
| `ACCOUNT_ID`      | `aws sts get-caller-identity`（本專案例：`<aws-account-id>`） |
| `DISTRIBUTION_ID` | CloudFront → Distributions 列表最左欄（例：`E1234ABCD...`） |


也可直接用建 Distribution 後頁面的 **Copy policy** 貼上再微調。

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontServicePrincipalReadOnly",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::BUCKET_NAME/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::ACCOUNT_ID:distribution/DISTRIBUTION_ID"
        }
      }
    }
  ]
}
```

範例（僅示意，勿原樣照貼）：

```json
"Resource": "arn:aws:s3:::<frontend-s3-bucket>/*",
"AWS:SourceArn": "arn:aws:cloudfront::<aws-account-id>:distribution/E1234567890ABC"
```

→ **Save changes**。

> §2.2 開了 Block public access 仍可存這份政策——它不是公開給全世界，只允許「條件裡那一台 CloudFront」讀物件。

**驗收：** bucket 放測試 `index.html` 後，用 `xxxx.cloudfront.net` 能開；直接開 S3 物件 URL 應被拒。

### 3.2 Distribution 重點設定（速查）

欄位細節見 §3.1 B；此表為對齊用速查：


| 項目                   | 建議值                                                         |
| -------------------- | ----------------------------------------------------------- |
| Origin               | S3 bucket REST API + OAC（非 website endpoint、非 legacy OAI）   |
| Viewer protocol      | Redirect HTTP → HTTPS                                       |
| Default root object  | `index.html`                                                |
| Alternate domain（可選） | `www.example.com` + ACM 憑證（須在 **us-east-1** 申請給 CloudFront） |
| Price class          | 視預算（例：PriceClass_200）                                       |


### 3.3 SPA：403／404 → `/index.html`（必做）

Vite + React Router 深層路徑（如 `/levels/1`）直接重整時，S3 沒有該 key 會 403／404。

控制台：CloudFront → 你的 Distribution → **Error pages** → **Create custom error response**（做兩筆）：


| HTTP error code | Customize error response | Response page path | HTTP response code |
| --------------- | ------------------------ | ------------------ | ------------------ |
| 403             | Yes                      | `/index.html`      | 200                |
| 404             | Yes                      | `/index.html`      | 200                |


→ 各按 **Create custom error response**。等 Distribution 再 Deploy 完後生效。

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


| Type       | Port | Source      | 說明                     |
| ---------- | ---- | ----------- | ---------------------- |
| SSH        | 22   | 僅你的 IP／VPN  | 或改用 SSM、關閉 22          |
| HTTP       | 80   | `0.0.0.0/0` | Let's Encrypt／導向 HTTPS |
| HTTPS      | 443  | `0.0.0.0/0` | nginx TLS              |
| Custom TCP | 3002 | **不要**對公網開  | 只給本機 nginx 反代（goose） |


出站：預設允許（需連 Atlas、Resend、Oculus GraphQL）。

### 4.2 啟動實例


| 項目            | 建議                                   |
| ------------- | ------------------------------------ |
| AMI           | Amazon Linux 2023 或 Ubuntu 22.04 LTS |
| Instance type | `t3.micro`／`t4g.micro`（免費層／省錢）       |
| Key pair      | 本機持有的 `.pem`                         |
| Storage       | 8–20 GB gp3                          |
| Elastic IP    | **建議綁定**，方便 Atlas allowlist 與 DNS    |


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

`goose-web.conf` 在本機 repo，**不在** EC2 上。先從本機傳到 EC2，再安裝。

**本機**（專案根目錄，PowerShell 或 bash）：

```powershell
# 換成實際 .pem 路徑與 Elastic IP
scp -i /path/to/goose-web.pem ops/nginx/goose-web.conf ec2-user@EC2_ELASTIC_IP:~/
```

**EC2 上**（路徑依 distro 調整）：

```bash
sudo cp ~/goose-web.conf /etc/nginx/conf.d/goose-web.conf
# 或 sites-available + sites-enabled（Ubuntu）

# 可選：把 server_name 從 api.example.com 改成實際 API 網域或暫時用 _
# sudo nano /etc/nginx/conf.d/goose-web.conf

sudo nginx -t && sudo systemctl enable --now nginx
sudo systemctl reload nginx
```

HTTPS：用 **Certbot**（Let's Encrypt）或把憑證放到 nginx。第一階段可先 HTTP 驗 `/health`，再補 TLS。

### 4.7 pm2（先部署後端 → `npm ci` → 再 start）

**現在 `/opt/goose-web/backend` 還是空的**，沒有 `ecosystem.config.cjs`／`dist/`／`node_modules`。  
請先完成 `[aws-manual-deploy.md](aws-manual-deploy.md)` §2（本機 build → 上傳），再在 EC2 依下列順序操作。

部署後目錄應長這樣：

```text
/opt/goose-web/backend/
  dist/
  package.json
  package-lock.json
  ecosystem.config.cjs    ← 從本機 ops/pm2/ 上傳（不是 ops/pm2/... 路徑）
  node_modules/           ← 必須在 EC2 用 npm ci 產生，不要從本機 scp
```

**EC2 首次啟動（順序很重要）：**

```bash
cd /opt/goose-web/backend

# 必做：在機上裝正式依賴。略過會出現
# Cannot find package 'cookie-parser'（或其他 dependencies）
npm ci --omit=dev

pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
# 把 pm2 印出的那行 sudo 指令貼上執行，例如：
# sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ec2-user --hp /home/ec2-user
pm2 save

# 若出現 In-memory PM2 is out-of-date：
pm2 update
pm2 restart goose-web --update-env
```

確認環境變數來自 `/etc/goose-web.env`（ecosystem 會讀此檔）。

驗收：

```bash
pm2 logs goose-web --lines 30
curl -fsS http://127.0.0.1:3002/health
curl -fsS http://127.0.0.1/health
```

---

## 5. MongoDB Atlas

1. **Network Access**：加入 EC2 **Elastic IP**（`/32`）。開發機 IP 可另加。
2. **Database User**：強密碼；連線字串寫入 `/etc/goose-web.env` 的 `MONGO_URI`。
3. 避免長期 `0.0.0.0/0`（若暫時開放，務必 TLS + 強密碼，並盡快改回 IP allowlist）。

---

## 6. DNS（可選）


| 紀錄                 | 指向                               |
| ------------------ | -------------------------------- |
| `www`／apex         | CloudFront distribution（Alias／A） |
| `api`（若 API 獨立子網域） | EC2 Elastic IP 或 Load Balancer   |


前端 `VITE_API_BASE_URL` 建置時寫死為 API 公開根（例：`https://api.example.com`），須與 nginx／CORS 一致。

若前後端同網域（CloudFront 行為分流 `/api/*` → EC2）屬進階設定；第一階段可用 **不同網域／子網域** 較單純。

---

## 7. 設定完成檢查清單

- [x] S3 bucket 建立；公開存取封鎖；CloudFront OAC + bucket policy
- [x] CloudFront 403／404 → `/index.html`（SPA）
- [x] EC2 + Elastic IP + 安全組（22 限縮、3002 不對公網）
- [x] Node 20、nginx、pm2 已安裝
- [ ] `/etc/goose-web.env` 權限 600／640，含 `NODE_ENV=production`
- [x] Atlas allowlist 含 EC2 IP
- [ ] 本機 AWS CLI 可對目標 bucket 做 `s3 sync`（權限足夠）

完成後 → `[aws-manual-deploy.md](aws-manual-deploy.md)` 執行首次上架與驗收。