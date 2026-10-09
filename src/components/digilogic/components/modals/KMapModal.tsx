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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000]/75 backdrop-blur-md p-3 sm:p-4 animate-fade-in overflow-y-auto">
      <div
        className={`border rounded-2xl w-full max-w-4xl flex flex-col shadow-2xl overflow-hidden my-auto max-h-[92vh] transition-colors ${
          isLight
            ? 'bg-white border-slate-300 text-slate-800 shadow-[0_20px_60px_rgba(0,0,0,0.15)]'
            : 'bg-[#141415] border-[#FFFFFF]/30 text-[#F5F5F5]'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-5 py-3.5 border-b shrink-0 transition-colors ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#000000] border-[#FFFFFF]/20'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl border ${
              isLight ? 'bg-zinc-100 text-zinc-700 border-zinc-200' : 'bg-[#8F8F8F]/20 text-[#B4B4B4] border-[#8F8F8F]/30'
            }`}>
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`font-bold text-sm sm:text-base ${isLight ? 'text-slate-900' : 'text-[#F5F5F5]'}`}>
                  Karnaugh Map & Universal Synthesizer
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  isLight ? 'bg-zinc-100 text-zinc-700 border-zinc-300' : 'bg-[#8F8F8F]/20 text-[#B4B4B4] border-[#8F8F8F]/40'
                }`}>
                  NAND / NOR / XOR Supported
                </span>
              </div>
              <p className={`text-xs ${isLight ? 'text-[#F5F5F5]/45' : 'text-[#F5F5F5]/60'}`}>
                Gray-code cell minimization with special parity & universal gate synthesis
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal('none')}
            className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
              isLight ? 'text-[#F5F5F5]/60 hover:text-slate-700 hover:bg-slate-100' : 'text-[#F5F5F5]/60 hover:text-[#F5F5F5] hover:bg-[#000000]'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Controls Bar & Presets */}
        <div
          className={`flex flex-wrap items-center justify-between gap-2 px-5 py-2.5 border-b text-xs shrink-0 transition-colors ${
            isLight ? 'bg-slate-50/70 border-slate-200' : 'bg-[#000000] border-[#FFFFFF]/20'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className={`font-semibold ${isLight ? 'text-slate-600' : 'text-[#F5F5F5]/60'}`}>Variables:</span>
            {[2, 3, 4].map((v) => (
              <button
                key={v}
                onClick={() => handleVarChange(v as 2 | 3 | 4)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  numVars === v
                    ? 'bg-[#FFFFFF] text-[#000000] shadow-md'
                    : isLight
                    ? 'bg-white text-slate-600 hover:text-slate-900 border border-slate-300 hover:bg-slate-50'
                    : 'bg-[#000000] text-[#F5F5F5]/60 hover:text-[#F5F5F5] border border-[#FFFFFF]/20'
                }`}
              >
                {v} Vars ({v === 2 ? 'AB' : v === 3 ? 'ABC' : 'ABCD'})
              </button>
            ))}
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`text-[11px] font-medium mr-1 ${isLight ? 'text-[#F5F5F5]/45' : 'text-[#F5F5F5]/45'}`}>Presets:</span>
            <button
              onClick={() => applyPreset('xor3')}
              className={`px-2 py-1 rounded-md text-[11px] font-mono transition-colors cursor-pointer border ${
                isLight ? 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200' : 'bg-[#8F8F8F]/20 hover:bg-[#8F8F8F]/35 text-[#B4B4B4] border-[#8F8F8F]/40'
              }`}
            >
              3-Var XOR Parity
            </button>
            <button
              onClick={() => applyPreset('xnor3')}
              className={`px-2 py-1 rounded-md text-[11px] font-mono transition-colors cursor-pointer border ${
                isLight ? 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200' : 'bg-[#8F8F8F]/20 hover:bg-[#8F8F8F]/35 text-[#B4B4B4] border-[#8F8F8F]/40'
              }`}
            >
              3-Var XNOR
            </button>
            <button
              onClick={() => applyPreset('majority_vote')}
              className={`px-2 py-1 rounded-md text-[11px] font-mono transition-colors cursor-pointer border ${
                isLight ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300' : 'bg-[#000000] hover:bg-[#141415] text-[#E8E8E8] border-[#FFFFFF]/20'
              }`}
            >
              Majority (3-In)
            </button>
            <button
              onClick={() => setMinterms(Array(totalMinterms).fill(0))}
              className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg ml-1 cursor-pointer transition-colors border ${
                isLight ? 'bg-white hover:bg-slate-100 text-slate-600 border-slate-300' : 'bg-[#000000] hover:bg-[#141415] text-[#F5F5F5]/60 hover:text-[#F5F5F5] border-[#FFFFFF]/20'
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
                isLight ? 'border-slate-300 bg-slate-50' : 'border-[#FFFFFF]/20 bg-[#000000]'
              }`}
            >
              <table className="border-collapse font-mono text-center mx-auto">
                <thead>
                  <tr>
                    <th
                      className={`p-2 sm:p-3 text-xs font-bold border-b border-r ${
                        isLight
                          ? 'text-zinc-700 border-slate-300 bg-slate-100'
                          : 'text-[#B4B4B4] border-[#FFFFFF]/20 bg-[#000000]/40'
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
                            : 'text-[#E8E8E8] border-slate-800 bg-[#000000]/40'
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
                            : 'text-[#E8E8E8] border-[#FFFFFF]/20 bg-[#000000]/40'
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
                                    ? 'bg-amber-100 border-[#FFFFFF] text-amber-900 shadow-xs font-black ring-1 ring-amber-300'
                                    : 'bg-[#FFFFFF]/20 border-[#FFFFFF] text-[#E8E8E8] shadow-md font-black ring-1 ring-[#FFFFFF]/30'
                                  : isLight
                                  ? 'bg-white border-slate-300 text-[#F5F5F5]/60 hover:border-slate-400 hover:bg-slate-100'
                                  : 'bg-[#000000]/90 border-[#FFFFFF]/20 text-[#F5F5F5]/45 hover:border-[#FFFFFF]/40 hover:bg-[#141415]'
                              }`}
                            >
                              <span className="text-base sm:text-lg font-bold leading-none">
                                {val}
                              </span>
                              <span className={`text-[9px] font-mono mt-0.5 ${isLight ? 'text-[#F5F5F5]/60' : 'text-[#F5F5F5]/45'}`}>
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
              <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${isLight ? 'text-slate-700' : 'text-[#E8E8E8]'}`}>
                <Layers className={`w-4 h-4 ${isLight ? 'text-zinc-600' : 'text-[#B4B4B4]'}`} />
                <span>Select Target Circuit Architecture:</span>
              </span>
              {kmapResult.xorOptimized.hasPattern && (
                <span className={`flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-full border ${
                  isLight
                    ? 'bg-zinc-100 border-zinc-300 text-zinc-800 animate-pulse'
                    : 'bg-[#8F8F8F]/20 border-[#8F8F8F]/50 text-[#B4B4B4] animate-pulse'
                }`}>
                  <Sparkles className={`w-3 h-3 ${isLight ? 'text-zinc-600' : 'text-[#B4B4B4]'}`} />
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
                      ? 'bg-amber-50 border-[#FFFFFF] text-amber-900 ring-1 ring-[#FFFFFF]/50 shadow-xs'
                      : 'bg-[#FFFFFF]/15 border-[#FFFFFF] text-[#E8E8E8] ring-1 ring-[#FFFFFF]/50'
                    : isLight
                    ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    : 'bg-[#000000]/60 border-[#FFFFFF]/20 text-[#F5F5F5]/60 hover:bg-[#000000] hover:text-[#F5F5F5]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-bold text-xs flex items-center gap-1.5 ${isLight ? 'text-slate-800' : 'text-[#F5F5F5]'}`}>
                      <Zap className="w-3.5 h-3.5 text-[#FFFFFF]" />
                      <span>Standard SOP</span>
                    </span>
                    {selectedArch === 'standard' && (
                      <span className="p-0.5 bg-[#FFFFFF] text-[#000000] rounded-full">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <p className={`text-[11px] leading-snug ${isLight ? 'text-[#F5F5F5]/45' : 'text-[#F5F5F5]/60'}`}>
                    Two-level AND-OR gate array with inverters.
                  </p>
                </div>
                <div className={`mt-2.5 pt-2 border-t flex items-center justify-between text-[10px] font-mono ${isLight ? 'border-slate-200 text-[#F5F5F5]/45' : 'border-[#FFFFFF]/20 text-[#F5F5F5]/60'}`}>
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
                      ? 'bg-zinc-50 border-[#8F8F8F] text-zinc-900 ring-1 ring-[#8F8F8F]/50 shadow-xs'
                      : 'bg-[#8F8F8F]/20 border-[#8F8F8F] text-[#B4B4B4] ring-1 ring-[#8F8F8F]/50'
                    : isLight
                    ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    : 'bg-[#000000]/60 border-[#FFFFFF]/20 text-[#F5F5F5]/60 hover:bg-[#000000] hover:text-[#F5F5F5]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-bold text-xs flex items-center gap-1.5 ${isLight ? 'text-zinc-800' : 'text-[#B4B4B4]'}`}>
                      <Sparkles className={`w-3.5 h-3.5 ${isLight ? 'text-zinc-600' : 'text-[#B4B4B4]'}`} />
                      <span>XOR / XNOR Logic</span>
                    </span>
                    {selectedArch === 'optimized_xor' && (
                      <span className="p-0.5 bg-[#8F8F8F] text-[#F5F5F5] rounded-full">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <p className={`text-[11px] leading-snug ${isLight ? 'text-[#F5F5F5]/45' : 'text-[#F5F5F5]/60'}`}>
                    Compresses checkerboard & parity maps into compact XOR gates.
                  </p>
                </div>
                <div className={`mt-2.5 pt-2 border-t flex items-center justify-between text-[10px] font-mono ${isLight ? 'border-slate-200 text-zinc-700' : 'border-[#FFFFFF]/20 text-[#B4B4B4]'}`}>
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
                      ? 'bg-zinc-50 border-[#B4B4B4] text-zinc-900 ring-1 ring-zinc-400/50 shadow-xs'
                      : 'bg-[#8F8F8F]/15 border-[#B4B4B4] text-[#B4B4B4] ring-1 ring-zinc-500/50'
                    : isLight
                    ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    : 'bg-[#000000]/60 border-[#FFFFFF]/20 text-[#F5F5F5]/60 hover:bg-[#000000] hover:text-[#F5F5F5]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-bold text-xs flex items-center gap-1.5 ${isLight ? 'text-zinc-800' : 'text-zinc-300'}`}>
                      <Shield className={`w-3.5 h-3.5 ${isLight ? 'text-zinc-600' : 'text-[#B4B4B4]'}`} />
                      <span>Universal NAND</span>
                    </span>
                    {selectedArch === 'universal_nand' && (
                      <span className="p-0.5 bg-[#8F8F8F] text-[#F5F5F5] rounded-full">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <p className={`text-[11px] leading-snug ${isLight ? 'text-[#F5F5F5]/45' : 'text-[#F5F5F5]/60'}`}>
                    100% NAND realization (De Morgan 2-level SOP transformation).
                  </p>
                </div>
                <div className={`mt-2.5 pt-2 border-t flex items-center justify-between text-[10px] font-mono ${isLight ? 'border-slate-200 text-zinc-700' : 'border-[#FFFFFF]/20 text-[#B4B4B4]'}`}>
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
                      ? 'bg-zinc-50 border-[#8F8F8F] text-zinc-900 ring-1 ring-[#8F8F8F]/50 shadow-xs'
                      : 'bg-[#8F8F8F]/15 border-[#8F8F8F] text-[#B4B4B4] ring-1 ring-[#FFFFFF]/50'
                    : isLight
                    ? 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    : 'bg-[#000000]/60 border-[#FFFFFF]/20 text-[#F5F5F5]/60 hover:bg-[#000000] hover:text-[#F5F5F5]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-bold text-xs flex items-center gap-1.5 ${isLight ? 'text-zinc-800' : 'text-[#B4B4B4]'}`}>
                      <Cpu className={`w-3.5 h-3.5 ${isLight ? 'text-[#8F8F8F]' : 'text-[#B4B4B4]'}`} />
                      <span>Universal NOR</span>
                    </span>
                    {selectedArch === 'universal_nor' && (
                      <span className="p-0.5 bg-[#8F8F8F] text-[#F5F5F5] rounded-full">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <p className={`text-[11px] leading-snug ${isLight ? 'text-[#F5F5F5]/45' : 'text-[#F5F5F5]/60'}`}>
                    100% NOR realization (Dual POS De Morgan transformation).
                  </p>
                </div>
                <div className={`mt-2.5 pt-2 border-t flex items-center justify-between text-[10px] font-mono ${isLight ? 'border-slate-200 text-zinc-700' : 'border-[#FFFFFF]/20 text-[#B4B4B4]'}`}>
                  <span>{kmapResult.universalNOR.icChips}x 7402 IC</span>
                  <span>All-NOR</span>
                </div>
              </button>
            </div>
          </div>

          {/* Active Formula Display Card */}
          <div
            className={`border rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors ${
              isLight ? 'bg-slate-50 border-slate-200 shadow-sm' : 'bg-[#000000] border-[#FFFFFF]/20 shadow-md'
            }`}
          >
            <div className="space-y-1 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold ${isLight ? 'text-slate-600' : 'text-[#F5F5F5]/60'}`}>
                  Synthesized Equation ({selectedArch.toUpperCase()}):
                </span>
                <button
                  onClick={handleCopyEquation}
                  className={`text-[10px] font-mono underline cursor-pointer ${
                    isLight ? 'text-zinc-700 hover:text-zinc-800' : 'text-[#B4B4B4] hover:text-[#E8E8E8]'
                  }`}
                >
                  {copiedEquation ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <div className={`font-mono font-bold text-base sm:text-lg tracking-wide break-all ${isLight ? 'text-zinc-700' : 'text-[#E8E8E8]'}`}>
                F = {activeEquation}
              </div>
              <div className={`text-[11px] flex flex-wrap items-center gap-3 pt-1 ${isLight ? 'text-[#F5F5F5]/45' : 'text-[#F5F5F5]/60'}`}>
                <span>Standard SOP: <strong className={`font-mono ${isLight ? 'text-slate-700' : 'text-[#E8E8E8]'}`}>{kmapResult.minimizedSOP}</strong></span>
                {kmapResult.groups.length > 0 && (
                  <span>Groups: <strong className={isLight ? 'text-zinc-700' : 'text-[#B4B4B4]'}>{kmapResult.groups.length} prime implicants</strong></span>
                )}
              </div>
            </div>

            <button
              onClick={handleSynthesizeKMap}
              disabled={kmapResult.minimizedSOP === '0' || kmapResult.minimizedSOP === '1'}
              className="w-full md:w-auto px-5 py-3 bg-[#FFFFFF] hover:bg-[#E8E8E8] text-[#000000] rounded-xl font-bold text-xs sm:text-sm transition-all shadow-lg shadow-[#FFFFFF]/20 flex items-center justify-center gap-2.5 whitespace-nowrap cursor-pointer disabled:opacity-40"
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
