# 🪿 官方網站 — AI 開發任務清單（分 Task ／分 Commit）

> **給 AI 的指示文件。** 每次只執行 **一個** Task，完成驗收後 **單獨 commit**，再停下等下一個指示（或明確說「繼續 Task N」）。  
> **規格來源（必讀對應章節）：**
> - [`web_plan.md`](web_plan.md)
> - [`web_backend_express.md`](web_backend_express.md) v1.5+
> - [`web_frontend_react.md`](web_frontend_react.md) v1.5+
> - **視覺設計：** [`Nintendodesign.md`](Nintendodesign.md)（前端 UI／Landing 必讀）
> - 遊戲內容：[`vr_goose_game_design.md`](vr_goose_game_design.md)（關卡 0–3）
>
> **文件版本：** v1.2　**最後更新：** 2026-07-18

---

## 0. AI 執行規則（每次 Task 都遵守）

1. **一次只做一個 Task**（本檔 `Txx`）。不要一次做完整份清單。
2. 實作前讀該 Task 的「讀取規格」與「範圍／不要做」。
3. 遵守專案規範：
   - 後端：`process.env` 只在 `appConfig.ts`；Service constructor 注入 config（camelCase）。
   - 後端架構：`index.ts` 為 composition root（手動組裝 DB／Cache／Service → Controller）；`app.ts` 用 `app.get`／`post`／… 註冊中央路由表；**無**獨立 Router 檔；Controller 只處理 HTTP，業務在 Service。
   - 前端：kebab-case 檔名、shadcn、TanStack Query、Zustand（僅 client UI）。
   - 前端視覺：對齊 [`Nintendodesign.md`](Nintendodesign.md)（bevel chrome、暖色僅訊號）；細節見 `web_frontend_react.md` §2.3。
4. 完成後跑該 Task 的「驗收」；通過才 commit。
5. **Commit**：僅在使用者要求、或本 Task 驗收通過且使用者／流程允許時。訊息用下方「建議 commit message」，聚焦 why。不要把無關檔案塞進同一個 commit。
6. **不要**提早做 M6（GitHub Actions／正式 AWS）除非目前 Task 就是那一項。
7. 素材缺失（截圖、glb）時：用 placeholder，並在 PR／commit body 註明；不要卡住整個 Task。
8. 隱私：第一階段遊戲不上傳資料；排行榜用假資料並標 Demo。

### 建議對 AI 的開場白（複製即用）

```
請依 Doc/web_dev_tasks.md 執行 Task T01。
只做該 Task 範圍，驗收通過後用文件內的建議 message 幫我 commit。
完成後停下，等我指定下一個 Task。
```

之後：`請執行 Task T02` …

### 開發順序原則（為何這樣拆）

```
後端開路（薄 API）→ 前端接上畫面 → 互動成對完成 → 純前端（3D／Press）→ 評分 → 部署
```

不要等後端全部做完才開前端；也不要前端先做完再硬接 API。

---

## 進度總表

| ID | Task | 端 | 狀態 |
|----|------|----|------|
| T01 | Monorepo／後端專案骨架 + config fail-fast | BE | ✅ |
| T02 | Mongo 連線 + Health + AppError 中樞 | BE | ✅ |
| T03 | 關卡 API（0–3 Markdown） | BE | ✅ |
| T04 | 前端專案骨架 + shadcn + 路由 lazy | FE | ✅ |
| T05 | Layout + Landing（假排行榜）接 levels | FE | ✅ |
| T06 | 關卡列表／詳情頁 | FE | ✅ |
| T07 | 回饋 API + Resend | BE | ✅ |
| T08 | 回饋表單頁 | FE | ✅ |
| T09 | 投票 API + 防刷 | BE | ✅ |
| T10 | 投票頁 | FE | ✅ |
| T11 | Press Kit API 計數 + 靜態檔 | BE+FE | ✅ |
| T12 | 3D Viewer（純前端） | FE | ✅ |
| T13 | StoreRating GraphQL 快取 | BE | ⬜ |
| T14 | 首頁評分 + RWD／SEO 打磨 | FE | ⬜ |
| T15 | 手動部署說明／腳本（S3+EC2） | Ops | ✅ |
| T16 | GitHub Actions CI + 自動部署（可最後） | Ops | ✅ |

