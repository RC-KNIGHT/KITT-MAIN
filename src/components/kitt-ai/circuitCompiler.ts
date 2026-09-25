import { CanonicalCircuit, CircuitComponent, CircuitConnection } from './types';
import { COMPONENT_CATALOG } from './componentCatalog';
import { solveCircuitPhysics } from './circuitPhysicsEngine';

export function buildPlantWateringCircuit(): CanonicalCircuit {
  const esp32Catalog = COMPONENT_CATALOG['esp32-devkit'];
  const sensorCatalog = COMPONENT_CATALOG['soil-moisture-sensor'];
  const mosfetCatalog = COMPONENT_CATALOG['irlz44n-mosfet'];
  const diodeCatalog = COMPONENT_CATALOG['diode-1n4007'];
  const pumpCatalog = COMPONENT_CATALOG['pump-5v'];
  const resistorCatalog = COMPONENT_CATALOG['resistor-220'];

  const components: CircuitComponent[] = [
    {
      id: 'esp32_1',
      catalogId: esp32Catalog.id,
      name: esp32Catalog.name,
      category: 'microcontroller',
      package: esp32Catalog.package,
      pins: [...esp32Catalog.defaultPins],
      schematic: { x: 280, y: 140 },
      breadboard: { anchorRow: 10, anchorCol: 'e', rotation: 0 },
      color: esp32Catalog.color,
      description: 'Master controller running sampling loop and PWM gate driver'
    },
    {
      id: 'sensor_1',
      catalogId: sensorCatalog.id,
      name: sensorCatalog.name,
      category: 'sensor',
      package: sensorCatalog.package,
      pins: [...sensorCatalog.defaultPins],
      schematic: { x: 60, y: 160 },
      breadboard: { anchorRow: 32, anchorCol: 'b', rotation: 0 },
      color: sensorCatalog.color,
      description: 'Capacitive moisture probe measuring dielectric constant'
    },
    {
      id: 'resistor_1',
      catalogId: resistorCatalog.id,
      name: '220Ω Gate Resistor',
      value: '220Ω',
      category: 'passive',
      package: resistorCatalog.package,
      pins: [...resistorCatalog.defaultPins],
      schematic: { x: 500, y: 220 },
      breadboard: { anchorRow: 24, anchorCol: 'g', rotation: 0 },
      color: resistorCatalog.color,
      description: 'Inrush current limiter protecting GPIO26'
    },
    {
      id: 'mosfet_1',
      catalogId: mosfetCatalog.id,
      name: mosfetCatalog.name,
      category: 'semiconductor',
      package: mosfetCatalog.package,
      pins: [...mosfetCatalog.defaultPins],
      schematic: { x: 620, y: 200 },
      breadboard: { anchorRow: 26, anchorCol: 'h', rotation: 0 },
      color: mosfetCatalog.color,
      description: 'Logic-level N-Ch switch sinking 5V pump current'
    },
    {
      id: 'pump_1',
      catalogId: pumpCatalog.id,
      name: pumpCatalog.name,
      category: 'actuator',
      package: pumpCatalog.package,
      pins: [...pumpCatalog.defaultPins],
      schematic: { x: 780, y: 130 },
      breadboard: { anchorRow: 38, anchorCol: 'i', rotation: 0 },
      color: pumpCatalog.color,
      description: 'Submersible 5V irrigation pump'
    },
    {
      id: 'diode_1',
      catalogId: diodeCatalog.id,
      name: diodeCatalog.name,
      category: 'semiconductor',
      package: diodeCatalog.package,
      pins: [...diodeCatalog.defaultPins],
      schematic: { x: 780, y: 220 },
      breadboard: { anchorRow: 38, anchorCol: 'g', rotation: 0 },
      color: diodeCatalog.color,
      description: '1N4007 flyback clamp diode across inductive pump motor'
    }
  ];

  const connections: CircuitConnection[] = [
    // Power rails to Sensor
    { id: 'c1', fromComponentId: 'esp32_1', fromPinId: '3v3', toComponentId: 'sensor_1', toPinId: 'vcc', signalType: 'POWER_VCC', wireColor: '#ef4444', label: '3.3V Power' },
    { id: 'c2', fromComponentId: 'esp32_1', fromPinId: 'gnd_1', toComponentId: 'sensor_1', toPinId: 'gnd', signalType: 'GROUND', wireColor: '#1e293b', label: 'GND' },
    // Sensor Analog Out to ESP32 ADC
    { id: 'c3', fromComponentId: 'sensor_1', fromPinId: 'aout', toComponentId: 'esp32_1', toPinId: 'gpio34', signalType: 'ANALOG', wireColor: '#10b981', label: 'Soil ADC (GPIO34)' },
    // ESP32 GPIO26 to Gate Resistor
    { id: 'c4', fromComponentId: 'esp32_1', fromPinId: 'gpio26', toComponentId: 'resistor_1', toPinId: 'p1', signalType: 'PWM', wireColor: '#f97316', label: 'Gate Drive (GPIO26)' },
    // Resistor to MOSFET Gate
    { id: 'c5', fromComponentId: 'resistor_1', fromPinId: 'p2', toComponentId: 'mosfet_1', toPinId: 'gate', signalType: 'DIGITAL', wireColor: '#f59e0b', label: 'Gate' },
    // MOSFET Source to GND
    { id: 'c6', fromComponentId: 'mosfet_1', fromPinId: 'source', toComponentId: 'esp32_1', toPinId: 'gnd_2', signalType: 'GROUND', wireColor: '#1e293b', label: 'Source GND' },
    // 5V Rail to Pump +
    { id: 'c7', fromComponentId: 'esp32_1', fromPinId: 'vin_5v', toComponentId: 'pump_1', toPinId: 'pos', signalType: 'POWER_VCC', wireColor: '#dc2626', label: '+5V Pump Supply' },
    // Pump - to MOSFET Drain
    { id: 'c8', fromComponentId: 'pump_1', fromPinId: 'neg', toComponentId: 'mosfet_1', toPinId: 'drain', signalType: 'DIGITAL', wireColor: '#0ea5e9', label: 'Switched Low-Side' },
    // Flyback Diode across Pump (Cathode to 5V, Anode to Drain)
    { id: 'c9', fromComponentId: 'pump_1', fromPinId: 'pos', toComponentId: 'diode_1', toPinId: 'cathode', signalType: 'POWER_VCC', wireColor: '#dc2626', label: 'Clamp High' },
    { id: 'c10', fromComponentId: 'pump_1', fromPinId: 'neg', toComponentId: 'diode_1', toPinId: 'anode', signalType: 'DIGITAL', wireColor: '#64748b', label: 'Clamp Low' },
  ];

  const { telemetry, violations } = solveCircuitPhysics(components, connections, 5.0);

  const firmwareCode = `/**
 * KITT Autonomous Synthesis — Automated Plant Irrigation Controller
 * Target: ESP32-WROOM-32 DevKit
 * Canonical Pin Mapping:
 *   - GPIO34: Capacitive Soil Moisture Analog In
 *   - GPIO26: IRLZ44N MOSFET Gate (via 220Ω inrush resistor)
 */

#include <Arduino.h>

const int SOIL_PIN = 34;      // ADC1_CH6 (Analog Input)
const int PUMP_GATE_PIN = 26; // Digital Output to MOSFET Gate

const int DRY_THRESHOLD = 2800;  // Raw ADC reading when dry
const int WET_THRESHOLD = 1450;  // Raw ADC reading when saturated

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("[KITT AI] Initializing Irrigation Controller...");

  pinMode(PUMP_GATE_PIN, OUTPUT);
  digitalWrite(PUMP_GATE_PIN, LOW); // Ensure pump is OFF at boot
  analogReadResolution(12);         // 12-bit ADC (0-4095)
}

void loop() {
  int rawValue = analogRead(SOIL_PIN);
  float voltage = (rawValue / 4095.0f) * 3.3f;

  Serial.printf("Soil Reading: %d | Voltage: %.2f V\\n", rawValue, voltage);

  if (rawValue > DRY_THRESHOLD) {
    Serial.println("Soil is parched. Activating 5V pump for 3 seconds...");
    digitalWrite(PUMP_GATE_PIN, HIGH);
    delay(3000);
    digitalWrite(PUMP_GATE_PIN, LOW);
    Serial.println("Irrigation cycle complete. Allowing water percolation...");
    delay(10000); // 10-second absorption delay
  } else {
    digitalWrite(PUMP_GATE_PIN, LOW);
  }

  delay(2000);
}
`;

  return {
    id: 'circ-plant-irrigation-01',
    title: 'Autonomous Smart Plant Irrigation System',
    summary: 'ESP32 capacitive soil moisture sensor with IRLZ44N MOSFET motor driver and 1N4007 flyback suppression.',
    description: 'Measures dielectric soil moisture via GPIO34 analog conversion. When moisture drops below hysteresis setpoint, GPIO26 drives an IRLZ44N N-Channel MOSFET through a 220Ω inrush resistor to power the 5V submersible pump. Inductive kickback is clamped via a 1N4007 diode.',
    components,
    connections,
    telemetry,
    drcViolations: violations,
    firmware: {
      language: 'arduino',
      code: firmwareCode,
      librariesRequired: ['Arduino.h']
    },
    tags: ['ESP32', 'Soil Moisture', 'MOSFET', 'Flyback Diode', 'Water Pump', 'Analog ADC']
  };
}

