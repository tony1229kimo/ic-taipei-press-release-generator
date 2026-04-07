const API_BASE = '/api';

export async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || 'Request failed');
  }
  return res.json();
}

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
  angles: string[];  // Multi-dimensional angles
  keyFacts: string;
  eventDate: string;
  pricing: string;
  venue: string;
  includeGmQuote: boolean;
  gmQuoteContext: string;
  toneLevel: number;
  mediaContacts: MediaContact[];
  additionalNotes: string;
}

export async function* streamGenerate(input: GenerationInput): AsyncGenerator<string, void, unknown> {
  const res = await fetch(`${API_BASE}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    throw new Error('Generation failed');
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const data = JSON.parse(line.slice(6));
          if (data.done) return;
          if (data.error) throw new Error(data.error);
          if (data.text) yield data.text;
        } catch (e) {
          if (e instanceof SyntaxError) continue;
          throw e;
        }
      }
    }
  }
}

export interface DocumentSummary {
  id: string;
  filename: string;
  date: string | null;
  year: number | null;
  month: number | null;
  title: string;
  category: string;
  tags: string[];
  wordCount: number;
  summary: string;
}

export interface KBStats {
  totalDocuments: number;
  lastIndexed: string;
  categoryCount: Record<string, number>;
  yearCount: Record<string, number>;
  totalGenerations: number;
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

export interface GenerationRecord {
  id: string;
  timestamp: string;
  category: string;
  topic: string;
  input: Record<string, unknown>;
  output: string;
}
