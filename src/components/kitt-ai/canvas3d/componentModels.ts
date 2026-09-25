import * as THREE from 'three';
import { CIRComponent } from '../cir/cirTypes';

/**
 * Procedural 3D Component Models Generator
 * Builds high-fidelity, photorealistic 3D representations of real electronic hardware.
 */

// Shared reusable materials to conserve GPU memory and maintain high FPS
const metalPinMat = new THREE.MeshStandardMaterial({
  color: 0xe2e8f0,
  metalness: 0.9,
  roughness: 0.15
});

const silverTabMat = new THREE.MeshStandardMaterial({
  color: 0xf1f5f9,
  metalness: 0.95,
  roughness: 0.2
});

const epoxyBlackMat = new THREE.MeshStandardMaterial({
  color: 0x18181b,
  roughness: 0.45,
  metalness: 0.05
});

const ceramicBeigeMat = new THREE.MeshStandardMaterial({
  color: 0xfde68a,
  roughness: 0.5,
  metalness: 0.02
});

/**
 * Builds a TO-220 Transistor / Power MOSFET (e.g. IRLZ44N)
 */
export function buildTO220(comp: CIRComponent): THREE.Group {
  const group = new THREE.Group();

  // 1. Stamped Aluminum Heatsink Back Tab (with mounting hole)
  const tabGeo = new THREE.BoxGeometry(1.2, 1.4, 0.14);
  const tabMesh = new THREE.Mesh(tabGeo, silverTabMat);
  tabMesh.position.set(0, 0.7, -0.15);
  tabMesh.castShadow = true;
  group.add(tabMesh);

  // Heatsink mounting hole (dark disc)
  const holeGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.16, 16);
  const holeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
  const holeMesh = new THREE.Mesh(holeGeo, holeMat);
  holeMesh.rotation.x = Math.PI / 2;
  holeMesh.position.set(0, 1.1, -0.15);
  group.add(holeMesh);

  // 2. Molded Black Epoxy Case
  const bodyGeo = new THREE.BoxGeometry(1.2, 0.95, 0.42);
  const bodyMesh = new THREE.Mesh(bodyGeo, epoxyBlackMat);
  bodyMesh.position.set(0, 0.48, 0.1);
  bodyMesh.castShadow = true;
  group.add(bodyMesh);

  // Front Chamfer / Laser Etching Plate
  const labelCanvas = document.createElement('canvas');
  labelCanvas.width = 256;
  labelCanvas.height = 128;
  const ctx = labelCanvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#18181b';
    ctx.fillRect(0, 0, 256, 128);
    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 26px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(comp.partNumber || 'IRLZ44N', 128, 55);
    ctx.font = '16px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('N-CH POWER MOSFET', 128, 90);
  }
  const labelTex = new THREE.CanvasTexture(labelCanvas);
  labelTex.colorSpace = THREE.SRGBColorSpace;
  const labelMat = new THREE.MeshStandardMaterial({
    map: labelTex,
    roughness: 0.5,
    metalness: 0.05
  });
  const labelGeo = new THREE.PlaneGeometry(1.1, 0.85);
  const labelMesh = new THREE.Mesh(labelGeo, labelMat);
  labelMesh.position.set(0, 0.48, 0.32);
  group.add(labelMesh);

  // 3. Lead Pins (Gate, Drain, Source) bending down into breadboard holes
  const pinSpacing = 0.35;
  [-pinSpacing, 0, pinSpacing].forEach((px) => {
    const pinGeo = new THREE.BoxGeometry(0.08, 0.7, 0.08);
    const pin = new THREE.Mesh(pinGeo, metalPinMat);
    pin.position.set(px, -0.1, 0.1);
    pin.castShadow = true;
    group.add(pin);
  });

  return group;
}

/**
 * Builds a Dual In-Line Package (DIP) IC (e.g. NE555, LM741, logic gates)
 */
