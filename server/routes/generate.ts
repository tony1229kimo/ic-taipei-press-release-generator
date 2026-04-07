import { Router, type Request, type Response } from 'express';
import { generatePressRelease, type GenerationInput } from '../services/generator';

const router = Router();

router.post('/generate', async (req: Request, res: Response) => {
  try {
    const input: GenerationInput = req.body;

    if (!input.topic || !input.category) {
      res.status(400).json({ error: 'Missing required fields: topic, category' });
      return;
    }

    // Set up SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    const generator = generatePressRelease(input);

    for await (const chunk of generator) {
      res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error: unknown) {
    console.error('Generation error:', error);
    const message = error instanceof Error ? error.message : 'Generation failed';
    if (!res.headersSent) {
      res.status(500).json({ error: message });
    } else {
      res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
      res.end();
    }
  }
});

export default router;
