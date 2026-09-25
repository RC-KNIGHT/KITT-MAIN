import React from 'react';
import { AlertTriangle, Wrench, X } from 'lucide-react';

interface MissingGroundBannerProps {
  isVisible: boolean;
  onTroubleshoot: () => void;
  onDismiss: () => void;
}

export const MissingGroundBanner: React.FC<MissingGroundBannerProps> = ({
  isVisible,
  onTroubleshoot,
  onDismiss
}) => {
  if (!isVisible) return null;

  return (
    <div className="w-full max-w-4xl mx-auto bg-[#1c0c0e]/95 border border-rose-500/50 rounded-xl px-4 py-2.5 shadow-[0_0_30px_rgba(244,63,94,0.25)] backdrop-blur-md flex items-center justify-between gap-3 text-xs font-mono select-none animate-in slide-in-from-bottom duration-200">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-6 h-6 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
        </div>
        <div className="text-[#E5E1DD] truncate">
          <span className="font-bold text-rose-300">Missing a ground (GND).</span>{' '}
          <span className="text-slate-300 hidden sm:inline">
            Every circuit needs a 0 V reference point. Fix: add a Ground component and connect it to the circuit.
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onTroubleshoot}
          className="px-3 py-1 rounded-lg bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
        >
          <Wrench className="w-3 h-3" />
          <span>Troubleshoot</span>
        </button>

        <button
          onClick={onDismiss}
          className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title="Dismiss warning"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
