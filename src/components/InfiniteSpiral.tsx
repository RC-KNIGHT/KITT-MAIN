import React, { useRef, useEffect, useState, useCallback } from 'react';

export interface InfiniteSpiralProps<T = any> {
  items: T[];
  animationMode?: 'auto' | 'manual' | 'scroll';
  speed?: number;
  radius?: number;
  cardWidth?: number;
  cardHeight?: number;
  verticalSpacing?: number;
  perspective?: number;
  cardRadius?: number;
  centerScale?: number;
  edgeBlur?: number;
  cardsPerTurn?: number;
  pauseOnHover?: boolean;
  direction?: 'up' | 'down';
  rotation?: number;
  cardTilt?: number;
  edgeFade?: number;
  imageFit?: 'cover' | 'contain';
  grayscale?: number;
  preventPageScroll?: boolean;
  isFrozen?: boolean;
  renderItem?: (item: T, index: number, isCenter: boolean) => React.ReactNode;
  onItemClick?: (item: T, index: number) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const InfiniteSpiral = <T extends Record<string, any>>({
  items,
  animationMode = 'auto',
  speed = 0.40,
  radius = 250,
  cardWidth = 270,
  cardHeight = 165,
  verticalSpacing = 102,
  perspective = 1000,
  cardRadius = 14,
  centerScale = 1.12,
  edgeBlur = 5,
  cardsPerTurn = 5,
  pauseOnHover = true,
  direction = 'up',
  rotation = 0,
  cardTilt = 1,
  edgeFade = 0.45,
  imageFit = 'cover',
  grayscale = 0,
  preventPageScroll = false,
  isFrozen = false,
  renderItem,
  onItemClick,
  className = '',
  style = {}
}: InfiniteSpiralProps<T>) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const rafIdRef = useRef<number>(0);

  // Smooth momentum & progress tracking
  const progressRef = useRef<number>(0);
  const targetProgressRef = useRef<number>(0);
  const isPausedRef = useRef<boolean>(false);
  const isDraggingRef = useRef<boolean>(false);
  const dragStartYRef = useRef<number>(0);
  const dragStartProgressRef = useRef<number>(0);

  const [containerHeight, setContainerHeight] = useState<number>(580);

