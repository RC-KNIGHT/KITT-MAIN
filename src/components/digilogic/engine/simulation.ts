/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  CircuitAnalysisResult,
  CircuitComponent,
  CustomGateDefinition,
  GateType,
  LogicState,
  SimulationState,
  TruthTableData,
  TruthTableRow,
  Wire,
} from '../types/circuit';
import { getAlphabetSequenceLabel } from './componentFactory';

/**
 * Pure Digital Logic Evaluator for a single component
 */
export function evaluateComponent(
  component: CircuitComponent,
  inputs: Record<string, LogicState>,
  currentState: Record<string, any> = {},
  customGateDefs: Map<string, CustomGateDefinition> = new Map(),
  tickNumber: number = 0
): { outputs: Record<string, LogicState>; nextState: Record<string, any> } {
  const nextState = { ...currentState };
  const outputs: Record<string, LogicState> = {};

  // Helper to convert LogicState to boolean/number
  const toNum = (val: LogicState | undefined, def: number = 0): number => {
    if (val === 1) return 1;
    if (val === 0) return 0;
    return def;
  };

  const toBool = (val: LogicState | undefined): boolean => val === 1;

  switch (component.type) {
    case 'AND': {
      // 1 if all inputs are 1
      let allHigh = true;
      for (let i = 0; i < component.inputCount; i++) {
        const val = inputs[`in_${i}`];
        if (val !== 1) {
          allHigh = false;
          break;
        }
      }
      outputs['out'] = allHigh ? 1 : 0;
      break;
    }

    case 'OR': {
      // 1 if any input is 1
      let anyHigh = false;
      for (let i = 0; i < component.inputCount; i++) {
        const val = inputs[`in_${i}`];
        if (val === 1) {
          anyHigh = true;
          break;
        }
      }
      outputs['out'] = anyHigh ? 1 : 0;
      break;
    }

    case 'NOT': {
      const inVal = inputs['in_0'];
      outputs['out'] = inVal === 1 ? 0 : 1;
      break;
    }

    case 'NAND': {
      // 0 if all inputs are 1, otherwise 1
      let allHigh = true;
      for (let i = 0; i < component.inputCount; i++) {
        const val = inputs[`in_${i}`];
        if (val !== 1) {
          allHigh = false;
          break;
        }
      }
      outputs['out'] = allHigh ? 0 : 1;
      break;
    }

    case 'NOR': {
      // 1 if all inputs are 0 (no input is 1)
      let anyHigh = false;
      for (let i = 0; i < component.inputCount; i++) {
        const val = inputs[`in_${i}`];
        if (val === 1) {
          anyHigh = true;
          break;
        }
      }
      outputs['out'] = anyHigh ? 0 : 1;
      break;
    }

    case 'XOR': {
      // 1 if odd number of 1s (Modulo-2 sum / Odd parity)
      let count1 = 0;
      for (let i = 0; i < component.inputCount; i++) {
        if (inputs[`in_${i}`] === 1) count1++;
      }
      outputs['out'] = count1 % 2 === 1 ? 1 : 0;
      break;
    }

    case 'XNOR': {
      // 1 if even number of 1s (Inverted XOR / Even parity)
      let count1 = 0;
      for (let i = 0; i < component.inputCount; i++) {
        if (inputs[`in_${i}`] === 1) count1++;
      }
      outputs['out'] = count1 % 2 === 0 ? 1 : 0;
      break;
    }

    case 'BUFFER': {
      const inVal = inputs['in_0'];
      if (inVal === 'X') outputs['out'] = 'X';
      else if (inVal === 1) outputs['out'] = 1;
      else outputs['out'] = 0;
      break;
    }

    case 'TRI_STATE_BUFFER': {
      const en = inputs['in_en'];
      const data = inputs['in_0'];
      // Active HIGH Enable
      if (en === 1) {
        if (data === 'X') outputs['out'] = 'X';
        else if (data === 1) outputs['out'] = 1;
        else outputs['out'] = 0;
      } else {
        // Disabled / High-Impedance State
        outputs['out'] = 'Z';
      }
      break;
    }

    case 'SWITCH': {
      outputs['out'] = currentState.value ? 1 : 0;
      break;
    }

    case 'BUTTON': {
      outputs['out'] = currentState.pressed ? 1 : 0;
      break;
    }

    case 'CLOCK': {
      outputs['out'] = currentState.clockState ? 1 : 0;
      break;
    }

    case 'CONST_0': {
      outputs['out'] = 0;
      break;
    }

    case 'CONST_1': {
      outputs['out'] = 1;
      break;
    }

    case 'PULSE': {
      outputs['out'] = currentState.pulseActive ? 1 : 0;
      break;
    }

    case 'RANDOM': {
      outputs['out'] = currentState.value ? 1 : 0;
      break;
    }

    case 'LED':
    case 'PROBE': {
      // Pure indicators - just register value in state
      nextState.currentValue = inputs['in_0'];
      break;
    }

    case 'SEGMENT_7': {
      // Keep track of segment input states
      const segs: Record<string, LogicState> = {};
      ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'dp'].forEach((s) => {
        segs[s] = inputs[`in_${s}`] === 1 ? 1 : 0;
      });
      nextState.segments = segs;
      break;
    }

    case 'HEX_DISPLAY':
    case 'DECIMAL_DISPLAY':
    case 'BINARY_DISPLAY': {
      const d3 = toNum(inputs['in_3']);
      const d2 = toNum(inputs['in_2']);
      const d1 = toNum(inputs['in_1']);
      const d0 = toNum(inputs['in_0']);
      const value = (d3 << 3) | (d2 << 2) | (d1 << 1) | d0;
      nextState.numericValue = value;
      nextState.hexValue = value.toString(16).toUpperCase();
      nextState.decValue = value.toString(10);
      nextState.bits = [d3, d2, d1, d0];
      break;
    }

    case 'HALF_ADDER': {
      const a = toNum(inputs['in_a']);
      const b = toNum(inputs['in_b']);
      outputs['out_sum'] = a ^ b ? 1 : 0;
      outputs['out_carry'] = a & b ? 1 : 0;
      break;
    }

    case 'FULL_ADDER': {
      const a = toNum(inputs['in_a']);
      const b = toNum(inputs['in_b']);
      const cin = toNum(inputs['in_cin']);
      const sum = a ^ b ^ cin;
      const cout = (a & b) | (cin & (a ^ b));
      outputs['out_sum'] = sum ? 1 : 0;
      outputs['out_cout'] = cout ? 1 : 0;
      break;
    }

    case 'HALF_SUBTRACTOR': {
      const a = toNum(inputs['in_a']);
      const b = toNum(inputs['in_b']);
      outputs['out_diff'] = a ^ b ? 1 : 0;
      outputs['out_borrow'] = !a && b ? 1 : 0;
      break;
    }

    case 'FULL_SUBTRACTOR': {
      const a = toNum(inputs['in_a']);
      const b = toNum(inputs['in_b']);
      const bin = toNum(inputs['in_bin']);
      const diff = a ^ b ^ bin;
      const bout = (!a && b) || (bin && !(a ^ b)) ? 1 : 0;
      outputs['out_diff'] = diff ? 1 : 0;
      outputs['out_bout'] = bout ? 1 : 0;
      break;
    }

    case 'MUX_2_1': {
      const d0 = toNum(inputs['in_d0']);
      const d1 = toNum(inputs['in_d1']);
      const s = toNum(inputs['in_s']);
      outputs['out'] = (s === 0 ? d0 : d1) as LogicState;
      break;
    }

    case 'MUX_4_1': {
      const s0 = toNum(inputs['in_s0']);
      const s1 = toNum(inputs['in_s1']);
      const sel = (s1 << 1) | s0;
      const d = [
        toNum(inputs['in_d0']),
        toNum(inputs['in_d1']),
        toNum(inputs['in_d2']),
        toNum(inputs['in_d3']),
      ];
      outputs['out'] = d[sel] as LogicState;
      break;
    }

    case 'DEMUX_1_2': {
      const d = toNum(inputs['in_d']);
      const s = toNum(inputs['in_s']);
      outputs['out_y0'] = s === 0 ? (d as LogicState) : 0;
      outputs['out_y1'] = s === 1 ? (d as LogicState) : 0;
      break;
    }

    case 'DEMUX_1_4': {
      const d = toNum(inputs['in_d']);
      const s0 = toNum(inputs['in_s0']);
      const s1 = toNum(inputs['in_s1']);
      const sel = (s1 << 1) | s0;
      for (let i = 0; i < 4; i++) {
        outputs[`out_y${i}`] = i === sel ? (d as LogicState) : 0;
      }
      break;
    }

    case 'DECODER_2_4': {
      const a0 = toNum(inputs['in_a0']);
      const a1 = toNum(inputs['in_a1']);
      const en = inputs['in_en'] === undefined ? 1 : toNum(inputs['in_en']);
      const sel = (a1 << 1) | a0;
      for (let i = 0; i < 4; i++) {
        outputs[`out_y${i}`] = en && i === sel ? 1 : 0;
      }
      break;
    }

    case 'DECODER_3_8': {
      const a0 = toNum(inputs['in_a0']);
      const a1 = toNum(inputs['in_a1']);
      const a2 = toNum(inputs['in_a2']);
      const en = inputs['in_en'] === undefined ? 1 : toNum(inputs['in_en']);
      const sel = (a2 << 2) | (a1 << 1) | a0;
      for (let i = 0; i < 8; i++) {
        outputs[`out_y${i}`] = en && i === sel ? 1 : 0;
      }
      break;
    }

    case 'ENCODER_4_2': {
      const d3 = toNum(inputs['in_d3']);
      const d2 = toNum(inputs['in_d2']);
      const d1 = toNum(inputs['in_d1']);
      const d0 = toNum(inputs['in_d0']);
      const valid: LogicState = d3 || d2 || d1 || d0 ? 1 : 0;
      let a1: LogicState = 0;
      let a0: LogicState = 0;
      if (d3) {
        a1 = 1;
        a0 = 1;
      } else if (d2) {
        a1 = 1;
        a0 = 0;
      } else if (d1) {
        a1 = 0;
        a0 = 1;
      }
      outputs['out_a1'] = a1;
      outputs['out_a0'] = a0;
      outputs['out_v'] = valid;
      break;
    }

    case 'COMPARATOR_1BIT': {
      const a = toNum(inputs['in_a']);
      const b = toNum(inputs['in_b']);
      outputs['out_gt'] = a > b ? 1 : 0;
      outputs['out_eq'] = a === b ? 1 : 0;
      outputs['out_lt'] = a < b ? 1 : 0;
      break;
    }

    case 'COMPARATOR_2BIT': {
      const a = (toNum(inputs['in_a1']) << 1) | toNum(inputs['in_a0']);
      const b = (toNum(inputs['in_b1']) << 1) | toNum(inputs['in_b0']);
      outputs['out_gt'] = a > b ? 1 : 0;
      outputs['out_eq'] = a === b ? 1 : 0;
      outputs['out_lt'] = a < b ? 1 : 0;
      break;
    }

    case 'RIPPLE_ADDER_4BIT': {
      const a =
        (toNum(inputs['in_a3']) << 3) |
        (toNum(inputs['in_a2']) << 2) |
        (toNum(inputs['in_a1']) << 1) |
        toNum(inputs['in_a0']);
      const b =
        (toNum(inputs['in_b3']) << 3) |
        (toNum(inputs['in_b2']) << 2) |
        (toNum(inputs['in_b1']) << 1) |
        toNum(inputs['in_b0']);
      const cin = toNum(inputs['in_cin']);
      const sumTotal = a + b + cin;
      for (let i = 0; i < 4; i++) {
        outputs[`out_s${i}`] = (sumTotal >> i) & 1 ? 1 : 0;
      }
      outputs['out_cout'] = sumTotal >= 16 ? 1 : 0;
      break;
    }

    case 'PARITY_GEN': {
      const bits = [
        toNum(inputs['in_d0']),
        toNum(inputs['in_d1']),
        toNum(inputs['in_d2']),
        toNum(inputs['in_d3']),
      ];
      const count1 = bits.filter((b) => b === 1).length;
      const even = count1 % 2 === 0 ? 0 : 1; // parity bit to make total even
      outputs['out_even'] = even;
      outputs['out_odd'] = even ? 0 : 1;
      break;
    }

    case 'PARITY_CHECK': {
      const bits = [
        toNum(inputs['in_d0']),
        toNum(inputs['in_d1']),
        toNum(inputs['in_d2']),
        toNum(inputs['in_d3']),
      ];
      const p = toNum(inputs['in_p']);
      const total1 = bits.filter((b) => b === 1).length + p;
      // Parity error if total number of 1s is odd
      outputs['out_err'] = total1 % 2 !== 0 ? 1 : 0;
      break;
    }

    case 'SR_LATCH': {
      const s = toNum(inputs['in_s']);
      const r = toNum(inputs['in_r']);
      let q = currentState.q !== undefined ? currentState.q : 0;
      if (s === 1 && r === 1) {
        // Invalid condition
        outputs['out_q'] = 'X';
        outputs['out_not_q'] = 'X';
        nextState.q = 'X';
      } else if (s === 1 && r === 0) {
        outputs['out_q'] = 1;
        outputs['out_not_q'] = 0;
        nextState.q = 1;
      } else if (s === 0 && r === 1) {
        outputs['out_q'] = 0;
        outputs['out_not_q'] = 1;
        nextState.q = 0;
      } else {
        // Hold
        outputs['out_q'] = q;
        outputs['out_not_q'] = q === 1 ? 0 : 1;
      }
      break;
    }

    case 'D_FLIP_FLOP': {
      const d = toNum(inputs['in_d']);
      const clk = toNum(inputs['in_clk']);
      const lastClk = currentState.lastClk !== undefined ? currentState.lastClk : 0;
      let q = currentState.q !== undefined ? currentState.q : 0;

      // Rising edge detection (clk: 0 -> 1)
      if (clk === 1 && lastClk === 0) {
        q = d;
      }
      nextState.q = q;
      nextState.lastClk = clk;
      outputs['out_q'] = q as LogicState;
      outputs['out_not_q'] = q === 1 ? 0 : 1;
      break;
    }

    case 'JK_FLIP_FLOP': {
      const j = toNum(inputs['in_j']);
      const k = toNum(inputs['in_k']);
      const clk = toNum(inputs['in_clk']);
      const lastClk = currentState.lastClk !== undefined ? currentState.lastClk : 0;
      let q = currentState.q !== undefined ? currentState.q : 0;

      if (clk === 1 && lastClk === 0) {
        if (j === 1 && k === 0) q = 1;
        else if (j === 0 && k === 1) q = 0;
        else if (j === 1 && k === 1) q = q === 1 ? 0 : 1; // Toggle
      }
      nextState.q = q;
      nextState.lastClk = clk;
      outputs['out_q'] = q as LogicState;
      outputs['out_not_q'] = q === 1 ? 0 : 1;
      break;
    }

    case 'T_FLIP_FLOP': {
      const t = toNum(inputs['in_t']);
      const clk = toNum(inputs['in_clk']);
      const lastClk = currentState.lastClk !== undefined ? currentState.lastClk : 0;
      let q = currentState.q !== undefined ? currentState.q : 0;

      if (clk === 1 && lastClk === 0) {
        if (t === 1) q = q === 1 ? 0 : 1;
      }
      nextState.q = q;
      nextState.lastClk = clk;
      outputs['out_q'] = q as LogicState;
      outputs['out_not_q'] = q === 1 ? 0 : 1;
      break;
    }

    case 'COUNTER_4BIT': {
      const clk = toNum(inputs['in_clk']);
      const rst = toNum(inputs['in_rst']);
      const en = inputs['in_en'] === undefined ? 1 : toNum(inputs['in_en']);
      const lastClk = currentState.lastClk !== undefined ? currentState.lastClk : 0;
      let count = currentState.count !== undefined ? currentState.count : 0;

      if (rst === 1) {
        count = 0;
      } else if (clk === 1 && lastClk === 0 && en === 1) {
        count = (count + 1) % 16;
      }
      nextState.count = count;
      nextState.lastClk = clk;
      for (let i = 0; i < 4; i++) {
        outputs[`out_q${i}`] = (count >> i) & 1 ? 1 : 0;
      }
      break;
    }

    case 'REGISTER_4BIT': {
      const clk = toNum(inputs['in_clk']);
      const load = toNum(inputs['in_load']);
      const lastClk = currentState.lastClk !== undefined ? currentState.lastClk : 0;
      let storedBits = currentState.storedBits || [0, 0, 0, 0];

      if (clk === 1 && lastClk === 0 && load === 1) {
        storedBits = [
          toNum(inputs['in_d0']),
          toNum(inputs['in_d1']),
          toNum(inputs['in_d2']),
          toNum(inputs['in_d3']),
        ];
      }
      nextState.storedBits = storedBits;
      nextState.lastClk = clk;
      for (let i = 0; i < 4; i++) {
        outputs[`out_q${i}`] = storedBits[i] as LogicState;
      }
      break;
    }

    case 'CUSTOM_IC': {
      if (component.customGateId && customGateDefs.has(component.customGateId)) {
        const customDef = customGateDefs.get(component.customGateId)!;
        // Nested simulation of subcircuit!
        const subSimResult = simulateSubcircuit(customDef, inputs, currentState.subState || {}, customGateDefs);
        Object.assign(outputs, subSimResult.outputs);
        nextState.subState = subSimResult.nextState;
      }
      break;
    }

    default:
      break;
  }

  return { outputs, nextState };
}

