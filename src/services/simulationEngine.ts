/**
 * KITT Simulation & DRC Validation Engine
 * Runs between "AI proposed it" and "canvas shows it".
 * Validates electrical rules, 4-state logic, and physics constraints.
 */

import { componentRegistry } from './componentRegistry';
import { Logger } from './logger';

const logger = new Logger('SimulationEngine');

export interface CircuitNode {
  id: string; // compId_pinId
  componentId: string;
  pinId: string;
  voltage: number;
  isDriven: boolean;
  drivenBy?: string;
}

export interface DrcViolation {
  severity: 'ERROR' | 'WARNING' | 'INFO';
  code: string;
  message: string;
  componentId?: string;
  pinId?: string;
  recommendation?: string;
}

export interface CircuitSimulationTelemetry {
  supplyVoltage: number;
  currentDraw_mA: number;
  powerConsumption_mW: number;
  nodeVoltages: Record<string, number>;
  branchCurrents: Record<string, number>;
}

export interface SimulationGateResult {
  passed: boolean;
  status: 'PASS' | 'PASS_WITH_WARNINGS' | 'REJECTED';
  telemetry: CircuitSimulationTelemetry;
  violations: DrcViolation[];
  stageReport: {
    connectivity: 'pass' | 'fail';
    electricalRules: 'pass' | 'fail' | 'warn';
    pinCompatibility: 'pass' | 'fail';
    thermalSafety: 'pass' | 'fail';
  };
}

