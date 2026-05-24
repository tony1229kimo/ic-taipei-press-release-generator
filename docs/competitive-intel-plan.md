# 競品分析 Dashboard — 規劃文件

> 狀態：規劃中（尚未開工）
> 建立日期：2026-05-24
> 用途：等開工時直接打開這份文件，與 Claude 一起繼續推進

---

## 一、核心問題（這個 Dashboard 要回答什麼）

1. 競品（其他五星酒店、同級餐廳）最近在**做什麼活動 / 發什麼新聞稿**？
2. 媒體和社群在**討論什麼**？主題、聲量、情感？
3. 我們的露出 vs 競品的露出**差距在哪**？
4. 寫新稿時，**有哪些題材機會**還沒人做？

---

## 二、整體架構（6 層）

```
┌─────────────────────────────────────────────────────────┐
│  6. 展示層 Dashboard (React + Tremor/Recharts)          │
│     聲量趨勢 / 主題雲 / 競品比較 / AI 洞察              │
└──────────────────▲──────────────────────────────────────┘
                   │ REST / SSE
┌──────────────────┴──────────────────────────────────────┐
│  5. API 層 (Express, 現有後端)                          │
│     /api/competitors  /api/insights  /api/trends         │
└──────────────────▲──────────────────────────────────────┘
                   │
┌──────────────────┴──────────────────────────────────────┐
│  4. AI 處理層 (Claude API)                              │
│     分類 / 摘要 / 主題抽取 / 情感分析 / 去重            │
└──────────────────▲──────────────────────────────────────┘
                   │
┌──────────────────┴──────────────────────────────────────┐
│  3. 儲存層                                              │
│     Supabase (Postgres + pgvector)                       │
└──────────────────▲──────────────────────────────────────┘
                   │ 每日排程
┌──────────────────┴──────────────────────────────────────┐
│  2. 資料採集層 (Apify Actors + News API)                │
└──────────────────▲──────────────────────────────────────┘
                   │
┌──────────────────┴──────────────────────────────────────┐
│  1. 資料來源（外部）                                     │
└─────────────────────────────────────────────────────────┘
```

---

## 三、資料來源

### 酒店層競品（初擬）
- 文華東方、君悅、晶華、寒舍艾美、台北萬豪、W Hotel、香格里拉、四季、台北艾麗
- 採集內容：官網新聞稿、活動頁、餐廳頁

### 餐廳/酒吧層（依各 outlet 定位對應）
| 我們的 Outlet | 對標競品舉例 |
|------------|------------|
| Pier No.5（扒房） | A Cut、教父牛排、Lawry's |
| Q Bar | Aha Saloon、Indulge、Bar Pun |
| 自助餐 | 君悅凱菲屋、寒舍艾美 LATITUDE25 |
| 中餐 | 晶華栢麗廳、君悅頤園 |

### 通用資料源
- Google News / News API（媒體報導）
- Instagram / Threads / 小紅書（社群聲量，Apify 有現成 actor）
- Google Maps / Tabelog / OpenRice（評論評分）
- Booking / Agoda（房價評分）
- 米其林指南、Tatler Dining、500 Bowls、Asia's 50 Best Bars（榜單）
- Taipei Walker、美食加、ShoppingDesign（美食媒體）

---

## 四、資料採集層（Apify）

```
apify-actors/
├── hotel-press-release-scraper/   # 各酒店官網新聞稿
├── news-search-scraper/            # Google News 關鍵字
├── instagram-hashtag-scraper/      # IG hashtag/帳號
├── google-maps-review-scraper/     # 餐廳評論
└── michelin-guide-scraper/         # 榜單變動
```

- 用 Apify Schedules 排程（每日 02:00）
- 結果 → Webhook 通知後端 → 寫入 Supabase

---

## 五、儲存層（Supabase）

### 為什麼要用 Supabase？
現有 JSON 檔存品牌設定/歷史稿沒問題，但**競品資料每天可能新增數百筆，累積一年 = 十幾萬筆**，JSON 撐不住，也做不到 dashboard 需要的「篩選、統計、即時更新」。

### 遷移策略：不全遷，只新增
```
JSON 留著（不動）：
  brand-settings.json     ← 品牌設定
  press-releases.json     ← 自己的歷史稿
  knowledge-base.json     ← 知識庫

Supabase 新增（給競品分析用）：
  competitors             ← 競品清單
  mentions                ← 每日爬到的競品資料
  mention_insights        ← AI 分析結果
  daily_metrics           ← Dashboard 統計
```