/**
 * Simulates an encapsulated subcircuit for Custom IC gates
 */
export function simulateSubcircuit(
  customDef: CustomGateDefinition,
  externalInputs: Record<string, LogicState>,
  currentSubState: Record<string, any> = {},
  customGateDefs: Map<string, CustomGateDefinition>
): { outputs: Record<string, LogicState>; nextState: Record<string, any> } {
  // Inject external inputs into corresponding input components inside subcircuit
  const compMap = new Map(customDef.components.map((c) => [c.id, { ...c }]));
  const subComponents = Array.from(compMap.values());
  const subWires = customDef.wires;

  // Override input component values inside subcircuit matching customDef.inputPorts
  customDef.inputPorts.forEach((port) => {
    const matchingInputComp = subComponents.find(
      (c) => c.name === port.name || c.id === port.id || c.label === port.name
    );
    if (matchingInputComp) {
      matchingInputComp.internalState = {
        ...matchingInputComp.internalState,
        value: externalInputs[port.id] === 1 ? 1 : 0,
      };
    }
  });

  // Run full simulation passes on subcircuit
  const simState = simulateCircuit(subComponents, subWires, customGateDefs, currentSubState);

  // Collect outputs from subcircuit components matching customDef.outputPorts
  const outputs: Record<string, LogicState> = {};
  customDef.outputPorts.forEach((port) => {
    const matchingOutputComp = subComponents.find(
      (c) => c.name === port.name || c.id === port.id || c.label === port.name
    );
    if (matchingOutputComp) {
      // Find what drives its input port
      const inVal = simState.portValues[matchingOutputComp.id]?.['in_0'] ?? 0;
      outputs[port.id] = inVal;
    } else {
      outputs[port.id] = 0;
    }
  });

  return { outputs, nextState: simState.componentStates };
}

