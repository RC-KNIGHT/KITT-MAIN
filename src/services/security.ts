/**
 * Shared request/response security helpers.
 *
 * Extracted from `server.ts` so the Express server and the Cloudflare Pages
 * Functions enforce byte-for-byte identical payload inspection and credential
 * redaction. Duplicating these would risk the edge quietly becoming the weaker
 * of the two entry points.
 */

import { readEnv } from './runtimeEnv';

/**
 * Deep payload inspection for prototype pollution, null-byte poisoning and
 * reflected XSS. Calibrated to still permit valid C/C++, Arduino firmware,
 * netlists and formulas.
 *
 * @returns `true` when the payload must be rejected.
 */
export function inspectPayloadSecurity(val: any, depth = 0): boolean {
  if (depth > 10) return true; // Block nested recursion attacks

  if (typeof val === 'string') {
    // Block null byte poisoning
    if (val.includes('\0')) return true;
    // Block active XSS script tags and javascript: protocol URIs
    if (/<script\b[^>]*>/i.test(val) || /javascript:\s*[a-z0-9_]/i.test(val)) return true;
    return false;
  }

  if (val && typeof val === 'object') {
    // Block Prototype Pollution
    for (const key of Object.keys(val)) {
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        return true;
      }
      if (inspectPayloadSecurity(val[key], depth + 1)) return true;
    }
  }

  return false;
}

/**
 * Strips any credential material from model output before it reaches a client.
 * Covers the configured keys plus generic Gemini/OpenAI/Bearer token shapes.
 */
export function redactSensitiveOutput(text: string): string {
  let sanitized = text;
  const keys = [
    readEnv('GEMINI_API_KEY'),
    readEnv('GEMINI_API_KEY_LANDING'),
    readEnv('GEMINI_API_KEY_CORE'),
  ].filter(Boolean) as string[];

  for (const apiKey of keys) {
    if (apiKey && apiKey.length > 8) {
      sanitized = sanitized.split(apiKey).join('[REDACTED_CREDENTIAL]');
    }
  }
  sanitized = sanitized.replace(/AIza[0-9A-Za-z-_]{35}/g, '[REDACTED_API_KEY]');
  sanitized = sanitized.replace(/sk-[a-zA-Z0-9]{32,}/g, '[REDACTED_API_KEY]');
  sanitized = sanitized.replace(/Bearer\s+[a-zA-Z0-9_\-\.\=]{20,}/gi, 'Bearer [REDACTED_TOKEN]');
  return sanitized;
}

/**
 * Best-effort sliding-window limiter for runtimes without shared process state.
 *
 * On Cloudflare Workers each isolate keeps its own map, so this throttles abuse
 * within a single isolate rather than globally. It is a degradation guard, not a
 * replacement for Cloudflare's own rate limiting rules.
 */
export class SlidingWindowLimiter {
  private store = new Map<string, { count: number; resetAt: number }>();

  constructor(private maxEntries = 5000) {}

  public check(key: string, limit: number, windowMs: number): { allowed: boolean; retryAfterSec?: number } {
    const now = Date.now();
    const record = this.store.get(key);

    if (!record || now > record.resetAt) {
      this.setBounded(key, { count: 1, resetAt: now + windowMs });
      return { allowed: true };
    }

    if (record.count >= limit) {
      return {
        allowed: false,
        retryAfterSec: Math.max(1, Math.ceil((record.resetAt - now) / 1000)),
      };
    }

    record.count++;
    return { allowed: true };
  }

  /** Drops expired windows so a long-lived isolate cannot grow unbounded. */
  public prune(): void {
    const now = Date.now();
    for (const [key, record] of this.store.entries()) {
      if (now > record.resetAt) this.store.delete(key);
    }
  }

  private setBounded(key: string, value: { count: number; resetAt: number }): void {
    if (!this.store.has(key) && this.store.size >= this.maxEntries) {
      const oldest = this.store.keys().next();
      if (!oldest.done) this.store.delete(oldest.value);
    }
    this.store.set(key, value);
  }
}