### 預定 Schema
```sql
-- 競品主檔
competitors (
  id, name, type[hotel/restaurant/bar],
  tier, website, created_at
)

-- 採集到的原始事件
mentions (
  id, competitor_id, source[news/social/review/release],
  url, title, content, published_at,
  raw_data jsonb, collected_at
)

-- AI 處理後的結構化資料
mention_insights (
  mention_id, category, sub_category, topics[],
  sentiment, key_entities jsonb, summary,
  embedding vector(1536)
)

-- 預先計算的指標
daily_metrics (
  date, competitor_id, mention_count,
  sentiment_avg, top_topics jsonb, share_of_voice
)
```

---

## 六、AI 處理層（Claude）

每則 mention 進來時跑一次 pipeline：
```
原始內容 → Claude → {
  category: "餐飲活動" | "客房優惠" | "品牌合作" | ...,
  topics: ["聖誕節", "下午茶", "永續"],
  sentiment: -1 ~ 1,
  entities: { 主廚, 合作品牌, 價格, 期間 },
  summary: "...",
  embedding: [...]
}
```

去重複：URL hash + embedding 相似度 > 0.92 視為同一則。

---

## 七、Dashboard 頁面結構

整合進現有專案，新增路由 `/competitive-intel`：

```
src/pages/competitive-intel/
├── Overview.tsx        # 總覽
├── Competitors.tsx     # 單一競品深度頁
├── Topics.tsx          # 主題趨勢
├── Opportunities.tsx   # AI 機會建議
└── Mentions.tsx        # 原始資料列表
```

### Overview 頁面區塊
| 區塊 | 視覺化 | 內容 |
|------|--------|------|
| 頂部 KPI | 4 個大數字卡 | 本週競品聲量、SOV、我們的聲量、新議題數 |
| 聲量趨勢 | 折線圖 | 我們 vs 競品 30 天聲量 |
| 競品活動熱度 | 橫條圖 | 各競品近 7 天發布數 |
| 主題雲 | Word cloud | 本週熱門主題 |
| 最新動態 Feed | 卡片列表 | 即時抓到的競品新聞稿 |
| AI 每日洞察 | 文字卡 | Claude 總結「今天最值得注意的 3 件事」 |

### Opportunities 頁（殺手鐧）
讓 Claude 分析「**競品有做但我們沒做**」或「**主題熱但我們缺席**」的題材 → 直接點「**用此題材生成新聞稿**」→ 跳回新聞稿產生器並預填 prompt。

> 這就是 Dashboard 和現有產品的整合價值。

---

## 八、技術選型

| 元件 | 推薦 | 理由 |
|------|------|------|
| 圖表 | **Tremor** | 基於 Tailwind，跟 ShadCN 同生態 |
| DB | **Supabase** | Postgres + Auth + Realtime + pgvector，免運維 |
| 爬蟲 | **Apify** | 現成 actor 多，排程方便 |
| 排程 | Apify Schedules / Zeabur Cron | 看負載 |
| Embedding | **Voyage** (`voyage-3`) | 中文表現好 |
| 通知 | Discord/Slack Webhook | 重大事件即時推送 |

---

## 九、開發階段建議

### MVP（2-3 週）— 先驗證價值
- [ ] 5 個酒店競品 + 官網新聞稿爬蟲
- [ ] Supabase 註冊 + 建表
- [ ] Claude 分類 pipeline
- [ ] Overview 頁 + Mentions 列表

### V2（+2 週）— 加深度
- [ ] 加入餐廳競品 + 社群資料
- [ ] Topics / Opportunities 頁
- [ ] 整合回新聞稿產生器（一鍵生成）

### V3 — 進階
- [ ] 評論情感分析
- [ ] 媒體效益追蹤
- [ ] 自動週報 Email

---

## 十、開工前要決定的事

1. **競品清單**先鎖定哪幾家？（建議 MVP 先 5 家酒店）
2. **Supabase 帳號**註冊好了沒？
3. **Apify 帳號**註冊好了沒？（免費 $5 額度可用）
4. Dashboard 是**新獨立頁面**還是**整合進現有導覽**？
5. 要不要做**使用者登入**？（Supabase Auth 順手做掉）

---

## 開工時的第一句話建議

直接跟 Claude 說：
> 「打開 `docs/competitive-intel-plan.md`，我們從 MVP 第一步開始：幫我寫 Supabase 的建表 SQL 和 Apify 第一個爬蟲。」