export const INPUT_COMPONENT_TYPES = new Set<GateType>([
  'SWITCH',
  'BUTTON',
  'CLOCK',
  'CONST_0',
  'CONST_1',
  'PULSE',
  'RANDOM',
]);

export function isInputComponent(type: GateType): boolean {
  return INPUT_COMPONENT_TYPES.has(type);
}

/**
 * Resolve the state a component should be evaluated with.
 *
 * BUG FIX: previously we did `componentStates[comp.id] || comp.internalState || {}`.
 * Because `componentStates[comp.id]` is an object (always truthy once it exists),
 * that cached simulation-loop value ALWAYS won over `comp.internalState` — even
 * right after the user toggled a switch/button or a CLOCK tick flipped state.
 * The fresh click/tick landed on `comp.internalState`, but evaluation kept
 * reading the stale cached copy, so the component's glow/output silently
 * stopped responding (looked "stuck on" or "stuck off") and stayed that way,
 * in both paused and running simulation.
 *
 * For INPUT components (SWITCH, BUTTON, CLOCK, CONST_0/1, PULSE, RANDOM) the
 * component's own `internalState` (driven by user clicks / tick effect) is
 * always the freshest source of truth, so we merge it on top of any cached
 * state instead of letting the cache shadow it. Non-input, stateful
 * components (flip-flops, latches, counters, etc.) keep using the cached
 * simulation state as before, since their memory lives in the simulation
 * loop, not on the component object.
 */
