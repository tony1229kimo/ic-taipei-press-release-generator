# SEEDS 大地義式餐廳 — Outlet 觀察工具 Pilot 規格書
# SEEDS Restaurant — Outlet Observation Tool Pilot Spec

> 狀態：規格完成，待開工 / Status: Spec ready, pending build
> 最後更新 / Updated: 2026-05-29
> 範圍 / Scope: 高雄洲際酒店第一間 outlet pilot，跑通後複製到其餘 5 間 + 台北
> 需求拍板：所有洞察類型全做、**雙語（中/英）**、**多角色**呈現

---

## 0. 為什麼是 SEEDS（Pilot 選擇理由）

- 公開資料密度最高（部落格報導、媒體曝光最多）
- 定位清楚、有名有姓的主廚、現成差異化故事（永續 × 義式）
- 全日餐廳是酒店餐飲核心戰場，競品最明確，觀察維度可複製到其他 outlet
- 內部新聞稿資料齊全（Google Drive 已有多篇）

---

## 1. SEEDS 餐廳檔案 / Restaurant Profile

| 欄位 | 內容 |
|------|------|
| 中文名 | SEEDS 大地義式餐廳（2022 開幕時為「SEEDS 大地全日餐廳」，2024 改版義式） |
| 英文名 | SEEDS |
| 位置 | 高雄洲際酒店 1F（新光路 33 號，前鎮區亞灣區） |
| 現任主廚 | 行家主廚 余俊傑 (Ken Yu)（台北君悅德籍行政總主廚推薦） |
| 餐飲總監（開幕期） | 法籍行政總廚 白祥哲 (Alex Buytaert)，20+ 年資歷，曾任杜拜帆船酒店、九龍香格里拉 |
| 概念演進 | 2022 歐亞無國界料理 → 2024 義式料理 × 永續食材 |
| 永續定位 | 屏東洲際永續農場作物、契作小農鮮蔬、台灣職人肉品、高雄海港海鮮 |
| 氛圍 | 歐洲復古浪漫、ArtDeco |
| 招牌（2022） | 酒香焰燒海鮮雙人分享盤（波士頓龍蝦、台灣海蟹、南非鮑魚、北海道干貝、法國小淡菜、根島蝦），桌邊干邑火焰服務，平日 $3,880 / 假日 $5,880 |
| 招牌（2024） | 帕瑪森起司醬手工麵疙瘩、米蘭燉小牛膝、西西里焗烤千層茄子 |
| 定價 | 午餐均消 $1,200+10%、晚餐均消 $1,580+10%；假日自助沙拉吧 Buffet 純自助 $1,080；套餐 $880 起 |
| 客群 | 約會、慶生、紀念日、商務 |
| 評分 | 愛食記 4.6 |
| 訂位專線 | 07-339-0303（酒店總機 07-339-1888） |
| 合作夥伴案例 | Le Comptoir 康拓洋行（義大利酒）、BULGARI 寶格麗（香氛聯名活動） |
| 官網 | https://ickaohsiung.com/restaurant/seeds-2/ |

### 內部資料對照（Google Drive 已有，可作為 AI 分析的「自家基準」）
- `20220224` SEEDS 大地全日餐廳 一泊二食啟售（開幕定位）
- `20240229` SEEDS 義式餐廳 女神節系列（改版義式 + 寶格麗聯名 + 康拓洋行餐酒）
- `20240801` 父親節 SEEDS + HAWKER 限時體驗
- 其他：四週年盛饗雙倍券、聖誕季、好客開幕、酒店開業稿

---

## 2. 資料源清單 / Data Sources

> ⚠️ 重要技術前提：高雄洲際官網、Google Maps、IG、美食部落格皆**封鎖一般 HTTP 抓取（403）**。
> 雷達要監測這些必須用 **Apify**（你已有帳號）。普通 fetch 行不通。

### SEEDS 的監測來源

| 來源 | URL / 識別 | 抓取方式 | 對應你給的連結 |
|------|-----------|---------|--------------|
| 官網餐廳頁 | ickaohsiung.com/restaurant/seeds-2/ | Apify Website Content Crawler | — |
| Google Maps 評論 | （6 連結之一，需你標明哪個是 SEEDS） | Apify Google Maps Reviews Scraper | maps.app.goo.gl/... |
| Instagram | 高雄洲際官方 IG + #SEEDS大地 #高雄洲際 | Apify Instagram Scraper | — |
| 美食媒體/部落格 | Google News + 關鍵字「SEEDS 高雄洲際」 | Apify Google Search / RSS | — |
| 愛食記 / WalkerLand | 該餐廳頁 | Apify Web Crawler | — |

