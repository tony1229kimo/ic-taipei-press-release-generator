# Hotel News Radar 升級計畫 — 角色化戰情中心

> 狀態：方向已拍板，等開工
> 最後更新：2026-05-25
> 重要說明：實際開工會在 `tony1229kimo/hotel-news-radar` repo，本檔案放在產生器 repo 僅作為**規劃儲存處**（暫時的命令中心），方便回頭查看討論結果。

---

## 一、計畫定位與方向

**目標**：把 `hotel-news-radar` 從「酒店業新聞通用 dashboard」升級為「**酒店多角色戰情中心**」，每個關鍵職位都能看到對自己最有用的訊息並訂閱客製日報。

**為什麼角色化優先**：
- GM、公關、餐飲、客務、業務各自的決策維度差異極大
- 現在所有人看同一個 dashboard → 每個人都覺得「資訊太多、跟我有關的太少」
- 角色化能立刻讓每個職位都「願意打開雷達」
- 角色化後，廣度（加資料源）和深度（進階分析）才知道優先補哪一塊

**未來方向**（本計畫不做，但記錄下來）：
- 軸 A 廣度：加 Instagram / Threads / 小紅書 / 評論 / 訂房平台 / 榜單等資料源
- 軸 B 深度：主題生命週期、競品節奏、異常偵測、預測

---

## 二、五個角色與其需求

### 1. GM 總經理 — 戰略視角
| 關注 | 想做的決定 |
|------|---------|
| 全市場聲量、情感總覽 | 月度策略方向 |
| 自家 vs 競品總分排名 | 預算分配、人事 |
| 危機預警（負評暴增、競品大動作） | 應變、召開會議 |
| 重大事件（米其林、人事大異動、政策變動） | 戰略反應 |

**使用節奏**：每天 5 分鐘 / 每週深度看一次

### 2. 公關 / 行銷 — 內容視角
| 關注 | 想做的決定 |
|------|---------|
| 主題熱度、媒體覆蓋 | 寫稿題材選擇 |
| 競品發稿節奏與切角 | 發稿時機與差異化 |
| 媒體偏好圖譜（哪家媒體愛什麼） | 媒體投放、KOL 合作 |
| 自家稿件露出追蹤 | 媒體效益評估 |

**使用節奏**：每天

### 3. 餐飲總監 — 餐飲視角
| 關注 | 想做的決定 |
|------|---------|
| 各餐廳/酒吧的評論流（自家 + 對標競品） | 服務改善、菜單調整 |
| 競品 F&B 動作（新菜、活動、主廚） | 跟進 / 差異化 |
| 米其林、Tatler、500 Bowls、Asia's 50 Best 動態 | 餐廳定位調整 |
| 新興餐飲趨勢 | 活動企劃、主廚邀約 |

**使用節奏**：每天

### 4. 房務 / 客務 / GSM — 服務視角
| 關注 | 想做的決定 |
|------|---------|
| 評論主題抽取（自家 vs 競品） | 服務 SOP 修正 |
| 客訴熱點與重複問題 | 員工訓練、流程改善 |
| 訂房平台評分趨勢 | 客服策略 |
| 競品房價與優惠動態 | 定價、產品包裝 |

**使用節奏**：每天

### 5. 業務（MICE / 婚宴 / 企業）— 機會視角
| 關注 | 想做的決定 |
|------|---------|
| 婚禮 / 宴會趨勢 | 套餐設計、場地行銷 |
| 競品 MICE 案例（公司會議、發布會） | 業務提案參考 |
| 企業活動動態（產業簽約、發布會、論壇） | 客源開發 |
| 政府 / 法人活動公告、政策補助 | 提案機會 |

**使用節奏**：每週深度看一次 + 每日警示

---

## 三、角色化 Dashboard 設計

### 核心概念：同一個雷達、五個視角

底層資料、爬蟲、AI pipeline 完全共用，**只有最後一哩的呈現（filters + widgets + 日報模板）依角色不同**。

```
雷達底層（共用）
  ├── articles + insights + scoring
  ├── topics + sentiment + media value
  └── feeds + sources

       ↓ 角色化過濾 + 加權

   ┌─ GM Dashboard
   ├─ PR Dashboard
   ├─ F&B Dashboard
   ├─ Service Dashboard
   └─ Sales Dashboard
```

### Widget 庫（每個角色挑選組合）

| Widget | 給誰用 |
|--------|------|
| 全市場聲量趨勢 | GM, PR |
| 競品排名表 | GM, PR |
| 危機警報 Feed | GM, Service |
| 主題熱度雲 | PR |
| 媒體偏好雷達圖 | PR |
| 發稿機會卡 | PR |
| 餐廳評論摘要（按 outlet） | F&B, Service |
| 米其林 / 榜單變動 | F&B, GM |
| 客訴主題抽取 | Service |
| 訂房平台評分對比 | Service, GM |
| 競品房價熱力圖 | Service |
| 婚宴 / MICE 案例 Feed | Sales |
| 政府 / 法人活動公告 | Sales |
| 人事異動追蹤 | GM, Sales |

### 角色切換 UX

- 登入後預設帶到自己角色的 view
- 頂部下拉可切到其他角色（讓人能跨視角看）
- 每個角色 view 都有「客製」按鈕，可挑/排序 widget

---

## 四、訂閱式日報

每個角色 09:00（沿用現有 cron 時段）收到專屬日報 email：