export function buildDIP(comp: CIRComponent): THREE.Group {
  const group = new THREE.Group();
  const isDIP16 = comp.pins.length > 8;
  const bodyLength = isDIP16 ? 2.4 : 1.35;

  // 1. Black Epoxy DIP Body
  const bodyGeo = new THREE.BoxGeometry(bodyLength, 0.38, 0.85);
  const bodyMesh = new THREE.Mesh(bodyGeo, epoxyBlackMat);
  bodyMesh.position.y = 0.26;
  bodyMesh.castShadow = true;
  group.add(bodyMesh);

  // Pin 1 Index Notch (semi-circle cutout)
  const notchGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.4, 12, 1, false, 0, Math.PI);
  const notchMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.8 });
  const notch = new THREE.Mesh(notchGeo, notchMat);
  notch.rotation.y = Math.PI / 2;
  notch.position.set(-bodyLength / 2, 0.26, 0);
  group.add(notch);

  // Laser Etched Marking on Top
  const icCanvas = document.createElement('canvas');
  icCanvas.width = 256;
  icCanvas.height = 128;
  const ctx = icCanvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#18181b';
    ctx.fillRect(0, 0, 256, 128);
    // Pin 1 dot
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.arc(35, 35, 7, 0, Math.PI * 2);
    ctx.fill();
    // Part designation text
    ctx.font = 'bold 32px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(comp.partNumber?.includes('555') ? 'NE555P' : comp.partNumber?.slice(0, 10) || 'IC', 135, 65);
    ctx.font = '16px monospace';
    ctx.fillStyle = '#64748b';
    ctx.fillText('TI 24A3', 135, 95);
  }
  const icTex = new THREE.CanvasTexture(icCanvas);
  icTex.colorSpace = THREE.SRGBColorSpace;
  const icTopMat = new THREE.MeshStandardMaterial({ map: icTex, roughness: 0.45 });
  const icTopGeo = new THREE.PlaneGeometry(bodyLength * 0.9, 0.75);
  const icTop = new THREE.Mesh(icTopGeo, icTopMat);
  icTop.rotation.x = -Math.PI / 2;
  icTop.position.set(0, 0.46, 0);
  group.add(icTop);

  // Silver Gull-Wing Lead Pins (Both sides: top row and bottom row)
  const numPinsPerSide = isDIP16 ? 8 : 4;
  const pinPitch = (bodyLength * 0.75) / (numPinsPerSide - 1);
  const startX = -((numPinsPerSide - 1) * pinPitch) / 2;

  for (let i = 0; i < numPinsPerSide; i++) {
    const px = startX + i * pinPitch;

    // Top pin (Z = -0.55)
    const pinTop = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.55, 0.08), metalPinMat);
    pinTop.position.set(px, 0.08, -0.48);
    pinTop.castShadow = true;
    group.add(pinTop);

    // Bottom pin (Z = +0.55)
    const pinBot = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.55, 0.08), metalPinMat);
    pinBot.position.set(px, 0.08, 0.48);
    pinBot.castShadow = true;
    group.add(pinBot);
  }

  return group;
}

/**
 * Builds an Axial Resistor with accurate 4-band color coding
 */
