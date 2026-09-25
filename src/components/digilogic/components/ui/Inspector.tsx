/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useCircuit } from '../../context/CircuitContext';
import { COMPONENT_METADATA } from '../../engine/componentFactory';
import { THEME_PRESETS } from '../../theme/themes';
import {
  Box,
  Copy,
  Cpu,
  FlipHorizontal,
  Info,
  Lock,
  LockOpen,
  RotateCw,
  Sliders,
  Sparkles,
  Trash2,
  X,
  Zap,
  Spline,
  CornerDownRight,
  Minus,
  Palette,
  Settings,
} from 'lucide-react';

export const Inspector: React.FC = () => {
  const {
    components,
    wires,
    selection,
    simulationState,
    updateComponent,
    updateWire,
    updateWires,
    setComponentInputCount,
    deleteSelection,
    duplicateSelection,
    rotateSelection,
    flipSelection,
    lockSelection,
    clearCanvas,
    selectAllWires,
    clearSelection,
    setActiveModal,
    inspectorOpen,
    setInspectorOpen,
    wireRoutingMode,
    setWireRoutingMode,
    theme,
    colorMode,
  } = useCircuit();

  const isLight = colorMode === 'light';
  const selectedComps = components.filter((c) => selection.componentIds.includes(c.id));
  const selectedWires = wires.filter((w) => selection.wireIds.includes(w.id));
  const totalSelected = selectedComps.length + selectedWires.length;

  if (!inspectorOpen) return null;

  const currentTheme = THEME_PRESETS[theme] || THEME_PRESETS.kitt_sovereign;

  const renderContent = () => {
    // 1. Wire Selected
    if (selectedWires.length > 0 && selectedComps.length === 0) {
      const wire = selectedWires[0];
      const fromComp = components.find((c) => c.id === wire.fromComponentId);
      const toComp = components.find((c) => c.id === wire.toComponentId);
      const wireVal = simulationState.wireValues[wire.id] ?? 0;

      return (
        <div className="flex flex-col gap-3">
          <div className={`flex items-center justify-between pb-2 border-b font-bold ${
            isLight ? 'border-slate-200 text-slate-800' : 'border-[#A58D66]/20 text-[#E5E1DD]'
          }`}>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#A58D66]" />
              <span>Wire Connection</span>
            </div>
            <span
              className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                wireVal === 1
                  ? 'bg-[#A58D66]/20 text-[#DFCCA8] border border-[#A58D66]/40'
                  : isLight ? 'bg-slate-200 text-slate-700' : 'bg-[#0d171f] text-[#E5E1DD]/60'
              }`}
            >
              {wireVal === 1 ? 'STATE: HIGH (1)' : 'STATE: LOW (0)'}
            </span>
          </div>

          <div className={`border rounded-xl p-3 space-y-2 text-[11px] ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#080f14]/80 border-[#A58D66]/20'
          }`}>
            <div className="flex justify-between">
              <span className={isLight ? 'text-[#E5E1DD]/45' : 'text-[#E5E1DD]/60'}>Source Port:</span>
              <span className={`font-bold font-mono ${isLight ? 'text-slate-800' : 'text-[#E5E1DD]'}`}>
                {fromComp?.label || fromComp?.name || 'Component'} ({wire.fromPortId})
              </span>
            </div>
            <div className="flex justify-between">
              <span className={isLight ? 'text-[#E5E1DD]/45' : 'text-[#E5E1DD]/60'}>Target Port:</span>
              <span className={`font-bold font-mono ${isLight ? 'text-slate-800' : 'text-[#E5E1DD]'}`}>
                {toComp?.label || toComp?.name || 'Component'} ({wire.toPortId})
              </span>
            </div>
            <div className="flex justify-between">
              <span className={isLight ? 'text-[#E5E1DD]/45' : 'text-[#E5E1DD]/60'}>Selected Wires:</span>
              <span className={`font-bold font-mono ${isLight ? 'text-slate-800' : 'text-[#E5E1DD]'}`}>{selectedWires.length}</span>
            </div>
          </div>

          {/* Wire Color Tag */}
          <div className="space-y-1.5 pt-1">
            <div className={`text-[11px] font-medium ${isLight ? 'text-slate-600' : 'text-[#E5E1DD]/60'}`}>Logical Color Tag</div>
            <div className="grid grid-cols-4 gap-1">
              {[
                { id: 'default', label: 'Default', customBg: currentTheme.wireHighColor, ringColor: currentTheme.wireHighColor },
                { id: 'power', label: 'Power', customBg: '#A58D66', ringColor: '#A58D66' },
                { id: 'ground', label: 'Ground', customBg: '#64748b', ringColor: '#94a3b8' },
                { id: 'signal', label: 'Signal', customBg: currentTheme.secondaryColor, ringColor: currentTheme.secondaryColor },
              ].map((colorOption) => {
                const isActive = (wire.color === colorOption.id) || (!wire.color && colorOption.id === 'default');
                return (
                  <button
                    key={colorOption.id}
                    onClick={() => updateWires(selectedWires.map(w => w.id), { color: colorOption.id === 'default' ? undefined : colorOption.id }, true)}
                    className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg border transition-all ${
                      isActive
                        ? isLight ? 'bg-slate-200 shadow-xs' : 'bg-[#0d171f] shadow-xs'
                        : isLight ? 'border-slate-200 hover:border-slate-300 bg-slate-100' : 'border-[#A58D66]/20 hover:border-[#A58D66]/40 bg-[#080f14]'
                    }`}
                    style={{
                      borderColor: isActive ? colorOption.ringColor : undefined,
                      boxShadow: isActive ? `0 0 0 1px ${colorOption.ringColor}` : undefined
                    }}
                    title={colorOption.label}
                  >
                    <div 
                      className="w-4 h-4 rounded-full border border-white/20 mb-1" 
                      style={{ backgroundColor: colorOption.customBg }}
                    />
                    <span className={`text-[9px] font-bold ${isLight ? 'text-slate-700' : 'text-[#DFCCA8]'}`}>{colorOption.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Wire Routing Style Picker */}
          <div className="space-y-1.5 pt-1">
            <div className={`text-[11px] font-medium ${isLight ? 'text-slate-600' : 'text-[#E5E1DD]/60'}`}>Wire Routing Style</div>
            <div className={`grid grid-cols-3 gap-1 p-1 rounded-lg border ${
              isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#080f14]/90 border-[#A58D66]/20'
            }`}>
              <button
                onClick={() => setWireRoutingMode('curved')}
                className={`py-1.5 px-2 rounded flex flex-col items-center gap-1 transition-all ${
                  wireRoutingMode === 'curved'
                    ? 'bg-[#76B4C2]/20 text-[#76B4C2] font-bold border border-[#76B4C2]/40'
                    : isLight ? 'text-[#E5E1DD]/45 hover:text-slate-900' : 'text-[#E5E1DD]/60 hover:text-[#E5E1DD]'
                }`}
                title="Curved / Stylish Bezier Wires"
              >
                <Spline className="w-3.5 h-3.5" />
                <span className="text-[10px]">Curved</span>
              </button>
              <button
                onClick={() => setWireRoutingMode('orthogonal')}
                className={`py-1.5 px-2 rounded flex flex-col items-center gap-1 transition-all ${
                  wireRoutingMode === 'orthogonal'
                    ? 'bg-[#A58D66]/20 text-[#DFCCA8] font-bold border border-[#A58D66]/40'
                    : isLight ? 'text-[#E5E1DD]/45 hover:text-slate-900' : 'text-[#E5E1DD]/60 hover:text-[#E5E1DD]'
                }`}
                title="Orthogonal / 90° Manhattan Wires"
              >
                <CornerDownRight className="w-3.5 h-3.5" />
                <span className="text-[10px]">Orthogonal</span>
              </button>
              <button
                onClick={() => setWireRoutingMode('straight')}
                className={`py-1.5 px-2 rounded flex flex-col items-center gap-1 transition-all ${
                  wireRoutingMode === 'straight'
                    ? 'bg-[#76B4C2]/20 text-[#76B4C2] font-bold border border-[#407E8C]/40'
                    : isLight ? 'text-[#E5E1DD]/45 hover:text-slate-900' : 'text-[#E5E1DD]/60 hover:text-[#E5E1DD]'
                }`}
                title="Straight Lines"
              >
                <Minus className="w-3.5 h-3.5" />
                <span className="text-[10px]">Straight</span>
              </button>
            </div>
          </div>

          {/* Wire Actions */}
          <div className="space-y-1.5 pt-1">
            <button
              onClick={deleteSelection}
              className="w-full flex items-center justify-center gap-2 py-2 bg-[#A58D66]/20 hover:bg-[#A58D66]/30 border border-[#A58D66]/30 text-[#DFCCA8] rounded-lg text-xs font-bold transition-all shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Wire ({selectedWires.length})</span>
            </button>
            <button
              onClick={clearSelection}
              className={`w-full flex items-center justify-center gap-2 py-1.5 border rounded-lg text-xs font-medium transition-colors ${
                isLight ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700' : 'bg-[#080f14] hover:bg-[#0d171f] border-[#A58D66]/20 text-[#DFCCA8]'
              }`}
            >
              <span>Deselect</span>
            </button>
          </div>
        </div>
      );
    }

    // 2. Multiple Components Selected
    if (selectedComps.length > 1) {
      const allLocked = selectedComps.every((c) => c.locked);

      return (
        <div className="flex flex-col gap-3">
          <div className={`flex items-center justify-between pb-2 border-b font-bold ${
            isLight ? 'border-slate-200 text-slate-800' : 'border-[#A58D66]/20 text-[#E5E1DD]'
          }`}>
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#A58D66]" />
              <span>Multiple Selected</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#A58D66]/20 text-[#DFCCA8] font-mono font-bold">
              {selectedComps.length} items
            </span>
          </div>

          {/* Group Canvas Operations */}
          <div className="space-y-1.5">
            <div className={`text-[11px] font-medium ${isLight ? 'text-slate-600' : 'text-[#E5E1DD]/60'}`}>Batch Operations</div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={rotateSelection}
                className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border font-medium transition-colors text-xs ${
                  isLight
                    ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 hover:border-slate-300 text-slate-800'
                    : 'bg-[#080f14] hover:bg-[#0d171f] border-[#A58D66]/20 hover:border-[#A58D66]/40 text-[#E5E1DD]'
                }`}
                title="Rotate Selection 90° Clockwise [R]"
              >
                <RotateCw className="w-3.5 h-3.5 text-[#A58D66]" />
                <span>Rotate 90°</span>
              </button>
              <button
                onClick={flipSelection}
                className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border font-medium transition-colors text-xs ${
                  isLight
                    ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 hover:border-slate-300 text-slate-800'
                    : 'bg-[#080f14] hover:bg-[#0d171f] border-[#A58D66]/20 hover:border-[#A58D66]/40 text-[#E5E1DD]'
                }`}
                title="Flip Horizontal [F]"
              >
                <FlipHorizontal className="w-3.5 h-3.5 text-[#76B4C2]" />
                <span>Flip</span>
              </button>
              <button
                onClick={duplicateSelection}
                className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border font-medium transition-colors text-xs ${
                  isLight
                    ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 hover:border-slate-300 text-slate-800'
                    : 'bg-[#080f14] hover:bg-[#0d171f] border-[#A58D66]/20 hover:border-[#A58D66]/40 text-[#E5E1DD]'
                }`}
                title="Duplicate Selection [Ctrl+D]"
              >
                <Copy className="w-3.5 h-3.5 text-[#407E8C]" />
                <span>Duplicate</span>
              </button>
              <button
                onClick={lockSelection}
                className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border font-medium transition-colors text-xs ${
                  isLight
                    ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 hover:border-slate-300 text-slate-800'
                    : 'bg-[#080f14] hover:bg-[#0d171f] border-[#A58D66]/20 hover:border-[#A58D66]/40 text-[#E5E1DD]'
                }`}
                title="Toggle Position Lock"
              >
                {allLocked ? <Lock className="w-3.5 h-3.5 text-[#A58D66]" /> : <LockOpen className={`w-3.5 h-3.5 ${isLight ? 'text-[#E5E1DD]/45' : 'text-[#E5E1DD]/60'}`} />}
                <span>{allLocked ? 'Unlock' : 'Lock'}</span>
              </button>
            </div>

            <button
              onClick={deleteSelection}
              className="w-full flex items-center justify-center gap-2 py-2 mt-1 bg-[#A58D66]/20 hover:bg-[#A58D66]/30 border border-[#A58D66]/30 text-[#DFCCA8] rounded-lg text-xs font-bold transition-all shadow-xs"
              title="Delete all selected items [Del]"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selection ({totalSelected})</span>
            </button>
          </div>

          {/* Package into Custom IC Module */}
          <div className={`mt-1 p-3 border rounded-xl space-y-2 ${
            isLight ? 'bg-slate-50 border-[#A58D66]/30' : 'bg-[#080f14]/60 border-[#A58D66]/30'
          }`}>
            <div className="flex items-center gap-1.5 text-[#A58D66] font-bold text-xs">
              <Box className="w-4 h-4" />
              <span>Package Selection into IC</span>
            </div>
            <p className={`text-[11px] leading-relaxed ${isLight ? 'text-slate-600' : 'text-[#E5E1DD]/60'}`}>
              Synthesize these selected gates and wires into a reusable custom chip with automatic port mappings.
            </p>
            <button
              onClick={() => setActiveModal('customGate')}
              className="w-full py-2 bg-[#A58D66] hover:bg-[#DFCCA8] hover:text-[#080f14] text-[#080f14] font-bold rounded-lg transition-all shadow-md shadow-[#A58D66]/20 text-center block text-xs"
            >
              Create Custom IC
            </button>
          </div>
        </div>
      );
    }

    // 3. Single Component Selected
    if (selectedComps.length === 1) {
      const comp = selectedComps[0];
      const meta = COMPONENT_METADATA[comp.type] || COMPONENT_METADATA.AND;
      const portVals = simulationState.portValues[comp.id] || {};

      return (
        <div className="flex flex-col gap-3">
          {/* Header */}
          <div className={`flex items-center justify-between pb-2 border-b ${
            isLight ? 'border-slate-200' : 'border-[#A58D66]/20'
          }`}>
            <div className="flex items-center gap-2 min-w-0">
              <Cpu className="w-4 h-4 text-[#A58D66] shrink-0" />
              <span className={`font-bold truncate ${isLight ? 'text-slate-800' : 'text-[#E5E1DD]'}`}>{comp.name || comp.type}</span>
            </div>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono shrink-0 ${
              isLight ? 'bg-slate-100 text-slate-600 border border-slate-200' : 'bg-[#0d171f] text-[#E5E1DD]/60'
            }`}>
              {comp.type}
            </span>
          </div>

          {/* All Component Operations (Moved from left sidebar) */}
          <div className="space-y-1.5">
            <div className={`text-[11px] font-medium ${isLight ? 'text-slate-600' : 'text-[#E5E1DD]/60'}`}>Quick Actions</div>
            <div className="grid grid-cols-4 gap-1">
              <button
                onClick={rotateSelection}
                className={`flex flex-col items-center justify-center p-1.5 rounded-lg border font-medium transition-colors text-[10px] ${
                  isLight
                    ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800 hover:text-[#A58D66]'
                    : 'bg-[#080f14] hover:bg-[#0d171f] border-[#A58D66]/20 text-[#E5E1DD] hover:text-[#DFCCA8]'
                }`}
                title="Rotate 90° Clockwise [R]"
              >
                <RotateCw className="w-3.5 h-3.5 mb-0.5 text-[#A58D66]" />
                <span>Rotate</span>
              </button>
              <button
                onClick={flipSelection}
                className={`flex flex-col items-center justify-center p-1.5 rounded-lg border font-medium transition-colors text-[10px] ${
                  isLight
                    ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800 hover:text-[#76B4C2]'
                    : 'bg-[#080f14] hover:bg-[#0d171f] border-[#A58D66]/20 text-[#E5E1DD] hover:text-[#76B4C2]'
                }`}
                title="Flip Horizontal [F]"
              >
                <FlipHorizontal className="w-3.5 h-3.5 mb-0.5 text-[#76B4C2]" />
                <span>Flip</span>
              </button>
              <button
                onClick={duplicateSelection}
                className={`flex flex-col items-center justify-center p-1.5 rounded-lg border font-medium transition-colors text-[10px] ${
                  isLight
                    ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800 hover:text-[#76B4C2]'
                    : 'bg-[#080f14] hover:bg-[#0d171f] border-[#A58D66]/20 text-[#E5E1DD] hover:text-[#76B4C2]'
                }`}
                title="Duplicate Gate [Ctrl+D]"
              >
                <Copy className="w-3.5 h-3.5 mb-0.5 text-[#407E8C]" />
                <span>Clone</span>
              </button>
              <button
                onClick={lockSelection}
                className={`flex flex-col items-center justify-center p-1.5 rounded-lg border transition-colors text-[10px] ${
                  comp.locked
                    ? 'bg-[#A58D66]/10 border-[#A58D66]/30 text-[#A58D66]'
                    : isLight
                    ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700'
                    : 'bg-[#080f14] hover:bg-[#0d171f] border-[#A58D66]/20 text-[#DFCCA8]'
                }`}
                title="Lock position to prevent accidental drag"
              >
                {comp.locked ? <Lock className="w-3.5 h-3.5 mb-0.5 text-[#A58D66]" /> : <LockOpen className="w-3.5 h-3.5 mb-0.5" />}
                <span>{comp.locked ? 'Locked' : 'Lock'}</span>
              </button>
            </div>

            <button
              onClick={deleteSelection}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-[#A58D66]/20 hover:bg-[#A58D66]/30 border border-[#A58D66]/30 text-[#DFCCA8] rounded-lg text-xs font-bold transition-all shadow-xs"
              title="Delete this component [Del / Backspace]"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete {comp.name || comp.type}</span>
            </button>
          </div>

          {/* Label & Name Editor */}
          <div className="space-y-2">
            <div className="space-y-1">
              <label className={`text-[11px] font-medium ${isLight ? 'text-slate-600' : 'text-[#E5E1DD]/60'}`}>Variable / Signal Label</label>
              <input
                type="text"
                value={comp.label || ''}
                onChange={(e) => updateComponent(comp.id, { label: e.target.value })}
                placeholder="e.g. A, B, Cin, OUT"
                className={`w-full px-2.5 py-1.5 rounded-lg text-xs font-mono focus:border-[#A58D66] focus:outline-none transition-colors ${
                  isLight
                    ? 'bg-white border border-slate-300 text-slate-900 placeholder-slate-400 shadow-xs'
                    : 'bg-[#080f14] border border-[#A58D66]/20 text-[#E5E1DD] placeholder-slate-500'
                }`}
              />
            </div>
            <div className="space-y-1">
              <label className={`text-[11px] font-medium ${isLight ? 'text-slate-600' : 'text-[#E5E1DD]/60'}`}>Component Name</label>
              <input
                type="text"
                value={comp.name || ''}
                onChange={(e) => updateComponent(comp.id, { name: e.target.value })}
                placeholder="e.g. Switch A, Master Clock"
                className={`w-full px-2.5 py-1.5 rounded-lg text-xs focus:border-[#A58D66] focus:outline-none transition-colors ${
                  isLight
                    ? 'bg-white border border-slate-300 text-slate-900 placeholder-slate-400 shadow-xs'
                    : 'bg-[#080f14] border border-[#A58D66]/20 text-[#E5E1DD] placeholder-slate-500'
                }`}
              />
            </div>
          </div>

          {/* Variable Inputs (If multi-input gate) */}
          {['AND', 'OR', 'NAND', 'NOR', 'XOR', 'XNOR'].includes(comp.type) && (
            <div className="space-y-1.5">
              <label className={`text-[11px] font-medium ${isLight ? 'text-slate-600' : 'text-[#E5E1DD]/60'}`}>Number of Inputs</label>
              <div className="grid grid-cols-4 gap-1">
                {[2, 3, 4, 8].map((num) => (
                  <button
                    key={num}
                    onClick={() => setComponentInputCount(comp.id, num)}
                    className={`py-1 rounded-md text-xs font-bold transition-colors ${
                      comp.inputCount === num
                        ? 'bg-[#A58D66]/20 border border-[#A58D66]/50 text-[#DFCCA8]'
                        : isLight
                        ? 'bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200'
                        : 'bg-[#080f14] border border-[#A58D66]/20 text-[#E5E1DD]/60 hover:text-[#E5E1DD]'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Live Port Values Inspector */}
          <div className="space-y-1.5">
            <div className={`text-[11px] font-medium ${isLight ? 'text-slate-600' : 'text-[#E5E1DD]/60'}`}>Live Pin States</div>
            <div className={`border rounded-lg p-2 space-y-1 max-h-36 overflow-y-auto ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#080f14]/90 border-[#A58D66]/20'
            }`}>
              {comp.ports.map((port) => {
                const val = portVals[port.id] ?? 'Z';
                return (
                  <div key={port.id} className="flex items-center justify-between text-[11px]">
                    <span className={`font-mono truncate pr-2 ${isLight ? 'text-slate-600' : 'text-[#E5E1DD]/60'}`}>
                      [{port.type.toUpperCase()}] {port.name}:
                    </span>
                    <span
                      className={`font-mono font-bold px-1.5 py-0.2 rounded shrink-0 ${
                        val === 1
                          ? 'bg-[#A58D66]/20 text-[#DFCCA8]'
                          : val === 0
                          ? isLight ? 'bg-slate-200 text-slate-700' : 'bg-[#0d171f] text-[#E5E1DD]/60'
                          : 'bg-[#A58D66]/20 text-[#A58D66]'
                      }`}
                    >
                      {val}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    // 4. Default Circuit Summary (Nothing Selected)
    return (
      <div className="flex flex-col gap-3">
        <div className={`flex items-center gap-2 pb-2 border-b font-bold ${
          isLight ? 'border-slate-200 text-slate-800' : 'border-[#A58D66]/20 text-[#E5E1DD]'
        }`}>
          <Info className="w-4 h-4 text-[#A58D66]" />
          <span>Circuit Overview</span>
        </div>

        {/* Global Canvas Quick Operations */}
        <div className="space-y-1.5">
          <div className={`text-[11px] font-medium ${isLight ? 'text-slate-600' : 'text-[#E5E1DD]/60'}`}>Canvas Operations</div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={selectAllWires}
              className={`flex items-center justify-center gap-1.5 p-2 rounded-lg border font-medium transition-colors text-xs ${
                isLight
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-[#A58D66]'
                  : 'bg-[#080f14] hover:bg-[#0d171f] border-[#A58D66]/20 text-[#DFCCA8]'
              }`}
              title="Select all wires on canvas"
            >
              <Zap className="w-3.5 h-3.5 text-[#A58D66]" />
              <span>Select All Wires</span>
            </button>
            <button
              onClick={clearCanvas}
              className="flex items-center justify-center gap-1.5 p-2 rounded-lg bg-[#A58D66]/10 hover:bg-[#A58D66]/20 border border-[#A58D66]/30 text-[#DFCCA8] font-medium transition-colors text-xs"
              title="Clear all components and wires"
            >
              <Trash2 className="w-3.5 h-3.5 text-[#DFCCA8]" />
              <span>Clear Canvas</span>
            </button>
          </div>
        </div>

        {/* Wire Style Quick Switcher */}
        <div className="space-y-1.5">
          <div className={`text-[11px] font-medium ${isLight ? 'text-slate-600' : 'text-[#E5E1DD]/60'}`}>Wire Routing Style</div>
          <div className={`grid grid-cols-3 gap-1 p-1 rounded-lg border ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#080f14]/90 border-[#A58D66]/20'
          }`}>
            <button
              onClick={() => setWireRoutingMode('curved')}
              className={`py-1.5 px-2 rounded flex flex-col items-center gap-1 transition-all ${
                wireRoutingMode === 'curved'
                  ? 'bg-[#76B4C2]/20 text-[#76B4C2] font-bold border border-[#76B4C2]/40'
                  : isLight ? 'text-[#E5E1DD]/45 hover:text-slate-900' : 'text-[#E5E1DD]/60 hover:text-[#E5E1DD]'
              }`}
              title="Curved / Stylish Bezier Wires"
            >
              <Spline className="w-3.5 h-3.5" />
              <span className="text-[10px]">Curved</span>
            </button>
            <button
              onClick={() => setWireRoutingMode('orthogonal')}
              className={`py-1.5 px-2 rounded flex flex-col items-center gap-1 transition-all ${
                wireRoutingMode === 'orthogonal'
                  ? 'bg-[#A58D66]/20 text-[#DFCCA8] font-bold border border-[#A58D66]/40'
                  : isLight ? 'text-[#E5E1DD]/45 hover:text-slate-900' : 'text-[#E5E1DD]/60 hover:text-[#E5E1DD]'
              }`}
              title="Orthogonal / 90° Manhattan Wires"
            >
              <CornerDownRight className="w-3.5 h-3.5" />
              <span className="text-[10px]">Orthogonal</span>
            </button>
            <button
              onClick={() => setWireRoutingMode('straight')}
              className={`py-1.5 px-2 rounded flex flex-col items-center gap-1 transition-all ${
                wireRoutingMode === 'straight'
                  ? 'bg-[#76B4C2]/20 text-[#76B4C2] font-bold border border-[#407E8C]/40'
                  : isLight ? 'text-[#E5E1DD]/45 hover:text-slate-900' : 'text-[#E5E1DD]/60 hover:text-[#E5E1DD]'
              }`}
              title="Straight Lines"
            >
              <Minus className="w-3.5 h-3.5" />
              <span className="text-[10px]">Straight</span>
            </button>
          </div>
        </div>

        {/* Theme & Settings Quick Launcher */}
        <button
          onClick={() => setActiveModal('settings')}
          className={`w-full flex items-center justify-between p-2.5 border rounded-xl transition-colors ${
            isLight
              ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 shadow-xs'
              : 'bg-[#080f14]/80 hover:bg-[#0d171f] border-[#A58D66]/20 text-[#E5E1DD]'
          }`}
        >
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-[#A58D66]" />
            <div className="text-left">
              <div className={`font-semibold text-xs ${isLight ? 'text-slate-800' : 'text-[#E5E1DD]'}`}>Theme & Preferences</div>
              <div className={`text-[10px] ${isLight ? 'text-[#E5E1DD]/45' : 'text-[#E5E1DD]/60'}`}>Current: {currentTheme.name}</div>
            </div>
          </div>
          <Settings className={`w-4 h-4 ${isLight ? 'text-[#E5E1DD]/60' : 'text-[#E5E1DD]/60'}`} />
        </button>

        <div className={`border rounded-xl p-3 space-y-2 ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#080f14]/80 border-[#A58D66]/20'
        }`}>
          <div className="flex justify-between">
            <span className={isLight ? 'text-[#E5E1DD]/45' : 'text-[#E5E1DD]/60'}>Total Components:</span>
            <span className={`font-bold font-mono ${isLight ? 'text-slate-800' : 'text-[#E5E1DD]'}`}>{components.length}</span>
          </div>
          <div className="flex justify-between">
            <span className={isLight ? 'text-[#E5E1DD]/45' : 'text-[#E5E1DD]/60'}>Total Wires:</span>
            <span className={`font-bold font-mono ${isLight ? 'text-slate-800' : 'text-[#E5E1DD]'}`}>{wires.length}</span>
          </div>
          <div className="flex justify-between">
            <span className={isLight ? 'text-[#E5E1DD]/45' : 'text-[#E5E1DD]/60'}>Input Switches:</span>
            <span className={`font-bold font-mono ${isLight ? 'text-slate-800' : 'text-[#E5E1DD]'}`}>
              {components.filter((c) => ['SWITCH', 'BUTTON', 'CLOCK', 'CONST_1', 'CONST_0'].includes(c.type)).length}
            </span>
          </div>
          <div className="flex justify-between">
            <span className={isLight ? 'text-[#E5E1DD]/45' : 'text-[#E5E1DD]/60'}>Output Probes/LEDs:</span>
            <span className={`font-bold font-mono ${isLight ? 'text-slate-800' : 'text-[#E5E1DD]'}`}>
              {components.filter((c) => ['LED', 'PROBE', 'HEX_DISPLAY', 'DECIMAL_DISPLAY'].includes(c.type)).length}
            </span>
          </div>
        </div>

        <div className={`p-3 border rounded-xl space-y-1.5 text-[11px] ${
          isLight ? 'bg-slate-100/70 border-slate-200 text-slate-600' : 'bg-[#080f14]/40 border-[#A58D66]/20 text-[#E5E1DD]/60'
        }`}>
          <span className={`font-semibold block ${isLight ? 'text-slate-800' : 'text-[#DFCCA8]'}`}>Touch & Pointer Tips:</span>
          <p>• Tap any gate or wire to inspect and perform operations.</p>
          <p>• Drag an output pin to an input pin to connect wires.</p>
          <p>• Use 2 fingers to pinch-zoom and pan on touchscreens.</p>
        </div>
      </div>
    );
  };

  return (
    <aside
      style={{
        backgroundColor: currentTheme.panelBg,
        borderColor: currentTheme.panelBorder || currentTheme.borderTone,
      }}
      className={`fixed xl:relative right-0 top-14 xl:top-0 bottom-0 h-[calc(100vh-3.5rem)] w-[88vw] max-w-xs sm:w-80 xl:w-72 border-l p-3 flex flex-col justify-between select-none text-xs z-40 shadow-2xl xl:shadow-none overflow-hidden transition-all duration-300 ${
        isLight ? 'text-slate-700' : 'text-[#DFCCA8]'
      }`}
    >
      <div
        style={{ borderColor: currentTheme.borderTone }}
        className="flex items-center justify-between pb-1.5 border-b shrink-0"
      >
        <span className={`text-xs font-bold ${isLight ? 'text-slate-800' : 'text-[#E5E1DD]'}`}>Properties & Operations</span>
        <button
          onClick={() => setInspectorOpen(false)}
          className={`p-1 rounded transition-colors ${
            isLight ? 'text-[#E5E1DD]/45 hover:text-slate-800 hover:bg-slate-200' : 'text-[#E5E1DD]/60 hover:text-[#E5E1DD] hover:bg-[#0d171f]'
          }`}
          title="Close Inspector"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pt-2 pb-2 space-y-3 min-h-0 touch-auto overscroll-contain">
        {renderContent()}
      </div>
    </aside>
  );
};
