/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  ChallengeDefinition,
  CircuitComponent,
  CircuitData,
  CustomGateDefinition,
  GateType,
  LogicState,
  SimulationState,
  TimingSample,
  Wire,
  ThemePreset,
  WireRoutingMode,
} from '../types/circuit';
import {
  createComponent,
  generateComponentPorts,
  getNextAlphabetLabel,
} from '../engine/componentFactory';
import { CHALLENGES } from '../engine/challenges';
import { getPresetCircuits, PresetCircuit } from '../engine/presets';
import { simulateCircuit } from '../engine/simulation';
import { autoArrangeCircuit } from '../engine/layout';
import { parseBooleanExpression, synthesizeCircuitFromAST } from '../engine/booleanParser';
import { THEME_PRESETS, getCounterpartTheme, getThemeMode } from '../theme/themes';
import { soundEngine } from '../engine/soundEngine';
import { hapticsEngine } from '../engine/haptics';

export type ActiveModalType =
  | 'none'
  | 'tutorial'
  | 'truthTable'
  | 'boolean'
  | 'kmap'
  | 'analyzer'
  | 'customGate'
  | 'presets'
  | 'learn'
  | 'challenges'
  | 'oscilloscope'
  | 'shortcuts'
  | 'savedCircuits'
  | 'settings'
  | 'collaborate'
  | 'about';

interface SelectionState {
  componentIds: string[];
  wireIds: string[];
}

interface CircuitContextType {
  // State
  components: CircuitComponent[];
  wires: Wire[];
  customGates: CustomGateDefinition[];
  selection: SelectionState;
  camera: { x: number; y: number; zoom: number };
  simulationRunning: boolean;
  simulationSpeedHz: number;
  simulationState: SimulationState;
  activeTool: 'select' | 'pan' | 'wire' | 'delete';
  wireDraft: {
    fromCompId: string;
    fromPortId: string;
    startPos: { x: number; y: number };
    currentX: number;
    currentY: number;
    branchStartPos?: { x: number; y: number };
    branchFromWireId?: string;
  } | null;
  wireRoutingMode: WireRoutingMode;
  theme: ThemePreset;
  colorMode: 'dark' | 'light';
  signalAnimation: boolean;
  snapToGrid: boolean;
  gridSize: number;
  timingHistory: TimingSample[];
  activeModal: ActiveModalType;
  activeChallenge: ChallengeDefinition | null;
  canUndo: boolean;
  canRedo: boolean;
  circuitName: string;
  sidebarOpen: boolean;
  inspectorOpen: boolean;
  soundEnabled: boolean;
  soundVolume: number;
  hapticsEnabled: boolean;
  isHapticsAvailable: boolean;

  // Actions
  setCamera: React.Dispatch<React.SetStateAction<{ x: number; y: number; zoom: number }>>;
  setSidebarOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  setInspectorOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  toggleSidebar: () => void;
  toggleInspector: () => void;
  setSoundEnabled: (enabled: boolean) => void;
  setSoundVolume: (volume: number) => void;
  setHapticsEnabled: (enabled: boolean) => void;
  playTestSound: () => void;
  setActiveTool: (tool: 'select' | 'pan' | 'wire' | 'delete') => void;
  setActiveModal: (modal: ActiveModalType) => void;
  setWireRoutingMode: (mode: WireRoutingMode) => void;
  setTheme: (theme: ThemePreset) => void;
  setColorMode: (mode: 'dark' | 'light') => void;
  toggleColorMode: () => void;
  setSignalAnimation: (enabled: boolean) => void;
  setSnapToGrid: (snap: boolean) => void;
  setSimulationSpeedHz: (hz: number) => void;
  setCircuitName: (name: string) => void;

  addComponent: (type: GateType, x: number, y: number, options?: any) => CircuitComponent;
  updateComponent: (id: string, partial: Partial<CircuitComponent>, withHistory?: boolean) => void;
  updateWire: (id: string, partial: Partial<Wire>, withHistory?: boolean) => void;
  updateWires: (ids: string[], partial: Partial<Wire>, withHistory?: boolean) => void;
  setComponentInputCount: (id: string, count: number) => void;
  deleteSelection: () => void;
  duplicateSelection: () => void;
  rotateSelection: () => void;
  flipSelection: () => void;
  lockSelection: () => void;
  selectComponent: (id: string, append?: boolean) => void;
  selectWire: (id: string, append?: boolean) => void;
  selectAllWires: () => void;
  deleteSelectedWires: () => void;
  clearSelection: () => void;
  setBoxSelection: (compIds: string[], wireIds: string[]) => void;

  startWireDraft: (
    compId: string,
    portId: string,
    startPos: { x: number; y: number },
    options?: { branchStartPos?: { x: number; y: number }; branchFromWireId?: string }
  ) => void;
  updateWireDraft: (x: number, y: number) => void;
  completeWireDraft: (targetCompId: string, targetPortId: string) => void;
  cancelWireDraft: () => void;
  removeWire: (id: string) => void;

  toggleSwitch: (compId: string) => void;
  pressButton: (compId: string, pressed: boolean) => void;
  triggerPulse: (compId: string) => void;
  applyInputValues: (variableValues: Record<string, 0 | 1>) => void;

  stepSimulation: () => void;
  toggleSimulation: (running?: boolean) => void;
  resetSimulation: () => void;

  undo: () => void;
  redo: () => void;
  recordHistorySnapshot: (customComps?: CircuitComponent[], customWires?: Wire[]) => void;
  copy: () => void;
  paste: () => void;

  createCustomGateFromSelection: (name: string, description: string, color?: string) => CustomGateDefinition | null;
  loadPreset: (preset: PresetCircuit) => void;
  loadChallenge: (challenge: ChallengeDefinition) => void;
  clearCanvas: () => void;
  autoArrange: () => void;
  fitToScreen: () => void;
  exportJson: () => string;
  importJson: (jsonStr: string) => boolean;
  synthesizeAndLoadExpression: (
    expr: string,
    mode?: 'replace' | 'insert',
    synthesisMode?: 'direct' | 'optimized_xor' | 'universal_nand' | 'universal_nor'
  ) => { success: boolean; error?: string };
  loadCircuitData: (components: CircuitComponent[], wires: Wire[], name?: string) => void;
  syncRemoteCircuitData: (components: CircuitComponent[], wires: Wire[], name?: string) => void;
}

const CircuitContext = createContext<CircuitContextType | null>(null);

const STORAGE_KEY = 'digilogic_circuit_autosave_v1';
const CUSTOM_GATES_KEY = 'digilogic_custom_gates_v1';
const THEME_STORAGE_KEY = 'digilogic_theme_v1';
const ROUTING_STORAGE_KEY = 'digilogic_routing_mode_v1';