function resolveComponentState(
  comp: CircuitComponent,
  componentStates: Record<string, any>
): Record<string, any> {
  const cached = componentStates[comp.id];
  if (isInputComponent(comp.type)) {
    return { ...(cached || {}), ...(comp.internalState || {}) };
  }
  return cached || comp.internalState || {};
}

/**
 * Full Circuit Simulation Pass with Multi-Iteration Propagation & Loop Stability
 */
export function simulateCircuit(
  rawComponents: CircuitComponent[] = [],
  rawWires: Wire[] = [],
  customGateDefs: Map<string, CustomGateDefinition> = new Map(),
  prevComponentStates: Record<string, any> = {},
  maxIterations: number = 30,
  isPaused: boolean = false
): SimulationState {
  // Defensive normalization to prevent crashes from null / undefined entries
  const components = Array.isArray(rawComponents) ? rawComponents.filter((c) => c && typeof c === 'object' && c.id) : [];
  const wires = Array.isArray(rawWires) ? rawWires.filter((w) => w && typeof w === 'object' && w.id && w.fromComponentId && w.toComponentId) : [];

  const portValues: Record<string, Record<string, LogicState>> = {};
  const wireValues: Record<string, LogicState> = {};
  let componentStates: Record<string, any> = { ...(prevComponentStates || {}) };

  // When simulation is PAUSED:
  // Only input components reflect their own state (if turned ON / 1 they glow; if OFF / 0 they behave normally).
  // All other components (gates, adders, ICs, displays, LEDs) and all wires stop glowing.
  if (isPaused) {
    components.forEach((comp) => {
      portValues[comp.id] = {};
      const existingState = resolveComponentState(comp, componentStates);

      if (isInputComponent(comp.type)) {
        // Evaluate only input component so its own state and output port value reflect whether it is ON (1) or OFF (0)
        const { outputs, nextState } = evaluateComponent(comp, {}, existingState, customGateDefs, 0);
        componentStates[comp.id] = nextState;
        if (Array.isArray(comp.ports)) {
          comp.ports.forEach((p) => {
            if (p && p.id) {
              portValues[comp.id][p.id] = outputs[p.id] ?? 0;
            }
          });
        }
      } else {
        // Non-input components: all ports set to 0 (dormant / not glowing)
        if (Array.isArray(comp.ports)) {
          comp.ports.forEach((p) => {
            if (p && p.id) {
              portValues[comp.id][p.id] = 0;
            }
          });
        }
        // Dormant indicator states
        if (comp.type === 'LED' || comp.type === 'PROBE') {
          componentStates[comp.id] = { ...existingState, currentValue: 0 };
        } else if (comp.type === 'SEGMENT_7') {
          componentStates[comp.id] = {
            ...existingState,
            segments: { a: 0, b: 0, c: 0, d: 0, e: 0, f: 0, g: 0, dp: 0 },
          };
        } else if (comp.type === 'HEX_DISPLAY' || comp.type === 'DECIMAL_DISPLAY' || comp.type === 'BINARY_DISPLAY') {
          componentStates[comp.id] = {
            ...existingState,
            numericValue: 0,
            hexValue: '0',
            decValue: '0',
            bits: [0, 0, 0, 0],
          };
        }
      }
    });

    // All wires are 0 (unlit / dormant / not glowing) while paused
    wires.forEach((wire) => {
      wireValues[wire.id] = 0;
    });

    return {
      portValues,
      wireValues,
      componentStates,
      simulationStep: 0,
      hasErrors: false,
      errorMessages: [],
      loopDetected: false,
    };
  }

  const compMap = new Map<string, CircuitComponent>();
  components.forEach((c) => compMap.set(c.id, c));

  // Initialize port values table: ComponentId -> PortId -> LogicState
  // Inputs start at 0 (unconnected default ground) so gates evaluate correctly on first pass.
  // Outputs start at 'Z' (floating/unevaluated until driven).
  components.forEach((c) => {
    portValues[c.id] = {};
    if (Array.isArray(c.ports)) {
      c.ports.forEach((p) => {
        if (p && p.id) {
          portValues[c.id][p.id] = p.type === 'input' ? 0 : 'Z';
        }
      });
    }
  });

  let hasErrors = false;
  const errorMessages: string[] = [];
  let loopDetected = false;

  // Build connection graphs: ToComponent.Port -> array of driving Wires
  const inputDrivers = new Map<string, Wire[]>();
  wires.forEach((w) => {
    const key = `${w.toComponentId}:${w.toPortId}`;
    const list = inputDrivers.get(key) || [];
    list.push(w);
    inputDrivers.set(key, list);
  });

  // Propagation Loop: Iterate until network converges or maxIterations reached
  let changed = true;
  let iterations = 0;

  while (changed && iterations < maxIterations) {
    changed = false;
    iterations++;

    // 1. Evaluate all components based on their current inputs
    components.forEach((comp) => {
      const inputs: Record<string, LogicState> = {};
      if (Array.isArray(comp.ports)) {
        comp.ports
          .filter((p) => p && p.type === 'input')
          .forEach((p) => {
            inputs[p.id] = portValues[comp.id]?.[p.id] ?? 'Z';
          });
      }

      const existingState = resolveComponentState(comp, componentStates);
      const { outputs, nextState } = evaluateComponent(
        comp,
        inputs,
        existingState,
        customGateDefs,
        iterations
      );

      // Check if internal state changed
      if (JSON.stringify(existingState) !== JSON.stringify(nextState)) {
        componentStates[comp.id] = nextState;
        changed = true;
      }

      // Check if output port values changed
      if (outputs && typeof outputs === 'object') {
        Object.entries(outputs).forEach(([portId, val]) => {
          const currentVal = portValues[comp.id]?.[portId];
          if (currentVal !== val) {
            if (!portValues[comp.id]) portValues[comp.id] = {};
            portValues[comp.id][portId] = val;
            changed = true;
          }
        });
      }
    });

    // 2. Propagate signals through wires to destination input ports with Tri-State / Bus resolution
    const portIncomingDrivers = new Map<string, LogicState[]>();

    wires.forEach((wire) => {
      const fromVal = portValues[wire.fromComponentId]?.[wire.fromPortId] ?? 'Z';
      wireValues[wire.id] = fromVal;

      const targetKey = `${wire.toComponentId}:${wire.toPortId}`;
      const driverList = portIncomingDrivers.get(targetKey) || [];
      driverList.push(fromVal);
      portIncomingDrivers.set(targetKey, driverList);
    });

    // Resolve combined value for each driven input port
    portIncomingDrivers.forEach((drivers, targetKey) => {
      const [toCompId, toPortId] = targetKey.split(':');
      let resolvedVal: LogicState = 'Z';

      if (drivers.length === 1) {
        resolvedVal = drivers[0];
      } else {
        // Multi-driver bus resolution (Tri-State buffers, open-collector, or bus contention)
        const activeDrivers = drivers.filter((d) => d !== 'Z');
        if (activeDrivers.length === 0) {
          resolvedVal = 'Z'; // All in High-Z state
        } else if (activeDrivers.includes('X')) {
          resolvedVal = 'X'; // Conflict
        } else {
          const hasHigh = activeDrivers.some((d) => d === 1);
          const hasLow = activeDrivers.some((d) => d === 0);
          if (hasHigh && hasLow) {
            resolvedVal = 'X'; // Bus Contention: driven high and low simultaneously
          } else if (hasHigh) {
            resolvedVal = 1;
          } else {
            resolvedVal = 0;
          }
        }
      }

      const targetCurrentVal = portValues[toCompId]?.[toPortId];
      if (targetCurrentVal !== resolvedVal) {
        if (!portValues[toCompId]) portValues[toCompId] = {};
        portValues[toCompId][toPortId] = resolvedVal;
        changed = true;
      }
    });

    // 3. Propagate implicit / wireless connections between matching-named components/nets
    // Only applied if a component has an explicitly assigned custom net label (e.g. "NET_A", "BUS_1")
    // and is NOT a standard input gate port (preventing port A/B name collision with switch labels).
    const namedDrivers = new Map<string, LogicState>();
    components.forEach((c) => {
      // Must have an explicit non-empty custom label
      const tag = c.label?.trim();
      if (!tag) return;

      // Only designated signal sources (Switches, Clocks, Const, or explicitly tagged source outputs) broadcast wireless net signals
      const isSourceComp = ['SWITCH', 'BUTTON', 'CLOCK', 'CONST_1', 'CONST_0', 'PULSE', 'RANDOM'].includes(c.type);
      if (isSourceComp) {
        const outPort = c.ports?.find((p) => p.type === 'output');
        if (outPort && portValues[c.id]?.[outPort.id] !== undefined && portValues[c.id]?.[outPort.id] !== 'Z') {
          namedDrivers.set(tag.toLowerCase(), portValues[c.id][outPort.id]);
        } else if (c.internalState?.value !== undefined) {
          namedDrivers.set(tag.toLowerCase(), c.internalState.value ? 1 : 0);
        }
      }
    });

    if (namedDrivers.size > 0) {
      components.forEach((c) => {
        // Only wireless sink nodes (Probes, LEDs, or components with explicit matching custom labels) receive wireless nets
        const isSinkComp = ['PROBE', 'LED'].includes(c.type);
        const tag = c.label?.trim();
        if (!tag && !isSinkComp) return;

        const lookupTag = tag ? tag.toLowerCase() : '';
        const driverVal = lookupTag ? namedDrivers.get(lookupTag) : undefined;
        if (driverVal === undefined) return;

        // Apply to receiver input ports if they don't have a direct physical wire
        c.ports
          ?.filter((p) => p.type === 'input')
          .forEach((p) => {
            const hasDirectWire = inputDrivers.has(`${c.id}:${p.id}`);
            if (!hasDirectWire) {
              const currentVal = portValues[c.id]?.[p.id];
              if (currentVal !== driverVal) {
                if (!portValues[c.id]) portValues[c.id] = {};
                portValues[c.id][p.id] = driverVal;
                changed = true;
              }
            }
          });
      });
    }
  }

  if (iterations >= maxIterations) {
    loopDetected = true;
  }

  // Detect floating inputs and contention
  components.forEach((comp) => {
    comp.ports
      .filter((p) => p.type === 'input')
      .forEach((p) => {
        const key = `${comp.id}:${p.id}`;
        const drivers = inputDrivers.get(key);
        if (!drivers || drivers.length === 0) {
          // Unconnected floating input
          if (portValues[comp.id][p.id] === 'Z') {
            portValues[comp.id][p.id] = 0; // Default to 0 for evaluation
          }
        } else if (drivers.length > 1) {
          // Multiple drivers on same port: check for contention
          const driverVals = drivers.map((d) => wireValues[d.id]);
          const uniqueVals = Array.from(new Set(driverVals.filter((v) => v !== 'Z')));
          if (uniqueVals.length > 1) {
            hasErrors = true;
            errorMessages.push(`Bus Contention detected at ${comp.name} port ${p.name}`);
            portValues[comp.id][p.id] = 'X';
          }
        }
      });
  });

  return {
    portValues,
    wireValues,
    componentStates,
    simulationStep: iterations,
    hasErrors,
    errorMessages,
    loopDetected,
  };
}

