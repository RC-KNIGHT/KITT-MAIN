import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, 
  Play, 
  Square, 
  RotateCcw, 
  Download, 
  Share2, 
  ChevronDown, 
  Check, 
  Sparkles, 
  Layers, 
  ShieldCheck,
  FileCode,
  Sliders,
  HelpCircle,
  Zap,
  FolderOpen,
  Save,
  Plus
} from 'lucide-react';
import { KittLogo } from '../../KittLogo';
import { CanonicalCircuitModel } from '../cir/cirTypes';

interface EditorTopBarProps {
  projectName: string;
  onRenameProject: (name: string) => void;
  onBackToProjects: () => void;
  activeCanvasView: 'breadboard-2d' | 'breadboard-3d' | 'schematic' | 'pcb';
  onToggleCanvasView: (view: 'breadboard-2d' | 'breadboard-3d' | 'schematic' | 'pcb') => void;
  isSimulating: boolean;
  onToggleSimulate: () => void;
  onResetSimClock: () => void;
  simTime: number;
  onOpenExportModal: () => void;
  onOpenUpgradeModal: () => void;
  onNewProject: () => void;
  circuit: CanonicalCircuitModel;
}

export const EditorTopBar: React.FC<EditorTopBarProps> = ({
  projectName,
  onRenameProject,
  onBackToProjects,
  activeCanvasView,
  onToggleCanvasView,
  isSimulating,
  onToggleSimulate,
  onResetSimClock,
  simTime,
  onOpenExportModal,
  onOpenUpgradeModal,
  onNewProject,
  circuit
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(projectName);
  const [activeDropdown, setActiveDropdown] = useState<'file' | 'edit' | 'view' | 'sim' | 'help' | null>(null);
  const [showPlanMenu, setShowPlanMenu] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTitleInput(projectName);
  }, [projectName]);

  // Close menus on click outside
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
        setShowPlanMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (titleInput.trim()) {
      onRenameProject(titleInput.trim());
    } else {
      setTitleInput(projectName);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <header className="h-14 px-3 sm:px-4 border-b border-[#353536] bg-[#000000]/95 backdrop-blur-md flex items-center justify-between shrink-0 font-sans select-none z-30">
      {/* 1. Left: Logo, Back Link, Project Name, Menus */}
      <div className="flex items-center gap-3" ref={menuRef}>
        {/* Back Button */}
        <button
          onClick={onBackToProjects}
          className="p-1.5 rounded-[12px] bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-xs font-mono"
          title="Back to Dashboard"
        >
          <ArrowLeft className="w-4 h-4 text-[#FFFFFF]" />
        </button>

        <div className="flex items-center gap-2">
          <KittLogo size={22} showGlow={true} />
        </div>

        {/* Breadcrumb & Editable Project Title */}
        <div className="flex items-center gap-1.5 text-xs font-mono">
          <span className="text-slate-500 hidden sm:inline">Home /</span>
          {isEditingTitle ? (
            <input
              type="text"
              value={titleInput}
              onChange={e => setTitleInput(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={e => e.key === 'Enter' && handleTitleSubmit()}
              autoFocus
              className="bg-[#141415] border border-[#FFFFFF] rounded px-2 py-0.5 text-[#F5F5F5] font-bold text-xs focus:outline-none"
            />
          ) : (
            <button
              onClick={() => setIsEditingTitle(true)}
              className="font-bold text-[#F5F5F5] hover:text-[#E8E8E8] transition-colors cursor-pointer truncate max-w-[140px] sm:max-w-[200px]"
              title="Click to rename project"
            >
              {projectName}
            </button>
          )}

          <div className="hidden lg:flex items-center gap-1 text-[10px] text-zinc-400/80 bg-zinc-500/10 px-1.5 py-0.5 rounded border border-zinc-500/20">
            <span className="w-1 h-1 rounded-full bg-zinc-400" />
            <span>Saved</span>
          </div>
        </div>

        <div className="h-4 w-px bg-white/10 hidden md:block" />

        {/* Desktop Menus: File, Edit, View, Simulation, Help (as in Antika media_1789192735919.png) */}
        <nav className="hidden md:flex items-center gap-1 text-xs font-mono relative">
          {/* File Menu */}
          <div className="relative">
            <button
              onClick={() => setActiveDropdown(d => d === 'file' ? null : 'file')}
              className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                activeDropdown === 'file' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              File
            </button>
            {activeDropdown === 'file' && (
              <div className="absolute top-full mt-1.5 left-0 w-52 rounded-[12px] bg-[#141415] border border-[#353536] p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => { setActiveDropdown(null); onNewProject(); }}
                  className="w-full flex items-center justify-between px-3 py-1.5 rounded text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors text-left"
                >
                  <span className="flex items-center gap-2"><Plus className="w-3.5 h-3.5" /> New project</span>
                  <kbd className="text-[10px] text-slate-500 font-mono">Ctrl+N</kbd>
                </button>
                <button
                  onClick={() => { setActiveDropdown(null); alert('Project state saved.'); }}
                  className="w-full flex items-center justify-between px-3 py-1.5 rounded text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors text-left"
                >
                  <span className="flex items-center gap-2"><Save className="w-3.5 h-3.5" /> Save circuit</span>
                  <kbd className="text-[10px] text-slate-500 font-mono">Ctrl+S</kbd>
                </button>
                <div className="border-t border-white/5 my-1" />
                <button
                  onClick={() => { setActiveDropdown(null); onOpenExportModal(); }}
                  className="w-full flex items-center justify-between px-3 py-1.5 rounded text-xs text-[#E8E8E8] hover:text-white hover:bg-white/5 transition-colors text-left"
                >
                  <span className="flex items-center gap-2"><Download className="w-3.5 h-3.5" /> Export KiCad / Gerber</span>
                  <kbd className="text-[10px] text-slate-500 font-mono">Ctrl+E</kbd>
                </button>
                <button
                  onClick={() => { setActiveDropdown(null); onBackToProjects(); }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-left"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>Close to Projects</span>
                </button>
              </div>
            )}
          </div>

          {/* Edit Menu */}
          <div className="relative">
            <button
              onClick={() => setActiveDropdown(d => d === 'edit' ? null : 'edit')}
              className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                activeDropdown === 'edit' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Edit
            </button>
            {activeDropdown === 'edit' && (
              <div className="absolute top-full mt-1.5 left-0 w-44 rounded-[12px] bg-[#141415] border border-[#353536] p-1.5 z-50">
                <button onClick={() => setActiveDropdown(null)} className="w-full px-3 py-1.5 rounded text-xs text-slate-300 hover:bg-white/5 text-left flex justify-between">
                  <span>Undo</span><kbd className="text-[10px] text-slate-500 font-mono">Ctrl+Z</kbd>
                </button>
                <button onClick={() => setActiveDropdown(null)} className="w-full px-3 py-1.5 rounded text-xs text-slate-300 hover:bg-white/5 text-left flex justify-between">
                  <span>Redo</span><kbd className="text-[10px] text-slate-500 font-mono">Ctrl+Y</kbd>
                </button>
                <div className="border-t border-white/5 my-1" />
                <button onClick={() => setActiveDropdown(null)} className="w-full px-3 py-1.5 rounded text-xs text-slate-300 hover:bg-white/5 text-left flex justify-between">
                  <span>Select All</span><kbd className="text-[10px] text-slate-500 font-mono">Ctrl+A</kbd>
                </button>
              </div>
            )}
          </div>

          {/* View Menu */}
          <div className="relative">
            <button
              onClick={() => setActiveDropdown(d => d === 'view' ? null : 'view')}
              className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                activeDropdown === 'view' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              View
            </button>
            {activeDropdown === 'view' && (
              <div className="absolute top-full mt-1.5 left-0 w-52 rounded-[12px] bg-[#141415] border border-[#353536] p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <button 
                  onClick={() => { onToggleCanvasView('breadboard-3d'); setActiveDropdown(null); }}
                  className={`w-full px-3 py-1.5 rounded text-xs text-left flex items-center justify-between ${
                    activeCanvasView === 'breadboard-3d' ? 'text-[#B4B4B4] font-bold' : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <span>Breadboard (3D)</span>
                  {activeCanvasView === 'breadboard-3d' && <Check className="w-3.5 h-3.5" />}
                </button>
                <button 
                  onClick={() => { onToggleCanvasView('breadboard-2d'); setActiveDropdown(null); }}
                  className={`w-full px-3 py-1.5 rounded text-xs text-left flex items-center justify-between ${
                    activeCanvasView === 'breadboard-2d' ? 'text-[#FFFFFF] font-bold' : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <span>Breadboard (2D)</span>
                  {activeCanvasView === 'breadboard-2d' && <Check className="w-3.5 h-3.5" />}
                </button>
                <button 
                  onClick={() => { onToggleCanvasView('schematic'); setActiveDropdown(null); }}
                  className={`w-full px-3 py-1.5 rounded text-xs text-left flex items-center justify-between ${
                    activeCanvasView === 'schematic' ? 'text-[#E8E8E8] font-bold' : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <span>Schematic</span>
                  {activeCanvasView === 'schematic' && <Check className="w-3.5 h-3.5" />}
                </button>
                <button 
                  onClick={() => { onToggleCanvasView('pcb'); setActiveDropdown(null); }}
                  className={`w-full px-3 py-1.5 rounded text-xs text-left flex items-center justify-between ${
                    activeCanvasView === 'pcb' ? 'text-zinc-400 font-bold' : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <span>PCB Layout</span>
                  {activeCanvasView === 'pcb' && <Check className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>

          {/* Simulation Menu */}
          <div className="relative">
            <button
              onClick={() => setActiveDropdown(d => d === 'sim' ? null : 'sim')}
              className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                activeDropdown === 'sim' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Simulation
            </button>
            {activeDropdown === 'sim' && (
              <div className="absolute top-full mt-1.5 left-0 w-48 rounded-[12px] bg-[#141415] border border-[#353536] p-1.5 z-50">
                <button 
                  onClick={() => { onToggleSimulate(); setActiveDropdown(null); }}
                  className="w-full px-3 py-1.5 rounded text-xs text-slate-300 hover:bg-white/5 text-left flex justify-between items-center"
                >
                  <span>{isSimulating ? 'Pause Solver' : 'Run Solver'}</span>
                  <kbd className="text-[10px] text-slate-500 font-mono">Space</kbd>
                </button>
                <button 
                  onClick={() => { onResetSimClock(); setActiveDropdown(null); }}
                  className="w-full px-3 py-1.5 rounded text-xs text-slate-300 hover:bg-white/5 text-left"
                >
                  Reset Timebase
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* 2. Center: Mode Switcher Tabs (Breadboard, Schematic, PCB) - Perfectly Centered */}
      <div className="hidden md:flex items-center bg-[#141415] border border-[#353536] rounded-[12px] p-0.5 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <button
          onClick={() => onToggleCanvasView(activeCanvasView === 'breadboard-2d' ? 'breadboard-2d' : 'breadboard-3d')}
          className={`px-2.5 py-1 rounded-[10px] text-xs font-mono font-bold transition-all cursor-pointer ${
            activeCanvasView.startsWith('breadboard')
              ? 'bg-[#B4B4B4] text-[#000000] shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Breadboard {activeCanvasView === 'breadboard-2d' ? '(2D)' : '(3D)'}
        </button>
        <button
          onClick={() => onToggleCanvasView('schematic')}
          className={`px-2.5 py-1 rounded-[10px] text-xs font-mono font-bold transition-all cursor-pointer ${
            activeCanvasView === 'schematic'
              ? 'bg-[#FFFFFF] text-[#000000] shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Schematic
        </button>
        <button
          onClick={() => onToggleCanvasView('pcb')}
          className={`px-2.5 py-1 rounded-[10px] text-xs font-mono font-bold transition-all cursor-pointer ${
            activeCanvasView === 'pcb'
              ? 'bg-zinc-500 text-[#000000] shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          PCB
        </button>
      </div>

      {/* 3. Right: Simulation Run/Pause, Share, Export, Student Plan Badge */}
      <div className="flex items-center gap-2">
        {/* Simulation Controls */}
        <div className="flex items-center bg-[#141415] border border-[#353536] rounded-[12px] p-0.5">
          <button
            onClick={onToggleSimulate}
            className={`px-2 py-1 rounded flex items-center gap-1.5 text-xs font-mono font-bold transition-all cursor-pointer ${
              isSimulating
                ? 'bg-zinc-500/20 text-zinc-400 border border-zinc-500/30 shadow-[0_0_10px_rgba(245,245,245,0.2)]'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Toggle simulation (Space)"
          >
            {isSimulating ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
            <span className="hidden sm:inline">{isSimulating ? 'Simulating' : 'Simulate'}</span>
          </button>

          <button
            onClick={onResetSimClock}
            className="p-1.5 text-slate-400 hover:text-white rounded transition-colors cursor-pointer"
            title="Reset simulation time"
          >
            <RotateCcw className="w-3 h-3" />
          </button>
        </div>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="p-2 rounded-[12px] bg-[#141415] hover:bg-white/10 border border-[#29292A] text-slate-300 hover:text-white transition-colors cursor-pointer hidden sm:flex items-center gap-1 text-xs font-mono"
          title="Share circuit"
        >
          {copySuccess ? <Check className="w-3.5 h-3.5 text-zinc-400" /> : <Share2 className="w-3.5 h-3.5" />}
          <span className="hidden md:inline">{copySuccess ? 'Copied' : 'Share'}</span>
        </button>

        {/* Export Button */}
        <button
          onClick={onOpenExportModal}
          className="px-3 py-1.5 rounded-[12px] bg-[#FFFFFF] hover:bg-[#E8E8E8] text-[#000000] font-mono font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export</span>
        </button>

        {/* Student Plan Badge Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowPlanMenu(m => !m)}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-[12px] bg-[#141415] hover:bg-[#1D1D1E] border border-[#353536] text-xs font-mono text-[#F5F5F5] transition-colors cursor-pointer"
          >
            <span className="font-semibold text-[#E8E8E8]">Student</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">8 left</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showPlanMenu && (
            <div className="absolute top-full mt-2 right-0 w-64 rounded-[12px] bg-[#141415] border border-[#353536] p-3 z-50 font-sans">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-mono text-slate-400">Plan: Student</span>
                <span className="text-[10px] font-mono font-bold text-[#FFFFFF]">8 credits left</span>
              </div>
              <button
                onClick={() => { setShowPlanMenu(false); onOpenUpgradeModal(); }}
                className="w-full py-1.5 rounded-[12px] bg-[#FFFFFF] text-[#000000] font-mono font-bold text-xs cursor-pointer hover:brightness-110"
              >
                Upgrade to Pro
              </button>
            </div>
          )}
        </div>

        {/* User Profile Avatar */}
        <div className="w-7 h-7 rounded-[10px] bg-[#FFFFFF] flex items-center justify-center text-xs font-bold text-[#000000] font-mono">
          OM
        </div>
      </div>
    </header>
  );
};
