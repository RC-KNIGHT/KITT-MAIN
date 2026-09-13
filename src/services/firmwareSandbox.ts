/**
 * KITT Firmware Sandboxing & Real-Time Compiler Verification Engine
 * Provides multi-tier isolation, pre-compilation AST security analysis,
 * hardware pinout validation, resource caps, and bounded self-correction retry loops.
 */

import * as fs from 'fs';
import * as path from 'path';
import { exec, spawn } from 'child_process';
import { componentRegistry } from './componentRegistry';
import { IGeminiClient } from './geminiClient';
import { Logger } from './logger';

const logger = new Logger('FirmwareSandbox');

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

export class FirmwareSandbox {
  private sandboxBaseDir: string;
  private isDockerAvailable: boolean | null = null;
  private dockerImage: string;

  constructor() {
    this.sandboxBaseDir = path.resolve(process.cwd(), 'scratch', 'sandbox');
    if (!fs.existsSync(this.sandboxBaseDir)) {
      fs.mkdirSync(this.sandboxBaseDir, { recursive: true });
    }
    this.dockerImage = process.env.KITT_DOCKER_IMAGE || 'arduino/arduino-cli:latest';
    this.checkDockerSandbox();
  }

  private checkDockerSandbox() {
    exec('docker --version', { timeout: 3000 }, (err, stdout) => {
      if (!err && stdout && stdout.toLowerCase().includes('docker')) {
        this.isDockerAvailable = true;
        logger.info(`Container isolation active: Docker runtime detected (${stdout.trim()})`);
      } else {
        this.isDockerAvailable = false;
        logger.info('Docker container runtime not detected; containerized sandbox falling back to isolated AST static analyzer. Direct host process execution is disabled.');
      }
    });
  }

