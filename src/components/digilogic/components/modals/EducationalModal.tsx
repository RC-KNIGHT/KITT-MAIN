/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useCircuit } from '../../context/CircuitContext';
import { BookOpen, Cpu, Database, GitMerge, Sparkles, X, Zap } from 'lucide-react';

export const EducationalModal: React.FC = () => {
  const { activeModal, setActiveModal, colorMode } = useCircuit();
  const isLight = colorMode === 'light';
  const [activeChapter, setActiveChapter] = useState<number>(0);

  if (activeModal !== 'learn') return null;

  const chapters = [
    {
      id: 'fundamentals',
      title: '1. Primitive Logic Gates',
      icon: GitMerge,
      content: (
        <div className={`space-y-4 leading-relaxed text-xs ${isLight ? 'text-slate-700' : 'text-[#E8E8E8]'}`}>
          <h4 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-[#F5F5F5]'}`}>Fundamental Boolean Operators</h4>
          <p>
            Digital electronics operates entirely on binary voltages: <b>Logic 1 (+5V / High)</b> and{' '}
            <b>Logic 0 (0V / Low)</b>.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            <div className={`p-3 rounded-xl space-y-1 border ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#000000] border-[#FFFFFF]/20'
            }`}>
              <span className="font-bold text-[#FFFFFF]">AND Gate (Conjunction)</span>
              <p className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-[#F5F5F5]/60'}`}>
                Outputs 1 <b>ONLY</b> if both inputs A and B are 1. Equation: <code>Y = A · B</code>
              </p>
            </div>
            <div className={`p-3 rounded-xl space-y-1 border ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#000000] border-[#FFFFFF]/20'
            }`}>
              <span className="font-bold text-[#FFFFFF]">OR Gate (Disjunction)</span>
              <p className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-[#F5F5F5]/60'}`}>
                Outputs 1 if <b>ANY</b> input is 1. Equation: <code>Y = A + B</code>
              </p>
            </div>
            <div className={`p-3 rounded-xl space-y-1 border ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#000000] border-[#FFFFFF]/20'
            }`}>
              <span className="font-bold text-[#FFFFFF]">NOT Gate (Inverter)</span>
              <p className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-[#F5F5F5]/60'}`}>
                Inverts the input signal. 1 becomes 0; 0 becomes 1. Equation: <code>Y = A'</code>
              </p>
            </div>
            <div className={`p-3 rounded-xl space-y-1 border ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#000000] border-[#FFFFFF]/20'
            }`}>
              <span className="font-bold text-[#FFFFFF]">XOR Gate (Exclusive-OR)</span>
              <p className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-[#F5F5F5]/60'}`}>
                Outputs 1 if inputs are <b>DIFFERENT</b>. Equation: <code>Y = A ⊕ B = A'B + AB'</code>
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'universal',
      title: '2. Universal Gates (NAND & NOR)',
      icon: Sparkles,
      content: (
        <div className={`space-y-4 leading-relaxed text-xs ${isLight ? 'text-slate-700' : 'text-[#E8E8E8]'}`}>
          <h4 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-[#F5F5F5]'}`}>Why NAND & NOR are Universal</h4>
          <p>
            A <b>universal gate</b> is a logic gate that can implement any Boolean function without needing
            any other gate type!
          </p>
          <div className={`p-4 rounded-xl space-y-2 border ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#000000] border-[#FFFFFF]/20'
          }`}>
            <span className={`font-bold text-xs ${isLight ? 'text-zinc-700' : 'text-[#B4B4B4]'}`}>Building Primitive Gates from NAND Only:</span>
            <ul className={`list-disc list-inside space-y-1 text-[11px] ${isLight ? 'text-slate-700' : 'text-[#E8E8E8]'}`}>
              <li>
                <b>NOT A</b> = <code>NAND(A, A)</code>
              </li>
              <li>
                <b>A AND B</b> = <code>NOT(NAND(A, B)) = NAND(NAND(A, B), NAND(A, B))</code>
              </li>
              <li>
                <b>A OR B</b> = <code>NAND(NOT A, NOT B) = NAND(NAND(A, A), NAND(B, B))</code>
              </li>
              <li>
                <b>A XOR B</b> = Built using 4 NAND gates. (Try this in the Challenges arena!)
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'arithmetic',
      title: '3. Adders & Arithmetic Units',
      icon: Cpu,
      content: (
        <div className={`space-y-4 leading-relaxed text-xs ${isLight ? 'text-slate-700' : 'text-[#E8E8E8]'}`}>
          <h4 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-[#F5F5F5]'}`}>Binary Addition Principles</h4>
          <p>Computers calculate complex mathematical equations by chaining 1-bit binary adders.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className={`p-3 rounded-xl space-y-1.5 border ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#000000] border-[#FFFFFF]/20'
            }`}>
              <span className={`font-bold ${isLight ? 'text-zinc-700' : 'text-[#B4B4B4]'}`}>Half Adder</span>
              <p className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-[#F5F5F5]/60'}`}>
                Adds 2 single bits A and B. Produces <b>SUM</b> (A ⊕ B) and <b>CARRY</b> (A · B). Cannot handle a carry from a previous stage.
              </p>
            </div>
            <div className={`p-3 rounded-xl space-y-1.5 border ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#000000] border-[#FFFFFF]/20'
            }`}>
              <span className={`font-bold ${isLight ? 'text-zinc-700' : 'text-[#B4B4B4]'}`}>Full Adder</span>
              <p className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-[#F5F5F5]/60'}`}>
                Adds 3 bits: A, B, and Carry-In (Cin). SUM = A ⊕ B ⊕ Cin; Cout = (A·B) + (Cin·(A⊕B)).
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'sequential',
      title: '4. Sequential Logic & Memory',
      icon: Database,
      content: (
        <div className={`space-y-4 leading-relaxed text-xs ${isLight ? 'text-slate-700' : 'text-[#E8E8E8]'}`}>
          <h4 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-[#F5F5F5]'}`}>Feedback Loops & State Storage</h4>
          <p>
            Unlike combinational circuits whose outputs depend purely on current inputs, <b>sequential circuits</b>{' '}
            possess memory and depend on past states.
          </p>
          <div className={`p-4 rounded-xl space-y-2 border ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#000000] border-[#FFFFFF]/20'
          }`}>
            <span className={`font-bold ${isLight ? 'text-amber-700' : 'text-[#E8E8E8]'}`}>The SR Latch & Flip-Flops:</span>
            <p className={`text-[11px] ${isLight ? 'text-slate-700' : 'text-[#E8E8E8]'}`}>
              Cross-coupling two NOR gates or NAND gates creates a bistable multivibrator capable of holding 1 bit of memory indefinitely.
            </p>
            <p className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-[#F5F5F5]/60'}`}>
              <b>D Flip-Flop:</b> Synchronizes data capture to the rising edge of a Clock pulse, preventing race conditions.
            </p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in ${
        isLight ? 'bg-[#000000]/40 backdrop-blur-xs' : 'bg-[#000000]/70 backdrop-blur-sm'
      }`}
      onClick={() => setActiveModal('none')}
    >
      <div
        className={`rounded-2xl w-full max-w-4xl flex flex-col shadow-2xl overflow-hidden max-h-[85vh] border transition-colors ${
          isLight ? 'bg-white border-slate-300 text-slate-800' : 'bg-[#141415] border-[#FFFFFF]/30 text-[#F5F5F5]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-5 py-4 border-b ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#000000] border-[#FFFFFF]/20'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#FFFFFF]/20 text-[#FFFFFF] rounded-lg">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-[#F5F5F5]'}`}>Digital Electronics Interactive Textbook</h2>
              <p className={`text-xs ${isLight ? 'text-[#F5F5F5]/45' : 'text-[#F5F5F5]/60'}`}>Comprehensive educational guides from boolean foundations to computer ALUs</p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal('none')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isLight ? 'text-[#F5F5F5]/60 hover:text-slate-700 hover:bg-slate-200' : 'text-[#F5F5F5]/60 hover:text-[#F5F5F5] hover:bg-[#000000]'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Layout: Chapters on left, Content on right */}
        <div className="flex-1 flex overflow-hidden">
          <div className={`w-64 border-r p-3 space-y-1.5 overflow-y-auto ${
            isLight ? 'border-slate-200 bg-slate-50' : 'border-[#FFFFFF]/20 bg-[#000000]/60'
          }`}>
            {chapters.map((ch, idx) => {
              const Icon = ch.icon;
              const active = idx === activeChapter;
              return (
                <button
                  key={ch.id}
                  onClick={() => setActiveChapter(idx)}
                  className={`w-full p-2.5 rounded-xl text-left transition-all flex items-center gap-2.5 border cursor-pointer ${
                    active
                      ? isLight
                        ? 'bg-amber-50 border-amber-300 text-[#737373] font-bold shadow-2xs'
                        : 'bg-[#FFFFFF]/20 border-[#FFFFFF]/50 text-[#E8E8E8] font-bold'
                      : isLight
                      ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700'
                      : 'bg-[#000000]/40 hover:bg-[#141415] border-[#FFFFFF]/15 text-[#F5F5F5]/60 hover:text-[#F5F5F5]'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="text-xs truncate">{ch.title}</span>
                </button>
              );
            })}
          </div>

          <div className="flex-1 p-6 overflow-y-auto">{chapters[activeChapter].content}</div>
        </div>
      </div>
    </div>
  );
};