| 角色 | 日報內容 |
|------|--------|
| GM | 3 件大事 + 1 警告 + 1 週趨勢 + 競品本日動態總覽 |
| PR | 機會清單（3 個） + 競品發稿摘要 + 媒體偏好提示 |
| F&B | 各餐廳評論摘要 + 競品 F&B 動作 + 榜單變動 |
| Service | 自家服務分數 + 客訴主題 + 房價對比 + 競品評分 |
| Sales | 商機線索 + 競品案例 + 政府活動 + 婚宴趨勢 |

**進階**：每個人可自己訂閱額外主題（例如「凡是提到米其林、永續、Pier No.5 都推給我」）。

---

## 五、雷達端要新增的技術

現有雷達架構：Next.js 15 + SQLite + Drizzle + Claude Haiku/Opus。新增：

### 5.1 使用者與角色系統
```sql
users (id, email, name, role[gm|pr|fnb|service|sales], hotel[taipei|kaohsiung], created_at)
user_subscriptions (user_id, topic_keywords[], frequency)
user_dashboard_configs (user_id, widgets jsonb)
```

- 登入：先用簡單 email + magic link（之後可接 IHG SSO）
- 權限：角色 = 預設 dashboard + 預設訂閱

### 5.2 角色化 Dashboard 引擎
```typescript
// src/lib/dashboards.ts
export const ROLE_DASHBOARDS: Record<Role, DashboardConfig> = {
  gm:      { widgets: ['voice-trend', 'competitor-rank', 'alerts', 'top-events'] },
  pr:      { widgets: ['opportunities', 'topic-cloud', 'media-prefs', 'press-feed'] },
  fnb:     { widgets: ['outlet-reviews', 'competitor-fnb', 'rankings'] },
  service: { widgets: ['review-themes', 'complaints', 'rate-trend'] },
  sales:   { widgets: ['biz-leads', 'mice-cases', 'gov-events'] },
};
```

### 5.3 Widget 元件庫
- 共用 React 元件，吃同一個 `articles + insights` 資料
- 每個 widget 有自己的 query + render
- 之後加廣度／深度時，新 widget 直接掛進來

### 5.4 訂閱日報模板
- 沿用現有雙語 email 基礎
- 每個角色一套模板
- 加上「客製主題」段落

### 5.5 警報引擎（給 GM、Service 用）
```
偵測規則範例：
- 自家評論 1 小時內出現 ≥ 3 則負評 → 推 Service
- 競品聲量 24 小時 +200% → 推 GM、PR
- 自家 article 被 ≥ 5 家媒體轉載 → 推 GM、PR（正向 alert）
- 米其林指南有更新 → 推 F&B、GM
```

---

## 六、開發里程碑

### M1（5 天）：使用者系統 + 角色框架
- [ ] DB schema：`users`, `user_subscriptions`, `user_dashboard_configs`
- [ ] 簡單 email magic-link 登入
- [ ] Role 設定 UI（admin 可指派）
- [ ] 角色切換頂部 UI
- [ ] Widget framework（不實作具體 widget，先架好殼）

### M2（5 天）：5 個角色預設 Dashboard
- [ ] 拆解現有 dashboard 為可組合 widgets
- [ ] 實作 5 角色預設 view（每角色 4–5 個 widget）
- [ ] 「客製」按鈕：拖拉排序、新增/移除 widget

### M3（4 天）：訂閱式日報
- [ ] 沿用現有 cron 改為「依角色」產生 email
- [ ] 5 套 email 模板
- [ ] 個人化主題訂閱 UI

### M4（3 天）：警報引擎
- [ ] 規則表（DB 可編輯）
- [ ] Cron 每 30 分鐘掃 articles 比對規則
- [ ] Email / 站內通知

### M5（後續）：權限細化 + IHG SSO + 雙酒店切換
- [ ] 高雄 / 台北 切換（部分 widget 已有，全面化）
- [ ] 跨角色互動（公關 ping 餐飲「你看這機會」）

**M1 + M2 上線就有立刻可用的角色化體驗（約 10 天）。**

---

## 七、雷達端 session 開工指令

打開針對 `hotel-news-radar` repo 的新 Claude session，貼這段：

```
我們要把 hotel-news-radar 從「通用 dashboard」升級成「角色化戰情中心」。
完整計畫文件：產生器 repo 的 docs/radar-upgrade-plan.md（內容我可以貼給你）。

優先做 M1：使用者系統 + 角色框架。

具體第一步：
1. 設計 DB schema（users、user_subscriptions、user_dashboard_configs）
2. 加 Drizzle migration
3. 實作 magic-link email login（用 Resend 或 Zeabur 內建 SMTP）
4. 加 admin-only 的角色指派 UI（在 /admin 下）
5. 在現有 dashboard 頂部加角色切換下拉

角色：gm | pr | fnb | service | sales
酒店：taipei | kaohsiung

先做這五個檔案的草稿，跟我討論後再實作：
- src/lib/schema.ts（加 users 等表）
- src/lib/auth.ts（magic link）
- src/app/api/auth/route.ts
- src/app/admin/users/page.tsx
- src/components/RoleSwitcher.tsx

不需要重做爬蟲、AI pipeline、現有 widget，那些都留著。
```

---

## 八、本機環境準備

- [x] Supabase 帳號已開好（暫時用不到，雷達還是 SQLite）
- [x] Apify 帳號已開好（後續做廣度時才用）
- [ ] hotel-news-radar 本機可跑（`npm run dev`）
- [ ] 確認 Zeabur 上雷達使用的資料庫位置（SQLite 檔在哪、有沒有掛 volume）
- [ ] 想好 5 個角色第一批使用者名單（每角色至少 1 個人 dogfood）
