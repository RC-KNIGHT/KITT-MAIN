import { handleKittCoreChat } from '../../src/services/edgeApi';
import { toResponse, readJson, headerRecord } from './_shared';

interface PagesContext {
  request: Request;
  env: Record<string, unknown>;
}

export const onRequestPost = async (context: PagesContext): Promise<Response> => {
  const body = await readJson(context.request);
  if (body === null) {
    return new Response(JSON.stringify({ error: 'Malformed JSON payload.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  }

  return toResponse(await handleKittCoreChat(body, headerRecord(context.request), context.env));
};
