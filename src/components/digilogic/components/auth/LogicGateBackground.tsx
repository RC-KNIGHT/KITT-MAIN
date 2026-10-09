/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';

interface GateNode {
  type: 'AND' | 'OR' | 'XOR' | 'NOT' | 'NAND';
  x: number;
  y: number;
  width: number;
  height: number;
  inA: boolean;
  inB: boolean;
  out: boolean;
}

interface WireTrace {
  points: { x: number; y: number }[];
  state: boolean;
  pulsePos: number; // 0 to 1
  pulseSpeed: number;
  pulseColor: string;
}

export const LogicGateBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePosRef = useRef<{ x: number; y: number }>({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Gate nodes & circuit wires
    let gates: GateNode[] = [];
    let wires: WireTrace[] = [];

    const initCircuit = (w: number, h: number) => {
      gates = [];
      wires = [];

      const colCount = Math.max(3, Math.floor(w / 280));
      const rowCount = Math.max(3, Math.floor(h / 200));
      const cellW = w / colCount;
      const cellH = h / rowCount;

      const types: GateNode['type'][] = ['AND', 'OR', 'XOR', 'NAND', 'NOT'];

      // Generate distributed gates
      for (let c = 0; c < colCount; c++) {
        for (let r = 0; r < rowCount; r++) {
          const type = types[(c + r * 2) % types.length];
          const gx = c * cellW + cellW * 0.35 + (Math.sin(c * 3 + r) * cellW * 0.15);
          const gy = r * cellH + cellH * 0.35 + (Math.cos(r * 2 + c) * cellH * 0.15);

          const inA = (c + r) % 2 === 0;
          const inB = (c * 2 + r) % 3 === 0;
          let out = false;
          if (type === 'AND') out = inA && inB;
          else if (type === 'OR') out = inA || inB;
          else if (type === 'XOR') out = inA !== inB;
          else if (type === 'NOT') out = !inA;
          else if (type === 'NAND') out = !(inA && inB);

          gates.push({
            type,
            x: gx,
            y: gy,
            width: 54,
            height: 38,
            inA,
            inB,
            out,
          });
        }
      }

      // Generate circuit wire traces connecting outputs to adjacent gate inputs or edge terminals
      for (let i = 0; i < gates.length; i++) {
        const g = gates[i];
        const nextG = gates[(i + 1) % gates.length];

        const startX = g.x + g.width / 2;
        const startY = g.y;

        // Orthogonal routing points
        const midX = (startX + nextG.x - nextG.width / 2) / 2;
        const targetX = nextG.x - nextG.width / 2;
        const targetY = nextG.y + (i % 2 === 0 ? -8 : 8);

        wires.push({
          points: [
            { x: startX, y: startY },
            { x: midX, y: startY },
            { x: midX, y: targetY },
            { x: targetX, y: targetY },
          ],
          state: g.out,
          pulsePos: (i * 0.17) % 1,
          pulseSpeed: 0.002 + ((i % 5) * 0.0008),
          pulseColor: g.out ? '#E8E8E8' : '#8F8F8F',
        });
      }
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);
      initCircuit(width, height);
    };

    resize();
    window.addEventListener('resize', resize);

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if ('clientX' in e) {
        mousePosRef.current = { x: e.clientX, y: e.clientY };
      } else if (e.touches.length > 0) {
        mousePosRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('touchmove', handlePointerMove);

    let lastTick = performance.now();

    const drawGate = (g: GateNode, time: number) => {
      ctx.save();
      ctx.translate(g.x, g.y);

      // Gate body fill & stroke
      ctx.fillStyle = g.out ? 'rgba(255, 255, 255, 0.2)' : 'rgba(29, 29, 30, 0.6)';
      ctx.strokeStyle = g.out ? '#FFFFFF' : '#29292A';
      ctx.lineWidth = 1.5;

      const w = g.width;
      const h = g.height;

      // Draw Gate Shape
      ctx.beginPath();
      if (g.type === 'AND') {
        ctx.moveTo(-w / 2, -h / 2);
        ctx.lineTo(0, -h / 2);
        ctx.arc(0, 0, h / 2, -Math.PI / 2, Math.PI / 2);
        ctx.lineTo(-w / 2, h / 2);
        ctx.closePath();
      } else if (g.type === 'OR') {
        ctx.moveTo(-w / 2, -h / 2);
        ctx.quadraticCurveTo(0, -h / 2, w / 2, 0);
        ctx.quadraticCurveTo(0, h / 2, -w / 2, h / 2);
        ctx.quadraticCurveTo(-w / 4, 0, -w / 2, -h / 2);
        ctx.closePath();
      } else if (g.type === 'XOR') {
        ctx.moveTo(-w / 2 + 6, -h / 2);
        ctx.quadraticCurveTo(0, -h / 2, w / 2, 0);
        ctx.quadraticCurveTo(0, h / 2, -w / 2 + 6, h / 2);
        ctx.quadraticCurveTo(-w / 4 + 6, 0, -w / 2 + 6, -h / 2);
        ctx.closePath();

        // Extra input arc
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(-w / 2 - 2, -h / 2);
        ctx.quadraticCurveTo(-w / 4 - 2, 0, -w / 2 - 2, h / 2);
      } else if (g.type === 'NOT') {
        ctx.moveTo(-w / 2, -h / 2);
        ctx.lineTo(w / 2 - 8, 0);
        ctx.lineTo(-w / 2, h / 2);
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(w / 2 - 3, 0, 4, 0, Math.PI * 2);
      } else {
        // NAND
        ctx.moveTo(-w / 2, -h / 2);
        ctx.lineTo(-2, -h / 2);
        ctx.arc(-2, 0, h / 2, -Math.PI / 2, Math.PI / 2);
        ctx.lineTo(-w / 2, h / 2);
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(w / 2 - 2, 0, 4, 0, Math.PI * 2);
      }

      ctx.fill();
      ctx.stroke();

      // Gate Text Label
      ctx.fillStyle = g.out ? '#E8E8E8' : 'rgba(245, 245, 245, 0.6)';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(g.type, -2, 0);

      // Output pin LED
      ctx.beginPath();
      ctx.arc(w / 2, 0, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = g.out ? '#E8E8E8' : '#29292A';
      ctx.fill();

      ctx.restore();
    };

    const render = (now: number) => {
      const delta = Math.min(now - lastTick, 50);
      lastTick = now;

      // Dark background
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      // Ambient Circuit Grid Dots
      const gridSize = 32;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      for (let x = 0; x < width; x += gridSize) {
        for (let y = 0; y < height; y += gridSize) {
          ctx.fillRect(x, y, 1.5, 1.5);
        }
      }

      // Draw wire traces
      for (let i = 0; i < wires.length; i++) {
        const wire = wires[i];
        const pts = wire.points;
        if (pts.length < 2) continue;

        // Base wire path
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let p = 1; p < pts.length; p++) {
          ctx.lineTo(pts[p].x, pts[p].y);
        }
        ctx.strokeStyle = wire.state ? 'rgba(255, 255, 255, 0.4)' : 'rgba(41, 41, 42, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Traveling Signal Pulse Spark
        if (!prefersReducedMotion) {
          wire.pulsePos = (wire.pulsePos + wire.pulseSpeed * (delta / 16)) % 1;
        }

        // Calculate current position along the multi-point path
        const totalSegments = pts.length - 1;
        const targetSegment = Math.min(Math.floor(wire.pulsePos * totalSegments), totalSegments - 1);
        const segmentProgress = (wire.pulsePos * totalSegments) - targetSegment;

        const pA = pts[targetSegment];
        const pB = pts[targetSegment + 1];
        if (pA && pB) {
          const pulseX = pA.x + (pB.x - pA.x) * segmentProgress;
          const pulseY = pA.y + (pB.y - pA.y) * segmentProgress;

          // Spark glow
          const grad = ctx.createRadialGradient(pulseX, pulseY, 0, pulseX, pulseY, 8);
          grad.addColorStop(0, wire.pulseColor);
          grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(pulseX, pulseY, 8, 0, Math.PI * 2);
          ctx.fill();

          // Spark center point
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(pulseX, pulseY, 1.5, 0, Math.PI * 2);
          ctx.fill();

          // Subtle Binary digit (0 / 1) floating alongside pulse
          if (i % 3 === 0) {
            ctx.fillStyle = wire.state ? 'rgba(232, 232, 232, 0.8)' : 'rgba(180, 180, 180, 0.5)';
            ctx.font = '8px monospace';
            ctx.fillText(wire.state ? '1' : '0', pulseX + 6, pulseY - 4);
          }
        }
      }

      // Draw Gates
      for (let i = 0; i < gates.length; i++) {
        drawGate(gates[i], now);
      }

      // Cursor Proximity Ambient Aura
      const mx = mousePosRef.current.x;
      const my = mousePosRef.current.y;
      if (mx > 0 && my > 0) {
        const mouseGrad = ctx.createRadialGradient(mx, my, 0, mx, my, 180);
        mouseGrad.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
        mouseGrad.addColorStop(0.5, 'rgba(143, 143, 143, 0.04)');
        mouseGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = mouseGrad;
        ctx.fillRect(0, 0, width, height);
      }

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      aria-hidden="true"
    />
  );
};
