/**
 * KITT Hardware Intent Router
 * Classifies natural language prompts into specialized engineering pipelines.
 */

import { HardwareDomain } from './schemas/actionSchema';

export interface RouteResult {
  domain: HardwareDomain;
  confidence: number;
  entities: string[];
  suggestedMcu?: string;
  hasElectricalPanelKeywords: boolean;
}

export class IntentRouter {
  public route(prompt: string): RouteResult {
    const p = prompt.toLowerCase();
    const entities: string[] = [];

    // 1. Electrical Panel & MCB domain check
    const panelKeywords = [
      'breaker',
      'mcb',
      'subpanel',
      'panelboard',
      'busbar',
      'load center',
      'ampacity',
      'wire gauge',
      'double tap',
      'phase imbalance',
      '100a',
      '200a',
      'rcd',
      'gfci',
      'distribution board',
      'branch circuit',
    ];

    let panelScore = 0;
    panelKeywords.forEach(kw => {
      if (p.includes(kw)) {
        panelScore++;
        entities.push(kw);
      }
    });

    if (panelScore >= 1 && !p.includes('breadboard') && !p.includes('esp32') && !p.includes('arduino')) {
      return {
        domain: 'ELECTRICAL_PANEL_MCB',
        confidence: Math.min(1.0, 0.6 + panelScore * 0.15),
        entities,
        hasElectricalPanelKeywords: true,
      };
    }

    // 2. Pure Firmware compilation check
    if (
      (p.includes('compile') || p.includes('verify code') || p.includes('compiler error') || p.includes('firmware')) &&
      !p.includes('build circuit') &&
      !p.includes('schematic')
    ) {
      return {
        domain: 'FIRMWARE_COMPILATION',
        confidence: 0.9,
        entities: ['firmware_compile'],
        hasElectricalPanelKeywords: false,
      };
    }

    // 3. Digital Logic / Microcontroller Circuit Synthesis check
    const circuitKeywords = [
      'build',
      'create',
      'wire',
      'synthesize',
      'schematic',
      'breadboard',
      'sensor',
      'arduino',
      'esp32',
      'pico',
      'rp2040',
      'stm32',
      'gate',
      'adder',
      'counter',
      '555',
      'timer',
      'radar',
      'servo',
      'dht',
      'ultrasonic',
      'mosfet',
      'transistor',
      'logic',
      'relay',
    ];

    let circuitScore = 0;
    let suggestedMcu: string | undefined = undefined;

    if (p.includes('esp32')) suggestedMcu = 'esp32:esp32:esp32';
    else if (p.includes('uno') || p.includes('arduino')) suggestedMcu = 'arduino:avr:uno';
    else if (p.includes('pico') || p.includes('rp2040')) suggestedMcu = 'rp2040:rp2040:rp2040';

    circuitKeywords.forEach(kw => {
      if (p.includes(kw)) {
        circuitScore++;
        entities.push(kw);
      }
    });

    if (circuitScore >= 1) {
      return {
        domain: 'DIGITAL_LOGIC_CIRCUIT',
        confidence: Math.min(1.0, 0.5 + circuitScore * 0.1),
        entities,
        suggestedMcu,
        hasElectricalPanelKeywords: false,
      };
    }

    // 4. Default to Technical Q&A
    return {
      domain: 'TECHNICAL_QNA',
      confidence: 0.8,
      entities,
      suggestedMcu,
      hasElectricalPanelKeywords: false,
    };
  }
}

export const intentRouter = new IntentRouter();
