# 🪿 官方網站 — React + TypeScript 前端規格

> **對應文件：** [`web_plan.md`](web_plan.md)（總計畫）、[`web_backend_express.md`](web_backend_express.md)（後端 API）  
> **視覺設計規範：** [`Nintendodesign.md`](Nintendodesign.md)（Y2K console-chrome；前端實作 UI 時必讀）  
> **對齊 Cursor rule：** `react=best-practice.mdc`  
> **文件版本：** v1.5　**最後更新：** 2026-07-18

---

## 1. 技術棧

| 項目 | 選型 | 備註 |
|------|------|------|
| 建置 | Vite | |
| 框架 | React 18 + TypeScript（strict） | |
| 路由 | react-router-dom v6 | 路由級 **React.lazy + Suspense** |
| UI | **shadcn/ui**（Radix + Tailwind，copy 進 repo） | Button、Form、Tabs、Dialog、Skeleton… |
| Server state | TanStack Query | 所有 API 資料 |
| Client state | **Zustand** | 跨元件 UI（例：3D 選中模型） |
| 表單 | react-hook-form + zod | 與後端共用 schema |
| 樣式 | Tailwind CSS | 手機優先 |
| 3D | three + r3f + drei | `public/models/*.glb` |
| Markdown | react-markdown + remark-gfm + **標籤白名單** | 防 XSS |
| 測試 | Vitest + **RTL** + **jest-axe** | |
| 部署 | S3 + CloudFront；Actions **可延後 M6** | |

```json
{
  "scripts": {
    "dev": "vite",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "build": "tsc -b && vite build"
  }
}
```

---

## 2. 命名與專案結構

### 2.1 命名（對齊 rule）

- 元件檔：**kebab-case** + `.tsx`（例：`home-page.tsx`、`feedback-form.tsx`）
- 工具／型別：`.ts`
- 優先 **named export**
- 單引號、2 spaces、`const`、`?.`／`??`

### 2.2 目錄

```
web/frontend/
├─ public/
│  ├─ models/
│  └─ press-kit/
├─ src/
│  ├─ main.tsx
│  ├─ app.tsx                 # Router + QueryClient + ErrorBoundary
│  ├─ api/
│  │  ├─ client.ts
│  │  ├─ levels.ts
│  │  ├─ feedback.ts
│  │  ├─ polls.ts
│  │  ├─ site-meta.ts
│  │  └─ leaderboard.ts
│  ├─ types/api.ts
│  ├─ components/
│  │  ├─ ui/                  # ★ shadcn 複製進來的 primitives
│  │  ├─ layout/
│  │  ├─ home/
│  │  ├─ levels/
│  │  ├─ feedback/
│  │  ├─ polls/
│  │  ├─ press/
│  │  ├─ viewer-3d/
│  │  └─ error-boundary.tsx
│  ├─ pages/
│  │  ├─ home-page.tsx
│  │  ├─ levels-page.tsx
│  │  ├─ level-detail-page.tsx
│  │  ├─ feedback-page.tsx
│  │  ├─ polls-page.tsx
│  │  ├─ press-kit-page.tsx
│  │  └─ viewer-3d-page.tsx
│  ├─ hooks/
│  │  ├─ use-polls.ts
│  │  └─ use-voter-token.ts
│  ├─ stores/                 # ★ Zustand
│  │  ├─ viewer-store.ts
│  │  └─ ui-store.ts
│  └─ lib/
│      ├─ utils.ts            # cn()
│      └─ markdown.ts         # 安全 Markdown
├─ components.json
├─ index.html
├─ tailwind.config.ts
├─ vite.config.ts
└─ .env.example
```

上線前再加：`.github/workflows/ci.yml`、`deploy-frontend.yml`。

---

### 2.3 視覺設計（必讀）

前端設計與實作 UI 時，以 [`Nintendodesign.md`](Nintendodesign.md) 為視覺語言依據（Nintendo.com circa 2001 console-chrome）。重點摘要：

| 面向 | 方向 |
|------|------|
| 整體感覺 | 頁面像組裝好的主機面板：bevel 金屬板、chamfer 切角，不是現代卡片牆 |
| 色票 | 冷色 periwinkle chrome + carbon 指揮層；暖色（amber／signal orange）只做「前進／操作」訊號 |
| 字級處理 | 結構標籤 uppercase + tracking；hero 字用 outline + hard drop shadow（box-art） |
| 字級尺寸 | 依 `Nintendodesign.md` Typography token，本站再 × **1.2**（`--type-scale`）以利現代螢幕閱讀 |
| 深度 | 硬 bevel／切角，不用模糊 soft shadow |
| 密度 | 模組緊貼、縫隙當結構縫，避免過大留白 |

**與本專案的適配（不要照抄 2001 固定寬）：**

- 仍遵守本規格的 **手機優先／響應式**（`Nintendodesign.md` 的「現代 port」建議：窄螢幕堆疊右欄、nav 收合）
- 品牌換成「鵝頭偷麵包」；色票與 bevel 語彙可沿用，Mario／Nintendo 商標素材不可用
- shadcn 元件可當互動 primitive，但外觀 token（色、圓角、bevel）應對齊該設計規範，勿維持預設「圓角卡片 + soft shadow」風格
- **字級：** 階層／用途對齊設計文件；絕對像素以 `--type-scale: 1.2` 放大（例：body 12→14.4px、label 11→13.2px）

實作 Tailwind／CSS 變數時，優先對照 `Nintendodesign.md` 的 Colors、Typography、Shapes、Do's and Don'ts。

---

## 3. 路由與頁面

