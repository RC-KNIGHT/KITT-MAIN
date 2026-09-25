/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { useCircuit } from '../../context/CircuitContext';
import { generateKMap, KMapCell } from '../../engine/kmap';
import { parseBooleanExpression, synthesizeCircuitFromAST } from '../../engine/booleanParser';
import {
  Sparkles,
  Wand2,
  X,
  RotateCcw,
  Shield,
  Layers,
  Zap,
  Cpu,
  Check,
  Flame,
  Binary,
} from 'lucide-react';

type KMapSynthesisArch = 'standard' | 'optimized_xor' | 'universal_nand' | 'universal_nor';

export const KMapModal: React.FC = () => {
  const { activeModal, setActiveModal, colorMode } = useCircuit();
  const isLight = colorMode === 'light';
  const [numVars, setNumVars] = useState<2 | 3 | 4>(3);
  const [selectedArch, setSelectedArch] = useState<KMapSynthesisArch>('standard');
  const [copiedEquation, setCopiedEquation] = useState(false);

  // Minterm bit states: 0, 1
  const totalMinterms = Math.pow(2, numVars);
  const [minterms, setMinterms] = useState<(0 | 1)[]>(() => {
    // Default example: 3-variable XOR parity checkerboard
    const arr: (0 | 1)[] = Array(16).fill(0);
    [1, 2, 4, 7].forEach((m) => {
      arr[m] = 1;
    });
    return arr;
  });

  // Generate K-Map calculation with full parity and universal logic equations
  const kmapResult = useMemo(() => {
    return generateKMap(numVars, minterms);
  }, [numVars, minterms]);

  if (activeModal !== 'kmap') return null;

  // Handle var change
  const handleVarChange = (vars: 2 | 3 | 4) => {
    setNumVars(vars);
    const count = Math.pow(2, vars);
    setMinterms(Array(count).fill(0));
  };

  // Toggle cell value: 0 -> 1 -> 0
  const toggleCell = (index: number) => {
    setMinterms((prev) => {
      const next = [...prev];
      next[index] = next[index] === 0 ? 1 : 0;
      return next;
    });
  };

  // Presets
  const applyPreset = (presetName: string) => {
    const arr: (0 | 1)[] = Array(16).fill(0);
    if (presetName === 'xor3') {
      setNumVars(3);
      [1, 2, 4, 7].forEach((m) => (arr[m] = 1));
      setSelectedArch('optimized_xor');
    } else if (presetName === 'xnor3') {
      setNumVars(3);
      [0, 3, 5, 6].forEach((m) => (arr[m] = 1));
      setSelectedArch('optimized_xor');
    } else if (presetName === 'half_adder_sum') {
      setNumVars(2);
      [1, 2].forEach((m) => (arr[m] = 1));
      setSelectedArch('optimized_xor');
    } else if (presetName === 'full_adder_sum') {
      setNumVars(3);
      [1, 2, 4, 7].forEach((m) => (arr[m] = 1));
      setSelectedArch('optimized_xor');
    } else if (presetName === 'majority_vote') {
      setNumVars(3);
      [3, 5, 6, 7].forEach((m) => (arr[m] = 1));
      setSelectedArch('universal_nand');
    } else if (presetName === 'sop_group') {
      setNumVars(3);
      [1, 3, 4, 6, 7].forEach((m) => (arr[m] = 1));
      setSelectedArch('standard');
    }
    setMinterms(arr);
  };

  // Determine active formula string for synthesis based on chosen architecture
  const activeEquation = useMemo(() => {
    if (selectedArch === 'optimized_xor') {
      return kmapResult.xorOptimized.equation;
    }
    if (selectedArch === 'universal_nand') {
      return kmapResult.minimizedSOP;
    }
    if (selectedArch === 'universal_nor') {
      return kmapResult.minimizedSOP;
    }
    return kmapResult.minimizedSOP;
  }, [selectedArch, kmapResult]);

  // Build circuit from chosen architecture
  const handleSynthesizeKMap = () => {
    if (kmapResult.minimizedSOP === '0' || kmapResult.minimizedSOP === '1') return;
    try {
      const synthMode =
        selectedArch === 'optimized_xor'
          ? 'optimized_xor'
          : selectedArch === 'universal_nand'
          ? 'universal_nand'
          : selectedArch === 'universal_nor'
          ? 'universal_nor'
          : 'direct';

      const ast = parseBooleanExpression(activeEquation);
      const { components, wires, gateCount } = synthesizeCircuitFromAST(
        ast,
        'F',
        100,
        100,
        synthMode
      );

      window.dispatchEvent(
        new CustomEvent('load_synthesized_circuit', {
          detail: {
            components,
            wires,
            name: `K-Map (${selectedArch.toUpperCase()}): F = ${activeEquation}`,
          },
        })
      );
      setActiveModal('none');
    } catch (err) {
      console.error('KMap synthesis failed:', err);
    }
  };

  const handleCopyEquation = () => {
    navigator.clipboard.writeText(`F = ${activeEquation}`);
    setCopiedEquation(true);
    setTimeout(() => setCopiedEquation(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#080f14]/75 backdrop-blur-md p-3 sm:p-4 animate-fade-in overflow-y-auto">
      <div
        className={`border rounded-2xl w-full max-w-4xl flex flex-col shadow-2xl overflow-hidden my-auto max-h-[92vh] transition-colors ${
          isLight
            ? 'bg-white border-slate-300 text-slate-800 shadow-[0_20px_60px_rgba(0,0,0,0.15)]'
            : 'bg-[#0d171f] border-[#A58D66]/30 text-[#E5E1DD]'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-5 py-3.5 border-b shrink-0 transition-colors ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#080f14] border-[#A58D66]/20'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl border ${
              isLight ? 'bg-teal-100 text-teal-700 border-teal-200' : 'bg-[#407E8C]/20 text-[#76B4C2] border-[#407E8C]/30'
            }`}>
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`font-bold text-sm sm:text-base ${isLight ? 'text-slate-900' : 'text-[#E5E1DD]'}`}>
                  Karnaugh Map & Universal Synthesizer
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  isLight ? 'bg-teal-100 text-teal-700 border-teal-300' : 'bg-[#407E8C]/20 text-[#76B4C2] border-[#407E8C]/40'
                }`}>
                  NAND / NOR / XOR Supported
                </span>
              </div>
              <p className={`text-xs ${isLight ? 'text-[#E5E1DD]/45' : 'text-[#E5E1DD]/60'}`}>
                Gray-code cell minimization with special parity & universal gate synthesis
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal('none')}
            className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
              isLight ? 'text-[#E5E1DD]/60 hover:text-slate-700 hover:bg-slate-100' : 'text-[#E5E1DD]/60 hover:text-[#E5E1DD] hover:bg-[#080f14]'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls Bar & Presets */}
        <div
          className={`flex flex-wrap items-center justify-between gap-2 px-5 py-2.5 border-b text-xs shrink-0 transition-colors ${
            isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-[#080f14] border-[#A58D66]/20'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className={`font-semibold ${isLight ? 'text-slate-600' : 'text-[#E5E1DD]/60'}`}>Variables:</span>
            {[2, 3, 4].map((v) => (
              <button
                key={v}
                onClick={() => handleVarChange(v as 2 | 3 | 4)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  numVars === v
                    ? 'bg-[#A58D66] text-[#080f14] shadow-md'
                    : isLight
                    ? 'bg-white text-slate-600 hover:text-slate-900 border border-slate-300 hover:bg-slate-50'
                    : 'bg-[#080f14] text-[#E5E1DD]/60 hover:text-[#E5E1DD] border border-[#A58D66]/20'
                }`}
              >
                {v} Vars ({v === 2 ? 'AB' : v === 3 ? 'ABC' : 'ABCD'})
              </button>
            ))}
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`text-[11px] font-medium mr-1 ${isLight ? 'text-[#E5E1DD]/45' : 'text-[#E5E1DD]/45'}`}>Presets:</span>
            <button
              onClick={() => applyPreset('xor3')}
              className={`px-2 py-1 rounded-md text-[11px] font-mono transition-colors cursor-pointer border ${
                isLight ? 'bg-teal-50 hover:bg-teal-100 text-teal-700 border-teal-200' : 'bg-[#407E8C]/20 hover:bg-[#407E8C]/35 text-[#76B4C2] border-[#407E8C]/40'
              }`}
            >
              3-Var XOR Parity
            </button>
            <button
              onClick={() => applyPreset('xnor3')}
              className={`px-2 py-1 rounded-md text-[11px] font-mono transition-colors cursor-pointer border ${
                isLight ? 'bg-teal-50 hover:bg-teal-100 text-teal-700 border-teal-200' : 'bg-[#407E8C]/20 hover:bg-[#407E8C]/35 text-[#76B4C2] border-[#407E8C]/40'
              }`}
            >
              3-Var XNOR
            </button>
            <button
              onClick={() => applyPreset('majority_vote')}
              className={`px-2 py-1 rounded-md text-[11px] font-mono transition-colors cursor-pointer border ${
                isLight ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300' : 'bg-[#080f14] hover:bg-[#0d171f] text-[#DFCCA8] border-[#A58D66]/20'
              }`}
            >
              Majority (3-In)
            </button>
            <button
              onClick={() => setMinterms(Array(totalMinterms).fill(0))}
              className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg ml-1 cursor-pointer transition-colors border ${
                isLight ? 'bg-white hover:bg-slate-100 text-slate-600 border-slate-300' : 'bg-[#080f14] hover:bg-[#0d171f] text-[#E5E1DD]/60 hover:text-[#E5E1DD] border-[#A58D66]/20'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Interactive K-Map Grid */}
          <div className="flex flex-col items-center justify-center">
            <div
              className={`inline-block border rounded-2xl p-4 shadow-inner max-w-full overflow-x-auto transition-colors ${
                isLight ? 'border-slate-300 bg-slate-50' : 'border-[#A58D66]/20 bg-[#080f14]'
              }`}
            >
              <table className="border-collapse font-mono text-center mx-auto">
                <thead>
                  <tr>
                    <th
                      className={`p-2 sm:p-3 text-xs font-bold border-b border-r ${
                        isLight
                          ? 'text-teal-700 border-slate-300 bg-slate-100'
                          : 'text-[#76B4C2] border-[#A58D66]/20 bg-[#080f14]/40'
                      }`}
                    >
                      {numVars === 2 ? 'A \\ B' : numVars === 3 ? 'A \\ BC' : 'AB \\ CD'}
                    </th>
                    {kmapResult.colHeaders.map((colHeader) => (
                      <th
                        key={colHeader}
                        className={`p-2 sm:p-3 text-xs font-bold border-b w-14 sm:w-16 ${
                          isLight
                            ? 'text-slate-700 border-slate-300 bg-slate-100'
                            : 'text-[#DFCCA8] border-slate-800 bg-[#080f14]/40'
                        }`}
                      >
                        {colHeader}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {kmapResult.grid.map((row, rIdx) => (
                    <tr key={rIdx}>
                      <td
                        className={`p-2 sm:p-3 text-xs font-bold border-r ${
                          isLight
                            ? 'text-slate-700 border-slate-300 bg-slate-100'
                            : 'text-[#DFCCA8] border-[#A58D66]/20 bg-[#080f14]/40'
                        }`}
                      >
                        {kmapResult.rowHeaders[rIdx]}
                      </td>
                      {row.map((cell) => {
                        const val = minterms[cell.mintermIndex];
                        return (
                          <td key={cell.mintermIndex} className="p-1 sm:p-1.5">
                            <button
                              onClick={() => toggleCell(cell.mintermIndex)}
                              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer select-none active:scale-95 ${
                                val === 1
                                  ? isLight
                                    ? 'bg-amber-100 border-[#A58D66] text-amber-900 shadow-xs font-black ring-1 ring-amber-300'
                                    : 'bg-[#A58D66]/20 border-[#A58D66] text-[#DFCCA8] shadow-md font-black ring-1 ring-[#A58D66]/30'
                                  : isLight
                                  ? 'bg-white border-slate-300 text-[#E5E1DD]/60 hover:border-slate-400 hover:bg-slate-100'
                                  : 'bg-[#080f14]/90 border-[#A58D66]/20 text-[#E5E1DD]/45 hover:border-[#A58D66]/40 hover:bg-[#0d171f]'
                              }`}
                            >
                              <span className="text-base sm:text-lg font-bold leading-none">
                                {val}
                              </span>
                              <span className={`text-[9px] font-mono mt-0.5 ${isLight ? 'text-[#E5E1DD]/60' : 'text-[#E5E1DD]/45'}`}>
                                m{cell.mintermIndex}
                              </span>
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Synthesis Architecture Modes Segmented Switcher */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${isLight ? 'text-slate-700' : 'text-[#DFCCA8]'}`}>
                <Layers className={`w-4 h-4 ${isLight ? 'text-teal-600' : 'text-[#76B4C2]'}`} />
                <span>Select Target Circuit Architecture:</span>
              </span>
              {kmapResult.xorOptimized.hasPattern && (
                <span className={`flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-full border ${
                  isLight
                    ? 'bg-teal-100 border-teal-300 text-teal-800 animate-pulse'
                    : 'bg-[#407E8C]/20 border-[#407E8C]/50 text-[#76B4C2] animate-pulse'
                }`}>
                  <Sparkles className={`w-3 h-3 ${isLight ? 'text-teal-600' : 'text-[#76B4C2]'}`} />
                  XOR Parity Pattern Detected! ({kmapResult.xorOptimized.savingsPercent}% Gates Saved)
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {/* Option 1: Standard Optimal SOP */}
              <button
                onClick={() => setSelectedArch('standard')}
                className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  selectedArch === 'standard'
                    ? isLight
                      ? 'bg-amber-50 border-[#A58D66] text-amber-900 ring-1 ring-[#A58D66]/50 shadow-xs'
                      : 'bg-[#A58D66]/15 border-[#A58D66] text-[#DFCCA8] ring-1 ring-[#A58D66]/50'
                    : isLight
                    ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    : 'bg-[#080f14]/60 border-[#A58D66]/20 text-[#E5E1DD]/60 hover:bg-[#080f14] hover:text-[#E5E1DD]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-bold text-xs flex items-center gap-1.5 ${isLight ? 'text-slate-800' : 'text-[#E5E1DD]'}`}>
                      <Zap className="w-3.5 h-3.5 text-[#A58D66]" />
                      <span>Standard SOP</span>
                    </span>
                    {selectedArch === 'standard' && (
                      <span className="p-0.5 bg-[#A58D66] text-[#080f14] rounded-full">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <p className={`text-[11px] leading-snug ${isLight ? 'text-[#E5E1DD]/45' : 'text-[#E5E1DD]/60'}`}>
                    Two-level AND-OR gate array with inverters.
                  </p>
                </div>
                <div className={`mt-2.5 pt-2 border-t flex items-center justify-between text-[10px] font-mono ${isLight ? 'border-slate-200 text-[#E5E1DD]/45' : 'border-[#A58D66]/20 text-[#E5E1DD]/60'}`}>
                  <span>Gates: ~{kmapResult.standardGateCount}</span>
                  <span>Classic SOP</span>
                </div>
              </button>

              {/* Option 2: XOR / XNOR Parity Logic */}
              <button
                onClick={() => setSelectedArch('optimized_xor')}
                className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  selectedArch === 'optimized_xor'
                    ? isLight
                      ? 'bg-teal-50 border-[#407E8C] text-teal-900 ring-1 ring-[#407E8C]/50 shadow-xs'
                      : 'bg-[#407E8C]/20 border-[#407E8C] text-[#76B4C2] ring-1 ring-[#407E8C]/50'
                    : isLight
                    ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    : 'bg-[#080f14]/60 border-[#A58D66]/20 text-[#E5E1DD]/60 hover:bg-[#080f14] hover:text-[#E5E1DD]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-bold text-xs flex items-center gap-1.5 ${isLight ? 'text-teal-800' : 'text-[#76B4C2]'}`}>
                      <Sparkles className={`w-3.5 h-3.5 ${isLight ? 'text-teal-600' : 'text-[#76B4C2]'}`} />
                      <span>XOR / XNOR Logic</span>
                    </span>
                    {selectedArch === 'optimized_xor' && (
                      <span className="p-0.5 bg-[#407E8C] text-[#E5E1DD] rounded-full">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <p className={`text-[11px] leading-snug ${isLight ? 'text-[#E5E1DD]/45' : 'text-[#E5E1DD]/60'}`}>
                    Compresses checkerboard & parity maps into compact XOR gates.
                  </p>
                </div>
                <div className={`mt-2.5 pt-2 border-t flex items-center justify-between text-[10px] font-mono ${isLight ? 'border-slate-200 text-teal-700' : 'border-[#A58D66]/20 text-[#76B4C2]'}`}>
                  <span>Gates: {kmapResult.xorOptimized.gateCount}</span>
                  <span className="font-bold">
                    {kmapResult.xorOptimized.savedGates > 0
                      ? `-${kmapResult.xorOptimized.savingsPercent}% size`
                      : 'Special Gate'}
                  </span>
                </div>
              </button>

              {/* Option 3: Universal All-NAND */}
              <button
                onClick={() => setSelectedArch('universal_nand')}
                className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  selectedArch === 'universal_nand'
                    ? isLight
                      ? 'bg-cyan-50 border-[#76B4C2] text-cyan-900 ring-1 ring-cyan-400/50 shadow-xs'
                      : 'bg-[#407E8C]/15 border-[#76B4C2] text-[#76B4C2] ring-1 ring-cyan-500/50'
                    : isLight
                    ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    : 'bg-[#080f14]/60 border-[#A58D66]/20 text-[#E5E1DD]/60 hover:bg-[#080f14] hover:text-[#E5E1DD]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-bold text-xs flex items-center gap-1.5 ${isLight ? 'text-cyan-800' : 'text-cyan-300'}`}>
                      <Shield className={`w-3.5 h-3.5 ${isLight ? 'text-cyan-600' : 'text-[#76B4C2]'}`} />
                      <span>Universal NAND</span>
                    </span>
                    {selectedArch === 'universal_nand' && (
                      <span className="p-0.5 bg-[#407E8C] text-[#E5E1DD] rounded-full">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <p className={`text-[11px] leading-snug ${isLight ? 'text-[#E5E1DD]/45' : 'text-[#E5E1DD]/60'}`}>
                    100% NAND realization (De Morgan 2-level SOP transformation).
                  </p>
                </div>
                <div className={`mt-2.5 pt-2 border-t flex items-center justify-between text-[10px] font-mono ${isLight ? 'border-slate-200 text-cyan-700' : 'border-[#A58D66]/20 text-[#76B4C2]'}`}>
                  <span>{kmapResult.universalNAND.icChips}x 7400 IC</span>
                  <span>All-NAND</span>
                </div>
              </button>

              {/* Option 4: Universal All-NOR */}
              <button
                onClick={() => setSelectedArch('universal_nor')}
                className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  selectedArch === 'universal_nor'
                    ? isLight
                      ? 'bg-teal-50 border-[#407E8C] text-teal-900 ring-1 ring-[#407E8C]/50 shadow-xs'
                      : 'bg-[#407E8C]/15 border-[#407E8C] text-[#76B4C2] ring-1 ring-[#A58D66]/50'
                    : isLight
                    ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    : 'bg-[#080f14]/60 border-[#A58D66]/20 text-[#E5E1DD]/60 hover:bg-[#080f14] hover:text-[#E5E1DD]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-bold text-xs flex items-center gap-1.5 ${isLight ? 'text-teal-800' : 'text-[#76B4C2]'}`}>
                      <Cpu className={`w-3.5 h-3.5 ${isLight ? 'text-[#407E8C]' : 'text-[#76B4C2]'}`} />
                      <span>Universal NOR</span>
                    </span>
                    {selectedArch === 'universal_nor' && (
                      <span className="p-0.5 bg-[#407E8C] text-[#E5E1DD] rounded-full">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <p className={`text-[11px] leading-snug ${isLight ? 'text-[#E5E1DD]/45' : 'text-[#E5E1DD]/60'}`}>
                    100% NOR realization (Dual POS De Morgan transformation).
                  </p>
                </div>
                <div className={`mt-2.5 pt-2 border-t flex items-center justify-between text-[10px] font-mono ${isLight ? 'border-slate-200 text-teal-700' : 'border-[#A58D66]/20 text-[#76B4C2]'}`}>
                  <span>{kmapResult.universalNOR.icChips}x 7402 IC</span>
                  <span>All-NOR</span>
                </div>
              </button>
            </div>
          </div>

          {/* Active Formula Display Card */}
          <div
            className={`border rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors ${
              isLight ? 'bg-slate-50 border-slate-200 shadow-sm' : 'bg-[#080f14] border-[#A58D66]/20 shadow-md'
            }`}
          >
            <div className="space-y-1 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold ${isLight ? 'text-slate-600' : 'text-[#E5E1DD]/60'}`}>
                  Synthesized Equation ({selectedArch.toUpperCase()}):
                </span>
                <button
                  onClick={handleCopyEquation}
                  className={`text-[10px] font-mono underline cursor-pointer ${
                    isLight ? 'text-teal-700 hover:text-teal-800' : 'text-[#76B4C2] hover:text-[#DFCCA8]'
                  }`}
                >
                  {copiedEquation ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className={`font-mono font-bold text-base sm:text-lg tracking-wide break-all ${isLight ? 'text-teal-700' : 'text-[#DFCCA8]'}`}>
                F = {activeEquation}
              </div>
              <div className={`text-[11px] flex flex-wrap items-center gap-3 pt-1 ${isLight ? 'text-[#E5E1DD]/45' : 'text-[#E5E1DD]/60'}`}>
                <span>Standard SOP: <strong className={`font-mono ${isLight ? 'text-slate-700' : 'text-[#DFCCA8]'}`}>{kmapResult.minimizedSOP}</strong></span>
                {kmapResult.groups.length > 0 && (
                  <span>Groups: <strong className={isLight ? 'text-teal-700' : 'text-[#76B4C2]'}>{kmapResult.groups.length} prime implicants</strong></span>
                )}
              </div>
            </div>

            <button
              onClick={handleSynthesizeKMap}
              disabled={kmapResult.minimizedSOP === '0' || kmapResult.minimizedSOP === '1'}
              className="w-full md:w-auto px-5 py-3 bg-[#A58D66] hover:bg-[#DFCCA8] text-[#080f14] rounded-xl font-bold text-xs sm:text-sm transition-all shadow-lg shadow-[#A58D66]/20 flex items-center justify-center gap-2.5 whitespace-nowrap cursor-pointer disabled:opacity-40"
            >
              <Wand2 className="w-4 h-4" />
              <span>Synthesize {selectedArch.toUpperCase()} to Canvas</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
