import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

// Load .env - try both server/.env and project root .env
dotenv.config({ override: true }); // server/.env (cwd)
dotenv.config({ path: path.resolve(process.cwd(), '..', '.env'), override: true }); // project root

console.log('API Key loaded:', process.env.ANTHROPIC_API_KEY ? 'yes' : 'NO');

import generateRouter from './routes/generate';
import adminRouter from './routes/admin';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// API routes
app.use('/api', generateRouter);
app.use('/api', adminRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static frontend in production
// NOTE: No SPA fallback route here — Express 5.x has incompatible
// path-to-regexp that crashes on wildcards. The static middleware
// serves the index.html for the root path automatically.
const distPath = path.resolve(process.cwd(), '..', 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath, { index: 'index.html' }));
  console.log('[startup] Serving static files from', distPath);

  // Manual SPA fallback as middleware (no path pattern, no wildcards)
  app.use(function spaFallback(req, res, next) {
    if (req.method !== 'GET') return next();
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const server = app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`[startup] Server listening on 0.0.0.0:${PORT}`);
});

server.on('error', (err) => {
  console.error('[startup] Server error:', err);
  process.exit(1);
});
