/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useCircuit } from '../../context/CircuitContext';
import { getPresetCircuits, PresetCircuit } from '../../engine/presets';
import { BookOpen, Cpu, FolderOpen, Sparkles, X, ArrowRight } from 'lucide-react';

export const PresetsModal: React.FC = () => {
  const { activeModal, setActiveModal, loadPreset, colorMode } = useCircuit();
  const isLight = colorMode === 'light';
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (activeModal !== 'presets') return null;

  const presets = getPresetCircuits();

  const categories = [
    { id: 'all', name: 'All Presets' },
    { id: 'COMBINATIONAL', name: 'Combinational Logic' },
    { id: 'ARITHMETIC', name: 'Arithmetic & ALUs' },
    { id: 'SEQUENTIAL', name: 'Sequential & Memory' },
    { id: 'SYSTEMS', name: 'Digital Systems & Displays' },
  ];

  const filtered = presets.filter(
    (p) => selectedCategory === 'all' || p.category === selectedCategory
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000]/70 backdrop-blur-sm p-4 animate-fade-in">
      <div
        className={`border rounded-2xl w-full max-w-4xl flex flex-col shadow-2xl overflow-hidden max-h-[85vh] transition-colors ${
          isLight
            ? 'bg-white border-slate-300 text-slate-800 shadow-[0_20px_60px_rgba(0,0,0,0.15)]'
            : 'bg-[#141415] border-[#FFFFFF]/30 text-[#F5F5F5]'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-5 py-4 border-b transition-colors ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#000000] border-[#FFFFFF]/20'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#FFFFFF]/20 text-[#E8E8E8] rounded-lg">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-[#F5F5F5]'}`}>Preset Circuits Library</h2>
              <p className={`text-xs ${isLight ? 'text-[#F5F5F5]/45' : 'text-[#F5F5F5]/60'}`}>
                Explore pre-built textbook circuits, adders, latches, and digital systems
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal('none')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isLight ? 'text-[#F5F5F5]/60 hover:text-slate-700 hover:bg-slate-100' : 'text-[#F5F5F5]/60 hover:text-[#F5F5F5] hover:bg-[#000000]'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filter Pills */}
        <div
          className={`flex gap-2 px-5 py-3 border-b overflow-x-auto text-xs font-semibold transition-colors ${
            isLight ? 'bg-slate-50/50 border-slate-200' : 'bg-[#000000] border-[#FFFFFF]/20'
          }`}
        >
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#FFFFFF] text-[#000000] shadow-sm font-bold'
                  : isLight
                  ? 'bg-white text-slate-600 hover:text-slate-900 border border-slate-300'
                  : 'bg-[#000000] text-[#F5F5F5]/60 hover:text-[#F5F5F5] border border-[#FFFFFF]/20'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Presets Grid */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map((preset) => (
            <div
              key={preset.id}
              className={`p-4 border rounded-2xl transition-all flex flex-col justify-between group ${
                isLight
                  ? 'bg-slate-50 hover:bg-slate-100/80 border-slate-200 hover:border-slate-300 text-slate-800'
                  : 'bg-[#000000] hover:bg-[#141415] border-[#FFFFFF]/20 hover:border-[#FFFFFF]/50 text-[#F5F5F5]'
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className={`font-bold text-sm group-hover:text-[#E8E8E8] transition-colors ${isLight ? 'text-slate-900' : 'text-[#F5F5F5]'}`}>
                    {preset.name}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono border ${
                      isLight ? 'bg-slate-100 text-slate-600 border-slate-300' : 'bg-[#141415] text-[#F5F5F5]/60 border-[#FFFFFF]/20'
                    }`}
                  >
                    {preset.category}
                  </span>
                </div>
                <p className={`text-xs line-clamp-2 ${isLight ? 'text-slate-600' : 'text-[#F5F5F5]/60'}`}>{preset.description}</p>
                <div className={`flex gap-3 text-[11px] font-mono pt-1 ${isLight ? 'text-[#F5F5F5]/45' : 'text-[#F5F5F5]/45'}`}>
                  <span>{preset.components.length} Components</span>
                  <span>•</span>
                  <span>{preset.wires.length} Wires</span>
                </div>
              </div>

              <button
                onClick={() => loadPreset(preset)}
                className={`mt-4 w-full py-2 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5 border cursor-pointer ${
                  isLight
                    ? 'bg-zinc-50 hover:bg-[#8F8F8F] text-zinc-700 hover:text-[#F5F5F5] border-zinc-200'
                    : 'bg-[#FFFFFF]/20 hover:bg-[#FFFFFF] text-[#E8E8E8] hover:text-[#000000] border-[#FFFFFF]/30'
                }`}
              >
                <span>Load into Canvas</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
