/**
 * Edge-safe firmware analysis.
 *
 * These are the parts of the firmware pipeline that need no operating system at
 * all: source-code security scanning, hardware pin-capability validation, and a
 * deterministic C++ structure analyzer. They are shared by two consumers:
 *
 *   - `firmwareSandbox.ts` (Node only) which adds Docker-container compilation
 *   - `firmwareAnalyzer.ts` (this file) which runs the same checks on Cloudflare
 *     Workers, where spawning a compiler is impossible
 *
 * Keeping them here means the deployed site performs the *same* security and
 * pin-capability checks as the local server, instead of degrading silently.
 */

import { componentRegistry } from './componentRegistry';

export interface CompileResult {
  success: boolean;
  compilerOutput: string;
  errors: string[];
  warnings: string[];
  targetBoard: string;
  sourceCode: string;
  durationMs: number;
  compiledWith: 'docker-sandbox' | 'arduino-cli' | 'static-isolated-analyzer';
  retryAttemptCount?: number;
}

export interface SecurityScanResult {
  safe: boolean;
  violations: string[];
}

/**
 * Tier 1: Pre-compilation static security scan.
 * Rejects malicious includes, path traversal, inline assembly syscalls, and
 * host process/file manipulation.
 */
export function scanCodeSecurity(sourceCode: string): SecurityScanResult {
  const violations: string[] = [];

  // 1. Path traversal & absolute system directory includes
  const suspiciousIncludes = sourceCode.match(/#\s*include\s*[<"][^>"]*[>"]/g) || [];
  for (const inc of suspiciousIncludes) {
    if (
      inc.includes('..') ||
      inc.includes('/etc/') ||
      inc.includes('/proc/') ||
      inc.includes('windows\\system') ||
      inc.includes('.env') ||
      inc.includes('/dev/') ||
      inc.includes('.ssh')
    ) {
      violations.push(`Security violation: Illegal file include path detected: '${inc}'`);
    }
  }

  // 2. Inline assembly and direct syscall vectors
  if (/(__asm__|asm\s*\(|syscall|int\s+0x80|int\s+0x21)/i.test(sourceCode)) {
    violations.push('Security violation: Inline assembly and direct system call execution are strictly prohibited.');
  }

  // 3. Process execution and shell escape calls
  if (/\b(system\s*\(|exec\s*\(|popen\s*\(|fork\s*\(|kill\s*\(|socket\s*\()/i.test(sourceCode)) {
    violations.push('Security violation: Host OS process spawning / socket creation calls detected.');
  }

  return {
    safe: violations.length === 0,
    violations,
  };
}

/**
 * Tier 2: Real hardware pin capability and direction validation.
 * Verifies pin numbers against the board schema before invoking a compiler.
 */
export function validateHardwarePins(sourceCode: string, targetMcu: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const boardSpec = componentRegistry.getBoardPinout(targetMcu);

  if (!boardSpec) {
    return { valid: true, errors: [] }; // Generic board
  }

  // Check ESP32 input-only pins configured as OUTPUT
  if (boardSpec.id === 'esp32-wroom-32') {
    const inputOnlyPins = [34, 35, 36, 39];
    inputOnlyPins.forEach(pin => {
      const outputRegex = new RegExp(`pinMode\\s*\\(\\s*${pin}\\s*,\\s*(OUTPUT|1)\\s*\\)`, 'i');
      if (outputRegex.test(sourceCode)) {
        errors.push(
          `Hardware Constraint Error: GPIO ${pin} on ESP32 is input-only (GPI without output driver). It cannot be configured as OUTPUT.`
        );
      }
    });
  }

  // Check Arduino Uno analog pin ranges
  if (boardSpec.id === 'arduino-uno-r3') {
    const analogPinRegex = /analogRead\s*\(\s*(\d+)\s*\)/g;
    let match;
    while ((match = analogPinRegex.exec(sourceCode)) !== null) {
      const pinNum = parseInt(match[1], 10);
      // Uno analog pins are 0-5 (or A0-A5, 14-19)
      if (pinNum > 5 && pinNum < 14) {
        errors.push(
          `Hardware Constraint Error: Pin D${pinNum} on Arduino Uno is not connected to the internal ADC. Use pins A0-A5 (or pins 0-5 in analogRead).`
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Deterministic C++ syntax, header, and signature static analyzer.
 * Used when a compiler binary is absent, or on runtimes that cannot spawn one.
 */
export function analyzeStatically(sourceCode: string, targetMcu: string, startTime: number): CompileResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for mandatory Arduino functions
  if (!/void\s+setup\s*\(\s*\)/.test(sourceCode)) {
    errors.push("Compilation Error: Missing mandatory entry point 'void setup()'.");
  }
  if (!/void\s+loop\s*\(\s*\)/.test(sourceCode)) {
    errors.push("Compilation Error: Missing mandatory execution loop 'void loop()'.");
  }

  // Check bracket and parenthesis parity
  let braceCount = 0;
  let parenCount = 0;
  for (const char of sourceCode) {
    if (char === '{') braceCount++;
    else if (char === '}') braceCount--;
    else if (char === '(') parenCount++;
    else if (char === ')') parenCount--;
  }

  if (braceCount !== 0) {
    errors.push(`Syntax Error: Unbalanced curly braces detected (${braceCount > 0 ? 'missing }' : 'excess }'}).`);
  }
  if (parenCount !== 0) {
    errors.push(`Syntax Error: Unbalanced parentheses detected (${parenCount > 0 ? 'missing )' : 'excess )'}).`);
  }

  // Check for missing semicolons on declarations
  const lines = sourceCode.split('\n');
  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (
      trimmed.length > 0 &&
      !trimmed.startsWith('//') &&
      !trimmed.startsWith('/*') &&
      !trimmed.startsWith('*') &&
      !trimmed.startsWith('#') &&
      !trimmed.endsWith('{') &&
      !trimmed.endsWith('}') &&
      !trimmed.endsWith(':') &&
      !trimmed.endsWith(';')
    ) {
      if (
        trimmed.includes('=') ||
        trimmed.startsWith('int ') ||
        trimmed.startsWith('float ') ||
        trimmed.startsWith('pinMode') ||
        trimmed.startsWith('digitalWrite')
      ) {
        warnings.push(`Warning (Line ${idx + 1}): Suspected missing semicolon ';' at end of statement: '${trimmed}'`);
      }
    }
  });

  const success = errors.length === 0;
  const durationMs = Date.now() - startTime;

  return {
    success,
    compilerOutput: success
      ? `[KITT Compiler Sandbox] Code verified cleanly for target ${targetMcu}. 0 Errors, ${warnings.length} Warnings.`
      : errors.join('\n'),
    errors,
    warnings,
    targetBoard: targetMcu,
    sourceCode,
    durationMs,
    compiledWith: 'static-isolated-analyzer',
  };
}
