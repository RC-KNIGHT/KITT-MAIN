import React, { useState } from 'react';
import { 
  X, 
  Cpu, 
  Layers, 
  Sparkles, 
  Check, 
  ArrowRight,
  Zap,
  Maximize2
} from 'lucide-react';
import { KITT_EXAMPLE_TEMPLATES } from '../data/exampleTemplates';
import { CanonicalCircuitModel } from '../cir/cirTypes';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (name: string, mode: 'schematic' | 'breadboard', initialCircuit?: CanonicalCircuitModel) => void;
}

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onCreateProject
}) => {
  const [mode, setMode] = useState<'schematic' | 'breadboard'>('schematic');
  const [projectName, setProjectName] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('blank');

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = projectName.trim() || (mode === 'schematic' ? 'Untitled Schematic' : 'Untitled Breadboard');
    let initialCircuit: CanonicalCircuitModel | undefined = undefined;

    if (selectedTemplateId !== 'blank') {
      const found = KITT_EXAMPLE_TEMPLATES.find(t => t.id === selectedTemplateId);
      if (found) {
        initialCircuit = found.factory();
      }
    }

    onCreateProject(finalName, mode, initialCircuit);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-100 font-sans">
      <div 
        className="w-full max-w-xl bg-[#0c161d] border border-[#A58D66]/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#A58D66]/20 bg-[#080f14]/80 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold font-mono text-[#E5E1DD]">New project</h2>
            <p className="text-xs text-slate-400 mt-0.5">Choose a starting mode for your circuit</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleCreate} className="p-6 space-y-5">
          {/* Mode Selection Cards (Schematic vs Breadboard) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1. Schematic Card */}
            <div
              onClick={() => setMode('schematic')}
              className={`p-4 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                mode === 'schematic'
                  ? 'bg-[#A58D66]/15 border-[#A58D66] shadow-[0_0_20px_rgba(165,141,102,0.15)] ring-1 ring-[#A58D66]/40'
                  : 'bg-[#080f14]/60 border-white/10 hover:border-white/20 hover:bg-white/5'
              }`}
            >
              {/* Radio Indicator */}
              <div className="flex items-center justify-between mb-3">
                {/* Schematic Vector Icon */}
                <div className="w-10 h-10 rounded-lg bg-[#A58D66]/20 border border-[#A58D66]/30 flex items-center justify-center text-[#DFCCA8]">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <circle cx="5" cy="12" r="2" fill="currentColor" />
                    <circle cx="19" cy="12" r="2" fill="currentColor" />
                    <path d="M7 12h3l2-5 3 10 2-5h2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                  mode === 'schematic' ? 'border-[#A58D66] bg-[#A58D66] text-[#080f14]' : 'border-slate-500'
                }`}>
                  {mode === 'schematic' && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold font-mono text-[#E5E1DD]">Schematic</h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Logical diagram, standard electrical symbols (ideal for simulation & design).
                </p>
              </div>
            </div>

            {/* 2. Breadboard Card */}
            <div
              onClick={() => setMode('breadboard')}
              className={`p-4 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                mode === 'breadboard'
                  ? 'bg-[#407E8C]/15 border-[#407E8C] shadow-[0_0_20px_rgba(64,126,140,0.15)] ring-1 ring-[#407E8C]/40'
                  : 'bg-[#080f14]/60 border-white/10 hover:border-white/20 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                {/* Breadboard Vector Icon */}
                <div className="w-10 h-10 rounded-lg bg-[#407E8C]/20 border border-[#407E8C]/30 flex items-center justify-center text-[#22d3ee]">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <circle cx="7" cy="9" r="1" fill="currentColor" />
                    <circle cx="12" cy="9" r="1" fill="currentColor" />
                    <circle cx="17" cy="9" r="1" fill="currentColor" />
                    <circle cx="7" cy="15" r="1" fill="currentColor" />
                    <circle cx="12" cy="15" r="1" fill="currentColor" />
                    <circle cx="17" cy="15" r="1" fill="currentColor" />
                  </svg>
                </div>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                  mode === 'breadboard' ? 'border-[#407E8C] bg-[#407E8C] text-[#080f14]' : 'border-slate-500'
                }`}>
                  {mode === 'breadboard' && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold font-mono text-[#E5E1DD]">Breadboard</h3>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Physical layout, real-world components & 3D wiring (ideal for prototyping).
                </p>
              </div>
            </div>
          </div>

          {/* Project Name Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-mono font-bold text-slate-300">
              Project name
            </label>
            <input
              type="text"
              value={projectName}
              onChange={e => setProjectName(e.target.value)}
              placeholder="e.g. 555 Timer Flasher"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#080f14] border border-[#A58D66]/30 text-[#E5E1DD] text-xs font-mono focus:outline-none focus:border-[#A58D66] focus:ring-1 focus:ring-[#A58D66]/40 transition-all placeholder:text-slate-500"
              autoFocus
            />
          </div>

          {/* Optional Starter Template */}
          <div className="space-y-1.5">
            <label className="block text-xs font-mono text-slate-400">
              Starter Template (Optional)
            </label>
            <select
              value={selectedTemplateId}
              onChange={e => setSelectedTemplateId(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg bg-[#080f14] border border-white/10 text-slate-300 text-xs font-mono focus:outline-none focus:border-[#A58D66] cursor-pointer"
            >
              <option value="blank">Blank Circuit (Clean Slate)</option>
              {KITT_EXAMPLE_TEMPLATES.map(t => (
                <option key={t.id} value={t.id}>
                  {t.title} ({t.category})
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-mono text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#A58D66] to-[#8C7654] hover:from-[#bfa378] hover:to-[#A58D66] text-[#080f14] font-mono font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(165,141,102,0.3)] transition-all cursor-pointer"
            >
              <span>Create project</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
