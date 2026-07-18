# Hotel News Radar 升級任務清單

> 配合 `radar-upgrade-plan.md` 使用。這份是「可執行的拆解」，每個任務都能獨立完成。
> 進度標記：⬜ pending · 🔄 in progress · ✅ done · ⏭️ skip

---

## 使用方式

1. 開 hotel-news-radar repo 的 Claude session
2. 看下方總覽表，挑下一個 ⬜ 任務
3. 把該任務的「雷達 session 指令」整段複製貼到 Claude
4. 完成後回本文件把該任務改 ✅，commit & push
5. 重複

---

## 總覽

| ID | 任務 | 狀態 | 估時 | 依賴 |
|----|------|------|------|------|
| **M1 使用者系統 + 角色框架** | | | | |
| M1.1 | DB schema：users / subscriptions / dashboard_configs | ⬜ | 30m | — |
| M1.2 | Drizzle migration 產生 + 跑 | ⬜ | 20m | M1.1 |
| M1.3 | 申請 Resend 帳號 + 設環境變數 | ⬜ | 15m | — |
| M1.4 | Magic-link auth lib（token、寄信、驗證） | ⬜ | 1h | M1.2, M1.3 |
| M1.5 | Auth API routes（request、verify、logout） | ⬜ | 45m | M1.4 |
| M1.6 | `/login` 頁 UI | ⬜ | 30m | M1.5 |
| M1.7 | Session middleware（cookie、路由保護） | ⬜ | 45m | M1.5 |
| M1.8 | `/admin/users` 使用者/角色管理頁 | ⬜ | 1h | M1.7 |
| M1.9 | 頂部 RoleSwitcher 元件 | ⬜ | 30m | M1.7 |
| M1.10 | Widget framework 殼（不含具體 widget） | ⬜ | 1h | M1.7 |
| **M2 五角色預設 Dashboard** | | | | |
| M2.1 | 拆現有 dashboard → 共用 widget interface | ⬜ | 1h | M1.10 |
| M2.2 | Widget loader + ROLE_DASHBOARDS config | ⬜ | 45m | M2.1 |
| M2.3 | GM widgets（聲量、排名、警報、大事）| ⬜ | 2h | M2.2 |
| M2.4 | PR widgets（機會、主題、媒體偏好、稿件） | ⬜ | 2h | M2.2 |
| M2.5 | F&B widgets（評論、競品 F&B、榜單） | ⬜ | 2h | M2.2 |
| M2.6 | Service widgets（評論主題、客訴、房價） | ⬜ | 2h | M2.2 |
| M2.7 | Sales widgets（商機、MICE、政府活動） | ⬜ | 1.5h | M2.2 |
| M2.8 | 客製化（拖拉、新增/移除 widget） | ⬜ | 2h | M2.3-2.7 |
| **M3 訂閱式日報** | | | | |
| M3.1 | 抽現有 email 為 base template | ⬜ | 45m | — |
| M3.2 | GM 日報模板 | ⬜ | 1h | M3.1 |
| M3.3 | PR 日報模板 | ⬜ | 1h | M3.1 |
| M3.4 | F&B 日報模板 | ⬜ | 1h | M3.1 |
| M3.5 | Service 日報模板 | ⬜ | 1h | M3.1 |
| M3.6 | Sales 日報模板 | ⬜ | 1h | M3.1 |
| M3.7 | 個人主題訂閱 UI | ⬜ | 1.5h | M1.7 |
| M3.8 | Cron 改為依角色派發 | ⬜ | 1h | M3.2-3.6 |
| **M4 警報引擎** | | | | |
| M4.1 | 警報規則 schema + 預設規則 seed | ⬜ | 30m | M1.2 |
| M4.2 | `/admin/alerts` 規則編輯頁 | ⬜ | 1.5h | M4.1 |
| M4.3 | Cron 每 30 分掃 articles + 觸發 | ⬜ | 1.5h | M4.1 |
| M4.4 | 通知派發（email + 站內提示） | ⬜ | 1h | M4.3 |

