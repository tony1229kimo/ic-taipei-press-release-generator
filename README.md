# 臺北洲際酒店新聞稿產生器 (InterContinental Taipei Press Release Generator)

AI 驅動的新聞稿產生器，專為臺北洲際酒店公關團隊打造。基於 IHG 品牌標準、各餐廳/酒吧的定位策略，以及歷史新聞稿作為參考基底，自動產生符合品牌調性的繁體中文新聞稿。

🌐 **線上 Demo**: https://ic-tpe-press-gen.zeabur.app

## 功能特色

- **3 種語調類別** — 綜合新聞/即時、商業/職場/餐飲、生活/品牌/風格
- **16 個子類別群組、60+ 細項面向** — 可跨類別多選，讓新聞稿涵蓋多個面向
- **可自訂媒體聯繫人** — 每篇新聞稿可臨時覆蓋預設聯繫人
- **知識庫管理後台** — 上傳新的品牌標準 PDF/DOCX、重新索引、編輯品牌設定
- **即時串流輸出** — 使用 Claude API SSE 串流，一邊產生一邊顯示
- **SKILL.md 可攜式技能** — 讓任何 AI Agent 都能理解並沿用此系統

## 技術架構

| 元件 | 技術 |
|------|------|
| 前端 | React + Vite + TypeScript + Tailwind CSS + ShadCN/UI |
| 後端 | Express.js + TypeScript |
| AI 引擎 | Claude API (`@anthropic-ai/sdk`) + SSE 串流 |
| 文件萃取 | `mammoth` (DOCX) + `pdf-parse` (PDF) |
| 儲存 | 檔案式 JSON (無資料庫) |
| 部署 | Zeabur (Docker) |

## 本地開發

```bash
# 安裝依賴
npm install

# 啟動前後端（port 8080 前端、3001 後端）
npm run dev
```

需要在根目錄建立 `.env`:
```
ANTHROPIC_API_KEY=sk-ant-api03-...
```

## 生產部署

### Zeabur 部署流程
1. 在 Zeabur 建立專案，選擇「Deploy from GitHub」
2. 選擇此 repo
3. 設定環境變數：
   - `ANTHROPIC_API_KEY` — Anthropic API 金鑰
   - `PORT=8080` — 必要，Zeabur dedicated server 路由到 8080
4. 綁定網域（Networking 分頁）
5. 推送 commit 或點「重新部署」

### Build 指令
- **Build**: 由 Dockerfile 控制，但 Zeabur 會優先使用 `npm start`
- **Start**: `sh start.sh` — 這個 shell script 會在 runtime 處理 build + run

---

## 🎢 部署踩雷紀錄 (Deployment Troubleshooting Log)

這一段必須留著，因為解決過程非常痛苦，未來任何遷移/重建時可以直接參考。**16 個 commit、3 個小時**的 debug 才讓它在 Zeabur 上跑起來。

### 遇到的問題與解法

#### 🐛 Bug #1: Express 5.x 通配符路由崩潰（啟動即死）
**症狀**：Container 啟動後立刻崩潰，完全沒有任何 runtime log。

**原因**：Express 5.x 升級了 `path-to-regexp` 套件，**不再支援通配符路由**。原本的 SPA fallback 寫法會在 startup 直接拋出 `PathError: Missing parameter name at index 2: /*`：

```typescript
// ❌ Express 5.x 會炸
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});
```

**解法**：改用 **middleware + 手動檢查 path**（不使用任何路由 pattern）：

```typescript
// ✅ Express 5.x 可行
app.use(express.static(distPath, { index: 'index.html' }));
app.use(function spaFallback(req, res, next) {
  if (req.method !== 'GET') return next();
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(distPath, 'index.html'));
});
```

**感謝**：Zeabur AI 找到這個根本錯誤！

---

#### 🐛 Bug #2: Zeabur 忽略 Dockerfile CMD
**症狀**：自訂的 `CMD ["node", "/opt/server/dist/main.js"]` 完全沒生效，runtime 仍然用 `npm start`。

**原因**：即使 `planType: docker`，Zeabur 仍會優先執行 `package.json` 的 `start` script，**Dockerfile 的 CMD 被忽略**。

**解法**：所有啟動邏輯都要放在 `npm start` 裡，不能依賴 Dockerfile CMD。

---