export function buildResistor(comp: CIRComponent): THREE.Group {
  const group = new THREE.Group();

  // 1. Ceramic Dumbbell Body
  const bodyGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.95, 16);
  const bodyMesh = new THREE.Mesh(bodyGeo, ceramicBeigeMat);
  bodyMesh.rotation.z = Math.PI / 2;
  bodyMesh.position.y = 0.32;
  bodyMesh.castShadow = true;
  group.add(bodyMesh);

  // 2. Color code bands (e.g. 220Ω = Red, Red, Brown, Gold)
  const bandColors = getResistorColorBands(String(comp.parameters?.resistance || comp.displayName || ''));
  const bandPositions = [-0.25, -0.08, 0.08, 0.28];

  bandColors.forEach((colorHex, idx) => {
    const bandGeo = new THREE.CylinderGeometry(0.185, 0.185, 0.07, 16);
    const bandMat = new THREE.MeshBasicMaterial({ color: colorHex });
    const bandMesh = new THREE.Mesh(bandGeo, bandMat);
    bandMesh.rotation.z = Math.PI / 2;
    bandMesh.position.set(bandPositions[idx], 0.32, 0);
    group.add(bandMesh);
  });

  // 3. Lead Wires bending 90° into breadboard sockets
  const wireMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.2 });

  // Left lead
  const leftCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.48, 0.32, 0),
    new THREE.Vector3(-0.85, 0.32, 0),
    new THREE.Vector3(-0.85, 0.0, 0)
  ]);
  const leftTube = new THREE.Mesh(new THREE.TubeGeometry(leftCurve, 8, 0.04, 6, false), wireMat);
  leftTube.castShadow = true;
  group.add(leftTube);

  // Right lead
  const rightCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.48, 0.32, 0),
    new THREE.Vector3(0.85, 0.32, 0),
    new THREE.Vector3(0.85, 0.0, 0)
  ]);
  const rightTube = new THREE.Mesh(new THREE.TubeGeometry(rightCurve, 8, 0.04, 6, false), wireMat);
  rightTube.castShadow = true;
  group.add(rightTube);

  return group;
}

function getResistorColorBands(resistanceStr: string = ''): number[] {
  const str = resistanceStr.toLowerCase();
  if (str.includes('220')) {
    return [0xdc2626, 0xdc2626, 0x92400e, 0xd97706]; // Red, Red, Brown, Gold (220Ω)
  }
  if (str.includes('10k')) {
    return [0x92400e, 0x000000, 0xf97316, 0xd97706]; // Brown, Black, Orange, Gold (10kΩ)
  }
  if (str.includes('1k')) {
    return [0x92400e, 0x000000, 0xdc2626, 0xd97706]; // Brown, Black, Red, Gold (1kΩ)
  }
  if (str.includes('470')) {
    return [0xfacc15, 0x7c3aed, 0x92400e, 0xd97706]; // Yellow, Violet, Brown, Gold (470Ω)
  }
  if (str.includes('100')) {
    return [0x92400e, 0x000000, 0x92400e, 0xd97706]; // Brown, Black, Brown, Gold (100Ω)
  }
  return [0xdc2626, 0xdc2626, 0x92400e, 0xd97706]; // Default 220Ω
}

/**
 * Builds an Axial Diode (e.g. 1N4007) with silver cathode band
 */
export function buildDiode(comp: CIRComponent): THREE.Group {
  const group = new THREE.Group();

  // 1. Black DO-41 cylinder body
  const bodyGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.8, 16);
  const bodyMesh = new THREE.Mesh(bodyGeo, epoxyBlackMat);
  bodyMesh.rotation.z = Math.PI / 2;
  bodyMesh.position.y = 0.32;
  bodyMesh.castShadow = true;
  group.add(bodyMesh);

  // 2. Silver Cathode Band (Polarity Stripe)
  const bandGeo = new THREE.CylinderGeometry(0.185, 0.185, 0.14, 16);
  const bandMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.2 });
  const bandMesh = new THREE.Mesh(bandGeo, bandMat);
  bandMesh.rotation.z = Math.PI / 2;
  bandMesh.position.set(-0.25, 0.32, 0);
  group.add(bandMesh);

  // 3. Leads
  const wireMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.85, roughness: 0.2 });
  const leftCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.4, 0.32, 0),
    new THREE.Vector3(-0.7, 0.32, 0),
    new THREE.Vector3(-0.7, 0.0, 0)
  ]);
  const rightCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.4, 0.32, 0),
    new THREE.Vector3(0.7, 0.32, 0),
    new THREE.Vector3(0.7, 0.0, 0)
  ]);
  group.add(new THREE.Mesh(new THREE.TubeGeometry(leftCurve, 6, 0.04, 6, false), wireMat));
  group.add(new THREE.Mesh(new THREE.TubeGeometry(rightCurve, 6, 0.04, 6, false), wireMat));

  return group;
}

/**
 * Builds a 5mm LED with translucent lens and internal glow
 */
