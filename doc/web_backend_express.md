# 🪿 官方網站 — Express + TypeScript 後端規格

> **對應文件：** [`web_plan.md`](web_plan.md)（總計畫）、[`web_frontend_react.md`](web_frontend_react.md)（前端）  
> **對齊 Cursor rule：** `nodebestpractices.mdc`（Yoni Goldberg）+ 專案 Service config 注入規範  
> **文件版本：** v1.4　**最後更新：** 2026-07-18

---

## 1. 技術棧

| 項目 | 選型 | 備註 |
|------|------|------|
| Runtime | Node.js 20 LTS + TypeScript（strict） | 正式 `NODE_ENV=production` |
| 框架 | Express 4 | |
| DB | MongoDB Atlas（M0）+ mongoose | |
| 驗證 | zod（請求 **與** AppConfig） | Fail-fast |
| Email | SendGrid 免費額度 | |
| 商店評分 | 非官方 `graph.oculus.com/graphql` | 後端＋快取 |
| Rate limit | express-rate-limit | |
| 安全 | helmet、cors、eslint-plugin-security（建議） | |
| Log | pino → **stdout** | |
| 測試 | vitest + supertest；開發用 Atlas + Compass | memory-server 可選 |
| 部署 | EC2 + nginx + pm2；Actions **可延後 M6** | |

```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "build": "tsc -p tsconfig.build.json",
    "start": "node dist/index.js"
  }
}
```

---

## 2. 設定注入與 Fail-fast（硬性）

Service **不得**在 constructor／方法內讀 `process.env`。唯一允許處：`appConfig.ts`。  
Constructor 參數 **camelCase**；不可變模組常數才用 `SCREAMING_SNAKE_CASE`。

### 2.1 用 zod 解析設定（對齊 nodebestpractices 1.4）

缺必填或格式錯 → **啟動失敗 exit(1)**，不帶著髒狀態接請求。

```ts
// src/config/appConfig.ts
import { z } from 'zod';

const sendgridSchema = z.object({
  apiKey: z.string().min(1),
  fromEmail: z.string().email(),
  notifyEmail: z.string().email(),
});

const voteSchema = z.object({
  ipHashSecret: z.string().min(16),
  windowMs: z.number().int().positive(),
  maxVotesPerWindow: z.number().int().positive(),
});

const storeRatingSchema = z.object({
  appId: z.string().min(1),
  accessToken: z.string().min(1),
  docId: z.string().min(1),
  cacheTtlMs: z.number().int().positive(),
  endpoint: z.string().url(),
});

const appConfigSchema = z.object({
  nodeEnv: z.enum(['development', 'test', 'production']),
  port: z.number().int().positive(),
  corsOrigin: z.string().min(1),
  mongoUri: z.string().min(1),
  publicAssetBaseUrl: z.string().url(),
  sendgrid: sendgridSchema,
  vote: voteSchema,
  storeRating: storeRatingSchema,
});

export type AppConfig = z.infer<typeof appConfigSchema>;

function readRawConfig() {
  return {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: Number(process.env.PORT ?? 3001),
    corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    mongoUri: process.env.MONGO_URI ?? '',
    publicAssetBaseUrl: process.env.PUBLIC_ASSET_BASE_URL ?? 'http://localhost:5173',
    sendgrid: {
      apiKey: process.env.SENDGRID_API_KEY ?? '',
      fromEmail: process.env.SENDGRID_FROM_EMAIL ?? '',
      notifyEmail: process.env.FEEDBACK_NOTIFY_EMAIL ?? '',
    },
    vote: {
      ipHashSecret: process.env.VOTE_IP_HASH_SECRET ?? '',
      windowMs: 60_000,
      maxVotesPerWindow: 5,
    },
    storeRating: {
      appId: process.env.META_APP_ID ?? '',
      accessToken: process.env.OCULUS_GRAPH_ACCESS_TOKEN ?? '',
      docId: process.env.OCULUS_GRAPH_DOC_ID ?? '',
      cacheTtlMs: Number(process.env.STORE_RATING_CACHE_TTL_MS ?? 21_600_000),
      endpoint: process.env.OCULUS_GRAPH_ENDPOINT ?? 'https://graph.oculus.com/graphql',
    },
  };
}

export function loadConfig(): AppConfig {
  const parsed = appConfigSchema.safeParse(readRawConfig());
  if (!parsed.success) {
    console.error('Invalid config', parsed.error.flatten());
    process.exit(1);
  }
  return parsed.data;
}

// 測試：略過 loadConfig，直接 new Service(fakeConfig)
// development：可用較寬鬆 schema 或 .env.example 填齊假值以便本機啟動
```

正式環境必須有完整 SendGrid／Oculus／Mongo 等；`test` 環境測試可注入假 `AppConfig` 物件而不呼叫 `loadConfig()`。

---

## 3. 專案結構（業務模組 + 分層）

對齊 nodebestpractices **1.1 依業務切分**、**1.2 分層**（entry／domain／data）。

