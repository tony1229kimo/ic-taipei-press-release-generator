import Anthropic from '@anthropic-ai/sdk';
import { buildPrompt, type GenerationInput } from './promptBuilder';
import { saveGeneration } from './knowledgeBase';
import { v4 as uuidv4 } from 'uuid';

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return client;
}

export async function* generatePressRelease(input: GenerationInput): AsyncGenerator<string, void, unknown> {
  const { systemPrompt, userMessage } = buildPrompt(input);

  const anthropic = getClient();

  const stream = anthropic.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: userMessage,
      },
    ],
    temperature: 0.7,
  });

  let fullText = '';

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      const text = event.delta.text;
      fullText += text;
      yield text;
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