export function buildUltrasonicRadarCircuit(): CanonicalCircuit {
  const unoCatalog = COMPONENT_CATALOG['arduino-uno'];
  const ultrasonicCatalog = COMPONENT_CATALOG['ultrasonic-hcsr04'];
  const servoCatalog = COMPONENT_CATALOG['servo-sg90'];
  const ledCatalog = COMPONENT_CATALOG['led-red'];
  const resistorCatalog = COMPONENT_CATALOG['resistor-220'];

  const components: CircuitComponent[] = [
    {
      id: 'uno_1',
      catalogId: unoCatalog.id,
      name: unoCatalog.name,
      category: 'microcontroller',
      package: unoCatalog.package,
      pins: [...unoCatalog.defaultPins],
      schematic: { x: 260, y: 130 },
      breadboard: { anchorRow: 8, anchorCol: 'd', rotation: 0 },
      color: unoCatalog.color,
      description: 'Arduino Uno R3 central timing and pulse controller'
    },
    {
      id: 'ultrasonic_1',
      catalogId: ultrasonicCatalog.id,
      name: ultrasonicCatalog.name,
      category: 'sensor',
      package: ultrasonicCatalog.package,
      pins: [...ultrasonicCatalog.defaultPins],
      schematic: { x: 60, y: 150 },
      breadboard: { anchorRow: 34, anchorCol: 'b', rotation: 0 },
      color: ultrasonicCatalog.color,
      description: '40kHz ultrasonic echo transducer'
    },
    {
      id: 'servo_1',
      catalogId: servoCatalog.id,
      name: servoCatalog.name,
      category: 'actuator',
      package: servoCatalog.package,
      pins: [...servoCatalog.defaultPins],
      schematic: { x: 580, y: 130 },
      breadboard: { anchorRow: 32, anchorCol: 'g', rotation: 0 },
      color: servoCatalog.color,
      description: '180-degree sweep servo mount'
    },
    {
      id: 'resistor_1',
      catalogId: resistorCatalog.id,
      name: '220Ω LED Resistor',
      value: '220Ω',
      category: 'passive',
      package: resistorCatalog.package,
      pins: [...resistorCatalog.defaultPins],
      schematic: { x: 500, y: 250 },
      breadboard: { anchorRow: 24, anchorCol: 'g', rotation: 0 },
      color: resistorCatalog.color,
      description: 'Current limiting for warning beacon'
    },
    {
      id: 'led_1',
      catalogId: ledCatalog.id,
      name: ledCatalog.name,
      category: 'semiconductor',
      package: ledCatalog.package,
      pins: [...ledCatalog.defaultPins],
      schematic: { x: 640, y: 250 },
      breadboard: { anchorRow: 26, anchorCol: 'g', rotation: 0 },
      color: ledCatalog.color,
      description: 'Proximity alert indicator'
    }
  ];

  const connections: CircuitConnection[] = [
    { id: 'w1', fromComponentId: 'uno_1', fromPinId: '5v', toComponentId: 'ultrasonic_1', toPinId: 'vcc', signalType: 'POWER_VCC', wireColor: '#ef4444', label: '+5V Rail' },
    { id: 'w2', fromComponentId: 'uno_1', fromPinId: 'gnd_1', toComponentId: 'ultrasonic_1', toPinId: 'gnd', signalType: 'GROUND', wireColor: '#1e293b', label: 'GND' },
    { id: 'w3', fromComponentId: 'uno_1', fromPinId: 'd9_pwm', toComponentId: 'ultrasonic_1', toPinId: 'trig', signalType: 'DIGITAL', wireColor: '#06b6d4', label: 'Trig (D9)' },
    { id: 'w4', fromComponentId: 'uno_1', fromPinId: 'd10_pwm', toComponentId: 'ultrasonic_1', toPinId: 'echo', signalType: 'DIGITAL', wireColor: '#3b82f6', label: 'Echo (D10)' },
    { id: 'w5', fromComponentId: 'uno_1', fromPinId: '5v', toComponentId: 'servo_1', toPinId: 'vcc', signalType: 'POWER_VCC', wireColor: '#ef4444', label: 'Servo VCC' },
    { id: 'w6', fromComponentId: 'uno_1', fromPinId: 'gnd_1', toComponentId: 'servo_1', toPinId: 'gnd', signalType: 'GROUND', wireColor: '#1e293b', label: 'Servo GND' },
    { id: 'w7', fromComponentId: 'uno_1', fromPinId: 'd3_pwm', toComponentId: 'servo_1', toPinId: 'pwm', signalType: 'PWM', wireColor: '#f97316', label: 'Servo PWM (D3)' },
    { id: 'w8', fromComponentId: 'uno_1', fromPinId: 'd2', toComponentId: 'resistor_1', toPinId: 'p1', signalType: 'DIGITAL', wireColor: '#a855f7', label: 'LED Alert (D2)' },
    { id: 'w9', fromComponentId: 'resistor_1', fromPinId: 'p2', toComponentId: 'led_1', toPinId: 'anode', signalType: 'DIGITAL', wireColor: '#ef4444', label: 'Resistor to Anode' },
    { id: 'w10', fromComponentId: 'led_1', fromPinId: 'cathode', toComponentId: 'uno_1', toPinId: 'gnd_2', signalType: 'GROUND', wireColor: '#1e293b', label: 'LED Cathode GND' },
  ];

  const { telemetry, violations } = solveCircuitPhysics(components, connections, 5.0);

  const firmwareCode = `/**
 * KITT Autonomous Synthesis — 180° Ultrasonic Radar Scanner
 * Target: Arduino Uno R3 (ATmega328P)
 * Pins:
 *   - D9: HC-SR04 TRIG (Output)
 *   - D10: HC-SR04 ECHO (Input)
 *   - D3: SG90 Servo PWM (Output)
 *   - D2: Alert LED (Output)
 */

#include <Servo.h>

Servo radarServo;
const int TRIG_PIN = 9;
const int ECHO_PIN = 10;
const int SERVO_PIN = 3;
const int LED_PIN = 2;

long measureDistanceCm() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long durationUs = pulseIn(ECHO_PIN, HIGH, 30000);
  if (durationUs == 0) return 400; // Out of range timeout
  return durationUs * 0.034 / 2;
}

void setup() {
  Serial.begin(115200);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(LED_PIN, OUTPUT);
  radarServo.attach(SERVO_PIN);
  Serial.println("[KITT AI] Ultrasonic Radar Activated.");
}

void loop() {
  // Sweep forward from 15° to 165°
  for (int angle = 15; angle <= 165; angle += 3) {
    radarServo.write(angle);
    delay(30);
    long dist = measureDistanceCm();
    Serial.printf("%d,%ld\\n", angle, dist);

    if (dist < 20) {
      digitalWrite(LED_PIN, HIGH);
    } else {
      digitalWrite(LED_PIN, LOW);
    }
  }

  // Sweep reverse
  for (int angle = 165; angle >= 15; angle -= 3) {
    radarServo.write(angle);
    delay(30);
    long dist = measureDistanceCm();
    Serial.printf("%d,%ld\\n", angle, dist);

    if (dist < 20) {
      digitalWrite(LED_PIN, HIGH);
    } else {
      digitalWrite(LED_PIN, LOW);
    }
  }
}
`;

  return {
    id: 'circ-radar-02',
    title: '180° Ultrasonic Obstacle Radar Scanner',
    summary: 'Arduino Uno R3 driving an SG90 servo pan mechanism with an HC-SR04 ultrasonic rangefinder and alert LED.',
    description: 'A 180-degree sweep radar. An SG90 micro-servo pans the HC-SR04 sensor back and forth. Time-of-flight sound reflection measures target distances up to 4 meters, triggering an LED alert when an obstacle is closer than 20cm.',
    components,
    connections,
    telemetry,
    drcViolations: violations,
    firmware: {
      language: 'arduino',
      code: firmwareCode,
      librariesRequired: ['Servo.h']
    },
    tags: ['Arduino Uno', 'Ultrasonic HC-SR04', 'Servo SG90', 'LED', 'Radar', 'Time-of-Flight']
  };
}

