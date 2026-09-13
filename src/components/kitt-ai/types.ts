export type SignalType = 'POWER_VCC' | 'GROUND' | 'ANALOG' | 'DIGITAL' | 'PWM' | 'I2C_SDA' | 'I2C_SCL' | 'SPI';

export interface ComponentPin {
  id: string;
  name: string;
  number?: number;
  type: 'power' | 'ground' | 'input' | 'output' | 'io' | 'analog' | 'passive';
  voltage?: number; // expected operating voltage
  relativeX: number; // relative coordinate for 2D schematic pin
  relativeY: number;
  breadboardPinOffset?: { colOffset: number; rowOffset: number };
}

export interface CircuitComponent {
  id: string;
  catalogId: string;
  name: string;
  category: 'microcontroller' | 'sensor' | 'actuator' | 'passive' | 'semiconductor' | 'ic' | 'display' | 'power';
  value?: string; // e.g. "220Ω", "10kΩ", "0.1µF", "16MHz"
  package: 'DIP' | 'AXIAL' | 'RADIAL' | 'MODULE_HEADER' | 'TO-220' | 'DISCRETE_2PIN';
  pins: ComponentPin[];
  
  // 2D Schematic Placement
  schematic: {
    x: number;
    y: number;
    rotation?: number;
  };

  // 3D Breadboard Placement
  breadboard: {
    anchorRow: number; // 1 to 63
    anchorCol: 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'rail_top_pos' | 'rail_top_neg' | 'rail_bot_pos' | 'rail_bot_neg';
    rotation?: 0 | 90 | 180 | 270;
  };

  color?: string;
  description?: string;
}

export interface CircuitConnection {
  id: string;
  fromComponentId: string;
  fromPinId: string;
  toComponentId: string;
  toPinId: string;
  signalType: SignalType;
  wireColor: string; // HEX color
  label?: string;
  liveVoltage?: number; // V
  liveCurrent?: number; // mA
}

export interface CircuitTelemetry {
  supplyVoltage: number; // V
  totalCurrent_mA: number; // mA
  totalPower_mW: number; // mW
  systemFrequency_Hz?: number;
  batteryLifeEstimate?: string;
  nodeVoltages: Record<string, number>; // componentId_pinId -> Volts
}

export interface DRCViolation {
  level: 'error' | 'warning' | 'info';
  componentId?: string;
  title: string;
  description: string;
  recommendation: string;
}

export interface CanonicalCircuit {
  id: string;
  title: string;
  summary: string;
  description: string;
  components: CircuitComponent[];
  connections: CircuitConnection[];
  telemetry: CircuitTelemetry;
  drcViolations: DRCViolation[];
  firmware: {
    language: 'arduino' | 'cpp' | 'micropython';
    code: string;
    librariesRequired: string[];
  };
  tags: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'kitt';
  timestamp: string;
  text: string;
  thinkingTrace?: {
    steps: {
      title: string;
      description: string;
      durationMs: number;
    }[];
    totalDurationMs: number;
  };
  generatedCircuit?: CanonicalCircuit;
  circuitActionSuggested?: 'launch_2d' | 'launch_3d';
}