#### 🐛 Bug #3: Docker layer cache 導致程式碼不更新
**症狀**：即使 commit SHA 是新的，runtime 錯誤 trace 顯示的還是舊版程式碼（line 35 有 `app.get('*')` 但本地早就改掉了）。

**解法**：**完全重新命名檔案結構**打破 cache：
- `server/` → `backend/`
- `index.ts` → `main.ts`
- 這樣所有 Docker layer hash 都被迫重新計算

---

#### 🐛 Bug #4: `tsx: not found`（devDependencies 問題）
**症狀**：`npm start` 執行 `tsx main.ts` 時 sh 找不到 tsx。

**原因**：`tsx` 原本是 `devDependencies`，但 Zeabur 在 production 模式下可能不安裝 devDeps；或 PATH 不包含 `./node_modules/.bin`。

**解法**：改為**預編譯** — 用 `tsc` 把 TypeScript 編譯成 JavaScript，然後用純 `node` 執行，完全不依賴 tsx。

---

#### 🐛 Bug #5: Build 產物在 runtime 消失（最弔詭的一個）
**症狀**：Dockerfile 裡 `RUN tsc ...` 成功產生 `backend/dist/main.js`，build verification 通過，但 runtime 進入 container 發現 **`backend/dist` 整個資料夾不存在**！image size 一致，但文件不見了。

**懷疑**：Zeabur 在 runtime 把源碼 mount overlay 到 `/app`，覆蓋掉 build 時生成的 `dist/`。

**嘗試過的解法（都失敗）**：
- ❌ 把 compiled 結果 cp 到 `/opt/server`（`/opt/server` 在 runtime 也不見）
- ❌ 設定 `NODE_PATH`
- ❌ 用絕對路徑 CMD
- ❌ 各種 PATH 和 ENV 組合

**最終可行解法**：在 **runtime（而非 build-time）執行 build**。寫一個 `start.sh` 讓它在容器啟動時：
1. 檢查 `node_modules` 存不存在，沒有就 `npm install`
2. 檢查 `dist/` 存不存在，沒有就 `npx vite build`
3. 檢查 `backend/dist/main.js` 存不存在，沒有就 `npx tsc -p backend/tsconfig.json`
4. 最後執行 `exec node backend/dist/main.js`

```bash
#!/bin/sh
set -e
if [ ! -d node_modules ]; then npm install --no-audit --no-fund; fi
if [ ! -f dist/index.html ]; then npx vite build; fi
if [ ! -f backend/dist/main.js ]; then npx tsc -p backend/tsconfig.json; fi
exec node backend/dist/main.js
```

搭配 `package.json`:
```json
{
  "scripts": {
    "start": "sh start.sh"
  }
}
```

**為什麼這個可行**：即使 Zeabur 對 `/app` 做 mount overlay，runtime 的 shell script 還是看得到最終的 mounted source，而在這個 mounted source 上執行 build 會成功，編譯產物會留在 mounted filesystem 裡。

---

#### 🐛 Bug #6: GitHub Push Protection 擋下 API Key
**症狀**：`git push` 時被 GitHub 拒絕，因為 commit 裡包含 Anthropic API Key。

**原因**：不小心把 `.env.deploy` 加進了 commit。

**解法**：
```bash
git rm --cached .env.deploy
echo "*.deploy" >> .gitignore
git commit --amend --no-edit
git push --force origin master
```

---

#### 🐛 Bug #7: Container 聽錯 Port
**症狀**：部署成功但網址回 502 Bad Gateway。

**原因**：Zeabur dedicated server 預設路由到 **port 8080**，但 Express server 監聽 3001。

**解法**：設定環境變數 `PORT=8080`，讓 Node.js 讀 `process.env.PORT`。同時 Express 要綁 `0.0.0.0` 而非 `localhost`：

```typescript
app.listen(Number(PORT), '0.0.0.0', () => { ... });
```

---

### 最終關鍵檔案

這些是讓部署成功不可或缺的檔案：

#### `start.sh`（最重要）
```bash
#!/bin/sh
set -e
echo "[startup] Build & Start Script"
if [ ! -d node_modules ]; then
  echo "[startup] Installing dependencies..."
  npm install --no-audit --no-fund
fi
if [ ! -f dist/index.html ]; then
  echo "[startup] Building frontend..."
  npx vite build
fi
if [ ! -f backend/dist/main.js ]; then
  echo "[startup] Compiling backend TypeScript..."
  npx tsc -p backend/tsconfig.json
fi
echo "[startup] Starting server..."
exec node backend/dist/main.js
```

