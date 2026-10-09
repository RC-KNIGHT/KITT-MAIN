import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Deep3DSpaceBackdrop
 * 
 * Cinematic WebGL backdrop featuring:
 * 1. Volumetric electron particle field driven by GPU curl noise & physics drift
 * 2. Volumetric neutral god-ray light shafts sweeping through the atmosphere
 * 3. 3D engineering trace grid & photon pulse signals in perspective
 * 4. Scroll-choreographed warp morphing scattered electron cloud into aligned circuit matrices
 * 5. Device pixel ratio clamped (<= 1.5) & full Three.js memory disposal on unmount
 *
 * Palette: monochrome (canvas #000000, neutrals #F5F5F5→#5D5D5D) — kept in
 * sync with the design tokens in src/index.css.
 */
export const Deep3DSpaceBackdrop: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check motion preference and hardware tier
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 768 || window.matchMedia('(pointer: coarse)').matches;
    const isLowTier = typeof navigator !== 'undefined' && (navigator.hardwareConcurrency ? navigator.hardwareConcurrency < 4 : false);

    // Standardized DPR clamp: 1.5 max, 1.0 for low-tier/mobile
    const dpr = (isMobile || isLowTier) ? 1.0 : Math.min(window.devicePixelRatio || 1, 1.5);

    // 1. Scene, Camera & Renderer setup with error protection
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.015);

    const camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 45);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: !isLowTier,
        powerPreference: 'high-performance',
      });
    } catch (e) {
      console.warn('Deep3DSpaceBackdrop: WebGL not supported or context creation failed.', e);
      return;
    }

    renderer.setPixelRatio(dpr);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 1);

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      console.warn('Deep3DSpaceBackdrop: WebGL context lost.');
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost, false);

    container.appendChild(renderer.domElement);

    // Track mouse & scroll for smooth parallax
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    let scrollY = window.scrollY || 0;
    let targetScrollY = scrollY;

    const onMouseMove = (e: MouseEvent) => {
      mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.targetY = -(e.clientY / window.innerHeight - 0.5) * 2;
    };

    const onScroll = () => {
      targetScrollY = window.scrollY || 0;
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    // 2. Volumetric Electron Particle Field with hardware-tier scaling
    const particleCount = prefersReducedMotion 
      ? 500 
      : (isMobile || isLowTier ? 1200 : 3200);
    const positions = new Float32Array(particleCount * 3);
    const originalPositions = new Float32Array(particleCount * 3);
    const targetPositions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);
    const phases = new Float32Array(particleCount);

    const colorPalette = [
      new THREE.Color(0xF5F5F5), // Platinum
      new THREE.Color(0xE8E8E8), // Accent light
      new THREE.Color(0x9E9E9E), // Muted neutral
      new THREE.Color(0x8F8F8F), // Mid grey
      new THREE.Color(0xFFFFFF), // White glint
    ];

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      // Scattered starting cloud
      const px = (Math.random() - 0.5) * 110;
      const py = (Math.random() - 0.5) * 80;
      const pz = (Math.random() - 0.5) * 80 - 10;
      positions[i3] = originalPositions[i3] = px;
      positions[i3 + 1] = originalPositions[i3 + 1] = py;
      positions[i3 + 2] = originalPositions[i3 + 2] = pz;

      // Target organized circuit grid position (scroll morph destination)
      const gridStep = 4.5;
      const gx = (Math.round(px / gridStep) * gridStep);
      const gy = (Math.round(py / gridStep) * gridStep);
      const gz = -15 + Math.sin(gx * 0.2) * Math.cos(gy * 0.2) * 8;
      targetPositions[i3] = gx;
      targetPositions[i3 + 1] = gy;
      targetPositions[i3 + 2] = gz;

      // Color selection
      const col = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i3] = col.r;
      colors[i3 + 1] = col.g;
      colors[i3 + 2] = col.b;

      scales[i] = Math.random() * 2.2 + 0.8;
      phases[i] = Math.random() * Math.PI * 2;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
    particleGeometry.setAttribute('aScale', new THREE.BufferAttribute(scales, 1));
    particleGeometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));

    // Particle Shader with soft volumetric glow falloff
    const particleMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uMorph: { value: 0 },
        uPixelRatio: { value: dpr },
      },
      vertexShader: `
        uniform float uTime;
        uniform float uMorph;
        uniform float uPixelRatio;
        attribute vec3 aColor;
        attribute float aScale;
        attribute float aPhase;
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          vColor = aColor;
          vec3 pos = position;

          // Organic curl simulation
          float freq = 0.05;
          float time = uTime * 0.6 + aPhase;
          vec3 drift = vec3(
            sin(time * 0.8 + pos.y * freq) * 1.5,
            cos(time * 0.7 + pos.x * freq) * 1.5,
            sin(time * 0.9 + pos.z * freq) * 1.2
          );

          pos += drift * (1.0 - uMorph * 0.75);

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPosition;

          // Attenuate point size by camera depth
          float pSize = aScale * uPixelRatio * (28.0 / -mvPosition.z);
          gl_PointSize = clamp(pSize, 1.0, 36.0);

          // Subtle pulse in alpha
          vAlpha = 0.55 + 0.45 * sin(uTime * 1.5 + aPhase);
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          // Circular particle shape with soft glowing edge
          vec2 coord = gl_PointCoord - vec2(0.5);
          float dist = length(coord);
          if (dist > 0.5) discard;

          // High-intensity core + soft ambient halo
          float core = smoothstep(0.5, 0.05, dist);
          float glow = smoothstep(0.5, 0.0, dist) * 0.5;
          float intensity = core + glow;

          gl_FragColor = vec4(vColor * 1.2, vAlpha * intensity);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);

    // 3. Volumetric God-Ray Light Shafts
    const rayGroup = new THREE.Group();
    const rayGeo = new THREE.CylinderGeometry(0.5, 9, 75, 16, 1, true);

    const createRayMat = (colorHex: number, opacity: number) => {
      return new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uColor: { value: new THREE.Color(colorHex) },
          uOpacity: { value: opacity },
        },
        vertexShader: `
          varying vec2 vUv;
          varying vec3 vNormal;
          void main() {
            vUv = uv;
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 uColor;
          uniform float uOpacity;
          uniform float uTime;
          varying vec2 vUv;
          varying vec3 vNormal;

          void main() {
            // Soft vertical falloff along ray length
            float lengthFade = smoothstep(0.0, 0.25, vUv.y) * smoothstep(1.0, 0.55, vUv.y);
            // Soft rim edge falloff
            float rim = abs(vNormal.z);
            float beamSweep = 0.75 + 0.25 * sin(vUv.y * 8.0 - uTime * 1.2);
            float alpha = lengthFade * rim * uOpacity * beamSweep;
            gl_FragColor = vec4(uColor, alpha);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
    };

    const rays = [
      { mesh: new THREE.Mesh(rayGeo, createRayMat(0x9E9E9E, 0.20)), rotZ: 0.35, rotX: 0.2, posX: -18, speed: 0.4 },
      { mesh: new THREE.Mesh(rayGeo, createRayMat(0xE8E8E8, 0.18)), rotZ: -0.28, rotX: -0.15, posX: 14, speed: 0.3 },
      { mesh: new THREE.Mesh(rayGeo, createRayMat(0x8F8F8F, 0.12)), rotZ: 0.12, rotX: 0.3, posX: 0, speed: 0.5 },
    ];

    rays.forEach((r) => {
      r.mesh.rotation.z = r.rotZ;
      r.mesh.rotation.x = r.rotX;
      r.mesh.position.set(r.posX, 10, -25);
      rayGroup.add(r.mesh);
    });
    scene.add(rayGroup);

    // 4. 3D PCB Wireframe Grid (Floating in background)
    const gridLines = 28;
    const gridSpacing = 4.0;
    const gridWidth = gridLines * gridSpacing;
    const linePositions: number[] = [];

    for (let i = -gridLines / 2; i <= gridLines / 2; i++) {
      // Horizontal traces
      linePositions.push(-gridWidth / 2, i * gridSpacing, -35);
      linePositions.push(gridWidth / 2, i * gridSpacing, -35);
      // Vertical traces
      linePositions.push(i * gridSpacing, -gridWidth / 2, -35);
      linePositions.push(i * gridSpacing, gridWidth / 2, -35);
    }

    const gridGeo = new THREE.BufferGeometry();
    gridGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    const gridMat = new THREE.LineBasicMaterial({
      color: 0x5D5D5D,
      transparent: true,
      opacity: 0.08,
      blending: THREE.AdditiveBlending,
    });
    const pcbGrid = new THREE.LineSegments(gridGeo, gridMat);
    scene.add(pcbGrid);

    // 5. Active Signal Pulses along Traces
    const pulseCount = 18;
    const pulseGeo = new THREE.BufferGeometry();
    const pulsePos = new Float32Array(pulseCount * 3);
    const pulseSpeeds: number[] = [];

    for (let i = 0; i < pulseCount; i++) {
      pulsePos[i * 3] = (Math.random() - 0.5) * gridWidth;
      pulsePos[i * 3 + 1] = (Math.random() - 0.5) * gridWidth;
      pulsePos[i * 3 + 2] = -34.8;
      pulseSpeeds.push((Math.random() * 0.4 + 0.2) * (Math.random() > 0.5 ? 1 : -1));
    }
    pulseGeo.setAttribute('position', new THREE.BufferAttribute(pulsePos, 3));
    const pulseMat = new THREE.PointsMaterial({
      color: 0xE8E8E8,
      size: 3.5,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
    });
    const pulsePoints = new THREE.Points(pulseGeo, pulseMat);
    scene.add(pulsePoints);

    // Resize Handler — also refreshes the cached scroll range so the animate
    // loop never reads scrollHeight per frame (forced layout every frame).
    let maxScroll = 1;
    const measureScrollRange = () => {
      maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    };
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      particleMaterial.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio || 1, 1.5);
      measureScrollRange();
    };
    window.addEventListener('resize', onResize);

    const scrollRangeObserver = new ResizeObserver(measureScrollRange);
    scrollRangeObserver.observe(document.body);
    measureScrollRange();

    // 6. Animation Loop (performance.now instead of the deprecated THREE.Clock)
    let animId = 0;
    const startTime = performance.now();

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const elapsedTime = (performance.now() - startTime) / 1000;

      // Smooth camera lerp on mouse parallax
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;
      camera.position.x = mouse.x * 3.5;
      camera.position.y = mouse.y * 2.5;

      // Smooth scroll lerp (maxScroll cached via resize/ResizeObserver)
      scrollY += (targetScrollY - scrollY) * 0.08;
      const scrollProgress = Math.min(Math.max(scrollY / maxScroll, 0), 1);

      // Camera depth response to scroll
      camera.position.z = 45 - scrollProgress * 18;
      camera.lookAt(0, -scrollProgress * 6, 0);

      // Morph factor between chaotic cosmic field and structured PCB bus
      const morphTarget = Math.min(scrollProgress * 2.2, 1.0);
      particleMaterial.uniforms.uMorph.value = THREE.MathUtils.lerp(
        particleMaterial.uniforms.uMorph.value,
        morphTarget,
        0.06
      );

      // Update particle shader uniforms
      particleMaterial.uniforms.uTime.value = elapsedTime;

      // Sweeping god-ray movements
      rays.forEach((r, idx) => {
        const mat = r.mesh.material as THREE.ShaderMaterial;
        mat.uniforms.uTime.value = elapsedTime;
        r.mesh.rotation.z = r.rotZ + Math.sin(elapsedTime * r.speed + idx) * 0.12;
        r.mesh.position.x = r.posX + Math.cos(elapsedTime * 0.25 + idx) * 4.0;
      });

      // Animate signal pulses on PCB grid
      const pAttr = pulseGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < pulseCount; i++) {
        let x = pAttr.getX(i);
        x += pulseSpeeds[i];
        if (x > gridWidth / 2) x = -gridWidth / 2;
        if (x < -gridWidth / 2) x = gridWidth / 2;
        pAttr.setX(i, x);
      }
      pAttr.needsUpdate = true;

      // Soft grid rotation
      pcbGrid.rotation.z = elapsedTime * 0.015;
      pulsePoints.rotation.z = pcbGrid.rotation.z;

      renderer.render(scene, camera);
    };

    const startLoop = () => {
      if (!animId && isVisible) {
        animId = requestAnimationFrame(animate);
      }
    };

    const stopLoop = () => {
      if (animId) {
        cancelAnimationFrame(animId);
        animId = 0;
      }
    };

    let isVisible = true;
    const handleVisibilityChange = () => {
      if (document.hidden) {
        isVisible = false;
        stopLoop();
      } else {
        isVisible = true;
        startLoop();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    startLoop();

    // 7. Complete Resource Cleanup on Unmount
    return () => {
      stopLoop();
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      scrollRangeObserver.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);

      particleGeometry.dispose();
      particleMaterial.dispose();
      rayGeo.dispose();
      rays.forEach((r) => (r.mesh.material as THREE.Material).dispose());
      gridGeo.dispose();
      gridMat.dispose();
      pulseGeo.dispose();
      pulseMat.dispose();

      renderer.dispose();
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden bg-[#000000]"
    />
  );
};

export default Deep3DSpaceBackdrop;
