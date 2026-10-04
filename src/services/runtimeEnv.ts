/**
 * Runtime-agnostic environment access.
 *
 * The same service modules run in three places:
 *   1. Node (the local `npm run dev` Express server, and the test suite)
 *   2. Cloudflare Pages Functions / Workers (the deployed site)
 *   3. Vitest / tsx under Node
 *
 * Node exposes `process.env`. Workers do not expose `process.env` unless the
 * `nodejs_compat` compatibility flag is on, and even then values must come from
 * the request-scoped `context.env` binding rather than the global process. So we
 * read the Node environment when it exists and otherwise fall back to a store
 * that the Pages Function populates from its own bindings.
 */

export type RuntimeEnv = Record<string, string | undefined>;

function nodeEnv(): RuntimeEnv | undefined {
  // `process` is deliberately probed rather than imported so this module stays
  // free of Node typings and works unchanged in the Workers runtime.
  const proc = (globalThis as any).process;
  if (proc && typeof proc === 'object' && proc.env && typeof proc.env === 'object') {
    return proc.env as RuntimeEnv;
  }
  return undefined;
}

let injectedEnv: RuntimeEnv = {};

/**
 * Populate environment values for runtimes without `process.env`
 * (Cloudflare Pages Functions call this from `context.env`).
 */
export function setRuntimeEnv(values: RuntimeEnv): void {
  injectedEnv = { ...injectedEnv, ...values };
}

/** Read a single environment value from whichever runtime source is available. */
export function readEnv(key: string): string | undefined {
  const fromNode = nodeEnv();
  const nodeValue = fromNode ? fromNode[key] : undefined;
  if (nodeValue !== undefined && nodeValue !== '') return nodeValue;

  const injected = injectedEnv[key];
  if (injected !== undefined && injected !== '') return injected;

  return nodeValue ?? injected;
}

/** True when running on Cloudflare's edge runtime rather than Node. */
export function isEdgeRuntime(): boolean {
  return nodeEnv() === undefined;
}

/**
 * First non-empty Gemini API key from the usual variable names.
 * Mirrors the precedence the Express server used.
 */
export function resolveGeminiApiKey(): string | undefined {
  const candidates = [
    'GEMINI_API_KEY_CORE',
    'GEMINI_API_KEY',
    'GEMINI_API_KEY_LANDING',
    'GOOGLE_API_KEY',
  ];
  for (const name of candidates) {
    const value = readEnv(name);
    if (value && value.trim().length > 0) return value.trim();
  }
  return undefined;
}

/**
 * NVIDIA NIM API key (`nvapi-...`).
 * Accepts the common variable spellings so secrets can be supplied under
 * whichever name the deployment already uses.
 */
export function resolveNvidiaApiKey(): string | undefined {
  const candidates = [
    'NVIDIA_API_KEY',
    'NVIDIA_NIM_API_KEY',
    'NIM_API_KEY',
    'NVIDIA_API_KEY_CORE',
  ];
  for (const name of candidates) {
    const value = readEnv(name);
    if (value && value.trim().length > 0) return value.trim();
  }
  return undefined;
}