### 你給的 6 個 Google Maps 連結（待你標註對應餐廳）
```
1. https://maps.app.goo.gl/otdEzHV2RNHKCtow9  → ？
2. https://maps.app.goo.gl/55h2zF9uQLvTwRx27  → ？
3. https://maps.app.goo.gl/o4rNso5RtBo1Bxq16  → ？
4. https://maps.app.goo.gl/GMktHXe4rSZ3Wi9e7  → ？
5. https://maps.app.goo.gl/YvixaxSZNXaey4ws6  → ？
6. https://maps.app.goo.gl/8CiY89kK1Rgc7mr46  → ？
```
（這些短連結擋自動解析，需要你告訴我每個對應哪間餐廳，或在 Apify 裡用瀏覽器解析）

---

## 3. 對標競品 / Competitors

### SEEDS（全日／義式精緻）對標
| 類型 | 競品 | 監測重點 |
|------|------|---------|
| 同級酒店全日餐廳 | 高雄日航 SERENA 全日餐廳 | 自助/套餐定價、主題活動 |
| 酒店自助餐龍頭 | 漢來大飯店 海港自助餐 | 海鮮、CP 值口碑 |
| 花園飯店 buffet | 林皇宮 森林百匯 | 婚宴/家庭客群 |
| 獨立義式精緻 | all'Onda 浪、瑞思特、艾可廚坊 | 義式專門店的菜色趨勢 |

> 每間 outlet 都有自己一組對標競品，pilot 先把 SEEDS 這組做透。

---

## 4. 觀察維度（四類洞察全做）/ Observation Dimensions

使用者拍板：四類洞察都要。每類對應一組 widget，皆需**中英雙語**輸出。

### 4.1 自家評論與口碑 / Reviews & Reputation
- Google Maps / 社群評論流（即時）
- 評論主題抽取：餐點 / 服務 / 環境 / CP值 / 訂位體驗
- 情感趨勢（30 天）
- 負評預警（短時間負評暴增）
- 最常被誇 / 被嫌的維度排行

### 4.2 競品動態 / Competitor Moves
- 對標競品的新菜、活動、促銷、主廚動作
- 競品 vs SEEDS 定價對比
- 競品聲量趨勢
- 「競品做了、SEEDS 還沒做」的缺口提示

### 4.3 主題趨勢 / Topic Trends
- 永續、義式、節慶、主廚聯名、餐酒會等市場熱題
- 主題熱度與成長率
- SEEDS 可搭的題材建議（連結到自家素材）
- 季節/節慶行事曆（女神節、父親節、聖誕等已有操作紀錄）

### 4.4 媒體曝光 / Media Coverage
- SEEDS 被哪些媒體/部落格報導
- 曝光頻率與評價
- 媒體偏好（哪家愛報主廚故事、哪家愛報promo）
- 公關效益估算

---

## 5. 資料模型 / Data Model（雷達端新增）

在 hotel-news-radar 現有 schema 之上**加 outlet 層**，不動現有酒店層。

```sql
-- 餐廳/酒吧主檔
outlets (
  id              text pk,
  hotel           text,   -- 'kaohsiung' | 'taipei'
  name_zh         text,   -- 'SEEDS 大地義式餐廳'
  name_en         text,   -- 'SEEDS'
  type            text,   -- 'all-day' | 'chinese' | 'japanese' | 'sea' | 'bakery' | 'bar'
  positioning_zh  text,
  positioning_en  text,
  chef            text,
  signature       text,   -- JSON
  price_range     text,
  is_self         integer, -- 1 = 自家, 0 = 競品
  parent_outlet_id text,  -- 競品對標哪間自家 outlet
  source_urls     text,   -- JSON: { website, gmaps, instagram, ... }
  created_at      integer
)

-- outlet 層的所有採集內容（評論/貼文/報導/競品動態）
outlet_mentions (
  id            text pk,
  outlet_id     text fk → outlets.id,
  source        text,   -- 'gmaps_review' | 'instagram' | 'media' | 'blog' | 'competitor'
  url           text,
  author        text,
  title         text,
  content       text,
  rating        real,   -- 評論星等（評論才有）
  published_at  integer,
  raw_data      text,   -- JSON, Apify 原始回傳
  collected_at  integer
)

-- AI 分析結果（雙語）
outlet_insights (
  mention_id      text pk fk → outlet_mentions.id,
  dimension       text,   -- 'review' | 'competitor' | 'topic' | 'media'
  themes          text,   -- JSON: ['餐點','服務',...]
  sentiment       real,   -- -1 ~ 1
  summary_zh      text,
  summary_en      text,
  key_entities    text,   -- JSON: { dish, chef, price, partner }
  created_at      integer
)

-- 每日聚合指標（dashboard 用，雙語標籤）
outlet_daily_metrics (
  date          text,
  outlet_id     text,
  mention_count integer,
  avg_rating    real,
  sentiment_avg real,
  top_themes    text,   -- JSON
  share_of_voice real,
  PRIMARY KEY (date, outlet_id)
)
```

