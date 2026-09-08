import React, { useState } from 'react';
import { 
  Code2, 
  Copy, 
  Check, 
  ExternalLink
} from 'lucide-react';

interface CodeVariant {
  id: string;
  command: string;
  explanation: string;
  code: string;
  diffSummary: string;
}

const CODE_VARIANTS: CodeVariant[] = [
  {
    id: 'standard',
    command: 'Generate the baseline Arduino / ESP32 firmware.',
    explanation: 'Synthesized non-blocking hysteresis loop with 12-bit analog sampling on GPIO34 and PWM motor drive.',
    diffSummary: 'Baseline firmware generated from 3D breadboard pinout.',
    code: `// KITT AI Autonomous Firmware Generator
// Target: ESP32-WROOM-32 | Auto-synced with Breadboard netlist
#include <Arduino.h>

const int PIN_SOIL_ADC = 34; // Analog capacitive moisture probe
const int PIN_MOSFET   = 26; // IRLZ44N Low-side Gate PWM
const int PUMP_DRIVE_MS = 3000;
const int THRESHOLD_DRY = 1850;

void setup() {
  Serial.begin(115200);
  pinMode(PIN_MOSFET, OUTPUT);
  digitalWrite(PIN_MOSFET, LOW);
  analogReadResolution(12);
  Serial.println("[KITT] Hydration Subsystem Online");
}

void loop() {
  int rawValue = analogRead(PIN_SOIL_ADC);
  if (rawValue < THRESHOLD_DRY) {
    Serial.printf("[ALERT] Soil moisture low (%d). Engaging pump.\\n", rawValue);
    digitalWrite(PIN_MOSFET, HIGH);
    delay(PUMP_DRIVE_MS);
    digitalWrite(PIN_MOSFET, LOW);
    delay(10000); // Wait for water diffusion
  }
  delay(1000);
}`
  },
  {
    id: 'battery-save',
    command: 'Optimize for battery life: add deep sleep for 1 hour.',
    explanation: 'Integrated ESP32 deep-sleep RTC timer. Wakes up once per hour, samples ADC in 50ms, then enters 10µA deep sleep.',
    diffSummary: '+ esp_sleep_enable_timer_wakeup(3600ULL * 1000000ULL); - delay loops',
    code: `// KITT AI Deep-Sleep Power Optimization
#include <Arduino.h>

#define uS_TO_S_FACTOR 1000000ULL  // Conversion factor micro to seconds
#define TIME_TO_SLEEP  3600        // Sleep for 1 hour (3600 seconds)
const int PIN_SOIL_ADC = 34;
const int PIN_MOSFET   = 26;

void setup() {
  Serial.begin(115200);
  pinMode(PIN_MOSFET, OUTPUT);
  digitalWrite(PIN_MOSFET, LOW);

  // Fast ADC sampling before radio or peripherals initialize
  int rawValue = analogRead(PIN_SOIL_ADC);
  if (rawValue < 1850) {
    digitalWrite(PIN_MOSFET, HIGH);
    delay(3000);
    digitalWrite(PIN_MOSFET, LOW);
  }

  // Configure Deep Sleep for 3600 seconds (Current drops to 10µA)
  esp_sleep_enable_timer_wakeup(TIME_TO_SLEEP * uS_TO_S_FACTOR);
  Serial.println("[KITT] Entering Ultra-Low Power Deep Sleep...");
  Serial.flush();
  esp_deep_sleep_start();
}

void loop() {} // Unused in deep sleep state machine`
  },
  {
    id: 'wifi-mqtt',
    command: 'Add Wi-Fi MQTT telemetry publishing.',
    explanation: 'Adds non-blocking Wi-Fi reconnect and JSON telemetry payload publishing to home automation broker.',
    diffSummary: '+ WiFiClient & PubSubClient + JSON telemetry payload',
    code: `// KITT AI Wi-Fi MQTT IoT Telemetry Extension
#include <WiFi.h>
#include <PubSubClient.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* mqtt_server = "192.168.1.50";
WiFiClient espClient;
PubSubClient client(espClient);

const int PIN_SOIL_ADC = 34;
const int PIN_MOSFET   = 26;

void publishTelemetry(int moisture) {
  char payload[64];
  snprintf(payload, sizeof(payload), "{\\"moisture\\":%d,\\"unit\\":\\"raw\\"}", moisture);
  client.publish("home/plants/soil_1", payload);
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_MOSFET, OUTPUT);
  WiFi.begin(ssid, "password");
  client.setServer(mqtt_server, 1883);
}

void loop() {
  if (!client.connected()) reconnectMQTT();
  client.loop();
  int rawMoisture = analogRead(PIN_SOIL_ADC);
  publishTelemetry(rawMoisture);
  delay(5000);
}`
  }
];

export const AiCopilotCode: React.FC = () => {
  const [selectedVariant, setSelectedVariant] = useState<CodeVariant>(CODE_VARIANTS[0]);
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedVariant.code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <section id="ai-code" className="py-24 px-4 sm:px-6 lg:px-8 bg-transparent relative z-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold uppercase tracking-wider">
            <Code2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Copilot & Code Generation</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            AI ↔ Circuit ↔ Code ↔ Simulation. <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-emerald-400 bg-clip-text text-transparent">
              Always in Lockstep.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-slate-400">
            Tell KITT what logic you need. Firmware is synthesized directly from your active pin map with zero guesswork.
          </p>
        </div>

        {/* Interactive Copilot Code Box */}
        <div className="max-w-5xl mx-auto rounded-2xl bg-[#0e1017] border border-white/10 shadow-2xl overflow-hidden">
          
          {/* Code Viewer Header */}
          <div className="p-3 bg-[#141722] border-b border-white/10 flex items-center justify-end">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {isCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy C++</span>
                </>
              )}
            </button>
          </div>

          {/* Code Viewer */}
          <div className="relative bg-[#07080b] p-5 sm:p-6 overflow-x-auto">
            <pre className="font-mono text-xs sm:text-sm text-slate-200 leading-relaxed">
              <code>{selectedVariant.code}</code>
            </pre>
          </div>

          {/* Bottom Summary Strip */}
          <div className="p-4 bg-[#12141e] border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-slate-300">
              {selectedVariant.explanation}
            </span>

            <a
              href="https://kitt-ai-ravi.ai.studio"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1.5"
            >
              <span>Flash to Virtual MCU</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>
      </div>
    </section>
  );
};