/**
 * Circuit Analysis & Health Audit
 */
export function analyzeCircuit(
  components: CircuitComponent[],
  wires: Wire[]
): CircuitAnalysisResult {
  const gates = components.filter((c) =>
    ['AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR', 'XNOR', 'BUFFER', 'TRI_STATE_BUFFER', 'CUSTOM_IC'].includes(c.type)
  );
  const inputs = components.filter((c) =>
    ['SWITCH', 'BUTTON', 'CLOCK', 'CONST_0', 'CONST_1', 'PULSE', 'RANDOM'].includes(c.type)
  );
  const outputs = components.filter((c) =>
    ['LED', 'PROBE', 'SEGMENT_7', 'HEX_DISPLAY', 'DECIMAL_DISPLAY', 'BINARY_DISPLAY'].includes(c.type)
  );

  const connectedInputPorts = new Set(wires.map((w) => `${w.toComponentId}:${w.toPortId}`));
  const connectedOutputPorts = new Set(wires.map((w) => `${w.fromComponentId}:${w.fromPortId}`));

  const floatingInputs: { componentId: string; portId: string; portName: string }[] = [];
  const unconnectedOutputs: { componentId: string; portId: string; portName: string }[] = [];

  components.forEach((c) => {
    c.ports.forEach((p) => {
      const key = `${c.id}:${p.id}`;
      if (p.type === 'input' && !connectedInputPorts.has(key)) {
        floatingInputs.push({ componentId: c.id, portId: p.id, portName: `${c.name} (${p.name})` });
      }
      if (p.type === 'output' && !connectedOutputPorts.has(key)) {
        unconnectedOutputs.push({ componentId: c.id, portId: p.id, portName: `${c.name} (${p.name})` });
      }
    });
  });

  // Calculate Logic Depth using BFS/DFS
  let maxDepth = 0;
  const depthMemo = new Map<string, number>();

  const getDepth = (compId: string, visited: Set<string>): number => {
    if (depthMemo.has(compId)) return depthMemo.get(compId)!;
    if (visited.has(compId)) return 0; // Loop guard

    visited.add(compId);
    const inWires = wires.filter((w) => w.toComponentId === compId);
    if (inWires.length === 0) {
      depthMemo.set(compId, 0);
      return 0;
    }

    let depth = 0;
    for (const w of inWires) {
      const parentDepth = getDepth(w.fromComponentId, new Set(visited));
      depth = Math.max(depth, parentDepth + 1);
    }
    depthMemo.set(compId, depth);
    return depth;
  };

  outputs.forEach((outComp) => {
    const depth = getDepth(outComp.id, new Set());
    maxDepth = Math.max(maxDepth, depth);
  });

  // Estimate critical path delay (~2ns per gate stage)
  const criticalPathDelayNs = maxDepth * 2.5;

  // Find completely isolated components
  const activeIds = new Set([
    ...wires.map((w) => w.fromComponentId),
    ...wires.map((w) => w.toComponentId),
  ]);
  const isolatedComponents = components
    .filter((c) => !activeIds.has(c.id))
    .map((c) => c.name || c.id);

  return {
    totalComponents: components.length,
    totalGates: gates.length,
    totalInputs: inputs.length,
    totalOutputs: outputs.length,
    totalWires: wires.length,
    logicDepth: maxDepth,
    floatingInputs,
    unconnectedOutputs,
    loopsDetected: false,
    criticalPathDelayNs,
    isolatedComponents,
  };
}

