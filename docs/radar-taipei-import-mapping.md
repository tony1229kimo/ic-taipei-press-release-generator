# 台北 F&B 定位表 → outlets 表 匯入對照
# InterContinental_Taipei_F&B_Positioning.xlsx → `outlets` import mapping

> 用途：台北擴充時，把團隊既有的 `InterContinental_Taipei_F&B_Positioning.xlsx`
> 直接灌進 `outlets` 表（自家 outlet 策略檔案 + 競品），免手 key。
> 雷達 session 可據此寫 import script（xlsx → JSON → DB）。

---

## 1. xlsx 分頁結構（4 區塊）

| xlsx 區塊 | 灌到哪 |
|-----------|--------|
| F&B Positioning Rank | 自家 outlet（is_self=1）的策略欄位 |
| SWOT | 自家 outlet 的 `swot` JSON |
| Competitive Landscape | 競品列（is_self=0） |
| Social Rate | 競品列的社群欄位（merge by 競品名） |

---

## 2. 欄位對照 / Column Mapping

### F&B Positioning Rank → 自家 outlet
| xlsx 欄 | outlets 欄 |
|---------|-----------|
| Outlet 餐廳 | name_zh / name_en |
| Market Tier 市場層級 | market_tier |
| Core Positioning 核心定位 | core_positioning |
| Portfolio Role 組合角色 | portfolio_role |
| Our Key Advantages | key_advantages |
| Market Gap Opportunity | market_gap |
| Strategic Direction | strategic_direction |
| (Brand Impact 欄) | 併入 key_advantages 或另存 meta |

### SWOT → 自家 outlet.swot (JSON)
| xlsx 欄 | swot key |
|---------|---------|
| Strengths | s |
| Weaknesses | w |
| Opportunities | o |
| Threats | t |
> 中英以「｜」分隔，import 時保留雙語整串即可。

### Competitive Landscape → 競品列
| xlsx 欄 | outlets 欄 |
|---------|-----------|
| Our Outlet | parent_outlet_id（對應自家 outlet） |
| Competitor | name_zh / name_en |
| Menu | source_urls.menu |
| Cuisine Type | cuisine_type |
| Lunch Price (NTD) | lunch_price |
| Dinner Price (NTD) | dinner_price |
| Wine / Beverage (NTD) | beverage_price |
| Private Rooms Available | private_rooms (Yes→1) |
| Market Positioning | market_positioning |
| Business Strength | business_strength |
| Brand Presence | brand_presence |
| Threat Level | threat_level |
| Threat Reason | threat_reason |
| Google Rating | google_rating + google_review_count（"4.8 (219)" 拆兩欄） |

### Social Rate → 競品列（by Competitor 名 merge）
| xlsx 欄 | outlets 欄 |
|---------|-----------|
| Google Rating | google_rating / google_review_count |
| IG Followers | ig_followers |
| FB | fb |
| Reservation System | reservation_system |

---

## 3. 台北 9 間自家 outlet（import 後應產生）

| Outlet | Portfolio Role | 核心定位 |
|--------|---------------|---------|
| DOSA | Brand Halo | 韓式 omakase 米其林背景，台北首創韓式精緻 |
| Akira Back | Destination Driver | 名廚現代日式，話題與流量引擎 |
| Rough Cuts (Grill) | Margin Powerhouse | 現代奢華牛排，商務/慶祝 |
| Chinese Restaurant | Prestige Occasion | 高端現代中餐，商務/家庭宴請 |
| 5F All Day Dining (Buffet) | Volume + Occasion Anchor | 符合台灣偏好的高端自助餐 |
| The Thea (Lobby Lounge) | Brand Atmosphere Anchor | 植感下午茶，優雅日間社交 |
| Chinese Restaurant Bar | Differentiation Concept | 穀物與亞洲元素茶調酒 |
| Steakhouse Bar | Revenue Multiplier | 經典調酒與威士忌 |
| NTD (Italian Eatery) | Volume Driver | 高端休閒義式 |

> 注意：台北 outlet 與高雄 6 間完全不同。台北競品名單已在 xlsx 內（DOSA→Inita/EIKA/Ad Astra/MIZUE；
> Rough Cuts→A Cut/教父/Morton's/Lawry's；中餐→頤宮/雅閣/晶華軒/榕居；
> Buffet→饗饗/旭集/饗A Joy/島語/栢麗廳；Lobby→青隅/WOOBAR/Plume…），import 時一併建檔。

---

## 4. 解析注意事項 / Parsing Notes

- Google Rating 欄格式 `"4.8 (219)"` → rating=4.8, review_count=219，用 regex 拆。
- 部分競品 IG/FB 欄寫的是「母酒店帳號名」（如 "Mandarin Oriental Taipei"）而非數字，
  import 時存原字串到 ig_followers/fb，後續再由雷達補實際數字。
- threat_level 在台北表是人工填的；高雄競品則由 6 維評分自動換算（兩者並存無妨，
  import 來的存原值，新算的覆蓋或另存 match_total）。
- xlsx 開頭有些 emoji/亂碼（如 ð），import 時 strip 掉。

---

## 5. 雷達 session 用法

O5（台北擴充）時跟 Claude 說：
```
依 docs/radar-taipei-import-mapping.md，寫一支 import script：
讀 InterContinental_Taipei_F&B_Positioning.xlsx（我會提供檔案或匯出的 CSV），
依對照表灌進 outlets 表（9 間自家 + 各競品），自家存策略+SWOT、競品存 landscape+social 欄位。
Google Rating 記得拆 rating/review_count。
```
