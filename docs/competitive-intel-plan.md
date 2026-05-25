# 競品分析整合計畫 — 以「Hotel News Radar」為中樞

> 狀態：已拍板，等開工
> 最後更新：2026-05-25
> 重要：**方向已修正** — 不再另建競品分析系統，改以現有 `hotel-news-radar` 為情報中樞，本產生器作為消費端整合。

---

## 一、為什麼方向修正？

最初規劃時不知道 `tony1229kimo/hotel-news-radar` 已存在並部署。檢視後發現雷達已涵蓋原本「競品分析 Dashboard」70% 的功能：

| 原本要做的 | 雷達**已具備** |
|----------|--------------|
| 爬取競品新聞 | ✅ 40+ RSS feeds |
| 排程採集 | ✅ Cron 每日 09:00 & 16:00 |
| AI 分類 | ✅ Claude 分 4 類 |
| 情感分析 | ✅ Sentiment |
| 主題標籤 | ✅ Opportunity tags |
| 摘要 | ✅ Summary |
| 媒體效益分數 | ✅ Media value score |
| Dashboard | ✅ 已上線 |
| Email 推播 | ✅ 雙語日報 |

**結論：以雷達為中樞，產生器作為下游消費端。**

---

## 二、整合架構

```
                ┌─────────────────────────────────────┐
                │   Hotel News Radar（情報中樞）       │
                │   Next.js 15 + SQLite + Drizzle      │
                │   Claude Haiku 4.5 + Opus 4.7        │
                │   ✅ 已部署 (Zeabur)                  │
                └─────────────────────────────────────┘
                        │              ▲
                  提供洞察 API      回寫「我們發了什麼」
                        ▼              │
                ┌─────────────────────────────────────┐
                │  Press Release Generator (本專案)    │
                │  React + Vite + Express + JSON       │
                │  ✅ 已部署 (Zeabur)                   │
                │                                      │
                │  新增：情報雷達分頁                   │
                │       首頁機會橫幅                    │
                │       寫稿時情報側欄                  │
                │       歷史頁效益分數                  │
                └─────────────────────────────────────┘
```

### 兩個系統的角色

| 系統 | 角色 |
|-----|-----|
| 雷達 | 資料 + AI 大腦：所有外部情報的單一來源 |
| 產生器 | 執行端：消費雷達洞察 → 寫稿 → 回寫雷達追蹤效益 |

---

## 三、整合策略：A 先，B 後

### 階段 A：API 串接（MVP，先做）
雷達加 endpoints，產生器透過 HTTP 呼叫。各自保留現有資料庫。

### 階段 B：共用 Supabase（後續）
雷達 SQLite + 產生器 JSON 都遷移到 Supabase，兩邊共用 schema。

**不做方案 C（合併單一 app）**——雷達是 Next.js 15、產生器是 Vite + Express，技術棧不相容，硬合併要 4 週空窗期，風險不值得。

---

## 四、雷達端要新增的 API

```typescript
// 在 hotel-news-radar repo 新增

GET /api/insights/competitive-summary?days=7
  → 競品近 7 天動態摘要

GET /api/insights/opportunities
  → 「主題熱但 IC 還沒做」的機會清單
  → 回傳每筆機會：{ id, title, summary, topic, competitors, suggested_angle }

GET /api/insights/topics/trending
  → 熱門主題雲

GET /api/insights/by-property/:propertyId
  → 針對某個 outlet 的相關洞察

POST /api/feedback/press-release-published
  → 產生器寫完稿後回寫，雷達啟動 30 天媒體效益追蹤
  → body: { release_id, title, published_at, keywords[], channels[] }

GET /api/feedback/outcomes/:release_id
  → 取得某篇稿的媒體效益（給歷史頁顯示）
```

---

## 五、產生器整合（雙層）

### 側邊欄結構（拍板）

```
🏨 臺北洲際酒店
   新聞稿產生器

  📰 新聞稿產生器          ← 強化：首頁加「今日機會」橫幅
  🛰️  情報雷達     🆕      ← 新增
  📚 歷史記錄              ← 強化：每筆加媒體效益分數
  ⚙️  後台管理              ← 強化：新增「雷達設定」
```

順序傳達工作流：寫稿 ← 看情報 → 回頭歷史。

