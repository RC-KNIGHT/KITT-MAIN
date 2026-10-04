/**
 * Firmware compilation strategies.
 *
 * The orchestrator only depends on the `IFirmwareCompiler` interface, so the two
 * runtimes can supply different implementations of the same contract:
 *
 *   - Node        -> `FirmwareSandbox` (Docker container isolation, see firmwareSandbox.ts)
 *   - Edge/Workers -> `EdgeFirmwareCompiler` (this file: no OS process, static analysis)
 *
 * Both apply the identical security scan and pin-capability validation, so the
 * deployed site never skips a safety check just because it cannot run a compiler.
 */

import { IGeminiClient } from './geminiClient';
import { Logger } from './logger';
import {
  analyzeStatically,
  scanCodeSecurity,
  validateHardwarePins,
  CompileResult,
} from './firmwareAnalyzer';

const logger = new Logger('FirmwareCompiler');

export interface IFirmwareCompiler {
  compileWithSelfCorrectionLoop(
    initialCode: string,
    targetMcu: string,
    geminiClient: IGeminiClient,
    maxAttempts?: number
  ): Promise<CompileResult>;
}

/**
 * Constructs the firmware compiler appropriate to the runtime.
 *
 * This indirection is deliberate. `firmwareSandbox.ts` imports `fs`, `path` and
 * `child_process` at module scope, which cannot be bundled for Cloudflare
 * Workers. By loading it only through a dynamic import inside this factory, the
 * edge bundle never pulls those Node builtins in, while Node keeps the full
 * Docker-isolated sandbox.
 */
export async function createFirmwareCompiler(): Promise<IFirmwareCompiler> {
  const { firmwareSandbox } = await import('./firmwareSandbox');
  return firmwareSandbox;
}

/**
 * Runs the full firmware verification pipeline on a runtime with no OS access.
 *
 * Tier 1 security scan and Tier 2 pin validation are identical to the Node path.
 * Tier 3 becomes deterministic static analysis instead of containerized
 * compilation, because Workers cannot spawn a compiler subprocess.
 */
export class EdgeFirmwareCompiler implements IFirmwareCompiler {
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
      logger.info(`Edge verification attempt ${attempt}/${maxAttempts} for ${targetMcu}`);

      const result = this.verifyOnce(currentCode, targetMcu);
      result.retryAttemptCount = attempt;
      lastResult = result;

      if (result.success) {
        logger.info(`Firmware verified successfully on attempt ${attempt}`);
        return result;
      }

      logger.warn(`Attempt ${attempt} failed with ${result.errors.length} error(s). Requesting AI self-correction...`);

      if (attempt >= maxAttempts) {
        break; // Surface the failure honestly rather than looping forever.
      }

      const correctionPrompt = `You are a real-time embedded systems C++ compiler fixing an active build error.
Target Microcontroller: ${targetMcu}

The following firmware failed verification with these exact errors:
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
          systemInstruction:
            'You are an embedded C++ compiler repair specialist. Output strictly valid JSON with corrected sourceCode.',
          contents: [{ role: 'user', parts: [{ text: correctionPrompt }] }],
          temperature: 0.2,
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

  /** Security scan -> pin validation -> static analysis. */
  private verifyOnce(sourceCode: string, targetMcu: string): CompileResult {
    const startTime = Date.now();

    const secResult = scanCodeSecurity(sourceCode);
    if (!secResult.safe) {
      return this.failure(secResult.violations, targetMcu, sourceCode, startTime);
    }

    const pinValidation = validateHardwarePins(sourceCode, targetMcu);
    if (!pinValidation.valid) {
      return this.failure(pinValidation.errors, targetMcu, sourceCode, startTime);
    }

    return analyzeStatically(sourceCode, targetMcu, startTime);
  }

  private failure(
    errors: string[],
    targetMcu: string,
    sourceCode: string,
    startTime: number
  ): CompileResult {
    return {
      success: false,
      compilerOutput: errors.join('\n'),
      errors,
      warnings: [],
      targetBoard: targetMcu,
      sourceCode,
      durationMs: Date.now() - startTime,
      compiledWith: 'static-isolated-analyzer',
    };
  }
}

export const edgeFirmwareCompiler = new EdgeFirmwareCompiler();

/** Factory kept for parity with `createFirmwareCompiler`; no Node deps needed. */
export const createEdgeFirmwareCompiler = (): IFirmwareCompiler => edgeFirmwareCompiler;