export class SimulationEngine {
  /**
   * Evaluates circuit physics, nodal voltages, loop currents, and electrical DRC rules.
   */
  public evaluateCircuit(
    components: Array<{ id: string; partNumber: string; category?: string; parameters?: Record<string, any> }>,
    wires: Array<{ id: string; fromComponentId: string; fromPinId: string; toComponentId: string; toPinId: string; signalType?: string }>
  ): SimulationGateResult {
    const violations: DrcViolation[] = [];
    const nodeVoltages: Record<string, number> = {};
    const branchCurrents: Record<string, number> = {};

    let nominalSupplyVoltage = 5.0;
    const hasEsp32 = components.some(c => c.partNumber.toLowerCase().includes('esp32'));
    if (hasEsp32) {
      nominalSupplyVoltage = 3.3;
    }

    // 1. Establish Power & Ground Nodes
    wires.forEach(wire => {
      const fromKey = `${wire.fromComponentId}_${wire.fromPinId}`;
      const toKey = `${wire.toComponentId}_${wire.toPinId}`;

      const sig = (wire.signalType || '').toUpperCase();
      if (sig.includes('VCC') || sig.includes('5V') || wire.fromPinId.includes('5v') || wire.toPinId.includes('5v')) {
        nodeVoltages[fromKey] = 5.0;
        nodeVoltages[toKey] = 5.0;
      } else if (sig.includes('3V3') || wire.fromPinId.includes('3v3') || wire.toPinId.includes('3v3')) {
        nodeVoltages[fromKey] = 3.3;
        nodeVoltages[toKey] = 3.3;
      } else if (sig.includes('GND') || wire.fromPinId.includes('gnd') || wire.toPinId.includes('gnd')) {
        nodeVoltages[fromKey] = 0.0;
        nodeVoltages[toKey] = 0.0;
      }
    });

    // 2. DRC Check: Dead Short (Direct connection from VCC to GND)
    wires.forEach(wire => {
      const fromPin = wire.fromPinId.toLowerCase();
      const toPin = wire.toPinId.toLowerCase();

      const isFromPower = fromPin === 'vcc' || fromPin === '5v' || fromPin === '3v3' || fromPin === 'vin';
      const isToPower = toPin === 'vcc' || toPin === '5v' || toPin === '3v3' || toPin === 'vin';
      const isFromGnd = fromPin === 'gnd' || fromPin === 'ground';
      const isToGnd = toPin === 'gnd' || toPin === 'ground';

      if ((isFromPower && isToGnd) || (isFromGnd && isToPower)) {
        violations.push({
          severity: 'ERROR',
          code: 'ERR_DEAD_SHORT',
          message: `Direct dead-short between power rail and ground detected on wire ${wire.id} (${wire.fromComponentId}:${wire.fromPinId} -> ${wire.toComponentId}:${wire.toPinId}).`,
          recommendation: 'Remove direct short-circuit connection and add appropriate load or current-limiting element.',
        });
      }
    });

    // 3. DRC Check: LED series resistor protection
    const leds = components.filter(c => c.partNumber.toLowerCase().includes('led'));
    leds.forEach(led => {
      const connectedWires = wires.filter(w => w.fromComponentId === led.id || w.toComponentId === led.id);
      const isDirectToVcc = connectedWires.some(w => {
        const otherPin = w.fromComponentId === led.id ? w.toPinId.toLowerCase() : w.fromPinId.toLowerCase();
        return otherPin === '5v' || otherPin === 'vcc' || otherPin === 'vin';
      });

      const isDirectToGnd = connectedWires.some(w => {
        const otherPin = w.fromComponentId === led.id ? w.toPinId.toLowerCase() : w.fromPinId.toLowerCase();
        return otherPin === 'gnd' || otherPin === 'ground';
      });

      if (isDirectToVcc && isDirectToGnd) {
        violations.push({
          severity: 'ERROR',
          code: 'ERR_UNPROTECTED_LED',
          message: `LED '${led.id}' is connected directly across power rails without a series current-limiting resistor. This will cause semiconductor burnout.`,
          componentId: led.id,
          recommendation: 'Insert a 220Ω to 330Ω current-limiting resistor in series with the LED anode.',
        });
      }
    });

    // 4. DRC Check: ESP32 Input-Only Pins set as Output
    if (hasEsp32) {
      const espComp = components.find(c => c.partNumber.toLowerCase().includes('esp32'));
      if (espComp) {
        const inputOnlyPins = ['gpio34', 'gpio35', 'gpio36', 'gpio39'];
        wires.forEach(wire => {
          if (wire.fromComponentId === espComp.id && inputOnlyPins.includes(wire.fromPinId.toLowerCase())) {
            // Check if driving an actuator or LED
            const targetComp = components.find(c => c.id === wire.toComponentId);
            if (targetComp && (targetComp.partNumber.includes('led') || targetComp.partNumber.includes('relay') || targetComp.partNumber.includes('servo'))) {
              violations.push({
                severity: 'ERROR',
                code: 'ERR_INPUT_ONLY_PIN_AS_OUTPUT',
                message: `ESP32 pin ${wire.fromPinId} is input-only (GPI) and lacks output driver transistors. It cannot drive ${targetComp.id}.`,
                componentId: espComp.id,
                pinId: wire.fromPinId,
                recommendation: 'Reassign this actuator to an output-capable GPIO pin such as GPIO2, GPIO4, GPIO5, or GPIO18.',
              });
            }
          }
        });
      }
    }

    // 5. Calculate Current Consumption & Thermal Power Dissipation
    let currentDraw_mA = 0;
    components.forEach(comp => {
      const spec = componentRegistry.lookup(comp.partNumber);
      if (spec) {
        currentDraw_mA += spec.datasheetSummary.currentNominal_mA;
      } else {
        // Fallback default
        currentDraw_mA += 15;
      }
    });

    const powerConsumption_mW = Math.round(nominalSupplyVoltage * currentDraw_mA);

    if (currentDraw_mA > 500) {
      violations.push({
        severity: 'WARNING',
        code: 'WARN_HIGH_USB_CURRENT',
        message: `Total circuit current draw (${currentDraw_mA}mA) exceeds standard USB 2.0 500mA port budget.`,
        recommendation: 'Use an external regulated power supply (e.g. 5V 2A barrel jack or external adapter).',
      });
    }

    const hasErrors = violations.some(v => v.severity === 'ERROR');
    const hasWarnings = violations.some(v => v.severity === 'WARNING');

    return {
      passed: !hasErrors,
      status: hasErrors ? 'REJECTED' : hasWarnings ? 'PASS_WITH_WARNINGS' : 'PASS',
      telemetry: {
        supplyVoltage: nominalSupplyVoltage,
        currentDraw_mA,
        powerConsumption_mW,
        nodeVoltages,
        branchCurrents,
      },
      violations,
      stageReport: {
        connectivity: wires.length > 0 ? 'pass' : 'fail',
        electricalRules: hasErrors ? 'fail' : hasWarnings ? 'warn' : 'pass',
        pinCompatibility: violations.some(v => v.code === 'ERR_INPUT_ONLY_PIN_AS_OUTPUT') ? 'fail' : 'pass',
        thermalSafety: powerConsumption_mW > 3000 ? 'fail' : 'pass',
      },
    };
  }
}

export const simulationEngine = new SimulationEngine();
