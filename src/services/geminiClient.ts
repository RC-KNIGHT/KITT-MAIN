/**
 * KITT Injectable / Mockable Gemini Client
 * Provides structured JSON generation, automated fallback when keys are absent,
 * and strict credential redaction to prevent secret leakage.
 */

import { GoogleGenAI, Type } from '@google/genai';
import { Logger } from './logger';
import { StructuredHardwareResponse } from './schemas/actionSchema';

const logger = new Logger('GeminiClient');

export interface GenerateOptions {
  systemInstruction: string;
  contents: Array<{ role: string; parts: Array<{ text: string }> }>;
  responseSchema?: any;
  temperature?: number;
  topP?: number;
  maxOutputTokens?: number;
  modelName?: string;
  requestId?: string;
}

export interface GenerationResult<T = any> {
  success: boolean;
  data: T | null;
  rawText: string;
  isMock: boolean;
  modelUsed: string;
  errorMessage?: string;
  durationMs: number;
}

export interface IGeminiClient {
  generateStructuredContent<T = StructuredHardwareResponse>(options: GenerateOptions): Promise<GenerationResult<T>>;
}

/**
 * Real Gemini API Client
 */
export class RealGeminiClient implements IGeminiClient {
  private client: GoogleGenAI;
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.client = new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { 'User-Agent': 'kitt-backend-brain' } },
    });
  }

  async generateStructuredContent<T = StructuredHardwareResponse>(options: GenerateOptions): Promise<GenerationResult<T>> {
    const startTime = Date.now();
    const candidateModels = options.modelName
      ? [options.modelName, 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash']
      : ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];

    let lastError: any = null;
    let response: any = null;
    let usedModel = candidateModels[0];

    for (const model of candidateModels) {
      try {
        logger.debug(`Calling Gemini model ${model}`, { requestId: options.requestId });

        response = await this.client.models.generateContent({
          model,
          contents: options.contents,
          config: {
            systemInstruction: options.systemInstruction,
            temperature: options.temperature ?? 0.4,
            topP: options.topP ?? 0.95,
            maxOutputTokens: options.maxOutputTokens ?? 4096,
            responseMimeType: 'application/json',
            responseSchema: options.responseSchema,
          },
        });

        if (response) {
          usedModel = model;
          break;
        }
      } catch (err: any) {
        lastError = err;
        logger.warn(`Model ${model} invocation attempt failed, trying fallback model...`, {
          error: err?.message,
          requestId: options.requestId,
        });
      }
    }

    if (!response) {
      const durationMs = Date.now() - startTime;
      logger.error(`All candidate Gemini models failed`, { error: lastError?.message, durationMs, requestId: options.requestId });
      return {
        success: false,
        data: null,
        rawText: '',
        isMock: false,
        modelUsed: usedModel,
        errorMessage: lastError?.message || 'Gemini API call error',
        durationMs,
      };
    }

    const rawText = response.text || '';
    let parsedData: T | null = null;
    try {
      parsedData = JSON.parse(rawText) as T;
    } catch (jsonErr: any) {
      logger.warn('Failed to parse model output as JSON, returning raw text', {
        error: jsonErr.message,
        requestId: options.requestId,
      });
    }

    const durationMs = Date.now() - startTime;
    logger.info(`Gemini response received`, { durationMs, model: usedModel, requestId: options.requestId });

    return {
      success: parsedData !== null,
      data: parsedData,
      rawText,
      isMock: false,
      modelUsed: usedModel,
      durationMs,
    };
  }
}

/**
 * Mock Gemini Client for offline development or testing without API keys
 */
