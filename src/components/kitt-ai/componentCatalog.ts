import { ComponentPin } from './types';

export interface CatalogItem {
  id: string;
  name: string;
  category: 'microcontroller' | 'sensor' | 'actuator' | 'passive' | 'semiconductor' | 'ic' | 'display' | 'power';
  description: string;
  package: 'DIP' | 'AXIAL' | 'RADIAL' | 'MODULE_HEADER' | 'TO-220' | 'DISCRETE_2PIN';
  defaultPins: ComponentPin[];
  operatingVoltage: string;
  currentDraw: string;
  color: string;
  width2D: number;
  height2D: number;
}

export const COMPONENT_CATALOG: Record<string, CatalogItem> = {
  'esp32-devkit': {
    id: 'esp32-devkit',
    name: 'ESP32-WROOM-32 DevKit',
    category: 'microcontroller',
    description: 'Dual-core 240MHz SoC with built-in Wi-Fi & Bluetooth, 36 GPIOs, 12-bit ADC.',
    package: 'MODULE_HEADER',
    operatingVoltage: '3.3V (5V via Micro-USB)',
    currentDraw: '80mA active (240mA Wi-Fi peak)',
    color: '#B4B4B4',
    width2D: 160,
    height2D: 220,
    defaultPins: [
      { id: '3v3', name: '3V3', type: 'power', voltage: 3.3, relativeX: 0, relativeY: 30 },
      { id: 'gnd_1', name: 'GND', type: 'ground', voltage: 0, relativeX: 0, relativeY: 60 },
      { id: 'gpio34', name: 'GPIO34 (ADC)', type: 'analog', relativeX: 0, relativeY: 90 },
      { id: 'gpio35', name: 'GPIO35 (ADC)', type: 'analog', relativeX: 0, relativeY: 120 },
      { id: 'gpio21', name: 'GPIO21 (SDA)', type: 'io', relativeX: 0, relativeY: 150 },
      { id: 'gpio22', name: 'GPIO22 (SCL)', type: 'io', relativeX: 0, relativeY: 180 },
      { id: 'vin_5v', name: 'VIN (5V)', type: 'power', voltage: 5.0, relativeX: 160, relativeY: 30 },
      { id: 'gnd_2', name: 'GND', type: 'ground', voltage: 0, relativeX: 160, relativeY: 60 },
      { id: 'gpio26', name: 'GPIO26 (DAC/PWM)', type: 'output', relativeX: 160, relativeY: 90 },
      { id: 'gpio27', name: 'GPIO27 (PWM)', type: 'output', relativeX: 160, relativeY: 120 },
      { id: 'gpio4', name: 'GPIO4', type: 'io', relativeX: 160, relativeY: 150 },
      { id: 'gpio2', name: 'GPIO2 (LED)', type: 'output', relativeX: 160, relativeY: 180 },
    ]
  },

  'arduino-uno': {
    id: 'arduino-uno',
    name: 'Arduino Uno R3',
    category: 'microcontroller',
    description: 'ATmega328P 8-bit AVR MCU @ 16MHz, 14 digital I/O pins, 6 analog inputs.',
    package: 'MODULE_HEADER',
    operatingVoltage: '5V (7-12V barrel jack)',
    currentDraw: '45mA',
    color: '#8F8F8F',
    width2D: 170,
    height2D: 240,
    defaultPins: [
      { id: '5v', name: '5V', type: 'power', voltage: 5.0, relativeX: 0, relativeY: 40 },
      { id: '3v3', name: '3.3V', type: 'power', voltage: 3.3, relativeX: 0, relativeY: 70 },
      { id: 'gnd_1', name: 'GND', type: 'ground', voltage: 0, relativeX: 0, relativeY: 100 },
      { id: 'a0', name: 'A0', type: 'analog', relativeX: 0, relativeY: 140 },
      { id: 'a1', name: 'A1', type: 'analog', relativeX: 0, relativeY: 170 },
      { id: 'a4_sda', name: 'A4 (SDA)', type: 'io', relativeX: 0, relativeY: 200 },
      { id: 'a5_scl', name: 'A5 (SCL)', type: 'io', relativeX: 0, relativeY: 220 },
      { id: 'd2', name: 'D2', type: 'io', relativeX: 170, relativeY: 40 },
      { id: 'd3_pwm', name: 'D3 (~PWM)', type: 'output', relativeX: 170, relativeY: 70 },
      { id: 'd9_pwm', name: 'D9 (~PWM)', type: 'output', relativeX: 170, relativeY: 100 },
      { id: 'd10_pwm', name: 'D10 (~PWM)', type: 'output', relativeX: 170, relativeY: 130 },
      { id: 'd11_mosi', name: 'D11 (MOSI)', type: 'output', relativeX: 170, relativeY: 160 },
      { id: 'd13_sck', name: 'D13 (LED)', type: 'output', relativeX: 170, relativeY: 190 },
      { id: 'gnd_2', name: 'GND', type: 'ground', voltage: 0, relativeX: 170, relativeY: 220 },
    ]
  },

  'raspberry-pi-pico': {
    id: 'raspberry-pi-pico',
    name: 'Raspberry Pi Pico (RP2040)',
    category: 'microcontroller',
    description: 'Dual ARM Cortex-M0+ @ 133MHz, 264KB SRAM, programmable I/O (PIO).',
    package: 'MODULE_HEADER',
    operatingVoltage: '3.3V',
    currentDraw: '30mA',
    color: '#F5F5F5',
    width2D: 150,
    height2D: 210,
    defaultPins: [
      { id: '3v3', name: '3V3(OUT)', type: 'power', voltage: 3.3, relativeX: 0, relativeY: 30 },
      { id: 'gnd', name: 'GND', type: 'ground', voltage: 0, relativeX: 0, relativeY: 60 },
      { id: 'gp0', name: 'GP0 (TX)', type: 'io', relativeX: 0, relativeY: 90 },
      { id: 'gp1', name: 'GP1 (RX)', type: 'io', relativeX: 0, relativeY: 120 },
      { id: 'gp26_adc', name: 'ADC0 (GP26)', type: 'analog', relativeX: 0, relativeY: 160 },
      { id: 'vbus', name: 'VBUS (5V)', type: 'power', voltage: 5.0, relativeX: 150, relativeY: 30 },
      { id: 'gp15', name: 'GP15', type: 'io', relativeX: 150, relativeY: 90 },
      { id: 'gp16', name: 'GP16', type: 'io', relativeX: 150, relativeY: 120 },
    ]
  },

  'soil-moisture-sensor': {
    id: 'soil-moisture-sensor',
    name: 'Capacitive Soil Moisture v1.2',
    category: 'sensor',
    description: 'Corrosion-free capacitive probe outputs analog voltage inverse to soil humidity.',
    package: 'MODULE_HEADER',
    operatingVoltage: '3.3V - 5.0V',
    currentDraw: '5mA',
    color: '#F5F5F5',
    width2D: 110,
    height2D: 90,
    defaultPins: [
      { id: 'vcc', name: 'VCC', type: 'power', voltage: 3.3, relativeX: 0, relativeY: 25 },
      { id: 'gnd', name: 'GND', type: 'ground', voltage: 0, relativeX: 0, relativeY: 45 },
      { id: 'aout', name: 'AOUT', type: 'output', relativeX: 110, relativeY: 35 },
    ]
  },

  'ultrasonic-hcsr04': {
    id: 'ultrasonic-hcsr04',
    name: 'HC-SR04 Ultrasonic Distance Sensor',
    category: 'sensor',
    description: 'Non-contact distance measurement from 2cm to 400cm with 3mm precision.',
    package: 'MODULE_HEADER',
    operatingVoltage: '5.0V',
    currentDraw: '15mA',
    color: '#B4B4B4',
    width2D: 130,
    height2D: 90,
    defaultPins: [
      { id: 'vcc', name: 'VCC', type: 'power', voltage: 5.0, relativeX: 0, relativeY: 25 },
      { id: 'trig', name: 'TRIG', type: 'input', relativeX: 0, relativeY: 55 },
      { id: 'echo', name: 'ECHO', type: 'output', relativeX: 130, relativeY: 35 },
      { id: 'gnd', name: 'GND', type: 'ground', voltage: 0, relativeX: 130, relativeY: 65 },
    ]
  },

  'dht22-sensor': {
    id: 'dht22-sensor',
    name: 'DHT22 Temperature & Humidity Sensor',
    category: 'sensor',
    description: 'Digital calibrated temperature (-40 to 80°C) and humidity (0-100% RH) sensor.',
    package: 'MODULE_HEADER',
    operatingVoltage: '3.3V - 5.5V',
    currentDraw: '2.5mA',
    color: '#8F8F8F',
    width2D: 110,
    height2D: 90,
    defaultPins: [
      { id: 'vcc', name: 'VCC', type: 'power', voltage: 3.3, relativeX: 0, relativeY: 25 },
      { id: 'data', name: 'DATA', type: 'io', relativeX: 110, relativeY: 35 },
      { id: 'gnd', name: 'GND', type: 'ground', voltage: 0, relativeX: 0, relativeY: 65 },
    ]
  },

  'oled-ssd1306': {
    id: 'oled-ssd1306',
    name: '0.96" I2C OLED Display (SSD1306)',
    category: 'display',
    description: '128x64 monochrome graphic display with high contrast and I2C 2-wire interface.',
    package: 'MODULE_HEADER',
    operatingVoltage: '3.3V - 5.0V',
    currentDraw: '20mA (typical)',
    color: '#CCCCCC',
    width2D: 120,
    height2D: 90,
    defaultPins: [
      { id: 'gnd', name: 'GND', type: 'ground', voltage: 0, relativeX: 0, relativeY: 20 },
      { id: 'vcc', name: 'VCC', type: 'power', voltage: 3.3, relativeX: 0, relativeY: 40 },
      { id: 'scl', name: 'SCL', type: 'input', relativeX: 0, relativeY: 60 },
      { id: 'sda', name: 'SDA', type: 'io', relativeX: 0, relativeY: 80 },
    ]
  },

  'irlz44n-mosfet': {
    id: 'irlz44n-mosfet',
    name: 'IRLZ44N Logic-Level N-Ch MOSFET',
    category: 'semiconductor',
    description: '55V 47A low Rds(on)=0.022Ω power switch driven directly by 3.3V or 5V logic.',
    package: 'TO-220',
    operatingVoltage: 'Vds max 55V, Vgs(th) 1.0-2.0V',
    currentDraw: 'Gate current < 1µA DC',
    color: '#f59e0b',
    width2D: 90,
    height2D: 80,
    defaultPins: [
      { id: 'gate', name: 'Gate (1)', type: 'input', relativeX: 0, relativeY: 40 },
      { id: 'drain', name: 'Drain (2)', type: 'passive', relativeX: 90, relativeY: 20 },
      { id: 'source', name: 'Source (3)', type: 'passive', relativeX: 90, relativeY: 60 },
    ]
  },

  'diode-1n4007': {
    id: 'diode-1n4007',
    name: '1N4007 Flyback Rectifier Diode',
    category: 'semiconductor',
    description: '1000V 1A standard rectifier for inductive spike snubbing across motors and coils.',
    package: 'AXIAL',
    operatingVoltage: '1000V Peak Reverse',
    currentDraw: '1.0A Forward Current',
    color: '#94a3b8',
    width2D: 80,
    height2D: 40,
    defaultPins: [
      { id: 'anode', name: 'Anode (+)', type: 'passive', relativeX: 0, relativeY: 20 },
      { id: 'cathode', name: 'Cathode (-)', type: 'passive', relativeX: 80, relativeY: 20 },
    ]
  },

  'pump-5v': {
    id: 'pump-5v',
    name: 'Submersible 5V DC Mini Water Pump',
    category: 'actuator',
    description: 'Brushless DC motor pump, 120 L/Hour, inductive load requiring flyback diode.',
    package: 'DISCRETE_2PIN',
    operatingVoltage: '5.0V DC',
    currentDraw: '250mA running (500mA stall)',
    color: '#8F8F8F',
    width2D: 100,
    height2D: 80,
    defaultPins: [
      { id: 'pos', name: 'V+ (Red)', type: 'power', relativeX: 0, relativeY: 25 },
      { id: 'neg', name: 'V- (Black)', type: 'passive', relativeX: 100, relativeY: 55 },
    ]
  },

  'servo-sg90': {
    id: 'servo-sg90',
    name: 'SG90 9g Micro Servo Motor',
    category: 'actuator',
    description: '180° rotation servo with gear train, PWM control (50Hz, 1ms - 2ms pulse width).',
    package: 'MODULE_HEADER',
    operatingVoltage: '4.8V - 6.0V',
    currentDraw: '100mA idle, 650mA stall',
    color: '#CCCCCC',
    width2D: 110,
    height2D: 80,
    defaultPins: [
      { id: 'pwm', name: 'PWM (Orange)', type: 'input', relativeX: 0, relativeY: 20 },
      { id: 'vcc', name: 'VCC (Red)', type: 'power', voltage: 5.0, relativeX: 0, relativeY: 40 },
      { id: 'gnd', name: 'GND (Brown)', type: 'ground', voltage: 0, relativeX: 0, relativeY: 60 },
    ]
  },

  'led-red': {
    id: 'led-red',
    name: '5mm Red Diffused LED',
    category: 'semiconductor',
    description: 'Gallium Arsenide Phosphide LED with 2.0V forward drop, 20mA nominal.',
    package: 'DISCRETE_2PIN',
    operatingVoltage: 'Vf = 1.9V - 2.1V',
    currentDraw: '15mA - 20mA',
    color: '#ef4444',
    width2D: 70,
    height2D: 50,
    defaultPins: [
      { id: 'anode', name: 'Anode (+)', type: 'passive', relativeX: 0, relativeY: 25 },
      { id: 'cathode', name: 'Cathode (-)', type: 'passive', relativeX: 70, relativeY: 25 },
    ]
  },

  'resistor-220': {
    id: 'resistor-220',
    name: '220Ω 1/4W Metal Film Resistor',
    category: 'passive',
    description: 'Current-limiting resistor for LEDs or gate protection on microcontrollers.',
    package: 'AXIAL',
    operatingVoltage: 'Max 250V',
    currentDraw: 'Passive current limiter',
    color: '#d97706',
    width2D: 70,
    height2D: 30,
    defaultPins: [
      { id: 'p1', name: '1', type: 'passive', relativeX: 0, relativeY: 15 },
      { id: 'p2', name: '2', type: 'passive', relativeX: 70, relativeY: 15 },
    ]
  },

  'resistor-10k': {
    id: 'resistor-10k',
    name: '10kΩ Pull-Up/Pull-Down Resistor',
    category: 'passive',
    description: 'Standard 10kΩ resistor for button de-bouncing, I2C pull-ups, or sensor dividers.',
    package: 'AXIAL',
    operatingVoltage: 'Max 250V',
    currentDraw: 'Passive current limiter',
    color: '#b45309',
    width2D: 70,
    height2D: 30,
    defaultPins: [
      { id: 'p1', name: '1', type: 'passive', relativeX: 0, relativeY: 15 },
      { id: 'p2', name: '2', type: 'passive', relativeX: 70, relativeY: 15 },
    ]
  },

  'ic-ne555': {
    id: 'ic-ne555',
    name: 'NE555 Precision Timer IC',
    category: 'ic',
    description: 'Industry-standard timer for astable multivibrators, PWM generators, and pulse delay.',
    package: 'DIP',
    operatingVoltage: '4.5V - 15V',
    currentDraw: '3mA - 10mA',
    color: '#B4B4B4',
    width2D: 120,
    height2D: 140,
    defaultPins: [
      { id: 'pin1_gnd', name: '1: GND', type: 'ground', voltage: 0, relativeX: 0, relativeY: 25 },
      { id: 'pin2_trig', name: '2: TRIG', type: 'input', relativeX: 0, relativeY: 55 },
      { id: 'pin3_out', name: '3: OUT', type: 'output', relativeX: 120, relativeY: 55 },
      { id: 'pin4_reset', name: '4: RESET', type: 'input', relativeX: 0, relativeY: 85 },
      { id: 'pin5_ctrl', name: '5: CTRL', type: 'passive', relativeX: 120, relativeY: 85 },
      { id: 'pin6_thresh', name: '6: THRESH', type: 'input', relativeX: 120, relativeY: 115 },
      { id: 'pin7_disch', name: '7: DISCH', type: 'passive', relativeX: 0, relativeY: 115 },
      { id: 'pin8_vcc', name: '8: VCC', type: 'power', voltage: 5.0, relativeX: 120, relativeY: 25 },
    ]
  },

  'stm32-bluepill': {
    id: 'stm32-bluepill',
    name: 'STM32F103C8T6 Blue Pill',
    category: 'microcontroller',
    description: '32-bit ARM Cortex-M3 @ 72MHz, 64KB Flash, 20KB SRAM, dual ADC.',
    package: 'MODULE_HEADER',
    operatingVoltage: '3.3V (5V tolerant)',
    currentDraw: '36mA',
    color: '#8F8F8F',
    width2D: 160,
    height2D: 220,
    defaultPins: [
      { id: '3v3', name: '3V3', type: 'power', voltage: 3.3, relativeX: 0, relativeY: 30 },
      { id: 'gnd', name: 'GND', type: 'ground', voltage: 0, relativeX: 0, relativeY: 60 },
      { id: 'pa0', name: 'PA0 (ADC1)', type: 'analog', relativeX: 0, relativeY: 90 },
      { id: 'pa1', name: 'PA1 (ADC2)', type: 'analog', relativeX: 0, relativeY: 120 },
      { id: 'pb6', name: 'PB6 (SCL)', type: 'io', relativeX: 0, relativeY: 150 },
      { id: 'pb7', name: 'PB7 (SDA)', type: 'io', relativeX: 0, relativeY: 180 },
      { id: '5v', name: '5V', type: 'power', voltage: 5.0, relativeX: 160, relativeY: 30 },
      { id: 'pa9', name: 'PA9 (TX1)', type: 'output', relativeX: 160, relativeY: 90 },
      { id: 'pa10', name: 'PA10 (RX1)', type: 'input', relativeX: 160, relativeY: 120 },
      { id: 'pc13', name: 'PC13 (LED)', type: 'output', relativeX: 160, relativeY: 150 },
    ]
  },

  'sensor-bme280': {
    id: 'sensor-bme280',
    name: 'BME280 Temp / Humidity / Pressure',
    category: 'sensor',
    description: 'High precision digital weather sensor with I2C bus (0x76/0x77).',
    package: 'MODULE_HEADER',
    operatingVoltage: '3.3V',
    currentDraw: '0.5mA',
    color: '#8F8F8F',
    width2D: 110,
    height2D: 90,
    defaultPins: [
      { id: 'vcc', name: 'VCC', type: 'power', voltage: 3.3, relativeX: 0, relativeY: 20 },
      { id: 'gnd', name: 'GND', type: 'ground', voltage: 0, relativeX: 0, relativeY: 40 },
      { id: 'scl', name: 'SCL', type: 'input', relativeX: 0, relativeY: 60 },
      { id: 'sda', name: 'SDA', type: 'io', relativeX: 0, relativeY: 80 },
    ]
  },

  'sensor-mpu6050': {
    id: 'sensor-mpu6050',
    name: 'MPU-6050 6-Axis Gyro & Accel',
    category: 'sensor',
    description: 'Triple-axis MEMS accelerometer and gyroscope with motion processing.',
    package: 'MODULE_HEADER',
    operatingVoltage: '3.3V - 5.0V',
    currentDraw: '3.9mA',
    color: '#8F8F8F',
    width2D: 120,
    height2D: 110,
    defaultPins: [
      { id: 'vcc', name: 'VCC', type: 'power', voltage: 3.3, relativeX: 0, relativeY: 20 },
      { id: 'gnd', name: 'GND', type: 'ground', voltage: 0, relativeX: 0, relativeY: 40 },
      { id: 'scl', name: 'SCL', type: 'input', relativeX: 0, relativeY: 60 },
      { id: 'sda', name: 'SDA', type: 'io', relativeX: 0, relativeY: 80 },
      { id: 'int', name: 'INT', type: 'output', relativeX: 120, relativeY: 50 },
    ]
  },

  '74hc00-nand': {
    id: '74hc00-nand',
    name: '74HC00 Quad 2-Input NAND IC',
    category: 'ic',
    description: 'Four independent 2-input positive NAND gates, DIP-14.',
    package: 'DIP',
    operatingVoltage: '2.0V - 6.0V (5.0V nominal)',
    currentDraw: '20µA quiescent',
    color: '#eab308',
    width2D: 130,
    height2D: 150,
    defaultPins: [
      { id: '1a', name: '1A', type: 'input', relativeX: 0, relativeY: 20 },
      { id: '1b', name: '1B', type: 'input', relativeX: 0, relativeY: 40 },
      { id: '1y', name: '1Y', type: 'output', relativeX: 0, relativeY: 60 },
      { id: 'gnd', name: 'GND (7)', type: 'ground', voltage: 0, relativeX: 0, relativeY: 130 },
      { id: 'vcc', name: 'VCC (14)', type: 'power', voltage: 5.0, relativeX: 130, relativeY: 20 },
      { id: '4b', name: '4B', type: 'input', relativeX: 130, relativeY: 40 },
      { id: '4a', name: '4A', type: 'input', relativeX: 130, relativeY: 60 },
      { id: '4y', name: '4Y', type: 'output', relativeX: 130, relativeY: 80 },
    ]
  },

  '74hc08-and': {
    id: '74hc08-and',
    name: '74HC08 Quad 2-Input AND IC',
    category: 'ic',
    description: 'Four independent 2-input positive AND gates, DIP-14.',
    package: 'DIP',
    operatingVoltage: '2.0V - 6.0V (5.0V nominal)',
    currentDraw: '20µA quiescent',
    color: '#eab308',
    width2D: 130,
    height2D: 150,
    defaultPins: [
      { id: '1a', name: '1A', type: 'input', relativeX: 0, relativeY: 20 },
      { id: '1b', name: '1B', type: 'input', relativeX: 0, relativeY: 40 },
      { id: '1y', name: '1Y', type: 'output', relativeX: 0, relativeY: 60 },
      { id: 'gnd', name: 'GND (7)', type: 'ground', voltage: 0, relativeX: 0, relativeY: 130 },
      { id: 'vcc', name: 'VCC (14)', type: 'power', voltage: 5.0, relativeX: 130, relativeY: 20 },
      { id: '4y', name: '4Y', type: 'output', relativeX: 130, relativeY: 80 },
    ]
  },

  '74hc04-not': {
    id: '74hc04-not',
    name: '74HC04 Hex Inverter IC',
    category: 'ic',
    description: 'Six independent logic inverters, DIP-14.',
    package: 'DIP',
    operatingVoltage: '2.0V - 6.0V (5.0V nominal)',
    currentDraw: '20µA quiescent',
    color: '#eab308',
    width2D: 130,
    height2D: 150,
    defaultPins: [
      { id: '1a', name: '1A', type: 'input', relativeX: 0, relativeY: 25 },
      { id: '1y', name: '1Y', type: 'output', relativeX: 0, relativeY: 55 },
      { id: 'gnd', name: 'GND (7)', type: 'ground', voltage: 0, relativeX: 0, relativeY: 130 },
      { id: 'vcc', name: 'VCC (14)', type: 'power', voltage: 5.0, relativeX: 130, relativeY: 25 },
      { id: '6y', name: '6Y', type: 'output', relativeX: 130, relativeY: 55 },
    ]
  },

  'bjt-2n2222': {
    id: 'bjt-2n2222',
    name: '2N2222 NPN BJT Transistor',
    category: 'semiconductor',
    description: 'High-speed 40V 800mA NPN switching transistor for driving relays, LEDs and buzzers.',
    package: 'TO-220',
    operatingVoltage: 'Vceo = 40V',
    currentDraw: 'Ic max 800mA',
    color: '#CCCCCC',
    width2D: 90,
    height2D: 80,
    defaultPins: [
      { id: 'collector', name: 'Collector (C)', type: 'passive', relativeX: 0, relativeY: 20 },
      { id: 'base', name: 'Base (B)', type: 'input', relativeX: 0, relativeY: 45 },
      { id: 'emitter', name: 'Emitter (E)', type: 'passive', relativeX: 90, relativeY: 60 },
    ]
  },

  'buzzer-piezo': {
    id: 'buzzer-piezo',
    name: '5V Piezoelectric Audio Buzzer',
    category: 'actuator',
    description: 'Active acoustic transducer generating audible sound alerts.',
    package: 'DISCRETE_2PIN',
    operatingVoltage: '3.3V - 12V',
    currentDraw: '25mA',
    color: '#8F8F8F',
    width2D: 80,
    height2D: 60,
    defaultPins: [
      { id: 'pos', name: 'Positive (+)', type: 'input', relativeX: 0, relativeY: 30 },
      { id: 'neg', name: 'Negative (-)', type: 'ground', voltage: 0, relativeX: 80, relativeY: 30 },
    ]
  },

  'push-button': {
    id: 'push-button',
    name: 'Tactile Momentary Push Button',
    category: 'passive',
    description: '6x6mm SPST tactile switch with tactile click feedback.',
    package: 'DISCRETE_2PIN',
    operatingVoltage: '0 - 24V DC',
    currentDraw: 'Passive contact',
    color: '#64748b',
    width2D: 70,
    height2D: 50,
    defaultPins: [
      { id: 'term1', name: 'Pin 1', type: 'passive', relativeX: 0, relativeY: 25 },
      { id: 'term2', name: 'Pin 2', type: 'passive', relativeX: 70, relativeY: 25 },
    ]
  },

  'potentiometer-10k': {
    id: 'potentiometer-10k',
    name: '10kΩ Rotary Potentiometer',
    category: 'passive',
    description: 'Variable voltage divider for ADC inputs and calibration.',
    package: 'MODULE_HEADER',
    operatingVoltage: '0 - 50V',
    currentDraw: 'Passive divider',
    color: '#8F8F8F',
    width2D: 90,
    height2D: 70,
    defaultPins: [
      { id: 'pin1', name: 'VCC / Rail', type: 'passive', relativeX: 0, relativeY: 20 },
      { id: 'wiper', name: 'Wiper (OUT)', type: 'analog', relativeX: 45, relativeY: 70 },
      { id: 'pin3', name: 'GND / Rail', type: 'passive', relativeX: 90, relativeY: 20 },
    ]
  },

  'capacitor-100nf': {
    id: 'capacitor-100nf',
    name: '100nF (0.1µF) Ceramic Capacitor',
    category: 'passive',
    description: 'High-speed noise bypass and decoupling capacitor for logic ICs.',
    package: 'RADIAL',
    operatingVoltage: '50V',
    currentDraw: 'Passive reactive',
    color: '#f59e0b',
    width2D: 60,
    height2D: 40,
    defaultPins: [
      { id: 'p1', name: '1', type: 'passive', relativeX: 0, relativeY: 20 },
      { id: 'p2', name: '2', type: 'passive', relativeX: 60, relativeY: 20 },
    ]
  },

  'capacitor-10uf': {
    id: 'capacitor-10uf',
    name: '10µF Electrolytic Filter Capacitor',
    category: 'passive',
    description: 'Polarized reservoir capacitor for smooth voltage rails.',
    package: 'RADIAL',
    operatingVoltage: '25V',
    currentDraw: 'Passive reactive',
    color: '#B4B4B4',
    width2D: 70,
    height2D: 50,
    defaultPins: [
      { id: 'pos', name: 'Anode (+)', type: 'passive', relativeX: 0, relativeY: 25 },
      { id: 'neg', name: 'Cathode (-)', type: 'ground', voltage: 0, relativeX: 70, relativeY: 25 },
    ]
  },

  'led-green': {
    id: 'led-green',
    name: '5mm Green Diffused LED',
    category: 'semiconductor',
    description: 'Gallium Phosphide 525nm green indicator (Vf ≈ 2.2V).',
    package: 'DISCRETE_2PIN',
    operatingVoltage: 'Vf = 2.1V - 2.4V',
    currentDraw: '15mA - 20mA',
    color: '#F5F5F5',
    width2D: 70,
    height2D: 50,
    defaultPins: [
      { id: 'anode', name: 'Anode (+)', type: 'passive', relativeX: 0, relativeY: 25 },
      { id: 'cathode', name: 'Cathode (-)', type: 'passive', relativeX: 70, relativeY: 25 },
    ]
  },

  'led-blue': {
    id: 'led-blue',
    name: '5mm Blue Diffused LED',
    category: 'semiconductor',
    description: 'Indium Gallium Nitride 470nm blue indicator (Vf ≈ 3.2V).',
    package: 'DISCRETE_2PIN',
    operatingVoltage: 'Vf = 3.0V - 3.4V',
    currentDraw: '15mA - 20mA',
    color: '#B4B4B4',
    width2D: 70,
    height2D: 50,
    defaultPins: [
      { id: 'anode', name: 'Anode (+)', type: 'passive', relativeX: 0, relativeY: 25 },
      { id: 'cathode', name: 'Cathode (-)', type: 'passive', relativeX: 70, relativeY: 25 },
    ]
  },

  'relay-module-5v': {
    id: 'relay-module-5v',
    name: '5V Optoisolated Relay Module',
    category: 'actuator',
    description: 'Electromechanical 10A SPDT relay with optocoupler driver for high voltage AC switching.',
    package: 'MODULE_HEADER',
    operatingVoltage: '5.0V Coil',
    currentDraw: '70mA energized',
    color: '#8F8F8F',
    width2D: 130,
    height2D: 100,
    defaultPins: [
      { id: 'vcc', name: 'VCC', type: 'power', voltage: 5.0, relativeX: 0, relativeY: 25 },
      { id: 'gnd', name: 'GND', type: 'ground', voltage: 0, relativeX: 0, relativeY: 50 },
      { id: 'in', name: 'IN', type: 'input', relativeX: 0, relativeY: 75 },
      { id: 'no', name: 'NO', type: 'passive', relativeX: 130, relativeY: 25 },
      { id: 'com', name: 'COM', type: 'passive', relativeX: 130, relativeY: 50 },
      { id: 'nc', name: 'NC', type: 'passive', relativeX: 130, relativeY: 75 },
    ]
  }
};
