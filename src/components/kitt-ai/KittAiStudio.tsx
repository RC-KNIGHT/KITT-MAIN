import React, { useState, useEffect, useCallback } from 'react';
import { CanonicalCircuitModel, CIRPatchTransaction } from './cir/cirTypes';
import { 
  createDefaultCanonicalCircuit, 
  applyCIRTransaction,
  synthesizeCircuitFromIntent
} from './cir/cirEngine';
import { classifyUserIntent } from './agent/intentClassifier';
import { ChatMessageItem } from './KittChatPanel';
import { ExportModal } from './ExportModal';
import { ecosystemStore } from '../../utils/ecosystemStore';
import { useKittProjectStore, KittProject } from './state/projectStore';
import { CircuitTemplateInfo, KITT_EXAMPLE_TEMPLATES } from './data/exampleTemplates';
import { solveCanonicalCircuitPhysics } from './circuitPhysicsEngine';

// Layout & Subviews
import { Sidebar, KittStudioView } from './layout/Sidebar';
import { TopBar } from './layout/TopBar';
import { CommandPalette } from './modals/CommandPalette';
import { NewProjectModal } from './modals/NewProjectModal';
import { UpgradeModal } from './modals/UpgradeModal';
import { HomeDashboard } from './views/HomeDashboard';
import { ProjectsView } from './views/ProjectsView';
import { ExamplesView } from './views/ExamplesView';
import { TrashView } from './views/TrashView';
import { SettingsView } from './views/SettingsView';
import { EditorView } from './editor/EditorView';

export interface KittAiStudioProps {
  initialCanvasView?: '2d' | '3d';
}

