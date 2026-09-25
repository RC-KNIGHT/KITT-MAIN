/**
 * KITT 4-State Digital Logic Simulator
 * Evaluates combinational logic, boolean networks, and sequential flip-flops.
 * Logic states: '0' (LOW), '1' (HIGH), 'X' (Undefined/Contention), 'Z' (High Impedance)
 */

export type LogicState = '0' | '1' | 'X' | 'Z';

export interface LogicGateNode {
  id: string;
  type: string; // AND, OR, NOT, NAND, NOR, XOR, XNOR, D_FLIP_FLOP, BUFFER
  inputs: Record<string, LogicState>;
  outputs: Record<string, LogicState>;
  propagationDelayNs: number;
}

export class LogicSimulator {
  public evalAnd(a: LogicState, b: LogicState): LogicState {
    if (a === '0' || b === '0') return '0';
    if (a === '1' && b === '1') return '1';
    return 'X';
  }

  public evalOr(a: LogicState, b: LogicState): LogicState {
    if (a === '1' || b === '1') return '1';
    if (a === '0' && b === '0') return '0';
    return 'X';
  }

  public evalNot(a: LogicState): LogicState {
    if (a === '0') return '1';
    if (a === '1') return '0';
    return 'X';
  }

  public evalNand(a: LogicState, b: LogicState): LogicState {
    return this.evalNot(this.evalAnd(a, b));
  }

  public evalNor(a: LogicState, b: LogicState): LogicState {
    return this.evalNot(this.evalOr(a, b));
  }

  public evalXor(a: LogicState, b: LogicState): LogicState {
    if (a === 'X' || a === 'Z' || b === 'X' || b === 'Z') return 'X';
    return a !== b ? '1' : '0';
  }

  public evalXnor(a: LogicState, b: LogicState): LogicState {
    return this.evalNot(this.evalXor(a, b));
  }

  public evaluateGate(gateType: string, inputs: Record<string, LogicState>): Record<string, LogicState> {
    const t = gateType.toUpperCase();
    const inA = inputs['inA'] || inputs['a'] || inputs['in'] || 'X';
    const inB = inputs['inB'] || inputs['b'] || 'X';

    switch (t) {
      case 'AND':
      case 'AND_GATE':
        return { out: this.evalAnd(inA, inB) };
      case 'OR':
      case 'OR_GATE':
        return { out: this.evalOr(inA, inB) };
      case 'NOT':
      case 'NOT_GATE':
      case 'INVERTER':
        return { out: this.evalNot(inA) };
      case 'NAND':
      case 'NAND_GATE':
        return { out: this.evalNand(inA, inB) };
      case 'NOR':
      case 'NOR_GATE':
        return { out: this.evalNor(inA, inB) };
      case 'XOR':
      case 'XOR_GATE':
        return { out: this.evalXor(inA, inB) };
      case 'XNOR':
      case 'XNOR_GATE':
        return { out: this.evalXnor(inA, inB) };
      case 'BUFFER':
        return { out: inA === 'Z' ? 'X' : inA };
      default:
        return { out: 'X' };
    }
  }

  public checkContention(drivers: LogicState[]): LogicState {
    const active = drivers.filter(d => d !== 'Z');
    if (active.length === 0) return 'Z';
    if (active.length === 1) return active[0];

    const hasZero = active.includes('0');
    const hasOne = active.includes('1');
    if (hasZero && hasOne) {
      // Contention: multiple gates actively fighting
      return 'X';
    }
    return active[0];
  }
}

export const logicSimulator = new LogicSimulator();
