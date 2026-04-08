import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

// Use __dirname for paths so it works regardless of cwd
// When compiled, __dirname = backend/dist; when running TS, __dirname = backend
// We need PROJECT_ROOT to point to the repo root in both cases
const SCRIPT_DIR = __dirname;
const BACKEND_DIR = path.basename(SCRIPT_DIR) === 'dist'
  ? path.resolve(SCRIPT_DIR, '..')
  : SCRIPT_DIR;
const PROJECT_ROOT = path.resolve(BACKEND_DIR, '..');

// Load .env from project root (Zeabur injects env vars directly, so this is optional)
dotenv.config({ path: path.join(BACKEND_DIR, '.env'), override: false });
dotenv.config({ path: path.join(PROJECT_ROOT, '.env'), override: false });

console.log('[startup] API Key loaded:', process.env.ANTHROPIC_API_KEY ? 'yes' : 'NO');
console.log('[startup] BACKEND_DIR:', BACKEND_DIR);
console.log('[startup] PROJECT_ROOT:', PROJECT_ROOT);

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
const distPath = path.join(PROJECT_ROOT, 'dist');
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
