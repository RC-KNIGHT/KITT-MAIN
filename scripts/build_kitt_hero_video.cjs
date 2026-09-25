const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WIDTH = 960;
const HEIGHT = 540;
const FPS = 25;
const DURATION = 10.0;
const TOTAL_FRAMES = Math.round(FPS * DURATION);

const FRAMES_DIR = path.join(__dirname, '../tmp_video_frames');
fs.mkdirSync(FRAMES_DIR, { recursive: true });

console.log(`Generating ${TOTAL_FRAMES} frames at ${WIDTH}x${HEIGHT} (${FPS} fps)...`);

function escapeXml(unsafe) {
  return String(unsafe).replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}

for (let f = 0; f < TOTAL_FRAMES; f++) {
  const t = f / FPS;
  let sceneSvg = '';

  // Subtitle matching canonical transcript
  let subtitle = '';
  if (t < 1.8) subtitle = 'You imagined it.';
  else if (t < 3.4) subtitle = 'Kitt built it.';
  else if (t < 5.2) subtitle = 'Simulated it. Tested it.';
  else if (t < 8.6) subtitle = 'Kitt. Where ideas become inventions.';
  else subtitle = 'KITT AI — Where Ideas Become Inventions';

  // SCENE 1 (0.0 - 1.8s): Developer typing in chair in front of monitor
  if (t < 1.8) {
    const fullText = "I want to build an automatic plant watering system.";
    const charCount = Math.min(fullText.length, Math.floor((t / 1.5) * fullText.length));
    const typedText = escapeXml(fullText.substring(0, charCount));
    const cursor = (Math.floor(t * 4) % 2 === 0) ? '&#x2588;' : '';

    sceneSvg = `
      <!-- Room & Ambient desk light -->
      <radialGradient id="deskGlow" cx="50%" cy="40%" r="55%">
        <stop offset="0%" stop-color="#3b1d60" stop-opacity="0.35" />
        <stop offset="60%" stop-color="#120c24" stop-opacity="0.15" />
        <stop offset="100%" stop-color="#07080c" stop-opacity="0" />
      </radialGradient>
      <rect width="${WIDTH}" height="${HEIGHT}" fill="#07080c" />
      <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#deskGlow)" />

      <!-- Desk surface -->
      <path d="M 0 460 L ${WIDTH} 460 L ${WIDTH} ${HEIGHT} L 0 ${HEIGHT} Z" fill="#0c0e14" />
      <line x1="0" y1="460" x2="${WIDTH}" y2="460" stroke="#2a2d3d" stroke-width="1.5" />

      <!-- Keyboard & Mouse on desk -->
      <rect x="360" y="475" width="240" height="42" rx="4" fill="#141721" stroke="#25293a" stroke-width="1" />
      <rect x="625" y="482" width="28" height="38" rx="14" fill="#181b26" stroke="#2e3447" stroke-width="1" />

      <!-- Monitor stand & base -->
      <rect x="460" y="380" width="40" height="80" fill="#181a24" />
      <rect x="420" y="450" width="120" height="12" rx="3" fill="#202330" stroke="#33374a" stroke-width="1" />

      <!-- Monitor Frame -->
      <rect x="190" y="70" width="580" height="320" rx="10" fill="#0d0f16" stroke="#2d3142" stroke-width="2" />
      <!-- Screen bezel inner -->
      <rect x="200" y="80" width="560" height="300" rx="6" fill="#090a10" />

      <!-- Screen Header inside monitor -->
      <rect x="200" y="80" width="560" height="32" fill="#10121a" />
      <circle cx="218" cy="96" r="4" fill="#ef4444" />
      <circle cx="230" cy="96" r="4" fill="#eab308" />
      <circle cx="242" cy="96" r="4" fill="#22c55e" />
      <text x="480" y="101" fill="#c084fc" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="12" text-anchor="middle">⚡ KITT AI</text>

      <!-- Question headline -->
      <text x="480" y="165" fill="#ffffff" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="22" text-anchor="middle">What do you want to build?</text>

      <!-- Input box -->
      <rect x="250" y="205" width="460" height="52" rx="8" fill="#131622" stroke="#a855f7" stroke-width="1.5" />
      <text x="270" y="237" fill="#f3e8ff" font-family="'Fira Code', monospace" font-size="13">${typedText} ${cursor}</text>

      <!-- Send button inside input box -->
      <circle cx="685" cy="231" r="16" fill="#9333ea" />
      <path d="M 685 224 L 680 232 L 690 232 Z" fill="#ffffff" />
      <line x1="685" y1="230" x2="685" y2="238" stroke="#ffffff" stroke-width="2" />

      <!-- Developer silhouette sitting in foreground -->
      <ellipse cx="280" cy="500" rx="90" ry="110" fill="#050608" />
      <circle cx="280" cy="380" r="46" fill="#050608" />
      <path d="M 234 380 Q 240 330 280 330 Q 320 330 326 380 Z" fill="#050608" />
    `;
  }
  // SCENE 2 (1.8 - 3.2s): KITT Architecture Synthesizer + [BUILD WITH KITT] Button
  else if (t < 3.2) {
    const mouseX = Math.min(480, 360 + (t - 1.8) * 100);
    const mouseY = Math.min(360, 240 + (t - 1.8) * 90);
    const isClicked = t > 2.7;

    sceneSvg = `
      <rect width="${WIDTH}" height="${HEIGHT}" fill="#08090e" />

      <!-- Grid lines -->
      <defs>
        <pattern id="gridPattern" width="30" height="30" patternUnits="userSpaceOnUse">
          <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(168,85,247,0.06)" stroke-width="1"/>
        </pattern>
      </defs>
      <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#gridPattern)" />

      <!-- KITT Response Card -->
      <rect x="160" y="40" width="640" height="420" rx="12" fill="#0f1118" stroke="rgba(168,85,247,0.3)" stroke-width="1.5" />

      <!-- User prompt pill -->
      <rect x="420" y="60" width="360" height="34" rx="6" fill="#1c182b" stroke="#7c3aed" stroke-width="1" />
      <text x="435" y="82" fill="#e9d5ff" font-family="'Plus Jakarta Sans', sans-serif" font-size="12">I want to build an automatic plant watering system.</text>

      <!-- KITT header -->
      <circle cx="195" cy="120" r="14" fill="#9333ea" />
      <text x="195" y="125" fill="#ffffff" font-family="'Plus Jakarta Sans', sans-serif" font-weight="bold" font-size="11" text-anchor="middle">K</text>
      <text x="220" y="125" fill="#ffffff" font-family="'Plus Jakarta Sans', sans-serif" font-weight="bold" font-size="14">AUTOMATIC PLANT WATERING SYSTEM</text>

      <!-- Component specs list -->
      <g fill="#cbd5e1" font-family="'Plus Jakarta Sans', sans-serif" font-size="12">
        <text x="220" y="152" fill="#a855f7" font-weight="bold">Components Selected:</text>
        <text x="220" y="172">• ESP32 Microcontroller (Dual-Core Wi-Fi / BLE)</text>
        <text x="220" y="192">• Capacitive Soil Moisture Sensor (Analog Probe)</text>
        <text x="220" y="212">• IRLZ44N N-Channel Logic-Level MOSFET</text>
        <text x="220" y="232">• 5V DC Submersible Water Pump + Flyback Diode</text>
      </g>

      <!-- System Architecture Diagram -->
      <g transform="translate(190, 260)">
        <!-- Box 1 -->
        <rect x="0" y="0" width="125" height="44" rx="6" fill="#161922" stroke="#10b981" stroke-width="1.5" />
        <text x="62" y="26" fill="#ffffff" font-family="'Plus Jakarta Sans', sans-serif" font-weight="bold" font-size="10" text-anchor="middle">SOIL SENSOR</text>

        <!-- Arrow 1 -->
        <line x1="125" y1="22" x2="165" y2="22" stroke="#a855f7" stroke-width="2" />
        <polygon points="165,22 157,18 157,26" fill="#a855f7" />

        <!-- Box 2 -->
        <rect x="165" y="0" width="115" height="44" rx="6" fill="#161922" stroke="#3b82f6" stroke-width="1.5" />
        <text x="222" y="26" fill="#ffffff" font-family="'Plus Jakarta Sans', sans-serif" font-weight="bold" font-size="10" text-anchor="middle">ESP32 MCU</text>

        <!-- Arrow 2 -->
        <line x1="280" y1="22" x2="320" y2="22" stroke="#a855f7" stroke-width="2" />
        <polygon points="320,22 312,18 312,26" fill="#a855f7" />

        <!-- Box 3 -->
        <rect x="320" y="0" width="130" height="44" rx="6" fill="#161922" stroke="#f59e0b" stroke-width="1.5" />
        <text x="385" y="26" fill="#ffffff" font-family="'Plus Jakarta Sans', sans-serif" font-weight="bold" font-size="10" text-anchor="middle">MOSFET DRIVER</text>

        <!-- Arrow 3 -->
        <line x1="450" y1="22" x2="490" y2="22" stroke="#a855f7" stroke-width="2" />
        <polygon points="490,22 482,18 482,26" fill="#a855f7" />

        <!-- Box 4 -->
        <rect x="490" y="0" width="90" height="44" rx="6" fill="#161922" stroke="#8b5cf6" stroke-width="1.5" />
        <text x="535" y="26" fill="#ffffff" font-family="'Plus Jakarta Sans', sans-serif" font-weight="bold" font-size="10" text-anchor="middle">PUMP</text>
      </g>

      <!-- [ BUILD WITH KITT ] Button -->
      <g transform="translate(370, 360)">
        <rect x="0" y="0" width="220" height="48" rx="24" fill="${isClicked ? '#7e22ce' : '#9333ea'}" stroke="#c084fc" stroke-width="${isClicked ? '3' : '1.5'}" />
        <text x="110" y="30" fill="#ffffff" font-family="'Plus Jakarta Sans', sans-serif" font-weight="bold" font-size="14" text-anchor="middle">[ BUILD WITH KITT ]</text>
        ${isClicked ? '<circle cx="110" cy="24" r="50" fill="none" stroke="#a855f7" stroke-width="2" opacity="0.6"/>' : ''}
      </g>

      <!-- Mouse Cursor -->
      <path d="M ${mouseX} ${mouseY} L ${mouseX + 14} ${mouseY + 14} L ${mouseX + 8} ${mouseY + 15} L ${mouseX + 12} ${mouseY + 24} L ${mouseX + 7} ${mouseY + 26} L ${mouseX + 3} ${mouseY + 17} L ${mouseX} ${mouseY + 20} Z" fill="#ffffff" stroke="#000000" stroke-width="1.5" />
    `;
  }
  // SCENE 3 (3.2 - 5.0s): 2D Schematic with [ 2D CIRCUIT ] Tab Active
  else if (t < 5.0) {
    sceneSvg = `
      <rect width="${WIDTH}" height="${HEIGHT}" fill="#0a0c12" />

      <!-- Blueprint coordinate grid -->
      <defs>
        <pattern id="cadGrid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(59,130,246,0.07)" stroke-width="1"/>
        </pattern>
      </defs>
      <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#cadGrid)" />

      <!-- Top Tabs Switcher -->
      <g transform="translate(360, 25)">
        <rect x="0" y="0" width="240" height="34" rx="8" fill="#141722" stroke="#2a2e42" stroke-width="1" />
        <!-- 2D Active Tab -->
        <rect x="2" y="2" width="116" height="30" rx="6" fill="#9333ea" />
        <text x="60" y="21" fill="#ffffff" font-family="'Plus Jakarta Sans', sans-serif" font-weight="bold" font-size="11" text-anchor="middle">[ 2D CIRCUIT ]</text>
        <!-- 3D Inactive Tab -->
        <text x="180" y="21" fill="#94a3b8" font-family="'Plus Jakarta Sans', sans-serif" font-weight="bold" font-size="11" text-anchor="middle">[ 3D PROTOTYPE ]</text>
      </g>

      <!-- ESP32 Schematic IC Block (U1) -->
      <g transform="translate(220, 140)">
        <rect x="0" y="0" width="180" height="220" rx="6" fill="#0d111a" stroke="#60a5fa" stroke-width="2" />
        <text x="90" y="115" fill="#ffffff" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="18" text-anchor="middle">ESP32</text>
        <text x="90" y="135" fill="#93c5fd" font-family="'Fira Code', monospace" font-size="10" text-anchor="middle">U1 (WROOM-32)</text>

        <!-- Pin leads on right -->
        <g font-family="'Fira Code', monospace" font-size="10" fill="#94a3b8">
          <line x1="180" y1="40" x2="220" y2="40" stroke="#60a5fa" stroke-width="1.5" />
          <text x="170" y="44" text-anchor="end">GPIO34 (ADC)</text>

          <line x1="180" y1="90" x2="220" y2="90" stroke="#60a5fa" stroke-width="1.5" />
          <text x="170" y="94" text-anchor="end">GPIO26 (PWM)</text>

          <line x1="180" y1="140" x2="220" y2="140" stroke="#ef4444" stroke-width="1.5" />
          <text x="170" y="144" text-anchor="end" fill="#f87171">3V3</text>

          <line x1="180" y1="180" x2="220" y2="180" stroke="#64748b" stroke-width="1.5" />
          <text x="170" y="184" text-anchor="end">GND</text>
        </g>
      </g>

      <!-- Wiring traces to MOSFET Q1 -->
      <g>
        <!-- Wire from GPIO26 to Q1 Gate -->
        <path d="M 440 230 L 530 230 L 530 260" fill="none" stroke="#f59e0b" stroke-width="2" />
        <circle cx="440" cy="230" r="3" fill="#f59e0b" />

        <!-- MOSFET Q1 Symbol -->
        <rect x="500" y="260" width="60" height="60" rx="4" fill="#131722" stroke="#f59e0b" stroke-width="1.5" />
        <text x="530" y="285" fill="#f59e0b" font-family="'Fira Code', monospace" font-weight="bold" font-size="11" text-anchor="middle">Q1</text>
        <text x="530" y="302" fill="#cbd5e1" font-family="'Fira Code', monospace" font-size="9" text-anchor="middle">IRLZ44N</text>

        <!-- Wire to 5V Pump -->
        <path d="M 560 290 L 640 290 L 640 230" fill="none" stroke="#8b5cf6" stroke-width="2" />
        <circle cx="640" cy="230" r="30" fill="#1b1730" stroke="#a855f7" stroke-width="2" />
        <text x="640" y="235" fill="#ffffff" font-family="'Plus Jakarta Sans', sans-serif" font-weight="bold" font-size="12" text-anchor="middle">PUMP</text>
        <text x="640" y="248" fill="#c084fc" font-family="'Fira Code', monospace" font-size="9" text-anchor="middle">5V DC</text>

        <!-- Flyback Diode across pump -->
        <rect x="625" y="140" width="30" height="24" rx="3" fill="#111827" stroke="#38bdf8" stroke-width="1" />
        <text x="640" y="156" fill="#38bdf8" font-family="'Fira Code', monospace" font-size="9" text-anchor="middle">1N4007</text>
        <line x1="640" y1="164" x2="640" y2="200" stroke="#38bdf8" stroke-width="1.5" />
        <line x1="640" y1="140" x2="640" y2="100" stroke="#ef4444" stroke-width="1.5" />
      </g>

      <!-- Soil Sensor Probe -->
      <g transform="translate(680, 340)">
        <rect x="0" y="0" width="100" height="50" rx="4" fill="#062817" stroke="#10b981" stroke-width="1.5" />
        <text x="50" y="24" fill="#34d399" font-family="'Plus Jakarta Sans', sans-serif" font-weight="bold" font-size="10" text-anchor="middle">SOIL PROBE</text>
        <text x="50" y="38" fill="#a7f3d0" font-family="'Fira Code', monospace" font-size="9" text-anchor="middle">Analog Pin 34</text>
      </g>

      <!-- Verification Badge at bottom -->
      <g transform="translate(280, 420)">
        <rect x="0" y="0" width="400" height="32" rx="16" fill="#062817" stroke="#10b981" stroke-width="1.5" />
        <text x="200" y="20" fill="#34d399" font-family="'Fira Code', monospace" font-weight="bold" font-size="11" text-anchor="middle">&#x2713; Circuit Validated: 3.3V Logic Safe &#x2022; Netlist Verified</text>
      </g>
    `;
  }
  // SCENE 4 (5.0 - 6.8s): 3D Breadboard Assembly with [ 3D PROTOTYPE ] Tab Active
  else if (t < 6.8) {
    const wireGrowth = Math.min(1, (t - 5.0) / 1.2);

    sceneSvg = `
      <rect width="${WIDTH}" height="${HEIGHT}" fill="#080a10" />

      <!-- Banner: YOUR PROJECT IS READY -->
      <text x="480" y="45" fill="#ffffff" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="20" text-anchor="middle">YOUR PROJECT IS READY</text>

      <!-- Top Tabs Switcher with 3D Active -->
      <g transform="translate(360, 60)">
        <rect x="0" y="0" width="240" height="32" rx="8" fill="#141722" stroke="#2a2e42" stroke-width="1" />
        <!-- 2D Inactive Tab -->
        <text x="60" y="20" fill="#94a3b8" font-family="'Plus Jakarta Sans', sans-serif" font-weight="bold" font-size="11" text-anchor="middle">[ 2D CIRCUIT ]</text>
        <!-- 3D Active Tab -->
        <rect x="122" y="2" width="116" height="28" rx="6" fill="#9333ea" />
        <text x="180" y="20" fill="#ffffff" font-family="'Plus Jakarta Sans', sans-serif" font-weight="bold" font-size="11" text-anchor="middle">[ 3D PROTOTYPE ]</text>
      </g>

      <!-- Solderless Breadboard Body in isometric / angled 3D view -->
      <g transform="translate(180, 130)">
        <!-- Breadboard Drop Shadow -->
        <rect x="10" y="10" width="600" height="260" rx="10" fill="#000000" opacity="0.5" filter="blur(8px)" />

        <!-- Breadboard White Surface -->
        <rect x="0" y="0" width="600" height="260" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2" />

        <!-- Red VCC & Blue GND Power Rails Top -->
        <line x1="20" y1="20" x2="580" y2="20" stroke="#ef4444" stroke-width="2" />
        <line x1="20" y1="35" x2="580" y2="35" stroke="#3b82f6" stroke-width="2" />

        <!-- Red VCC & Blue GND Power Rails Bottom -->
        <line x1="20" y1="225" x2="580" y2="225" stroke="#ef4444" stroke-width="2" />
        <line x1="20" y1="240" x2="580" y2="240" stroke="#3b82f6" stroke-width="2" />

        <!-- Center Divider Ditch -->
        <rect x="20" y="125" width="560" height="10" fill="#94a3b8" />

        <!-- Breadboard pin matrix pattern -->
        <g fill="#475569">
          ${Array.from({ length: 28 }).map((_, col) => {
            const x = 30 + col * 20;
            return `
              <circle cx="${x}" cy="60" r="1.5"/>
              <circle cx="${x}" cy="80" r="1.5"/>
              <circle cx="${x}" cy="100" r="1.5"/>
              <circle cx="${x}" cy="155" r="1.5"/>
              <circle cx="${x}" cy="175" r="1.5"/>
              <circle cx="${x}" cy="195" r="1.5"/>
            `;
          }).join('')}
        </g>

        <!-- ESP32 Module mounted on breadboard spanning center ditch -->
        <rect x="180" y="80" width="160" height="100" rx="4" fill="#0f172a" stroke="#38bdf8" stroke-width="1.5" />
        <!-- Metal Shield & Antenna -->
        <rect x="190" y="90" width="70" height="80" rx="3" fill="#94a3b8" />
        <text x="225" y="135" fill="#334155" font-family="'Fira Code', monospace" font-size="9" text-anchor="middle">ESP-WROOM</text>
        <rect x="280" y="100" width="40" height="60" rx="2" fill="#d97706" />

        <!-- Jumper Wire 1: Yellow Curved wire -->
        <path d="M 330 90 Q ${380 + wireGrowth * 40} ${30 - wireGrowth * 20} 460 90" fill="none" stroke="#eab308" stroke-width="3" stroke-linecap="round" />

        <!-- Jumper Wire 2: Red VCC Wire -->
        <path d="M 310 85 Q ${330} 30 240 20" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" />

        <!-- Jumper Wire 3: Green Sensor Wire -->
        <path d="M 330 170 Q ${420 + wireGrowth * 30} ${230 + wireGrowth * 20} 510 170" fill="none" stroke="#22c55e" stroke-width="3" stroke-linecap="round" />

        <!-- Soil Moisture Sensor PCB -->
        <rect x="500" y="140" width="60" height="80" rx="4" fill="#047857" stroke="#34d399" stroke-width="1" />
        <rect x="515" y="190" width="12" height="30" fill="#fbbf24" />
        <rect x="535" y="190" width="12" height="30" fill="#fbbf24" />
      </g>

      <text x="480" y="440" fill="#c084fc" font-family="'Fira Code', monospace" font-size="12" text-anchor="middle">3D Physical Geometry &amp; Pin Matrix Snapped</text>
    `;
  }
  // SCENE 5 (6.8 - 7.8s): Firmware Code Editor + KITT Copilot
  else if (t < 7.8) {
    sceneSvg = `
      <rect width="${WIDTH}" height="${HEIGHT}" fill="#0d1117" />

      <!-- Left Pane: C++ Firmware Editor -->
      <g transform="translate(60, 40)">
        <rect x="0" y="0" width="410" height="380" rx="8" fill="#161b22" stroke="#30363d" stroke-width="1" />
        <!-- Top File Tab -->
        <rect x="0" y="0" width="410" height="34" rx="8" fill="#21262d" />
        <text x="20" y="22" fill="#58a6ff" font-family="'Fira Code', monospace" font-weight="bold" font-size="12">main.cpp (ESP32 Firmware)</text>

        <!-- Code Content -->
        <g font-family="'Fira Code', monospace" font-size="11" xml:space="preserve">
          <text x="20" y="65" fill="#7ee787">const int SOIL_PIN = 34;</text>
          <text x="20" y="85" fill="#7ee787">const int PUMP_PIN = 26;</text>
          <text x="20" y="105" fill="#ff7b72">const int THRESHOLD = 25; // %</text>
          <text x="20" y="135" fill="#d2a8ff">void setup() {</text>
          <text x="35" y="155" fill="#c9d1d9">  pinMode(PUMP_PIN, OUTPUT);</text>
          <text x="20" y="175" fill="#d2a8ff">}</text>
          <text x="20" y="205" fill="#d2a8ff">void loop() {</text>
          <text x="35" y="225" fill="#c9d1d9">  int m = readSoilMoisture();</text>
          <text x="35" y="245" fill="#ff7b72">  if (m &lt; THRESHOLD) {</text>
          <text x="50" y="265" fill="#79c0ff">    digitalWrite(PUMP_PIN, HIGH);</text>
          <text x="35" y="285" fill="#ff7b72">  } else {</text>
          <text x="50" y="305" fill="#c9d1d9">    digitalWrite(PUMP_PIN, LOW);</text>
          <text x="35" y="325" fill="#ff7b72">  }</text>
          <text x="20" y="345" fill="#d2a8ff">}</text>
        </g>
      </g>

      <!-- Right Pane: KITT Copilot Chat -->
      <g transform="translate(490, 40)">
        <rect x="0" y="0" width="410" height="380" rx="8" fill="#11131a" stroke="#a855f7" stroke-width="1.5" />
        <!-- Copilot Header -->
        <rect x="0" y="0" width="410" height="34" rx="8" fill="#1c1829" />
        <text x="20" y="22" fill="#c084fc" font-family="'Plus Jakarta Sans', sans-serif" font-weight="bold" font-size="12">⚡ KITT COPILOT</text>

        <!-- User Bubble -->
        <rect x="30" y="60" width="350" height="46" rx="8" fill="#202433" />
        <text x="45" y="88" fill="#ffffff" font-family="'Plus Jakarta Sans', sans-serif" font-size="12">Change the pump threshold from 35% to 25%.</text>

        <!-- KITT Response Bubble -->
        <rect x="30" y="125" width="350" height="65" rx="8" fill="#2b1a45" stroke="#7c3aed" stroke-width="1" />
        <text x="45" y="152" fill="#e9d5ff" font-family="'Plus Jakarta Sans', sans-serif" font-size="12">Done. I updated the control logic</text>
        <text x="45" y="172" fill="#e9d5ff" font-family="'Plus Jakarta Sans', sans-serif" font-size="12">and active simulation parameters.</text>
      </g>

      <!-- Bottom Telemetry Bar -->
      <rect x="60" y="440" width="840" height="36" rx="6" fill="#161b22" stroke="#30363d" stroke-width="1" />
      <text x="480" y="463" fill="#cbd5e1" font-family="'Fira Code', monospace" font-size="11" text-anchor="middle">Telemetry: Voltage: 0.56V  |  Moisture: 3.99%  |  Pump: 20%</text>
    `;
  }
  // SCENE 6 (7.8 - 8.8s): 3D Electronics Lab Bench + Oscilloscope + Spinning Pump
  else if (t < 8.8) {
    const waveShift = (t * 200) % 200;
    const pumpAngle = (t * 360 * 3) % 360;

    sceneSvg = `
      <rect width="${WIDTH}" height="${HEIGHT}" fill="#07090e" />

      <!-- Digital Multimeter on left -->
      <g transform="translate(60, 70)">
        <rect x="0" y="0" width="180" height="230" rx="8" fill="#1e293b" stroke="#f59e0b" stroke-width="2" />
        <rect x="15" y="20" width="150" height="60" rx="4" fill="#0f172a" stroke="#334155" stroke-width="1" />
        <text x="90" y="62" fill="#38bdf8" font-family="'Fira Code', monospace" font-weight="bold" font-size="28" text-anchor="middle">00.00 V</text>
        <circle cx="90" cy="140" r="30" fill="#334155" stroke="#64748b" stroke-width="2" />
        <line x1="90" y1="140" x2="90" y2="115" stroke="#f59e0b" stroke-width="3" />
        <text x="90" y="205" fill="#94a3b8" font-family="'Plus Jakarta Sans', sans-serif" font-size="9" text-anchor="middle">DIGITAL MULTIMETER</text>
      </g>

      <!-- Center Lab Prototype with Spinning Pump Motor & PUMP ON -->
      <g transform="translate(280, 80)">
        <!-- Breadboard -->
        <rect x="0" y="0" width="280" height="180" rx="6" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5" />
        <rect x="40" y="40" width="70" height="90" rx="2" fill="#0f172a" />

        <!-- Spinning Pump Impeller -->
        <g transform="translate(200, 70)">
          <circle cx="0" cy="0" r="32" fill="#1e1b4b" stroke="#8b5cf6" stroke-width="2" />
          <g transform="rotate(${pumpAngle})">
            <line x1="-20" y1="0" x2="20" y2="0" stroke="#60a5fa" stroke-width="4" />
            <line x1="0" y1="-20" x2="0" y2="20" stroke="#60a5fa" stroke-width="4" />
          </g>
        </g>

        <!-- PUMP ON Green Pill Alert -->
        <g transform="translate(140, 135)">
          <rect x="0" y="0" width="120" height="32" rx="16" fill="#10b981" stroke="#34d399" stroke-width="2" />
          <circle cx="20" cy="16" r="5" fill="#ffffff" />
          <text x="65" y="21" fill="#000000" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="12" text-anchor="middle">PUMP ON</text>
        </g>
      </g>

      <!-- Digital Oscilloscope on right -->
      <g transform="translate(600, 60)">
        <rect x="0" y="0" width="300" height="240" rx="8" fill="#0f172a" stroke="#10b981" stroke-width="2" />
        <!-- Screen Grid -->
        <rect x="15" y="15" width="270" height="170" rx="4" fill="#021a12" stroke="#047857" stroke-width="1.5" />
        <!-- Graticule -->
        ${Array.from({ length: 9 }).map((_, i) => `<line x1="${25 + i * 28}" y1="20" x2="${25 + i * 28}" y2="180" stroke="rgba(16,185,129,0.15)" stroke-width="1" />`).join('')}
        ${Array.from({ length: 6 }).map((_, i) => `<line x1="20" y1="${30 + i * 25}" x2="280" y2="${30 + i * 25}" stroke="rgba(16,185,129,0.15)" stroke-width="1" />`).join('')}

        <!-- Animated Waveform -->
        <path d="M 25 100 Q ${50 + (waveShift % 28)} 50 ${75 + (waveShift % 28)} 100 T ${125 + (waveShift % 28)} 100 T ${175 + (waveShift % 28)} 100 T ${225 + (waveShift % 28)} 100 T ${275} 100" fill="none" stroke="#facc15" stroke-width="2.5" />

        <!-- Signal readout -->
        <text x="25" y="215" fill="#facc15" font-family="'Fira Code', monospace" font-size="11">CH1: 3.30V | PWM: 880Hz</text>
      </g>

      <!-- Bottom Telemetry Ribbon -->
      <rect x="60" y="330" width="840" height="40" rx="6" fill="#111420" stroke="#282e42" stroke-width="1" />
      <text x="480" y="355" fill="#e2e8f0" font-family="'Fira Code', monospace" font-size="11" text-anchor="middle">Telemetry: Voltage: 0.56V  |  Moisture: 3.99%  |  Pump: 20%</text>
    `;
  }
  // SCENE 7 (8.8 - 9.4s): Engineering Pipeline Ribbon
  else if (t < 9.4) {
    sceneSvg = `
      <rect width="${WIDTH}" height="${HEIGHT}" fill="#07080c" />

      <text x="480" y="160" fill="#ffffff" font-family="'Plus Jakarta Sans', sans-serif" font-weight="800" font-size="28" text-anchor="middle">COMPLETE ENGINEERING PIPELINE</text>

      <g transform="translate(60, 240)">
        <rect x="0" y="0" width="840" height="60" rx="30" fill="#11131a" stroke="#a855f7" stroke-width="2" />
        <text x="420" y="37" fill="#c084fc" font-family="'Plus Jakarta Sans', sans-serif" font-weight="700" font-size="13" text-anchor="middle">IDEA &#x2192; REQUIREMENTS &#x2192; ARCHITECTURE &#x2192; CIRCUIT &#x2192; CODE &#x2192; SIMULATION &#x2192; 3D &#x2192; PCB</text>
      </g>
    `;
  }
  // SCENE 8 (9.4 - 10.0s): Title Card "KITT AI - Where Ideas Become Inventions"
  else {
    sceneSvg = `
      <rect width="${WIDTH}" height="${HEIGHT}" fill="#07080c" />

      <!-- Subtle star / grid backdrop -->
      <defs>
        <pattern id="finalGrid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(168,85,247,0.08)" stroke-width="1"/>
        </pattern>
      </defs>
      <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#finalGrid)" />

      <!-- Centered Title Card -->
      <g transform="translate(480, 230)">
        <text x="0" y="-30" fill="#ffffff" font-family="'Plus Jakarta Sans', sans-serif" font-weight="900" font-size="52" text-anchor="middle">KITT AI</text>
        <text x="0" y="25" fill="#c084fc" font-family="'Plus Jakarta Sans', sans-serif" font-weight="600" font-size="24" text-anchor="middle">Where Ideas Become Inventions</text>
        <text x="0" y="70" fill="#94a3b8" font-family="'Fira Code', monospace" font-size="13" text-anchor="middle">Ready for Engineering &#x2022; Prototyping &#x2022; PCB Manufacturing</text>
      </g>
    `;
  }

  // Common subtitle overlay bar
  const fullSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
      ${sceneSvg}

      <!-- Subtitle pill at bottom -->
      <g transform="translate(480, 495)">
        <rect x="-180" y="-18" width="360" height="34" rx="17" fill="rgba(0,0,0,0.85)" stroke="rgba(255,255,255,0.2)" stroke-width="1" />
        <text x="0" y="4" fill="#ffffff" font-family="'Plus Jakarta Sans', sans-serif" font-weight="600" font-size="13" text-anchor="middle">${escapeXml(subtitle)}</text>
      </g>
    </svg>
  `;

  const frameFileName = path.join(FRAMES_DIR, `frame_${String(f).padStart(4, '0')}.svg`);
  fs.writeFileSync(frameFileName, fullSvg.trim());
}

console.log('All frames written. Compiling MP4 with ffmpeg...');

const outputMp4 = path.join(__dirname, '../public/kitt-hero.mp4');

// We also generate an ambient soundscape bed in the audio track of the MP4
const ffmpegCmd = `ffmpeg -y -framerate ${FPS} -i "${path.join(FRAMES_DIR, 'frame_%04d.svg')}" -f lavfi -i "sine=frequency=220:duration=${DURATION},volume=0.08" -c:v libx264 -pix_fmt yuv420p -c:a aac -shortest "${outputMp4}"`;

try {
  execSync(ffmpegCmd, { stdio: 'inherit' });
  console.log(`SUCCESS: Generated ${outputMp4}`);
} catch (err) {
  console.error('ffmpeg compilation failed:', err);
} finally {
  // Clean up frames directory
  fs.rmSync(FRAMES_DIR, { recursive: true, force: true });
}
