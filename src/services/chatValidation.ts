/**
 * Shared conversation validation for the chat endpoints.
 *
 * `server.ts` (Express) and `src/services/edgeApi.ts` (Cloudflare Pages
 * Functions) previously each implemented this logic by hand: message-count
 * limits, role checking, length limits and control-character stripping. Any
 * future hardening applied to one would silently leave the other weaker, so the
 * rules now live here and both runtimes call them.
 */

export const MAX_MESSAGES = 20;
export const MAX_MESSAGE_CHARS = 3000;

export interface SanitizedMessage {
  role: string;
  parts: { text: string }[];
}

export type SanitizeResult =
  | { ok: true; contents: SanitizedMessage[] }
  | { ok: false; error: string };

/**
 * Narrows a `SanitizeResult` to its failure variant.
 *
 * Declared as a type predicate so callers get reliable narrowing without
 * depending on how the compiler treats the inline union.
 */
export function isSanitizeFailure(result: SanitizeResult): result is { ok: false; error: string } {
  return result.ok === false;
}

const ALLOWED_ROLES = ['user', 'assistant', 'model'];

/**
 * Validates and normalizes a `messages` array into provider contents.
 *
 * Note the disagreement between the two original implementations on the item
 * count: the landing endpoint rejected arrays over 20, the core endpoint had no
 * upper bound. The stricter, bounded behaviour is kept for both so a single
 * request cannot queue an unbounded conversation.
 */
export function sanitizeMessages(
  messages: unknown,
  maxMessages: number = MAX_MESSAGES
): SanitizeResult {
  if (!Array.isArray(messages) || messages.length === 0) {
    return { ok: false, error: "Invalid 'messages' field: Must be a non-empty array." };
  }

  if (messages.length > maxMessages) {
    return {
      ok: false,
      error: `Invalid 'messages' field: Must contain between 1 and ${maxMessages} items.`,
    };
  }

  const contents: SanitizedMessage[] = [];

  for (let i = 0; i < messages.length; i++) {
    const msg: any = messages[i];
    if (typeof msg !== 'object' || msg === null) {
      return { ok: false, error: `Message at index ${i} is malformed.` };
    }

    const { role, content } = msg;

    if (typeof role !== 'string' || !ALLOWED_ROLES.includes(role)) {
      return {
        ok: false,
        error: `Message at index ${i} has an invalid role. Allowed: 'user', 'assistant', 'model'.`,
      };
    }

    if (typeof content !== 'string' || content.trim().length === 0 || content.length > MAX_MESSAGE_CHARS) {
      return {
        ok: false,
        error: `Message at index ${i} must have content between 1 and ${MAX_MESSAGE_CHARS} characters.`,
      };
    }

    // Strip non-printable control characters (except tab/newline/CR).
    const cleanText = content
      .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F]/g, '')
      .trim();

    contents.push({
      role: role === 'assistant' || role === 'model' ? 'model' : 'user',
      parts: [{ text: cleanText }],
    });
  }

  return { ok: true, contents };
}

/** The most recent user message, used for offline fallback selection. */
export function lastUserMessage(contents: SanitizedMessage[]): string {
  return contents[contents.length - 1]?.parts[0]?.text || '';
}

/**
 * Best-effort client identity from headers.
 * Works for Express headers (lowercase) and Cloudflare's CF-Connecting-IP.
 */
export function clientIpFromHeaders(headers: Record<string, string | string[] | undefined>): string {
  const pick = (name: string): string | undefined => {
    const value = headers[name];
    if (Array.isArray(value)) return value[0];
    return value;
  };

  const cf = pick('cf-connecting-ip');
  if (cf) return cf.trim();

  const forwarded = pick('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0].trim();
    if (first) return first;
  }

  const real = pick('x-real-ip');
  if (real) return real.trim();

  return 'unknown';
}
