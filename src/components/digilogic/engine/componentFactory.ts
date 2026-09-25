/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CircuitComponent, CustomGateDefinition, GateType, Port } from '../types/circuit';

export interface ComponentMetadata {
  name: string;
  category: string;
  description: string;
  defaultInputs: number;
  minInputs: number;
  maxInputs: number;
  booleanEquation: string;
  width: number;
  height: number;
  iconName: string;
}

export const COMPONENT_METADATA: Record<GateType, ComponentMetadata> = {
  AND: {
    name: 'AND Gate',
    category: 'GATES',
    description: 'Outputs 1 (HIGH) only if ALL inputs are 1 (HIGH).',
    defaultInputs: 2,
    minInputs: 2,
    maxInputs: 8,
    booleanEquation: 'Y = A · B',
    width: 80,
    height: 60,
    iconName: 'GitMerge',
  },
  OR: {
    name: 'OR Gate',
    category: 'GATES',
    description: 'Outputs 1 (HIGH) if AT LEAST ONE input is 1 (HIGH).',
    defaultInputs: 2,
    minInputs: 2,
    maxInputs: 8,
    booleanEquation: 'Y = A + B',
    width: 80,
    height: 60,
    iconName: 'GitPullRequest',
  },
  NOT: {
    name: 'NOT Gate (Inverter)',
    category: 'GATES',
    description: 'Inverts the incoming signal (0 becomes 1, 1 becomes 0).',
    defaultInputs: 1,
    minInputs: 1,
    maxInputs: 1,
    booleanEquation: 'Y = A\' (or ¬A)',
    width: 70,
    height: 50,
    iconName: 'ZapOff',
  },
  NAND: {
    name: 'NAND Gate',
    category: 'GATES',
    description: 'Universal gate: Outputs 0 only when ALL inputs are 1.',
    defaultInputs: 2,
    minInputs: 2,
    maxInputs: 8,
    booleanEquation: 'Y = (A · B)\'',
    width: 85,
    height: 60,
    iconName: 'ShieldAlert',
  },
  NOR: {
    name: 'NOR Gate',
    category: 'GATES',
    description: 'Universal gate: Outputs 1 only when ALL inputs are 0.',
    defaultInputs: 2,
    minInputs: 2,
    maxInputs: 8,
    booleanEquation: 'Y = (A + B)\'',
    width: 85,
    height: 60,
    iconName: 'ShieldCheck',
  },
  XOR: {
    name: 'XOR Gate (Exclusive OR)',
    category: 'GATES',
    description: 'Outputs 1 if an ODD number of inputs are 1.',
    defaultInputs: 2,
    minInputs: 2,
    maxInputs: 8,
    booleanEquation: 'Y = A ⊕ B',
    width: 80,
    height: 60,
    iconName: 'Sparkles',
  },
  XNOR: {
    name: 'XNOR Gate (Equivalence)',
    category: 'GATES',
    description: 'Outputs 1 if inputs are identical (even parity).',
    defaultInputs: 2,
    minInputs: 2,
    maxInputs: 8,
    booleanEquation: 'Y = (A ⊕ B)\' = A ⊙ B',
    width: 85,
    height: 60,
    iconName: 'Equal',
  },
  BUFFER: {
    name: 'Buffer',
    category: 'GATES',
    description: 'Passes signal unchanged; used for signal isolation/amplification.',
    defaultInputs: 1,
    minInputs: 1,
    maxInputs: 1,
    booleanEquation: 'Y = A',
    width: 70,
    height: 50,
    iconName: 'FastForward',
  },
  TRI_STATE_BUFFER: {
    name: 'Tri-State Buffer',
    category: 'GATES',
    description: 'Passes input when Enable is 1; outputs High-Z (floating) when Enable is 0.',
    defaultInputs: 2,
    minInputs: 2,
    maxInputs: 2,
    booleanEquation: 'Y = Enable ? A : High-Z',
    width: 80,
    height: 60,
    iconName: 'Sliders',
  },
  SWITCH: {
    name: 'Toggle Switch',
    category: 'INPUTS',
    description: 'Interactive latching digital switch (0 or 1). Click to toggle.',
    defaultInputs: 0,
    minInputs: 0,
    maxInputs: 0,
    booleanEquation: 'Output: 0 or 1',
    width: 60,
    height: 50,
    iconName: 'ToggleRight',
  },
  BUTTON: {
    name: 'Push Button',
    category: 'INPUTS',
    description: 'Momentary button: outputs 1 while pressed, 0 when released.',
    defaultInputs: 0,
    minInputs: 0,
    maxInputs: 0,
    booleanEquation: 'Output: 1 (momentary)',
    width: 60,
    height: 50,
    iconName: 'Radio',
  },
  CLOCK: {
    name: 'Clock Generator',
    category: 'INPUTS',
    description: 'Oscillates periodically between 0 and 1 at set frequency.',
    defaultInputs: 0,
    minInputs: 0,
    maxInputs: 0,
    booleanEquation: 'Square wave (CLK)',
    width: 70,
    height: 50,
    iconName: 'Clock',
  },
  CONST_0: {
    name: 'Constant 0 (GND)',
    category: 'INPUTS',
    description: 'Tied permanently to Ground (LOW / 0).',
    defaultInputs: 0,
    minInputs: 0,
    maxInputs: 0,
    booleanEquation: 'Y = 0',
    width: 50,
    height: 40,
    iconName: 'MinusCircle',
  },
  CONST_1: {
    name: 'Constant 1 (VCC)',
    category: 'INPUTS',
    description: 'Tied permanently to Logic High (VCC / 1).',
    defaultInputs: 0,
    minInputs: 0,
    maxInputs: 0,
    booleanEquation: 'Y = 1',
    width: 50,
    height: 40,
    iconName: 'PlusCircle',
  },
  PULSE: {
    name: 'Pulse Generator',
    category: 'INPUTS',
    description: 'Generates a single high pulse on trigger click.',
    defaultInputs: 0,
    minInputs: 0,
    maxInputs: 0,
    booleanEquation: 'Single Pulse (100ms)',
    width: 70,
    height: 50,
    iconName: 'Activity',
  },
  RANDOM: {
    name: 'Random Generator',
    category: 'INPUTS',
    description: 'Outputs pseudo-random bit on each clock/trigger.',
    defaultInputs: 0,
    minInputs: 0,
    maxInputs: 0,
    booleanEquation: 'Random Bit',
    width: 70,
    height: 50,
    iconName: 'Shuffle',
  },
  LED: {
    name: 'LED Indicator',
    category: 'OUTPUTS',
    description: 'Glows brightly when input is HIGH (1), dim when LOW (0).',
    defaultInputs: 1,
    minInputs: 1,
    maxInputs: 1,
    booleanEquation: 'Visual Indicator',
    width: 60,
    height: 60,
    iconName: 'Lightbulb',
  },
  PROBE: {
    name: 'Logic Probe',
    category: 'OUTPUTS',
    description: 'Displays exact digital state: 1, 0, Z (High-Z), or X (Conflict).',
    defaultInputs: 1,
    minInputs: 1,
    maxInputs: 1,
    booleanEquation: 'State Probe',
    width: 70,
    height: 50,
    iconName: 'Eye',
  },
  SEGMENT_7: {
    name: '7-Segment Display',
    category: 'OUTPUTS',
    description: 'Standard 7-segment digital numeric LED display (Inputs: a-g, dp).',
    defaultInputs: 8,
    minInputs: 8,
    maxInputs: 8,
    booleanEquation: '7-Segment (a..g, dp)',
    width: 80,
    height: 100,
    iconName: 'Binary',
  },
  HEX_DISPLAY: {
    name: 'Hex / BCD Display',
    category: 'OUTPUTS',
    description: 'Decodes 4-bit binary input into Hexadecimal digit (0-F).',
    defaultInputs: 4,
    minInputs: 4,
    maxInputs: 4,
    booleanEquation: 'Hexadecimal (0-F)',
    width: 75,
    height: 85,
    iconName: 'Hash',
  },
  DECIMAL_DISPLAY: {
    name: 'Decimal Display',
    category: 'OUTPUTS',
    description: 'Displays 4-bit binary input as Decimal number (0-15).',
    defaultInputs: 4,
    minInputs: 4,
    maxInputs: 4,
    booleanEquation: 'Decimal (0-15)',
    width: 75,
    height: 85,
    iconName: 'ListOrdered',
  },
  BINARY_DISPLAY: {
    name: '4-Bit Binary Bar',
    category: 'OUTPUTS',
    description: 'Visual array of 4 binary bit indicators.',
    defaultInputs: 4,
    minInputs: 4,
    maxInputs: 4,
    booleanEquation: 'B3 B2 B1 B0',
    width: 80,
    height: 65,
    iconName: 'BarChart2',
  },
  MUX_2_1: {
    name: '2:1 Multiplexer',
    category: 'COMPLEX',
    description: 'Selects between two inputs (D0, D1) based on selector bit S.',
    defaultInputs: 3,
    minInputs: 3,
    maxInputs: 3,
    booleanEquation: 'Y = S\'D0 + SD1',
    width: 95,
    height: 85,
    iconName: 'Network',
  },
  MUX_4_1: {
    name: '4:1 Multiplexer',
    category: 'COMPLEX',
    description: 'Selects 1 of 4 inputs (D0-D3) using 2 select bits (S0, S1).',
    defaultInputs: 6,
    minInputs: 6,
    maxInputs: 6,
    booleanEquation: 'Y = S1\'S0\'D0 + S1\'S0D1 + S1S0\'D2 + S1S0D3',
    width: 110,
    height: 130,
    iconName: 'Network',
  },
  DEMUX_1_2: {
    name: '1:2 Demultiplexer',
    category: 'COMPLEX',
    description: 'Routes single data input D to one of two outputs (Y0, Y1) via select S.',
    defaultInputs: 2,
    minInputs: 2,
    maxInputs: 2,
    booleanEquation: 'Y0 = S\'D, Y1 = SD',
    width: 95,
    height: 85,
    iconName: 'Split',
  },
  DEMUX_1_4: {
    name: '1:4 Demultiplexer',
    category: 'COMPLEX',
    description: 'Routes input D to one of four outputs (Y0-Y3) based on S0, S1.',
    defaultInputs: 3,
    minInputs: 3,
    maxInputs: 3,
    booleanEquation: 'Y0-Y3 decoded routing',
    width: 110,
    height: 130,
    iconName: 'Split',
  },
  DECODER_2_4: {
    name: '2:4 Decoder',
    category: 'COMPLEX',
    description: 'Converts 2-bit binary code into one of 4 active-high outputs.',
    defaultInputs: 3, // In0, In1, Enable
    minInputs: 3,
    maxInputs: 3,
    booleanEquation: 'Yn = (Address == n) & Enable',
    width: 110,
    height: 120,
    iconName: 'Binary',
  },
  DECODER_3_8: {
    name: '3:8 Decoder',
    category: 'COMPLEX',
    description: 'Converts 3-bit binary address to 1-of-8 active-high lines.',
    defaultInputs: 4, // A, B, C, En
    minInputs: 4,
    maxInputs: 4,
    booleanEquation: 'Y0..Y7 = decoded address',
    width: 120,
    height: 170,
    iconName: 'Binary',
  },
  ENCODER_4_2: {
    name: '4:2 Priority Encoder',
    category: 'COMPLEX',
    description: 'Encodes highest active input line (D0-D3) into 2-bit binary code + Valid bit.',
    defaultInputs: 4,
    minInputs: 4,
    maxInputs: 4,
    booleanEquation: 'Outputs: A1, A0, Valid (V)',
    width: 110,
    height: 115,
    iconName: 'Layers',
  },
  COMPARATOR_1BIT: {
    name: '1-Bit Magnitude Comparator',
    category: 'COMPLEX',
    description: 'Compares two bits A and B: outputs A>B, A=B, and A<B.',
    defaultInputs: 2,
    minInputs: 2,
    maxInputs: 2,
    booleanEquation: 'A>B: AB\', A=B: (A⊕B)\', A<B: A\'B',
    width: 110,
    height: 95,
    iconName: 'GitCompare',
  },
  COMPARATOR_2BIT: {
    name: '2-Bit Magnitude Comparator',
    category: 'COMPLEX',
    description: 'Compares two 2-bit numbers A (A1A0) and B (B1B0).',
    defaultInputs: 4,
    minInputs: 4,
    maxInputs: 4,
    booleanEquation: 'Outputs: A>B, A=B, A<B',
    width: 120,
    height: 125,
    iconName: 'GitCompare',
  },
  HALF_ADDER: {
    name: 'Half Adder',
    category: 'COMPLEX',
    description: 'Adds two 1-bit numbers A and B; outputs SUM and CARRY.',
    defaultInputs: 2,
    minInputs: 2,
    maxInputs: 2,
    booleanEquation: 'SUM = A ⊕ B, CARRY = A · B',
    width: 95,
    height: 80,
    iconName: 'Plus',
  },
  FULL_ADDER: {
    name: 'Full Adder',
    category: 'COMPLEX',
    description: 'Adds two 1-bit numbers A and B plus Carry In (Cin); outputs SUM and Cout.',
    defaultInputs: 3,
    minInputs: 3,
    maxInputs: 3,
    booleanEquation: 'SUM = A ⊕ B ⊕ Cin, Cout = AB + Cin(A ⊕ B)',
    width: 105,
    height: 100,
    iconName: 'PlusSquare',
  },
  HALF_SUBTRACTOR: {
    name: 'Half Subtractor',
    category: 'COMPLEX',
    description: 'Subtracts B from A; outputs Difference (D) and Borrow (Bout).',
    defaultInputs: 2,
    minInputs: 2,
    maxInputs: 2,
    booleanEquation: 'Diff = A ⊕ B, Borrow = A\'B',
    width: 95,
    height: 80,
    iconName: 'Minus',
  },
  FULL_SUBTRACTOR: {
    name: 'Full Subtractor',
    category: 'COMPLEX',
    description: 'Subtracts B and Bin from A; outputs Difference and Borrow Out.',
    defaultInputs: 3,
    minInputs: 3,
    maxInputs: 3,
    booleanEquation: 'Diff = A ⊕ B ⊕ Bin, Bout = A\'B + Bin(A\' + B)',
    width: 105,
    height: 100,
    iconName: 'MinusSquare',
  },
  RIPPLE_ADDER_4BIT: {
    name: '4-Bit Ripple Carry Adder',
    category: 'COMPLEX',
    description: 'Adds two 4-bit numbers (A3..A0, B3..B0, Cin) to produce 4-bit Sum & Cout.',
    defaultInputs: 9,
    minInputs: 9,
    maxInputs: 9,
    booleanEquation: 'S3..S0 = A + B + Cin',
    width: 140,
    height: 180,
    iconName: 'Cpu',
  },
  PARITY_GEN: {
    name: 'Parity Bit Generator',
    category: 'COMPLEX',
    description: 'Generates Even and Odd parity bits for 4-bit data (D0..D3).',
    defaultInputs: 4,
    minInputs: 4,
    maxInputs: 4,
    booleanEquation: 'Even = D0⊕D1⊕D2⊕D3, Odd = (Even)\'',
    width: 105,
    height: 100,
    iconName: 'CheckCheck',
  },
  PARITY_CHECK: {
    name: 'Parity Checker',
    category: 'COMPLEX',
    description: 'Verifies data parity against incoming parity bit; flags parity error.',
    defaultInputs: 5,
    minInputs: 5,
    maxInputs: 5,
    booleanEquation: 'Error = D0⊕D1⊕D2⊕D3⊕P',
    width: 110,
    height: 115,
    iconName: 'ShieldAlert',
  },
  SR_LATCH: {
    name: 'SR Latch',
    category: 'SEQUENTIAL',
    description: 'Set-Reset Bistable multivibrator (Active-High S, R). Holds 1-bit memory.',
    defaultInputs: 2,
    minInputs: 2,
    maxInputs: 2,
    booleanEquation: 'Q = S + R\'Q (S=R=1 invalid)',
    width: 90,
    height: 80,
    iconName: 'Database',
  },
  D_FLIP_FLOP: {
    name: 'D Flip-Flop',
    category: 'SEQUENTIAL',
    description: 'Data / Delay Flip-Flop: captures D input on rising Clock (CLK) edge.',
    defaultInputs: 2, // D, CLK (plus optional Reset / Set)
    minInputs: 2,
    maxInputs: 4,
    booleanEquation: 'Q_next = D on ↑CLK',
    width: 95,
    height: 85,
    iconName: 'Disc',
  },
  JK_FLIP_FLOP: {
    name: 'JK Flip-Flop',
    category: 'SEQUENTIAL',
    description: 'Universal flip-flop: Set (J=1), Reset (K=1), Toggle (J=K=1) on ↑CLK.',
    defaultInputs: 3, // J, CLK, K
    minInputs: 3,
    maxInputs: 3,
    booleanEquation: 'Q_next = J·Q\' + K\'·Q',
    width: 95,
    height: 95,
    iconName: 'Disc',
  },
  T_FLIP_FLOP: {
    name: 'T Flip-Flop (Toggle)',
    category: 'SEQUENTIAL',
    description: 'Toggle Flip-Flop: toggles stored state when T=1 on rising Clock edge.',
    defaultInputs: 2, // T, CLK
    minInputs: 2,
    maxInputs: 2,
    booleanEquation: 'Q_next = T ⊕ Q',
    width: 95,
    height: 85,
    iconName: 'Disc',
  },
  COUNTER_4BIT: {
    name: '4-Bit Binary Counter',
    category: 'SEQUENTIAL',
    description: 'Synchronous 4-bit binary counter with Clock, Reset, and Enable.',
    defaultInputs: 3, // CLK, RST, EN
    minInputs: 3,
    maxInputs: 3,
    booleanEquation: 'Count = (Count + 1) mod 16',
    width: 110,
    height: 120,
    iconName: 'Timer',
  },
  REGISTER_4BIT: {
    name: '4-Bit Data Register',
    category: 'SEQUENTIAL',
    description: 'Stores 4-bit data word on rising clock edge when Load is HIGH.',
    defaultInputs: 6, // D0-D3, CLK, LOAD
    minInputs: 6,
    maxInputs: 6,
    booleanEquation: 'Q3..Q0 stored data',
    width: 120,
    height: 130,
    iconName: 'HardDrive',
  },
  CUSTOM_IC: {
    name: 'Custom Integrated Circuit',
    category: 'CUSTOM',
    description: 'User-designed modular subcircuit encapsulated into a custom IC chip.',
    defaultInputs: 2,
    minInputs: 1,
    maxInputs: 16,
    booleanEquation: 'Subcircuit Logic',
    width: 110,
    height: 100,
    iconName: 'Box',
  },
};