---

## 詳細任務指令

### M1.1 — DB Schema [⬜]

**完成標準**：`src/lib/schema.ts` 新增 3 個 export，`npm run build` 通過

**雷達 session 指令**：
```
在 src/lib/schema.ts 加三個 Drizzle table：

users:
  id (text pk, uuid)
  email (text unique not null)
  name (text not null)
  role (text, check in 'gm'|'pr'|'fnb'|'service'|'sales')
  hotel (text, check in 'taipei'|'kaohsiung')
  createdAt (integer timestamp, default now)

user_subscriptions:
  id (text pk)
  userId (text fk → users.id, cascade delete)
  topicKeywords (text[] 或 jsonb)
  frequency (text, 'daily'|'weekly', default 'daily')

user_dashboard_configs:
  userId (text pk fk → users.id)
  widgets (jsonb，存 widget ID 陣列與位置)
  updatedAt (integer timestamp)

加 unique index on users.email、index on user_subscriptions.userId。
先給我 schema diff，我看過再合併。
```

---

### M1.2 — Drizzle Migration [⬜]

**完成標準**：`drizzle/` 多一份 migration 檔，跑 `db:migrate` 後 SQLite 多三張表

**雷達 session 指令**：
```
根據剛剛 M1.1 的 schema，跑 drizzle-kit generate 產生 migration，
檢查 SQL 看起來合理（特別注意 cascade delete 和 indexes），
然後跑 db:migrate。確認本機 SQLite 多了三張表。

如果現有 db:migrate 還沒有 script，幫我加到 package.json。
```

---

### M1.3 — Resend 帳號 + 環境變數 [⬜]

**這步要本人操作（不是 Claude 做）**：

1. 去 https://resend.com 註冊（GitHub login）
2. 建立 API key（命名為 hotel-news-radar）
3. 驗證寄件網域（先用 resend 預設 onboarding 網域即可）
4. 把 key 加到本機 `.env`：`RESEND_API_KEY=re_...`
5. 把 key 加到 Zeabur 環境變數

完成後告訴 Claude「M1.3 完成」就好。

---

### M1.4 — Magic-link Auth Lib [⬜]

**完成標準**：`src/lib/auth.ts` 有 `sendMagicLink(email)` 和 `verifyToken(token)`，能寄信、驗 token、回傳 user

**雷達 session 指令**：
```
在 src/lib/auth.ts 實作 magic-link auth：

1. sendMagicLink(email: string): Promise<void>
   - 用 nanoid 產 token（30 字元）
   - 存進新增的 auth_tokens 表（email, token, expiresAt = now + 15min, used: false）
   - 用 Resend SDK 寄信，內容含
     `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/verify?token=${token}`
   - 信件主題：「Hotel News Radar 登入連結」
   - 中英雙語內容

2. verifyToken(token: string): Promise<{ userId: string } | null>
   - 查 auth_tokens：未過期、未使用
   - 標記 used = true
   - 從 email 查 users 拿 userId（若不存在則 return null，不自動建立）
   - return { userId }

請順便補上 auth_tokens 的 Drizzle schema 與 migration。
```

---

### M1.5 — Auth API Routes [⬜]

**完成標準**：能 POST /api/auth/request 收到信，點信中連結後設好 session cookie

**雷達 session 指令**：
```
在 src/app/api 加三個 route：

POST /api/auth/request
  body: { email }
  → 呼叫 sendMagicLink(email)
  → 200 { sent: true }（不洩漏 email 是否存在）

GET /api/auth/verify?token=...
  → 呼叫 verifyToken
  → 成功：設 cookie `radar_session`（HttpOnly, Secure, SameSite=Lax, 7 天）
         cookie 值用 jose 或 iron-session 簽 userId
         redirect 到 /
  → 失敗：redirect 到 /login?error=invalid

POST /api/auth/logout
  → 清 cookie
  → 200

session 解碼用同一支 lib（src/lib/session.ts），請一併建立。
```

