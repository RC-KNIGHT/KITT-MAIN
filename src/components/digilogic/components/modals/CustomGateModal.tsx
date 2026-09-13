/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useCircuit } from '../../context/CircuitContext';
import { Box, Check, X } from 'lucide-react';

export const CustomGateModal: React.FC = () => {
  const { activeModal, setActiveModal, selection, createCustomGateFromSelection, colorMode } = useCircuit();
  const isLight = colorMode === 'light';
  const [name, setName] = useState('MyCustomIC');
  const [description, setDescription] = useState('Modular Subcircuit IC');
  const [color, setColor] = useState('#407E8C');
  const [error, setError] = useState<string | null>(null);

  if (activeModal !== 'customGate') return null;

  const handleCreate = () => {
    setError(null);
    if (!name.trim()) {
      setError('Please enter a name for the custom gate.');
      return;
    }

    const created = createCustomGateFromSelection(name, description, color);
    if (!created) {
      setError(
        'Selection must contain at least 1 input source (Switch/Button/Const) and at least 1 output indicator (LED/Probe).'
      );
      return;
    }

    setActiveModal('none');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#080f14]/70 backdrop-blur-sm p-4 animate-fade-in">
      <div
        className={`border rounded-2xl w-full max-w-md flex flex-col shadow-2xl overflow-hidden transition-colors ${
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
              <Box className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-[#E5E1DD]'}`}>Package Custom IC Subcircuit</h2>
              <p className={`text-xs ${isLight ? 'text-[#E5E1DD]/45' : 'text-[#E5E1DD]/60'}`}>Bundle selected gates into a reusable integrated circuit</p>
            </div>
          </div>
          <button
            onClick={() => setActiveModal('none')}
            className={`p-1.5 rounded-lg transition-colors ${
              isLight ? 'text-[#E5E1DD]/60 hover:text-slate-700 hover:bg-slate-100' : 'text-[#E5E1DD]/60 hover:text-[#E5E1DD] hover:bg-[#080f14]'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className={`font-semibold ${isLight ? 'text-slate-700' : 'text-[#DFCCA8]'}`}>IC Chip Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. 1-Bit Full Adder IC"
              className={`w-full px-3 py-2 rounded-xl font-semibold focus:outline-none focus:border-[#A58D66] border transition-colors ${
                isLight
                  ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                  : 'bg-[#080f14] border-[#A58D66]/20 text-[#E5E1DD]'
              }`}
            />
          </div>

          <div className="space-y-1.5">
            <label className={`font-semibold ${isLight ? 'text-slate-700' : 'text-[#DFCCA8]'}`}>Description:</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Performs binary addition with carry-in"
              className={`w-full px-3 py-2 rounded-xl focus:outline-none focus:border-[#A58D66] border transition-colors ${
                isLight
                  ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                  : 'bg-[#080f14] border-[#A58D66]/20 text-[#E5E1DD]'
              }`}
            />
          </div>

          <div className="space-y-1.5">
            <label className={`font-semibold ${isLight ? 'text-slate-700' : 'text-[#DFCCA8]'}`}>IC Package Accent Color:</label>
            <div className="flex gap-2">
              {['#407E8C', '#76B4C2', '#A58D66', '#DFCCA8', '#2a4454', '#5c4b37'].map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                    color === c ? 'scale-125 ring-2 ring-[#A58D66] shadow-sm' : 'opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {error && (
            <div
              className={`p-3 rounded-xl text-xs border ${
                isLight ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-[#080f14] border-[#A58D66]/40 text-[#DFCCA8]'
              }`}
            >
              {error}
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <button
              onClick={() => setActiveModal('none')}
              className={`px-4 py-2 rounded-xl font-semibold transition-colors cursor-pointer ${
                isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-[#080f14] hover:bg-[#0d171f] text-[#DFCCA8]'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-[#A58D66] hover:bg-[#DFCCA8] text-[#080f14] rounded-xl font-bold transition-colors shadow-lg flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Create IC Subcircuit</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
