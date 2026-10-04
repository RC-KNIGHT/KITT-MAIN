/**
 * Catch-all for unknown `/api/*` paths.
 *
 * Without this, an unknown API route falls through to the single-page-app
 * fallback and returns `index.html` with HTTP 200. A client then tries to
 * `JSON.parse` an HTML document and reports a confusing syntax error instead of
 * "endpoint does not exist".
 *
 * More specific routes (`/api/health`, `/api/kitt-org-chat`, ...) take
 * precedence over this file.
 */

const json = (status: number, body: unknown): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });

export const onRequest = async (context: { request: Request; params: Record<string, any> }): Promise<Response> => {
  const url = new URL(context.request.url);
  const requested = context.params?.path;
  const path = Array.isArray(requested) ? requested.join('/') : requested;

  return json(404, {
    error: 'Unknown API endpoint.',
    path: url.pathname,
    resolvedPath: path ? `/api/${path}` : url.pathname,
    hint: 'Valid endpoints: GET /api/health, POST /api/kitt-org-chat, POST /api/kitt-core-chat, POST /api/ai/compile-firmware, POST /api/ai/validate-panel.',
  });
};