---

### M1.6 — `/login` 頁 [⬜]

**完成標準**：訪客打開 /login 看到輸入 email 表單，送出後顯示「請收信」

**雷達 session 指令**：
```
建立 src/app/login/page.tsx：

UI：
  - 中央卡片
  - 標題「Hotel News Radar」
  - 輸入 email 框 + 「寄送登入連結」按鈕
  - 送出後顯示「已寄出登入信到 xxx@xxx，請收信點連結」
  - 錯誤訊息區（從 ?error= 讀）

使用現有的 Tailwind + 既有風格（看 src/app/page.tsx 的 className 模式）。
不需要動 layout.tsx。
```

---

### M1.7 — Session Middleware [⬜]

**完成標準**：未登入訪客逛 / 會被 redirect 去 /login；登入後 layout 拿得到 user

**雷達 session 指令**：
```
1. 建 src/middleware.ts：
   - 檢查 radar_session cookie
   - 未登入：若 path 不是 /login 或 /api/auth/*，redirect 去 /login
   - 已登入：path === '/login' 則 redirect 去 /

2. 建 src/lib/session.ts 的 server-side helper：
   - getCurrentUser(): Promise<User | null>（讀 cookie + DB 查 user）
   - requireUser(): Promise<User>（沒登入就 throw）

3. 改 src/app/layout.tsx 把 currentUser 透過 React Context 提供給子元件
   （或用 server component pattern 直接傳）
```

---

### M1.8 — Admin 使用者管理頁 [⬜]

**完成標準**：role === 'gm' 或新增的 'admin' 可以看到 /admin/users，能新增使用者、改角色

**雷達 session 指令**：
```
建 src/app/admin/users/page.tsx：

權限：只有 role='gm' 或新增 admin role 可進；其他人 redirect 回 /

功能：
  - 列出所有 users（表格：email, name, role, hotel, createdAt）
  - 新增使用者按鈕 → modal 表單（email, name, role, hotel）→ POST /api/admin/users
  - 每列有 edit role 下拉 → PATCH /api/admin/users/:id
  - 刪除按鈕 → DELETE（要二次確認）

順手把 'admin' 加進 role enum（schema 改、migration 補）。
新建使用者後不寄歡迎信，使用者下次自己用 magic-link 登入。
```

---

### M1.9 — 頂部 RoleSwitcher 元件 [⬜]

**完成標準**：登入後右上角看到目前角色下拉，可切換到其他角色（前端切視角，不改 DB）

**雷達 session 指令**：
```
建 src/components/RoleSwitcher.tsx：

- 顯示當前 user 的角色標籤（中文：總經理 / 公關 / 餐飲 / 服務 / 業務）
- 點開下拉可選其他角色 → 存到 localStorage 鍵 `viewAsRole`
- 切換後觸發頁面 refresh（之後 dashboard 會讀這個 key 渲染對應視角）
- 旁邊一個「重設為我的角色」按鈕

掛到 layout 的右上角（在現有 header 找位置）。
```

---

### M1.10 — Widget Framework 殼 [⬜]

**完成標準**：`src/lib/widgets/` 有 framework，能依 viewAsRole 載入空 widget 元件

**雷達 session 指令**：
```
建立 widget framework：

1. src/lib/widgets/types.ts
   - WidgetId: 'voice-trend' | 'competitor-rank' | 'alerts' | ... （列出所有 14 個）
   - WidgetMeta: { id, title, roles: Role[], component: ComponentType }

2. src/lib/widgets/registry.ts
   - WIDGET_REGISTRY: Record<WidgetId, WidgetMeta>
   - 暫時每個 widget 都用 PlaceholderWidget（顯示「Widget: 名稱（待實作）」）

3. src/lib/dashboards.ts
   - ROLE_DASHBOARDS: Record<Role, WidgetId[]>
   - 依照 plan 第三節「Widget 庫」表填好五個角色預設組合

4. 改 src/app/page.tsx 為 dashboard 引擎：
   - 讀 currentUser + localStorage 的 viewAsRole
   - 依角色 + 個人 config（M2.8 才做）渲染 widgets
   - 暫時用 grid 佈局

確認 5 個角色切換時看到不同 placeholder 集合即可。
```