#### `package.json` - 關鍵 scripts
```json
{
  "scripts": {
    "dev": "concurrently \"vite\" \"cd backend && npm run dev\"",
    "build": "vite build && tsc -p backend/tsconfig.json",
    "start": "sh start.sh"
  }
}
```

#### `backend/main.ts` - 關鍵程式碼
```typescript
// ✅ Express 5.x 可行的 SPA fallback
app.use(express.static(distPath, { index: 'index.html' }));
app.use(function spaFallback(req, res, next) {
  if (req.method !== 'GET') return next();
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(distPath, 'index.html'));
});

// ✅ 必須綁 0.0.0.0 給容器網路
const server = app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`[startup] Server listening on 0.0.0.0:${PORT}`);
});
```

#### `backend/tsconfig.json` - 避開 TS6 deprecation
```json
{
  "compilerOptions": {
    "target": "es2022",
    "module": "commonjs",
    "moduleResolution": "node",
    "ignoreDeprecations": "6.0",
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

---

### 關鍵教訓

1. **Zeabur 的 `npm start` 優先於 Dockerfile CMD** — 所有啟動邏輯都寫在 `npm start` 對應的 script 裡
2. **Express 5.x 不支援通配符路由** — 改用 middleware + 手動 path 檢查
3. **Runtime build 是最可靠的方案** — 當 build-time 產物在 runtime 消失時，直接在 runtime 做 build
4. **Docker cache 很狡詐** — 當你看到不可思議的錯誤時，考慮改檔名強迫 cache 失效
5. **記得綁 `0.0.0.0` 和 `process.env.PORT`** — 容器網路的基本要求
6. **Zeabur dedicated server 預設 port 是 8080** — 不是 3000 也不是 3001

---

## 專案結構

```
press-release-generator/
├── backend/                  # Express server (TypeScript)
│   ├── main.ts              # 主入口（不能用任何通配符路由！）
│   ├── routes/
│   │   ├── generate.ts      # SSE 串流生成端點
│   │   └── admin.ts         # 知識庫管理 API
│   ├── services/
│   │   ├── promptBuilder.ts # 5 層 Prompt 組裝（最核心）
│   │   ├── knowledgeBase.ts # 知識庫索引與搜尋
│   │   ├── documentExtractor.ts  # DOCX/PDF 萃取
│   │   └── generator.ts     # Claude API 整合
│   ├── data/                # JSON 儲存（索引、品牌標準、歷史）
│   └── tsconfig.json
├── src/                     # React frontend
│   ├── pages/
│   │   ├── GeneratorPage.tsx  # 新聞稿產生器主頁
│   │   ├── HistoryPage.tsx    # 歷史記錄
│   │   └── AdminPage.tsx      # 後台管理
│   ├── components/
│   └── api/client.ts        # API 客戶端 + SSE 串流
├── start.sh                 # 🔑 Runtime build + start 腳本
├── Dockerfile               # Zeabur 部署用
├── SKILL.md                 # 可攜式 AI Agent 技能定義
└── package.json
```

## 知識庫架構

- `backend/data/brand-standards.json` — IHG 品牌標準 + 臺北洲際酒店資訊（餐廳、酒吧、聯繫人）
- `backend/data/press-releases-index.json` — 歷史新聞稿索引（190+ 篇）
- `backend/data/generation-history.json` — 已產生新聞稿歷史記錄

## Prompt 組裝策略（5 層）

1. **品牌標準層** — IHG 品牌核心、個性、哲學、酒店資訊
2. **類別指引層** — 依選擇的類別載入對應的寫作風格
3. **Few-shot 範例層** — 從知識庫選出 2-3 篇最相關的歷史新聞稿
4. **使用者輸入層** — 主題、關鍵事實、多面向切角、媒體聯繫人等
5. **輸出格式層** — 標題格式、引用格式、結尾格式等

## Credits

- **Zeabur AI** — 協助找出 Express 5.x 通配符路由的根本錯誤
- **Claude Opus 4.6 (1M context)** — Co-authored 本專案的所有程式碼和 README
- **Tony Chen (@tony1229kimo)** — 臺北洲際酒店公關團隊

## License

Private — 僅供臺北洲際酒店內部使用
