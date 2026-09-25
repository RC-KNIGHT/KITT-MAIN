import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { CanonicalCircuitModel, CIRComponent } from '../cir/cirTypes';
import { createPhotorealisticLabEnvironment } from './photorealisticLabEnvironment';
import { createProceduralBreadboardTexture } from './breadboardTexture';
import { createEsdMatTexture } from './esdMatTexture';
import { buildComponentModel } from './componentModels';
import { buildBenchOscilloscope, buildBenchMultimeter, buildWireSpools } from './labEquipment';
import { 
  RotateCcw, 
  Layers, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Info
} from 'lucide-react';

export type BreadboardSize = 'mini' | 'medium' | 'large';

export interface HardwareLab3DRef {
  setCameraPreset: (preset: 'fit' | 'top' | '3d' | 'focus' | 'reset') => void;
}

interface HardwareLab3DProps {
  circuit: CanonicalCircuitModel;
  onSelectComponent?: (component: CIRComponent | null) => void;
  breadboardSize?: BreadboardSize;
  wireColor?: string;
  selectedComponentId?: string;
}

export const HardwareLab3D = forwardRef<HardwareLab3DRef, HardwareLab3DProps>(({
  circuit,
  onSelectComponent,
  breadboardSize = 'large',
  wireColor = '#10b981',
  selectedComponentId
}, ref) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [webGlSupported, setWebGlSupported] = useState<boolean>(true);
  const [explodedView, setExplodedView] = useState<boolean>(false);
  const [showWires, setShowWires] = useState<boolean>(true);

  // Three.js References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const boardGroupRef = useRef<THREE.Group | null>(null);
  const componentsGroupRef = useRef<THREE.Group | null>(null);
  const wiresGroupRef = useRef<THREE.Group | null>(null);

  // Orbit & Pan State
  const isDragging = useRef(false);
  const isRightDragging = useRef(false);
  const previousMouse = useRef({ x: 0, y: 0 });
  const cameraSpherical = useRef({ radius: 24, theta: Math.PI / 4, phi: Math.PI / 3 });
  const panOffset = useRef(new THREE.Vector3(0, 0, 0));

  // Raycaster for clicking 3D components
  const raycaster = useRef(new THREE.Raycaster());
  const mouseCoords = useRef(new THREE.Vector2());

  // Check WebGL support once
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
      setWebGlSupported(!!gl);
    } catch {
      setWebGlSupported(false);
    }
  }, []);

  const needsRenderRef = useRef(true);
  const triggerRender = () => {
    needsRenderRef.current = true;
  };

  // Update Camera from spherical coordinates & pan offset
  const updateCameraPosition = () => {
    if (!cameraRef.current) return;
    const { radius, theta, phi } = cameraSpherical.current;
    const x = radius * Math.sin(phi) * Math.sin(theta) + panOffset.current.x;
    const y = radius * Math.cos(phi) + panOffset.current.y;
    const z = radius * Math.sin(phi) * Math.cos(theta) + panOffset.current.z;
    cameraRef.current.position.set(x, y, z);
    cameraRef.current.lookAt(panOffset.current.x, panOffset.current.y, panOffset.current.z);
    triggerRender();
  };

  // Expose camera presets via ref
  useImperativeHandle(ref, () => ({
    setCameraPreset: (preset: 'fit' | 'top' | '3d' | 'focus' | 'reset') => {
      panOffset.current.set(0, 0, 0);
      if (preset === 'top') {
        cameraSpherical.current = { radius: 22, theta: 0, phi: 0.02 };
      } else if (preset === '3d') {
        cameraSpherical.current = { radius: 24, theta: Math.PI / 4, phi: Math.PI / 3 };
      } else if (preset === 'fit') {
        const rad = breadboardSize === 'large' ? 26 : breadboardSize === 'medium' ? 20 : 15;
        cameraSpherical.current = { radius: rad, theta: Math.PI / 4.2, phi: Math.PI / 3.2 };
      } else if (preset === 'focus') {
        cameraSpherical.current = { radius: 13, theta: Math.PI / 4, phi: Math.PI / 3.4 };
      } else if (preset === 'reset') {
        cameraSpherical.current = { radius: 24, theta: Math.PI / 4, phi: Math.PI / 3 };
      }
      updateCameraPosition();
    }
  }));

  // Setup Three.js Scene, Realistic Laboratory Lighting, and Desk
  useEffect(() => {
    if (!mountRef.current || !webGlSupported) return;

    const width = mountRef.current.clientWidth || 800;
    const height = mountRef.current.clientHeight || 600;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Photorealistic 360° Workshop Environment Map
    try {
      const envTexture = createPhotorealisticLabEnvironment();
      scene.background = envTexture;
      scene.environment = envTexture;
    } catch {
      scene.background = new THREE.Color(0x0a1117);
    }

    // 3. Perspective Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 120);
    cameraRef.current = camera;
    updateCameraPosition();

    // 4. Renderer with High Dynamic Range and Soft Shadows
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: false,
      powerPreference: 'high-performance' 
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.shadowMap.autoUpdate = true;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    rendererRef.current = renderer;

    // Clean container and attach canvas (guarantees no duplicate canvases!)
    mountRef.current.replaceChildren(renderer.domElement);

    // 5. Studio Three-Point Lighting Setup
    // A. Warm Studio Ambient Light
    const ambientLight = new THREE.AmbientLight(0xfff8ee, 0.95);
    scene.add(ambientLight);

    // B. Key Sun Directional Light (from panoramic window)
    const sunLight = new THREE.DirectionalLight(0xfffaed, 2.6);
    sunLight.position.set(16, 28, 18);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 1.0;
    sunLight.shadow.camera.far = 70;
    sunLight.shadow.camera.left = -22;
    sunLight.shadow.camera.right = 22;
    sunLight.shadow.camera.top = 18;
    sunLight.shadow.camera.bottom = -18;
    sunLight.shadow.bias = -0.0001;
    sunLight.shadow.radius = 2.0;
    scene.add(sunLight);

    // C. Cool Sky Fill Light (soft shadow fill)
    const skyFill = new THREE.PointLight(0xbae6fd, 1.4, 45);
    skyFill.position.set(-18, 14, -12);
    scene.add(skyFill);

    // D. Warm Desk Bounce Light (simulates light bouncing off hardwood)
    const bounceLight = new THREE.PointLight(0xfde68a, 0.8, 30);
    bounceLight.position.set(0, -2, 10);
    scene.add(bounceLight);

    // 6. Workbench Desk Surface (Rich Dark Hardwood Lab Bench)
    const deskGeo = new THREE.BoxGeometry(64, 1.2, 44);
    const deskMat = new THREE.MeshStandardMaterial({
      color: 0x1f1915,
      roughness: 0.55,
      metalness: 0.05
    });
    const desk = new THREE.Mesh(deskGeo, deskMat);
    desk.position.set(0, -0.65, 0);
    desk.receiveShadow = true;
    scene.add(desk);

    // Desk Edge Chamfer Bevel Trim
    const trimGeo = new THREE.BoxGeometry(64.4, 0.28, 44.4);
    const trimMat = new THREE.MeshStandardMaterial({ color: 0x120d09, roughness: 0.6 });
    const trim = new THREE.Mesh(trimGeo, trimMat);
    trim.position.set(0, -0.05, 0);
    scene.add(trim);

    // 7. Anti-Static ESD Workbench Prototyping Mat (placed on desk under breadboard)
    const esdMatTexture = createEsdMatTexture();
    const esdGeo = new THREE.BoxGeometry(38, 0.08, 20);
    const esdSideMat = new THREE.MeshStandardMaterial({ color: 0x0369a1, roughness: 0.5 });
    const esdTopMat = new THREE.MeshStandardMaterial({
      map: esdMatTexture,
      roughness: 0.35,
      metalness: 0.05
    });
    const esdMaterials = [esdSideMat, esdSideMat, esdTopMat, esdSideMat, esdSideMat, esdSideMat];
    const esdMatMesh = new THREE.Mesh(esdGeo, esdMaterials);
    esdMatMesh.position.set(0, 0.04, 0);
    esdMatMesh.receiveShadow = true;
    scene.add(esdMatMesh);

    // 8. Workbench Lab Instruments (Oscilloscope, Multimeter, Wire Spools)
    const osc = buildBenchOscilloscope();
    osc.position.set(-17, 0.08, -8);
    osc.rotation.y = Math.PI / 7;
    scene.add(osc);

    const dmm = buildBenchMultimeter();
    dmm.position.set(16, 0.08, -7);
    dmm.rotation.y = -Math.PI / 8;
    scene.add(dmm);

    const spools = buildWireSpools();
    spools.position.set(13, 0.08, 3.5);
    scene.add(spools);

    // 9. Solderless Breadboard Group
    const boardGroup = new THREE.Group();
    boardGroupRef.current = boardGroup;
    scene.add(boardGroup);

    // Dynamic Components and Wires groups
    const componentsGroup = new THREE.Group();
    componentsGroupRef.current = componentsGroup;
    scene.add(componentsGroup);

    const wiresGroup = new THREE.Group();
    wiresGroupRef.current = wiresGroup;
    scene.add(wiresGroup);

    // 10. Robust ResizeObserver (guarantees 100% synchronized canvas sizing)
    let animId: number;
    let framesToRender = 45; // settle initial scene

    const handleResize = () => {
      if (!mountRef.current || !renderer || !camera) return;
      const w = mountRef.current.clientWidth || 800;
      const h = mountRef.current.clientHeight || 600;
      if (w === 0 || h === 0) return;

      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      framesToRender = 15;
      triggerRender();
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(mountRef.current);

    // Animation Loop
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (needsRenderRef.current || framesToRender > 0) {
        if (framesToRender > 0) framesToRender--;
        needsRenderRef.current = false;
        renderer.render(scene, camera);
      }
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      if (mountRef.current && renderer.domElement) {
        mountRef.current.innerHTML = '';
      }
      renderer.dispose();
    };
  }, [webGlSupported]);

  // Re-build Breadboard Geometry & High-Resolution Procedural Sockets when breadboardSize changes
  useEffect(() => {
    if (!boardGroupRef.current) return;
    const group = boardGroupRef.current;

    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }

    let bWidth = 26;
    let bDepth = 7.6;

    if (breadboardSize === 'mini') {
      bWidth = 10;
      bDepth = 5.4;
    } else if (breadboardSize === 'medium') {
      bWidth = 16;
      bDepth = 7.6;
    } else {
      bWidth = 26;
      bDepth = 7.6;
    }

    // 1. High-Resolution Procedural Texture with 830 metallic sockets, numbering, and power rails
    const boardTexture = createProceduralBreadboardTexture(breadboardSize);

    const sideMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.35,
      metalness: 0.05
    });

    const topMat = new THREE.MeshStandardMaterial({
      map: boardTexture,
      roughness: 0.35,
      metalness: 0.08
    });

    // Multi-material cube: right, left, top (+Y), bottom, front, back
    const materials = [sideMat, sideMat, topMat, sideMat, sideMat, sideMat];

    const bodyGeo = new THREE.BoxGeometry(bWidth, 0.65, bDepth);
    const bodyMesh = new THREE.Mesh(bodyGeo, materials);
    bodyMesh.position.y = 0.4;
    bodyMesh.receiveShadow = true;
    bodyMesh.castShadow = true;
    group.add(bodyMesh);

    // 2. Realistic Side Dovetail Interlocking Tabs (to match real breadboards)
    const tabMat = sideMat;
    const numTabs = breadboardSize === 'mini' ? 2 : breadboardSize === 'medium' ? 3 : 5;
    const tabPitch = (bWidth * 0.7) / (numTabs - 1);
    const tabStartX = -(bWidth * 0.35);

    for (let t = 0; t < numTabs; t++) {
      const tx = tabStartX + t * tabPitch;
      // Right side male tab
      const maleTab = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.45, 0.4), tabMat);
      maleTab.position.set(tx, 0.4, bDepth / 2 + 0.15);
      maleTab.castShadow = true;
      group.add(maleTab);
    }

    // 3. Ground Pin 3D Reference Marker on Power Rail
    if (breadboardSize !== 'mini') {
      const pinGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.45, 8);
      const pinMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, metalness: 0.8 });
      const pin = new THREE.Mesh(pinGeo, pinMat);
      pin.position.set(-bWidth * 0.35, 0.85, 2.9);
      pin.castShadow = true;
      group.add(pin);
    }

    triggerRender();
  }, [breadboardSize]);

  // Re-populate 3D Components & Wires whenever CIR circuit changes
  useEffect(() => {
    if (!componentsGroupRef.current || !wiresGroupRef.current || !sceneRef.current) return;

    while (componentsGroupRef.current.children.length > 0) {
      componentsGroupRef.current.remove(componentsGroupRef.current.children[0]);
    }
    while (wiresGroupRef.current.children.length > 0) {
      wiresGroupRef.current.remove(wiresGroupRef.current.children[0]);
    }

    const yElevation = explodedView ? 2.6 : 0.72;
    const maxRow = breadboardSize === 'mini' ? 17 : breadboardSize === 'medium' ? 30 : 63;
    const xSpan = breadboardSize === 'mini' ? 4.2 : breadboardSize === 'medium' ? 6.8 : 11.2;

    const rowToX = (row: number = 1) => ((row - (maxRow / 2)) / (maxRow / 2)) * xSpan;
    const colToZ = (col: string = 'e') => {
      switch (col.toLowerCase()) {
        case 'a': return -2.2;
        case 'b': return -1.7;
        case 'c': return -1.2;
        case 'd': return -0.7;
        case 'e': return -0.2;
        case 'f': return 0.2;
        case 'g': return 0.7;
        case 'h': return 1.2;
        case 'i': return 1.7;
        case 'j': return 2.2;
        default: return 0;
      }
    };

    // 1. Render High-Fidelity 3D Components
    circuit.components.forEach(comp => {
      const compMeshGroup = new THREE.Group();
      const anchorRow = comp.physical?.anchorRow ?? 10;
      const anchorCol = comp.physical?.anchorCol ?? 'e';

      const x = rowToX(anchorRow);
      const z = colToZ(anchorCol);
      compMeshGroup.position.set(x, yElevation, z);

      // Build realistic 3D model using componentModels generator
      const model = buildComponentModel(comp);
      compMeshGroup.add(model);

      // Selection Halo if component is actively selected
      if (selectedComponentId && comp.id === selectedComponentId) {
        const ringGeo = new THREE.RingGeometry(0.8, 0.95, 24);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          side: THREE.DoubleSide
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.05;
        compMeshGroup.add(ring);
      }

      // Store component reference for interactive raycasting
      compMeshGroup.userData = { component: comp };

      componentsGroupRef.current?.add(compMeshGroup);
    });

    // 2. Render 3D Arched Jumper Wires
    if (showWires) {
      circuit.wires.forEach(w => {
        const fromComp = circuit.components.find(c => c.id === w.fromComponentId);
        const toComp = circuit.components.find(c => c.id === w.toComponentId);
        if (!fromComp || !toComp) return;

        const startX = rowToX(fromComp.physical?.anchorRow ?? 1);
        const startZ = colToZ(fromComp.physical?.anchorCol ?? 'e');
        const endX = rowToX(toComp.physical?.anchorRow ?? 1);
        const endZ = colToZ(toComp.physical?.anchorCol ?? 'e');

        const midX = (startX + endX) / 2;
        const midZ = (startZ + endZ) / 2;
        const dist = Math.hypot(endX - startX, endZ - startZ);
        const arcHeight = yElevation + 0.45 + Math.min(dist * 0.38, 3.4);

        const p1 = new THREE.Vector3(startX, yElevation + 0.1, startZ);
        const p2 = new THREE.Vector3(midX, arcHeight, midZ);
        const p3 = new THREE.Vector3(endX, yElevation + 0.1, endZ);

        const curve = new THREE.CatmullRomCurve3([p1, p2, p3]);
        const tubeGeo = new THREE.TubeGeometry(curve, 28, 0.08, 10, false);

        // Glossy PVC Jumper Wire Insulation
        const wireMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(w.color || wireColor || 0x10b981),
          roughness: 0.25,
          metalness: 0.1
        });

        const tubeMesh = new THREE.Mesh(tubeGeo, wireMat);
        tubeMesh.castShadow = true;
        wiresGroupRef.current?.add(tubeMesh);

        // Molded terminal boots on both ends
        const bootMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6 });
        const boot1 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.25, 8), bootMat);
        boot1.position.set(startX, yElevation + 0.12, startZ);
        const boot2 = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.25, 8), bootMat);
        boot2.position.set(endX, yElevation + 0.12, endZ);
        wiresGroupRef.current?.add(boot1, boot2);
      });
    }

    triggerRender();
  }, [circuit, explodedView, showWires, breadboardSize, wireColor, selectedComponentId]);

  // Raycasting for clicking components
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!mountRef.current || !cameraRef.current || !componentsGroupRef.current || !onSelectComponent) return;
    const rect = mountRef.current.getBoundingClientRect();
    mouseCoords.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseCoords.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.current.setFromCamera(mouseCoords.current, cameraRef.current);
    const intersects = raycaster.current.intersectObjects(componentsGroupRef.current.children, true);

    if (intersects.length > 0) {
      let current: THREE.Object3D | null = intersects[0].object;
      while (current && !current.userData?.component) {
        current = current.parent;
      }
      if (current && current.userData?.component) {
        onSelectComponent(current.userData.component);
      }
    }
  };

  // Mouse Drag Orbit & Pan Interactions
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 2) {
      isRightDragging.current = true;
    } else {
      isDragging.current = true;
    }
    previousMouse.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const deltaX = e.clientX - previousMouse.current.x;
    const deltaY = e.clientY - previousMouse.current.y;
    previousMouse.current = { x: e.clientX, y: e.clientY };

    if (isRightDragging.current) {
      panOffset.current.x -= deltaX * 0.02;
      panOffset.current.z += deltaY * 0.02;
      updateCameraPosition();
      return;
    }

    if (!isDragging.current) return;
    cameraSpherical.current.theta -= deltaX * 0.008;
    cameraSpherical.current.phi = Math.max(0.04, Math.min(Math.PI / 2.08, cameraSpherical.current.phi - deltaY * 0.008));
    updateCameraPosition();
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    isRightDragging.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    cameraSpherical.current.radius = Math.max(8, Math.min(48, cameraSpherical.current.radius + e.deltaY * 0.03));
    updateCameraPosition();
  };

  return (
    <div 
      className="relative w-full h-full bg-[#080f14] overflow-hidden select-none cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onClick={handleCanvasClick}
      onContextMenu={e => e.preventDefault()}
    >
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Graceful Fallback if WebGL is unsupported */}
      {!webGlSupported && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#080f14] text-center p-6">
          <Info className="w-8 h-8 text-[#A58D66] mb-2" />
          <h4 className="text-base font-bold text-[#E5E1DD]">WebGL Acceleration Unavailable</h4>
          <p className="text-xs text-[#94a3b8] max-w-md mt-1">
            Your browser does not have active WebGL hardware acceleration enabled. The 2D Schematic Lab remains 100% active and verified.
          </p>
        </div>
      )}

      {/* Top Left Status Badge */}
      <div className="absolute top-4 left-4 flex items-center gap-2 bg-[#0c161c]/85 border border-[#407E8C]/35 px-3 py-1.5 rounded-lg shadow-xl backdrop-blur-md pointer-events-none">
        <Sparkles className="w-3.5 h-3.5 text-[#A58D66] animate-pulse" />
        <span className="text-xs font-mono font-bold text-[#E5E1DD]">
          3D Hardware Lab • {breadboardSize.toUpperCase()} ({breadboardSize === 'mini' ? '170' : breadboardSize === 'medium' ? '400' : '830'} pts)
        </span>
      </div>

      {/* Top Right Quick Toggles */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <button
          onClick={() => setExplodedView(v => !v)}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer border ${
            explodedView ? 'bg-[#A58D66] text-[#080f14] font-bold border-[#A58D66]' : 'bg-[#0c161d]/85 text-slate-300 hover:bg-white/10 border-white/10'
          }`}
          title="Toggle Exploded Assembly"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{explodedView ? 'Joined' : 'Exploded'}</span>
        </button>

        <button
          onClick={() => setShowWires(w => !w)}
          className={`p-2 rounded-lg text-xs transition-colors cursor-pointer bg-[#0c161d]/85 border border-white/10 ${
            showWires ? 'text-[#76B4C2] hover:bg-[#407E8C]/20' : 'text-slate-500 hover:bg-white/10'
          }`}
          title={showWires ? 'Hide 3D Jumper Wires' : 'Show 3D Jumper Wires'}
        >
          {showWires ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
});

HardwareLab3D.displayName = 'HardwareLab3D';