---

### M2.1 — 拆現有 dashboard → 共用 widget interface [⬜]

**雷達 session 指令**：
```
看現在 src/app/page.tsx 已實作的 UI 區塊，把每個區塊抽成一個 widget：
- src/components/widgets/VoiceTrendWidget.tsx
- src/components/widgets/CompetitorRankWidget.tsx
- 等等

每個 widget 都實作介面：
interface WidgetProps { hotel: 'taipei' | 'kaohsiung'; days?: number }
export default function FooWidget(props: WidgetProps) { ... }

把資料抓取邏輯（fetch articles、aggregate）也搬進各 widget 內部（或 hooks）。
原本的 page.tsx 留作 fallback，新 dashboard 引擎暫時並行。
```

---

### M2.2 — Widget loader + ROLE_DASHBOARDS [⬜]

**雷達 session 指令**：
```
把 M1.10 的 PlaceholderWidget 替換成 M2.1 抽出的真實 widget：

1. WIDGET_REGISTRY 更新成真的 component imports
2. ROLE_DASHBOARDS 確認每個角色都至少有 3-4 個可用 widget
3. dashboard 引擎處理 widget 載入失敗（顯示錯誤卡而不是整頁炸）

確認用不同角色登入會看到不同的 widget 組合。
```

---

### M2.3–M2.7 — 各角色補齊 widgets [⬜]

每個任務都採同樣模式：

**雷達 session 指令模板**：
```
依 docs/radar-upgrade-plan.md 第三節，補齊 [角色] 的所有 widget：
- [列出該角色 widget 名稱]

每個 widget 的資料需求：
[從 plan 文件對應段落抄過來]

如果現有 articles + insights 表資料不足以做某個 widget（例如 Sales 的「政府活動」
需要新資料源），先做一個「Coming Soon」placeholder，把這個 gap 列在
docs/radar-data-gaps.md 給未來補。
```

---

### M2.8 — 客製化 [⬜]

**雷達 session 指令**：
```
建 src/components/DashboardCustomizer.tsx：

- 設定按鈕（齒輪 icon）打開 modal
- modal 內：
  - 已加入 widgets 清單（可拖拉排序、移除）
  - 可加入 widgets 清單（這個角色相關但沒在當前 view 的）
- 拖拉用 @dnd-kit/sortable
- 儲存：PATCH /api/user/dashboard-config（更新 user_dashboard_configs）
- dashboard 引擎優先讀 user config，沒設就用 ROLE_DASHBOARDS 預設
```

---

### M3.1 — 抽 email base template [⬜]

**雷達 session 指令**：
```
看現有 email 模板（找 src/lib/email* 或 src/lib/enrich.ts 相關），
抽出共用的 header / footer / 區塊樣式為 src/lib/email/base.ts：

- BaseLayout: 包頭尾 + IHG 風格
- Section: 標題 + 內容
- ArticleCard: 統一的文章呈現
- Footer with unsubscribe link

之後 5 個角色模板都組合這些區塊。
```

---

### M3.2 — M3.6 各角色日報 [⬜]

每個採同樣模式：

**雷達 session 指令模板**：
```
建 src/lib/email/templates/[role]-daily.ts，產出該角色的日報 HTML：

內容依 docs/radar-upgrade-plan.md 第四節對應角色欄位：
[抄過來]

資料來源：直接呼叫 M2 寫好的 widget 資料層（複用，不重寫 query）。
回傳 { subject, html, text }。
```

