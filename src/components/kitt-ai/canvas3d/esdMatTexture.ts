import * as THREE from 'three';

/**
 * Generates an ultra-realistic ESD Antistatic Cutting & Prototyping Mat texture
 * Features:
 * - Anti-static Blue / Oceanic Teal silicone surface
 * - 1cm and 5cm engineering grid with millimeter subdivisions
 * - Precision ruler markings (cm / mm) along perimeter
 * - ESD Electrostatic Sensitive Warning logo
 * - Surface roughness and matte finish
 */
let cachedEsdMatTexture: THREE.CanvasTexture | null = null;

export function createEsdMatTexture(): THREE.CanvasTexture {
  if (cachedEsdMatTexture) {
    return cachedEsdMatTexture;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const w = canvas.width;
  const h = canvas.height;

  // 1. Antistatic Matte Silicone Base (Iconic Workshop ESD Blue)
  const baseGrad = ctx.createLinearGradient(0, 0, w, h);
  baseGrad.addColorStop(0, '#0369a1'); // Deep industrial blue
  baseGrad.addColorStop(0.5, '#8F8F8F'); // Electric cyan/blue
  baseGrad.addColorStop(1, '#075985');
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, w, h);

  // Micro-matte polymer grain
  ctx.fillStyle = 'rgba(0, 0, 0, 0.02)';
  for (let i = 0; i < 10000; i++) {
    const gx = Math.random() * w;
    const gy = Math.random() * h;
    ctx.fillRect(gx, gy, 1.5, 1.5);
  }

  // 2. Perimeter Ruler Border
  const pad = 40;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 3;
  ctx.strokeRect(pad, pad, w - pad * 2, h - pad * 2);

  // Millimeter and Centimeter ticks along border
  const gridStep = 40; // 1 cm representation
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.font = 'bold 13px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Horizontal rulers (top and bottom)
  let cmCount = 0;
  for (let x = pad; x <= w - pad; x += gridStep) {
    const isMajor = cmCount % 5 === 0;
    const tickLen = isMajor ? 18 : 9;

    ctx.fillRect(x - 1, pad, 2, tickLen);
    ctx.fillRect(x - 1, h - pad - tickLen, 2, tickLen);

    if (isMajor && x > pad && x < w - pad) {
      ctx.fillText(String(cmCount), x, pad + 26);
      ctx.fillText(String(cmCount), x, h - pad - 26);
    }
    cmCount++;
  }

  // Vertical rulers (left and right)
  let vCount = 0;
  for (let y = pad; y <= h - pad; y += gridStep) {
    const isMajor = vCount % 5 === 0;
    const tickLen = isMajor ? 18 : 9;

    ctx.fillRect(pad, y - 1, tickLen, 2);
    ctx.fillRect(w - pad - tickLen, y - 1, tickLen, 2);

    if (isMajor && y > pad && y < h - pad) {
      ctx.fillText(String(vCount), pad + 26, y);
      ctx.fillText(String(vCount), w - pad - 26, y);
    }
    vCount++;
  }

  // 3. Fine Grid Lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.42)';
  ctx.lineWidth = 1.2;
  for (let x = pad + gridStep; x < w - pad; x += gridStep) {
    ctx.beginPath();
    ctx.moveTo(x, pad);
    ctx.lineTo(x, h - pad);
    ctx.stroke();
  }

  for (let y = pad + gridStep; y < h - pad; y += gridStep) {
    ctx.beginPath();
    ctx.moveTo(pad, y);
    ctx.lineTo(w - pad, y);
    ctx.stroke();
  }

  // Major 5cm Accent Lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.78)';
  ctx.lineWidth = 2.2;
  for (let x = pad + gridStep * 5; x < w - pad; x += gridStep * 5) {
    ctx.beginPath();
    ctx.moveTo(x, pad);
    ctx.lineTo(x, h - pad);
    ctx.stroke();
  }
  for (let y = pad + gridStep * 5; y < h - pad; y += gridStep * 5) {
    ctx.beginPath();
    ctx.moveTo(pad, y);
    ctx.lineTo(w - pad, y);
    ctx.stroke();
  }

  // 4. ESD Caution Logo & Grounding Symbol (Bottom Right)
  const esdX = w - 180;
  const esdY = h - 100;

  // Yellow warning triangle
  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.moveTo(esdX, esdY - 32);
  ctx.lineTo(esdX + 32, esdY + 22);
  ctx.lineTo(esdX - 32, esdY + 22);
  ctx.closePath();
  ctx.fill();

  // Black hand & lightning in triangle
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(esdX - 4, esdY - 14);
  ctx.lineTo(esdX + 8, esdY + 2);
  ctx.lineTo(esdX - 2, esdY + 4);
  ctx.lineTo(esdX + 4, esdY + 16);
  ctx.stroke();

  // ESD Text
  ctx.font = 'bold 15px monospace';
  ctx.fillStyle = '#f1f5f9';
  ctx.textAlign = 'center';
  ctx.fillText('ESD STATIC DISSIPATIVE', esdX, esdY + 40);
  ctx.font = '11px monospace';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('10^6 - 10^9 Ω/SQ', esdX, esdY + 54);

  // 5. Workbench Brand Stamp (Top Left)
  ctx.textAlign = 'left';
  ctx.font = 'bold 18px monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.fillText('KITT SOVEREIGN HARDWARE LAB', pad + 35, pad + 45);
  ctx.font = '12px monospace';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.fillText('PRECISION CALIBRATED WORKBENCH • MODEL PRO-830', pad + 35, pad + 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;

  cachedEsdMatTexture = texture;
  return texture;
}
