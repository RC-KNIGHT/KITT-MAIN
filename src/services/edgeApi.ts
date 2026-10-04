/**
 * KITT AI edge API.
 *
 * These handlers implement the two endpoints the frontend actually calls, plus
 * health/diagnostics, for the Cloudflare Pages deployment. They deliberately
 * reuse the same prompt text, payload inspection, credential redaction and
 * orchestrator as the Node server, so production and local development give the
 * same answers and enforce the same rules.
 *
 * A Pages Function cannot run `server.ts`: it has no OS, no filesystem and no
 * subprocesses. Everything below is therefore built from the runtime-agnostic
 * service modules.
 */

import { createEdgeOrchestrator } from './orchestrator';
import { edgeFirmwareCompiler } from './firmwareCompiler';
import { analyzeStatically, scanCodeSecurity, validateHardwarePins } from './firmwareAnalyzer';
import { electricalPanelEngine } from './electricalPanelEngine';
import { inspectPayloadSecurity, redactSensitiveOutput, SlidingWindowLimiter } from './security';
import { setRuntimeEnv, readEnv } from './runtimeEnv';
import { sanitizeMessages, clientIpFromHeaders, lastUserMessage, isSanitizeFailure } from './chatValidation';
import { resolveLlmProvider, describeLlmConfiguration, resolveStructuredClient } from './llmProvider';
import {
  KITT_ORG_AI_SYSTEM_INSTRUCTION,
  generateIntelligentFallback,
} from './apiPrompts';

const limiter = new SlidingWindowLimiter();

// Gemini model preference list is now owned by the provider layer
// (src/services/llmProvider.ts), which also supports NVIDIA NIM.

export interface EdgeApiResponse {
  status: number;
  body?: unknown;
  raw?: string;
  contentType?: string;
  headers?: Record<string, string>;
}

/** Populates environment bindings for runtimes without `process.env`. */
function applyEnv(env?: Record<string, unknown>): void {
  if (!env) return;
  const flat: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(env)) {
    if (typeof value === 'string') flat[key] = value;
  }
  setRuntimeEnv(flat);
}

function json(status: number, body: unknown, headers?: Record<string, string>): EdgeApiResponse {
  return { status, body, contentType: 'application/json; charset=utf-8', headers };
}

/** Best-effort client identity; Cloudflare always supplies CF-Connecting-IP. */
function clientIp(headers: Record<string, string>): string {
  return clientIpFromHeaders(headers);
}

/** Same-origin check mirroring the Express `isAllowedOrigin` shield. */
function isAllowedOrigin(origin: string | undefined, host: string | undefined): boolean {
  if (!origin) return true;
  try {
    const originUrl = new URL(origin);
    if (host) {
      const hostname = host.split(':')[0];
      if (originUrl.hostname === hostname || originUrl.host === host) return true;
    }
    // Same-origin is already covered by the host comparison above. Trusting
    // every *.pages.dev host would let any other Cloudflare Pages site call
    // these endpoints from a browser and spend the project's API quota.
    const whitelist = (readEnv('ALLOWED_ORIGINS') || '')
      .split(',')
      .map((s: string) => s.trim())
      .filter(Boolean);
    if (whitelist.includes(origin) || whitelist.includes(originUrl.hostname)) return true;
  } catch {
    return false;
  }
  return false;
}

/**
 * POST /api/kitt-org-chat — the landing page conversation.
 */