---

### M3.7 — 個人主題訂閱 UI [⬜]

**雷達 session 指令**：
```
建 src/app/settings/subscriptions/page.tsx：

- 顯示目前訂閱的 topicKeywords（chips，可刪）
- 加入新 keyword 輸入框
- 頻率選擇（daily / weekly）
- 儲存 → PATCH /api/user/subscriptions

預設值：建帳號時不自動加任何 keyword，全靠角色決定。
```

---

### M3.8 — Cron 角色化派發 [⬜]

**雷達 session 指令**：
```
改現有 cron job（09:00 那支）：

- 抓 active users
- 依 user.role 呼叫對應 template
- 若有訂閱 topicKeywords，把當天命中該 keyword 的文章另起一段 append
- 用 Resend 寄送

加錯誤處理：單一使用者寄失敗不影響其他人。
記錄寄送狀況進新表 email_sends（userId, sentAt, status, errorMessage）。
```

---

### M4.1 — 警報規則 schema + seed [⬜]

**雷達 session 指令**：
```
schema：
alert_rules:
  id (pk)
  name (text)
  description (text)
  enabled (bool)
  condition (jsonb)  // { type: 'voice_spike', threshold: 200, window: '24h', ... }
  notify_roles (text[]) // 哪些角色要收
  cooldown_minutes (int) // 同規則多久不重複觸發

加 migration + seed 4 個預設規則（plan 第五節 5.5 警報引擎舉的範例）。
```

---

### M4.2 — `/admin/alerts` 規則編輯頁 [⬜]

**雷達 session 指令**：
```
建 admin 規則編輯頁：

- 列表展示所有 alert_rules（啟用狀態、名稱、最近觸發）
- 編輯 modal：condition 用結構化表單（不直接編 jsonb）
  - condition.type 下拉（voice_spike / negative_burst / media_pickup / list_update）
  - 對應的 threshold / window 動態欄位
- 啟用/停用開關
- 測試按鈕：在當下資料模擬執行（不真的寄通知）
```

---

### M4.3 — Cron 掃描比對 [⬜]

**雷達 session 指令**：
```
建 src/app/api/cron/check-alerts/route.ts（用 Zeabur cron 每 30 分鐘呼叫）：

對每條 enabled rule：
1. 查 cooldown：上次觸發在 cooldown 內就跳過
2. 依 condition.type 跑對應 query：
   - voice_spike: 比較最近 X 小時聲量 vs 前期，超過閾值觸發
   - negative_burst: 自家文章 sentiment < threshold 在 window 內 count >= X
   - media_pickup: 自家發稿被 >= X 家不同媒體轉載
   - list_update: 米其林/Tatler 等榜單 article 有新內容
3. 觸發 → 寫 alert_events 表 + 呼叫 M4.4 派發

別把 query 邏輯寫在 route 裡，每個 condition.type 一個獨立函式
（src/lib/alerts/conditions/*.ts）方便加新規則。
```

---

### M4.4 — 通知派發 [⬜]

**雷達 session 指令**：
```
alert event 觸發後：

1. Email：用 Resend 寄給所有 role 在 notify_roles 內的 active users
   模板：簡短（標題 + 觸發原因 + 連結到 dashboard 對應 widget）

2. 站內提示：建 notifications 表（userId, alertEventId, readAt）
   layout 右上角加個鈴鐺，未讀數即時顯示
   點開列表，點單筆 → mark read + 連結到 dashboard

避免轟炸：同 user 30 分鐘內 ≥ 5 個 alert 自動 batch 成一封信。
```

---

## 進度紀錄

每完成一個任務，請：
1. 把上面 ⬜ 改 ✅
2. 加一行到下方紀錄
3. commit & push（commit 訊息：`feat(radar): complete M1.X — [task name]`）

| 日期 | 任務 | 備註 |
|------|------|------|
| | | |
