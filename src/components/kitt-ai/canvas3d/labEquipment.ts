import * as THREE from 'three';

/**
 * Builds realistic laboratory instruments and bench accessories:
 * - Digital Benchtop Storage Oscilloscope with glowing screen
 * - Precision Bench Digital Multimeter (DMM)
 * - Prototyping Jumper Wire Spools
 */

export function buildBenchOscilloscope(): THREE.Group {
  const group = new THREE.Group();

  // 1. Oscilloscope Main Housing
  const bodyGeo = new THREE.BoxGeometry(7.5, 4.8, 4.2);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x334155, // Slate gray metal case
    roughness: 0.35,
    metalness: 0.25
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 2.4;
  body.castShadow = true;
  group.add(body);

  // Front Bezel Trim
  const bezelGeo = new THREE.BoxGeometry(7.6, 4.9, 0.3);
  const bezelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 });
  const bezel = new THREE.Mesh(bezelGeo, bezelMat);
  bezel.position.set(0, 2.4, 2.15);
  group.add(bezel);

  // 2. Oscilloscope Display Screen (with glowing CRT/LCD waveform)
  const screenCanvas = document.createElement('canvas');
  screenCanvas.width = 512;
  screenCanvas.height = 320;
  const ctx = screenCanvas.getContext('2d');
  if (ctx) {
    // Dark phosphorescent green/black background
    ctx.fillStyle = '#022c22';
    ctx.fillRect(0, 0, 512, 320);

    // Fine grid
    ctx.strokeStyle = '#064e3b';
    ctx.lineWidth = 1;
    for (let x = 0; x <= 512; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 320);
      ctx.stroke();
    }
    for (let y = 0; y <= 320; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(512, y);
      ctx.stroke();
    }

    // Header telemetry
    ctx.font = 'bold 16px monospace';
    ctx.fillStyle = '#34d399';
    ctx.fillText('CH1: 2.00V/div   CH2: 500mV   T: 20.0ms   f: 1.000kHz', 20, 28);

    // Glowing active waveform (Sine + PWM trace)
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#34d399';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    for (let x = 0; x < 512; x += 3) {
      const y = 160 + Math.sin(x * 0.045) * 55 + Math.sin(x * 0.09) * 15;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Channel 2 trace (Golden yellow square wave)
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    for (let x = 0; x < 512; x += 2) {
      const cycle = Math.floor(x / 48) % 2;
      const y = 230 + (cycle === 0 ? -30 : 30);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  const screenTex = new THREE.CanvasTexture(screenCanvas);
  screenTex.colorSpace = THREE.SRGBColorSpace;
  const screenMat = new THREE.MeshStandardMaterial({
    map: screenTex,
    emissive: 0x10b981,
    emissiveMap: screenTex,
    emissiveIntensity: 0.45,
    roughness: 0.15
  });
  const screenMesh = new THREE.Mesh(new THREE.PlaneGeometry(4.8, 3.2), screenMat);
  screenMesh.position.set(-1.0, 2.5, 2.32);
  group.add(screenMesh);

  // 3. Control Rotary Encoders & BNC Jacks (Right column)
  const knobMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.6, roughness: 0.3 });
  const bncMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.2 });

  // Big Volt/Time Knobs
  [1.9, 2.7].forEach((kx) => {
    [3.2, 2.3].forEach((ky) => {
      const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.35, 16), knobMat);
      knob.rotation.x = Math.PI / 2;
      knob.position.set(kx, ky, 2.4);
      group.add(knob);
    });
  });

  // BNC Ports along bottom
  [1.7, 2.4, 3.1].forEach((bx) => {
    const bnc = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.3, 16), bncMat);
    bnc.rotation.x = Math.PI / 2;
    bnc.position.set(bx, 1.2, 2.35);
    group.add(bnc);
  });

  // Rubber Base Feet
  const footMat = new THREE.MeshStandardMaterial({ color: 0x020617 });
  [-3.2, 3.2].forEach(fx => {
    [-1.8, 1.8].forEach(fz => {
      const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.25, 12), footMat);
      foot.position.set(fx, 0.12, fz);
      group.add(foot);
    });
  });

  return group;
}

export function buildBenchMultimeter(): THREE.Group {
  const group = new THREE.Group();

  // Rugged Fluke Yellow / Dark Case
  const caseGeo = new THREE.BoxGeometry(3.6, 1.8, 4.8);
  const caseMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.4 });
  const meter = new THREE.Mesh(caseGeo, caseMat);
  meter.position.y = 0.9;
  meter.castShadow = true;
  group.add(meter);

  // Angled Front Face Panel
  const panelGeo = new THREE.BoxGeometry(3.3, 0.2, 4.4);
  const panelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });
  const panel = new THREE.Mesh(panelGeo, panelMat);
  panel.position.set(0, 1.82, 0);
  group.add(panel);

  // LCD Backlit Display
  const lcdCanvas = document.createElement('canvas');
  lcdCanvas.width = 256;
  lcdCanvas.height = 128;
  const ctx = lcdCanvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 256, 128);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 44px monospace';
    ctx.textAlign = 'right';
    ctx.fillText('5.021', 190, 75);
    ctx.font = 'bold 22px monospace';
    ctx.fillText('V DC', 245, 75);
    ctx.font = '14px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.textAlign = 'left';
    ctx.fillText('AUTO  TRUE-RMS', 20, 110);
  }
  const lcdTex = new THREE.CanvasTexture(lcdCanvas);
  lcdTex.colorSpace = THREE.SRGBColorSpace;
  const lcdMat = new THREE.MeshStandardMaterial({
    map: lcdTex,
    emissive: 0x0284c7,
    emissiveIntensity: 0.35,
    roughness: 0.2
  });
  const lcdMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.1), lcdMat);
  lcdMesh.rotation.x = -Math.PI / 2;
  lcdMesh.position.set(0, 1.94, -1.0);
  group.add(lcdMesh);

  // Big Rotary Dial
  const dialMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3 });
  const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 0.3, 24), dialMat);
  dial.position.set(0, 2.0, 0.7);
  group.add(dial);

  // Banana Input Jacks (Red & Black)
  const redJack = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.2, 12), new THREE.MeshStandardMaterial({ color: 0xef4444 }));
  redJack.position.set(1.0, 1.94, 1.8);
  const blackJack = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.2, 12), new THREE.MeshStandardMaterial({ color: 0x09090b }));
  blackJack.position.set(0.4, 1.94, 1.8);
  group.add(redJack, blackJack);

  return group;
}

export function buildWireSpools(): THREE.Group {
  const group = new THREE.Group();
  const colors = [0xef4444, 0x1e293b, 0x10b981, 0x3b82f6]; // Red, Black, Green, Blue

  colors.forEach((col, idx) => {
    const spoolGroup = new THREE.Group();

    // Flange rim discs
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.4 });
    const rim1 = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.08, 20), rimMat);
    rim1.position.y = 0.04;
    const rim2 = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.08, 20), rimMat);
    rim2.position.y = 1.16;

    // Colored Wound Wire Core
    const wireCore = new THREE.Mesh(
      new THREE.CylinderGeometry(0.78, 0.78, 1.05, 20),
      new THREE.MeshStandardMaterial({ color: col, roughness: 0.35 })
    );
    wireCore.position.y = 0.6;
    wireCore.castShadow = true;

    spoolGroup.add(rim1, rim2, wireCore);
    spoolGroup.position.set(idx * 2.1, 0, 0);
    group.add(spoolGroup);
  });

  return group;
}
