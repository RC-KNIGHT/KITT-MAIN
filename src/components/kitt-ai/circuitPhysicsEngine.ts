import { CircuitComponent, CircuitConnection, CircuitTelemetry, DRCViolation } from './types';
import { CanonicalCircuitModel } from './cir/cirTypes';

export function solveCanonicalCircuitPhysics(circuit: CanonicalCircuitModel): {
  telemetry: CircuitTelemetry;
  violations: DRCViolation[];
} {
  const components: CircuitComponent[] = (circuit.components || []).map(comp => ({
    id: comp.id,
    catalogId: (comp.partNumber || comp.displayName || comp.id).toLowerCase(),
    name: comp.displayName || comp.partNumber,
    category: comp.category,
    package: (comp.package as any) || 'DIP',
    pins: (comp.pins || []).map(p => ({
      id: p.id,
      name: p.name,
      number: p.number,
      type: p.type,
      voltage: p.voltageNominal ?? (p as any).voltage,
      relativeX: p.relativeX || 0,
      relativeY: p.relativeY || 0,
    })),
    schematic: {
      x: comp.schematic?.x || 0,
      y: comp.schematic?.y || 0,
      rotation: comp.schematic?.rotation || 0,
    },
    breadboard: {
      anchorRow: comp.physical?.anchorRow || 1,
      anchorCol: comp.physical?.anchorCol || 'e',
      rotation: comp.physical?.rotation || 0,
    },
  }));

  const connections: CircuitConnection[] = (circuit.wires || []).map(w => ({
    id: w.id,
    fromComponentId: w.fromComponentId,
    fromPinId: w.fromPinId,
    toComponentId: w.toComponentId,
    toPinId: w.toPinId,
    signalType: (w.signalType as any) || 'DIGITAL',
    wireColor: w.color || '#3b82f6',
    liveVoltage: w.liveVoltage,
    liveCurrent: w.liveCurrent,
  }));

  const nominalSupplyVoltage = circuit.telemetry?.supplyVoltage || 5.0;
  return solveCircuitPhysics(components, connections, nominalSupplyVoltage);
}

