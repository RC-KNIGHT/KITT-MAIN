import React, { useEffect, useState, useRef } from 'react';

export const SurrealAuraCursor: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  
  const cursorRef = useRef<{ x: number; y: number }>({ x: -100, y: -100 });
  const auraRef = useRef<{ x: number; y: number }>({ x: -100, y: -100 });
  const animFrameRef = useRef<number>(0);
  const dotElRef = useRef<HTMLDivElement>(null);
  const auraElRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only enable on non-touch devices
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (isTouch) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isVisible) setIsVisible(true);
      cursorRef.current.x = e.clientX;
      cursorRef.current.y = e.clientY;
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    const handleOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const interactive = target.closest('a, button, input, [role=button], .surreal-card, .cursor-pointer');
      setIsHovered(!!interactive);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseover', handleOver, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    const updateLoop = () => {
      // Lerp aura position towards cursor position
      auraRef.current.x += (cursorRef.current.x - auraRef.current.x) * 0.15;
      auraRef.current.y += (cursorRef.current.y - auraRef.current.y) * 0.15;

      if (dotElRef.current) {
        dotElRef.current.style.transform = `translate3d(${cursorRef.current.x}px, ${cursorRef.current.y}px, 0) translate(-50%, -50%)`;
      }
      if (auraElRef.current) {
        auraElRef.current.style.transform = `translate3d(${auraRef.current.x}px, ${auraRef.current.y}px, 0) translate(-50%, -50%)`;
      }

      animFrameRef.current = requestAnimationFrame(updateLoop);
    };

    animFrameRef.current = requestAnimationFrame(updateLoop);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleOver);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden transition-opacity duration-300">
      {/* Ethereal Sand & Teal Aura */}
      <div
        ref={auraElRef}
        className={`absolute rounded-full transition-all duration-300 ease-out will-change-transform ${
          isHovered
            ? 'w-16 h-16 bg-[#407E8C]/20 border border-[#A58D66]/60 shadow-[0_0_24px_rgba(64,126,140,0.5)] scale-125'
            : isClicking
            ? 'w-8 h-8 bg-[#A58D66]/30 border border-[#E5E1DD]/70 shadow-[0_0_20px_rgba(165,141,102,0.6)] scale-90'
            : 'w-10 h-10 bg-[#407E8C]/15 border border-[#A58D66]/30 shadow-[0_0_15px_rgba(64,126,140,0.3)]'
        }`}
      />

      {/* Center pinpoint sand celestial star */}
      <div
        ref={dotElRef}
        className={`absolute rounded-full will-change-transform transition-all duration-150 ${
          isHovered
            ? 'w-2 h-2 bg-[#E5E1DD] shadow-[0_0_8px_#E5E1DD]'
            : isClicking
            ? 'w-2.5 h-2.5 bg-[#A58D66] shadow-[0_0_10px_#A58D66]'
            : 'w-1.5 h-1.5 bg-[#E5E1DD]/90 shadow-[0_0_5px_#E5E1DD]'
        }`}
      />
    </div>
  );
};
