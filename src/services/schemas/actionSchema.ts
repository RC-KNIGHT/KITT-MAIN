/**
 * KITT Unified Hardware Action Schema & Runtime Validation Gate
 * Enforces structured actions for Digital/Logic Circuits and Electrical Panel/MCB Design.
 * Handles server-side validation and automated repairing of malformed model outputs.
 */

export type HardwareDomain =
  | 'DIGITAL_LOGIC_CIRCUIT'
  | 'ELECTRICAL_PANEL_MCB'
  | 'FIRMWARE_COMPILATION'
  | 'TECHNICAL_QNA';

// Digital Circuit Action Types
export type DigitalAction =
  | {
      actionType: 'create_component';
      payload: {
        id: string;
        partNumber: string;
        label: string;
        category?: string;
        position?: { x: number; y: number };
        rotation?: 0 | 90 | 180 | 270;
        parameters?: Record<string, string | number>;
      };
    }
  | {
      actionType: 'connect_pins';
      payload: {
        id?: string;
        fromComponentId: string;
        fromPinId: string;
        toComponentId: string;
        toPinId: string;
        signalType?: string;
        color?: string;
        netName?: string;
      };
    }
  | {
      actionType: 'delete_component';
      payload: {
        componentId: string;
      };
    }
  | {
      actionType: 'move_component';
      payload: {
        componentId: string;
        position: { x: number; y: number };
      };
    }
  | {
      actionType: 'set_property';
      payload: {
        componentId: string;
        key: string;
        value: string | number;
      };
    }
  | {
      actionType: 'generate_firmware';
      payload: {
        targetMcu: string;
        environment: 'arduino' | 'cpp' | 'micropython' | 'espidf';
        sourceCode: string;
        libraries?: string[];
        pinAssignments?: Record<string, number | string>;
      };
    }
  | {
      actionType: 'modify_subsystem';
      payload: {
        subsystemName: string;
        replacementActions: HardwareAction[];
      };
    };

// Electrical Panel / MCB Action Types
export type ElectricalPanelAction =
  | {
      actionType: 'create_breaker';
      payload: {
        id: string;
        poles: 1 | 2 | 3;
        tripRatingAmps: number;
        curve: 'B' | 'C' | 'D';
        label: string;
        manufacturer?: string;
        kaRating?: number; // Interrupting capacity in kA (e.g. 6kA, 10kA)
      };
    }
  | {
      actionType: 'assign_to_busbar';
      payload: {
        breakerId: string;
        phase: 'L1' | 'L2' | 'L3' | 'NEUTRAL';
        slotNumber: number;
      };
    }
  | {
      actionType: 'connect_branch_load';
      payload: {
        breakerId: string;
        loadName: string;
        continuousCurrentAmps: number;
        nonContinuousCurrentAmps?: number;
        wireGaugeAwg: number;
        cableType?: 'THHN' | 'NM-B_ROMEX' | 'MC' | 'ARMORED';
        powerFactor?: number;
      };
    }
  | {
      actionType: 'set_breaker_rating';
      payload: {
        breakerId: string;
        tripRatingAmps: number;
        curve?: 'B' | 'C' | 'D';
      };
    }
  | {
      actionType: 'set_panel_specs';
      payload: {
        panelId?: string;
        mainRatingAmps: number;
        busbarRatingAmps: number;
        voltageSystem: '120/240V_SPLIT' | '230/400V_3PHASE' | '120/208V_3PHASE';
        phases: 1 | 3;
      };
    }
  | {
      actionType: 'balance_phases';
      payload: {
        targetMaxImbalancePercent: number;
      };
    };

export type HardwareAction = DigitalAction | ElectricalPanelAction;

export interface StructuredHardwareResponse {
  intent: HardwareDomain;
  explanation: string;
  mathDerivation?: string;
  actions: HardwareAction[];
  firmware?: {
    targetMcu: string;
    environment: 'arduino' | 'cpp' | 'micropython' | 'espidf';
    sourceCode: string;
    libraries: string[];
    pinAssignments: Record<string, number | string>;
  };
  validationSummary?: {
    status: 'VALID' | 'AUTO_REPAIRED' | 'REJECTED';
    errors: string[];
    warnings: string[];
  };
}

export interface ValidationResult {
  valid: boolean;
  repairedResponse?: StructuredHardwareResponse;
  errors: string[];
  warnings: string[];
}

/**
 * Validates and repairs incoming raw AI output to enforce strict schema adherence.
 */
