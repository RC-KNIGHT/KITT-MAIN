import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Sparkles, 
  Layers, 
  Cpu, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw,
  Sliders,
  ChevronRight,
  Maximize2
} from 'lucide-react';
import { EditorTopBar } from './EditorTopBar';
import { ComponentLibrarySidebar } from './ComponentLibrarySidebar';
import { InspectorPanel } from './InspectorPanel';
import { AiCopilotDrawer } from './AiCopilotDrawer';
import { CanvasToolbar, WireRoutingStyle } from './CanvasToolbar';
import { CanvasViewSwitcherCard, WorkspaceCanvasMode } from './CanvasViewSwitcherCard';
import { Hardware3DControlsBar } from './Hardware3DControlsBar';
import { MissingGroundBanner } from './MissingGroundBanner';
import { NewBreadboardModal, BreadboardSize } from '../modals/NewBreadboardModal';
import { CircuitLab2D } from '../canvas2d/CircuitLab2D';
import { Breadboard2D } from '../breadboard2d/Breadboard2D';
import { HardwareLab3D, HardwareLab3DRef } from '../canvas3d/HardwareLab3D';
import { PcbLab } from '../pcb/PcbLab';
import { CanonicalCircuitModel, CIRComponent, CIRPatchTransaction } from '../cir/cirTypes';
import { ChatMessageItem } from '../KittChatPanel';
import { KittLogo } from '../../KittLogo';

interface EditorViewProps {
  projectName: string;
  onRenameProject: (name: string) => void;
  onBackToProjects: () => void;
  circuit: CanonicalCircuitModel;
  onUpdateCircuit: (updated: CanonicalCircuitModel) => void;
  isSimulating: boolean;
  onToggleSimulate: () => void;
  onResetSimClock: () => void;
  simTime: number;
  onOpenExportModal: () => void;
  onOpenUpgradeModal: () => void;
  onNewProject: () => void;
  messages: ChatMessageItem[];
  onSendMessage: (text: string) => void;
  onApplyPatch: (patch: CIRPatchTransaction) => void;
  isGenerating: boolean;
  onResetConversation: () => void;
  initialCanvasMode?: '2d' | '3d';
}

