import { buildPrompt, type GenerationInput } from './promptBuilder';
import { saveGeneration } from './knowledgeBase';
import { v4 as uuidv4 } from 'uuid';

export type { GenerationInput };

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

// 備援型號鏈：主型號掛掉（下架 404 / 參數不相容 400 / 過載）會自動改用下一個，
// 使用者無感。用逗號分隔、可用 env 覆寫，換型號完全不必動 code：
//   OPENROUTER_MODEL=openai/gpt-5.6-sol-20260709,openai/gpt-5.6-terra-20260709
// 註：不傳 temperature/top_p 等型號專屬參數，避免新型號廢棄參數造成 400。
function getModelChain(): string[] {
  const raw = process.env.OPENROUTER_MODEL
    || 'openai/gpt-5.6-sol-20260709,openai/gpt-5.6-terra-20260709';
  return raw.split(',').map(s => s.trim()).filter(Boolean);
}

// OpenRouter 走 OpenAI 相容的 chat/completions SSE 串流，用內建 fetch 即可，
// 不需要多裝 SDK（所有 dep 都得從 root 裝，見 lessons Z15）。
async function* streamOpenRouter(
  model: string,
  systemPrompt: string,
  userMessage: string,
): AsyncGenerator<string, void, unknown> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY is not set');

  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      // OpenRouter 建議帶的識別 header（用於 dashboard 統計，非必要）
      'HTTP-Referer': 'https://ic-tpe-press-gen.zeabur.app',
      'X-Title': 'IC Taipei Press Release Generator',
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      stream: true,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
    }),
  });

  if (!res.ok || !res.body) {
    const body = await res.text().catch(() => '');
    throw new Error(`OpenRouter ${res.status} ${res.statusText}: ${body.slice(0, 500)}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // SSE 事件以空行分隔；最後一段可能不完整，留在 buffer 等下一個 chunk
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data:')) continue;
        const data = trimmed.slice(5).trim();
        if (data === '[DONE]') return;

        let parsed: { choices?: Array<{ delta?: { content?: string } }>; error?: { message?: string } };
        try {
          parsed = JSON.parse(data);
        } catch {
          continue; // 非 JSON 的 keep-alive comment，略過
        }
        // 串流中途的錯誤事件（例如過載）也要當成失敗拋出，讓備援鏈接手
        if (parsed.error) throw new Error(parsed.error.message || 'OpenRouter stream error');
        const text = parsed.choices?.[0]?.delta?.content;
        if (text) yield text;
      }
    }
  } finally {
    reader.releaseLock();
  }
}

export async function* generatePressRelease(input: GenerationInput): AsyncGenerator<string, void, unknown> {
  const { systemPrompt, userMessage } = buildPrompt(input);

  const models = getModelChain();

  let fullText = '';

  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    const isLast = i === models.length - 1;
    try {
      for await (const text of streamOpenRouter(model, systemPrompt, userMessage)) {
        fullText += text;
        yield text;
      }

      // 成功產出，跳出型號鏈
      break;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      // 已經吐出內容才失敗 → 不能重試（會重複），直接拋出
      if (fullText.length > 0) throw err;
      // 尚未有內容 → 換下一個備援型號；已是最後一個就拋出
      console.error(`[generator] 型號 "${model}" 失敗${isLast ? '（已無備援）' : '，改用下一個備援型號'}：${msg}`);
      if (isLast) throw err;
    }
  }

  // Save to history
  saveGeneration({
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    category: input.category,
    topic: input.topic,
    input: input as unknown as Record<string, unknown>,
    output: fullText,
  });
}

export async function generatePressReleaseSync(input: GenerationInput): Promise<string> {
  const chunks: string[] = [];
  for await (const chunk of generatePressRelease(input)) {
    chunks.push(chunk);
  }
  return chunks.join('');
}