```
web/backend/
├─ src/
│  ├─ index.ts                 # loadConfig、連 DB、listen、優雅關閉
│  ├─ app.ts                   # createApp(deps) — 供 supertest，不 listen
│  ├─ config/appConfig.ts
│  ├─ errors/
│  │  ├─ app-error.ts          # ★ extends Error
│  │  └─ error-handler.ts      # ★ 中央處理（log／是否崩潰），middleware 只轉呼叫
│  ├─ db/
│  │  ├─ mongoose.ts
│  │  └─ models/
│  ├─ modules/
│  │  ├─ levels/
│  │  │  ├─ levels-router.ts       # entry（HTTP）
│  │  │  ├─ levels-service.ts      # domain
│  │  │  ├─ levels-repository.ts   # data-access（讀 md／快取）
│  │  │  └─ content/
│  │  ├─ feedback/
│  │  │  ├─ feedback-router.ts
│  │  │  ├─ feedback-service.ts
│  │  │  ├─ feedback-repository.ts
│  │  │  ├─ feedback-mail-service.ts
│  │  │  └─ feedback-schema.ts
│  │  ├─ polls/
│  │  │  ├─ polls-router.ts
│  │  │  ├─ polls-service.ts
│  │  │  ├─ polls-repository.ts
│  │  │  └─ vote-guard.ts
│  │  ├─ press/
│  │  ├─ site-meta/
│  │  │  ├─ site-meta-router.ts
│  │  │  └─ store-rating-service.ts
│  │  ├─ health/
│  │  │  └─ health-router.ts   # ★ GET /health
│  │  └─ scores/               # Phase 2
│  └─ middleware/
│     ├─ express-error-middleware.ts  # 呼叫 error-handler
│     └─ rate-limiters.ts
├─ .env.example
├─ vitest.config.ts
├─ ecosystem.config.cjs
└─ package.json
```

規則：

- **Router** 只做 parse／呼叫 service／對應 HTTP 狀態；不傳 `req`/`res` 進 service
- **Service** 純邏輯；丟 `AppError`
- **Repository** 碰 mongoose／檔案系統

上線前再加：`.github/workflows/ci.yml`、`deploy-backend.yml`。

---

## 4. 錯誤模型與中央處理

### 4.1 `AppError`（對齊 2.2、2.3）

```ts
export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly httpStatus: number,
    public readonly isOperational = true,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}
```

- Operational（驗證失敗、409、429）→ 回對應 HTTP，**不**退出 process  
- Programmer／未知 → log + 500；正式環境可依嚴重程度決定是否 graceful exit（見 §9）

### 4.2 中央 `errorHandler`（對齊 2.4）

- 統一 log（pino）、決定回應 body、是否標記崩潰  
- Express middleware **只** `next(err)` → 轉呼叫此物件，不把業務判斷散在各 route

### 4.3 API 錯誤格式

```json
{ "error": { "code": "RATE_LIMITED", "message": "Too many requests" } }
```

| HTTP | code |
|------|------|
| 400 | `VALIDATION_ERROR` |
| 404 | `NOT_FOUND` |
| 409 | `ALREADY_VOTED` |
| 429 | `RATE_LIMITED` |
| 500 | `INTERNAL` |

可選（M6）：OpenAPI／Swagger 描述錯誤碼（對齊 2.5）。

---

## 5. MongoDB Collections

（同前：`feedbacks`、`polls`、`votes` unique `(pollId, voterToken)`、`asset_downloads`、`store_rating_cache`、`scores` Phase 2）

開發庫名建議 `goose_web_dev`；正式 `goose_web`。Compass 連同一 URI 驗資料。

---

## 6. API（`/api/v1`）

### 6.0 Health（對齊 5.7）

| Method | Path | 說明 |
|--------|------|------|
| GET | `/health` | `{ status: 'ok', mongo: 'up'\|'down' }`；mongo 掛則 503 |

（可掛在 `/api/v1/health` 或根路徑 `/health`，與 nginx 探活一致即可。）

### 6.1–6.5 業務 API

| Method | Path | 說明 |
|--------|------|------|
| GET | `/levels` | 列表 |
| GET | `/levels/:levelId` | `LevelDoc` |
| POST | `/feedback` | rate limit → honeypot → zod → Mongo → SendGrid（失敗不擋 201） |
| GET | `/polls` | 議題＋票數＋`myVote` |
| POST | `/polls/:pollId/vote` | 防刷 cookie + unique + IP limit |
| GET | `/press/assets` | 清單 |
| GET | `/press/assets/:assetId/download` | count+1 → 302 S3 |
| GET | `/site-meta` | 商店評分快取（非官方 GraphQL） |

投票 Cookie：跨網域 `SameSite=None; Secure`。  
StoreRating：僅後端呼叫；失敗回退快取；禁止洩漏 token。

### 6.6 Phase 2

`POST /scores`、`GET /leaderboard/:levelId` — 本階段不掛載。

---

## 7. 安全與中介層（對齊 §6）