/**
 * Generate Complete Truth Table for Circuit Inputs & Outputs with Variable Unification
 */
export function generateTruthTable(
  components: CircuitComponent[],
  wires: Wire[],
  customGateDefs: Map<string, CustomGateDefinition> = new Map()
): TruthTableData | null {
  // Identify primary variable input components (SWITCH, BUTTON, PULSE, RANDOM, CLOCK)
  // Note: CONST_0 and CONST_1 are constant sources and remain fixed at 0/1 without expanding table dimensions
  const inputComps = components.filter((c) =>
    ['SWITCH', 'BUTTON', 'PULSE', 'RANDOM', 'CLOCK'].includes(c.type)
  );
  // Identify primary output components (PROBE, LED, DISPLAYS)
  const outputComps = components.filter((c) =>
    ['PROBE', 'LED', 'HEX_DISPLAY', 'DECIMAL_DISPLAY', 'BINARY_DISPLAY', 'SEGMENT_7'].includes(c.type)
  );

  if (inputComps.length === 0 || outputComps.length === 0) {
    return null;
  }

  // Group input components by their user-defined variable name/label
  // If multiple switches share the same label (e.g. 'A'), they represent the SAME variable
  const variableMap = new Map<string, { name: string; compIds: string[] }>();
  let autoVarIndex = 0;

  inputComps.forEach((comp) => {
    let varName = comp.label?.trim();
    if (!varName) {
      if (comp.name && !comp.name.match(/^[A-Z0-9_-]+_[0-9]+$/i) && comp.name !== 'Toggle Switch' && comp.name !== 'Push Button') {
        varName = comp.name.trim();
      } else {
        varName = getAlphabetSequenceLabel(autoVarIndex);
        autoVarIndex++;
      }
    }

    const key = varName.toLowerCase();
    if (!variableMap.has(key)) {
      variableMap.set(key, { name: varName, compIds: [comp.id] });
    } else {
      variableMap.get(key)!.compIds.push(comp.id);
    }
  });

  const uniqueVariables = Array.from(variableMap.values()).slice(0, 8); // Cap at 8 variables (256 combinations)
  const inputNames = uniqueVariables.map((v) => v.name);

  // Group and name output components cleanly
  const outputNames: string[] = [];
  const usedOutputNames = new Map<string, number>();

  outputComps.forEach((comp, idx) => {
    let rawName = comp.label?.trim() || comp.name?.trim() || (outputComps.length === 1 ? 'Y' : `OUT_${idx + 1}`);
    const key = rawName.toLowerCase();
    const count = usedOutputNames.get(key) || 0;
    usedOutputNames.set(key, count + 1);
    if (count > 0) {
      outputNames.push(`${rawName}_${count + 1}`);
    } else {
      outputNames.push(rawName);
    }
  });

  const totalCombinations = 1 << uniqueVariables.length; // 2^N
  const rows: TruthTableRow[] = [];

  const mintermList: Record<string, number[]> = {};
  const maxtermList: Record<string, number[]> = {};
  outputNames.forEach((name) => {
    mintermList[name] = [];
    maxtermList[name] = [];
  });

  for (let i = 0; i < totalCombinations; i++) {
    // Construct input mapping for this combination
    const currentInputMap: Record<string, 0 | 1> = {};
    const compValueOverrides = new Map<string, 0 | 1>();

    uniqueVariables.forEach((variable, varIdx) => {
      // Extract bit from i (MSB to LSB)
      const bitVal = ((i >> (uniqueVariables.length - 1 - varIdx)) & 1) as 0 | 1;
      currentInputMap[variable.name] = bitVal;
      variable.compIds.forEach((id) => {
        compValueOverrides.set(id, bitVal);
      });
    });

    const clonedComps = components.map((c) => {
      if (compValueOverrides.has(c.id)) {
        const bitVal = compValueOverrides.get(c.id)!;
        return {
          ...c,
          internalState: {
            ...c.internalState,
            value: bitVal,
            pressed: bitVal === 1,
          },
        };
      }
      return { ...c };
    });

    // Run circuit simulation for this combination
    const sim = simulateCircuit(clonedComps, wires, customGateDefs);

    // Read outputs
    const currentOutputMap: Record<string, LogicState> = {};
    outputComps.forEach((outComp, idx) => {
      const outName = outputNames[idx];
      const val = sim.portValues[outComp.id]?.['in_0'] ?? sim.portValues[outComp.id]?.['out'] ?? 0;
      currentOutputMap[outName] = val;

      if (val === 1) {
        mintermList[outName].push(i);
      } else if (val === 0) {
        maxtermList[outName].push(i);
      }
    });

    rows.push({
      decimalIndex: i,
      inputs: currentInputMap,
      outputs: currentOutputMap,
      minterm: `m${i}`,
      maxterm: `M${i}`,
    });
  }

  // Generate SOP & POS Boolean equations for each output
  const sopExpressions: Record<string, string> = {};
  const posExpressions: Record<string, string> = {};

  outputNames.forEach((outName) => {
    const minterms = mintermList[outName];
    if (minterms.length === 0) {
      sopExpressions[outName] = '0';
    } else if (minterms.length === totalCombinations) {
      sopExpressions[outName] = '1';
    } else {
      sopExpressions[outName] = `Σm(${minterms.join(', ')})`;
    }

    const maxterms = maxtermList[outName];
    if (maxterms.length === 0) {
      posExpressions[outName] = '1';
    } else if (maxterms.length === totalCombinations) {
      posExpressions[outName] = '0';
    } else {
      posExpressions[outName] = `ΠM(${maxterms.join(', ')})`;
    }
  });

  return {
    inputNames,
    outputNames,
    rows,
    mintermList,
    maxtermList,
    sopExpressions,
    posExpressions,
  };
}