export function solveCircuitPhysics(
  components: CircuitComponent[],
  connections: CircuitConnection[],
  nominalSupplyVoltage: number = 5.0
): { telemetry: CircuitTelemetry; violations: DRCViolation[] } {
  const nodeVoltages: Record<string, number> = {};
  const violations: DRCViolation[] = [];

  // 1. Identify Power & Ground Nodes
  connections.forEach(conn => {
    const keyFrom = `${conn.fromComponentId}_${conn.fromPinId}`;
    const keyTo = `${conn.toComponentId}_${conn.toPinId}`;

    if (conn.signalType === 'POWER_VCC') {
      nodeVoltages[keyFrom] = nominalSupplyVoltage;
      nodeVoltages[keyTo] = nominalSupplyVoltage;
      conn.liveVoltage = nominalSupplyVoltage;
    } else if (conn.signalType === 'GROUND') {
      nodeVoltages[keyFrom] = 0.0;
      nodeVoltages[keyTo] = 0.0;
      conn.liveVoltage = 0.0;
    }
  });

  // 2. Resolve Microcontroller On-Board Regulators (e.g. 3.3V from ESP32/Pico/STM32/Uno)
  components.forEach(comp => {
    if (comp.catalogId.includes('esp32') || comp.catalogId.includes('pico') || comp.catalogId.includes('stm32')) {
      const pin3v3 = comp.pins.find(p => p.id === '3v3' || p.id === '3.3v' || p.name.includes('3.3V') || p.name.includes('3V3'));
      if (pin3v3) {
        nodeVoltages[`${comp.id}_${pin3v3.id}`] = 3.3;
      }
    }
    if (comp.catalogId.includes('arduino-uno')) {
      nodeVoltages[`${comp.id}_5v`] = 5.0;
      nodeVoltages[`${comp.id}_3v3`] = 3.3;
    }
  });

  // 3. Propagate voltages across direct connections
  let changed = true;
  let iterations = 0;
  while (changed && iterations < 5) {
    changed = false;
    iterations++;
    connections.forEach(conn => {
      const fromKey = `${conn.fromComponentId}_${conn.fromPinId}`;
      const toKey = `${conn.toComponentId}_${conn.toPinId}`;
      const vFrom = nodeVoltages[fromKey];
      const vTo = nodeVoltages[toKey];

      if (vFrom !== undefined && vTo === undefined) {
        nodeVoltages[toKey] = vFrom;
        conn.liveVoltage = vFrom;
        changed = true;
      } else if (vTo !== undefined && vFrom === undefined) {
        nodeVoltages[fromKey] = vTo;
        conn.liveVoltage = vTo;
        changed = true;
      }
    });
  }

  // 4. Calculate total estimated current consumption
  let totalCurrent_mA = 0;
  components.forEach(comp => {
    switch (comp.category) {
      case 'microcontroller':
        if (comp.catalogId.includes('esp32')) totalCurrent_mA += 80;
        else if (comp.catalogId.includes('pico')) totalCurrent_mA += 24;
        else if (comp.catalogId.includes('stm32')) totalCurrent_mA += 36;
        else totalCurrent_mA += 45;
        break;
      case 'sensor':
        if (comp.catalogId.includes('ultrasonic')) totalCurrent_mA += 15;
        else if (comp.catalogId.includes('bme280')) totalCurrent_mA += 1;
        else if (comp.catalogId.includes('mpu6050')) totalCurrent_mA += 4;
        else totalCurrent_mA += 5;
        break;
      case 'actuator':
        if (comp.catalogId.includes('pump')) totalCurrent_mA += 250;
        else if (comp.catalogId.includes('servo')) totalCurrent_mA += 120;
        else totalCurrent_mA += 30;
        break;
      case 'display':
        totalCurrent_mA += 22;
        break;
      case 'semiconductor':
        if (comp.catalogId.includes('led')) totalCurrent_mA += 15;
        else if (comp.catalogId.includes('2n2222')) totalCurrent_mA += 50;
        break;
      case 'ic':
        totalCurrent_mA += 8;
        break;
      default:
        totalCurrent_mA += 2;
    }
  });

  // Set default node voltages for remaining pins
  components.forEach(comp => {
    comp.pins.forEach(pin => {
      const key = `${comp.id}_${pin.id}`;
      if (nodeVoltages[key] === undefined) {
        if (pin.type === 'ground') nodeVoltages[key] = 0;
        else if (pin.type === 'power') nodeVoltages[key] = pin.voltage || nominalSupplyVoltage;
        else if (pin.type === 'analog') nodeVoltages[key] = Number((1.85 + Math.random() * 0.1).toFixed(2));
        else if (pin.type === 'output' || pin.type === 'io') nodeVoltages[key] = 3.28;
        else nodeVoltages[key] = 0.0;
      }
    });
  });

  // 5. Design Rule Checks (DRC)
  // Check A: VCC to GND Direct Short
  connections.forEach(conn => {
    if (
      (conn.signalType === 'POWER_VCC' && conn.toPinId.includes('gnd')) ||
      (conn.signalType === 'GROUND' && conn.toPinId.includes('vcc'))
    ) {
      violations.push({
        level: 'error',
        title: 'Direct VCC to GND Short Circuit',
        description: `Direct low-resistance path detected between power rail and ground (${conn.fromPinId} ↔ ${conn.toPinId}).`,
        recommendation: 'Remove direct bridge between supply rail and common ground to prevent power supply shutdown or thermal damage.'
      });
    }
  });

  // Check B: Inductive Load without Flyback Diode
  const hasInductiveLoad = components.some(c => c.category === 'actuator' && (c.name.toLowerCase().includes('pump') || c.name.toLowerCase().includes('motor') || c.name.toLowerCase().includes('relay')));
  const hasDiode = components.some(c => c.catalogId.includes('diode') || c.catalogId.includes('1n4007'));
  if (hasInductiveLoad && !hasDiode) {
    violations.push({
      level: 'warning',
      title: 'Missing Inductive Flyback Diode (Snubber)',
      description: 'An inductive coil load (motor/pump/relay) is present without a parallel flyback diode (e.g. 1N4007).',
      recommendation: 'Place a reverse-biased diode across the motor terminals to clamp back-EMF voltage spikes when turning off.'
    });
  }

  // Check C: LED without Series Current Limiter
  const hasLed = components.some(c => c.catalogId.includes('led'));
  const hasResistor = components.some(c => c.catalogId.includes('resistor'));
  if (hasLed && !hasResistor) {
    violations.push({
      level: 'warning',
      title: 'Unprotected LED without Current Limiting Resistor',
      description: 'LEDs connected directly across logic outputs or rails will draw excessive forward current.',
      recommendation: 'Insert a 220Ω – 330Ω resistor in series with the LED anode or cathode to limit current to ~15mA.'
    });
  }

  // Check D: 3.3V Logic Over-voltage Exposure
  const has3v3Mcu = components.some(c => c.catalogId.includes('esp32') || c.catalogId.includes('pico'));
  const has5vSupply = nominalSupplyVoltage >= 5.0;
  if (
    has3v3Mcu &&
    has5vSupply &&
    connections.some(
      c =>
        (c.fromPinId === '5v' || c.liveVoltage === 5.0) &&
        (c.toComponentId.includes('esp32') || c.toComponentId.includes('pico')) &&
        (c.toPinId.includes('gpio') || c.toPinId.includes('gp'))
    )
  ) {
    violations.push({
      level: 'error',
      title: '3.3V GPIO Over-Voltage Violation',
      description: 'ESP32 & RP2040 Pico GPIO pins are not 5V tolerant (Max rating: 3.6V). Direct 5V exposure will permanently degrade the silicon input stage.',
      recommendation: 'Use a resistor divider (e.g. 1kΩ / 2kΩ) or a bidirectional logic level shifter.'
    });
  }

  // Check E: Missing Decoupling Capacitor on Fast Digital ICs / MCUs
  const hasDigitalICs = components.some(c => c.category === 'ic' || c.category === 'microcontroller');
  const hasCapacitor = components.some(c => c.category === 'passive' && (c.catalogId.includes('cap') || c.name.toLowerCase().includes('cap')));
  if (hasDigitalICs && !hasCapacitor) {
    violations.push({
      level: 'warning',
      title: 'Missing IC Decoupling Capacitor',
      description: 'High-speed CMOS logic gates and microcontrollers produce transient switching currents on the power rail.',
      recommendation: 'Place a 100nF (0.1µF) ceramic capacitor across VCC and GND as close to each IC power pin as possible.'
    });
  }

  // Check F: I2C Bus Pull-Up Verification
  const hasI2CDevice = components.some(c => c.catalogId.includes('ssd1306') || c.catalogId.includes('bme280') || c.catalogId.includes('mpu6050'));
  const resistorCount = components.filter(c => c.catalogId.includes('resistor')).length;
  const hasMcuWithInternalPullup = components.some(c => c.catalogId.includes('esp32') || c.catalogId.includes('pico'));
  if (hasI2CDevice && resistorCount < 2 && !hasMcuWithInternalPullup) {
    violations.push({
      level: 'warning',
      title: 'I2C Bus Floating (Missing Pull-Up Resistors)',
      description: 'I2C open-drain lines (SDA/SCL) require pull-up resistors to maintain logic HIGH when idle.',
      recommendation: 'Add 4.7kΩ pull-up resistors from SDA and SCL to the 3.3V logic rail.'
    });
  }

  const totalPower_mW = Number((nominalSupplyVoltage * totalCurrent_mA).toFixed(1));
  const batteryHours = totalCurrent_mA > 0 ? (2000 / totalCurrent_mA).toFixed(1) : '∞';

  const telemetry: CircuitTelemetry = {
    supplyVoltage: nominalSupplyVoltage,
    totalCurrent_mA: Math.round(totalCurrent_mA),
    totalPower_mW,
    systemFrequency_Hz: 16000000,
    batteryLifeEstimate: `~${batteryHours} hrs (on 2000mAh LiPo)`,
    nodeVoltages
  };

  return { telemetry, violations };
}
