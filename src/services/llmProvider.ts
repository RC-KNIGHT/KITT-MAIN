/**
 * LLM provider abstraction.
 *
 * KITT supports two back-ends behind one interface so the rest of the codebase
 * never branches on provider:
 *
 *   - Google Gemini (`@google/genai`)
 *   - NVIDIA NIM (`https://integrate.api.nvidia.com/v1`, OpenAI-compatible)
 *
 * `IGeminiClient` (low level, in geminiClient.ts) is used by the orchestrator for
 * structured hardware generation. `ILlmProvider` here is the slightly higher
 * level surface used by the conversational endpoints, which need plain text plus
 * the model name that answered.
 */

import { GoogleGenAI } from '@google/genai';
import { getGeminiClient, IGeminiClient, RealGeminiClient } from './geminiClient';
import { NimGeminiClient } from './nimClient';
import {
  NIM_CHAT_URL,
  NIM_FALLBACK_MODELS,
  resolveNimModel,
  resolveNimTimeoutMs,
} from './nimConfig';
import { readEnv, resolveGeminiApiKey, resolveNvidiaApiKey } from './runtimeEnv';

export type LlmProviderName = 'nvidia-nim' | 'gemini' | 'offline';

export interface LlmTextRequest {
  systemInstruction: string;
  contents: Array<{ role: string; parts: Array<{ text: string }> }>;
  temperature?: number;
  topP?: number;
  maxOutputTokens?: number;
  modelName?: string;
}

export interface LlmTextResult {
  text: string;
  model: string;
}

export interface ILlmProvider {
  readonly name: LlmProviderName;
  /** Plain-text completion with automatic model fallback. */
  generateText(request: LlmTextRequest): Promise<LlmTextResult>;
}

/** Default NVIDIA NIM model, overridable by env. */
export { resolveNimModel };

/**
 * NVIDIA NIM provider. Uses the OpenAI-compatible chat completions endpoint.
 * Tries the configured model first, then the known-good fallbacks, mirroring the
 * Gemini client's resilience behaviour.
 */
export class NimLlmProvider implements ILlmProvider {
  public readonly name: LlmProviderName = 'nvidia-nim';

  constructor(private apiKey: string) {}

  public async generateText(request: LlmTextRequest): Promise<LlmTextResult> {
    const preferred = request.modelName || resolveNimModel();
    const models = [preferred, ...NIM_FALLBACK_MODELS.filter(m => m !== preferred)];

    const messages = [
      { role: 'system', content: request.systemInstruction },
      ...request.contents.map(c => ({
        role: c.role === 'model' ? 'assistant' : c.role,
        content: c.parts.map(p => p.text).join('\n'),
      })),
    ];

    let lastError: any = null;

    for (const model of models) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), resolveNimTimeoutMs());
      try {
        const res = await fetch(NIM_CHAT_URL, {
          method: 'POST',
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            model,
            messages,
            temperature: request.temperature ?? 0.7,
            top_p: request.topP ?? 0.95,
            max_tokens: request.maxOutputTokens ?? 4096,
            stream: false,
          }),
        });

        if (!res.ok) {
          lastError = new Error(`NIM ${model} returned HTTP ${res.status}`);
          continue;
        }

        const json: any = await res.json();
        const text = json?.choices?.[0]?.message?.content;
        if (typeof text === 'string' && text.trim().length > 0) {
          return { text, model: json.model || model };
        }
        lastError = new Error(`NIM ${model} returned an empty completion`);
      } catch (err: any) {
        lastError = err;
      } finally {
        clearTimeout(timer);
      }
    }

    throw lastError || new Error('All NVIDIA NIM models failed');
  }
}

/** Gemini provider wrapping the existing client. */
export class GeminiLlmProvider implements ILlmProvider {
  public readonly name: LlmProviderName = 'gemini';

  constructor(private apiKey: string) {}

