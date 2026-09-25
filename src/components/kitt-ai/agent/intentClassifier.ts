import { UserIntentType } from '../cir/cirTypes';

export interface ClassifiedIntent {
  intent: UserIntentType;
  confidence: number;
  extractedHardwareEntities: string[];
  suggestedAction?: 'prompt_workspace_choice' | 'open_2d' | 'open_3d' | 'apply_patch' | 'run_simulation' | 'open_measurements' | 'none';
  reasoningSummary: string;
}

export function classifyUserIntent(prompt: string, hasActiveCircuit: boolean = false): ClassifiedIntent {
  const p = prompt.trim().toLowerCase();

  // 1. Hardware Entities Extraction
  const entities: string[] = [];
  const knownKeywords = [
    'esp32', 'arduino', 'pico', 'rp2040', 'stm32',
    'resistor', 'capacitor', 'mosfet', 'transistor', 'diode', 'led',
    'soil moisture', 'ultrasonic', 'dht22', 'dht11', 'servo', 'pump',
    'motor', 'relay', 'buzzer', 'oled', 'lcd', '555 timer', 'shift register'
  ];
  knownKeywords.forEach(kw => {
    if (p.includes(kw)) entities.push(kw);
  });

  // 2. Intent Classification Checks

  // Intent 4: Modify Existing Circuit
  if (
    hasActiveCircuit &&
    (p.startsWith('change') || p.startsWith('replace') || p.startsWith('swap') || p.startsWith('add') ||
     p.startsWith('remove') || p.startsWith('modify') || p.startsWith('connect') || p.includes('resistor to') ||
     p.includes('instead of') || p.includes('use a') || p.includes('make it battery'))
  ) {
    return {
      intent: 'modify_circuit',
      confidence: 0.96,
      extractedHardwareEntities: entities,
      suggestedAction: 'apply_patch',
      reasoningSummary: 'Identified request to transactionally modify existing circuit parameters or topology.'
    };
  }

  // Intent 3: Build / Design Request
  const buildPatterns = [
    'build', 'make a circuit', 'create a circuit', 'design a', 'connect this',
    'make an arduino', 'make an esp32', 'hook up', 'wire a', 'construct a',
    'plant watering', 'radar', 'weather station', 'robot', 'alarm', 'controller'
  ];
  const isBuild = buildPatterns.some(pattern => p.includes(pattern));
  if (isBuild && entities.length > 0) {
    return {
      intent: 'build_request',
      confidence: 0.95,
      extractedHardwareEntities: entities,
      suggestedAction: 'prompt_workspace_choice',
      reasoningSummary: 'Detected hardware synthesis intent. Transitioning agent into Build Mode.'
    };
  }

  // Intent 5: Debug / Diagnose Circuit
  const debugPatterns = ['debug', 'why is', 'not working', 'hot', 'overheating', 'short circuit', 'fix wiring', 'troubleshoot', 'burned', 'smoke'];
  if (debugPatterns.some(pattern => p.includes(pattern))) {
    return {
      intent: 'debug_circuit',
      confidence: 0.91,
      extractedHardwareEntities: entities,
      suggestedAction: 'open_2d',
      reasoningSummary: 'Identified hardware diagnostic and troubleshooting inquiry.'
    };
  }

  // Intent 6: Simulation Request
  const simPatterns = ['simulate', 'run simulation', 'transient', 'waveform', 'frequency', 'oscilloscope', 'start simulation'];
  if (simPatterns.some(pattern => p.includes(pattern))) {
    return {
      intent: 'simulation_request',
      confidence: 0.94,
      extractedHardwareEntities: entities,
      suggestedAction: 'run_simulation',
      reasoningSummary: 'Identified electrical simulation or transient solver execution request.'
    };
  }

  // Intent 7: Firmware / Code Request
  const codePatterns = ['firmware', 'code', 'sketch', 'c++', 'micropython', 'arduino code', 'write code', 'library'];
  if (codePatterns.some(pattern => p.includes(pattern))) {
    return {
      intent: 'firmware_request',
      confidence: 0.92,
      extractedHardwareEntities: entities,
      suggestedAction: 'none',
      reasoningSummary: 'Identified firmware generation or HAL driver inspection request.'
    };
  }

  // Intent 8: Research Request
  const researchPatterns = ['datasheet', 'spec sheet', 'manufacturer', 'digikey', 'pinout of', 'max voltage for', 'operating limits'];
  if (researchPatterns.some(pattern => p.includes(pattern))) {
    return {
      intent: 'research_request',
      confidence: 0.90,
      extractedHardwareEntities: entities,
      suggestedAction: 'none',
      reasoningSummary: 'Identified engineering documentation and datasheet retrieval request.'
    };
  }

  // Intent 9: Physical Measurement
  const measurePatterns = ['measure', 'multimeter', 'voltage at', 'current through', 'probe', 'reading'];
  if (measurePatterns.some(pattern => p.includes(pattern))) {
    return {
      intent: 'physical_measurement',
      confidence: 0.93,
      extractedHardwareEntities: entities,
      suggestedAction: 'open_measurements',
      reasoningSummary: 'Identified circuit node probing and instrumentation inquiry.'
    };
  }

  // Intent 2: Electronics Question
  const theoryPatterns = ['ohm', 'kirchhoff', 'how does', 'what is', 'difference between', 'why do we use', 'pull-up', 'decoupling', 'pwm', 'i2c', 'spi'];
  if (theoryPatterns.some(pattern => p.includes(pattern))) {
    return {
      intent: 'electronics_question',
      confidence: 0.88,
      extractedHardwareEntities: entities,
      suggestedAction: 'none',
      reasoningSummary: 'Identified fundamental electrical engineering conceptual or educational question.'
    };
  }

  // Intent 1: General Conversation (Default)
  return {
    intent: 'general_conversation',
    confidence: 0.85,
    extractedHardwareEntities: entities,
    suggestedAction: 'none',
    reasoningSummary: 'Natural general conversation dialogue.'
  };
}
