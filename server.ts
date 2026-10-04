import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import zlib from "zlib";
import http from "http";
import dotenv from "dotenv";
import { Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { kittOrchestrator } from "./src/services/orchestrator";
import { firmwareSandbox } from "./src/services/firmwareSandbox";
import { electricalPanelEngine } from "./src/services/electricalPanelEngine";
import { inspectPayloadSecurity, redactSensitiveOutput } from "./src/services/security";
import {
  KITT_ORG_AI_SYSTEM_INSTRUCTION,
  generateIntelligentFallback,
} from "./src/services/apiPrompts";
import { readEnv } from "./src/services/runtimeEnv";
import { resolveLlmProvider, describeLlmConfiguration, resolveStructuredClient } from "./src/services/llmProvider";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const IS_PROD = process.env.NODE_ENV === "production";

// ============================================================
// 1. LIVE TELEMETRY & SYSTEM METRICS TRACKER
// ============================================================
interface ServerMetrics {
  startTime: number;
  totalRequests: number;
  quarantinedThreats: number;
  rateLimitRejections: number;
  cachedHits: number;
  activeConnections: number;
}

const metrics: ServerMetrics = {
  startTime: Date.now(),
  totalRequests: 0,
  quarantinedThreats: 0,
  rateLimitRejections: 0,
  cachedHits: 0,
  activeConnections: 0,
};

// ============================================================
// 2. SCANNER HONEYPOT TRAP & INSTANT QUARANTINE SHIELD
// ============================================================
interface QuarantinedHost {
  blockedUntil: number;
  reason: string;
}

const MAX_QUARANTINE_ENTRIES = 10000;
const MAX_RATELIMIT_ENTRIES = 10000;

function setBounded<K, V>(map: Map<K, V>, key: K, val: V, max: number): void {
  if (map.size >= max && !map.has(key)) {
    const oldest = map.keys().next().value;
    if (oldest !== undefined) {
      map.delete(oldest);
    }
  }
  map.set(key, val);
}

const quarantineMap = new Map<string, QuarantinedHost>();
const QUARANTINE_DURATION_MS = 60 * 60 * 1000; // 1-Hour hostile block

const MALICIOUS_PATTERNS = [
  /\.env($|\/|\?)/i,
  /\.git($|\/|\?)/i,
  /\.aws($|\/|\?)/i,
  /\.ssh($|\/|\?)/i,
  /\.vscode($|\/|\?)/i,
  /\.idea($|\/|\?)/i,
  /\/wp-admin/i,
  /\/wp-login/i,
  /\/wp-includes/i,
  /\/wp-content/i,
  /\/xmlrpc\.php/i,
  /\/phpmyadmin/i,
  /\/pma/i,
  /\/actuator/i,
  /\/cgi-bin/i,
  /\/telescope/i,
  /\/solr/i,
  /\/shell/i,
  /\/config\.json/i,
  /\/\.ds_store/i,
  /\/boaform/i,
  /\.well-known\/pki-validation/i,
  /\/vendor\/phpunit/i,
  /\/etc\/passwd/i,
  /\/win\.ini/i,
  /\.php($|\?)/i,
  /\.aspx?($|\?)/i,
  /\.jsp($|\?)/i,
  /\.bak($|\?)/i,
  /\.old($|\?)/i,
  /\.conf($|\?)/i,
  /\.sql($|\?)/i,
];

function getClientIp(req: express.Request): string {
  // Use Express's validated req.ip which respects trust proxy securely
  const rawIp = req.ip || req.socket.remoteAddress || "127.0.0.1";
  const sanitized = rawIp.replace(/[^a-fA-F0-9:.]/g, "").slice(0, 45);
  return sanitized || "127.0.0.1";
}

// Auto-purge expired quarantine bans every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, item] of quarantineMap.entries()) {
    if (now > item.blockedUntil) {
      quarantineMap.delete(ip);
    }
  }
}, 300000).unref();

// ============================================================
// 3. DEFENSE-IN-DEPTH FILTER: HONEYPOT, TRAVERSAL & HEADERS
// ============================================================
app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use((req, res, next) => {
  metrics.totalRequests++;
  const ip = getClientIp(req);
  const now = Date.now();

  // Layer 1: Check if IP is in quarantine (exempt local loopback)
  const isLoopback = ip === "127.0.0.1" || ip === "::1" || ip === "::ffff:127.0.0.1";
  const quarantined = quarantineMap.get(ip);
  if (quarantined && !isLoopback) {
    if (now < quarantined.blockedUntil) {
      metrics.quarantinedThreats++;
      res.setHeader("Connection", "close");
      return res.status(403).json({ error: "Access Denied: Host in active quarantine shield." });
    } else {
      quarantineMap.delete(ip);
    }
  }

  // Layer 2: Check honeypot signatures (skip for local loopback in dev)
  const rawUrl = req.originalUrl || req.url;
  if (!isLoopback) {
    for (const pattern of MALICIOUS_PATTERNS) {
      if (pattern.test(rawUrl)) {
        metrics.quarantinedThreats++;
        setBounded(
          quarantineMap,
          ip,
          {
            blockedUntil: now + QUARANTINE_DURATION_MS,
            reason: "Automated scanner probe: " + pattern.toString(),
          },
          MAX_QUARANTINE_ENTRIES
        );
        console.warn(`[SECURITY ALERT] Quarantined hostile IP ${ip} for probe: ${rawUrl}`);
        res.setHeader("Connection", "close");
        return res.status(403).json({ error: "Access Denied: Malicious probe quarantined." });
      }
    }
  }

  // Layer 3: Anti-Path-Traversal Engine
  try {
    const decodedPath = decodeURIComponent(rawUrl.split("?")[0]);
    if (
      decodedPath.includes("..\\") ||
      decodedPath.includes("../") ||
      decodedPath.includes("\0") ||
      /%2e%2e/i.test(rawUrl) ||
      /%00/i.test(rawUrl) ||
      /(\/|\\)\.\.(\/|\\)/.test(rawUrl)
    ) {
      metrics.quarantinedThreats++;
      return res.status(403).json({ error: "Access Denied: Path traversal detected." });
    }
  } catch (_e) {
    return res.status(400).json({ error: "Bad Request: Malformed URI encoding." });
  }

  // Layer 4: Strict Method Whitelist
  const allowedMethods = ["GET", "POST", "HEAD", "OPTIONS"];
  if (!allowedMethods.includes(req.method)) {
    return res.status(405).json({ error: "Method Not Allowed." });
  }

  // Layer 5: Military-Grade Security Headers
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=()"
  );
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: blob: https:; font-src 'self' data: https:; connect-src 'self' https: wss:; media-src 'self' https: data: blob:; object-src 'none'; frame-ancestors 'self'; base-uri 'self'; form-action 'self';"
  );

  if (IS_PROD) {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    );
  }

  next();
});

// ============================================================
// 4. PAYLOAD FLOOD & INJECTION SHIELD (15MB Limit for Circuits & Netlists)
// ============================================================
app.use(express.json({ limit: "15mb" }));

app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (err instanceof SyntaxError && "body" in err) {
      return res.status(400).json({ error: "Malformed JSON payload." });
    }
    if (err && err.type === "entity.too.large") {
      return res.status(413).json({ error: "Request payload exceeds size limit (15MB)." });
    }
    next(err);
  }
);

// Deep Object Sanitizer for Prototype Pollution & Hostile Code Execution
// (Specially calibrated to allow valid C/C++, Arduino firmware syntax, formulas and netlists)
// Implementation lives in src/services/security.ts so the Cloudflare Pages
// Functions enforce the exact same rules as this server.

// ============================================================
// 5. SLIDING-WINDOW RATE LIMITER WITH AUTO-PRUNING & CAPACITY CAP
// ============================================================
interface RateRecord {
  count: number;
  resetAt: number;
}
const rateLimitStore = new Map<string, RateRecord>();

