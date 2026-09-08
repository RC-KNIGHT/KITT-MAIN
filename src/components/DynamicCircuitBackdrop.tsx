import React, { useEffect, useRef } from 'react';

export const DynamicCircuitBackdrop: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    const updateSize = () => {
      if (!canvas || !canvas.parentElement) return;
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    // Predefined powerful circuit buses and traces
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
      pinLabel?: string;
    }

    const traces: Trace[] = [
      // Top Left MCU Data Bus
      {
        points: [
          { x: 0.05, y: 0.15 },
          { x: 0.18, y: 0.15 },
          { x: 0.26, y: 0.23 },
          { x: 0.35, y: 0.23 }
        ],
        color: 'rgba(165, 141, 102, 0.22)',
        pulseSpeed: 0.002,
        pulseOffset: 0.1,
        pulseLength: 0.2,
        pulseColor: '#A58D66',
        label: 'SPI_MOSI // 40MHz'
      },
      {
        points: [
          { x: 0.05, y: 0.17 },
          { x: 0.175, y: 0.17 },
          { x: 0.255, y: 0.25 },
          { x: 0.35, y: 0.25 }
        ],
        color: 'rgba(64, 126, 140, 0.24)',
        pulseSpeed: 0.0025,
        pulseOffset: 0.4,
        pulseLength: 0.18,
        pulseColor: '#407E8C',
        label: 'SPI_CLK // 80MHz'
      },
      // Top Right Power & Sensor Rail
      {
        points: [
          { x: 0.95, y: 0.18 },
          { x: 0.82, y: 0.18 },
          { x: 0.74, y: 0.26 },
          { x: 0.65, y: 0.26 }
        ],
        color: 'rgba(229, 225, 221, 0.2)',
        pulseSpeed: 0.0018,
        pulseOffset: 0.7,
        pulseLength: 0.22,
        pulseColor: '#E5E1DD',
        label: 'I2C_SDA // VDD_3V3'
      },
      {
        points: [
          { x: 0.95, y: 0.20 },
          { x: 0.825, y: 0.20 },
          { x: 0.745, y: 0.28 },
          { x: 0.65, y: 0.28 }
        ],
        color: 'rgba(165, 141, 102, 0.2)',
        pulseSpeed: 0.0022,
        pulseOffset: 0.25,
        pulseLength: 0.2,
        pulseColor: '#A58D66',
        label: 'I2C_SCL // PULLUP_4K7'
      },
      // Bottom Left Analog Probe to ADC
      {
        points: [
          { x: 0.08, y: 0.82 },
          { x: 0.20, y: 0.82 },
          { x: 0.28, y: 0.74 },
          { x: 0.40, y: 0.74 }
        ],
        color: 'rgba(64, 126, 140, 0.22)',
        pulseSpeed: 0.0016,
        pulseOffset: 0.5,
        pulseLength: 0.25,
        pulseColor: '#76B4C2',
        label: 'SOIL_ADC_CH0 // 12-BIT'
      },
      // Bottom Right PWM MOSFET Gate Driver
      {
        points: [
          { x: 0.92, y: 0.82 },
          { x: 0.80, y: 0.82 },
          { x: 0.72, y: 0.74 },
          { x: 0.60, y: 0.74 }
        ],
        color: 'rgba(165, 141, 102, 0.22)',
        pulseSpeed: 0.0028,
        pulseOffset: 0.85,
        pulseLength: 0.18,
        pulseColor: '#A58D66',
        label: 'GATE_PWM // IRLZ44N'
      }
    ];

    let startTime = performance.now();

    const draw = (now: number) => {
      const elapsed = (now - startTime) / 1000;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // 1. Subtle Circuit Dot Grid with Crosshairs
      const gridSpacing = 42 * dpr;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.035)';
      for (let x = 0; x < w; x += gridSpacing) {
        for (let y = 0; y < h; y += gridSpacing) {
          ctx.fillRect(x - 0.75 * dpr, y - 0.75 * dpr, 1.5 * dpr, 1.5 * dpr);
        }
      }

      // 2. Render Powerful Circuit Traces & Dynamic Data Pulses
      traces.forEach((trace) => {
        const pts = trace.points.map((p) => ({
          x: p.x * w,
          y: p.y * h
        }));

        if (pts.length < 2) return;

        // Draw static base PCB copper trace
        ctx.strokeStyle = trace.color;
        ctx.lineWidth = 1.6 * dpr;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) {
          ctx.lineTo(pts[i].x, pts[i].y);
        }
        ctx.stroke();

        // Terminal circular pads with inner core
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
            ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
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

        // Animated Logic Data Pulse along the trace
        const pulseProgress = ((elapsed * 0.4 + trace.pulseOffset) % 1);
        const pulseDist = pulseProgress * totalLen;

        // Find position along polyline
        let accumulated = 0;
        let pulseX = pts[0].x;
        let pulseY = pts[0].y;

        for (let i = 0; i < segLens.length; i++) {
          if (accumulated + segLens[i] >= pulseDist) {
            const segFraction = (pulseDist - accumulated) / segLens[i];
            pulseX = pts[i].x + (pts[i + 1].x - pts[i].x) * segFraction;
            pulseY = pts[i].y + (pts[i + 1].y - pts[i].y) * segFraction;
            break;
          }
          accumulated += segLens[i];
        }

        // Draw the luminous moving packet
        const grad = ctx.createRadialGradient(pulseX, pulseY, 0, pulseX, pulseY, 8 * dpr);
        grad.addColorStop(0, trace.pulseColor);
        grad.addColorStop(0.4, trace.color);
        grad.addColorStop(1, 'transparent');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(pulseX, pulseY, 8 * dpr, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(pulseX, pulseY, 1.8 * dpr, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    };

    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', updateSize);
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      <canvas ref={canvasRef} className="w-full h-full block opacity-70" />
    </div>
  );
};
