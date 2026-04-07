import { loadBrandStandards, selectFewShotExamples, type BrandStandards } from './knowledgeBase';

export interface MediaContact {
  name: string;
  title: string;
  email: string;
  phone: string;
}

export interface GenerationInput {
  category: 'general' | 'business' | 'lifestyle';
  topic: string;
  subCategory: string;
  angles: string[];  // Multi-dimensional angles for richer coverage
  keyFacts: string;
  eventDate: string;
  pricing: string;
  venue: string;
  includeGmQuote: boolean;
  gmQuoteContext: string;
  toneLevel: number; // 1-5, 1=very formal, 5=very storytelling
  additionalNotes: string;
  mediaContacts: MediaContact[];
}

function buildBrandContext(bs: BrandStandards): string {
  const restaurantDetails = bs.hotelInfo.restaurants.map(r =>
    `- **${r.name}**（${r.cuisine}）— ${r.positioning}`
  ).join('\n');

  const barDetails = (bs.hotelInfo.bars || []).map(b =>
    `- **${b.name}**（${b.concept}）— ${b.positioning}`
  ).join('\n');

  return `你是${bs.hotelInfo.name}（${bs.hotelInfo.nameEn}）的專業新聞稿撰寫者。

## 品牌核心
- 品牌宗旨：${bs.brand.purpose}
- 品牌承諾：${bs.brand.promise}
- 品牌定位：${bs.brand.proposition}

## 品牌個性
- ${bs.brand.personality.thoughtful}
- ${bs.brand.personality.cultured}
- ${bs.brand.personality.remarkable}

## 品牌差異化
- ${bs.brand.differentiators.insiderExpertise}
- ${bs.brand.differentiators.intentionalFlexibility}
- ${bs.brand.differentiators.incredibleOccasions}

## 品牌哲學
- 設計策略：${bs.brand.designStrategy}
- 服務哲學：${bs.brand.servicePhilosophy}
- 餐飲哲學：${bs.brand.fbPhilosophy}
- 目標客群：${bs.brand.targetGuest}

## 酒店資訊
- 酒店名稱：${bs.hotelInfo.name}（${bs.hotelInfo.nameEn}）
- 地址：${bs.hotelInfo.address}
${bs.hotelInfo.phone ? `- 電話：${bs.hotelInfo.phone}` : ''}
${bs.hotelInfo.gmName ? `- 總經理：${bs.hotelInfo.gmName}` : ''}

## 餐廳定位與特色
${restaurantDetails}

${barDetails ? `## 酒吧定位與特色\n${barDetails}` : ''}

## 寫作原則
1. 使用繁體中文撰寫
2. 專有名詞保留英文（如品牌名、餐廳名）
3. 融入品牌語彙：「非凡」「精彩」「啟發」「探索」「文化」等
4. 平衡事實數據與感性描述
5. 展現全球視野與在地知識的結合
6. 引用時使用「」格式
7. 撰寫餐廳相關新聞稿時，務必參考該餐廳的定位與核心概念
${bs.customNotes ? `\n## 額外備註\n${bs.customNotes}` : ''}`;
}

function getCategoryInstructions(category: string, toneLevel: number): string {
  const toneDesc = toneLevel <= 2 ? '正式、權威' : toneLevel <= 3 ? '專業、溫和' : '感性、故事性';

  switch (category) {
    case 'general':
      return `## 新聞稿類型：綜合新聞 / 即時新聞
### 寫作風格
- 語調：事實導向、新聞通訊社風格、${toneDesc}
- 結構：倒金字塔式（最重要的資訊在最前面）
- 開頭段落：5W1H（何人、何事、何時、何地、為何、如何）的精煉摘要
- 情感語言：克制使用，以數據和事實為主
- 建議字數：600-800字

### 結構要求
1. 新聞標題（一行，有力且資訊密集）
2. 副標題（補充說明，可省略）
3. 第一段：核心事實摘要（5W1H）
4. 第二段：重要細節與背景
5. 第三段：相關數據或引言
6. 第四段：展望或後續發展
7. 聯繫資訊`;

    case 'business':
      return `## 新聞稿類型：商業 / 職場 / 餐飲
### 寫作風格
- 語調：專業、產業洞察力、${toneDesc}
- 結構：問題/機會 → 酒店的解決方案 → 細節 → 引言
- 開頭段落：以產業趨勢或商業機會切入
- 情感語言：適度使用，強調商業價值與產業意義
- 建議字數：800-1000字

### 結構要求
1. 新聞標題（凸顯商業價值或產業趨勢）
2. 副標題（具體成果或亮點）
3. 第一段：產業脈絡與酒店定位
4. 第二段：核心內容與差異化特色
5. 第三段：具體細節（菜單/方案/合作內容）
6. 第四段：高層引言（總經理或餐飲總監觀點）
7. 第五段：實用資訊（價格/預約/時間）
8. 酒店簡介 & 聯繫資訊`;

    case 'lifestyle':
      return `## 新聞稿類型：生活 / 品牌 / 風格
### 寫作風格
- 語調：感性、沉浸式敘事、${toneDesc}
- 結構：氛圍開場 → 主題旅程 → 體驗細節 → 生活態度邀請
- 開頭段落：場景設定，營造畫面感
- 情感語言：豐富使用，喚起視覺、味覺、觸覺等感官
- 建議字數：1000-1200字

### 結構要求
1. 新聞標題（詩意或故事性，引發好奇）
2. 副標題（補充體驗核心）
3. 第一段：氛圍營造與場景描述
4. 第二段：品牌故事或設計理念
5. 第三段：體驗旅程的細節鋪陳
6. 第四段：感官描述（味道/香氣/視覺/觸感）
7. 第五段：生活態度的邀請與連結
8. 第六段：實用資訊
9. 酒店簡介 & 聯繫資訊`;

    default:
      return '';
  }
}

function formatUserInput(input: GenerationInput): string {
  let userPrompt = `## 新聞稿主題\n${input.topic}\n`;

  if (input.subCategory) {
    userPrompt += `\n## 主要類型\n${input.subCategory}\n`;
  }

  // Multi-dimensional angles
  if (input.angles && input.angles.length > 0) {
    userPrompt += `\n## 多面向切角\n`;
    userPrompt += `本篇新聞稿需要融合以下多個面向，請在撰寫時自然地涵蓋這些角度，使新聞稿更加豐富且多元：\n`;
    input.angles.forEach((angle, i) => {
      userPrompt += `${i + 1}. ${angle}\n`;
    });
    userPrompt += `\n注意：以上面向應自然融入整篇新聞稿中，而非機械式地逐一列舉。每個面向可以是一個段落的主軸，也可以是穿插在不同段落中的元素。請確保整體敘事流暢且符合品牌調性。\n`;
  }

  if (input.keyFacts) {
    userPrompt += `\n## 關鍵事實與資訊\n${input.keyFacts}\n`;
  }
  if (input.eventDate) {
    userPrompt += `\n## 活動/發布日期\n${input.eventDate}\n`;
  }
  if (input.pricing) {
    userPrompt += `\n## 價格資訊\n${input.pricing}\n`;
  }
  if (input.venue) {
    userPrompt += `\n## 地點/餐廳\n${input.venue}\n`;
  }
  if (input.includeGmQuote) {
    userPrompt += `\n## 總經理引言\n請包含總經理引言。`;
    if (input.gmQuoteContext) {
      userPrompt += `引言方向：${input.gmQuoteContext}`;
    }
    userPrompt += '\n';
  }
  if (input.additionalNotes) {
    userPrompt += `\n## 補充說明\n${input.additionalNotes}\n`;
  }

  return userPrompt;
}

