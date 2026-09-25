/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useCallback } from 'react';
import { useCircuit } from '../../context/CircuitContext';
import { simulateCircuit } from '../../engine/simulation';
import { generateKMap, KMapResult } from '../../engine/kmap';
import { parseBooleanExpression, synthesizeCircuitFromAST } from '../../engine/booleanParser';
import { LogicState, CircuitComponent, Wire } from '../../types/circuit';
import { getAlphabetSequenceLabel } from '../../engine/componentFactory';
import { THEME_PRESETS } from '../../theme/themes';
import {
  Table,
  Sparkles,
  Download,
  X,
  Copy,
  Check,
  Play,
  RotateCcw,
  Layers,
  Wand2,
  Activity,
  Filter,
  Search,
  Eye,
  Sliders,
  CheckCircle2,
  Cpu,
  ArrowRight,
  Code,
} from 'lucide-react';

interface VariableGroup {
  name: string;
  componentIds: string[];
  components: CircuitComponent[];
  isConnected: boolean;
  currentValue: 0 | 1;
}

interface OutputGroup {
  id: string;
  name: string;
  comp: CircuitComponent;
  type: string;
}

export const TruthTableModal: React.FC = () => {
  const {
    components,
    wires,
    customGates,
    activeModal,
    setActiveModal,
    theme,
    colorMode,
    applyInputValues,
    loadCircuitData,
    recordHistorySnapshot,
  } = useCircuit();

  const isLight = colorMode === 'light';
  const currentTheme = THEME_PRESETS[theme] || THEME_PRESETS.kitt_sovereign;

  // Active Concept Tab:
  // 1: 'table' -> Interactive Truth Table & Live Matrix
  // 2: 'equations' -> Canonical SOP/POS & Minimized Boolean Synthesis
  // 3: 'kmap' -> 2D Gray-Code Karnaugh Map & Digital Timing Waveforms
  const [activeTab, setActiveTab] = useState<'table' | 'equations' | 'kmap'>('table');

  // Filter & Search Controls
  const [rowFilter, setRowFilter] = useState<'all' | 'ones' | 'zeros'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedOutputIndex, setSelectedOutputIndex] = useState<number>(0);
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [appliedRowIndex, setAppliedRowIndex] = useState<number | null>(null);
  const [synthesisSuccess, setSynthesisSuccess] = useState<string | null>(null);

  // 1. Identify valid primary input variable components (excluding deleted components)
  const inputComps = useMemo(() => {
    return components.filter((c) =>
      ['SWITCH', 'BUTTON', 'PULSE', 'RANDOM', 'CLOCK'].includes(c.type)
    );
  }, [components]);

  // 2. Group duplicate inputs by Variable Name / Custom Label
  // If user has two switches sharing the same label (e.g. 'A'), they are unified under ONE single variable!
  const variableGroups: VariableGroup[] = useMemo(() => {
    const varMap = new Map<string, VariableGroup>();
    let autoIndex = 0;

    // Track which components have outgoing wires
    const connectedSourceIds = new Set(wires.map((w) => w.fromComponentId));

    inputComps.forEach((comp) => {
      let vName = comp.label?.trim();
      if (!vName) {
        if (
          comp.name &&
          !comp.name.match(/^[A-Z0-9_-]+_[0-9]+$/i) &&
          comp.name !== 'Toggle Switch' &&
          comp.name !== 'Push Button'
        ) {
          vName = comp.name.trim();
        } else {
          vName = getAlphabetSequenceLabel(autoIndex);
          autoIndex++;
        }
      }

      const key = vName.toLowerCase();
      const isConn = connectedSourceIds.has(comp.id);
      const curVal = (comp.internalState?.value ? 1 : 0) as 0 | 1;

      if (!varMap.has(key)) {
        varMap.set(key, {
          name: vName,
          componentIds: [comp.id],
          components: [comp],
          isConnected: isConn,
          currentValue: curVal,
        });
      } else {
        const existing = varMap.get(key)!;
        existing.componentIds.push(comp.id);
        existing.components.push(comp);
        if (isConn) existing.isConnected = true;
        if (curVal === 1) existing.currentValue = 1;
      }
    });

    // Cap to 8 variables (256 combinations) to guarantee instantaneous evaluation
    return Array.from(varMap.values()).slice(0, 8);
  }, [inputComps, wires]);

  // 3. Identify output components (probes, LEDs, displays) or monitored gate outputs
  const outputGroups: OutputGroup[] = useMemo(() => {
    const primaryOutputs = components.filter((c) =>
      ['PROBE', 'LED', 'HEX_DISPLAY', 'DECIMAL_DISPLAY', 'BINARY_DISPLAY', 'SEGMENT_7'].includes(c.type)
    );

    const result: OutputGroup[] = [];
    const usedNames = new Map<string, number>();

    primaryOutputs.forEach((comp, idx) => {
      let rawName =
        comp.label?.trim() ||
        comp.name?.trim() ||
        (primaryOutputs.length === 1 ? 'Y' : `OUT_${idx + 1}`);

      const key = rawName.toLowerCase();
      const count = usedNames.get(key) || 0;
      usedNames.set(key, count + 1);

      const finalName = count > 0 ? `${rawName}_${count + 1}` : rawName;
      result.push({
        id: comp.id,
        name: finalName,
        comp,
        type: comp.type,
      });
    });

    return result;
  }, [components]);

  const customGateMap = useMemo(() => {
    const map = new Map();
    customGates.forEach((g) => map.set(g.id, g));
    return map;
  }, [customGates]);

  const numVars = variableGroups.length;
  const totalCombinations = numVars > 0 ? 1 << numVars : 0;

  // 4. Generate Complete Truth Table Matrix with Multi-Pass Logic Convergence
  const { tableRows, mintermMap, maxtermMap, activeRowIndex } = useMemo(() => {
    if (numVars === 0 || outputGroups.length === 0) {
      return { tableRows: [], mintermMap: {}, maxtermMap: {}, activeRowIndex: -1 };
    }

    const rows = [];
    const minterms: Record<string, number[]> = {};
    const maxterms: Record<string, number[]> = {};
    outputGroups.forEach((out) => {
      minterms[out.name] = [];
      maxterms[out.name] = [];
    });

    let currentLiveRowIdx = -1;

    for (let r = 0; r < totalCombinations; r++) {
      const currentInputMap: Record<string, 0 | 1> = {};
      const componentOverrides = new Map<string, 0 | 1>();
      let matchesLiveCanvas = true;

      variableGroups.forEach((vGroup, vIdx) => {
        // Extract bit value (MSB -> LSB)
        const bit = ((r >> (numVars - 1 - vIdx)) & 1) as 0 | 1;
        currentInputMap[vGroup.name] = bit;
        vGroup.componentIds.forEach((cid) => {
          componentOverrides.set(cid, bit);
        });

        if (bit !== vGroup.currentValue) {
          matchesLiveCanvas = false;
        }
      });

      if (matchesLiveCanvas) {
        currentLiveRowIdx = r;
      }

      // Clone components and set input values
      const simComponents = components.map((c) => {
        if (componentOverrides.has(c.id)) {
          const bitVal = componentOverrides.get(c.id)!;
          return {
            ...c,
            internalState: {
              ...c.internalState,
              value: bitVal,
              pressed: bitVal === 1,
            },
          };
        }
        return c;
      });

      // Run pure multi-pass circuit evaluation
      const sim = simulateCircuit(simComponents, wires, customGateMap);

      // Collect outputs
      const currentOutputMap: Record<string, LogicState> = {};
      outputGroups.forEach((out) => {
        const val =
          sim.portValues[out.id]?.['in_0'] ??
          sim.portValues[out.id]?.['out'] ??
          0;
        currentOutputMap[out.name] = val;

        if (val === 1) {
          minterms[out.name].push(r);
        } else if (val === 0) {
          maxterms[out.name].push(r);
        }
      });

      // Binary string representation
      const binaryString = variableGroups
        .map((v) => currentInputMap[v.name])
        .join('');

      rows.push({
        rowIndex: r,
        binaryString,
        inputs: currentInputMap,
        outputs: currentOutputMap,
        minterm: `m${r}`,
        maxterm: `M${r}`,
        isLiveCurrent: matchesLiveCanvas,
      });
    }

    return {
      tableRows: rows,
      mintermMap: minterms,
      maxtermMap: maxterms,
      activeRowIndex: currentLiveRowIdx,
    };
  }, [numVars, totalCombinations, variableGroups, outputGroups, components, wires, customGateMap]);

  // Selected Output for Boolean Analysis & K-Map
  const activeOutputName = outputGroups[selectedOutputIndex]?.name || outputGroups[0]?.name || '';

  // 5. Karnaugh Map & Minimized SOP Equation Generation
  const kmapAnalysis: KMapResult | null = useMemo(() => {
    if (!activeOutputName || numVars < 2 || numVars > 4 || tableRows.length === 0) {
      return null;
    }
    const truthValues: Record<number, 0 | 1> = {};
    tableRows.forEach((row) => {
      truthValues[row.rowIndex] = row.outputs[activeOutputName] === 1 ? 1 : 0;
    });

    const varNames = variableGroups.map((v) => v.name);
    return generateKMap(numVars as 2 | 3 | 4, truthValues, varNames);
  }, [activeOutputName, numVars, tableRows, variableGroups]);

  // Canonical SOP & POS Equations for active output
  const { canonicalSOP, canonicalPOS, minimizedSOP } = useMemo(() => {
    if (!activeOutputName || !mintermMap[activeOutputName]) {
      return { canonicalSOP: '0', canonicalPOS: '1', minimizedSOP: '0' };
    }

    const minterms = mintermMap[activeOutputName] || [];
    const maxterms = maxtermMap[activeOutputName] || [];

    let sop = '0';
    let pos = '1';

    if (minterms.length === totalCombinations) {
      sop = '1';
    } else if (minterms.length > 0) {
      sop = `Σm(${minterms.join(', ')})`;
    }

    if (maxterms.length === totalCombinations) {
      pos = '0';
    } else if (maxterms.length > 0) {
      pos = `ΠM(${maxterms.join(', ')})`;
    }

    const minSop = kmapAnalysis?.minimizedSOP || (minterms.length === 0 ? '0' : sop);

    return {
      canonicalSOP: sop,
      canonicalPOS: pos,
      minimizedSOP: minSop,
    };
  }, [activeOutputName, mintermMap, maxtermMap, totalCombinations, kmapAnalysis]);

  // Handle Clicking a Row to Drive Canvas Switches in Real Time
  const handleApplyRowToCanvas = useCallback(
    (rowInputs: Record<string, 0 | 1>, rowIdx: number) => {
      applyInputValues(rowInputs);
      setAppliedRowIndex(rowIdx);
      setTimeout(() => setAppliedRowIndex(null), 1500);
    },
    [applyInputValues]
  );

  // Handle Synthesizing the Minimized Circuit onto the Canvas
  const handleSynthesizeMinimizedCircuit = useCallback(() => {
    if (!minimizedSOP || minimizedSOP === '0' || minimizedSOP === '1') return;
    try {
      const ast = parseBooleanExpression(minimizedSOP);
      const startX = 100;
      const startY = 100;
      const { components: synthComps, wires: synthWires } = synthesizeCircuitFromAST(
        ast,
        activeOutputName || 'Y',
        startX,
        startY
      );

      loadCircuitData(synthComps, synthWires, `Synthesized (${activeOutputName}): ${minimizedSOP}`);
      setSynthesisSuccess(`Synthesized equivalent circuit for ${activeOutputName} = ${minimizedSOP}!`);
      setTimeout(() => {
        setSynthesisSuccess(null);
        setActiveModal('none');
      }, 1200);
    } catch (err: any) {
      console.error('Synthesis failed:', err);
    }
  }, [minimizedSOP, activeOutputName, loadCircuitData, setActiveModal]);

  // Export CSV
  const exportCsv = () => {
    if (tableRows.length === 0) return;
    const inHeaders = variableGroups.map((v) => v.name);
    const outHeaders = outputGroups.map((o) => o.name);
    const headerRow = ['Index', ...inHeaders, ...outHeaders, 'Minterm', 'Maxterm'].join(',');

    const csvLines = tableRows.map((r) => {
      const inVals = inHeaders.map((h) => r.inputs[h]);
      const outVals = outHeaders.map((h) => r.outputs[h]);
      return [r.rowIndex, ...inVals, ...outVals, r.minterm, r.maxterm].join(',');
    });

    const csvContent = [headerRow, ...csvLines].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `truth_table_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Copy Equation / Markdown to Clipboard
  const copyToClipboard = (text: string, formatName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(formatName);
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  // Filtered rows for Tab 1
  const filteredRows = useMemo(() => {
    return tableRows.filter((r) => {
      if (rowFilter === 'ones' && r.outputs[activeOutputName] !== 1) return false;
      if (rowFilter === 'zeros' && r.outputs[activeOutputName] !== 0) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchesIndex = r.rowIndex.toString() === q || r.minterm.toLowerCase().includes(q);
        const matchesBinary = r.binaryString.includes(q);
        return matchesIndex || matchesBinary;
      }
      return true;
    });
  }, [tableRows, rowFilter, activeOutputName, searchQuery]);

  if (activeModal !== 'truthTable') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#080f14]/80 backdrop-blur-sm p-2 sm:p-4 animate-fade-in select-none">
      <div
        style={{
          backgroundColor: isLight ? '#ffffff' : currentTheme.panelBg,
          borderColor: currentTheme.borderTone,
        }}
        className={`border rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden transition-colors duration-300 ${
          isLight ? 'text-slate-800' : 'text-[#E5E1DD]'
        }`}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: isLight ? '#f8fafc' : currentTheme.navBg,
            borderColor: currentTheme.borderTone,
          }}
          className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b shrink-0 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div
              style={{
                backgroundColor: `${currentTheme.primaryColor}22`,
                borderColor: `${currentTheme.primaryColor}55`,
                color: currentTheme.primaryColor,
              }}
              className="p-2.5 rounded-xl border shadow-sm flex items-center justify-center"
            >
              <Table className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`font-bold text-sm sm:text-base tracking-wide font-mono ${
                  isLight ? 'text-slate-900' : 'text-[#E5E1DD]'
                }`}>
                  Circuit Truth Table & Analysis Engine
                </h2>
                {numVars > 0 && (
                  <span
                    style={{
                      backgroundColor: `${currentTheme.primaryColor}18`,
                      color: currentTheme.primaryColor,
                      borderColor: `${currentTheme.primaryColor}40`,
                    }}
                    className="text-[10px] px-2 py-0.5 rounded-full border font-mono font-bold"
                  >
                    {numVars} {numVars === 1 ? 'Variable' : 'Variables'} ({totalCombinations} States)
                  </span>
                )}
              </div>
              <p className={`text-xs ${isLight ? 'text-[#E5E1DD]/45' : 'text-[#E5E1DD]/60'}`}>
                Unified multi-variable evaluation, canonical boolean equations & real-time canvas synchronization
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportCsv}
              disabled={tableRows.length === 0}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 disabled:opacity-40 text-xs font-semibold rounded-lg transition-colors border shadow-xs cursor-pointer ${
                isLight
                  ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                  : 'bg-[#080f14] hover:bg-[#0d171f] text-[#E5E1DD] border-[#A58D66]/30'
              }`}
              title="Export complete truth table as CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => setActiveModal('none')}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isLight ? 'text-[#E5E1DD]/60 hover:text-slate-700 hover:bg-slate-100' : 'text-[#E5E1DD]/60 hover:text-[#E5E1DD] hover:bg-[#080f14]'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Detected Variables & Outputs Banner */}
        <div
          style={{
            backgroundColor: isLight ? '#f1f5f9' : `${currentTheme.canvasBg}dd`,
            borderColor: currentTheme.borderTone,
          }}
          className="px-4 sm:px-6 py-2.5 border-b flex flex-wrap items-center justify-between gap-2 text-xs shrink-0 transition-colors"
        >
          {/* Detected Input Variables with Multi-Switch Unification */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-semibold text-[11px] uppercase tracking-wider flex items-center gap-1 ${
              isLight ? 'text-slate-600' : 'text-[#E5E1DD]/60'
            }`}>
              <Sliders className="w-3.5 h-3.5" /> Inputs ({variableGroups.length}):
            </span>
            {variableGroups.length === 0 ? (
              <span className="text-[#A58D66] font-mono text-[11px]">No input switches detected</span>
            ) : (
              variableGroups.map((v, i) => (
                <span
                  key={v.name}
                  style={{
                    backgroundColor: `${currentTheme.primaryColor}15`,
                    borderColor: `${currentTheme.primaryColor}35`,
                    color: currentTheme.primaryColor,
                  }}
                  className="px-2 py-0.5 rounded-md border font-mono font-bold text-[11px] flex items-center gap-1"
                  title={`Variable ${v.name}: controls ${v.componentIds.length} switch/button asset(s)`}
                >
                  <span>{v.name}</span>
                  {v.componentIds.length > 1 && (
                    <span className={`text-[9px] px-1 rounded font-normal ${
                      isLight ? 'bg-slate-200 text-slate-700' : 'bg-[#080f14]/80 text-[#DFCCA8]'
                    }`}>
                      ×{v.componentIds.length}
                    </span>
                  )}
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      v.currentValue === 1 ? 'bg-[#76B4C2] animate-pulse' : isLight ? 'bg-slate-400' : 'bg-slate-600'
                    }`}
                  />
                </span>
              ))
            )}
          </div>

          {/* Monitored Outputs Selector */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`font-semibold text-[11px] uppercase tracking-wider flex items-center gap-1 ${
              isLight ? 'text-slate-600' : 'text-[#E5E1DD]/60'
            }`}>
              <Activity className="w-3.5 h-3.5" /> Output:
            </span>
            {outputGroups.length === 0 ? (
              <span className="text-[#A58D66] font-mono text-[11px]">No output probes placed</span>
            ) : outputGroups.length === 1 ? (
              <span
                style={{
                  backgroundColor: `${currentTheme.accentColor}20`,
                  borderColor: `${currentTheme.accentColor}40`,
                  color: currentTheme.accentColor,
                }}
                className="px-2 py-0.5 rounded-md border font-mono font-bold text-[11px]"
              >
                {outputGroups[0].name}
              </span>
            ) : (
              <div className={`flex items-center gap-1 p-0.5 rounded-lg border ${
                isLight ? 'bg-white border-slate-300 shadow-xs' : 'bg-[#080f14] border-[#A58D66]/20'
              }`}>
                {outputGroups.map((out, idx) => (
                  <button
                    key={out.id}
                    onClick={() => setSelectedOutputIndex(idx)}
                    style={
                      selectedOutputIndex === idx
                        ? {
                            backgroundColor: `${currentTheme.primaryColor}25`,
                            color: currentTheme.primaryColor,
                            borderColor: `${currentTheme.primaryColor}50`,
                          }
                        : {}
                    }
                    className={`px-2 py-0.5 rounded font-mono text-[11px] font-semibold transition-all border cursor-pointer ${
                      selectedOutputIndex === idx
                        ? 'border shadow-xs'
                        : isLight
                        ? 'border-transparent text-slate-600 hover:text-slate-900'
                        : 'border-transparent text-[#E5E1DD]/60 hover:text-[#E5E1DD]'
                    }`}
                  >
                    {out.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Concept Tabs Navigation */}
        <div
          style={{ borderColor: currentTheme.borderTone }}
          className={`flex border-b px-4 sm:px-6 pt-2.5 gap-4 sm:gap-6 text-xs font-semibold shrink-0 overflow-x-auto transition-colors ${
            isLight ? 'bg-slate-50' : 'bg-[#080f14]'
          }`}
        >
          <button
            onClick={() => setActiveTab('table')}
            style={
              activeTab === 'table'
                ? {
                    borderBottomColor: currentTheme.primaryColor,
                    color: currentTheme.primaryColor,
                  }
                : {}
            }
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'table'
                ? 'font-bold'
                : isLight
                ? 'border-transparent text-[#E5E1DD]/45 hover:text-slate-800'
                : 'border-transparent text-[#E5E1DD]/60 hover:text-[#E5E1DD]'
            }`}
          >
            <Table className="w-4 h-4" />
            <span>1. Interactive Truth Table</span>
            {activeRowIndex >= 0 && (
              <span
                style={{
                  backgroundColor: `${currentTheme.primaryColor}20`,
                  color: currentTheme.primaryColor,
                }}
                className="text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold hidden sm:inline"
              >
                Live: #{activeRowIndex}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('equations')}
            style={
              activeTab === 'equations'
                ? {
                    borderBottomColor: currentTheme.primaryColor,
                    color: currentTheme.primaryColor,
                  }
                : {}
            }
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'equations'
                ? 'font-bold'
                : isLight
                ? 'border-transparent text-[#E5E1DD]/45 hover:text-slate-800'
                : 'border-transparent text-[#E5E1DD]/60 hover:text-[#E5E1DD]'
            }`}
          >
            <Code className="w-4 h-4" />
            <span>2. Canonical & Minimized Equations</span>
          </button>

          <button
            onClick={() => setActiveTab('kmap')}
            style={
              activeTab === 'kmap'
                ? {
                    borderBottomColor: currentTheme.primaryColor,
                    color: currentTheme.primaryColor,
                  }
                : {}
            }
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'kmap'
                ? 'font-bold'
                : isLight
                ? 'border-transparent text-[#E5E1DD]/45 hover:text-slate-800'
                : 'border-transparent text-[#E5E1DD]/60 hover:text-[#E5E1DD]'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>3. 2D Karnaugh Map & Waveforms</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4 text-xs">
          {numVars === 0 || outputGroups.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center space-y-3 p-6">
              <div
                style={{
                  backgroundColor: `${currentTheme.primaryColor}15`,
                  borderColor: `${currentTheme.primaryColor}30`,
                  color: currentTheme.primaryColor,
                }}
                className="w-12 h-12 rounded-2xl border flex items-center justify-center shadow-lg"
              >
                <Cpu className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-md">
                <h3 className={`font-bold text-sm ${isLight ? 'text-slate-800' : 'text-[#E5E1DD]'}`}>
                  Circuit Inputs & Outputs Required
                </h3>
                <p className={`text-xs leading-relaxed ${isLight ? 'text-[#E5E1DD]/45' : 'text-[#E5E1DD]/60'}`}>
                  Place at least one input variable switch (Toggle Switch, Push Button) and one output indicator
                  (Output Probe, LED, or 7-Segment Display) on the canvas to generate a complete truth table.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* CONCEPT 1: Interactive Truth Table */}
              {activeTab === 'table' && (
                <div className="space-y-3">
                  {/* Filters and Search Bar */}
                  <div className={`flex flex-wrap items-center justify-between gap-2.5 p-2.5 rounded-xl border ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#080f14] border-[#A58D66]/20'
                  }`}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className={`flex items-center gap-1 p-0.5 rounded-lg border text-[11px] ${
                        isLight ? 'bg-slate-200/70 border-slate-300' : 'bg-[#080f14] border-[#A58D66]/20'
                      }`}>
                        <button
                          onClick={() => setRowFilter('all')}
                          className={`px-2.5 py-1 rounded font-semibold transition-colors cursor-pointer ${
                            rowFilter === 'all'
                              ? isLight ? 'bg-white text-slate-900 shadow-xs' : 'bg-[#0d171f] text-[#E5E1DD]'
                              : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-[#E5E1DD]/60 hover:text-[#E5E1DD]'
                          }`}
                        >
                          All ({tableRows.length})
                        </button>
                        <button
                          onClick={() => setRowFilter('ones')}
                          className={`px-2.5 py-1 rounded font-semibold transition-colors cursor-pointer ${
                            rowFilter === 'ones'
                              ? isLight ? 'bg-emerald-100 text-emerald-800 shadow-xs' : 'bg-[#A58D66]/20 text-[#DFCCA8]'
                              : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-[#E5E1DD]/60 hover:text-[#E5E1DD]'
                          }`}
                        >
                          Minterms ({mintermMap[activeOutputName]?.length || 0})
                        </button>
                        <button
                          onClick={() => setRowFilter('zeros')}
                          className={`px-2.5 py-1 rounded font-semibold transition-colors cursor-pointer ${
                            rowFilter === 'zeros'
                              ? isLight ? 'bg-white text-slate-800 shadow-xs' : 'bg-[#0d171f] text-[#DFCCA8]'
                              : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-[#E5E1DD]/60 hover:text-[#E5E1DD]'
                          }`}
                        >
                          Maxterms ({maxtermMap[activeOutputName]?.length || 0})
                        </button>
                      </div>

                      <div className="relative">
                        <Search className="w-3.5 h-3.5 text-[#E5E1DD]/60 absolute left-2.5 top-2" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search row / binary..."
                          className={`pl-8 pr-3 py-1 border rounded-lg text-xs font-mono focus:outline-none w-36 sm:w-44 ${
                            isLight
                              ? 'bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-slate-500'
                              : 'bg-[#080f14] border-[#A58D66]/20 text-[#E5E1DD] focus:border-[#A58D66]/50'
                          }`}
                        />
                      </div>
                    </div>

                    <div className={`flex items-center gap-2 text-[11px] ${isLight ? 'text-[#E5E1DD]/45' : 'text-[#E5E1DD]/60'}`}>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#DFCCA8] animate-pulse" />
                        <span>Current Canvas Row:</span>
                        <strong className={`font-mono ${isLight ? 'text-slate-800' : 'text-[#E5E1DD]'}`}>
                          {activeRowIndex >= 0 ? `#${activeRowIndex}` : 'None'}
                        </strong>
                      </span>
                    </div>
                  </div>

                  {/* Truth Table Grid */}
                  <div className={`border rounded-xl overflow-hidden shadow-xs max-h-96 overflow-y-auto ${
                    isLight ? 'border-slate-300 bg-white' : 'border-[#A58D66]/20 bg-[#080f14]'
                  }`}>
                    <table className="w-full text-center border-collapse text-xs font-mono">
                      <thead className={`sticky top-0 border-b z-10 ${
                        isLight ? 'bg-slate-100 border-slate-300 text-slate-700' : 'bg-[#0d171f] border-[#A58D66]/20 text-[#DFCCA8]'
                      }`}>
                        <tr>
                          <th className={`p-2 border-r w-12 ${isLight ? 'border-slate-300 text-[#E5E1DD]/45' : 'border-[#A58D66]/20 text-[#E5E1DD]/45'}`}>#</th>
                          <th className={`p-2 border-r w-16 ${isLight ? 'border-slate-300 text-[#E5E1DD]/45' : 'border-[#A58D66]/20 text-[#E5E1DD]/45'}`}>Term</th>
                          {variableGroups.map((v) => (
                            <th
                              key={v.name}
                              style={{ color: currentTheme.primaryColor }}
                              className={`p-2 border-r font-bold ${isLight ? 'border-slate-300' : 'border-[#A58D66]/20'}`}
                            >
                              {v.name}
                            </th>
                          ))}
                          {outputGroups.map((out) => (
                            <th
                              key={out.name}
                              style={{ color: currentTheme.accentColor }}
                              className={`p-2 border-r last:border-r-0 font-bold ${
                                isLight ? 'border-slate-300 bg-slate-100/90' : 'border-[#A58D66]/20 bg-[#0d171f]'
                              }`}
                            >
                              {out.name}
                            </th>
                          ))}
                          <th className={`p-2 w-24 ${isLight ? 'text-[#E5E1DD]/45' : 'text-[#E5E1DD]/45'}`}>Action</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${
                        isLight ? 'divide-slate-200 text-slate-700' : 'divide-slate-800/60 text-[#DFCCA8]'
                      }`}>
                        {filteredRows.length === 0 ? (
                          <tr>
                            <td
                              colSpan={3 + variableGroups.length + outputGroups.length}
                              className={`p-6 text-center font-sans ${isLight ? 'text-[#E5E1DD]/60' : 'text-[#E5E1DD]/45'}`}
                            >
                              No matching truth table rows for current filter criteria.
                            </td>
                          </tr>
                        ) : (
                          filteredRows.map((row) => {
                            const isLive = row.rowIndex === activeRowIndex;
                            const isApplied = appliedRowIndex === row.rowIndex;

                            return (
                              <tr
                                key={row.rowIndex}
                                style={
                                  isLive
                                    ? {
                                        backgroundColor: `${currentTheme.primaryColor}15`,
                                        borderColor: `${currentTheme.primaryColor}55`,
                                      }
                                    : {}
                                }
                                className={`transition-colors ${
                                  isLight ? 'hover:bg-slate-50' : 'hover:bg-[#0d171f]/50'
                                } ${isLive ? 'font-semibold' : ''}`}
                              >
                                <td className={`p-2 border-r font-mono text-[11px] ${
                                  isLight ? 'border-slate-200 text-[#E5E1DD]/45' : 'border-slate-800/80 text-[#E5E1DD]/45'
                                }`}>
                                  {row.rowIndex}
                                </td>
                                <td className={`p-2 border-r font-mono text-[11px] ${
                                  isLight ? 'border-slate-200 text-slate-600' : 'border-slate-800/80 text-[#E5E1DD]/60'
                                }`}>
                                  {row.minterm}
                                </td>
                                {variableGroups.map((v) => {
                                  const val = row.inputs[v.name];
                                  return (
                                    <td key={v.name} className={`p-2 border-r ${
                                      isLight ? 'border-slate-200' : 'border-slate-800/80'
                                    }`}>
                                      <span
                                        style={
                                          val === 1
                                            ? {
                                                backgroundColor: `${currentTheme.primaryColor}22`,
                                                color: currentTheme.primaryColor,
                                                borderColor: `${currentTheme.primaryColor}55`,
                                              }
                                            : {}
                                        }
                                        className={`px-2 py-0.5 rounded font-bold inline-block min-w-6 text-center ${
                                          val === 1 ? 'border shadow-xs' : isLight ? 'text-[#E5E1DD]/45 bg-slate-100' : 'text-[#E5E1DD]/45 bg-[#080f14]/60'
                                        }`}
                                      >
                                        {val}
                                      </span>
                                    </td>
                                  );
                                })}
                                {outputGroups.map((out) => {
                                  const outVal = row.outputs[out.name];
                                  return (
                                    <td
                                      key={out.name}
                                      className={`p-2 border-r last:border-r-0 ${
                                        isLight ? 'border-slate-200 bg-slate-50/50' : 'border-[#A58D66]/20 bg-[#080f14]'
                                      }`}
                                    >
                                      <span
                                        style={
                                          outVal === 1
                                            ? {
                                                backgroundColor: `${currentTheme.accentColor}25`,
                                                color: currentTheme.accentColor,
                                                borderColor: `${currentTheme.accentColor}60`,
                                              }
                                            : outVal === 'X'
                                            ? { backgroundColor: 'rgba(165,141,102,0.2)', color: '#DFCCA8' }
                                            : outVal === 'Z'
                                            ? { backgroundColor: '#f59e0b33', color: '#fbbf24' }
                                            : {}
                                        }
                                        className={`px-2.5 py-0.5 rounded font-bold inline-block min-w-6 text-center ${
                                          outVal === 1
                                            ? 'border shadow-xs'
                                            : isLight
                                            ? 'text-[#E5E1DD]/45 bg-slate-100'
                                            : 'text-[#E5E1DD]/45 bg-[#080f14]/80'
                                        }`}
                                      >
                                        {outVal}
                                      </span>
                                    </td>
                                  );
                                })}
                                <td className="p-1.5 text-center">
                                  <button
                                    onClick={() => handleApplyRowToCanvas(row.inputs, row.rowIndex)}
                                    style={
                                      isLive
                                        ? {
                                            backgroundColor: `${currentTheme.primaryColor}25`,
                                            color: currentTheme.primaryColor,
                                            borderColor: `${currentTheme.primaryColor}60`,
                                          }
                                        : {}
                                    }
                                    className={`px-2 py-1 rounded text-[10px] font-bold transition-all border cursor-pointer ${
                                      isApplied
                                        ? 'bg-[#A58D66] text-[#080f14] border-[#DFCCA8]'
                                        : isLive
                                        ? 'border'
                                        : isLight
                                        ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                                        : 'bg-[#080f14] hover:bg-[#0d171f] text-[#DFCCA8] border-[#A58D66]/20'
                                    }`}
                                    title="Drive canvas switches to this combination in real-time"
                                  >
                                    {isApplied ? (
                                      <span className="flex items-center gap-1 justify-center">
                                        <Check className="w-3 h-3" /> Set
                                      </span>
                                    ) : isLive ? (
                                      <span className="flex items-center gap-1 justify-center">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#76B4C2] animate-ping" />
                                        Active
                                      </span>
                                    ) : (
                                      'Test State'
                                    )}
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* CONCEPT 2: Canonical & Minimized Boolean Synthesis */}
              {activeTab === 'equations' && (
                <div className="space-y-4">
                  {/* Minimized SOP Card */}
                  <div
                    style={{
                      backgroundColor: isLight ? '#f8fafc' : `${currentTheme.canvasBg}ee`,
                      borderColor: currentTheme.borderTone,
                    }}
                    className="p-4 rounded-xl border shadow-xs space-y-3 transition-colors"
                  >
                    <div className={`flex items-center justify-between border-b pb-2.5 ${
                      isLight ? 'border-slate-200' : 'border-slate-800/80'
                    }`}>
                      <div className="flex items-center gap-2">
                        <Sparkles
                          style={{ color: currentTheme.primaryColor }}
                          className="w-4 h-4"
                        />
                        <span className={`font-bold text-xs ${isLight ? 'text-slate-900' : 'text-[#E5E1DD]'}`}>
                          Minimized Boolean Equation ({activeOutputName})
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded border font-mono ${
                          isLight ? 'bg-white border-slate-300 text-slate-700' : 'bg-[#080f14] border-slate-800 text-[#DFCCA8]'
                        }`}>
                          Optimal Prime Implicants
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => copyToClipboard(minimizedSOP, 'minimized')}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold border transition-colors cursor-pointer ${
                            isLight
                              ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-xs'
                              : 'bg-[#080f14] hover:bg-[#0d171f] text-[#DFCCA8] border-slate-800'
                          }`}
                        >
                          {copiedFormat === 'minimized' ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-500" />
                              <span className="text-emerald-500">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={handleSynthesizeMinimizedCircuit}
                          style={{
                            backgroundColor: currentTheme.primaryColor,
                            color: '#080f14',
                          }}
                          className="flex items-center gap-1.5 px-3 py-1 rounded font-bold text-[11px] transition-all shadow-xs cursor-pointer hover:opacity-95"
                        >
                          <Wand2 className="w-3.5 h-3.5" />
                          <span>Synthesize Equivalent Circuit</span>
                        </button>
                      </div>
                    </div>

                    <div className={`p-3 rounded-lg border font-mono text-sm sm:text-base flex items-center justify-between ${
                      isLight
                        ? 'bg-white border-slate-200 text-slate-900 shadow-xs'
                        : 'bg-[#080f14] border-[#A58D66]/20 text-[#E5E1DD]'
                    }`}>
                      <span className="font-bold tracking-wide">
                        <span style={{ color: currentTheme.accentColor }}>{activeOutputName}</span>
                        <span className={`mx-2 ${isLight ? 'text-[#E5E1DD]/60' : 'text-[#E5E1DD]/60'}`}>=</span>
                        <span style={{ color: currentTheme.primaryColor }}>{minimizedSOP}</span>
                      </span>
                    </div>

                    {synthesisSuccess && (
                      <div className="p-2.5 rounded-lg bg-[#76B4C2]/10 border border-emerald-500/30 text-emerald-600 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>{synthesisSuccess}</span>
                      </div>
                    )}
                  </div>

                  {/* Canonical Forms Comparison Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Canonical SOP */}
                    <div className={`p-3.5 border rounded-xl space-y-2 ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#080f14] border-[#A58D66]/20'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-[11px] font-bold uppercase tracking-wider ${
                          isLight ? 'text-slate-700' : 'text-[#DFCCA8]'
                        }`}>
                          Canonical Sum of Products (SOP)
                        </span>
                        <button
                          onClick={() => copyToClipboard(canonicalSOP, 'sop')}
                          className={`text-[10px] flex items-center gap-1 font-mono cursor-pointer ${
                            isLight ? 'text-[#E5E1DD]/45 hover:text-slate-800' : 'text-[#E5E1DD]/60 hover:text-[#E5E1DD]'
                          }`}
                        >
                          {copiedFormat === 'sop' ? 'Copied!' : 'Copy Σm'}
                        </button>
                      </div>
                      <div className={`p-2.5 border rounded-lg font-mono text-xs break-words ${
                        isLight ? 'bg-white border-slate-200 text-emerald-700 shadow-xs' : 'bg-[#080f14] border-[#A58D66]/20 text-[#DFCCA8]'
                      }`}>
                        {canonicalSOP}
                      </div>
                      <p className={`text-[10px] ${isLight ? 'text-[#E5E1DD]/45' : 'text-[#E5E1DD]/60'}`}>
                        Evaluates to 1 for all true minterm input combinations.
                      </p>
                    </div>

                    {/* Canonical POS */}
                    <div className={`p-3.5 border rounded-xl space-y-2 ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#080f14] border-[#A58D66]/20'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-[11px] font-bold uppercase tracking-wider ${
                          isLight ? 'text-slate-700' : 'text-[#DFCCA8]'
                        }`}>
                          Canonical Product of Sums (POS)
                        </span>
                        <button
                          onClick={() => copyToClipboard(canonicalPOS, 'pos')}
                          className={`text-[10px] flex items-center gap-1 font-mono cursor-pointer ${
                            isLight ? 'text-[#E5E1DD]/45 hover:text-slate-800' : 'text-[#E5E1DD]/60 hover:text-[#E5E1DD]'
                          }`}
                        >
                          {copiedFormat === 'pos' ? 'Copied!' : 'Copy ΠM'}
                        </button>
                      </div>
                      <div className={`p-2.5 border rounded-lg font-mono text-xs break-words ${
                        isLight ? 'bg-white border-slate-200 text-cyan-700 shadow-xs' : 'bg-[#080f14] border-[#A58D66]/20 text-[#DFCCA8]'
                      }`}>
                        {canonicalPOS}
                      </div>
                      <p className={`text-[10px] ${isLight ? 'text-[#E5E1DD]/45' : 'text-[#E5E1DD]/60'}`}>
                        Evaluates to 0 for all false maxterm input combinations.
                      </p>
                    </div>
                  </div>

                  {/* Export / HDL Formats */}
                  <div className={`p-3.5 border rounded-xl space-y-2 ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#080f14] border-[#A58D66]/20'
                  }`}>
                    <span className={`text-[11px] font-bold uppercase tracking-wider block ${
                      isLight ? 'text-slate-600' : 'text-[#E5E1DD]/60'
                    }`}>
                      Hardware Description Code (Verilog / VHDL):
                    </span>
                    <div className={`p-2.5 rounded-lg border font-mono text-xs flex items-center justify-between ${
                      isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-[#080f14] border-[#A58D66]/20 text-[#DFCCA8]'
                    }`}>
                      <code>
                        assign {activeOutputName} = {minimizedSOP.replace(/ \+ /g, ' | ').replace(/([A-Za-z0-9_]+)'/g, '~$1').replace(/([A-Za-z0-9_]+)([A-Za-z0-9_]+)/g, '$1 & $2')};
                      </code>
                      <button
                        onClick={() =>
                          copyToClipboard(
                            `assign ${activeOutputName} = ${minimizedSOP.replace(/ \+ /g, ' | ').replace(/([A-Za-z0-9_]+)'/g, '~$1')};`,
                            'verilog'
                          )
                        }
                        className={`text-[10px] ml-2 cursor-pointer ${
                          isLight ? 'text-[#E5E1DD]/45 hover:text-slate-800' : 'text-[#E5E1DD]/60 hover:text-[#E5E1DD]'
                        }`}
                      >
                        {copiedFormat === 'verilog' ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* CONCEPT 3: 2D Karnaugh Map Matrix & Digital Waveforms */}
              {activeTab === 'kmap' && (
                <div className="space-y-4">
                  {kmapAnalysis ? (
                    <div className={`p-4 border rounded-xl space-y-3 ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#080f14] border-[#A58D66]/20'
                    }`}>
                      <div className={`flex items-center justify-between border-b pb-2 ${
                        isLight ? 'border-slate-200' : 'border-[#A58D66]/20'
                      }`}>
                        <span className={`font-bold text-xs flex items-center gap-1.5 ${
                          isLight ? 'text-slate-800' : 'text-[#E5E1DD]'
                        }`}>
                          <Layers className="w-4 h-4 text-[#DFCCA8]" />
                          <span>2D Karnaugh Map Matrix for {activeOutputName}</span>
                        </span>
                        <span className={`text-[10px] font-mono ${isLight ? 'text-[#E5E1DD]/45' : 'text-[#E5E1DD]/60'}`}>
                          {kmapAnalysis.variableCount}-Variable Gray-Code Grid
                        </span>
                      </div>

                      {/* 2D Gray-Code Table */}
                      <div className="overflow-x-auto flex justify-center py-2">
                        <table className="border-collapse font-mono text-xs">
                          <thead>
                            <tr>
                              <th className={`p-2 border text-[10px] ${
                                isLight ? 'text-[#E5E1DD]/45 border-slate-300 bg-slate-100' : 'text-[#E5E1DD]/45 border-[#A58D66]/20 bg-[#080f14]'
                              }`}>
                                {kmapAnalysis.rowVarNames.join('')} \ {kmapAnalysis.colVarNames.join('')}
                              </th>
                              {kmapAnalysis.colHeaders.map((colH) => (
                                <th
                                  key={colH}
                                  className={`p-2 border font-bold min-w-12 text-center ${
                                    isLight ? 'border-slate-300 text-cyan-700 bg-slate-100' : 'border-[#A58D66]/20 text-[#DFCCA8] bg-[#0d171f]'
                                  }`}
                                >
                                  {colH}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {kmapAnalysis.grid.map((rowCells, rIdx) => (
                              <tr key={rIdx}>
                                <th className={`p-2 border font-bold text-center ${
                                  isLight ? 'border-slate-300 text-purple-700 bg-slate-100' : 'border-[#A58D66]/20 text-[#DFCCA8] bg-[#0d171f]'
                                }`}>
                                  {kmapAnalysis.rowHeaders[rIdx]}
                                </th>
                                {rowCells.map((cell) => (
                                  <td
                                    key={cell.mintermIndex}
                                    style={
                                      cell.value === 1
                                        ? {
                                            backgroundColor: `${currentTheme.primaryColor}25`,
                                            color: currentTheme.primaryColor,
                                            borderColor: `${currentTheme.primaryColor}40`,
                                          }
                                        : {}
                                    }
                                    className={`p-3 border text-center font-bold text-sm ${
                                      cell.value === 1
                                        ? 'shadow-inner'
                                        : isLight
                                        ? 'border-slate-300 text-[#E5E1DD]/45 bg-white'
                                        : 'border-[#A58D66]/20 text-[#E5E1DD]/45 bg-[#080f14]'
                                    }`}
                                  >
                                    <div className="flex flex-col items-center">
                                      <span>{cell.value}</span>
                                      <span className={`text-[9px] font-normal ${isLight ? 'text-[#E5E1DD]/60' : 'text-[#E5E1DD]/45'}`}>
                                        m{cell.mintermIndex}
                                      </span>
                                    </div>
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className={`p-6 text-center rounded-xl border ${
                      isLight ? 'text-[#E5E1DD]/45 bg-slate-50 border-slate-200' : 'text-[#E5E1DD]/60 bg-[#080f14] border-[#A58D66]/20'
                    }`}>
                      <p>K-Map matrix is supported for 2, 3, or 4 input variables.</p>
                    </div>
                  )}

                  {/* Digital Timing Waveform Sequence Preview */}
                  <div className={`p-4 border rounded-xl space-y-3 ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#080f14] border-[#A58D66]/20'
                  }`}>
                    <div className={`flex items-center justify-between border-b pb-2 ${
                      isLight ? 'border-slate-200' : 'border-[#A58D66]/20'
                    }`}>
                      <span className={`font-bold text-xs flex items-center gap-1.5 ${
                        isLight ? 'text-slate-800' : 'text-[#E5E1DD]'
                      }`}>
                        <Activity className="w-4 h-4 text-[#DFCCA8]" />
                        <span>Digital Timing Waveform Preview</span>
                      </span>
                      <span className={`text-[10px] font-mono ${isLight ? 'text-[#E5E1DD]/45' : 'text-[#E5E1DD]/60'}`}>
                        {totalCombinations} State Steps
                      </span>
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {/* Input Traces */}
                      {variableGroups.map((v) => (
                        <div key={v.name} className="flex items-center gap-3 text-[11px] font-mono">
                          <span
                            style={{ color: currentTheme.primaryColor }}
                            className="w-12 text-right font-bold truncate shrink-0"
                          >
                            {v.name}:
                          </span>
                          <div className={`flex-1 flex h-6 border rounded overflow-hidden ${
                            isLight ? 'bg-slate-200/70 border-slate-300' : 'bg-[#080f14] border-[#A58D66]/20'
                          }`}>
                            {tableRows.map((r) => {
                              const bit = r.inputs[v.name];
                              return (
                                <div
                                  key={r.rowIndex}
                                  className={`flex-1 border-r flex items-center justify-center relative ${
                                    isLight ? 'border-slate-300' : 'border-[#A58D66]/20'
                                  }`}
                                  title={`Step ${r.rowIndex}: ${v.name} = ${bit}`}
                                >
                                  <div
                                    style={
                                      bit === 1
                                        ? {
                                            backgroundColor: currentTheme.primaryColor,
                                            height: '65%',
                                            width: '100%',
                                            opacity: 0.9,
                                          }
                                        : {
                                            backgroundColor: isLight ? '#94a3b8' : '#1d2c38',
                                            height: '15%',
                                            width: '100%',
                                            marginTop: 'auto',
                                          }
                                    }
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}

                      {/* Output Trace */}
                      <div className={`flex items-center gap-3 text-[11px] font-mono pt-1 border-t ${
                        isLight ? 'border-slate-200' : 'border-[#A58D66]/20'
                      }`}>
                        <span
                          style={{ color: currentTheme.accentColor }}
                          className="w-12 text-right font-bold truncate shrink-0"
                        >
                          {activeOutputName}:
                        </span>
                        <div className={`flex-1 flex h-6 border rounded overflow-hidden ${
                          isLight ? 'bg-slate-200/70 border-slate-300' : 'bg-[#080f14] border-[#A58D66]/20'
                        }`}>
                          {tableRows.map((r) => {
                            const outBit = r.outputs[activeOutputName];
                            return (
                              <div
                                key={r.rowIndex}
                                className={`flex-1 border-r flex items-center justify-center relative ${
                                  isLight ? 'border-slate-300' : 'border-[#A58D66]/20'
                                }`}
                                title={`Step ${r.rowIndex}: ${activeOutputName} = ${outBit}`}
                              >
                                <div
                                  style={
                                    outBit === 1
                                      ? {
                                          backgroundColor: currentTheme.accentColor,
                                          height: '75%',
                                          width: '100%',
                                          opacity: 0.95,
                                        }
                                      : {
                                          backgroundColor: isLight ? '#94a3b8' : '#1d2c38',
                                          height: '15%',
                                          width: '100%',
                                          marginTop: 'auto',
                                        }
                                  }
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            backgroundColor: isLight ? '#f8fafc' : currentTheme.navBg,
            borderColor: currentTheme.borderTone,
          }}
          className="px-4 sm:px-6 py-3 border-t flex items-center justify-between shrink-0 transition-colors"
        >
          <div className={`flex items-center gap-2 text-xs ${isLight ? 'text-[#E5E1DD]/45' : 'text-[#E5E1DD]/60'}`}>
            <span className="hidden sm:inline">
              Variables automatically unified by label & net names.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveModal('none')}
              className={`px-4 py-2 rounded-xl font-semibold text-xs transition-colors border cursor-pointer ${
                isLight
                  ? 'text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border-slate-300 shadow-xs'
                  : 'text-[#DFCCA8] hover:text-[#E5E1DD] hover:bg-[#0d171f] border-[#A58D66]/30'
              }`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
