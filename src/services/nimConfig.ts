/**
 * Single source of truth for NVIDIA NIM connection settings.
 *
 * These values were previously duplicated between `nimClient.ts` (the
 * orchestrator's structured-generation path) and `llmProvider.ts` (the
 * conversational path). Editing one list and not the other would silently make
 * the landing chat and the AI studio run different models, which is the same
 * class of drift that previously let the prompt text diverge.
 */

import { readEnv } from './runtimeEnv';

export const NIM_CHAT_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';

/**
 * Model preference order, verified against the orchestrator's schema.
 *
 * Only models that reliably return the `{actionType, payload}` contract are
 * listed. `nvidia/nemotron-3.5-lightning-30b-a3b` was measured at 126s and
 * returned zero valid actions, so it is deliberately excluded.
 */
export const NIM_FALLBACK_MODELS = [
  'nvidia/nemotron-3-super-120b-a12b',
  'openai/gpt-oss-20b',
];

/** Default model, overridable per deployment. */
export function resolveNimModel(): string {
  return readEnv('NVIDIA_MODEL') || NIM_FALLBACK_MODELS[0];
}

/**
 * Per-model-call timeout. Kept above measured latency (~19-31s) but below the
 * point where a hung request would exhaust the runtime's budget.
 */
export function resolveNimTimeoutMs(): number {
  const configured = Number(readEnv('NIM_TIMEOUT_MS'));
  return Number.isFinite(configured) && configured > 0 ? configured : 60000;
}
