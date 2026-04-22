import * as fs from 'fs';
import * as path from 'path';
import { extractDocument, scanDirectory, type ExtractedDocument } from './documentExtractor';

export interface IndexedDocument {
  id: string;
  filename: string;
  sourcePath: string;
  date: string | null;
  year: number | null;
  month: number | null;
  title: string;
  category: string;
  tags: string[];
  wordCount: number;
  extractedText: string;
  summary: string;
}

export interface PressReleaseIndex {
  version: string;
  lastIndexed: string;
  totalDocuments: number;
  documents: IndexedDocument[];
}

export interface BrandStandards {
  version: string;
  lastUpdated: string;
  hotelInfo: {
    name: string;
    nameEn: string;
    address: string;
    phone: string;
    restaurants: Array<{ name: string; cuisine: string; positioning: string }>;
    bars: Array<{ name: string; concept: string; positioning: string }>;
    gmName: string;
    gmTitle: string;
    mediaContacts: Array<{
      name: string;
      title: string;
      email: string;
      phone: string;
    }>;
  };
  brand: {
    purpose: string;
    promise: string;
    proposition: string;
    personality: {
      thoughtful: string;
      cultured: string;
      remarkable: string;
    };
    differentiators: {
      insiderExpertise: string;
      intentionalFlexibility: string;
      incredibleOccasions: string;
    };
    designStrategy: string;
    servicePhilosophy: string;
    fbPhilosophy: string;
    targetGuest: string;
  };
  customNotes: string;
}

const DATA_DIR = path.join(__dirname, '..', 'data');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function inferCategory(text: string, filename: string): string {
  const combined = (text + ' ' + filename).toLowerCase();
  // Use filename for primary classification (more reliable than body text)
  const fn = filename.toLowerCase();

  const csrKeywords = ['公益', '慈善', '捐', 'csr', '基金會', '愛心', '志工'];
  const eventKeywords = ['聖誕', '跨年', '新年', '情人節', '母親節', '父親節', '中秋', '端午', '萬聖', '耶誕', '點燈'];
  const openingKeywords = ['開幕', '揭幕', '啟用', '開業', '首賣', '預售'];
  const lifestyleKeywords = ['住房', '住宿', '泳池', '水療', 'spa', '度假', '旅宿', '套房', '泰迪熊', '聯名'];
  const bizKeywords = ['招募', '人才', '職缺', '徵才', '簽約', '週年', '得獎', '獎項'];
  // FB keywords - only use highly specific ones to avoid over-classification
  const fbKeywords = ['美饌', '下午茶', '菜單', '新菜', '主廚', 'chef', '美食節', '餐飲總監', '早午餐', 'brunch'];

  // Check more specific categories first
  if (csrKeywords.some(k => combined.includes(k))) return 'csr';
  if (openingKeywords.some(k => fn.includes(k))) return 'opening';
  if (eventKeywords.some(k => combined.includes(k))) return 'seasonal';
  if (bizKeywords.some(k => combined.includes(k))) return 'business';
  if (lifestyleKeywords.some(k => combined.includes(k))) return 'lifestyle';
  if (fbKeywords.some(k => combined.includes(k))) return 'fb';
  return 'general';
}

function inferTags(text: string, category: string): string[] {
  const tags: string[] = [category];
  const combined = text.toLowerCase();
  if (combined.includes('聖誕') || combined.includes('耶誕')) tags.push('christmas');
  if (combined.includes('跨年') || combined.includes('新年')) tags.push('new-year');
  if (combined.includes('週年')) tags.push('anniversary');
  if (combined.includes('主廚') || combined.includes('chef')) tags.push('chef');
  if (combined.includes('下午茶')) tags.push('afternoon-tea');
  if (combined.includes('早餐')) tags.push('breakfast');
  if (combined.includes('泰迪熊')) tags.push('teddy-bear');
  return [...new Set(tags)];
}

export function getIndexPath(): string {
  return path.join(DATA_DIR, 'press-releases-index.json');
}

export function getBrandStandardsPath(): string {
  return path.join(DATA_DIR, 'brand-standards.json');
}

export function getHistoryPath(): string {
  return path.join(DATA_DIR, 'generation-history.json');
}

export function loadIndex(): PressReleaseIndex {
  ensureDataDir();
  const indexPath = getIndexPath();
  if (fs.existsSync(indexPath)) {
    return JSON.parse(fs.readFileSync(indexPath, 'utf-8'));
  }
  return { version: '1.0', lastIndexed: '', totalDocuments: 0, documents: [] };
}

