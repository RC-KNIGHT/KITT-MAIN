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

    let animId: number;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const updateSize = () => {
      if (!canvas || !canvas.parentElement) return;
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
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
        color: 'rgba(165, 141, 102, 0.22)',
        pulseSpeed: 0.002,
        pulseOffset: 0.1,
        pulseLength: 0.25,
        pulseColor: '#DFCCA8',
        label: 'SPI_MOSI // 40MHz'
      },
      {
        points: [
          { x: 0.04, y: 0.17 },
          { x: 0.155, y: 0.17 },
          { x: 0.235, y: 0.25 },
          { x: 0.36, y: 0.25 }
        ],
        color: 'rgba(64, 126, 140, 0.24)',
        pulseSpeed: 0.0025,
        pulseOffset: 0.4,
        pulseLength: 0.22,
        pulseColor: '#76B4C2',
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
        color: 'rgba(229, 225, 221, 0.2)',
        pulseSpeed: 0.0018,
        pulseOffset: 0.7,
        pulseLength: 0.24,
        pulseColor: '#E5E1DD',
        label: 'I2C_SDA // VDD_3V3'
      },
      {
        points: [
          { x: 0.96, y: 0.19 },
          { x: 0.845, y: 0.19 },
          { x: 0.765, y: 0.27 },
          { x: 0.64, y: 0.27 }
        ],
        color: 'rgba(165, 141, 102, 0.2)',
        pulseSpeed: 0.0022,
        pulseOffset: 0.25,
        pulseLength: 0.2,
        pulseColor: '#A58D66',
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
        color: 'rgba(64, 126, 140, 0.22)',
        pulseSpeed: 0.0016,
        pulseOffset: 0.5,
        pulseLength: 0.25,
        pulseColor: '#407E8C',
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
        color: 'rgba(165, 141, 102, 0.22)',
        pulseSpeed: 0.0028,
        pulseOffset: 0.85,
        pulseLength: 0.2,
        pulseColor: '#A58D66',
        label: 'GATE_PWM // IRLZ44N'
      }
    ];

    const startTime = performance.now();

    const draw = (now: number) => {
      const elapsed = prefersReducedMotion ? 1.0 : (now - startTime) / 1000;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // 1. Precision EDA Reticle Grid with Micro Crosshairs
      const gridSpacing = 48 * dpr;
      ctx.strokeStyle = 'rgba(64, 126, 140, 0.08)';
      ctx.lineWidth = 0.5 * dpr;

      const crossSize = 2.5 * dpr;
      ctx.strokeStyle = 'rgba(165, 141, 102, 0.14)';
      ctx.lineWidth = 0.8 * dpr;

      for (let x = gridSpacing; x < w; x += gridSpacing) {
        for (let y = gridSpacing; y < h; y += gridSpacing) {
          ctx.beginPath();
          ctx.moveTo(x - crossSize, y);
          ctx.lineTo(x + crossSize, y);
          ctx.moveTo(x, y - crossSize);
          ctx.lineTo(x, y + crossSize);
          ctx.stroke();
        }
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
        ctx.lineWidth = 3.2 * dpr;
        ctx.lineCap = 'round';
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 10 * dpr;
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
        ctx.stroke();

        // Inner bright beam core
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.0 * dpr;
        ctx.shadowBlur = 0;
        ctx.stroke();
        ctx.restore();
      };

      // Upper oscilloscope channel: 3.3V Logic Bus (Oceanic Teal)
      renderOscilloscopeWaveform(0.08, 'rgba(64, 126, 140, 0.4)', 'rgba(118, 180, 194, 0.35)', 1.2, 5.0, 12, true);
      // Lower oscilloscope channel: Analog Sensor Wave (Antique Gold)
      renderOscilloscopeWaveform(0.92, 'rgba(165, 141, 102, 0.4)', 'rgba(223, 204, 168, 0.35)', -0.8, 3.5, 16, false);

      // 3. Render High-Speed Circuit Traces & Dynamic Phosphor Pulse Tails
      traces.forEach((trace) => {
        const pts = trace.points.map((p) => ({
          x: p.x * w,
          y: p.y * h
        }));

        if (pts.length < 2) return;

        // Base copper hairline
        ctx.strokeStyle = trace.color;
        ctx.lineWidth = 1.5 * dpr;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) {
          ctx.lineTo(pts[i].x, pts[i].y);
        }
        ctx.stroke();

        // Terminal circular pads with via holes
        [pts[0], pts[pts.length - 1]].forEach((pt, pIdx) => {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 3.5 * dpr, 0, Math.PI * 2);
          ctx.strokeStyle = trace.pulseColor;
          ctx.lineWidth = 1.2 * dpr;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 1.2 * dpr, 0, Math.PI * 2);
          ctx.fillStyle = trace.pulseColor;
          ctx.fill();

          // Terminal pinout label
          if (pIdx === 0 && trace.label) {
            ctx.fillStyle = 'rgba(229, 225, 221, 0.45)';
            ctx.font = `${8 * dpr}px monospace`;
            ctx.textAlign = pt.x < w / 2 ? 'left' : 'right';
            const textX = pt.x < w / 2 ? pt.x + 8 * dpr : pt.x - 8 * dpr;
            ctx.fillText(trace.label, textX, pt.y - 6 * dpr);
          }
        });

        // Compute total line length for pulse interpolation
        let totalLen = 0;
        const segLens: number[] = [];
        for (let i = 0; i < pts.length - 1; i++) {
          const dx = pts[i + 1].x - pts[i].x;
          const dy = pts[i + 1].y - pts[i].y;
          const len = Math.sqrt(dx * dx + dy * dy);
          segLens.push(len);
          totalLen += len;
        }

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

        // Draw phosphor fading tail
        const tailLength = totalLen * 0.18;
        const tailSegments = 6;
        for (let tIdx = 0; tIdx < tailSegments; tIdx++) {
          const tDist = pulseDist - (tIdx / tailSegments) * tailLength;
          if (tDist > 0) {
            const tailPt = getPointAtDistance(tDist);
            const alpha = (1 - tIdx / tailSegments) * 0.4;
            ctx.fillStyle = trace.pulseColor;
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.arc(tailPt.x, tailPt.y, (3.5 - tIdx * 0.4) * dpr, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.globalAlpha = 1.0;

        // Draw primary radiant head photon
        const grad = ctx.createRadialGradient(headPt.x, headPt.y, 0, headPt.x, headPt.y, 9 * dpr);
        grad.addColorStop(0, '#FFFFFF');
        grad.addColorStop(0.3, trace.pulseColor);
        grad.addColorStop(0.7, trace.color);
        grad.addColorStop(1, 'transparent');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(headPt.x, headPt.y, 9 * dpr, 0, Math.PI * 2);
        ctx.fill();
      });

      if (!prefersReducedMotion) {
        animId = requestAnimationFrame(draw);
      }
    };

    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      <canvas ref={canvasRef} className="w-full h-full block opacity-75" />
    </div>
  );
};
