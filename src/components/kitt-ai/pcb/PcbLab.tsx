import React, { useState, useRef } from 'react';
import { 
  Undo2, 
  Redo2, 
  Trash2, 
  Layers, 
  Maximize2, 
  Check, 
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { CanonicalCircuitModel, CIRComponent } from '../cir/cirTypes';

interface PcbLabProps {
  circuit: CanonicalCircuitModel;
  onSelectComponent?: (comp: CIRComponent | null) => void;
  zoom?: number;
  onZoomChange?: (z: number) => void;
  selectedComponentId?: string | null;
}

export const PcbLab: React.FC<PcbLabProps> = ({
  circuit,
  onSelectComponent,
  zoom: externalZoom,
  onZoomChange,
  selectedComponentId
}) => {
  const [internalZoom, setInternalZoom] = useState(1);
  const zoom = externalZoom !== undefined ? externalZoom : internalZoom;

  const [activeLayer, setActiveLayer] = useState<'top' | 'bottom'>('top');
  const [trackWidth, setTrackWidth] = useState<'0.5 mm' | '0.8 mm' | '1.2 mm'>('0.8 mm');
  const [boardWidthMm, setBoardWidthMm] = useState(30);
  const [boardHeightMm, setBoardHeightMm] = useState(30);

  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'BUTTON' || (e.target as HTMLElement).closest('button')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.08 : -0.08;
    const newZ = Math.max(0.4, Math.min(2.5, Number((zoom + delta).toFixed(2))));
    if (onZoomChange) onZoomChange(newZ);
    else setInternalZoom(newZ);
  };

  // PCB Board Canvas Dimensions (scale 10px per mm)
  const pxPerMm = 14;
  const pcbWidthPx = boardWidthMm * pxPerMm;
  const pcbHeightPx = boardHeightMm * pxPerMm;

  return (
    <div className="relative w-full h-full bg-[#000000] overflow-hidden flex flex-col font-sans select-none">
      {/* Top PCB Toolbar (matching Antika screenshot media_1789195659757.png) */}
      <div className="h-11 px-4 bg-[#141415]/90 border-b border-[#29292A] flex items-center justify-between z-20 backdrop-blur-md relative">
        {/* Left: Undo, Redo, Delete */}
        <div className="flex items-center gap-1.5">
          <button className="p-1.5 rounded-[12px] text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer" title="Undo">
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button className="p-1.5 rounded-[12px] text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer" title="Redo">
            <Redo2 className="w-3.5 h-3.5" />
          </button>
          <button className="p-1.5 rounded-[12px] text-slate-400 hover:text-rose-400 hover:bg-white/10 transition-colors cursor-pointer" title="Delete">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Center: Layer Selector, Track Width, Dimensions, All Routed Status - Absolutely Centered */}
        <div className="hidden sm:flex items-center gap-2 text-xs font-mono absolute left-1/2 -translate-x-1/2">
          {/* Layer Selector */}
          <div className="flex items-center bg-[#000000] border border-[#29292A] rounded-[12px] p-0.5">
            <button
              onClick={() => setActiveLayer('top')}
              className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeLayer === 'top' ? 'bg-[#ef4444]/20 text-[#ef4444] font-bold border border-[#ef4444]/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#ef4444]" />
              <span>Top</span>
            </button>
            <button
              onClick={() => setActiveLayer('bottom')}
              className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeLayer === 'bottom' ? 'bg-[#B4B4B4]/20 text-[#B4B4B4] font-bold border border-[#B4B4B4]/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#B4B4B4]" />
              <span>Bottom</span>
            </button>
          </div>

          {/* Track Width Dropdown */}
          <select
            value={trackWidth}
            onChange={e => setTrackWidth(e.target.value as any)}
            className="bg-[#000000] border border-[#29292A] text-slate-300 rounded-[12px] px-2 py-1 outline-none text-xs font-mono cursor-pointer"
          >
            <option value="0.5 mm">0.5 mm</option>
            <option value="0.8 mm">0.8 mm</option>
            <option value="1.2 mm">1.2 mm</option>
          </select>

          {/* Dimensions Input (30 × 30 mm) */}
          <div className="flex items-center gap-1 bg-[#000000] border border-[#29292A] rounded-[12px] px-2 py-1 text-slate-400">
            <input
              type="number"
              value={boardWidthMm}
              onChange={e => setBoardWidthMm(Math.max(10, Math.min(200, Number(e.target.value))))}
              className="w-8 bg-transparent text-white text-center outline-none font-mono"
            />
            <span>×</span>
            <input
              type="number"
              value={boardHeightMm}
              onChange={e => setBoardHeightMm(Math.max(10, Math.min(200, Number(e.target.value))))}
              className="w-8 bg-transparent text-white text-center outline-none font-mono"
            />
            <span className="text-[10px] text-slate-500">mm</span>
          </div>

          {/* All Routed Green Pill */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-500/10 border border-zinc-500/30 text-[10px] font-mono font-bold text-zinc-400">
            <Check className="w-3 h-3" />
            <span>All routed</span>
          </div>
        </div>

        {/* Right Status */}
        <div className="text-[11px] font-mono text-slate-500">
          FR-4 2-Layer PCB
        </div>
      </div>

      {/* Main PCB Canvas Viewport */}
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden relative cursor-grab active:cursor-grabbing flex items-center justify-center bg-[#0B0B0C]"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        {/* Background Engineering Dot Grid */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `
              radial-gradient(circle at 1px 1px, #B4B4B4 1px, transparent 0),
              linear-gradient(to right, rgba(180,180,180,0.06) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(180,180,180,0.06) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px, 100px 100px, 100px 100px'
          }}
        />

        {/* Green Soldermask PCB Slab */}
        <div 
          className={`origin-center ${isDragging ? '' : 'transition-transform duration-100 ease-out'}`}
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`
          }}
        >
          <svg
            width={pcbWidthPx}
            height={pcbHeightPx}
            viewBox={`0 0 ${pcbWidthPx} ${pcbHeightPx}`}
            className="filter drop-shadow-[0_20px_45px_rgba(0,0,0,0.9)] overflow-visible"
          >
            {/* PCB FR-4 Green Soldermask Substrate */}
            <rect
              x="0"
              y="0"
              width={pcbWidthPx}
              height={pcbHeightPx}
              rx="16"
              fill="#1D1D1E"
              stroke="#F5F5F5"
              strokeWidth="1.5"
            />

            {/* Subtle Surface Copper Pour Texture */}
            <rect
              x="4"
              y="4"
              width={pcbWidthPx - 8}
              height={pcbHeightPx - 8}
              rx="12"
              fill="#1D1D1E"
              opacity="0.8"
            />

            {/* Silkscreen Grid & Border */}
            <rect
              x="12"
              y="12"
              width={pcbWidthPx - 24}
              height={pcbHeightPx - 24}
              rx="10"
              fill="none"
              stroke="#ffffff"
              strokeWidth="0.75"
              strokeDasharray="4, 4"
              opacity="0.4"
            />

            {/* Solder Pads & Surface Routing Matrix */}
            {Array.from({ length: 9 }).map((_, r) =>
              Array.from({ length: 9 }).map((_, c) => {
                const px = 36 + c * ((pcbWidthPx - 72) / 8);
                const py = 36 + r * ((pcbHeightPx - 72) / 8);
                return (
                  <g key={`${r}-${c}`}>
                    <circle cx={px} cy={py} r="5" fill="#f59e0b" stroke="#d97706" strokeWidth="1" />
                    <circle cx={px} cy={py} r="2.2" fill="#0f172a" />
                  </g>
                );
              })
            )}

            {/* Copper Routing Traces */}
            {circuit.wires.map((wire, idx) => {
              const startX = 60 + (idx * 38) % (pcbWidthPx - 120);
              const startY = 60 + (idx * 46) % (pcbHeightPx - 120);
              const endX = startX + 70;
              const endY = startY + 50;
              const midX = (startX + endX) / 2;

              const isTop = idx % 2 === 0;
              const color = isTop ? '#ef4444' : '#B4B4B4';
              const widthNum = trackWidth === '0.5 mm' ? 1.6 : trackWidth === '0.8 mm' ? 2.4 : 3.4;

              return (
                <g key={wire.id} className="cursor-pointer group/trace">
                  <path
                    d={`M ${startX} ${startY} L ${midX} ${startY} L ${endX} ${endY}`}
                    fill="none"
                    stroke={color}
                    strokeWidth={widthNum}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={activeLayer === (isTop ? 'top' : 'bottom') ? 0.95 : 0.3}
                  />
                  {/* Solder Pad Terminals */}
                  <circle cx={startX} cy={startY} r="4" fill="#fbbf24" stroke="#29292A" strokeWidth="1" />
                  <circle cx={endX} cy={endY} r="4" fill="#fbbf24" stroke="#29292A" strokeWidth="1" />
                </g>
              );
            })}

            {/* Silkscreen Labels */}
            <text x="24" y="28" fill="#ffffff" fontSize="9" fontWeight="bold" fontFamily="monospace" opacity="0.8">
              KITT AI PCB v1.0
            </text>
            <text x={pcbWidthPx - 30} y={pcbHeightPx - 20} fill="#ffffff" fontSize="8" fontFamily="monospace" opacity="0.6">
              GND
            </text>
          </svg>
        </div>
      </div>
    </div>
  );
};
