import React from 'react';
import { 
  Maximize2, 
  RotateCcw, 
  Crosshair, 
  Box, 
  Square,
  Compass
} from 'lucide-react';

interface Hardware3DControlsBarProps {
  onFit: () => void;
  onTopView: () => void;
  onPerspectiveView: () => void;
  onFocus: () => void;
  onResetView: () => void;
}

export const Hardware3DControlsBar: React.FC<Hardware3DControlsBarProps> = ({
  onFit,
  onTopView,
  onPerspectiveView,
  onFocus,
  onResetView
}) => {
  return (
    <div className="flex flex-col items-center gap-1.5 select-none pointer-events-auto">
      {/* Floating Pill Buttons */}
      <div className="flex items-center gap-1 bg-[#0c161d]/90 border border-[#A58D66]/35 p-1 rounded-xl shadow-2xl backdrop-blur-md">
        {/* Fit */}
        <button
          onClick={onFit}
          className="px-2.5 py-1.5 rounded-lg text-xs font-mono text-slate-300 hover:text-white hover:bg-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
          title="Fit Board in View"
        >
          <Maximize2 className="w-3.5 h-3.5 text-[#A58D66]" />
          <span>Fit</span>
        </button>

        {/* Top view */}
        <button
          onClick={onTopView}
          className="px-2.5 py-1.5 rounded-lg text-xs font-mono text-slate-300 hover:text-white hover:bg-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
          title="Orthogonal Top-down Camera View"
        >
          <Square className="w-3.5 h-3.5 text-[#407E8C]" />
          <span>Top view</span>
        </button>

        {/* 3D view */}
        <button
          onClick={onPerspectiveView}
          className="px-2.5 py-1.5 rounded-lg text-xs font-mono text-slate-300 hover:text-white hover:bg-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
          title="3D Perspective Camera View"
        >
          <Box className="w-3.5 h-3.5 text-[#DFCCA8]" />
          <span>3D view</span>
        </button>

        {/* Focus */}
        <button
          onClick={onFocus}
          className="px-2.5 py-1.5 rounded-lg text-xs font-mono text-slate-300 hover:text-white hover:bg-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
          title="Focus on Active Part"
        >
          <Crosshair className="w-3.5 h-3.5 text-emerald-400" />
          <span>Focus</span>
        </button>

        {/* Reset view */}
        <button
          onClick={onResetView}
          className="px-2.5 py-1.5 rounded-lg text-xs font-mono text-slate-300 hover:text-white hover:bg-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
          title="Reset Camera View"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span>Reset view</span>
        </button>
      </div>

      {/* Guidance Subtitle */}
      <div className="text-[11px] font-mono text-slate-400/90 bg-black/60 px-3 py-0.5 rounded-full border border-white/5 backdrop-blur-sm pointer-events-none">
        Drag to rotate • Scroll to zoom • Right-drag to pan
      </div>
    </div>
  );
};