function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; retryAfterSec?: number } {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetAt) {
    setBounded(
      rateLimitStore,
      key,
      { count: 1, resetAt: now + windowMs },
      MAX_RATELIMIT_ENTRIES
    );
    return { allowed: true };
  }

  if (record.count >= limit) {
    const retryAfterSec = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
    return { allowed: false, retryAfterSec };
  }

  record.count++;
  return { allowed: true };
}

// Prune stale rate records every minute
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}, 60000).unref();

// Global rate limiting: 250 requests/min per IP (exempt local loopback)
app.use((req, res, next) => {
  const ip = getClientIp(req);
  const isLoopback = ip === "127.0.0.1" || ip === "::1" || ip === "::ffff:127.0.0.1";
  if (isLoopback) return next();

  const { allowed, retryAfterSec } = checkRateLimit("global_" + ip, 250, 60000);

  if (!allowed) {
    metrics.rateLimitRejections++;
    res.setHeader("Retry-After", String(retryAfterSec));
    return res.status(429).json({
      error: "High-Traffic Protection: Rate limit reached. Please retry in a few moments.",
    });
  }
  next();
});

// ============================================================
// 6. IN-MEMORY ZERO-COPY ASSET CACHE (THOUSANDS OF VISITS/SEC)
// ============================================================
interface CachedAsset {
  raw: Buffer;
  gzip: Buffer;
  deflate: Buffer;
  etag: string;
  contentType: string;
  maxAge: string;
}

const memoryAssetCache = new Map<string, CachedAsset>();

function getContentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".html": return "text/html; charset=utf-8";
    case ".js":
    case ".mjs": return "application/javascript; charset=utf-8";
    case ".css": return "text/css; charset=utf-8";
    case ".json": return "application/json; charset=utf-8";
    case ".svg": return "image/svg+xml";
    case ".png": return "image/png";
    case ".jpg":
    case ".jpeg": return "image/jpeg";
    case ".webp": return "image/webp";
    case ".ico": return "image/x-icon";
    case ".woff2": return "font/woff2";
    case ".woff": return "font/woff";
    case ".ttf": return "font/ttf";
    default: return "application/octet-stream";
  }
}

function preloadDistAssets(distDir: string) {
  if (!fs.existsSync(distDir)) return;

  function walk(currentDir: string, base: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath, base);
      } else if (entry.isFile()) {
        const relPath = "/" + path.relative(base, fullPath).replace(/\\/g, "/");
        const raw = fs.readFileSync(fullPath);
        const gzip = zlib.gzipSync(raw, { level: 9 });
        const deflate = zlib.deflateSync(raw, { level: 9 });
        const hash = crypto.createHash("sha256").update(raw).digest("hex").slice(0, 16);
        const etag = 'W/"' + raw.length + '-' + hash + '"';
        const contentType = getContentType(fullPath);
        const isHtml = fullPath.endsWith(".html");
        const maxAge = isHtml ? "no-cache" : "public, max-age=31536000, immutable";

        memoryAssetCache.set(relPath, {
          raw,
          gzip,
          deflate,
          etag,
          contentType,
          maxAge,
        });
      }
    }
  }

  walk(distDir, distDir);
  console.log(`[TURBO-CACHE] Loaded ${memoryAssetCache.size} production assets directly into RAM.`);
}

function serveCachedAsset(
  req: express.Request,
  res: express.Response,
  asset: CachedAsset
) {
  metrics.cachedHits++;

  // Sub-millisecond ETag match check
  if (req.headers["if-none-match"] === asset.etag) {
    res.status(304).end();
    return;
  }

  res.setHeader("Content-Type", asset.contentType);
  res.setHeader("ETag", asset.etag);
  res.setHeader("Cache-Control", asset.maxAge);
  res.setHeader("Vary", "Accept-Encoding");

  const acceptEncoding = req.headers["accept-encoding"] || "";

  if (typeof acceptEncoding === "string" && acceptEncoding.includes("gzip") && asset.gzip.length < asset.raw.length) {
    res.setHeader("Content-Encoding", "gzip");
    res.setHeader("Content-Length", asset.gzip.length);
    res.end(asset.gzip);
  } else if (typeof acceptEncoding === "string" && acceptEncoding.includes("deflate") && asset.deflate.length < asset.raw.length) {
    res.setHeader("Content-Encoding", "deflate");
    res.setHeader("Content-Length", asset.deflate.length);
    res.end(asset.deflate);
  } else {
    res.setHeader("Content-Length", asset.raw.length);
    res.end(asset.raw);
  }
}

// ============================================================
// 7. LLM PROVIDER & REPUTATION SHIELD
// ============================================================
// Client construction moved to src/services/llmProvider.ts, which resolves
// NVIDIA NIM or Gemini from the configured credentials. The previous
// Gemini-only helpers here became dead once the endpoints were made
// provider-agnostic.

// Credential redaction shared with the edge runtime (src/services/security.ts).

// ============================================================
// 8. TELEMETRY & HEALTH ENDPOINTS
// ============================================================
app.get("/api/health", (_req, res) => {
  // Mirror the edge health payload so a missing/misconfigured API key is just
  // as visible locally as it is in production.
  const { provider, model } = describeLlmConfiguration();
  res.json({
    status: "ok",
    service: "KITT Org AI 2.0 Hardened Architecture",
    aiConfigured: provider !== "offline",
    provider,
    model,
    mode: provider === "offline" ? "offline-fallback" : "live",
    uptimeSec: Math.floor((Date.now() - metrics.startTime) / 1000),
    timestamp: new Date().toISOString(),
  });
});

