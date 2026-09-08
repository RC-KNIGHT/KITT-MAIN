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
      {/* Laser Scanning Sweep line across the circuit tracks */}
      <div className="absolute inset-x-0 h-40 bg-gradient-to-b from-transparent via-[#407E8C]/15 to-transparent pointer-events-none animate-scan-line" />

      <svg
        className="w-full h-full opacity-70"
        viewBox="0 0 1440 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Subtle gradient for bus traces converging toward center */}
          <linearGradient id="traceGradLeft" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#A58D66" stopOpacity="0.05" />
            <stop offset="60%" stopColor="#A58D66" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#E5E1DD" stopOpacity="0.7" />
          </linearGradient>

          <linearGradient id="traceGradRight" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#407E8C" stopOpacity="0.05" />
            <stop offset="60%" stopColor="#407E8C" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#E5E1DD" stopOpacity="0.7" />
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
            stroke="rgba(165, 141, 102, 0.2)"
            strokeWidth="1.2"
            fill="none"
          />
          <path
            d="M 60 210 L 250 210 L 360 300 L 560 300"
            stroke="rgba(165, 141, 102, 0.15)"
            strokeWidth="1"
            fill="none"
          />
          <path
            d="M 80 240 L 240 240 L 340 320 L 540 320"
            stroke="rgba(64, 126, 140, 0.2)"
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
            stroke="rgba(165, 141, 102, 0.25)"
            strokeWidth="1"
            fill="none"
          />
          <path
            d="M 260 180 L 310 130 L 460 130"
            stroke="#A58D66"
            strokeWidth="1.2"
            fill="none"
            className="animate-circuit-slow"
          />

          {/* Vias & Junction Nodes with CSS pulse */}
          <g className="animate-node-pulse">
            <circle cx="260" cy="180" r="3.5" fill="#080f14" stroke="#A58D66" strokeWidth="1.5" />
            <circle cx="380" cy="280" r="3.5" fill="#080f14" stroke="#A58D66" strokeWidth="1.5" />
            <circle cx="580" cy="280" r="4.5" fill="#080f14" stroke="#E5E1DD" strokeWidth="2" filter="url(#circuitGlow)" />
            <circle cx="310" cy="130" r="2.5" fill="#A58D66" />
          </g>

          {/* Left IC Component Outline & Pins */}
          <g opacity="0.5" className="animate-circuit-breathe">
            <rect x="70" y="150" width="36" height="24" rx="2" fill="#080f14" stroke="#A58D66" strokeWidth="1" />
            <circle cx="78" cy="158" r="1.5" fill="#E5E1DD" />
            {/* SMD Pin leads */}
            <line x1="74" y1="174" x2="74" y2="180" stroke="#A58D66" strokeWidth="1" />
            <line x1="82" y1="174" x2="82" y2="180" stroke="#A58D66" strokeWidth="1" />
            <line x1="90" y1="174" x2="90" y2="180" stroke="#A58D66" strokeWidth="1" />
            <line x1="98" y1="174" x2="98" y2="180" stroke="#A58D66" strokeWidth="1" />
          </g>

          {/* Monospace Circuit Telemetry Label */}
          <text x="70" y="140" fill="#E5E1DD" fontSize="8" fontFamily="monospace" letterSpacing="0.1em" opacity="0.6">
            CLK_DIFF_IN // 100MHZ
          </text>
          <text x="390" y="272" fill="#A58D66" fontSize="8" fontFamily="monospace" letterSpacing="0.1em" opacity="0.8">
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
            stroke="rgba(64, 126, 140, 0.2)"
            strokeWidth="1.2"
            fill="none"
          />
          <path
            d="M 1380 220 L 1190 220 L 1080 300 L 880 300"
            stroke="rgba(64, 126, 140, 0.15)"
            strokeWidth="1"
            fill="none"
          />
          <path
            d="M 1360 250 L 1200 250 L 1100 320 L 900 320"
            stroke="rgba(165, 141, 102, 0.2)"
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
            stroke="rgba(64, 126, 140, 0.25)"
            strokeWidth="1"
            fill="none"
          />
          <path
            d="M 1180 190 L 1130 140 L 980 140"
            stroke="#407E8C"
            strokeWidth="1.2"
            fill="none"
            className="animate-circuit-slow"
          />

          {/* Vias & Junction Nodes with CSS pulse */}
          <g className="animate-node-pulse">
            <circle cx="1180" cy="190" r="3.5" fill="#080f14" stroke="#407E8C" strokeWidth="1.5" />
            <circle cx="1060" cy="280" r="3.5" fill="#080f14" stroke="#407E8C" strokeWidth="1.5" />
            <circle cx="860" cy="280" r="4.5" fill="#080f14" stroke="#E5E1DD" strokeWidth="2" filter="url(#circuitGlow)" />
            <circle cx="1130" cy="140" r="2.5" fill="#407E8C" />
          </g>

          {/* Right SMD Capacitor Pair */}
          <g opacity="0.5" className="animate-circuit-breathe">
            <rect x="1310" y="180" width="16" height="8" rx="1" fill="#080f14" stroke="#407E8C" strokeWidth="1" />
            <rect x="1330" y="180" width="16" height="8" rx="1" fill="#080f14" stroke="#407E8C" strokeWidth="1" />
          </g>

          {/* Telemetry Labels */}
          <text x="1270" y="172" fill="#E5E1DD" fontSize="8" fontFamily="monospace" letterSpacing="0.1em" opacity="0.6">
            I2C_SDA // HIGH_SPD
          </text>
          <text x="890" y="272" fill="#407E8C" fontSize="8" fontFamily="monospace" letterSpacing="0.1em" opacity="0.8">
            AETHER_FEED_R ← TX_BUS
          </text>
        </g>

        {/* ========================================================
            LOWER CONVERGENCE CONDUITS (Framing above the video)
            ======================================================== */}
        <g id="center-feeder-traces" opacity="0.6">
          {/* Vertical feeders directing energy into the K's bottom diagonal */}
          <path
            d="M 640 460 L 680 400 L 710 400"
            stroke="rgba(165, 141, 102, 0.3)"
            strokeWidth="1.2"
            fill="none"
            strokeDasharray="4 8"
          />
          <path
            d="M 800 460 L 760 400 L 730 400"
            stroke="rgba(64, 126, 140, 0.3)"
            strokeWidth="1.2"
            fill="none"
            strokeDasharray="4 8"
          />

          <circle cx="710" cy="400" r="2.5" fill="#A58D66" className="animate-node-pulse" />
          <circle cx="730" cy="400" r="2.5" fill="#407E8C" className="animate-node-pulse" />
        </g>
      </svg>
    </div>
  );
};
