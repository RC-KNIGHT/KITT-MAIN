import * as THREE from 'three';

/**
 * Generates an ultra-realistic 360° equirectangular panoramic texture
 * of a high-tech electronics engineering workshop and sunlit lab.
 * High dynamic range, rich ambient bounce, and balanced metallic reflections.
 */
let cachedLabTexture: THREE.CanvasTexture | null = null;

export function createPhotorealisticLabEnvironment(): THREE.CanvasTexture {
  if (cachedLabTexture) {
    return cachedLabTexture;
  }

  const width = 2048;
  const height = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // 1. Studio Laboratory Wall & Ceiling Lighting Gradient
  const ceilingGrad = ctx.createLinearGradient(0, 0, 0, height * 0.58);
  ceilingGrad.addColorStop(0, '#1e293b');
  ceilingGrad.addColorStop(0.25, '#293548');
  ceilingGrad.addColorStop(0.6, '#475569');
  ceilingGrad.addColorStop(0.85, '#64748b');
  ceilingGrad.addColorStop(1, '#94a3b8');
  ctx.fillStyle = ceilingGrad;
  ctx.fillRect(0, 0, width, height * 0.58);

  // 2. Warm Hardwood / Industrial ESD Floor (with warm ambient bounce, NOT pitch black)
  const floorGrad = ctx.createLinearGradient(0, height * 0.58, 0, height);
  floorGrad.addColorStop(0, '#453228');
  floorGrad.addColorStop(0.3, '#35251d');
  floorGrad.addColorStop(0.7, '#241a14');
  floorGrad.addColorStop(1, '#18120e');
  ctx.fillStyle = floorGrad;
  ctx.fillRect(0, height * 0.58, width, height * 0.42);

  // Floor plank perspective lines
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
  ctx.lineWidth = 2;
  for (let i = 0; i < width; i += 96) {
    ctx.beginPath();
    ctx.moveTo(i, height * 0.58);
    ctx.lineTo(i * 1.5 - width * 0.25, height);
    ctx.stroke();
  }

  // 3. Large Panoramic Sunny Multi-Pane Window (Center-Back)
  const winX = width * 0.2;
  const winY = height * 0.08;
  const winW = width * 0.6;
  const winH = height * 0.5;

  // Window Outdoor Daylight / Sky Gradient
  const skyGrad = ctx.createLinearGradient(winX, winY, winX, winY + winH);
  skyGrad.addColorStop(0, '#7dd3fc');
  skyGrad.addColorStop(0.35, '#bae6fd');
  skyGrad.addColorStop(0.7, '#fef08a'); // Warm golden sun rays
  skyGrad.addColorStop(1, '#86efac'); // Green garden horizon
  ctx.fillStyle = skyGrad;
  ctx.fillRect(winX, winY, winW, winH);

  // Outdoor trees and garden horizon
  for (let i = 0; i < 60; i++) {
    const tx = winX + (i * winW) / 60 + Math.sin(i * 1.5) * 25;
    const ty = winY + winH * 0.68 + Math.cos(i) * 20;
    const tr = 40 + Math.abs(Math.sin(i * 2.2)) * 45;
    ctx.beginPath();
    ctx.arc(tx, ty, tr, 0, Math.PI * 2);
    ctx.fillStyle = i % 2 === 0 ? '#15803d' : '#E8E8E8';
    ctx.fill();
  }

  // Intense Sunlight Bloom from window
  const sunBloom = ctx.createRadialGradient(
    winX + winW * 0.68,
    winY + winH * 0.3,
    15,
    winX + winW * 0.68,
    winY + winH * 0.3,
    450
  );
  sunBloom.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
  sunBloom.addColorStop(0.2, 'rgba(254, 240, 138, 0.55)');
  sunBloom.addColorStop(0.6, 'rgba(253, 230, 138, 0.18)');
  sunBloom.addColorStop(1, 'transparent');
  ctx.fillStyle = sunBloom;
  ctx.fillRect(winX, winY, winW, winH);

  // Architectural White Window Frame & Mullions
  ctx.strokeStyle = '#f8fafc';
  ctx.lineWidth = 18;
  ctx.strokeRect(winX, winY, winW, winH);

  // Vertical Mullions
  ctx.lineWidth = 10;
  for (let i = 1; i <= 4; i++) {
    ctx.beginPath();
    ctx.moveTo(winX + (winW * i) / 5, winY);
    ctx.lineTo(winX + (winW * i) / 5, winY + winH);
    ctx.stroke();
  }

  // Horizontal Transom
  ctx.beginPath();
  ctx.moveTo(winX, winY + winH * 0.38);
  ctx.lineTo(winX + winW, winY + winH * 0.38);
  ctx.stroke();

  // Curtains on window sides
  const drawCurtain = (cx: number, cw: number) => {
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(cx, winY - 15, cw, winH + 50);
    for (let f = 0; f < cw; f += 20) {
      ctx.fillStyle = f % 40 === 0 ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.5)';
      ctx.fillRect(cx + f, winY - 15, 10, winH + 50);
    }
  };
  drawCurtain(winX - 60, 90);
  drawCurtain(winX + winW - 30, 90);

  // 4. Background Engineering Workstation & PC Rig (Right of center)
  const deskX = width * 0.62;
  const deskY = height * 0.46;

  // Dual Monitor Setup
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(deskX, deskY - 120, 200, 115);
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 5;
  ctx.strokeRect(deskX, deskY - 120, 200, 115);

  // Monitor 1: Code IDE
  ctx.fillStyle = '#181825';
  ctx.fillRect(deskX + 6, deskY - 114, 188, 103);
  ctx.fillStyle = '#B4B4B4';
  ctx.fillRect(deskX + 20, deskY - 100, 90, 5);
  ctx.fillStyle = '#CCCCCC';
  ctx.fillRect(deskX + 20, deskY - 90, 120, 5);
  ctx.fillStyle = '#4ade80';
  ctx.fillRect(deskX + 20, deskY - 80, 75, 5);

  // Monitor 2: Oscilloscope Waveform
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(deskX + 220, deskY - 115, 170, 110);
  ctx.strokeRect(deskX + 220, deskY - 115, 170, 110);
  ctx.fillStyle = '#022c22';
  ctx.fillRect(deskX + 225, deskY - 110, 160, 100);

  ctx.strokeStyle = '#F5F5F5';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let s = 0; s < 145; s += 4) {
    const sy = deskY - 60 + Math.sin(s * 0.22) * 26;
    if (s === 0) ctx.moveTo(deskX + 232 + s, sy);
    else ctx.lineTo(deskX + 232 + s, sy);
  }
  ctx.stroke();

  // Desktop PC Case with Glass Side Panel and RGB Cooling Fan
  ctx.fillStyle = '#18181b';
  ctx.fillRect(deskX + 410, deskY - 130, 80, 140);
  ctx.fillStyle = 'rgba(30, 30, 31, 0.75)';
  ctx.fillRect(deskX + 415, deskY - 124, 70, 126);

  // Glowing Cyan/Magenta RGB Ring
  const rgbGrad = ctx.createRadialGradient(deskX + 450, deskY - 65, 4, deskX + 450, deskY - 65, 26);
  rgbGrad.addColorStop(0, '#8F8F8F');
  rgbGrad.addColorStop(0.5, '#CCCCCC');
  rgbGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = rgbGrad;
  ctx.beginPath();
  ctx.arc(deskX + 450, deskY - 65, 26, 0, Math.PI * 2);
  ctx.fill();

  // 5. Left Hardware Shelves & Component Organizers
  const shelfX = width * 0.05;
  const shelfY = height * 0.16;
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(shelfX, shelfY, 260, 440);

  ctx.fillStyle = '#334155';
  for (let s = 0; s < 5; s++) {
    ctx.fillRect(shelfX, shelfY + s * 88, 260, 12);
    // Drawers / Component boxes
    for (let b = 0; b < 4; b++) {
      ctx.fillStyle = b % 2 === 0 ? '#B4B4B4' : '#e2e8f0';
      ctx.fillRect(shelfX + 16 + b * 58, shelfY + s * 88 - 36, 48, 34);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(shelfX + 32 + b * 58, shelfY + s * 88 - 22, 16, 7);
    }
  }

  // 6. Subtle Vignette for Cinematic Atmosphere
  const vignette = ctx.createRadialGradient(
    width * 0.5,
    height * 0.5,
    height * 0.3,
    width * 0.5,
    height * 0.5,
    width * 0.65
  );
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vignette.addColorStop(0.8, 'rgba(0, 0, 0, 0.12)');
  vignette.addColorStop(1, 'rgba(0, 0, 0, 0.35)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);

  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  cachedLabTexture = texture;
  return texture;
}