export const EditorView: React.FC<EditorViewProps> = ({
  projectName,
  onRenameProject,
  onBackToProjects,
  circuit,
  onUpdateCircuit,
  isSimulating,
  onToggleSimulate,
  onResetSimClock,
  simTime,
  onOpenExportModal,
  onOpenUpgradeModal,
  onNewProject,
  messages,
  onSendMessage,
  onApplyPatch,
  isGenerating,
  onResetConversation,
  initialCanvasMode = '3d'
}) => {
  // 4 Unified Modes: Breadboard 2D, Breadboard 3D, Schematic, PCB
  const [canvasMode, setCanvasMode] = useState<WorkspaceCanvasMode>(() => {
    return initialCanvasMode === '2d' ? 'breadboard-2d' : 'breadboard-3d';
  });

  const [breadboardSize, setBreadboardSize] = useState<BreadboardSize>('large');
  const [showBoardModal, setShowBoardModal] = useState(false);
  
  // Wire Styling & Selection
  const [wireColor, setWireColor] = useState('#10b981');
  const [wireStyle, setWireStyle] = useState<WireRoutingStyle>('orthogonal');
  const [canvasZoom, setCanvasZoom] = useState(0.84);
  const [selectedComponent, setSelectedComponent] = useState<CIRComponent | null>(null);

  // AI Copilot Drawer & Ground Banner (Open by default on desktop for instant AI interaction)
  const [isCopilotOpen, setIsCopilotOpen] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 1024);
  const [isGroundDismissed, setIsGroundDismissed] = useState(false);

  // Undo / Redo History
  const [history, setHistory] = useState<CanonicalCircuitModel[]>([]);
  const [future, setFuture] = useState<CanonicalCircuitModel[]>([]);

  // 3D Lab Ref for camera manipulation
  const hardware3DRef = useRef<HardwareLab3DRef>(null);

  // Push circuit revision to history
  const commitCircuitChange = useCallback((newCircuit: CanonicalCircuitModel) => {
    setHistory(prev => [...prev.slice(-20), circuit]);
    setFuture([]);
    onUpdateCircuit(newCircuit);
  }, [circuit, onUpdateCircuit]);

  const handleUndo = useCallback(() => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1));
    setFuture(prev => [circuit, ...prev]);
    onUpdateCircuit(previous);
    setSelectedComponent(null);
  }, [history, circuit, onUpdateCircuit]);

  const handleRedo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    setFuture(prev => prev.slice(1));
    setHistory(prev => [...prev, circuit]);
    onUpdateCircuit(next);
    setSelectedComponent(null);
  }, [future, circuit, onUpdateCircuit]);

  // Rotate selected component 90 degrees
  const handleRotateComponent = useCallback((componentId: string) => {
    const updated = circuit.components.map(c => {
      if (c.id === componentId) {
        const nextRot = (((c.schematic.rotation || 0) + 90) % 360) as 0 | 90 | 180 | 270;
        return {
          ...c,
          schematic: {
            ...c.schematic,
            rotation: nextRot
          }
        };
      }
      return c;
    });

    const newCircuit = {
      ...circuit,
      components: updated,
      version: circuit.version + 1
    };
    commitCircuitChange(newCircuit);

    if (selectedComponent && selectedComponent.id === componentId) {
      setSelectedComponent(updated.find(c => c.id === componentId) || null);
    }
  }, [circuit, commitCircuitChange, selectedComponent]);

  // Global Keyboard Shortcuts (Delete, R to rotate, Ctrl+Z, Ctrl+Y)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;

      if (e.key.toLowerCase() === 'r' && selectedComponent) {
        e.preventDefault();
        handleRotateComponent(selectedComponent.id);
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedComponent) {
        e.preventDefault();
        handleDeleteComponent(selectedComponent.id);
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedComponent, handleRotateComponent, handleUndo, handleRedo]);

  const handleAddComponent = (partKey: string) => {
    onSendMessage(`Add component [${partKey}] to circuit`);
  };

  const handleUpdateComponentParameters = (componentId: string, parameters: Record<string, any>) => {
    const updatedComponents = circuit.components.map(c => {
      if (c.id === componentId) {
        return { ...c, parameters };
      }
      return c;
    });

    commitCircuitChange({
      ...circuit,
      components: updatedComponents,
      version: circuit.version + 1
    });

    if (selectedComponent && selectedComponent.id === componentId) {
      setSelectedComponent({ ...selectedComponent, parameters });
    }
  };

  const handleDeleteComponent = (componentId: string) => {
    const updatedComponents = circuit.components.filter(c => c.id !== componentId);
    const updatedWires = circuit.wires.filter(
      w => w.fromComponentId !== componentId && w.toComponentId !== componentId
    );

    commitCircuitChange({
      ...circuit,
      components: updatedComponents,
      wires: updatedWires,
      version: circuit.version + 1
    });

    setSelectedComponent(null);
  };

  // Missing Ground Detection
  const hasComponents = circuit.components.length > 0;
  const hasGround = circuit.components.some(c => 
    c.category === 'power' && 
    (c.displayName.toLowerCase().includes('gnd') || 
     c.partNumber.toLowerCase().includes('gnd') || 
     c.displayName.toLowerCase().includes('ground'))
  ) || circuit.wires.some(w => w.signalType === 'GROUND') ||
  circuit.components.some(c => 
    c.pins.some(p => p.type === 'ground' && 
      circuit.wires.some(w => 
        (w.fromComponentId === c.id && w.fromPinId === p.id) || 
        (w.toComponentId === c.id && w.toPinId === p.id)
      )
    )
  );

  const showGroundWarning = hasComponents && !hasGround && !isGroundDismissed;

  const handleTroubleshootGround = () => {
    const gndCompId = 'gnd-' + Date.now();
    const gndComp: CIRComponent = {
      id: gndCompId,
      partNumber: 'POWER_GND',
      manufacturer: 'KITT System',
      category: 'power',
      displayName: 'System Ground (GND)',
      package: 'DISCRETE_2PIN',
      parameters: { voltage: '0V' },
      schematic: { x: 300, y: 550, rotation: 0 },
      physical: {
        anchorRow: 32,
        anchorCol: 'j',
        rotation: 0,
        footprint3D: 'ground_terminal'
      },
      isVerifiedModel: true,
      confidenceScore: 0.99,
      pins: [
        {
          id: 'gnd_pin',
          name: 'GND',
          type: 'ground',
          voltageNominal: 0,
          voltageMax: 0,
          relativeX: 80,
          relativeY: 90
        }
      ]
    };

    const targetComp = circuit.components.find(c => c.pins.some(p => p.type === 'ground'));
    let newWires = [...circuit.wires];

    if (targetComp) {
      const targetPin = targetComp.pins.find(p => p.type === 'ground')!;
      newWires.push({
        id: 'wire-gnd-' + Date.now(),
        netName: 'GND_NET',
        fromComponentId: gndCompId,
        fromPinId: 'gnd_pin',
        toComponentId: targetComp.id,
        toPinId: targetPin.id,
        signalType: 'GROUND',
        color: '#1e293b',
        label: 'GND_NET'
      });
    }

    commitCircuitChange({
      ...circuit,
      components: [...circuit.components, gndComp],
      wires: newWires,
      version: circuit.version + 1
    });

    setIsGroundDismissed(true);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#080f14] text-[#E5E1DD] overflow-hidden select-none font-sans relative">
      {/* 1. TOP GLOBAL EDITOR BAR */}
      <EditorTopBar
        projectName={projectName}
        onRenameProject={onRenameProject}
        onBackToProjects={onBackToProjects}
        activeCanvasView={canvasMode}
        onToggleCanvasView={setCanvasMode}
        isSimulating={isSimulating}
        onToggleSimulate={onToggleSimulate}
        onResetSimClock={onResetSimClock}
        simTime={simTime}
        onOpenExportModal={onOpenExportModal}
        onOpenUpgradeModal={onOpenUpgradeModal}
        onNewProject={onNewProject}
        circuit={circuit}
      />

      {/* 2. THREE-PANE IDE WORKSPACE */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Pane: Component & Instrument Library */}
        <ComponentLibrarySidebar
          onAddComponent={handleAddComponent}
          circuit={circuit}
          simTime={simTime}
        />

        {/* Center Pane: Canvas Area */}
        <div className="flex-1 flex flex-col overflow-hidden relative bg-[#060a0e]">
          {/* Top Canvas Toolbar (Visible in Breadboard & Schematic modes) */}
          {canvasMode !== 'pcb' && (
            <CanvasToolbar
              canUndo={history.length > 0}
              canRedo={future.length > 0}
              onUndo={handleUndo}
              onRedo={handleRedo}
              onDeleteSelected={() => selectedComponent && handleDeleteComponent(selectedComponent.id)}
              hasSelection={!!selectedComponent}
              wireColor={wireColor}
              onChangeWireColor={setWireColor}
              wireStyle={wireStyle}
              onChangeWireStyle={setWireStyle}
              zoom={canvasZoom}
              onZoomIn={() => setCanvasZoom(z => Math.min(2.5, Number((z + 0.1).toFixed(2))))}
              onZoomOut={() => setCanvasZoom(z => Math.max(0.4, Number((z - 0.1).toFixed(2))))}
              onFitView={() => {
                if (canvasMode === 'breadboard-3d') {
                  hardware3DRef.current?.setCameraPreset('fit');
                } else {
                  setCanvasZoom(0.84);
                }
              }}
              onOpenBoardModal={() => setShowBoardModal(true)}
            />
          )}

          {/* Active Canvas Switcher: Breadboard 2D | Breadboard 3D | Schematic | PCB */}
          <div className="flex-1 relative overflow-hidden">
            {canvasMode === 'breadboard-2d' && (
              <Breadboard2D
                circuit={circuit}
                onSelectComponent={setSelectedComponent}
                onAddComponent={handleAddComponent}
                onDeleteComponent={handleDeleteComponent}
                onRotateComponent={handleRotateComponent}
                zoom={canvasZoom}
                onZoomChange={setCanvasZoom}
                wireColor={wireColor}
                selectedComponentId={selectedComponent?.id}
                breadboardSize={breadboardSize}
              />
            )}

            {canvasMode === 'breadboard-3d' && (
              <HardwareLab3D
                ref={hardware3DRef}
                circuit={circuit}
                onSelectComponent={setSelectedComponent}
                breadboardSize={breadboardSize}
                wireColor={wireColor}
                selectedComponentId={selectedComponent?.id}
              />
            )}

            {canvasMode === 'schematic' && (
              <CircuitLab2D
                circuit={circuit}
                onSelectComponent={setSelectedComponent}
                onAddComponent={handleAddComponent}
                onDeleteComponent={handleDeleteComponent}
                onRotateComponent={handleRotateComponent}
                zoom={canvasZoom}
                onZoomChange={setCanvasZoom}
                wireStyle={wireStyle}
                selectedComponentId={selectedComponent?.id}
              />
            )}

            {canvasMode === 'pcb' && (
              <PcbLab
                circuit={circuit}
                onSelectComponent={setSelectedComponent}
                zoom={canvasZoom}
                onZoomChange={setCanvasZoom}
                selectedComponentId={selectedComponent?.id}
              />
            )}
          </div>

          {/* Bottom Alert: Missing Ground Banner - Elevated and centered with zero overlap */}
          {showGroundWarning && (
            <div className={`absolute left-1/2 -translate-x-1/2 z-30 pointer-events-auto w-full max-w-xl px-4 transition-all duration-200 ${
              canvasMode === 'breadboard-3d' ? 'bottom-24' : 'bottom-6'
            }`}>
              <MissingGroundBanner
                isVisible={showGroundWarning}
                onTroubleshoot={handleTroubleshootGround}
                onDismiss={() => setIsGroundDismissed(true)}
              />
            </div>
          )}

          {/* Bottom-Left Card: Switch to Schematic / PCB / Breadboard */}
          <div className="absolute bottom-4 left-4 z-20">
            <CanvasViewSwitcherCard
              canvasMode={canvasMode}
              onChangeMode={setCanvasMode}
            />
          </div>

          {/* Bottom-Center 3D Controls Bar (Visible only in 3D Hardware mode) */}
          {canvasMode === 'breadboard-3d' && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
              <Hardware3DControlsBar
                onFit={() => hardware3DRef.current?.setCameraPreset('fit')}
                onTopView={() => hardware3DRef.current?.setCameraPreset('top')}
                onPerspectiveView={() => hardware3DRef.current?.setCameraPreset('3d')}
                onFocus={() => hardware3DRef.current?.setCameraPreset('focus')}
                onResetView={() => hardware3DRef.current?.setCameraPreset('reset')}
              />
            </div>
          )}

          {/* Floating AI Copilot Trigger Button (Bottom-Right) */}
          <div className="absolute bottom-4 right-4 z-20">
            <button
              id="floating-kitt-copilot-btn"
              onClick={() => setIsCopilotOpen(o => !o)}
              className="px-3.5 py-2 rounded-full bg-gradient-to-r from-[#A58D66] to-[#8C7654] hover:from-[#bfa378] hover:to-[#A58D66] text-[#080f14] font-mono font-bold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(165,141,102,0.4)] transition-all cursor-pointer group hover:scale-105"
            >
              <KittLogo size={16} showGlow={false} />
              <span>KITT Copilot</span>
              {isGenerating && <span className="w-2 h-2 rounded-full bg-white animate-ping" />}
            </button>
          </div>
        </div>

        {/* Right Pane: Inspector Panel */}
        <InspectorPanel
          selectedComponent={selectedComponent}
          circuit={circuit}
          onUpdateComponentParameters={handleUpdateComponentParameters}
          onDeleteComponent={handleDeleteComponent}
          onDeselect={() => setSelectedComponent(null)}
        />
      </div>

      {/* 3. SLIDING AI COPILOT DRAWER */}
      <AiCopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        messages={messages}
        onSendMessage={onSendMessage}
        onApplyPatch={onApplyPatch}
        isGenerating={isGenerating}
        activeCircuit={circuit}
        onResetConversation={onResetConversation}
      />

      {/* 4. NEW BREADBOARD SIZE MODAL */}
      <NewBreadboardModal
        isOpen={showBoardModal}
        onClose={() => setShowBoardModal(false)}
        onSelectSize={size => {
          setBreadboardSize(size);
          setCanvasMode('breadboard-3d');
        }}
        currentSize={breadboardSize}
      />
    </div>
  );
};
