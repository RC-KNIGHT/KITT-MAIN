/**
 * Explicit JSON contract for structured hardware generation.
 *
 * The orchestrator's system prompts *name* the available action types but never
 * describe their shape. Language models then invent their own (for example
 * `{"action":"create_component","componentId":"esp32"}`), which
 * `validateAndRepairHardwareResponse` discards because it requires
 * `{ actionType, payload }`. The result is a technically "valid" response with
 * zero actions -- an empty circuit and a dead AI studio.
 *
 * Passing this schema to the provider closes that gap. The field names and
 * allowed values here mirror `schemas/actionSchema.ts` exactly; keep the two in
 * sync when the validator changes.
 */

/** Allowed `intent` values (mirrors HardwareDomain). */
export const HARDWARE_INTENTS = [
  'DIGITAL_LOGIC_CIRCUIT',
  'ELECTRICAL_PANEL_MCB',
  'FIRMWARE_COMPILATION',
  'TECHNICAL_QNA',
] as const;

/**
 * JSON Schema for a full StructuredHardwareResponse, expressed in the plain
 * subset that chat models follow reliably.
 */
export const STRUCTURED_HARDWARE_SCHEMA = {
  type: 'object',
  required: ['intent', 'explanation', 'actions'],
  additionalProperties: true,
  properties: {
    intent: {
      type: 'string',
      enum: HARDWARE_INTENTS,
      description: 'Domain of the request. Use DIGITAL_LOGIC_CIRCUIT for circuits with MCUs/sensors.',
    },
    explanation: {
      type: 'string',
      description: 'Authoritative engineering explanation in Markdown. Required and must not be empty.',
    },
    mathDerivation: {
      type: 'string',
      description: "Optional math: Ohm's law, voltage dividers, RC tau, thermal dissipation.",
    },
    actions: {
      type: 'array',
      description:
        'Atomic hardware mutations. EVERY element MUST have exactly the shape {"actionType": string, "payload": object}. Do NOT use "action", "componentId" or "type" at the top level.',
      items: {
        type: 'object',
        required: ['actionType', 'payload'],
        properties: {
          actionType: {
            type: 'string',
            enum: [
              'create_component',
              'connect_pins',
              'delete_component',
              'move_component',
              'set_property',
              'generate_firmware',
              'create_breaker',
              'assign_to_busbar',
              'connect_branch_load',
              'set_panel_specs',
              'set_breaker_rating',
            ],
          },
          payload: {
            type: 'object',
            description:
              'Fields depend on actionType: create_component={id,partNumber,label,category,position:{x,y},rotation,parameters}; connect_pins={fromComponentId,fromPinId,toComponentId,toPinId,signalType,netName}; delete_component={componentId}; move_component={componentId,position:{x,y}}; set_property={componentId,key,value}; create_breaker={id,poles,tripRatingAmps,curve,label}.',
          },
        },
      },
    },
    firmware: {
      type: 'object',
      required: ['targetMcu', 'sourceCode'],
      properties: {
        targetMcu: { type: 'string', description: 'e.g. esp32:esp32:esp32 or arduino:avr:uno' },
        environment: { type: 'string', enum: ['arduino', 'cpp', 'micropython', 'espidf'] },
        sourceCode: { type: 'string', description: 'Complete, compilable firmware source.' },
        libraries: { type: 'array', items: { type: 'string' } },
        pinAssignments: { type: 'object' },
      },
    },
  },
} as const;

/**
 * A single worked example. Models follow a concrete instance far more reliably
 * than a schema alone, and this is the exact shape the validator accepts.
 */
export const STRUCTURED_HARDWARE_EXAMPLE = {
  intent: 'DIGITAL_LOGIC_CIRCUIT',
  explanation: 'Markdown explanation of the design.',
  mathDerivation: 'R = (Vsupply - Vf) / If',
  actions: [
    {
      actionType: 'create_component',
      payload: { id: 'mcu_1', partNumber: 'ESP32-WROOM-32E', label: 'ESP32 Controller', position: { x: 100, y: 150 } },
    },
    {
      actionType: 'create_component',
      payload: { id: 'res_1', partNumber: 'resistor-220', label: '220Ω LED Resistor', position: { x: 300, y: 150 } },
    },
    {
      actionType: 'connect_pins',
      payload: {
        fromComponentId: 'mcu_1',
        fromPinId: 'GPIO23',
        toComponentId: 'res_1',
        toPinId: 'pin1',
        signalType: 'DIGITAL',
        netName: 'LED_DRIVE',
      },
    },
  ],
  firmware: {
    targetMcu: 'esp32:esp32:esp32',
    environment: 'arduino',
    sourceCode: 'void setup() {} void loop() {}',
    libraries: [],
    pinAssignments: { LED: 23 },
  },
} as const;

/**
 * Compact text form of the contract.
 *
 * Deliberately short: a verbose prompt measurably increases how long these
 * models talk, which pushes the JSON past the token ceiling and truncates it.
 */
export const HARDWARE_CONTRACT_TEXT = `Return exactly one JSON object with this structure:

{
  "intent": ${HARDWARE_INTENTS.map(i => `"${i}"`).join(' | ')},
  "explanation": "Markdown engineering explanation (required, non-empty)",
  "mathDerivation": "optional LaTeX/plain maths",
  "actions": [ ... ],
  "firmware": { "targetMcu": "esp32:esp32:esp32", "environment": "arduino", "sourceCode": "full code", "libraries": [], "pinAssignments": {} }
}

EVERY element of "actions" MUST be exactly { "actionType": string, "payload": object }.
Do NOT use "action", "componentId" or "type" as top-level keys of an action.

Action payload shapes by actionType:
- "create_component": { "id", "partNumber", "label", "category", "position": {"x":number,"y":number}, "parameters": {} }
- "connect_pins":     { "fromComponentId", "fromPinId", "toComponentId", "toPinId", "signalType", "netName" }
- "delete_component": { "componentId" }
- "move_component":   { "componentId", "position": {"x":number,"y":number} }
- "set_property":     { "componentId", "key", "value" }
- "create_breaker":   { "id", "poles", "tripRatingAmps", "curve", "label" }
- "assign_to_busbar": { "breakerId", "phase", "slotNumber" }
- "connect_branch_load": { "breakerId", "loadName", "continuousCurrentAmps", "wireGaugeAwg" }
- "set_panel_specs":  { "panelId", "mainRatingAmps", "busbarRatingAmps", "voltageSystem", "phases" }
- "generate_firmware": { "targetMcu", "environment", "sourceCode", "libraries", "pinAssignments" }

Valid example (shape only, not content to copy):

${JSON.stringify(
  {
    intent: 'DIGITAL_LOGIC_CIRCUIT',
    explanation: 'Design summary.',
    mathDerivation: 'R = (Vs - Vf) / If',
    actions: [
      { actionType: 'create_component', payload: { id: 'mcu_1', partNumber: 'ESP32-WROOM-32E', label: 'ESP32', position: { x: 100, y: 150 } } },
      { actionType: 'create_component', payload: { id: 'led_1', partNumber: 'led-red', label: 'Status LED', position: { x: 300, y: 150 } } },
      { actionType: 'connect_pins', payload: { fromComponentId: 'mcu_1', fromPinId: 'GPIO23', toComponentId: 'led_1', toPinId: 'ANODE', signalType: 'DIGITAL', netName: 'LED_DRIVE' } },
    ],
  },
  null,
  0
)}`;
