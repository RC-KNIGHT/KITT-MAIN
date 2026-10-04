import { handleKittCoreChat } from '../../src/services/edgeApi';
import { toResponse, parseJsonBody, headerRecord } from './_shared';

interface PagesContext {
  request: Request;
  env: Record<string, unknown>;
}

export const onRequestPost = async (context: PagesContext): Promise<Response> => {

  const parsed = await parseJsonBody(context.request);
  if ('error' in parsed) return parsed.error;

return toResponse(await handleKittCoreChat(parsed.body, headerRecord(context.request), context.env));
};
