import React, { useEffect, useRef } from 'react';

interface Particle {
  id: number;
  type: 'node' | 'chip' | 'via' | 'specular';
  // Top Target: Untilted, straight-vertical 6-spoke cross logo with 4 T-bars
  logoX: number;
  logoY: number;
  logoZ: number;
  // Bottom Target: 3D letter 'K'
  kX: number;
  kY: number;
  kZ: number;
  // Dispersed starting entrance position
  startX: number;
  startY: number;
  startZ: number;
  // Wide scattered position reaching all four corners of the screen
  scatterX: number;
  scatterY: number;
  scatterZ: number;
  // Continuous ambient drifting when scattered
  driftSpeed: number;
  driftRadiusX: number;
  driftRadiusY: number;
  driftPhase: number;
  // Timing parameters for initial page entrance
  activationDelay: number;
  duration: number;
  // Visual properties
  size: number;
  alpha: number;
  color: string;
  glowColor: string;
  rotation: number;
  rotationSpeed: number;
  pulsePhase: number;
  // Micro chip dimensions if type is 'chip'
  width?: number;
  height?: number;
  segment: 'vertical_stem' | 'diag_1' | 'diag_2' | 't_bars' | 'nexus' | 'ambient';
}

interface SignatureHeroKProps {
  className?: string;
}

