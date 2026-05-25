import { fetchApi } from './client';

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

interface OpportunitiesResponse {
  opportunities: Opportunity[];
}

export async function fetchOpportunities(limit = 3): Promise<Opportunity[]> {
  const data = await fetchApi<OpportunitiesResponse>(`/radar/opportunities?limit=${limit}`);
  return data.opportunities;
}

export interface CompetitiveSummary {
  periodDays: number;
  totalMentions: number;
  topCompetitors: Array<{ name: string; mentionCount: number; topTopics: string[] }>;
  emergingTopics: string[];
  generatedAt: string;
}

export async function fetchCompetitiveSummary(days = 7): Promise<CompetitiveSummary> {
  return fetchApi<CompetitiveSummary>(`/radar/competitive-summary?days=${days}`);
}

export interface RadarStatus {
  configured: boolean;
  base: string | null;
}

export async function fetchRadarStatus(): Promise<RadarStatus> {
  return fetchApi<RadarStatus>(`/radar/status`);
}
