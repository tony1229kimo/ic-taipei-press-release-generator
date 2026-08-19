import * as path from 'path';
import * as fs from 'fs';

/**
 * Root folder holding the press-release archive. The indexer expects to find a
 * `PR/` subfolder inside it.
 *
 * Override per-machine with the PR_SOURCE_PATH env var rather than editing this
 * file — the previous owner's path was hardcoded in two places and drifted.
 */
export const DEFAULT_SOURCE_PATH =
  process.env.PR_SOURCE_PATH ||
  'C:\\Users\\ChenVivi\\OneDrive - Six Continents Hotels, Inc\\Desktop\\Claude';

/**
 * Archive layouts seen so far. The original machine nested everything under a
 * 新聞稿產生器 folder; the current one points straight at its parent.
 */
const PR_SUBDIRS = ['PR', '新聞稿產生器/PR'];

/**
 * A Windows path stays a Windows path even when the server runs on Linux, so
 * join with win32 semantics instead of mangling separators.
 */
function pathFor(p: string) {
  return /^[a-zA-Z]:[\\/]/.test(p) || p.startsWith('\\\\') ? path.win32 : path.posix;
}

/** Every location we would accept as the PR archive, in priority order. */
export function prDirCandidates(sourcePath: string): string[] {
  const p = pathFor(sourcePath);
  const root = sourcePath.replace(/[\\/]+$/, '');
  return PR_SUBDIRS.map((sub) => p.join(root, ...sub.split('/')));
}

/** First candidate that exists on disk, or null when the archive is missing. */
export function resolvePrDir(sourcePath: string): string | null {
  for (const dir of prDirCandidates(sourcePath)) {
    if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) return dir;
  }
  return null;
}
