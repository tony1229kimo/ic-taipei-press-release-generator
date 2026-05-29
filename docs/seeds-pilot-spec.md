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

## 1b. 高雄洲際 6 間 Outlet 總表（複製用）/ All 6 Outlets

| Outlet | 類型 type | 樓層 | Google Maps | 建檔狀態 |
|--------|-----------|------|-------------|---------|
| SEEDS 大地義式餐廳 | all-day | 1F | maps.app.goo.gl/55h2zF9uQLvTwRx27 | ⭐ Pilot |
| 湛露 中餐廳 | chinese | 2F | maps.app.goo.gl/otdEzHV2RNHKCtow9 | 待 O5 |
| WA-RA 日式餐廳（割烹+主題酒吧） | japanese | 5F | maps.app.goo.gl/o4rNso5RtBo1Bxq16 | 待 O5 |
| 好客 HAWKER 南洋餐廳 | sea | 2F | maps.app.goo.gl/GMktHXe4rSZ3Wi9e7 | 待 O5 |
| Delicatesse 洲際烘焙坊 | bakery | — | maps.app.goo.gl/YvixaxSZNXaey4ws6 | 待 O5 |
| BL.T33 大廳酒吧 | bar | 1F | maps.app.goo.gl/8CiY89kK1Rgc7mr46 | 待 O5 |

每間的對標競品與觀察維度略有不同（中餐看商宴婚宴、日式看 omakase 職人、酒吧看調酒師打卡），
SEEDS pilot 跑通後，依此表逐間建檔複製。

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

### 6 間餐廳的 Google Maps 連結（✅ 已對應，給 Apify Google Maps Reviews Scraper 用）
```
SEEDS 大地義式餐廳   https://maps.app.goo.gl/55h2zF9uQLvTwRx27   ← Pilot
湛露 中餐廳          https://maps.app.goo.gl/otdEzHV2RNHKCtow9
WA-RA 日式餐廳       https://maps.app.goo.gl/o4rNso5RtBo1Bxq16
好客 HAWKER 南洋餐廳  https://maps.app.goo.gl/GMktHXe4rSZ3Wi9e7
Delicatesse 洲際烘焙坊 https://maps.app.goo.gl/YvixaxSZNXaey4ws6
BL.T33 大廳酒吧      https://maps.app.goo.gl/8CiY89kK1Rgc7mr46
```
> 短連結擋自動解析，但 Apify 的 Google Maps Reviews Scraper 可直接吃這些 URL。
> Pilot 先接 SEEDS，其餘 5 間 O5 階段複製。

---

## 3. 對標競品分析 / Competitor Analysis（6 維度框架）

### 3.0 競品對標 6 維度評分框架 / 6-Dimension Matching Framework

每個候選競品依下列 6 維度評分（各 0-5 分），加總為「對標相關度」，
雷達據此排序頭號 vs 邊緣競品。新競品出現時自動套用此框架評分。

| # | 維度 Dimension | 說明 |
|---|----------------|------|
| 1 | 菜系/料理類型 Cuisine | 與該 outlet 料理類型重疊度 |
| 2 | 價位帶 Price band | 客單價區間重疊度 |
| 3 | 地理距離/商圈 Location | 亞灣 → 高雄市區 → 跨區，越近分越高 |
| 4 | 通路層級 Tier | 五星酒店 / 米其林 / 獨立餐廳 |
| 5 | 目標客群與場合 Target & occasion | 約會/商宴/家庭/慶生/品飲 |
| 6 | 體驗定位/賣點 Experience | 永續/職人/打卡/吃到飽/餐酒 等主軸 |

> 資料模型對應：`outlets` 表的競品列加一個 `match_scores` (JSON, 6 維分數)
> 與 `match_total` 欄位，dashboard 競品排序用。

---

### 3.1 SEEDS 大地義式餐廳（all-day / 義式精緻；午均消 $1,200、晚 $1,580、假日 buffet $1,080）

| 競品 | 通路 | 對標重點 | 相關度 |
|------|------|---------|:----:|
| **高雄日航 SERENA 全日餐廳** | 五星酒店 | 同為酒店全日餐廳、客群/定價最貼近 | ★★★★★ |
| **漢來大飯店 海港自助餐** | 五星酒店 | 自助餐龍頭，海鮮/CP值口碑（多樣 vs 精緻的對照） | ★★★★ |
| **H2O 水京棧 Ripple 義法餐廳** | 五星酒店 | 義法菜系 + Lounge，菜系最接近 | ★★★★ |
| 林皇宮 森林百匯 | 花園飯店 | buffet、家庭/婚宴客群 | ★★★ |
| all'Onda 浪、瑞思特、艾可廚坊 | 獨立義式 | 義式專門店菜色趨勢（非酒店，但同菜系） | ★★★ |