function getInitialCircuitData(): {
  components: CircuitComponent[];
  wires: Wire[];
  customGates: CustomGateDefinition[];
  circuitName: string;
  camera: { x: number; y: number; zoom: number };
} {
  try {
    const savedGates = localStorage.getItem(CUSTOM_GATES_KEY);
    const customGates = savedGates ? JSON.parse(savedGates) : [];

    const savedCircuit = localStorage.getItem(STORAGE_KEY);
    if (savedCircuit) {
      const data: CircuitData = JSON.parse(savedCircuit);
      if (data.components && data.components.length > 0) {
        return {
          components: data.components,
          wires: data.wires || [],
          customGates: data.customGates || customGates,
          circuitName: data.name || 'My Circuit',
          camera: data.camera || { x: 0, y: 0, zoom: 1 },
        };
      }
    }
    const defaultPreset = getPresetCircuits()[1];
    return {
      components: defaultPreset.components,
      wires: defaultPreset.wires,
      customGates,
      circuitName: defaultPreset.name,
      camera: { x: 0, y: 0, zoom: 1 },
    };
  } catch (_) {
    const defaultPreset = getPresetCircuits()[1];
    return {
      components: defaultPreset.components,
      wires: defaultPreset.wires,
      customGates: [],
      circuitName: defaultPreset.name,
      camera: { x: 0, y: 0, zoom: 1 },
    };
  }
}

