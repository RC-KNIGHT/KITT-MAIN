import React, { useRef, useEffect, useCallback } from 'react';

export interface Tilt3DCardProps {
  children: React.ReactNode;
  className?: string;
  tiltMaxAngle?: number;
  scale?: number;
  glareOpacity?: number;
  onClick?: () => void;
  style?: React.CSSProperties;
}

/**
 * Tilt3DCard
 * 
 * High-end kinetic 3D card component with:
 * 1. Physical 3D tilt with damped inertia (lerp)
 * 2. Multi-layer anti-reflective specular glare (sharp luminaire hotspot + subsurface glow)
 * 3. Chromatic aberration edge light bleed (iridescent oceanic teal/antique gold/prismatic shimmer)
 * 4. Zero distortion of children or click handlers
 */
export const Tilt3DCard: React.FC<Tilt3DCardProps> = ({
  children,
  className = '',
  tiltMaxAngle = 4.5,
  scale = 1.015,
  glareOpacity = 0.22,
  onClick,
  style = {}
}) => {
  const outerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const chromaticRef = useRef<HTMLDivElement>(null);

  const state = useRef({
    isHovered: false,
    targetRotX: 0,
    targetRotY: 0,
    targetScale: 1,
    currentRotX: 0,
    currentRotY: 0,
    currentScale: 1,
    glareX: 50,
    glareY: 50,
    rafId: 0,
    rect: null as DOMRect | null,
  });

  const animate = useCallback(() => {
    const s = state.current;
    const card = cardRef.current;
    const glare = glareRef.current;
    const chromatic = chromaticRef.current;
    if (!card) return;

    // Smooth physical inertia lerp factor
    const LERP = 0.1;
    s.currentRotX += (s.targetRotX - s.currentRotX) * LERP;
    s.currentRotY += (s.targetRotY - s.currentRotY) * LERP;
    s.currentScale += (s.targetScale - s.currentScale) * LERP;

    card.style.transform = `perspective(1000px) rotateX(${s.currentRotX.toFixed(2)}deg) rotateY(${s.currentRotY.toFixed(2)}deg) scale3d(${s.currentScale.toFixed(3)}, ${s.currentScale.toFixed(3)}, ${s.currentScale.toFixed(3)})`;

    if (glare) {
      if (s.isHovered) {
        glare.style.opacity = String(glareOpacity);
        // Anti-reflective optical glass reflection: sharp white luminaire core + gold/teal diffraction rings
        glare.style.background = `radial-gradient(circle at ${s.glareX.toFixed(1)}% ${s.glareY.toFixed(1)}%, rgba(255, 255, 255, 0.35) 0%, rgba(232, 232, 232, 0.18) 18%, rgba(143, 143, 143, 0.09) 38%, transparent 68%)`;
      } else {
        glare.style.opacity = '0';
      }
    }

    if (chromatic) {
      if (s.isHovered) {
        chromatic.style.opacity = '0.9';
        // Chromatic aberration edge light bleed: prismatic refraction across card border
        const angle = Math.atan2(s.glareY - 50, s.glareX - 50) * (180 / Math.PI) + 90;
        chromatic.style.background = `linear-gradient(${angle.toFixed(1)}deg, rgba(143, 143, 143, 0.3) 0%, rgba(180, 180, 180, 0.15) 25%, rgba(255, 255, 255, 0.25) 50%, rgba(232, 232, 232, 0.15) 75%, rgba(143, 143, 143, 0.2) 100%)`;
      } else {
        chromatic.style.opacity = '0';
      }
    }

    const deltaX = Math.abs(s.targetRotX - s.currentRotX);
    const deltaY = Math.abs(s.targetRotY - s.currentRotY);
    const deltaScale = Math.abs(s.targetScale - s.currentScale);

    if (deltaX > 0.005 || deltaY > 0.005 || deltaScale > 0.0005 || s.isHovered) {
      s.rafId = requestAnimationFrame(animate);
    } else {
      // Settle smoothly to exact target
      s.currentRotX = s.targetRotX;
      s.currentRotY = s.targetRotY;
      s.currentScale = s.targetScale;
      card.style.transform = s.targetScale === 1
        ? 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'
        : `perspective(1000px) rotateX(${s.targetRotX.toFixed(2)}deg) rotateY(${s.targetRotY.toFixed(2)}deg) scale3d(${s.targetScale}, ${s.targetScale}, ${s.targetScale})`;
      s.rafId = 0;
    }
  }, [glareOpacity]);

  const startLoop = useCallback(() => {
    if (!state.current.rafId) {
      state.current.rafId = requestAnimationFrame(animate);
    }
  }, [animate]);

  const handleMouseEnter = () => {
    const outer = outerRef.current;
    if (!outer) return;
    state.current.isHovered = true;
    state.current.targetScale = scale;
    state.current.rect = outer.getBoundingClientRect();
    startLoop();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const outer = outerRef.current;
    if (!outer) return;

    let rect = state.current.rect;
    if (!rect) {
      rect = state.current.rect = outer.getBoundingClientRect();
    }

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const nx = Math.max(-1, Math.min(1, (x - centerX) / (centerX || 1)));
    const ny = Math.max(-1, Math.min(1, (y - centerY) / (centerY || 1)));

    state.current.targetRotX = -ny * tiltMaxAngle;
    state.current.targetRotY = nx * tiltMaxAngle;
    state.current.targetScale = scale;

    state.current.glareX = Math.max(0, Math.min(100, (x / rect.width) * 100));
    state.current.glareY = Math.max(0, Math.min(100, (y / rect.height) * 100));

    startLoop();
  };

  const handleMouseLeave = () => {
    state.current.isHovered = false;
    state.current.targetRotX = 0;
    state.current.targetRotY = 0;
    state.current.targetScale = 1;
    state.current.rect = null;
    startLoop();
  };

  useEffect(() => {
    return () => {
      if (state.current.rafId) {
        cancelAnimationFrame(state.current.rafId);
      }
    };
  }, []);

  return (
    <div
      ref={outerRef}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="tilt-card-wrapper relative h-full w-full group"
      style={{
        perspective: '1000px',
        ...style
      }}
    >
      <div
        ref={cardRef}
        className={`tilt-card-body relative h-full w-full will-change-transform ${className}`}
        style={{
          transformStyle: 'preserve-3d',
          transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
        }}
      >
        {/* Chromatic aberration edge light bleed mask */}
        <div
          ref={chromaticRef}
          aria-hidden="true"
          className="pointer-events-none absolute -inset-[1px] rounded-[inherit] opacity-0 transition-opacity duration-300 z-10 p-[1px]"
          style={{
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
          }}
        />

        {/* Specular glare layer (anti-reflective luminaire hotspot) */}
        <div
          ref={glareRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-300 rounded-[inherit] mix-blend-overlay"
          style={{
            opacity: 0,
          }}
        />

        {/* Card inner content */}
        {children}
      </div>
    </div>
  );
};