  // Total slots: clean multiple of cardsPerTurn to eliminate wrapping seams
  const totalTurns = 4;
  const totalSlots = Math.max(cardsPerTurn * totalTurns, items.length > 0 ? Math.ceil(20 / items.length) * items.length : 20);
  const slots = Array.from({ length: totalSlots }, (_, i) => i);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight || 580);
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions, { passive: true });
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Native wheel listener with { passive: false } to reliably prevent page scroll when hovered
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleNativeWheel = (e: WheelEvent) => {
      // If preventPageScroll is active, lock window/screen scroll completely while over this spiral
      if (preventPageScroll) {
        e.preventDefault();
        e.stopPropagation();
      }

      // If this spiral is frozen (e.g. user is interacting with the counterpart spiral), ignore wheel input
      if (isFrozen) return;

      // Smooth inertia delta
      const factor = direction === 'down' ? -1 : 1;
      const clampedDelta = Math.sign(e.deltaY) * Math.min(Math.abs(e.deltaY), 100);
      targetProgressRef.current += clampedDelta * 0.65 * factor;
    };

    el.addEventListener('wheel', handleNativeWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleNativeWheel);
  }, [preventPageScroll, isFrozen, direction]);

  // Butter-smooth 120fps animation loop with physical inertia lerping
  const tick = useCallback(() => {
    const loopHeight = totalSlots * verticalSpacing;
    const anglePerCard = (2 * Math.PI) / cardsPerTurn;
    const rotOffsetRad = (rotation * Math.PI) / 180;
    const halfH = containerHeight / 2;

    // Ambient auto-advance when not dragging, paused, or frozen
    if (!isDraggingRef.current && !isPausedRef.current && !isFrozen && animationMode === 'auto') {
      const dirFactor = direction === 'down' ? -1 : 1;
      targetProgressRef.current += speed * dirFactor;
    }

    // Physical inertia lerp towards targetProgress
    const lerpFactor = isDraggingRef.current ? 0.35 : 0.09;
    progressRef.current += (targetProgressRef.current - progressRef.current) * lerpFactor;

    const currentProgress = progressRef.current;

    for (let k = 0; k < totalSlots; k++) {
      const el = cardsRef.current[k];
      if (!el) continue;

      // Continuous mathematically wrapped Y coordinate
      let rawY = (k * verticalSpacing + currentProgress) % loopHeight;
      if (rawY < 0) rawY += loopHeight;
      let y = rawY - loopHeight / 2;

      // Vertical bounds culling: hide cards far beyond top/bottom
      if (Math.abs(y) > halfH + 80) {
        el.style.opacity = '0';
        el.style.pointerEvents = 'none';
        continue;
      }

      // Helical cylindrical coordinates
      const theta = (y / verticalSpacing) * anglePerCard + rotOffsetRad;
      const x = radius * Math.sin(theta);
      const z = radius * Math.cos(theta);

      // Normalized depth (+1 in front, -1 in rear)
      const zNorm = z / radius;

      // Proximity to center vertical axis
      const yProximity = Math.max(0, 1 - Math.abs(y) / (halfH * 0.85));
      const isCenterFront = zNorm > 0.40 && yProximity > 0.50;

      // Depth scale: front focal card expands up to centerScale, rear cards subtly scale down
      let scale = 1;
      if (zNorm > 0) {
        scale = 1 + (centerScale - 1) * zNorm * yProximity;
      } else {
        scale = 1 + zNorm * 0.16;
      }

      // 3D rotations: Y follows cylinder tangent; X applies subtle cardTilt
      const rotY = (theta * 180) / Math.PI;

      // Smooth vertical edge fading
      const edgeFadeFactor = Math.max(0, 1 - Math.max(0, Math.abs(y) - (halfH - 110)) / 110);
      
      // CRITICAL DEPTH OPACITY & PARTICLE OCCLUSION:
      // Front 1-2 cards (zNorm > 0.15) are 100% SOLID and fully opaque (#000000) to completely cover background particles!
      // Rear cards (zNorm <= 0.15) smoothly fade and blend with cosmic depth.
      let depthOpacity = 1;
      if (zNorm > 0.15) {
        depthOpacity = 1.0; // 100% Solid foreground - occludes background particles completely
      } else {
        depthOpacity = Math.max(0.20, 1 - edgeFade * ((0.15 - zNorm) / 1.15));
      }

      const opacity = Math.min(1, Math.max(0, edgeFadeFactor * depthOpacity));

      // Depth blur: only applies to rear-orbiting cards
      let blurPx = 0;
      if (edgeBlur > 0 && zNorm < 0.1) {
        blurPx = ((0.1 - zNorm) / 1.1) * edgeBlur;
      }

      // Grayscale modulation: front cards full color, rear subtly desaturated
      let grayVal = 0;
      if (grayscale > 0) {
        grayVal = Math.max(0, 1 - zNorm * yProximity) * grayscale;
      }

      // Z-Index calculation:
      // Front cards get high z-index (up to 500+) so they stack authoritatively on top
      const baseZIndex = Math.round((z + radius) * 10) + 50;

      // Apply styles directly to DOM
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, ${z.toFixed(1)}px) rotateY(${rotY.toFixed(1)}deg) rotateX(${cardTilt}deg) scale(${scale.toFixed(3)})`;
      el.style.opacity = opacity.toFixed(2);
      el.style.zIndex = String(baseZIndex);
      el.style.pointerEvents = opacity > 0.4 ? 'auto' : 'none';

      let filterStr = '';
      if (blurPx > 0.2) filterStr += `blur(${blurPx.toFixed(1)}px) `;
      if (grayVal > 0.05) filterStr += `grayscale(${grayVal.toFixed(2)})`;
      el.style.filter = filterStr.trim() || 'none';

      // 100% Solid background and deep drop shadow for foreground cards to completely occlude particles
      if (zNorm > 0.15) {
        el.style.boxShadow = isCenterFront 
          ? '0 25px 65px -10px rgba(0,0,0,0.98), 0 0 30px rgba(255,255,255,0.20)' 
          : '0 16px 42px -8px rgba(0,0,0,0.92)';
      } else {
        el.style.boxShadow = '0 8px 20px rgba(0,0,0,0.6)';
      }
    }

    rafIdRef.current = requestAnimationFrame(tick);
  }, [
    totalSlots,
    verticalSpacing,
    cardsPerTurn,
    rotation,
    containerHeight,
    animationMode,
    direction,
    speed,
    radius,
    centerScale,
    cardTilt,
    edgeFade,
    edgeBlur,
    grayscale,
    isFrozen
  ]);

  useEffect(() => {
    rafIdRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafIdRef.current);
  }, [tick]);

  // Pointer drag controls (mouse / touch)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    dragStartYRef.current = e.clientY;
    dragStartProgressRef.current = targetProgressRef.current;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    const dy = e.clientY - dragStartYRef.current;
    targetProgressRef.current = dragStartProgressRef.current - dy * 1.25;
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // Safe fallback
      }
    }
  };

  const handleMouseEnter = () => {
    if (pauseOnHover) {
      isPausedRef.current = true;
    }
  };

  const handleMouseLeave = () => {
    if (pauseOnHover) {
      isPausedRef.current = false;
    }
    if (isDraggingRef.current) {
      isDraggingRef.current = false;
    }
  };

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full h-full select-none touch-none cursor-grab active:cursor-grabbing ${className}`}
      style={{
        perspective: `${perspective}px`,
        ...style
      }}
    >
      {/* 3D Helix Stage */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{
          transformStyle: 'preserve-3d',
        }}
      >
        {slots.map((k) => {
          const itemIndex = k % items.length;
          const item = items[itemIndex];
          return (
            <div
              key={k}
              ref={(el) => {
                cardsRef.current[k] = el;
              }}
              onClick={() => {
                onItemClick?.(item, itemIndex);
              }}
              className="absolute pointer-events-auto transition-shadow duration-300"
              style={{
                width: `${cardWidth}px`,
                height: `${cardHeight}px`,
                borderRadius: `${cardRadius}px`,
                transformStyle: 'preserve-3d',
                willChange: 'transform, opacity, filter',
                transform: 'translate3d(0,0,-2000px)',
                opacity: 0,
                backgroundColor: '#000000', // 100% Solid Obsidian Void: completely occludes particles in foreground
              }}
            >
              {renderItem ? (
                renderItem(item, itemIndex, false)
              ) : item.src ? (
                <div
                  className="w-full h-full overflow-hidden shadow-2xl border border-[#FFFFFF]/30 bg-[#000000]"
                  style={{ borderRadius: `${cardRadius}px` }}
                >
                  <img
                    src={item.src}
                    alt={item.alt || `Spiral card ${itemIndex + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: imageFit,
                      borderRadius: `${cardRadius}px`,
                    }}
                    draggable={false}
                  />
                </div>
              ) : (
                <div
                  className="w-full h-full p-3 rounded-xl bg-[#000000] border border-[#FFFFFF]/30 text-[#F5F5F5] shadow-2xl flex flex-col justify-between"
                  style={{ borderRadius: `${cardRadius}px` }}
                >
                  <div className="font-bold text-xs truncate text-[#E8E8E8]">
                    {item.title || item.name || `Item ${itemIndex + 1}`}
                  </div>
                  <div className="text-[10.5px] text-[#F5F5F5]/70 line-clamp-2">
                    {item.description || item.quote || ''}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InfiniteSpiral;
