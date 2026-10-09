import { useState, useEffect } from 'react';
import { CanonicalCircuitModel } from '../cir/cirTypes';
import { safeLocalStorage } from '../../../utils/safeStorage';
import {
  createDefaultCanonicalCircuit,
  create555TimerFlasherCanonicalCircuit,
  createUltrasonicRadarCanonicalCircuit
} from '../cir/cirEngine';

export interface KittProject {
  id: string;
  name: string;
  description?: string;
  mode: 'schematic' | 'breadboard';
  createdAt: number;
  updatedAt: number;
  circuit: CanonicalCircuitModel;
  tags: string[];
  isTrashed?: boolean;
  trashedAt?: number;
  starred?: boolean;
}

export interface KittSettings {
  workspaceName: string;
  defaultMode: 'schematic' | 'breadboard';
  gridStyle: 'dots' | 'lines' | 'none';
  snapToGrid: boolean;
  autoSave: boolean;
  autoSaveIntervalSec: number;
  simStepMs: number;
  wireRouting: 'orthogonal' | 'direct';
  themeAccent: string;
  showComponentLabels: boolean;
  soundEffects: boolean;
  autoOpenCopilotOnDrcFailure: boolean;
}

const DEFAULT_SETTINGS: KittSettings = {
  workspaceName: 'KITT Sovereign Lab',
  defaultMode: 'schematic',
  gridStyle: 'dots',
  snapToGrid: true,
  autoSave: true,
  autoSaveIntervalSec: 15,
  simStepMs: 1.0,
  wireRouting: 'orthogonal',
  themeAccent: '#FFFFFF',
  showComponentLabels: true,
  soundEffects: false,
  autoOpenCopilotOnDrcFailure: true
};

const STORAGE_KEYS = {
  PROJECTS: 'kitt_ai_projects_v2',
  SETTINGS: 'kitt_ai_settings_v2',
  ACTIVE_PROJECT_ID: 'kitt_ai_active_project_id_v2'
};

function createInitialProjects(): KittProject[] {
  const now = Date.now();
  return [
    {
      id: 'proj-irrigation-01',
      name: 'Smart Plant Irrigation (ESP32)',
      description: 'Capacitive moisture telemetry with logic-level MOSFET switching a 5V submersible water pump.',
      mode: 'schematic',
      createdAt: now - 3600 * 1000 * 48,
      updatedAt: now - 3600 * 1000 * 2,
      circuit: createDefaultCanonicalCircuit(),
      tags: ['ESP32', 'IoT', 'Sensors'],
      starred: true
    },
    {
      id: 'proj-555-flasher-02',
      name: '555 Astable LED Pulse Generator',
      description: 'Dual LED alternating flasher oscillating at 1.5Hz with RC timing network.',
      mode: 'breadboard',
      createdAt: now - 3600 * 1000 * 72,
      updatedAt: now - 3600 * 1000 * 14,
      circuit: create555TimerFlasherCanonicalCircuit(),
      tags: ['Analog', '555 Timer', 'Oscillator'],
      starred: false
    },
    {
      id: 'proj-radar-03',
      name: '180° Sonar Obstacle Radar',
      description: 'Arduino Uno sequencing micro-servo and timing HC-SR04 sonar ultrasonic bursts.',
      mode: 'schematic',
      createdAt: now - 3600 * 1000 * 96,
      updatedAt: now - 3600 * 1000 * 24,
      circuit: createUltrasonicRadarCanonicalCircuit(),
      tags: ['Arduino', 'Sonar', 'Robotics'],
      starred: true
    }
  ];
}

