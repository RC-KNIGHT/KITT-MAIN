import React, { useId } from 'react';
import logoTransparent from '../assets/kitt-logo.png';
import logoDark from '../assets/kitt-logo-dark.png';
import logoBadge from '../assets/kitt-logo-badge.png';

interface KittLogoProps {
  className?: string;
  size?: number | string;
  showGlow?: boolean;
  variant?: 'default' | 'transparent' | 'badge' | 'dark';
  alt?: string;
}

export const KittLogo: React.FC<KittLogoProps> = ({
  className = '',
  size = 40,
  showGlow = true,
  variant = 'default',
  alt = 'KITT Ecosystem Logo'
}) => {
  const rawId = useId();
  const uid = rawId.replace(/[^a-zA-Z0-9_-]/g, '');

  let imgSrc = logoTransparent;
  if (variant === 'badge') {
    imgSrc = logoBadge;
  } else if (variant === 'dark') {
    imgSrc = logoDark;
  }

  const dimensionStyle = {
    width: typeof size === 'number' ? `${size}px` : size,
    height: typeof size === 'number' ? `${size}px` : size
  };

  return (
    <div 
      className={`relative inline-flex items-center justify-center select-none group shrink-0 ${className}`}
      style={dimensionStyle}
    >
      {/* Ambient Luminous Pulsing Glow */}
      {showGlow && (
        <div 
          className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#FFFFFF]/40 via-[#8F8F8F]/35 to-[#F5F5F5]/25 blur-md group-hover:blur-lg transition-all duration-500 opacity-80 group-hover:opacity-100 animate-pulse pointer-events-none" 
        />
      )}

      {/* Authentic Crystal Bead KITT Logo Image */}
      <img
        src={imgSrc}
        alt={alt}
        className="w-full h-full object-contain relative z-10 filter drop-shadow-[0_2px_14px_rgba(255,255,255,0.45)] group-hover:drop-shadow-[0_4px_20px_rgba(143,143,143,0.6)] transition-transform duration-300 group-hover:scale-105 pointer-events-none"
        loading="eager"
        decoding="async"
      />
    </div>
  );
};