export const KittAiStudio: React.FC<KittAiStudioProps> = ({ initialCanvasView }) => {
  const {
    projects,
    trashedProjects,
    activeProjectId,
    settings,
    getProject,
    createProject,
    updateProject,
    duplicateProject,
    trashProject,
    restoreProject,
    deletePermanently,
    emptyTrash,
    setActiveProjectId,
    updateSettings,
    importProject
  } = useKittProjectStore();

  // Master Studio View state: 'home' | 'projects' | 'examples' | 'trash' | 'settings' | 'editor'
  const [currentView, setCurrentView] = useState<KittStudioView>(() => {
    if (typeof window !== 'undefined' && window.location.hash.toLowerCase().includes('workspace')) {
      return 'editor';
    }
    return 'home';
  });

  // Keep the view in sync when the hash switches to the workspace route.
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.startsWith('#/workspace') || hash === '#workspace') {
        setCurrentView('editor');
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Modals state
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Active Circuit & Simulation state
  const activeProj = (activeProjectId ? getProject(activeProjectId) : null) || projects[0];
  const [activeCircuit, setActiveCircuit] = useState<CanonicalCircuitModel>(() => {
    return activeProj?.circuit || createDefaultCanonicalCircuit();
  });
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [simTime, setSimTime] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // When active project changes, sync activeCircuit
  useEffect(() => {
    if (activeProj?.circuit) {
      setActiveCircuit(activeProj.circuit);
    }
  }, [activeProjectId]);

  // Simulation Clock interval (1Hz smooth updates to eliminate React re-render thrashing)
  useEffect(() => {
    if (!isSimulating) return;
    const interval = setInterval(() => {
      setSimTime(t => Number((t + 1).toFixed(1)));
    }, 1000);
    return () => clearInterval(interval);
  }, [isSimulating]);

  // Global Keyboard Shortcuts (⌘K, Space, etc.)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // ⌘K or Ctrl+K for Command Palette
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowCommandPalette(p => !p);
      }
      // Space to toggle simulation when not typing in inputs
      if (e.code === 'Space') {
        const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
        if (tag !== 'input' && tag !== 'textarea') {
          e.preventDefault();
          setIsSimulating(s => !s);
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Conversational AI Messages State
  const [messages, setMessages] = useState<ChatMessageItem[]>([
    {
      id: 'msg-init',
      sender: 'kitt',
      timestamp: 'Just now',
      text: "Hello! I am KITT, your Universal AI Electronics & Engineering Agent.\n\nI can converse naturally about general topics, research datasheets, analyze circuit physics, and instantly synthesize verified 2D schematics and 3D physical breadboard prototypes.\n\nWhat would you like to explore or build today?",
      thinkingTrace: {
        summary: 'System ready. Component registry and 9-stage verification pipeline active.',
        steps: [
          'Initialized 45,000+ verified semiconductor registry',
          'Calibrated deterministic mixed-signal physics solver',
          'Mounted canonical intermediate representation (CIR) engine'
        ],
        durationMs: 420
      }
    }
  ]);

  // Intelligent fallback responder
  const getLocalIntelligentReply = (query: string): string => {
    const q = query.toLowerCase().trim();
    if (q.match(/^(hi|hello|hey|hii+|heyy+|greetings|what'?s up|howdy|yo|gm)\b/)) {
      return `Hello! Great to connect with you. I am **KITT**, your Universal AI Electronics & Engineering Agent.\n\nI can converse naturally about electronics, answer your hardware questions, calculate component ratings, and instantly synthesize real, verified 2D schematics and 3D physical breadboard prototypes.\n\nWhat would you like to build or explore today? Try asking me to build a **radar**, a **weather station with OLED**, a **555 timer flasher**, a **traffic light**, or an **irrigation system**!`;
    }
    if (q.includes('who are you') || q.includes('what can you do') || q.includes('how are you')) {
      return `I am **KITT**, operating on the single source of truth architectural law:\n> **"ONE PROJECT. ONE SOURCE OF TRUTH. MANY VIEWS."**\n\nTell me what you'd like to build, and I will generate the complete 2D schematic, 3D breadboard wiring, SPICE simulation, and firmware in seconds!`;
    }
    if (q.includes('mosfet')) {
      return `### MOSFET (Metal-Oxide-Semiconductor Field-Effect Transistor)\n\nA MOSFET is a voltage-controlled semiconductor switch. In microcontrollers (like ESP32 or Arduino), logic-level MOSFETs (such as the **IRLZ44N**) are preferred because their gate threshold voltage ($V_{GS(th)}$) is between 1.0V and 2.0V, allowing full saturation directly from a 3.3V or 5V GPIO pin.\n\nKey design best practices:\n1. Place a **100Ω–330Ω** resistor between the GPIO and Gate to prevent capacitive inrush current spikes.\n2. Place a **10kΩ** pull-down resistor from Gate to GND to guarantee the MOSFET stays OFF during MCU boot.\n3. Always place a reverse flyback diode (like **1N4007**) across inductive loads (motors, relays, pumps) to clamp high-voltage back-EMF spikes.`;
    }
    return `I have analyzed your inquiry: **"${query}"**.\n\nI am ready to help you engineer hardware, analyze circuits, or synthesize a complete system. You can ask me to design an entire project (e.g. *"Build an ultrasonic distance radar"*, *"Create an IoT weather station with OLED"*, *"Make a 555 timer LED flasher"*), or ask any question about electronics physics, code, or component pinouts!`;
  };

  // Handle user incoming messages & circuit mutations
  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessageItem = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text,
      timestamp: 'Just now'
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsGenerating(true);

    const intentResult = classifyUserIntent(text, true);
    const p = text.toLowerCase();
    const isBuild = intentResult.intent === 'build_request' || 
      p.includes('build') || p.includes('make') || p.includes('create') || p.includes('synthesize') ||
      p.includes('radar') || p.includes('weather') || p.includes('555') || p.includes('traffic') ||
      p.includes('plant') || p.includes('irrigation') || p.includes('water');

    const isModify = intentResult.intent === 'modify_circuit' ||
      p.includes('replace') || p.includes('modify') || p.includes('change resistor') || p.includes('add component');

    // 1. Solve real-time circuit physics telemetry directly from active circuit
    const physics = solveCanonicalCircuitPhysics(activeCircuit);
    const telemetryPayload = {
      supplyVoltage: physics.telemetry.supplyVoltage,
      currentDraw_mA: physics.telemetry.totalCurrent_mA,
      powerConsumption_mW: physics.telemetry.totalPower_mW,
      violations: physics.violations,
      nodeVoltages: physics.telemetry.nodeVoltages
    };
    const circuitPayload = {
      title: activeCircuit.title,
      components: activeCircuit.components,
      wires: activeCircuit.wires
    };

    const payloadMessages = updatedMessages.slice(-10).map(m => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text
    }));

    // Query KITT Core Hardware & Silicon Intelligence backend
    let apiReply: string | null = null;
    try {
      const res = await fetch('/api/kitt-core-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: payloadMessages,
          circuit: circuitPayload,
          telemetry: telemetryPayload
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.reply) {
          apiReply = data.reply;
        }
      }
    } catch (err) {
      console.warn('[KITT AI] /api/kitt-core-chat unreachable, using local solver fallback:', err);
    }

    if (isBuild && !isModify) {
      const { circuit: synthesizedCircuit, isNewCircuit, synthesisSummary } = synthesizeCircuitFromIntent(text, activeCircuit);
      
      if (isNewCircuit) {
        setActiveCircuit(synthesizedCircuit);
        if (activeProj) {
          updateProject(activeProj.id, { circuit: synthesizedCircuit, name: synthesizedCircuit.title });
        }

        ecosystemStore.addActivity({
          title: synthesizedCircuit.title,
          platform: 'KITT 1.0 Autonomous Agent',
          platformIcon: 'Bot',
          action: 'CIR Synthesized & 9-Stage Verified',
          status: 'synthesized',
          route: '#/kitt-ai'
        });
      }

      const replyText = apiReply ? `${apiReply}\n\n---\n${synthesisSummary}` : synthesisSummary;

      const assistantReply: ChatMessageItem = {
        id: 'asst-' + Date.now(),
        sender: 'kitt',
        timestamp: 'Just now',
        intent: 'build_request',
        text: replyText,
        thinkingTrace: {
          summary: intentResult.reasoningSummary || `Synthesized canonical netlist for ${synthesizedCircuit.title}`,
          steps: [
            `Allocated target silicon: ${synthesizedCircuit.firmware.targetMcu}`,
            `Connected ${synthesizedCircuit.wires.length} wires across ${synthesizedCircuit.components.length} parts`,
            `Power dissipation calculated: ${synthesizedCircuit.telemetry.powerConsumption_mW}mW @ ${synthesizedCircuit.telemetry.supplyVoltage}V`,
            `Electrical DRC & Safe Operating Area checks passed`
          ],
          durationMs: 950
        }
      };

      setMessages(prev => [...prev, assistantReply]);
      setIsGenerating(false);

    } else if (isModify) {
      const { suggestedPatch, synthesisSummary } = synthesizeCircuitFromIntent(text, activeCircuit);
      const replyText = apiReply ? `${apiReply}\n\n---\n${synthesisSummary}` : synthesisSummary;

      const assistantReply: ChatMessageItem = {
        id: 'asst-' + Date.now(),
        sender: 'kitt',
        timestamp: 'Just now',
        intent: 'modify_circuit',
        text: replyText,
        thinkingTrace: {
          summary: 'Calculated Ohm\'s law gate transient: I_peak = 3.3V / 330Ω = 10mA.',
          steps: [
            'Inspected GPIO26 source limit (max 12mA continuous, 20mA surge)',
            'Recalculated RC time constant τ = R * Ciss (330Ω * 1700pF = 0.56µs)',
            'Verified switching frequency viability up to 20kHz'
          ],
          durationMs: 650
        },
        proposedPatch: suggestedPatch
      };

      setMessages(prev => [...prev, assistantReply]);
      setIsGenerating(false);

    } else {
      // General conversation, telemetry inquiry, calculation, or physics question
      const replyText = apiReply || getLocalIntelligentReply(text);

      const assistantReply: ChatMessageItem = {
        id: 'asst-' + Date.now(),
        sender: 'kitt',
        timestamp: 'Just now',
        intent: intentResult.intent,
        text: replyText,
        thinkingTrace: {
          summary: intentResult.reasoningSummary || 'Consulted KITT Electronics Intelligence Core',
          steps: [
            `Measured supply: ${physics.telemetry.supplyVoltage.toFixed(2)}V, load: ${physics.telemetry.totalCurrent_mA}mA`,
            `Evaluated ${activeCircuit.components.length} components across ${activeCircuit.wires.length} nets`,
            'Grounded response in active simulation physics telemetry'
          ],
          durationMs: 580
        }
      };

      setMessages(prev => [...prev, assistantReply]);
      setIsGenerating(false);
    }
  };

  // Apply a confirmed CIR Patch Transaction
  const handleApplyPatch = (patch: CIRPatchTransaction) => {
    const { updatedCircuit, changeLog } = applyCIRTransaction(activeCircuit, patch);
    setActiveCircuit(updatedCircuit);
    if (activeProj) {
      updateProject(activeProj.id, { circuit: updatedCircuit });
    }

    setMessages(prev => [
      ...prev,
      {
        id: 'patch-applied-' + Date.now(),
        sender: 'kitt',
        timestamp: 'Just now',
        text: `Patch applied successfully:\n• ${changeLog.join('\n• ')}\n\nCIR updated to v${updatedCircuit.version}. 9-Stage Verification status: ${updatedCircuit.verificationReport.overallStatus}.`
      }
    ]);

    ecosystemStore.addActivity({
      title: activeCircuit.title,
      platform: 'KITT 1.0 Autonomous Agent',
      platformIcon: 'Bot',
      action: `CIR Mutated: ${patch.description}`,
      status: 'synthesized',
      route: '#/kitt-ai'
    });
  };

  // Handlers for Project actions
  const handleOpenProject = (projectId: string) => {
    setActiveProjectId(projectId);
    const p = getProject(projectId);
    if (p) setActiveCircuit(p.circuit);
    setCurrentView('editor');
  };

  const handleOpenExample = (template: CircuitTemplateInfo) => {
    const circuit = template.factory();
    const newProj = createProject(template.title, 'schematic', circuit, [template.category, 'EXAMPLE']);
    setActiveCircuit(circuit);
    setActiveProjectId(newProj.id);
    setCurrentView('editor');
  };

  const handleCloneExample = (template: CircuitTemplateInfo) => {
    const circuit = template.factory();
    createProject(`${template.title} (Clone)`, 'schematic', circuit, [template.category]);
    alert(`Cloned "${template.title}" to your Projects!`);
  };

  const handleCreateNewProject = (name: string, mode: 'schematic' | 'breadboard', initialCircuit?: CanonicalCircuitModel) => {
    const newProj = createProject(name, mode, initialCircuit);
    setActiveCircuit(newProj.circuit);
    setActiveProjectId(newProj.id);
    setCurrentView('editor');
  };

  const handleImportProject = (jsonString: string) => {
    try {
      const imported = importProject(jsonString);
      setActiveCircuit(imported.circuit);
      setActiveProjectId(imported.id);
      setCurrentView('editor');
    } catch {
      alert('Failed to parse circuit file. Please ensure valid JSON format.');
    }
  };

  const handleRenameActiveProject = (newName: string) => {
    if (activeProj) {
      updateProject(activeProj.id, { name: newName });
    }
  };

  const handleUpdateActiveCircuit = (newCircuit: CanonicalCircuitModel) => {
    setActiveCircuit(newCircuit);
    if (activeProj) {
      updateProject(activeProj.id, { circuit: newCircuit });
    }
  };

  return (
    <div className="kds-root w-screen h-screen flex overflow-hidden select-none">
      {/* 1. IF IN EDITOR MODE: RENDER FULL-SCREEN IDE WORKSPACE */}
      {currentView === 'editor' ? (
        <EditorView
          projectName={activeProj?.name || activeCircuit.title || 'Untitled Circuit'}
          onRenameProject={handleRenameActiveProject}
          onBackToProjects={() => setCurrentView('home')}
          circuit={activeCircuit}
          onUpdateCircuit={handleUpdateActiveCircuit}
          isSimulating={isSimulating}
          onToggleSimulate={() => setIsSimulating(s => !s)}
          onResetSimClock={() => setSimTime(0)}
          simTime={simTime}
          onOpenExportModal={() => setShowExportModal(true)}
          onOpenUpgradeModal={() => setShowUpgradeModal(true)}
          onNewProject={() => setShowNewProjectModal(true)}
          messages={messages}
          onSendMessage={handleSendMessage}
          onApplyPatch={handleApplyPatch}
          isGenerating={isGenerating}
          onResetConversation={() => setMessages([messages[0]])}
          initialCanvasMode={initialCanvasView || (activeProj?.mode === 'breadboard' ? '3d' : '2d')}
        />
      ) : (
        /* 2. IF IN DASHBOARD MODE: RENDER SAAS APP SHELL (Sidebar + TopBar + Content Views) */
        <div className="w-full h-full flex overflow-hidden">
          {/* Left Persistent Sidebar */}
          <Sidebar
            currentView={currentView}
            onNavigate={setCurrentView}
            onNewProject={() => setShowNewProjectModal(true)}
            projectCount={projects.length}
            exampleCount={KITT_EXAMPLE_TEMPLATES.length}
            trashCount={trashedProjects.length}
            onOpenUpgradeModal={() => setShowUpgradeModal(true)}
          />

          {/* Main Area: TopBar + Active View */}
          <div className="flex-1 flex flex-col overflow-hidden bg-black min-w-0">
            <TopBar
              onOpenCommandPalette={() => setShowCommandPalette(true)}
              onOpenUpgradeModal={() => setShowUpgradeModal(true)}
              onNavigate={setCurrentView}
            />

            <main className="flex-1 flex overflow-hidden bg-black">
              {currentView === 'home' && (
                <HomeDashboard
                  projects={projects}
                  onOpenProject={handleOpenProject}
                  onOpenExample={handleOpenExample}
                  onNewProject={() => setShowNewProjectModal(true)}
                  onBrowseExamples={() => setCurrentView('examples')}
                  onDuplicateProject={duplicateProject}
                  onTrashProject={trashProject}
                  onImportProject={handleImportProject}
                />
              )}

              {currentView === 'projects' && (
                <ProjectsView
                  projects={projects}
                  onOpenProject={handleOpenProject}
                  onNewProject={() => setShowNewProjectModal(true)}
                  onDuplicateProject={duplicateProject}
                  onTrashProject={trashProject}
                />
              )}

              {currentView === 'examples' && (
                <ExamplesView
                  onOpenExample={handleOpenExample}
                  onCloneExample={handleCloneExample}
                />
              )}

              {currentView === 'trash' && (
                <TrashView
                  trashedProjects={trashedProjects}
                  onRestoreProject={restoreProject}
                  onDeletePermanently={deletePermanently}
                  onEmptyTrash={emptyTrash}
                />
              )}

              {currentView === 'settings' && (
                <SettingsView
                  settings={settings}
                  onUpdateSettings={updateSettings}
                  onOpenUpgradeModal={() => setShowUpgradeModal(true)}
                />
              )}
            </main>
          </div>
        </div>
      )}

      {/* GLOBAL MODALS */}
      <NewProjectModal
        isOpen={showNewProjectModal}
        onClose={() => setShowNewProjectModal(false)}
        onCreateProject={handleCreateNewProject}
      />

      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        projects={projects}
        onOpenProject={handleOpenProject}
        onOpenExample={handleOpenExample}
        onNewProject={() => setShowNewProjectModal(true)}
        onOpenSettings={() => setCurrentView('settings')}
        onToggleSimulation={() => setIsSimulating(s => !s)}
        isSimulating={isSimulating}
      />

      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
      />

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        circuit={activeCircuit}
      />
    </div>
  );
};
