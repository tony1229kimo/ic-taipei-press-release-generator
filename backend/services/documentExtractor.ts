import * as fs from 'fs';
import * as path from 'path';
import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';

export interface ExtractedDocument {
  filename: string;
  sourcePath: string;
  text: string;
  title: string;
  date: string | null;
  wordCount: number;
}

function extractDateFromFilename(filename: string): string | null {
  // Pattern: 【YYYYMMDD新聞稿】 or 20YYMMDD
  const patterns = [
    /【(\d{8})新聞稿】/,
    /(\d{8})\s/,
    /^(\d{8})/,
  ];
  for (const pattern of patterns) {
    const match = filename.match(pattern);
    if (match) {
      const d = match[1];
      const year = d.substring(0, 4);
      const month = d.substring(4, 6);
      const day = d.substring(6, 8);
      if (parseInt(year) >= 2020 && parseInt(year) <= 2030 && parseInt(month) >= 1 && parseInt(month) <= 12) {
        return `${year}-${month}-${day}`;
      }
    }
  }
  return null;
}

function extractTitleFromText(text: string, filename: string): string {
  // Try to find a title-like line in the first few lines
  const lines = text.split('\n').filter(l => l.trim().length > 0);
  for (const line of lines.slice(0, 5)) {
    const trimmed = line.trim();
    // Skip contact info lines
    if (trimmed.includes('@') || trimmed.includes('電話') || trimmed.includes('Tel')) continue;
    if (trimmed.length > 10 && trimmed.length < 100) {
      return trimmed;
    }
  }
  // Fallback to filename
  return filename.replace(/\.(docx|pdf)$/i, '');
}

export async function extractDocx(filePath: string): Promise<string> {
  const buffer = fs.readFileSync(filePath);
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

export async function extractPdf(filePath: string): Promise<string> {
  const buffer = fs.readFileSync(filePath);
  const result = await pdfParse(buffer);
  return result.text;
}

export async function extractDocument(filePath: string): Promise<ExtractedDocument | null> {
  const ext = path.extname(filePath).toLowerCase();
  const filename = path.basename(filePath);

  // Skip temp files
  if (filename.startsWith('~$') || filename === 'Thumbs.db' || filename === '.DS_Store') {
    return null;
  }

  let text = '';
  try {
    if (ext === '.docx') {
      text = await extractDocx(filePath);
    } else if (ext === '.pdf') {
      text = await extractPdf(filePath);
    } else {
      return null;
    }
  } catch (err) {
    console.error(`Failed to extract ${filePath}:`, err);
    return null;
  }

  if (!text || text.trim().length < 50) {
    return null;
  }

  const date = extractDateFromFilename(filename);
  const title = extractTitleFromText(text, filename);

  return {
    filename,
    sourcePath: filePath,
    text: text.trim(),
    title,
    date,
    wordCount: text.trim().length,
  };
}

export async function scanDirectory(dirPath: string): Promise<string[]> {
  const results: string[] = [];

  function walk(dir: string) {
    if (!fs.existsSync(dir)) {
      console.log(`[scan] Directory does not exist: ${dir}`);
      return;
    }
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        // Skip known non-PR directories
        const name = entry.name;
        if (name === '新聞照片' || name === '媒體露出' || name === '舊資料' || name === 'node_modules' || name.startsWith('~')) continue;
        walk(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if ((ext === '.docx' || ext === '.pdf') && !entry.name.startsWith('~$')) {
          results.push(fullPath);
        }
      }
    }
  }

  walk(dirPath);
  return results;
}