export function buildLED(comp: CIRComponent): THREE.Group {
  const group = new THREE.Group();

  let ledColor = 0xef4444; // Red default
  let emissiveColor = 0xb91c1c;

  const name = comp.displayName.toLowerCase();
  if (name.includes('green')) {
    ledColor = 0x22c55e;
    emissiveColor = 0x15803d;
  } else if (name.includes('blue')) {
    ledColor = 0x3b82f6;
    emissiveColor = 0x1d4ed8;
  } else if (name.includes('yellow') || name.includes('amber')) {
    ledColor = 0xeab308;
    emissiveColor = 0xa16207;
  }

  // 1. Translucent Tinted Epoxy Dome
  const domeGeo = new THREE.SphereGeometry(0.32, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  const cylGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.5, 16);
  const collarGeo = new THREE.CylinderGeometry(0.36, 0.36, 0.08, 16);

  const ledMat = new THREE.MeshStandardMaterial({
    color: ledColor,
    emissive: emissiveColor,
    emissiveIntensity: 0.85,
    roughness: 0.15,
    metalness: 0.1,
    transparent: true,
    opacity: 0.88
  });

  const dome = new THREE.Mesh(domeGeo, ledMat);
  dome.position.y = 0.55;
  const cyl = new THREE.Mesh(cylGeo, ledMat);
  cyl.position.y = 0.3;
  const collar = new THREE.Mesh(collarGeo, ledMat);
  collar.position.y = 0.06;

  group.add(dome, cyl, collar);

  // 2. Internal Reflector Cup & Anvil / Post
  const cupGeo = new THREE.ConeGeometry(0.12, 0.18, 8);
  const cupMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.9 });
  const cup = new THREE.Mesh(cupGeo, cupMat);
  cup.rotation.x = Math.PI;
  cup.position.y = 0.35;
  group.add(cup);

  // 3. Dual Metal Leads
  const pin1 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.45, 0.06), metalPinMat);
  pin1.position.set(-0.12, -0.15, 0);
  const pin2 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.55, 0.06), metalPinMat); // Anode is longer
  pin2.position.set(0.12, -0.2, 0);
  group.add(pin1, pin2);

  return group;
}

/**
 * Builds an Electrolytic or Ceramic Capacitor
 */
export function buildCapacitor(comp: CIRComponent): THREE.Group {
  const group = new THREE.Group();
  const isCeramic = comp.displayName.toLowerCase().includes('ceramic') || 
    (comp.parameters?.value && String(comp.parameters.value).includes('nF'));

  if (isCeramic) {
    // Ceramic Disc (Tan/Orange disc)
    const discGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.12, 16);
    const discMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.6 });
    const disc = new THREE.Mesh(discGeo, discMat);
    disc.rotation.z = Math.PI / 2;
    disc.position.y = 0.42;
    disc.castShadow = true;
    group.add(disc);

    // Leads
    const p1 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.4, 0.05), metalPinMat);
    p1.position.set(-0.12, 0.1, 0);
    const p2 = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.4, 0.05), metalPinMat);
    p2.position.set(0.12, 0.1, 0);
    group.add(p1, p2);
  } else {
    // Radial Electrolytic Can (Blue cylinder with white negative polarity stripe)
    const canGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.95, 20);
    const canMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.35, metalness: 0.2 });
    const can = new THREE.Mesh(canGeo, canMat);
    can.position.y = 0.52;
    can.castShadow = true;
    group.add(can);

    // Negative Stripe
    const stripeGeo = new THREE.CylinderGeometry(0.385, 0.385, 0.95, 8, 1, false, -0.3, 0.6);
    const stripeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.5 });
    const stripe = new THREE.Mesh(stripeGeo, stripeMat);
    stripe.position.y = 0.52;
    group.add(stripe);

    // Silver Top Vent Score Cross
    const topGeo = new THREE.CircleGeometry(0.36, 16);
    const topMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.3 });
    const topMesh = new THREE.Mesh(topGeo, topMat);
    topMesh.rotation.x = -Math.PI / 2;
    topMesh.position.y = 1.0;
    group.add(topMesh);

    // Leads
    const p1 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.4, 0.06), metalPinMat);
    p1.position.set(-0.16, 0.08, 0);
    const p2 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.4, 0.06), metalPinMat);
    p2.position.set(0.16, 0.08, 0);
    group.add(p1, p2);
  }

  return group;
}