---

### 3.2 湛露 中餐廳（粵菜 + 上海菜 / fine dining；2F）

| 競品 | 通路 | 對標重點 | 相關度 |
|------|------|---------|:----:|
| **漢來 名人坊** | 五星 × 米其林粵菜 | 高雄高端粵菜頭號標竿（米其林富哥） | ★★★★★ |
| **高雄國賓 粵菜廳 Canton Court** | 五星酒店 | 同級酒店粵菜、港點 | ★★★★ |
| 漢來 翠園粵菜 | 五星酒店 | 港式精緻 | ★★★★ |
| 高雄萬豪 中餐/粵菜 | 五星酒店 | 同級酒店中餐 | ★★★ |
| 韻藏中餐廳（左營） | 獨立精緻中餐 | 跨區但定位接近 | ★★ |

---

### 3.3 WA-RA 日式餐廳（割烹 / 稻草炙燒 / omakase；5F）

| 競品 | 通路 | 對標重點 | 相關度 |
|------|------|---------|:----:|
| **鮨毅（Hotel dùa）** | 酒店 omakase | 高雄「最難訂」omakase，酒店日料標竿 | ★★★★★ |
| **鮨割烹 瑞実（左營）** | 獨立割烹 | 關西風割烹，料理形態最接近 | ★★★★ |
| 禾鮨（鐵板+江戶前，$1,800+10%） | 獨立 omakase | 雙主廚無菜單 | ★★★ |
| 梨壽司（岡山，$2,500） | 獨立 omakase | 季節無菜單 | ★★★ |
| 漢來 日本料理 | 五星酒店 | 同級酒店日料 | ★★★ |

---

### 3.4 好客 HAWKER 南洋餐廳（新加坡/星馬 / 海南雞飯·沙嗲·肉骨茶；2F）

| 競品 | 通路 | 對標重點 | 相關度 |
|------|------|---------|:----:|
| **馬來舅台所** | 獨立（馬來主廚） | 道地星馬，菜系最接近 | ★★★★ |
| 老巴剎 | 獨立 | 新加坡風味，但平價（價位帶差異） | ★★★ |
| 南洋食府銳記 | 獨立 | 南洋海南雞 | ★★★ |
| 叻沙郎 | 獨立 | casual 叻沙 | ★★ |
| — | — | **註：五星酒店做星馬料理者極少，HAWKER 在酒店通路近乎獨佔，此為差異化亮點，競品多為獨立餐廳** | — |

---

### 3.5 Delicatesse 洲際烘焙坊（bakery）

| 競品 | 通路 | 對標重點 | 相關度 |
|------|------|---------|:----:|
| **漢來 糕餅小舖** | 五星酒店烘焙 | 五星飯店烘焙龍頭（穀物麵包銷售冠軍） | ★★★★★ |
| **高雄萬豪 M 烘焙坊** | 五星酒店 | 同級酒店 1F 烘焙坊 | ★★★★ |
| 林皇宮 烘焙 | 花園飯店 | 飯店伴手禮/節慶禮盒 | ★★★ |
| Lesa 烘焙坊、胖PAN | 獨立人氣 | 在地職人麵包趨勢 | ★★ |

---

### 3.6 BL.T33 大廳酒吧（lobby bar / 下午茶 / 琴酒調酒；1F）

| 競品 | 通路 | 對標重點 | 相關度 |
|------|------|---------|:----:|
| **高雄萬豪 11F 京心 + 空中酒吧** | 五星酒店 | 下午茶 + 酒吧雙軸最接近 | ★★★★ |
| **漢來 大廳酒吧 / 下午茶** | 五星酒店 | 同級酒店 lobby 下午茶 | ★★★★ |
| H2O 水京棧 頂樓 Pool Bar / Ripple Lounge | 五星酒店 | 調酒 lounge | ★★★ |
| 高雄獨立 speakeasy 調酒吧 | 獨立 | 調酒趨勢（待補具體名單） | ★★ |

> 每間 outlet 都有自己一組對標競品。pilot 先把 SEEDS（3.1）這組做透，其餘 O5 複製。
> 競品名單可隨市場變動增修，6 維評分讓新競品能自動定位相關度。

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
  match_scores    text,   -- JSON: 6 維評分 { cuisine, price, location, tier, target, experience } 各 0-5（競品才有）
  match_total     integer, -- 6 維加總，competitor 排序用
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