export function saveIndex(index: PressReleaseIndex) {
  ensureDataDir();
  fs.writeFileSync(getIndexPath(), JSON.stringify(index, null, 2), 'utf-8');
}

export function loadBrandStandards(): BrandStandards {
  ensureDataDir();
  const bsPath = getBrandStandardsPath();
  if (fs.existsSync(bsPath)) {
    return JSON.parse(fs.readFileSync(bsPath, 'utf-8'));
  }
  return getDefaultBrandStandards();
}

export function saveBrandStandards(bs: BrandStandards) {
  ensureDataDir();
  fs.writeFileSync(getBrandStandardsPath(), JSON.stringify(bs, null, 2), 'utf-8');
}

export function getDefaultBrandStandards(): BrandStandards {
  return {
    version: '1.0',
    lastUpdated: new Date().toISOString(),
    hotelInfo: {
      name: '臺北洲際酒店',
      nameEn: 'InterContinental Taipei',
      address: '臺北市中山區',
      phone: '',
      restaurants: [
        { name: 'DOSA', cuisine: '韓式精緻料理 Omakase (by Akira Back)', positioning: '米其林背景韓式品嚐體驗，慶祝與目的地型高端用餐。臺北首創韓式 Omakase 概念，品牌高度象徵 (Brand Halo)。品牌影響力 VERY HIGH。開幕 Wave 2 (2026年8月22日)。' },
        { name: 'Akira Back', cuisine: '國際級目的地餐廳（明星主廚現代日式）', positioning: '全球名廚 Akira Back 現代日式料理，高端社交與話題餐廳。話題與流量引擎 (Destination Driver)。品牌影響力 HIGH。開幕 Wave 2 (2026年8月22日)。' },
        { name: 'Rough Cuts', cuisine: '現代奢華牛排館 (Grill)', positioning: '以火候與食材為核心，商務與慶祝型牛排館。體驗驅動核心 (Experience Driver)。品牌影響力 MEDIUM。開幕 Wave 1 (2026年7月底-8月1日)。品酒晚宴、威士忌品飲活動與精品品牌合作。' },
        { name: 'Chinese Restaurant', cuisine: '高端現代中餐（粵菜為主）', positioning: '精緻現代中餐，商務與家庭宴請場域。高端宴請場域 (Prestige Occasion Venue)。品牌影響力 MEDIUM。開幕 Wave 3 (2026年9月12日)。包廂與私人宴請營收潛力高。' },
        { name: 'Yi Social', cuisine: '高端自助餐 (Premium Buffet Destination)', positioning: '符合台灣市場偏好的高端自助餐，主打海鮮與家庭慶祝場景。流量與場景核心 (Volume + Occasion Anchor)。品牌影響力 LOW。開幕 Wave 1 (2026年7月底-8月1日)。季節主題美食節驅動回訪。' },
        { name: 'Thea Lounge 初遇', cuisine: '大廳酒廊 / 下午茶 / 日間社交 (Premium Lifestyle Ritual)', positioning: '「初遇」(Chū Yù) — 名稱源自茶樹古名 Thea，每次造訪都是一段新連結的開始。植感下午茶、臺灣在地茶文化與季節性甜點。品牌氛圍核心 (Brand Atmosphere Anchor)。品牌影響力 HIGH。開幕 Wave 1 (2026年7月底-8月1日)。Story: 臺北的創意文化遺產與現代能量的交會; Set: The Garden 以現代雕塑感空間呈現優雅日光旅程; Soul: 以在地草本與自然元素為核心的茶儀式。核心價值：Timeless, Welcoming, Local, Story Rich。關鍵詞：Refined, Elegant, Effortless, Hospitable。' },
        { name: 'NTD Eatery (Near the Dome)', cuisine: '高端休閒義式料理 (Upper Casual Premium Italian)', positioning: 'NTD 雙重含義 — "Near the Dome"（鄰近臺北大巨蛋）與臺灣貨幣（新臺幣）。位於松山文創園區與臺北大巨蛋之間，以「cucina di casa」家庭料理哲學為核心。流量入口 (Volume Driver)。品牌影響力 LOW。開幕 Wave 1 (2026年7月底-8月1日)。品牌刻意大膽、獨立，與傳統飯店餐廳保持距離。核心價值：Delicious, Simple, Honest, Sustainable, Generous。關鍵詞：Vibrant, Relaxed, Approachable, Warm。招牌菜：手工 Tagliatelle & Ragu、72小時發酵披薩、Fresh Burrata & Tomato、Mascarpone Tiramisu、Roast Chicken、Olive Oil Cake。Story: 溫暖無拘的義式待客之道; Set: 經典義式魅力融合簡約現代活力; Soul: 誠實、不複雜的義式料理。' },
      ],
      bars: [
        { name: 'Grain & Grace', concept: '文化型精釀酒吧 (Cultural Craft Bar)', positioning: '穀物與亞洲元素為主軸的精緻調酒空間。差異化概念 (Differentiation Concept)。品牌影響力 MEDIUM。開幕 Wave 3 (2026年9月12日)。以茶、白酒、草本與米酒為元素的特色調酒，導入茶搭餐 (Tea Pairing) 作為葡萄酒搭餐的新興替代選擇。' },
        { name: 'Simple Sips', concept: '高端社交酒吧 (Premium Social Bar)', positioning: '經典調酒與威士忌為核心，支撐牛排館的社交能量。延伸營收場域 (Revenue Multiplier)。品牌影響力 LOW。開幕 Wave 1 (2026年7月底-8月1日)。餐前/餐後社交空間。' },
      ],
      gmName: '',
      gmTitle: '總經理',
      mediaContacts: [
        { name: '', title: '公關經理', email: '', phone: '' },
      ],
    },
    brand: {
      purpose: '我們相信旅行的力量能夠拓展視野 (We believe in the power of travel to expand minds)',
      promise: '我們為您開啟通往精彩世界的大門 (We open doors to a world of fascination)',
      proposition: '全球最大的奢華酒店品牌，以我們的知識與專長，將人們與各地文化連結',
      personality: {
        thoughtful: '體貼周到 — 我們以溫暖、尊重和理解的態度迎接每位賓客，用心創造持久的印象',
        cultured: '文化底蘊 — 擁有超過75年的接待經驗，對全球文化有深刻的理解與洞察',
        remarkable: '非凡卓越 — 傳奇的歷史遺產，富有想像力的方式，對慶典充滿熱情',
      },
      differentiators: {
        insiderExpertise: '內行專家 — 無與倫比的文化知識 (Insider Expertise)',
        intentionalFlexibility: '靈活彈性 — 賦能千變萬化 (Intentional Flexibility)',
        incredibleOccasions: '非凡時刻 — 精彩事物發生的所在 (Incredible Occasions)',
      },
      designStrategy: '雅致優雅 (Cultivated Elegance)',
      servicePhilosophy: '啟發非凡 (Inspire Incredible)',
      fbPhilosophy: '故事食譜 (A Recipe for Stories) — 故事 (Story)、場景 (Set)、靈魂 (Soul)。F&B 整體策略哲學：目的地導向的餐廳與酒吧組合，建立在現代奢華、匠心精神、故事驅動與文化扎根之上，旨在贏得臺北頂級餐飲場景，成為全市最受關注的餐飲集團。所有場域貫徹一致：溫暖自信的現代奢華、食材驅動的匠心，以及讓每間餐廳都令人難忘的招牌儀式。這不是標準的飯店 F&B 配置，而是酒店的商業引擎與文化心臟。三大策略支柱：Brand Builders（DOSA、Akira Back、Rough Cuts、Simple Sips — 以卓越、故事性與社群傳播力創造品牌光環）、Revenue Engines（Yi Social、Chinese Restaurant — 以高翻桌率和客單價驅動商業表現）、Experience Multipliers（Grain & Grace、Thea Lounge、NTD — 延伸停留時間、提升酒水比例與跨場域流動）。',
      targetGuest: '現代奢華旅行者 — 國際化、低調自信、重視家庭、成功、注重環保、有社會意識、學識豐富、全球旅行者、終身學習者、品味獨到、社交平衡、心態開放',
    },
    customNotes: '【開幕時程 Launch Timeline】Wave 1 (2026年7月底-8月1日): Thea Lounge、NTD Eatery、Yi Social、Rough Cuts、Simple Sips。Wave 2 (2026年8月22日): Akira Back、DOSA。Wave 3 (2026年9月12日): Chinese Restaurant、Grain & Grace。【媒體時程 Media Timeline】7月: Thea & Yi Social + Hotel Unbox 新聞稿。7月底: NTD Opening Party (Media & KOL & VIP)。8月初: Rough Cuts Media Tasting Dinner (Media + VIP)。8月: Simple Sips - Singer 9m88 Live Night。9月: Akira Back & DOSA - Media Interview & Narrative Video。【社群策略】People-first Moments (以人為先的社群瞬間)、Short-form Reels (短影音)、Shareable Food Moments (可分享的美食瞬間)、Social Proof / UGC-style (使用者生成風格)。',
  };
}