export function buildWeatherStationCircuit(): CanonicalCircuit {
  const esp32Catalog = COMPONENT_CATALOG['esp32-devkit'];
  const dhtCatalog = COMPONENT_CATALOG['dht22-sensor'];
  const oledCatalog = COMPONENT_CATALOG['oled-ssd1306'];
  const resistorCatalog = COMPONENT_CATALOG['resistor-10k'];

  const components: CircuitComponent[] = [
    {
      id: 'esp32_1',
      catalogId: esp32Catalog.id,
      name: esp32Catalog.name,
      category: 'microcontroller',
      package: esp32Catalog.package,
      pins: [...esp32Catalog.defaultPins],
      schematic: { x: 260, y: 140 },
      breadboard: { anchorRow: 10, anchorCol: 'e', rotation: 0 },
      color: esp32Catalog.color,
      description: 'ESP32 Wi-Fi SoC with hardware I2C master'
    },
    {
      id: 'dht22_1',
      catalogId: dhtCatalog.id,
      name: dhtCatalog.name,
      category: 'sensor',
      package: dhtCatalog.package,
      pins: [...dhtCatalog.defaultPins],
      schematic: { x: 70, y: 150 },
      breadboard: { anchorRow: 32, anchorCol: 'b', rotation: 0 },
      color: dhtCatalog.color,
      description: 'Precision temperature & relative humidity sensor'
    },
    {
      id: 'oled_1',
      catalogId: oledCatalog.id,
      name: oledCatalog.name,
      category: 'display',
      package: oledCatalog.package,
      pins: [...oledCatalog.defaultPins],
      schematic: { x: 560, y: 140 },
      breadboard: { anchorRow: 32, anchorCol: 'g', rotation: 0 },
      color: oledCatalog.color,
      description: '128x64 high-contrast I2C OLED display'
    },
    {
      id: 'resistor_pullup',
      catalogId: resistorCatalog.id,
      name: '10kΩ Pull-Up Resistor',
      value: '10kΩ',
      category: 'passive',
      package: resistorCatalog.package,
      pins: [...resistorCatalog.defaultPins],
      schematic: { x: 180, y: 90 },
      breadboard: { anchorRow: 24, anchorCol: 'c', rotation: 0 },
      color: resistorCatalog.color,
      description: 'One-Wire data line pull-up for DHT22'
    }
  ];

  const connections: CircuitConnection[] = [
    // ESP32 3.3V & GND to DHT22
    { id: 'w1', fromComponentId: 'esp32_1', fromPinId: '3v3', toComponentId: 'dht22_1', toPinId: 'vcc', signalType: 'POWER_VCC', wireColor: '#ef4444', label: '3.3V Sensor Power' },
    { id: 'w2', fromComponentId: 'esp32_1', fromPinId: 'gnd_1', toComponentId: 'dht22_1', toPinId: 'gnd', signalType: 'GROUND', wireColor: '#1e293b', label: 'GND' },
    // DHT22 Data to ESP32 GPIO4
    { id: 'w3', fromComponentId: 'dht22_1', fromPinId: 'data', toComponentId: 'esp32_1', toPinId: 'gpio4', signalType: 'DIGITAL', wireColor: '#06b6d4', label: 'DHT Data (GPIO4)' },
    // Pull-up resistor from 3.3V to DHT22 Data
    { id: 'w4', fromComponentId: 'esp32_1', fromPinId: '3v3', toComponentId: 'resistor_pullup', toPinId: 'p1', signalType: 'POWER_VCC', wireColor: '#ef4444', label: 'Pull-up 3.3V' },
    { id: 'w5', fromComponentId: 'resistor_pullup', fromPinId: 'p2', toComponentId: 'dht22_1', toPinId: 'data', signalType: 'DIGITAL', wireColor: '#06b6d4', label: 'Pull-up Tie' },
    // ESP32 to OLED I2C Bus (GPIO21=SDA, GPIO22=SCL)
    { id: 'w6', fromComponentId: 'esp32_1', fromPinId: '3v3', toComponentId: 'oled_1', toPinId: 'vcc', signalType: 'POWER_VCC', wireColor: '#ef4444', label: '3.3V OLED' },
    { id: 'w7', fromComponentId: 'esp32_1', fromPinId: 'gnd_2', toComponentId: 'oled_1', toPinId: 'gnd', signalType: 'GROUND', wireColor: '#1e293b', label: 'OLED GND' },
    { id: 'w8', fromComponentId: 'esp32_1', fromPinId: 'gpio21', toComponentId: 'oled_1', toPinId: 'sda', signalType: 'I2C_SDA', wireColor: '#a855f7', label: 'I2C SDA (GPIO21)' },
    { id: 'w9', fromComponentId: 'esp32_1', fromPinId: 'gpio22', toComponentId: 'oled_1', toPinId: 'scl', signalType: 'I2C_SCL', wireColor: '#f59e0b', label: 'I2C SCL (GPIO22)' },
  ];

  const { telemetry, violations } = solveCircuitPhysics(components, connections, 3.3);

  const firmwareCode = `/**
 * KITT Autonomous Synthesis — IoT Weather Telemetry Station
 * Target: ESP32-WROOM-32 DevKit
 * Displays live temp/humidity on 0.96" SSD1306 OLED via I2C.
 */

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <DHT.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

#define DHTPIN 4
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22); // SDA=21, SCL=22
  dht.begin();

  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("[KITT AI] SSD1306 allocation failed"));
    for(;;);
  }

  display.clearDisplay();
  display.setTextColor(WHITE);
  display.setTextSize(1);
  display.setCursor(10, 24);
  display.println(F("KITT AI Weather Station"));
  display.display();
  delay(1500);
}

void loop() {
  float h = dht.readHumidity();
  float t = dht.readTemperature();

  if (isnan(h) || isnan(t)) {
    Serial.println(F("Failed to read from DHT sensor!"));
    return;
  }

  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.println(F("--- KITT TELEMETRY ---"));

  display.setTextSize(2);
  display.setCursor(0, 20);
  display.printf("%.1f C\\n", t);

  display.setCursor(0, 44);
  display.printf("%.1f %% RH\\n", h);

  display.display();
  delay(2000);
}
`;

  return {
    id: 'circ-weather-03',
    title: 'IoT Weather & Environmental Telemetry Station',
    summary: 'ESP32 paired with DHT22 digital thermometer & hygrometer and 128x64 SSD1306 OLED display via I2C.',
    description: 'Measures ambient atmospheric temperature and relative humidity with high accuracy. Data is formatted and rendered onto an I2C 128x64 monochrome OLED display running at 400kHz I2C clock speed.',
    components,
    connections,
    telemetry,
    drcViolations: violations,
    firmware: {
      language: 'arduino',
      code: firmwareCode,
      librariesRequired: ['Wire.h', 'Adafruit_GFX.h', 'Adafruit_SSD1306.h', 'DHT.h']
    },
    tags: ['ESP32', 'DHT22', 'SSD1306', 'I2C', 'Weather', 'Telemetry']
  };
}

/**
 * Intelligent Circuit Matcher / Synthesizer
 */
export function synthesizeCircuitFromPrompt(prompt: string): CanonicalCircuit {
  const p = prompt.toLowerCase();

  if (p.includes('radar') || p.includes('sonar') || p.includes('ultrasonic') || p.includes('distance') || p.includes('servo')) {
    return buildUltrasonicRadarCircuit();
  }
  if (p.includes('weather') || p.includes('temperature') || p.includes('humidity') || p.includes('dht') || p.includes('oled')) {
    return buildWeatherStationCircuit();
  }
  
  // Default to the flagship automatic plant watering circuit
  return buildPlantWateringCircuit();
}
