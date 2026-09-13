import React from 'react';
import { X, Check } from 'lucide-react';

export type BreadboardSize = 'mini' | 'medium' | 'large';

interface NewBreadboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSize: (size: BreadboardSize) => void;
  currentSize?: BreadboardSize;
}

export const NewBreadboardModal: React.FC<NewBreadboardModalProps> = ({
  isOpen,
  onClose,
  onSelectSize,
  currentSize = 'large'
}) => {
  if (!isOpen) return null;

  const boardOptions: {
    id: BreadboardSize;
    name: string;
    points: string;
    description: string;
    rows: number;
    hasRails: boolean;
  }[] = [
    {
      id: 'mini',
      name: 'Mini',
      points: '170 tie-points',
      description: 'no power rails',
      rows: 17,
      hasRails: false
    },
    {
      id: 'medium',
      name: 'Medium',
      points: '400 tie-points',
      description: 'with power rails',
      rows: 30,
      hasRails: true
    },
    {
      id: 'large',
      name: 'Large',
      points: '830 tie-points',
      description: 'with power rails',
      rows: 63,
      hasRails: true
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-[#0c161d] border border-[#A58D66]/35 rounded-2xl shadow-2xl overflow-hidden flex flex-col font-sans"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#080f14]/80">
          <div>
            <h3 className="text-base font-bold text-[#E5E1DD]">New breadboard</h3>
            <p className="text-xs text-slate-400 mt-0.5">Choose a size</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3 Size Cards */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#080f14]/40">
          {boardOptions.map(board => {
            const isSelected = currentSize === board.id;

            return (
              <div
                key={board.id}
                onClick={() => {
                  onSelectSize(board.id);
                  onClose();
                }}
                className={`group relative rounded-xl border p-4 flex flex-col items-center text-center cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'border-[#A58D66] bg-[#A58D66]/10 shadow-[0_0_20px_rgba(165,141,102,0.15)]'
                    : 'border-white/10 bg-[#0c161d] hover:border-[#A58D66]/60 hover:bg-[#121f28]'
                }`}
              >
                {/* SVG Breadboard Illustration */}
                <div className="w-full h-32 mb-3 bg-[#080f14] rounded-lg border border-white/5 p-2 flex items-center justify-center overflow-hidden">
                  <svg
                    viewBox="0 0 160 90"
                    className="w-full h-full text-slate-400 transition-transform group-hover:scale-105"
                  >
                    {/* Breadboard Outer Shell */}
                    <rect
                      x="10"
                      y="10"
                      width="140"
                      height="70"
                      rx="4"
                      fill="#1e293b"
                      stroke="#475569"
                      strokeWidth="1"
                    />

                    {/* Center Divider Groove */}
                    <rect x="12" y="43" width="136" height="4" fill="#0f172a" />

                    {/* Power Rails if present */}
                    {board.hasRails && (
                      <>
                        {/* Top Rails: Red (+) & Blue (-) */}
                        <line x1="16" y1="16" x2="144" y2="16" stroke="#ef4444" strokeWidth="1" strokeDasharray="2, 2" />
                        <line x1="16" y1="22" x2="144" y2="22" stroke="#3b82f6" strokeWidth="1" strokeDasharray="2, 2" />

                        {/* Bottom Rails: Blue (-) & Red (+) */}
                        <line x1="16" y1="68" x2="144" y2="68" stroke="#3b82f6" strokeWidth="1" strokeDasharray="2, 2" />
                        <line x1="16" y1="74" x2="144" y2="74" stroke="#ef4444" strokeWidth="1" strokeDasharray="2, 2" />
                      </>
                    )}

                    {/* Pin Tie-Points Matrix */}
                    <g fill="#64748b" opacity={0.8}>
                      {board.id === 'mini' ? (
                        // Mini: 8 rows of pins
                        [24, 40, 56, 72, 88, 104, 120, 136].map((x, i) => (
                          <g key={i}>
                            <circle cx={x} cy="26" r="1.2" />
                            <circle cx={x} cy="34" r="1.2" />
                            <circle cx={x} cy="56" r="1.2" />
                            <circle cx={x} cy="64" r="1.2" />
                          </g>
                        ))
                      ) : (
                        // Medium & Large: Denser rows
                        [20, 32, 44, 56, 68, 80, 92, 104, 116, 128, 140].map((x, i) => (
                          <g key={i}>
                            <circle cx={x} cy="30" r="1.0" />
                            <circle cx={x} cy="37" r="1.0" />
                            <circle cx={x} cy="53" r="1.0" />
                            <circle cx={x} cy="60" r="1.0" />
                          </g>
                        ))
                      )}
                    </g>
                  </svg>
                </div>

                {/* Title & Specs */}
                <h4 className="text-sm font-bold text-[#E5E1DD] group-hover:text-[#DFCCA8] transition-colors">
                  {board.name}
                </h4>
                <p className="text-xs text-slate-300 font-mono mt-0.5">
                  {board.points}
                </p>
                <p className="text-[11px] text-slate-500 font-mono">
                  {board.description}
                </p>

                {/* Action Button */}
                <button
                  type="button"
                  className={`mt-4 w-full py-1.5 px-3 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#A58D66] text-[#080f14]'
                      : 'bg-white/5 hover:bg-[#A58D66] text-slate-300 hover:text-[#080f14] border border-white/10'
                  }`}
                >
                  {isSelected ? 'Selected' : 'Create'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/10 bg-[#080f14] flex justify-between items-center text-xs text-slate-500 font-mono">
          <span>Standard 2.54mm (0.1 in) pitch standard</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
