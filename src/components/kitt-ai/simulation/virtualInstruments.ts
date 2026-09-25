import { CanonicalCircuitModel } from '../cir/cirTypes';

export interface MultimeterReading {
  mode: 'V_DC' | 'V_AC' | 'CURRENT_DC' | 'RESISTANCE' | 'CONTINUITY';
  value: number;
  formatted: string;
  unit: string;
  status: 'STABLE' | 'CLIPPED' | 'OVERLOAD';
  confidence: number;
}

export function computeMultimeterReading(
  circuit: CanonicalCircuitModel,
  mode: 'V_DC' | 'V_AC' | 'CURRENT_DC' | 'RESISTANCE' | 'CONTINUITY',
  probeRedNode?: string, // e.g. "mcu_esp32_gpio26"
  probeBlackNode?: string // e.g. "mcu_esp32_gnd_1"
): MultimeterReading {
  const vMap = circuit.telemetry.nodeVoltages;

  if (mode === 'V_DC') {
    const vRed = probeRedNode ? (vMap[probeRedNode] ?? 0.0) : circuit.telemetry.supplyVoltage;
    const vBlack = probeBlackNode ? (vMap[probeBlackNode] ?? 0.0) : 0.0;
    const diff = Number((vRed - vBlack).toFixed(3));
    return {
      mode,
      value: diff,
      formatted: `${diff >= 0 ? '+' : ''}${diff.toFixed(2)}`,
      unit: 'V DC',
      status: 'STABLE',
      confidence: 0.99
    };
  }

  if (mode === 'CURRENT_DC') {
    const current = circuit.telemetry.totalCurrentDraw_mA;
    return {
      mode,
      value: current,
      formatted: `${current.toFixed(1)}`,
      unit: 'mA DC',
      status: current > 800 ? 'OVERLOAD' : 'STABLE',
      confidence: 0.97
    };
  }

  if (mode === 'RESISTANCE') {
    return {
      mode,
      value: 220,
      formatted: '220.0',
      unit: 'Ω',
      status: 'STABLE',
      confidence: 1.0
    };
  }

  if (mode === 'CONTINUITY') {
    const isShort = probeRedNode && probeBlackNode && vMap[probeRedNode] === vMap[probeBlackNode];
    return {
      mode,
      value: isShort ? 0 : 9999,
      formatted: isShort ? 'BEEP (0.02 Ω)' : 'OPEN LOOP',
      unit: 'Ω',
      status: isShort ? 'STABLE' : 'OVERLOAD',
      confidence: 1.0
    };
  }

  return {
    mode: 'V_AC',
    value: 0.015,
    formatted: '15.2',
    unit: 'mV RMS',
    status: 'STABLE',
    confidence: 0.92
  };
}

/**
 * Generate parametric oscilloscope points for live visualization
 */
export function generateScopeWaveformData(
  signalType: 'PWM' | 'ANALOG_SENSOR' | 'FLYBACK_SPIKE' | 'DC_RAIL',
  timeOffsetMs: number,
  sampleCount: number = 64
): { timeMs: number; voltageV: number }[] {
  const points: { timeMs: number; voltageV: number }[] = [];

  for (let i = 0; i < sampleCount; i++) {
    const t = timeOffsetMs + (i * 0.1);
    let v = 0;

    switch (signalType) {
      case 'PWM':
        // 1 kHz square wave with 50% duty cycle and slight RC rise/fall rounding
        const period = 1.0; // 1ms
        const phase = (t % period) / period;
        v = phase < 0.5 ? 3.3 : 0.0;
        // add 20mV ripple
        v += Math.sin(t * 10) * 0.02;
        break;

      case 'FLYBACK_SPIKE':
        // Periodic switching pulse with damped sinusoidal ringing clamped to 5.7V
        const cycle = t % 2.0;
        if (cycle < 0.05) {
          v = 0.12; // On
        } else if (cycle < 0.15) {
          // Ringing peak
          const ringT = (cycle - 0.05) * 50;
          v = 5.7 * Math.exp(-ringT * 0.8) * Math.cos(ringT * 4);
          v = Math.max(0, Math.min(5.7, v));
        } else {
          v = 5.0; // Idle rail
        }
        break;

      case 'ANALOG_SENSOR':
        // Slow organic capacitive sensor curve (e.g. soil drying / watering)
        v = 1.84 + Math.sin(t * 0.05) * 0.25 + (Math.random() - 0.5) * 0.03;
        break;

      case 'DC_RAIL':
      default:
        // Clean regulated 5V DC rail with low noise ripple (10mV)
        v = 5.0 + Math.sin(t * 50) * 0.012;
        break;
    }

    points.push({ timeMs: Number(t.toFixed(2)), voltageV: Number(v.toFixed(3)) });
  }

  return points;
}