1. ~~6 個 Google Maps 連結各對應哪間餐廳~~ ✅ 已完成（見第 1b 節）
2. **確認對標競品名單**（第 3 節，可增減）
3. 其他 SEEDS 相關內部文件（菜單 PDF、定位 brief、媒體曝光紀錄）— 放 Drive 我可直接讀

---

## 10b. Outlet 檔案補充（來自歷年新聞稿 Google Drive）

> 這些是 AI 分析時的「自家基準」——競品動態、評論、媒體報導都要對照這些事實。

### 共用事實 / Shared facts
- **酒店**：高雄洲際，IHG 直營，與遠雄 THE ONE 垂直共構，ArtDeco 風 253 間客房，亞灣區新光路 33 號
- **行政主廚**：余俊傑 Ken Yu（原 SEEDS 主廚，已升任全酒店行政主廚）
- **開幕餐飲總監**：法籍 白祥哲 Alex Buytaert（杜拜帆船、九龍香格里拉背景）
- **總經理沿革**：羅嘉麒（2021 開幕，IHG 台灣區域總經理）→ 周亞夫 Tony Geerts（2025 新任）
- **公關窗口沿革**：蘇軒 Susan Su／李霞 Alisha Lee（早期）→ 柳又瑄 Ines Liu、林胤均 Katniss Lin、陳佩詩 Jephrine Chin（行銷業務總監）、葉于瑄、王麗荃 Eirene Wang（餐飲行銷企劃）

### SEEDS 大地義式餐廳（檔案最完整）
- **得獎**：2023 世界奢華餐廳大獎「亞洲最佳奢華產地直送之環境友善餐廳獎」、第三屆綠色餐飲指南「綠食先行獎」→ **永續/環境友善是 SEEDS 最強的差異化與媒體題材**
- **轉型時間軸**：2021 開幕（全日餐廳，歐亞無國界）→ 2024/2 發表義式概念，卸下全日定位
- **互動式義大利麵**：自選麵體（圓直/細扁/鳥巢/手工寬麵/麵疙瘩，DECECCO）× 4 醬料，單點 $420 起
- **菜單亮點**：帕瑪火腿布拉塔起司 $580、東港櫻花蝦金沙燉飯 $540、烤章魚鷹嘴豆泥 $380、焦糖堅果冰糕 $260、晚間套餐 $2,280
- **永續食材鏈**：屏東洲際永續農場、契作有機小農（台灣五色番茄）、台灣職人肉品、高雄海港海鮮
- **合作案例**：Le Comptoir 康拓洋行（義大利酒）、BULGARI 寶格麗（香氛聯名）

### HAWKER 好客南洋餐廳
- **概念**：以新加坡「Hawker Center」為名，星馬南洋料理；定位「高雄獨具風格的異國料理餐廳首選」
- **開幕**：2023/6 剪綵（區域總經理羅嘉麒主持，邀高雄市觀光局/經發局/新聞局、酷航、新加坡旅遊局、海尼根等）
- **招牌**：星洲麥片蝦、海南雞飯、沙嗲烤串、肉骨茶、巴東牛肉、金沙魚皮、椰絲球
- **城市連結**：2026 響應高雄市府「日光海島生活節」，《南洋集錦巡禮》暢饗 $880/$1,080（命名克拉碼頭 Clarke Quay / 紅燈碼頭 Clifford Pier）
- **差異化**：酒店通路做星馬料理者極少，HAWKER 近乎獨佔

### 湛露 中餐廳
- **概念**：靈感源自《詩經·小雅》，2F，粵式為主融合上海菜，圓潤流線空間
- **時間軸**：酒店開業後即訂位熱烈（早於 SEEDS 開幕）
- 待補：菜單、主廚、定價（內部文件未見，可從官網/評論補）

### WA-RA 日式餐廳
- **概念**：5F，江戶時期漁夫料理為靈感，稻稈大火炙燒（稻草香），含割烹 Kappo + 主題酒吧
- 待補：主廚、omakase 價位、訂位資訊

### BL.T33 大廳酒吧
- **概念**：Bar + Lounge + Tea，1F；經典午茶、調酒師精選琴酒系列、擬真藝術甜點
- 待補：下午茶價位、主打調酒、活動

### Delicatesse 洲際烘焙坊
- **概念**：手工麵包、精緻甜點；酒店住房專案常以「不適用烘焙坊商品折抵」出現（具獨立商品線）
- 待補：明星商品、節慶禮盒、定價

> 湛露/WA-RA/BL.T33/Delicatesse 的內部資料較少，O5 複製前可：
> (1) 從官網餐廳頁 + Google Maps 補；(2) 若 Drive 另有菜單/brief 我可再讀。

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