狀態：⬜ 未做　🔄 進行中　✅ 完成

---

## Phase A — 後端開路

### T01 — 後端專案骨架 + Config

- **讀取規格：** `web_backend_express.md` §1–3（架構約定）
- **做：**
  - 建立 `web/backend`（Express + TS + eslint + vitest scripts）
  - `appConfig.ts`：zod `loadConfig()`，失敗 `exit(1)`
  - `createApp(deps)` 可匯出（middleware + 中央路由表骨架）；`index.ts` 為 composition root（先可不連 DB，可先空 controllers）
  - `.env.example`
- **不要做：** Mongo、業務 Controller、前端；**不要**建立獨立 `*-router.ts`
- **驗收：** `npm run typecheck`／`lint` 通過；缺 `MONGO_URI` 等必填時啟動失敗（依 schema）
- **建議 commit message：**

```
chore(backend): scaffold express typescript with validated config
```

---

### T02 — Mongo + Health + 錯誤處理 + 優雅關閉

- **讀取規格：** `web_backend_express.md` §3–4、§6.0、§9
- **做：**
  - mongoose 連線（注入 `mongoUri`）；於 `index.ts` composition root 組裝
  - `AppError` + 中央 error handler + express error middleware
  - `HealthController` + 在 `app.ts` 用 `app.get('/health', …)` 註冊
  - SIGTERM／SIGINT／unhandledRejection 處理骨架
  - pino → stdout
- **不要做：** levels／feedback 業務；**不要**獨立 Router 檔
- **驗收：** 連上 Atlas（或本機）後 `/health` 回 ok；Compass 可連同一 DB；supertest 測 health 可選
- **建議 commit message：**

```
feat(backend): add mongo connection, health check, and central errors
```

---

### T03 — 關卡百科 API（0–3）

- **讀取規格：** `web_backend_express.md` §3、§6.1；`web_frontend_react.md` LevelDoc；`vr_goose_game_design.md` 第 0–3 關
- **做：**
  - `modules/levels`：types／controller／service／repository（無 router 檔）
  - `index.ts` 組裝 Repository → Service → Controller；`app.ts` 用 `app.get` 註冊 `/api/v1/levels`、`/api/v1/levels/:levelId`
  - `content/level-0.md` … `level-3.md`（front-matter：title、promptEn、trainingFocus、pitfalls、screenshots）
  - 截圖可先 placeholder 路徑
- **不要做：** 留言、前端頁
- **驗收：** 四關皆可取回完整 `LevelDoc`；404 正確
- **建議 commit message：**

```
feat(backend): add levels 0-3 encyclopedia API from markdown
```

---

## Phase B — 前端接上

### T04 — 前端骨架 + shadcn + 路由

- **讀取規格：** `web_frontend_react.md` §1–3.0、§2.3；[`Nintendodesign.md`](Nintendodesign.md) Colors／Shapes（定 token 用）
- **做：**
  - `web/frontend` Vite React TS Tailwind
  - 初始化 shadcn；`components/ui` 基礎 Button／Skeleton
  - Tailwind／CSS 變數先對齊 `Nintendodesign.md` 色票與圓角原則（可之後再細調 bevel）
  - `app.tsx`：ErrorBoundary、Suspense、lazy routes（可先空頁）
  - `api/client.ts` + TanStack Query provider
  - kebab-case 檔名；`.env.example`（`VITE_API_BASE_URL`）
- **不要做：** 完整 Landing 文案、3D
- **驗收：** `npm run dev` 可開；懶載入路由不白屏；lint／typecheck 過
- **建議 commit message：**

```
chore(frontend): scaffold vite react with shadcn and lazy routes
```

---

