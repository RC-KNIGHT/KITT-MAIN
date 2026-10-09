/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useCircuit } from '../../context/CircuitContext';
import { useCollaboration } from '../../context/CollaborationContext';
import { THEME_PRESETS } from '../../theme/themes';
import {
  Activity,
  Award,
  BookOpen,
  Box,
  Compass,
  Cpu,
  Database,
  FileCode2,
  FolderOpen,
  Grid,
  Maximize2,
  Menu,
  Minus,
  MoreHorizontal,
  Network,
  Pause,
  Play,
  Plus,
  Redo2,
  RotateCcw,
  RotateCw,
  Settings,
  Sliders,
  Sparkles,
  Spline,
  StepForward,
  Table,
  Trash2,
  Undo2,
  Users,
  X,
  Zap,
} from 'lucide-react';

export const MobileBottomDock: React.FC = () => {
  const {
    theme,
    colorMode,
    simulationRunning,
    toggleSimulation,
    stepSimulation,
    resetSimulation,
    simulationSpeedHz,
    setSimulationSpeedHz,
    undo,
    redo,
    canUndo,
    canRedo,
    selection,
    deleteSelection,
    clearCanvas,
    autoArrange,
    rotateSelection,
    flipSelection,
    duplicateSelection,
    sidebarOpen,
    toggleSidebar,
    inspectorOpen,
    toggleInspector,
    setActiveModal,
    wireRoutingMode,
    setWireRoutingMode,
    camera,
    setCamera,
    fitToScreen,
    snapToGrid,
    setSnapToGrid,
  } = useCircuit();

  const { isCollaborating, roomCode, currentUser, collaborators } = useCollaboration();
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const activeTheme = THEME_PRESETS[theme] || THEME_PRESETS.kitt_sovereign;
  const isLight = colorMode === 'light';

  const totalSelected = selection.wireIds.length + selection.componentIds.length;
  const hasSelection = totalSelected > 0;

  const handleZoom = (type: 'in' | 'out' | 'reset') => {
    if (type === 'reset') {
      fitToScreen();
      return;
    }
    const factor = type === 'in' ? 1.25 : 0.8;
    const newZoom = Math.min(2.5, Math.max(0.3, camera.zoom * factor));
    setCamera((prev) => ({ ...prev, zoom: newZoom }));
  };

  return (
    <>
      {/* Sleek Floating Dock for Mobile Phones (Hidden on md/lg/tablets) */}
      <div className="fixed bottom-3 inset-x-3 z-30 md:hidden pointer-events-none select-none">
        <div className={`backdrop-blur-xl border rounded-2xl shadow-xl p-1.5 flex items-center justify-between pointer-events-auto gap-1 ${
          isLight
            ? 'bg-white/95 border-slate-300 shadow-[0_8px_32px_rgba(0,0,0,0.12)]'
            : 'bg-[#000000]/95 border-[#FFFFFF]/20 shadow-[0_8px_32px_rgba(0,0,0,0.6)]'
        }`}>
          {/* Left: Library Toggle (+ Gate) */}
          <button
            onClick={toggleSidebar}
            style={
              sidebarOpen
                ? {
                    backgroundColor: `${activeTheme.primaryColor}25`,
                    borderColor: `${activeTheme.primaryColor}55`,
                    color: activeTheme.primaryColor,
                  }
                : {}
            }
            className={`flex items-center justify-center w-11 h-11 rounded-xl font-bold transition-transform active:scale-95 border ${
              sidebarOpen
                ? 'border'
                : 'bg-[#FFFFFF]/20 border-[#FFFFFF]/40 text-[#E8E8E8]'
            }`}
            title="Open Component Library"
            aria-label="Add Logic Gates"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Center Group: Simulation Engine Controls */}
          <div className={`flex items-center border rounded-xl p-0.5 gap-0.5 ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#000000]/90 border-[#FFFFFF]/20'
          }`}>
            {/* Play / Pause Toggle */}
            <button
              onClick={() => toggleSimulation()}
              style={
                simulationRunning
                  ? {
                      backgroundColor: `${activeTheme.primaryColor}30`,
                      color: activeTheme.primaryColor,
                    }
                  : {}
              }
              className={`flex items-center justify-center w-10 h-10 rounded-lg font-black transition-transform active:scale-90 ${
                simulationRunning
                  ? 'border border-[#FFFFFF]/40'
                  : 'bg-[#FFFFFF]/20 text-[#FFFFFF] border border-[#FFFFFF]/40'
              }`}
              title={simulationRunning ? 'Pause Engine' : 'Run Engine'}
            >
              {simulationRunning ? (
                <Pause className="w-4 h-4" style={{ fill: activeTheme.primaryColor }} />
              ) : (
                <Play className="w-4 h-4 fill-[#FFFFFF] text-[#FFFFFF] ml-0.5" />
              )}
            </button>

            {/* Step Clock Button */}
            <button
              onClick={stepSimulation}
              disabled={simulationRunning}
              className={`flex items-center justify-center w-9 h-10 rounded-lg disabled:opacity-25 transition-all active:scale-90 ${
                isLight ? 'text-slate-600 hover:text-slate-900 active:bg-slate-200' : 'text-[#F5F5F5]/60 hover:text-[#F5F5F5] active:bg-[#141415]'
              }`}
              title="Single Clock Step"
            >
              <StepForward className="w-4 h-4" />
            </button>

            {/* Reset Signals Button */}
            <button
              onClick={resetSimulation}
              className={`flex items-center justify-center w-9 h-10 rounded-lg transition-all active:scale-90 ${
                isLight ? 'text-slate-600 hover:text-slate-900 active:bg-slate-200' : 'text-[#F5F5F5]/60 hover:text-[#F5F5F5] active:bg-[#141415]'
              }`}
              title="Reset Circuit Signals"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Speed Cycle Button */}
            <button
              onClick={() => {
                const speeds = [1, 5, 10, 20, 30];
                const nextIdx = (speeds.indexOf(simulationSpeedHz) + 1) % speeds.length;
                setSimulationSpeedHz(speeds[nextIdx] || 10);
              }}
              className={`flex items-center justify-center px-2 h-10 rounded-lg text-[#FFFFFF] font-mono text-[11px] font-bold border-l active:scale-95 ${
                isLight ? 'border-slate-200 active:bg-slate-200' : 'border-[#FFFFFF]/20 active:bg-[#141415]'
              }`}
              title="Simulation Speed"
            >
              {simulationSpeedHz}Hz
            </button>
          </div>

          {/* Right Action Group: Selection or More Tools */}
          <div className="flex items-center gap-1">
            {hasSelection ? (
              <>
                <button
                  onClick={rotateSelection}
                  className={`flex items-center justify-center w-9 h-10 border rounded-lg active:scale-90 ${
                    isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-[#000000] border-[#FFFFFF]/20 text-[#F5F5F5]'
                  }`}
                  title="Rotate Gate"
                >
                  <RotateCw className="w-4 h-4 text-[#FFFFFF]" />
                </button>
                <button
                  onClick={deleteSelection}
                  className="flex items-center justify-center w-10 h-10 bg-[#FFFFFF]/20 border border-[#FFFFFF]/40 text-[#E8E8E8] rounded-lg active:scale-90 relative"
                  title="Delete Selection"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="absolute -top-1 -right-1 px-1 bg-[#737373] text-[#F5F5F5] text-[9px] font-bold rounded-full">
                    {totalSelected}
                  </span>
                </button>
              </>
            ) : (
              <>
                {/* Undo touch button */}
                <button
                  onClick={undo}
                  disabled={!canUndo}
                  className={`flex items-center justify-center w-9 h-10 border rounded-lg disabled:opacity-25 active:scale-90 ${
                    isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-[#000000] border-[#FFFFFF]/20 text-[#E8E8E8]'
                  }`}
                  title="Undo"
                >
                  <Undo2 className="w-4 h-4" />
                </button>

                {/* Inspector Drawer Toggle */}
                <button
                  onClick={toggleInspector}
                  style={
                    inspectorOpen
                      ? {
                          backgroundColor: `${activeTheme.primaryColor}25`,
                          borderColor: `${activeTheme.primaryColor}55`,
                          color: activeTheme.primaryColor,
                        }
                      : {}
                  }
                  className={`flex items-center justify-center w-9 h-10 rounded-lg border ${
                    inspectorOpen
                      ? 'border'
                      : isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-[#000000] border-[#FFFFFF]/20 text-[#E8E8E8]'
                  }`}
                  title="Inspector & Properties"
                >
                  <Sliders className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Mobile Sheet Opener (More Tools) */}
            <button
              onClick={() => setMobileSheetOpen(true)}
              className={`flex items-center justify-center w-10 h-10 border rounded-xl active:scale-95 transition-transform ${
                isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700' : 'bg-[#000000] hover:bg-[#141415] border-[#FFFFFF]/20 text-[#F5F5F5]'
              }`}
              title="All Tools & Analysis"
              aria-label="Open mobile menu"
            >
              <MoreHorizontal className="w-5 h-5 text-[#FFFFFF]" />
            </button>
          </div>
        </div>
      </div>

      {/* Full-Screen Smooth Bottom Sheet Modal for Mobile Phones */}
      {mobileSheetOpen && (
        <div
          className="fixed inset-0 z-50 md:hidden flex flex-col justify-end bg-[#000000]/70 backdrop-blur-sm animate-fade-in"
          onClick={() => setMobileSheetOpen(false)}
        >
          <div
            className={`w-full border-t rounded-t-3xl p-4 max-h-[85vh] overflow-y-auto overscroll-contain flex flex-col gap-4 shadow-2xl touch-auto ${
              isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-[#141415] border-[#FFFFFF]/20 text-[#F5F5F5]'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Grab Handle */}
            <div className={`w-12 h-1 rounded-full mx-auto -mt-1 mb-1 ${isLight ? 'bg-slate-300' : 'bg-[#000000]'}`} />

            <div className={`flex items-center justify-between pb-2 border-b ${isLight ? 'border-slate-200' : 'border-[#FFFFFF]/20'}`}>
              <div className="flex items-center gap-2">
                <div
                  style={{
                    backgroundColor: `${activeTheme.primaryColor}20`,
                    borderColor: `${activeTheme.primaryColor}40`,
                    color: activeTheme.primaryColor,
                  }}
                  className="w-8 h-8 rounded-lg border flex items-center justify-center"
                >
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <div className={`font-bold text-sm font-mono ${isLight ? 'text-slate-900' : 'text-[#F5F5F5]'}`}>DigiLogic Lab</div>
                  <div className={`text-[11px] ${isLight ? 'text-[#F5F5F5]/45' : 'text-[#F5F5F5]/60'}`}>Mobile Circuit Studio</div>
                </div>
              </div>
              <button
                onClick={() => setMobileSheetOpen(false)}
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isLight ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-[#000000] text-[#F5F5F5]/60'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Live Collaboration Room */}
            <div className={`border rounded-xl p-3 flex items-center justify-between ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#000000]/80 border-[#FFFFFF]/20'
            }`}>
              <div className="flex items-center gap-2.5">
                <Users className="w-5 h-5 text-[#FFFFFF]" />
                <div>
                  <div className={`font-bold text-xs ${isLight ? 'text-slate-800' : 'text-[#F5F5F5]'}`}>
                    {isCollaborating ? `Room: ${roomCode}` : 'Live Multiplayer'}
                  </div>
                  <div className={`text-[10px] ${isLight ? 'text-[#F5F5F5]/45' : 'text-[#F5F5F5]/60'}`}>
                    {isCollaborating ? `${collaborators.length + 1} active members` : 'Connect & design together'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveModal('collaborate');
                  setMobileSheetOpen(false);
                }}
                className="px-3 py-1.5 bg-[#FFFFFF]/20 hover:bg-[#FFFFFF]/30 text-[#E8E8E8] border border-[#FFFFFF]/40 rounded-lg text-xs font-bold"
              >
                {isCollaborating ? 'Manage Room' : 'Join / Host'}
              </button>
            </div>

            {/* Quick Canvas View & Navigation Tools */}
            <div>
              <div className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${isLight ? 'text-[#F5F5F5]/45' : 'text-[#F5F5F5]/60'}`}>
                Canvas View & Snapping
              </div>
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => handleZoom('in')}
                  className={`flex flex-col items-center justify-center p-2.5 border rounded-xl active:scale-95 ${
                    isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700' : 'bg-[#000000] border-[#FFFFFF]/20 text-[#E8E8E8]'
                  }`}
                >
                  <span className="text-xs font-bold font-mono">+{Math.round(camera.zoom * 100)}%</span>
                  <span className={`text-[9px] ${isLight ? 'text-[#F5F5F5]/45' : 'text-[#F5F5F5]/60'}`}>Zoom In</span>
                </button>
                <button
                  onClick={() => handleZoom('out')}
                  className={`flex flex-col items-center justify-center p-2.5 border rounded-xl active:scale-95 ${
                    isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700' : 'bg-[#000000] border-[#FFFFFF]/20 text-[#E8E8E8]'
                  }`}
                >
                  <span className="text-xs font-bold font-mono">Zoom -</span>
                  <span className={`text-[9px] ${isLight ? 'text-[#F5F5F5]/45' : 'text-[#F5F5F5]/60'}`}>Zoom Out</span>
                </button>
                <button
                  onClick={() => handleZoom('reset')}
                  className={`flex flex-col items-center justify-center p-2.5 border rounded-xl active:scale-95 ${
                    isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700' : 'bg-[#000000] border-[#FFFFFF]/20 text-[#E8E8E8]'
                  }`}
                >
                  <Maximize2 className="w-4 h-4 text-[#B4B4B4]" />
                  <span className={`text-[9px] ${isLight ? 'text-[#F5F5F5]/45' : 'text-[#F5F5F5]/60'}`}>Fit Screen</span>
                </button>
                <button
                  onClick={() => setSnapToGrid(!snapToGrid)}
                  className={`flex flex-col items-center justify-center p-2.5 border rounded-xl ${
                    snapToGrid
                      ? 'bg-[#FFFFFF]/20 border-[#FFFFFF]/40 text-[#E8E8E8]'
                      : isLight ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-[#000000] border-[#FFFFFF]/20 text-[#F5F5F5]/60'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                  <span className="text-[9px]">Grid Snap</span>
                </button>
              </div>
            </div>

            {/* Global Actions */}
            <div>
              <div className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${isLight ? 'text-[#F5F5F5]/45' : 'text-[#F5F5F5]/60'}`}>
                Canvas Editing
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  id="mobile-auto-arrange-btn"
                  onClick={() => {
                    autoArrange();
                    setMobileSheetOpen(false);
                  }}
                  className={`flex items-center gap-2.5 p-3 border rounded-xl text-left active:scale-95 ${
                    isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-200' : 'bg-[#000000] border-[#FFFFFF]/20'
                  }`}
                >
                  <Network className="w-4 h-4 text-[#B4B4B4] shrink-0" />
                  <div>
                    <div className={`text-xs font-bold ${isLight ? 'text-slate-800' : 'text-[#F5F5F5]'}`}>Auto-Arrange</div>
                    <div className={`text-[10px] ${isLight ? 'text-[#F5F5F5]/45' : 'text-[#F5F5F5]/60'}`}>Clean up layout</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    clearCanvas();
                    setMobileSheetOpen(false);
                  }}
                  className={`flex items-center gap-2.5 p-3 border rounded-xl text-left active:scale-95 hover:bg-[#FFFFFF]/10 ${
                    isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-200' : 'bg-[#000000] border-[#FFFFFF]/20'
                  }`}
                >
                  <Trash2 className="w-4 h-4 text-[#E8E8E8] shrink-0" />
                  <div>
                    <div className={`text-xs font-bold ${isLight ? 'text-slate-800' : 'text-[#F5F5F5]'}`}>Clear Canvas</div>
                    <div className={`text-[10px] ${isLight ? 'text-[#F5F5F5]/45' : 'text-[#F5F5F5]/60'}`}>Delete everything</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Wire Routing Selection */}
            <div>
              <div className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${isLight ? 'text-[#F5F5F5]/45' : 'text-[#F5F5F5]/60'}`}>
                Wire Connection Routing
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setWireRoutingMode('orthogonal')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 ${
                    wireRoutingMode === 'orthogonal'
                      ? 'bg-[#FFFFFF]/20 border-[#FFFFFF]/40 text-[#E8E8E8] font-bold'
                      : isLight ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-[#000000] border-[#FFFFFF]/20 text-[#F5F5F5]/60'
                  }`}
                >
                  <span className="text-xs">90° Manhattan</span>
                  <span className={`text-[9px] ${isLight ? 'text-[#F5F5F5]/45' : 'text-[#F5F5F5]/45'}`}>Orthogonal</span>
                </button>
                <button
                  onClick={() => setWireRoutingMode('curved')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 ${
                    wireRoutingMode === 'curved'
                      ? 'bg-[#B4B4B4]/20 border-[#B4B4B4]/40 text-[#B4B4B4] font-bold'
                      : isLight ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-[#000000] border-[#FFFFFF]/20 text-[#F5F5F5]/60'
                  }`}
                >
                  <Spline className="w-4 h-4" />
                  <span className={`text-[9px] ${isLight ? 'text-[#F5F5F5]/45' : 'text-[#F5F5F5]/45'}`}>Smooth Curves</span>
                </button>
                <button
                  onClick={() => setWireRoutingMode('straight')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 ${
                    wireRoutingMode === 'straight'
                      ? 'bg-[#B4B4B4]/20 border-[#8F8F8F]/40 text-[#B4B4B4] font-bold'
                      : isLight ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-[#000000] border-[#FFFFFF]/20 text-[#F5F5F5]/60'
                  }`}
                >
                  <Minus className="w-4 h-4" />
                  <span className={`text-[9px] ${isLight ? 'text-[#F5F5F5]/45' : 'text-[#F5F5F5]/45'}`}>Straight Lines</span>
                </button>
              </div>
            </div>

            {/* Digital Analysis & Logic Tools */}
            <div>
              <div className="text-[10px] font-bold text-[#E8E8E8] uppercase tracking-wider mb-2">
                Digital Analysis & Tools
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setActiveModal('truthTable');
                    setMobileSheetOpen(false);
                  }}
                  className={`flex items-center gap-2.5 p-3 border rounded-xl text-left active:scale-95 ${
                    isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-200' : 'bg-[#000000] border-[#FFFFFF]/20'
                  }`}
                >
                  <Table className="w-4 h-4 text-[#FFFFFF] shrink-0" />
                  <div>
                    <div className={`text-xs font-bold ${isLight ? 'text-slate-800' : 'text-[#F5F5F5]'}`}>Truth Table</div>
                    <div className={`text-[10px] ${isLight ? 'text-[#F5F5F5]/45' : 'text-[#F5F5F5]/60'}`}>All Input States</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setActiveModal('boolean');
                    setMobileSheetOpen(false);
                  }}
                  className={`flex items-center gap-2.5 p-3 border rounded-xl text-left active:scale-95 ${
                    isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-200' : 'bg-[#000000] border-[#FFFFFF]/20'
                  }`}
                >
                  <FileCode2 className="w-4 h-4 text-[#B4B4B4] shrink-0" />
                  <div>
                    <div className={`text-xs font-bold ${isLight ? 'text-slate-800' : 'text-[#F5F5F5]'}`}>Boolean Algebra</div>
                    <div className={`text-[10px] ${isLight ? 'text-[#F5F5F5]/45' : 'text-[#F5F5F5]/60'}`}>Equation Solver</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setActiveModal('kmap');
                    setMobileSheetOpen(false);
                  }}
                  className={`flex items-center gap-2.5 p-3 border rounded-xl text-left active:scale-95 ${
                    isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-200' : 'bg-[#000000] border-[#FFFFFF]/20'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-[#8F8F8F] shrink-0" />
                  <div>
                    <div className={`text-xs font-bold ${isLight ? 'text-slate-800' : 'text-[#F5F5F5]'}`}>K-Map Minimizer</div>
                    <div className={`text-[10px] ${isLight ? 'text-[#F5F5F5]/45' : 'text-[#F5F5F5]/60'}`}>Visual SOP / POS</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setActiveModal('oscilloscope');
                    setMobileSheetOpen(false);
                  }}
                  className={`flex items-center gap-2.5 p-3 border rounded-xl text-left active:scale-95 ${
                    isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-200' : 'bg-[#000000] border-[#FFFFFF]/20'
                  }`}
                >
                  <Activity className="w-4 h-4 text-[#FFFFFF] shrink-0" />
                  <div>
                    <div className={`text-xs font-bold ${isLight ? 'text-slate-800' : 'text-[#F5F5F5]'}`}>Oscilloscope</div>
                    <div className={`text-[10px] ${isLight ? 'text-[#F5F5F5]/45' : 'text-[#F5F5F5]/60'}`}>Timing Diagram</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Learning & Circuit Library */}
            <div>
              <div className="text-[10px] font-bold text-[#B4B4B4] uppercase tracking-wider mb-2">
                Library & Learning
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setActiveModal('savedCircuits');
                    setMobileSheetOpen(false);
                  }}
                  className={`flex items-center gap-2.5 p-3 border rounded-xl text-left active:scale-95 ${
                    isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-200' : 'bg-[#000000] border-[#FFFFFF]/20'
                  }`}
                >
                  <Database className="w-4 h-4 text-[#FFFFFF] shrink-0" />
                  <div>
                    <div className={`text-xs font-bold ${isLight ? 'text-slate-800' : 'text-[#F5F5F5]'}`}>My Circuits</div>
                    <div className={`text-[10px] ${isLight ? 'text-[#F5F5F5]/45' : 'text-[#F5F5F5]/60'}`}>Saved Projects</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setActiveModal('presets');
                    setMobileSheetOpen(false);
                  }}
                  className={`flex items-center gap-2.5 p-3 border rounded-xl text-left active:scale-95 ${
                    isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-200' : 'bg-[#000000] border-[#FFFFFF]/20'
                  }`}
                >
                  <FolderOpen className="w-4 h-4 text-[#B4B4B4] shrink-0" />
                  <div>
                    <div className={`text-xs font-bold ${isLight ? 'text-slate-800' : 'text-[#F5F5F5]'}`}>Preset Library</div>
                    <div className={`text-[10px] ${isLight ? 'text-[#F5F5F5]/45' : 'text-[#F5F5F5]/60'}`}>ALU, Adders, Latches</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setActiveModal('challenges');
                    setMobileSheetOpen(false);
                  }}
                  className={`flex items-center gap-2.5 p-3 border rounded-xl text-left active:scale-95 ${
                    isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-200' : 'bg-[#000000] border-[#FFFFFF]/20'
                  }`}
                >
                  <Award className="w-4 h-4 text-[#FFFFFF] shrink-0" />
                  <div>
                    <div className={`text-xs font-bold ${isLight ? 'text-slate-800' : 'text-[#F5F5F5]'}`}>Challenges</div>
                    <div className={`text-[10px] ${isLight ? 'text-[#F5F5F5]/45' : 'text-[#F5F5F5]/60'}`}>Puzzles & Quizzes</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setActiveModal('learn');
                    setMobileSheetOpen(false);
                  }}
                  className={`flex items-center gap-2.5 p-3 border rounded-xl text-left active:scale-95 ${
                    isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-200' : 'bg-[#000000] border-[#FFFFFF]/20'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-[#FFFFFF] shrink-0" />
                  <div>
                    <div className={`text-xs font-bold ${isLight ? 'text-slate-800' : 'text-[#F5F5F5]'}`}>Educational Wiki</div>
                    <div className={`text-[10px] ${isLight ? 'text-[#F5F5F5]/45' : 'text-[#F5F5F5]/60'}`}>Digital Logic Guide</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Settings & Help */}
            <div className={`grid grid-cols-2 gap-2 pt-2 border-t ${isLight ? 'border-slate-200' : 'border-[#FFFFFF]/20'}`}>
              <button
                onClick={() => {
                  setActiveModal('settings');
                  setMobileSheetOpen(false);
                }}
                className={`flex items-center justify-center gap-2 p-3 border rounded-xl font-semibold text-xs ${
                  isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800' : 'bg-[#000000] border-[#FFFFFF]/20 text-[#E8E8E8]'
                }`}
              >
                <Settings className="w-4 h-4 text-[#FFFFFF]" />
                <span>Simulator Settings</span>
              </button>

              <button
                onClick={() => {
                  setActiveModal('tutorial');
                  setMobileSheetOpen(false);
                }}
                className={`flex items-center justify-center gap-2 p-3 border rounded-xl font-semibold text-xs ${
                  isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-zinc-600' : 'bg-[#000000] border-[#FFFFFF]/20 text-[#B4B4B4]'
                }`}
              >
                <Compass className="w-4 h-4" />
                <span>Touch Tutorial</span>
              </button>
            </div>

            {/* About Page Button */}
            <button
              onClick={() => {
                setActiveModal('about');
                setMobileSheetOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-[#FFFFFF]/15 border border-[#FFFFFF]/30 text-[#E8E8E8] font-bold text-xs"
            >
              <Sparkles className="w-4 h-4 text-[#E8E8E8]" />
              <span>About Team KITT & Full Lab Guide</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};
