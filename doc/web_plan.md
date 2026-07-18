# 🪿 VR 鵝頭偷麵包 — 官方網站計畫文件

> **對應文件：**
> - 遊戲設計：[`vr_goose_game_design.md`](vr_goose_game_design.md) v2.1
> - 前端規格：[`web_frontend_react.md`](web_frontend_react.md)
> - **視覺設計規範：** [`Nintendodesign.md`](Nintendodesign.md) ← 前端 UI／Landing 參考（Y2K console-chrome）
> - 後端規格：[`web_backend_express.md`](web_backend_express.md)
> - **AI 分 Task／分 Commit 清單：** [`web_dev_tasks.md`](web_dev_tasks.md) ← 給 Agent 逐項實作與 commit
>
> **文件版本：** v1.6　**最後更新：** 2026-07-18

---

## 1. 目標與定位

為 VR 遊戲「鵝頭偷麵包」建立官方網站，作為：

1. **行銷入口** — 介紹遊戲、導流到 Meta Store
2. **玩家社群** — 回饋、投票、關卡攻略
3. **第二階段預留** — 之後遊戲端開放「通關時間上傳 API」時，網站可無痛接上真實排行榜

### 隱私前提（重要約束）

目前遊戲隱私政策為「**不會傳送任何玩家資料出去**」，因此：

- ❌ 第一階段**不**從遊戲取得任何資料（無遊玩時數、無通關紀錄）
- ❌ 不使用 Meta 帳號登入、不抓個人 playtime（Meta 也沒有此 API）
- ✅ 網站上所有互動資料（回饋、投票）都是**使用者主動在網頁上提交**，與遊戲本體無關
- ✅ Landing page 的「通關時間、掉水次數」排行榜使用**假資料**，並標示 demo 字樣
- 🔜 第二階段開放遊戲上傳通關時間前，**必須先更新隱私政策**並取得玩家同意

### Meta 資料來源限制（調查結論）

| 想要的資料 | Meta 有無 API | 網站對策 |
|-----------|--------------|---------|
| 個人遊玩時數 | ❌ 無 | 不做；Phase 2 由遊戲自行上傳 |
| 下載／安裝數 | ❌ 無（僅 Dashboard + 手動 CSV） | 手動更新到網站設定 |
| 商店評分 | ❌ 無官方 API（Rate & Review API 尚未推出） | **採用非官方** `graph.oculus.com/graphql`，由後端定時抓取並快取到 MongoDB；失敗時回退上次快取 |

---

## 2. 功能範圍（第一階段）

### 2.1 Landing Page（首頁）

- 遊戲介紹：核心概念（手當鵝頭、偷麵包、抓小鵝回巢）、特色截圖／影片
- 下載連結：Meta Store 連結、QR Code
- **Demo 排行榜**：通關時間、掉水次數 — 全部假資料，UI 標示「Demo data」
  - 指標為**整局總數**（所有關卡加總），非單關；UI 不顯示 Level
  - 目的：先把排行榜 UI 做出來，Phase 2 直接換資料來源
- 商店評分顯示（後端非官方 GraphQL 抓取＋快取）

### 2.2 關卡百科（第 0 ～ 3 關）

內容直接改寫自 `vr_goose_game_design.md`，每關一頁：

| 欄位 | 來源 |
|------|------|
| 關卡截圖 | 美術／遊戲內截圖（需另外準備，見 §5 素材清單） |
| 訓練重點 | 設計文件「訓練重點」欄 |
| 英文提示詞 | 設計文件「關卡提示詞」欄（如 *Put 3 breads in the nest to pass the level.*） |
| 常見翻車 | 設計文件「失敗條件／⚠️ 待補強」改寫（麵包落水、移動平台時機、鉤子操作等） |

- 內容以 **Markdown 檔**存放於後端（無需完整 CMS），由 API 提供
- **可選**：每關留言區（第一版可先不做，schema 先預留）

收錄範圍：第零關（開局擺麵包）、第一關（鉤子）、第二關（移動平台＋雙鵝）、第三關（刷子推麵包）。第 4–7 關之後再補。

### 2.3 意見回饋板

