/**
 * Adapter between the runtime-agnostic edge handlers and Cloudflare's
 * `Response` API. Kept tiny so each route file stays declarative.
 */

import type { EdgeApiResponse } from '../../src/services/edgeApi';

export function toResponse(result: EdgeApiResponse): Response {
  const headers = new Headers(result.headers);
  headers.set('Content-Type', result.contentType || 'application/json; charset=utf-8');
  headers.set('Cache-Control', 'no-store');

  if (result.raw !== undefined) {
    return new Response(result.raw, { status: result.status, headers });
  }

  return new Response(JSON.stringify(result.body ?? {}), { status: result.status, headers });
}

/** Reads a JSON body defensively; returns `null` when absent or malformed. */
export async function readJson(request: Request): Promise<any> {
  try {
    const text = await request.text();
    if (!text) return {};
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/** Flattens request headers into a plain object for the handlers. */
export function headerRecord(request: Request): Record<string, string> {
  const out: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    out[key.toLowerCase()] = value;
  });
  return out;
}
