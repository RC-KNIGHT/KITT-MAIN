/**
 * NVIDIA NIM adapter for the orchestrator's structured generation contract.
 *
 * The orchestrator was written against Gemini's `generateStructuredContent`
 * (system instruction + response schema + JSON response mime type). NIM is
 * OpenAI-compatible and has no native equivalent of `responseSchema`, so this
 * adapter:
 *
 *   1. Translates the Gemini-style contents array into chat messages.
 *   2. Converts the response schema into an explicit JSON contract appended to
 *      the system instruction.
 *   3. Extracts the JSON object from the reply, tolerating markdown fences, and
 *      reports failure honestly so the orchestrator's repair gate can run.
 */

import { IGeminiClient, GenerateOptions, GenerationResult } from './geminiClient';
import { Logger } from './logger';
import { StructuredHardwareResponse } from './schemas/actionSchema';
import { HARDWARE_CONTRACT_TEXT } from './schemas/hardwareResponseSchema';
import {
  NIM_CHAT_URL,
  NIM_FALLBACK_MODELS as FALLBACK_MODELS,
  resolveNimTimeoutMs,
} from './nimConfig';

const logger = new Logger('NimClient');

/** fetch with an abort deadline, so a hang always resolves into our error path. */
async function fetchWithTimeout(
  input: string,
  init: RequestInit,
  timeoutMs: number = resolveNimTimeoutMs()
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/** Recursively converts a Gemini `Type`-annotated schema into plain JSON Schema. */
function normalizeSchema(node: any): any {
  if (node === null || node === undefined) return undefined;

  if (Array.isArray(node)) return node.map(normalizeSchema);

  if (typeof node !== 'object') return node;

  const out: Record<string, any> = {};
  for (const [key, value] of Object.entries(node)) {
    if (key === 'type' && typeof value === 'string') {
      out.type = value.toLowerCase();
      continue;
    }
    out[key] = normalizeSchema(value);
  }
  return out;
}

/**
 * Repairs the two JSON defects chat models produce most often:
 *   1. Raw control characters (newlines/tabs) inside string values, which are
 *      illegal in JSON but extremely common in multi-line explanations.
 *   2. Trailing commas before a closing brace/bracket.
 *
 * Both repairs are string-aware. A naive /,(\s*[}\]])/ replacement would also
 * delete a legitimate comma that happens to sit inside a string value just
 * before a closing character (e.g. "across VCC and pin 1, }"), silently
 * corrupting content in exactly the replies that needed repair.
 */
function repairJsonText(text: string): string {
  let out = '';
  let inString = false;
  let escaped = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (!inString) {
      // A comma is only a candidate for removal; we keep it until we know the
      // next non-whitespace character actually closes the structure.
      if (ch === ',') {
        out += ch;
        let j = i + 1;
        while (j < text.length && /\s/.test(text[j])) j++;
        if (j < text.length && (text[j] === '}' || text[j] === ']')) {
          // Drop the comma; the buffer keeps its whitespace/newlines.
          out = out.slice(0, -1);
        }
        continue;
      }
      if (ch === '"') {
        inString = true;
      }
      out += ch;
      continue;
    }

    // Inside a string
    if (escaped) {
      out += ch;
      escaped = false;
      continue;
    }
    if (ch === '\\') {
      out += ch;
      escaped = true;
      continue;
    }
    if (ch === '"') {
      inString = false;
      out += ch;
      continue;
    }

    // Escape raw control characters that would invalidate the JSON.
    if (ch === '\n') {
      out += '\\n';
      continue;
    }
    if (ch === '\r') {
      out += '\\r';
      continue;
    }
    if (ch === '\t') {
      out += '\\t';
      continue;
    }
    if (ch < ' ') {
      out += '\\u' + ch.charCodeAt(0).toString(16).padStart(4, '0');
      continue;
    }

    out += ch;
  }

  return out;
}

/**
 * Pulls the first complete JSON object/array out of a model reply.
 *
 * Order matters: a straight parse is attempted first. Only if that fails do we
 * consider stripping markdown fences -- and then only at the very start/end of
 * the payload, because models often include ```code``` inside string values
 * (firmware sources), which a naive fence regex would truncate.
 */
export function extractJson(text: string): any | null {
  return extractJsonDetailed(text).value;
}

/**
 * As `extractJson`, but reports whether the reply looks truncated at the token
 * ceiling -- which is a retryable condition rather than malformed output.
 */