/**
 * Builds a Microcontroller (ESP32-WROOM / Arduino Uno)
 */
export function buildMicrocontroller(comp: CIRComponent): THREE.Group {
  const group = new THREE.Group();
  const isArduino = comp.displayName.toLowerCase().includes('arduino') || comp.partNumber.toLowerCase().includes('uno');

  const pcbW = isArduino ? 5.2 : 4.6;
  const pcbD = isArduino ? 3.6 : 2.5;

  // 1. PCB Base
  const pcbGeo = new THREE.BoxGeometry(pcbW, 0.22, pcbD);
  const pcbMat = new THREE.MeshStandardMaterial({
    color: isArduino ? 0x0284c7 : 0x0f172a, // Arduino Blue or ESP32 Black/Teal
    roughness: 0.35,
    metalness: 0.1
  });
  const pcb = new THREE.Mesh(pcbGeo, pcbMat);
  pcb.position.y = 0.22;
  pcb.castShadow = true;
  group.add(pcb);

  // 2. Metal RF Shield Can (ESP32) or DIP/SMD ATmega (Arduino)
  if (!isArduino) {
    // Brushed Metal RF Can
    const canGeo = new THREE.BoxGeometry(2.1, 0.22, 1.8);
    const canMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, metalness: 0.85, roughness: 0.2 });
    const can = new THREE.Mesh(canGeo, canMat);
    can.position.set(-0.85, 0.36, 0);
    can.castShadow = true;
    group.add(can);

    // ESP32 PCB Trace Antenna (Gold serpentine line)
    const antGeo = new THREE.BoxGeometry(0.9, 0.06, 1.8);
    const antMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.3 });
    const ant = new THREE.Mesh(antGeo, antMat);
    ant.position.set(-2.0, 0.32, 0);
    group.add(ant);
  } else {
    // ATmega328P DIP socket
    const mcuGeo = new THREE.BoxGeometry(2.6, 0.28, 0.8);
    const mcuMesh = new THREE.Mesh(mcuGeo, epoxyBlackMat);
    mcuMesh.position.set(0.4, 0.38, 0.4);
    group.add(mcuMesh);
  }

  // 3. USB Type-C or Micro-USB Connector (Metal Jack)
  const usbGeo = new THREE.BoxGeometry(0.85, 0.35, 0.75);
  const usbMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.9, roughness: 0.2 });
  const usb = new THREE.Mesh(usbGeo, usbMat);
  usb.position.set(pcbW / 2 - 0.3, 0.38, 0);
  usb.castShadow = true;
  group.add(usb);

  // 4. Header Pin Strips along both edges (bending down to breadboard)
  const pinStripGeo = new THREE.BoxGeometry(pcbW * 0.92, 0.42, 0.2);
  const stripMat = new THREE.MeshStandardMaterial({ color: 0x09090b });

  const topStrip = new THREE.Mesh(pinStripGeo, stripMat);
  topStrip.position.set(0, 0.05, -pcbD / 2 + 0.15);
  const botStrip = new THREE.Mesh(pinStripGeo, stripMat);
  botStrip.position.set(0, 0.05, pcbD / 2 - 0.15);
  group.add(topStrip, botStrip);

  return group;
}

/**
 * Builds an Ultrasonic Sensor (HC-SR04)
 */
