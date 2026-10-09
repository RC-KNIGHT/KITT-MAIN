import React, { useState, useRef, useEffect } from 'react';
import { 
  Undo2, 
  Redo2, 
  Trash2, 
  Maximize2, 
  Plus, 
  Minus, 
  ChevronDown,
  Sparkles,
  Zap
} from 'lucide-react';

export type WireRoutingStyle = 'curved' | 'orthogonal' | 'straight';

interface CanvasToolbarProps {
  canUndo?: boolean;
  canRedo?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  onDeleteSelected?: () => void;
  hasSelection?: boolean;
  wireColor: string;
  onChangeWireColor: (color: string) => void;
  wireStyle: WireRoutingStyle;
  onChangeWireStyle: (style: WireRoutingStyle) => void;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
  onOpenBoardModal: () => void;
}

const WIRE_COLORS = [
  { name: 'Silver', hex: '#8F8F8F' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Alabaster', hex: '#F5F5F5' },
  { name: 'Signal Red', hex: '#ef4444' },
  { name: 'Graphite', hex: '#B4B4B4' },
  { name: 'Warning Amber', hex: '#f59e0b' },
  { name: 'Platinum', hex: '#CCCCCC' },
  { name: 'Steel', hex: '#737373' },
  { name: 'Black', hex: '#1e293b' },
  { name: 'Bright White', hex: '#f8fafc' }
];

export const CanvasToolbar: React.FC<CanvasToolbarProps> = ({
  canUndo = true,
  canRedo = false,
  onUndo,
  onRedo,
  onDeleteSelected,
  hasSelection = false,
  wireColor,
  onChangeWireColor,
  wireStyle,
  onChangeWireStyle,
  zoom,
  onZoomIn,
  onZoomOut,
  onFitView,
  onOpenBoardModal
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(e.target as Node)) {
        setShowColorPicker(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  return (
    <div className="h-11 px-3 bg-[#000000]/90 border-b border-[#353536] flex items-center justify-between font-sans select-none z-20 backdrop-blur-sm relative">
      {/* Left: History & Wire Controls */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Undo */}
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="p-1.5 rounded-[12px] text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-3.5 h-3.5" />
        </button>

        {/* Redo */}
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="p-1.5 rounded-[12px] text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="w-3.5 h-3.5" />
        </button>

        {/* Delete */}
        <button
          onClick={onDeleteSelected}
          disabled={!hasSelection}
          className="p-1.5 rounded-[12px] text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          title="Delete selected (Del / Backspace)"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>

        <div className="h-4 w-px bg-white/10 mx-1" />

        {/* Wire Color Picker Dropdown */}
        <div className="relative" ref={colorPickerRef}>
          <button
            onClick={() => setShowColorPicker(s => !s)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-[12px] bg-[#141415] hover:bg-[#141415] border border-[#29292A] text-xs font-mono text-slate-300 transition-colors cursor-pointer"
            title="Wire Color"
          >
            <span
              className="w-3 h-3 rounded-full border border-black/30 shadow-sm"
              style={{ backgroundColor: wireColor }}
            />
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showColorPicker && (
            <div className="absolute top-full mt-1.5 left-0 p-2 bg-[#141415] border border-[#353536] rounded-[12px] z-50 grid grid-cols-5 gap-1.5 w-44">
              {WIRE_COLORS.map(c => (
                <button
                  key={c.hex}
                  onClick={() => {
                    onChangeWireColor(c.hex);
                    setShowColorPicker(false);
                  }}
                  className={`w-6 h-6 rounded-full flex items-center justify-center border transition-transform hover:scale-110 cursor-pointer ${
                    wireColor === c.hex ? 'border-white ring-2 ring-[#FFFFFF]' : 'border-black/40'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
            </div>
          )}
        </div>

        {/* Wire Style Selector */}
        <div className="hidden md:flex items-center bg-[#141415] border border-[#29292A] rounded-[12px] p-0.5 text-[11px] font-mono">
          <button
            onClick={() => onChangeWireStyle('curved')}
            className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
              wireStyle === 'curved' ? 'bg-[#FFFFFF]/30 text-[#E8E8E8] font-bold' : 'text-slate-400 hover:text-white'
            }`}
            title="Curved Wire"
          >
            Curved
          </button>
          <button
            onClick={() => onChangeWireStyle('orthogonal')}
            className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
              wireStyle === 'orthogonal' ? 'bg-[#FFFFFF]/30 text-[#E8E8E8] font-bold' : 'text-slate-400 hover:text-white'
            }`}
            title="Orthogonal 90° Wire"
          >
            Orthogonal
          </button>
        </div>
      </div>

      {/* Center: Guidance Pill - Displayed when ample space is available (preventing overlap on laptops) */}
      <div className="hidden 2xl:flex items-center gap-2 px-3 py-1 rounded-full bg-[#141415]/80 border border-[#29292A] text-[11px] font-mono text-slate-400 absolute left-1/2 -translate-x-1/2 pointer-events-none whitespace-nowrap">
        <span className="text-[#FFFFFF] font-semibold">Tip:</span>
        <span>Drag any pin → any pin/hole to wire • Select + R to rotate</span>
      </div>

      {/* Right: Engine Status, + Board, Zoom % */}
      <div className="flex items-center gap-2">
        {/* WEBGPU - Status & Quality Dropdown (Antika screenshots media_1789195389917.png, media_1789195400998.png) */}
        <div className="hidden sm:flex items-center bg-[#141415] border border-[#29292A] rounded-[12px] p-0.5 text-[10px] font-mono">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded text-zinc-400 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-pulse" />
            <span>WEBGPU - MEDIUM</span>
          </div>
          <select 
            className="bg-transparent text-slate-400 hover:text-white px-1.5 py-0.5 outline-none cursor-pointer text-[10px] font-mono border-l border-[#29292A]"
            defaultValue="auto"
          >
            <option value="auto" className="bg-[#141415] text-white">Auto quality</option>
            <option value="high" className="bg-[#141415] text-white">High (60 FPS)</option>
            <option value="medium" className="bg-[#141415] text-white">Medium</option>
            <option value="low" className="bg-[#141415] text-white">Low</option>
          </select>
        </div>

        {/* + Board Button (Antika screenshot media_1789194335648.png) */}
        <button
          onClick={onOpenBoardModal}
          className="px-2.5 py-1 rounded-[12px] bg-[#FFFFFF]/20 hover:bg-[#FFFFFF]/35 border border-[#8F8F8F] text-xs font-mono font-bold text-[#F5F5F5] hover:text-[#E8E8E8] flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          title="Add or Change Solderless Breadboard"
        >
          <Plus className="w-3.5 h-3.5 text-[#FFFFFF]" />
          <span>+ Board</span>
        </button>

        {/* Zoom Controls: [ - ] 84% [ + ] */}
        <div className="flex items-center bg-[#141415] border border-[#353536] rounded-[12px] text-xs font-mono">
          <button
            onClick={onZoomOut}
            className="p-1 text-slate-400 hover:text-white hover:bg-white/5 rounded-l transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="px-2 font-bold text-[#FFFFFF] text-[11px] min-w-[42px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={onZoomIn}
            className="p-1 text-slate-400 hover:text-white hover:bg-white/5 rounded-r transition-colors cursor-pointer"
            title="Zoom In"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Fit to Screen Button */}
        <button
          onClick={onFitView}
          className="p-1.5 rounded-[12px] bg-[#141415] hover:bg-white/10 border border-[#29292A] text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Fit to Screen"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
