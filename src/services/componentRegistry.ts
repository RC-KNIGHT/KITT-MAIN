/**
 * KITT Hardware Component & Electrical Registry
 * Single authoritative source of truth for microcontrollers, sensors, ICs, passives, and electrical panel MCBs.
 * Supports data-driven extensibility without code-path modifications.
 */

export type ComponentCategory =
  | 'microcontroller'
  | 'sensor'
  | 'actuator'
  | 'passive'
  | 'semiconductor'
  | 'ic'
  | 'breaker'
  | 'distribution'
  | 'power'
  | 'display';

export interface PinDefinition {
  id: string;
  name: string;
  type: 'power' | 'ground' | 'analog' | 'digital' | 'io' | 'input' | 'output' | 'passive' | 'ac_phase' | 'ac_neutral' | 'ac_earth';
  voltageNominal?: number;
  voltageMax?: number;
  alternateFunctions?: string[];
  isInputOnly?: boolean;
  isOutputOnly?: boolean;
  supportsPwm?: boolean;
  supportsAdc?: boolean;
  supportsI2c?: boolean;
  supportsSpi?: boolean;
}

export interface McbSpec {
  poles: 1 | 2 | 3;
  ratedCurrentAmps: number;
  tripCurve: 'B' | 'C' | 'D'; // B: 3-5x In, C: 5-10x In, D: 10-20x In
  kaRating: number; // e.g. 6kA, 10kA
  compatibleWireGauge: {
    minAwg: number;
    maxAwg: number;
  };
}

export interface HardwareComponentSpec {
  id: string;
  partNumber: string;
  displayName: string;
  category: ComponentCategory;
  manufacturer: string;
  description: string;
  packageFootprint: string;
  unitCostUsd: number;
  datasheetSummary: {
    voltageRange: [number, number]; // [min, max]
    nominalSupplyVoltage: number;
    currentNominal_mA: number;
    currentSurge_mA: number;
    powerDissipationMax_mW: number;
    operatingTempRange_C: [number, number];
  };
  pins: PinDefinition[];
  mcbSpecs?: McbSpec;
  aliases?: string[];
}

class ComponentRegistryService {
  private registry: Map<string, HardwareComponentSpec> = new Map();

  constructor() {
    this.seedRegistry();
  }

  public registerComponent(spec: HardwareComponentSpec): void {
    this.registry.set(spec.id.toLowerCase(), spec);
    this.registry.set(spec.partNumber.toLowerCase(), spec);
    if (spec.aliases) {
      spec.aliases.forEach(alias => this.registry.set(alias.toLowerCase(), spec));
    }
  }

  public lookup(query: string): HardwareComponentSpec | null {
    if (!query) return null;
    const q = query.toLowerCase().trim();
    if (this.registry.has(q)) {
      return this.registry.get(q)!;
    }

    // Fuzzy matching across aliases, display name, and ID
    for (const spec of this.registry.values()) {
      if (
        spec.displayName.toLowerCase().includes(q) ||
        spec.partNumber.toLowerCase().includes(q) ||
        spec.id.toLowerCase().includes(q) ||
        (spec.aliases && spec.aliases.some(a => a.toLowerCase().includes(q)))
      ) {
        return spec;
      }
    }
    return null;
  }

  public isSupported(query: string): boolean {
    return this.lookup(query) !== null;
  }

  public getAll(): HardwareComponentSpec[] {
    const unique = new Map<string, HardwareComponentSpec>();
    for (const spec of this.registry.values()) {
      unique.set(spec.id, spec);
    }
    return Array.from(unique.values());
  }

  public getByCategory(category: ComponentCategory): HardwareComponentSpec[] {
    return this.getAll().filter(spec => spec.category === category);
  }

  public getBoardPinout(boardFqbnOrName: string): HardwareComponentSpec | null {
    const q = boardFqbnOrName.toLowerCase();
    if (q.includes('esp32')) return this.lookup('esp32-wroom-32');
    if (q.includes('uno') || q.includes('atmega328') || q.includes('avr')) return this.lookup('arduino-uno-r3');
    if (q.includes('pico') || q.includes('rp2040')) return this.lookup('rp2040-pico');
    if (q.includes('stm32') || q.includes('bluepill')) return this.lookup('stm32f103c8t6');
    return null;
  }