- 表單欄位：類別（bug／建議／其他）、**第幾關（選填）**、內容、聯絡 Email（選填）
- 後端收到後：存入 MongoDB ＋ 透過 **SendGrid（免費額度）** 寄通知信給開發者
- 防濫用：rate limit（IP）、honeypot 欄位、內容長度限制

### 2.4 願望清單／投票

- 開發者建立議題（例：「下一個想要巡邏員玩法？」「想要更多麵包種類？」）
- 玩家對選項投票，即時顯示統計
- **防刷機制**（本專案後端重點練習項目）：
  - 每議題每客戶端一票：`voterToken`（首次投票發放的匿名 Cookie）＋ IP hash 雙重紀錄
  - IP rate limit：同 IP 短時間大量投票直接 429
  - 不做帳號系統（第一階段）

### 2.5 聯絡／Press Kit

- 媒體素材下載：logo、截圖包、宣傳圖（zip）— 靜態檔放在前端 `public/press-kit/`，隨 SPA 一同上到 S3
- 商店連結、QR Code、聯絡 Email
- 素材下載計數：前端先打後端 API 計數，再導向 S3 上的靜態檔 URL

### 2.6 關卡 3D 物件展示（純前端）

- 網頁內 3D 檢視器：**滑鼠拖曳旋轉／滾輪縮放**
- 展示物件：麵包（吐司、長棍…）、小鵝、鉤子、刷子、巢
- 技術：Unity 資產轉出 **glTF (.glb)** → 放在前端 `public/models/` → **react-three-fiber + drei OrbitControls** 載入
- **純前端**：不經後端 API；建置後與 SPA 一併部署到 S3

---

## 3. 技術架構總覽

```
┌──────────────────────────┐          ┌──────────────────────────────┐
│  React + TypeScript      │   HTTPS  │  Express + TypeScript        │
│  (Vite SPA)              │ ───────► │  REST API on AWS EC2         │
│  react-three-fiber       │          │  mongoose → MongoDB Atlas    │
│  public/models/*.glb     │          │  SendGrid / Oculus GraphQL   │
│  → AWS S3 (+ CloudFront) │          └──────────────────────────────┘
└──────────────────────────┘
Phase 2 (未來)：
Unity 遊戲 ──POST /api/v1/scores──►  同一個 Express（EC2）
```

| 層 | 選型 | 理由 |
|----|------|------|
| 前端 | Vite + React 18 + TS + **shadcn/ui** + TanStack Query + **Zustand** | 對齊 `react=best-practice.mdc` |
| 3D | react-three-fiber + drei | 模型放 `public/` |
| 後端 | Express + TS；**router／service／repository**；**AppError**；zod 驗證 config | 對齊 `nodebestpractices.mdc` |
| DB | MongoDB Atlas（M0）+ mongoose | Compass 開發驗資料 |
| Email | SendGrid 免費版 | 回饋通知 |
| 部署 | S3（＋CloudFront）／EC2；Actions **可延後 M6** | |

詳細規格見前端／後端兩份文件；CI/CD 見下方 §4（可整段延到上線前再實作）。

---

## 4. CI/CD：GitHub Actions → AWS（建議排在後半段）

### 4.0 要不要一開始就做？

**不必。** 個人／小專案很常見的順序是：

1. 本機把功能全部開發完（連本機或 Atlas Mongo，用 **Compass** 看資料）
2. 手動在 AWS 上架一次（S3＋EC2）確認能跑
3. 最後再加 GitHub Actions：每次 push 自動 lint／test／build，`main` 再自動部署

| 做法 | 優點 | 缺點 |
|------|------|------|
| **先開發、後 CI/CD**（推薦給本專案） | 少早期基礎設施摩擦，專心做頁面與 API | 上線前要一次補齊 workflow／Secrets |
| 一開始就做 CI/CD | 習慣早建立、少「最後才發現建不起來」 | M1 時間變長；還沒穩定的專案常被 pipeline 卡住 |

本文件 §4 其餘內容視為**上線前里程碑**規格，不是第一週必做。

### 4.1 觸發與流程

```
push / pull_request
        │
        ▼
┌───────────────────┐
│  ci (每個 package) │  lint → typecheck → test → build
│  frontend + backend│  任一失敗 → 不部署
└─────────┬─────────┘
          │ 僅 push 到 main（或 tags）且 ci 成功
          ▼
┌───────────────────┐     ┌───────────────────┐
│ deploy-frontend   │     │ deploy-backend    │
│ → S3 sync dist/   │     │ → SCP/SSH to EC2  │
│ → CloudFront      │     │ → npm ci + build  │
│   invalidate      │     │ → pm2 reload      │
└───────────────────┘     └───────────────────┘
```

