import React, { useEffect, useRef } from 'react';

/**
 * PremiumLogicGatesMatrix
 * 
 * An authentic, high-end electronics & logic gates visual animation engine.
 * Renders ANSI/IEEE logic gate symbols (AND, OR, NOT, XOR, NAND, NOR),
 * pulsing circuit bus traces, dynamic truth-state evaluations (1/0 pulses),
 * and silicon IC packages in the signature Sovereign Gold & Cyan aesthetic.
 */
export const PremiumLogicGatesMatrix: React.FC<{ className?: string }> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let width = 0;
    let viewportH = 0;
    let docH = 0;
    let scrollY = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.15);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const mouse = {
      x: -1000,
      y: -1000,
      targetX: -1000,
      targetY: -1000,
      radius: 180,
    };

    // Arms a single animation frame. The bitmap is viewport-sized and follows
    // the document with a compositor transform, so scrolling itself never
    // requires a redraw — only window resizes and animated frames do.
    const schedule = () => {
      if (!animId && !document.hidden) {
        animId = requestAnimationFrame(render);
      }
    };

    // Viewport-relative device coords; no getBoundingClientRect on every event.
    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX * dpr;
      mouse.targetY = e.clientY * dpr;
    };

    const handleMouseLeave = () => {
      mouse.targetX = -1000;
      mouse.targetY = -1000;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave, { passive: true });

    const resize = () => {
      width = window.innerWidth * dpr;
      viewportH = window.innerHeight * dpr;
      docH = Math.max(document.documentElement.scrollHeight, window.innerHeight);
      canvas.width = width;
      canvas.height = viewportH;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      schedule();
    };

    const handleScroll = () => {
      scrollY = window.scrollY || 0;
      canvas.style.transform = `translate3d(0, ${scrollY}px, 0)`;
      // Under reduced motion the loop never runs, so redraw on demand.
      if (reducedMotion) schedule();
    };

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Document height changes (fonts, images, accordions) without a window
    // resize; keep the cached value fresh without per-frame layout reads.
    const docObserver = new ResizeObserver(() => {
      docH = Math.max(document.documentElement.scrollHeight, window.innerHeight);
    });
    docObserver.observe(document.body);

    // ============================================================
    // 1. LOGIC GATES ARCHITECTURE (ANSI / IEEE Standard Symbols)
    // ============================================================
    type GateType = 'AND' | 'OR' | 'NOT' | 'XOR' | 'NAND' | 'NOR';

    interface GateNode {
      id: string;
      type: GateType;
      normX: number;
      normY: number;
      scale: number;
      inputA: number;
      inputB?: number;
      output: number;
      activePulse: number;
      pulseTimer: number;
      label: string;
      subLabel: string;
    }

    const gates: GateNode[] = [
      // Top Left Area: AND Gate
      {
        id: 'g-and-1',
        type: 'AND',
        normX: 0.14,
        normY: 0.18,
        scale: 1.0,
        inputA: 1,
        inputB: 1,
        output: 1,
        activePulse: 0.8,
        pulseTimer: 0,
        label: 'AND // 74HC08',
        subLabel: 'Y = A · B [1 · 1 = 1]',
      },
      // Top Center-Right: XOR Gate
      {
        id: 'g-xor-1',
        type: 'XOR',
        normX: 0.78,
        normY: 0.16,
        scale: 1.0,
        inputA: 1,
        inputB: 0,
        output: 1,
        activePulse: 0.9,
        pulseTimer: 0.3,
        label: 'XOR // 74HC86',
        subLabel: 'Y = A ⊕ B [1 ⊕ 0 = 1]',
      },
      // Mid Left: OR Gate
      {
        id: 'g-or-1',
        type: 'OR',
        normX: 0.10,
        normY: 0.52,
        scale: 1.05,
        inputA: 0,
        inputB: 1,
        output: 1,
        activePulse: 0.6,
        pulseTimer: 0.6,
        label: 'OR // 74HC32',
        subLabel: 'Y = A + B [0 + 1 = 1]',
      },
      // Mid Right: NAND Gate
      {
        id: 'g-nand-1',
        type: 'NAND',
        normX: 0.86,
        normY: 0.48,
        scale: 1.0,
        inputA: 1,
        inputB: 1,
        output: 0,
        activePulse: 0.4,
        pulseTimer: 0.8,
        label: 'NAND // 74HC00',
        subLabel: 'Y = ¬(A · B) [¬1 = 0]',
      },
      // Bottom Left: NOT Gate (Inverter)
      {
        id: 'g-not-1',
        type: 'NOT',
        normX: 0.20,
        normY: 0.82,
        scale: 0.95,
        inputA: 0,
        output: 1,
        activePulse: 0.7,
        pulseTimer: 0.2,
        label: 'NOT // 74HC04',
        subLabel: 'Y = ¬A [¬0 = 1]',
      },
      // Bottom Right: NOR Gate
      {
        id: 'g-nor-1',
        type: 'NOR',
        normX: 0.82,
        normY: 0.80,
        scale: 1.0,
        inputA: 0,
        inputB: 0,
        output: 1,
        activePulse: 0.85,
        pulseTimer: 0.5,
        label: 'NOR // 74HC02',
        subLabel: 'Y = ¬(A + B) [¬0 = 1]',
      },
    ];

    // Traces
    const traceDefs = [
      [
        { x: 0.04, y: 0.18 },
        { x: 0.14, y: 0.18 },
        { x: 0.24, y: 0.18 },
        { x: 0.32, y: 0.28 },
        { x: 0.44, y: 0.28 },
      ],
      [
        { x: 0.08, y: 0.82 },
        { x: 0.20, y: 0.82 },
        { x: 0.30, y: 0.82 },
        { x: 0.38, y: 0.72 },
        { x: 0.48, y: 0.72 },
      ],
      [
        { x: 0.96, y: 0.16 },
        { x: 0.86, y: 0.16 },
        { x: 0.78, y: 0.16 },
        { x: 0.68, y: 0.26 },
        { x: 0.56, y: 0.26 },
      ],
      [
        { x: 0.94, y: 0.48 },
        { x: 0.86, y: 0.48 },
        { x: 0.74, y: 0.48 },
        { x: 0.66, y: 0.40 },
        { x: 0.58, y: 0.40 },
      ],
      [
        { x: 0.94, y: 0.80 },
        { x: 0.82, y: 0.80 },
        { x: 0.70, y: 0.80 },
        { x: 0.62, y: 0.70 },
        { x: 0.52, y: 0.70 },
      ],
    ];

    interface SignalPacket {
      traceIdx: number;
      progress: number;
      speed: number;
      size: number;
      color: string;
      state: '0' | '1';
    }

    const packets: SignalPacket[] = [
      { traceIdx: 0, progress: 0.15, speed: 0.0035, size: 4, color: '#E8E8E8', state: '1' },
      { traceIdx: 0, progress: 0.70, speed: 0.0035, size: 3.5, color: '#B4B4B4', state: '0' },
      { traceIdx: 1, progress: 0.40, speed: 0.0030, size: 4, color: '#E8E8E8', state: '1' },
      { traceIdx: 2, progress: 0.25, speed: 0.0040, size: 4, color: '#B4B4B4', state: '1' },
      { traceIdx: 2, progress: 0.80, speed: 0.0040, size: 3.5, color: '#FFFFFF', state: '0' },
      { traceIdx: 3, progress: 0.50, speed: 0.0032, size: 4, color: '#E8E8E8', state: '1' },
      { traceIdx: 4, progress: 0.30, speed: 0.0038, size: 4, color: '#B4B4B4', state: '1' },
    ];

    // Helper: Draw Logic Gate Symbols according to ANSI standard
    const drawAndGate = (x: number, y: number, s: number, active: number) => {
      ctx.save();
      ctx.translate(x, y);

      const w = 44 * s;
      const h = 40 * s;

      if (active > 0.3) {
        ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
        ctx.shadowBlur = 15 * active;
      }

      ctx.beginPath();
      ctx.moveTo(-w / 2, -h / 2);
      ctx.lineTo(0, -h / 2);
      ctx.arc(0, 0, h / 2, -Math.PI / 2, Math.PI / 2);
      ctx.lineTo(-w / 2, h / 2);
      ctx.closePath();

      ctx.fillStyle = active > 0.5 ? 'rgba(29, 29, 30, 0.95)' : 'rgba(0, 0, 0, 0.85)';
      ctx.fill();
      ctx.strokeStyle = active > 0.5 ? '#E8E8E8' : 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 1.5 * dpr;
      ctx.stroke();

      // Input pins (A, B)
      ctx.beginPath();
      ctx.moveTo(-w / 2 - 12 * s, -h / 4);
      ctx.lineTo(-w / 2, -h / 4);
      ctx.moveTo(-w / 2 - 12 * s, h / 4);
      ctx.lineTo(-w / 2, h / 4);
      // Output pin (Y)
      ctx.moveTo(h / 2, 0);
      ctx.lineTo(h / 2 + 12 * s, 0);
      ctx.strokeStyle = active > 0.5 ? '#E8E8E8' : 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1.2 * dpr;
      ctx.stroke();

      // Terminal pad vias
      const drawVia = (px: number, py: number, high: boolean) => {
        ctx.beginPath();
        ctx.arc(px, py, 2.5 * s, 0, Math.PI * 2);
        ctx.fillStyle = high ? '#E8E8E8' : '#8F8F8F';
        ctx.fill();
      };

      drawVia(-w / 2 - 12 * s, -h / 4, true);
      drawVia(-w / 2 - 12 * s, h / 4, true);
      drawVia(h / 2 + 12 * s, 0, active > 0.5);

      ctx.restore();
    };

    const drawOrGate = (x: number, y: number, s: number, active: number) => {
      ctx.save();
      ctx.translate(x, y);

      const w = 46 * s;
      const h = 42 * s;

      if (active > 0.3) {
        ctx.shadowColor = 'rgba(143, 143, 143, 0.45)';
        ctx.shadowBlur = 15 * active;
      }

      ctx.beginPath();
      ctx.moveTo(-w / 2, -h / 2);
      ctx.quadraticCurveTo(0, -h / 2 + 2, w / 2, 0);
      ctx.quadraticCurveTo(0, h / 2 - 2, -w / 2, h / 2);
      ctx.quadraticCurveTo(-w / 2 + 10 * s, 0, -w / 2, -h / 2);
      ctx.closePath();

      ctx.fillStyle = active > 0.5 ? 'rgba(29, 29, 30, 0.95)' : 'rgba(0, 0, 0, 0.85)';
      ctx.fill();
      ctx.strokeStyle = active > 0.5 ? '#B4B4B4' : 'rgba(143, 143, 143, 0.5)';
      ctx.lineWidth = 1.5 * dpr;
      ctx.stroke();

      // Pins
      ctx.beginPath();
      ctx.moveTo(-w / 2 - 10 * s, -h / 4);
      ctx.lineTo(-w / 2 + 6 * s, -h / 4);
      ctx.moveTo(-w / 2 - 10 * s, h / 4);
      ctx.lineTo(-w / 2 + 6 * s, h / 4);
      ctx.moveTo(w / 2, 0);
      ctx.lineTo(w / 2 + 12 * s, 0);
      ctx.strokeStyle = active > 0.5 ? '#B4B4B4' : 'rgba(143, 143, 143, 0.4)';
      ctx.lineWidth = 1.2 * dpr;
      ctx.stroke();

      ctx.restore();
    };

    const drawXorGate = (x: number, y: number, s: number, active: number) => {
      ctx.save();
      ctx.translate(x, y);

      const w = 48 * s;
      const h = 42 * s;

      if (active > 0.3) {
        ctx.shadowColor = 'rgba(255, 255, 255, 0.45)';
        ctx.shadowBlur = 15 * active;
      }

      // Outer input shield arc
      ctx.beginPath();
      ctx.moveTo(-w / 2 - 5 * s, -h / 2);
      ctx.quadraticCurveTo(-w / 2 + 5 * s, 0, -w / 2 - 5 * s, h / 2);
      ctx.strokeStyle = active > 0.5 ? '#E8E8E8' : 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 1.5 * dpr;
      ctx.stroke();

      // Main OR body
      ctx.beginPath();
      ctx.moveTo(-w / 2 + 2 * s, -h / 2);
      ctx.quadraticCurveTo(0, -h / 2 + 2, w / 2, 0);
      ctx.quadraticCurveTo(0, h / 2 - 2, -w / 2 + 2 * s, h / 2);
      ctx.quadraticCurveTo(-w / 2 + 12 * s, 0, -w / 2 + 2 * s, -h / 2);
      ctx.closePath();

      ctx.fillStyle = active > 0.5 ? 'rgba(29, 29, 30, 0.95)' : 'rgba(0, 0, 0, 0.85)';
      ctx.fill();
      ctx.strokeStyle = active > 0.5 ? '#E8E8E8' : 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 1.5 * dpr;
      ctx.stroke();

      // Pins
      ctx.beginPath();
      ctx.moveTo(-w / 2 - 14 * s, -h / 4);
      ctx.lineTo(-w / 2 - 2 * s, -h / 4);
      ctx.moveTo(-w / 2 - 14 * s, h / 4);
      ctx.lineTo(-w / 2 - 2 * s, h / 4);
      ctx.moveTo(w / 2, 0);
      ctx.lineTo(w / 2 + 12 * s, 0);
      ctx.strokeStyle = active > 0.5 ? '#E8E8E8' : 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1.2 * dpr;
      ctx.stroke();

      ctx.restore();
    };

    const drawNotGate = (x: number, y: number, s: number, active: number) => {
      ctx.save();
      ctx.translate(x, y);

      const w = 38 * s;
      const h = 34 * s;

      if (active > 0.3) {
        ctx.shadowColor = 'rgba(180, 180, 180, 0.4)';
        ctx.shadowBlur = 12 * active;
      }

      ctx.beginPath();
      ctx.moveTo(-w / 2, -h / 2);
      ctx.lineTo(w / 2 - 6 * s, 0);
      ctx.lineTo(-w / 2, h / 2);
      ctx.closePath();

      ctx.fillStyle = active > 0.5 ? 'rgba(29, 29, 30, 0.95)' : 'rgba(0, 0, 0, 0.85)';
      ctx.fill();
      ctx.strokeStyle = active > 0.5 ? '#B4B4B4' : 'rgba(143, 143, 143, 0.5)';
      ctx.lineWidth = 1.5 * dpr;
      ctx.stroke();

      // Inversion Bubble
      ctx.beginPath();
      ctx.arc(w / 2 - 2 * s, 0, 3.5 * s, 0, Math.PI * 2);
      ctx.fillStyle = '#000000';
      ctx.fill();
      ctx.strokeStyle = active > 0.5 ? '#B4B4B4' : 'rgba(143, 143, 143, 0.5)';
      ctx.lineWidth = 1.2 * dpr;
      ctx.stroke();

      // Pins
      ctx.beginPath();
      ctx.moveTo(-w / 2 - 12 * s, 0);
      ctx.lineTo(-w / 2, 0);
      ctx.moveTo(w / 2 + 2 * s, 0);
      ctx.lineTo(w / 2 + 14 * s, 0);
      ctx.strokeStyle = active > 0.5 ? '#B4B4B4' : 'rgba(143, 143, 143, 0.4)';
      ctx.lineWidth = 1.2 * dpr;
      ctx.stroke();

      ctx.restore();
    };

    const drawNandGate = (x: number, y: number, s: number, active: number) => {
      drawAndGate(x, y, s, active);
      ctx.save();
      ctx.translate(x + 23 * s, y);
      ctx.beginPath();
      ctx.arc(0, 0, 3.5 * s, 0, Math.PI * 2);
      ctx.fillStyle = '#000000';
      ctx.fill();
      ctx.strokeStyle = active > 0.5 ? '#E8E8E8' : 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 1.2 * dpr;
      ctx.stroke();
      ctx.restore();
    };

    const drawNorGate = (x: number, y: number, s: number, active: number) => {
      drawOrGate(x, y, s, active);
      ctx.save();
      ctx.translate(x + 25 * s, y);
      ctx.beginPath();
      ctx.arc(0, 0, 3.5 * s, 0, Math.PI * 2);
      ctx.fillStyle = '#000000';
      ctx.fill();
      ctx.strokeStyle = active > 0.5 ? '#B4B4B4' : 'rgba(143, 143, 143, 0.5)';
      ctx.lineWidth = 1.2 * dpr;
      ctx.stroke();
      ctx.restore();
    };

    // Silicon ASIC Package
    const drawAsicPackage = (cx: number, cy: number, timeSec: number) => {
      ctx.save();
      ctx.translate(cx, cy);

      const size = 110 * dpr;
      const half = size / 2;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1.5 * dpr;

      ctx.beginPath();
      ctx.roundRect(-half, -half, size, size, 8 * dpr);
      ctx.fill();
      ctx.stroke();

      // Pin 1 Indicator
      ctx.beginPath();
      ctx.arc(-half + 12 * dpr, -half + 12 * dpr, 3.5 * dpr, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();

      // Die Center
      const dieSize = size * 0.52;
      ctx.fillStyle = 'rgba(29, 29, 30, 0.85)';
      ctx.strokeStyle = 'rgba(143, 143, 143, 0.4)';
      ctx.lineWidth = 1 * dpr;
      ctx.beginPath();
      ctx.roundRect(-dieSize / 2, -dieSize / 2, dieSize, dieSize, 4 * dpr);
      ctx.fill();
      ctx.stroke();

      // Labels
      ctx.fillStyle = '#F5F5F5';
      ctx.font = 'bold ' + (9 * dpr) + 'px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('KITT-IC 2.0', 0, -6 * dpr);

      ctx.fillStyle = '#FFFFFF';
      ctx.font = (7.5 * dpr) + 'px monospace';
      ctx.fillText('RISC-V // 64-BIT', 0, 7 * dpr);

      const clkPhase = (timeSec * 4) % 1;
      ctx.fillStyle = clkPhase > 0.5 ? '#B4B4B4' : '#FFFFFF';
      ctx.font = (6.5 * dpr) + 'px monospace';
      ctx.fillText('CLK: 100MHz', 0, 18 * dpr);

      // Pins
      const pinCount = 6;
      const pinLength = 8 * dpr;
      const step = size / (pinCount + 1);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 1.2 * dpr;

      for (let i = 1; i <= pinCount; i++) {
        const offset = -half + i * step;
        ctx.beginPath();
        ctx.moveTo(offset, -half);
        ctx.lineTo(offset, -half - pinLength);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(offset, half);
        ctx.lineTo(offset, half + pinLength);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(-half, offset);
        ctx.lineTo(-half - pinLength, offset);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(half, offset);
        ctx.lineTo(half + pinLength, offset);
        ctx.stroke();
      }

      ctx.restore();
    };

    let lastTime = performance.now();
    // Atmospheric instrumentation runs at half rate: packets and pulses move
    // slowly, so 30fps looks identical while halving the full-viewport
    // bitmap raster cost that competes with the foreground content.
    const FRAME_MS = 1000 / 30;
    let lastFrameAt = -FRAME_MS;

    const render = (time: number) => {
      animId = 0;
      if (time - lastFrameAt < FRAME_MS) {
        schedule();
        return;
      }
      lastFrameAt = time;

      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;
      const timeSec = time / 1000;

      mouse.x += (mouse.targetX - mouse.x) * 0.1;
      mouse.y += (mouse.targetY - mouse.y) * 0.1;

      const docDeviceH = docH * dpr;
      const scrollDevice = scrollY * dpr;

      // Clear the viewport bitmap, then draw in document coordinates so the
      // scene scrolls underneath the bitmap without any per-frame DOM reads.
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, width, viewportH);
      ctx.setTransform(1, 0, 0, 1, 0, -scrollDevice);

      // Traces (culled to the visible document window)
      traceDefs.forEach((pts) => {
        let minY = Infinity;
        let maxY = -Infinity;
        for (let i = 0; i < pts.length; i++) {
          const py = pts[i].y * docDeviceH;
          if (py < minY) minY = py;
          if (py > maxY) maxY = py;
        }
        if (maxY - scrollDevice < -80 || minY - scrollDevice > viewportH + 80) return;

        ctx.beginPath();
        for (let i = 0; i < pts.length; i++) {
          const px = pts[i].x * width;
          const py = pts[i].y * docDeviceH;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1 * dpr;
        ctx.stroke();
      });

      // Packets
      packets.forEach((p) => {
        p.progress += p.speed;
        if (p.progress > 1) p.progress = 0;

        const pts = traceDefs[p.traceIdx];
        if (!pts || pts.length < 2) return;

        const totalSegments = pts.length - 1;
        const segIdx = Math.min(Math.floor(p.progress * totalSegments), totalSegments - 1);
        const segProgress = (p.progress * totalSegments) - segIdx;

        const p1 = pts[segIdx];
        const p2 = pts[segIdx + 1];
        const x = (p1.x + (p2.x - p1.x) * segProgress) * width;
        const y = (p1.y + (p2.y - p1.y) * segProgress) * docDeviceH;
        if (y - scrollDevice < -20 || y - scrollDevice > viewportH + 20) return;

        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, p.size * dpr, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10 * dpr;
        ctx.fill();

        ctx.fillStyle = '#000000';
        ctx.font = 'bold ' + (6 * dpr) + 'px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.state, x, y);
        ctx.restore();
      });

      // Center ASIC (anchored ~46% down the document, culled to the viewport)
      if (width > 800) {
        const asicY = docDeviceH * 0.46;
        if (asicY - scrollDevice > -160 * dpr && asicY - scrollDevice < viewportH + 160 * dpr) {
          drawAsicPackage(width * 0.50, asicY, timeSec);
        }
      }

      // Logic Gates (positions live in document space; off-screen gates keep
      // their pulse timers but are not drawn)
      gates.forEach((gate) => {
        const gx = gate.normX * width;
        const gy = gate.normY * docDeviceH;
        const gyView = gy - scrollDevice;

        gate.pulseTimer += dt * 0.8;
        gate.activePulse = 0.4 + 0.6 * Math.sin(gate.pulseTimer * 3);

        if (gyView < -120 || gyView > viewportH + 120) return;

        const dx = mouse.x - gx;
        const dy = mouse.y - gyView;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius * dpr) {
          const factor = 1 - dist / (mouse.radius * dpr);
          gate.activePulse = Math.min(1, gate.activePulse + factor * 0.8);
        }

        const s = gate.scale * dpr;

        switch (gate.type) {
          case 'AND':
            drawAndGate(gx, gy, s, gate.activePulse);
            break;
          case 'OR':
            drawOrGate(gx, gy, s, gate.activePulse);
            break;
          case 'XOR':
            drawXorGate(gx, gy, s, gate.activePulse);
            break;
          case 'NOT':
            drawNotGate(gx, gy, s, gate.activePulse);
            break;
          case 'NAND':
            drawNandGate(gx, gy, s, gate.activePulse);
            break;
          case 'NOR':
            drawNorGate(gx, gy, s, gate.activePulse);
            break;
        }

        ctx.save();
        ctx.textAlign = 'center';
        ctx.font = 'bold ' + (8.5 * dpr) + 'px monospace';
        ctx.fillStyle = gate.activePulse > 0.6 ? '#E8E8E8' : 'rgba(245, 245, 245, 0.7)';
        ctx.fillText(gate.label, gx, gy + 32 * s);

        ctx.font = (7 * dpr) + 'px monospace';
        ctx.fillStyle = gate.activePulse > 0.6 ? '#B4B4B4' : 'rgba(255, 255, 255, 0.55)';
        ctx.fillText(gate.subLabel, gx, gy + 42 * s);
        ctx.restore();
      });

      if (!reducedMotion) schedule();
    };

    // Static frame for reduced-motion users; animated loop otherwise.
    resize();
    handleScroll(); // sync transform when the page loads restored mid-scroll
    if (reducedMotion) {
      render(performance.now());
    } else {
      schedule();
    }

    const handleVisibility = () => {
      if (!document.hidden) {
        schedule();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      cancelAnimationFrame(animId);
      animId = 0;
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      docObserver.disconnect();
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      <canvas
        ref={canvasRef}
        className="w-full h-full block opacity-75"
      />
    </div>
  );
};

export default PremiumLogicGatesMatrix;