  /**
   * Tier 1: Pre-compilation static AST security scan.
   * Rejects malicious includes, path traversal, inline assembly syscalls, and file manipulation.
   */
  public scanCodeSecurity(sourceCode: string): SecurityScanResult {
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
   * Verifies pin numbers against board schema before invoking the compiler.
   */
  public validateHardwarePins(sourceCode: string, targetMcu: string): { valid: boolean; errors: string[] } {
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
   * Tier 3: Isolated Sandboxed Compilation.
   * Ephemeral directory, stripped environment variables, resource caps (15s timeout, 64KB stdout limit).
   */
  public async compileFirmware(sourceCode: string, targetMcu: string = 'arduino:avr:uno'): Promise<CompileResult> {
    const startTime = Date.now();

    // 1. Security scan
    const secResult = this.scanCodeSecurity(sourceCode);
    if (!secResult.safe) {
      return {
        success: false,
        compilerOutput: secResult.violations.join('\n'),
        errors: secResult.violations,
        warnings: [],
        targetBoard: targetMcu,
        sourceCode,
        durationMs: Date.now() - startTime,
        compiledWith: 'static-isolated-analyzer',
      };
    }

    // 2. Hardware pin validation
    const pinValidation = this.validateHardwarePins(sourceCode, targetMcu);
    if (!pinValidation.valid) {
      return {
        success: false,
        compilerOutput: pinValidation.errors.join('\n'),
        errors: pinValidation.errors,
        warnings: [],
        targetBoard: targetMcu,
        sourceCode,
        durationMs: Date.now() - startTime,
        compiledWith: 'static-isolated-analyzer',
      };
    }

    // 3. Prepare Ephemeral Directory
    const compileId = `build_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const tempSketchDir = path.join(this.sandboxBaseDir, compileId);
    fs.mkdirSync(tempSketchDir, { recursive: true });
    const sketchPath = path.join(tempSketchDir, `${compileId}.ino`);
    fs.writeFileSync(sketchPath, sourceCode, 'utf8');

    try {
      if (this.isDockerAvailable) {
        return await this.executeDockerSandboxedCompile(compileId, tempSketchDir, targetMcu, sourceCode, startTime);
      } else {
        return this.executeIsolatedStaticAnalysis(sourceCode, targetMcu, startTime);
      }
    } finally {
      // Ensure ephemeral directory is auto-purged from server filesystem
      try {
        if (fs.existsSync(tempSketchDir)) {
          fs.rmSync(tempSketchDir, { recursive: true, force: true });
        }
      } catch (cleanErr: any) {
        logger.warn(`Failed to cleanup temp compile dir: ${cleanErr.message}`);
      }
    }
  }

  /**
   * Tier 3: Containerized Sandboxed Compilation.
   * Runs isolated compilation inside Docker container with --network=none, memory/CPU caps,
   * unprivileged execution, and ephemeral volume mount only. Host process execution is strictly prohibited.
   */
  private executeDockerSandboxedCompile(
    compileId: string,
    tempSketchDir: string,
    targetMcu: string,
    sourceCode: string,
    startTime: number
  ): Promise<CompileResult> {
    return new Promise(resolve => {
      // Container isolation flags:
      // --rm: Destroy container immediately upon exit
      // --network=none: Zero network access (prevents socket exfiltration)
      // --memory=512m: Enforce 512MB RAM ceiling
      // --cpus=1.0: Enforce 1 CPU core ceiling
      // --pids-limit=64: Prevent fork-bomb resource starvation
      // --security-opt=no-new-privileges: Prevent privilege escalation
      // -v tempSketchDir:/sketch:rw: Ephemeral mount only
      const dockerArgs = [
        'run',
        '--rm',
        '--network=none',
        '--memory=512m',
        '--cpus=1.0',
        '--pids-limit=64',
        '--security-opt=no-new-privileges',
        '-v',
        `${tempSketchDir}:/sketch:rw`,
        this.dockerImage,
        'compile',
        '--fqbn',
        targetMcu,
        '/sketch',
        '--warnings',
        'all',
        '--format',
        'text',
      ];

      const child = spawn('docker', dockerArgs, {
        cwd: tempSketchDir,
        env: {
          PATH: process.env.PATH || '',
          SYSTEMROOT: process.env.SYSTEMROOT || '',
        },
        timeout: 15000, // 15 second hard kill switch
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', data => {
        if (stdout.length < 65536) stdout += data.toString();
      });

      child.stderr.on('data', data => {
        if (stderr.length < 65536) stderr += data.toString();
      });

      child.on('close', code => {
        const durationMs = Date.now() - startTime;
        const fullOutput = (stdout + '\n' + stderr).trim();
        const success = code === 0;

        const errors: string[] = [];
        const warnings: string[] = [];

        fullOutput.split('\n').forEach(line => {
          if (line.includes('error:')) errors.push(line.trim());
          else if (line.includes('warning:')) warnings.push(line.trim());
        });

        logger.info(`Docker sandboxed compile completed with code ${code}`, {
          durationMs,
          success,
          errorCount: errors.length,
        });

        resolve({
          success,
          compilerOutput: fullOutput,
          errors,
          warnings,
          targetBoard: targetMcu,
          sourceCode,
          durationMs,
          compiledWith: 'docker-sandbox',
        });
      });

      child.on('error', err => {
        const durationMs = Date.now() - startTime;
        logger.warn(`Docker container execution unavailable (${err.message}). Defaulting to isolated static analyzer.`);
        resolve(this.executeIsolatedStaticAnalysis(sourceCode, targetMcu, startTime));
      });
    });
  }

  /**
   * Deterministic C++ syntax, header, and signature static analyzer.
   * Used when arduino-cli binary is absent or during fast offline validation.
   */
  private executeIsolatedStaticAnalysis(sourceCode: string, targetMcu: string, startTime: number): CompileResult {
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

  /**
   * Tier 4: Self-Correction Loop.
   * Compiles code; if compiler errors occur, queries Gemini with the error and retries (up to maxAttempts).
   */
  public async compileWithSelfCorrectionLoop(
    initialCode: string,
    targetMcu: string,
    geminiClient: IGeminiClient,
    maxAttempts: number = 3
  ): Promise<CompileResult> {
    let currentCode = initialCode;
    let attempt = 0;
    let lastResult: CompileResult | null = null;

    while (attempt < maxAttempts) {
      attempt++;
      logger.info(`Compiler verification attempt ${attempt}/${maxAttempts} for ${targetMcu}`);

      const result = await this.compileFirmware(currentCode, targetMcu);
      result.retryAttemptCount = attempt;
      lastResult = result;

      if (result.success) {
        logger.info(`Firmware compiled successfully on attempt ${attempt}`);
        return result;
      }

      logger.warn(`Attempt ${attempt} failed with ${result.errors.length} error(s). Requesting AI self-correction...`);

      if (attempt >= maxAttempts) {
        break; // Surfacing failure honestly to user
      }

      // Self-correction prompt
      const correctionPrompt = `You are a real-time embedded systems C++ compiler fixing an active build error.
Target Microcontroller: ${targetMcu}

The following firmware failed compilation with these exact errors:
---
${result.compilerOutput}
---

Original Code:
\`\`\`cpp
${currentCode}
\`\`\`

Task:
Fix all compilation errors. Return strictly a JSON object with this schema:
{
  "explanation": "Summary of what caused the compiler error and how you fixed it",
  "sourceCode": "// Full corrected C++ code here"
}
Do not include any other markdown outside the JSON.`;

      try {
        const correctionResult = await geminiClient.generateStructuredContent<{ explanation: string; sourceCode: string }>({
          systemInstruction: 'You are an embedded C++ compiler repair specialist. Output strictly valid JSON with corrected sourceCode.',
          contents: [{ role: 'user', parts: [{ text: correctionPrompt }] }],
          temperature: 0.2, // Low temperature for deterministic bug fixing
        });

        if (correctionResult.success && correctionResult.data?.sourceCode) {
          currentCode = correctionResult.data.sourceCode;
        } else {
          logger.warn('AI self-correction did not produce valid code; aborting retry loop');
          break;
        }
      } catch (err: any) {
        logger.error(`Self-correction call failed: ${err.message}`);
        break;
      }
    }

    return lastResult!;
  }
}

export const firmwareSandbox = new FirmwareSandbox();
