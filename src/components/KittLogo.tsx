import React, { useId } from 'react';

interface KittLogoProps {
  className?: string;
  size?: number | string;
  showGlow?: boolean;
}

export const KittLogo: React.FC<KittLogoProps> = ({
  className = '',
  size = 40,
  showGlow = true
}) => {
  const rawId = useId();
  const uid = rawId.replace(/[^a-zA-Z0-9_-]/g, '');
  const goldGradId = `kitt-gold-${uid}`;
  const tealGradId = `kitt-teal-${uid}`;
  const glowFilterId = `kitt-glow-${uid}`;

  return (
    <div 
      className={`relative inline-flex items-center justify-center select-none group ${className}`}
      style={{ 
        width: typeof size === 'number' ? `${size}px` : size, 
        height: typeof size === 'number' ? `${size}px` : size 
      }}
    >
      {/* Ambient Pulsing Glow */}
      {showGlow && (
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#A58D66]/40 via-[#407E8C]/30 to-[#E5E1DD]/20 blur-md group-hover:blur-lg transition-all duration-500 opacity-80 group-hover:opacity-100 animate-pulse" />
      )}

      {/* SVG Emblem: Symmetrical, Upright, Straight Vertical Middle Plane Line with T-Caps */}
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 filter drop-shadow-[0_2px_12px_rgba(165,141,102,0.45)] transition-transform duration-300 group-hover:scale-105"
      >
        <defs>
          {/* Antique Gold Gradient with userSpaceOnUse so vertical lines render correctly */}
          <linearGradient id={goldGradId} x1="20" y1="20" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFF8F0" />
            <stop offset="25%" stopColor="#E5E1DD" />
            <stop offset="65%" stopColor="#A58D66" />
            <stop offset="100%" stopColor="#7B643F" />
          </linearGradient>

          {/* Oceanic Teal Gradient with userSpaceOnUse */}
          <linearGradient id={tealGradId} x1="20" y1="100" x2="100" y2="20" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#224750" />
            <stop offset="50%" stopColor="#407E8C" />
            <stop offset="100%" stopColor="#89D0E0" />
          </linearGradient>

          {/* Core Glow Filter */}
          <filter id={glowFilterId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Subtle Outer Orbital Ring */}
        <circle
          cx="60"
          cy="60"
          r="48"
          stroke={`url(#${tealGradId})`}
          strokeWidth="1"
          strokeDasharray="3 3"
          strokeOpacity="0.35"
          fill="none"
        />

        <g filter={`url(#${glowFilterId})`}>
          {/* 
            1. DIAGONAL 1: Top-Left to Bottom-Right
            Runs from (27, 27) to (93, 93) through (60, 60)
          */}
          <line
            x1="27"
            y1="27"
            x2="93"
            y2="93"
            stroke={`url(#${goldGradId})`}
            strokeWidth="6.5"
            strokeLinecap="round"
          />
          {/* Top-Left Perpendicular T-Bar */}
          <line
            x1="18"
            y1="36"
            x2="36"
            y2="18"
            stroke={`url(#${goldGradId})`}
            strokeWidth="6.5"
            strokeLinecap="round"
          />
          {/* Bottom-Right Perpendicular T-Bar */}
          <line
            x1="84"
            y1="102"
            x2="102"
            y2="84"
            stroke={`url(#${goldGradId})`}
            strokeWidth="6.5"
            strokeLinecap="round"
          />

          {/* 
            2. DIAGONAL 2: Bottom-Left to Top-Right
            Runs from (27, 93) to (93, 27) through (60, 60)
          */}
          <line
            x1="27"
            y1="93"
            x2="93"
            y2="27"
            stroke={`url(#${goldGradId})`}
            strokeWidth="6.5"
            strokeLinecap="round"
          />
          {/* Bottom-Left Perpendicular T-Bar */}
          <line
            x1="18"
            y1="84"
            x2="36"
            y2="102"
            stroke={`url(#${goldGradId})`}
            strokeWidth="6.5"
            strokeLinecap="round"
          />
          {/* Top-Right Perpendicular T-Bar */}
          <line
            x1="84"
            y1="18"
            x2="102"
            y2="36"
            stroke={`url(#${goldGradId})`}
            strokeWidth="6.5"
            strokeLinecap="round"
          />

          {/* 
            3. STRAIGHT VERTICAL MIDDLE STEM (NO TILT, NO T-BARS)
            Drawn ON TOP of the diagonals to ensure complete visibility through center!
            Runs straight down through center (60, 60) from y=16 to y=104
          */}
          {/* Solid base layer guaranteeing opacity in all SVG engines */}
          <line
            x1="60"
            y1="16"
            x2="60"
            y2="104"
            stroke="#A58D66"
            strokeWidth="6.5"
            strokeLinecap="round"
          />
          {/* Luminous gradient top stroke */}
          <line
            x1="60"
            y1="16"
            x2="60"
            y2="104"
            stroke={`url(#${goldGradId})`}
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* Central Nexus & Core Specular Bead */}
          <circle cx="60" cy="60" r="5.5" fill="#E5E1DD" />
          <circle cx="60" cy="60" r="2.5" fill="#080f14" />
        </g>
      </svg>
    </div>
  );
};