function isAllowedOrigin(req: express.Request): boolean {
  const origin = req.headers.origin;
  if (!origin) {
    const secFetchSite = req.headers["sec-fetch-site"];
    if (secFetchSite === "cross-site") return false;
    return true;
  }
  try {
    const originUrl = new URL(origin);
    const host = req.headers.host;
    if (host) {
      const hostWithoutPort = host.split(":")[0];
      if (originUrl.hostname === hostWithoutPort || originUrl.host === host) {
        return true;
      }
    }
    if (!IS_PROD && (originUrl.hostname === "localhost" || originUrl.hostname === "127.0.0.1")) {
      return true;
    }
    const allowedOrigins = readEnv("ALLOWED_ORIGINS");
    const whitelist = allowedOrigins ? allowedOrigins.split(",").map(s => s.trim()).filter(Boolean) : [];
    if (whitelist.includes(origin) || whitelist.includes(originUrl.hostname)) {
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

app.get("/api/metrics", (_req, res) => {
  res.json({
    status: "healthy",
    uptimeSec: Math.floor((Date.now() - metrics.startTime) / 1000),
    totalRequests: metrics.totalRequests,
    quarantinedThreats: metrics.quarantinedThreats,
    activeQuarantines: quarantineMap.size,
    rateLimitRejections: metrics.rateLimitRejections,
    cachedHits: metrics.cachedHits,
    activeConnections: metrics.activeConnections,
    timestamp: new Date().toISOString(),
  });
});

// ============================================================
// 9. DEDICATED CHAT ENDPOINT WITH COMPREHENSIVE GUARDS
// ============================================================
app.post("/api/kitt-org-chat", async (req, res) => {
  const ip = getClientIp(req);

  // Cross-Origin Request Validation (CSRF Shield)
  if (!isAllowedOrigin(req)) {
    metrics.quarantinedThreats++;
    return res.status(403).json({ error: "Forbidden: Unauthorized cross-origin request rejected." });
  }

  // Dedicated Chat Rate Limit: Max 30 req/min per IP
  const { allowed, retryAfterSec } = checkRateLimit("chat_" + ip, 30, 60000);
  if (!allowed) {
    res.setHeader("Retry-After", String(retryAfterSec));
    return res.status(429).json({
      error: "Conversation rate limit reached. Please wait a few seconds before asking again.",
    });
  }

  try {
    // 1. Prototype Pollution & Injection Inspection
    if (typeof req.body !== "object" || req.body === null) {
      return res.status(400).json({ error: "Invalid request payload format." });
    }
    if (inspectPayloadSecurity(req.body)) {
      metrics.quarantinedThreats++;
      return res.status(400).json({ error: "Security alert: Illegal payload patterns detected." });
    }

    // 2. Strict Schema Validation
    const { messages } = req.body;
    if (!Array.isArray(messages) || messages.length === 0 || messages.length > 20) {
      return res.status(400).json({
        error: "Invalid 'messages' field: Must be an array containing between 1 and 20 items.",
      });
    }

    // 3. Per-message sanitization
    const sanitizedContents: { role: string; parts: { text: string }[] }[] = [];

    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i];
      if (typeof msg !== "object" || msg === null) {
        return res.status(400).json({ error: `Message at index ${i} is malformed.` });
      }

      const { role, content } = msg;

      if (typeof role !== "string" || !["user", "assistant", "model"].includes(role)) {
        return res.status(400).json({
          error: `Message at index ${i} has an invalid role. Allowed: 'user', 'assistant', 'model'.`,
        });
      }

      if (typeof content !== "string" || content.trim().length === 0 || content.length > 3000) {
        return res.status(400).json({
          error: `Message at index ${i} must have content between 1 and 3000 characters.`,
        });
      }

      // Strip non-printable control characters
      const cleanText = content
        .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F]/g, "")
        .trim();

      sanitizedContents.push({
        role: role === "assistant" || role === "model" ? "model" : "user",
        parts: [{ text: cleanText }],
      });
    }

    const provider = resolveLlmProvider();
    if (!provider) {
      const lastUserMsg = sanitizedContents[sanitizedContents.length - 1]?.parts[0]?.text || "";
      const dynamicReply = generateIntelligentFallback(lastUserMsg);

      return res.json({
        reply: dynamicReply,
        model: "offline-fallback",
      });
    }

    let response: { text: string; model: string } | null = null;
    let modelUsed = "";
    let lastError: any = null;

    try {
      response = await provider.generateText({
        systemInstruction: KITT_ORG_AI_SYSTEM_INSTRUCTION,
        contents: sanitizedContents,
        temperature: 0.7,
        topP: 0.95,
        maxOutputTokens: 4096,
      });
      modelUsed = response.model;
    } catch (providerErr: any) {
      lastError = providerErr;
      console.warn(`[LLM] ${provider.name} generation failed: ${providerErr?.message}. Using local fallback.`);
    }

    if (!response || !response.text) {
      console.warn(`[LLM] All ${provider.name} attempts failed or timed out (${lastError?.message}). Activating local intelligent fallback.`);
      const lastUserMsg = sanitizedContents[sanitizedContents.length - 1]?.parts[0]?.text || "";
      const dynamicReply = generateIntelligentFallback(lastUserMsg);

      return res.json({
        reply: dynamicReply,
        model: "offline-fallback-degraded",
      });
    }

    const safeReply = redactSensitiveOutput(response.text);

    return res.json({
      reply: safeReply,
      model: modelUsed,
      provider: provider.name,
    });
  } catch (error: any) {
    console.error(`[SECURITY] Error processing /api/kitt-org-chat from IP ${ip}:`, error?.message);

    const lastUserMsg = (req.body?.messages && Array.isArray(req.body.messages))
      ? req.body.messages[req.body.messages.length - 1]?.content || ""
      : "";
    const dynamicReply = generateIntelligentFallback(lastUserMsg);

    return res.json({
      reply: dynamicReply,
      model: "offline-fallback-exception",
    });
  }
});

