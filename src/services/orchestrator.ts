/**
 * KITT Master Hardware Orchestrator
 * Glues intent routing, Gemini structured generation, validation gates,
 * simulation physics, electrical panel calculations, and sandboxed firmware compile loops.
 */

import { intentRouter } from './intentRouter';
import { getGeminiClient, IGeminiClient } from './geminiClient';
import { validateAndRepairHardwareResponse, StructuredHardwareResponse, HardwareAction } from './schemas/actionSchema';
import { simulationEngine, SimulationGateResult } from './simulationEngine';
import { electricalPanelEngine, PanelValidationResult } from './electricalPanelEngine';
import { firmwareSandbox, CompileResult } from './firmwareSandbox';
import { costBomEngine, BomSummary } from './costBomEngine';
import { componentRegistry } from './componentRegistry';
import { Logger } from './logger';

const logger = new Logger('KittOrchestrator');

export interface CoreChatRequestPayload {
  messages: Array<{ role: string; content: string }>;
  circuit?: {
    title?: string;
    components?: any[];
    wires?: any[];
  };
  telemetry?: {
    supplyVoltage?: number;
    currentDraw_mA?: number;
    powerConsumption_mW?: number;
    violations?: any[];
  };
  requestId?: string;
}

export interface CoreChatResponsePayload {
  reply: string;
  proposedPatch?: any;
  panelReport?: PanelValidationResult;
  simulationReport?: SimulationGateResult;
  compileResult?: CompileResult;
  bom?: BomSummary;
  model: string;
  isMock: boolean;
}

const SYSTEM_INSTRUCTION_DIGITAL = `You are KITT Core (KITT 1.0 Autonomous Hardware Agent) — elite senior electronics design, circuit simulation, and silicon systems engineering intelligence.

CORE DIRECTIVES:
1. STRUCTURED HARDWARE OUTPUT ONLY:
   You must return STRICT JSON matching the StructuredHardwareResponse schema with:
   - "intent": "DIGITAL_LOGIC_CIRCUIT" | "TECHNICAL_QNA"
   - "explanation": Clear, authoritative engineering explanation formatted in Markdown
   - "mathDerivation": Mathematical derivations (Ohm's law, voltage dividers, RC tau, thermal dissipation, loop currents) using LaTeX
   - "actions": Array of atomic hardware actions ("create_component", "connect_pins", "delete_component", "move_component", "set_property")
   - "firmware": If an MCU (ESP32, Arduino Uno, Pico) is involved, provide complete valid sourceCode, targetMcu, and pinAssignments.

2. PHYSICAL ACCURACY & PIN CONSTRAINTS:
   - ESP32 GPIO 34, 35, 36, 39 are INPUT-ONLY (GPI). NEVER use them as outputs to drive LEDs, relays, or servos.
   - Always place a current-limiting resistor (e.g. 220Ω-330Ω) in series with standard LEDs.
   - Ensure level shifting or dividers when interfacing 5V sensors (like classic ultrasonic echo) with 3.3V MCUs.
   - Decouple power rails with 100nF ceramic capacitors near IC supply pins.`;

const SYSTEM_INSTRUCTION_PANEL = `You are KITT Core Electrical Panel & Power Distribution Architect — master engineer for AC electrical panels, miniature circuit breakers (MCBs), and industrial switchgear.

CORE DIRECTIVES:
1. STRUCTURED OUTPUT ONLY:
   Return STRICT JSON matching the StructuredHardwareResponse schema with:
   - "intent": "ELECTRICAL_PANEL_MCB"
   - "explanation": Engineering summary of the panel layout and protection design
   - "mathDerivation": Exact load calculations, continuous load 125% derivations, and conductor ampacity sizing formulas
   - "actions": Array of electrical panel actions ("set_panel_specs", "create_breaker", "assign_to_busbar", "connect_branch_load", "set_breaker_rating")

2. NATIONAL ELECTRICAL CODE (NEC / IEC) RULES:
   - Continuous Load 125% Rule: Breaker trip rating must be >= 1.25 * continuous load + non-continuous load.
   - Conductor Sizing: 15A breaker requires min 14 AWG copper; 20A breaker requires min 12 AWG copper; 30A breaker requires min 10 AWG copper.
   - NEVER double-tap a breaker terminal lug (one branch conductor per breaker).
   - Balance loads between Phase L1 and Phase L2 (or L3) to keep phase delta under 15%.`;

