import React from 'react';

/**
 * AnimatedCircuitOverlay
 * 
 * A subtle, sophisticated vector circuit-line overlay in the background of HeroVideo
 * driven by CSS keyframes. Interacts visually with the central particle formation,
 * channeling simulated power and high-speed data buses directly toward the particle cloud.
 */
export const AnimatedCircuitOverlay: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden select-none z-0 ${className}`}>
      {/* Dual Laser Scanning Sweep lines across the circuit tracks */}
      <div className="absolute inset-x-0 h-36 bg-gradient-to-b from-transparent via-[#8F8F8F]/20 to-transparent pointer-events-none animate-scan-line" />
      <div className="absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-[#FFFFFF]/15 to-transparent pointer-events-none animate-scan-line-reverse" />

      <svg
        className="w-full h-full opacity-75"
        viewBox="0 0 1440 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Subtle gradient for bus traces converging toward center */}
          <linearGradient id="traceGradLeft" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.05" />
            <stop offset="60%" stopColor="#FFFFFF" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#F5F5F5" stopOpacity="0.7" />
          </linearGradient>

          <linearGradient id="traceGradRight" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#8F8F8F" stopOpacity="0.05" />
            <stop offset="60%" stopColor="#8F8F8F" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#F5F5F5" stopOpacity="0.7" />
          </linearGradient>

          {/* Oscilloscope multi-channel waveform gradient */}
          <linearGradient id="oscGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8F8F8F" stopOpacity="0.1" />
            <stop offset="30%" stopColor="#B4B4B4" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#FFFFFF" stopOpacity="1" />
            <stop offset="70%" stopColor="#E8E8E8" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.1" />
          </linearGradient>

          {/* Glow filter for active signal packets */}
          <filter id="circuitGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* ========================================================
            LEFT-SIDE CIRCUIT BUS (Feeding toward K particle center)
            ======================================================== */}
        <g id="left-circuit-bus" opacity="0.85">
          {/* Base Static Hairline Traces */}
          <path
            d="M 40 180 L 260 180 L 380 280 L 580 280"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="1.2"
            fill="none"
          />
          <path
            d="M 60 210 L 250 210 L 360 300 L 560 300"
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth="1"
            fill="none"
          />
          <path
            d="M 80 240 L 240 240 L 340 320 L 540 320"
            stroke="rgba(143, 143, 143, 0.2)"
            strokeWidth="1"
            fill="none"
          />

          {/* Active Animated Signal Flow Traces */}
          <path
            d="M 40 180 L 260 180 L 380 280 L 580 280"
            stroke="url(#traceGradLeft)"
            strokeWidth="1.8"
            fill="none"
            className="animate-circuit-fast"
            filter="url(#circuitGlow)"
          />
          <path
            d="M 60 210 L 250 210 L 360 300 L 560 300"
            stroke="url(#traceGradLeft)"
            strokeWidth="1.5"
            fill="none"
            className="animate-circuit-slow"
          />

          {/* Angled Branch to Top Chip Node */}
          <path
            d="M 260 180 L 310 130 L 460 130"
            stroke="rgba(255, 255, 255, 0.25)"
            strokeWidth="1"
            fill="none"
          />
          <path
            d="M 260 180 L 310 130 L 460 130"
            stroke="#FFFFFF"
            strokeWidth="1.2"
            fill="none"
            className="animate-circuit-slow"
          />

          {/* Vias & Junction Nodes with CSS pulse */}
          <g className="animate-node-pulse">
            <circle cx="260" cy="180" r="3.5" fill="#000000" stroke="#FFFFFF" strokeWidth="1.5" />
            <circle cx="380" cy="280" r="3.5" fill="#000000" stroke="#FFFFFF" strokeWidth="1.5" />
            <circle cx="580" cy="280" r="4.5" fill="#000000" stroke="#F5F5F5" strokeWidth="2" filter="url(#circuitGlow)" />
            <circle cx="310" cy="130" r="2.5" fill="#FFFFFF" />
          </g>

          {/* Left IC Component Outline & Pins */}
          <g opacity="0.5" className="animate-circuit-breathe">
            <rect x="70" y="150" width="36" height="24" rx="2" fill="#000000" stroke="#FFFFFF" strokeWidth="1" />
            <circle cx="78" cy="158" r="1.5" fill="#F5F5F5" />
            {/* SMD Pin leads */}
            <line x1="74" y1="174" x2="74" y2="180" stroke="#FFFFFF" strokeWidth="1" />
            <line x1="82" y1="174" x2="82" y2="180" stroke="#FFFFFF" strokeWidth="1" />
            <line x1="90" y1="174" x2="90" y2="180" stroke="#FFFFFF" strokeWidth="1" />
            <line x1="98" y1="174" x2="98" y2="180" stroke="#FFFFFF" strokeWidth="1" />
          </g>

          {/* ANSI Logic Gate 74HC08 (AND Gate) Schematic Node */}
          <g id="logic-gate-and-left" className="animate-circuit-breathe" opacity="0.85">
            {/* AND Gate Body */}
            <path
              d="M 460 118 L 476 118 C 488 118 496 123 496 130 C 496 137 488 142 476 142 L 460 142 Z"
              fill="#000000"
              stroke="#FFFFFF"
              strokeWidth="1.6"
            />
            {/* Input Pins */}
            <line x1="452" y1="123" x2="460" y2="123" stroke="#FFFFFF" strokeWidth="1.2" />
            <line x1="452" y1="137" x2="460" y2="137" stroke="#FFFFFF" strokeWidth="1.2" />
            {/* Output Pin */}
            <line x1="496" y1="130" x2="520" y2="130" stroke="#F5F5F5" strokeWidth="1.5" filter="url(#circuitGlow)" />
            <circle cx="520" cy="130" r="2.5" fill="#FFFFFF" />
            {/* Micro Logic Labels */}
            <text x="466" y="133" fill="#FFFFFF" fontSize="7" fontFamily="monospace" fontWeight="bold">AND</text>
            <text x="456" y="152" fill="#F5F5F5" fontSize="6.5" fontFamily="monospace" letterSpacing="0.08em" opacity="0.7">
              74HC08 // 1∧1=1
            </text>
          </g>

          {/* ANSI Logic Gate 74HC86 (XOR Gate) Schematic Node */}
          <g id="logic-gate-xor-left" className="animate-circuit-breathe" opacity="0.85">
            {/* XOR Gate Double Input Arc */}
            <path
              d="M 230 230 Q 235 240 230 250"
              fill="none"
              stroke="#8F8F8F"
              strokeWidth="1.6"
            />
            {/* XOR Gate Body */}
            <path
              d="M 235 230 Q 240 240 235 250 Q 248 250 258 240 Q 248 230 235 230 Z"
              fill="#000000"
              stroke="#8F8F8F"
              strokeWidth="1.6"
            />
            {/* Output Pin */}
            <line x1="258" y1="240" x2="275" y2="240" stroke="#8F8F8F" strokeWidth="1.4" />
            <circle cx="275" cy="240" r="2" fill="#8F8F8F" />
            <text x="240" y="243" fill="#B4B4B4" fontSize="6" fontFamily="monospace" fontWeight="bold">XOR</text>
            <text x="230" y="260" fill="#B4B4B4" fontSize="6.5" fontFamily="monospace" opacity="0.7">
              74HC86
            </text>
          </g>

          {/* Monospace Circuit Telemetry Label */}
          <text x="70" y="140" fill="#F5F5F5" fontSize="8" fontFamily="monospace" letterSpacing="0.1em" opacity="0.6">
            CLK_DIFF_IN // 100MHZ
          </text>
          <text x="390" y="272" fill="#FFFFFF" fontSize="8" fontFamily="monospace" letterSpacing="0.1em" opacity="0.8">
            SYNTHESIS_CONDUIT → CORE_K
          </text>
        </g>

        {/* ========================================================
            RIGHT-SIDE CIRCUIT BUS (Feeding toward K particle center)
            ======================================================== */}
        <g id="right-circuit-bus" opacity="0.85">
          {/* Base Static Hairline Traces */}
          <path
            d="M 1400 190 L 1180 190 L 1060 280 L 860 280"
            stroke="rgba(143, 143, 143, 0.2)"
            strokeWidth="1.2"
            fill="none"
          />
          <path
            d="M 1380 220 L 1190 220 L 1080 300 L 880 300"
            stroke="rgba(143, 143, 143, 0.15)"
            strokeWidth="1"
            fill="none"
          />
          <path
            d="M 1360 250 L 1200 250 L 1100 320 L 900 320"
            stroke="rgba(255, 255, 255, 0.2)"
            strokeWidth="1"
            fill="none"
          />

          {/* Active Animated Signal Flow Traces */}
          <path
            d="M 1400 190 L 1180 190 L 1060 280 L 860 280"
            stroke="url(#traceGradRight)"
            strokeWidth="1.8"
            fill="none"
            className="animate-circuit-fast"
            filter="url(#circuitGlow)"
          />
          <path
            d="M 1380 220 L 1190 220 L 1080 300 L 880 300"
            stroke="url(#traceGradRight)"
            strokeWidth="1.5"
            fill="none"
            className="animate-circuit-slow"
          />

          {/* Angled Upper Trace */}
          <path
            d="M 1180 190 L 1130 140 L 980 140"
            stroke="rgba(143, 143, 143, 0.25)"
            strokeWidth="1"
            fill="none"
          />
          <path
            d="M 1180 190 L 1130 140 L 980 140"
            stroke="#8F8F8F"
            strokeWidth="1.2"
            fill="none"
            className="animate-circuit-slow"
          />

          {/* Vias & Junction Nodes with CSS pulse */}
          <g className="animate-node-pulse">
            <circle cx="1180" cy="190" r="3.5" fill="#000000" stroke="#8F8F8F" strokeWidth="1.5" />
            <circle cx="1060" cy="280" r="3.5" fill="#000000" stroke="#8F8F8F" strokeWidth="1.5" />
            <circle cx="860" cy="280" r="4.5" fill="#000000" stroke="#F5F5F5" strokeWidth="2" filter="url(#circuitGlow)" />
            <circle cx="1130" cy="140" r="2.5" fill="#8F8F8F" />
          </g>

          {/* Right SMD Capacitor Pair */}
          <g opacity="0.5" className="animate-circuit-breathe">
            <rect x="1310" y="180" width="16" height="8" rx="1" fill="#000000" stroke="#8F8F8F" strokeWidth="1" />
            <rect x="1330" y="180" width="16" height="8" rx="1" fill="#000000" stroke="#8F8F8F" strokeWidth="1" />
          </g>

          {/* ANSI Logic Gate 74HC32 (OR Gate) Schematic Node */}
          <g id="logic-gate-or-right" className="animate-circuit-breathe" opacity="0.85">
            {/* Input Pins */}
            <line x1="980" y1="135" x2="964" y2="135" stroke="#8F8F8F" strokeWidth="1.2" />
            <line x1="980" y1="145" x2="964" y2="145" stroke="#8F8F8F" strokeWidth="1.2" />
            {/* OR Gate Body (Curved inward back, converging curves to tip) */}
            <path
              d="M 964 128 Q 970 140 964 152 Q 948 152 938 140 Q 948 128 964 128 Z"
              fill="#000000"
              stroke="#8F8F8F"
              strokeWidth="1.6"
            />
            {/* Output Pin */}
            <line x1="938" y1="140" x2="916" y2="140" stroke="#F5F5F5" strokeWidth="1.5" filter="url(#circuitGlow)" />
            <circle cx="916" cy="140" r="2.5" fill="#8F8F8F" />
            <text x="946" y="143" fill="#B4B4B4" fontSize="6.5" fontFamily="monospace" fontWeight="bold">OR</text>
            <text x="926" y="162" fill="#F5F5F5" fontSize="6.5" fontFamily="monospace" opacity="0.7">
              74HC32 // 0∨1=1
            </text>
          </g>

          {/* ANSI Logic Gate 74HC04 (Inverter NOT Gate) Schematic Node */}
          <g id="logic-gate-not-right" className="animate-circuit-breathe" opacity="0.85">
            {/* Input Pin */}
            <line x1="1235" y1="240" x2="1220" y2="240" stroke="#FFFFFF" strokeWidth="1.2" />
            {/* Triangle */}
            <polygon
              points="1220,230 1202,240 1220,250"
              fill="#000000"
              stroke="#FFFFFF"
              strokeWidth="1.6"
            />
            {/* Inversion Bubble */}
            <circle cx="1199" cy="240" r="3" fill="#000000" stroke="#FFFFFF" strokeWidth="1.4" />
            {/* Output Pin */}
            <line x1="1196" y1="240" x2="1178" y2="240" stroke="#FFFFFF" strokeWidth="1.4" />
            <circle cx="1178" cy="240" r="2" fill="#FFFFFF" />
            <text x="1208" y="243" fill="#FFFFFF" fontSize="6" fontFamily="monospace" fontWeight="bold">NOT</text>
            <text x="1185" y="260" fill="#F5F5F5" fontSize="6.5" fontFamily="monospace" opacity="0.7">
              74HC04 // INV
            </text>
          </g>

          {/* Telemetry Labels */}
          <text x="1270" y="172" fill="#F5F5F5" fontSize="8" fontFamily="monospace" letterSpacing="0.1em" opacity="0.6">
            I2C_SDA // HIGH_SPD
          </text>
          <text x="890" y="272" fill="#8F8F8F" fontSize="8" fontFamily="monospace" letterSpacing="0.1em" opacity="0.8">
            AETHER_FEED_R ← TX_BUS
          </text>
        </g>

        {/* ========================================================
            LOWER CONVERGENCE CONDUITS (Framing above the video)
            ======================================================== */}
        <g id="center-feeder-traces" opacity="0.75">
          {/* Real-time Oscilloscope Waveform Bus bridging the horizon */}
          <path
            d="M 380 380 Q 420 340, 460 380 T 540 380 T 620 380 T 700 355 T 720 405 T 740 355 T 760 380 T 840 380 T 920 380 T 1000 380 T 1060 380"
            stroke="url(#oscGrad)"
            strokeWidth="1.8"
            fill="none"
            filter="url(#circuitGlow)"
            className="animate-oscilloscope-trace"
          />

          {/* Vertical feeders directing energy into the K's bottom diagonal */}
          <path
            d="M 640 460 L 680 400 L 710 400"
            stroke="rgba(255, 255, 255, 0.35)"
            strokeWidth="1.2"
            fill="none"
            strokeDasharray="4 8"
          />
          <path
            d="M 800 460 L 760 400 L 730 400"
            stroke="rgba(143, 143, 143, 0.35)"
            strokeWidth="1.2"
            fill="none"
            strokeDasharray="4 8"
          />

          <circle cx="710" cy="400" r="3" fill="#FFFFFF" className="animate-node-pulse" />
          <circle cx="730" cy="400" r="3" fill="#8F8F8F" className="animate-node-pulse" />
          <circle cx="720" cy="380" r="3.5" fill="#F5F5F5" filter="url(#circuitGlow)" className="animate-node-pulse" />

          {/* Oscilloscope Telemetry Reticle Text */}
          <text x="720" y="420" fill="#F5F5F5" fontSize="7" fontFamily="monospace" letterSpacing="0.12em" textAnchor="middle" opacity="0.6">
            OSC_CH1: 3.3V_LOGIC • 100MS/S • REALTIME_TRACE
          </text>
        </g>
      </svg>
    </div>
  );
};
