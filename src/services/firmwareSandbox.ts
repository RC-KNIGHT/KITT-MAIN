/**
 * KITT Firmware Sandboxing & Real-Time Compiler Verification Engine
 * Provides multi-tier isolation, pre-compilation AST security analysis,
 * hardware pinout validation, resource caps, and bounded self-correction retry loops.
 */

import * as fs from 'fs';
import * as path from 'path';
import { exec, spawn } from 'child_process';
import { IGeminiClient } from './geminiClient';
import { Logger } from './logger';
import { IFirmwareCompiler } from './firmwareCompiler';
import {
  analyzeStatically,
  scanCodeSecurity,
  validateHardwarePins,
  CompileResult,
  SecurityScanResult,
} from './firmwareAnalyzer';

const logger = new Logger('FirmwareSandbox');

// Re-exported so existing importers of this module keep working unchanged.
export type { CompileResult, SecurityScanResult };

export class FirmwareSandbox implements IFirmwareCompiler {
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
    return scanCodeSecurity(sourceCode);
  }

  /**
   * Tier 2: Real hardware pin capability and direction validation.
   * Verifies pin numbers against board schema before invoking the compiler.
   */
  public validateHardwarePins(sourceCode: string, targetMcu: string): { valid: boolean; errors: string[] } {
    return validateHardwarePins(sourceCode, targetMcu);
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
    return analyzeStatically(sourceCode, targetMcu, startTime);
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