export class KittOrchestrator {
  private geminiClient: IGeminiClient;

  constructor(customClient?: IGeminiClient) {
    this.geminiClient = customClient || getGeminiClient();
  }

  public async handleCoreChatRequest(payload: CoreChatRequestPayload): Promise<CoreChatResponsePayload> {
    const startTime = Date.now();
    const requestId = payload.requestId || `req_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const lastUserMsg = payload.messages[payload.messages.length - 1]?.content || '';

    logger.info(`Received hardware query: "${lastUserMsg.slice(0, 80)}..."`, { requestId });

    // 1. Intent Routing
    const route = intentRouter.route(lastUserMsg);
    logger.info(`Routed query to domain ${route.domain} (confidence: ${route.confidence})`, { requestId });

    // 2. Select System Prompt and Domain Strategy
    const isPanel = route.domain === 'ELECTRICAL_PANEL_MCB';
    const systemInstruction = isPanel ? SYSTEM_INSTRUCTION_PANEL : SYSTEM_INSTRUCTION_DIGITAL;

    // 3. Build Conversation Context with Telemetry Injection
    const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

    // Inject hardware context
    if (payload.circuit || payload.telemetry) {
      const activeParts = payload.circuit?.components?.map((c: any) => `${c.label || c.id} (${c.partNumber || c.type})`).join(', ') || 'Empty';
      const contextMsg = `[ACTIVE HARDWARE CONTEXT]:
- Circuit: "${payload.circuit?.title || 'Active Hardware Design'}"
- Active Components: ${activeParts}
- Supply Voltage: ${payload.telemetry?.supplyVoltage || 5.0}V
- Current Consumption: ${payload.telemetry?.currentDraw_mA || 0}mA`;

      contents.push({ role: 'user', parts: [{ text: contextMsg }] });
      contents.push({ role: 'model', parts: [{ text: 'Grounded in active hardware context.' }] });
    }

    // Append user dialogue history (bounded to last 6 messages)
    const boundedHistory = payload.messages.slice(-6);
    boundedHistory.forEach(msg => {
      contents.push({
        role: msg.role === 'assistant' || msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      });
    });

    // 4. Call Gemini Model (or Mock Fallback)
    const aiResult = await this.geminiClient.generateStructuredContent<StructuredHardwareResponse>({
      systemInstruction,
      contents,
      requestId,
    });

    // 5. Schema Validation & Automated Repair Gate
    const validated = validateAndRepairHardwareResponse(aiResult.data || {});
    const structuredData = validated.repairedResponse || {
      intent: route.domain,
      explanation: aiResult.rawText || 'Hardware processing complete.',
      actions: [],
    };

    logger.info(`Schema validation outcome: ${validated.valid ? 'VALID' : 'REPAIRED'}`, {
      actionCount: structuredData.actions.length,
      requestId,
    });

    let panelReport: PanelValidationResult | undefined;
    let simulationReport: SimulationGateResult | undefined;
    let compileResult: CompileResult | undefined;
    let proposedPatch: any = undefined;

    // 6. Domain-Specific Simulation & Verification Gates
    if (structuredData.intent === 'ELECTRICAL_PANEL_MCB') {
      // --- ELECTRICAL PANEL GATE ---
      const panelActions = structuredData.actions.filter(
        (a): a is any =>
          a.actionType === 'create_breaker' ||
          a.actionType === 'assign_to_busbar' ||
          a.actionType === 'connect_branch_load' ||
          a.actionType === 'set_panel_specs' ||
          a.actionType === 'set_breaker_rating'
      );

      const panel = electricalPanelEngine.buildPanelFromActions(panelActions);
      panelReport = electricalPanelEngine.evaluatePanel(panel);

      logger.info(`Panel gate evaluated: ${panelReport.status}`, {
        connectedLoad: panelReport.totalConnectedLoadAmps,
        imbalance: panelReport.phaseImbalancePercent,
        violations: panelReport.violations.length,
        requestId,
      });

    } else {
      // --- DIGITAL CIRCUIT & DRC GATE ---
      const digitalActions = structuredData.actions.filter(
        (a): a is any =>
          a.actionType === 'create_component' ||
          a.actionType === 'connect_pins' ||
          a.actionType === 'delete_component' ||
          a.actionType === 'move_component' ||
          a.actionType === 'set_property'
      );

      // Construct working component and wire lists
      const workingComponents = [...(payload.circuit?.components || [])];
      const workingWires = [...(payload.circuit?.wires || [])];

      // Apply proposed actions to working model
      digitalActions.forEach(act => {
        if (act.actionType === 'create_component') {
          workingComponents.push({
            id: act.payload.id,
            partNumber: act.payload.partNumber,
            label: act.payload.label,
          });
        } else if (act.actionType === 'connect_pins') {
          workingWires.push({
            id: act.payload.id || `w_${Date.now()}`,
            fromComponentId: act.payload.fromComponentId,
            fromPinId: act.payload.fromPinId,
            toComponentId: act.payload.toComponentId,
            toPinId: act.payload.toPinId,
            signalType: act.payload.signalType,
          });
        } else if (act.actionType === 'delete_component') {
          const idx = workingComponents.findIndex(c => c.id === act.payload.componentId);
          if (idx >= 0) workingComponents.splice(idx, 1);
        }
      });

      simulationReport = simulationEngine.evaluateCircuit(workingComponents, workingWires);

      logger.info(`Simulation gate evaluated: ${simulationReport.status}`, {
        violations: simulationReport.violations.length,
        currentDraw: simulationReport.telemetry.currentDraw_mA,
        requestId,
      });

      // Build frontend-compatible CIR Patch Transaction
      if (digitalActions.length > 0) {
        proposedPatch = {
          id: `patch_${Date.now()}`,
          timestamp: 'Just now',
          description: structuredData.explanation.slice(0, 100),
          actions: digitalActions.map(act => {
            if (act.actionType === 'create_component') {
              return {
                type: 'ADD_COMPONENT',
                component: {
                  id: act.payload.id,
                  partNumber: act.payload.partNumber,
                  displayName: act.payload.label,
                  category: act.payload.category || 'sensor',
                  package: 'MODULE_HEADER',
                  parameters: act.payload.parameters || {},
                  pins: [],
                  schematic: { x: act.payload.position?.x || 150, y: act.payload.position?.y || 150, rotation: 0 },
                  physical: { anchorRow: 10, anchorCol: 'e', rotation: 0, footprint3D: 'standard' },
                  isVerifiedModel: true,
                  confidenceScore: 0.98,
                },
              };
            }
            if (act.actionType === 'connect_pins') {
              return {
                type: 'CONNECT',
                wire: {
                  id: act.payload.id || `w_${Date.now()}`,
                  fromComponentId: act.payload.fromComponentId,
                  fromPinId: act.payload.fromPinId,
                  toComponentId: act.payload.toComponentId,
                  toPinId: act.payload.toPinId,
                  signalType: act.payload.signalType || 'DIGITAL',
                  color: act.payload.color || '#06b6d4',
                  netName: act.payload.netName || 'NET',
                },
              };
            }
            if (act.actionType === 'delete_component') {
              return { type: 'REMOVE_COMPONENT', componentId: act.payload.componentId };
            }
            if (act.actionType === 'set_property') {
              return {
                type: 'SET_PARAMETER',
                componentId: act.payload.componentId,
                paramName: act.payload.key,
                value: act.payload.value,
              };
            }
            return { type: 'MOVE_COMPONENT', componentId: (act as any).payload.componentId };
          }),
          status: 'pending',
        };
      }
    }

    // 7. Sandboxed Firmware Verification Loop
    if (structuredData.firmware && structuredData.firmware.sourceCode) {
      const targetMcu = structuredData.firmware.targetMcu || route.suggestedMcu || 'arduino:avr:uno';
      logger.info(`Entering firmware compilation sandbox for ${targetMcu}`, { requestId });

      compileResult = await firmwareSandbox.compileWithSelfCorrectionLoop(
        structuredData.firmware.sourceCode,
        targetMcu,
        this.geminiClient,
        3 // Max 3 retry attempts
      );

      // Update firmware source with corrected code if self-correction modified it
      structuredData.firmware.sourceCode = compileResult.sourceCode;
    }

    // 8. Bill of Materials (BOM) Generation
    const allComponentsToBom: Array<{ id: string; partNumber: string }> = [];
    if (payload.circuit?.components) {
      allComponentsToBom.push(...payload.circuit.components);
    }
    structuredData.actions.forEach(a => {
      if (a.actionType === 'create_component') {
        allComponentsToBom.push({ id: a.payload.id, partNumber: a.payload.partNumber });
      } else if (a.actionType === 'create_breaker') {
        allComponentsToBom.push({ id: a.payload.id, partNumber: `${a.payload.tripRatingAmps}a-mcb` });
      }
    });

    const bom = costBomEngine.generateBom(allComponentsToBom);

    // 9. Formulate Rich Markdown Response
    const responseSections: string[] = [];

    // Section A: Core Explanation
    responseSections.push(structuredData.explanation);

    // Section B: Physics / Math Derivations (LaTeX)
    if (structuredData.mathDerivation) {
      responseSections.push(`### 📐 Electrical & Physical Derivations\n${structuredData.mathDerivation}`);
    }

