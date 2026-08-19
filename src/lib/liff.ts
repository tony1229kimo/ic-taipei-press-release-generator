import liff from '@line/liff';

/**
 * LINE LIFF integration.
 *
 * Set VITE_LIFF_ID to the LIFF ID from the LINE Developers Console
 * (https://developers.line.biz/console/ → your channel → LIFF). Without it the
 * app still runs everywhere; sharing just falls back to LINE's URL scheme
 * instead of the in-app target picker.
 */
const LIFF_ID = import.meta.env.VITE_LIFF_ID as string | undefined;

/** LINE rejects text messages longer than this. */
const MAX_MESSAGE_CHARS = 5000;

/** URL-scheme sharing goes through the address bar, so keep it well clear of browser URL caps. */
const MAX_URL_SCHEME_CHARS = 1800;

export type LiffStatus =
  | { state: 'disabled' }               // no VITE_LIFF_ID configured
  | { state: 'ready'; inClient: boolean }
  | { state: 'error'; message: string };

let initPromise: Promise<LiffStatus> | null = null;

/** Idempotent — safe to call from multiple components. */
export function initLiff(): Promise<LiffStatus> {
  if (initPromise) return initPromise;

  initPromise = (async (): Promise<LiffStatus> => {
    if (!LIFF_ID) return { state: 'disabled' };
    try {
      await liff.init({ liffId: LIFF_ID });
      return { state: 'ready', inClient: liff.isInClient() };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'LIFF init failed';
      console.warn('[liff] init failed, falling back to URL scheme:', message);
      return { state: 'error', message };
    }
  })();

  return initPromise;
}

export function isLiffConfigured(): boolean {
  return Boolean(LIFF_ID);
}

function truncate(text: string, limit: number): string {
  if (text.length <= limit) return text;
  return `${text.slice(0, limit - 1)}…`;
}

/** Prefix the release with its topic so the message stands alone in a chat. */
export function buildShareText(topic: string, body: string): string {
  const header = topic ? `【${topic}】\n\n` : '';
  return truncate(`${header}${body}`.trim(), MAX_MESSAGE_CHARS);
}

export type ShareResult =
  | { ok: true; via: 'target-picker' }
  | { ok: true; via: 'url-scheme' }
  | { ok: false; cancelled: true }
  | { ok: false; cancelled: false; message: string };

/**
 * Share a press release to LINE.
 *
 * Prefers the in-app target picker (pick chats/groups without leaving the app)
 * and falls back to LINE's share URL, which works in any browser.
 */
export async function shareToLine(topic: string, body: string): Promise<ShareResult> {
  const text = buildShareText(topic, body);

  if (!text) {
    return { ok: false, cancelled: false, message: '沒有可分享的內容' };
  }

  const status = await initLiff();

  if (status.state === 'ready' && liff.isApiAvailable('shareTargetPicker')) {
    try {
      const res = await liff.shareTargetPicker([{ type: 'text', text }]);
      // The SDK resolves with undefined when the user dismisses the picker.
      if (!res) return { ok: false, cancelled: true };
      return { ok: true, via: 'target-picker' };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'shareTargetPicker failed';
      console.warn('[liff] shareTargetPicker failed, falling back to URL scheme:', message);
    }
  }

  const shareUrl = `https://line.me/R/msg/text/?${encodeURIComponent(
    truncate(text, MAX_URL_SCHEME_CHARS)
  )}`;
  window.open(shareUrl, '_blank', 'noopener,noreferrer');
  return { ok: true, via: 'url-scheme' };
}