  public async generateText(request: LlmTextRequest): Promise<LlmTextResult> {
    const ai = new GoogleGenAI({
      apiKey: this.apiKey,
      httpOptions: { headers: { 'User-Agent': 'kitt-edge-landing' } },
    });

    const preferred = request.modelName;
    const candidates = preferred
      ? [preferred, 'gemini-2.5-flash', 'gemini-2.0-flash']
      : ['gemini-2.5-flash', 'gemini-2.0-flash'];

    let lastError: any = null;

    for (const model of candidates) {
      try {
        const response: any = await ai.models.generateContent({
          model,
          contents: request.contents,
          config: {
            systemInstruction: request.systemInstruction,
            temperature: request.temperature ?? 0.7,
            topP: request.topP ?? 0.95,
            maxOutputTokens: request.maxOutputTokens,
          },
        });
        if (response?.text) {
          return { text: response.text, model };
        }
        lastError = new Error(`Gemini ${model} returned no text`);
      } catch (err: any) {
        lastError = err;
      }
    }

    throw lastError || new Error('All Gemini models failed');
  }
}

/**
 * Picks a provider from the available credentials.
 *
 * NVIDIA is preferred when both are configured, because a working NIM key is
 * what the deployment actually has; set `KITT_LLM_PROVIDER=gemini` to override.
 */
export function resolveLlmProvider(): ILlmProvider | null {
  const forced = (readEnv('KITT_LLM_PROVIDER') || '').toLowerCase();
  const nvidiaKey = resolveNvidiaApiKey();
  const geminiKey = resolveGeminiApiKey();

  if (forced === 'nvidia' || forced === 'nim') {
    return nvidiaKey ? new NimLlmProvider(nvidiaKey) : null;
  }
  if (forced === 'gemini') {
    return geminiKey ? new GeminiLlmProvider(geminiKey) : null;
  }

  if (nvidiaKey) return new NimLlmProvider(nvidiaKey);
  if (geminiKey) return new GeminiLlmProvider(geminiKey);
  return null;
}

/** Human-readable description of the active configuration, for /api/health. */
export function describeLlmConfiguration(): { provider: LlmProviderName; model: string | null } {
  const provider = resolveLlmProvider();
  if (!provider) return { provider: 'offline', model: null };
  if (provider.name === 'nvidia-nim') return { provider: provider.name, model: resolveNimModel() };
  return { provider: provider.name, model: 'gemini-2.5-flash' };
}

/**
 * Structured-generation client for the orchestrator.
 *
 * Honours `KITT_LLM_PROVIDER` symmetrically. Previously `forced === 'gemini'`
 * with only an NVIDIA key fell through to `getGeminiClient()`, which returns the
 * *mock* client when no Gemini key exists -- so an operator's explicit choice
 * silently produced canned demo content instead of a real error.
 */
export function resolveStructuredClient(): IGeminiClient {
  const forced = (readEnv('KITT_LLM_PROVIDER') || '').toLowerCase();
  const nvidiaKey = resolveNvidiaApiKey();
  const geminiKey = resolveGeminiApiKey();

  if (forced === 'gemini') {
    if (!geminiKey) {
      console.warn('[LLM] KITT_LLM_PROVIDER=gemini but no Gemini key is configured; using mock client.');
    }
    return getGeminiClient();
  }

  if (forced === 'nvidia' || forced === 'nim') {
    if (!nvidiaKey) {
      console.warn('[LLM] KITT_LLM_PROVIDER=nvidia but NVIDIA_API_KEY is not set; using mock client.');
      return getGeminiClient();
    }
    return new NimGeminiClient(nvidiaKey, resolveNimModel());
  }

  // Auto: prefer whichever credential actually exists.
  if (nvidiaKey) {
    return new NimGeminiClient(nvidiaKey, resolveNimModel());
  }
  return getGeminiClient();
}

/** True when any usable LLM credential exists. */
export function hasLlmCredentials(): boolean {
  return Boolean(resolveNvidiaApiKey() || resolveGeminiApiKey());
}

export { RealGeminiClient };
