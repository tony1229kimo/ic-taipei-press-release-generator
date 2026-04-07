import { Router, type Request, type Response } from 'express';
import multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import {
  indexDocuments,
  loadIndex,
  loadBrandStandards,
  saveBrandStandards,
  loadHistory,
  searchDocuments,
  type BrandStandards,
} from '../services/knowledgeBase';
import { extractDocument } from '../services/documentExtractor';

const router = Router();

// Upload directory for new documents
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    cb(null, `${Date.now()}-${originalName}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.docx' || ext === '.pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only .docx and .pdf files are allowed'));
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

// GET /api/knowledge-base/documents
router.get('/knowledge-base/documents', (req: Request, res: Response) => {
  try {
    const { category, year, keywords, limit } = req.query;
    const docs = searchDocuments({
      category: category as string,
      year: year ? parseInt(year as string) : undefined,
      keywords: keywords as string,
      limit: limit ? parseInt(limit as string) : 50,
    });

    // Return without full text for listing (save bandwidth)
    const lite = docs.map(d => ({
      id: d.id,
      filename: d.filename,
      date: d.date,
      year: d.year,
      month: d.month,
      title: d.title,
      category: d.category,
      tags: d.tags,
      wordCount: d.wordCount,
      summary: d.summary,
    }));

    res.json({ documents: lite, total: lite.length });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load documents';
    res.status(500).json({ error: message });
  }
});

// GET /api/knowledge-base/documents/:id
router.get('/knowledge-base/documents/:id', (req: Request, res: Response) => {
  try {
    const index = loadIndex();
    const doc = index.documents.find(d => d.id === req.params.id);
    if (!doc) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }
    res.json(doc);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load document';
    res.status(500).json({ error: message });
  }
});

// DELETE /api/knowledge-base/documents/:id
router.delete('/knowledge-base/documents/:id', (req: Request, res: Response) => {
  try {
    const index = loadIndex();
    const idx = index.documents.findIndex(d => d.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Document not found' });
      return;
    }
    index.documents.splice(idx, 1);
    index.totalDocuments = index.documents.length;

    const { saveIndex } = require('../services/knowledgeBase');
    saveIndex(index);

    res.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete document';
    res.status(500).json({ error: message });
  }
});

// POST /api/admin/upload
router.post('/admin/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const filePath = req.file.path;
    const doc = await extractDocument(filePath);

    if (!doc) {
      res.status(400).json({ error: 'Failed to extract document content' });
      return;
    }

    // Add to index
    const { loadIndex, saveIndex } = require('../services/knowledgeBase');
    const index = loadIndex();
    const { inferCategory, inferTags } = require('../services/knowledgeBase');

    const id = `pr-upload-${Date.now()}`;
    index.documents.push({
      id,
      filename: doc.filename,
      sourcePath: filePath,
      date: doc.date,
      year: doc.date ? parseInt(doc.date.split('-')[0]) : null,
      month: doc.date ? parseInt(doc.date.split('-')[1]) : null,
      title: doc.title,
      category: req.body.category || 'general',
      tags: [req.body.category || 'general'],
      wordCount: doc.wordCount,
      extractedText: doc.text,
      summary: doc.text.substring(0, 200),
    });
    index.totalDocuments = index.documents.length;
    saveIndex(index);

    res.json({ success: true, document: { id, title: doc.title, wordCount: doc.wordCount } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Upload failed';
    res.status(500).json({ error: message });
  }
});

// POST /api/admin/reindex
router.post('/admin/reindex', async (req: Request, res: Response) => {
  try {
    const sourcePath = req.body.sourcePath || path.resolve('C:/Users/smtony/Desktop/Claude/新聞稿產生器');
    console.log('[reindex] Source path:', sourcePath);

    // Set up SSE for progress
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const index = await indexDocuments(sourcePath, (current, total) => {
      res.write(`data: ${JSON.stringify({ current, total, status: 'indexing' })}\n\n`);
    });

    res.write(`data: ${JSON.stringify({ done: true, totalDocuments: index.totalDocuments })}\n\n`);
    res.end();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Reindex failed';
    if (!res.headersSent) {
      res.status(500).json({ error: message });
    } else {
      res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
      res.end();
    }
  }
});

// GET /api/admin/brand-standards
router.get('/admin/brand-standards', (_req: Request, res: Response) => {
  try {
    const bs = loadBrandStandards();
    res.json(bs);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load brand standards';
    res.status(500).json({ error: message });
  }
});

// PUT /api/admin/brand-standards
router.put('/admin/brand-standards', (req: Request, res: Response) => {
  try {
    const bs: BrandStandards = req.body;
    bs.lastUpdated = new Date().toISOString();
    saveBrandStandards(bs);
    res.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to save brand standards';
    res.status(500).json({ error: message });
  }
});

// GET /api/knowledge-base/history
router.get('/knowledge-base/history', (_req: Request, res: Response) => {
  try {
    const history = loadHistory();
    res.json(history);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load history';
    res.status(500).json({ error: message });
  }
});

// GET /api/knowledge-base/stats
router.get('/knowledge-base/stats', (_req: Request, res: Response) => {
  try {
    const index = loadIndex();
    const history = loadHistory();

    const categoryCount: Record<string, number> = {};
    const yearCount: Record<string, number> = {};
    for (const doc of index.documents) {
      categoryCount[doc.category] = (categoryCount[doc.category] || 0) + 1;
      if (doc.year) {
        yearCount[doc.year.toString()] = (yearCount[doc.year.toString()] || 0) + 1;
      }
    }

    res.json({
      totalDocuments: index.totalDocuments,
      lastIndexed: index.lastIndexed,
      categoryCount,
      yearCount,
      totalGenerations: history.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load stats';
    res.status(500).json({ error: message });
  }
});

export default router;