| 路由 | 檔案 | 說明 |
|------|------|------|
| `/` | `home-page.tsx` | Hero、Demo 排行、商店評分、CTA |
| `/levels` | `levels-page.tsx` | 關卡 0–3 列表 |
| `/levels/:levelId` | `level-detail-page.tsx` | 單關詳情 |
| `/feedback` | `feedback-page.tsx` | 回饋 |
| `/polls` | `polls-page.tsx` | 投票 |
| `/press` | `press-kit-page.tsx` | Press Kit |
| `/viewer` | `viewer-3d-page.tsx` | 3D |

### 3.0 Lazy + Error Boundary

```tsx
const HomePage = lazy(() =>
  import('./pages/home-page').then((m) => ({ default: m.HomePage })),
);

<ErrorBoundary fallback={<ErrorFallback />}>
  <Suspense fallback={<PageSkeleton />}>
    <Routes>…</Routes>
  </Suspense>
</ErrorBoundary>
```

- 各頁 **React.lazy**；Skeleton 用 shadcn
- **ErrorBoundary** 接渲染錯誤；API 錯誤走 Query／表單
- 3D 另包 Suspense

### 3.1 Home

- shadcn `Button`／`Card`／`Tabs`
- Demo 排行假資料，型別與 Phase 2 相同；標示 `Demo data`

```ts
export interface LeaderboardEntry {
  rank: number;
  playerAlias: string;
  levelId: number;
  clearTimeMs: number;
  dropCount: number;
}
```

- `StoreRating` ← `GET /site-meta`；`stale` 顯示「非即時」

### 3.2 Level detail

```ts
export interface LevelDoc {
  levelId: number;
  title: string;
  promptEn: string;
  trainingFocus: string[];
  screenshots: string[];
  bodyMd: string;
  pitfalls: Pitfall[];
}

export interface Pitfall {
  title: string;
  detail: string;
}
```

- `bodyMd` 經 `lib/markdown.ts`：只允許 `p, ul, ol, li, strong, em, a, code, h2–h4`；禁止 raw HTML；`a` 加 `rel="noopener noreferrer"`

### 3.3 Feedback

```ts
export const feedbackSchema = z.object({
  category: z.enum(['bug', 'suggestion', 'other']),
  levelId: z.number().int().min(0).max(7).optional(),
  message: z.string().min(10).max(2000),
  email: z.string().email().optional().or(z.literal('')),
  website: z.string().max(0).optional(),
});
```

- shadcn Form + RHF；honeypot；欄位級錯誤／429 提示

### 3.4–3.6 Polls／Press／Viewer

- Polls：Query + mutation + `invalidateQueries`；`credentials: 'include'`
- Press：計數 API → S3 靜態檔；QR
- Viewer：Zustand 存選中模型；`/models/*.glb`；OrbitControls；`dpr={[1, 2]}`

---

## 4. API Client／Query／Zustand

```ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  });
  if (!res.ok) throw new ApiError(res.status, await safeParseBody(res));
  return res.json();
}
```

- Server state **只**用 TanStack Query；key 例：`['polls']`、`['levels', id]`
- Client state 用 Zustand；**不要**把 API 資料再抄進 store
- `ApiError`；UI 只顯示友善訊息
- 正式環境 HTTPS；前端無 secret

---

## 5. 部署（Actions 可延後）

開發期本機 lint／test／build。上線可先手動 `aws s3 sync`，再搬 workflow。

### 5.1 CI（M6）

`npm ci` → lint → typecheck → test → build（注入 `VITE_API_BASE_URL`）。PR 不部署。

### 5.2 Deploy main（M6）

OIDC → `s3 sync` → CloudFront invalidate（路徑含 `/index.html`、`/assets/*`、`/models/*`、`/press-kit/*`）。

### 5.3 基礎設施

- SPA：CloudFront 403／404 → `/index.html`
- Cookie：`SameSite=None; Secure`
- Vars：`VITE_API_BASE_URL`、`S3_BUCKET`、`CLOUDFRONT_DISTRIBUTION_ID`、`AWS_REGION`
- Secret：`AWS_ROLE_ARN`

---

## 6. 共通需求

- RWD、SEO／OG、WCAG AA（語意 HTML + Radix）
- Loading：Skeleton／按鈕 pending
- 安全：HTTPS、Markdown 消毒、可選 CSP report-only
- 效能：路由 lazy；圖片 lazy；memo 僅在量測後
- glb < 5 MB

---

## 7. 測試

| 層級 | 工具 | 範圍 |
|------|------|------|
| 單元 | Vitest | client、markdown、Zustand |
| 元件 | Vitest + RTL | 表單、投票、關卡卡 |
| a11y | jest-axe | 主要頁 smoke |
| E2E | Playwright（可選，M6 後） | 回饋／投票 |

---

## 8. 與 `react=best-practice.mdc` 對齊

| Rule | 本規格 |
|------|--------|
| shadcn/ui | `components/ui/` |
| Zustand | `stores/` |
| TanStack Query | §4 |
| RHF + zod | §3.3 |
| kebab-case | §2.1 |
| Error Boundary + Suspense | §3.0 |
| RTL + a11y | §7 |
| 安全／HTTPS／Cookie | §4、§6 |

---

## 9. 驗收清單（Phase 1）

- [ ] shadcn 用於主要 UI
- [ ] 視覺語彙對齊 [`Nintendodesign.md`](Nintendodesign.md)（bevel／色票／暖色僅訊號；非預設圓角軟陰影）
- [ ] 路由 lazy；ErrorBoundary 生效
- [ ] Markdown 消毒渲染
- [ ] Demo 排行、關卡 0–3、回饋、投票、Press、3D
- [ ] StoreRating stale fallback
- [ ] RTL + 至少一條 axe
- [ ] lint／test／build；Actions 可延後
- [ ] 深層路徑重整 OK；Lighthouse A11y／SEO ≥ 90