export function extractJsonDetailed(text: string): { value: any | null; truncated: boolean } {
  if (!text) return { value: null, truncated: false };

  const trimmed = text.trim();

  // 1. Already valid JSON
  try {
    return { value: JSON.parse(trimmed), truncated: false };
  } catch {
    /* continue */
  }

  // 2. Repair common model defects, then retry
  const repaired = repairJsonText(trimmed);
  try {
    return { value: JSON.parse(repaired), truncated: false };
  } catch {
    /* continue */
  }

  // 3. Strip a *wrapping* markdown fence only
  const wrapped = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (wrapped) {
    const inner = wrapped[1].trim();
    try {
      return { value: JSON.parse(inner), truncated: false };
    } catch {
      try {
        return { value: JSON.parse(repairJsonText(inner)), truncated: false };
      } catch {
        /* continue */
      }
    }
  }

  // 4. Scan for balanced object/array candidates, repairing as we go
  const startIdx = repaired.search(/[{[]/);
  if (startIdx === -1) {
    // No structure at all. This is usually a reply cut off before the first
    // brace (or a prose refusal), so treat it as retryable rather than
    // permanently malformed.
    return { value: null, truncated: true };
  }

  let inString = false;
  let escaped = false;
  let depth = 0;
  let candidateStart = startIdx;
  const openChar = repaired[startIdx];
  const closeChar = openChar === '{' ? '}' : ']';

  for (let i = startIdx; i < repaired.length; i++) {
    const ch = repaired[i];

    if (escaped) {
      escaped = false;
      continue;
    }
    // A backslash only escapes inside a string; outside one it is already
    // invalid JSON and must not desync the depth scan.
    if (ch === '\\' && inString) {
      escaped = true;
      continue;
    }
    if (ch === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;

    if (ch === openChar) {
      if (depth === 0) candidateStart = i;
      depth++;
    } else if (ch === closeChar) {
      depth--;
      if (depth === 0) {
        const candidate = repaired.slice(candidateStart, i + 1);
        try {
          return { value: JSON.parse(candidate), truncated: false };
        } catch {
          // This balanced slice was not valid JSON (e.g. prose containing
          // braces before the real object). Keep scanning for the next one.
          depth = 0;
          continue;
        }
      }
      if (depth < 0) {
        // Unbalanced closer; restart the search from the next opener.
        depth = 0;
      }
    }
  }

  // Never balanced: the reply was cut off mid-structure.
  return { value: null, truncated: true };
}

export class NimGeminiClient implements IGeminiClient {
  constructor(
    private apiKey: string,
    private preferredModel: string = FALLBACK_MODELS[0]
  ) {}

  public async generateStructuredContent<T = StructuredHardwareResponse>(
    options: GenerateOptions
  ): Promise<GenerationResult<T>> {
    const startTime = Date.now();
    const models = [this.preferredModel, ...FALLBACK_MODELS.filter(m => m !== this.preferredModel)];

    const messages = [
      {
        role: 'system',
        content: this.buildSystemInstruction(options),
      },
      ...options.contents.map(c => ({
        role: c.role === 'model' ? 'assistant' : c.role,
        content: c.parts.map(p => p.text).join('\n'),
      })),
    ];

    let lastError: any = null;
    let usedModel = this.preferredModel;

    for (const model of models) {
      try {
        logger.debug(`Calling NIM model ${model}`, { requestId: options.requestId });

        const res = await fetchWithTimeout(NIM_CHAT_URL, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            model,
            messages,
            temperature: options.temperature ?? 0.4,
            top_p: options.topP ?? 0.95,
            // Hardware responses legitimately run long (a full netlist plus
            // firmware). A low ceiling truncated the JSON mid-string, which is
            // indistinguishable from a malformed reply.
            max_tokens: options.maxOutputTokens ?? 8192,
            stream: false,
          }),
        });

        if (!res.ok) {
          const errBody = await res.text().catch(() => '');
          lastError = new Error(`NIM ${model} HTTP ${res.status} ${errBody.slice(0, 200)}`);
          logger.warn(`NIM model ${model} failed, trying fallback`, {
            status: res.status,
            requestId: options.requestId,
          });
          continue;
        }

        const json: any = await res.json();
        usedModel = json?.model || model;
        const rawText: string = json?.choices?.[0]?.message?.content || '';
        const finishReason: string = json?.choices?.[0]?.finish_reason || '';

        if (!rawText) {
          lastError = new Error(`NIM ${model} returned an empty completion`);
          continue;
        }

        const parsed = extractJsonDetailed(rawText);

        if (!parsed.value) {
          // A truncated reply is retryable; malformed output should be surfaced.
          const truncated = parsed.truncated || finishReason === 'length';
          logger.warn(
            truncated
              ? 'NIM reply hit the token limit and was truncated mid-JSON'
              : 'NIM reply was not parseable as JSON; returning raw text',
            { requestId: options.requestId, finishReason }
          );
          lastError = new Error(
            truncated
              ? `NIM ${model} output was truncated at the token limit`
              : `NIM ${model} output was not valid JSON`
          );
          continue;
        }

        const durationMs = Date.now() - startTime;
        logger.info('NIM response received', { durationMs, model: usedModel, requestId: options.requestId });

        return {
          success: true,
          data: parsed.value as T,
          rawText,
          isMock: false,
          modelUsed: usedModel,
          durationMs,
        };
      } catch (err: any) {
        lastError = err;
        logger.warn(`NIM model ${model} invocation threw, trying fallback model`, {
          error: err?.message,
          requestId: options.requestId,
        });
      }
    }

    const durationMs = Date.now() - startTime;
    logger.error('All candidate NVIDIA NIM models failed', {
      error: lastError?.message,
      durationMs,
      requestId: options.requestId,
    });

    return {
      success: false,
      data: null,
      rawText: '',
      isMock: false,
      modelUsed: usedModel,
      errorMessage: lastError?.message || 'NVIDIA NIM call error',
      durationMs,
    };
  }

  /** Appends an explicit JSON contract when the caller supplied a schema. */
  private buildSystemInstruction(options: GenerateOptions): string {
    const base = options.systemInstruction || '';

    // Fall back to the canonical hardware contract when the caller did not pass
    // one. The orchestrator's prompts name the action types but never describe
    // their shape, so without this the model invents `{action, componentId}`
    // and every action is discarded by the validator.
    const contract = options.responseSchema
      ? `The object MUST conform to this JSON Schema:\n\n${JSON.stringify(normalizeSchema(options.responseSchema), null, 2)}`
      : HARDWARE_CONTRACT_TEXT;

    return `${base}

============================================================
CRITICAL OUTPUT FORMAT
============================================================
Respond with a single valid JSON object and NOTHING else.
- Do NOT wrap the JSON in markdown code fences.
- Do NOT add commentary, preamble, or trailing text.
- Escape newlines inside string values as \\n; never emit a raw line break inside a string.
- Keep the response focused: include every essential action, but do not pad it with redundant commentary.

${contract}`;
  }
}
