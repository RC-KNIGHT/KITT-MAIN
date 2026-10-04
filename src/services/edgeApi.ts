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

import { GoogleGenAI } from '@google/genai';
import { kittOrchestrator, createEdgeOrchestrator } from './orchestrator';
import { edgeFirmwareCompiler } from './firmwareCompiler';
import { analyzeStatically, scanCodeSecurity, validateHardwarePins } from './firmwareAnalyzer';
import { electricalPanelEngine } from './electricalPanelEngine';
import { inspectPayloadSecurity, redactSensitiveOutput, SlidingWindowLimiter } from './security';
import { setRuntimeEnv, resolveGeminiApiKey } from './runtimeEnv';
import {
  KITT_ORG_AI_SYSTEM_INSTRUCTION,
  generateIntelligentFallback,
} from './apiPrompts';

const limiter = new SlidingWindowLimiter();

const CANDIDATE_MODELS = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];

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
  return (
    headers['cf-connecting-ip'] ||
    (headers['x-forwarded-for'] || '').split(',')[0].trim() ||
    'unknown'
  );
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
    // Cloudflare Pages preview + production domains
    if (originUrl.hostname.endsWith('.pages.dev')) return true;
    const whitelist = (process.env?.ALLOWED_ORIGINS || '')
      .split(',')
      .map((s: string) => s.trim())
      .filter(Boolean);
    if (whitelist.includes(origin) || whitelist.includes(originUrl.hostname)) return true;
  } catch {
    return false;
  }
  return false;
}

function sanitizeContents(messages: any[]): { role: string; parts: { text: string }[] }[] | { error: string } {
  const out: { role: string; parts: { text: string }[] }[] = [];

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    if (typeof msg !== 'object' || msg === null) {
      return { error: `Message at index ${i} is malformed.` };
    }
    const { role, content } = msg;
    if (typeof role !== 'string' || !['user', 'assistant', 'model'].includes(role)) {
      return { error: `Message at index ${i} has an invalid role. Allowed: 'user', 'assistant', 'model'.` };
    }
    if (typeof content !== 'string' || content.trim().length === 0 || content.length > 3000) {
      return { error: `Message at index ${i} must have content between 1 and 3000 characters.` };
    }
    const cleanText = content
      .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F]/g, '')
      .trim();
    out.push({ role: role === 'assistant' || role === 'model' ? 'model' : 'user', parts: [{ text: cleanText }] });
  }

  return out;
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

    const { messages } = body;
    if (!Array.isArray(messages) || messages.length === 0 || messages.length > 20) {
      return json(400, {
        error: "Invalid 'messages' field: Must be an array containing between 1 and 20 items.",
      });
    }

    const sanitized = sanitizeContents(messages);
    if ('error' in sanitized) {
      return json(400, { error: sanitized.error });
    }

    const lastUserMsg = sanitized[sanitized.length - 1]?.parts[0]?.text || '';
    const apiKey = resolveGeminiApiKey();

    if (!apiKey) {
      return json(200, { reply: generateIntelligentFallback(lastUserMsg), model: 'offline-fallback' });
    }

    const ai = new GoogleGenAI({ apiKey, httpOptions: { headers: { 'User-Agent': 'kitt-edge-landing' } } });

    let response: any = null;
    let modelUsed = CANDIDATE_MODELS[0];
    let lastError: any = null;

    for (const model of CANDIDATE_MODELS) {
      try {
        response = await ai.models.generateContent({
          model,
          contents: sanitized,
          config: {
            systemInstruction: KITT_ORG_AI_SYSTEM_INSTRUCTION,
            temperature: 0.7,
            topP: 0.95,
          },
        });
        if (response && response.text) {
          modelUsed = model;
          break;
        }
      } catch (modelErr: any) {
        lastError = modelErr;
        console.warn(`[GEMINI] Model ${model} failed: ${modelErr?.message}`);
      }
    }

    if (!response || !response.text) {
      console.warn(`[GEMINI] All models failed (${lastError?.message}); using local fallback.`);
      return json(200, { reply: generateIntelligentFallback(lastUserMsg), model: 'offline-fallback-degraded' });
    }

    return json(200, {
      reply: redactSensitiveOutput(response.text),
      model: modelUsed,
    });
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
    const hasKey = Boolean(resolveGeminiApiKey());
    const orchestrator = hasKey ? createEdgeOrchestrator(edgeFirmwareCompiler) : kittOrchestrator;

    const result = await orchestrator.handleCoreChatRequest({ messages, circuit, telemetry, requestId });

    return json(200, {
      reply: redactSensitiveOutput(result.reply),
      proposedPatch: result.proposedPatch,
      panelReport: result.panelReport,
      simulationReport: result.simulationReport,
      compileResult: result.compileResult,
      bom: result.bom,
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
  const keyPresent = Boolean(resolveGeminiApiKey());
  return json(200, {
    status: 'ok',
    service: 'KITT Edge AI (Cloudflare Pages Functions)',
    aiConfigured: keyPresent,
    mode: keyPresent ? 'live-gemini' : 'offline-fallback',
    timestamp: new Date().toISOString(),
  });
}