### Layer 1：新分頁「🛰 情報雷達」

單頁 + Tab 切換：
- 今日機會（預設）
- 競品動態
- 熱門主題
- 效益追蹤

每張機會卡 → `→ 用此題材寫稿` 按鈕：
1. 跳轉 `/?intel=opp_123`
2. 產生器自動帶入預選類別 + 參考重點 + 競品相關稿件

### Layer 2：產生器首頁強化（最關鍵）

打開 `GeneratorPage` 不再直接面對空白表單：

```
┌─ 🔥 今日 3 個機會 ────── [全部機會 →] ──┐
│ [機會卡] [機會卡] [機會卡]               │
└────────────────────────────────────────┘

─── 或自行設定 ───

[現有表單]

┌─ 📡 相關情報（依當前選擇浮現）─────────┐
│ 選了「餐飲」+「聖誕」→ 雷達補充：       │
│ • 競品本月相關稿件 5 篇 [展開]         │
│ • 媒體偏好標題寫法                     │
│ • 主題情感：正面 82%                   │
└────────────────────────────────────────┘

[產生新聞稿] →
```

### Layer 3：歷史記錄頁強化

```
日期    標題                類別    📊 媒體效益
12/15   聖誕下午茶開賣      餐飲   ⭐⭐⭐⭐ $42K
12/10   跨年套房限定        客房   ⭐⭐ $8K
12/05   Pier No.5 新主廚    餐飲   ⭐⭐⭐⭐⭐ $87K
```

點開單筆顯示：露出媒體清單、媒體價值、同期競品對比、情感分析。

### Layer 4：寫完稿後的「閉環」追蹤

```
✅ 新聞稿已儲存
🔔 要請雷達追蹤這篇的媒體效益嗎？

預計發布日：[___]
發布管道：[ ]官網 [ ]媒體名單
主要關鍵字：[___]

[略過]  [送雷達追蹤]
```

按下後呼叫雷達 `POST /api/feedback/press-release-published` → 雷達監控 30 天 → 回寫效益分數。

**這是整合最值錢的功能：建立「寫稿好不好 = 媒體買不買單」的客觀指標。**

---

## 六、開發里程碑

### M1（3 天）：基礎串接 + 首頁機會橫幅

**產生器端：✅ 已完成（2026-05-25）**
- [x] 後端 proxy 路由 `backend/routes/radar.ts`（含 mock fallback）
- [x] 前端 API 用戶端 `src/api/radar.ts`
- [x] `OpportunityBanner` 元件 `src/components/intel/OpportunityBanner.tsx`
- [x] `GeneratorPage` 頂部加「今日機會」橫幅
- [x] 機會卡點擊 → 預填表單（類別、面向、主題、關鍵資訊）
- [x] Sonner Toaster 提示「已套用情報」
- [x] 環境變數 `RADAR_API_BASE`（含 `RADAR_API_KEY`）設定後自動切換真實 API

**雷達端：⏳ 待辦（需另開 session 在 hotel-news-radar repo 開發）**
- [ ] 雷達新增 `GET /api/insights/opportunities?limit=N`
- [ ] 雷達新增 `GET /api/insights/competitive-summary?days=N`
- [ ] 部署後設定產生器 Zeabur 環境變數 `RADAR_API_BASE`、`RADAR_API_KEY`

### M2（3 天）：情報雷達分頁
- [ ] 側邊欄新增「🛰️ 情報雷達」
- [ ] 新增 `src/pages/IntelPage.tsx`
- [ ] Tab：今日機會 / 競品動態（M2 先做這兩個）
- [ ] 機會卡完整版（含建議切角、競品對照）

### M3（2 天）：寫稿時的相關情報側欄
- [ ] 產生器：當前類別/子類別變動時呼叫 `GET /api/insights/by-property`
- [ ] 側欄即時顯示相關競品稿件、媒體偏好

### M4（4 天）：寫完稿觸發追蹤 + 歷史頁效益
- [ ] 雷達新增 `POST /api/feedback/press-release-published`
- [ ] 雷達新增 `GET /api/feedback/outcomes/:release_id`
- [ ] 雷達內部：30 天關鍵字監控邏輯（match articles → 計算 media value）
- [ ] 產生器：寫完稿彈窗「送雷達追蹤？」
- [ ] 產生器：歷史頁列表加效益欄位
- [ ] 產生器：歷史單筆詳情頁加「媒體效益分析」區塊

