# ops — 手動部署腳本與範例設定（T15）

| 路徑 | 說明 |
|------|------|
| [`deploy-frontend.sh`](deploy-frontend.sh) | 前端 build → S3 sync → CloudFront invalidate |
| [`deploy-backend.sh`](deploy-backend.sh) | 後端 build → rsync EC2 → npm ci → pm2 |
| [`env/goose-web.env.example`](env/goose-web.env.example) | 複製到 EC2 `/etc/goose-web.env` |
| [`nginx/goose-web.conf`](nginx/goose-web.conf) | nginx 反代 Node `:3002` |
| [`pm2/ecosystem.config.cjs`](pm2/ecosystem.config.cjs) | pm2 行程定義 |

完整步驟：[`doc/aws-setup-guide.md`](../doc/aws-setup-guide.md)、[`doc/aws-manual-deploy.md`](../doc/aws-manual-deploy.md)。

**不要**把真實 `/etc/goose-web.env` 或 `.pem` 提交進 git。
