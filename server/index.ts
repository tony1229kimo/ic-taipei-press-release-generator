import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
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
const distPath = path.resolve(process.cwd(), '..', 'dist');
const fs = require('fs');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
  console.log('Serving static files from', distPath);
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