function getOutputFormatInstructions(bs: BrandStandards, mediaContacts?: Array<{name: string; title: string; email: string; phone: string}>): string {
  const contacts = mediaContacts && mediaContacts.length > 0 && mediaContacts[0].name
    ? mediaContacts
    : bs.hotelInfo.mediaContacts || [];

  const contactLines = contacts
    .filter(c => c.name)
    .map(c => `${c.title} ${c.name}${c.phone ? ` ${c.phone}` : ''}${c.email ? ` ${c.email}` : ''}`)
    .join('\n');

  return `## 輸出格式要求

請按以下格式輸出新聞稿：

---

**${bs.hotelInfo.name}新聞稿**
${bs.hotelInfo.address}
${contactLines ? `\n新聞聯絡人：\n${contactLines}` : ''}
${bs.hotelInfo.phone ? `電話：${bs.hotelInfo.phone}` : ''}

【日期新聞稿】標題

副標題（如有）

正文段落...

---

### 格式規則
- 引用使用「」
- 英文專有名詞保持原文
- 數字使用阿拉伯數字
- 段落間空一行
- 新聞稿結尾加上「###」符號表示結束
- 最後附上酒店簡介（一段，約100字）`;
}

export function buildPrompt(input: GenerationInput): { systemPrompt: string; userMessage: string } {
  const bs = loadBrandStandards();
  const examples = selectFewShotExamples(input.category, input.topic, 2);

  const systemPrompt = buildBrandContext(bs);

  let userMessage = getCategoryInstructions(input.category, input.toneLevel);

  if (examples.length > 0) {
    userMessage += '\n\n---\n\n## 參考範例新聞稿\n以下為過往發布的新聞稿範例，請參考其風格、語調和結構，但不要照抄：\n\n';
    for (const ex of examples) {
      // Truncate to avoid token overflow
      const truncated = ex.extractedText.length > 2000
        ? ex.extractedText.substring(0, 2000) + '...(truncated)'
        : ex.extractedText;
      userMessage += `### 範例：${ex.title}\n${truncated}\n\n`;
    }
  }

  userMessage += '\n---\n\n## 請根據以下資訊撰寫新聞稿\n\n';
  userMessage += formatUserInput(input);
  userMessage += '\n---\n\n';
  userMessage += getOutputFormatInstructions(bs, input.mediaContacts);

  return { systemPrompt, userMessage };
}
