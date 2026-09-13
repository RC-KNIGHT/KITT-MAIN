import { CIRComponent } from '../cir/cirTypes';

export interface RegistryItem extends Omit<CIRComponent, 'id' | 'schematic' | 'physical'> {
  catalogKey: string;
  recommendedOperatingConditions: {
    voltageMin_V: number;
    voltageMax_V: number;
    currentTypical_mA: number;
    tempMin_C: number;
    tempMax_C: number;
  };
  absoluteMaximumRatings: {
    voltageMax_V: number;
    currentMax_mA: number;
    powerDissipationMax_mW: number;
  };
  distributorInfo?: {
    supplier: string;
    sku: string;
    unitPrice: string;
    inStock: boolean;
  };
}

export const COMPONENT_REGISTRY: Record<string, RegistryItem> = {
  'ESP32-WROOM-32': {
    catalogKey: 'ESP32-WROOM-32',
    partNumber: 'ESP32-WROOM-32E',
    manufacturer: 'Espressif Systems',
    category: 'microcontroller',
    displayName: 'ESP32-WROOM-32 DevKit',
    package: 'MODULE_HEADER',
    isVerifiedModel: true,
    confidenceScore: 0.99,
    datasheetUrl: 'https://www.espressif.com/sites/default/files/documentation/esp32-wroom-32e_esp32-wroom-32ue_datasheet_en.pdf',
    parameters: {
      clockSpeed: '240MHz',
      flashSize: '4MB',
      sram: '520KB',
      adcResolution: '12-bit',
      wifi: '802.11 b/g/n',
      bluetooth: 'v4.2 BR/EDR and BLE'
    },
    recommendedOperatingConditions: {
      voltageMin_V: 3.0,
      voltageMax_V: 3.6,
      currentTypical_mA: 80,
      tempMin_C: -40,
      tempMax_C: 85
    },
    absoluteMaximumRatings: {
      voltageMax_V: 3.6,
      currentMax_mA: 500,
      powerDissipationMax_mW: 1500
    },
    distributorInfo: {
      supplier: 'DigiKey',
      sku: '1904-ESP32-DEVKITC-32E-ND',
      unitPrice: '$4.20',
      inStock: true
    },
    pins: [
      { id: '3v3', name: '3V3', type: 'power', voltageNominal: 3.3, voltageMax: 3.6, relativeX: 0, relativeY: 30, breadboardOffset: { col: 0, row: 0 } },
      { id: 'gnd_1', name: 'GND', type: 'ground', voltageNominal: 0, voltageMax: 0, relativeX: 0, relativeY: 60, breadboardOffset: { col: 0, row: 1 } },
      { id: 'gpio34', name: 'GPIO34 (ADC1_CH6)', type: 'analog', voltageNominal: 3.3, voltageMax: 3.3, relativeX: 0, relativeY: 90, breadboardOffset: { col: 0, row: 2 }, alternateFunctions: ['ADC1_CH6'] },
      { id: 'gpio35', name: 'GPIO35 (ADC1_CH7)', type: 'analog', voltageNominal: 3.3, voltageMax: 3.3, relativeX: 0, relativeY: 120, breadboardOffset: { col: 0, row: 3 }, alternateFunctions: ['ADC1_CH7'] },
      { id: 'gpio21', name: 'GPIO21 (SDA)', type: 'io', voltageNominal: 3.3, voltageMax: 3.3, relativeX: 0, relativeY: 150, breadboardOffset: { col: 0, row: 4 }, alternateFunctions: ['I2C_SDA'] },
      { id: 'gpio22', name: 'GPIO22 (SCL)', type: 'io', voltageNominal: 3.3, voltageMax: 3.3, relativeX: 0, relativeY: 180, breadboardOffset: { col: 0, row: 5 }, alternateFunctions: ['I2C_SCL'] },
      { id: 'vin_5v', name: 'VIN (5V)', type: 'power', voltageNominal: 5.0, voltageMax: 6.0, relativeX: 160, relativeY: 30, breadboardOffset: { col: 9, row: 0 } },
      { id: 'gnd_2', name: 'GND', type: 'ground', voltageNominal: 0, voltageMax: 0, relativeX: 160, relativeY: 60, breadboardOffset: { col: 9, row: 1 } },
      { id: 'gpio26', name: 'GPIO26 (DAC2/PWM)', type: 'output', voltageNominal: 3.3, voltageMax: 3.3, relativeX: 160, relativeY: 90, breadboardOffset: { col: 9, row: 2 }, alternateFunctions: ['DAC_2', 'PWM'] },
      { id: 'gpio27', name: 'GPIO27 (PWM)', type: 'output', voltageNominal: 3.3, voltageMax: 3.3, relativeX: 160, relativeY: 120, breadboardOffset: { col: 9, row: 3 }, alternateFunctions: ['PWM'] },
      { id: 'gpio4', name: 'GPIO4 (ADC2_CH0)', type: 'io', voltageNominal: 3.3, voltageMax: 3.3, relativeX: 160, relativeY: 150, breadboardOffset: { col: 9, row: 4 } },
      { id: 'gpio2', name: 'GPIO2 (LED)', type: 'output', voltageNominal: 3.3, voltageMax: 3.3, relativeX: 160, relativeY: 180, breadboardOffset: { col: 9, row: 5 } },
    ]
  },

  'ARDUINO-UNO-R3': {
    catalogKey: 'ARDUINO-UNO-R3',
    partNumber: 'A000066',
    manufacturer: 'Arduino LLC',
    category: 'microcontroller',
    displayName: 'Arduino Uno R3',
    package: 'MODULE_HEADER',
    isVerifiedModel: true,
    confidenceScore: 0.99,
    datasheetUrl: 'https://docs.arduino.cc/resources/datasheets/A000066-datasheet.pdf',
    parameters: {
      mcu: 'ATmega328P',
      clockSpeed: '16MHz',
      flash: '32KB',
      sram: '2KB',
      eeprom: '1KB',
      dcCurrentPerPin: '20mA'
    },
    recommendedOperatingConditions: {
      voltageMin_V: 4.5,
      voltageMax_V: 5.5,
      currentTypical_mA: 45,
      tempMin_C: -40,
      tempMax_C: 85
    },
    absoluteMaximumRatings: {
      voltageMax_V: 6.0,
      currentMax_mA: 200,
      powerDissipationMax_mW: 1000
    },
    distributorInfo: {
      supplier: 'DigiKey',
      sku: '1050-1024-ND',
      unitPrice: '$27.60',
      inStock: true
    },
    pins: [
      { id: '5v', name: '5V', type: 'power', voltageNominal: 5.0, voltageMax: 5.5, relativeX: 0, relativeY: 40, breadboardOffset: { col: 0, row: 0 } },
      { id: '3v3', name: '3.3V', type: 'power', voltageNominal: 3.3, voltageMax: 3.6, relativeX: 0, relativeY: 70, breadboardOffset: { col: 0, row: 1 } },
      { id: 'gnd_1', name: 'GND', type: 'ground', voltageNominal: 0, voltageMax: 0, relativeX: 0, relativeY: 100, breadboardOffset: { col: 0, row: 2 } },
      { id: 'a0', name: 'A0', type: 'analog', relativeX: 0, relativeY: 140, breadboardOffset: { col: 0, row: 3 } },
      { id: 'a1', name: 'A1', type: 'analog', relativeX: 0, relativeY: 170, breadboardOffset: { col: 0, row: 4 } },
      { id: 'a4_sda', name: 'A4 (SDA)', type: 'io', relativeX: 0, relativeY: 200, breadboardOffset: { col: 0, row: 5 } },
      { id: 'a5_scl', name: 'A5 (SCL)', type: 'io', relativeX: 0, relativeY: 220, breadboardOffset: { col: 0, row: 6 } },
      { id: 'd2', name: 'D2', type: 'io', relativeX: 170, relativeY: 40, breadboardOffset: { col: 9, row: 0 } },
      { id: 'd3_pwm', name: 'D3 (~PWM)', type: 'output', relativeX: 170, relativeY: 70, breadboardOffset: { col: 9, row: 1 } },
      { id: 'd9_pwm', name: 'D9 (~PWM)', type: 'output', relativeX: 170, relativeY: 100, breadboardOffset: { col: 9, row: 2 } },
      { id: 'd10_pwm', name: 'D10 (~PWM)', type: 'output', relativeX: 170, relativeY: 130, breadboardOffset: { col: 9, row: 3 } },
      { id: 'd11_mosi', name: 'D11 (MOSI)', type: 'output', relativeX: 170, relativeY: 160, breadboardOffset: { col: 9, row: 4 } },
      { id: 'd13_sck', name: 'D13 (LED)', type: 'output', relativeX: 170, relativeY: 190, breadboardOffset: { col: 9, row: 5 } },
      { id: 'gnd_2', name: 'GND', type: 'ground', voltageNominal: 0, voltageMax: 0, relativeX: 170, relativeY: 220, breadboardOffset: { col: 9, row: 6 } },
    ]
  },

  'IRLZ44N': {
    catalogKey: 'IRLZ44N',
    partNumber: 'IRLZ44NPBF',
    manufacturer: 'Infineon Technologies',
    category: 'semiconductor',
    displayName: 'IRLZ44N Logic-Level N-Ch MOSFET',
    package: 'TO-220',
    isVerifiedModel: true,
    confidenceScore: 0.98,
    datasheetUrl: 'https://www.infineon.com/dgdl/irlz44npbf.pdf?fileId=5546d462533600a4015356ec56d35299',
    parameters: {
      vds_max: '55V',
      id_max: '47A',
      rds_on: '0.022Ω',
      vgs_th: '1.0V - 2.0V'
    },
    recommendedOperatingConditions: {
      voltageMin_V: 0,
      voltageMax_V: 50,
      currentTypical_mA: 5000,
      tempMin_C: -55,
      tempMax_C: 175
    },
    absoluteMaximumRatings: {
      voltageMax_V: 55,
      currentMax_mA: 47000,
      powerDissipationMax_mW: 110000
    },
    pins: [
      { id: 'gate', name: 'Gate (1)', type: 'input', relativeX: 0, relativeY: 40, breadboardOffset: { col: 0, row: 0 } },
      { id: 'drain', name: 'Drain (2)', type: 'passive', relativeX: 90, relativeY: 20, breadboardOffset: { col: 0, row: 1 } },
      { id: 'source', name: 'Source (3)', type: 'passive', relativeX: 90, relativeY: 60, breadboardOffset: { col: 0, row: 2 } },
    ]
  },

  '1N4007': {
    catalogKey: '1N4007',
    partNumber: '1N4007-TP',
    manufacturer: 'Micro Commercial Components (MCC)',
    category: 'semiconductor',
    displayName: '1N4007 Flyback Rectifier Diode',
    package: 'AXIAL',
    isVerifiedModel: true,
    confidenceScore: 0.99,
    datasheetUrl: 'https://www.mccsemi.com/pdf/Products/1N4001-1N4007(DO-41).pdf',
    parameters: {
      vrrm: '1000V',
      if_avg: '1.0A',
      vf: '1.1V @ 1.0A'
    },
    recommendedOperatingConditions: {
      voltageMin_V: 0,
      voltageMax_V: 1000,
      currentTypical_mA: 500,
      tempMin_C: -55,
      tempMax_C: 150
    },
    absoluteMaximumRatings: {
      voltageMax_V: 1000,
      currentMax_mA: 1000,
      powerDissipationMax_mW: 3000
    },
    pins: [
      { id: 'anode', name: 'Anode (+)', type: 'passive', relativeX: 0, relativeY: 20, breadboardOffset: { col: 0, row: 0 } },
      { id: 'cathode', name: 'Cathode (-)', type: 'passive', relativeX: 80, relativeY: 20, breadboardOffset: { col: 0, row: 2 } },
    ]
  },

  'DHT22': {
    catalogKey: 'DHT22',
    partNumber: 'AM2302',
    manufacturer: 'Aosong Electronics',
    category: 'sensor',
    displayName: 'DHT22 Digital Temperature & Humidity Sensor',
    package: 'MODULE_HEADER',
    isVerifiedModel: true,
    confidenceScore: 0.97,
    datasheetUrl: 'https://www.sparkfun.com/datasheets/Sensors/Temperature/DHT22.pdf',
    parameters: {
      tempRange: '-40 to 80°C (±0.5°C)',
      humidityRange: '0-100% RH (±2% RH)',
      samplingPeriod: '2 seconds',
      protocol: '1-Wire Digital'
    },
    recommendedOperatingConditions: {
      voltageMin_V: 3.3,
      voltageMax_V: 5.5,
      currentTypical_mA: 2.5,
      tempMin_C: -40,
      tempMax_C: 80
    },
    absoluteMaximumRatings: {
      voltageMax_V: 6.0,
      currentMax_mA: 5.0,
      powerDissipationMax_mW: 30
    },
    pins: [
      { id: 'vcc', name: 'VCC', type: 'power', voltageNominal: 3.3, voltageMax: 5.5, relativeX: 0, relativeY: 25, breadboardOffset: { col: 0, row: 0 } },
      { id: 'data', name: 'DATA', type: 'io', relativeX: 110, relativeY: 35, breadboardOffset: { col: 0, row: 1 } },
      { id: 'gnd', name: 'GND', type: 'ground', voltageNominal: 0, voltageMax: 0, relativeX: 0, relativeY: 65, breadboardOffset: { col: 0, row: 2 } },
    ]
  },

  'SSD1306-OLED': {
    catalogKey: 'SSD1306-OLED',
    partNumber: 'SSD1306-0.96-I2C',
    manufacturer: 'Solomon Systech',
    category: 'display',
    displayName: '0.96" 128x64 I2C OLED Display',
    package: 'MODULE_HEADER',
    isVerifiedModel: true,
    confidenceScore: 0.98,
    datasheetUrl: 'https://cdn-shop.adafruit.com/datasheets/SSD1306.pdf',
    parameters: {
      resolution: '128x64 pixels',
      i2cAddress: '0x3C / 0x3D',
      color: 'Monochrome White / Light Blue',
      viewAngle: '> 160 degrees'
    },
    recommendedOperatingConditions: {
      voltageMin_V: 3.3,
      voltageMax_V: 5.0,
      currentTypical_mA: 20,
      tempMin_C: -30,
      tempMax_C: 70
    },
    absoluteMaximumRatings: {
      voltageMax_V: 5.5,
      currentMax_mA: 40,
      powerDissipationMax_mW: 200
    },
    pins: [
      { id: 'gnd', name: 'GND', type: 'ground', voltageNominal: 0, voltageMax: 0, relativeX: 0, relativeY: 20, breadboardOffset: { col: 0, row: 0 } },
      { id: 'vcc', name: 'VCC', type: 'power', voltageNominal: 3.3, voltageMax: 5.0, relativeX: 0, relativeY: 40, breadboardOffset: { col: 0, row: 1 } },
      { id: 'scl', name: 'SCL', type: 'input', relativeX: 0, relativeY: 60, breadboardOffset: { col: 0, row: 2 } },
      { id: 'sda', name: 'SDA', type: 'io', relativeX: 0, relativeY: 80, breadboardOffset: { col: 0, row: 3 } },
    ]
  },

  'HC-SR04': {
    catalogKey: 'HC-SR04',
    partNumber: 'HC-SR04',
    manufacturer: 'ElecFreaks / Generic',
    category: 'sensor',
    displayName: 'HC-SR04 Ultrasonic Distance Sensor',
    package: 'MODULE_HEADER',
    isVerifiedModel: true,
    confidenceScore: 0.98,
    parameters: {
      range: '2cm - 400cm',
      accuracy: '3mm',
      operatingVoltage: '5V DC',
      frequency: '40kHz'
    },
    recommendedOperatingConditions: {
      voltageMin_V: 4.5,
      voltageMax_V: 5.5,
      currentTypical_mA: 15,
      tempMin_C: -15,
      tempMax_C: 70
    },
    absoluteMaximumRatings: {
      voltageMax_V: 5.5,
      currentMax_mA: 20,
      powerDissipationMax_mW: 100
    },
    pins: [
      { id: 'vcc', name: 'VCC', type: 'power', voltageNominal: 5.0, voltageMax: 5.5, relativeX: 0, relativeY: 25, breadboardOffset: { col: 0, row: 0 } },
      { id: 'trig', name: 'TRIG', type: 'input', voltageNominal: 5.0, voltageMax: 5.5, relativeX: 0, relativeY: 50, breadboardOffset: { col: 0, row: 1 } },
      { id: 'echo', name: 'ECHO', type: 'output', voltageNominal: 5.0, voltageMax: 5.5, relativeX: 0, relativeY: 75, breadboardOffset: { col: 0, row: 2 } },
      { id: 'gnd', name: 'GND', type: 'ground', voltageNominal: 0, voltageMax: 0, relativeX: 0, relativeY: 100, breadboardOffset: { col: 0, row: 3 } }
    ]
  },

  'SG90-SERVO': {
    catalogKey: 'SG90-SERVO',
    partNumber: 'TowerPro-SG90',
    manufacturer: 'TowerPro',
    category: 'actuator',
    displayName: 'SG90 9g Micro Servo Motor',
    package: 'MODULE_HEADER',
    isVerifiedModel: true,
    confidenceScore: 0.97,
    parameters: {
      rotationAngle: '180°',
      stallTorque: '1.8 kg/cm (at 4.8V)',
      operatingSpeed: '0.1s / 60 degrees',
      pwmFrequency: '50Hz'
    },
    recommendedOperatingConditions: {
      voltageMin_V: 4.8,
      voltageMax_V: 6.0,
      currentTypical_mA: 100,
      tempMin_C: 0,
      tempMax_C: 55
    },
    absoluteMaximumRatings: {
      voltageMax_V: 6.5,
      currentMax_mA: 650,
      powerDissipationMax_mW: 3500
    },
    pins: [
      { id: 'pwm', name: 'PWM (Orange)', type: 'input', voltageNominal: 5.0, voltageMax: 5.5, relativeX: 0, relativeY: 25, breadboardOffset: { col: 0, row: 0 } },
      { id: 'vcc', name: 'VCC (Red)', type: 'power', voltageNominal: 5.0, voltageMax: 6.0, relativeX: 0, relativeY: 50, breadboardOffset: { col: 0, row: 1 } },
      { id: 'gnd', name: 'GND (Brown)', type: 'ground', voltageNominal: 0, voltageMax: 0, relativeX: 0, relativeY: 75, breadboardOffset: { col: 0, row: 2 } }
    ]
  },

  'BUZZER-ACTIVE': {
    catalogKey: 'BUZZER-ACTIVE',
    partNumber: 'TMB12A05',
    manufacturer: 'Generic Piezo',
    category: 'actuator',
    displayName: 'Active 5V/3.3V Piezo Buzzer',
    package: 'RADIAL',
    isVerifiedModel: true,
    confidenceScore: 0.99,
    parameters: {
      soundPressure: '85dB at 10cm',
      resonantFrequency: '2300Hz',
      operatingVoltage: '3.3V - 5V'
    },
    recommendedOperatingConditions: {
      voltageMin_V: 3.0,
      voltageMax_V: 5.5,
      currentTypical_mA: 25,
      tempMin_C: -20,
      tempMax_C: 70
    },
    absoluteMaximumRatings: {
      voltageMax_V: 6.0,
      currentMax_mA: 35,
      powerDissipationMax_mW: 150
    },
    pins: [
      { id: 'pos', name: '+ (Anode)', type: 'passive', voltageNominal: 3.3, voltageMax: 5.5, relativeX: 0, relativeY: 25, breadboardOffset: { col: 0, row: 0 } },
      { id: 'neg', name: '- (Cathode)', type: 'ground', voltageNominal: 0, voltageMax: 0, relativeX: 0, relativeY: 60, breadboardOffset: { col: 0, row: 2 } }
    ]
  },

  'LED-RED': {
    catalogKey: 'LED-RED',
    partNumber: 'L-53HD',
    manufacturer: 'Kingbright',
    category: 'semiconductor',
    displayName: 'Red 5mm Indicator LED',
    package: 'RADIAL',
    isVerifiedModel: true,
    confidenceScore: 1.0,
    parameters: {
      forwardVoltage: '2.0V',
      forwardCurrent: '20mA',
      wavelength: '625nm'
    },
    recommendedOperatingConditions: {
      voltageMin_V: 1.8,
      voltageMax_V: 2.2,
      currentTypical_mA: 15,
      tempMin_C: -40,
      tempMax_C: 85
    },
    absoluteMaximumRatings: {
      voltageMax_V: 2.5,
      currentMax_mA: 30,
      powerDissipationMax_mW: 75
    },
    pins: [
      { id: 'anode', name: 'Anode (+)', type: 'passive', voltageNominal: 2.0, voltageMax: 2.5, relativeX: 0, relativeY: 20, breadboardOffset: { col: 0, row: 0 } },
      { id: 'cathode', name: 'Cathode (-)', type: 'passive', voltageNominal: 0, voltageMax: 0, relativeX: 70, relativeY: 20, breadboardOffset: { col: 0, row: 1 } }
    ]
  },

  'LED-GREEN': {
    catalogKey: 'LED-GREEN',
    partNumber: 'L-53GD',
    manufacturer: 'Kingbright',
    category: 'semiconductor',
    displayName: 'Green 5mm Indicator LED',
    package: 'RADIAL',
    isVerifiedModel: true,
    confidenceScore: 1.0,
    parameters: {
      forwardVoltage: '3.0V',
      forwardCurrent: '20mA',
      wavelength: '525nm'
    },
    recommendedOperatingConditions: {
      voltageMin_V: 2.8,
      voltageMax_V: 3.3,
      currentTypical_mA: 15,
      tempMin_C: -40,
      tempMax_C: 85
    },
    absoluteMaximumRatings: {
      voltageMax_V: 3.6,
      currentMax_mA: 30,
      powerDissipationMax_mW: 100
    },
    pins: [
      { id: 'anode', name: 'Anode (+)', type: 'passive', voltageNominal: 3.0, voltageMax: 3.5, relativeX: 0, relativeY: 20, breadboardOffset: { col: 0, row: 0 } },
      { id: 'cathode', name: 'Cathode (-)', type: 'passive', voltageNominal: 0, voltageMax: 0, relativeX: 70, relativeY: 20, breadboardOffset: { col: 0, row: 1 } }
    ]
  },

  'LED-YELLOW': {
    catalogKey: 'LED-YELLOW',
    partNumber: 'L-53YD',
    manufacturer: 'Kingbright',
    category: 'semiconductor',
    displayName: 'Amber Yellow 5mm LED',
    package: 'RADIAL',
    isVerifiedModel: true,
    confidenceScore: 1.0,
    parameters: {
      forwardVoltage: '2.1V',
      forwardCurrent: '20mA',
      wavelength: '588nm'
    },
    recommendedOperatingConditions: {
      voltageMin_V: 1.9,
      voltageMax_V: 2.3,
      currentTypical_mA: 15,
      tempMin_C: -40,
      tempMax_C: 85
    },
    absoluteMaximumRatings: {
      voltageMax_V: 2.6,
      currentMax_mA: 30,
      powerDissipationMax_mW: 80
    },
    pins: [
      { id: 'anode', name: 'Anode (+)', type: 'passive', voltageNominal: 2.1, voltageMax: 2.5, relativeX: 0, relativeY: 20, breadboardOffset: { col: 0, row: 0 } },
      { id: 'cathode', name: 'Cathode (-)', type: 'passive', voltageNominal: 0, voltageMax: 0, relativeX: 70, relativeY: 20, breadboardOffset: { col: 0, row: 1 } }
    ]
  },

  'NE555': {
    catalogKey: 'NE555',
    partNumber: 'NE555P',
    manufacturer: 'Texas Instruments',
    category: 'ic',
    displayName: 'NE555 Precision Timer IC',
    package: 'DIP',
    isVerifiedModel: true,
    confidenceScore: 0.99,
    parameters: {
      maxFrequency: '500kHz',
      supplyVoltage: '4.5V - 16V',
      timingRange: 'Microseconds to Hours'
    },
    recommendedOperatingConditions: {
      voltageMin_V: 4.5,
      voltageMax_V: 15.0,
      currentTypical_mA: 10,
      tempMin_C: 0,
      tempMax_C: 70
    },
    absoluteMaximumRatings: {
      voltageMax_V: 18.0,
      currentMax_mA: 200,
      powerDissipationMax_mW: 600
    },
    pins: [
      { id: 'gnd', name: 'GND (1)', type: 'ground', voltageNominal: 0, voltageMax: 0, relativeX: 0, relativeY: 25, breadboardOffset: { col: 0, row: 0 } },
      { id: 'trig', name: 'TRIG (2)', type: 'input', voltageNominal: 3.0, voltageMax: 15, relativeX: 0, relativeY: 50, breadboardOffset: { col: 0, row: 1 } },
      { id: 'out', name: 'OUT (3)', type: 'output', voltageNominal: 5.0, voltageMax: 15, relativeX: 0, relativeY: 75, breadboardOffset: { col: 0, row: 2 } },
      { id: 'reset', name: 'RESET (4)', type: 'input', voltageNominal: 5.0, voltageMax: 15, relativeX: 0, relativeY: 100, breadboardOffset: { col: 0, row: 3 } },
      { id: 'ctrl', name: 'CTRL (5)', type: 'passive', voltageNominal: 3.3, voltageMax: 15, relativeX: 120, relativeY: 100, breadboardOffset: { col: 5, row: 3 } },
      { id: 'thresh', name: 'THRESH (6)', type: 'input', voltageNominal: 3.3, voltageMax: 15, relativeX: 120, relativeY: 75, breadboardOffset: { col: 5, row: 2 } },
      { id: 'disch', name: 'DISCH (7)', type: 'passive', voltageNominal: 5.0, voltageMax: 15, relativeX: 120, relativeY: 50, breadboardOffset: { col: 5, row: 1 } },
      { id: 'vcc', name: 'VCC (8)', type: 'power', voltageNominal: 5.0, voltageMax: 15, relativeX: 120, relativeY: 25, breadboardOffset: { col: 5, row: 0 } },
    ]
  },

  'PUSHBUTTON': {
    catalogKey: 'PUSHBUTTON',
    partNumber: 'SW-TACT-6MM',
    manufacturer: 'Omron / Generic',
    category: 'passive',
    displayName: '6mm Momentary Tactile Switch',
    package: 'MODULE_HEADER',
    isVerifiedModel: true,
    confidenceScore: 1.0,
    parameters: {
      type: 'SPST-NO',
      rating: '50mA @ 12V DC',
      travel: '0.25mm'
    },
    recommendedOperatingConditions: {
      voltageMin_V: 0,
      voltageMax_V: 12,
      currentTypical_mA: 10,
      tempMin_C: -20,
      tempMax_C: 70
    },
    absoluteMaximumRatings: {
      voltageMax_V: 24,
      currentMax_mA: 100,
      powerDissipationMax_mW: 250
    },
    pins: [
      { id: 'p1', name: 'Terminal 1', type: 'passive', relativeX: 0, relativeY: 20, breadboardOffset: { col: 0, row: 0 } },
      { id: 'p2', name: 'Terminal 2', type: 'passive', relativeX: 60, relativeY: 20, breadboardOffset: { col: 0, row: 2 } }
    ]
  },

  'LDR-SENSOR': {
    catalogKey: 'LDR-SENSOR',
    partNumber: 'GL5528-MOD',
    manufacturer: 'Generic / Adafruit',
    category: 'sensor',
    displayName: 'Photoresistor / LDR Ambient Light Sensor',
    package: 'MODULE_HEADER',
    isVerifiedModel: true,
    confidenceScore: 0.98,
    parameters: { darkResistance: '1MΩ', lightResistance: '10kΩ-20kΩ', peakWavelength: '540nm' },
    recommendedOperatingConditions: { voltageMin_V: 3.3, voltageMax_V: 5.0, currentTypical_mA: 1.0, tempMin_C: -30, tempMax_C: 70 },
    absoluteMaximumRatings: { voltageMax_V: 6.0, currentMax_mA: 10, powerDissipationMax_mW: 100 },
    pins: [
      { id: 'vcc', name: 'VCC', type: 'power', voltageNominal: 5.0, voltageMax: 5.5, relativeX: 0, relativeY: 25, breadboardOffset: { col: 0, row: 0 } },
      { id: 'gnd', name: 'GND', type: 'ground', voltageNominal: 0, voltageMax: 0, relativeX: 0, relativeY: 55, breadboardOffset: { col: 0, row: 1 } },
      { id: 'aout', name: 'AOUT', type: 'analog', relativeX: 90, relativeY: 40, breadboardOffset: { col: 0, row: 2 } },
    ]
  },

  'POTENTIOMETER-10K': {
    catalogKey: 'POTENTIOMETER-10K',
    partNumber: 'WH148-10K',
    manufacturer: 'Bourns / Generic',
    category: 'passive',
    displayName: '10kΩ Linear Rotary Potentiometer',
    package: 'MODULE_HEADER',
    isVerifiedModel: true,
    confidenceScore: 0.99,
    parameters: { resistance: '10kΩ', taper: 'Linear (B)', rotation: '300°' },
    recommendedOperatingConditions: { voltageMin_V: 0, voltageMax_V: 5.0, currentTypical_mA: 0.5, tempMin_C: -10, tempMax_C: 70 },
    absoluteMaximumRatings: { voltageMax_V: 12.0, currentMax_mA: 20, powerDissipationMax_mW: 200 },
    pins: [
      { id: 'p1', name: 'Terminal 1 (VCC)', type: 'power', relativeX: 0, relativeY: 25, breadboardOffset: { col: 0, row: 0 } },
      { id: 'wiper', name: 'Wiper (OUT)', type: 'analog', relativeX: 80, relativeY: 40, breadboardOffset: { col: 0, row: 1 } },
      { id: 'p2', name: 'Terminal 2 (GND)', type: 'ground', relativeX: 0, relativeY: 55, breadboardOffset: { col: 0, row: 2 } },
    ]
  },

  'PIR-MOTION': {
    catalogKey: 'PIR-MOTION',
    partNumber: 'HC-SR501',
    manufacturer: 'Generic / Kuongshun',
    category: 'sensor',
    displayName: 'HC-SR501 Passive Infrared (PIR) Motion Sensor',
    package: 'MODULE_HEADER',
    isVerifiedModel: true,
    confidenceScore: 0.96,
    parameters: { range: '7m (120°)', delayTime: '5s - 200s', triggerType: 'Repeatable (H)' },
    recommendedOperatingConditions: { voltageMin_V: 4.5, voltageMax_V: 12.0, currentTypical_mA: 0.05, tempMin_C: -15, tempMax_C: 70 },
    absoluteMaximumRatings: { voltageMax_V: 20.0, currentMax_mA: 15, powerDissipationMax_mW: 150 },
    pins: [
      { id: 'vcc', name: 'VCC (5V)', type: 'power', voltageNominal: 5.0, voltageMax: 12.0, relativeX: 0, relativeY: 25, breadboardOffset: { col: 0, row: 0 } },
      { id: 'out', name: 'OUT (3.3V)', type: 'output', voltageNominal: 3.3, voltageMax: 3.3, relativeX: 100, relativeY: 40, breadboardOffset: { col: 0, row: 1 } },
      { id: 'gnd', name: 'GND', type: 'ground', voltageNominal: 0, voltageMax: 0, relativeX: 0, relativeY: 55, breadboardOffset: { col: 0, row: 2 } },
    ]
  },

  'RELAY-5V-1CH': {
    catalogKey: 'RELAY-5V-1CH',
    partNumber: 'SRD-05VDC-SL-C-MOD',
    manufacturer: 'Songle / Generic',
    category: 'actuator',
    displayName: '5V Optocoupled 1-Channel Relay Module',
    package: 'MODULE_HEADER',
    isVerifiedModel: true,
    confidenceScore: 0.98,
    parameters: { coilVoltage: '5V DC', contactRating: '10A 250VAC / 10A 30VDC', triggerLevel: 'Active LOW' },
    recommendedOperatingConditions: { voltageMin_V: 4.5, voltageMax_V: 5.5, currentTypical_mA: 70, tempMin_C: -25, tempMax_C: 70 },
    absoluteMaximumRatings: { voltageMax_V: 6.0, currentMax_mA: 100, powerDissipationMax_mW: 500 },
    pins: [
      { id: 'vcc', name: 'VCC', type: 'power', voltageNominal: 5.0, voltageMax: 5.5, relativeX: 0, relativeY: 25, breadboardOffset: { col: 0, row: 0 } },
      { id: 'in', name: 'IN', type: 'input', voltageNominal: 3.3, voltageMax: 5.0, relativeX: 0, relativeY: 50, breadboardOffset: { col: 0, row: 1 } },
      { id: 'gnd', name: 'GND', type: 'ground', voltageNominal: 0, voltageMax: 0, relativeX: 0, relativeY: 75, breadboardOffset: { col: 0, row: 2 } },
      { id: 'no', name: 'NO (Switched)', type: 'passive', relativeX: 120, relativeY: 30, breadboardOffset: { col: 5, row: 0 } },
      { id: 'com', name: 'COM (Common)', type: 'passive', relativeX: 120, relativeY: 55, breadboardOffset: { col: 5, row: 1 } },
    ]
  },

  'MOTOR-DC-5V': {
    catalogKey: 'MOTOR-DC-5V',
    partNumber: 'MTR-DC-130',
    manufacturer: 'Mabuchi / Generic',
    category: 'actuator',
    displayName: '5V Miniature Coreless DC Motor',
    package: 'MODULE_HEADER',
    isVerifiedModel: true,
    confidenceScore: 0.95,
    parameters: { rpm: '9000 RPM @ 5V', stallCurrent: '800mA', noLoadCurrent: '70mA' },
    recommendedOperatingConditions: { voltageMin_V: 3.0, voltageMax_V: 6.0, currentTypical_mA: 200, tempMin_C: -10, tempMax_C: 60 },
    absoluteMaximumRatings: { voltageMax_V: 7.0, currentMax_mA: 1000, powerDissipationMax_mW: 2500 },
    pins: [
      { id: 'pos', name: 'Positive (+)', type: 'passive', relativeX: 0, relativeY: 30, breadboardOffset: { col: 0, row: 0 } },
      { id: 'neg', name: 'Negative (-)', type: 'passive', relativeX: 70, relativeY: 30, breadboardOffset: { col: 0, row: 2 } },
    ]
  },

  'LED-BLUE': {
    catalogKey: 'LED-BLUE',
    partNumber: 'WP7113QBC/D',
    manufacturer: 'Kingbright',
    category: 'semiconductor',
    displayName: '5mm High-Intensity Blue Indicator LED',
    package: 'RADIAL',
    isVerifiedModel: true,
    confidenceScore: 1.0,
    parameters: { forwardVoltage: '3.2V', forwardCurrent: '20mA', wavelength: '465nm', luminousIntensity: '2500mcd' },
    recommendedOperatingConditions: { voltageMin_V: 2.8, voltageMax_V: 3.4, currentTypical_mA: 15, tempMin_C: -40, tempMax_C: 85 },
    absoluteMaximumRatings: { voltageMax_V: 4.0, currentMax_mA: 30, powerDissipationMax_mW: 120 },
    pins: [
      { id: 'anode', name: 'Anode (+)', type: 'passive', relativeX: 0, relativeY: 30, breadboardOffset: { col: 0, row: 0 } },
      { id: 'cathode', name: 'Cathode (-)', type: 'passive', relativeX: 60, relativeY: 30, breadboardOffset: { col: 0, row: 1 } },
    ]
  },

  'TMP36': {
    catalogKey: 'TMP36',
    partNumber: 'TMP36GT9Z',
    manufacturer: 'Analog Devices',
    category: 'sensor',
    displayName: 'TMP36 Precision Analog Temperature Sensor',
    package: 'MODULE_HEADER',
    isVerifiedModel: true,
    confidenceScore: 0.98,
    parameters: { scaleFactor: '10mV/°C', offsetVoltage: '500mV @ 0°C', accuracy: '±2°C' },
    recommendedOperatingConditions: { voltageMin_V: 2.7, voltageMax_V: 5.5, currentTypical_mA: 0.05, tempMin_C: -40, tempMax_C: 125 },
    absoluteMaximumRatings: { voltageMax_V: 7.0, currentMax_mA: 5, powerDissipationMax_mW: 50 },
    pins: [
      { id: 'vcc', name: 'Vs (VCC)', type: 'power', voltageNominal: 5.0, voltageMax: 5.5, relativeX: 0, relativeY: 25, breadboardOffset: { col: 0, row: 0 } },
      { id: 'vout', name: 'Vout (Analog)', type: 'analog', relativeX: 80, relativeY: 40, breadboardOffset: { col: 0, row: 1 } },
      { id: 'gnd', name: 'GND', type: 'ground', voltageNominal: 0, voltageMax: 0, relativeX: 0, relativeY: 55, breadboardOffset: { col: 0, row: 2 } },
    ]
  },

  'MF-0.25W-1K': {
    catalogKey: 'MF-0.25W-1K',
    partNumber: 'MFR-25FRF52-1K',
    manufacturer: 'Yageo',
    category: 'passive',
    displayName: '1kΩ Metal Film Resistor',
    package: 'AXIAL',
    isVerifiedModel: true,
    confidenceScore: 1.0,
    parameters: { resistance: '1kΩ', tolerance: '1%', wattage: '0.25W' },
    recommendedOperatingConditions: { voltageMin_V: 0, voltageMax_V: 250, currentTypical_mA: 5, tempMin_C: -55, tempMax_C: 155 },
    absoluteMaximumRatings: { voltageMax_V: 250, currentMax_mA: 15, powerDissipationMax_mW: 250 },
    pins: [
      { id: 'p1', name: '1', type: 'passive', relativeX: 0, relativeY: 15 },
      { id: 'p2', name: '2', type: 'passive', relativeX: 70, relativeY: 15 },
    ]
  },

  'MF-0.25W-220R': {
    catalogKey: 'MF-0.25W-220R',
    partNumber: 'MFR-25FRF52-220R',
    manufacturer: 'Yageo',
    category: 'passive',
    displayName: '220Ω Metal Film Resistor',
    package: 'AXIAL',
    isVerifiedModel: true,
    confidenceScore: 1.0,
    parameters: { resistance: '220Ω', tolerance: '1%', wattage: '0.25W' },
    recommendedOperatingConditions: { voltageMin_V: 0, voltageMax_V: 250, currentTypical_mA: 20, tempMin_C: -55, tempMax_C: 155 },
    absoluteMaximumRatings: { voltageMax_V: 250, currentMax_mA: 35, powerDissipationMax_mW: 250 },
    pins: [
      { id: 'p1', name: '1', type: 'passive', relativeX: 0, relativeY: 15 },
      { id: 'p2', name: '2', type: 'passive', relativeX: 70, relativeY: 15 },
    ]
  },

  'MF-0.25W-330R': {
    catalogKey: 'MF-0.25W-330R',
    partNumber: 'MFR-25FRF52-330R',
    manufacturer: 'Yageo',
    category: 'passive',
    displayName: '330Ω Metal Film Resistor',
    package: 'AXIAL',
    isVerifiedModel: true,
    confidenceScore: 1.0,
    parameters: { resistance: '330Ω', tolerance: '1%', wattage: '0.25W' },
    recommendedOperatingConditions: { voltageMin_V: 0, voltageMax_V: 250, currentTypical_mA: 15, tempMin_C: -55, tempMax_C: 155 },
    absoluteMaximumRatings: { voltageMax_V: 250, currentMax_mA: 30, powerDissipationMax_mW: 250 },
    pins: [
      { id: 'p1', name: '1', type: 'passive', relativeX: 0, relativeY: 15 },
      { id: 'p2', name: '2', type: 'passive', relativeX: 70, relativeY: 15 },
    ]
  },

  'MF-0.25W-10K': {
    catalogKey: 'MF-0.25W-10K',
    partNumber: 'MFR-25FRF52-10K',
    manufacturer: 'Yageo',
    category: 'passive',
    displayName: '10kΩ Metal Film Resistor',
    package: 'AXIAL',
    isVerifiedModel: true,
    confidenceScore: 1.0,
    parameters: { resistance: '10kΩ', tolerance: '1%', wattage: '0.25W' },
    recommendedOperatingConditions: { voltageMin_V: 0, voltageMax_V: 250, currentTypical_mA: 0.5, tempMin_C: -55, tempMax_C: 155 },
    absoluteMaximumRatings: { voltageMax_V: 250, currentMax_mA: 5, powerDissipationMax_mW: 250 },
    pins: [
      { id: 'p1', name: '1', type: 'passive', relativeX: 0, relativeY: 15 },
      { id: 'p2', name: '2', type: 'passive', relativeX: 70, relativeY: 15 },
    ]
  },

  'CAP-100NF-CERAMIC': {
    catalogKey: 'CAP-100NF-CERAMIC',
    partNumber: 'K104K15X7RF53L2',
    manufacturer: 'Vishay',
    category: 'passive',
    displayName: '100nF (0.1µF) Ceramic Decoupling Capacitor',
    package: 'RADIAL',
    isVerifiedModel: true,
    confidenceScore: 1.0,
    parameters: { capacitance: '100nF', voltageRating: '50V', dielectric: 'X7R' },
    recommendedOperatingConditions: { voltageMin_V: 0, voltageMax_V: 50, currentTypical_mA: 0, tempMin_C: -55, tempMax_C: 125 },
    absoluteMaximumRatings: { voltageMax_V: 50, currentMax_mA: 100, powerDissipationMax_mW: 100 },
    pins: [
      { id: 'p1', name: '1', type: 'passive', relativeX: 0, relativeY: 20 },
      { id: 'p2', name: '2', type: 'passive', relativeX: 60, relativeY: 20 },
    ]
  },

  'CAP-10UF-ELECTROLYTIC': {
    catalogKey: 'CAP-10UF-ELECTROLYTIC',
    partNumber: 'UVR1H100MDD',
    manufacturer: 'Nichicon',
    category: 'passive',
    displayName: '10µF 50V Low-ESR Electrolytic Filter Capacitor',
    package: 'RADIAL',
    isVerifiedModel: true,
    confidenceScore: 1.0,
    parameters: { capacitance: '10µF', voltageRating: '50V', esr: '0.45Ω' },
    recommendedOperatingConditions: { voltageMin_V: 0, voltageMax_V: 50, currentTypical_mA: 0, tempMin_C: -40, tempMax_C: 105 },
    absoluteMaximumRatings: { voltageMax_V: 63, currentMax_mA: 250, powerDissipationMax_mW: 200 },
    pins: [
      { id: 'anode', name: '+ (Anode)', type: 'passive', relativeX: 0, relativeY: 20 },
      { id: 'cathode', name: '- (Cathode)', type: 'passive', relativeX: 60, relativeY: 20 },
    ]
  },

  'RP2040-PICO': {
    catalogKey: 'RP2040-PICO',
    partNumber: 'SC0915',
    manufacturer: 'Raspberry Pi Ltd',
    category: 'microcontroller',
    displayName: 'Raspberry Pi Pico (RP2040 Dual Cortex-M0+)',
    package: 'MODULE_HEADER',
    isVerifiedModel: true,
    confidenceScore: 0.99,
    datasheetUrl: 'https://datasheets.raspberrypi.com/pico/pico-datasheet.pdf',
    parameters: {
      core: 'Dual ARM Cortex-M0+',
      clockSpeed: '133MHz',
      sram: '264KB',
      flash: '2MB QSPI',
      gpioCount: '26 multi-function',
      adcChannels: '3x 12-bit ADC',
      pio: '2x Programmable I/O blocks (8 state machines)',
      logicVoltage: '3.3V DC (Strict, NOT 5V Tolerant)'
    },
    recommendedOperatingConditions: { voltageMin_V: 1.8, voltageMax_V: 5.5, currentTypical_mA: 24, tempMin_C: -20, tempMax_C: 85 },
    absoluteMaximumRatings: { voltageMax_V: 5.5, currentMax_mA: 300, powerDissipationMax_mW: 1200 },
    distributorInfo: { supplier: 'DigiKey', sku: '2643-SC0915-ND', unitPrice: '$4.00', inStock: true },
    pins: [
      { id: 'vbus', name: 'VBUS (5V USB)', type: 'power', voltageNominal: 5.0, relativeX: 10, relativeY: 0 },
      { id: 'vsys', name: 'VSYS (1.8-5.5V)', type: 'power', relativeX: 10, relativeY: 20 },
      { id: '3v3', name: '3V3_OUT', type: 'power', voltageNominal: 3.3, relativeX: 10, relativeY: 40 },
      { id: 'gnd', name: 'GND', type: 'ground', relativeX: 10, relativeY: 60 },
      { id: 'gp0', name: 'GP0 (UART0_TX)', type: 'io', relativeX: 10, relativeY: 80 },
      { id: 'gp1', name: 'GP1 (UART0_RX)', type: 'io', relativeX: 10, relativeY: 100 },
      { id: 'gp2', name: 'GP2 (I2C1_SDA)', type: 'io', relativeX: 10, relativeY: 120 },
      { id: 'gp3', name: 'GP3 (I2C1_SCL)', type: 'io', relativeX: 10, relativeY: 140 },
      { id: 'gp4', name: 'GP4 (SPI0_RX)', type: 'io', relativeX: 10, relativeY: 160 },
      { id: 'gp5', name: 'GP5 (SPI0_CS)', type: 'io', relativeX: 10, relativeY: 180 },
      { id: 'gp26_a0', name: 'GP26 (ADC0)', type: 'analog', relativeX: 100, relativeY: 20 },
      { id: 'gp27_a1', name: 'GP27 (ADC1)', type: 'analog', relativeX: 100, relativeY: 40 },
      { id: 'gp28_a2', name: 'GP28 (ADC2)', type: 'analog', relativeX: 100, relativeY: 60 },
      { id: 'adc_vref', name: 'ADC_VREF (3.3V)', type: 'power', relativeX: 100, relativeY: 80 },
      { id: 'agnd', name: 'AGND', type: 'ground', relativeX: 100, relativeY: 100 },
    ]
  },

  'STM32F103C8T6': {
    catalogKey: 'STM32F103C8T6',
    partNumber: 'STM32F103C8T6',
    manufacturer: 'STMicroelectronics',
    category: 'microcontroller',
    displayName: 'STM32 Blue Pill (ARM Cortex-M3 72MHz)',
    package: 'MODULE_HEADER',
    isVerifiedModel: true,
    confidenceScore: 0.98,
    datasheetUrl: 'https://www.st.com/resource/en/datasheet/stm32f103c8.pdf',
    parameters: {
      core: 'ARM 32-bit Cortex-M3',
      clockSpeed: '72MHz max',
      flash: '64KB / 128KB',
      sram: '20KB',
      timers: '3x 16-bit general + 1x advanced PWM',
      communication: '2x SPI, 2x I2C, 3x USART, 1x USB 2.0 Full Speed, 1x CAN',
      adcResolution: '2x 12-bit ADC (16 channels)'
    },
    recommendedOperatingConditions: { voltageMin_V: 2.0, voltageMax_V: 3.6, currentTypical_mA: 36, tempMin_C: -40, tempMax_C: 85 },
    absoluteMaximumRatings: { voltageMax_V: 4.0, currentMax_mA: 200, powerDissipationMax_mW: 800 },
    distributorInfo: { supplier: 'Mouser', sku: '511-STM32F103C8T6', unitPrice: '$3.50', inStock: true },
    pins: [
      { id: '3v3', name: '3.3V', type: 'power', voltageNominal: 3.3, relativeX: 10, relativeY: 0 },
      { id: 'gnd', name: 'GND', type: 'ground', relativeX: 10, relativeY: 20 },
      { id: '5v', name: '5V (VIN)', type: 'power', voltageNominal: 5.0, relativeX: 10, relativeY: 40 },
      { id: 'pa0', name: 'PA0 (WKUP/ADC1_IN0)', type: 'analog', relativeX: 10, relativeY: 60 },
      { id: 'pa1', name: 'PA1 (ADC1_IN1)', type: 'analog', relativeX: 10, relativeY: 80 },
      { id: 'pa2', name: 'PA2 (USART2_TX)', type: 'io', relativeX: 10, relativeY: 100 },
      { id: 'pa3', name: 'PA3 (USART2_RX)', type: 'io', relativeX: 10, relativeY: 120 },
      { id: 'pa9', name: 'PA9 (USART1_TX / 5V-Tol)', type: 'io', relativeX: 100, relativeY: 20 },
      { id: 'pa10', name: 'PA10 (USART1_RX / 5V-Tol)', type: 'io', relativeX: 100, relativeY: 40 },
      { id: 'pb6', name: 'PB6 (I2C1_SCL / 5V-Tol)', type: 'io', relativeX: 100, relativeY: 60 },
      { id: 'pb7', name: 'PB7 (I2C1_SDA / 5V-Tol)', type: 'io', relativeX: 100, relativeY: 80 },
      { id: 'pc13', name: 'PC13 (Onboard LED Active-Low)', type: 'io', relativeX: 100, relativeY: 100 },
    ]
  },

  '74HC00-NAND': {
    catalogKey: '74HC00-NAND',
    partNumber: 'SN74HC00N',
    manufacturer: 'Texas Instruments',
    category: 'ic',
    displayName: '74HC00 Quad 2-Input NAND Gate DIP-14',
    package: 'DIP',
    isVerifiedModel: true,
    confidenceScore: 1.0,
    parameters: { logicFamily: 'High-Speed CMOS (74HC)', propagationDelay: '8ns @ 4.5V', driveCapability: '±5.2mA per output' },
    recommendedOperatingConditions: { voltageMin_V: 2.0, voltageMax_V: 6.0, currentTypical_mA: 0.02, tempMin_C: -40, tempMax_C: 125 },
    absoluteMaximumRatings: { voltageMax_V: 7.0, currentMax_mA: 20, powerDissipationMax_mW: 500 },
    pins: [
      { id: '1a', name: '1A', type: 'input', relativeX: 10, relativeY: 20 },
      { id: '1b', name: '1B', type: 'input', relativeX: 10, relativeY: 40 },
      { id: '1y', name: '1Y (Output)', type: 'output', relativeX: 10, relativeY: 60 },
      { id: '2a', name: '2A', type: 'input', relativeX: 10, relativeY: 80 },
      { id: '2b', name: '2B', type: 'input', relativeX: 10, relativeY: 100 },
      { id: '2y', name: '2Y (Output)', type: 'output', relativeX: 10, relativeY: 120 },
      { id: 'gnd', name: 'GND (Pin 7)', type: 'ground', relativeX: 10, relativeY: 140 },
      { id: '3y', name: '3Y (Output)', type: 'output', relativeX: 80, relativeY: 140 },
      { id: '3a', name: '3A', type: 'input', relativeX: 80, relativeY: 120 },
      { id: '3b', name: '3B', type: 'input', relativeX: 80, relativeY: 100 },
      { id: '4y', name: '4Y (Output)', type: 'output', relativeX: 80, relativeY: 80 },
      { id: '4a', name: '4A', type: 'input', relativeX: 80, relativeY: 60 },
      { id: '4b', name: '4B', type: 'input', relativeX: 80, relativeY: 40 },
      { id: 'vcc', name: 'VCC (Pin 14)', type: 'power', voltageNominal: 5.0, relativeX: 80, relativeY: 20 },
    ]
  },

  '74HC08-AND': {
    catalogKey: '74HC08-AND',
    partNumber: 'SN74HC08N',
    manufacturer: 'Texas Instruments',
    category: 'ic',
    displayName: '74HC08 Quad 2-Input Positive-AND Gate DIP-14',
    package: 'DIP',
    isVerifiedModel: true,
    confidenceScore: 1.0,
    parameters: { logicFamily: 'High-Speed CMOS (74HC)', propagationDelay: '9ns @ 4.5V', driveCapability: '±5.2mA per output' },
    recommendedOperatingConditions: { voltageMin_V: 2.0, voltageMax_V: 6.0, currentTypical_mA: 0.02, tempMin_C: -40, tempMax_C: 125 },
    absoluteMaximumRatings: { voltageMax_V: 7.0, currentMax_mA: 20, powerDissipationMax_mW: 500 },
    pins: [
      { id: '1a', name: '1A', type: 'input', relativeX: 10, relativeY: 20 },
      { id: '1b', name: '1B', type: 'input', relativeX: 10, relativeY: 40 },
      { id: '1y', name: '1Y', type: 'output', relativeX: 10, relativeY: 60 },
      { id: '2a', name: '2A', type: 'input', relativeX: 10, relativeY: 80 },
      { id: '2b', name: '2B', type: 'input', relativeX: 10, relativeY: 100 },
      { id: '2y', name: '2Y', type: 'output', relativeX: 10, relativeY: 120 },
      { id: 'gnd', name: 'GND (Pin 7)', type: 'ground', relativeX: 10, relativeY: 140 },
      { id: '3y', name: '3Y', type: 'output', relativeX: 80, relativeY: 140 },
      { id: '3a', name: '3A', type: 'input', relativeX: 80, relativeY: 120 },
      { id: '3b', name: '3B', type: 'input', relativeX: 80, relativeY: 100 },
      { id: '4y', name: '4Y', type: 'output', relativeX: 80, relativeY: 80 },
      { id: '4a', name: '4A', type: 'input', relativeX: 80, relativeY: 60 },
      { id: '4b', name: '4B', type: 'input', relativeX: 80, relativeY: 40 },
      { id: 'vcc', name: 'VCC (Pin 14)', type: 'power', voltageNominal: 5.0, relativeX: 80, relativeY: 20 },
    ]
  },

  '74HC04-NOT': {
    catalogKey: '74HC04-NOT',
    partNumber: 'SN74HC04N',
    manufacturer: 'Texas Instruments',
    category: 'ic',
    displayName: '74HC04 Hex Inverter Inverting Gate DIP-14',
    package: 'DIP',
    isVerifiedModel: true,
    confidenceScore: 1.0,
    parameters: { logicFamily: 'High-Speed CMOS (74HC)', propagationDelay: '7ns @ 4.5V', invertersCount: 6 },
    recommendedOperatingConditions: { voltageMin_V: 2.0, voltageMax_V: 6.0, currentTypical_mA: 0.02, tempMin_C: -40, tempMax_C: 125 },
    absoluteMaximumRatings: { voltageMax_V: 7.0, currentMax_mA: 20, powerDissipationMax_mW: 500 },
    pins: [
      { id: '1a', name: '1A', type: 'input', relativeX: 10, relativeY: 20 },
      { id: '1y', name: '1Y', type: 'output', relativeX: 10, relativeY: 40 },
      { id: '2a', name: '2A', type: 'input', relativeX: 10, relativeY: 60 },
      { id: '2y', name: '2Y', type: 'output', relativeX: 10, relativeY: 80 },
      { id: '3a', name: '3A', type: 'input', relativeX: 10, relativeY: 100 },
      { id: '3y', name: '3Y', type: 'output', relativeX: 10, relativeY: 120 },
      { id: 'gnd', name: 'GND (Pin 7)', type: 'ground', relativeX: 10, relativeY: 140 },
      { id: '4y', name: '4Y', type: 'output', relativeX: 80, relativeY: 140 },
      { id: '4a', name: '4A', type: 'input', relativeX: 80, relativeY: 120 },
      { id: '5y', name: '5Y', type: 'output', relativeX: 80, relativeY: 100 },
      { id: '5a', name: '5A', type: 'input', relativeX: 80, relativeY: 80 },
      { id: '6y', name: '6Y', type: 'output', relativeX: 80, relativeY: 60 },
      { id: '6a', name: '6A', type: 'input', relativeX: 80, relativeY: 40 },
      { id: 'vcc', name: 'VCC (Pin 14)', type: 'power', voltageNominal: 5.0, relativeX: 80, relativeY: 20 },
    ]
  },

  'BME280': {
    catalogKey: 'BME280',
    partNumber: 'BME280',
    manufacturer: 'Bosch Sensortec',
    category: 'sensor',
    displayName: 'BME280 Precision Environmental Sensor (Temp/Humidity/Pressure)',
    package: 'MODULE_HEADER',
    isVerifiedModel: true,
    confidenceScore: 0.99,
    parameters: {
      temperatureRange: '-40 to +85°C (±0.5°C)',
      humidityRange: '0 to 100% RH (±3%)',
      pressureRange: '300 to 1100 hPa (±1 hPa)',
      interface: 'I2C (0x76 / 0x77) or SPI (4-wire)',
      currentSleep_uA: 0.1
    },
    recommendedOperatingConditions: { voltageMin_V: 1.71, voltageMax_V: 3.6, currentTypical_mA: 0.0036, tempMin_C: -40, tempMax_C: 85 },
    absoluteMaximumRatings: { voltageMax_V: 4.25, currentMax_mA: 5, powerDissipationMax_mW: 20 },
    distributorInfo: { supplier: 'Adafruit', sku: '2652', unitPrice: '$14.95', inStock: true },
    pins: [
      { id: 'vin', name: 'VIN (3.3V-5V)', type: 'power', voltageNominal: 3.3, relativeX: 10, relativeY: 20 },
      { id: 'gnd', name: 'GND', type: 'ground', relativeX: 10, relativeY: 40 },
      { id: 'scl', name: 'SCL (SCK)', type: 'input', relativeX: 10, relativeY: 60 },
      { id: 'sda', name: 'SDA (SDI)', type: 'io', relativeX: 10, relativeY: 80 },
    ]
  },

  'MPU6050': {
    catalogKey: 'MPU6050',
    partNumber: 'MPU-6050',
    manufacturer: 'TDK InvenSense',
    category: 'sensor',
    displayName: 'MPU-6050 6-Axis Accelerometer & Gyroscope IMU',
    package: 'MODULE_HEADER',
    isVerifiedModel: true,
    confidenceScore: 0.99,
    parameters: {
      gyroRange: '±250, ±500, ±1000, ±2000 °/s',
      accelRange: '±2, ±4, ±8, ±16 g',
      dmp: 'Embedded Digital Motion Processor (DMP)',
      interface: 'Fast Mode I2C (400kHz)',
      i2cAddress: '0x68 (AD0=GND) / 0x69 (AD0=VCC)'
    },
    recommendedOperatingConditions: { voltageMin_V: 2.375, voltageMax_V: 3.46, currentTypical_mA: 3.8, tempMin_C: -40, tempMax_C: 85 },
    absoluteMaximumRatings: { voltageMax_V: 3.6, currentMax_mA: 10, powerDissipationMax_mW: 50 },
    distributorInfo: { supplier: 'SparkFun', sku: 'SEN-11028', unitPrice: '$9.95', inStock: true },
    pins: [
      { id: 'vcc', name: 'VCC (3.3V-5V with on-board LDO)', type: 'power', voltageNominal: 3.3, relativeX: 10, relativeY: 20 },
      { id: 'gnd', name: 'GND', type: 'ground', relativeX: 10, relativeY: 40 },
      { id: 'scl', name: 'SCL', type: 'input', relativeX: 10, relativeY: 60 },
      { id: 'sda', name: 'SDA', type: 'io', relativeX: 10, relativeY: 80 },
      { id: 'xda', name: 'XDA (Aux I2C Data)', type: 'io', relativeX: 60, relativeY: 20 },
      { id: 'xcl', name: 'XCL (Aux I2C Clock)', type: 'io', relativeX: 60, relativeY: 40 },
      { id: 'ad0', name: 'AD0 (Address Select)', type: 'input', relativeX: 60, relativeY: 60 },
      { id: 'int', name: 'INT (Interrupt Out)', type: 'output', relativeX: 60, relativeY: 80 },
    ]
  },

  '2N2222': {
    catalogKey: '2N2222',
    partNumber: 'P2N2222AG',
    manufacturer: 'onsemi',
    category: 'semiconductor',
    displayName: '2N2222 NPN Bipolar Junction Transistor (BJT)',
    package: 'TO-220',
    isVerifiedModel: true,
    confidenceScore: 1.0,
    parameters: {
      type: 'NPN Silicon Epitaxial',
      vceo: '40V',
      icContinuous: '600mA (800mA peak)',
      hfe: '100 - 300 @ 150mA',
      vceSat: '0.3V @ 150mA / 15mA Ib',
      transitionFreq: '300MHz'
    },
    recommendedOperatingConditions: { voltageMin_V: 0, voltageMax_V: 30, currentTypical_mA: 150, tempMin_C: -55, tempMax_C: 150 },
    absoluteMaximumRatings: { voltageMax_V: 40, currentMax_mA: 800, powerDissipationMax_mW: 625 },
    pins: [
      { id: 'collector', name: 'Collector (C)', type: 'passive', relativeX: 10, relativeY: 20 },
      { id: 'base', name: 'Base (B)', type: 'passive', relativeX: 35, relativeY: 45 },
      { id: 'emitter', name: 'Emitter (E)', type: 'passive', relativeX: 60, relativeY: 20 },
    ]
  }
};
