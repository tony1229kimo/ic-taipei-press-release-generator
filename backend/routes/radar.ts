import { Router, type Request, type Response } from 'express';

const router = Router();

const RADAR_API_BASE = process.env.RADAR_API_BASE;
const RADAR_API_KEY = process.env.RADAR_API_KEY;

export interface RelatedCompetitor {
  name: string;
  articleTitle: string;
  url: string;
  publishedAt: string;
}

export interface Opportunity {
  id: string;
  title: string;
  summary: string;
  heat: 'high' | 'rising' | 'medium';
  topic: string;
  suggestedAngles: string[];
  prefillCategory?: 'general' | 'business' | 'lifestyle';
  prefillAngleItems?: string[];
  prefillTopic?: string;
  prefillKeyFacts?: string;
  relatedCompetitors?: RelatedCompetitor[];
  topicTrend?: { count7d: number; growthPct: number };
  createdAt: string;
}

const MOCK_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'opp_mock_1',
    title: '「聖誕下午茶」主題本週聲量 +340%',
    summary: '文華東方、君悅、晶華已陸續發稿，IC 還沒跟。建議切角：Pier No.5 主廚特調或 Tiffin 限定甜點。',
    heat: 'high',
    topic: '聖誕下午茶',
    suggestedAngles: ['主廚特調', '限定甜點', '節慶禮盒'],
    prefillCategory: 'lifestyle',
    prefillAngleItems: ['季節主題下午茶', '節慶限定甜點'],
    prefillTopic: '臺北洲際酒店推出 2026 聖誕限定下午茶',
    prefillKeyFacts: '【情報來源：媒體雷達】\n- 文華東方、君悅、晶華本週皆已發布聖誕下午茶稿件\n- 媒體偏好標題關鍵字：「限定」「聯名」「甜點主廚」\n- 主題情感分析：正面 82%\n\n【建議涵蓋重點】\n- Tiffin 餐廳下午茶亮點\n- 節慶限定甜點與禮盒選項\n- 主廚故事或聯名合作（若有）',
    relatedCompetitors: [
      { name: '文華東方台北', articleTitle: '文華東方推出 2026 聖誕主題下午茶', url: '#', publishedAt: '2026-05-23' },
      { name: '台北君悅', articleTitle: '凱菲屋聖誕甜點塔登場', url: '#', publishedAt: '2026-05-22' },
      { name: '台北晶華', articleTitle: '栢麗廳推出耶誕限定下午茶', url: '#', publishedAt: '2026-05-20' },
    ],
    topicTrend: { count7d: 18, growthPct: 340 },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'opp_mock_2',
    title: 'Q Bar 對標 Aha Saloon 推出新調酒系列',
    summary: 'Aha Saloon 昨日發稿宣布新季節調酒，建議 Q Bar 以「在地食材／調酒師故事」做差異化。',
    heat: 'rising',
    topic: '季節調酒',
    suggestedAngles: ['調酒師作品', '在地食材', '季節主題'],
    prefillCategory: 'business',
    prefillAngleItems: ['調酒師活動', '酒單更新/精選'],
    prefillTopic: 'Q Bar 推出夏季新調酒系列',
    prefillKeyFacts: '【情報來源：媒體雷達】\n- Aha Saloon 昨日發布新季節調酒新聞稿\n- 同類稿件本週競品共 4 篇\n- 差異化建議：強調在地食材／調酒師故事',
    relatedCompetitors: [
      { name: 'Aha Saloon', articleTitle: 'Aha Saloon 推出 2026 夏季調酒單', url: '#', publishedAt: '2026-05-24' },
    ],
    topicTrend: { count7d: 4, growthPct: 80 },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'opp_mock_3',
    title: '「永續海鮮」主題正熱、IC 餐廳尚未表態',
    summary: 'Tatler Dining 與米其林指南 5 月皆有專題，西華、寒舍艾美已宣布合作 ASC 認證。',
    heat: 'medium',
    topic: '永續海鮮',
    suggestedAngles: ['ESG/永續', '產地合作', 'F&B 升級'],
    prefillCategory: 'general',
    prefillAngleItems: ['ESG/永續認證', '供應商/產地合作'],
    prefillTopic: '臺北洲際酒店宣布永續海鮮採購承諾',
    prefillKeyFacts: '【情報來源：媒體雷達】\n- Tatler Dining、米其林指南 5 月各有專題\n- 西華、寒舍艾美已宣布 ASC 認證合作\n- 媒體整體情感：+0.71（高度正面）',
    relatedCompetitors: [
      { name: '台北寒舍艾美', articleTitle: 'LATITUDE 25 宣布 ASC 認證海鮮', url: '#', publishedAt: '2026-05-18' },
    ],
    topicTrend: { count7d: 9, growthPct: 120 },
    createdAt: new Date().toISOString(),
  },
];

async function callRadar(path: string): Promise<unknown> {
  if (!RADAR_API_BASE) return null;
  const url = `${RADAR_API_BASE.replace(/\/$/, '')}${path}`;
  const res = await fetch(url, {
    headers: RADAR_API_KEY ? { Authorization: `Bearer ${RADAR_API_KEY}` } : {},
  });
  if (!res.ok) {
    throw new Error(`Radar API ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

router.get('/radar/opportunities', async (req: Request, res: Response) => {
  const limit = Math.max(1, Math.min(10, parseInt(String(req.query.limit ?? '3'), 10) || 3));
  try {
    if (RADAR_API_BASE) {
      const data = await callRadar(`/api/insights/opportunities?limit=${limit}`);
      res.setHeader('X-Radar-Source', 'live');
      res.json(data);
      return;
    }
  } catch (err) {
    console.warn('[radar] live fetch failed, falling back to mock:', err);
  }
  res.setHeader('X-Radar-Source', 'mock');
  res.json({ opportunities: MOCK_OPPORTUNITIES.slice(0, limit) });
});

router.get('/radar/competitive-summary', async (req: Request, res: Response) => {
  const days = Math.max(1, Math.min(30, parseInt(String(req.query.days ?? '7'), 10) || 7));
  try {
    if (RADAR_API_BASE) {
      const data = await callRadar(`/api/insights/competitive-summary?days=${days}`);
      res.setHeader('X-Radar-Source', 'live');
      res.json(data);
      return;
    }
  } catch (err) {
    console.warn('[radar] live fetch failed, falling back to mock:', err);
  }
  res.setHeader('X-Radar-Source', 'mock');
  res.json({
    periodDays: days,
    totalMentions: 47,
    topCompetitors: [
      { name: '文華東方台北', mentionCount: 12, topTopics: ['聖誕', '主廚', '聯名'] },
      { name: '台北君悅', mentionCount: 10, topTopics: ['下午茶', '婚宴'] },
      { name: '台北晶華', mentionCount: 8, topTopics: ['聖誕', '中餐'] },
    ],
    emergingTopics: ['聖誕下午茶', '永續海鮮', '威士忌品飲', '親子住房'],
    generatedAt: new Date().toISOString(),
  });
});

router.get('/radar/status', (_req: Request, res: Response) => {
  res.json({
    configured: !!RADAR_API_BASE,
    base: RADAR_API_BASE ? new URL(RADAR_API_BASE).host : null,
  });
});

export default router;
