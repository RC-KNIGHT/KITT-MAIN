/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useCircuit } from '../../context/CircuitContext';
import { HelpCircle, Keyboard, X } from 'lucide-react';

export const ShortcutHelpModal: React.FC = () => {
  const { activeModal, setActiveModal, colorMode } = useCircuit();
  const isLight = colorMode === 'light';

  if (activeModal !== 'shortcuts') return null;

  const shortcuts = [
    { key: '/', desc: 'Quick search component library' },
    { key: 'Space', desc: 'Run / Pause simulation engine' },
    { key: 'Ctrl + Z', desc: 'Undo last action (drag, rotate, place, wire, delete)' },
    { key: 'Ctrl + Y / Shift+Z', desc: 'Redo previously undone action' },
    { key: 'Ctrl + C', desc: 'Copy selected components' },
    { key: 'Ctrl + V', desc: 'Paste copied components' },
    { key: 'Ctrl + D', desc: 'Duplicate selected components' },
    { key: 'Ctrl + A', desc: 'Select all components and wires' },
    { key: 'R', desc: 'Rotate selected component 90°' },
    { key: 'F', desc: 'Flip component horizontally' },
    { key: 'Del / Backspace', desc: 'Delete selected components and wires' },
    { key: 'Esc', desc: 'Cancel wire draft or deselect' },
    { key: 'Scroll Wheel', desc: 'Zoom canvas in / out' },
    { key: 'Middle Drag / Space+Drag', desc: 'Pan infinite canvas' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#000000]/70 backdrop-blur-sm p-4 animate-fade-in">
      <div
        className={`border rounded-2xl w-full max-w-lg flex flex-col shadow-2xl overflow-hidden transition-colors ${
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
            <div
              className={`p-2 rounded-lg border ${
                isLight ? 'bg-slate-100 border-slate-200 text-slate-700' : 'bg-[#141415] border-[#FFFFFF]/20 text-[#E8E8E8]'
              }`}
            >
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`font-bold text-sm ${isLight ? 'text-slate-900' : 'text-[#F5F5F5]'}`}>Keyboard Shortcuts</h2>
              <p className={`text-xs ${isLight ? 'text-[#F5F5F5]/45' : 'text-[#F5F5F5]/60'}`}>Boost your circuit design efficiency</p>
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

        {/* Shortcuts List */}
        <div className="p-5 space-y-2 max-h-[60vh] overflow-y-auto text-xs">
          {shortcuts.map((sc) => (
            <div
              key={sc.key}
              className={`flex items-center justify-between p-2 rounded-lg border transition-colors ${
                isLight ? 'bg-slate-50 border-slate-200/80' : 'bg-[#000000] border-[#FFFFFF]/20'
              }`}
            >
              <span className={isLight ? 'text-slate-700 font-medium' : 'text-[#F5F5F5]'}>{sc.desc}</span>
              <kbd
                className={`px-2 py-1 rounded font-mono text-xs font-bold shadow-xs border ${
                  isLight
                    ? 'bg-white border-slate-300 text-zinc-700 shadow-sm'
                    : 'bg-[#141415] border-[#FFFFFF]/30 text-[#E8E8E8]'
                }`}
              >
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
