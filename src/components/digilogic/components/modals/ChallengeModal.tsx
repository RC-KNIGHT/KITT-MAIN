/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useCircuit } from '../../context/CircuitContext';
import { CHALLENGES, verifyChallenge, ChallengeVerificationResult } from '../../engine/challenges';
import { soundEngine } from '../../engine/soundEngine';
import { hapticsEngine } from '../../engine/haptics';
import { Award, CheckCircle2, HelpCircle, Play, X, XCircle, ArrowRight } from 'lucide-react';

export const ChallengeModal: React.FC = () => {
  const { activeModal, setActiveModal, components, wires, customGates, loadChallenge, colorMode } = useCircuit();
  const isLight = colorMode === 'light';
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>(CHALLENGES[0].id);
  const [testResult, setTestResult] = useState<ChallengeVerificationResult | null>(null);
  const [showHint, setShowHint] = useState(false);

  if (activeModal !== 'challenges') return null;

  const currentChallenge = CHALLENGES.find((c) => c.id === selectedChallengeId) || CHALLENGES[0];

  const customMap = new Map();
  customGates.forEach((g) => customMap.set(g.id, g));

  const handleRunVerification = () => {
    const res = verifyChallenge(currentChallenge, components, wires, customMap);
    setTestResult(res);
    if (res.passed) {
      soundEngine.playVictory();
      hapticsEngine.success();
    } else {
      soundEngine.playError();
      hapticsEngine.warning();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#080f14]/70 backdrop-blur-sm p-4 animate-fade-in">
      <div
        className={`border rounded-2xl w-full max-w-4xl flex flex-col shadow-2xl overflow-hidden max-h-[85vh] transition-colors ${
          isLight
            ? 'bg-white border-slate-300 text-slate-800 shadow-[0_20px_60px_rgba(0,0,0,0.15)]'
            : 'bg-[#0d171f] border-[#A58D66]/30 text-[#E5E1DD]'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-5 py-4 border-b transition-colors ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#080f14] border-[#A58D66]/20'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#A58D66]/20 text-[#A58D66] rounded-lg">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-[#E5E1DD]'}`}>Interactive Logic Design Challenges</h2>
              <p className={`text-xs ${isLight ? 'text-[#E5E1DD]/45' : 'text-[#E5E1DD]/60'}`}>
                Test your digital design mastery against automated simulation harnesses
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal('none')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isLight ? 'text-[#E5E1DD]/60 hover:text-slate-700 hover:bg-slate-100' : 'text-[#E5E1DD]/60 hover:text-[#E5E1DD] hover:bg-[#080f14]'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Layout: Left Challenge Selector, Right Challenge Workspace */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Challenge List */}
          <div
            className={`w-64 border-r p-3 space-y-1.5 overflow-y-auto transition-colors ${
              isLight ? 'border-slate-200 bg-slate-50/70' : 'border-[#A58D66]/20 bg-[#080f14]/60'
            }`}
          >
            {CHALLENGES.map((ch) => {
              const active = ch.id === selectedChallengeId;
              let diffColor = isLight
                ? 'text-teal-700 bg-teal-100 border-teal-300'
                : 'text-[#76B4C2] bg-[#407E8C]/20 border-[#407E8C]/40';
              if (ch.difficulty === 'Medium') {
                diffColor = isLight
                  ? 'text-amber-700 bg-amber-100 border-amber-300'
                  : 'text-[#DFCCA8] bg-[#A58D66]/20 border-[#A58D66]/40';
              } else if (ch.difficulty === 'Hard') {
                diffColor = isLight
                  ? 'text-[#8C7654] bg-[#A58D66]/20 border-[#A58D66]/40'
                  : 'text-[#DFCCA8] bg-[#A58D66]/30 border-[#A58D66]/60';
              }

              return (
                <button
                  key={ch.id}
                  onClick={() => {
                    setSelectedChallengeId(ch.id);
                    setTestResult(null);
                    setShowHint(false);
                  }}
                  className={`w-full p-2.5 rounded-xl text-left transition-all border cursor-pointer ${
                    active
                      ? isLight
                        ? 'bg-amber-50 border-amber-400 text-amber-900 shadow-xs font-semibold'
                        : 'bg-[#A58D66]/15 border-[#A58D66]/50 text-[#E5E1DD] shadow-sm font-semibold'
                      : isLight
                      ? 'bg-white hover:bg-slate-100/80 border-slate-200 text-slate-700 hover:text-slate-900'
                      : 'bg-[#080f14]/40 hover:bg-[#0d171f] border-[#A58D66]/15 text-[#E5E1DD]/60 hover:text-[#E5E1DD]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs truncate">{ch.title}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold border ${diffColor}`}>
                      {ch.difficulty}
                    </span>
                    <span className={`text-[10px] font-mono ${isLight ? 'text-[#E5E1DD]/45' : 'text-[#E5E1DD]/45'}`}>
                      {ch.testCases.length} Tests
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Challenge Detail & Test Runner */}
          <div className="flex-1 p-5 overflow-y-auto space-y-5 text-xs">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className={`font-bold text-base ${isLight ? 'text-slate-900' : 'text-[#E5E1DD]'}`}>{currentChallenge.title}</h3>
                <button
                  onClick={() => loadChallenge(currentChallenge)}
                  className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 border transition-colors cursor-pointer ${
                    isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                      : 'bg-[#080f14] hover:bg-[#0d171f] text-[#E5E1DD] border-[#A58D66]/20'
                  }`}
                >
                  <span>Load Starter Canvas</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className={`leading-relaxed ${isLight ? 'text-slate-600' : 'text-[#DFCCA8]'}`}>{currentChallenge.description}</p>
            </div>

            {/* Hint Box */}
            <div
              className={`p-3 rounded-xl space-y-2 border transition-colors ${
                isLight ? 'bg-amber-50/60 border-amber-200' : 'bg-[#080f14] border-[#A58D66]/20'
              }`}
            >
              <button
                onClick={() => setShowHint(!showHint)}
                className={`flex items-center gap-1.5 font-semibold text-xs cursor-pointer ${
                  isLight ? 'text-amber-700 hover:text-amber-800' : 'text-[#DFCCA8] hover:text-[#E5E1DD]'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span>{showHint ? 'Hide Hints' : 'Need Hints?'}</span>
              </button>
              {showHint && (
                <ul className={`list-disc list-inside space-y-1 text-xs italic ${isLight ? 'text-slate-600' : 'text-[#E5E1DD]/60'}`}>
                  {currentChallenge.hints.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              )}
            </div>

            {/* Test Harness Verification */}
            <div className={`space-y-3 pt-2 border-t ${isLight ? 'border-slate-200' : 'border-[#A58D66]/20'}`}>
              <div className="flex items-center justify-between">
                <span className={`font-bold text-xs ${isLight ? 'text-slate-800' : 'text-[#E5E1DD]'}`}>Automated Verification Harness:</span>
                <button
                  onClick={handleRunVerification}
                  className="px-4 py-2 bg-[#A58D66] hover:bg-[#DFCCA8] text-[#080f14] font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 text-xs cursor-pointer active:scale-95"
                >
                  <Play className="w-4 h-4 fill-[#080f14]" />
                  <span>Verify Current Circuit</span>
                </button>
              </div>

              {testResult && (
                <div
                  className={`p-4 rounded-xl border space-y-3 transition-colors ${
                    testResult.passed
                      ? isLight
                        ? 'bg-teal-50 border-teal-300 text-teal-900'
                        : 'bg-[#407E8C]/20 border-[#407E8C]/40 text-[#76B4C2]'
                      : isLight
                      ? 'bg-amber-50 border-amber-300 text-amber-900'
                      : 'bg-[#080f14] border-[#A58D66]/40 text-[#DFCCA8]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-sm">
                      {testResult.passed ? (
                        <CheckCircle2 className="w-5 h-5 text-[#407E8C]" />
                      ) : (
                        <XCircle className="w-5 h-5 text-[#A58D66]" />
                      )}
                      <span>{testResult.feedback}</span>
                    </div>
                    <span className="font-mono font-bold text-sm">Score: {testResult.score}%</span>
                  </div>

                  {/* Test Vector Results Table */}
                  {testResult.testResults.length > 0 && (
                    <div className={`border rounded-lg overflow-hidden font-mono text-[11px] ${isLight ? 'border-slate-300 bg-white' : 'border-[#A58D66]/20 bg-[#080f14]'}`}>
                      <table className="w-full text-center">
                        <thead className={`border-b ${isLight ? 'bg-slate-100 text-slate-600 border-slate-300' : 'bg-[#0d171f] text-[#E5E1DD]/60 border-[#A58D66]/20'}`}>
                          <tr>
                            <th className="p-1.5">Test #</th>
                            <th className="p-1.5">Inputs</th>
                            <th className="p-1.5">Expected</th>
                            <th className="p-1.5">Actual</th>
                            <th className="p-1.5">Status</th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y ${isLight ? 'divide-slate-200' : 'divide-[#A58D66]/15'}`}>
                          {testResult.testResults.map((r, idx) => (
                            <tr key={idx} className={r.passed ? (isLight ? 'text-teal-700' : 'text-[#76B4C2]') : (isLight ? 'text-amber-700' : 'text-[#DFCCA8]')}>
                              <td className="p-1.5">{idx + 1}</td>
                              <td className="p-1.5">{JSON.stringify(r.inputs)}</td>
                              <td className="p-1.5">{JSON.stringify(r.expected)}</td>
                              <td className="p-1.5">{JSON.stringify(r.actual)}</td>
                              <td className="p-1.5 font-bold">{r.passed ? 'PASS' : 'FAIL'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
