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

/**
 * Maximum accepted request body. Mirrors the Express server's 15mb JSON cap so
 * the same endpoint is not hardened differently depending on the runtime, and
 * prevents an unbounded body being buffered into Worker memory.
 */
export const MAX_BODY_BYTES = 15 * 1024 * 1024;

export class BodyTooLargeError extends Error {
  constructor(public readonly bytes: number) {
    super(`Request body exceeds the ${MAX_BODY_BYTES} byte limit`);
    this.name = 'BodyTooLargeError';
  }
}

/** Reads a JSON body defensively; returns `null` when absent or malformed. */
export async function readJson(request: Request): Promise<any> {
  // Reject on the declared length before buffering anything.
  const declared = Number(request.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
    throw new BodyTooLargeError(declared);
  }

  try {
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) {
      throw new BodyTooLargeError(text.length);
    }
    if (!text) return {};
    return JSON.parse(text);
  } catch (err) {
    if (err instanceof BodyTooLargeError) throw err;
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

const errorJson = (status: number, body: unknown): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });

/**
 * Parses the request body, converting the two failure modes into Responses so
 * every route file stays declarative:
 *   - oversized body  -> 413
 *   - malformed JSON  -> 400
 */
export async function parseJsonBody(
  request: Request
): Promise<{ body: any } | { error: Response }> {
  let body: any;
  try {
    body = await readJson(request);
  } catch (err) {
    if (err instanceof BodyTooLargeError) {
      return {
        error: errorJson(413, {
          error: 'Request body too large.',
          limitBytes: MAX_BODY_BYTES,
          receivedBytes: err.bytes,
        }),
      };
    }
    return { error: errorJson(400, { error: 'Malformed request body.' }) };
  }

  if (body === null) {
    return { error: errorJson(400, { error: 'Malformed JSON payload.' }) };
  }

  return { body };
}