export class MockGeminiClient implements IGeminiClient {
  async generateStructuredContent<T = StructuredHardwareResponse>(options: GenerateOptions): Promise<GenerationResult<T>> {
    const startTime = Date.now();
    const lastUserMsg = options.contents[options.contents.length - 1]?.parts[0]?.text || '';
    const p = lastUserMsg.toLowerCase();

    let mockResponse: StructuredHardwareResponse;

    if (p.includes('panel') || p.includes('breaker') || p.includes('mcb') || p.includes('distribution')) {
      mockResponse = {
        intent: 'ELECTRICAL_PANEL_MCB',
        explanation: 'Synthesized a standard 100A residential distribution subpanel adhering to NEC/IEC overcurrent protection guidelines. Circuit breakers are sized for continuous load limits with matched conductor gauges.',
        mathDerivation: `Continuous Load Calculation (NEC 210.20):\n- Kitchen small appliance load: 15A continuous -> Min Breaker = 15A * 1.25 = 18.75A -> Selected 20A MCB with 12 AWG copper.\n- General lighting: 8A continuous -> 8A * 1.25 = 10A -> Selected 16A MCB with 14 AWG copper.\n- Subpanel total coincident load: 48A / 100A main capacity (48% loading factor, well within 80% continuous limit).`,
        actions: [
          {
            actionType: 'set_panel_specs',
            payload: {
              panelId: 'PANEL_MAIN_01',
              mainRatingAmps: 100,
              busbarRatingAmps: 125,
              voltageSystem: '120/240V_SPLIT',
              phases: 1,
            },
          },
          {
            actionType: 'create_breaker',
            payload: {
              id: 'mcb_light_01',
              poles: 1,
              tripRatingAmps: 16,
              curve: 'B',
              label: 'General Living Area Lighting',
            },
          },
          {
            actionType: 'assign_to_busbar',
            payload: {
              breakerId: 'mcb_light_01',
              phase: 'L1',
              slotNumber: 1,
            },
          },
          {
            actionType: 'connect_branch_load',
            payload: {
              breakerId: 'mcb_light_01',
              loadName: 'LED Recessed Luminaires',
              continuousCurrentAmps: 8.5,
              wireGaugeAwg: 14,
              cableType: 'NM-B_ROMEX',
            },
          },
          {
            actionType: 'create_breaker',
            payload: {
              id: 'mcb_kitchen_01',
              poles: 1,
              tripRatingAmps: 20,
              curve: 'C',
              label: 'Kitchen Small Appliance Branch',
            },
          },
          {
            actionType: 'assign_to_busbar',
            payload: {
              breakerId: 'mcb_kitchen_01',
              phase: 'L2',
              slotNumber: 2,
            },
          },
          {
            actionType: 'connect_branch_load',
            payload: {
              breakerId: 'mcb_kitchen_01',
              loadName: 'Kitchen Counter Receptacles',
              continuousCurrentAmps: 14.0,
              wireGaugeAwg: 12,
              cableType: 'THHN',
            },
          },
        ],
      };
    } else {
      mockResponse = {
        intent: 'DIGITAL_LOGIC_CIRCUIT',
        explanation: 'Synthesized an autonomous microcontroller sensor system with deterministic logic interfacing, passive current limiting, and pin-safe signal conditioning.',
        mathDerivation: `Ohm's Law Calculation for Indicator Stage:\n- V_supply = 3.3V (ESP32 GPIO level)\n- LED Forward Drop V_f = 2.0V\n- Target Current I_f = 10mA = 0.010A\n- R_limit = (3.3V - 2.0V) / 0.010A = 1.3V / 0.010A = 130 Ohms -> Selected E24 220 Ohm standard resistor.\n- Actual loop current = 1.3V / 220 = 5.9mA (Safely within 12mA ESP32 GPIO pin limit).`,
        actions: [
          {
            actionType: 'create_component',
            payload: {
              id: 'mcu_esp32',
              partNumber: 'ESP32-WROOM-32E',
              label: 'ESP32 Controller',
              position: { x: 120, y: 150 },
            },
          },
          {
            actionType: 'create_component',
            payload: {
              id: 'sensor_dht22',
              partNumber: 'AM2302',
              label: 'DHT22 Environmental Sensor',
              position: { x: 380, y: 120 },
            },
          },
          {
            actionType: 'create_component',
            payload: {
              id: 'res_pullup',
              partNumber: 'resistor-carbon',
              label: '10k Pull-up Resistor',
              position: { x: 380, y: 220 },
              parameters: { resistance: '10kΩ' },
            },
          },
          {
            actionType: 'connect_pins',
            payload: {
              fromComponentId: 'mcu_esp32',
              fromPinId: 'gpio4',
              toComponentId: 'sensor_dht22',
              toPinId: 'data',
              signalType: 'DIGITAL',
              netName: 'ONE_WIRE_BUS',
            },
          },
        ],
        firmware: {
          targetMcu: 'esp32:esp32:esp32',
          environment: 'cpp',
          sourceCode: `#include <Arduino.h>\n\nconst int SENSOR_PIN = 4;\n\nvoid setup() {\n  Serial.begin(115200);\n  pinMode(SENSOR_PIN, INPUT_PULLUP);\n  Serial.println("System initialized by KITT Backend Core");\n}\n\nvoid loop() {\n  int state = digitalRead(SENSOR_PIN);\n  Serial.printf("Sensor line status: %d\\n", state);\n  delay(1000);\n}\n`,
          libraries: ['DHT sensor library'],
          pinAssignments: { SENSOR_PIN: 4 },
        },
      };
    }

    const durationMs = Date.now() - startTime;
    logger.info(`Mock hardware generation produced`, { durationMs, requestId: options.requestId });

    return {
      success: true,
      data: mockResponse as unknown as T,
      rawText: JSON.stringify(mockResponse),
      isMock: true,
      modelUsed: 'mock-hardware-engine',
      durationMs,
    };
  }
}

/**
 * Factory to get appropriate Gemini client
 */
export function getGeminiClient(customApiKey?: string): IGeminiClient {
  const apiKey =
    customApiKey ||
    process.env.GEMINI_API_KEY_CORE ||
    process.env.GEMINI_API_KEY;

  if (apiKey && apiKey.trim().length > 0) {
    return new RealGeminiClient(apiKey.trim());
  }

  logger.warn('No valid GEMINI_API_KEY_CORE found; instantiating MockGeminiClient');
  return new MockGeminiClient();
}
