/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * KITT Ecosystem — Portal IV: Inter-Base Converter & Bit Engine
 * High-speed radix translation and interactive 16-bit hardware register.
 */

import React, { useState } from 'react';
import { convertBases } from '../engine/arithmeticEngine';
import { playClickTone } from '../engine/soundSynth';
import { Binary, Cpu, Copy, Check, RotateCcw, ArrowRightLeft } from 'lucide-react';

export const BaseConverter: React.FC = () => {
  const [val, setVal] = useState<string>('255');
  const [activeBase, setActiveBase] = useState<2 | 8 | 10 | 16>(10);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const converted = convertBases(val, activeBase);

  const handleInputChange = (newVal: string, base: 2 | 8 | 10 | 16) => {
    setActiveBase(base);
    setVal(newVal);
  };

  const handleBitToggle = (bitIndexFromRight: number) => {
    playClickTone();
    // bits are 15 down to 0
    const bitPos = 15 - bitIndexFromRight;
    const nextBits = [...converted.bits];
    nextBits[bitPos] = nextBits[bitPos] === 1 ? 0 : 1;
    const newBinStr = nextBits.join('');
    setActiveBase(2);
    setVal(newBinStr);
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  // Two's complement calculation for 16-bit
  const unsignedVal = converted.isValid ? parseInt(converted.bin, 2) : 0;
  const signed16Val = unsignedVal >= 32768 ? unsignedVal - 65536 : unsignedVal;

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto px-4 py-6 select-none">
      {/* 1. Header Banner */}
      <div className="w-full bg-[#0d171f] border border-[#A58D66]/20 rounded-2xl p-5 mb-6 shadow-xl shadow-black/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#407E8C]/20 border border-[#407E8C]/40 flex items-center justify-center text-[#76B4C2]">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[#E5E1DD]">
                Multi-Radix Base Transformation & Bit Engine
              </h3>
              <p className="text-xs text-[#A58D66]">
                Instantaneous synchronized representation across Binary, Decimal, Octal, and Hexadecimal.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playClickTone();
              setVal('0');
              setActiveBase(10);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#080f14] border border-[#A58D66]/20 text-xs text-[#E5E1DD]/70 hover:text-[#DFCCA8] active:scale-[0.96] transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive Radix Inputs Grid */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* Binary */}
        <div className="bg-[#0d171f] border border-[#A58D66]/25 rounded-2xl p-4 shadow-lg shadow-black/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#76B4C2] font-mono">0b</span>
              <span className="text-xs font-bold text-[#E5E1DD]">Binary (Base 2)</span>
            </div>
            <button
              onClick={() => handleCopy(converted.bin, 'bin')}
              className="text-[#A58D66] hover:text-[#DFCCA8] transition-colors p-1"
              title="Copy"
            >
              {copiedKey === 'bin' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <input
            type="text"
            value={activeBase === 2 ? val : converted.bin}
            onChange={(e) => handleInputChange(e.target.value, 2)}
            placeholder="e.g. 110101"
            className="w-full bg-[#080f14] border border-[#A58D66]/30 focus:border-[#A58D66] rounded-xl px-3 py-2 text-sm font-mono text-[#DFCCA8] outline-none"
          />
        </div>

        {/* Decimal */}
        <div className="bg-[#0d171f] border border-[#A58D66]/25 rounded-2xl p-4 shadow-lg shadow-black/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#A58D66] font-mono">10</span>
              <span className="text-xs font-bold text-[#E5E1DD]">Decimal (Base 10)</span>
            </div>
            <button
              onClick={() => handleCopy(converted.dec, 'dec')}
              className="text-[#A58D66] hover:text-[#DFCCA8] transition-colors p-1"
              title="Copy"
            >
              {copiedKey === 'dec' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <input
            type="text"
            value={activeBase === 10 ? val : converted.dec}
            onChange={(e) => handleInputChange(e.target.value, 10)}
            placeholder="e.g. 255"
            className="w-full bg-[#080f14] border border-[#A58D66]/30 focus:border-[#A58D66] rounded-xl px-3 py-2 text-sm font-mono text-[#DFCCA8] outline-none"
          />
        </div>

        {/* Octal */}
        <div className="bg-[#0d171f] border border-[#A58D66]/25 rounded-2xl p-4 shadow-lg shadow-black/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#76B4C2] font-mono">0o</span>
              <span className="text-xs font-bold text-[#E5E1DD]">Octal (Base 8)</span>
            </div>
            <button
              onClick={() => handleCopy(converted.oct, 'oct')}
              className="text-[#A58D66] hover:text-[#DFCCA8] transition-colors p-1"
              title="Copy"
            >
              {copiedKey === 'oct' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <input
            type="text"
            value={activeBase === 8 ? val : converted.oct}
            onChange={(e) => handleInputChange(e.target.value, 8)}
            placeholder="e.g. 377"
            className="w-full bg-[#080f14] border border-[#A58D66]/30 focus:border-[#A58D66] rounded-xl px-3 py-2 text-sm font-mono text-[#DFCCA8] outline-none"
          />
        </div>

        {/* Hexadecimal */}
        <div className="bg-[#0d171f] border border-[#A58D66]/25 rounded-2xl p-4 shadow-lg shadow-black/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#A58D66] font-mono">0x</span>
              <span className="text-xs font-bold text-[#E5E1DD]">Hexadecimal (Base 16)</span>
            </div>
            <button
              onClick={() => handleCopy(converted.hex, 'hex')}
              className="text-[#A58D66] hover:text-[#DFCCA8] transition-colors p-1"
              title="Copy"
            >
              {copiedKey === 'hex' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <input
            type="text"
            value={activeBase === 16 ? val : converted.hex}
            onChange={(e) => handleInputChange(e.target.value, 16)}
            placeholder="e.g. FF"
            className="w-full bg-[#080f14] border border-[#A58D66]/30 focus:border-[#A58D66] rounded-xl px-3 py-2 text-sm font-mono text-[#DFCCA8] outline-none"
          />
        </div>
      </div>

      {/* 3. Interactive 16-Bit Register Hardware Canvas */}
      <div className="w-full bg-[#0d171f] border border-[#A58D66]/25 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/50">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#A58D66]/15">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#A58D66]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#E5E1DD]">
              Interactive 16-Bit Register Map (Click Bits to Toggle)
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-[#E5E1DD]/60">Unsigned: <strong className="text-[#DFCCA8]">{unsignedVal}</strong></span>
            <span className="text-[#E5E1DD]/40">|</span>
            <span className="text-[#E5E1DD]/60">Signed (2's Comp): <strong className="text-[#76B4C2]">{signed16Val}</strong></span>
          </div>
        </div>

        {/* 16 Bit Cells */}
        <div className="grid grid-cols-8 sm:grid-cols-16 gap-1.5 sm:gap-2 my-4">
          {converted.bits.map((bit, idx) => {
            const bitNum = 15 - idx;
            const isMSB = bitNum === 15;
            const isLSB = bitNum === 0;

            return (
              <div key={idx} className="flex flex-col items-center">
                <span className="text-[9px] font-mono text-[#E5E1DD]/50 mb-1">
                  {bitNum}
                </span>
                <button
                  onClick={() => handleBitToggle(bitNum)}
                  className={`w-9 h-11 sm:w-10 sm:h-12 flex items-center justify-center font-mono text-base font-black rounded-xl border transition-all active:scale-95 cursor-pointer ${
                    bit === 1
                      ? 'bg-[#A58D66] border-[#DFCCA8] text-[#080f14] shadow-md shadow-[#A58D66]/40 scale-105'
                      : 'bg-[#080f14] border-[#A58D66]/25 text-[#E5E1DD]/60 hover:border-[#A58D66]/60'
                  }`}
                >
                  {bit}
                </button>
                <span className="text-[8px] font-mono text-[#A58D66] mt-1 font-bold">
                  {isMSB ? 'MSB' : isLSB ? 'LSB' : ''}
                </span>
              </div>
            );
          })}
        </div>

        {/* Byte Division Labels */}
        <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-[#A58D66]/10 text-center">
          <div className="text-[11px] font-mono text-[#A58D66]/80">
            HIGH BYTE [Bits 15..8] • 0x{converted.hex.padStart(4, '0').slice(0, 2)}
          </div>
          <div className="text-[11px] font-mono text-[#76B4C2]/80">
            LOW BYTE [Bits 7..0] • 0x{converted.hex.padStart(4, '0').slice(2, 4)}
          </div>
        </div>
      </div>
    </div>
  );
};
