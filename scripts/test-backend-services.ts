/**
 * Automated Verification Suite for KITT Core Hardware Backend
 */

import { componentRegistry } from '../src/services/componentRegistry';
import { validateAndRepairHardwareResponse } from '../src/services/schemas/actionSchema';
import { simulationEngine } from '../src/services/simulationEngine';
import { electricalPanelEngine } from '../src/services/electricalPanelEngine';
import { firmwareSandbox } from '../src/services/firmwareSandbox';
import { costBomEngine } from '../src/services/costBomEngine';
import { intentRouter } from '../src/services/intentRouter';
import { kittOrchestrator } from '../src/services/orchestrator';
import { extractJsonDetailed } from '../src/services/nimClient';
import { HARDWARE_CONTRACT_TEXT } from '../src/services/schemas/hardwareResponseSchema';

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ PASS: ${testName}`);
  } else {
    console.error(`  ❌ FAIL: ${testName}${detail ? ` - ${detail}` : ''}`);
  }
}

async function runAllTests() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING KITT HARDWARE BACKEND VERIFICATION SUITE');
  console.log('======================================================\n');

  // -------------------------------------------------------------
  // TEST SUITE 1: COMPONENT REGISTRY
  // -------------------------------------------------------------
  console.log('--- Suite 1: Component Registry & Hardware Specs ---');
  const esp32 = componentRegistry.lookup('esp32-wroom-32');
  assert(esp32 !== null, 'Lookup ESP32 microcontroller spec');
  assert(esp32?.pins.find(p => p.id === 'gpio34')?.isInputOnly === true, 'Verify ESP32 GPIO 34 is flagged input-only');

  const uno = componentRegistry.lookup('arduino-uno-r3');
  assert(uno !== null, 'Lookup Arduino Uno R3');
  assert(uno?.pins.find(p => p.id === 'd3')?.supportsPwm === true, 'Verify Uno D3 supports PWM');

  const mcb16 = componentRegistry.lookup('16a-mcb');
  assert(mcb16 !== null, 'Lookup 16A Type C MCB breaker');
  assert(mcb16?.mcbSpecs?.tripCurve === 'C', 'Verify 16A MCB has Type C trip curve');

  const unknownPart = componentRegistry.lookup('quantum-flux-capacitor-9000');
  assert(unknownPart === null, 'Verify unknown hardware returns null (no hallucinated specs)');

  // -------------------------------------------------------------
  // TEST SUITE 2: ACTION SCHEMA VALIDATION & REPAIR
  // -------------------------------------------------------------
  console.log('\n--- Suite 2: Action Schema & Repair Gate ---');
  const validActionPayload = {
    intent: 'DIGITAL_LOGIC_CIRCUIT',
    explanation: 'Valid synthesized circuit',
    actions: [
      {
        actionType: 'create_component',
        payload: { id: 'c1', partNumber: '74hc08', label: 'AND Gate' },
      },
      {
        actionType: 'connect_pins',
        payload: { fromComponentId: 'c1', fromPinId: 'out', toComponentId: 'c2', toPinId: 'inA' },
      },
    ],
  };
  const valResult = validateAndRepairHardwareResponse(validActionPayload);
  assert(valResult.valid === true, 'Valid action payload passes schema validation');
  assert(valResult.repairedResponse?.actions.length === 2, 'Action count preserved');

  const malformedPayload = {
    intent: 'UNKNOWN_INTENT_XYZ',
    actions: [
      { actionType: 'create_component', payload: { partNumber: 'resistor' } }, // missing id
      { actionType: 'invalid_action_type', payload: {} }, // illegal action
    ],
  };
  const repaired = validateAndRepairHardwareResponse(malformedPayload);
  assert(repaired.valid === true, 'Malformed payload successfully auto-repaired');
  assert(repaired.repairedResponse?.intent === 'TECHNICAL_QNA', 'Defaulted bad intent to TECHNICAL_QNA');
  assert(repaired.repairedResponse?.actions[0].actionType === 'create_component', 'Auto-assigned missing component ID');

  // -------------------------------------------------------------
  // TEST SUITE 3: SIMULATION & DRC GATE
  // -------------------------------------------------------------
  console.log('\n--- Suite 3: Simulation Engine & Electrical DRC ---');
  // Dead short test
  const deadShortCircuit = simulationEngine.evaluateCircuit(
    [
      { id: 'esp', partNumber: 'esp32-wroom-32' },
    ],
    [
      { id: 'w1', fromComponentId: 'esp', fromPinId: '3v3', toComponentId: 'esp', toPinId: 'gnd', signalType: 'POWER' },
    ]
  );
  assert(deadShortCircuit.passed === false, 'DRC rejects direct VCC to GND dead short');
  assert(deadShortCircuit.violations.some(v => v.code === 'ERR_DEAD_SHORT'), 'Triggers ERR_DEAD_SHORT violation');

  // Unprotected LED test
  const unprotectedLed = simulationEngine.evaluateCircuit(
    [
      { id: 'mcu', partNumber: 'arduino-uno-r3' },
      { id: 'led1', partNumber: 'led-5mm-red' },
    ],
    [
      { id: 'w1', fromComponentId: 'mcu', fromPinId: '5v', toComponentId: 'led1', toPinId: 'anode' },
      { id: 'w2', fromComponentId: 'led1', fromPinId: 'cathode', toComponentId: 'mcu', toPinId: 'gnd' },
    ]
  );
  assert(unprotectedLed.passed === false, 'DRC rejects LED connected directly across 5V without series resistor');
  assert(unprotectedLed.violations.some(v => v.code === 'ERR_UNPROTECTED_LED'), 'Triggers ERR_UNPROTECTED_LED violation');

  // ESP32 input-only pin test
  const espInputOutput = simulationEngine.evaluateCircuit(
    [
      { id: 'esp', partNumber: 'esp32-wroom-32' },
      { id: 'relay', partNumber: 'relay-module-5v' },
    ],
    [
      { id: 'w1', fromComponentId: 'esp', fromPinId: 'gpio34', toComponentId: 'relay', toPinId: 'in' },
    ]
  );
  assert(espInputOutput.passed === false, 'DRC rejects ESP32 input-only GPIO 34 driving an actuator');
  assert(espInputOutput.violations.some(v => v.code === 'ERR_INPUT_ONLY_PIN_AS_OUTPUT'), 'Triggers ERR_INPUT_ONLY_PIN_AS_OUTPUT');

  // -------------------------------------------------------------
  // TEST SUITE 4: ELECTRICAL PANEL / MCB ENGINE
  // -------------------------------------------------------------
  console.log('\n--- Suite 4: Electrical Panel & MCB Domain Engine ---');
  // Conductor undersizing test: 14 AWG wire on 30A breaker
  const panelWithUndersizedWire = electricalPanelEngine.evaluatePanel({
    panelId: 'SUBPANEL_TEST',
    mainRatingAmps: 100,
    busbarRatingAmps: 125,
    voltageSystem: '120/240V_SPLIT',
    phases: 1,
    breakers: [
      {
        id: 'b1',
        poles: 1,
        tripRatingAmps: 30,
        curve: 'C',
        label: 'Water Heater',
        phase: 'L1',
        slotNumber: 1,
        kaRating: 10,
        connectedLoads: [
          {
            loadName: 'Heater Element',
            continuousCurrentAmps: 22,
            nonContinuousCurrentAmps: 0,
            wireGaugeAwg: 14, // DANGEROUS: 14 AWG is only rated for 15A!
            cableType: 'NM-B_ROMEX',
            powerFactor: 1.0,
          },
        ],
      },
    ],
  });
  assert(panelWithUndersizedWire.valid === false, 'Rejects 14 AWG conductor on 30A breaker');
  assert(panelWithUndersizedWire.violations.some(v => v.code === 'ERR_CONDUCTOR_UNDERSIZED'), 'Triggers ERR_CONDUCTOR_UNDERSIZED (NEC 310.16)');

  // Double-tapping test
  const doubleTappedPanel = electricalPanelEngine.evaluatePanel({
    panelId: 'SUBPANEL_TEST',
    mainRatingAmps: 100,
    busbarRatingAmps: 125,
    voltageSystem: '120/240V_SPLIT',
    phases: 1,
    breakers: [
      {
        id: 'b2',
        poles: 1,
        tripRatingAmps: 20,
        curve: 'C',
        label: 'Kitchen Circuit',
        phase: 'L1',
        slotNumber: 2,
        kaRating: 6,
        connectedLoads: [
          { loadName: 'Microwave', continuousCurrentAmps: 10, nonContinuousCurrentAmps: 0, wireGaugeAwg: 12, cableType: 'THHN', powerFactor: 0.95 },
          { loadName: 'Refrigerator', continuousCurrentAmps: 4, nonContinuousCurrentAmps: 0, wireGaugeAwg: 12, cableType: 'THHN', powerFactor: 0.90 },
        ],
      },
    ],
  });
  assert(doubleTappedPanel.valid === false, 'Rejects double-tapped breaker terminal lug');
  assert(doubleTappedPanel.violations.some(v => v.code === 'ERR_DOUBLE_TAPPED_BREAKER'), 'Triggers ERR_DOUBLE_TAPPED_BREAKER (NEC 110.14)');

  // 125% continuous load rule test
  const overloadedBreaker = electricalPanelEngine.evaluatePanel({
    panelId: 'SUBPANEL_TEST',
    mainRatingAmps: 100,
    busbarRatingAmps: 125,
    voltageSystem: '120/240V_SPLIT',
    phases: 1,
    breakers: [
      {
        id: 'b3',
        poles: 1,
        tripRatingAmps: 15,
        curve: 'B',
        label: 'Continuous EV Charger',
        phase: 'L1',
        slotNumber: 3,
        kaRating: 6,
        connectedLoads: [
          { loadName: 'EV Wallbox', continuousCurrentAmps: 14, nonContinuousCurrentAmps: 0, wireGaugeAwg: 14, cableType: 'THHN', powerFactor: 0.99 },
          // 14A continuous * 1.25 = 17.5A required breaker > 15A!
        ],
      },
    ],
  });
  assert(overloadedBreaker.valid === false, 'Rejects 14A continuous load on 15A breaker (125% rule)');
  assert(overloadedBreaker.violations.some(v => v.code === 'ERR_BREAKER_UNDERSIZED'), 'Triggers ERR_BREAKER_UNDERSIZED (NEC 210.20)');

  // -------------------------------------------------------------
  // TEST SUITE 5: FIRMWARE SECURITY & COMPILATION SANDBOX
  // -------------------------------------------------------------
  console.log('\n--- Suite 5: Firmware Compilation Sandbox & Security ---');
  const maliciousCode1 = `#include "/etc/shadow"\nvoid setup(){}\nvoid loop(){}`;
  const sec1 = firmwareSandbox.scanCodeSecurity(maliciousCode1);
  assert(sec1.safe === false, 'Security filter blocks illegal absolute path includes (/etc/shadow)');

  const maliciousCode2 = `void setup() { __asm__("int $0x80"); }\nvoid loop(){}`;
  const sec2 = firmwareSandbox.scanCodeSecurity(maliciousCode2);
  assert(sec2.safe === false, 'Security filter blocks inline assembly syscall execution');

  const badPinEsp32 = `void setup() { pinMode(34, OUTPUT); }\nvoid loop(){}`;
  const pinScan = firmwareSandbox.validateHardwarePins(badPinEsp32, 'esp32:esp32:esp32');
  assert(pinScan.valid === false, 'Hardware pin validator blocks pinMode(34, OUTPUT) on ESP32');

  const cleanArduinoCode = `#include <Arduino.h>\nconst int LED_PIN = 13;\nvoid setup() {\n  pinMode(LED_PIN, OUTPUT);\n}\nvoid loop() {\n  digitalWrite(LED_PIN, HIGH);\n  delay(500);\n  digitalWrite(LED_PIN, LOW);\n  delay(500);\n}`;
  const compileClean = await firmwareSandbox.compileFirmware(cleanArduinoCode, 'arduino:avr:uno');
  assert(compileClean.success === true, 'Clean Arduino firmware passes compilation sandbox');

  // -------------------------------------------------------------
  // TEST SUITE 6: COST BOM ENGINE & INTENT ROUTER
  // -------------------------------------------------------------
  console.log('\n--- Suite 6: BOM Generator & Intent Router ---');
  const bom = costBomEngine.generateBom([
    { id: '1', partNumber: 'esp32-wroom-32' },
    { id: '2', partNumber: 'dht22' },
    { id: '3', partNumber: 'resistor-carbon' },
  ]);
  assert(bom.totalQuantity === 3, 'BOM calculates correct total quantity');
  assert(bom.totalCostUsd > 5.0, 'BOM calculates realistic component costs');
  assert(bom.markdownTable.includes('ESP32-WROOM-32E'), 'BOM table includes formatted part numbers');

  const routePanel = intentRouter.route('Design a 100A subpanel with 20A kitchen circuit and 15A lighting');
  assert(routePanel.domain === 'ELECTRICAL_PANEL_MCB', 'Intent router identifies ELECTRICAL_PANEL_MCB');

  const routeCircuit = intentRouter.route('Create an ultrasonic distance sensor with ESP32');
  assert(routeCircuit.domain === 'DIGITAL_LOGIC_CIRCUIT', 'Intent router identifies DIGITAL_LOGIC_CIRCUIT');

  // -------------------------------------------------------------
  // TEST SUITE 7: END-TO-END ORCHESTRATOR PIPELINE
  // -------------------------------------------------------------
  console.log('\n--- Suite 7: End-to-End Orchestrator Pipeline ---');
  const orchResult = await kittOrchestrator.handleCoreChatRequest({
    messages: [{ role: 'user', content: 'Build a plant watering monitor with ESP32 and capacitive soil sensor' }],
  });
  assert(orchResult.reply.length > 50, 'Orchestrator generates comprehensive response');
  assert(orchResult.proposedPatch !== undefined, 'Orchestrator generates frontend-compatible CIR proposedPatch');
  assert(orchResult.bom !== undefined, 'Orchestrator includes itemized BOM');
  assert(orchResult.reply.includes('Bill of Materials'), 'Response includes formatted BOM section');

  const panelOrchResult = await kittOrchestrator.handleCoreChatRequest({
    messages: [{ role: 'user', content: 'Design a 100A subpanel with 20A kitchen circuit and 16A lighting' }],
  });
  assert(panelOrchResult.panelReport !== undefined, 'Orchestrator generates electrical panel report');
  assert(panelOrchResult.reply.includes('Electrical Panel Engineering Telemetry'), 'Response includes electrical panel telemetry');

  // -------------------------------------------------------------
  // TEST SUITE 8: LLM JSON EXTRACTION & REPAIR
  // -------------------------------------------------------------
  // These cases reproduce real NVIDIA NIM replies that previously produced an
  // empty circuit: raw newlines inside JSON strings, a code fence nested inside
  // a string value (firmware source), and a reply truncated at the token limit.
  console.log('\n--- Suite 8: LLM JSON Extraction & Repair ---');

  const plain = extractJsonDetailed('{"intent":"TECHNICAL_QNA","explanation":"ok","actions":[]}');
  assert(plain.value?.intent === 'TECHNICAL_QNA', 'Extracts a plain JSON object');

  // Raw newline inside a string value (illegal JSON, emitted constantly by chat models)
  const rawNewlines = '{\n  "intent": "DIGITAL_LOGIC_CIRCUIT",\n  "explanation": "line one\nline two",\n  "actions": []\n}';
  const repairedNewlines = extractJsonDetailed(rawNewlines);
  assert(repairedNewlines.value !== null, 'Repairs raw newlines inside string values');
  assert(repairedNewlines.value?.explanation === 'line one\nline two', 'Preserves the newline content after repair');

  // A code fence appearing INSIDE a string value must not truncate the payload
  const fenceInsideString =
    '{"intent":"DIGITAL_LOGIC_CIRCUIT","explanation":"Use this:\n```cpp\nvoid setup(){}\n```\ndone","actions":[{"actionType":"create_component","payload":{"id":"a"}}]}';
  const fenceParsed = extractJsonDetailed(fenceInsideString);
  assert(fenceParsed.value !== null, 'Handles a markdown fence nested inside a string value');
  assert(fenceParsed.value?.actions?.length === 1, 'Retains actions after nested-fence repair');

  // Trailing comma before a closing token
  const trailingComma = '{"intent":"TECHNICAL_QNA","actions":[{"actionType":"create_component","payload":{"id":"a"},}],}';
  assert(extractJsonDetailed(trailingComma).value !== null, 'Removes trailing commas');

  // Regression: a *legitimate* comma inside a string value must survive repair.
  // An earlier string-unaware /,(\s*[}\]])/ rewrite deleted it, corrupting the
  // explanation in exactly the replies that needed repair.
  const commaInString =
    '{"intent":"TECHNICAL_QNA","explanation":"Wire the pull-up across\nVCC and pin 1, }","actions":[]}';
  const commaResult = extractJsonDetailed(commaInString);
  assert(commaResult.value !== null, 'Repairs while preserving commas inside string values');
  assert(
    commaResult.value?.explanation === 'Wire the pull-up across\nVCC and pin 1, }',
    'Keeps a comma that precedes a closing brace inside a string',
    `got: ${JSON.stringify(commaResult.value?.explanation)}`
  );

  // Regression: a reply with no JSON structure at all is retryable, not malformed.
  const proseOnly = extractJsonDetailed('Hello, I cannot help with that request.');
  assert(proseOnly.value === null, 'Rejects a prose-only reply');
  assert(proseOnly.truncated === true, 'Flags a brace-less reply as truncatable (retryable)');

  // Braces in prose before the real object must not defeat the scan.
  const proseThenJson =
    'Note {not json} then the answer:\n{"intent":"TECHNICAL_QNA","explanation":"real","actions":[]}';
  assert(
    extractJsonDetailed(proseThenJson).value?.explanation === 'real',
    'Skips an invalid brace-balanced slice and finds the real JSON object'
  );

  // Genuinely wrapped markdown fence
  const wrapped = '```json\n{"intent":"TECHNICAL_QNA","explanation":"x","actions":[]}\n```';
  assert(extractJsonDetailed(wrapped).value?.intent === 'TECHNICAL_QNA', 'Unwraps a wrapping markdown fence');

  // Truncated at the token limit -> must be reported as truncated, not silently null
  const truncated = '{"intent":"DIGITAL_LOGIC_CIRCUIT","explanation":"This design uses an ESP32","actions":[{"actionType":"create_comp';
  const truncatedResult = extractJsonDetailed(truncated);
  assert(truncatedResult.value === null, 'Rejects a truncated JSON payload');
  assert(truncatedResult.truncated === true, 'Flags a truncated payload as truncated (retryable)');

  // Leading prose before the JSON
  const withProse = 'Sure! Here is the design:\n{"intent":"TECHNICAL_QNA","explanation":"x","actions":[]}';
  assert(extractJsonDetailed(withProse).value?.intent === 'TECHNICAL_QNA', 'Skips leading prose before the JSON');

  // The contract must actually be wired into what the model receives
  assert(
    HARDWARE_CONTRACT_TEXT.includes('"actionType"') && HARDWARE_CONTRACT_TEXT.includes('"payload"'),
    'Hardware contract documents the {actionType, payload} shape the validator requires'
  );
  assert(
    HARDWARE_CONTRACT_TEXT.includes('connect_pins') && HARDWARE_CONTRACT_TEXT.includes('create_breaker'),
    'Hardware contract enumerates digital and panel action types'
  );

  console.log('\n======================================================');
  console.log(`📊 FINAL RESULTS: ${passedTests}/${totalTests} TESTS PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log('======================================================\n');

  if (passedTests === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runAllTests().catch(err => {
  console.error('Test runner encountered unexpected fatal error:', err);
  process.exit(1);
});