- `helmet()`（安全 HTTP headers）
- `cors({ origin: config.corsOrigin, credentials: true })`
- Rate limit：feedback／vote
- zod 驗證 JSON body（6.10）
- mongoose 防注入（6.4）
- 秘密不進 git；EC2 EnvironmentFile
- Log 不記 raw IP／email／token
- ESLint + 建議 `eslint-plugin-security`（6.1）
- CI 可加 `npm audit --audit-level=high`（6.7，M6）

---

## 8. 測試

### 8.1 開發期：Atlas + Compass

手動打 API → Compass 看 collection／index。Compass ≠ 自動化測試。

### 8.2 自動化

- 單元：vote-guard、services、store-rating（GraphQL fixture）、**AppError／config parse**
- 整合：supertest 打 `createApp`；假 config；每測自備資料（對齊 4.5）
- 錯誤流：400／409／429／500 皆測（對齊 2.8、4.13）
- 測試 listen **隨機 port** 或不 listen（對齊 4.12）

---

## 9. 程序生命週期（對齊 2.6、2.10、5.15、5.18）

`index.ts`：

1. `loadConfig()`（失敗 exit 1）
2. `connectMongo`
3. `const server = app.listen(config.port)`
4. 註冊：

```ts
process.on('unhandledRejection', (reason) => {
  logger.error({ reason }, 'unhandledRejection');
  // 依嚴重程度：operational 則繼續；否則觸發 shutdown
});

process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'uncaughtException');
  void shutdown(1);
});

async function shutdown(code = 0) {
  server.close();
  await mongoose.disconnect();
  process.exit(code);
}

process.on('SIGTERM', () => void shutdown(0));
process.on('SIGINT', () => void shutdown(0));
```

- Log 只寫 **stdout**，由 EC2／journald 收集  
- pm2／systemd 設 `NODE_ENV=production`  
- 靜態資產不經 Node（對齊 5.11）

---

## 10. 部署（Actions 可延後）

### 10.1 架構

```
開發：本機 Express ↔ Atlas（Compass）
上線：CloudFront/S3（前端）→ EC2 nginx → Node:3001 ↔ Atlas
```

### 10.2 手動上線後再自動化

本機 build → 上傳 EC2 → `npm ci --omit=dev` → `pm2 reload`。  
M6 workflow：lint／typecheck／test／build／`npm audit` → scp／ssh 或 SSM。

### 10.3 EC2／nginx

- t3.micro／t4g.micro；HTTPS；反向代理 gzip／TLS（對齊 5.3）
- `/etc/goose-web.env`：`MONGO_URI`、SendGrid、Oculus…  
- Atlas allowlist：開發 IP + EC2 Elastic IP

### 10.4 環境變數範例

```
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://www.example.com
MONGO_URI=mongodb+srv://.../goose_web
PUBLIC_ASSET_BASE_URL=https://www.example.com
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=noreply@example.com
FEEDBACK_NOTIFY_EMAIL=dev@example.com
VOTE_IP_HASH_SECRET=
META_APP_ID=
OCULUS_GRAPH_ACCESS_TOKEN=
OCULUS_GRAPH_DOC_ID=
STORE_RATING_CACHE_TTL_MS=21600000
OCULUS_GRAPH_ENDPOINT=https://graph.oculus.com/graphql
```

---

## 11. 與 `nodebestpractices.mdc` 對齊摘要

| 實踐 | 本規格 |
|------|--------|
| 1.1 業務元件 | `modules/*` |
| 1.2 三層 | router／service／repository |
| 1.4 Config | zod fail-fast + 注入 |
| 2.2／2.3 AppError | §4 |
| 2.4 中央錯誤處理 | `errors/error-handler.ts` |
| 2.6／2.10 關閉與 rejection | §9 |
| 2.7／5.18 Logger | pino → stdout |
| 2.11／6.10 驗證 | zod |
| 5.3／5.11 反代＋靜態外置 | nginx + S3 |
| 5.5／5.17 pm2 + LTS | ✓ |
| 5.7 Health | §6.0 |
| 5.15 NODE_ENV | ✓ |
| 6.x helmet／rate limit／ODM／secrets | §7 |
| 6.7 audit | CI M6 可選 |

刻意延後：完整 OpenAPI、APM、多核 cluster（小流量單進程 pm2 即可）。

---

## 12. 驗收清單（Phase 1）

- [ ] `loadConfig()` 缺必填會拒絕啟動
- [ ] Service 皆 config 注入；`process.env` 僅在 appConfig
- [ ] AppError + 中央 error handler；錯誤碼表正確
- [ ] `GET /health` 可探活
- [ ] SIGTERM／unhandledRejection 有處理
- [ ] 關卡／回饋／投票／Press／site-meta 行為正確
- [ ] Compass 可見寫入；敏感欄位不進 log／前端
- [ ] StoreRating 快取與回退
- [ ] lint／test／build；Actions／audit 可延後
- [ ] EC2 上 `NODE_ENV=production`、log 走 stdout