// ============================================================
// 9b. KITT CORE HARDWARE & SILICON AGENT (MAIN KITT AI STUDIO)
// ============================================================
app.post("/api/kitt-core-chat", async (req, res) => {
  const ip = getClientIp(req);

  // CSRF Shield
  if (!isAllowedOrigin(req)) {
    metrics.quarantinedThreats++;
    return res.status(403).json({ error: "Forbidden: Unauthorized cross-origin request rejected." });
  }

  // Rate limit: 30 req/min
  const { allowed, retryAfterSec } = checkRateLimit("core_chat_" + ip, 30, 60000);
  if (!allowed) {
    res.setHeader("Retry-After", String(retryAfterSec));
    return res.status(429).json({
      error: "Core conversation rate limit reached. Please wait a moment before sending another prompt.",
    });
  }

  try {
    if (typeof req.body !== "object" || req.body === null) {
      return res.status(400).json({ error: "Invalid request payload format." });
    }
    if (inspectPayloadSecurity(req.body)) {
      metrics.quarantinedThreats++;
      return res.status(400).json({ error: "Security alert: Illegal payload patterns detected." });
    }

    const { messages, circuit, telemetry } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Invalid 'messages' field: Must be a non-empty array." });
    }

    const requestId = `core_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const result = await kittOrchestrator.handleCoreChatRequest({
      messages,
      circuit,
      telemetry,
      requestId,
    });

    const safeReply = redactSensitiveOutput(result.reply);

    // 502 tells the caller the model failed, rather than returning 200 with an
    // empty circuit that looks like a successful synthesis.
    return res.status(result.modelError ? 502 : 200).json({
      reply: safeReply,
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
    console.error(`[SECURITY] Error processing /api/kitt-core-chat from IP ${ip}:`, error?.message);
    return res.status(500).json({
      error: IS_PROD ? "An internal error occurred." : error?.message,
      reply: "KITT Core encountered a simulation processing issue. Please resend your inquiry.",
    });
  }
});

// Dedicated Sandboxed Firmware Compilation Endpoint
app.post("/api/ai/compile-firmware", async (req, res) => {
  const ip = getClientIp(req);
  if (!isAllowedOrigin(req)) {
    return res.status(403).json({ error: "Forbidden: Unauthorized origin." });
  }

  // Rate limit: 15 req/min (compilation is resource intensive)
  const { allowed, retryAfterSec } = checkRateLimit("compile_" + ip, 15, 60000);
  if (!allowed) {
    res.setHeader("Retry-After", String(retryAfterSec));
    return res.status(429).json({ error: "Compile rate limit reached. Please wait before compiling again." });
  }

  try {
    const { sourceCode, targetMcu } = req.body || {};
    if (!sourceCode || typeof sourceCode !== "string") {
      return res.status(400).json({ error: "Missing required 'sourceCode' field." });
    }

    const result = await firmwareSandbox.compileFirmware(sourceCode, targetMcu || "arduino:avr:uno");
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Compilation failed" });
  }
});

// Dedicated Electrical Panel Safety Evaluation Endpoint
app.post("/api/ai/validate-panel", async (req, res) => {
  const ip = getClientIp(req);
  if (!isAllowedOrigin(req)) {
    return res.status(403).json({ error: "Forbidden: Unauthorized origin." });
  }

  try {
    const { panel, actions } = req.body || {};
    const builtPanel = actions && Array.isArray(actions)
      ? electricalPanelEngine.buildPanelFromActions(actions, panel)
      : panel;

    if (!builtPanel) {
      return res.status(400).json({ error: "Missing panel configuration or actions." });
    }

    const report = electricalPanelEngine.evaluatePanel(builtPanel);
    return res.json(report);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || "Panel validation failed" });
  }
});

// ============================================================
const KITT_COPILOT_SYSTEM_INSTRUCTION = `You are Kitt AI Copilot, an elite electronics engineering assistant and circuit synthesizer for Kitt ("Design. Simulate. Prototype.").
You specialize in digital logic design, boolean optimization, 4-state logic (0, 1, X, Z), sequential memory, MSI components (ALUs, Counters, Flip-Flops, MUXes), C++ microcontroller firmware, and PCB design.

When responding to the user, explain concepts with extreme engineering clarity, analyze the current circuit AST, provide step-by-step guidance, and generate safe, structured circuit modification proposals.

Available Component Types:
- Logic Gates: 'AND_GATE', 'OR_GATE', 'NOT_GATE', 'NAND_GATE', 'NOR_GATE', 'XOR_GATE', 'XNOR_GATE', 'BUFFER'
- Sequential & Memory: 'D_FLIP_FLOP', 'JK_FLIP_FLOP', 'SR_LATCH', 'T_FLIP_FLOP', '4BIT_COUNTER'
- MSI / Math: 'ALU_4BIT', 'HALF_ADDER', 'FULL_ADDER', 'MULTIPLEXER_4TO1', 'DEMULTIPLEXER_1TO4'
- IO & Sources: 'SWITCH', 'PUSH_BUTTON', 'VCC', 'GND', 'CLOCK_GEN'
- Indicators: 'LED', 'SEVEN_SEGMENT', 'RGB_LED', 'BUZZER'
- Virtual MCU: 'ARDUINO_UNO'

Pin definitions for components:
- AND / OR / NAND / NOR / XOR / XNOR: inputs 'inA', 'inB', output 'out'
- NOT / BUFFER: input 'in', output 'out'
- D_FLIP_FLOP: inputs 'd', 'clk', 'reset', outputs 'q', 'notQ'
- JK_FLIP_FLOP: inputs 'j', 'k', 'clk', 'reset', outputs 'q', 'notQ'
- SR_LATCH: inputs 's', 'r', outputs 'q', 'notQ'
- T_FLIP_FLOP: inputs 't', 'clk', 'reset', outputs 'q', 'notQ'
- 4BIT_COUNTER: inputs 'clk', 'reset', 'enable', 'load', 'd0'..'d3', outputs 'q0'..'q3', 'rco'
- HALF_ADDER: inputs 'a', 'b', outputs 'sum', 'carry'
- FULL_ADDER: inputs 'a', 'b', 'cin', outputs 'sum', 'cout'
- MULTIPLEXER_4TO1: inputs 'd0'..'d3', 's0', 's1', output 'out'
- DEMULTIPLEXER_1TO4: inputs 'in', 's0', 's1', outputs 'out0'..'out3'
- ALU_4BIT: inputs 'a0'..'a3', 'b0'..'b3', 'op0', 'op1', outputs 'out0'..'out3', 'cout', 'zero'
- SWITCH / BUTTON / VCC / GND / CLOCK_GEN: output 'out'
- LED: input 'in'
- SEVEN_SEGMENT: inputs 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'dp'
- RGB_LED: inputs 'r', 'g', 'b'
- BUZZER: input 'in'
- ARDUINO_UNO: 'd0'..'d13', 'a0'..'a5', '5v', 'gnd'

DRC & Reliability Rules:
- Floating CMOS inputs cause unpredictable oscillation and excessive current draw.
- Never connect two gate outputs together directly.
- Add current limiting resistors for LEDs.
- Keep propagation delays within setup/hold time windows.

If the user asks to create, modify, fix, or optimize a circuit, return a proposal with structured actions ('ADD_COMPONENT', 'REMOVE_COMPONENT', 'CONNECT', 'DISCONNECT', 'SET_PROPERTY').
Respond with high technical precision and provide educational notes summarizing formulas or pinouts.`;

function generateCopilotFallback(prompt: string, currentProject: any) {
  const p = (prompt || '').toLowerCase();
  const now = Date.now();

  if (p.includes('half adder') || p.includes('1-bit adder') || (p.includes('adder') && !p.includes('full'))) {
    const swA = `sw-a-${now}`;
    const swB = `sw-b-${now}`;
    const ha = `ha-${now}`;
    const ledSum = `led-s-${now}`;
    const ledCarry = `led-c-${now}`;

    return {
      message: "Synthesized a 1-Bit Half Adder. A Half Adder performs binary addition of two 1-bit operands, yielding a Sum (S = A ⊕ B) and a Carry (C = A · B).",
      hasProposal: true,
      proposal: {
        title: "1-Bit Half Adder Synthesis",
        description: "Adds dual input switches, a dedicated 1-bit half adder module, and two output LED monitors for Sum and Carry.",
        actions: [
          {
            actionType: "ADD_COMPONENT",
            payload: {
              component: { id: swA, type: "SWITCH", label: "Input A", position: { x: 100, y: 120 }, properties: { state: 0 } },
            },
          },
          {
            actionType: "ADD_COMPONENT",
            payload: {
              component: { id: swB, type: "SWITCH", label: "Input B", position: { x: 100, y: 220 }, properties: { state: 0 } },
            },
          },
          {
            actionType: "ADD_COMPONENT",
            payload: {
              component: { id: ha, type: "HALF_ADDER", label: "Half Adder", position: { x: 280, y: 160 }, properties: { delayNs: 4 } },
            },
          },
          {
            actionType: "ADD_COMPONENT",
            payload: {
              component: { id: ledSum, type: "LED", label: "Sum (Q)", position: { x: 460, y: 130 }, properties: { color: "#06b6d4" } },
            },
          },
          {
            actionType: "ADD_COMPONENT",
            payload: {
              component: { id: ledCarry, type: "LED", label: "Carry (Cout)", position: { x: 460, y: 210 }, properties: { color: "#f59e0b" } },
            },
          },
          {
            actionType: "CONNECT",
            payload: {
              connection: { id: `net-a-${now}`, name: "A_Net", source: { componentId: swA, pinId: "out" }, targets: [{ componentId: ha, pinId: "a" }] },
            },
          },
          {
            actionType: "CONNECT",
            payload: {
              connection: { id: `net-b-${now}`, name: "B_Net", source: { componentId: swB, pinId: "out" }, targets: [{ componentId: ha, pinId: "b" }] },
            },
          },
          {
            actionType: "CONNECT",
            payload: {
              connection: { id: `net-sum-${now}`, name: "Sum_Net", source: { componentId: ha, pinId: "sum" }, targets: [{ componentId: ledSum, pinId: "in" }] },
            },
          },
          {
            actionType: "CONNECT",
            payload: {
              connection: { id: `net-carry-${now}`, name: "Carry_Net", source: { componentId: ha, pinId: "carry" }, targets: [{ componentId: ledCarry, pinId: "in" }] },
            },
          },
        ],
      },
      educationalNotes: [
        "Sum expression: S = A ⊕ B (XOR logic)",
        "Carry expression: C = A · B (AND logic)",
        "Gate propagation delay: ~4-5ns nominal under TTL family",
      ],
    };
  }

  if (p.includes('full adder')) {
    const swA = `sw-a-${now}`;
    const swB = `sw-b-${now}`;
    const swCin = `sw-cin-${now}`;
    const fa = `fa-${now}`;
    const ledSum = `led-s-${now}`;
    const ledCout = `led-cout-${now}`;

    return {
      message: "Synthesized a 1-Bit Full Adder with Carry-In support. This allows chaining multiple full adders to build ripple-carry adders of arbitrary bit width.",
      hasProposal: true,
      proposal: {
        title: "1-Bit Full Adder with Cin",
        description: "Places 3 input switches (A, B, Cin), a Full Adder block, and dual LED indicators for Sum and Cout.",
        actions: [
          { actionType: "ADD_COMPONENT", payload: { component: { id: swA, type: "SWITCH", label: "Operand A", position: { x: 80, y: 100 }, properties: { state: 0 } } } },
          { actionType: "ADD_COMPONENT", payload: { component: { id: swB, type: "SWITCH", label: "Operand B", position: { x: 80, y: 190 }, properties: { state: 0 } } } },
          { actionType: "ADD_COMPONENT", payload: { component: { id: swCin, type: "SWITCH", label: "Carry In (Cin)", position: { x: 80, y: 280 }, properties: { state: 0 } } } },
          { actionType: "ADD_COMPONENT", payload: { component: { id: fa, type: "FULL_ADDER", label: "Full Adder", position: { x: 280, y: 180 }, properties: { delayNs: 6 } } } },
          { actionType: "ADD_COMPONENT", payload: { component: { id: ledSum, type: "LED", label: "Sum (S)", position: { x: 480, y: 140 }, properties: { color: "#22c55e" } } } },
          { actionType: "ADD_COMPONENT", payload: { component: { id: ledCout, type: "LED", label: "Carry Out (Cout)", position: { x: 480, y: 230 }, properties: { color: "#eab308" } } } },
          { actionType: "CONNECT", payload: { connection: { id: `net-a-${now}`, name: "A_Net", source: { componentId: swA, pinId: "out" }, targets: [{ componentId: fa, pinId: "a" }] } } },
          { actionType: "CONNECT", payload: { connection: { id: `net-b-${now}`, name: "B_Net", source: { componentId: swB, pinId: "out" }, targets: [{ componentId: fa, pinId: "b" }] } } },
          { actionType: "CONNECT", payload: { connection: { id: `net-cin-${now}`, name: "Cin_Net", source: { componentId: swCin, pinId: "out" }, targets: [{ componentId: fa, pinId: "cin" }] } } },
          { actionType: "CONNECT", payload: { connection: { id: `net-sum-${now}`, name: "Sum_Net", source: { componentId: fa, pinId: "sum" }, targets: [{ componentId: ledSum, pinId: "in" }] } } },
          { actionType: "CONNECT", payload: { connection: { id: `net-cout-${now}`, name: "Cout_Net", source: { componentId: fa, pinId: "cout" }, targets: [{ componentId: ledCout, pinId: "in" }] } } },
        ],
      },
      educationalNotes: [
        "Sum equation: S = A ⊕ B ⊕ Cin",
        "Carry Out equation: Cout = (A · B) + (Cin · (A ⊕ B))",
      ],
    };
  }

  if (p.includes('counter') || p.includes('binary counter') || p.includes('4-bit counter')) {
    const clk = `clk-${now}`;
    const cnt = `cnt-${now}`;
    const led0 = `led0-${now}`;
    const led1 = `led1-${now}`;
    const led2 = `led2-${now}`;
    const led3 = `led3-${now}`;

    return {
      message: "Synthesized a 4-Bit Synchronous Binary Counter driven by a 2Hz clock pulse generator and 4 logic LED monitors (Q0-Q3).",
      hasProposal: true,
      proposal: {
        title: "4-Bit Binary Counter Module",
        description: "Deploys a continuous clock source, 4-bit synchronous counter, and 4-channel LED bus readout.",
        actions: [
          { actionType: "ADD_COMPONENT", payload: { component: { id: clk, type: "CLOCK_GEN", label: "Clock 2Hz", position: { x: 80, y: 160 }, properties: { frequencyHz: 2 } } } },
          { actionType: "ADD_COMPONENT", payload: { component: { id: cnt, type: "4BIT_COUNTER", label: "4-Bit Counter", position: { x: 260, y: 150 }, properties: { delayNs: 5 } } } },
          { actionType: "ADD_COMPONENT", payload: { component: { id: led0, type: "LED", label: "Bit 0 (LSB)", position: { x: 460, y: 80 }, properties: { color: "#06b6d4" } } } },
          { actionType: "ADD_COMPONENT", payload: { component: { id: led1, type: "LED", label: "Bit 1", position: { x: 460, y: 140 }, properties: { color: "#06b6d4" } } } },
          { actionType: "ADD_COMPONENT", payload: { component: { id: led2, type: "LED", label: "Bit 2", position: { x: 460, y: 200 }, properties: { color: "#06b6d4" } } } },
          { actionType: "ADD_COMPONENT", payload: { component: { id: led3, type: "LED", label: "Bit 3 (MSB)", position: { x: 460, y: 260 }, properties: { color: "#06b6d4" } } } },
          { actionType: "CONNECT", payload: { connection: { id: `net-clk-${now}`, name: "CLK_Net", source: { componentId: clk, pinId: "out" }, targets: [{ componentId: cnt, pinId: "clk" }] } } },
          { actionType: "CONNECT", payload: { connection: { id: `net-q0-${now}`, name: "Q0_Net", source: { componentId: cnt, pinId: "q0" }, targets: [{ componentId: led0, pinId: "in" }] } } },
          { actionType: "CONNECT", payload: { connection: { id: `net-q1-${now}`, name: "Q1_Net", source: { componentId: cnt, pinId: "q1" }, targets: [{ componentId: led1, pinId: "in" }] } } },
          { actionType: "CONNECT", payload: { connection: { id: `net-q2-${now}`, name: "Q2_Net", source: { componentId: cnt, pinId: "q2" }, targets: [{ componentId: led2, pinId: "in" }] } } },
          { actionType: "CONNECT", payload: { connection: { id: `net-q3-${now}`, name: "Q3_Net", source: { componentId: cnt, pinId: "q3" }, targets: [{ componentId: led3, pinId: "in" }] } } },
        ],
      },
      educationalNotes: [
        "Counts continuously from 0000 (0) up to 1111 (15) on positive clock edges.",
        "Q0 toggles at f/2 (1Hz), Q1 at f/4 (0.5Hz), Q2 at f/8 (0.25Hz), Q3 at f/16 (0.125Hz).",
      ],
    };
  }

  if (p.includes('led') || p.includes('indicator') || p.includes('monitor')) {
    const ledId = `led-mon-${now}`;
    return {
      message: "Adding a high-efficiency status LED monitor to observe active signal logic states.",
      hasProposal: true,
      proposal: {
        title: "Add LED Indicator",
        description: "Places a 5mm status LED monitor on the canvas.",
        actions: [
          {
            actionType: "ADD_COMPONENT",
            payload: {
              component: { id: ledId, type: "LED", label: "Status LED", position: { x: 380, y: 160 }, properties: { color: "#22c55e" } },
            },
          },
        ],
      },
      educationalNotes: [
        "Standard digital LEDs require a 220Ω series current limiting resistor on 5V TTL rails.",
      ],
    };
  }

  // Diagnostic / Check inspect
  const compCount = currentProject?.components?.length || 0;
  const netCount = currentProject?.connections?.length || 0;
  return {
    message: `Circuit AST Analysis complete: Current workspace contains ${compCount} component(s) and ${netCount} net(s). All digital logic states are deterministic with cycle-accurate timing.`,
    hasProposal: false,
    educationalNotes: [
      "Ensure all logic gate input pins are actively pulled HIGH or LOW to avoid CMOS floating states.",
      "Use the 3D Breadboard tab to inspect real physical wire jumpers, DIP pinouts, and breadboard rails.",
      "Open Waveform Analysis to inspect nanosecond propagation delays.",
    ],
  };
}

// AI Copilot Endpoint
app.post("/api/ai/copilot", async (req, res) => {
  try {
    const { prompt, currentProject, mode, taskType } = req.body || {};
    // Provider-agnostic: resolves NVIDIA NIM or Gemini, and falls back to the
    // mock client when no key is configured.
    const ai = resolveStructuredClient();

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Missing required 'prompt' field." });
    }

    // Inspect the payload before dispatching to the model (parity with the
    // other AI endpoints, which all guard here).
    if (inspectPayloadSecurity(req.body)) {
      metrics.quarantinedThreats++;
      return res.status(400).json({ error: "Security alert: Illegal payload patterns detected." });
    }

    try {
      const response = await ai.generateStructuredContent<any>({
        systemInstruction: KITT_COPILOT_SYSTEM_INSTRUCTION,
        contents: [
          {
            role: "user",
            parts: [
              {
                text: JSON.stringify({
                  userPrompt: prompt,
                  taskType: taskType || "GENERAL_ASSIST",
                  currentMode: mode || "INTERMEDIATE",
                  circuitContext: {
                    componentCount: currentProject?.components?.length || 0,
                    connectionCount: currentProject?.connections?.length || 0,
                    components: currentProject?.components?.map((c: any) => ({
                      id: c.id,
                      type: c.type,
                      label: c.label,
                      position: c.position,
                    })),
                    connections: currentProject?.connections?.map((n: any) => ({
                      id: n.id,
                      source: `${n.source?.componentId}:${n.source?.pinId}`,
                      targets: n.targets?.map((t: any) => `${t.componentId}:${t.pinId}`) || [],
                    })),
                  },
                }),
              },
            ],
          },
        ],
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            message: { type: Type.STRING },
            hasProposal: { type: Type.BOOLEAN },
            proposal: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                actions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      actionType: { type: Type.STRING },
                      payload: { type: Type.OBJECT },
                    },
                    required: ["actionType"],
                  },
                },
              },
            },
            educationalNotes: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["message", "hasProposal"],
        },
      });

      if (response.success && response.data) {
        return res.json(response.data);
      }

      console.warn("[COPILOT] Model returned no usable structured payload, using intelligent fallback.");
      return res.json(generateCopilotFallback(prompt, currentProject));
    } catch (aiErr: any) {
      console.warn("[COPILOT] AI call failed, returning intelligent fallback:", aiErr?.message);
      const fallback = generateCopilotFallback(prompt, currentProject);
      return res.json(fallback);
    }
  } catch (err: any) {
    console.error("[COPILOT] Error handling copilot request:", err);
    res.status(500).json({ error: err?.message || "Failed to process AI Copilot request" });
  }
});

const KITT_INVENT_SYSTEM_INSTRUCTION = `You are Kitt Invention Architect, an elite automated circuit generation engine.
Given a user invention goal (e.g. "Smart plant waterer", "4-Bit digital stopwatch", "Traffic light controller", "Door security alarm", "Ultrasonic distance gauge", "Binary multiplier"), generate:
1. 'goal': Short concise title of the invention goal.
2. 'systems': Array of 4-6 key functional subsystem names (e.g. ["Sensing Layer", "Conditioning & Comparator", "Synchronous Logic", "Actuation & Power", "Status Telemetry"]).
3. 'theory': Rigorous electrical and logical engineering description of operation (covering signal conditioning, hysteresis, propagation delays, state transitions, opto-isolation).
4. 'project': Complete valid KittProjectSchemaV1 AST.
   - components: must have valid 'id', 'type' (SWITCH, PUSH_BUTTON, CLOCK_GEN, AND_GATE, OR_GATE, NOT_GATE, NAND_GATE, NOR_GATE, XOR_GATE, D_FLIP_FLOP, 4BIT_COUNTER, ALU_4BIT, LED, SEVEN_SEGMENT, ARDUINO_UNO), 'label', 'position' {x, y}, 'rotation', 'properties'.
   - connections: valid source {componentId, pinId} and targets [{componentId, pinId}].
   - valid simulationConfig: { timeStepNs: 1, maxIterationsPerStep: 1000, defaultLogicFamily: 'TTL', clockFrequencyHz: 2, isRunning: true }.
   - valid viewState: { pan: {x: 40, y: 40}, zoom: 1.0, activeView: 'SCHEMATIC', selectedComponentIds: [], selectedNetIds: [], showGrid: true, snapToGrid: true }.
5. 'testbench': 3 test scenarios { name, description, inputs: {[compId]: 0|1}, expectedOutputs: {[compId]: 0|1}, status: 'PENDING' }.
6. 'bom': 5-8 Bill of Materials rows { component, type, qty, unitCostUsd, totalCostUsd, footprint }.

Output strictly valid JSON matching the schema.`;

function generateInventionFallback(prompt: string, mode: string = 'INTERMEDIATE') {
  const p = (prompt || '').toLowerCase();
  const now = Date.now();

  // Archetype 1: Soil Moisture / Plant Waterer
  if (p.includes('soil') || p.includes('plant') || p.includes('water') || p.includes('irrigation') || p.includes('pump')) {
    const swId = `inv-sensor-${now}`;
    const clkId = `inv-clk-${now}`;
    const gateId = `inv-gate-${now}`;
    const dffId = `inv-dff-${now}`;
    const ledId = `inv-pump-${now}`;

    return {
      goal: "Automatic Smart Plant Hydration System",
      systems: ["Capacitive Soil Sensor", "Clocked Threshold Comparator", "Latching State Memory", "MOSFET Driver & Pump", "Telemetry Indicators"],
      theory: "Continuously reads soil moisture threshold state. When dryness is detected (active digital HIGH), the clock sync gate triggers a D flip-flop to latch the pump driver relay HIGH until moisture saturation resets the latch.",
      project: {
        schemaVersion: "1.0.0",
        metadata: {
          id: `proj-plant-${now}`,
          name: "Smart Plant Waterer",
          description: "Automated closed-loop hydration controller with sensor threshold comparator and latching pump driver.",
          mode: mode || "INTERMEDIATE",
          createdAt: now,
          updatedAt: now,
          author: "Kitt AI Architect",
          stars: 28,
          tags: ["Automated", "Agriculture", "Sensors", "IoT"],
        },
        components: [
          { id: swId, type: "SWITCH", label: "Moisture Sensor Threshold", position: { x: 80, y: 140 }, rotation: 0, properties: { state: 1 } },
          { id: clkId, type: "CLOCK_GEN", label: "Sampling Clock (2Hz)", position: { x: 80, y: 260 }, rotation: 0, properties: { frequencyHz: 2 } },
          { id: gateId, type: "AND_GATE", label: "Sampling Gate", position: { x: 260, y: 130 }, rotation: 0, properties: { delayNs: 5 } },
          { id: dffId, type: "D_FLIP_FLOP", label: "Pump Driver Latch", position: { x: 420, y: 130 }, rotation: 0, properties: { delayNs: 6 } },
          { id: ledId, type: "LED", label: "Water Pump Actuator", position: { x: 580, y: 145 }, rotation: 0, properties: { color: "#06b6d4", name: "Submersible Pump" } },
        ],
        connections: [
          { id: `net-s-${now}`, name: "Sensor_Net", source: { componentId: swId, pinId: "out" }, targets: [{ componentId: gateId, pinId: "inA" }] },
          { id: `net-clk-${now}`, name: "Clock_Net", source: { componentId: clkId, pinId: "out" }, targets: [{ componentId: gateId, pinId: "inB" }, { componentId: dffId, pinId: "clk" }] },
          { id: `net-g-${now}`, name: "Gate_Net", source: { componentId: gateId, pinId: "out" }, targets: [{ componentId: dffId, pinId: "d" }] },
          { id: `net-out-${now}`, name: "Pump_Net", source: { componentId: dffId, pinId: "q" }, targets: [{ componentId: ledId, pinId: "in" }] },
        ],
        simulationConfig: { timeStepNs: 1, maxIterationsPerStep: 1000, defaultLogicFamily: "TTL", clockFrequencyHz: 2, isRunning: true },
        viewState: { pan: { x: 40, y: 40 }, zoom: 1.0, activeView: "SCHEMATIC", selectedComponentIds: [], selectedNetIds: [], showGrid: true, snapToGrid: true },
      },
      testbench: [
        { name: "Dry Soil Trigger", description: "Sensor trips HIGH; next positive clock edge energizes water pump actuator.", inputs: { [swId]: 1 }, expectedOutputs: { [ledId]: 1 }, status: "PENDING" },
        { name: "Saturated Soil Cutoff", description: "Moisture satisfied (sensor LOW); pump safely de-energizes.", inputs: { [swId]: 0 }, expectedOutputs: { [ledId]: 0 }, status: "PENDING" },
        { name: "Continuous Monitoring", description: "Verifies immunity against brief spurious moisture spikes.", inputs: { [swId]: 1 }, expectedOutputs: { [ledId]: 1 }, status: "PENDING" },
      ],
      bom: [
        { component: "Capacitive Soil Moisture Sensor v1.2", type: "Sensor", qty: 1, unitCostUsd: 1.85, totalCostUsd: 1.85, footprint: "THT-3P" },
        { component: "74HC08 Quad 2-Input AND Gate", type: "Digital Logic", qty: 1, unitCostUsd: 0.45, totalCostUsd: 0.45, footprint: "DIP-14" },
        { component: "74HC74 Dual D-Type Flip-Flop", type: "Sequential Logic", qty: 1, unitCostUsd: 0.60, totalCostUsd: 0.60, footprint: "DIP-14" },
        { component: "IRLZ44N Logic-Level N-Channel MOSFET", type: "Power Semiconductor", qty: 1, unitCostUsd: 0.85, totalCostUsd: 0.85, footprint: "TO-220" },
        { component: "5V Submersible Micro Water Pump", type: "Actuator", qty: 1, unitCostUsd: 2.95, totalCostUsd: 2.95, footprint: "Chassis Mount" },
        { component: "1N4007 Flyback Suppression Diode", type: "Protection Diode", qty: 1, unitCostUsd: 0.08, totalCostUsd: 0.08, footprint: "DO-41" },
        { component: "FR4 Double-Sided Prototype PCB", type: "Substrate", qty: 1, unitCostUsd: 1.50, totalCostUsd: 1.50, footprint: "80x60mm" },
      ],
    };
  }

  // Archetype 2: 4-Bit Digital Stopwatch / Binary Counter
  if (p.includes('stopwatch') || p.includes('counter') || p.includes('timer') || p.includes('clock')) {
    const clkId = `inv-clk-${now}`;
    const startSw = `inv-start-${now}`;
    const gateId = `inv-and-${now}`;
    const cntId = `inv-cnt-${now}`;
    const led0 = `inv-l0-${now}`;
    const led1 = `inv-l1-${now}`;
    const led2 = `inv-l2-${now}`;
    const led3 = `inv-l3-${now}`;

    return {
      goal: "4-Bit Synchronous Digital Stopwatch",
      systems: ["Precision Oscillator (2Hz)", "Start/Stop Enable Gating", "4-Bit Binary Accumulator", "LED State Bus Readout", "Power Regulation"],
      theory: "A 2Hz square wave clock is gated by a START/STOP master switch via a 74HC08 AND gate. When enabled, clock transitions advance a 4-bit synchronous counter from 0000 to 1111.",
      project: {
        schemaVersion: "1.0.0",
        metadata: {
          id: `proj-stopwatch-${now}`,
          name: "4-Bit Digital Stopwatch",
          description: "Gated synchronous timer with start/pause control and 4-bit digital binary output.",
          mode: mode || "INTERMEDIATE",
          createdAt: now,
          updatedAt: now,
          author: "Kitt AI Architect",
          stars: 35,
          tags: ["Timing", "Counter", "Clock", "MSI"],
        },
        components: [
          { id: startSw, type: "SWITCH", label: "Start / Stop Run Switch", position: { x: 80, y: 120 }, rotation: 0, properties: { state: 1 } },
          { id: clkId, type: "CLOCK_GEN", label: "Clock Heartbeat (2Hz)", position: { x: 80, y: 220 }, rotation: 0, properties: { frequencyHz: 2 } },
          { id: gateId, type: "AND_GATE", label: "Clock Gate", position: { x: 260, y: 150 }, rotation: 0, properties: { delayNs: 5 } },
          { id: cntId, type: "4BIT_COUNTER", label: "4-Bit Counter (74HC161)", position: { x: 420, y: 140 }, rotation: 0, properties: { delayNs: 6 } },
          { id: led0, type: "LED", label: "Sec Bit 0 (LSB)", position: { x: 600, y: 80 }, rotation: 0, properties: { color: "#06b6d4" } },
          { id: led1, type: "LED", label: "Sec Bit 1", position: { x: 600, y: 140 }, rotation: 0, properties: { color: "#06b6d4" } },
          { id: led2, type: "LED", label: "Sec Bit 2", position: { x: 600, y: 200 }, rotation: 0, properties: { color: "#06b6d4" } },
          { id: led3, type: "LED", label: "Sec Bit 3 (MSB)", position: { x: 600, y: 260 }, rotation: 0, properties: { color: "#06b6d4" } },
        ],
        connections: [
          { id: `net-sw-${now}`, name: "Start_Net", source: { componentId: startSw, pinId: "out" }, targets: [{ componentId: gateId, pinId: "inA" }] },
          { id: `net-clk-${now}`, name: "Clk_Net", source: { componentId: clkId, pinId: "out" }, targets: [{ componentId: gateId, pinId: "inB" }] },
          { id: `net-gate-${now}`, name: "Gated_Clk", source: { componentId: gateId, pinId: "out" }, targets: [{ componentId: cntId, pinId: "clk" }] },
          { id: `net-q0-${now}`, name: "Bit0_Net", source: { componentId: cntId, pinId: "q0" }, targets: [{ componentId: led0, pinId: "in" }] },
          { id: `net-q1-${now}`, name: "Bit1_Net", source: { componentId: cntId, pinId: "q1" }, targets: [{ componentId: led1, pinId: "in" }] },
          { id: `net-q2-${now}`, name: "Bit2_Net", source: { componentId: cntId, pinId: "q2" }, targets: [{ componentId: led2, pinId: "in" }] },
          { id: `net-q3-${now}`, name: "Bit3_Net", source: { componentId: cntId, pinId: "q3" }, targets: [{ componentId: led3, pinId: "in" }] },
        ],
        simulationConfig: { timeStepNs: 1, maxIterationsPerStep: 1000, defaultLogicFamily: "TTL", clockFrequencyHz: 2, isRunning: true },
        viewState: { pan: { x: 40, y: 40 }, zoom: 1.0, activeView: "SCHEMATIC", selectedComponentIds: [], selectedNetIds: [], showGrid: true, snapToGrid: true },
      },
      testbench: [
        { name: "Running State (Switch ON)", description: "Start switch closed; gated clock delivers pulses and counter increments.", inputs: { [startSw]: 1 }, expectedOutputs: { [led0]: 1 }, status: "PENDING" },
        { name: "Paused State (Switch OFF)", description: "Start switch opened; clock propagation is inhibited, freezing elapsed time.", inputs: { [startSw]: 0 }, expectedOutputs: { [led0]: 0 }, status: "PENDING" },
        { name: "Rollover Transition", description: "Reaches full count 1111 (15) and synchronously loops back to 0000 without glitches.", inputs: { [startSw]: 1 }, expectedOutputs: { [led3]: 1 }, status: "PENDING" },
      ],
      bom: [
        { component: "74HC161 4-Bit Synchronous Binary Counter", type: "MSI Logic", qty: 1, unitCostUsd: 0.75, totalCostUsd: 0.75, footprint: "DIP-16" },
        { component: "74HC08 Quad 2-Input AND Gate", type: "Digital Logic", qty: 1, unitCostUsd: 0.45, totalCostUsd: 0.45, footprint: "DIP-14" },
        { component: "555 Precision Timer Oscillator Module", type: "Clock Gen", qty: 1, unitCostUsd: 0.35, totalCostUsd: 0.35, footprint: "DIP-8" },
        { component: "3mm High-Intensity Cyan LEDs", type: "Indicators", qty: 4, unitCostUsd: 0.12, totalCostUsd: 0.48, footprint: "Radial-2P" },
        { component: "SPDT Sub-Miniature Slide Switch", type: "Input Switch", qty: 1, unitCostUsd: 0.40, totalCostUsd: 0.40, footprint: "THT-3P" },
        { component: "330Ω 1/4W Metal Film Resistors", type: "Passives", qty: 4, unitCostUsd: 0.05, totalCostUsd: 0.20, footprint: "Axial-0.3in" },
      ],
    };
  }

  // Archetype 3: Universal Fallback
  const goalTitle = prompt && prompt.length > 3 ? (prompt.length > 30 ? `${prompt.slice(0, 30)}...` : prompt) : "Automated Smart Controller";
  const comp1 = `inv-sw-${now}`;
  const comp2 = `inv-clk-${now}`;
  const comp3 = `inv-gate-${now}`;
  const comp4 = `inv-dff-${now}`;
  const comp5 = `inv-led-${now}`;

  return {
    goal: goalTitle,
    systems: ["Input Sensors", "Control Logic", "Sequential State Latch", "Status Indicators", "Regulated Power"],
    theory: "Closed-loop control monitoring input thresholds and clock transitions to latch actuator states with low propagation delay and glitch suppression.",
    project: {
      schemaVersion: "1.0.0",
      metadata: {
        id: `proj-inv-${now}`,
        name: goalTitle,
        description: `AI-Synthesized Hardware Architecture for: ${prompt || "Smart Electronics"}`,
        mode: mode || "INTERMEDIATE",
        createdAt: now,
        updatedAt: now,
        author: "Kitt AI Architect",
        stars: 19,
        tags: ["AI-Generated", "Invention", "Digital Logic"],
      },
      components: [
        { id: comp1, type: "SWITCH", label: "Trigger Sensor", position: { x: 80, y: 140 }, rotation: 0, properties: { state: 1 } },
        { id: comp2, type: "CLOCK_GEN", label: "Heartbeat Clock (2Hz)", position: { x: 80, y: 260 }, rotation: 0, properties: { frequencyHz: 2 } },
        { id: comp3, type: "AND_GATE", label: "Logic Interlock", position: { x: 260, y: 130 }, rotation: 0, properties: { delayNs: 5 } },
        { id: comp4, type: "D_FLIP_FLOP", label: "State Latch", position: { x: 420, y: 130 }, rotation: 0, properties: { delayNs: 6 } },
        { id: comp5, type: "LED", label: "Actuator Indicator", position: { x: 580, y: 145 }, rotation: 0, properties: { color: "#06b6d4" } },
      ],
      connections: [
        { id: `net-s-${now}`, name: "Sensor_Net", source: { componentId: comp1, pinId: "out" }, targets: [{ componentId: comp3, pinId: "inA" }] },
        { id: `net-clk-${now}`, name: "Clock_Net", source: { componentId: comp2, pinId: "out" }, targets: [{ componentId: comp3, pinId: "inB" }, { componentId: comp4, pinId: "clk" }] },
        { id: `net-g-${now}`, name: "Gate_Net", source: { componentId: comp3, pinId: "out" }, targets: [{ componentId: comp4, pinId: "d" }] },
        { id: `net-out-${now}`, name: "Output_Net", source: { componentId: comp4, pinId: "q" }, targets: [{ componentId: comp5, pinId: "in" }] },
      ],
      simulationConfig: { timeStepNs: 1, maxIterationsPerStep: 1000, defaultLogicFamily: "TTL", clockFrequencyHz: 2, isRunning: true },
      viewState: { pan: { x: 40, y: 40 }, zoom: 1.0, activeView: "SCHEMATIC", selectedComponentIds: [], selectedNetIds: [], showGrid: true, snapToGrid: true },
    },
    testbench: [
      { name: "Active Trigger Test", description: "Sensor tripped HIGH; on positive clock edge, latch captures state and energizes output.", inputs: { [comp1]: 1 }, expectedOutputs: { [comp5]: 1 }, status: "PENDING" },
      { name: "Standby Idle Test", description: "Sensor LOW; logic interlock prevents activation, conserving power.", inputs: { [comp1]: 0 }, expectedOutputs: { [comp5]: 0 }, status: "PENDING" },
      { name: "Clock Edge Synchronization", description: "Confirms synchronous edge-triggered sampling without spurious glitches.", inputs: { [comp1]: 1 }, expectedOutputs: { [comp5]: 1 }, status: "PENDING" },
    ],
    bom: [
      { component: "Digital Sensor Interface", type: "Input Sensor", qty: 1, unitCostUsd: 1.85, totalCostUsd: 1.85, footprint: "THT-3P" },
      { component: "74HC08 Quad 2-Input AND Gate", type: "Digital Logic", qty: 1, unitCostUsd: 0.45, totalCostUsd: 0.45, footprint: "DIP-14" },
      { component: "74HC74 Dual D-Type Flip-Flop", type: "Sequential Logic", qty: 1, unitCostUsd: 0.60, totalCostUsd: 0.60, footprint: "DIP-14" },
      { component: "2.0Hz Crystal / 555 Oscillator", type: "Clock Gen", qty: 1, unitCostUsd: 0.35, totalCostUsd: 0.35, footprint: "DIP-8" },
      { component: "5mm Cyan High-Efficiency LED", type: "Indicator", qty: 1, unitCostUsd: 0.15, totalCostUsd: 0.15, footprint: "Radial-2P" },
      { component: "220Ω 1/4W Current Limiting Resistor", type: "Passives", qty: 2, unitCostUsd: 0.05, totalCostUsd: 0.10, footprint: "Axial-0.3in" },
      { component: "FR4 Double-Sided Prototype PCB", type: "PCB substrate", qty: 1, unitCostUsd: 1.50, totalCostUsd: 1.50, footprint: "80x60mm" },
    ],
  };
}

// AI Invention Synthesizer (Goal -> Systems -> Schematic -> Testbench -> BOM)
app.post("/api/ai/invent", async (req, res) => {
  try {
    const { prompt, mode } = req.body || {};
    // Provider-agnostic (NVIDIA NIM or Gemini).
    const ai = resolveStructuredClient();

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Missing required 'prompt' field." });
    }

    if (inspectPayloadSecurity(req.body)) {
      metrics.quarantinedThreats++;
      return res.status(400).json({ error: "Security alert: Illegal payload patterns detected." });
    }

    try {
      const response = await ai.generateStructuredContent<any>({
        systemInstruction: KITT_INVENT_SYSTEM_INSTRUCTION,
        contents: [{ role: "user", parts: [{ text: JSON.stringify({ prompt, mode }) }] }],
      });

      if (response.success && response.data && response.data.project) {
        return res.json(response.data);
      }

      console.warn("[INVENT] Model returned no usable structured payload, using intelligent fallback.");
      return res.json(generateInventionFallback(prompt, mode));
    } catch (aiErr: any) {
      console.warn("[INVENT] AI call failed, returning intelligent fallback:", aiErr?.message);
      const fallback = generateInventionFallback(prompt, mode);
      return res.json(fallback);
    }
  } catch (err: any) {
    console.error("[INVENT] Error handling invent request:", err);
    res.status(500).json({ error: err?.message || "Failed to synthesize invention" });
  }
});

// ============================================================
// 12. HIGH-SPEED STATIC SERVING & SPA FALLBACK
// ============================================================
async function configureStaticServing() {
  if (!IS_PROD) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), "dist");
    preloadDistAssets(distPath);

    // Fast-path router for preloaded static assets
    app.use((req, res, next) => {
      if (req.method !== "GET" && req.method !== "HEAD") return next();

      const pathname = req.path;
      const asset = memoryAssetCache.get(pathname);
      if (asset) {
        return serveCachedAsset(req, res, asset);
      }
      next();
    });

    // Standard static fallback for anything not preloaded
    app.use(
      express.static(distPath, {
        index: false,
        dotfiles: "ignore",
        maxAge: "1d",
      })
    );

    // SPA fallback route -> serves index.html from RAM
    app.get("*", (req, res) => {
      const indexAsset = memoryAssetCache.get("/index.html");
      if (indexAsset) {
        return serveCachedAsset(req, res, indexAsset);
      }
      const indexPath = path.resolve(distPath, "index.html");
      res.sendFile(indexPath);
    });
  }
}

// ============================================================
// 11. BOOTSTRAP & HIGH-CONCURRENCY SOCKET TUNING
// ============================================================
async function startServer() {
  await configureStaticServing();

  const server = http.createServer(app);

  // High Concurrency Tuning
  server.keepAliveTimeout = 65000;
  server.headersTimeout = 66000;
  server.maxHeadersCount = 100;
  // Whole-request wall-clock ceiling. NVIDIA NIM generations measured 19-31s
  // (nemotron-3-super-120b) and up to ~55s (gpt-oss-20b). At the previous 30s
  // this destroyed the socket mid-generation, so the client saw a dropped
  // connection instead of a reply.
  server.requestTimeout = 120000;

  server.on("connection", (socket) => {
    metrics.activeConnections++;
    socket.on("close", () => {
      metrics.activeConnections = Math.max(0, metrics.activeConnections - 1);
    });
  });

  server.listen(PORT, "0.0.0.0", () => {
    console.log(
      `[DEFENSE-SHIELD] KITT Org Hardened Server active on http://0.0.0.0:${PORT} (Mode: ${
        IS_PROD ? "Production" : "Development"
      })`
    );
    console.log(`[CONCURRENCY] Keep-Alive: 65s | HeadersTimeout: 66s | Defense: Active`);
  });
}

// Global Process Crash Guards
process.on("uncaughtException", (err) => {
  console.error("[RESILIENCE] Uncaught Exception intercepted:", err.message);
});

process.on("unhandledRejection", (reason) => {
  console.error("[RESILIENCE] Unhandled Rejection intercepted:", reason);
});

startServer().catch((err) => {
  console.error("Failed to launch hardened server:", err);
});