export const CircuitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialData = useMemo(() => getInitialCircuitData(), []);

  // Primary State
  const [components, setComponents] = useState<CircuitComponent[]>(() => initialData.components);
  const [wires, setWires] = useState<Wire[]>(() => initialData.wires);
  const [customGates, setCustomGates] = useState<CustomGateDefinition[]>(() => initialData.customGates);
  const [circuitName, setCircuitName] = useState<string>(() => initialData.circuitName);
  const [selection, setSelection] = useState<SelectionState>({ componentIds: [], wireIds: [] });
  const [clipboard, setClipboard] = useState<{ components: CircuitComponent[]; wires: Wire[] } | null>(null);

  // Synchronized state references for stable callbacks
  const componentsRef = useRef(components);
  componentsRef.current = components;
  const wiresRef = useRef(wires);
  wiresRef.current = wires;
  const customGatesRef = useRef(customGates);
  customGatesRef.current = customGates;
  const circuitNameRef = useRef(circuitName);
  circuitNameRef.current = circuitName;
  const selectionRef = useRef(selection);
  selectionRef.current = selection;
  const clipboardRef = useRef(clipboard);
  clipboardRef.current = clipboard;
  const cameraRef = useRef({ x: 0, y: 0, zoom: 1 });

  // Undo/Redo History
  const [history, setHistory] = useState<{
    past: Array<{ components: CircuitComponent[]; wires: Wire[] }>;
    future: Array<{ components: CircuitComponent[]; wires: Wire[] }>;
  }>({ past: [], future: [] });
  const historyRef = useRef(history);
  historyRef.current = history;

  // Viewport & UI state
  const [camera, setCamera] = useState(() => initialData.camera);
  cameraRef.current = camera;
  const [activeTool, setActiveTool] = useState<'select' | 'pan' | 'wire' | 'delete'>('select');
  const [wireRoutingMode, setWireRoutingModeState] = useState<WireRoutingMode>(() => {
    try {
      const saved = localStorage.getItem(ROUTING_STORAGE_KEY);
      if (saved === 'orthogonal' || saved === 'curved' || saved === 'straight') {
        return saved;
      }
    } catch (_) {}
    return 'orthogonal';
  });

  const setWireRoutingMode = useCallback((mode: WireRoutingMode) => {
    setWireRoutingModeState(mode);
    try {
      localStorage.setItem(ROUTING_STORAGE_KEY, mode);
    } catch (_) {}
  }, []);

  // Theme & Color mode state (defaults to KITT Sovereign Gold)
  const COLOR_MODE_STORAGE_KEY = 'digilogic_color_mode_v2';

  const [colorMode, setColorModeState] = useState<'dark' | 'light'>('dark');
  const [theme, setThemeState] = useState<ThemePreset>('kitt_sovereign');

  const setTheme = useCallback((newTheme: ThemePreset) => {
    setThemeState(newTheme);
    const newMode = getThemeMode(newTheme);
    setColorModeState(newMode);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      localStorage.setItem(COLOR_MODE_STORAGE_KEY, newMode);
      document.documentElement.setAttribute('data-theme', newTheme);
      document.documentElement.setAttribute('data-color-mode', newMode);
    } catch (_) {}
  }, []);

  const setColorMode = useCallback((mode: 'dark' | 'light') => {
    setColorModeState(mode);
    try {
      localStorage.setItem(COLOR_MODE_STORAGE_KEY, mode);
      document.documentElement.setAttribute('data-color-mode', mode);
    } catch (_) {}
    setThemeState((prevTheme) => {
      const targetTheme = getCounterpartTheme(prevTheme, mode);
      try {
        localStorage.setItem(THEME_STORAGE_KEY, targetTheme);
        document.documentElement.setAttribute('data-theme', targetTheme);
      } catch (_) {}
      return targetTheme;
    });
  }, []);

  const toggleColorMode = useCallback(() => {
    setColorMode(colorMode === 'dark' ? 'light' : 'dark');
  }, [colorMode, setColorMode]);

  // Apply theme and color mode to document element
  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', theme);
      document.documentElement.setAttribute('data-color-mode', colorMode);
    } catch (_) {}
  }, [theme, colorMode]);

  const [signalAnimation, setSignalAnimation] = useState<boolean>(true);
  const [snapToGrid, setSnapToGrid] = useState<boolean>(true);
  const gridSize = 20;

  // Wire Drafting State
  const [wireDraft, setWireDraft] = useState<{
    fromCompId: string;
    fromPortId: string;
    startPos: { x: number; y: number };
    currentX: number;
    currentY: number;
    branchStartPos?: { x: number; y: number };
    branchFromWireId?: string;
  } | null>(null);

  // Simulation Engine State
  const [simulationRunning, setSimulationRunning] = useState<boolean>(true);
  const [simulationSpeedHz, setSimulationSpeedHz] = useState<number>(10);
  const [stepCounter, setStepCounter] = useState<number>(0);
  const simulationStateRef = useRef<SimulationState>({
    portValues: {},
    wireValues: {},
    componentStates: {},
    simulationStep: 0,
    hasErrors: false,
    errorMessages: [],
    loopDetected: false,
  });

  const [timingHistory, setTimingHistory] = useState<TimingSample[]>([]);
  const [activeModal, setActiveModal] = useState<ActiveModalType>('none');
  const [activeChallenge, setActiveChallenge] = useState<ChallengeDefinition | null>(null);

  // Responsive Drawer/Panel State (Auto-collapse on tablets/mobile)
  const isDesktop = typeof window !== 'undefined' ? window.innerWidth >= 1024 : true;
  const isLargeDesktop = typeof window !== 'undefined' ? window.innerWidth >= 1280 : true;
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(isDesktop);
  const [inspectorOpen, setInspectorOpen] = useState<boolean>(isLargeDesktop);

  const toggleSidebar = useCallback(() => setSidebarOpen((prev) => !prev), []);
  const toggleInspector = useCallback(() => setInspectorOpen((prev) => !prev), []);

  // Sound FX and Haptics State
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(() => soundEngine.isEnabled());
  const [soundVolume, setSoundVolumeState] = useState<number>(() => soundEngine.getVolume());
  const [hapticsEnabled, setHapticsEnabledState] = useState<boolean>(() => hapticsEngine.isEnabled());
  const isHapticsAvailable = hapticsEngine.isAvailable();

  const setSoundEnabled = useCallback((enabled: boolean) => {
    setSoundEnabledState(enabled);
    soundEngine.setEnabled(enabled);
  }, []);

  const setSoundVolume = useCallback((vol: number) => {
    setSoundVolumeState(vol);
    soundEngine.setVolume(vol);
  }, []);

  const setHapticsEnabled = useCallback((enabled: boolean) => {
    setHapticsEnabledState(enabled);
    hapticsEngine.setEnabled(enabled);
  }, []);

  const playTestSound = useCallback(() => {
    soundEngine.playWireSnap();
    hapticsEngine.medium();
  }, []);

  // Custom Gate Defs Map helper
  const customGateMap = useMemo(() => {
    const map = new Map<string, CustomGateDefinition>();
    customGates.forEach((g) => map.set(g.id, g));
    return map;
  }, [customGates]);

  // Record History State for Undo/Redo (Max 50 steps deep-cloned via native structuredClone)
  const recordHistory = useCallback(
    (newComps: CircuitComponent[], newWires: Wire[]) => {
      try {
        const clonedComps = typeof structuredClone === 'function' ? structuredClone(newComps) : JSON.parse(JSON.stringify(newComps));
        const clonedWires = typeof structuredClone === 'function' ? structuredClone(newWires) : JSON.parse(JSON.stringify(newWires));
        setHistory((prev) => ({
          past: [...prev.past.slice(-50), { components: clonedComps, wires: clonedWires }],
          future: [],
        }));
      } catch {
        const clonedComps = JSON.parse(JSON.stringify(newComps));
        const clonedWires = JSON.parse(JSON.stringify(newWires));
        setHistory((prev) => ({
          past: [...prev.past.slice(-50), { components: clonedComps, wires: clonedWires }],
          future: [],
        }));
      }
    },
    []
  );

  const recordHistorySnapshot = useCallback(
    (customComps?: CircuitComponent[], customWires?: Wire[]) => {
      try {
        const targetComps = customComps ?? componentsRef.current;
        const targetWires = customWires ?? wiresRef.current;
        const snapshotComps = typeof structuredClone === 'function' ? structuredClone(targetComps) : JSON.parse(JSON.stringify(targetComps));
        const snapshotWires = typeof structuredClone === 'function' ? structuredClone(targetWires) : JSON.parse(JSON.stringify(targetWires));
        setHistory((prev) => ({
          past: [...prev.past.slice(-50), { components: snapshotComps, wires: snapshotWires }],
          future: [],
        }));
      } catch {
        const snapshotComps = JSON.parse(JSON.stringify(customComps ?? componentsRef.current));
        const snapshotWires = JSON.parse(JSON.stringify(customWires ?? wiresRef.current));
        setHistory((prev) => ({
          past: [...prev.past.slice(-50), { components: snapshotComps, wires: snapshotWires }],
          future: [],
        }));
      }
    },
    []
  );

  // Auto-open tutorial on first-ever visit
  useEffect(() => {
    try {
      const tutorialSeen = localStorage.getItem('digilogic_tutorial_seen');
      if (!tutorialSeen) {
        const timer = setTimeout(() => {
          setActiveModal('tutorial');
        }, 500);
        return () => clearTimeout(timer);
      }
    } catch {
      // ignore
    }
  }, []);

  // Autosave locally on state changes
  useEffect(() => {
    if (components.length === 0) return;
    const timeout = setTimeout(() => {
      try {
        const data: CircuitData = {
          version: '1.0.0',
          name: circuitName,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          components,
          wires,
          customGates,
          camera,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        localStorage.setItem(CUSTOM_GATES_KEY, JSON.stringify(customGates));
      } catch (err) {
        console.warn('Autosave failed:', err);
      }
    }, 800);
    return () => clearTimeout(timeout);
  }, [components, wires, customGates, circuitName, camera]);

  // Synchronous pure simulation state derived via useMemo (zero lagging re-render cascading)
  const simulationState = useMemo<SimulationState>(() => {
    const nextSim = simulateCircuit(
      components,
      wires,
      customGateMap,
      simulationStateRef.current.componentStates,
      30,
      !simulationRunning
    );
    simulationStateRef.current = nextSim;
    return nextSim;
  }, [components, wires, customGateMap, simulationRunning, stepCounter]);

  // Sample timing history safely without triggering reactive cascading loops
  const sampleTimingSnapshot = useCallback(() => {
    const comps = componentsRef.current;
    const sim = simulationStateRef.current;
    const probeSamples: Record<string, LogicState> = {};
    let hasMonitored = false;
    comps.forEach((c) => {
      if (['PROBE', 'LED', 'CLOCK', 'SWITCH', 'BUTTON', 'PULSE'].includes(c.type)) {
        hasMonitored = true;
        const val = sim.portValues[c.id]?.['out'] ?? sim.portValues[c.id]?.['in_0'] ?? 0;
        probeSamples[c.label || c.name || c.id] = val;
      }
    });
    if (hasMonitored) {
      setTimingHistory((prev) => {
        const now = Date.now();
        return [...prev.slice(-100), { timestamp: now, signals: probeSamples }];
      });
    }
  }, []);

  // 2. Simulation Tick Cycle for CLOCK and RANDOM components (decoupled from reactive state churn)
  useEffect(() => {
    if (!simulationRunning) return;

    let animationFrameId: number;
    let lastTickTime = performance.now();

    const loop = (currentTime: number) => {
      const elapsed = currentTime - lastTickTime;
      const interval = 1000 / simulationSpeedHz;

      if (elapsed >= interval) {
        lastTickTime = currentTime;

        // Check if there are active oscillating components using stable ref
        const currentComps = componentsRef.current;
        const hasOscillating = currentComps.some(
          (c) => c.type === 'CLOCK' || c.type === 'RANDOM'
        );

        if (hasOscillating) {
          setComponents((prevComps) => {
            let changed = false;
            const next = prevComps.map((c) => {
              if (c.type === 'CLOCK') {
                changed = true;
                const curState = c.internalState?.clockState ?? false;
                return {
                  ...c,
                  internalState: {
                    ...c.internalState,
                    clockState: !curState,
                  },
                };
              }
              if (c.type === 'RANDOM') {
                changed = true;
                return {
                  ...c,
                  internalState: {
                    ...c.internalState,
                    value: Math.random() > 0.5 ? 1 : 0,
                  },
                };
              }
              return c;
            });
            return changed ? next : prevComps;
          });
        }

        // Sample timing waveform at steady simulation tick rate
        sampleTimingSnapshot();
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [simulationRunning, simulationSpeedHz, sampleTimingSnapshot]);

  // User Actions Implementation
  const addComponent = useCallback(
    (type: GateType, x: number, y: number, options: any = {}) => {
      const snapX = snapToGrid ? Math.round(x / gridSize) * gridSize : x;
      const snapY = snapToGrid ? Math.round(y / gridSize) * gridSize : y;

      let customDef: CustomGateDefinition | undefined;
      if (type === 'CUSTOM_IC' && options.customGateId) {
        customDef = customGates.find((g) => g.id === options.customGateId);
      }

      // Dynamic sequential naming for inputs and assets: A, B, ... Z, AA, BB...
      let dynamicLabel = options.label;
      let dynamicName = options.name;

      if (!dynamicLabel) {
        if (type === 'SWITCH' || type === 'BUTTON') {
          const letter = getNextAlphabetLabel(components);
          dynamicLabel = letter;
          if (!dynamicName || dynamicName === 'Toggle Switch' || dynamicName === 'Push Button') {
            dynamicName = type === 'SWITCH' ? `Switch ${letter}` : `Button ${letter}`;
          }
        } else if (type === 'CLOCK') {
          const count = components.filter((c) => c.type === 'CLOCK').length + 1;
          dynamicLabel = count === 1 ? 'CLK' : `CLK ${count}`;
          if (!dynamicName) dynamicName = `Clock ${count}`;
        } else if (type === 'CONST_1') {
          dynamicLabel = 'VCC';
          if (!dynamicName) dynamicName = 'VCC';
        } else if (type === 'CONST_0') {
          dynamicLabel = 'GND';
          if (!dynamicName) dynamicName = 'GND';
        } else if (type === 'PULSE') {
          const count = components.filter((c) => c.type === 'PULSE').length + 1;
          dynamicLabel = `PLS ${count}`;
          if (!dynamicName) dynamicName = `Pulse ${count}`;
        } else if (type === 'RANDOM') {
          const count = components.filter((c) => c.type === 'RANDOM').length + 1;
          dynamicLabel = `RND ${count}`;
          if (!dynamicName) dynamicName = `Random ${count}`;
        } else if (type === 'LED') {
          const count = components.filter((c) => c.type === 'LED').length + 1;
          dynamicLabel = count === 1 ? 'Y' : `Y${count}`;
          if (!dynamicName) dynamicName = `LED ${count}`;
        } else if (type === 'PROBE') {
          const count = components.filter((c) => c.type === 'PROBE').length + 1;
          dynamicLabel = count === 1 ? 'Y' : `Y${count}`;
          if (!dynamicName) dynamicName = `Probe ${count}`;
        }
      }

      const newComp = createComponent(type, snapX, snapY, {
        ...options,
        name: dynamicName,
        label: dynamicLabel,
        customDef,
      });

      recordHistory(components, wires);
      setComponents((prev) => [...prev, newComp]);
      setSelection({ componentIds: [newComp.id], wireIds: [] });
      soundEngine.playGatePlace();
      hapticsEngine.light();
      return newComp;
    },
    [snapToGrid, gridSize, customGates, components, wires, recordHistory]
  );

  const updateComponent = useCallback(
    (id: string, partial: Partial<CircuitComponent>, withHistory: boolean = false) => {
      if (withHistory) {
        recordHistory(components, wires);
      }
      setComponents((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...partial } : c))
      );
    },
    [components, wires, recordHistory]
  );

  const updateWire = useCallback(
    (id: string, partial: Partial<Wire>, withHistory: boolean = false) => {
      if (withHistory) {
        recordHistory(components, wires);
      }
      setWires((prev) =>
        prev.map((w) => (w.id === id ? { ...w, ...partial } : w))
      );
    },
    [components, wires, recordHistory]
  );

  const updateWires = useCallback(
    (ids: string[], partial: Partial<Wire>, withHistory: boolean = false) => {
      if (withHistory) {
        recordHistory(components, wires);
      }
      setWires((prev) =>
        prev.map((w) => (ids.includes(w.id) ? { ...w, ...partial } : w))
      );
    },
    [components, wires, recordHistory]
  );

  const setComponentInputCount = useCallback(
    (id: string, count: number) => {
      recordHistory(components, wires);
      setComponents((prev) =>
        prev.map((c) => {
          if (c.id === id) {
            const newPorts = generateComponentPorts(c.type, count, undefined);
            return {
              ...c,
              inputCount: count,
              ports: newPorts,
            };
          }
          return c;
        })
      );
      // Clean up orphaned wires connecting to removed ports
      setWires((prev) =>
        prev.filter((w) => {
          if (w.toComponentId === id) {
            const portIdx = parseInt(w.toPortId.replace('in_', ''), 10);
            return isNaN(portIdx) || portIdx < count;
          }
          return true;
        })
      );
      soundEngine.playButton(true);
      hapticsEngine.selection();
    },
    [components, wires, recordHistory]
  );

  const deleteSelection = useCallback(() => {
    if (selection.componentIds.length === 0 && selection.wireIds.length === 0) return;

    recordHistory(components, wires);
    const delCompSet = new Set(selection.componentIds);
    const delWireSet = new Set(selection.wireIds);

    // Also delete any wire connected to a deleted component
    setComponents((prev) => prev.filter((c) => !delCompSet.has(c.id)));
    setWires((prev) =>
      prev.filter(
        (w) =>
          !delWireSet.has(w.id) &&
          !delCompSet.has(w.fromComponentId) &&
          !delCompSet.has(w.toComponentId)
      )
    );
    setSelection({ componentIds: [], wireIds: [] });
    soundEngine.playDelete();
    hapticsEngine.heavy();
  }, [selection, components, wires, recordHistory]);

  const duplicateSelection = useCallback(() => {
    if (selection.componentIds.length === 0) return;
    recordHistory(components, wires);

    const idMap = new Map<string, string>();
    const newComps: CircuitComponent[] = [];

    selection.componentIds.forEach((compId) => {
      const orig = components.find((c) => c.id === compId);
      if (orig) {
        const cloned = createComponent(orig.type, orig.x + 40, orig.y + 40, {
          inputCount: orig.inputCount,
          customGateId: orig.customGateId,
          name: orig.name,
          label: orig.label,
          rotation: orig.rotation,
        });
        newComps.push(cloned);
        idMap.set(orig.id, cloned.id);
      }
    });

    // Also duplicate internal interconnected wires
    const newWires: Wire[] = [];
    wires.forEach((w) => {
      if (idMap.has(w.fromComponentId) && idMap.has(w.toComponentId)) {
        newWires.push({
          id: `wire_${Date.now()}_${Math.random()}`,
          fromComponentId: idMap.get(w.fromComponentId)!,
          fromPortId: w.fromPortId,
          toComponentId: idMap.get(w.toComponentId)!,
          toPortId: w.toPortId,
          color: w.color,
        });
      }
    });

    setComponents((prev) => [...prev, ...newComps]);
    setWires((prev) => [...prev, ...newWires]);
    setSelection({ componentIds: newComps.map((c) => c.id), wireIds: newWires.map((w) => w.id) });
    soundEngine.playGatePlace();
    hapticsEngine.light();
  }, [selection, components, wires, recordHistory]);

  const rotateSelection = useCallback(() => {
    if (selection.componentIds.length === 0) return;
    recordHistory(components, wires);
    setComponents((prev) =>
      prev.map((c) => {
        if (selection.componentIds.includes(c.id)) {
          return { ...c, rotation: (c.rotation + 90) % 360 };
        }
        return c;
      })
    );
    soundEngine.playButton(true);
    hapticsEngine.selection();
  }, [selection, components, wires, recordHistory]);

  const flipSelection = useCallback(() => {
    if (selection.componentIds.length === 0) return;
    recordHistory(components, wires);
    setComponents((prev) =>
      prev.map((c) => {
        if (selection.componentIds.includes(c.id)) {
          return { ...c, flipped: !c.flipped };
        }
        return c;
      })
    );
    soundEngine.playButton(false);
    hapticsEngine.selection();
  }, [selection, components, wires, recordHistory]);

  const lockSelection = useCallback(() => {
    if (selection.componentIds.length === 0) return;
    setComponents((prev) =>
      prev.map((c) => {
        if (selection.componentIds.includes(c.id)) {
          return { ...c, locked: !c.locked };
        }
        return c;
      })
    );
  }, [selection]);

  const selectComponent = useCallback((id: string, append: boolean = false) => {
    setSelection((prev) => ({
      componentIds: append
        ? prev.componentIds.includes(id)
          ? prev.componentIds.filter((cid) => cid !== id)
          : [...prev.componentIds, id]
        : [id],
      wireIds: append ? prev.wireIds : [],
    }));
  }, []);

  const selectWire = useCallback((id: string, append: boolean = false) => {
    setSelection((prev) => ({
      componentIds: append ? prev.componentIds : [],
      wireIds: append
        ? prev.wireIds.includes(id)
          ? prev.wireIds.filter((wid) => wid !== id)
          : [...prev.wireIds, id]
        : [id],
    }));
  }, []);

  const selectAllWires = useCallback(() => {
    setSelection((prev) => ({
      ...prev,
      wireIds: wires.map((w) => w.id),
    }));
  }, [wires]);

  const deleteSelectedWires = useCallback(() => {
    if (selection.wireIds.length === 0) return;
    recordHistory(components, wires);
    const delSet = new Set(selection.wireIds);
    setWires((prev) => prev.filter((w) => !delSet.has(w.id)));
    setSelection((prev) => ({ ...prev, wireIds: [] }));
  }, [selection.wireIds, components, wires, recordHistory]);

  const clearSelection = useCallback(() => {
    setSelection({ componentIds: [], wireIds: [] });
  }, []);

  const setBoxSelection = useCallback((compIds: string[], wireIds: string[]) => {
    setSelection({ componentIds: compIds, wireIds });
  }, []);

  // Wire Connections - Strictly Enforced Output -> Input One-Way Wiring for Zero Error Rate
  const startWireDraft = useCallback(
    (
      compId: string,
      portId: string,
      startPos: { x: number; y: number },
      options?: { branchStartPos?: { x: number; y: number }; branchFromWireId?: string }
    ) => {
      const comp = components.find((c) => c.id === compId);
      const port = comp?.ports.find((p) => p.id === portId);

      // Enforce: Wiring can ONLY start from an OUTPUT port
      if (port && port.type !== 'output') {
        return;
      }

      setWireDraft({
        fromCompId: compId,
        fromPortId: portId,
        startPos,
        currentX: startPos.x,
        currentY: startPos.y,
        branchStartPos: options?.branchStartPos,
        branchFromWireId: options?.branchFromWireId,
      });
    },
    [components]
  );

  const updateWireDraft = useCallback((x: number, y: number) => {
    setWireDraft((prev) => (prev ? { ...prev, currentX: x, currentY: y } : null));
  }, []);

  const completeWireDraft = useCallback(
    (targetCompId: string, targetPortId: string) => {
      if (!wireDraft) return;
      if (wireDraft.fromCompId === targetCompId) {
        setWireDraft(null);
        return; // Prevent self-loop on same component
      }

      const fromComp = components.find((c) => c.id === wireDraft.fromCompId);
      const targetComp = components.find((c) => c.id === targetCompId);
      if (!fromComp || !targetComp) {
        setWireDraft(null);
        return;
      }

      const fromPort = fromComp.ports.find((p) => p.id === wireDraft.fromPortId);
      const targetPort = targetComp.ports.find((p) => p.id === targetPortId);

      // Strict Validation: From MUST be OUTPUT, Target MUST be INPUT
      if (fromPort?.type !== 'output' || targetPort?.type !== 'input') {
        setWireDraft(null);
        return;
      }

      const sourceCompId = wireDraft.fromCompId;
      const sourcePortId = wireDraft.fromPortId;
      const destCompId = targetCompId;
      const destPortId = targetPortId;

      // Check if this exact wire already exists
      const existing = wires.find(
        (w) =>
          w.fromComponentId === sourceCompId &&
          w.fromPortId === sourcePortId &&
          w.toComponentId === destCompId &&
          w.toPortId === destPortId
      );

      if (!existing) {
        recordHistory(components, wires);
        const newWire: Wire = {
          id: `wire_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          fromComponentId: sourceCompId,
          fromPortId: sourcePortId,
          toComponentId: destCompId,
          toPortId: destPortId,
          branchStartPos: wireDraft.branchStartPos ? { ...wireDraft.branchStartPos } : undefined,
          branchFromWireId: wireDraft.branchFromWireId,
        };
        setWires((prev) => [...prev, newWire]);
        soundEngine.playWireSnap();
        hapticsEngine.medium();
      }
      setWireDraft(null);
    },
    [wireDraft, wires, components, recordHistory]
  );

  const cancelWireDraft = useCallback(() => {
    setWireDraft(null);
  }, []);

  const removeWire = useCallback(
    (id: string) => {
      recordHistory(components, wires);
      setWires((prev) => prev.filter((w) => w.id !== id));
      setSelection((prev) => ({
        ...prev,
        wireIds: prev.wireIds.filter((wid) => wid !== id),
      }));
      soundEngine.playWireCut();
      hapticsEngine.light();
    },
    [components, wires, recordHistory]
  );

  // Interactive Inputs with Automatic Synchronization for Matching Named Inputs & Assets
  const toggleSwitch = useCallback((compId: string) => {
    setComponents((prev) => {
      const target = prev.find((c) => c.id === compId);
      if (!target) return prev;
      const targetTag = (target.label?.trim() || (target.name && !target.name.match(/^[A-Z0-9_-]+_[0-9]+$/i) ? target.name.trim() : '')).toLowerCase();
      const cur = target.internalState?.value ?? 0;
      const nextVal = cur === 1 ? 0 : 1;

      soundEngine.playSwitch(nextVal === 1);
      hapticsEngine.light();

      return prev.map((c) => {
        const cTag = (c.label?.trim() || (c.name && !c.name.match(/^[A-Z0-9_-]+_[0-9]+$/i) ? c.name.trim() : '')).toLowerCase();
        // Sync this component and all inputs/assets sharing the exact same custom name
        if (c.id === compId || (targetTag && cTag === targetTag && ['SWITCH', 'BUTTON', 'CONST_1', 'CONST_0', 'CLOCK', 'PULSE', 'RANDOM'].includes(c.type))) {
          return {
            ...c,
            internalState: {
              ...c.internalState,
              value: nextVal,
            },
          };
        }
        return c;
      });
    });
  }, []);

  const pressButton = useCallback((compId: string, pressed: boolean) => {
    soundEngine.playButton(pressed);
    hapticsEngine.light();

    setComponents((prev) => {
      const target = prev.find((c) => c.id === compId);
      if (!target) return prev;
      const targetTag = (target.label?.trim() || (target.name && !target.name.match(/^[A-Z0-9_-]+_[0-9]+$/i) ? target.name.trim() : '')).toLowerCase();

      return prev.map((c) => {
        const cTag = (c.label?.trim() || (c.name && !c.name.match(/^[A-Z0-9_-]+_[0-9]+$/i) ? c.name.trim() : '')).toLowerCase();
        if (c.id === compId || (targetTag && cTag === targetTag && ['BUTTON', 'SWITCH'].includes(c.type))) {
          return {
            ...c,
            internalState: {
              ...c.internalState,
              pressed,
              value: pressed ? 1 : 0,
            },
          };
        }
        return c;
      });
    });
  }, []);

  const triggerPulse = useCallback((compId: string) => {
    soundEngine.playButton(true);
    hapticsEngine.light();

    setComponents((prev) => {
      const target = prev.find((c) => c.id === compId);
      if (!target) return prev;
      const targetTag = (target.label?.trim() || (target.name && !target.name.match(/^[A-Z0-9_-]+_[0-9]+$/i) ? target.name.trim() : '')).toLowerCase();

      return prev.map((c) => {
        const cTag = (c.label?.trim() || (c.name && !c.name.match(/^[A-Z0-9_-]+_[0-9]+$/i) ? c.name.trim() : '')).toLowerCase();
        if (c.id === compId || (targetTag && cTag === targetTag && c.type === 'PULSE')) {
          return {
            ...c,
            internalState: {
              ...c.internalState,
              pulseActive: true,
            },
          };
        }
        return c;
      });
    });
    setTimeout(() => {
      setComponents((prev) => {
        const target = prev.find((c) => c.id === compId);
        const targetTag = target ? (target.label?.trim() || (target.name && !target.name.match(/^[A-Z0-9_-]+_[0-9]+$/i) ? target.name.trim() : '')).toLowerCase() : '';

        return prev.map((c) => {
          const cTag = (c.label?.trim() || (c.name && !c.name.match(/^[A-Z0-9_-]+_[0-9]+$/i) ? c.name.trim() : '')).toLowerCase();
          if (c.id === compId || (targetTag && cTag === targetTag && c.type === 'PULSE')) {
            return {
              ...c,
              internalState: {
                ...c.internalState,
                pulseActive: false,
              },
            };
          }
          return c;
        });
      });
    }, 150);
  }, []);

  const applyInputValues = useCallback((variableValues: Record<string, 0 | 1>) => {
    setComponents((prev) => {
      return prev.map((c) => {
        const customTag = (c.label?.trim() || (c.name && !c.name.match(/^[A-Z0-9_-]+_[0-9]+$/i) ? c.name.trim() : '')).toLowerCase();
        
        for (const [vName, vVal] of Object.entries(variableValues)) {
          const targetKey = vName.trim().toLowerCase();
          const matchesLabel = c.label?.trim().toLowerCase() === targetKey;
          const matchesName = c.name?.trim().toLowerCase() === targetKey;
          const matchesTag = customTag === targetKey;

          if (matchesLabel || matchesName || matchesTag) {
            return {
              ...c,
              internalState: {
                ...c.internalState,
                value: vVal,
                pressed: vVal === 1,
              },
            };
          }
        }
        return c;
      });
    });
  }, []);

  // Simulation Controls
  const stepSimulation = useCallback(() => {
    soundEngine.playClockStep();
    hapticsEngine.light();
    setStepCounter((c) => c + 1);
  }, []);

  const toggleSimulation = useCallback((running?: boolean) => {
    setSimulationRunning((prev) => {
      const nextRunning = running !== undefined ? running : !prev;
      soundEngine.playSimToggle(nextRunning);
      hapticsEngine.light();
      return nextRunning;
    });
  }, []);

  const resetSimulation = useCallback(() => {
    soundEngine.playDelete();
    hapticsEngine.medium();
    simulationStateRef.current = {
      portValues: {},
      wireValues: {},
      componentStates: {},
      simulationStep: 0,
      hasErrors: false,
      errorMessages: [],
      loopDetected: false,
    };
    setComponents((prev) =>
      prev.map((c) => {
        if (c.internalState) {
          return {
            ...c,
            internalState: {
              ...c.internalState,
              value: 0,
              clockState: false,
            },
          };
        }
        return c;
      })
    );
    setTimingHistory([]);
    setStepCounter((c) => c + 1);
  }, []);

  // Undo / Redo
  const undo = useCallback(() => {
    const curHistory = historyRef.current;
    if (curHistory.past.length === 0) return;
    const previous = curHistory.past[curHistory.past.length - 1];
    const newPast = curHistory.past.slice(0, -1);

    const currentCompsCloned = JSON.parse(JSON.stringify(componentsRef.current));
    const currentWiresCloned = JSON.parse(JSON.stringify(wiresRef.current));

    setHistory({
      past: newPast,
      future: [{ components: currentCompsCloned, wires: currentWiresCloned }, ...curHistory.future],
    });

    setComponents(JSON.parse(JSON.stringify(previous.components)));
    setWires(JSON.parse(JSON.stringify(previous.wires)));
    setSelection({ componentIds: [], wireIds: [] });
    soundEngine.playUndo();
    hapticsEngine.selection();
  }, []);

  const redo = useCallback(() => {
    const curHistory = historyRef.current;
    if (curHistory.future.length === 0) return;
    const next = curHistory.future[0];
    const newFuture = curHistory.future.slice(1);

    const currentCompsCloned = JSON.parse(JSON.stringify(componentsRef.current));
    const currentWiresCloned = JSON.parse(JSON.stringify(wiresRef.current));

    setHistory({
      past: [...curHistory.past, { components: currentCompsCloned, wires: currentWiresCloned }],
      future: newFuture,
    });

    setComponents(JSON.parse(JSON.stringify(next.components)));
    setWires(JSON.parse(JSON.stringify(next.wires)));
    setSelection({ componentIds: [], wireIds: [] });
    soundEngine.playRedo();
    hapticsEngine.selection();
  }, []);

  // Copy / Paste
  const copy = useCallback(() => {
    const sel = selectionRef.current;
    if (sel.componentIds.length === 0) return;
    const selComps = componentsRef.current.filter((c) => sel.componentIds.includes(c.id));
    const selWires = wiresRef.current.filter(
      (w) =>
        sel.componentIds.includes(w.fromComponentId) &&
        sel.componentIds.includes(w.toComponentId)
    );
    setClipboard({ components: selComps, wires: selWires });
  }, []);

  const paste = useCallback(() => {
    const clip = clipboardRef.current;
    if (!clip || clip.components.length === 0) return;
    recordHistory(componentsRef.current, wiresRef.current);

    const idMap = new Map<string, string>();
    const newComps: CircuitComponent[] = [];

    clip.components.forEach((orig) => {
      const cloned = createComponent(orig.type, orig.x + 50, orig.y + 50, {
        inputCount: orig.inputCount,
        customGateId: orig.customGateId,
        name: orig.name,
        label: orig.label,
        rotation: orig.rotation,
      });
      newComps.push(cloned);
      idMap.set(orig.id, cloned.id);
    });

    const newWires: Wire[] = [];
    clip.wires.forEach((w) => {
      if (idMap.has(w.fromComponentId) && idMap.has(w.toComponentId)) {
        newWires.push({
          id: `wire_${Date.now()}_${Math.random()}`,
          fromComponentId: idMap.get(w.fromComponentId)!,
          fromPortId: w.fromPortId,
          toComponentId: idMap.get(w.toComponentId)!,
          toPortId: w.toPortId,
        });
      }
    });

    setComponents((prev) => [...prev, ...newComps]);
    setWires((prev) => [...prev, ...newWires]);
    setSelection({ componentIds: newComps.map((c) => c.id), wireIds: newWires.map((w) => w.id) });
  }, [recordHistory]);

  // Custom IC Subcircuit Creation
  const createCustomGateFromSelection = useCallback(
    (name: string, description: string, color?: string): CustomGateDefinition | null => {
      const sel = selectionRef.current;
      if (sel.componentIds.length === 0) return null;

      const selComps = componentsRef.current.filter((c) => sel.componentIds.includes(c.id));
      const selWires = wiresRef.current.filter(
        (w) =>
          sel.componentIds.includes(w.fromComponentId) &&
          sel.componentIds.includes(w.toComponentId)
      );

      // Find input components (switches/buttons) and output components (probes/leds)
      const inputNodes = selComps.filter((c) =>
        ['SWITCH', 'BUTTON', 'CONST_0', 'CONST_1'].includes(c.type)
      );
      const outputNodes = selComps.filter((c) => ['LED', 'PROBE'].includes(c.type));

      if (inputNodes.length === 0 || outputNodes.length === 0) {
        return null;
      }

      const customDef: CustomGateDefinition = {
        id: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name,
        category: 'CUSTOM',
        description: description || 'Custom Modular IC Subcircuit',
        color: color || '#407E8C',
        inputPorts: inputNodes.map((inp, idx) => ({
          id: `in_${idx}`,
          name: inp.label || inp.name || `In${idx}`,
        })),
        outputPorts: outputNodes.map((out, idx) => ({
          id: `out_${idx}`,
          name: out.label || out.name || `Out${idx}`,
        })),
        components: selComps,
        wires: selWires,
      };

      setCustomGates((prev) => [...prev, customDef]);
      return customDef;
    },
    []
  );

  const loadPreset = useCallback(
    (preset: PresetCircuit) => {
      recordHistory(componentsRef.current, wiresRef.current);
      setComponents(preset.components);
      setWires(preset.wires);
      setCircuitName(preset.name);
      setSelection({ componentIds: [], wireIds: [] });
      setCamera({ x: 0, y: 0, zoom: 1 });
      setActiveModal('none');
      soundEngine.playWireSnap();
      hapticsEngine.medium();
    },
    [recordHistory]
  );

  const loadChallenge = useCallback((challenge: ChallengeDefinition) => {
    setActiveChallenge(challenge);
    if (challenge.starterCircuit) {
      setComponents((challenge.starterCircuit.components as CircuitComponent[]) || []);
      setWires((challenge.starterCircuit.wires as Wire[]) || []);
    } else {
      setComponents([]);
      setWires([]);
    }
    setCircuitName(challenge.title);
    setSelection({ componentIds: [], wireIds: [] });
    setCamera({ x: 0, y: 0, zoom: 1 });
    setActiveModal('none');
    soundEngine.playButton(true);
    hapticsEngine.light();
  }, []);

  const clearCanvas = useCallback(() => {
    recordHistory(componentsRef.current, wiresRef.current);
    setComponents([]);
    setWires([]);
    setSelection({ componentIds: [], wireIds: [] });
    setCircuitName('New Circuit');
    soundEngine.playDelete();
    hapticsEngine.heavy();
  }, [recordHistory]);

  const autoArrange = useCallback(() => {
    recordHistory(componentsRef.current, wiresRef.current);
    const newComponents = autoArrangeCircuit(componentsRef.current, wiresRef.current, gridSize);
    setComponents(newComponents);
    soundEngine.playWireSnap();
    hapticsEngine.medium();
  }, [gridSize, recordHistory]);

  const fitToScreen = useCallback(() => {
    const curComps = componentsRef.current;
    if (curComps.length === 0) {
      setCamera({ x: 0, y: 0, zoom: 1 });
      return;
    }
    const minX = Math.min(...curComps.map((c) => c.x));
    const maxX = Math.max(...curComps.map((c) => c.x + 100));
    const minY = Math.min(...curComps.map((c) => c.y));
    const maxY = Math.max(...curComps.map((c) => c.y + 80));

    const width = maxX - minX;
    const height = maxY - minY;
    const targetZoom = Math.min(1.2, Math.max(0.6, 600 / Math.max(width, height)));

    setCamera({
      x: -minX + 80,
      y: -minY + 80,
      zoom: targetZoom,
    });
  }, []);

  const exportJson = useCallback((): string => {
    const data: CircuitData = {
      version: '1.0.0',
      name: circuitNameRef.current,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      components: componentsRef.current,
      wires: wiresRef.current,
      customGates: customGatesRef.current,
      camera: cameraRef.current,
    };
    return JSON.stringify(data, null, 2);
  }, []);

  const importJson = useCallback(
    (jsonStr: string): boolean => {
      try {
        let rawData = JSON.parse(jsonStr);
        let comps: CircuitComponent[] = [];
        let circuitWires: Wire[] = [];
        let loadedGates: CustomGateDefinition[] = [];
        let name: string = circuitNameRef.current;
        let loadedCamera = cameraRef.current;

        if (Array.isArray(rawData)) {
          comps = rawData;
        } else if (rawData && typeof rawData === 'object') {
          if (rawData.circuit && Array.isArray(rawData.circuit.components)) {
            rawData = rawData.circuit;
          }
          if (Array.isArray(rawData.components)) {
            comps = rawData.components;
            circuitWires = Array.isArray(rawData.wires) ? rawData.wires : [];
            if (Array.isArray(rawData.customGates)) loadedGates = rawData.customGates;
            if (rawData.name && typeof rawData.name === 'string') name = rawData.name;
            if (rawData.camera && typeof rawData.camera.x === 'number') loadedCamera = rawData.camera;
          }
        }

        if (comps.length > 0 || circuitWires.length > 0) {
          recordHistory(componentsRef.current, wiresRef.current);
          // Ensure every component has valid port definitions and positions
          const sanitizedComps = comps.map((c) => {
            if (!c.ports || c.ports.length === 0) {
              const generatedPorts = generateComponentPorts(c.type, c.inputCount || 2, undefined);
              return { ...c, ports: generatedPorts };
            }
            return c;
          });

          setComponents(sanitizedComps);
          setWires(circuitWires);
          if (loadedGates.length > 0) setCustomGates(loadedGates);
          if (name) setCircuitName(name);

          // If camera was provided, use it; otherwise compute bounding center
          if (rawData.camera) {
            setCamera(loadedCamera);
          } else if (sanitizedComps.length > 0) {
            const minX = Math.min(...sanitizedComps.map((c) => c.x));
            const maxX = Math.max(...sanitizedComps.map((c) => c.x + 100));
            const minY = Math.min(...sanitizedComps.map((c) => c.y));
            const maxY = Math.max(...sanitizedComps.map((c) => c.y + 60));
            const cX = (minX + maxX) / 2;
            const cY = (minY + maxY) / 2;
            setCamera({
              x: (typeof window !== 'undefined' ? window.innerWidth : 1200) / 2 - cX,
              y: (typeof window !== 'undefined' ? window.innerHeight : 800) / 2 - cY,
              zoom: 1,
            });
          }

          setSelection({ componentIds: [], wireIds: [] });
          return true;
        }
      } catch (err) {
        console.error('Failed to parse circuit JSON:', err);
      }
      return false;
    },
    [recordHistory]
  );

  const loadCircuitData = useCallback(
    (newComps: CircuitComponent[], newWires: Wire[], name?: string) => {
      recordHistory(componentsRef.current, wiresRef.current);
      const sanitizedComps = newComps.map((c) => {
        if (!c.ports || c.ports.length === 0) {
          const generatedPorts = generateComponentPorts(c.type, c.inputCount || 2, undefined);
          return { ...c, ports: generatedPorts };
        }
        return c;
      });

      setComponents(sanitizedComps);
      setWires(newWires);
      if (name) setCircuitName(name);
      setSelection({ componentIds: [], wireIds: [] });

      // Automatically frame / fit camera to circuit
      if (sanitizedComps.length > 0) {
        const minX = Math.min(...sanitizedComps.map((c) => c.x));
        const maxX = Math.max(...sanitizedComps.map((c) => c.x + 100));
        const minY = Math.min(...sanitizedComps.map((c) => c.y));
        const maxY = Math.max(...sanitizedComps.map((c) => c.y + 60));
        const cX = (minX + maxX) / 2;
        const cY = (minY + maxY) / 2;
        const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
        const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
        setCamera({
          x: vw / 2 - cX,
          y: vh / 2 - cY,
          zoom: 1,
        });
      }
    },
    [recordHistory]
  );

  // Seamless remote sync (preserves local camera and selection without adding to undo history)
  const syncRemoteCircuitData = useCallback(
    (newComps: CircuitComponent[], newWires: Wire[], name?: string) => {
      const sanitizedComps = newComps.map((c) => {
        if (!c.ports || c.ports.length === 0) {
          const generatedPorts = generateComponentPorts(c.type, c.inputCount || 2, undefined);
          return { ...c, ports: generatedPorts };
        }
        return c;
      });

      setComponents(sanitizedComps);
      setWires(newWires || []);
      if (name) setCircuitName(name);
    },
    []
  );

  const synthesizeAndLoadExpression = useCallback(
    (
      expr: string,
      mode: 'replace' | 'insert' = 'replace',
      synthesisMode: 'direct' | 'optimized_xor' | 'universal_nand' | 'universal_nor' = 'direct'
    ): { success: boolean; error?: string } => {
      try {
        const ast = parseBooleanExpression(expr);
        const startX =
          mode === 'insert' && components.length > 0
            ? Math.max(...components.map((c) => c.x)) + 200
            : 100;
        const startY = 100;
        const { components: synthComps, wires: synthWires } = synthesizeCircuitFromAST(
          ast,
          'Y',
          startX,
          startY,
          synthesisMode
        );

        if (mode === 'replace') {
          loadCircuitData(synthComps, synthWires, `Synthesized (${synthesisMode}): ${expr}`);
        } else {
          recordHistory(components, wires);
          setComponents((prev) => [...prev, ...synthComps]);
          setWires((prev) => [...prev, ...synthWires]);
        }
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || 'Failed to synthesize expression' };
      }
    },
    [components, wires, recordHistory, loadCircuitData]
  );

  return (
    <CircuitContext.Provider
      value={{
        components,
        wires,
        customGates,
        selection,
        camera,
        simulationRunning,
        simulationSpeedHz,
        simulationState,
        activeTool,
        wireDraft,
        wireRoutingMode,
        theme,
        colorMode,
        signalAnimation,
        snapToGrid,
        gridSize,
        timingHistory,
        activeModal,
        activeChallenge,
        canUndo: history.past.length > 0,
        canRedo: history.future.length > 0,
        circuitName,
        sidebarOpen,
        inspectorOpen,
        soundEnabled,
        soundVolume,
        hapticsEnabled,
        isHapticsAvailable,

        setCamera,
        setSidebarOpen,
        setInspectorOpen,
        toggleSidebar,
        toggleInspector,
        setSoundEnabled,
        setSoundVolume,
        setHapticsEnabled,
        playTestSound,
        setActiveTool,
        setActiveModal,
        setWireRoutingMode,
        setTheme,
        setColorMode,
        toggleColorMode,
        setSignalAnimation,
        setSnapToGrid,
        setSimulationSpeedHz,
        setCircuitName,

        addComponent,
        updateComponent,
        updateWire,
        updateWires,
        setComponentInputCount,
        deleteSelection,
        duplicateSelection,
        rotateSelection,
        flipSelection,
        lockSelection,
        selectComponent,
        selectWire,
        selectAllWires,
        deleteSelectedWires,
        clearSelection,
        setBoxSelection,

        startWireDraft,
        updateWireDraft,
        completeWireDraft,
        cancelWireDraft,
        removeWire,

        toggleSwitch,
        pressButton,
        triggerPulse,
        applyInputValues,

        stepSimulation,
        toggleSimulation,
        resetSimulation,

        undo,
        redo,
        recordHistorySnapshot,
        copy,
        paste,

        createCustomGateFromSelection,
        loadPreset,
        loadChallenge,
        clearCanvas,
        autoArrange,
        fitToScreen,
        exportJson,
        importJson,
        synthesizeAndLoadExpression,
        loadCircuitData,
        syncRemoteCircuitData,
      }}
    >
      {children}
    </CircuitContext.Provider>
  );
};

export const useCircuit = (): CircuitContextType => {
  const ctx = useContext(CircuitContext);
  if (!ctx) {
    throw new Error('useCircuit must be used within a CircuitProvider');
  }
  return ctx;
};