---

## 6. Apify 採集設定 / Scraper Setup

| Apify Actor | 用途 | 排程 | 輸出 |
|------------|------|------|------|
| Google Maps Reviews Scraper | 抓 SEEDS + 競品評論 | 每日 | → outlet_mentions (gmaps_review) |
| Instagram Scraper | 官方帳號 + hashtag | 每日 | → outlet_mentions (instagram) |
| Website Content Crawler | 官網餐廳頁、愛食記 | 每週 | → outlet_mentions (blog) |
| Google Search Scraper | 「SEEDS 高雄洲際」新聞 | 每日 | → outlet_mentions (media) |

流程：Apify Schedule → Webhook → 雷達 `/api/ingest/outlet` → 寫入 → Claude 分析 → 聚合。

---

## 7. Outlet Dashboard 設計（多角色 + 雙語）

### 路由
`/outlets/:outletId` — 每間餐廳一個觀察頁

### 角色化呈現（沿用雷達角色框架）
| 角色 | 在 SEEDS 頁看到 |
|------|---------------|
| GM | 總評分 vs 競品、聲量趨勢、負評預警、媒體曝光總覽 |
| 行銷/公關 | 主題趨勢、媒體偏好、可搭題材、活動機會 |
| 餐飲總監 | 評論主題拆解、競品菜色動態、定價對比、主廚相關 |
| 服務/客務 | 服務面評論、客訴熱點、訂位體驗回饋 |

### 雙語
- UI 語言切換（zh / en）
- AI 摘要存雙語（summary_zh / summary_en）
- 日報雙語

---

## 8. 開發里程碑 / Milestones

### O1（3 天）：資料模型 + 一間餐廳手動灌資料
- [ ] outlets / outlet_mentions / outlet_insights / outlet_daily_metrics schema + migration
- [ ] SEEDS + 4 個競品建檔（用本規格書資料）
- [ ] 手動匯入一批 Drive 新聞稿 + 公開評論當種子資料
- [ ] `/outlets/:id` 基本頁（先顯示 mentions 列表）

### O2（4 天）：Apify 串接
- [ ] 設定 Google Maps Reviews Scraper（SEEDS + 競品）
- [ ] `/api/ingest/outlet` webhook 接收
- [ ] Instagram + Google Search actor
- [ ] 排程

### O3（4 天）：AI 分析 pipeline（雙語）
- [ ] 評論主題抽取 + 情感（Claude）
- [ ] 競品動態分類
- [ ] 雙語摘要產生
- [ ] 每日聚合 job

### O4（5 天）：角色化 Outlet Dashboard
- [ ] 四類洞察 widget（評論/競品/主題/媒體）
- [ ] 角色切換呈現
- [ ] 中英雙語 UI
- [ ] outlet 切換器（為複製到其他餐廳鋪路）

### O5（後續）：複製到其他 outlet + 台北
- [ ] 湛露、WA-RA、HAWKER、BL.T33、Delicatesse 建檔
- [ ] 台北各 outlet（待台北資料齊全）

---

## 9. 開工前需要你提供的 / Needed Before Build

1. **6 個 Google Maps 連結各對應哪間餐廳**（短連結擋解析，需你標）
2. **確認對標競品名單**（第 3 節，可增減）
3. 其他 SEEDS 相關內部文件（菜單 PDF、定位 brief、媒體曝光紀錄）— 放 Drive 我可直接讀

---

## 10. 雷達 session 開工指令

開 hotel-news-radar repo 的 session，貼：
```
我們要在雷達加「outlet（餐廳）層觀察」功能，pilot 是高雄洲際 SEEDS 餐廳。
完整規格在產生器 repo 的 docs/seeds-pilot-spec.md（我可貼給你）。

從 O1 開始：
1. 加 outlets / outlet_mentions / outlet_insights / outlet_daily_metrics 四張表
   （schema 在規格書第 5 節）+ Drizzle migration
2. 用規格書第 1、3 節資料把 SEEDS + 4 個競品建檔（seed script）
3. 加 /outlets/:id 頁，先顯示該 outlet 的 mentions 列表

不動現有酒店層的爬蟲與 dashboard，這是新增的一層。
```
