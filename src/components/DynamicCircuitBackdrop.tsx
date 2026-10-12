import React, { useEffect, useRef } from 'react';

/**
 * DynamicCircuitBackdrop
 * 
 * High-end EDA & hardware-lab visual background:
 * 1. Dual-channel oscilloscope waveforms (live flowing PWM & sine telemetry)
 * 2. High-speed PCB bus traces with phosphor fading photon trails
 * 3. Silicon test points, via rings, and coordinate crosshairs
 * 4. Strictly clamped DPR <= 1.5 and reduced motion compliance
 */
export const DynamicCircuitBackdrop: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // The static furniture (reticle grid, copper traces, pads, pinout labels)
    // never changes between resizes, so it is rasterized once into an
    // offscreen bitmap and blitted per frame instead of re-stroking hundreds
    // of paths 60 times per second.
    let staticDirty = true;
    let inView = true;

    const updateSize = () => {
      if (!canvas || !canvas.parentElement) return;
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      staticDirty = true;
    };

    updateSize();
    window.addEventListener('resize', updateSize, { passive: true });

    interface TracePoint {
      x: number;
      y: number;
    }

    interface Trace {
      points: TracePoint[];
      color: string;
      pulseSpeed: number;
      pulseOffset: number;
      pulseLength: number;
      pulseColor: string;
      label?: string;
    }

    const traces: Trace[] = [
      // Top Left MCU Data Bus
      {
        points: [
          { x: 0.04, y: 0.14 },
          { x: 0.16, y: 0.14 },
          { x: 0.24, y: 0.22 },
          { x: 0.36, y: 0.22 }
        ],
        color: 'rgba(255, 255, 255, 0.22)',
        pulseSpeed: 0.002,
        pulseOffset: 0.1,
        pulseLength: 0.25,
        pulseColor: '#E8E8E8',
        label: 'SPI_MOSI // 40MHz'
      },
      {
        points: [
          { x: 0.04, y: 0.17 },
          { x: 0.155, y: 0.17 },
          { x: 0.235, y: 0.25 },
          { x: 0.36, y: 0.25 }
        ],
        color: 'rgba(143, 143, 143, 0.24)',
        pulseSpeed: 0.0025,
        pulseOffset: 0.4,
        pulseLength: 0.22,
        pulseColor: '#B4B4B4',
        label: 'SPI_CLK // 80MHz'
      },
      // Top Right Power & Sensor Rail
      {
        points: [
          { x: 0.96, y: 0.16 },
          { x: 0.84, y: 0.16 },
          { x: 0.76, y: 0.24 },
          { x: 0.64, y: 0.24 }
        ],
        color: 'rgba(245, 245, 245, 0.2)',
        pulseSpeed: 0.0018,
        pulseOffset: 0.7,
        pulseLength: 0.24,
        pulseColor: '#F5F5F5',
        label: 'I2C_SDA // VDD_3V3'
      },
      {
        points: [
          { x: 0.96, y: 0.19 },
          { x: 0.845, y: 0.19 },
          { x: 0.765, y: 0.27 },
          { x: 0.64, y: 0.27 }
        ],
        color: 'rgba(255, 255, 255, 0.2)',
        pulseSpeed: 0.0022,
        pulseOffset: 0.25,
        pulseLength: 0.2,
        pulseColor: '#FFFFFF',
        label: 'I2C_SCL // 400kHz'
      },
      // Bottom Left Analog Probe to ADC
      {
        points: [
          { x: 0.06, y: 0.84 },
          { x: 0.18, y: 0.84 },
          { x: 0.26, y: 0.76 },
          { x: 0.42, y: 0.76 }
        ],
        color: 'rgba(143, 143, 143, 0.22)',
        pulseSpeed: 0.0016,
        pulseOffset: 0.5,
        pulseLength: 0.25,
        pulseColor: '#8F8F8F',
        label: 'ADC_CH0 // 12-BIT'
      },
      // Bottom Right PWM MOSFET Gate Driver
      {
        points: [
          { x: 0.94, y: 0.84 },
          { x: 0.82, y: 0.84 },
          { x: 0.74, y: 0.76 },
          { x: 0.58, y: 0.76 }
        ],
        color: 'rgba(255, 255, 255, 0.22)',
        pulseSpeed: 0.0028,
        pulseOffset: 0.85,
        pulseLength: 0.2,
        pulseColor: '#FFFFFF',
        label: 'GATE_PWM // IRLZ44N'
      }
    ];

    const startTime = performance.now();

    interface TraceGeometry {
      pts: { x: number; y: number }[];
      segLens: number[];
      totalLen: number;
    }

    let traceGeometry: TraceGeometry[] = [];
    let staticLayer: HTMLCanvasElement | null = null;

    // Cached glow sprites: one radial-gradient disc per pulse color, rasterized
    // once. Replaces the per-frame createRadialGradient + arc + fill for every
    // pulse head and tail segment.
    const glowSprites = new Map<string, HTMLCanvasElement>();
    const spriteFor = (color: string): HTMLCanvasElement => {
      const cached = glowSprites.get(color);
      if (cached) return cached;
      const size = 32;
      const sprite = document.createElement('canvas');
      sprite.width = size;
      sprite.height = size;
      const sctx = sprite.getContext('2d');
      if (sctx) {
        const grad = sctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        grad.addColorStop(0, '#FFFFFF');
        grad.addColorStop(0.3, color);
        grad.addColorStop(0.72, 'rgba(143, 143, 143, 0)');
        grad.addColorStop(1, 'rgba(143, 143, 143, 0)');
        sctx.fillStyle = grad;
        sctx.fillRect(0, 0, size, size);
      }
      glowSprites.set(color, sprite);
      return sprite;
    };

    const buildStaticLayer = () => {
      if (!canvas.parentElement) return;
      const rect = canvas.parentElement.getBoundingClientRect();
      const w = Math.max(1, Math.round(rect.width * dpr));
      const h = Math.max(1, Math.round(rect.height * dpr));

      const layer =
        staticLayer && staticLayer.width === w && staticLayer.height === h
          ? staticLayer
          : document.createElement('canvas');
      layer.width = w;
      layer.height = h;
      const sctx = layer.getContext('2d');
      if (!sctx) return;

      // 1. Precision EDA Reticle Grid with Micro Crosshairs
      const gridSpacing = 48 * dpr;
      const crossSize = 2.5 * dpr;
      sctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
      sctx.lineWidth = 0.8 * dpr;

      for (let x = gridSpacing; x < w; x += gridSpacing) {
        for (let y = gridSpacing; y < h; y += gridSpacing) {
          sctx.beginPath();
          sctx.moveTo(x - crossSize, y);
          sctx.lineTo(x + crossSize, y);
          sctx.moveTo(x, y - crossSize);
          sctx.lineTo(x, y + crossSize);
          sctx.stroke();
        }
      }

      // 3a. Base copper hairlines, terminal pads, and pinout labels
      traceGeometry = traces.map((trace) => {
        const pts = trace.points.map((p) => ({ x: p.x * w, y: p.y * h }));

        if (pts.length >= 2) {
          sctx.strokeStyle = trace.color;
          sctx.lineWidth = 1.5 * dpr;
          sctx.lineCap = 'round';
          sctx.lineJoin = 'round';

          sctx.beginPath();
          sctx.moveTo(pts[0].x, pts[0].y);
          for (let i = 1; i < pts.length; i++) {
            sctx.lineTo(pts[i].x, pts[i].y);
          }
          sctx.stroke();

          // Terminal circular pads with via holes
          [pts[0], pts[pts.length - 1]].forEach((pt, pIdx) => {
            sctx.beginPath();
            sctx.arc(pt.x, pt.y, 3.5 * dpr, 0, Math.PI * 2);
            sctx.strokeStyle = trace.pulseColor;
            sctx.lineWidth = 1.2 * dpr;
            sctx.stroke();

            sctx.beginPath();
            sctx.arc(pt.x, pt.y, 1.2 * dpr, 0, Math.PI * 2);
            sctx.fillStyle = trace.pulseColor;
            sctx.fill();

            // Terminal pinout label
            if (pIdx === 0 && trace.label) {
              sctx.fillStyle = 'rgba(245, 245, 245, 0.45)';
              sctx.font = `${8 * dpr}px monospace`;
              sctx.textAlign = pt.x < w / 2 ? 'left' : 'right';
              const textX = pt.x < w / 2 ? pt.x + 8 * dpr : pt.x - 8 * dpr;
              sctx.fillText(trace.label, textX, pt.y - 6 * dpr);
            }
          });
        }

        // Segment geometry for the moving pulse (device px, rebuilt on resize)
        let totalLen = 0;
        const segLens: number[] = [];
        for (let i = 0; i < pts.length - 1; i++) {
          const dx = pts[i + 1].x - pts[i].x;
          const dy = pts[i + 1].y - pts[i].y;
          const len = Math.sqrt(dx * dx + dy * dy);
          segLens.push(len);
          totalLen += len;
        }
        return { pts, segLens, totalLen };
      });

      staticLayer = layer;
    };

    const draw = (now: number) => {
      const elapsed = prefersReducedMotion ? 1.0 : (now - startTime) / 1000;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // 1. Static EDA furniture (reticle grid, copper traces, pads, labels)
      // blitted from the cached offscreen bitmap — rebuilt only on resize.
      if (staticDirty) {
        buildStaticLayer();
        staticDirty = false;
      }
      if (staticLayer) {
        ctx.drawImage(staticLayer, 0, 0, w, h);
      }

      // 2. Dual-Channel Oscilloscope Waveforms (Channel 1: Oceanic Teal PWM, Channel 2: Antique Gold Sine)
      const renderOscilloscopeWaveform = (
        baseYRatio: number,
        color: string,
        glowColor: string,
        speed: number,
        freq: number,
        amplitude: number,
        isPWM: boolean
      ) => {
        const baseY = h * baseYRatio;
        const phase = elapsed * speed;

        ctx.save();
        ctx.strokeStyle = glowColor;
        ctx.lineCap = 'round';
        ctx.beginPath();

        const step = 4 * dpr;
        for (let x = 0; x <= w; x += step) {
          const normX = x / w;
          // Fade in at edges, strongest in center/flanks
          const edgeFade = Math.sin(normX * Math.PI);
          let val = 0;

          if (isPWM) {
            // Simulated square/PWM wave with smoothed rise/fall corners
            const raw = Math.sin(normX * freq * Math.PI * 2 + phase);
            val = Math.tanh(raw * 4) * amplitude * edgeFade;
          } else {
            // Analog mixed sine with harmonics
            val = (
              Math.sin(normX * freq * Math.PI * 2 + phase) * 0.7 +
              Math.sin(normX * freq * 2.1 * Math.PI * 2 + phase * 1.5) * 0.3
            ) * amplitude * edgeFade;
          }

          const y = baseY + val * dpr;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        // Layered halo strokes instead of ctx.shadowBlur: blur forces a
        // full-canvas raster pass per waveform, while these reuse the path
        // that was just built.
        ctx.globalAlpha = 0.30;
        ctx.lineWidth = 3.4 * dpr;
        ctx.stroke();
        ctx.globalAlpha = 0.55;
        ctx.lineWidth = 1.9 * dpr;
        ctx.stroke();

        // Inner bright beam core
        ctx.globalAlpha = 1;
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.0 * dpr;
        ctx.stroke();
        ctx.restore();
      };

      // Upper oscilloscope channel: 3.3V Logic Bus (Oceanic Teal)
      renderOscilloscopeWaveform(0.08, 'rgba(143, 143, 143, 0.4)', 'rgba(180, 180, 180, 0.35)', 1.2, 5.0, 12, true);
      // Lower oscilloscope channel: Analog Sensor Wave (Antique Gold)
      renderOscilloscopeWaveform(0.92, 'rgba(255, 255, 255, 0.4)', 'rgba(232, 232, 232, 0.35)', -0.8, 3.5, 16, false);

      // 3b. Dynamic phosphor data pulses riding the cached copper traces
      traceGeometry.forEach((td, traceIndex) => {
        const trace = traces[traceIndex];
        const pts = td.pts;
        const totalLen = td.totalLen;
        const segLens = td.segLens;

        if (pts.length < 2 || totalLen <= 0) return;

        // Animated Logic Data Pulse with phosphor decay trail
        const pulseProgress = ((elapsed * 0.35 + trace.pulseOffset) % 1);
        const pulseDist = pulseProgress * totalLen;

        const getPointAtDistance = (dist: number) => {
          const clamped = Math.max(0, Math.min(totalLen, dist));
          let accum = 0;
          for (let i = 0; i < segLens.length; i++) {
            if (accum + segLens[i] >= clamped) {
              const segFraction = (clamped - accum) / (segLens[i] || 1);
              return {
                x: pts[i].x + (pts[i + 1].x - pts[i].x) * segFraction,
                y: pts[i].y + (pts[i + 1].y - pts[i].y) * segFraction,
              };
            }
            accum += segLens[i];
          }
          return pts[pts.length - 1];
        };

        const headPt = getPointAtDistance(pulseDist);

        // Draw phosphor fading tail (cached glow sprite, no per-frame paths)
        const pulseSprite = spriteFor(trace.pulseColor);
        const tailLength = totalLen * 0.18;
        const tailSegments = 6;
        for (let tIdx = 0; tIdx < tailSegments; tIdx++) {
          const tDist = pulseDist - (tIdx / tailSegments) * tailLength;
          if (tDist > 0) {
            const tailPt = getPointAtDistance(tDist);
            const alpha = (1 - tIdx / tailSegments) * 0.4;
            const r = (3.5 - tIdx * 0.4) * dpr;
            ctx.globalAlpha = alpha;
            ctx.drawImage(pulseSprite, tailPt.x - r, tailPt.y - r, r * 2, r * 2);
          }
        }
        ctx.globalAlpha = 1.0;

        // Draw primary radiant head photon (same sprite, full radius)
        const headR = 9 * dpr;
        ctx.drawImage(pulseSprite, headPt.x - headR, headPt.y - headR, headR * 2, headR * 2);
      });

      if (!prefersReducedMotion && inView) {
        animId = requestAnimationFrame(draw);
      } else {
        animId = 0;
      }
    };

    animId = requestAnimationFrame(draw);

    // Sleep entirely while the hero section is offscreen: the canvas lives at
    // the top of a very long page, so most scroll positions paid full drawing
    // cost for a backdrop nobody could see.
    let io: IntersectionObserver | null = null;
    if (!prefersReducedMotion && canvas.parentElement && 'IntersectionObserver' in window) {
      io = new IntersectionObserver(
        (entries) => {
          const next = entries[0]?.isIntersecting ?? true;
          if (next === inView) return;
          inView = next;
          if (inView) {
            if (!animId) animId = requestAnimationFrame(draw);
          } else if (animId) {
            cancelAnimationFrame(animId);
            animId = 0;
          }
        },
        { rootMargin: '120px' }
      );
      io.observe(canvas.parentElement);
    }

    return () => {
      cancelAnimationFrame(animId);
      animId = 0;
      io?.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      <canvas ref={canvasRef} className="w-full h-full block opacity-75" />
    </div>
  );
};