### T05 — Layout + Landing + Demo 排行 + 接 levels 摘要

- **讀取規格：** `web_frontend_react.md` §2.3、§3.1；`web_plan.md` Landing；[`Nintendodesign.md`](Nintendodesign.md)
- **做：**
  - Navbar／Footer（carbon 指揮層語彙）
  - Home：Hero、特色、Demo 排行榜（假資料 + Demo data 徽章；Clear time／Fewest drops 為**整局總數**，無 Level 欄）；視覺對齊 Nintendo chrome（bevel 面板、暖色 CTA）
  - 可選：首頁顯示關卡摘要（打 `GET /levels`）
  - 商店 CTA 外連（URL 可先 placeholder）
- **不要做：** 真實評分、回饋表單；不要照抄 Nintendo／Mario 商標素材
- **驗收：** 本機串後端可看到關卡摘要或至少 Demo 排行正確；首屏可辨識為 console-chrome 而非預設 shadcn 風格
- **建議 commit message：**

```
feat(frontend): add landing page with demo leaderboard
```

---

### T06 — 關卡列表與詳情

- **讀取規格：** `web_frontend_react.md` §3.2、`lib/markdown.ts`
- **做：**
  - `/levels`、`/levels/:levelId`
  - 訓練重點、英文提示詞、常見翻車、截圖 lightbox
  - Markdown 白名單消毒渲染
- **不要做：** 留言
- **驗收：** 0–3 關內容正確；危險 HTML 不會執行
- **建議 commit message：**

```
feat(frontend): add level encyclopedia pages with safe markdown
```

---

## Phase C — 互動成對

### T07 — 回饋 API + Resend

- **讀取規格：** `web_backend_express.md` feedback 流程、§3
- **做：**
  - `FeedbackController` + service／repository／mail service（config 注入）
  - `index.ts` 組裝；`app.ts` 用 `app.post('/api/v1/feedback', …)` 註冊
  - rate limit、honeypot、zod、Mongo、寄信（開發者通知；有 email 時感謝信；失敗不擋 201）
- **不要做：** 前端表單；**不要**獨立 Router 檔
- **驗收：** Compass 見文件；開發者收到通知；有填 email 時對方收到感謝信（或 mock 測）；honeypot／429 行為正確
- **建議 commit message：**

```
feat(backend): add feedback API with resend notify and thank-you
```

---

### T08 — 回饋表單頁

- **讀取規格：** `web_frontend_react.md` §3.3
- **做：**
  - `/feedback`：RHF + zod + shadcn Form
  - 成功／錯誤／429 UI
- **不要做：** 投票
- **驗收：** 送出後後端有資料；驗證錯誤顯示在欄位
- **建議 commit message：**

```
feat(frontend): add feedback form page
```

---

### T09 — 投票 API + 防刷

- **讀取規格：** `web_backend_express.md` polls／voteGuard、§3
- **做：**
  - `PollsController` + service／repository／vote-guard
  - polls／votes schema、seed 至少 1 個議題（script 或 migration）
  - `index.ts` 組裝；`app.ts` 用 `app.get`／`app.post` 註冊 `/api/v1/polls`、`/api/v1/polls/:pollId/vote`
  - voter_token cookie、unique、rate limit
- **不要做：** 前端 UI；**不要**獨立 Router 檔
- **驗收：** 同 cookie 不能投第二次（409）；Compass 見 votes
- **建議 commit message：**

```
feat(backend): add polls API with anti-spam vote guard
```

---

### T10 — 投票頁

- **讀取規格：** `web_frontend_react.md` §3.4
- **做：**
  - `/polls`：Query + mutation + invalidate
  - `credentials: 'include'`
- **不要做：** 帳號系統
- **驗收：** 投票後結果更新；重整仍顯示已投
- **建議 commit message：**

```
feat(frontend): add polls page with live results
```

---

## Phase D — Press／3D／評分

### T11 — Press Kit（計數 API + 靜態檔 + 頁面）

