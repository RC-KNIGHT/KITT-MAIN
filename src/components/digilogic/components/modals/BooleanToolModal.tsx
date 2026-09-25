/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useCircuit } from '../../context/CircuitContext';
import {
  parseExpression,
  simplifyBoolean,
  SimplificationResult,
  SimplificationStep,
  getLawInfoByNameOrTag,
  BooleanLawInfo,
} from '../../engine/boolean';
import {
  Sparkles,
  X,
  Check,
  AlertCircle,
  Copy,
  Cpu,
  Delete,
  Zap,
  ShieldCheck,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Target,
  FileText,
  HelpCircle,
  Sliders,
} from 'lucide-react';

export const BooleanToolModal: React.FC = () => {
  const { activeModal, setActiveModal, synthesizeAndLoadExpression, colorMode, theme } = useCircuit();
  const isLight = colorMode === 'light';

  const [inputEquation, setInputEquation] = useState<string>("(XY + Y'X + YZ') X'Y' + X'Y' + YZ'");
  const [copiedResult, setCopiedResult] = useState(false);
  const [copiedProof, setCopiedProof] = useState(false);
  const [loadSuccessNotice, setLoadSuccessNotice] = useState<string | null>(null);

  const [solvedResult, setSolvedResult] = useState<SimplificationResult | null>(() => {
    try {
      const ast = parseExpression("(XY + Y'X + YZ') X'Y' + X'Y' + YZ'");
      return simplifyBoolean(ast);
    } catch {
      return null;
    }
  });
  const [parseError, setParseError] = useState<string | null>(null);

  // Slow Step Walkthrough Mode states
  const [viewMode, setViewMode] = useState<'all' | 'walkthrough'>('all');
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [inspectingLaw, setInspectingLaw] = useState<BooleanLawInfo | null>(null);

  // Collapsible step explanation state (hidden by default for clean line-by-line view)
  const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({});
  const [walkthroughShowDetails, setWalkthroughShowDetails] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const toggleStepExplanation = (index: number) => {
    setExpandedSteps((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleExpandAll = () => {
    if (!solvedResult) return;
    const all: Record<number, boolean> = {};
    solvedResult.steps.forEach((_, i) => {
      all[i] = true;
    });
    setExpandedSteps(all);
  };

  const handleCollapseAll = () => {
    setExpandedSteps({});
  };

  // Debounced / transition-assisted equation solving to maintain 0ms input latency (INP < 16ms)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const solveEquation = useCallback((exprToSolve: string, immediate: boolean = false) => {
    const runSolve = () => {
      const expr = exprToSolve.trim();
      if (!expr) {
        setParseError('Please enter a Boolean equation.');
        setSolvedResult(null);
        setExpandedSteps({});
        return;
      }

      try {
        const ast = parseExpression(expr);
        const simResult = simplifyBoolean(ast);
        setSolvedResult(simResult);
        setActiveStepIndex(0);
        setIsPlaying(false);
        setParseError(null);
        setExpandedSteps({});
        setWalkthroughShowDetails(false);
      } catch (err: any) {
        setParseError(err.message || 'Syntax error in Boolean equation.');
        setSolvedResult(null);
        setExpandedSteps({});
      }
    };

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    if (immediate) {
      runSolve();
    } else {
      debounceTimerRef.current = setTimeout(() => {
        runSolve();
      }, 100);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Auto-play timer for Slow Step Walkthrough (only when isPlaying is active)
  useEffect(() => {
    if (!isPlaying || !solvedResult || solvedResult.steps.length <= 1) {
      return;
    }

    const timer = setInterval(() => {
      setActiveStepIndex((prev) => {
        if (prev >= solvedResult.steps.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 2800);

    return () => clearInterval(timer);
  }, [isPlaying, solvedResult]);

  if (activeModal !== 'boolean') return null;

  const handleInsertSymbol = (sym: string) => {
    const el = inputRef.current;
    if (!el) {
      const next = inputEquation + sym;
      setInputEquation(next);
      solveEquation(next);
      return;
    }

    const start = el.selectionStart ?? inputEquation.length;
    const end = el.selectionEnd ?? inputEquation.length;
    const prev = inputEquation;

    const nextVal = prev.substring(0, start) + sym + prev.substring(end);
    setInputEquation(nextVal);
    solveEquation(nextVal);

    setTimeout(() => {
      el.focus();
      const newPos = start + sym.length;
      el.setSelectionRange(newPos, newPos);
    }, 10);
  };

  const handleBackspace = () => {
    const el = inputRef.current;
    if (!el) {
      const next = inputEquation.slice(0, -1);
      setInputEquation(next);
      if (next.trim()) solveEquation(next);
      else {
        setSolvedResult(null);
        setParseError(null);
      }
      return;
    }

    const start = el.selectionStart ?? inputEquation.length;
    const end = el.selectionEnd ?? inputEquation.length;

    let nextVal = '';
    let newPos = start;

    if (start === end) {
      if (start > 0) {
        nextVal = inputEquation.substring(0, start - 1) + inputEquation.substring(end);
        newPos = start - 1;
      } else {
        return;
      }
    } else {
      nextVal = inputEquation.substring(0, start) + inputEquation.substring(end);
      newPos = start;
    }

    setInputEquation(nextVal);
    if (nextVal.trim()) solveEquation(nextVal);
    else {
      setSolvedResult(null);
      setParseError(null);
    }

    setTimeout(() => {
      el.focus();
      el.setSelectionRange(newPos, newPos);
    }, 10);
  };

  const handleClear = () => {
    setInputEquation('');
    setSolvedResult(null);
    setParseError(null);
    if (inputRef.current) inputRef.current.focus();
  };

  const handleCopyResult = () => {
    if (!solvedResult) return;
    navigator.clipboard.writeText(solvedResult.simplifiedExpression);
    setCopiedResult(true);
    setTimeout(() => setCopiedResult(false), 2000);
  };

  const handleCopyProof = () => {
    if (!solvedResult) return;
    const proofText = solvedResult.steps
      .map((s, idx) => {
        let text = `Step ${idx + 1}: Y = ${s.expression}  [${s.lawName}]`;
        if (s.selectedTerms) text += `\n  • Selected Terms: ${s.selectedTerms}`;
        if (s.formulaUsed) text += `\n  • Identity / Law: ${s.formulaUsed}`;
        if (s.explanation) text += `\n  • Details: ${s.explanation}`;
        return text;
      })
      .join('\n\n');

    navigator.clipboard.writeText(proofText);
    setCopiedProof(true);
    setTimeout(() => setCopiedProof(false), 2000);
  };

  const [synthesisArch, setSynthesisArch] = useState<
    'direct' | 'optimized_xor' | 'universal_nand' | 'universal_nor'
  >('optimized_xor');

  const handleSynthesizeOriginal = () => {
    if (!inputEquation.trim()) return;
    const res = synthesizeAndLoadExpression(inputEquation, 'replace', synthesisArch);
    if (res.success) {
      setLoadSuccessNotice(`Synthesized original expression [${synthesisArch.toUpperCase()}] onto canvas!`);
      setTimeout(() => {
        setLoadSuccessNotice(null);
        setActiveModal('none');
      }, 1200);
    } else {
      setParseError(res.error || 'Failed to synthesize original circuit from expression.');
    }
  };

  const handleSynthesizeSimplified = () => {
    if (!solvedResult) return;
    const res = synthesizeAndLoadExpression(
      solvedResult.simplifiedExpression,
      'replace',
      synthesisArch
    );
    if (res.success) {
      setLoadSuccessNotice(`Synthesized minimal expression [${synthesisArch.toUpperCase()}] onto canvas!`);
      setTimeout(() => {
        setLoadSuccessNotice(null);
        setActiveModal('none');
      }, 1200);
    } else {
      setParseError(res.error || 'Failed to synthesize simplified circuit.');
    }
  };

  const handleOpenLawInfo = (lawName: string) => {
    const info = getLawInfoByNameOrTag(lawName);
    if (info) {
      setInspectingLaw(info);
    }
  };

  const currentWalkthroughStep: SimplificationStep | undefined =
    solvedResult && solvedResult.steps[activeStepIndex]
      ? solvedResult.steps[activeStepIndex]
      : solvedResult?.steps[0];

  return (
    <div
      id="boolean_solver_modal_backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#080f14]/75 backdrop-blur-xs p-2 sm:p-4 md:p-6 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) setActiveModal('none');
      }}
    >
      <div
        id="boolean_solver_modal_content"
        className={`rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-scale-up border transition-colors ${
          isLight
            ? 'bg-white border-slate-300 text-slate-800'
            : 'bg-[#0d171f] border-[#A58D66]/20 text-[#E5E1DD]'
        }`}
      >
        {/* Modal Header */}
        <div className={`flex items-center justify-between px-4 sm:px-6 py-4 border-b shrink-0 transition-colors ${
          isLight
            ? 'bg-slate-50 border-slate-200'
            : 'bg-[#0d171f] border-[#A58D66]/20'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shadow-xs ${
              isLight
                ? 'bg-cyan-50 border-cyan-200 text-cyan-600'
                : 'bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border-[#76B4C2]/40'
            }`}>
              <Sparkles className={`w-5 h-5 ${isLight ? 'text-cyan-600' : 'text-[#76B4C2]'}`} />
            </div>
            <div>
              <h2 className={`text-base sm:text-lg font-bold flex items-center gap-2 ${
                isLight ? 'text-slate-900' : 'text-[#E5E1DD]'
              }`}>
                <span>Boolean Algebra Simplifier & Proof Engine</span>
              </h2>
              <p className={`text-xs ${isLight ? 'text-[#E5E1DD]/45' : 'text-[#E5E1DD]/60'}`}>
                Textbook law-by-law algebraic reduction, slow walkthrough, and instant circuit synthesis
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveModal('none')}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isLight
                ? 'text-[#E5E1DD]/45 hover:text-slate-800 hover:bg-slate-100'
                : 'text-[#E5E1DD]/60 hover:text-[#E5E1DD] hover:bg-[#0d171f]/80'
            }`}
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs sm:text-sm">
          {/* Equation Input & Formula Bar */}
          <div className={`p-4 rounded-xl space-y-3 shadow-xs border transition-colors ${
            isLight
              ? 'bg-slate-50 border-slate-200'
              : 'bg-[#080f14]/80 border-[#A58D66]/20'
          }`}>
            <div className="flex items-center justify-between">
              <label htmlFor="boolean_equation_input" className={`font-bold flex items-center gap-2 ${
                isLight ? 'text-slate-800' : 'text-[#DFCCA8]'
              }`}>
                <span>Enter Boolean Equation:</span>
                <span className={`text-[11px] font-normal ${isLight ? 'text-[#E5E1DD]/45' : 'text-[#E5E1DD]/45'}`}>
                  (Supports literals A-Z, NOT &apos;, AND ·, OR +, XOR ⊕, XNOR ⊙, parens)
                </span>
              </label>

              {inputEquation && (
                <button
                  onClick={handleClear}
                  className="text-xs font-semibold text-[#DFCCA8] hover:text-[#A58D66] transition-colors cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="relative">
              <input
                id="boolean_equation_input"
                name="boolean_formula_field"
                ref={inputRef}
                type="text"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                inputMode="text"
                data-lpignore="true"
                data-form-type="other"
                data-1p-ignore="true"
                value={inputEquation}
                onChange={(e) => {
                  const val = e.target.value;
                  setInputEquation(val);
                  solveEquation(val, false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    solveEquation(inputEquation, true);
                  }
                }}
                placeholder="e.g. (XY + Y'X + YZ') X'Y' + X'Y' + YZ' or A ⊕ B ⊕ C"
                className={`w-full px-4 py-3 rounded-xl font-mono text-sm sm:text-base focus:outline-hidden transition-all pr-24 shadow-xs border ${
                  isLight
                    ? 'bg-white border-slate-300 text-slate-900 focus:border-cyan-600 focus:ring-1 focus:ring-cyan-500'
                    : 'bg-[#080f14] border-[#A58D66]/20 text-[#DFCCA8] focus:border-[#A58D66]'
                }`}
              />
              <button
                type="button"
                onClick={() => solveEquation(inputEquation, true)}
                className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-[#407E8C] hover:bg-[#76B4C2] active:bg-cyan-700 text-[#E5E1DD] font-bold rounded-lg transition-colors flex items-center gap-1.5 text-xs cursor-pointer shadow-xs"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Solve</span>
              </button>
            </div>

            {/* Error banner if invalid syntax */}
            {parseError && (
              <div className="p-3 bg-[#A58D66]/10 border border-[#A58D66]/30 rounded-lg text-[#DFCCA8] text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#A58D66]" />
                <span>{parseError}</span>
              </div>
            )}

            {/* Math Symbol Virtual Keypad - Clean & Touch Optimized */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <div className="flex items-center gap-1">
                <span className={`text-[10px] uppercase font-bold mr-0.5 tracking-wider ${
                  isLight ? 'text-slate-600' : 'text-[#E5E1DD]/60'
                }`}>Vars:</span>
                {['A', 'B', 'C', 'D', 'X', 'Y', 'Z'].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleInsertSymbol(v)}
                    className={`min-h-[42px] min-w-[36px] sm:min-w-[40px] px-2.5 sm:px-3 py-1.5 rounded-lg font-mono text-sm font-bold border transition-colors shadow-xs cursor-pointer ${
                      isLight
                        ? 'bg-white hover:bg-slate-100 active:bg-cyan-100 text-cyan-800 border-slate-300'
                        : 'bg-[#0d171f] hover:bg-[#0d171f] active:bg-[#76B4C2] text-cyan-300 active:text-[#080f14] border-[#A58D66]/20'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>

              <div className={`h-6 w-px mx-1 hidden sm:block ${isLight ? 'bg-slate-200' : 'bg-[#0d171f]'}`} />

              {/* Operators & Logic Symbols */}
              <div className="flex flex-wrap items-center gap-1 flex-1">
                <span className={`text-[10px] uppercase font-bold mr-0.5 tracking-wider ${
                  isLight ? 'text-slate-600' : 'text-[#E5E1DD]/60'
                }`}>Ops:</span>
                {[
                  { label: "'", sym: "'", title: 'NOT' },
                  { label: '·', sym: ' · ', title: 'AND' },
                  { label: '+', sym: ' + ', title: 'OR' },
                  { label: '⊕', sym: ' ⊕ ', title: 'XOR' },
                  { label: '⊙', sym: ' ⊙ ', title: 'XNOR' },
                  { label: 'NAND', sym: 'NAND(', title: 'NAND(' },
                  { label: 'NOR', sym: 'NOR(', title: 'NOR(' },
                  { label: '(', sym: '(', title: 'Open Paren' },
                  { label: ')', sym: ')', title: 'Close Paren' },
                  { label: ',', sym: ', ', title: 'Comma' },
                  { label: '0', sym: '0', title: '0' },
                  { label: '1', sym: '1', title: '1' },
                ].map((op) => (
                  <button
                    key={op.label}
                    type="button"
                    title={op.title}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleInsertSymbol(op.sym)}
                    className={`min-h-[42px] min-w-[36px] sm:min-w-[40px] px-2.5 sm:px-3 py-1.5 rounded-lg font-mono text-xs sm:text-sm font-bold border transition-colors shadow-xs cursor-pointer ${
                      isLight
                        ? 'bg-white hover:bg-slate-100 active:bg-cyan-100 text-slate-800 border-slate-300'
                        : 'bg-[#0d171f] hover:bg-[#0d171f] active:bg-[#76B4C2] text-[#E5E1DD] active:text-[#080f14] border-[#A58D66]/20'
                    }`}
                  >
                    {op.label}
                  </button>
                ))}

                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={handleBackspace}
                  className={`min-h-[42px] px-3.5 py-1.5 rounded-lg font-semibold border transition-colors flex items-center gap-1.5 text-xs cursor-pointer ml-auto ${
                    isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                      : 'bg-[#080f14] hover:bg-[#0d171f] text-[#DFCCA8] border-[#A58D66]/20'
                  }`}
                  title="Backspace"
                >
                  <Delete className="w-4 h-4" />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              </div>
            </div>
          </div>

          {/* Solved Result Card & Step-by-Step Derivation */}
          {solvedResult && (
            <div className="space-y-4">
              {/* Final Result Card */}
              <div className={`p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-lg border transition-colors ${
                isLight
                  ? 'bg-gradient-to-r from-cyan-50 via-sky-50 to-slate-50 border-cyan-300 text-slate-900'
                  : 'bg-gradient-to-r from-cyan-950/50 via-blue-950/40 to-slate-900 border-[#76B4C2]/40'
              }`}>
                <div>
                  <span className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                    isLight ? 'text-cyan-700' : 'text-[#76B4C2]'
                  }`}>
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Simplest Minimal Form:</span>
                  </span>
                  <div className={`text-xl sm:text-2xl font-bold font-mono mt-1 ${
                    isLight ? 'text-cyan-950' : 'text-cyan-200'
                  }`}>
                    Y = {solvedResult.simplifiedExpression}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyResult}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                      isLight
                        ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-xs'
                        : 'bg-[#0d171f] hover:bg-[#0d171f] text-[#E5E1DD] border-[#A58D66]/20'
                    }`}
                  >
                    {copiedResult ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className={`w-3.5 h-3.5 ${isLight ? 'text-[#E5E1DD]/45' : 'text-[#E5E1DD]/60'}`} />}
                    <span>{copiedResult ? 'Copied' : 'Copy Result'}</span>
                  </button>

                  <button
                    onClick={handleCopyProof}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                      isLight
                        ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-xs'
                        : 'bg-[#0d171f] hover:bg-[#0d171f] text-[#E5E1DD] border-[#A58D66]/20'
                    }`}
                  >
                    {copiedProof ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className={`w-3.5 h-3.5 ${isLight ? 'text-[#E5E1DD]/45' : 'text-[#E5E1DD]/60'}`} />}
                    <span>{copiedProof ? 'Copied Proof' : 'Copy All Steps'}</span>
                  </button>
                </div>
              </div>

              {/* Step-by-Step Derivation Header & Mode Switcher */}
              <div className={`p-4 rounded-xl space-y-3.5 shadow-xs border transition-colors ${
                isLight
                  ? 'bg-slate-50 border-slate-200'
                  : 'bg-[#080f14]/90 border-[#A58D66]/20'
              }`}>
                <div className={`flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b ${
                  isLight ? 'border-slate-200' : 'border-[#A58D66]/20'
                }`}>
                  <div className="flex flex-wrap items-center gap-2">
                    <Zap className="w-4 h-4 text-[#A58D66]" />
                    <span className={`font-bold text-xs sm:text-sm ${
                      isLight ? 'text-slate-900' : 'text-[#E5E1DD]'
                    }`}>
                      Algebraic Derivation
                    </span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                      isLight
                        ? 'text-cyan-800 bg-cyan-100 border-cyan-300'
                        : 'text-[#76B4C2] bg-cyan-950/60 border-cyan-800/40'
                    }`}>
                      {solvedResult.steps.length} Steps
                    </span>

                    {viewMode === 'all' && (
                      <div className="flex items-center gap-1 ml-1 text-xs">
                        <button
                          onClick={handleExpandAll}
                          className={`px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                            isLight
                              ? 'text-slate-600 hover:text-cyan-700 hover:bg-slate-200'
                              : 'text-[#E5E1DD]/60 hover:text-cyan-300 hover:bg-[#0d171f]'
                          }`}
                        >
                          Expand All
                        </button>
                        <span className={isLight ? 'text-[#DFCCA8]' : 'text-slate-600'}>|</span>
                        <button
                          onClick={handleCollapseAll}
                          className={`px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                            isLight
                              ? 'text-slate-600 hover:text-cyan-700 hover:bg-slate-200'
                              : 'text-[#E5E1DD]/60 hover:text-cyan-300 hover:bg-[#0d171f]'
                          }`}
                        >
                          Collapse All
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Mode Tabs: All Steps vs Slow Walkthrough */}
                  <div className={`flex items-center gap-1 p-1 rounded-lg border ${
                    isLight
                      ? 'bg-white border-slate-300 shadow-2xs'
                      : 'bg-[#080f14] border-[#A58D66]/20'
                  }`}>
                    <button
                      onClick={() => {
                        setViewMode('all');
                        setIsPlaying(false);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold text-xs transition-colors cursor-pointer ${
                        viewMode === 'all'
                          ? isLight
                            ? 'bg-cyan-100 text-cyan-800 border border-cyan-300'
                            : 'bg-[#76B4C2]/20 text-cyan-300 border border-[#76B4C2]/30'
                          : isLight
                          ? 'text-slate-600 hover:text-slate-900'
                          : 'text-[#E5E1DD]/60 hover:text-[#E5E1DD]'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>All Steps View</span>
                    </button>

                    <button
                      onClick={() => setViewMode('walkthrough')}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold text-xs transition-colors cursor-pointer ${
                        viewMode === 'walkthrough'
                          ? isLight
                            ? 'bg-cyan-100 text-cyan-800 border border-cyan-300'
                            : 'bg-[#76B4C2]/20 text-cyan-300 border border-[#76B4C2]/30'
                          : isLight
                          ? 'text-slate-600 hover:text-slate-900'
                          : 'text-[#E5E1DD]/60 hover:text-[#E5E1DD]'
                      }`}
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Slow Walkthrough</span>
                    </button>
                  </div>
                </div>

                {/* MODE 1: Slow Interactive Walkthrough */}
                {viewMode === 'walkthrough' && currentWalkthroughStep && (
                  <div className="space-y-4 pt-1">
                    {/* Step Navigation Controls & Progress Bar */}
                    <div className={`p-3 rounded-xl space-y-3 border ${
                      isLight ? 'bg-white border-slate-200 shadow-2xs' : 'bg-[#080f14] border-[#A58D66]/20'
                    }`}>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold ${isLight ? 'text-slate-800' : 'text-[#DFCCA8]'}`}>
                            Step {activeStepIndex + 1} of {solvedResult.steps.length}
                          </span>
                          <span className={`text-[10px] ${isLight ? 'text-[#E5E1DD]/45' : 'text-[#E5E1DD]/60'}`}>
                            ({Math.round(((activeStepIndex + 1) / solvedResult.steps.length) * 100)}% complete)
                          </span>
                        </div>

                        {/* Interactive Buttons */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setIsPlaying(false);
                              setActiveStepIndex((prev) => Math.max(0, prev - 1));
                            }}
                            disabled={activeStepIndex === 0}
                            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg disabled:opacity-30 text-xs font-semibold border transition-colors cursor-pointer ${
                              isLight
                                ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-xs'
                                : 'bg-[#0d171f] hover:bg-[#0d171f] text-[#E5E1DD] border-[#A58D66]/20'
                            }`}
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            <span>Prev Step</span>
                          </button>

                          <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                              isLight
                                ? 'bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border-cyan-300'
                                : 'bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border-cyan-700/60'
                            }`}
                            title={isPlaying ? 'Pause Auto-Walkthrough' : 'Slow Auto-Play Steps'}
                          >
                            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                            <span>{isPlaying ? 'Pause' : 'Auto Play (Slow)'}</span>
                          </button>

                          <button
                            onClick={() => {
                              setIsPlaying(false);
                              setActiveStepIndex((prev) => Math.min(solvedResult.steps.length - 1, prev + 1));
                            }}
                            disabled={activeStepIndex === solvedResult.steps.length - 1}
                            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg disabled:opacity-30 text-xs font-semibold border transition-colors cursor-pointer ${
                              isLight
                                ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-xs'
                                : 'bg-[#0d171f] hover:bg-[#0d171f] text-[#E5E1DD] border-[#A58D66]/20'
                            }`}
                          >
                            <span>Next Step</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className={`w-full rounded-full h-1.5 overflow-hidden border ${
                        isLight ? 'bg-slate-200 border-slate-300' : 'bg-[#080f14] border-[#A58D66]/20'
                      }`}>
                        <div
                          className="bg-gradient-to-r from-[#A58D66] to-[#DFCCA8] h-full transition-all duration-300"
                          style={{
                            width: `${((activeStepIndex + 1) / solvedResult.steps.length) * 100}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Active Step Card */}
                    <div className={`p-4 sm:p-5 rounded-xl border space-y-3.5 shadow-md ${
                      isLight
                        ? 'bg-white border-cyan-300'
                        : 'bg-[#080f14] border-[#A58D66]/20'
                    }`}>
                      {/* Step Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center border ${
                            isLight
                              ? 'bg-cyan-100 text-cyan-800 border-cyan-300'
                              : 'bg-[#76B4C2]/20 text-cyan-300 border-[#76B4C2]/40'
                          }`}>
                            {activeStepIndex + 1}
                          </span>
                          <span className={`font-bold text-xs uppercase tracking-wide ${
                            isLight ? 'text-slate-800' : 'text-[#DFCCA8]'
                          }`}>
                            {activeStepIndex === 0
                              ? 'Initial Problem'
                              : activeStepIndex === solvedResult.steps.length - 1
                              ? 'Final Simplest Form'
                              : `Transformation ${activeStepIndex}`}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenLawInfo(currentWalkthroughStep.lawName)}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                              isLight
                                ? 'bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border-cyan-300'
                                : 'bg-cyan-950/80 hover:bg-cyan-900 text-cyan-300 border-cyan-700/60'
                            }`}
                            title="Click to view full textbook law definition & examples"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>{currentWalkthroughStep.lawName}</span>
                          </button>

                          {(currentWalkthroughStep.explanation || currentWalkthroughStep.selectedTerms || currentWalkthroughStep.formulaUsed) && (
                            <button
                              onClick={() => setWalkthroughShowDetails(!walkthroughShowDetails)}
                              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                                walkthroughShowDetails
                                  ? isLight
                                    ? 'bg-cyan-100 border-cyan-300 text-cyan-800'
                                    : 'bg-[#76B4C2]/20 border-[#76B4C2]/40 text-cyan-300'
                                  : isLight
                                  ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-xs'
                                  : 'bg-[#0d171f] hover:bg-[#0d171f] text-[#DFCCA8] border-[#A58D66]/20'
                              }`}
                            >
                              <HelpCircle className="w-3.5 h-3.5 text-[#76B4C2]" />
                              <span>{walkthroughShowDetails ? 'Hide Details' : 'Explain Step'}</span>
                              {walkthroughShowDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Equation display */}
                      <div className={`p-3.5 rounded-xl font-mono text-base sm:text-lg font-bold break-all border ${
                        isLight
                          ? 'bg-slate-50 border-slate-200 text-cyan-950 shadow-2xs'
                          : 'bg-[#080f14]/90 border-[#A58D66]/20 text-cyan-200'
                      }`}>
                        = {currentWalkthroughStep.expression}
                      </div>

                      {/* Collapsible Dropdown Details */}
                      {walkthroughShowDetails && (
                        <div className={`space-y-3 pt-1 animate-fade-in border-t ${
                          isLight ? 'border-slate-200' : 'border-[#A58D66]/20'
                        }`}>
                          {/* Deep pedagogical breakdown */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-2">
                            {currentWalkthroughStep.selectedTerms && (
                              <div className={`p-3 rounded-lg space-y-1 border ${
                                isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#080f14]/60 border-[#A58D66]/20'
                              }`}>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
                                  <Target className="w-3.5 h-3.5" />
                                  <span>Terms Selected / Grouped:</span>
                                </span>
                                <p className={`font-mono text-xs ${isLight ? 'text-slate-800' : 'text-[#E5E1DD]'}`}>
                                  {currentWalkthroughStep.selectedTerms}
                                </p>
                              </div>
                            )}

                            {currentWalkthroughStep.formulaUsed && (
                              <div className={`p-3 rounded-lg space-y-1 border ${
                                isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#080f14]/60 border-[#A58D66]/20'
                              }`}>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#A58D66] flex items-center gap-1.5">
                                  <Zap className="w-3.5 h-3.5" />
                                  <span>Formula / Identity Applied:</span>
                                </span>
                                <p className="text-[#DFCCA8] font-mono text-xs font-semibold">
                                  {currentWalkthroughStep.formulaUsed}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Full human-friendly explanation */}
                          {currentWalkthroughStep.explanation && (
                            <div className={`p-3.5 rounded-xl space-y-1 border ${
                              isLight ? 'bg-cyan-50/70 border-cyan-200' : 'bg-cyan-950/30 border-[#76B4C2]/20'
                            }`}>
                              <span className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                                isLight ? 'text-cyan-800' : 'text-[#76B4C2]'
                              }`}>
                                <HelpCircle className="w-3.5 h-3.5" />
                                <span>How it was simplified:</span>
                              </span>
                              <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-700' : 'text-[#DFCCA8]'}`}>
                                {currentWalkthroughStep.explanation}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* MODE 2: All Steps View with Clean Line-by-Line List & Expandable Dropdowns */}
                {viewMode === 'all' && (
                  <div className="space-y-2.5 font-mono">
                    {solvedResult.steps.map((step, idx) => {
                      const isFinal = idx === solvedResult.steps.length - 1;
                      const isExpanded = !!expandedSteps[idx];
                      const hasDetails = !!(step.explanation || step.selectedTerms || step.formulaUsed);

                      return (
                        <div
                          key={idx}
                          className={`rounded-xl border transition-all overflow-hidden ${
                            isFinal
                              ? isLight
                                ? 'bg-amber-50 border-[#A58D66]/40 shadow-xs'
                                : 'bg-[#A58D66]/15 border-[#A58D66]/40 shadow-xs'
                              : isLight
                              ? 'bg-white border-slate-200 shadow-2xs'
                              : 'bg-[#080f14] border-[#A58D66]/20'
                          }`}
                        >
                          {/* Clean, compact Step Row */}
                          <div className="p-3 sm:p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                            {/* Left: Step Number & Equation */}
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <span
                                className={`w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center shrink-0 border ${
                                  isFinal
                                    ? isLight
                                      ? 'bg-amber-100 text-[#A58D66] border-[#A58D66]/40'
                                      : 'bg-[#A58D66]/30 text-[#DFCCA8] border-[#A58D66]/50'
                                    : isLight
                                    ? 'bg-slate-100 text-slate-700 border-slate-300'
                                    : 'bg-[#0d171f] text-[#76B4C2] border-[#A58D66]/20'
                                }`}
                              >
                                {idx + 1}
                              </span>
                              <span
                                className={`font-bold text-sm sm:text-base break-all ${
                                  isFinal
                                    ? isLight
                                      ? 'text-[#A58D66]'
                                      : 'text-[#DFCCA8]'
                                    : isLight
                                    ? 'text-slate-900'
                                    : 'text-cyan-200'
                                }`}
                              >
                                = {step.expression}
                              </span>
                            </div>

                            {/* Right: Law Badge & Dropdown Explanation Button */}
                            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto font-sans">
                              <button
                                onClick={() => handleOpenLawInfo(step.lawName)}
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer border ${
                                  isLight
                                    ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-300'
                                    : 'bg-[#0d171f]/90 hover:bg-[#0d171f] text-cyan-300 border-[#A58D66]/20'
                                }`}
                                title="View law definition in textbook guide"
                              >
                                <BookOpen className="w-3 h-3 text-[#76B4C2]" />
                                <span>{step.lawName}</span>
                              </button>

                              {hasDetails && (
                                <button
                                  onClick={() => toggleStepExplanation(idx)}
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                                    isExpanded
                                      ? isLight
                                        ? 'bg-cyan-100 text-cyan-800 border-cyan-300 shadow-inner'
                                        : 'bg-[#76B4C2]/20 text-cyan-300 border-[#76B4C2]/40 shadow-inner'
                                      : isLight
                                      ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-xs'
                                      : 'bg-[#080f14] hover:bg-[#0d171f] text-[#DFCCA8] hover:text-cyan-300 border-[#A58D66]/20/80'
                                  }`}
                                  title={isExpanded ? 'Hide explanation' : 'Show step explanation dropdown'}
                                >
                                  <HelpCircle className="w-3 h-3 text-[#76B4C2]" />
                                  <span>{isExpanded ? 'Hide' : 'Explain'}</span>
                                  {isExpanded ? (
                                    <ChevronUp className={`w-3.5 h-3.5 ${isLight ? 'text-cyan-700' : 'text-cyan-300'}`} />
                                  ) : (
                                    <ChevronDown className={`w-3.5 h-3.5 ${isLight ? 'text-[#E5E1DD]/45' : 'text-[#E5E1DD]/60'}`} />
                                  )}
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Expandable Dropdown Content Area */}
                          {isExpanded && hasDetails && (
                            <div className={`px-3.5 pb-3.5 pt-1 space-y-2.5 border-t animate-fade-in font-sans ${
                              isLight ? 'border-slate-200 bg-slate-50/70' : 'border-[#A58D66]/20 bg-[#080f14]/40'
                            }`}>
                              {/* Terms selected & formula applied */}
                              {(step.selectedTerms || step.formulaUsed) && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                                  {step.selectedTerms && (
                                    <div className={`p-2 rounded-lg border flex items-start gap-1.5 ${
                                      isLight ? 'bg-white border-slate-200' : 'bg-[#080f14]/90 border-[#A58D66]/20'
                                    }`}>
                                      <Target className="w-3.5 h-3.5 text-[#A58D66] shrink-0 mt-0.5" />
                                      <div>
                                        <span className={`font-semibold mr-1 ${isLight ? 'text-[#E5E1DD]/45' : 'text-[#E5E1DD]/60'}`}>Target Terms:</span>
                                        <span className={`font-mono ${isLight ? 'text-slate-800' : 'text-[#E5E1DD]'}`}>{step.selectedTerms}</span>
                                      </div>
                                    </div>
                                  )}

                                  {step.formulaUsed && (
                                    <div className={`p-2 rounded-lg border flex items-start gap-1.5 ${
                                      isLight ? 'bg-white border-slate-200' : 'bg-[#080f14]/90 border-[#A58D66]/20'
                                    }`}>
                                      <Zap className="w-3.5 h-3.5 text-[#A58D66] shrink-0 mt-0.5" />
                                      <div>
                                        <span className={`font-semibold mr-1 ${isLight ? 'text-[#E5E1DD]/45' : 'text-[#E5E1DD]/60'}`}>Identity / Formula:</span>
                                        <span className="font-mono text-[#DFCCA8] font-semibold">{step.formulaUsed}</span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Human Pedagogical Step Explanation */}
                              {step.explanation && (
                                <div className={`p-2.5 rounded-lg border text-xs leading-relaxed flex items-start gap-2 ${
                                  isLight ? 'bg-white border-slate-200 text-slate-700' : 'bg-[#080f14] border-[#A58D66]/20 text-[#DFCCA8]'
                                }`}>
                                  <HelpCircle className="w-3.5 h-3.5 text-[#76B4C2] shrink-0 mt-0.5" />
                                  <div className="space-y-0.5">
                                    <span className={`text-[10px] uppercase font-bold block tracking-wider ${
                                      isLight ? 'text-cyan-700' : 'text-[#76B4C2]'
                                    }`}>
                                      Transformation Explanation
                                    </span>
                                    <p className={isLight ? 'text-slate-700' : 'text-[#DFCCA8]'}>{step.explanation}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {loadSuccessNotice && (
            <div className="p-3 bg-[#A58D66]/10 border border-[#A58D66]/30 rounded-lg text-[#DFCCA8] text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>{loadSuccessNotice}</span>
            </div>
          )}
        </div>

        {/* Modal Law Dictionary Inspector Drawer */}
        {inspectingLaw && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-[#080f14]/70 p-4 animate-fade-in">
            <div className={`border rounded-2xl w-full max-w-lg shadow-2xl p-5 space-y-4 text-xs transition-colors ${
              isLight
                ? 'bg-white border-slate-300 text-slate-800'
                : 'bg-[#0d171f] border-[#A58D66]/30 text-[#E5E1DD]'
            }`}>
              <div className={`flex items-center justify-between border-b pb-3 ${
                isLight ? 'border-slate-200' : 'border-[#A58D66]/20'
              }`}>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#76B4C2]" />
                  <h3 className={`font-bold text-base ${isLight ? 'text-slate-900' : 'text-[#E5E1DD]'}`}>
                    {inspectingLaw.name}
                  </h3>
                </div>
                <button
                  onClick={() => setInspectingLaw(null)}
                  className={`p-1 rounded-lg transition-colors cursor-pointer ${
                    isLight
                      ? 'text-[#E5E1DD]/60 hover:text-slate-700 hover:bg-slate-100'
                      : 'text-[#E5E1DD]/60 hover:text-[#E5E1DD] hover:bg-[#0d171f]'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className={`space-y-3 ${isLight ? 'text-slate-700' : 'text-[#DFCCA8]'}`}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className={`p-2.5 rounded-lg border ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#080f14] border-[#A58D66]/20'
                  }`}>
                    <span className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${
                      isLight ? 'text-cyan-700' : 'text-[#76B4C2]'
                    }`}>
                      Primal Form (AND/OR)
                    </span>
                    <span className={`font-mono font-bold ${isLight ? 'text-slate-900' : 'text-[#E5E1DD]'}`}>
                      {inspectingLaw.primalEquation}
                    </span>
                  </div>

                  <div className={`p-2.5 rounded-lg border ${
                    isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#080f14] border-[#A58D66]/20'
                  }`}>
                    <span className="text-[10px] font-bold text-[#DFCCA8] uppercase tracking-wider block mb-1">
                      Dual Form
                    </span>
                    <span className={`font-mono font-bold ${isLight ? 'text-slate-900' : 'text-[#E5E1DD]'}`}>
                      {inspectingLaw.dualEquation}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-[#E5E1DD]'}`}>Rule Description:</span>
                  <p className={`leading-relaxed ${isLight ? 'text-slate-600' : 'text-[#DFCCA8]'}`}>{inspectingLaw.description}</p>
                </div>

                {inspectingLaw.example && (
                  <div className="space-y-1 pt-1">
                    <span className={`font-bold ${isLight ? 'text-slate-900' : 'text-[#E5E1DD]'}`}>Textbook Example:</span>
                    <pre className={`p-2.5 rounded-lg font-mono text-[11px] whitespace-pre-wrap border ${
                      isLight
                        ? 'bg-slate-50 border-slate-200 text-slate-800'
                        : 'bg-[#080f14] border-[#A58D66]/20 text-[#DFCCA8]'
                    }`}>
                      {inspectingLaw.example}
                    </pre>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setInspectingLaw(null)}
                  className="px-4 py-1.5 rounded-lg bg-[#407E8C] hover:bg-[#76B4C2] text-[#E5E1DD] font-bold transition-colors cursor-pointer"
                >
                  Got It
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer: Prominent Actions & Synthesis Mode */}
        <div className={`px-4 sm:px-6 py-3.5 border-t flex flex-wrap items-center justify-between gap-3 text-xs shrink-0 transition-colors ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#0d171f] border-[#A58D66]/20'
        }`}>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-[11px] font-bold uppercase tracking-wider hidden sm:inline ${
              isLight ? 'text-[#E5E1DD]/45' : 'text-[#E5E1DD]/60'
            }`}>
              Target Mode:
            </span>
            <div className={`flex items-center gap-1 p-1 rounded-xl border ${
              isLight ? 'bg-white border-slate-300 shadow-2xs' : 'bg-[#080f14] border-[#A58D66]/20'
            }`}>
              <button
                onClick={() => setSynthesisArch('direct')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  synthesisArch === 'direct'
                    ? isLight
                      ? 'bg-[#0d171f] text-[#E5E1DD] font-bold shadow-xs'
                      : 'bg-[#0d171f] text-[#E5E1DD] font-bold shadow-xs'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900'
                    : 'text-[#E5E1DD]/60 hover:text-[#E5E1DD]'
                }`}
                title="Synthesize exact gates from formula (Direct translation)"
              >
                OG Direct
              </button>
              <button
                onClick={() => setSynthesisArch('optimized_xor')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  synthesisArch === 'optimized_xor'
                    ? 'bg-[#A58D66] text-[#080f14] font-bold shadow-xs'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900'
                    : 'text-[#E5E1DD]/60 hover:text-[#E5E1DD]'
                }`}
                title="Optimize XOR/XNOR patterns to save gates and canvas space"
              >
                ✨ XOR Optimized
              </button>
              <button
                onClick={() => setSynthesisArch('universal_nand')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  synthesisArch === 'universal_nand'
                    ? 'bg-[#407E8C] text-[#E5E1DD] font-bold shadow-xs'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900'
                    : 'text-[#E5E1DD]/60 hover:text-[#E5E1DD]'
                }`}
                title="Synthesize 100% all-NAND universal logic"
              >
                🛡️ All-NAND
              </button>
              <button
                onClick={() => setSynthesisArch('universal_nor')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  synthesisArch === 'universal_nor'
                    ? 'bg-[#407E8C] text-[#E5E1DD] font-bold shadow-xs'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900'
                    : 'text-[#E5E1DD]/60 hover:text-[#E5E1DD]'
                }`}
                title="Synthesize 100% all-NOR universal logic"
              >
                🔒 All-NOR
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Option 1: Synthesize Original Equation */}
            <button
              onClick={handleSynthesizeOriginal}
              disabled={!inputEquation.trim() || !!parseError}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl disabled:opacity-40 font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer border ${
                isLight
                  ? 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
                  : 'bg-[#0d171f] hover:bg-[#0d171f] active:bg-slate-600 border-[#A58D66]/30 hover:border-slate-500 text-[#E5E1DD]'
              }`}
              title="Synthesize unreduced equation onto canvas with selected mode"
            >
              <Cpu className="w-4 h-4 text-cyan-600" />
              <span>Synthesize Expression</span>
            </button>

            {/* Option 2: Synthesize Simplified Equation */}
            <button
              onClick={handleSynthesizeSimplified}
              disabled={!solvedResult}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#A58D66] to-[#8C7654] hover:from-[#DFCCA8] hover:to-[#A58D66] text-[#080f14] font-bold text-xs sm:text-sm transition-all shadow-md cursor-pointer disabled:opacity-40"
              title="Synthesize minimal simplified equation onto canvas"
            >
              <Sparkles className="w-4 h-4 text-[#080f14]" />
              <span>Synthesize Simplified</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