export function buildUltrasonic(comp: CIRComponent): THREE.Group {
  const group = new THREE.Group();

  // 1. Blue PCB Plate
  const pcbGeo = new THREE.BoxGeometry(4.2, 0.22, 2.0);
  const pcbMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.35 });
  const pcb = new THREE.Mesh(pcbGeo, pcbMat);
  pcb.position.y = 0.45;
  pcb.castShadow = true;
  group.add(pcb);

  // 2. Dual Aluminum Ultrasonic Transducers (Transmitter & Receiver)
  const barrelGeo = new THREE.CylinderGeometry(0.65, 0.65, 1.1, 24);
  const barrelMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.85, roughness: 0.2 });

  const meshCapGeo = new THREE.CircleGeometry(0.62, 16);
  const meshCapMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.7 });

  [-1.2, 1.2].forEach((bx) => {
    const barrel = new THREE.Mesh(barrelGeo, barrelMat);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.set(bx, 0.75, 0.4);
    barrel.castShadow = true;

    const meshCap = new THREE.Mesh(meshCapGeo, meshCapMat);
    meshCap.position.set(bx, 0.75, 0.96);
    group.add(barrel, meshCap);
  });

  // 3. Quartz Crystal Oscillator
  const crystalGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.6, 12);
  const crystal = new THREE.Mesh(crystalGeo, metalPinMat);
  crystal.rotation.z = Math.PI / 2;
  crystal.position.set(0, 0.6, -0.4);
  group.add(crystal);

  return group;
}

/**
 * Builds a Micro-Servo (SG90)
 */
export function buildServo(comp: CIRComponent): THREE.Group {
  const group = new THREE.Group();

  // Translucent Blue Polycarbonate Body
  const bodyGeo = new THREE.BoxGeometry(1.8, 2.1, 1.1);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x0284c7,
    roughness: 0.25,
    metalness: 0.1,
    transparent: true,
    opacity: 0.88
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 1.05;
  body.castShadow = true;
  group.add(body);

  // Output Gear Tower & White Servo Horn
  const towerGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.6, 16);
  const tower = new THREE.Mesh(towerGeo, bodyMat);
  tower.position.set(0.42, 2.2, 0);
  group.add(tower);

  const hornGeo = new THREE.BoxGeometry(1.4, 0.12, 0.35);
  const hornMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 });
  const horn = new THREE.Mesh(hornGeo, hornMat);
  horn.position.set(0.7, 2.5, 0);
  horn.castShadow = true;
  group.add(horn);

  return group;
}

/**
 * Builds a Tactile Push Button Switch
 */
export function buildPushButton(comp: CIRComponent): THREE.Group {
  const group = new THREE.Group();

  // Base Housing
  const baseGeo = new THREE.BoxGeometry(0.9, 0.35, 0.9);
  const base = new THREE.Mesh(baseGeo, epoxyBlackMat);
  base.position.y = 0.2;
  group.add(base);

  // Metal Cover Plate
  const plateGeo = new THREE.BoxGeometry(0.92, 0.05, 0.92);
  const plate = new THREE.Mesh(plateGeo, silverTabMat);
  plate.position.y = 0.38;
  group.add(plate);

  // Round Button Plunger
  const btnGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.35, 16);
  const btnMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.3 }); // Red button
  const btn = new THREE.Mesh(btnGeo, btnMat);
  btn.position.y = 0.52;
  group.add(btn);

  // 4 Breadboard Leg Pins
  [-0.32, 0.32].forEach(x => {
    [-0.32, 0.32].forEach(z => {
      const pin = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.35, 0.06), metalPinMat);
      pin.position.set(x, 0.02, z);
      group.add(pin);
    });
  });

  return group;
}

/**
 * Builds a Potentiometer (Rotary Dial)
 */
export function buildPotentiometer(comp: CIRComponent): THREE.Group {
  const group = new THREE.Group();

  // Cylindrical Metal Body
  const bodyGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.6, 20);
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.3 });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.35;
  group.add(body);

  // Rotary Shaft
  const shaftGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.7, 16);
  const shaft = new THREE.Mesh(shaftGeo, silverTabMat);
  shaft.position.y = 0.85;
  group.add(shaft);

  // Blue Control Knob
  const knobGeo = new THREE.CylinderGeometry(0.38, 0.42, 0.55, 20);
  const knobMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 });
  const knob = new THREE.Mesh(knobGeo, knobMat);
  knob.position.y = 1.25;
  knob.castShadow = true;
  group.add(knob);

  // 3 Terminal Pins
  [-0.35, 0, 0.35].forEach(x => {
    const pin = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.4, 0.06), metalPinMat);
    pin.position.set(x, 0.05, 0.5);
    group.add(pin);
  });

  return group;
}