export async function indexDocuments(sourcePath: string, onProgress?: (current: number, total: number) => void): Promise<PressReleaseIndex> {
  const prDir = path.join(sourcePath, 'PR');
  const files = await scanDirectory(prDir);

  const index: PressReleaseIndex = {
    version: '1.0',
    lastIndexed: new Date().toISOString(),
    totalDocuments: 0,
    documents: [],
  };

  const total = files.length;
  let current = 0;

  for (const filePath of files) {
    current++;
    if (onProgress) onProgress(current, total);

    const doc = await extractDocument(filePath);
    if (!doc) continue;

    const category = inferCategory(doc.text, doc.filename);
    const tags = inferTags(doc.text, category);

    let year: number | null = null;
    let month: number | null = null;
    if (doc.date) {
      const parts = doc.date.split('-');
      year = parseInt(parts[0]);
      month = parseInt(parts[1]);
    } else {
      // Try to infer from directory path
      const yearMatch = filePath.match(/(\d{4})年/);
      if (yearMatch) year = parseInt(yearMatch[1]);
      const monthMatch = filePath.match(/(\d{1,2})\.\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i);
      if (monthMatch) month = parseInt(monthMatch[1]);
    }

    const id = `pr-${doc.date || 'unknown'}-${Buffer.from(doc.filename).toString('base64').substring(0, 8)}`;

    index.documents.push({
      id,
      filename: doc.filename,
      sourcePath: filePath,
      date: doc.date,
      year,
      month,
      title: doc.title,
      category,
      tags,
      wordCount: doc.wordCount,
      extractedText: doc.text,
      summary: doc.text.substring(0, 200),
    });
  }

  index.totalDocuments = index.documents.length;
  saveIndex(index);
  return index;
}

