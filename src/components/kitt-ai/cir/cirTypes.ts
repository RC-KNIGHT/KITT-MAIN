/**
 * Canonical Intermediate Representation (CIR) Types
 * Single source of truth for 2D, 3D, simulation, firmware, measurements, BOM, and export.
 */

export type UserIntentType =
  | 'general_conversation'
  | 'electronics_question'
  | 'build_request'
  | 'modify_circuit'
  | 'debug_circuit'
  | 'simulation_request'
  | 'firmware_request'
  | 'research_request'
  | 'physical_measurement';

export type SignalType =
  | 'POWER_VCC'
  | 'POWER_3V3'
  | 'GROUND'
  | 'ANALOG'
  | 'DIGITAL'
  | 'PWM'
  | 'I2C_SDA'
  | 'I2C_SCL'
  | 'SPI_MOSI'
  | 'SPI_MISO'
  | 'SPI_SCK'
  | 'SPI_CS'
  | 'UART_TX'
  | 'UART_RX';

export interface CIRPin {
  id: string;
  name: string;
  number?: number;
  type: 'power' | 'ground' | 'input' | 'output' | 'io' | 'analog' | 'passive';
  voltageNominal?: number;
  voltageMax?: number;
  relativeX: number;
  relativeY: number;
  breadboardOffset?: { col: number; row: number };
  alternateFunctions?: string[];
}

export interface CIRComponent {
  id: string;
  partNumber: string;
  manufacturer: string;
  category: 'microcontroller' | 'sensor' | 'actuator' | 'passive' | 'semiconductor' | 'ic' | 'display' | 'power';
  displayName: string;
  package: 'DIP' | 'AXIAL' | 'RADIAL' | 'MODULE_HEADER' | 'TO-220' | 'DISCRETE_2PIN' | 'SMD';
  parameters: Record<string, string | number>; // e.g. { resistance: "220", tolerance: "5%", wattage: "0.25W" }
  pins: CIRPin[];
  
  // 2D Canvas Position & Rotation
  schematic: {
    x: number;
    y: number;
    rotation: 0 | 90 | 180 | 270;
  };

  // 3D Breadboard Physical Mapping
  physical: {
    anchorRow: number; // 1 to 63
    anchorCol: 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'rail_top_pos' | 'rail_top_neg' | 'rail_bot_pos' | 'rail_bot_neg';
    rotation: 0 | 90 | 180 | 270;
    footprint3D: string;
  };

  datasheetUrl?: string;
  simulationModel?: string;
  isVerifiedModel: boolean;
  confidenceScore: number; // 0.0 to 1.0
}

export interface CIRWire {
  id: string;
  fromComponentId: string;
  fromPinId: string;
  toComponentId: string;
  toPinId: string;
  signalType: SignalType;
  color: string;
  label?: string;
  netName: string;
  liveVoltage?: number;
  liveCurrent?: number;
}

export interface CIRNet {
  name: string;
  signalType: SignalType;
  pinRefs: { componentId: string; pinId: string }[];
  nominalVoltage: number;
}

export interface CIRFirmware {
  targetMcu: string;
  environment: 'arduino' | 'cpp' | 'micropython' | 'espidf';
  sourceCode: string;
  requiredLibraries: { name: string; version?: string; sourceUrl?: string }[];
  pinDefinitions: Record<string, number | string>;
  compilationStatus: 'not_compiled' | 'clean' | 'warnings' | 'error';
  compilerMessages?: string[];
}

export interface CIRPowerDomain {
  id: string;
  voltage: number;
  sourceComponentId: string;
  sourcePinId: string;
  maxCurrent_mA: number;
  componentsSupplied: string[];
}

export interface CIRVerificationReport {
  overallStatus: 'PASS' | 'PASS_WITH_WARNINGS' | 'NEEDS_INPUT' | 'FAIL';
  timestamp: string;
  stageResults: {
    stage1_syntax: { status: 'pass' | 'fail'; message: string };
    stage2_connectivity: { status: 'pass' | 'fail' | 'warn'; message: string; details?: string[] };
    stage3_electricalRules: { status: 'pass' | 'fail' | 'warn'; message: string; details?: string[] };
    stage4_pinCompatibility: { status: 'pass' | 'fail' | 'warn'; message: string; details?: string[] };
    stage5_firmwareCheck: { status: 'pass' | 'fail' | 'warn'; message: string; details?: string[] };
    stage6_simulation: { status: 'pass' | 'fail' | 'warn'; message: string; confidence: number };
    stage7_behaviorTests: { status: 'pass' | 'fail' | 'warn'; message: string; passedCases: number; totalCases: number };
    stage8_adversarialChecks: { status: 'pass' | 'fail' | 'warn'; message: string; risksChecked: string[] };
  };
  warnings: string[];
  errors: string[];
  recommendations: string[];
}

export interface CIRTelemetry {
  supplyVoltage: number;
  totalCurrentDraw_mA: number;
  powerConsumption_mW: number;
  operatingTemperature_C: number;
  frequency_Hz: number;
  batteryEstimateHours: string;
  nodeVoltages: Record<string, number>; // componentId_pinId -> Volts
  branchCurrents: Record<string, number>; // wireId -> mA
}

export interface CanonicalCircuitModel {
  id: string;
  version: number;
  title: string;
  summary: string;
  createdAt: string;
  updatedAt: string;
  provenance: {
    author: 'agent' | 'user';
    baseModel: string;
    verifiedTimestamp?: string;
  };
  components: CIRComponent[];
  wires: CIRWire[];
  nets: CIRNet[];
  powerDomains: CIRPowerDomain[];
  firmware: CIRFirmware;
  telemetry: CIRTelemetry;
  verificationReport: CIRVerificationReport;
}

// Transactional Patch for AI-driven modifications
export type CIRPatchAction =
  | { type: 'ADD_COMPONENT'; component: CIRComponent }
  | { type: 'REMOVE_COMPONENT'; componentId: string }
  | { type: 'REPLACE_COMPONENT'; oldComponentId: string; newComponent: CIRComponent }
  | { type: 'MOVE_COMPONENT'; componentId: string; schematicPos?: { x: number; y: number }; breadboardPos?: { row: number; col: any } }
  | { type: 'CONNECT'; wire: CIRWire }
  | { type: 'DISCONNECT'; wireId: string }
  | { type: 'SET_PARAMETER'; componentId: string; paramName: string; value: string | number }
  | { type: 'SET_FIRMWARE'; firmware: Partial<CIRFirmware> }
  | { type: 'SET_BOARD'; boardPartNumber: string }
  | { type: 'SET_POWER'; supplyVoltage: number };

export interface CIRPatchTransaction {
  id: string;
  timestamp: string;
  description: string;
  actions: CIRPatchAction[];
  status: 'pending' | 'applied' | 'rejected';
}

export interface VirtualMultimeterState {
  mode: 'V_DC' | 'V_AC' | 'CURRENT_DC' | 'RESISTANCE' | 'CONTINUITY';
  probeRed: { componentId: string; pinId: string } | null;
  probeBlack: { componentId: string; pinId: string } | null;
  displayValue: string;
  unit: string;
}

export interface VirtualOscilloscopeState {
  channelA: { componentId: string; pinId: string; scaleVPerDiv: number; offset: number } | null;
  channelB: { componentId: string; pinId: string; scaleVPerDiv: number; offset: number } | null;
  timebaseMsPerDiv: number;
  isRun: boolean;
}