export const SignatureHeroK: React.FC<SignatureHeroKProps> = ({ className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const startTimeRef = useRef<number>(0);
  const mouseRef = useRef<{ x: number; y: number; targetX: number; targetY: number }>({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0
  });
  const scrollRef = useRef<{ scrollY: number; targetProgress: number; currentProgress: number }>({
    scrollY: 0,
    targetProgress: 0,
    currentProgress: 0
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // High performance DPR handling: capped to 1.5 to eliminate rendering lags
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let width = (canvas.width = window.innerWidth * dpr);
    let height = (canvas.height = window.innerHeight * dpr);

    const updateDimensions = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth * dpr;
      height = canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions, { passive: true });

    // Smooth responsive 3D mouse parallax listener
    const handleMouseMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      mouseRef.current.targetX = nx * 0.40;
      mouseRef.current.targetY = ny * 0.30;
    };

    // Smooth mobile touch parallax listener
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches && e.touches[0]) {
        const touch = e.touches[0];
        const nx = (touch.clientX / window.innerWidth) * 2 - 1;
        const ny = (touch.clientY / window.innerHeight) * 2 - 1;
        mouseRef.current.targetX = nx * 0.35;
        mouseRef.current.targetY = ny * 0.25;
      }
    };

    // Smooth scroll progress tracker
    const handleScroll = () => {
      const docHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight,
        document.body.clientHeight,
        document.documentElement.clientHeight
      );
      const winHeight = window.innerHeight;
      const maxScroll = Math.max(1, docHeight - winHeight);
      const currentScroll = window.scrollY || window.pageYOffset || 0;
      const progress = Math.min(1, Math.max(0, currentScroll / maxScroll));

      scrollRef.current.scrollY = currentScroll;
      scrollRef.current.targetProgress = progress;
    };

    handleScroll();
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Balanced particle count: 680 on desktop, 420 on mobile
    // Clean, crisp, fully visible and bold without being an opaque blob
    const totalParticles = window.innerWidth < 640 ? 420 : 680;
    const particles: Particle[] = [];

    const rand = (min: number, max: number) => min + Math.random() * (max - min);

    // Distribution breakdown
    const verticalStemCount = Math.floor(totalParticles * 0.28);
    const diag1Count = Math.floor(totalParticles * 0.33);
    const diag2Count = Math.floor(totalParticles * 0.33);
    const nexusCount = Math.floor(totalParticles * 0.03);
    const ambientCount = totalParticles - verticalStemCount - diag1Count - diag2Count - nexusCount;

    let pId = 0;

    const createParticle = (
      logoX: number,
      logoY: number,
      logoZ: number,
      kX: number,
      kY: number,
      kZ: number,
      delay: number,
      segment: Particle['segment']
    ): Particle => {
      // Dispersed starting entrance coordinates
      const startAngle = rand(0, Math.PI * 2);
      const startDist = rand(0.6, 1.4);
      const startX = Math.cos(startAngle) * startDist + rand(-0.25, 0.25);
      const startY = Math.sin(startAngle) * startDist + rand(-0.25, 0.25);
      const startZ = rand(-0.35, 0.35);

      const typeRoll = Math.random();
      let type: Particle['type'] = 'node';
      let size = rand(1.6, 2.5);
      let color = '#F5F5F5'; // Warm Sand
      let glowColor = 'rgba(245, 245, 245, 0.38)';

      if (typeRoll < 0.30) {
        type = 'chip'; // Micro SMD chip: Gold body with platinum contacts
        size = rand(2.0, 2.8);
        color = '#FFFFFF'; // Antique Gold
        glowColor = 'rgba(255, 255, 255, 0.45)';
      } else if (typeRoll < 0.56) {
        type = 'via'; // Oceanic Teal circuit via ring with center drill
        size = rand(1.8, 2.6);
        color = '#8F8F8F'; // Deep Oceanic Teal
        glowColor = 'rgba(143, 143, 143, 0.45)';
      } else if (typeRoll < 0.74) {
        type = 'specular'; // Twinkling diamond specular glint
        size = rand(1.3, 2.2);
        color = '#FFFFFF';
        glowColor = 'rgba(255, 255, 255, 0.55)';
      }

      // Scatter reaches wide corners of the screen (both sides and top/bottom)
      const scatterX = rand(-1.95, 1.95);
      const scatterY = rand(-1.35, 1.35);
      const scatterZ = rand(-0.6, 0.6);

      return {
        id: pId++,
        type,
        logoX,
        logoY,
        logoZ,
        kX,
        kY,
        kZ,
        startX,
        startY,
        startZ,
        scatterX,
        scatterY,
        scatterZ,
        driftSpeed: rand(0.20, 0.60),
        driftRadiusX: rand(0.08, 0.25),
        driftRadiusY: rand(0.06, 0.20),
        driftPhase: rand(0, Math.PI * 2),
        activationDelay: delay,
        duration: rand(0.70, 1.05),
        size,
        // High-visibility luminous alpha
        alpha: rand(0.70, 0.95),
        color,
        glowColor,
        rotation: rand(0, Math.PI * 2),
        rotationSpeed: rand(-0.02, 0.02),
        pulsePhase: rand(0, Math.PI * 2),
        width: type === 'chip' ? rand(4.2, 6.2) : undefined,
        height: type === 'chip' ? rand(1.8, 2.6) : undefined,
        segment
      };
    };

    // Helper to calculate target on iconic Letter 'K'
    const getKTarget = (idx: number, total: number) => {
      const frac = idx / total;
      if (frac < 0.44) {
        // Vertical Spine of 'K': broad ribbon from x = -0.26 to -0.08
        const st = frac / 0.44;
        return {
          x: rand(-0.26, -0.08),
          y: -0.50 + st * 1.00 + rand(-0.015, 0.015),
          z: rand(-0.08, 0.08)
        };
      } else if (frac < 0.72) {
        // Upper Diagonal of 'K': from (-0.16, -0.02) to (+0.36, -0.50)
        const ut = (frac - 0.44) / 0.28;
        const lateral = rand(-0.05, 0.05);
        return {
          x: -0.16 + ut * 0.52 + lateral * 0.707,
          y: -0.02 - ut * 0.48 + lateral * 0.707,
          z: rand(-0.08, 0.08)
        };
      } else {
        // Lower Diagonal of 'K': from (-0.10, -0.02) to (+0.36, +0.50)
        const lt = (frac - 0.72) / 0.28;
        const lateral = rand(-0.05, 0.05);
        return {
          x: -0.10 + lt * 0.46 - lateral * 0.77,
          y: -0.02 + lt * 0.52 + lateral * 0.63,
          z: rand(-0.08, 0.08)
        };
      }
    };

    // 1. STRAIGHT VERTICAL MIDDLE STEM (NO TILT, NO T-BARS) - First stage entrance
    for (let i = 0; i < verticalStemCount; i++) {
      const t = i / verticalStemCount;
      const st = t * 2 - 1; // -1 to +1
      const lx = rand(-0.045, 0.045);
      const ly = st * 0.42;
      const lz = rand(-0.06, 0.06);
      const kCoord = getKTarget(particles.length, totalParticles - ambientCount);
      particles.push(
        createParticle(lx, ly, lz, kCoord.x, kCoord.y, kCoord.z, rand(0.15, 0.40), 'vertical_stem')
      );
    }

    // 2. DIAGONAL 1: Top-Left to Bottom-Right with 2 Perpendicular T-Bars
    for (let i = 0; i < diag1Count; i++) {
      const t = i / diag1Count;
      let lx: number, ly: number;
      let seg: Particle['segment'] = 'diag_1';
      let delay = rand(0.50, 0.80);

      if (t < 0.20) {
        // Top-Left Perpendicular T-Bar: centered at (-0.28, -0.28)
        const ct = (t / 0.20) * 2 - 1;
        const cx0 = -0.28;
        const cy0 = -0.28;
        const tLen = 0.15;
        const barSpread = rand(-0.035, 0.035);
        lx = cx0 - ct * tLen * 0.707 + barSpread * 0.707;
        ly = cy0 + ct * tLen * 0.707 + barSpread * 0.707;
        seg = 't_bars';
        delay = rand(0.85, 1.20);
      } else if (t > 0.80) {
        // Bottom-Right Perpendicular T-Bar: centered at (0.28, 0.28)
        const ct = ((t - 0.80) / 0.20) * 2 - 1;
        const cx1 = 0.28;
        const cy1 = 0.28;
        const tLen = 0.15;
        const barSpread = rand(-0.035, 0.035);
        lx = cx1 - ct * tLen * 0.707 + barSpread * 0.707;
        ly = cy1 + ct * tLen * 0.707 + barSpread * 0.707;
        seg = 't_bars';
        delay = rand(0.85, 1.20);
      } else {
        // Diagonal Stem
        const st = (t - 0.20) / 0.60;
        const dist = -0.396 + st * 0.792;
        const lateral = rand(-0.045, 0.045);
        lx = dist * 0.707 - lateral * 0.707;
        ly = dist * 0.707 + lateral * 0.707;
      }

      const lz = rand(-0.06, 0.06);
      const kCoord = getKTarget(particles.length, totalParticles - ambientCount);
      particles.push(
        createParticle(lx, ly, lz, kCoord.x, kCoord.y, kCoord.z, delay, seg)
      );
    }

    // 3. DIAGONAL 2: Bottom-Left to Top-Right with 2 Perpendicular T-Bars
    for (let i = 0; i < diag2Count; i++) {
      const t = i / diag2Count;
      let lx: number, ly: number;
      let seg: Particle['segment'] = 'diag_2';
      let delay = rand(0.50, 0.80);

      if (t < 0.20) {
        // Bottom-Left Perpendicular T-Bar: centered at (-0.28, 0.28)
        const ct = (t / 0.20) * 2 - 1;
        const cx0 = -0.28;
        const cy0 = 0.28;
        const tLen = 0.15;
        const barSpread = rand(-0.035, 0.035);
        lx = cx0 + ct * tLen * 0.707 - barSpread * 0.707;
        ly = cy0 + ct * tLen * 0.707 + barSpread * 0.707;
        seg = 't_bars';
        delay = rand(0.85, 1.20);
      } else if (t > 0.80) {
        // Top-Right Perpendicular T-Bar: centered at (0.28, -0.28)
        const ct = ((t - 0.80) / 0.20) * 2 - 1;
        const cx1 = 0.28;
        const cy1 = -0.28;
        const tLen = 0.15;
        const barSpread = rand(-0.035, 0.035);
        // Perpendicular vector to (1, -1) is (1, 1), so both lx and ly use +ct
        lx = cx1 + ct * tLen * 0.707 - barSpread * 0.707;
        ly = cy1 + ct * tLen * 0.707 + barSpread * 0.707;
        seg = 't_bars';
        delay = rand(0.85, 1.20);
      } else {
        // Diagonal Stem
        const st = (t - 0.20) / 0.60;
        const dist = -0.396 + st * 0.792;
        const lateral = rand(-0.045, 0.045);
        lx = dist * 0.707 + lateral * 0.707;
        ly = -dist * 0.707 + lateral * 0.707;
      }

      const lz = rand(-0.06, 0.06);
      const kCoord = getKTarget(particles.length, totalParticles - ambientCount);
      particles.push(
        createParticle(lx, ly, lz, kCoord.x, kCoord.y, kCoord.z, delay, seg)
      );
    }

    // 4. CENTRAL NEXUS & QUANTUM CORE - Lights up immediately
    for (let i = 0; i < nexusCount; i++) {
      const angle = rand(0, Math.PI * 2);
      const rad = rand(0.01, 0.06);
      const lx = Math.cos(angle) * rad;
      const ly = Math.sin(angle) * rad;
      const lz = rand(-0.05, 0.05);

      const kCoord = getKTarget(particles.length, totalParticles - ambientCount);
      particles.push(
        createParticle(lx, ly, lz, kCoord.x, kCoord.y, kCoord.z, rand(0.05, 0.20), 'nexus')
      );
    }

    // 5. AMBIENT FIELD PARTICLES - Continuously active
    for (let i = 0; i < ambientCount; i++) {
      const angle = rand(0, Math.PI * 2);
      const dist = rand(0.4, 1.6);
      const ax = Math.cos(angle) * dist;
      const ay = Math.sin(angle) * dist * 0.85;
      const az = rand(-0.3, 0.3);

      particles.push({
        id: pId++,
        type: 'node',
        logoX: ax,
        logoY: ay,
        logoZ: az,
        kX: ax,
        kY: ay,
        kZ: az,
        startX: ax,
        startY: ay,
        startZ: az,
        scatterX: rand(-1.75, 1.75),
        scatterY: rand(-1.25, 1.25),
        scatterZ: rand(-0.6, 0.6),
        driftSpeed: rand(0.18, 0.45),
        driftRadiusX: rand(0.08, 0.25),
        driftRadiusY: rand(0.06, 0.20),
        driftPhase: rand(0, Math.PI * 2),
        activationDelay: 0,
        duration: 9999,
        size: rand(1.2, 2.0),
        alpha: rand(0.40, 0.65),
        color: Math.random() > 0.5 ? '#FFFFFF' : '#8F8F8F',
        glowColor: 'rgba(255, 255, 255, 0.40)',
        rotation: 0,
        rotationSpeed: rand(-0.01, 0.01),
        pulsePhase: rand(0, Math.PI * 2),
        segment: 'ambient'
      });
    }

    particlesRef.current = particles;
    startTimeRef.current = performance.now();

    const easeOutQuint = (x: number): number => 1 - Math.pow(1 - x, 5);

    // Main 60-120 FPS High-Performance Render Loop
    const render = (currentTimeMs: number) => {
      const elapsedSec = (currentTimeMs - startTimeRef.current) / 1000;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Smooth mouse lerp for camera parallax
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      // Smooth scroll interpolation
      const scrollObj = scrollRef.current;
      scrollObj.currentProgress += (scrollObj.targetProgress - scrollObj.currentProgress) * 0.08;
      const progress = scrollObj.currentProgress;

      // CONTINUOUS, BUTTER-SMOOTH MORPHING:
      // Morph ratio: smooth cosine curve from 0 (top of page, Logo) to 1 (bottom of page, Letter K)
      const morphRatio = 0.5 - 0.5 * Math.cos(progress * Math.PI);

      // Scatter intensity: peaks in the middle of page as particles scatter across corners
      const rawSin = Math.sin(progress * Math.PI);
      const scatterAmount = Math.pow(Math.max(0, rawSin), 1.15);

      ctx.clearRect(0, 0, width, height);

      // Dynamic viewport center
      const inventionsEl = document.getElementById('hero-inventions-word');
      let topCenterX = width / 2;
      let topCenterY = height * 0.44;

      if (inventionsEl) {
        const rect = inventionsEl.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          topCenterX = (rect.left + rect.width * 0.5) * dpr;
          const elCenterY = (rect.top + rect.height * 0.5) * dpr;
          topCenterY = Math.max(height * 0.35, Math.min(height * 0.50, elCenterY));
        }
      }

      const bottomCenterX = width / 2;
      const bottomCenterY = height * 0.50;

      const cx = topCenterX + (bottomCenterX - topCenterX) * progress;
      const cy = topCenterY + (bottomCenterY - topCenterY) * progress;

      // Proportional scale: smooth interpolation
      const maxScaleH = height * (0.48 + 0.06 * morphRatio);
      const maxScaleW = width * (0.46 + 0.04 * morphRatio);
      const currentScale = Math.min(maxScaleW, maxScaleH, 480 * dpr);

      // 3D Parallax angles with responsive depth
      const rotY = mouseRef.current.x * 0.42;
      const rotX = -mouseRef.current.y * 0.32;
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);

      const count = particles.length;

      // Array to hold projected particles for depth-sorting and circuit line rendering
      const renderedList: {
        p: Particle;
        projX: number;
        projY: number;
        projZ: number;
        projScale: number;
        currentAlpha: number;
      }[] = [];

      // Compute 3D projection for each particle
      for (let i = 0; i < count; i++) {
        const p = particles[i];

        // Smooth continuous interpolation between logo target and K target
        const targetX = (1 - morphRatio) * p.logoX + morphRatio * p.kX;
        const targetY = (1 - morphRatio) * p.logoY + morphRatio * p.kY;
        const targetZ = (1 - morphRatio) * p.logoZ + morphRatio * p.kZ;

        let fx = targetX;
        let fy = targetY;
        let fz = targetZ;

        // Phased entrance fly-in assembly on page load
        if (p.segment !== 'ambient') {
          const particleElapsed = Math.max(0, elapsedSec - p.activationDelay);
          const pRatio = Math.min(1.0, particleElapsed / p.duration);
          const pEased = easeOutQuint(pRatio);

          fx = p.startX + (targetX - p.startX) * pEased;
          fy = p.startY + (targetY - p.startY) * pEased;
          fz = p.startZ + (targetZ - p.startZ) * pEased;
        }

        // Ambient cosmic drift reaching all corners of the screen
        const driftX = Math.sin(elapsedSec * p.driftSpeed + p.driftPhase) * p.driftRadiusX;
        const driftY = Math.cos(elapsedSec * p.driftSpeed * 0.85 + p.driftPhase) * p.driftRadiusY;
        const driftZ = Math.sin(elapsedSec * p.driftSpeed * 0.5 + p.driftPhase) * 0.15;

        const dispersedX = p.scatterX + driftX;
        const dispersedY = p.scatterY + driftY;
        const dispersedZ = p.scatterZ + driftZ;

        let px = (1 - scatterAmount) * fx + scatterAmount * dispersedX;
        let py = (1 - scatterAmount) * fy + scatterAmount * dispersedY;
        let pz = (1 - scatterAmount) * fz + scatterAmount * dispersedZ;

        // Living breathing micro-pulse when formed into Logo or K
        if (scatterAmount < 0.08) {
          const breath = Math.sin(elapsedSec * 1.8 + p.pulsePhase) * 0.004;
          px += breath;
          py += breath * 0.5;
        }

        // 3D rotation (Yaw then Pitch)
        const x1 = px * cosY + pz * sinY;
        const y1 = py;
        const z1 = -px * sinY + pz * cosY;

        const x2 = x1;
        const y2 = y1 * cosX - z1 * sinX;
        const z2 = y1 * sinX + z1 * cosX;

        // Camera perspective projection
        const depth = 2.4 + z2;
        const projScale = (1.7 / Math.max(0.2, depth)) * currentScale;

        const projX = cx + x2 * projScale;
        const projY = cy + y2 * projScale;
        const currentAlpha = p.alpha * (0.75 + 0.25 * (1 - scatterAmount * 0.25));

        renderedList.push({
          p,
          projX,
          projY,
          projZ: z2,
          projScale,
          currentAlpha
        });
      }

      // Sort back-to-front for realistic depth
      renderedList.sort((a, b) => a.projZ - b.projZ);

      // RESTORED DYNAMIC ANIMATION: 45-degree PCB micro-traces when formed,
      // and cybernetic constellation threads when scattered mid-page
      ctx.lineWidth = 1.0 * dpr;

      if (scatterAmount < 0.35) {
        // PCB micro-traces on the Logo / K structure
        const traceAlpha = (1 - scatterAmount / 0.35) * 0.26;
        const step = window.innerWidth < 640 ? 8 : 5;

        for (let i = 0; i < renderedList.length - step; i += step) {
          const a = renderedList[i];
          const b = renderedList[i + 1];

          if (a.p.segment === b.p.segment && a.p.segment !== 'ambient') {
            const dx = a.projX - b.projX;
            const dy = a.projY - b.projY;
            const distSq = dx * dx + dy * dy;

            if (distSq < 2800 * dpr * dpr) {
              const alpha = traceAlpha * Math.min(a.currentAlpha, b.currentAlpha);
              ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
              ctx.beginPath();
              ctx.moveTo(a.projX, a.projY);

              // 45-degree orthogonal PCB trace bend
              const midX = (a.projX + b.projX) / 2;
              ctx.lineTo(midX, a.projY);
              ctx.lineTo(b.projX, b.projY);
              ctx.stroke();
            }
          }
        }
      } else {
        // Cybernetic constellation threads drifting between scattered particles in the ambient field
        const threadAlpha = ((scatterAmount - 0.35) / 0.65) * 0.18;
        const sampleStep = window.innerWidth < 640 ? 12 : 8;

        for (let i = 0; i < renderedList.length - sampleStep; i += sampleStep) {
          const a = renderedList[i];
          const b = renderedList[i + sampleStep];

          const dx = a.projX - b.projX;
          const dy = a.projY - b.projY;
          const distSq = dx * dx + dy * dy;

          if (distSq < 2400 * dpr * dpr) {
            const alpha = threadAlpha * Math.min(a.currentAlpha, b.currentAlpha);
            ctx.strokeStyle = `rgba(143, 143, 143, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(a.projX, a.projY);
            ctx.lineTo(b.projX, b.projY);
            ctx.stroke();
          }
        }
      }

      // RESTORED DYNAMIC PARTICLES: rotating chips, circuit vias with drill holes, specular twinkle
      for (let i = 0; i < renderedList.length; i++) {
        const item = renderedList[i];
        const p = item.p;
        const px = item.projX;
        const py = item.projY;
        const pSize = p.size * (item.projScale / currentScale) * dpr;
        const alpha = Math.max(0, Math.min(1, item.currentAlpha));

        if (alpha <= 0.02) continue;

        ctx.save();
        ctx.globalAlpha = alpha;

        // Soft radiant halo
        ctx.beginPath();
        ctx.arc(px, py, Math.max(1.8, pSize * 2.0), 0, Math.PI * 2);
        ctx.fillStyle = p.glowColor;
        ctx.fill();

        if (p.type === 'chip') {
          // Rotating SMD chip with silicon body and gold/platinum terminals
          ctx.translate(px, py);
          ctx.rotate(p.rotation + elapsedSec * p.rotationSpeed);
          const w = (p.width || 4.8) * dpr;
          const h = (p.height || 2.2) * dpr;

          // Silicon body
          ctx.fillStyle = '#101920';
          ctx.fillRect(-w / 2, -h / 2, w, h);

          // Metallic gold terminal caps
          ctx.fillStyle = '#FFFFFF';
          const capW = Math.max(1.2, w * 0.24);
          ctx.fillRect(-w / 2, -h / 2, capW, h);
          ctx.fillRect(w / 2 - capW, -h / 2, capW, h);

          // Central glowing micro-contact
          ctx.fillStyle = '#F5F2ED';
          ctx.fillRect(-0.8 * dpr, -0.8 * dpr, 1.6 * dpr, 1.6 * dpr);
        } else if (p.type === 'via') {
          // Circular circuit via with dark central drill hole
          ctx.beginPath();
          ctx.arc(px, py, Math.max(1.5, pSize * 1.3), 0, Math.PI * 2);
          ctx.strokeStyle = '#8F8F8F';
          ctx.lineWidth = 1.3 * dpr;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(px, py, Math.max(0.6, pSize * 0.45), 0, Math.PI * 2);
          ctx.fillStyle = '#000000';
          ctx.fill();
        } else if (p.type === 'specular') {
          // Twinkling diamond specular glint
          const glint = Math.sin(elapsedSec * 3.2 + p.pulsePhase);
          if (glint > 0.25) {
            ctx.beginPath();
            ctx.arc(px, py, pSize * 1.8, 0, Math.PI * 2);
            ctx.fillStyle = p.glowColor;
            ctx.fill();
          }

          ctx.beginPath();
          ctx.arc(px, py, Math.max(1.0, pSize), 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
        } else {
          // Standard crisp node
          ctx.beginPath();
          ctx.arc(px, py, Math.max(1.2, pSize), 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
        }

        ctx.restore();
      }

      // Subtle golden dashed alignment axis crosshair when assembled
      if (scatterAmount < 0.12) {
        ctx.save();
        ctx.globalAlpha = (1 - scatterAmount / 0.12) * 0.08;
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 0.6 * dpr;
        ctx.setLineDash([3 * dpr, 5 * dpr]);

        // Vertical axis guide
        ctx.beginPath();
        ctx.moveTo(cx, cy - 0.46 * currentScale);
        ctx.lineTo(cx, cy + 0.46 * currentScale);
        ctx.stroke();

        ctx.restore();
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener('resize', updateDimensions);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden z-0 will-change-transform ${className}`}>
      {/* 
        Full-viewport canvas:
        - At the top of the page: forms the user's straight-vertical 6-spoke quantum cross logo
        - In the middle of the page: scatters smoothly across all four corners of the screen
        - At the bottom of the page: morphs and converges into the iconic 3D 'K' alphabet, shining through transparent cards
      */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block will-change-transform"
      />
    </div>
  );
};