/**
 * Generate accurate port positions for any component type and input count
 */
export function generateComponentPorts(
  type: GateType,
  inputCount: number = 2,
  customDef?: CustomGateDefinition
): Port[] {
  const meta = COMPONENT_METADATA[type] || COMPONENT_METADATA.AND;
  const ports: Port[] = [];
  
  if (type === 'CUSTOM_IC' && customDef) {
    // Generate ports based on custom gate definition
    const numInputs = customDef.inputPorts.length;
    const numOutputs = customDef.outputPorts.length;
    const height = Math.max(70, Math.max(numInputs, numOutputs) * 26 + 30);
    const width = 110;
    
    // Inputs on left (x = 0)
    customDef.inputPorts.forEach((inp, i) => {
      const spacing = height / (numInputs + 1);
      ports.push({
        id: inp.id,
        name: inp.name,
        type: 'input',
        relativePosition: { x: 0, y: spacing * (i + 1) },
        description: `Input ${inp.name}`,
      });
    });
    
    // Outputs on right (x = width)
    customDef.outputPorts.forEach((out, i) => {
      const spacing = height / (numOutputs + 1);
      ports.push({
        id: out.id,
        name: out.name,
        type: 'output',
        relativePosition: { x: width, y: spacing * (i + 1) },
        description: `Output ${out.name}`,
      });
    });
    
    return ports;
  }

  // Standard Basic Gates (Variable input count: AND, OR, NAND, NOR, XOR, XNOR)
  if (['AND', 'OR', 'NAND', 'NOR', 'XOR', 'XNOR'].includes(type)) {
    const height = Math.max(60, inputCount * 22 + 16);
    const width = meta.width;
    const spacing = height / (inputCount + 1);
    
    for (let i = 0; i < inputCount; i++) {
      const charCode = 65 + i; // 'A', 'B', 'C', etc.
      const portName = String.fromCharCode(charCode);
      ports.push({
        id: `in_${i}`,
        name: portName,
        type: 'input',
        relativePosition: { x: 0, y: spacing * (i + 1) },
        description: `Input ${portName}`,
      });
    }
    
    // Output port on right
    ports.push({
      id: 'out',
      name: 'Y',
      type: 'output',
      relativePosition: { x: width, y: height / 2 },
      description: 'Output Y',
    });
    return ports;
  }

  // NOT and BUFFER (1 input, 1 output)
  if (type === 'NOT' || type === 'BUFFER') {
    const width = meta.width;
    const height = meta.height;
    ports.push({
      id: 'in_0',
      name: 'A',
      type: 'input',
      relativePosition: { x: 0, y: height / 2 },
      description: 'Input A',
    });
    ports.push({
      id: 'out',
      name: 'Y',
      type: 'output',
      relativePosition: { x: width, y: height / 2 },
      description: 'Output Y',
    });
    return ports;
  }

  // TRI-STATE BUFFER
  if (type === 'TRI_STATE_BUFFER') {
    const width = meta.width;
    const height = meta.height;
    ports.push({
      id: 'in_0',
      name: 'A',
      type: 'input',
      relativePosition: { x: 0, y: height / 2 },
      description: 'Data Input A',
    });
    ports.push({
      id: 'in_en',
      name: 'EN',
      type: 'input',
      relativePosition: { x: width / 2, y: 0 },
      description: 'Enable (Active High)',
    });
    ports.push({
      id: 'out',
      name: 'Y',
      type: 'output',
      relativePosition: { x: width, y: height / 2 },
      description: 'Output Y',
    });
    return ports;
  }

  // Pure Inputs (SWITCH, BUTTON, CLOCK, CONST_0, CONST_1, PULSE, RANDOM)
  if (['SWITCH', 'BUTTON', 'CLOCK', 'CONST_0', 'CONST_1', 'PULSE', 'RANDOM'].includes(type)) {
    const width = meta.width;
    const height = meta.height;
    ports.push({
      id: 'out',
      name: 'OUT',
      type: 'output',
      relativePosition: { x: width, y: height / 2 },
      description: 'Signal Output',
    });
    return ports;
  }

  // Single-Input Probes / LEDs
  if (type === 'LED' || type === 'PROBE') {
    const height = meta.height;
    ports.push({
      id: 'in_0',
      name: 'IN',
      type: 'input',
      relativePosition: { x: 0, y: height / 2 },
      description: 'Signal Input',
    });
    return ports;
  }

  // 7-Segment Display (8 inputs: a, b, c, d, e, f, g, dp)
  if (type === 'SEGMENT_7') {
    const segmentNames = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'dp'];
    const height = meta.height;
    const spacing = (height - 10) / (segmentNames.length + 1);
    
    segmentNames.forEach((seg, i) => {
      ports.push({
        id: `in_${seg}`,
        name: seg,
        type: 'input',
        relativePosition: { x: 0, y: 5 + spacing * (i + 1) },
        description: `Segment ${seg}`,
      });
    });
    return ports;
  }

  // HEX / DECIMAL / BINARY Displays (4-bit inputs: D3, D2, D1, D0)
  if (['HEX_DISPLAY', 'DECIMAL_DISPLAY', 'BINARY_DISPLAY'].includes(type)) {
    const height = meta.height;
    const bitNames = ['D3 (MSB)', 'D2', 'D1', 'D0 (LSB)'];
    const spacing = height / (bitNames.length + 1);
    
    bitNames.forEach((bit, i) => {
      ports.push({
        id: `in_${3 - i}`,
        name: `D${3 - i}`,
        type: 'input',
        relativePosition: { x: 0, y: spacing * (i + 1) },
        description: bit,
      });
    });
    return ports;
  }

  // HALF ADDER
  if (type === 'HALF_ADDER') {
    const width = meta.width;
    const height = meta.height;
    ports.push(
      { id: 'in_a', name: 'A', type: 'input', relativePosition: { x: 0, y: height * 0.33 }, description: 'Operand A (Input 1-bit)' },
      { id: 'in_b', name: 'B', type: 'input', relativePosition: { x: 0, y: height * 0.67 }, description: 'Operand B (Input 1-bit)' },
      { id: 'out_sum', name: 'SUM', type: 'output', relativePosition: { x: width, y: height * 0.33 }, description: 'Sum (A ⊕ B)' },
      { id: 'out_carry', name: 'CARRY', type: 'output', relativePosition: { x: width, y: height * 0.67 }, description: 'Carry (A · B)' }
    );
    return ports;
  }

  // FULL ADDER
  if (type === 'FULL_ADDER') {
    const width = meta.width;
    const height = meta.height;
    ports.push(
      { id: 'in_a', name: 'A', type: 'input', relativePosition: { x: 0, y: height * 0.25 }, description: 'Operand A (Input bit)' },
      { id: 'in_b', name: 'B', type: 'input', relativePosition: { x: 0, y: height * 0.50 }, description: 'Operand B (Input bit)' },
      { id: 'in_cin', name: 'Cin', type: 'input', relativePosition: { x: 0, y: height * 0.75 }, description: 'Carry In (from previous stage)' },
      { id: 'out_sum', name: 'SUM', type: 'output', relativePosition: { x: width, y: height * 0.35 }, description: 'Sum Output (A ⊕ B ⊕ Cin)' },
      { id: 'out_cout', name: 'Cout', type: 'output', relativePosition: { x: width, y: height * 0.65 }, description: 'Carry Out (to next stage)' }
    );
    return ports;
  }

  // HALF SUBTRACTOR
  if (type === 'HALF_SUBTRACTOR') {
    const width = meta.width;
    const height = meta.height;
    ports.push(
      { id: 'in_a', name: 'A', type: 'input', relativePosition: { x: 0, y: height * 0.33 }, description: 'Minuend A' },
      { id: 'in_b', name: 'B', type: 'input', relativePosition: { x: 0, y: height * 0.67 }, description: 'Subtrahend B' },
      { id: 'out_diff', name: 'DIFF', type: 'output', relativePosition: { x: width, y: height * 0.33 }, description: 'Difference (A ⊕ B)' },
      { id: 'out_borrow', name: 'BOUT', type: 'output', relativePosition: { x: width, y: height * 0.67 }, description: 'Borrow Out (A\' · B)' }
    );
    return ports;
  }

  // FULL SUBTRACTOR
  if (type === 'FULL_SUBTRACTOR') {
    const width = meta.width;
    const height = meta.height;
    ports.push(
      { id: 'in_a', name: 'A', type: 'input', relativePosition: { x: 0, y: height * 0.25 }, description: 'Minuend A' },
      { id: 'in_b', name: 'B', type: 'input', relativePosition: { x: 0, y: height * 0.50 }, description: 'Subtrahend B' },
      { id: 'in_bin', name: 'Bin', type: 'input', relativePosition: { x: 0, y: height * 0.75 }, description: 'Borrow In' },
      { id: 'out_diff', name: 'DIFF', type: 'output', relativePosition: { x: width, y: height * 0.35 }, description: 'Difference (A ⊕ B ⊕ Bin)' },
      { id: 'out_bout', name: 'BOUT', type: 'output', relativePosition: { x: width, y: height * 0.65 }, description: 'Borrow Out (A\'B + Bin(A\' + B))' }
    );
    return ports;
  }

  // MUX 2:1
  if (type === 'MUX_2_1') {
    const width = meta.width;
    const height = meta.height;
    ports.push(
      { id: 'in_d0', name: 'D0', type: 'input', relativePosition: { x: 0, y: height * 0.3 }, description: 'Data In 0 (routed to Y when S = 0)' },
      { id: 'in_d1', name: 'D1', type: 'input', relativePosition: { x: 0, y: height * 0.7 }, description: 'Data In 1 (routed to Y when S = 1)' },
      { id: 'in_s', name: 'S', type: 'input', relativePosition: { x: width / 2, y: height }, description: 'Channel Selector Line (0 -> D0, 1 -> D1)' },
      { id: 'out', name: 'Y', type: 'output', relativePosition: { x: width, y: height / 2 }, description: 'Selected Output (Y = S\'·D0 + S·D1)' }
    );
    return ports;
  }

  // MUX 4:1
  if (type === 'MUX_4_1') {
    const width = meta.width;
    const height = meta.height;
    ports.push(
      { id: 'in_d0', name: 'D0', type: 'input', relativePosition: { x: 0, y: height * 0.2 }, description: 'Data In 0 (selected when S1S0 = 00)' },
      { id: 'in_d1', name: 'D1', type: 'input', relativePosition: { x: 0, y: height * 0.4 }, description: 'Data In 1 (selected when S1S0 = 01)' },
      { id: 'in_d2', name: 'D2', type: 'input', relativePosition: { x: 0, y: height * 0.6 }, description: 'Data In 2 (selected when S1S0 = 10)' },
      { id: 'in_d3', name: 'D3', type: 'input', relativePosition: { x: 0, y: height * 0.8 }, description: 'Data In 3 (selected when S1S0 = 11)' },
      { id: 'in_s0', name: 'S0', type: 'input', relativePosition: { x: width * 0.35, y: height }, description: 'Select S0 (LSB)' },
      { id: 'in_s1', name: 'S1', type: 'input', relativePosition: { x: width * 0.65, y: height }, description: 'Select S1 (MSB)' },
      { id: 'out', name: 'Y', type: 'output', relativePosition: { x: width, y: height / 2 }, description: 'Selected Output Y' }
    );
    return ports;
  }

  // DEMUX 1:2
  if (type === 'DEMUX_1_2') {
    const width = meta.width;
    const height = meta.height;
    ports.push(
      { id: 'in_d', name: 'D', type: 'input', relativePosition: { x: 0, y: height / 2 }, description: 'Data Input Stream D' },
      { id: 'in_s', name: 'S', type: 'input', relativePosition: { x: width / 2, y: height }, description: 'Channel Selector Line (0 -> Y0, 1 -> Y1)' },
      { id: 'out_y0', name: 'Y0', type: 'output', relativePosition: { x: width, y: height * 0.3 }, description: 'Output Line 0 (receives D when S = 0)' },
      { id: 'out_y1', name: 'Y1', type: 'output', relativePosition: { x: width, y: height * 0.7 }, description: 'Output Line 1 (receives D when S = 1)' }
    );
    return ports;
  }

  // DEMUX 1:4
  if (type === 'DEMUX_1_4') {
    const width = meta.width;
    const height = meta.height;
    ports.push(
      { id: 'in_d', name: 'D', type: 'input', relativePosition: { x: 0, y: height / 2 }, description: 'Data Input Stream D' },
      { id: 'in_s0', name: 'S0', type: 'input', relativePosition: { x: width * 0.35, y: height }, description: 'Select S0 (LSB)' },
      { id: 'in_s1', name: 'S1', type: 'input', relativePosition: { x: width * 0.65, y: height }, description: 'Select S1 (MSB)' },
      { id: 'out_y0', name: 'Y0', type: 'output', relativePosition: { x: width, y: height * 0.2 }, description: 'Output 0 (receives D when S1S0 = 00)' },
      { id: 'out_y1', name: 'Y1', type: 'output', relativePosition: { x: width, y: height * 0.4 }, description: 'Output 1 (receives D when S1S0 = 01)' },
      { id: 'out_y2', name: 'Y2', type: 'output', relativePosition: { x: width, y: height * 0.6 }, description: 'Output 2 (receives D when S1S0 = 10)' },
      { id: 'out_y3', name: 'Y3', type: 'output', relativePosition: { x: width, y: height * 0.8 }, description: 'Output 3 (receives D when S1S0 = 11)' }
    );
    return ports;
  }

  // DECODER 2:4
  if (type === 'DECODER_2_4') {
    const width = meta.width;
    const height = meta.height;
    ports.push(
      { id: 'in_a0', name: 'A0', type: 'input', relativePosition: { x: 0, y: height * 0.25 }, description: 'Binary Address Line A0 (LSB)' },
      { id: 'in_a1', name: 'A1', type: 'input', relativePosition: { x: 0, y: height * 0.50 }, description: 'Binary Address Line A1 (MSB)' },
      { id: 'in_en', name: 'EN', type: 'input', relativePosition: { x: 0, y: height * 0.75 }, description: 'Enable (Active-High 1 to enable outputs)' },
      { id: 'out_y0', name: 'Y0', type: 'output', relativePosition: { x: width, y: height * 0.2 }, description: 'Active High 0 (1 when A1A0 = 00 & EN=1)' },
      { id: 'out_y1', name: 'Y1', type: 'output', relativePosition: { x: width, y: height * 0.4 }, description: 'Active High 1 (1 when A1A0 = 01 & EN=1)' },
      { id: 'out_y2', name: 'Y2', type: 'output', relativePosition: { x: width, y: height * 0.6 }, description: 'Active High 2 (1 when A1A0 = 10 & EN=1)' },
      { id: 'out_y3', name: 'Y3', type: 'output', relativePosition: { x: width, y: height * 0.8 }, description: 'Active High 3 (1 when A1A0 = 11 & EN=1)' }
    );
    return ports;
  }

  // DECODER 3:8
  if (type === 'DECODER_3_8') {
    const width = meta.width;
    const height = meta.height;
    ports.push(
      { id: 'in_a0', name: 'A0', type: 'input', relativePosition: { x: 0, y: height * 0.2 }, description: 'Address Line A0 (LSB)' },
      { id: 'in_a1', name: 'A1', type: 'input', relativePosition: { x: 0, y: height * 0.4 }, description: 'Address Line A1' },
      { id: 'in_a2', name: 'A2', type: 'input', relativePosition: { x: 0, y: height * 0.6 }, description: 'Address Line A2 (MSB)' },
      { id: 'in_en', name: 'EN', type: 'input', relativePosition: { x: 0, y: height * 0.8 }, description: 'Enable (Active-High 1)' }
    );
    for (let i = 0; i < 8; i++) {
      ports.push({
        id: `out_y${i}`,
        name: `Y${i}`,
        type: 'output',
        relativePosition: { x: width, y: (height / 9) * (i + 1) },
        description: `Decoded Line Y${i} (1 when Address = ${i} & EN=1)`,
      });
    }
    return ports;
  }

  // ENCODER 4:2
  if (type === 'ENCODER_4_2') {
    const width = meta.width;
    const height = meta.height;
    for (let i = 0; i < 4; i++) {
      ports.push({
        id: `in_d${i}`,
        name: `D${i}`,
        type: 'input',
        relativePosition: { x: 0, y: (height / 5) * (i + 1) },
        description: `Input Request Line D${i} (D3 is highest priority)`,
      });
    }
    ports.push(
      { id: 'out_a1', name: 'A1', type: 'output', relativePosition: { x: width, y: height * 0.25 }, description: 'Encoded Address A1 (MSB)' },
      { id: 'out_a0', name: 'A0', type: 'output', relativePosition: { x: width, y: height * 0.50 }, description: 'Encoded Address A0 (LSB)' },
      { id: 'out_v', name: 'V', type: 'output', relativePosition: { x: width, y: height * 0.75 }, description: 'Valid Bit V (1 if any input is active)' }
    );
    return ports;
  }

  // COMPARATOR 1-BIT
  if (type === 'COMPARATOR_1BIT') {
    const width = meta.width;
    const height = meta.height;
    ports.push(
      { id: 'in_a', name: 'A', type: 'input', relativePosition: { x: 0, y: height * 0.35 }, description: 'Input Bit A' },
      { id: 'in_b', name: 'B', type: 'input', relativePosition: { x: 0, y: height * 0.65 }, description: 'Input Bit B' },
      { id: 'out_gt', name: 'A>B', type: 'output', relativePosition: { x: width, y: height * 0.25 }, description: 'A Greater Than B (1 when A=1, B=0)' },
      { id: 'out_eq', name: 'A=B', type: 'output', relativePosition: { x: width, y: height * 0.50 }, description: 'A Equal to B (1 when A == B)' },
      { id: 'out_lt', name: 'A<B', type: 'output', relativePosition: { x: width, y: height * 0.75 }, description: 'A Less Than B (1 when A=0, B=1)' }
    );
    return ports;
  }

  // COMPARATOR 2-BIT
  if (type === 'COMPARATOR_2BIT') {
    const width = meta.width;
    const height = meta.height;
    ports.push(
      { id: 'in_a1', name: 'A1', type: 'input', relativePosition: { x: 0, y: height * 0.2 }, description: 'Operand A Bit 1 (MSB)' },
      { id: 'in_a0', name: 'A0', type: 'input', relativePosition: { x: 0, y: height * 0.4 }, description: 'Operand A Bit 0 (LSB)' },
      { id: 'in_b1', name: 'B1', type: 'input', relativePosition: { x: 0, y: height * 0.6 }, description: 'Operand B Bit 1 (MSB)' },
      { id: 'in_b0', name: 'B0', type: 'input', relativePosition: { x: 0, y: height * 0.8 }, description: 'Operand B Bit 0 (LSB)' },
      { id: 'out_gt', name: 'A>B', type: 'output', relativePosition: { x: width, y: height * 0.25 }, description: 'A Greater Than B (1 when A1A0 > B1B0)' },
      { id: 'out_eq', name: 'A=B', type: 'output', relativePosition: { x: width, y: height * 0.50 }, description: 'A Equal to B (1 when A1A0 == B1B0)' },
      { id: 'out_lt', name: 'A<B', type: 'output', relativePosition: { x: width, y: height * 0.75 }, description: 'A Less Than B (1 when A1A0 < B1B0)' }
    );
    return ports;
  }

  // RIPPLE ADDER 4-BIT
  if (type === 'RIPPLE_ADDER_4BIT') {
    const width = meta.width;
    const height = meta.height;
    for (let i = 0; i < 4; i++) {
      ports.push({
        id: `in_a${3 - i}`,
        name: `A${3 - i}`,
        type: 'input',
        relativePosition: { x: 0, y: (height / 10) * (i + 1) },
        description: `Operand A bit ${3 - i} ${i === 0 ? '(MSB)' : i === 3 ? '(LSB)' : ''}`,
      });
      ports.push({
        id: `in_b${3 - i}`,
        name: `B${3 - i}`,
        type: 'input',
        relativePosition: { x: 0, y: (height / 10) * (i + 5) },
        description: `Operand B bit ${3 - i} ${i === 0 ? '(MSB)' : i === 3 ? '(LSB)' : ''}`,
      });
      ports.push({
        id: `out_s${3 - i}`,
        name: `S${3 - i}`,
        type: 'output',
        relativePosition: { x: width, y: (height / 5) * (i + 1) },
        description: `4-Bit Sum bit S${3 - i} ${i === 0 ? '(MSB)' : i === 3 ? '(LSB)' : ''}`,
      });
    }
    ports.push({
      id: 'in_cin',
      name: 'Cin',
      type: 'input',
      relativePosition: { x: 0, y: (height / 10) * 9 },
      description: 'Carry In (Initial Carry bit)',
    });
    ports.push({
      id: 'out_cout',
      name: 'Cout',
      type: 'output',
      relativePosition: { x: width / 2, y: height },
      description: 'Carry Out (Final Carry Overflow)',
    });
    return ports;
  }

  // PARITY GENERATOR
  if (type === 'PARITY_GEN') {
    const width = meta.width;
    const height = meta.height;
    for (let i = 0; i < 4; i++) {
      ports.push({
        id: `in_d${i}`,
        name: `D${i}`,
        type: 'input',
        relativePosition: { x: 0, y: (height / 5) * (i + 1) },
        description: `Data bit D${i}`,
      });
    }
    ports.push(
      { id: 'out_even', name: 'EVEN', type: 'output', relativePosition: { x: width, y: height * 0.35 }, description: 'Even Parity Bit (makes total 1s even)' },
      { id: 'out_odd', name: 'ODD', type: 'output', relativePosition: { x: width, y: height * 0.65 }, description: 'Odd Parity Bit (makes total 1s odd)' }
    );
    return ports;
  }

  // PARITY CHECKER
  if (type === 'PARITY_CHECK') {
    const width = meta.width;
    const height = meta.height;
    for (let i = 0; i < 4; i++) {
      ports.push({
        id: `in_d${i}`,
        name: `D${i}`,
        type: 'input',
        relativePosition: { x: 0, y: (height / 6) * (i + 1) },
        description: `Data bit D${i}`,
      });
    }
    ports.push({
      id: 'in_p',
      name: 'P',
      type: 'input',
      relativePosition: { x: 0, y: (height / 6) * 5 },
      description: 'Received Parity Bit P',
    });
    ports.push(
      { id: 'out_err', name: 'ERR', type: 'output', relativePosition: { x: width, y: height * 0.5 }, description: 'Parity Error Flag (1 if parity mismatch)' }
    );
    return ports;
  }

  // SR LATCH
  if (type === 'SR_LATCH') {
    const width = meta.width;
    const height = meta.height;
    ports.push(
      { id: 'in_s', name: 'S', type: 'input', relativePosition: { x: 0, y: height * 0.3 }, description: 'Set (Active-High S)' },
      { id: 'in_r', name: 'R', type: 'input', relativePosition: { x: 0, y: height * 0.7 }, description: 'Reset (Active-High R)' },
      { id: 'out_q', name: 'Q', type: 'output', relativePosition: { x: width, y: height * 0.3 }, description: 'Stored State Output Q' },
      { id: 'out_not_q', name: 'Q\'', type: 'output', relativePosition: { x: width, y: height * 0.7 }, description: 'Inverted Output Q\'' }
    );
    return ports;
  }

  // D FLIP-FLOP
  if (type === 'D_FLIP_FLOP') {
    const width = meta.width;
    const height = meta.height;
    ports.push(
      { id: 'in_d', name: 'D', type: 'input', relativePosition: { x: 0, y: height * 0.3 }, description: 'Data Input D' },
      { id: 'in_clk', name: 'CLK', type: 'input', relativePosition: { x: 0, y: height * 0.7 }, description: 'Clock (Rising-Edge Trigger)' },
      { id: 'out_q', name: 'Q', type: 'output', relativePosition: { x: width, y: height * 0.3 }, description: 'Stored Output Q' },
      { id: 'out_not_q', name: 'Q\'', type: 'output', relativePosition: { x: width, y: height * 0.7 }, description: 'Inverted Output Q\'' }
    );
    return ports;
  }

  // JK FLIP-FLOP
  if (type === 'JK_FLIP_FLOP') {
    const width = meta.width;
    const height = meta.height;
    ports.push(
      { id: 'in_j', name: 'J', type: 'input', relativePosition: { x: 0, y: height * 0.25 }, description: 'J Input (Set when J=1 on clock)' },
      { id: 'in_clk', name: 'CLK', type: 'input', relativePosition: { x: 0, y: height * 0.50 }, description: 'Clock (Rising-Edge Trigger)' },
      { id: 'in_k', name: 'K', type: 'input', relativePosition: { x: 0, y: height * 0.75 }, description: 'K Input (Reset when K=1 on clock)' },
      { id: 'out_q', name: 'Q', type: 'output', relativePosition: { x: width, y: height * 0.3 }, description: 'Stored Output Q' },
      { id: 'out_not_q', name: 'Q\'', type: 'output', relativePosition: { x: width, y: height * 0.7 }, description: 'Inverted Output Q\'' }
    );
    return ports;
  }

  // T FLIP-FLOP
  if (type === 'T_FLIP_FLOP') {
    const width = meta.width;
    const height = meta.height;
    ports.push(
      { id: 'in_t', name: 'T', type: 'input', relativePosition: { x: 0, y: height * 0.3 }, description: 'Toggle Input T (Toggles state when T=1)' },
      { id: 'in_clk', name: 'CLK', type: 'input', relativePosition: { x: 0, y: height * 0.7 }, description: 'Clock (Rising-Edge Trigger)' },
      { id: 'out_q', name: 'Q', type: 'output', relativePosition: { x: width, y: height * 0.3 }, description: 'Stored Output Q' },
      { id: 'out_not_q', name: 'Q\'', type: 'output', relativePosition: { x: width, y: height * 0.7 }, description: 'Inverted Output Q\'' }
    );
    return ports;
  }

  // 4-BIT COUNTER
  if (type === 'COUNTER_4BIT') {
    const width = meta.width;
    const height = meta.height;
    ports.push(
      { id: 'in_clk', name: 'CLK', type: 'input', relativePosition: { x: 0, y: height * 0.25 }, description: 'Clock Pulse Input (Increments on ↑CLK)' },
      { id: 'in_rst', name: 'RST', type: 'input', relativePosition: { x: 0, y: height * 0.50 }, description: 'Reset Input (Active-High Reset to 0000)' },
      { id: 'in_en', name: 'EN', type: 'input', relativePosition: { x: 0, y: height * 0.75 }, description: 'Count Enable (Counts when EN=1)' }
    );
    for (let i = 0; i < 4; i++) {
      ports.push({
        id: `out_q${3 - i}`,
        name: `Q${3 - i}`,
        type: 'output',
        relativePosition: { x: width, y: (height / 5) * (i + 1) },
        description: `Binary Count Bit Q${3 - i} ${i === 0 ? '(MSB)' : i === 3 ? '(LSB)' : ''}`,
      });
    }
    return ports;
  }

  // 4-BIT REGISTER
  if (type === 'REGISTER_4BIT') {
    const width = meta.width;
    const height = meta.height;
    for (let i = 0; i < 4; i++) {
      ports.push({
        id: `in_d${3 - i}`,
        name: `D${3 - i}`,
        type: 'input',
        relativePosition: { x: 0, y: (height / 7) * (i + 1) },
        description: `Parallel Data In D${3 - i} ${i === 0 ? '(MSB)' : i === 3 ? '(LSB)' : ''}`,
      });
      ports.push({
        id: `out_q${3 - i}`,
        name: `Q${3 - i}`,
        type: 'output',
        relativePosition: { x: width, y: (height / 5) * (i + 1) },
        description: `Stored Output Bit Q${3 - i} ${i === 0 ? '(MSB)' : i === 3 ? '(LSB)' : ''}`,
      });
    }
    ports.push(
      { id: 'in_clk', name: 'CLK', type: 'input', relativePosition: { x: 0, y: (height / 7) * 5 }, description: 'Clock (Rising-Edge Trigger)' },
      { id: 'in_load', name: 'LOAD', type: 'input', relativePosition: { x: 0, y: (height / 7) * 6 }, description: 'Load Enable (Latches D inputs when LOAD=1 on clock)' }
    );
    return ports;
  }

  return ports;
}

