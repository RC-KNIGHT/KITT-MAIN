import React from 'react';
import { Layers, Box, Cpu } from 'lucide-react';

export type WorkspaceCanvasMode = 'breadboard-2d' | 'breadboard-3d' | 'schematic' | 'pcb';

interface CanvasViewSwitcherCardProps {
  canvasMode: WorkspaceCanvasMode;
  onChangeMode: (mode: WorkspaceCanvasMode) => void;
}

export const CanvasViewSwitcherCard: React.FC<CanvasViewSwitcherCardProps> = ({
  canvasMode,
  onChangeMode
}) => {
  const isBreadboard = canvasMode === 'breadboard-2d' || canvasMode === 'breadboard-3d';
  const isSchematic = canvasMode === 'schematic';
  const isPcb = canvasMode === 'pcb';

  return (
    <div className="group relative bg-[#0c161d]/90 hover:bg-[#12202a] border border-[#A58D66]/35 hover:border-[#A58D66] rounded-xl p-2.5 shadow-2xl backdrop-blur-md select-none max-w-[195px] transition-all duration-200">
      {/* 1. If in Breadboard mode: card switches to Schematic, and pill toggles 2D vs 3D Breadboard */}
      {isBreadboard && (
        <div 
          onClick={() => onChangeMode('schematic')} 
          className="cursor-pointer"
        >
          {/* Mini Schematic Graphic Preview */}
          <div className="w-full h-16 rounded-lg bg-[#080f14] border border-white/5 flex items-center justify-center overflow-hidden mb-2 relative">
            <svg viewBox="0 0 100 50" className="w-full h-full text-slate-400 p-1">
              <circle cx="20" cy="15" r="2.5" fill="#ef4444" />
              <line x1="20" y1="15" x2="45" y2="15" stroke="#407E8C" strokeWidth="1.5" />
              <path
                d="M 45 15 L 48 10 L 52 20 L 56 10 L 60 20 L 63 15"
                fill="none"
                stroke="#A58D66"
                strokeWidth="1.5"
              />
              <line x1="63" y1="15" x2="80" y2="15" stroke="#407E8C" strokeWidth="1.5" />
              <line x1="80" y1="15" x2="80" y2="35" stroke="#407E8C" strokeWidth="1.5" />
              <line x1="72" y1="35" x2="88" y2="35" stroke="#DFCCA8" strokeWidth="1.5" />
              <line x1="75" y1="38" x2="85" y2="38" stroke="#DFCCA8" strokeWidth="1.2" />
              <line x1="78" y1="41" x2="82" y2="41" stroke="#DFCCA8" strokeWidth="1.0" />
            </svg>
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c161d] via-transparent to-transparent opacity-40 pointer-events-none" />
          </div>

          <div className="text-[11px] font-mono text-[#E5E1DD] group-hover:text-[#DFCCA8] transition-colors mb-2">
            Switch to <span className="font-bold text-white">Schematic</span>
          </div>

          {/* Breadboard 2D / 3D Sub-pill (Antika screenshot media_1789195367408.png & media_1789195389917.png) */}
          <div 
            className="w-full grid grid-cols-2 bg-[#080f14] border border-white/10 rounded-lg p-0.5 text-[10px] font-mono"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => onChangeMode('breadboard-2d')}
              className={`py-1 rounded flex items-center justify-center gap-1 font-bold transition-all cursor-pointer ${
                canvasMode === 'breadboard-2d'
                  ? 'bg-[#A58D66] text-[#080f14] shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>⊞</span>
              <span>2D</span>
            </button>
            <button
              onClick={() => onChangeMode('breadboard-3d')}
              className={`py-1 rounded flex items-center justify-center gap-1 font-bold transition-all cursor-pointer ${
                canvasMode === 'breadboard-3d'
                  ? 'bg-[#2dd4bf] text-[#080f14] shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>⬡</span>
              <span>3D</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. If in Schematic mode: card switches to PCB (media_1789195573901.png) */}
      {isSchematic && (
        <div 
          onClick={() => onChangeMode('pcb')} 
          className="cursor-pointer"
        >
          {/* Mini PCB Graphic Preview */}
          <div className="w-full h-16 rounded-lg bg-[#0e3827] border border-[#22c55e]/30 flex items-center justify-center overflow-hidden mb-2 relative">
            <svg viewBox="0 0 100 50" className="w-full h-full p-1">
              <rect x="8" y="8" width="84" height="34" rx="4" fill="#14532d" stroke="#22c55e" strokeWidth="0.8" />
              {/* Copper traces */}
              <path d="M 22 18 L 45 18 L 65 32 L 80 32" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
              <circle cx="22" cy="18" r="3.5" fill="#f59e0b" stroke="#78350f" strokeWidth="0.8" />
              <circle cx="80" cy="32" r="3.5" fill="#f59e0b" stroke="#78350f" strokeWidth="0.8" />
              <circle cx="50" cy="22" r="2.5" fill="#22c55e" />
            </svg>
            <div className="absolute inset-0 bg-gradient-to-t from-[#0c161d] via-transparent to-transparent opacity-30 pointer-events-none" />
          </div>

          <div className="text-[11px] font-mono text-[#E5E1DD] group-hover:text-[#2dd4bf] transition-colors mb-2">
            Switch to <span className="font-bold text-emerald-400">PCB</span>
          </div>

          <div 
            className="w-full grid grid-cols-2 bg-[#080f14] border border-white/10 rounded-lg p-0.5 text-[10px] font-mono"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => onChangeMode('pcb')}
              className="py-1 rounded flex items-center justify-center gap-1 font-bold text-slate-300 hover:text-white cursor-pointer"
            >
              <span>⚡ PCB</span>
            </button>
            <button
              onClick={() => onChangeMode('breadboard-3d')}
              className="py-1 rounded flex items-center justify-center gap-1 font-bold text-[#A58D66] hover:text-[#DFCCA8] cursor-pointer"
            >
              <span>🔌 Board</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. If in PCB mode: card switches to Schematic (media_1789195659757.png) */}
      {isPcb && (
        <div 
          onClick={() => onChangeMode('schematic')} 
          className="cursor-pointer"
        >
          {/* Mini Schematic Graphic Preview */}
          <div className="w-full h-16 rounded-lg bg-[#080f14] border border-white/5 flex items-center justify-center overflow-hidden mb-2 relative">
            <svg viewBox="0 0 100 50" className="w-full h-full text-slate-400 p-1">
              <circle cx="20" cy="15" r="2.5" fill="#ef4444" />
              <line x1="20" y1="15" x2="45" y2="15" stroke="#407E8C" strokeWidth="1.5" />
              <path
                d="M 45 15 L 48 10 L 52 20 L 56 10 L 60 20 L 63 15"
                fill="none"
                stroke="#A58D66"
                strokeWidth="1.5"
              />
              <line x1="63" y1="15" x2="80" y2="15" stroke="#407E8C" strokeWidth="1.5" />
              <line x1="80" y1="15" x2="80" y2="35" stroke="#407E8C" strokeWidth="1.5" />
              <line x1="72" y1="35" x2="88" y2="35" stroke="#DFCCA8" strokeWidth="1.5" />
            </svg>
          </div>

          <div className="text-[11px] font-mono text-[#E5E1DD] group-hover:text-[#DFCCA8] transition-colors mb-2">
            Switch to <span className="font-bold text-white">Schematic</span>
          </div>

          <div 
            className="w-full grid grid-cols-2 bg-[#080f14] border border-white/10 rounded-lg p-0.5 text-[10px] font-mono"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => onChangeMode('schematic')}
              className="py-1 rounded flex items-center justify-center gap-1 font-bold text-slate-300 hover:text-white cursor-pointer"
            >
              <span>⊞ Schematic</span>
            </button>
            <button
              onClick={() => onChangeMode('breadboard-3d')}
              className="py-1 rounded flex items-center justify-center gap-1 font-bold text-[#A58D66] hover:text-[#DFCCA8] cursor-pointer"
            >
              <span>🔌 Board</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