export function validateAndRepairHardwareResponse(rawInput: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!rawInput || typeof rawInput !== 'object') {
    return { valid: false, errors: ['Response payload is not a valid JSON object'], warnings: [] };
  }

  // 1. Validate Intent
  const validIntents: HardwareDomain[] = [
    'DIGITAL_LOGIC_CIRCUIT',
    'ELECTRICAL_PANEL_MCB',
    'FIRMWARE_COMPILATION',
    'TECHNICAL_QNA',
  ];
  let intent: HardwareDomain = 'TECHNICAL_QNA';
  if (typeof rawInput.intent === 'string' && validIntents.includes(rawInput.intent as HardwareDomain)) {
    intent = rawInput.intent as HardwareDomain;
  } else {
    warnings.push(`Unrecognized or missing intent "${rawInput.intent}", defaulting to TECHNICAL_QNA`);
  }

  // 2. Validate Explanation
  const explanation = typeof rawInput.explanation === 'string' && rawInput.explanation.trim().length > 0
    ? rawInput.explanation.trim()
    : 'Hardware action set generated by KITT Core.';

  // 3. Validate and Repair Actions
  const rawActions = Array.isArray(rawInput.actions) ? rawInput.actions : [];
  const sanitizedActions: HardwareAction[] = [];

  for (let idx = 0; idx < rawActions.length; idx++) {
    const act = rawActions[idx];
    if (!act || typeof act !== 'object') {
      warnings.push(`Skipped malformed action at index ${idx}: not an object.`);
      continue;
    }

    const { actionType, payload } = act;
    if (!actionType || typeof actionType !== 'string' || !payload || typeof payload !== 'object') {
      warnings.push(`Skipped action at index ${idx}: missing actionType or payload.`);
      continue;
    }

    switch (actionType) {
      // --- DIGITAL ACTIONS ---
      case 'create_component': {
        const id = String(payload.id || `comp_${Date.now()}_${idx}`).trim();
        const partNumber = String(payload.partNumber || payload.catalogId || payload.type || 'GENERIC_PART').trim();
        const label = String(payload.label || partNumber).trim();
        sanitizedActions.push({
          actionType: 'create_component',
          payload: {
            id,
            partNumber,
            label,
            category: payload.category ? String(payload.category) : undefined,
            position: {
              x: Number(payload.position?.x) || 100 + idx * 80,
              y: Number(payload.position?.y) || 150,
            },
            rotation: [0, 90, 180, 270].includes(Number(payload.rotation)) ? payload.rotation : 0,
            parameters: typeof payload.parameters === 'object' ? payload.parameters : {},
          },
        });
        break;
      }

      case 'connect_pins': {
        const fromComp = String(payload.fromComponentId || payload.sourceComponentId || '').trim();
        const fromPin = String(payload.fromPinId || payload.sourcePinId || '').trim();
        const toComp = String(payload.toComponentId || payload.targetComponentId || '').trim();
        const toPin = String(payload.toPinId || payload.targetPinId || '').trim();

        if (!fromComp || !fromPin || !toComp || !toPin) {
          warnings.push(`Action 'connect_pins' at index ${idx} missing endpoint IDs; discarded.`);
          continue;
        }

        sanitizedActions.push({
          actionType: 'connect_pins',
          payload: {
            id: String(payload.id || `net_${Date.now()}_${idx}`),
            fromComponentId: fromComp,
            fromPinId: fromPin,
            toComponentId: toComp,
            toPinId: toPin,
            signalType: payload.signalType ? String(payload.signalType) : 'DIGITAL',
            color: payload.color ? String(payload.color) : '#8F8F8F',
            netName: payload.netName ? String(payload.netName) : `${fromComp}_${fromPin}_TO_${toComp}_${toPin}`,
          },
        });
        break;
      }

      case 'delete_component': {
        const compId = String(payload.componentId || payload.id || '').trim();
        if (!compId) {
          warnings.push(`Action 'delete_component' at index ${idx} missing componentId.`);
          continue;
        }
        sanitizedActions.push({
          actionType: 'delete_component',
          payload: { componentId: compId },
        });
        break;
      }

      case 'move_component': {
        const compId = String(payload.componentId || payload.id || '').trim();
        if (!compId) continue;
        sanitizedActions.push({
          actionType: 'move_component',
          payload: {
            componentId: compId,
            position: {
              x: Number(payload.position?.x) || 0,
              y: Number(payload.position?.y) || 0,
            },
          },
        });
        break;
      }

      case 'set_property': {
        const compId = String(payload.componentId || payload.id || '').trim();
        const key = String(payload.key || payload.paramName || '').trim();
        if (!compId || !key) continue;
        sanitizedActions.push({
          actionType: 'set_property',
          payload: {
            componentId: compId,
            key,
            value: payload.value ?? '',
          },
        });
        break;
      }

      case 'generate_firmware': {
        sanitizedActions.push({
          actionType: 'generate_firmware',
          payload: {
            targetMcu: String(payload.targetMcu || 'arduino:avr:uno'),
            environment: ['arduino', 'cpp', 'micropython', 'espidf'].includes(payload.environment)
              ? payload.environment
              : 'arduino',
            sourceCode: String(payload.sourceCode || ''),
            libraries: Array.isArray(payload.libraries) ? payload.libraries.map(String) : [],
            pinAssignments: typeof payload.pinAssignments === 'object' ? payload.pinAssignments : {},
          },
        });
        break;
      }

      // --- ELECTRICAL PANEL ACTIONS ---
      case 'create_breaker': {
        const id = String(payload.id || `mcb_${Date.now()}_${idx}`).trim();
        const poles = [1, 2, 3].includes(Number(payload.poles)) ? Number(payload.poles) as 1 | 2 | 3 : 1;
        const tripRatingAmps = Number(payload.tripRatingAmps) || 16;
        const curve = ['B', 'C', 'D'].includes(String(payload.curve).toUpperCase())
          ? (String(payload.curve).toUpperCase() as 'B' | 'C' | 'D')
          : 'C';
        const label = String(payload.label || `${tripRatingAmps}A MCB Type ${curve}`).trim();

        sanitizedActions.push({
          actionType: 'create_breaker',
          payload: {
            id,
            poles,
            tripRatingAmps,
            curve,
            label,
            manufacturer: payload.manufacturer ? String(payload.manufacturer) : 'Schneider/ABB Industrial',
            kaRating: Number(payload.kaRating) || 6,
          },
        });
        break;
      }

      case 'assign_to_busbar': {
        const breakerId = String(payload.breakerId || '').trim();
        const phase = ['L1', 'L2', 'L3', 'NEUTRAL'].includes(String(payload.phase).toUpperCase())
          ? (String(payload.phase).toUpperCase() as 'L1' | 'L2' | 'L3' | 'NEUTRAL')
          : 'L1';
        const slotNumber = Number(payload.slotNumber) || idx + 1;

        if (!breakerId) {
          warnings.push(`Action 'assign_to_busbar' missing breakerId.`);
          continue;
        }

        sanitizedActions.push({
          actionType: 'assign_to_busbar',
          payload: { breakerId, phase, slotNumber },
        });
        break;
      }

      case 'connect_branch_load': {
        const breakerId = String(payload.breakerId || '').trim();
        const loadName = String(payload.loadName || 'Branch Load').trim();
        const continuousCurrentAmps = Math.max(0, Number(payload.continuousCurrentAmps) || 0);
        const nonContinuousCurrentAmps = Math.max(0, Number(payload.nonContinuousCurrentAmps) || 0);
        const wireGaugeAwg = Number(payload.wireGaugeAwg) || 14;

        if (!breakerId) {
          warnings.push(`Action 'connect_branch_load' missing breakerId.`);
          continue;
        }

        sanitizedActions.push({
          actionType: 'connect_branch_load',
          payload: {
            breakerId,
            loadName,
            continuousCurrentAmps,
            nonContinuousCurrentAmps,
            wireGaugeAwg,
            cableType: payload.cableType || 'THHN',
            powerFactor: Number(payload.powerFactor) || 0.95,
          },
        });
        break;
      }

      case 'set_panel_specs': {
        sanitizedActions.push({
          actionType: 'set_panel_specs',
          payload: {
            panelId: payload.panelId ? String(payload.panelId) : 'MAIN_PANEL_1',
            mainRatingAmps: Number(payload.mainRatingAmps) || 100,
            busbarRatingAmps: Number(payload.busbarRatingAmps) || 125,
            voltageSystem: ['120/240V_SPLIT', '230/400V_3PHASE', '120/208V_3PHASE'].includes(payload.voltageSystem)
              ? payload.voltageSystem
              : '230/400V_3PHASE',
            phases: Number(payload.phases) === 3 ? 3 : 1,
          },
        });
        break;
      }

      case 'balance_phases': {
        sanitizedActions.push({
          actionType: 'balance_phases',
          payload: {
            targetMaxImbalancePercent: Number(payload.targetMaxImbalancePercent) || 10,
          },
        });
        break;
      }

      default:
        warnings.push(`Unsupported actionType '${actionType}' ignored.`);
        break;
    }
  }

  // 4. Validate Firmware Sub-Payload if present
  let firmware: StructuredHardwareResponse['firmware'] = undefined;
  if (rawInput.firmware && typeof rawInput.firmware === 'object') {
    firmware = {
      targetMcu: String(rawInput.firmware.targetMcu || 'arduino:avr:uno'),
      environment: ['arduino', 'cpp', 'micropython', 'espidf'].includes(rawInput.firmware.environment)
        ? rawInput.firmware.environment
        : 'arduino',
      sourceCode: String(rawInput.firmware.sourceCode || ''),
      libraries: Array.isArray(rawInput.firmware.libraries) ? rawInput.firmware.libraries.map(String) : [],
      pinAssignments: typeof rawInput.firmware.pinAssignments === 'object' ? rawInput.firmware.pinAssignments : {},
    };
  }

  const repairedResponse: StructuredHardwareResponse = {
    intent,
    explanation,
    mathDerivation: typeof rawInput.mathDerivation === 'string' ? rawInput.mathDerivation : undefined,
    actions: sanitizedActions,
    firmware,
    validationSummary: {
      status: warnings.length === 0 ? 'VALID' : 'AUTO_REPAIRED',
      errors,
      warnings,
    },
  };

  return {
    valid: errors.length === 0,
    repairedResponse,
    errors,
    warnings,
  };
}
