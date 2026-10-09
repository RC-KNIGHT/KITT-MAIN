/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * KITT Ecosystem — Portal IV: Interactive Positional Arithmetic Matrix
 * 100% Native React implementation styled strictly in the 4 Sovereign Colors.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  NumberBase,
  ArithmeticOp,
  DifficultyLevel,
  ArithmeticProblem,
  VerificationResult,
  BASE_METADATA,
  OP_METADATA,
  DIGIT_CHARS,
  generateArithmeticProblem,
  verifyAnswer,
} from '../engine/arithmeticEngine';
import { playSuccessChime, playErrorTone, playClickTone } from '../engine/soundSynth';
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  Shuffle,
  Lightbulb,
  Eye,
  EyeOff,
  Trophy,
  Sparkles,
} from 'lucide-react';

interface ArithmeticDrillProps {
  onActivityLog: (title: string, details: string, points: number, isCorrect: boolean) => void;
  onPointsAwarded: (pts: number) => void;
}

export const ArithmeticDrill: React.FC<ArithmeticDrillProps> = ({
  onActivityLog,
  onPointsAwarded,
}) => {
  // Configuration
  const [base, setBase] = useState<NumberBase>(2);
  const [op, setOp] = useState<ArithmeticOp>('add');
  const [level, setLevel] = useState<DifficultyLevel>('easy');
  const [allowNegative, setAllowNegative] = useState<boolean>(false);
  const [showCarries, setShowCarries] = useState<boolean>(true);

  // Active Problem & State
  const [problem, setProblem] = useState<ArithmeticProblem>(() =>
    generateArithmeticProblem(2, 'add', 'easy', false)
  );
  const [userDigits, setUserDigits] = useState<string[]>([]);
  const [singleInputVal, setSingleInputVal] = useState<string>('');
  const [verification, setVerification] = useState<VerificationResult | null>(null);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [streak, setStreak] = useState<number>(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Initialize new problem
  const loadNewProblem = useCallback(
    (newBase = base, newOp = op, newLevel = level, newNeg = allowNegative) => {
      const p = generateArithmeticProblem(newBase, newOp, newLevel, newNeg);
      setProblem(p);
      setVerification(null);
      setShowExplanation(false);
      setSingleInputVal('');

      // Answer length is equal to correct answer length
      const cleanAns = p.correctAnswer.replace('-', '');
      const initialDigits = new Array(cleanAns.length).fill('');
      setUserDigits(initialDigits);

      // Focus right-most digit box after render
      setTimeout(() => {
        const lastIdx = cleanAns.length - 1;
        if (inputRefs.current[lastIdx]) {
          inputRefs.current[lastIdx]?.focus();
        }
      }, 50);
    },
    [base, op, level, allowNegative]
  );

  // Reload when configuration buttons change
  useEffect(() => {
    loadNewProblem(base, op, level, allowNegative);
  }, [base, op, level, allowNegative, loadNewProblem]);

  // Handle digit input in individual box
  const handleDigitChange = (index: number, val: string) => {
    const raw = val.toUpperCase();
    const validChars = DIGIT_CHARS.slice(0, base);
    const lastChar = raw.slice(-1);

    if (lastChar && !validChars.includes(lastChar)) {
      playErrorTone();
      return;
    }

    const nextDigits = [...userDigits];
    nextDigits[index] = lastChar;
    setUserDigits(nextDigits);
    setSingleInputVal(nextDigits.join(''));
    setVerification(null);

    // Auto-advance cursor from right to left (columnar math flow) or left to right
    if (lastChar && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Keyboard navigation across digit boxes
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!userDigits[index] && index < userDigits.length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft') {
      if (index > 0) inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight') {
      if (index < userDigits.length - 1) inputRefs.current[index + 1]?.focus();
    } else if (e.key === 'Enter') {
      handleVerify();
    }
  };

  // Handle single input field update
  const handleSingleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    setSingleInputVal(val);
    setVerification(null);

    const validChars = DIGIT_CHARS.slice(0, base) + '-';
    const clean = val
      .split('')
      .filter((ch) => validChars.includes(ch))
      .join('');

    const targetLen = problem.correctAnswer.replace('-', '').length;
    const padded = clean.padStart(targetLen, '').slice(-targetLen);
    const splitArr = padded.split('');
    setUserDigits(splitArr.map((ch) => (validChars.includes(ch) && ch !== '-' ? ch : '')));
  };

  // Verify answer
  const handleVerify = () => {
    const entered = (problem.isNegative ? '-' : '') + userDigits.join('');
    const result = verifyAnswer(entered, problem);
    setVerification(result);

    if (result.isCorrect) {
      playSuccessChime();
      setStreak((s) => s + 1);
      onPointsAwarded(result.pointsEarned);
      onActivityLog(
        `${BASE_METADATA[problem.base].name} ${OP_METADATA[problem.op].name} (${problem.level})`,
        `Mastered ${problem.operandA} ${OP_METADATA[problem.op].symbol} ${problem.operandB} = ${problem.correctAnswer}`,
        result.pointsEarned,
        true
      );
    } else {
      playErrorTone();
      setStreak(0);
      onActivityLog(
        `${BASE_METADATA[problem.base].name} ${OP_METADATA[problem.op].name}`,
        `Attempted ${entered || '(empty)'} — correct was ${problem.correctAnswer}`,
        0,
        false
      );
    }
  };

  // Reset current question
  const handleReset = () => {
    playClickTone();
    setUserDigits(new Array(userDigits.length).fill(''));
    setSingleInputVal('');
    setVerification(null);
    setShowExplanation(false);
    setTimeout(() => {
      inputRefs.current[userDigits.length - 1]?.focus();
    }, 50);
  };

  // Compute maximum column width for operand alignment
  const maxLen = Math.max(
    problem.operandA.length,
    problem.operandB.length,
    problem.correctAnswer.replace('-', '').length,
    userDigits.length
  );

  const padA = problem.operandA.padStart(maxLen, ' ');
  const padB = problem.operandB.padStart(maxLen, ' ');
  const padCarries = [...problem.carries].reverse();
  while (padCarries.length < maxLen) {
    padCarries.unshift(0);
  }

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto px-4 py-6 select-none">
      {/* 1. Drill Configuration Bar */}
      <div className="w-full bg-[#141415] border border-[#FFFFFF]/20 rounded-2xl p-4 sm:p-5 shadow-xl shadow-black/40 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Base Selection */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FFFFFF]">
              Radix Base:
            </span>
            <div className="flex bg-[#000000] p-1 rounded-xl border border-[#FFFFFF]/25">
              {([2, 8, 16] as NumberBase[]).map((b) => (
                <button
                  key={b}
                  onClick={() => {
                    playClickTone();
                    setBase(b);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                    base === b
                      ? 'bg-[#FFFFFF] text-[#000000] shadow-md shadow-[#FFFFFF]/30 font-bold'
                      : 'text-[#F5F5F5]/70 hover:text-[#F5F5F5] hover:bg-[#FFFFFF]/10'
                  }`}
                >
                  {BASE_METADATA[b].name} ({b})
                </button>
              ))}
            </div>
          </div>

          {/* Operation Selection */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FFFFFF]">
              Operator:
            </span>
            <div className="flex bg-[#000000] p-1 rounded-xl border border-[#FFFFFF]/25">
              {(['add', 'sub', 'mul'] as ArithmeticOp[]).map((o) => (
                <button
                  key={o}
                  onClick={() => {
                    playClickTone();
                    setOp(o);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    op === o
                      ? 'bg-[#8F8F8F] text-[#F5F5F5] shadow-md shadow-[#8F8F8F]/30 font-bold'
                      : 'text-[#F5F5F5]/70 hover:text-[#F5F5F5] hover:bg-[#8F8F8F]/10'
                  }`}
                >
                  {OP_METADATA[o].name} ({OP_METADATA[o].symbol})
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Level */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FFFFFF]">
              Precision:
            </span>
            <div className="flex bg-[#000000] p-1 rounded-xl border border-[#FFFFFF]/25">
              {(['easy', 'medium', 'hard', 'extreme'] as DifficultyLevel[]).map((l) => (
                <button
                  key={l}
                  onClick={() => {
                    playClickTone();
                    setLevel(l);
                  }}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold capitalize transition-all ${
                    level === l
                      ? 'bg-[#FFFFFF]/30 text-[#E8E8E8] border border-[#FFFFFF] font-bold'
                      : 'text-[#F5F5F5]/60 hover:text-[#F5F5F5]'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Subtraction Toggle & Carry Hint Toggle */}
          <div className="flex items-center gap-4">
            {op === 'sub' && (
              <label className="flex items-center gap-2 text-xs text-[#F5F5F5]/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowNegative}
                  onChange={(e) => setAllowNegative(e.target.checked)}
                  className="rounded border-[#FFFFFF]/40 text-[#FFFFFF] focus:ring-[#FFFFFF] bg-[#000000]"
                />
                <span>Allow Negative</span>
              </label>
            )}

            <button
              onClick={() => setShowCarries(!showCarries)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#000000] border border-[#FFFFFF]/20 text-[11px] text-[#FFFFFF] hover:text-[#E8E8E8] transition-colors"
            >
              {showCarries ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{showCarries ? 'Hide Carries' : 'Show Carries'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Interactive Columnar Math Matrix Canvas */}
      <div className="w-full bg-[#141415] border border-[#FFFFFF]/25 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-black/60 flex flex-col items-center relative overflow-hidden">
        {/* Ambient Top Flare */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#FFFFFF] to-transparent opacity-60" />

        {/* Live Streak / State Header */}
        <div className="w-full flex items-center justify-between mb-8 pb-4 border-b border-[#FFFFFF]/15">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B4B4B4] animate-pulse shadow-md shadow-[#B4B4B4]/50" />
            <span className="text-xs font-mono font-bold tracking-widest uppercase text-[#B4B4B4]">
              {BASE_METADATA[problem.base].name} {OP_METADATA[problem.op].name} Matrix
            </span>
          </div>

          <div className="flex items-center gap-3">
            {streak > 1 && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFFFFF]/15 border border-[#FFFFFF]/40 text-[#E8E8E8] text-xs font-bold font-mono">
                <Trophy className="w-3.5 h-3.5 text-[#FFFFFF]" />
                <span>Streak: {streak} 🔥</span>
              </div>
            )}
            <div className="text-xs text-[#F5F5F5]/60 font-mono">
              Radix Base {problem.base}
            </div>
          </div>
        </div>

        {/* Columnar Problem Presentation */}
        <div className="inline-flex flex-col items-end my-4">
          {/* Row 0: Carry / Borrow Indicator Row */}
          {showCarries && problem.carries.length > 0 && (
            <div className="flex items-center gap-1.5 sm:gap-2 mb-2">
              <span className="text-[10px] font-mono text-[#FFFFFF]/70 uppercase tracking-wider mr-2">
                {problem.op === 'sub' ? 'Borrow' : 'Carry'}:
              </span>
              {padCarries.map((c, idx) => (
                <div
                  key={idx}
                  className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center font-mono text-xs sm:text-sm font-bold rounded-lg border transition-all ${
                    c > 0
                      ? 'bg-[#FFFFFF]/20 border-[#FFFFFF] text-[#E8E8E8] shadow-sm shadow-[#FFFFFF]/30'
                      : 'border-transparent text-transparent'
                  }`}
                >
                  {c > 0 ? c : ''}
                </div>
              ))}
            </div>
          )}

          {/* Row 1: Operand A */}
          <div className="flex items-center gap-1.5 sm:gap-2 mb-2">
            <span className="w-6 sm:w-8" />
            {padA.split('').map((char, idx) => (
              <div
                key={idx}
                className={`w-8 h-10 sm:w-10 sm:h-12 flex items-center justify-center font-mono text-lg sm:text-2xl font-black rounded-xl border transition-all ${
                  char !== ' '
                    ? 'bg-[#000000] border-[#FFFFFF]/30 text-[#F5F5F5] shadow-md shadow-black/40'
                    : 'border-transparent'
                }`}
              >
                {char !== ' ' ? char : ''}
              </div>
            ))}
          </div>

          {/* Row 2: Operator & Operand B */}
          <div className="flex items-center gap-1.5 sm:gap-2 mb-3">
            <div className="w-6 sm:w-8 flex items-center justify-center font-mono text-xl sm:text-2xl font-black text-[#FFFFFF]">
              {OP_METADATA[problem.op].symbol}
            </div>
            {padB.split('').map((char, idx) => (
              <div
                key={idx}
                className={`w-8 h-10 sm:w-10 sm:h-12 flex items-center justify-center font-mono text-lg sm:text-2xl font-black rounded-xl border transition-all ${
                  char !== ' '
                    ? 'bg-[#000000] border-[#FFFFFF]/30 text-[#F5F5F5] shadow-md shadow-black/40'
                    : 'border-transparent'
                }`}
              >
                {char !== ' ' ? char : ''}
              </div>
            ))}
          </div>

          {/* Architectural Separation Line */}
          <div className="w-full h-1 bg-gradient-to-r from-[#FFFFFF]/40 via-[#FFFFFF] to-[#8F8F8F] rounded-full my-1 shadow-sm shadow-[#FFFFFF]/40" />

          {/* Row 3: User Answer Input Boxes */}
          <div className="flex items-center gap-1.5 sm:gap-2 mt-3">
            {problem.isNegative && (
              <div className="w-6 sm:w-8 flex items-center justify-center font-mono text-xl sm:text-2xl font-black text-[#E8E8E8]">
                −
              </div>
            )}
            {!problem.isNegative && <span className="w-6 sm:w-8" />}

            {userDigits.map((digit, idx) => {
              const revIdx = userDigits.length - 1 - idx;
              const isMatched =
                verification &&
                verification.accuracyMatches &&
                verification.accuracyMatches[revIdx];

              const isBoxWrong =
                verification && verification.accuracyMatches && !isMatched;

              return (
                <input
                  key={idx}
                  ref={(el) => {
                    inputRefs.current[idx] = el;
                  }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  placeholder="•"
                  className={`w-8 h-10 sm:w-10 sm:h-12 text-center font-mono text-lg sm:text-2xl font-black rounded-xl border outline-none transition-all ${
                    verification?.isCorrect
                      ? 'bg-[#8F8F8F]/20 border-[#B4B4B4] text-[#B4B4B4] shadow-md shadow-[#B4B4B4]/30 ring-1 ring-[#B4B4B4]'
                      : isBoxWrong
                      ? 'bg-[#FFFFFF]/20 border-[#FFFFFF] text-[#E8E8E8] shadow-md shadow-[#FFFFFF]/30 ring-1 ring-[#FFFFFF]'
                      : digit
                      ? 'bg-[#000000] border-[#FFFFFF] text-[#E8E8E8] shadow-md shadow-[#FFFFFF]/20'
                      : 'bg-[#000000] border-[#FFFFFF]/30 text-[#F5F5F5] placeholder-[#F5F5F5]/20 hover:border-[#FFFFFF]/60 focus:border-[#FFFFFF] focus:ring-2 focus:ring-[#FFFFFF]/30'
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Quick Linear Input for Power Users */}
        <div className="flex items-center gap-3 mt-4 text-xs text-[#F5F5F5]/60">
          <span>Fast Input:</span>
          <input
            type="text"
            value={singleInputVal}
            onChange={handleSingleInputChange}
            placeholder={`Type full base ${problem.base} answer...`}
            className="px-3 py-1.5 rounded-xl bg-[#000000] border border-[#FFFFFF]/30 text-[#F5F5F5] font-mono text-xs w-48 focus:outline-none focus:border-[#FFFFFF] focus:ring-1 focus:ring-[#FFFFFF]"
          />
        </div>

        {/* Verification Status Banner */}
        {verification && (
          <div
            className={`w-full mt-6 p-4 rounded-2xl border flex items-center justify-between gap-4 transition-all ${
              verification.isCorrect
                ? 'bg-[#8F8F8F]/15 border-[#B4B4B4]/40 text-[#B4B4B4]'
                : 'bg-[#FFFFFF]/15 border-[#FFFFFF]/40 text-[#E8E8E8]'
            }`}
          >
            <div className="flex items-center gap-3">
              {verification.isCorrect ? (
                <CheckCircle2 className="w-6 h-6 text-[#B4B4B4] flex-shrink-0" />
              ) : (
                <XCircle className="w-6 h-6 text-[#FFFFFF] flex-shrink-0" />
              )}
              <div>
                <div className="font-bold text-sm">
                  {verification.isCorrect
                    ? `Exemplary Precision! +${verification.pointsEarned} Points`
                    : 'Computation Discrepancy'}
                </div>
                <div className="text-xs opacity-80 font-mono mt-0.5">
                  {verification.isCorrect
                    ? `${problem.operandA} ${OP_METADATA[problem.op].symbol} ${problem.operandB} = ${problem.correctAnswer}`
                    : `Correct Solution: ${problem.correctAnswer} (in Base ${problem.base})`}
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                playClickTone();
                setShowExplanation(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#000000] border border-[#FFFFFF]/30 text-xs font-semibold hover:border-[#FFFFFF] text-[#F5F5F5] active:scale-[0.96] transition-all cursor-pointer"
            >
              <Lightbulb className="w-3.5 h-3.5 text-[#FFFFFF]" />
              <span>Step Breakdown</span>
            </button>
          </div>
        )}

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-8">
          <button
            onClick={handleVerify}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FFFFFF] to-[#737373] hover:from-[#E8E8E8] hover:to-[#FFFFFF] text-[#000000] font-bold text-sm tracking-wide active:scale-[0.96] transition-all shadow-lg shadow-[#FFFFFF]/20 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-[#000000]" />
            <span>Verify Calculation</span>
          </button>

          <button
            onClick={() => {
              playClickTone();
              loadNewProblem();
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#000000] hover:bg-[#1D1D1E] border border-[#FFFFFF]/30 hover:border-[#FFFFFF] text-xs font-semibold text-[#F5F5F5] active:scale-[0.96] transition-all shadow-sm cursor-pointer"
          >
            <ArrowRight className="w-4 h-4 text-[#FFFFFF]" />
            <span>Next Drill</span>
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#000000] hover:bg-[#1D1D1E] border border-[#FFFFFF]/20 text-xs text-[#F5F5F5]/80 hover:text-[#E8E8E8] active:scale-[0.96] transition-all cursor-pointer"
            title="Clear Inputs"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Clear</span>
          </button>

          <button
            onClick={() => {
              playClickTone();
              const bases: NumberBase[] = [2, 8, 16];
              const ops: ArithmeticOp[] = ['add', 'sub', 'mul'];
              const randB = bases[Math.floor(Math.random() * bases.length)];
              const randO = ops[Math.floor(Math.random() * ops.length)];
              setBase(randB);
              setOp(randO);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#000000] hover:bg-[#1D1D1E] border border-[#8F8F8F]/30 text-xs text-[#B4B4B4] hover:text-[#E8E8E8] active:scale-[0.96] transition-all cursor-pointer"
            title="Randomize Base & Operation"
          >
            <Shuffle className="w-4 h-4 text-[#B4B4B4]" />
            <span>Randomize</span>
          </button>

          <button
            onClick={() => {
              playClickTone();
              setShowExplanation(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#000000] hover:bg-[#1D1D1E] border border-[#FFFFFF]/25 text-xs text-[#FFFFFF] hover:text-[#E8E8E8] active:scale-[0.96] transition-all cursor-pointer"
          >
            <Lightbulb className="w-4 h-4" />
            <span>Tutor Breakdown</span>
          </button>
        </div>
      </div>

      {/* 3. Modal: Step-by-Step Positional Arithmetic Breakdown */}
      {showExplanation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-xl bg-[#141415] border border-[#FFFFFF]/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black">
            <div className="flex items-center justify-between pb-4 border-b border-[#FFFFFF]/20 mb-4">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-[#FFFFFF]" />
                <h3 className="font-bold text-base text-[#F5F5F5]">
                  Positional Arithmetic Step-by-Step Breakdown
                </h3>
              </div>
              <button
                onClick={() => setShowExplanation(false)}
                className="w-7 h-7 rounded-full bg-[#000000] border border-[#FFFFFF]/30 flex items-center justify-center text-xs text-[#F5F5F5] hover:text-[#E8E8E8] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="mb-4 text-xs text-[#F5F5F5]/70">
              Problem: <span className="font-mono font-bold text-[#E8E8E8]">{problem.operandA}</span>{' '}
              {OP_METADATA[problem.op].symbol}{' '}
              <span className="font-mono font-bold text-[#E8E8E8]">{problem.operandB}</span>{' '}
              in <span className="font-bold text-[#B4B4B4]">Base {problem.base}</span> ({BASE_METADATA[problem.base].name}).
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
              {problem.stepExplanations.map((step, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#000000] border border-[#FFFFFF]/15 text-xs text-[#F5F5F5] font-mono leading-relaxed"
                >
                  <span className="text-[#FFFFFF] font-bold mr-2">Step {idx + 1}:</span>
                  {step}
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-[#FFFFFF]/20 flex items-center justify-between">
              <div className="text-xs text-[#F5F5F5]/60">
                Final Result: <span className="font-mono font-bold text-[#B4B4B4]">{problem.correctAnswer}</span>
              </div>
              <button
                onClick={() => setShowExplanation(false)}
                className="px-4 py-1.5 rounded-xl bg-[#FFFFFF] text-[#000000] text-xs font-bold hover:bg-[#E8E8E8] transition-colors cursor-pointer"
              >
                Close Breakdown
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