export async function handleKittOrgChat(
  body: any,
  headers: Record<string, string>,
  env?: Record<string, unknown>
): Promise<EdgeApiResponse> {
  applyEnv(env);

  if (!isAllowedOrigin(headers['origin'], headers['host'])) {
    return json(403, { error: 'Forbidden: Unauthorized cross-origin request rejected.' });
  }

  const ip = clientIp(headers);
  limiter.prune();
  const { allowed, retryAfterSec } = limiter.check('chat_' + ip, 30, 60000);
  if (!allowed) {
    return json(
      429,
      { error: 'Conversation rate limit reached. Please wait a few seconds before asking again.' },
      { 'Retry-After': String(retryAfterSec) }
    );
  }

  try {
    if (typeof body !== 'object' || body === null) {
      return json(400, { error: 'Invalid request payload format.' });
    }
    if (inspectPayloadSecurity(body)) {
      return json(400, { error: 'Security alert: Illegal payload patterns detected.' });
    }

    const sanitized = sanitizeMessages(body.messages);
    if (isSanitizeFailure(sanitized)) {
      return json(400, { error: sanitized.error });
    }

    const lastUserMsg = lastUserMessage(sanitized.contents);
    const provider = resolveLlmProvider();

    if (!provider) {
      return json(200, { reply: generateIntelligentFallback(lastUserMsg), model: 'offline-fallback' });
    }

    try {
      const result = await provider.generateText({
        systemInstruction: KITT_ORG_AI_SYSTEM_INSTRUCTION,
        contents: sanitized.contents,
        temperature: 0.7,
        topP: 0.95,
        maxOutputTokens: 4096,
      });

      return json(200, {
        reply: redactSensitiveOutput(result.text),
        model: result.model,
        provider: provider.name,
      });
    } catch (providerErr: any) {
      console.warn(`[LLM] ${provider.name} failed: ${providerErr?.message}; using local fallback.`);
      return json(200, { reply: generateIntelligentFallback(lastUserMsg), model: 'offline-fallback-degraded' });
    }
  } catch (error: any) {
    console.error(`[SECURITY] Error in /api/kitt-org-chat: ${error?.message}`);
    const lastUserMsg = Array.isArray(body?.messages)
      ? body.messages[body.messages.length - 1]?.content || ''
      : '';
    return json(200, { reply: generateIntelligentFallback(lastUserMsg), model: 'offline-fallback-exception' });
  }
}

/**
 * POST /api/kitt-core-chat — the KITT AI Studio hardware agent.
 * Runs the full orchestrator with the edge firmware compiler injected.
 */