/**
 * Dispatcher: Builds the best, highest-fidelity 3D model for any CIRComponent
 */
export function buildComponentModel(comp: CIRComponent): THREE.Group {
  const footprint = comp.physical?.footprint3D?.toLowerCase() || '';
  const cat = comp.category?.toLowerCase() || '';
  const name = comp.displayName?.toLowerCase() || '';
  const part = comp.partNumber?.toLowerCase() || '';

  // 1. TO-220 Transistors / Power MOSFETs
  if (
    footprint.includes('to220') || 
    name.includes('mosfet') || 
    part.includes('irlz44') || 
    part.includes('irf') || 
    part.includes('tip') ||
    cat === 'semiconductor' && (name.includes('transistor') || name.includes('mosfet'))
  ) {
    return buildTO220(comp);
  }

  // 2. DIP ICs (555, Op-Amps, Logic ICs)
  if (
    footprint.includes('dip') || 
    cat === 'ic' || 
    name.includes('555') || 
    name.includes('timer') || 
    name.includes('op-amp') || 
    part.includes('lm') || 
    part.includes('74hc')
  ) {
    return buildDIP(comp);
  }

  // 3. Resistors
  if (
    footprint.includes('resistor') || 
    name.includes('resistor') || 
    (cat === 'passive' && !name.includes('capacitor') && !name.includes('inductor'))
  ) {
    return buildResistor(comp);
  }

  // 4. Diodes
  if (
    footprint.includes('diode') || 
    name.includes('diode') || 
    part.includes('1n400') || 
    part.includes('1n4148')
  ) {
    return buildDiode(comp);
  }

  // 5. LEDs
  if (
    footprint.includes('led') || 
    name.includes('led')
  ) {
    return buildLED(comp);
  }

  // 6. Capacitors
  if (
    footprint.includes('cap') || 
    name.includes('capacitor')
  ) {
    return buildCapacitor(comp);
  }

  // 7. Microcontrollers & Dev Boards
  if (
    cat === 'microcontroller' || 
    name.includes('esp32') || 
    name.includes('arduino') || 
    name.includes('raspberry') || 
    name.includes('pico')
  ) {
    return buildMicrocontroller(comp);
  }

  // 8. Ultrasonic Sensor
  if (
    footprint.includes('ultrasonic') || 
    name.includes('ultrasonic') || 
    part.includes('hcsr04') || 
    part.includes('hc-sr04')
  ) {
    return buildUltrasonic(comp);
  }

  // 9. Servo Motors
  if (
    footprint.includes('servo') || 
    name.includes('servo') || 
    part.includes('sg90')
  ) {
    return buildServo(comp);
  }

  // 10. Push Buttons
  if (
    name.includes('button') || 
    name.includes('switch') || 
    footprint.includes('button')
  ) {
    return buildPushButton(comp);
  }

  // 11. Potentiometers
  if (
    name.includes('potentiometer') || 
    name.includes('pot') || 
    footprint.includes('pot')
  ) {
    return buildPotentiometer(comp);
  }

  // 12. Fallback: Detailed Generic Enclosed Module
  const genericGroup = new THREE.Group();
  const boxGeo = new THREE.BoxGeometry(1.2, 0.45, 0.8);
  const boxMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.4,
    metalness: 0.2
  });
  const box = new THREE.Mesh(boxGeo, boxMat);
  box.position.y = 0.25;
  box.castShadow = true;
  genericGroup.add(box);

  // Metal Pins
  [-0.35, 0.35].forEach(x => {
    const pin = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.35, 0.06), metalPinMat);
    pin.position.set(x, 0.05, 0);
    genericGroup.add(pin);
  });

  return genericGroup;
}