class KittProjectStore {
  private projects: KittProject[] = [];
  private settings: KittSettings = DEFAULT_SETTINGS;
  private activeProjectId: string | null = null;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const storedProjects = safeLocalStorage.getItem(STORAGE_KEYS.PROJECTS);
      if (storedProjects) {
        const parsed = JSON.parse(storedProjects);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.projects = parsed;
        } else {
          this.projects = createInitialProjects();
          this.saveProjects();
        }
      } else {
        this.projects = createInitialProjects();
        this.saveProjects();
      }

      const storedSettings = safeLocalStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (storedSettings) {
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings) };
      }

      this.activeProjectId = safeLocalStorage.getItem(STORAGE_KEYS.ACTIVE_PROJECT_ID) || (this.projects[0]?.id || null);
    } catch {
      this.projects = createInitialProjects();
      this.settings = DEFAULT_SETTINGS;
      this.activeProjectId = this.projects[0]?.id || null;
    }
  }

  private saveProjects() {
    safeLocalStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(this.projects));
    this.notify();
  }

  private saveSettings() {
    safeLocalStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(fn => {
      try { fn(); } catch (err) { console.error('Error in KittProjectStore listener:', err); }
    });
  }

  public getAllProjects(): KittProject[] {
    return this.projects.filter(p => !p.isTrashed);
  }

  public getTrashedProjects(): KittProject[] {
    return this.projects.filter(p => p.isTrashed);
  }

  public getProject(id: string): KittProject | undefined {
    return this.projects.find(p => p.id === id);
  }

  public getActiveProjectId(): string | null {
    return this.activeProjectId;
  }

  public setActiveProjectId(id: string | null) {
    this.activeProjectId = id;
    if (id) safeLocalStorage.setItem(STORAGE_KEYS.ACTIVE_PROJECT_ID, id);
    else safeLocalStorage.removeItem(STORAGE_KEYS.ACTIVE_PROJECT_ID);
    this.notify();
  }

  public createProject(
    name: string,
    mode: 'schematic' | 'breadboard',
    initialCircuit?: CanonicalCircuitModel,
    tags?: string[]
  ): KittProject {
    const circuit = initialCircuit || (mode === 'breadboard' ? create555TimerFlasherCanonicalCircuit() : createDefaultCanonicalCircuit());
    const newProj: KittProject = {
      id: 'proj-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      name: name.trim() || 'Untitled Circuit',
      description: `Created in ${mode} mode with KITT engineering intelligence.`,
      mode,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      circuit: {
        ...circuit,
        title: name.trim() || circuit.title
      },
      tags: tags || [mode.toUpperCase(), 'CIR'],
      starred: false
    };

    this.projects.unshift(newProj);
    this.saveProjects();
    this.setActiveProjectId(newProj.id);
    return newProj;
  }

  public updateProject(id: string, updates: Partial<KittProject>): KittProject | undefined {
    const idx = this.projects.findIndex(p => p.id === id);
    if (idx === -1) return undefined;

    this.projects[idx] = {
      ...this.projects[idx],
      ...updates,
      updatedAt: Date.now()
    };

    this.saveProjects();
    return this.projects[idx];
  }

  public duplicateProject(id: string): KittProject | undefined {
    const orig = this.getProject(id);
    if (!orig) return undefined;

    const dup: KittProject = {
      ...orig,
      id: 'proj-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      name: `${orig.name} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      circuit: JSON.parse(JSON.stringify(orig.circuit))
    };

    this.projects.unshift(dup);
    this.saveProjects();
    return dup;
  }

  public trashProject(id: string): boolean {
    const proj = this.getProject(id);
    if (!proj) return false;

    proj.isTrashed = true;
    proj.trashedAt = Date.now();
    this.saveProjects();

    if (this.activeProjectId === id) {
      const remaining = this.getAllProjects();
      this.setActiveProjectId(remaining[0]?.id || null);
    }
    return true;
  }

  public restoreProject(id: string): boolean {
    const proj = this.projects.find(p => p.id === id);
    if (!proj) return false;

    proj.isTrashed = false;
    delete proj.trashedAt;
    proj.updatedAt = Date.now();
    this.saveProjects();
    return true;
  }

  public deletePermanently(id: string): boolean {
    const initialLen = this.projects.length;
    this.projects = this.projects.filter(p => p.id !== id);
    if (this.projects.length !== initialLen) {
      this.saveProjects();
      if (this.activeProjectId === id) {
        const remaining = this.getAllProjects();
        this.setActiveProjectId(remaining[0]?.id || null);
      }
      return true;
    }
    return false;
  }

  public emptyTrash(): number {
    const count = this.getTrashedProjects().length;
    this.projects = this.projects.filter(p => !p.isTrashed);
    this.saveProjects();
    return count;
  }

  public getSettings(): KittSettings {
    return { ...this.settings };
  }

  public updateSettings(updates: Partial<KittSettings>) {
    this.settings = { ...this.settings, ...updates };
    this.saveSettings();
  }

  public importProject(jsonData: string): KittProject {
    const parsed = JSON.parse(jsonData);
    const newProj: KittProject = {
      id: 'proj-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      name: parsed.name || parsed.title || 'Imported Circuit',
      description: parsed.description || 'Imported from external file.',
      mode: parsed.mode || 'schematic',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      circuit: parsed.circuit || parsed,
      tags: ['IMPORTED']
    };
    this.projects.unshift(newProj);
    this.saveProjects();
    this.setActiveProjectId(newProj.id);
    return newProj;
  }
}

export const kittProjectStore = new KittProjectStore();

export function useKittProjectStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    return kittProjectStore.subscribe(() => setTick(t => t + 1));
  }, []);

  return {
    projects: kittProjectStore.getAllProjects(),
    trashedProjects: kittProjectStore.getTrashedProjects(),
    activeProjectId: kittProjectStore.getActiveProjectId(),
    settings: kittProjectStore.getSettings(),
    getProject: (id: string) => kittProjectStore.getProject(id),
    createProject: kittProjectStore.createProject.bind(kittProjectStore),
    updateProject: kittProjectStore.updateProject.bind(kittProjectStore),
    duplicateProject: kittProjectStore.duplicateProject.bind(kittProjectStore),
    trashProject: kittProjectStore.trashProject.bind(kittProjectStore),
    restoreProject: kittProjectStore.restoreProject.bind(kittProjectStore),
    deletePermanently: kittProjectStore.deletePermanently.bind(kittProjectStore),
    emptyTrash: kittProjectStore.emptyTrash.bind(kittProjectStore),
    setActiveProjectId: kittProjectStore.setActiveProjectId.bind(kittProjectStore),
    updateSettings: kittProjectStore.updateSettings.bind(kittProjectStore),
    importProject: kittProjectStore.importProject.bind(kittProjectStore)
  };
}