  private seedRegistry(): void {
    // -------------------------------------------------------------
    // 1. MICROCONTROLLERS
    // -------------------------------------------------------------
    this.registerComponent({
      id: 'esp32-wroom-32',
      partNumber: 'ESP32-WROOM-32E',
      displayName: 'ESP32-WROOM-32 DevKit V1',
      category: 'microcontroller',
      manufacturer: 'Espressif Systems',
      description: 'Dual-core Xtensa 32-bit LX6 @ 240MHz with 2.4GHz Wi-Fi and Bluetooth LE.',
      packageFootprint: 'DIP-30 / DevKit',
      unitCostUsd: 4.50,
      datasheetSummary: {
        voltageRange: [3.0, 3.6],
        nominalSupplyVoltage: 3.3,
        currentNominal_mA: 80,
        currentSurge_mA: 240,
        powerDissipationMax_mW: 850,
        operatingTempRange_C: [-40, 85],
      },
      pins: [
        { id: '3v3', name: '3V3', type: 'power', voltageNominal: 3.3, voltageMax: 3.6 },
        { id: 'gnd', name: 'GND', type: 'ground', voltageNominal: 0.0 },
        { id: 'vin', name: 'VIN', type: 'power', voltageNominal: 5.0, voltageMax: 12.0 },
        { id: 'gpio2', name: 'GPIO2', type: 'io', supportsPwm: true, supportsAdc: true, alternateFunctions: ['ADC2_CH2', 'TOUCH2'] },
        { id: 'gpio4', name: 'GPIO4', type: 'io', supportsPwm: true, supportsAdc: true, alternateFunctions: ['ADC2_CH0', 'TOUCH0'] },
        { id: 'gpio5', name: 'GPIO5', type: 'io', supportsPwm: true, supportsSpi: true, alternateFunctions: ['VSPI_CS'] },
        { id: 'gpio12', name: 'GPIO12', type: 'io', supportsPwm: true, supportsAdc: true, alternateFunctions: ['ADC2_CH5', 'TOUCH5'] },
        { id: 'gpio13', name: 'GPIO13', type: 'io', supportsPwm: true, supportsAdc: true, alternateFunctions: ['ADC2_CH4', 'TOUCH4'] },
        { id: 'gpio14', name: 'GPIO14', type: 'io', supportsPwm: true, supportsAdc: true, alternateFunctions: ['ADC2_CH6', 'TOUCH6'] },
        { id: 'gpio18', name: 'GPIO18', type: 'io', supportsPwm: true, supportsSpi: true, alternateFunctions: ['VSPI_CLK'] },
        { id: 'gpio19', name: 'GPIO19', type: 'io', supportsPwm: true, supportsSpi: true, alternateFunctions: ['VSPI_MISO'] },
        { id: 'gpio21', name: 'GPIO21', type: 'io', supportsPwm: true, supportsI2c: true, alternateFunctions: ['I2C_SDA'] },
        { id: 'gpio22', name: 'GPIO22', type: 'io', supportsPwm: true, supportsI2c: true, alternateFunctions: ['I2C_SCL'] },
        { id: 'gpio23', name: 'GPIO23', type: 'io', supportsPwm: true, supportsSpi: true, alternateFunctions: ['VSPI_MOSI'] },
        { id: 'gpio25', name: 'GPIO25', type: 'io', supportsPwm: true, supportsAdc: true, alternateFunctions: ['ADC2_CH8', 'DAC1'] },
        { id: 'gpio26', name: 'GPIO26', type: 'io', supportsPwm: true, supportsAdc: true, alternateFunctions: ['ADC2_CH9', 'DAC2'] },
        { id: 'gpio32', name: 'GPIO32', type: 'io', supportsPwm: true, supportsAdc: true, alternateFunctions: ['ADC1_CH4', 'TOUCH9'] },
        { id: 'gpio33', name: 'GPIO33', type: 'io', supportsPwm: true, supportsAdc: true, alternateFunctions: ['ADC1_CH5', 'TOUCH8'] },
        // INPUT-ONLY PINS (GPI) - CANNOT BE OUTPUTS
        { id: 'gpio34', name: 'GPIO34', type: 'io', isInputOnly: true, supportsAdc: true, alternateFunctions: ['ADC1_CH6'] },
        { id: 'gpio35', name: 'GPIO35', type: 'io', isInputOnly: true, supportsAdc: true, alternateFunctions: ['ADC1_CH7'] },
        { id: 'gpio36', name: 'GPIO36 (VP)', type: 'io', isInputOnly: true, supportsAdc: true, alternateFunctions: ['ADC1_CH0', 'RTC_GPIO0'] },
        { id: 'gpio39', name: 'GPIO39 (VN)', type: 'io', isInputOnly: true, supportsAdc: true, alternateFunctions: ['ADC1_CH3', 'RTC_GPIO3'] },
      ],
      aliases: ['esp32', 'esp32-devkit', 'esp32s', 'esp-wroom-32'],
    });

    this.registerComponent({
      id: 'arduino-uno-r3',
      partNumber: 'ATmega328P-PU',
      displayName: 'Arduino Uno R3',
      category: 'microcontroller',
      manufacturer: 'Arduino / Microchip',
      description: '8-bit AVR RISC microcontroller @ 16MHz with 32KB Flash and 2KB SRAM.',
      packageFootprint: 'DIP-28 / Uno Board',
      unitCostUsd: 3.50,
      datasheetSummary: {
        voltageRange: [4.5, 5.5],
        nominalSupplyVoltage: 5.0,
        currentNominal_mA: 45,
        currentSurge_mA: 90,
        powerDissipationMax_mW: 500,
        operatingTempRange_C: [-40, 85],
      },
      pins: [
        { id: '5v', name: '5V', type: 'power', voltageNominal: 5.0, voltageMax: 5.5 },
        { id: '3v3', name: '3.3V', type: 'power', voltageNominal: 3.3, voltageMax: 3.6 },
        { id: 'gnd', name: 'GND', type: 'ground', voltageNominal: 0.0 },
        { id: 'vin', name: 'VIN', type: 'power', voltageNominal: 7.0, voltageMax: 12.0 },
        { id: 'd0', name: 'D0 (RX)', type: 'io', alternateFunctions: ['UART_RX'] },
        { id: 'd1', name: 'D1 (TX)', type: 'io', alternateFunctions: ['UART_TX'] },
        { id: 'd2', name: 'D2 (INT0)', type: 'io', alternateFunctions: ['INT0'] },
        { id: 'd3', name: 'D3 (PWM)', type: 'io', supportsPwm: true, alternateFunctions: ['INT1', 'OC2B'] },
        { id: 'd4', name: 'D4', type: 'io' },
        { id: 'd5', name: 'D5 (PWM)', type: 'io', supportsPwm: true, alternateFunctions: ['OC0B'] },
        { id: 'd6', name: 'D6 (PWM)', type: 'io', supportsPwm: true, alternateFunctions: ['OC0A'] },
        { id: 'd7', name: 'D7', type: 'io' },
        { id: 'd8', name: 'D8', type: 'io' },
        { id: 'd9', name: 'D9 (PWM)', type: 'io', supportsPwm: true, alternateFunctions: ['OC1A'] },
        { id: 'd10', name: 'D10 (PWM/SS)', type: 'io', supportsPwm: true, supportsSpi: true, alternateFunctions: ['SPI_SS'] },
        { id: 'd11', name: 'D11 (PWM/MOSI)', type: 'io', supportsPwm: true, supportsSpi: true, alternateFunctions: ['SPI_MOSI'] },
        { id: 'd12', name: 'D12 (MISO)', type: 'io', supportsSpi: true, alternateFunctions: ['SPI_MISO'] },
        { id: 'd13', name: 'D13 (SCK/LED)', type: 'io', supportsSpi: true, alternateFunctions: ['SPI_SCK', 'BUILTIN_LED'] },
        { id: 'a0', name: 'A0', type: 'analog', supportsAdc: true },
        { id: 'a1', name: 'A1', type: 'analog', supportsAdc: true },
        { id: 'a2', name: 'A2', type: 'analog', supportsAdc: true },
        { id: 'a3', name: 'A3', type: 'analog', supportsAdc: true },
        { id: 'a4', name: 'A4 (SDA)', type: 'analog', supportsAdc: true, supportsI2c: true, alternateFunctions: ['I2C_SDA'] },
        { id: 'a5', name: 'A5 (SCL)', type: 'analog', supportsAdc: true, supportsI2c: true, alternateFunctions: ['I2C_SCL'] },
      ],
      aliases: ['arduino', 'uno', 'atmega328p', 'arduino-uno'],
    });

    this.registerComponent({
      id: 'rp2040-pico',
      partNumber: 'RP2040-PICO',
      displayName: 'Raspberry Pi Pico (RP2040)',
      category: 'microcontroller',
      manufacturer: 'Raspberry Pi Foundation',
      description: 'Dual ARM Cortex-M0+ @ 133MHz, 264KB on-chip SRAM, 8 Programmable I/O (PIO) state machines.',
      packageFootprint: 'DIP-40 / Castellated Module',
      unitCostUsd: 4.00,
      datasheetSummary: {
        voltageRange: [1.8, 5.5],
        nominalSupplyVoltage: 3.3,
        currentNominal_mA: 30,
        currentSurge_mA: 90,
        powerDissipationMax_mW: 400,
        operatingTempRange_C: [-20, 85],
      },
      pins: [
        { id: 'vbus', name: 'VBUS (5V)', type: 'power', voltageNominal: 5.0, voltageMax: 5.5 },
        { id: 'vsys', name: 'VSYS', type: 'power', voltageNominal: 3.8, voltageMax: 5.5 },
        { id: '3v3', name: '3V3_OUT', type: 'power', voltageNominal: 3.3, voltageMax: 3.6 },
        { id: 'gnd', name: 'GND', type: 'ground', voltageNominal: 0.0 },
        { id: 'run', name: 'RUN (RESET)', type: 'input' },
        { id: 'gp0', name: 'GP0 (UART0_TX)', type: 'io', supportsPwm: true, alternateFunctions: ['UART0_TX', 'I2C0_SDA', 'SPI0_RX'] },
        { id: 'gp1', name: 'GP1 (UART0_RX)', type: 'io', supportsPwm: true, alternateFunctions: ['UART0_RX', 'I2C0_SCL', 'SPI0_CS'] },
        { id: 'gp2', name: 'GP2', type: 'io', supportsPwm: true, alternateFunctions: ['I2C1_SDA', 'SPI0_SCK'] },
        { id: 'gp3', name: 'GP3', type: 'io', supportsPwm: true, alternateFunctions: ['I2C1_SCL', 'SPI0_TX'] },
        { id: 'gp4', name: 'GP4', type: 'io', supportsPwm: true, alternateFunctions: ['I2C0_SDA', 'UART1_TX'] },
        { id: 'gp5', name: 'GP5', type: 'io', supportsPwm: true, alternateFunctions: ['I2C0_SCL', 'UART1_RX'] },
        { id: 'gp14', name: 'GP14', type: 'io', supportsPwm: true, alternateFunctions: ['SPI1_SCK'] },
        { id: 'gp15', name: 'GP15', type: 'io', supportsPwm: true, alternateFunctions: ['SPI1_TX'] },
        { id: 'gp16', name: 'GP16', type: 'io', supportsPwm: true, alternateFunctions: ['SPI0_RX'] },
        { id: 'gp17', name: 'GP17', type: 'io', supportsPwm: true, alternateFunctions: ['SPI0_CS'] },
        { id: 'gp25', name: 'GP25 (LED)', type: 'output', supportsPwm: true, alternateFunctions: ['ONBOARD_LED'] },
        { id: 'gp26', name: 'GP26 (ADC0)', type: 'analog', supportsAdc: true, supportsPwm: true, alternateFunctions: ['ADC0'] },
        { id: 'gp27', name: 'GP27 (ADC1)', type: 'analog', supportsAdc: true, supportsPwm: true, alternateFunctions: ['ADC1'] },
        { id: 'gp28', name: 'GP28 (ADC2)', type: 'analog', supportsAdc: true, supportsPwm: true, alternateFunctions: ['ADC2'] },
        { id: 'adc_vref', name: 'ADC_VREF', type: 'power', voltageNominal: 3.3 },
      ],
      aliases: ['pico', 'rp2040', 'raspberry-pi-pico', 'pi-pico'],
    });

    this.registerComponent({
      id: 'stm32f103c8t6',
      partNumber: 'STM32F103C8T6',
      displayName: 'STM32F103C8T6 Blue Pill',
      category: 'microcontroller',
      manufacturer: 'STMicroelectronics',
      description: '32-bit ARM Cortex-M3 @ 72MHz, 64KB Flash, 20KB SRAM, dual ADC, USB, CAN.',
      packageFootprint: 'LQFP-48 / DIP-40 Module',
      unitCostUsd: 3.20,
      datasheetSummary: {
        voltageRange: [2.0, 3.6],
        nominalSupplyVoltage: 3.3,
        currentNominal_mA: 36,
        currentSurge_mA: 60,
        powerDissipationMax_mW: 450,
        operatingTempRange_C: [-40, 85],
      },
      pins: [
        { id: '3v3', name: '3.3V', type: 'power', voltageNominal: 3.3, voltageMax: 3.6 },
        { id: 'gnd', name: 'GND', type: 'ground', voltageNominal: 0.0 },
        { id: '5v', name: '5V', type: 'power', voltageNominal: 5.0, voltageMax: 5.5 },
        { id: 'nrst', name: 'NRST', type: 'input' },
        { id: 'pa0', name: 'PA0 (WKUP/ADC1)', type: 'analog', supportsAdc: true, supportsPwm: true, alternateFunctions: ['TIM2_CH1', 'ADC12_IN0'] },
        { id: 'pa1', name: 'PA1 (ADC2)', type: 'analog', supportsAdc: true, supportsPwm: true, alternateFunctions: ['TIM2_CH2', 'ADC12_IN1'] },
        { id: 'pa2', name: 'PA2 (TX2)', type: 'io', supportsAdc: true, supportsPwm: true, alternateFunctions: ['USART2_TX', 'ADC12_IN2'] },
        { id: 'pa3', name: 'PA3 (RX2)', type: 'io', supportsAdc: true, supportsPwm: true, alternateFunctions: ['USART2_RX', 'ADC12_IN3'] },
        { id: 'pa4', name: 'PA4 (NSS1)', type: 'io', supportsAdc: true, alternateFunctions: ['SPI1_NSS', 'ADC12_IN4'] },
        { id: 'pa5', name: 'PA5 (SCK1)', type: 'io', supportsAdc: true, alternateFunctions: ['SPI1_SCK', 'ADC12_IN5'] },
        { id: 'pa6', name: 'PA6 (MISO1)', type: 'io', supportsAdc: true, supportsPwm: true, alternateFunctions: ['SPI1_MISO', 'TIM3_CH1'] },
        { id: 'pa7', name: 'PA7 (MOSI1)', type: 'io', supportsAdc: true, supportsPwm: true, alternateFunctions: ['SPI1_MOSI', 'TIM3_CH2'] },
        { id: 'pa8', name: 'PA8 (MCO)', type: 'io', supportsPwm: true, alternateFunctions: ['TIM1_CH1'] },
        { id: 'pa9', name: 'PA9 (TX1)', type: 'io', supportsPwm: true, alternateFunctions: ['USART1_TX', 'TIM1_CH2'] },
        { id: 'pa10', name: 'PA10 (RX1)', type: 'io', supportsPwm: true, alternateFunctions: ['USART1_RX', 'TIM1_CH3'] },
        { id: 'pb0', name: 'PB0', type: 'analog', supportsAdc: true, supportsPwm: true, alternateFunctions: ['TIM3_CH3', 'ADC12_IN8'] },
        { id: 'pb1', name: 'PB1', type: 'analog', supportsAdc: true, supportsPwm: true, alternateFunctions: ['TIM3_CH4', 'ADC12_IN9'] },
        { id: 'pb6', name: 'PB6 (SCL1)', type: 'io', supportsI2c: true, alternateFunctions: ['I2C1_SCL'] },
        { id: 'pb7', name: 'PB7 (SDA1)', type: 'io', supportsI2c: true, alternateFunctions: ['I2C1_SDA'] },
        { id: 'pc13', name: 'PC13 (LED)', type: 'output', alternateFunctions: ['ONBOARD_LED'] },
      ],
      aliases: ['stm32', 'bluepill', 'stm32f103', 'blue-pill'],
    });

    // -------------------------------------------------------------
    // 2. SENSORS & TRANSDUCERS
    // -------------------------------------------------------------
    this.registerComponent({
      id: 'hc-sr04',
      partNumber: 'HC-SR04',
      displayName: 'Ultrasonic Distance Sensor HC-SR04',
      category: 'sensor',
      manufacturer: 'Cytron / Generic',
      description: '40kHz ultrasonic acoustic distance ranger (2cm - 400cm).',
      packageFootprint: 'Module-4P',
      unitCostUsd: 1.25,
      datasheetSummary: {
        voltageRange: [4.5, 5.5],
        nominalSupplyVoltage: 5.0,
        currentNominal_mA: 15,
        currentSurge_mA: 20,
        powerDissipationMax_mW: 100,
        operatingTempRange_C: [-15, 70],
      },
      pins: [
        { id: 'vcc', name: 'VCC', type: 'power', voltageNominal: 5.0 },
        { id: 'trig', name: 'TRIG', type: 'input', voltageNominal: 5.0 },
        { id: 'echo', name: 'ECHO', type: 'output', voltageNominal: 5.0 },
        { id: 'gnd', name: 'GND', type: 'ground', voltageNominal: 0.0 },
      ],
      aliases: ['sonar', 'ultrasonic', 'distance-sensor'],
    });

    this.registerComponent({
      id: 'dht22',
      partNumber: 'AM2302',
      displayName: 'DHT22 Digital Temperature & Humidity Sensor',
      category: 'sensor',
      manufacturer: 'Aosong',
      description: 'High-precision capacitive humidity & thermistor temperature sensor with One-Wire bus.',
      packageFootprint: 'SIP-4P',
      unitCostUsd: 3.20,
      datasheetSummary: {
        voltageRange: [3.3, 5.5],
        nominalSupplyVoltage: 3.3,
        currentNominal_mA: 1.5,
        currentSurge_mA: 2.5,
        powerDissipationMax_mW: 15,
        operatingTempRange_C: [-40, 80],
      },
      pins: [
        { id: 'vcc', name: 'VCC', type: 'power', voltageNominal: 3.3 },
        { id: 'data', name: 'DATA', type: 'io', voltageNominal: 3.3 },
        { id: 'nc', name: 'NC', type: 'passive' },
        { id: 'gnd', name: 'GND', type: 'ground', voltageNominal: 0.0 },
      ],
      aliases: ['dht22', 'am2302', 'temp-humidity-sensor'],
    });

    this.registerComponent({
      id: 'soil-moisture-cap-v1.2',
      partNumber: 'HW-390',
      displayName: 'Capacitive Soil Moisture Sensor v1.2',
      category: 'sensor',
      manufacturer: 'DFRobot / Generic',
      description: 'Corrosion-resistant analog capacitive soil moisture sensor.',
      packageFootprint: 'Module-3P',
      unitCostUsd: 1.85,
      datasheetSummary: {
        voltageRange: [3.3, 5.5],
        nominalSupplyVoltage: 3.3,
        currentNominal_mA: 5,
        currentSurge_mA: 8,
        powerDissipationMax_mW: 25,
        operatingTempRange_C: [-10, 60],
      },
      pins: [
        { id: 'vcc', name: 'VCC', type: 'power', voltageNominal: 3.3 },
        { id: 'gnd', name: 'GND', type: 'ground', voltageNominal: 0.0 },
        { id: 'aout', name: 'AOUT', type: 'analog', voltageNominal: 3.3 },
      ],
      aliases: ['soil-sensor', 'soil-moisture', 'capacitive-soil'],
    });

    // -------------------------------------------------------------
    // 3. POWER SEMICONDUCTORS & ACTUATORS
    // -------------------------------------------------------------
    this.registerComponent({
      id: 'irlz44n',
      partNumber: 'IRLZ44NPBF',
      displayName: 'IRLZ44N Logic-Level N-Channel Power MOSFET',
      category: 'semiconductor',
      manufacturer: 'Infineon Technologies',
      description: 'Logic-level gate drive 55V 47A N-Channel MOSFET with 22mΩ RDS(on).',
      packageFootprint: 'TO-220AB',
      unitCostUsd: 0.85,
      datasheetSummary: {
        voltageRange: [0, 55],
        nominalSupplyVoltage: 12.0,
        currentNominal_mA: 47000,
        currentSurge_mA: 160000,
        powerDissipationMax_mW: 110000,
        operatingTempRange_C: [-55, 175],
      },
      pins: [
        { id: 'gate', name: 'Gate (G)', type: 'input', voltageMax: 16.0 },
        { id: 'drain', name: 'Drain (D)', type: 'passive', voltageMax: 55.0 },
        { id: 'source', name: 'Source (S)', type: 'passive', voltageNominal: 0.0 },
      ],
      aliases: ['mosfet', 'n-mosfet', 'irlz44'],
    });

    this.registerComponent({
      id: 'relay-module-5v',
      partNumber: 'SRD-05VDC-SL-C',
      displayName: '1-Channel 5V Optoisolated Relay Module',
      category: 'actuator',
      manufacturer: 'Songle / Generic',
      description: '10A 250VAC electromechanical relay with optocoupler isolation and flyback clamp.',
      packageFootprint: 'Module-6P',
      unitCostUsd: 1.10,
      datasheetSummary: {
        voltageRange: [4.5, 5.5],
        nominalSupplyVoltage: 5.0,
        currentNominal_mA: 70,
        currentSurge_mA: 90,
        powerDissipationMax_mW: 450,
        operatingTempRange_C: [-25, 70],
      },
      pins: [
        { id: 'vcc', name: 'VCC', type: 'power', voltageNominal: 5.0 },
        { id: 'gnd', name: 'GND', type: 'ground', voltageNominal: 0.0 },
        { id: 'in', name: 'IN', type: 'input', voltageNominal: 5.0 },
        { id: 'com', name: 'COM', type: 'passive' },
        { id: 'no', name: 'NO', type: 'passive' },
        { id: 'nc', name: 'NC', type: 'passive' },
      ],
      aliases: ['relay', '5v-relay', 'power-relay'],
    });

    // -------------------------------------------------------------
    // 4. DIGITAL LOGIC ICs (74xx Family with Exact Pinouts)
    // -------------------------------------------------------------
    const standardQuadGatePins = (gateType: 'NAND' | 'AND' | 'OR' | 'XOR'): PinDefinition[] => [
      { id: '1a', name: '1A', type: 'input', voltageNominal: 5.0 },
      { id: '1b', name: '1B', type: 'input', voltageNominal: 5.0 },
      { id: '1y', name: '1Y', type: 'output', voltageNominal: 5.0 },
      { id: '2a', name: '2A', type: 'input', voltageNominal: 5.0 },
      { id: '2b', name: '2B', type: 'input', voltageNominal: 5.0 },
      { id: '2y', name: '2Y', type: 'output', voltageNominal: 5.0 },
      { id: 'gnd', name: 'GND (Pin 7)', type: 'ground', voltageNominal: 0.0 },
      { id: '3y', name: '3Y', type: 'output', voltageNominal: 5.0 },
      { id: '3a', name: '3A', type: 'input', voltageNominal: 5.0 },
      { id: '3b', name: '3B', type: 'input', voltageNominal: 5.0 },
      { id: '4y', name: '4Y', type: 'output', voltageNominal: 5.0 },
      { id: '4a', name: '4A', type: 'input', voltageNominal: 5.0 },
      { id: '4b', name: '4B', type: 'input', voltageNominal: 5.0 },
      { id: 'vcc', name: 'VCC (Pin 14)', type: 'power', voltageNominal: 5.0 },
    ];

    this.registerComponent({
      id: '74hc00',
      partNumber: 'SN74HC00N',
      displayName: '74HC00 Quad 2-Input NAND Gate',
      category: 'ic',
      manufacturer: 'Texas Instruments',
      description: 'High-speed CMOS Quadruple 2-Input Positive-NAND Gates (Propagation Delay: ~9ns).',
      packageFootprint: 'DIP-14',
      unitCostUsd: 0.45,
      datasheetSummary: {
        voltageRange: [2.0, 6.0],
        nominalSupplyVoltage: 5.0,
        currentNominal_mA: 0.02,
        currentSurge_mA: 20,
        powerDissipationMax_mW: 500,
        operatingTempRange_C: [-40, 85],
      },
      pins: standardQuadGatePins('NAND'),
      aliases: ['7400', '74hc00', 'sn74hc00n', 'nand-gate'],
    });

    this.registerComponent({
      id: '74hc08',
      partNumber: 'SN74HC08N',
      displayName: '74HC08 Quad 2-Input AND Gate',
      category: 'ic',
      manufacturer: 'Texas Instruments',
      description: 'High-speed CMOS Quadruple 2-Input Positive-AND Gates (Propagation Delay: ~10ns).',
      packageFootprint: 'DIP-14',
      unitCostUsd: 0.45,
      datasheetSummary: {
        voltageRange: [2.0, 6.0],
        nominalSupplyVoltage: 5.0,
        currentNominal_mA: 0.02,
        currentSurge_mA: 20,
        powerDissipationMax_mW: 500,
        operatingTempRange_C: [-40, 85],
      },
      pins: standardQuadGatePins('AND'),
      aliases: ['7408', '74hc08', 'sn74hc08n', 'and-gate'],
    });

    this.registerComponent({
      id: '74hc32',
      partNumber: 'SN74HC32N',
      displayName: '74HC32 Quad 2-Input OR Gate',
      category: 'ic',
      manufacturer: 'Texas Instruments',
      description: 'High-speed CMOS Quadruple 2-Input Positive-OR Gates.',
      packageFootprint: 'DIP-14',
      unitCostUsd: 0.45,
      datasheetSummary: {
        voltageRange: [2.0, 6.0],
        nominalSupplyVoltage: 5.0,
        currentNominal_mA: 0.02,
        currentSurge_mA: 20,
        powerDissipationMax_mW: 500,
        operatingTempRange_C: [-40, 85],
      },
      pins: standardQuadGatePins('OR'),
      aliases: ['7432', '74hc32', 'sn74hc32n', 'or-gate'],
    });

    this.registerComponent({
      id: '74hc86',
      partNumber: 'SN74HC86N',
      displayName: '74HC86 Quad 2-Input XOR Gate',
      category: 'ic',
      manufacturer: 'Texas Instruments',
      description: 'High-speed CMOS Quadruple 2-Input Exclusive-OR Gates.',
      packageFootprint: 'DIP-14',
      unitCostUsd: 0.48,
      datasheetSummary: {
        voltageRange: [2.0, 6.0],
        nominalSupplyVoltage: 5.0,
        currentNominal_mA: 0.02,
        currentSurge_mA: 20,
        powerDissipationMax_mW: 500,
        operatingTempRange_C: [-40, 85],
      },
      pins: standardQuadGatePins('XOR'),
      aliases: ['7486', '74hc86', 'sn74hc86n', 'xor-gate'],
    });

    this.registerComponent({
      id: '74hc04',
      partNumber: 'SN74HC04N',
      displayName: '74HC04 Hex Inverter Gate',
      category: 'ic',
      manufacturer: 'Texas Instruments',
      description: 'High-speed CMOS Hex Inverting Gates (6 Independent NOT Gates).',
      packageFootprint: 'DIP-14',
      unitCostUsd: 0.42,
      datasheetSummary: {
        voltageRange: [2.0, 6.0],
        nominalSupplyVoltage: 5.0,
        currentNominal_mA: 0.02,
        currentSurge_mA: 20,
        powerDissipationMax_mW: 500,
        operatingTempRange_C: [-40, 85],
      },
      pins: [
        { id: '1a', name: '1A', type: 'input', voltageNominal: 5.0 },
        { id: '1y', name: '1Y', type: 'output', voltageNominal: 5.0 },
        { id: '2a', name: '2A', type: 'input', voltageNominal: 5.0 },
        { id: '2y', name: '2Y', type: 'output', voltageNominal: 5.0 },
        { id: '3a', name: '3A', type: 'input', voltageNominal: 5.0 },
        { id: '3y', name: '3Y', type: 'output', voltageNominal: 5.0 },
        { id: 'gnd', name: 'GND (Pin 7)', type: 'ground', voltageNominal: 0.0 },
        { id: '4y', name: '4Y', type: 'output', voltageNominal: 5.0 },
        { id: '4a', name: '4A', type: 'input', voltageNominal: 5.0 },
        { id: '5y', name: '5Y', type: 'output', voltageNominal: 5.0 },
        { id: '5a', name: '5A', type: 'input', voltageNominal: 5.0 },
        { id: '6y', name: '6Y', type: 'output', voltageNominal: 5.0 },
        { id: '6a', name: '6A', type: 'input', voltageNominal: 5.0 },
        { id: 'vcc', name: 'VCC (Pin 14)', type: 'power', voltageNominal: 5.0 },
      ],
      aliases: ['7404', '74hc04', 'not-gate', 'inverter'],
    });

    this.registerComponent({
      id: '74hc02',
      partNumber: 'SN74HC02N',
      displayName: '74HC02 Quad 2-Input NOR Gate',
      category: 'ic',
      manufacturer: 'Texas Instruments',
      description: 'High-speed CMOS Quadruple 2-Input Positive-NOR Gates.',
      packageFootprint: 'DIP-14',
      unitCostUsd: 0.45,
      datasheetSummary: {
        voltageRange: [2.0, 6.0],
        nominalSupplyVoltage: 5.0,
        currentNominal_mA: 0.02,
        currentSurge_mA: 20,
        powerDissipationMax_mW: 500,
        operatingTempRange_C: [-40, 85],
      },
      pins: [
        { id: '1y', name: '1Y', type: 'output', voltageNominal: 5.0 },
        { id: '1a', name: '1A', type: 'input', voltageNominal: 5.0 },
        { id: '1b', name: '1B', type: 'input', voltageNominal: 5.0 },
        { id: '2y', name: '2Y', type: 'output', voltageNominal: 5.0 },
        { id: '2a', name: '2A', type: 'input', voltageNominal: 5.0 },
        { id: '2b', name: '2B', type: 'input', voltageNominal: 5.0 },
        { id: 'gnd', name: 'GND (Pin 7)', type: 'ground', voltageNominal: 0.0 },
        { id: '3a', name: '3A', type: 'input', voltageNominal: 5.0 },
        { id: '3b', name: '3B', type: 'input', voltageNominal: 5.0 },
        { id: '3y', name: '3Y', type: 'output', voltageNominal: 5.0 },
        { id: '4a', name: '4A', type: 'input', voltageNominal: 5.0 },
        { id: '4b', name: '4B', type: 'input', voltageNominal: 5.0 },
        { id: '4y', name: '4Y', type: 'output', voltageNominal: 5.0 },
        { id: 'vcc', name: 'VCC (Pin 14)', type: 'power', voltageNominal: 5.0 },
      ],
      aliases: ['7402', '74hc02', 'nor-gate'],
    });

    this.registerComponent({
      id: '74hc74',
      partNumber: 'SN74HC74N',
      displayName: '74HC74 Dual D-Type Flip-Flop',
      category: 'ic',
      manufacturer: 'Texas Instruments',
      description: 'Dual D-type positive-edge-triggered flip-flops with clear and preset.',
      packageFootprint: 'DIP-14',
      unitCostUsd: 0.52,
      datasheetSummary: {
        voltageRange: [2.0, 6.0],
        nominalSupplyVoltage: 5.0,
        currentNominal_mA: 0.04,
        currentSurge_mA: 20,
        powerDissipationMax_mW: 500,
        operatingTempRange_C: [-40, 85],
      },
      pins: [
        { id: '1clr', name: '1CLR#', type: 'input' },
        { id: '1d', name: '1D', type: 'input' },
        { id: '1clk', name: '1CLK', type: 'input' },
        { id: '1pre', name: '1PRE#', type: 'input' },
        { id: '1q', name: '1Q', type: 'output' },
        { id: '1q_bar', name: '1Q#', type: 'output' },
        { id: 'gnd', name: 'GND (Pin 7)', type: 'ground', voltageNominal: 0.0 },
        { id: '2q_bar', name: '2Q#', type: 'output' },
        { id: '2q', name: '2Q', type: 'output' },
        { id: '2pre', name: '2PRE#', type: 'input' },
        { id: '2clk', name: '2CLK', type: 'input' },
        { id: '2d', name: '2D', type: 'input' },
        { id: '2clr', name: '2CLR#', type: 'input' },
        { id: 'vcc', name: 'VCC (Pin 14)', type: 'power', voltageNominal: 5.0 },
      ],
      aliases: ['7474', '74hc74', 'd-flip-flop'],
    });

    // -------------------------------------------------------------
    // 5. PASSIVES, DISCRETE SEMICONDUCTORS & SENSORS
    // -------------------------------------------------------------
    const registerResistor = (id: string, resistance: string, ohms: number) => {
      this.registerComponent({
        id,
        partNumber: `RES-${resistance}-0.25W`,
        displayName: `${resistance} Resistor (1/4W 1%)`,
        category: 'passive',
        manufacturer: 'Yageo / Vishay',
        description: `Metal film 1/4W 1% precision resistor (${ohms}Ω).`,
        packageFootprint: 'AXIAL-0.3',
        unitCostUsd: 0.05,
        datasheetSummary: {
          voltageRange: [0, 250],
          nominalSupplyVoltage: 0,
          currentNominal_mA: 0,
          currentSurge_mA: 0,
          powerDissipationMax_mW: 250,
          operatingTempRange_C: [-55, 155],
        },
        pins: [
          { id: 'pin1', name: 'Pin 1', type: 'passive' },
          { id: 'pin2', name: 'Pin 2', type: 'passive' },
        ],
        aliases: [`resistor-${resistance.toLowerCase()}`, `${resistance.toLowerCase()}-resistor`, `${ohms}ohm`],
      });
    };

    registerResistor('resistor-220', '220Ω', 220);
    registerResistor('resistor-330', '330Ω', 330);
    registerResistor('resistor-1k', '1kΩ', 1000);
    registerResistor('resistor-4.7k', '4.7kΩ', 4700);
    registerResistor('resistor-10k', '10kΩ', 10000);

    // Ceramic & Electrolytic Capacitors
    this.registerComponent({
      id: 'capacitor-100nf',
      partNumber: 'CAP-100NF-50V',
      displayName: '100nF (0.1µF) Ceramic Decoupling Capacitor',
      category: 'passive',
      manufacturer: 'Murata / TDK',
      description: 'High-frequency 50V MLCC ceramic capacitor for IC power supply decoupling.',
      packageFootprint: 'RADIAL-0.1',
      unitCostUsd: 0.08,
      datasheetSummary: {
        voltageRange: [0, 50],
        nominalSupplyVoltage: 0,
        currentNominal_mA: 0,
        currentSurge_mA: 0,
        powerDissipationMax_mW: 50,
        operatingTempRange_C: [-55, 125],
      },
      pins: [
        { id: 'pin1', name: 'Pin 1', type: 'passive' },
        { id: 'pin2', name: 'Pin 2', type: 'passive' },
      ],
      aliases: ['100nf', '0.1uf', 'decoupling-cap', 'ceramic-cap'],
    });

    this.registerComponent({
      id: 'capacitor-10uf',
      partNumber: 'CAP-10UF-25V',
      displayName: '10µF 25V Electrolytic Filter Capacitor',
      category: 'passive',
      manufacturer: 'Nichicon / Panasonic',
      description: 'Radial polarized aluminum electrolytic capacitor for power rail filtering.',
      packageFootprint: 'RADIAL-Can',
      unitCostUsd: 0.12,
      datasheetSummary: {
        voltageRange: [0, 25],
        nominalSupplyVoltage: 0,
        currentNominal_mA: 0,
        currentSurge_mA: 0,
        powerDissipationMax_mW: 100,
        operatingTempRange_C: [-40, 105],
      },
      pins: [
        { id: 'pos', name: 'Anode (+)', type: 'passive' },
        { id: 'neg', name: 'Cathode (-)', type: 'ground' },
      ],
      aliases: ['10uf', 'electrolytic-10uf', 'filter-cap'],
    });

    // LEDs (Red, Green, Blue)
    const registerLed = (color: string, forwardV: number, id: string) => {
      this.registerComponent({
        id,
        partNumber: `LED-5MM-${color.toUpperCase()}`,
        displayName: `5mm ${color} Diffused LED`,
        category: 'semiconductor',
        manufacturer: 'Kingbright / Lite-On',
        description: `Standard 5mm through-hole indicator LED (Vf ≈ ${forwardV}V @ 20mA).`,
        packageFootprint: 'RADIAL-5MM',
        unitCostUsd: 0.10,
        datasheetSummary: {
          voltageRange: [forwardV - 0.2, forwardV + 0.3],
          nominalSupplyVoltage: forwardV,
          currentNominal_mA: 20,
          currentSurge_mA: 30,
          powerDissipationMax_mW: 100,
          operatingTempRange_C: [-40, 85],
        },
        pins: [
          { id: 'anode', name: 'Anode (+)', type: 'passive' },
          { id: 'cathode', name: 'Cathode (-)', type: 'passive' },
        ],
        aliases: [`led-${color.toLowerCase()}`, `${color.toLowerCase()}-led`],
      });
    };

    registerLed('Red', 2.0, 'led-red');
    registerLed('Green', 2.2, 'led-green');
    registerLed('Blue', 3.2, 'led-blue');

    // 1N4007 Diode
    this.registerComponent({
      id: 'diode-1n4007',
      partNumber: '1N4007',
      displayName: '1N4007 1000V 1A Rectifier Diode',
      category: 'semiconductor',
      manufacturer: 'ON Semiconductor / Diodes Inc',
      description: 'General purpose 1A 1000V silicon rectifier diode, ideal for flyback / freewheeling protection.',
      packageFootprint: 'DO-41',
      unitCostUsd: 0.15,
      datasheetSummary: {
        voltageRange: [0, 1000],
        nominalSupplyVoltage: 0.7,
        currentNominal_mA: 1000,
        currentSurge_mA: 30000,
        powerDissipationMax_mW: 1000,
        operatingTempRange_C: [-65, 175],
      },
      pins: [
        { id: 'anode', name: 'Anode (+)', type: 'passive' },
        { id: 'cathode', name: 'Cathode (-)', type: 'passive' },
      ],
      aliases: ['1n4007', 'flyback-diode', 'rectifier-diode'],
    });

    // 2N2222 NPN BJT
    this.registerComponent({
      id: 'bjt-2n2222',
      partNumber: 'PN2222A',
      displayName: '2N2222 NPN Bipolar Junction Transistor',
      category: 'semiconductor',
      manufacturer: 'Central Semiconductor / ON Semi',
      description: 'High-speed NPN switching transistor (40V Vceo, 800mA Ic, hFE ≈ 100-300).',
      packageFootprint: 'TO-92',
      unitCostUsd: 0.20,
      datasheetSummary: {
        voltageRange: [0, 40],
        nominalSupplyVoltage: 5.0,
        currentNominal_mA: 800,
        currentSurge_mA: 1000,
        powerDissipationMax_mW: 625,
        operatingTempRange_C: [-55, 150],
      },
      pins: [
        { id: 'collector', name: 'Collector (C)', type: 'passive' },
        { id: 'base', name: 'Base (B)', type: 'input' },
        { id: 'emitter', name: 'Emitter (E)', type: 'passive' },
      ],
      aliases: ['2n2222', 'npn-transistor', '2n3904'],
    });

    // BME280 Environmental Sensor
    this.registerComponent({
      id: 'sensor-bme280',
      partNumber: 'BME280',
      displayName: 'BME280 Temperature, Humidity & Barometric Sensor',
      category: 'sensor',
      manufacturer: 'Bosch Sensortec',
      description: 'Precision digital environmental sensor with I2C/SPI interfaces (Temp ±0.5°C, Humidity ±3%, Pressure ±1 hPa).',
      packageFootprint: 'Module-6P',
      unitCostUsd: 4.80,
      datasheetSummary: {
        voltageRange: [1.8, 3.6],
        nominalSupplyVoltage: 3.3,
        currentNominal_mA: 0.5,
        currentSurge_mA: 1.0,
        powerDissipationMax_mW: 5,
        operatingTempRange_C: [-40, 85],
      },
      pins: [
        { id: 'vcc', name: 'VCC (3.3V)', type: 'power', voltageNominal: 3.3 },
        { id: 'gnd', name: 'GND', type: 'ground', voltageNominal: 0.0 },
        { id: 'scl', name: 'SCL', type: 'input', supportsI2c: true },
        { id: 'sda', name: 'SDA', type: 'io', supportsI2c: true },
      ],
      aliases: ['bme280', 'bmp280', 'barometer', 'weather-sensor'],
    });

    // MPU6050 IMU
    this.registerComponent({
      id: 'sensor-mpu6050',
      partNumber: 'MPU-6050',
      displayName: 'MPU-6050 6-Axis MotionTracking IMU (Gyro + Accel)',
      category: 'sensor',
      manufacturer: 'TDK InvenSense',
      description: 'Integrated 3-axis gyroscope and 3-axis accelerometer with onboard Digital Motion Processor (DMP).',
      packageFootprint: 'Module-8P',
      unitCostUsd: 2.90,
      datasheetSummary: {
        voltageRange: [3.0, 5.0],
        nominalSupplyVoltage: 3.3,
        currentNominal_mA: 3.9,
        currentSurge_mA: 5.0,
        powerDissipationMax_mW: 20,
        operatingTempRange_C: [-40, 85],
      },
      pins: [
        { id: 'vcc', name: 'VCC', type: 'power', voltageNominal: 3.3 },
        { id: 'gnd', name: 'GND', type: 'ground', voltageNominal: 0.0 },
        { id: 'scl', name: 'SCL', type: 'input', supportsI2c: true },
        { id: 'sda', name: 'SDA', type: 'io', supportsI2c: true },
        { id: 'xda', name: 'XDA', type: 'io' },
        { id: 'xcl', name: 'XCL', type: 'io' },
        { id: 'ad0', name: 'AD0', type: 'input' },
        { id: 'int', name: 'INT', type: 'output' },
      ],
      aliases: ['mpu6050', 'gyroscope', 'accelerometer', 'imu'],
    });

    // SSD1306 OLED Display
    this.registerComponent({
      id: 'display-ssd1306',
      partNumber: 'SSD1306-0.96',
      displayName: '0.96" I2C OLED Display (128x64)',
      category: 'display',
      manufacturer: 'Solomon Systech / Generic',
      description: 'Monochrome 128x64 dot matrix graphic display module with I2C address 0x3C.',
      packageFootprint: 'Module-4P',
      unitCostUsd: 3.50,
      datasheetSummary: {
        voltageRange: [3.3, 5.0],
        nominalSupplyVoltage: 3.3,
        currentNominal_mA: 20,
        currentSurge_mA: 35,
        powerDissipationMax_mW: 120,
        operatingTempRange_C: [-30, 70],
      },
      pins: [
        { id: 'gnd', name: 'GND', type: 'ground', voltageNominal: 0.0 },
        { id: 'vcc', name: 'VCC', type: 'power', voltageNominal: 3.3 },
        { id: 'scl', name: 'SCL', type: 'input', supportsI2c: true },
        { id: 'sda', name: 'SDA', type: 'io', supportsI2c: true },
      ],
      aliases: ['ssd1306', 'oled', 'oled-display', '128x64-oled'],
    });

    // SG90 Micro Servo
    this.registerComponent({
      id: 'servo-sg90',
      partNumber: 'SG90',
      displayName: 'TowerPro SG90 9g Micro Servo Motor',
      category: 'actuator',
      manufacturer: 'TowerPro / Generic',
      description: '180° rotation positional servo motor with gear reduction, controlled via 50Hz PWM.',
      packageFootprint: 'Module-3P Cable',
      unitCostUsd: 2.20,
      datasheetSummary: {
        voltageRange: [4.8, 6.0],
        nominalSupplyVoltage: 5.0,
        currentNominal_mA: 100,
        currentSurge_mA: 650,
        powerDissipationMax_mW: 3500,
        operatingTempRange_C: [0, 55],
      },
      pins: [
        { id: 'pwm', name: 'PWM (Signal)', type: 'input' },
        { id: 'vcc', name: 'VCC (5V)', type: 'power', voltageNominal: 5.0 },
        { id: 'gnd', name: 'GND', type: 'ground', voltageNominal: 0.0 },
      ],
      aliases: ['sg90', 'servo', 'micro-servo', 'servo-motor'],
    });

    // NE555 Precision Timer
    this.registerComponent({
      id: 'ne555-timer',
      partNumber: 'NE555P',
      displayName: 'NE555 Precision Bipolar Timer IC',
      category: 'ic',
      manufacturer: 'Texas Instruments',
      description: 'Classic precision timing circuit for accurate time delays or oscillation (monostable / astable).',
      packageFootprint: 'DIP-8',
      unitCostUsd: 0.35,
      datasheetSummary: {
        voltageRange: [4.5, 16.0],
        nominalSupplyVoltage: 5.0,
        currentNominal_mA: 3,
        currentSurge_mA: 10,
        powerDissipationMax_mW: 600,
        operatingTempRange_C: [0, 70],
      },
      pins: [
        { id: 'gnd', name: '1: GND', type: 'ground', voltageNominal: 0.0 },
        { id: 'trig', name: '2: TRIG', type: 'input' },
        { id: 'out', name: '3: OUT', type: 'output' },
        { id: 'reset', name: '4: RESET', type: 'input' },
        { id: 'ctrl', name: '5: CTRL', type: 'passive' },
        { id: 'thresh', name: '6: THRESH', type: 'input' },
        { id: 'disch', name: '7: DISCH', type: 'passive' },
        { id: 'vcc', name: '8: VCC', type: 'power', voltageNominal: 5.0 },
      ],
      aliases: ['ne555', '555-timer', 'timer-ic'],
    });

    // Piezo Buzzer & Tactile Switch
    this.registerComponent({
      id: 'buzzer-piezo',
      partNumber: 'PKM13EPYH4000',
      displayName: 'Piezoelectric Audio Buzzer 5V',
      category: 'actuator',
      manufacturer: 'Murata / Generic',
      description: 'Active 5V audio transducer generating 85dB @ 2.3kHz tone.',
      packageFootprint: 'RADIAL-2P',
      unitCostUsd: 0.40,
      datasheetSummary: {
        voltageRange: [3.0, 12.0],
        nominalSupplyVoltage: 5.0,
        currentNominal_mA: 25,
        currentSurge_mA: 40,
        powerDissipationMax_mW: 150,
        operatingTempRange_C: [-20, 70],
      },
      pins: [
        { id: 'pos', name: 'Positive (+)', type: 'input' },
        { id: 'neg', name: 'Negative (-)', type: 'ground', voltageNominal: 0.0 },
      ],
      aliases: ['buzzer', 'piezo', 'beeper'],
    });

    this.registerComponent({
      id: 'push-button-tactile',
      partNumber: 'B3F-1000',
      displayName: '6x6mm Tactile Momentary Push Button',
      category: 'passive',
      manufacturer: 'Omron',
      description: 'SPST-NO momentary mechanical switch for user inputs and trigger lines.',
      packageFootprint: 'DIP-4P',
      unitCostUsd: 0.15,
      datasheetSummary: {
        voltageRange: [0, 24],
        nominalSupplyVoltage: 0,
        currentNominal_mA: 0,
        currentSurge_mA: 50,
        powerDissipationMax_mW: 50,
        operatingTempRange_C: [-25, 70],
      },
      pins: [
        { id: 'term1', name: 'Terminal 1', type: 'passive' },
        { id: 'term2', name: 'Terminal 2', type: 'passive' },
      ],
      aliases: ['button', 'pushbutton', 'tactile-switch', 'switch'],
    });

    this.registerComponent({
      id: 'potentiometer-10k',
      partNumber: 'RK09K1130',
      displayName: '10kΩ Rotary Potentiometer (Linear B10K)',
      category: 'passive',
      manufacturer: 'Alps Alpine',
      description: 'Rotary linear taper potentiometer for analog sensor simulations and voltage dividers.',
      packageFootprint: 'PANEL-3P',
      unitCostUsd: 0.65,
      datasheetSummary: {
        voltageRange: [0, 50],
        nominalSupplyVoltage: 0,
        currentNominal_mA: 0,
        currentSurge_mA: 0,
        powerDissipationMax_mW: 100,
        operatingTempRange_C: [-10, 70],
      },
      pins: [
        { id: 'pin1', name: 'Terminal 1', type: 'passive' },
        { id: 'wiper', name: 'Wiper (Output)', type: 'analog' },
        { id: 'pin3', name: 'Terminal 2', type: 'passive' },
      ],
      aliases: ['pot', 'potentiometer', '10k-pot'],
    });

    // -------------------------------------------------------------
    // 5. ELECTRICAL PANEL & MCB DISTRIBUTION COMPONENTS
    // -------------------------------------------------------------
    const mcbRatings: Array<{ rating: number; curve: 'B' | 'C' | 'D'; poles: 1 | 2 | 3; ka: number }> = [
      { rating: 10, curve: 'B', poles: 1, ka: 6 },
      { rating: 16, curve: 'C', poles: 1, ka: 6 },
      { rating: 20, curve: 'C', poles: 1, ka: 6 },
      { rating: 32, curve: 'C', poles: 1, ka: 6 },
      { rating: 40, curve: 'C', poles: 2, ka: 10 },
      { rating: 50, curve: 'C', poles: 2, ka: 10 },
      { rating: 63, curve: 'D', poles: 3, ka: 10 },
    ];

    mcbRatings.forEach(mcb => {
      const id = `mcb-${mcb.poles}p-${mcb.rating}a-${mcb.curve.toLowerCase()}`;
      this.registerComponent({
        id,
        partNumber: `A9F74${mcb.poles}${mcb.rating}`,
        displayName: `Schneider Acti9 iC60N ${mcb.poles}P ${mcb.rating}A Curve ${mcb.curve}`,
        category: 'breaker',
        manufacturer: 'Schneider Electric / ABB',
        description: `DIN-rail miniature circuit breaker (MCB) ${mcb.poles}-Pole, ${mcb.rating}A rated, Type ${mcb.curve} magnetic trip (${mcb.curve === 'B' ? '3-5x' : mcb.curve === 'C' ? '5-10x' : '10-20x'} In).`,
        packageFootprint: `DIN-Rail ${mcb.poles * 18}mm`,
        unitCostUsd: 8.50 + mcb.poles * 4.0,
        datasheetSummary: {
          voltageRange: [110, 440],
          nominalSupplyVoltage: mcb.poles === 1 ? 230 : 400,
          currentNominal_mA: mcb.rating * 1000,
          currentSurge_mA: mcb.ka * 1000000,
          powerDissipationMax_mW: mcb.rating * 350,
          operatingTempRange_C: [-35, 70],
        },
        mcbSpecs: {
          poles: mcb.poles,
          ratedCurrentAmps: mcb.rating,
          tripCurve: mcb.curve,
          kaRating: mcb.ka,
          compatibleWireGauge: {
            minAwg: mcb.rating <= 15 ? 14 : mcb.rating <= 20 ? 12 : mcb.rating <= 30 ? 10 : 6,
            maxAwg: 2,
          },
        },
        pins: [
          { id: 'line_in', name: 'Line IN (Lug)', type: 'ac_phase' },
          { id: 'load_out', name: 'Load OUT (Terminal)', type: 'ac_phase' },
        ],
        aliases: [
          `${mcb.rating}a-mcb`,
          `${mcb.rating}a-breaker`,
          `${mcb.poles}p-${mcb.rating}a`,
        ],
      });
    });

    // Main Disconnect Breaker
    this.registerComponent({
      id: 'main-breaker-100a',
      partNumber: 'QOM2100VH',
      displayName: 'Square D / Schneider 100A Main Service Breaker',
      category: 'breaker',
      manufacturer: 'Schneider Electric',
      description: '2-Pole 100A 120/240V 22kA Interrupting Main Disconnect Circuit Breaker.',
      packageFootprint: 'Panel-Mount Modular',
      unitCostUsd: 65.00,
      datasheetSummary: {
        voltageRange: [120, 240],
        nominalSupplyVoltage: 240,
        currentNominal_mA: 100000,
        currentSurge_mA: 22000000,
        powerDissipationMax_mW: 15000,
        operatingTempRange_C: [-20, 60],
      },
      mcbSpecs: {
        poles: 2,
        ratedCurrentAmps: 100,
        tripCurve: 'C',
        kaRating: 22,
        compatibleWireGauge: { minAwg: 4, maxAwg: 0 },
      },
      pins: [
        { id: 'l1_in', name: 'Service L1 IN', type: 'ac_phase' },
        { id: 'l2_in', name: 'Service L2 IN', type: 'ac_phase' },
        { id: 'l1_bus', name: 'Busbar L1', type: 'ac_phase' },
        { id: 'l2_bus', name: 'Busbar L2', type: 'ac_phase' },
      ],
      aliases: ['100a-main', '100a-breaker', 'main-breaker'],
    });
  }
}

export const componentRegistry = new ComponentRegistryService();