/**
 * Generates an alphabetic sequence label for logic inputs:
 * 0 -> 'A', 1 -> 'B', ... 25 -> 'Z', 26 -> 'AA', 27 -> 'BB', ... 51 -> 'ZZ', 52 -> 'AAA', etc.
 */
export function getAlphabetSequenceLabel(index: number): string {
  if (index < 0) return 'A';
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const cycle = Math.floor(index / 26) + 1;
  const letter = letters[index % 26];
  return letter.repeat(cycle);
}

/**
 * Finds the next available alphabetical label ('A', 'B', ... 'Z', 'AA', 'BB' ...)
 * that is not currently used by existing input/switch components on the canvas.
 */
export function getNextAlphabetLabel(components: { label?: string }[]): string {
  const existingLabels = new Set(
    components.map((c) => (c.label || '').trim().toUpperCase()).filter(Boolean)
  );
  let index = 0;
  while (true) {
    const candidate = getAlphabetSequenceLabel(index);
    if (!existingLabels.has(candidate)) {
      return candidate;
    }
    index++;
  }
}

/**
 * Factory function to create a new CircuitComponent instance
 */
let componentIdCounter = 1;
export function createComponent(
  type: GateType,
  x: number,
  y: number,
  options: {
    inputCount?: number;
    customGateId?: string;
    customDef?: CustomGateDefinition;
    name?: string;
    label?: string;
    rotation?: number;
  } = {}
): CircuitComponent {
  const meta = COMPONENT_METADATA[type] || COMPONENT_METADATA.AND;
  const inputCount = options.inputCount || meta.defaultInputs;
  const id = `comp_${type.toLowerCase()}_${Date.now()}_${componentIdCounter++}`;
  const ports = generateComponentPorts(type, inputCount, options.customDef);

  const comp: CircuitComponent = {
    id,
    type,
    customGateId: options.customGateId,
    name: options.name || (options.customDef ? options.customDef.name : meta.name),
    x,
    y,
    rotation: options.rotation || 0,
    inputCount,
    ports,
    label: options.label,
    internalState: {
      value: type === 'CONST_1' ? 1 : 0,
      clockFreqHz: type === 'CLOCK' ? 1 : undefined,
      clockState: false,
      lastClockTime: 0,
      q: 0,
      notQ: 1,
      storedBits: [0, 0, 0, 0],
    },
  };

  return comp;
}
