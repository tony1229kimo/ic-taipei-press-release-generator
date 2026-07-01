import Anthropic from '@anthropic-ai/sdk';
import { buildPrompt, type GenerationInput } from './promptBuilder';
import { saveGeneration } from './knowledgeBase';
import { v4 as uuidv4 } from 'uuid';

export type { GenerationInput };

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return client;
}

// 備援型號鏈：主型號掛掉（下架 404 / 參數不相容 400 / 過載）會自動改用下一個，
// 使用者無感。用逗號分隔、可用 env 覆寫，換型號完全不必動 code：
//   ANTHROPIC_MODEL=claude-sonnet-5,claude-sonnet-4-6
// 註：不傳 temperature/top_p 等型號專屬參數，避免新型號廢棄參數造成 400。
function getModelChain(): string[] {
  const raw = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5,claude-sonnet-4-6';
  return raw.split(',').map(s => s.trim()).filter(Boolean);
}

export async function* generatePressRelease(input: GenerationInput): AsyncGenerator<string, void, unknown> {
  const { systemPrompt, userMessage } = buildPrompt(input);

  const anthropic = getClient();
  const models = getModelChain();

  let fullText = '';

  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    const isLast = i === models.length - 1;
    try {
      const stream = anthropic.messages.stream({
        model,
        max_tokens: 4096,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userMessage,
          },
        ],
      });

      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          const text = event.delta.text;
          fullText += text;
          yield text;
        }
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