| 事件 | 行為 |
|------|------|
| `pull_request` → `main` | 只跑 **CI**（lint / test / build），不部署 |
| `push` → `main` | CI 通過後 **自動部署** 前端（S3）＋後端（EC2） |
| 只改 `frontend/**` | 可只部署前端（path filter）；後端同理 |
| 只改 `Doc/**` 等無關路徑 | 可 skip（optional） |

### 4.2 建議 Repo 結構與 Workflow 檔

```
web/
├─ frontend/
├─ backend/
└─ .github/workflows/
   ├─ ci.yml                 # PR + push：lint / test / build
   ├─ deploy-frontend.yml    # main：S3 + CloudFront
   └─ deploy-backend.yml     # main：SSH → EC2
```

也可合成一個 `deploy.yml`，用 `needs: ci` 串起來。細節指令見前後端文件的「GitHub Actions」章節。

### 4.3 CI 檢查項目（前後端各自執行）

| 步驟 | 指令（示意） | 失敗則 |
|------|--------------|--------|
| Install | `npm ci` | 中止 |
| Lint | `npm run lint` | 中止、不部署 |
| Typecheck | `npm run typecheck`（`tsc --noEmit`） | 中止 |
| Test | `npm test`（vitest） | 中止 |
| Build | `npm run build` | 中止 |

前端 build 需注入 `VITE_API_BASE_URL`（GitHub Actions `env`／Secrets，建置時寫進 bundle）。

### 4.4 部署方式摘要

| 目標 | 方式 |
|------|------|
| 前端 → S3 | OIDC 或 IAM User：`aws s3 sync dist/ …`，再 `aws cloudfront create-invalidation` |
| 後端 → EC2 | SSH（deploy key）或 SSM：上傳 `dist/`／`package.json`，遠端 `npm ci --omit=dev` + `pm2 reload` |

**建議用 GitHub OIDC → IAM Role**，避免長期存放 `AWS_ACCESS_KEY_ID`（較安全）。EC2 部署仍需 `EC2_SSH_KEY` 或改用 **AWS SSM Session Manager**（免開 22 port）。

### 4.5 GitHub Secrets／Variables（清單）

| 名稱 | 用途 |
|------|------|
| `AWS_ROLE_ARN` 或 `AWS_ACCESS_KEY_ID` + `AWS_SECRET_ACCESS_KEY` | 前端 S3／CloudFront |
| `S3_BUCKET` / `CLOUDFRONT_DISTRIBUTION_ID` | 前端部署目標 |
| `VITE_API_BASE_URL` | 前端 build 時 API 根路徑 |
| `EC2_HOST` / `EC2_USER` / `EC2_SSH_KEY` | 後端 SSH 部署（若用 SSM 則改對應設定） |
| （EC2 機上）`MONGO_URI`、`SENDGRID_*`、`OCULUS_*` 等 | **放在 EC2 的 env 檔**，不要寫進前端 bundle；Actions 不必全部擁有 |

### 4.6 品質閘門規則

- `main` **禁止**直接 push 也行，但若允許：仍必須通過 Actions 才算正式環境更新
- PR 必須綠燈才能 merge（GitHub Branch protection：Require status checks）
- 部署 job 使用 `environment: production`，可加手動核准（optional）

---

## 5. 開發順序與里程碑

### 5.1 實作順序原則

```
後端開路（薄 API）→ 前端接上畫面 → 互動成對完成 → 純前端（3D／Press）→ 評分 → 部署
```

| 階段 | 內容 | 對應 Tasks |
|------|------|------------|
| A 後端開路 | 骨架、Mongo、health、關卡 API | T01–T03 |
| B 前端接上 | 骨架、Landing、關卡頁 | T04–T06 |
| C 互動成對 | 回饋 → 表單；投票 → 投票頁 | T07–T10 |
| D Press／3D／評分 | Press、3D viewer、StoreRating、打磨 | T11–T14 |
| E 上線 | 手動 AWS → 再 GitHub Actions | T15–T16 |

