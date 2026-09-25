/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { useCircuit } from '../../context/CircuitContext';
import { useCollaboration } from '../../context/CollaborationContext';
import { useAuth } from '../../context/AuthContext';
import { UserProfileModal } from '../auth/UserProfileModal';
import { THEME_PRESETS, getCounterpartTheme } from '../../theme/themes';
import { KittLogo } from '../../../KittLogo';
import {
  Activity,
  Award,
  BookOpen,
  Check,
  Compass,
  Cpu,
  Database,
  Download,
  FileCode2,
  FolderOpen,
  Grid,
  HelpCircle,
  Info,
  Menu,
  MoreHorizontal,
  Network,
  Pause,
  Play,
  Plus,
  Redo2,
  RotateCcw,
  Sliders,
  Sparkles,
  StepForward,
  Table,
  Trash2,
  Undo2,
  Upload,
  Zap,
  Settings,
  Spline,
  Palette,
  Users,
  Volume2,
  VolumeX,
  LogIn,
  User,
  LogOut,
  ChevronDown,
  Star,
  Sun,
  Moon,
  ArrowLeft,
} from 'lucide-react';
import { ecosystemStore } from '../../../../utils/ecosystemStore';
import { safeLocalStorage } from '../../../../utils/safeStorage';

export const Toolbar: React.FC = () => {
  const {
    circuitName,
    setCircuitName,
    simulationRunning,
    toggleSimulation,
    stepSimulation,
    resetSimulation,
    simulationSpeedHz,
    setSimulationSpeedHz,
    canUndo,
    canRedo,
    undo,
    redo,
    wireRoutingMode,
    setWireRoutingMode,
    signalAnimation,
    setSignalAnimation,
    snapToGrid,
    setSnapToGrid,
    selection,
    wires,
    selectAllWires,
    deleteSelection,
    exportJson,
    importJson,
    clearCanvas,
    autoArrange,
    setActiveModal,
    theme,
    colorMode,
    toggleColorMode,
    sidebarOpen,
    toggleSidebar,
    inspectorOpen,
    toggleInspector,
    soundEnabled,
    setSoundEnabled,
  } = useCircuit();

  const {
    isCollaborating,
    room,
    roomCode,
    currentUser: collabUser,
    collaborators,
  } = useCollaboration();

  const {
    currentUser: authUser,
    userProfile,
    logout,
    setLoginViewOpen,
  } = useAuth();

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  const activeTheme = THEME_PRESETS[theme] || THEME_PRESETS.kitt_sovereign;
  const isLight = colorMode === 'light';
  const defaultBtnClass = isLight
    ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700 hover:text-slate-900'
    : 'bg-[#0d171f] hover:bg-[#A58D66]/15 border-[#A58D66]/25 text-[#E5E1DD] hover:text-[#DFCCA8]';
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(circuitName);
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const toolsMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handlePointerDownOutside = (event: MouseEvent | TouchEvent) => {
      if (toolsDropdownOpen && toolsMenuRef.current && !toolsMenuRef.current.contains(event.target as Node)) {
        setToolsDropdownOpen(false);
      }
      if (userDropdownOpen && userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setToolsDropdownOpen(false);
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDownOutside);
    document.addEventListener('touchstart', handlePointerDownOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDownOutside);
      document.removeEventListener('touchstart', handlePointerDownOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [toolsDropdownOpen, userDropdownOpen]);

  const handleSaveToLocal = () => {
    const jsonStr = exportJson();
    safeLocalStorage.setItem('digilogic_saved_circuit', jsonStr);
    setExportNotice('Saved to local storage!');
    setTimeout(() => setExportNotice(null), 2000);
    setToolsDropdownOpen(false);
  };

  const handleLoadFromLocal = () => {
    const jsonStr = safeLocalStorage.getItem('digilogic_saved_circuit');
    if (jsonStr) {
      const success = importJson(jsonStr);
      if (success) {
        setExportNotice('Loaded from local storage!');
      } else {
        setExportNotice('Invalid local storage data');
      }
    } else {
      setExportNotice('No saved circuit found');
    }
    setTimeout(() => setExportNotice(null), 2000);
    setToolsDropdownOpen(false);
  };

  const handleExport = () => {
    const jsonStr = exportJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${circuitName.toLowerCase().replace(/\s+/g, '_')}_circuit.json`;
    a.click();
    URL.revokeObjectURL(url);

    setExportNotice('Exported circuit JSON!');
    setTimeout(() => setExportNotice(null), 2000);
    setToolsDropdownOpen(false);
  };

  const handleTriggerImport = () => {
    setToolsDropdownOpen(false);
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 50);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importJson(content);
        if (success) {
          setExportNotice('Loaded circuit successfully!');
          setTimeout(() => setExportNotice(null), 2000);
        } else {
          setExportNotice('Invalid circuit JSON format');
          setTimeout(() => setExportNotice(null), 2500);
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
    setToolsDropdownOpen(false);
  };

  return (
    <header
      style={{
        backgroundColor: activeTheme.navBg,
        borderColor: activeTheme.borderTone,
      }}
      className="h-14 min-h-[56px] border-b px-2 sm:px-3 flex items-center justify-between relative z-40 select-none shrink-0 gap-2 transition-colors duration-300 w-full"
    >
      {/* Left: Library Toggle & Brand */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Return to KITT Home Button */}
        <a
          href="#/"
          className="h-8 px-2.5 rounded-lg border border-[#A58D66]/40 bg-[#A58D66]/15 hover:bg-[#A58D66]/30 text-[#E5E1DD] text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer"
          title="Return to KITT Ecosystem Landing Page"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#A58D66]" />
          <span className="hidden sm:inline">KITT Home</span>
        </a>

        {/* Component Library Sidebar Toggle */}
        <button
          onClick={toggleSidebar}
          style={
            sidebarOpen
              ? {
                  backgroundColor: `${activeTheme.primaryColor}22`,
                  borderColor: `${activeTheme.primaryColor}55`,
                  color: activeTheme.primaryColor,
                }
              : {}
          }
          className={`p-2 rounded-lg border transition-colors hidden md:flex items-center justify-center ${
            sidebarOpen
              ? ''
              : defaultBtnClass
          }`}
          title="Toggle Component Library"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Brand Logo & Name (Click to expand / open About & Lab Guide) */}
        <button
          onClick={() => setActiveModal('about')}
          style={{
            backgroundColor: `${activeTheme.primaryColor}20`,
            borderColor: `${activeTheme.primaryColor}40`,
            color: activeTheme.primaryColor,
          }}
          className="h-8 px-2 sm:px-2.5 rounded-lg border flex items-center gap-1.5 sm:gap-2 shadow-xs shrink-0 hover:brightness-110 active:scale-95 transition-all cursor-pointer group"
          title="DigiLogic Lab • View About, Founders & Full Guide"
        >
          <KittLogo size={20} showGlow={true} className="shrink-0" />
          <span className={`font-bold text-xs sm:text-sm tracking-tight font-mono flex items-center gap-1 ${isLight ? 'text-slate-900' : 'text-[#E5E1DD]'}`}>
            <span>DigiLogic</span>
            <span className="text-[10px] font-normal text-[#A58D66] border border-[#A58D66]/40 bg-[#A58D66]/10 px-1 py-0.5 rounded hidden md:inline font-mono">
              EDA
            </span>
          </span>
        </button>

        {/* Editable Circuit Title */}
        <div className={`hidden sm:block h-4 w-px mx-0.5 shrink-0 ${isLight ? 'bg-slate-300' : 'bg-[#0d171f]/80'}`} />

        <div className="hidden sm:block shrink-0">
          {isEditingName ? (
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onBlur={() => {
                setCircuitName(tempName || 'Untitled Circuit');
                setIsEditingName(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setCircuitName(tempName || 'Untitled Circuit');
                  setIsEditingName(false);
                }
              }}
              autoFocus
              className={`px-2 py-0.5 border rounded text-xs font-semibold focus:outline-none max-w-28 sm:max-w-32 ${
                isLight
                  ? 'bg-white border-slate-300 text-slate-900'
                  : 'bg-[#080f14] border-[#A58D66]/20 text-[#E5E1DD]'
              }`}
            />
          ) : (
            <button
              onClick={() => {
                setTempName(circuitName);
                setIsEditingName(true);
              }}
              className={`text-xs font-semibold px-1.5 py-0.5 rounded transition-colors truncate max-w-28 sm:max-w-36 ${
                isLight
                  ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-200/70'
                  : 'text-[#DFCCA8] hover:text-[#E5E1DD] hover:bg-[#0d171f]/60'
              }`}
              title="Click to rename circuit"
            >
              {circuitName}
            </button>
          )}
        </div>
      </div>

      {/* Center: Simulation Engine Controls */}
      <div
        className={`hidden md:flex items-center gap-1 sm:gap-1.5 border px-1 sm:px-2 py-1 rounded-xl shadow-xs shrink-0 h-9 min-h-[36px] ${
          isLight
            ? 'bg-slate-100 border-slate-200'
            : 'bg-[#080f14]/80 border-slate-800/80'
        }`}
      >
        {/* Run/Pause Toggle */}
        <button
          onClick={() => {
            if (!simulationRunning) {
              ecosystemStore.addActivity({
                title: `${circuitName || 'Digital Logic Circuit'} Live Simulation`,
                platform: 'DigiLogic Circuit Studio',
                platformIcon: 'Binary',
                action: 'Clock Simulation Evaluated in Real-Time',
                status: 'completed',
                route: '#/digilogic'
              });
            }
            toggleSimulation();
          }}
          style={
            simulationRunning
              ? {
                  backgroundColor: `${activeTheme.primaryColor}25`,
                  borderColor: `${activeTheme.primaryColor}60`,
                  color: activeTheme.primaryColor,
                }
              : {}
          }
          className={`flex items-center gap-1 px-2 py-1 rounded-lg font-bold text-xs transition-all shadow-xs ${
            simulationRunning
              ? 'border'
              : 'bg-[#A58D66]/20 text-[#DFCCA8] border border-[#A58D66]/40 hover:bg-[#A58D66]/30'
          }`}
          title={simulationRunning ? 'Simulation Running (Click to Pause)' : 'Simulation Paused (Click to Run)'}
        >
          {simulationRunning ? (
            <>
              <Pause className="w-3.5 h-3.5" style={{ fill: activeTheme.primaryColor }} />
              <span className="hidden xl:inline text-[11px] tracking-wider">RUN</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-amber-400" />
              <span className="hidden xl:inline text-[11px] tracking-wider">PAUSE</span>
            </>
          )}
        </button>

        {/* Step Simulation */}
        <button
          onClick={stepSimulation}
          disabled={simulationRunning}
          className={`p-1.5 rounded-lg disabled:opacity-30 transition-colors ${
            isLight
              ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              : 'text-[#E5E1DD]/60 hover:text-[#E5E1DD] hover:bg-[#0d171f]'
          }`}
          title="Single Step Simulation Clock"
        >
          <StepForward className="w-3.5 h-3.5" />
        </button>

        {/* Reset Simulation State */}
        <button
          onClick={resetSimulation}
          className={`p-1.5 rounded-lg transition-colors ${
            isLight
              ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              : 'text-[#E5E1DD]/60 hover:text-[#E5E1DD] hover:bg-[#0d171f]'
          }`}
          title="Reset Signal States"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Frequency Cycling / Speed Selector */}
        <button
          onClick={() => {
            const speeds = [1, 5, 10, 20, 30];
            const nextIdx = (speeds.indexOf(simulationSpeedHz) + 1) % speeds.length;
            setSimulationSpeedHz(speeds[nextIdx] || 10);
          }}
          className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-mono transition-colors border-l pl-1.5 ${
            isLight
              ? 'hover:bg-slate-200 text-slate-700 hover:text-amber-600 border-slate-200'
              : 'hover:bg-[#0d171f] text-[#DFCCA8] hover:text-[#DFCCA8] border-slate-800'
          }`}
          title={`Simulation Speed: ${simulationSpeedHz}Hz (Click to cycle 1, 5, 10, 20, 30Hz)`}
        >
          <Zap className="w-3 h-3 text-[#A58D66] shrink-0" />
          <span>{simulationSpeedHz}Hz</span>
        </button>
      </div>

      {/* Right: Actions, Presence Indicator, Modals & Inspector Toggle */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        {/* Presence Indicator & Collaboration Room Button */}
        {isCollaborating && roomCode ? (
          <button
            onClick={() => setActiveModal('collaborate')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#407E8C]/15 border border-[#407E8C]/50 text-[#76B4C2] hover:bg-[#407E8C]/25 transition-all shadow-sm max-w-[200px] sm:max-w-xs cursor-pointer"
            title={`Live Server: ${room?.name || 'Collaborative Room'} [${roomCode}] - ${collaborators.length + 1} online (Click to manage)`}
          >
            {/* Live pulsing indicator */}
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#76B4C2] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#407E8C]" />
            </span>

            {/* Overlapping User Presence Avatars */}
            <div className="flex items-center -space-x-1.5 shrink-0">
              {collabUser && (
                <div
                  className="w-5 h-5 rounded-full border border-slate-900 flex items-center justify-center text-[9px] font-black text-[#E5E1DD] shadow"
                  style={{ backgroundColor: collabUser.color }}
                  title={`${collabUser.name} (You)`}
                >
                  {collabUser.initial}
                </div>
              )}
              {collaborators.slice(0, 2).map((u) => (
                <div
                  key={u.id}
                  className="w-5 h-5 rounded-full border border-slate-900 flex items-center justify-center text-[9px] font-black text-[#E5E1DD] shadow"
                  style={{ backgroundColor: u.color }}
                  title={u.name}
                >
                  {u.initial}
                </div>
              ))}
              {collaborators.length > 2 && (
                <div className="w-5 h-5 rounded-full border border-slate-900 bg-[#0d171f] flex items-center justify-center text-[8px] font-bold text-[#DFCCA8]">
                  +{collaborators.length - 2}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1 min-w-0">
              <span className="hidden md:inline text-xs font-bold text-[#E5E1DD] truncate max-w-[100px]">
                {room?.name || 'Server'}
              </span>
              <span className="font-mono text-[11px] font-extrabold text-[#76B4C2]">
                {roomCode}
              </span>
            </div>
          </button>
        ) : (
          <button
            onClick={() => setActiveModal('collaborate')}
            className={`p-2 rounded-lg border transition-all ${defaultBtnClass}`}
            title="Live Collaboration Server (Create, Join, or Reconnect)"
          >
            <Users className="w-4 h-4 text-[#DFCCA8]" />
          </button>
        )}

        {/* Auto Arrange Layout Button */}
        <button
          id="auto-arrange-btn"
          onClick={() => autoArrange()}
          className={`p-2 rounded-lg border transition-all hidden xl:block ${defaultBtnClass}`}
          title="Auto-Arrange Circuit Layout"
        >
          <Network className="w-4 h-4" />
        </button>

        {/* Unified Delete Button (Icon with count badge) */}
        {(() => {
          const totalSelected = selection.wireIds.length + selection.componentIds.length;
          const hasSelection = totalSelected > 0;
          return (
            <button
              id="navbar-delete-btn"
              onClick={() => {
                if (hasSelection) {
                  deleteSelection();
                } else {
                  clearCanvas();
                }
              }}
              className={`p-2 rounded-lg transition-all relative ${
                hasSelection
                  ? 'bg-[#A58D66]/20 hover:bg-[#A58D66]/30 text-[#A58D66] border border-[#A58D66]/40 shadow-lg shadow-[#A58D66]/20 animate-pulse'
                  : `border hidden md:block ${defaultBtnClass} hover:text-[#A58D66]`
              }`}
              title={
                hasSelection
                  ? `Delete ${totalSelected} selected item(s) [Del / Backspace]`
                  : 'Clear Canvas / Delete'
              }
            >
              <Trash2 className="w-4 h-4" />
              {hasSelection && (
                <span className="absolute -top-1 -right-1 px-1 min-w-3.5 h-3.5 rounded-full bg-[#8C7654] text-[#E5E1DD] text-[9px] font-bold flex items-center justify-center shadow">
                  {totalSelected}
                </span>
              )}
            </button>
          );
        })()}

        {/* Wire Style Toggle Icon (Curved vs Orthogonal) */}
        <button
          onClick={() => setWireRoutingMode(wireRoutingMode === 'orthogonal' ? 'curved' : 'orthogonal')}
          className={`p-2 rounded-lg border transition-colors hidden xl:block ${
            wireRoutingMode === 'curved'
              ? 'bg-[#76B4C2]/20 text-[#76B4C2] border-[#76B4C2]/40'
              : defaultBtnClass
          }`}
          title={`Wire Style: ${wireRoutingMode === 'curved' ? 'Curved Bezier (Click for 90° Orthogonal)' : '90° Orthogonal (Click for Curved)'}`}
        >
          <Spline className="w-4 h-4" />
        </button>

        {/* Saved Circuits Modal Icon */}
        <button
          id="navbar-saved-circuits-btn"
          onClick={() => setActiveModal('savedCircuits')}
          className="p-2 rounded-lg bg-[#A58D66]/10 hover:bg-[#A58D66]/20 text-[#DFCCA8] border border-[#A58D66]/30 transition-colors hidden lg:block cursor-pointer"
          title="Saved Circuits Library (Local Storage)"
        >
          <Database className="w-4 h-4 text-[#A58D66]" />
        </button>

        {/* About Team KITT & Lab Guide - Shrunk to the 'i' info symbol (No text) */}
        <button
          id="navbar-about-btn"
          onClick={() => setActiveModal('about')}
          className="p-2 rounded-lg bg-[#A58D66]/10 hover:bg-[#A58D66]/20 text-[#DFCCA8] border border-[#A58D66]/30 transition-colors flex items-center justify-center cursor-pointer"
          title="About Team KITT & Full Lab Guide"
          aria-label="About Team KITT and Lab Guide"
        >
          <Info className="w-4 h-4 text-[#A58D66]" />
        </button>

        {/* Undo / Redo on Tablets & Desktop */}
        <div className={`hidden sm:flex items-center border rounded-lg p-0.5 ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#080f14] border-[#A58D66]/20'}`}>
          <button
            onClick={undo}
            disabled={!canUndo}
            className={`p-1.5 rounded disabled:opacity-30 transition-colors ${isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200' : 'text-[#E5E1DD]/60 hover:text-[#E5E1DD] hover:bg-[#0d171f]'}`}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className={`p-1.5 rounded disabled:opacity-30 transition-colors ${isLight ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200' : 'text-[#E5E1DD]/60 hover:text-[#E5E1DD] hover:bg-[#0d171f]'}`}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Primary Analysis Modals on Extra Wide Screens (2xl) */}
        <div className="hidden 2xl:flex items-center gap-1">
          <button
            onClick={() => setActiveModal('truthTable')}
            className={`p-2 rounded-lg border transition-colors ${defaultBtnClass}`}
            title="Truth Table Generator"
          >
            <Table className="w-4 h-4 text-[#A58D66]" />
          </button>

          <button
            onClick={() => setActiveModal('boolean')}
            className={`p-2 rounded-lg border transition-colors ${defaultBtnClass}`}
            title="Boolean Algebra Solver & Synthesis"
          >
            <FileCode2 className="w-4 h-4 text-[#76B4C2]" />
          </button>

          <button
            onClick={() => setActiveModal('kmap')}
            className={`p-2 rounded-lg border transition-colors ${defaultBtnClass}`}
            title="K-Map Minimization"
          >
            <Sparkles className="w-4 h-4 text-[#407E8C]" />
          </button>

          <button
            onClick={() => setActiveModal('presets')}
            className={`p-2 rounded-lg border transition-colors ${defaultBtnClass}`}
            title="Circuit Presets Library"
          >
            <FolderOpen className="w-4 h-4 text-[#76B4C2]" />
          </button>
        </div>

        {/* Sound FX Toggle Button */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`p-2 rounded-lg border transition-colors hidden xl:block ${
            soundEnabled
              ? 'bg-[#A58D66]/10 border-[#A58D66]/30 text-[#A58D66] hover:bg-[#A58D66]/20'
              : defaultBtnClass
          }`}
          title={soundEnabled ? 'Synthesized Sound FX: ON (Click to Mute)' : 'Synthesized Sound FX: OFF (Click to Unmute)'}
          aria-label="Toggle Sound Effects"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Settings Button - Always rendered and accessible */}
        <button
          id="navbar-settings-btn"
          onClick={() => setActiveModal('settings')}
          className={`p-2 rounded-lg border transition-colors ${defaultBtnClass}`}
          title="Simulator Settings, Audio & Wires"
          aria-label="Simulator Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Google Authentication / User Profile Button & Dropdown */}
        {authUser && userProfile ? (
          <div className="relative" ref={userDropdownRef}>
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className={`flex items-center gap-1.5 p-1 sm:px-2 sm:py-1 rounded-lg border hover:border-[#A58D66]/40 transition-all text-xs font-mono ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                  : 'bg-[#0d171f] hover:bg-[#A58D66]/15 text-[#E5E1DD] border-[#A58D66]/25'
              }`}
              title={
                userProfile.uid.startsWith('guest-')
                  ? `Guest Mode: ${userProfile.displayName} (Click to sign in with Google)`
                  : `Logged in as ${userProfile.displayName} (${authUser.email || 'Google User'})`
              }
            >
              {userProfile.photoURL ? (
                <img
                  src={userProfile.photoURL}
                  alt={userProfile.displayName}
                  className="w-5 h-5 rounded-md object-cover"
                />
              ) : userProfile.uid.startsWith('guest-') ? (
                <div className="w-5 h-5 rounded-md bg-[#76B4C2]/20 text-[#76B4C2] border border-[#76B4C2]/30 font-bold flex items-center justify-center text-[10px]">
                  <Compass className="w-3 h-3" />
                </div>
              ) : (
                <div className="w-5 h-5 rounded-md bg-[#A58D66]/20 text-[#DFCCA8] font-bold flex items-center justify-center text-[10px]">
                  {userProfile.displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <span className="hidden xl:inline font-bold truncate max-w-[85px]">
                {userProfile.displayName}
              </span>
              <ChevronDown className="w-3 h-3 text-[#E5E1DD]/60 hidden sm:block" />
            </button>

            {userDropdownOpen && (
              <div className={`absolute right-0 top-full mt-2 w-64 rounded-2xl border shadow-2xl p-2 z-50 text-xs font-sans backdrop-blur-xl animate-fadeIn ${
                isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#0d171f] border-[#A58D66]/25 text-[#E5E1DD]'
              }`}>
                <div className={`p-3 border-b ${isLight ? 'border-slate-200' : 'border-[#A58D66]/20'}`}>
                  <div className={`font-bold font-mono truncate ${isLight ? 'text-slate-900' : 'text-[#E5E1DD]'}`}>{userProfile.displayName}</div>
                  <div className={`text-[11px] truncate ${isLight ? 'text-[#E5E1DD]/45' : 'text-[#E5E1DD]/60'}`}>
                    {authUser.email || (userProfile.uid.startsWith('guest-') ? 'Guest Sandbox Session' : 'Direct Account')}
                  </div>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-[#A58D66]/15 border border-[#A58D66]/35 text-[#DFCCA8] text-[10px] font-mono">
                      {userProfile.role}
                    </span>
                    {userProfile.uid.startsWith('guest-') && (
                      <span className="inline-block px-2 py-0.5 rounded-md bg-[#76B4C2]/10 border border-[#76B4C2]/30 text-[#76B4C2] text-[10px] font-mono">
                        Guest Mode
                      </span>
                    )}
                  </div>
                </div>

                <div className="py-1 space-y-0.5">
                  {userProfile.uid.startsWith('guest-') && (
                    <button
                      onClick={() => {
                        setLoginViewOpen(true);
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[#DFCCA8] hover:bg-[#A58D66]/10 text-left transition-colors font-semibold"
                    >
                      <LogIn className="w-4 h-4 text-[#A58D66]" />
                      <span>Sign In with Google</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setIsProfileModalOpen(true);
                      setUserDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-colors ${
                      isLight ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100' : 'text-[#DFCCA8] hover:text-[#E5E1DD] hover:bg-[#A58D66]/15'
                    }`}
                  >
                    <User className="w-4 h-4 text-[#A58D66]" />
                    <span>Edit Lab Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveModal('about');
                      setUserDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-colors ${
                      isLight ? 'text-slate-700 hover:text-slate-900 hover:bg-slate-100' : 'text-[#DFCCA8] hover:text-[#E5E1DD] hover:bg-[#0d171f]/80'
                    }`}
                  >
                    <Star className="w-4 h-4 text-[#A58D66]" />
                    <span>Community Reviews & Ratings</span>
                  </button>

                  <button
                    onClick={() => {
                      logout();
                      setUserDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-colors ${
                      isLight ? 'text-[#8C7654] hover:bg-[#A58D66]/10' : 'text-[#DFCCA8] hover:bg-[#A58D66]/15'
                    }`}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{userProfile.uid.startsWith('guest-') ? 'Exit Guest Mode' : 'Sign Out'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => setLoginViewOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#A58D66] hover:bg-[#DFCCA8] text-[#080f14] font-bold text-[11px] shadow-sm transition-all active:scale-95 cursor-pointer"
            title="Sign In with Google"
          >
            {/* Google SVG G icon */}
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
              <path
                fill="#080f14"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#080f14"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#080f14"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#080f14"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span className="hidden md:inline">Sign In</span>
          </button>
        )}

        {/* Permanent '...' / All Features Dropdown Menu (Accessible on all screen sizes & fullscreen) */}
        <div className="relative" ref={toolsMenuRef}>
          <button
            onClick={() => setToolsDropdownOpen((prev) => !prev)}
            className={`p-2 rounded-lg border transition-all shadow-xs ${
              toolsDropdownOpen
                ? 'bg-[#A58D66]/20 border-[#A58D66]/40 text-[#DFCCA8]'
                : defaultBtnClass
            }`}
            title="All Features & Analysis Tools"
            aria-label="Open features and analysis menu"
            aria-expanded={toolsDropdownOpen}
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {toolsDropdownOpen && (
            <div
              className={`absolute right-0 top-full mt-2 w-72 sm:w-80 border rounded-xl shadow-2xl p-2 z-50 text-xs space-y-1 backdrop-blur-xl animate-fade-in touch-auto max-h-[calc(100vh-4.5rem)] overflow-y-auto overscroll-contain ${
                isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#0d171f] border-[#A58D66]/25 text-[#E5E1DD]'
              }`}
            >
              <div className="px-2 py-1 text-[10px] font-bold text-[#A58D66] uppercase tracking-wider flex items-center justify-between">
                <span>⚡ All Circuit Features</span>
                <span className={`text-[9px] ${isLight ? 'text-[#E5E1DD]/60' : 'text-[#E5E1DD]/45'}`}>Quick Access</span>
              </div>
              <button
                onClick={() => {
                  setActiveModal('collaborate');
                  setToolsDropdownOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-2.5 py-2 text-left rounded-lg text-[#DFCCA8] bg-[#A58D66]/10 border border-[#A58D66]/20 transition-colors font-semibold ${
                  isLight ? 'hover:bg-[#A58D66]/15' : 'hover:bg-[#A58D66]/20'
                }`}
              >
                <Users className="w-4 h-4 text-[#A58D66]" />
                <div>
                  <div className="font-semibold">
                    {isCollaborating ? `Active Room: ${roomCode}` : 'Live Real-Time Room (Create/Join)'}
                  </div>
                  <div className={`text-[10px] ${isLight ? 'text-[#E5E1DD]/45' : 'text-[#E5E1DD]/60'}`}>Collaborate simultaneously with zero lag</div>
                </div>
              </button>
              <button
                onClick={() => {
                  setActiveModal('tutorial');
                  setToolsDropdownOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-2.5 py-2 text-left rounded-lg text-cyan-600 bg-[#76B4C2]/10 border border-[#76B4C2]/20 transition-colors font-semibold ${
                  isLight ? 'hover:bg-[#76B4C2]/15' : 'hover:bg-[#0d171f]/80 text-cyan-300'
                }`}
              >
                <Compass className="w-4 h-4 text-[#76B4C2]" />
                <div>
                  <div className="font-semibold">Quick Start Guide & Tutorial</div>
                  <div className={`text-[10px] ${isLight ? 'text-[#E5E1DD]/45' : 'text-[#E5E1DD]/60'}`}>PC mouse & tablet touch controls overview</div>
                </div>
              </button>
              <button
                onClick={() => {
                  setActiveModal('settings');
                  setToolsDropdownOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-2.5 py-2 text-left rounded-lg text-[#DFCCA8] bg-[#A58D66]/10 transition-colors font-semibold ${
                  isLight ? 'hover:bg-[#A58D66]/15' : 'hover:bg-[#A58D66]/20'
                }`}
              >
                <Settings className="w-4 h-4 text-[#A58D66]" />
                <div>
                  <div>Settings & Preferences</div>
                  <div className={`text-[10px] ${isLight ? 'text-[#E5E1DD]/45' : 'text-[#E5E1DD]/60'}`}>Curved wires, audio & simulation preferences</div>
                </div>
              </button>
              <button
                onClick={() => {
                  setWireRoutingMode(wireRoutingMode === 'orthogonal' ? 'curved' : 'orthogonal');
                  setToolsDropdownOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-2.5 py-2 text-left rounded-lg transition-colors ${
                  isLight ? 'hover:bg-slate-100 text-slate-800' : 'hover:bg-[#0d171f]/80 text-cyan-300 hover:text-cyan-200'
                }`}
              >
                <Spline className="w-4 h-4 text-[#76B4C2]" />
                <div>
                  <div className="font-semibold">
                    Toggle Wire Style: {wireRoutingMode === 'orthogonal' ? 'Curved' : 'Orthogonal'}
                  </div>
                  <div className={`text-[10px] ${isLight ? 'text-[#E5E1DD]/45' : 'text-[#E5E1DD]/60'}`}>
                    Switch between 90° Manhattan and fluid bezier curves
                  </div>
                </div>
              </button>
              <button
                onClick={() => {
                  setActiveModal('truthTable');
                  setToolsDropdownOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-2.5 py-2 text-left rounded-lg hover:text-[#DFCCA8] transition-colors ${
                  isLight ? 'hover:bg-slate-100 text-slate-800' : 'hover:bg-[#A58D66]/15 text-[#E5E1DD]'
                }`}
              >
                <Table className="w-4 h-4 text-[#A58D66]" />
                <div>
                  <div className="font-semibold">Truth Table Generator</div>
                  <div className={`text-[10px] ${isLight ? 'text-[#E5E1DD]/45' : 'text-[#E5E1DD]/60'}`}>Generate full combinatorial state table</div>
                </div>
              </button>
              <button
                onClick={() => {
                  setActiveModal('boolean');
                  setToolsDropdownOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-2.5 py-2 text-left rounded-lg hover:text-[#76B4C2] transition-colors ${
                  isLight ? 'hover:bg-slate-100 text-slate-800' : 'hover:bg-[#0d171f]/80 text-[#E5E1DD]'
                }`}
              >
                <FileCode2 className="w-4 h-4 text-[#76B4C2]" />
                <div>
                  <div className="font-semibold">Boolean Solver & Synthesis</div>
                  <div className={`text-[10px] ${isLight ? 'text-[#E5E1DD]/45' : 'text-[#E5E1DD]/60'}`}>Live as-you-type circuit synthesis & derivation</div>
                </div>
              </button>
              <button
                onClick={() => {
                  setActiveModal('kmap');
                  setToolsDropdownOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-2.5 py-2 text-left rounded-lg hover:text-[#407E8C] transition-colors ${
                  isLight ? 'hover:bg-slate-100 text-slate-800' : 'hover:bg-[#0d171f]/80 text-[#E5E1DD]'
                }`}
              >
                <Sparkles className="w-4 h-4 text-[#407E8C]" />
                <div>
                  <div className="font-semibold">Karnaugh Map (K-Map)</div>
                  <div className={`text-[10px] ${isLight ? 'text-[#E5E1DD]/45' : 'text-[#E5E1DD]/60'}`}>Visual Gray-code minimization</div>
                </div>
              </button>
              <button
                onClick={() => {
                  setActiveModal('oscilloscope');
                  setToolsDropdownOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-2.5 py-2 text-left rounded-lg hover:text-[#A58D66] transition-colors ${
                  isLight ? 'hover:bg-slate-100 text-slate-800' : 'hover:bg-[#0d171f]/80 text-[#E5E1DD]'
                }`}
              >
                <Activity className="w-4 h-4 text-[#A58D66]" />
                <div>
                  <div className="font-semibold">Timing Oscilloscope</div>
                  <div className={`text-[10px] ${isLight ? 'text-[#E5E1DD]/45' : 'text-[#E5E1DD]/60'}`}>Multi-channel logic analyzer</div>
                </div>
              </button>

              <div className={`h-px my-1 ${isLight ? 'bg-slate-200' : 'bg-[#0d171f]'}`} />
              <div className="px-2 py-1 text-[10px] font-bold text-[#76B4C2] uppercase tracking-wider">
                Library & Learning
              </div>
              <button
                onClick={() => {
                  setActiveModal('savedCircuits');
                  setToolsDropdownOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-left rounded-lg text-[#DFCCA8] transition-colors font-semibold ${
                  isLight ? 'hover:bg-slate-100' : 'hover:bg-[#A58D66]/15'
                }`}
              >
                <Database className="w-4 h-4 text-[#A58D66]" />
                <span>Saved Circuits Manager (Local Storage)</span>
              </button>
              <button
                onClick={() => {
                  setActiveModal('presets');
                  setToolsDropdownOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-left rounded-lg hover:text-[#76B4C2] transition-colors ${
                  isLight ? 'hover:bg-slate-100 text-slate-800' : 'hover:bg-[#0d171f]/80 text-[#E5E1DD]'
                }`}
              >
                <FolderOpen className="w-4 h-4 text-[#76B4C2]" />
                <span>Circuit Presets Library</span>
              </button>
              <button
                onClick={() => {
                  setActiveModal('challenges');
                  setToolsDropdownOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-left rounded-lg text-[#A58D66] hover:bg-[#A58D66]/10 transition-colors ${
                  isLight ? 'hover:bg-amber-50' : 'hover:bg-[#0d171f]/80'
                }`}
              >
                <Award className="w-4 h-4 text-[#A58D66]" />
                <span>Interactive Challenges</span>
              </button>
              <button
                onClick={() => {
                  setActiveModal('learn');
                  setToolsDropdownOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-left rounded-lg hover:text-[#DFCCA8] transition-colors ${
                  isLight ? 'hover:bg-slate-100 text-slate-800' : 'hover:bg-[#A58D66]/15 text-[#DFCCA8]'
                }`}
              >
                <BookOpen className="w-4 h-4 text-[#A58D66]" />
                <span>Logic Gates Educational Guide</span>
              </button>

              <div className={`h-px my-1 ${isLight ? 'bg-slate-200' : 'bg-[#0d171f]'}`} />
              <div className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-[#E5E1DD]/45' : 'text-[#E5E1DD]/60'}`}>
                Edit & Wire Controls
              </div>
              <button
                onClick={() => {
                  setSoundEnabled(!soundEnabled);
                  setToolsDropdownOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-left rounded-lg text-[#A58D66] transition-colors ${
                  isLight ? 'hover:bg-slate-100' : 'hover:bg-[#0d171f]/80'
                }`}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-[#A58D66]" /> : <VolumeX className="w-4 h-4 text-[#E5E1DD]/60" />}
                <span>Sound FX: {soundEnabled ? 'Enabled' : 'Muted'}</span>
              </button>
              <button
                onClick={() => {
                  autoArrange();
                  setToolsDropdownOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-left rounded-lg hover:text-[#76B4C2] transition-colors ${
                  isLight ? 'hover:bg-slate-100 text-slate-800' : 'hover:bg-[#0d171f]/80 text-[#DFCCA8]'
                }`}
              >
                <Network className="w-4 h-4" />
                <span>Auto-Arrange Circuit Layout</span>
              </button>
              <button
                onClick={() => {
                  deleteSelection();
                  setToolsDropdownOpen(false);
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 hover:bg-[#A58D66]/20 text-left rounded-lg text-[#A58D66] transition-colors font-semibold"
              >
                <Trash2 className="w-4 h-4 text-[#A58D66]" />
                <span>
                  Delete Selected Items (
                  {selection.wireIds.length + selection.componentIds.length})
                </span>
              </button>
              <button
                onClick={() => {
                  clearCanvas();
                  setToolsDropdownOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-left rounded-lg text-[#A58D66] transition-colors ${
                  isLight ? 'hover:bg-slate-100' : 'hover:bg-[#0d171f]/80'
                }`}
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear Canvas</span>
              </button>
              <button
                onClick={() => {
                  selectAllWires();
                  setToolsDropdownOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-left rounded-lg text-[#DFCCA8] transition-colors ${
                  isLight ? 'hover:bg-slate-100' : 'hover:bg-[#A58D66]/15'
                }`}
              >
                <Zap className="w-4 h-4 text-[#76B4C2]" />
                <span>Select All Wires ({wires.length})</span>
              </button>
              <button
                onClick={() => { undo(); setToolsDropdownOpen(false); }}
                disabled={!canUndo}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-left rounded-lg disabled:opacity-30 transition-colors ${
                  isLight ? 'hover:bg-slate-100 text-slate-800' : 'hover:bg-[#0d171f]/80 text-[#E5E1DD]'
                }`}
              >
                <Undo2 className="w-4 h-4" />
                <span>Undo (Ctrl+Z)</span>
              </button>
              <button
                onClick={() => { redo(); setToolsDropdownOpen(false); }}
                disabled={!canRedo}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-left rounded-lg disabled:opacity-30 transition-colors ${
                  isLight ? 'hover:bg-slate-100 text-slate-800' : 'hover:bg-[#0d171f]/80 text-[#E5E1DD]'
                }`}
              >
                <Redo2 className="w-4 h-4" />
                <span>Redo (Ctrl+Y)</span>
              </button>

              <div className={`h-px my-1 ${isLight ? 'bg-slate-200' : 'bg-[#0d171f]'}`} />
              <div className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${isLight ? 'text-[#E5E1DD]/45' : 'text-[#E5E1DD]/60'}`}>
                File Storage & Export
              </div>
              <button
                onClick={() => setActiveModal('savedCircuits')}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-left rounded-lg text-[#DFCCA8] transition-colors ${
                  isLight ? 'hover:bg-slate-100' : 'hover:bg-[#A58D66]/15'
                }`}
              >
                <Database className="w-4 h-4 text-[#A58D66]" />
                <span>Saved Circuits Manager</span>
              </button>
              <button
                onClick={handleExport}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-left rounded-lg transition-colors ${
                  isLight ? 'hover:bg-slate-100 text-slate-800' : 'hover:bg-[#0d171f]/80 text-[#E5E1DD]'
                }`}
              >
                <Download className="w-4 h-4 text-[#E5E1DD]/60" />
                <span>Export Circuit (JSON)</span>
              </button>
              <button
                onClick={handleTriggerImport}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-left rounded-lg transition-colors ${
                  isLight ? 'hover:bg-slate-100 text-slate-800' : 'hover:bg-[#0d171f]/80 text-[#E5E1DD]'
                }`}
              >
                <Upload className="w-4 h-4 text-[#E5E1DD]/60" />
                <span>Import Circuit (JSON)</span>
              </button>
              <button
                onClick={() => {
                  setActiveModal('shortcuts');
                  setToolsDropdownOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-left rounded-lg transition-colors ${
                  isLight ? 'hover:bg-slate-100 text-slate-800' : 'hover:bg-[#0d171f]/80 text-[#E5E1DD]'
                }`}
              >
                <HelpCircle className="w-4 h-4 text-[#E5E1DD]/60" />
                <span>Keyboard Shortcuts & Touch Gestures</span>
              </button>

              <div className={`h-px my-1 ${isLight ? 'bg-slate-200' : 'bg-[#0d171f]'}`} />
              <button
                onClick={() => {
                  setToolsDropdownOpen(false);
                  setActiveModal('about');
                }}
                className={`w-full flex items-center gap-2 px-2.5 py-2 text-left rounded-lg bg-[#A58D66]/10 border border-[#A58D66]/20 transition-colors font-semibold ${
                  isLight ? 'hover:bg-[#A58D66]/15 text-slate-900' : 'hover:bg-[#A58D66]/20 text-[#E5E1DD]'
                }`}
              >
                <Sparkles className="w-4 h-4 text-[#A58D66]" />
                <div>
                  <div className="font-bold text-xs text-[#DFCCA8]">About Team KITT & Lab Guide</div>
                  <div className={`text-[10px] ${isLight ? 'text-[#E5E1DD]/45' : 'text-[#E5E1DD]/60'}`}>Team KITT, Component Catalog, Reviews</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Hidden persistent file input for JSON import */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleImportFile}
          className="hidden"
        />

        {/* Toggle Inspector Drawer Button */}
        <button
          onClick={toggleInspector}
          style={
            inspectorOpen
              ? {
                  backgroundColor: `${activeTheme.primaryColor}22`,
                  borderColor: `${activeTheme.primaryColor}55`,
                  color: activeTheme.primaryColor,
                }
              : {}
          }
          className={`p-2 rounded-lg border transition-colors ${
            inspectorOpen
              ? ''
              : defaultBtnClass
          }`}
          title="Toggle Property Inspector"
        >
          <Sliders className="w-4 h-4" />
        </button>
      </div>

      {/* Floating Export Toast Notification */}
      {exportNotice && (
        <div className={`fixed top-16 right-6 z-50 border text-xs px-3 py-2 rounded-lg shadow-xl flex items-center gap-2 animate-fade-in ${
          isLight ? 'bg-white border-[#A58D66] text-[#A58D66]' : 'bg-[#0d171f] border-[#A58D66] text-[#DFCCA8]'
        }`}>
          <Check className="w-4 h-4 text-[#A58D66]" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* User Profile Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </header>
  );
};