### M5（1 週，後續）：後台 + Supabase 遷移
- [ ] 後台新增「雷達設定」區塊（連線狀態、敏感度、自動追蹤開關）
- [ ] 雷達 SQLite → Supabase Postgres
- [ ] 產生器 JSON → Supabase（歷史稿件、媒體聯繫人）
- [ ] 兩邊共用 Supabase Client，直接 query 不再透過 HTTP

---

## 七、本機環境準備（開工前）

- [ ] Supabase 帳號已開好 ✅
- [ ] Apify 帳號已開好 ✅（M5 階段才用）
- [ ] hotel-news-radar 本機可跑（`npm run dev`）
- [ ] press-release-generator 本機可跑（`npm run dev`）
- [ ] 兩邊 `.env` 配好 `ANTHROPIC_API_KEY`
- [ ] 決定雷達 API 的 base URL（local dev / Zeabur 各一個）

---

## 八、雷達端開工指令（複製到 hotel-news-radar 的 Claude session）

開啟針對 `hotel-news-radar` repo 的新 session，貼這段：

```
我們要把 hotel-news-radar 開放給 ic-taipei-press-release-generator 消費。
產生器端已經做好客戶端 + mock 資料 fallback（這個 repo 的
backend/routes/radar.ts 是參考實作），現在請你做雷達端的兩個 API：

1. GET /api/insights/opportunities?limit=3
   回傳：{ opportunities: Opportunity[] }
   每個 Opportunity 結構（產生器這邊已有 TypeScript 定義）：
   {
     id: string;
     title: string;              // 「聖誕下午茶主題本週聲量 +340%」
     summary: string;            // 1-2 句白話解釋
     heat: 'high' | 'rising' | 'medium';
     topic: string;              // 「聖誕下午茶」
     suggestedAngles: string[];  // ["主廚特調", "限定甜點"]
     prefillCategory?: 'general' | 'business' | 'lifestyle';
     prefillAngleItems?: string[];  // 必須對應產生器 allAngleGroups
                                    // 的精確 items 字串（例如「季節主題下午茶」）
     prefillTopic?: string;
     prefillKeyFacts?: string;
     relatedCompetitors?: Array<{ name, articleTitle, url, publishedAt }>;
     topicTrend?: { count7d: number; growthPct: number };
     createdAt: string;          // ISO timestamp
   }

   實作邏輯（吃現有資料）：
   - 從 articles + article_insights 表抓近 7 天競品文章
   - 依 opportunity tag 分組計算聲量（聲量 / 成長率）
   - 過濾出 IC（自己）近 30 天未發稿的主題
   - 用 Claude Opus 4.7 整合成 3 則 opportunity 摘要 + 寫稿切角建議
   - 排序：heat=high → rising → medium
   - 可加 cache（每 6 小時更新一次即可）

2. GET /api/insights/competitive-summary?days=7
   回傳：
   {
     periodDays: number;
     totalMentions: number;
     topCompetitors: Array<{ name; mentionCount; topTopics: string[] }>;
     emergingTopics: string[];
     generatedAt: string;
   }

   簡單聚合 SQL 就能算出來，topTopics / emergingTopics 從 opportunity tags 來。

請：
- 不需要新增 DB 表，純讀現有資料
- 加一個簡單的 Bearer token 認證（讀 env `RADAR_API_KEY`），請也回給我這把 key
- 部署到 Zeabur 後告訴我 base URL，我會在產生器端設 RADAR_API_BASE
- 結束時把參考的 TypeScript interface（可從產生器這份 plan 看到）也寫進雷達的 README
```

## 九、開工時的第一句話（產生器端後續任務）

雷達端 API 上線後，回到本 repo 跟 Claude 說：
> 「打開 `docs/competitive-intel-plan.md`，雷達端 API 已上線，URL 是 [...]，
>  幫我設定 Zeabur 的 `RADAR_API_BASE` 環境變數並驗證真實資料能拉到。
>  然後開始 M2：新增 `/intel` 分頁。」