    // Section C: Domain Reports
    if (panelReport) {
      responseSections.push(panelReport.derivationSummary);
      if (panelReport.violations.length > 0) {
        const violationText = panelReport.violations
          .map(v => `- **[${v.severity}] ${v.code}** (${v.standardReference}): ${v.message}\n  *Action*: ${v.recommendation}`)
          .join('\n');
        responseSections.push(`#### ⚠️ Panel Safety & Code Compliance Audit:\n${violationText}`);
      }
    }

    if (simulationReport && simulationReport.violations.length > 0) {
      const violationText = simulationReport.violations
        .map(v => `- **[${v.severity}] ${v.code}**: ${v.message}\n  *Action*: ${v.recommendation}`)
        .join('\n');
      responseSections.push(`#### ⚠️ Simulation DRC Notice:\n${violationText}`);
    }

    // Section D: Firmware Compilation Status
    if (compileResult) {
      const statusIcon = compileResult.success ? '✅' : '❌';
      const compilerNotes = compileResult.success
        ? `Firmware successfully compiled and verified against \`${compileResult.targetBoard}\` target toolchain (${compileResult.compiledWith}, verified in ${compileResult.durationMs}ms).`
        : `Firmware failed compiler verification (${compileResult.errors.length} errors):\n\`\`\`\n${compileResult.compilerOutput}\n\`\`\``;

      responseSections.push(`### 💻 Compiler Verification Status: ${statusIcon}\n${compilerNotes}`);
    }

    // Section E: Bill of Materials (BOM)
    if (bom.items.length > 0) {
      responseSections.push(`### 📋 System Bill of Materials (BOM)\n${bom.markdownTable}`);
    }

    const durationMs = Date.now() - startTime;
    logger.info(`Orchestration pipeline complete in ${durationMs}ms`, { requestId });

    return {
      reply: responseSections.join('\n\n'),
      proposedPatch,
      panelReport,
      simulationReport,
      compileResult,
      bom,
      model: aiResult.modelUsed,
      isMock: aiResult.isMock,
    };
  }
}

export const kittOrchestrator = new KittOrchestrator();
