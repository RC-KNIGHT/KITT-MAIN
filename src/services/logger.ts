/**
 * KITT Backend Structured Logger
 * Provides request ID tracing, credential redaction, timing metrics, and structured log events.
 */

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  requestId?: string;
  module: string;
  message: string;
  durationMs?: number;
  metadata?: Record<string, any>;
}

function sanitizeLogData(data: any): any {
  if (typeof data === 'string') {
    let sanitized = data;
    const keys = [
      process.env.GEMINI_API_KEY,
      process.env.GEMINI_API_KEY_LANDING,
      process.env.GEMINI_API_KEY_CORE,
    ].filter(Boolean) as string[];

    for (const key of keys) {
      if (key && key.length > 6) {
        sanitized = sanitized.split(key).join('[REDACTED_API_KEY]');
      }
    }
    sanitized = sanitized.replace(/AIza[0-9A-Za-z-_]{35}/g, '[REDACTED_API_KEY]');
    sanitized = sanitized.replace(/sk-[a-zA-Z0-9]{32,}/g, '[REDACTED_API_KEY]');
    sanitized = sanitized.replace(/Bearer\s+[a-zA-Z0-9_\-\.\=]{20,}/gi, 'Bearer [REDACTED_TOKEN]');
    return sanitized;
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizeLogData(item));
  }

  if (typeof data === 'object' && data !== null) {
    const cleanObj: Record<string, any> = {};
    for (const [k, v] of Object.entries(data)) {
      if (/key|token|secret|password|auth/i.test(k)) {
        cleanObj[k] = '[REDACTED]';
      } else {
        cleanObj[k] = sanitizeLogData(v);
      }
    }
    return cleanObj;
  }

  return data;
}

export class Logger {
  private module: string;

  constructor(module: string) {
    this.module = module;
  }

  private emit(level: LogLevel, message: string, metadata?: Record<string, any>, durationMs?: number, requestId?: string) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      requestId,
      module: this.module,
      message: sanitizeLogData(message),
      durationMs,
      metadata: metadata ? sanitizeLogData(metadata) : undefined,
    };

    const formatted = `[${entry.timestamp}] [${entry.level}] [${entry.module}]${requestId ? ` [req:${requestId}]` : ''} ${entry.message}${durationMs !== undefined ? ` (${durationMs}ms)` : ''}`;
    
    switch (level) {
      case 'ERROR':
        console.error(formatted, entry.metadata ? JSON.stringify(entry.metadata) : '');
        break;
      case 'WARN':
        console.warn(formatted, entry.metadata ? JSON.stringify(entry.metadata) : '');
        break;
      case 'DEBUG':
        if (process.env.NODE_ENV !== 'production') {
          console.debug(formatted, entry.metadata ? JSON.stringify(entry.metadata) : '');
        }
        break;
      case 'INFO':
      default:
        console.log(formatted, entry.metadata ? JSON.stringify(entry.metadata) : '');
        break;
    }
  }

  info(message: string, metadata?: Record<string, any>, durationMs?: number, requestId?: string) {
    this.emit('INFO', message, metadata, durationMs, requestId);
  }

  warn(message: string, metadata?: Record<string, any>, durationMs?: number, requestId?: string) {
    this.emit('WARN', message, metadata, durationMs, requestId);
  }

  error(message: string, metadata?: Record<string, any>, durationMs?: number, requestId?: string) {
    this.emit('ERROR', message, metadata, durationMs, requestId);
  }

  debug(message: string, metadata?: Record<string, any>, durationMs?: number, requestId?: string) {
    this.emit('DEBUG', message, metadata, durationMs, requestId);
  }
}
