import { handleHealth } from '../../src/services/edgeApi';
import { toResponse } from './_shared';

interface PagesContext {
  env: Record<string, unknown>;
}

export const onRequestGet = async (context: PagesContext): Promise<Response> => {
  return toResponse(await handleHealth(context.env));
};