- **讀取規格：** plan Press；前後端 press 章節；`web_backend_express.md` §3
- **做：**
  - 後端：`PressController` + service；`index.ts` 組裝；`app.ts` 中央路由註冊 assets 清單／download count／302 到 `publicAssetBaseUrl`
  - 前端：`public/press-kit/` placeholder zip、`/press` 頁、QR
- **不要做：** 真實大量媒體（可用小檔代替）；後端**不要**獨立 Router 檔
- **驗收：** 下載後 count +1；檔案可下載
- **建議 commit message：**

```
feat: add press kit downloads with server-side counter
```

---

### T12 — 3D Viewer（純前端）

- **讀取規格：** `web_frontend_react.md` §3.6
- **做：**
  - `/viewer`：r3f + OrbitControls
  - `public/models/` placeholder glb（或簡單幾何暫代，註明待換）
  - Zustand 存選中模型
- **不要做：** 後端 API
- **驗收：** 可旋轉縮放切換；Network 無打 API（除靜態檔）
- **建議 commit message：**

```
feat(frontend): add interactive 3d model viewer
```

---

### T13 — StoreRating（非官方 GraphQL + 快取）

- **讀取規格：** `web_backend_express.md` site-meta／StoreRatingService、§3
- **做：**
  - Cache（collection／TTL）於 `index.ts` 組裝後注入 `StoreRatingService` → `SiteMetaController`
  - `app.ts` 用 `app.get('/api/v1/site-meta', …)` 註冊；失敗回退
  - 風險：僅後端呼叫；不回傳 token
- **不要做：** 前端改版以外的事；**不要**獨立 Router 檔
- **驗收：** 成功寫入快取；拔網線／錯 token 時仍可回 stale；Compass 可見 cache
- **建議 commit message：**

```
feat(backend): cache meta store rating via unofficial graphql
```

---

### T14 — 首頁評分 + 打磨

- **讀取規格：** `web_frontend_react.md` §6
- **做：**
  - Home `StoreRating` 接 site-meta
  - RWD、基本 SEO／OG、loading skeleton 補齊
- **不要做：** CI／AWS
- **驗收：** 有評分顯示；stale 有提示；主要頁面手機可用
- **建議 commit message：**

```
feat(frontend): show store rating and polish responsive seo
```

---

## Phase E — 上線（可最後）

### T15 — 手動部署到 AWS

- **讀取規格：** plan／前後端部署章節
- **做：**
  - 文件化或腳本：前端 `build` → S3；後端 → EC2 pm2
  - EC2 `/etc/goose-web.env`、nginx、`NODE_ENV=production`
  - CloudFront SPA fallback（若有）
- **不要做：** GitHub Actions（留給 T16）
- **驗收：** 公網可開站、API health ok
- **建議 commit message：**

```
docs(ops): add manual s3 and ec2 deploy steps
```

（若含腳本：`chore(ops): add manual aws deploy scripts`）

---

### T16 — GitHub Actions CI／CD

- **讀取規格：** `web_plan.md` §4；前後端 Actions 示意
- **做：**
  - `ci.yml`：前後端 lint／typecheck／test／build
  - `deploy-*.yml`：main 部署 S3／EC2
  - 可選：`npm audit`、Request ID／body limit 等 M6 硬化（若尚未做可另開小 commit）
- **不要做：** 改業務功能（除非修 CI 必要）
- **驗收：** PR 跑 CI；main 可部署（或 dry-run 通過）
- **建議 commit message：**

```
ci: add github actions for test build and aws deploy
```

---

## Phase 2（本檔暫不拆細）

待隱私政策更新後另開任務檔，例如：

- 遊戲 `POST /scores`、leaderboard API
- 前端 Demo 排行換真資料

---

## 附錄：一次對話只做一 Task 的檢查清單

AI 回覆結束前應確認：

- [ ] 只動了該 Task 允許的路徑
- [ ] 驗收項已做或註明阻塞原因
- [ ] 已提出（或已執行）單一 commit，message 符合建議
- [ ] 未擅自開始下一個 Task
