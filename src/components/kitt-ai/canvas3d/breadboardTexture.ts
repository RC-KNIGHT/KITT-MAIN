import * as THREE from 'three';

/**
 * Generates an ultra-crisp, high-fidelity procedural texture for solderless breadboards.
 * Includes:
 * - 830 realistic tie-point contact sockets with internal metallic spring clips and depth shadows
 * - Printed terminal row numbers: 1, 5, 10, 15 ... 60, 63
 * - Printed column letters: A B C D E and F G H I J
 * - Power bus stripes: Red (+) and Blue/Black (-) with printed '+' and '-' polarity symbols
 * - Subtle matte ABS polymer texture and micro-grain
 */
let cachedBreadboardTextures: Record<string, THREE.CanvasTexture> = {};

export function createProceduralBreadboardTexture(size: 'mini' | 'medium' | 'large' = 'large'): THREE.CanvasTexture {
  if (cachedBreadboardTextures[size]) {
    return cachedBreadboardTextures[size];
  }

  const canvas = document.createElement('canvas');
  // High resolution for needle-sharp silk-screen text and contact pins
  const width = size === 'mini' ? 1024 : size === 'medium' ? 1536 : 2048;
  const height = 512;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d', { willReadFrequently: false });
  if (!ctx) return new THREE.CanvasTexture(canvas);

  const numRows = size === 'mini' ? 17 : size === 'medium' ? 30 : 63;
  const hasRails = size !== 'mini';

  // 1. Off-white ABS polymer breadboard body base
  const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
  bgGrad.addColorStop(0, '#f8fafc');
  bgGrad.addColorStop(0.5, '#f1f5f9');
  bgGrad.addColorStop(1, '#e2e8f0');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // Subtle polymer surface micro-texture
  ctx.fillStyle = 'rgba(15, 15, 16, 0.015)';
  for (let i = 0; i < 6000; i++) {
    const rx = Math.random() * width;
    const ry = Math.random() * height;
    ctx.fillRect(rx, ry, 1.5, 1.5);
  }

  // 2. Central IC Divider Trough (Center groove)
  const troughY = height / 2;
  const troughHeight = 24;

  const troughGrad = ctx.createLinearGradient(0, troughY - troughHeight / 2, 0, troughY + troughHeight / 2);
  troughGrad.addColorStop(0, '#cbd5e1');
  troughGrad.addColorStop(0.25, '#94a3b8');
  troughGrad.addColorStop(0.5, '#64748b');
  troughGrad.addColorStop(0.75, '#94a3b8');
  troughGrad.addColorStop(1, '#cbd5e1');
  ctx.fillStyle = troughGrad;
  ctx.fillRect(20, troughY - troughHeight / 2, width - 40, troughHeight);

  // Center trough bevel highlights
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.fillRect(20, troughY - troughHeight / 2 - 1.5, width - 40, 1.5);
  ctx.fillRect(20, troughY + troughHeight / 2, width - 40, 1.5);

  // 3. Power Bus Rails (Top & Bottom)
  const topRailRedY = 48;
  const topRailBlueY = 82;
  const botRailBlueY = height - 82;
  const botRailRedY = height - 48;

  if (hasRails) {
    // Red bus line (+)
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(35, topRailRedY);
    ctx.lineTo(width - 35, topRailRedY);
    ctx.moveTo(35, botRailRedY);
    ctx.lineTo(width - 35, botRailRedY);
    ctx.stroke();

    // Blue bus line (-)
    ctx.strokeStyle = '#8F8F8F';
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(35, topRailBlueY);
    ctx.lineTo(width - 35, topRailBlueY);
    ctx.moveTo(35, botRailBlueY);
    ctx.lineTo(width - 35, botRailBlueY);
    ctx.stroke();

    // Red '+' and Blue '-' polarity labels every 5 or 10 sections
    ctx.font = 'bold 22px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const step = width / 12;
    for (let x = 45; x < width - 20; x += step) {
      ctx.fillStyle = '#ef4444';
      ctx.fillText('+', x, topRailRedY - 16);
      ctx.fillText('+', x, botRailRedY + 16);

      ctx.fillStyle = '#8F8F8F';
      ctx.fillText('−', x, topRailBlueY - 16);
      ctx.fillText('−', x, botRailBlueY + 16);
    }
  }

  // 4. Draw Tie-Point Holes and Silkscreen Markings
  const marginX = width * 0.045;
  const usableWidth = width - marginX * 2;
  const colPitch = usableWidth / (numRows - 1);

  // Y coordinates for terminal rows:
  // Top bank: a, b, c, d, e
  const topBankCols = ['a', 'b', 'c', 'd', 'e'];
  const topBankY = [130, 158, 186, 214, 242];

  // Bottom bank: f, g, h, i, j
  const botBankCols = ['f', 'g', 'h', 'i', 'j'];
  const botBankY = [270, 298, 326, 354, 382];

  // Function to draw an individual metallic spring-clip socket hole
  const drawSocketHole = (x: number, y: number) => {
    const holeSize = 13;
    const half = holeSize / 2;

    // Outer plastic bevel/recess (subtle shadow)
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.roundRect(x - half - 1.5, y - half - 1.5, holeSize + 3, holeSize + 3, 2.5);
    ctx.fill();

    // Dark interior cavity
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(x - half, y - half, holeSize, holeSize, 2);
    ctx.fill();

    // Inner nickel-plated spring contact leaf (metallic highlight)
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(x - 2, y - 4.5, 4, 2);
    ctx.fillRect(x - 2, y + 2.5, 4, 2);

    // Deep center opening
    ctx.fillStyle = '#020617';
    ctx.fillRect(x - 2, y - 2, 4, 4);
  };

  // Draw power rail socket holes if enabled
  if (hasRails) {
    for (let r = 0; r < numRows; r++) {
      const hx = marginX + r * colPitch;
      // Top power rail holes (+ and -)
      drawSocketHole(hx, topRailRedY - 0.5);
      drawSocketHole(hx, topRailBlueY - 0.5);
      // Bottom power rail holes (- and +)
      drawSocketHole(hx, botRailBlueY - 0.5);
      drawSocketHole(hx, botRailRedY - 0.5);
    }
  }

  // Draw terminal strip socket holes: 5 holes per column on top bank, 5 on bottom bank
  for (let r = 0; r < numRows; r++) {
    const hx = marginX + r * colPitch;

    // Top bank (rows a-e)
    for (let i = 0; i < topBankY.length; i++) {
      drawSocketHole(hx, topBankY[i]);
    }

    // Bottom bank (rows f-j)
    for (let i = 0; i < botBankY.length; i++) {
      drawSocketHole(hx, botBankY[i]);
    }

    // Numbering: Print 1, 5, 10, 15... 60, 63
    const rowNum = r + 1;
    if (rowNum === 1 || rowNum % 5 === 0 || rowNum === numRows) {
      ctx.font = 'bold 15px monospace';
      ctx.fillStyle = '#475569';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Top number (above row 'a')
      ctx.fillText(String(rowNum), hx, 108);
      // Bottom number (below row 'j')
      ctx.fillText(String(rowNum), hx, 406);
    }
  }

  // Column letters on left and right margins (a-e and f-j)
  ctx.font = 'bold 17px monospace';
  ctx.fillStyle = '#64748b';
  ctx.textBaseline = 'middle';

  const leftLabelX = marginX - 18;
  const rightLabelX = width - marginX + 18;

  for (let i = 0; i < topBankCols.length; i++) {
    ctx.textAlign = 'right';
    ctx.fillText(topBankCols[i], leftLabelX, topBankY[i]);
    ctx.textAlign = 'left';
    ctx.fillText(topBankCols[i], rightLabelX, topBankY[i]);
  }

  for (let i = 0; i < botBankCols.length; i++) {
    ctx.textAlign = 'right';
    ctx.fillText(botBankCols[i], leftLabelX, botBankY[i]);
    ctx.textAlign = 'left';
    ctx.fillText(botBankCols[i], rightLabelX, botBankY[i]);
  }

  // 5. Breadboard Perimeter Bevel & Dovetail interlocking tab guides
  ctx.strokeStyle = 'rgba(15, 15, 16, 0.15)';
  ctx.lineWidth = 3;
  ctx.strokeRect(3, 3, width - 6, height - 6);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;

  cachedBreadboardTextures[size] = texture;
  return texture;
}