**細部步驟、驗收、建議 commit message、給 AI 的開場白：** 見 [`web_dev_tasks.md`](web_dev_tasks.md)。

### 5.2 里程碑（粗估）

| 里程碑 | 內容 | 預估 |
|--------|------|------|
| **M1 骨架** | T01–T05；本機前後端可跑；**先不做 Actions** | 3–4 天 |
| **M2 內容頁** | T06、T11 部分、Press／Landing 打磨 | 與下重疊約 1 週 |
| **M3 互動** | T07–T10 | 1 週 |
| **M4 3D** | T12 | 3–5 天 |
| **M5 評分＋打磨** | T13–T14 | 3–4 天 |
| **M6 上線** | T15–T16 | 2–4 天 |
| **(Phase 2)** | 通關時間 API、真排行榜、隱私政策 | 另計 |

---

## 6. 素材清單（需遊戲端／美術提供）

- [ ] 第 0–3 關遊戲內截圖，各關至少 2 張（1920×1080 以上）
- [ ] 遊戲 logo（透明背景 PNG + SVG）
- [ ] 宣傳主視覺 1 張（Landing hero 用）
- [ ] 3D 模型 glb → 放入 `frontend/public/models/`：麵包 ×2 種、小鵝、鉤子、刷子、巢（單檔建議 < 5 MB）
- [ ] Press Kit zip／logo → 放入 `frontend/public/press-kit/`
- [ ] 15–30 秒宣傳影片（可後補，先用截圖輪播）
- [ ] Meta Store 頁面連結與 **App ID**（上架後；GraphQL 抓評分需要）

---

## 7. Phase 2 預留設計

遊戲之後開放「完成時間」上傳時：

1. **隱私政策更新**：明列上傳項目（整局通關時間、整局掉水次數、匿名玩家識別），並在遊戲內取得同意（opt-in）
2. **API**（後端文件已預留 schema）：
   - `POST /api/v1/scores` — 遊戲上傳 `{ clearTimeMs, dropCount?, clientToken }`（整局總數，非單關）
   - `GET /api/v1/leaderboard` — 網站讀全遊戲排行（Clear time／Fewest drops）
3. **前端**：Landing 的 Demo 排行榜元件換資料來源即可（元件介面在前端文件已定義為與真實 API 同型別）
4. 防作弊最低限度：clientToken 簽章、伺服器端合理性檢查（時間下限）

---

## 8. 風險與備註

- **商店評分（非官方 GraphQL）**：`graph.oculus.com/graphql` 非正式公開 API，`doc_id`／欄位可能隨時變更，亦可能違反商店 ToS。必須：
  - **僅後端**呼叫（不在瀏覽器直連，避免 CORS／暴露 token）
  - 結果**快取**到 MongoDB（建議 TTL 6–24 小時），失敗時回退上次快取
  - UI 可標示「評分來源：Meta Store（非即時）」
  - 若官方 Rate & Review API 日後推出，優先替換實作
- **留言區**：涉及 UGC 審核成本，第一階段僅預留 schema，預設關閉
- **MongoDB Atlas M0**：免費層有連線數／儲存上限；IP allowlist 需含 EC2 出口 IP（或暫時允許 `0.0.0.0/0` 並強制 TLS＋強密碼）
- **S3 SPA 路由**：需設定錯誤文件／CloudFront 行為將 `404` 導回 `index.html`，否則重新整理深層路徑會失敗
- **glb 檔案大小**：Unity 匯出時注意貼圖壓縮；S3／CloudFront 流量與行動裝置考量單檔 < 5 MB
- **EC2 成本**：選 t3.micro／t4g.micro 等小規格；建議搭配 nginx reverse proxy + HTTPS（ACM／Let's Encrypt）
- **CI/CD 可延後**：功能穩定前不必被 pipeline 綁住；上線前再補即可
- **CI Secrets**：後端敏感環境變數優先留在 EC2；Actions 只放部署所需憑證。OIDC 優於長期 Access Key
- **Actions 失敗不回滾**：若需安全網，可保留上一個 S3 前綴版本或 EC2 上 pm2 多版本目錄（第一階段可手動處理）
- **MongoDB Compass**：開發期用來瀏覽／除錯 Atlas 或本機資料；**不是**自動化測試替代品（見後端文件）
