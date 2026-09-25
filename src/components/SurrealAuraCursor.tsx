import React, { useEffect, useState, useRef } from 'react';

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
  color: string;
}

/**
 * SurrealAuraCursor
 * 
 * Cinematic electronics-inspired cursor experience:
 * 1. Micro soldering-spark & electron trail particle emitter
 * 2. Magnetic dual-ring glowing aura (Oceanic Teal & Antique Gold)
 * 3. Reactive physics on click (spark burst) and interactive element hover
 * 4. Strictly disabled on touch devices and respects prefers-reduced-motion
 */
export const SurrealAuraCursor: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<{ x: number; y: number; prevX: number; prevY: number }>({ x: -100, y: -100, prevX: -100, prevY: -100 });
  const auraRef = useRef<{ x: number; y: number }>({ x: -100, y: -100 });
  const animFrameRef = useRef<number>(0);
  const sparksRef = useRef<Spark[]>([]);

  const dotElRef = useRef<HTMLDivElement>(null);
  const auraElRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only enable on non-touch devices with fine pointers
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (isTouch) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize, { passive: true });

    const sparkPalette = ['#DFCCA8', '#A58D66', '#407E8C', '#76B4C2', '#FFFFFF'];

    const spawnSparks = (x: number, y: number, count: number, speedMultiplier = 1.0) => {
      if (prefersReducedMotion) return;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = (Math.random() * 2.5 + 0.8) * speedMultiplier;
        sparksRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.4, // subtle upward draft
          size: Math.random() * 2.0 + 0.8,
          alpha: 1.0,
          decay: Math.random() * 0.045 + 0.025,
          color: sparkPalette[Math.floor(Math.random() * sparkPalette.length)],
        });
      }
      // Cap maximum active sparks for performance
      if (sparksRef.current.length > 80) {
        sparksRef.current.splice(0, sparksRef.current.length - 80);
      }
    };

    let moveDistance = 0;
    const handleMouseMove = (e: MouseEvent) => {
      if (!isVisible) setIsVisible(true);
      cursorRef.current.prevX = cursorRef.current.x;
      cursorRef.current.prevY = cursorRef.current.y;
      cursorRef.current.x = e.clientX;
      cursorRef.current.y = e.clientY;

      const dx = cursorRef.current.x - cursorRef.current.prevX;
      const dy = cursorRef.current.y - cursorRef.current.prevY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      moveDistance += dist;

      // Spawn electron trail sparks on movement
      if (moveDistance > 14) {
        spawnSparks(e.clientX, e.clientY, 2, 0.7);
        moveDistance = 0;
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      setIsClicking(true);
      // Hot soldering spark burst on click
      spawnSparks(e.clientX, e.clientY, 16, 2.2);
    };

    const handleMouseUp = () => setIsClicking(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    const handleOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const interactive = target.closest('a, button, input, [role=button], .tilt-card-wrapper, .cursor-pointer');
      setIsHovered(!!interactive);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseover', handleOver, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    const updateLoop = () => {
      // Smooth spring lerp for outer aura
      const lerpFactor = isHovered ? 0.22 : 0.16;
      auraRef.current.x += (cursorRef.current.x - auraRef.current.x) * lerpFactor;
      auraRef.current.y += (cursorRef.current.y - auraRef.current.y) * lerpFactor;

      if (dotElRef.current) {
        dotElRef.current.style.transform = `translate3d(${cursorRef.current.x}px, ${cursorRef.current.y}px, 0) translate(-50%, -50%)`;
      }
      if (auraElRef.current) {
        auraElRef.current.style.transform = `translate3d(${auraRef.current.x}px, ${auraRef.current.y}px, 0) translate(-50%, -50%)`;
      }

      // Render soldering sparks on 2D canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = sparksRef.current.length - 1; i >= 0; i--) {
        const p = sparksRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.04; // gravity
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          sparksRef.current.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animFrameRef.current = requestAnimationFrame(updateLoop);
    };

    animFrameRef.current = requestAnimationFrame(updateLoop);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', updateCanvasSize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleOver);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isVisible, isHovered]);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden select-none">
      {/* Solder spark canvas trail */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
      />

      {/* Outer Magnetic Glowing Aura */}
      <div
        ref={auraElRef}
        className={`absolute rounded-full transition-all duration-200 ease-out will-change-transform pointer-events-none ${
          isHovered
            ? 'w-16 h-16 bg-[#407E8C]/20 border border-[#A58D66]/70 shadow-[0_0_30px_rgba(64,126,140,0.6),inset_0_0_15px_rgba(165,141,102,0.3)] scale-125 backdrop-blur-[0.5px]'
            : isClicking
            ? 'w-8 h-8 bg-[#A58D66]/35 border border-[#DFCCA8]/80 shadow-[0_0_24px_rgba(165,141,102,0.7)] scale-90'
            : 'w-10 h-10 bg-[#407E8C]/15 border border-[#A58D66]/35 shadow-[0_0_18px_rgba(64,126,140,0.35)]'
        }`}
      />

      {/* Center Laser-Precision Pinpoint Star */}
      <div
        ref={dotElRef}
        className={`absolute rounded-full will-change-transform transition-all duration-100 pointer-events-none ${
          isHovered
            ? 'w-2.5 h-2.5 bg-[#DFCCA8] shadow-[0_0_10px_#DFCCA8,0_0_20px_#A58D66]'
            : isClicking
            ? 'w-3 h-3 bg-[#A58D66] shadow-[0_0_14px_#A58D66]'
            : 'w-1.5 h-1.5 bg-[#E5E1DD] shadow-[0_0_6px_#E5E1DD]'
        }`}
      />
    </div>
  );
};

export default SurrealAuraCursor;