export async function handleKittCoreChat(
  body: any,
  headers: Record<string, string>,
  env?: Record<string, unknown>
): Promise<EdgeApiResponse> {
  applyEnv(env);

  if (!isAllowedOrigin(headers['origin'], headers['host'])) {
    return json(403, { error: 'Forbidden: Unauthorized cross-origin request rejected.' });
  }

  const ip = clientIp(headers);
  limiter.prune();
  const { allowed, retryAfterSec } = limiter.check('core_chat_' + ip, 30, 60000);
  if (!allowed) {
    return json(
      429,
      { error: 'Core conversation rate limit reached. Please wait a moment before sending another prompt.' },
      { 'Retry-After': String(retryAfterSec) }
    );
  }

  try {
    if (typeof body !== 'object' || body === null) {
      return json(400, { error: 'Invalid request payload format.' });
    }
    if (inspectPayloadSecurity(body)) {
      return json(400, { error: 'Security alert: Illegal payload patterns detected.' });
    }

    const { messages, circuit, telemetry } = body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return json(400, { error: "Invalid 'messages' field: Must be a non-empty array." });
    }

    const requestId = `core_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // Edge runtime cannot spawn a compiler, so inject the analysis-only strategy.
    // The structured client is resolved lazily inside the orchestrator, after
    // applyEnv() has populated the request-scoped bindings.
    const orchestrator = createEdgeOrchestrator(edgeFirmwareCompiler);

    const result = await orchestrator.handleCoreChatRequest({ messages, circuit, telemetry, requestId });

    // A total model failure must not masquerade as a successful empty design.
    const status = result.modelError ? 502 : 200;

    return json(status, {
      reply: redactSensitiveOutput(result.reply),
      proposedPatch: result.proposedPatch,
      panelReport: result.panelReport,
      simulationReport: result.simulationReport,
      compileResult: result.compileResult,
      bom: result.bom,
      modelError: result.modelError,
      model: result.model,
      isMock: result.isMock,
    });
  } catch (error: any) {
    console.error(`[SECURITY] Error in /api/kitt-core-chat: ${error?.message}`);
    return json(500, {
      error: 'An internal error occurred.',
      reply: 'KITT Core encountered a simulation processing issue. Please resend your inquiry.',
    });
  }
}

/**
 * POST /api/ai/compile-firmware — static firmware verification on the edge.
 */
export async function handleCompileFirmware(
  body: any,
  headers: Record<string, string>,
  env?: Record<string, unknown>
): Promise<EdgeApiResponse> {
  applyEnv(env);

  if (!isAllowedOrigin(headers['origin'], headers['host'])) {
    return json(403, { error: 'Forbidden: Unauthorized origin.' });
  }

  const ip = clientIp(headers);
  limiter.prune();
  const { allowed, retryAfterSec } = limiter.check('compile_' + ip, 15, 60000);
  if (!allowed) {
    return json(429, { error: 'Compile rate limit reached. Please wait before compiling again.' }, {
      'Retry-After': String(retryAfterSec),
    });
  }

  try {
    const { sourceCode, targetMcu } = body || {};
    if (!sourceCode || typeof sourceCode !== 'string') {
      return json(400, { error: "Missing required 'sourceCode' field." });
    }

    const target = targetMcu || 'arduino:avr:uno';
    const startTime = Date.now();

    const sec = scanCodeSecurity(sourceCode);
    if (!sec.safe) {
      return json(200, {
        success: false,
        compilerOutput: sec.violations.join('\n'),
        errors: sec.violations,
        warnings: [],
        targetBoard: target,
        sourceCode,
        durationMs: Date.now() - startTime,
        compiledWith: 'static-isolated-analyzer',
      });
    }

    const pins = validateHardwarePins(sourceCode, target);
    if (!pins.valid) {
      return json(200, {
        success: false,
        compilerOutput: pins.errors.join('\n'),
        errors: pins.errors,
        warnings: [],
        targetBoard: target,
        sourceCode,
        durationMs: Date.now() - startTime,
        compiledWith: 'static-isolated-analyzer',
      });
    }

    return json(200, analyzeStatically(sourceCode, target, startTime));
  } catch (err: any) {
    return json(500, { error: err?.message || 'Compilation failed' });
  }
}

/**
 * POST /api/ai/validate-panel — electrical panel safety evaluation (pure logic).
 */
export async function handleValidatePanel(
  body: any,
  headers: Record<string, string>,
  env?: Record<string, unknown>
): Promise<EdgeApiResponse> {
  applyEnv(env);

  if (!isAllowedOrigin(headers['origin'], headers['host'])) {
    return json(403, { error: 'Forbidden: Unauthorized origin.' });
  }

  try {
    const { panel, actions } = body || {};
    const builtPanel =
      actions && Array.isArray(actions) ? electricalPanelEngine.buildPanelFromActions(actions, panel) : panel;

    if (!builtPanel) {
      return json(400, { error: 'Missing panel configuration or actions.' });
    }

    return json(200, electricalPanelEngine.evaluatePanel(builtPanel));
  } catch (err: any) {
    return json(500, { error: err?.message || 'Panel validation failed' });
  }
}

/**
 * GET /api/health — confirms the edge backend is live.
 * Distinguishes "function deployed" from "API key configured" so a missing key
 * is visible instead of looking like a working AI.
 */
export async function handleHealth(env?: Record<string, unknown>): Promise<EdgeApiResponse> {
  applyEnv(env);
  const { provider, model } = describeLlmConfiguration();
  return json(200, {
    status: 'ok',
    service: 'KITT Edge AI (Cloudflare Pages Functions)',
    aiConfigured: provider !== 'offline',
    provider,
    model,
    mode: provider === 'offline' ? 'offline-fallback' : 'live',
    timestamp: new Date().toISOString(),
  });
}