export function searchDocuments(query: {
  category?: string;
  year?: number;
  keywords?: string;
  limit?: number;
}): IndexedDocument[] {
  const index = loadIndex();
  let docs = index.documents;

  if (query.category) {
    docs = docs.filter(d => d.category === query.category);
  }
  if (query.year) {
    docs = docs.filter(d => d.year === query.year);
  }
  if (query.keywords) {
    const kw = query.keywords.toLowerCase();
    docs = docs.filter(d =>
      d.extractedText.toLowerCase().includes(kw) ||
      d.title.toLowerCase().includes(kw) ||
      d.tags.some(t => t.includes(kw))
    );
  }

  // Sort by date descending (most recent first)
  docs.sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return b.date.localeCompare(a.date);
  });

  return docs.slice(0, query.limit || 50);
}

export function selectFewShotExamples(category: string, topic: string, limit: number = 3): IndexedDocument[] {
  const index = loadIndex();
  let docs = index.documents;

  // Score each document by relevance
  const scored = docs.map(doc => {
    let score = 0;

    // Category match
    const categoryMap: Record<string, string[]> = {
      'general': ['general', 'opening', 'business'],
      'business': ['business', 'fb', 'opening'],
      'lifestyle': ['lifestyle', 'seasonal', 'fb'],
    };
    const targetCategories = categoryMap[category] || [category];
    if (targetCategories.includes(doc.category)) score += 10;

    // Recency bonus
    if (doc.year) {
      score += Math.max(0, (doc.year - 2020)) * 2;
    }

    // Topic keyword match
    if (topic) {
      const topicWords = topic.toLowerCase().split(/\s+/);
      for (const word of topicWords) {
        if (word.length >= 2 && doc.extractedText.toLowerCase().includes(word)) {
          score += 5;
        }
      }
    }

    // Prefer longer, more complete documents
    if (doc.wordCount > 500) score += 3;
    if (doc.wordCount > 1000) score += 2;

    return { doc, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map(s => s.doc);
}

// Generation history management
export interface GenerationRecord {
  id: string;
  timestamp: string;
  category: string;
  topic: string;
  input: Record<string, unknown>;
  output: string;
}

export function loadHistory(): GenerationRecord[] {
  ensureDataDir();
  const historyPath = getHistoryPath();
  if (fs.existsSync(historyPath)) {
    return JSON.parse(fs.readFileSync(historyPath, 'utf-8'));
  }
  return [];
}

export function saveGeneration(record: GenerationRecord) {
  const history = loadHistory();
  history.unshift(record);
  // Keep last 100 records
  const trimmed = history.slice(0, 100);
  fs.writeFileSync(getHistoryPath(), JSON.stringify(trimmed, null, 2), 'utf-8');
}
