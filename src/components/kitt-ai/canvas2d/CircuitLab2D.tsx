import React, { useState, useRef, useEffect } from 'react';
import { CanonicalCircuitModel, CIRComponent } from '../cir/cirTypes';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Zap, 
  Activity, 
  Plus, 
  Trash2, 
  Layers,
  Search
} from 'lucide-react';
import { COMPONENT_REGISTRY } from '../registry/componentRegistry';

interface CircuitLab2DProps {
  circuit: CanonicalCircuitModel;
  onSelectComponent?: (comp: CIRComponent | null) => void;
  onAddComponent?: (partKey: string) => void;
  onDeleteComponent?: (compId: string) => void;
  onRotateComponent?: (compId: string) => void;
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
  wireStyle?: 'curved' | 'orthogonal' | 'straight';
  selectedComponentId?: string | null;
}

export const CircuitLab2D: React.FC<CircuitLab2DProps> = ({
  circuit,
  onSelectComponent,
  onAddComponent,
  onDeleteComponent,
  onRotateComponent,
  zoom: externalZoom,
  onZoomChange,
  wireStyle = 'orthogonal',
  selectedComponentId
}) => {
  const [internalZoom, setInternalZoom] = useState(1);
  const zoom = externalZoom !== undefined ? externalZoom : internalZoom;

  const [pan, setPan] = useState({ x: 30, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<{ id: string; name: string; voltage: number; x: number; y: number } | null>(null);
  const [showPalette, setShowPalette] = useState(false);
  const [paletteSearch, setPaletteSearch] = useState('');

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
    setZoomValue(zoom + delta);
  };

  const setZoomValue = (newZ: number) => {
    const clamped = Math.max(0.4, Math.min(2.5, Number(newZ.toFixed(2))));
    if (onZoomChange) onZoomChange(clamped);
    else setInternalZoom(clamped);
  };

  const handleZoomIn = () => setZoomValue(zoom + 0.15);
  const handleZoomOut = () => setZoomValue(zoom - 0.15);
  const handleResetView = () => {
    setZoomValue(1);
    setPan({ x: 30, y: 20 });
  };

  const getPinAbsolutePos = (componentId: string, pinId: string) => {
    const comp = circuit.components.find(c => c.id === componentId);
    if (!comp) return { x: 0, y: 0 };
    const pin = comp.pins.find(p => p.id === pinId);
    if (!pin) return { x: comp.schematic.x, y: comp.schematic.y };

    const rot = comp.schematic.rotation || 0;
    const cx = 80;
    const cy = 90;
    const px = pin.relativeX - cx;
    const py = pin.relativeY - cy;

    const rad = (rot * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    const rx = px * cos - py * sin + cx;
    const ry = px * sin + py * cos + cy;

    return {
      x: comp.schematic.x + rx,
      y: comp.schematic.y + ry
    };
  };

  const filteredRegistry = Object.values(COMPONENT_REGISTRY).filter(item =>
    item.displayName.toLowerCase().includes(paletteSearch.toLowerCase()) ||
    item.partNumber.toLowerCase().includes(paletteSearch.toLowerCase()) ||
    item.category.toLowerCase().includes(paletteSearch.toLowerCase())
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-[#000000] overflow-hidden select-none cursor-grab active:cursor-grabbing"
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
            radial-gradient(circle at 1px 1px, #FFFFFF 1px, transparent 0),
            linear-gradient(to right, rgba(143,143,143,0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(143,143,143,0.08) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px, 120px 120px, 120px 120px'
        }}
      />

      {/* SVG Canvas Viewport */}
      <div 
        className={`absolute inset-0 origin-top-left ${isDragging ? '' : 'transition-transform duration-100 ease-out'}`}
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`
        }}
      >
        <svg className="w-[2400px] h-[1600px] overflow-visible pointer-events-auto">
          <defs>
            <filter id="circuit-wire-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            <pattern id="current-pulse" width="10" height="10" patternUnits="userSpaceOnUse">
              <circle cx="5" cy="5" r="1.5" fill="#f59e0b" />
            </pattern>
          </defs>

          {/* 1. DYNAMIC WIRES (Curved, Orthogonal, or Straight) */}
          {circuit.wires.map(wire => {
            const start = getPinAbsolutePos(wire.fromComponentId, wire.fromPinId);
            const end = getPinAbsolutePos(wire.toComponentId, wire.toPinId);
            const midX = start.x + (end.x - start.x) * 0.5;

            let pathData = '';
            if (wireStyle === 'curved') {
              pathData = `M ${start.x} ${start.y} C ${midX} ${start.y}, ${midX} ${end.y}, ${end.x} ${end.y}`;
            } else if (wireStyle === 'straight') {
              pathData = `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
            } else {
              // Orthogonal
              pathData = `M ${start.x} ${start.y} L ${midX} ${start.y} L ${midX} ${end.y} L ${end.x} ${end.y}`;
            }

            const isPower = wire.signalType === 'POWER_VCC' || wire.signalType === 'POWER_3V3';
            const nodeKey = `${wire.fromComponentId}_${wire.fromPinId}`;
            const voltage = circuit.telemetry.nodeVoltages[nodeKey] ?? (isPower ? circuit.telemetry.supplyVoltage : 0);

            return (
              <g key={wire.id} className="group/wire cursor-pointer">
                {/* Hit Target */}
                <path
                  d={pathData}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="16"
                  onMouseEnter={() => {
                    setHoveredNode({
                      id: wire.id,
                      name: wire.label || `${wire.fromPinId} ➔ ${wire.toPinId}`,
                      voltage,
                      x: midX,
                      y: (start.y + end.y) / 2
                    });
                  }}
                  onMouseLeave={() => setHoveredNode(null)}
                />

                {/* Main Path */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={wire.color}
                  strokeWidth={isPower ? "2.6" : "1.8"}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-all duration-200 group-hover/wire:stroke-[#B4B4B4] group-hover/wire:stroke-[3.5]"
                  filter="url(#circuit-wire-glow)"
                  opacity={0.92}
                />

                {/* Pulsing signal flow */}
                <path
                  d={pathData}
                  fill="none"
                  stroke="rgba(245, 158, 11, 0.45)"
                  strokeWidth="1.5"
                  strokeDasharray="4, 8"
                  strokeLinecap="round"
                  className="animate-pulse"
                />

                {/* End Terminals */}
                <circle cx={start.x} cy={start.y} r="3" fill={wire.color} />
                <circle cx={end.x} cy={end.y} r="3" fill={wire.color} />
                <circle cx={midX} cy={start.y} r="2" fill="#FFFFFF" opacity={0.6} />
              </g>
            );
          })}

          {/* 2. COMPONENTS */}
          {circuit.components.map(comp => {
            const isSelected = selectedComponentId === comp.id;
            const width = 160;
            const height = 180;
            const rot = comp.schematic.rotation || 0;

            return (
              <g
                key={comp.id}
                transform={`translate(${comp.schematic.x}, ${comp.schematic.y}) rotate(${rot}, 80, 90)`}
                className="cursor-pointer"
                onClick={e => {
                  e.stopPropagation();
                  if (onSelectComponent) onSelectComponent(comp);
                }}
              >
                {/* Main Box */}
                <rect
                  x="0"
                  y="0"
                  width={width}
                  height={height}
                  rx="8"
                  fill="#141415"
                  stroke={isSelected ? '#FFFFFF' : '#8F8F8F'}
                  strokeWidth={isSelected ? "2.5" : "1.25"}
                  className="transition-all duration-200 hover:stroke-[#B4B4B4]"
                />

                {/* Header Strip */}
                <rect x="0" y="0" width={width} height="26" rx="8" fill="#1D1D1E" />
                <rect x="0" y="20" width={width} height="6" fill="#1D1D1E" />

                {/* Component Name */}
                <text
                  x="10"
                  y="17"
                  fill="#F5F5F5"
                  fontSize="11"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {comp.displayName.length > 18 ? comp.displayName.slice(0, 16) + '..' : comp.displayName}
                </text>

                {/* Pins */}
                {comp.pins.map(pin => {
                  const isLeft = pin.relativeX <= width / 2;
                  const nodeKey = `${comp.id}_${pin.id}`;
                  const voltage = circuit.telemetry.nodeVoltages[nodeKey] ?? (pin.voltageNominal || 0);

                  return (
                    <g key={pin.id} className="group/pin">
                      <line
                        x1={pin.relativeX}
                        y1={pin.relativeY}
                        x2={isLeft ? pin.relativeX + 10 : pin.relativeX - 10}
                        y2={pin.relativeY}
                        stroke="#8F8F8F"
                        strokeWidth="1.5"
                      />
                      <circle
                        cx={pin.relativeX}
                        cy={pin.relativeY}
                        r="3.5"
                        fill={pin.type === 'ground' ? '#1e293b' : pin.type === 'power' ? '#ef4444' : '#FFFFFF'}
                        stroke="#000000"
                        strokeWidth="1.5"
                      />
                      <text
                        x={isLeft ? pin.relativeX + 14 : pin.relativeX - 14}
                        y={pin.relativeY + 3.5}
                        textAnchor={isLeft ? 'start' : 'end'}
                        fill="#94a3b8"
                        fontSize="9"
                        fontFamily="monospace"
                      >
                        {pin.name}
                      </text>
                      <title>{`${pin.name}: ${voltage.toFixed(2)}V`}</title>
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Floating Node Telemetry Probe */}
      {hoveredNode && (
        <div 
          className="absolute z-30 pointer-events-none bg-[#141415]/95 border border-[#8F8F8F] rounded-[12px] p-2.5 backdrop-blur-md transform -translate-x-1/2 -translate-y-full"
          style={{
            left: `${pan.x + hoveredNode.x * zoom}px`,
            top: `${pan.y + hoveredNode.y * zoom - 10}px`
          }}
        >
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#FFFFFF] font-bold">
            <Activity className="w-3 h-3 text-[#B4B4B4] animate-pulse" />
            <span>PROBED NET VALUE</span>
          </div>
          <div className="text-xs text-[#F5F5F5] font-medium mt-0.5">{hoveredNode.name}</div>
          <div className="text-sm font-bold text-[#F5F5F5] font-mono mt-1">
            {hoveredNode.voltage.toFixed(2)} V
          </div>
        </div>
      )}

      {/* Top Left Title Bar */}
      <div className="absolute top-4 left-4 flex items-center gap-2 bg-[#141415]/85 border border-[#8F8F8F]/35 px-3 py-1.5 rounded-[12px] backdrop-blur-md pointer-events-none">
        <Zap className="w-3.5 h-3.5 text-[#FFFFFF]" />
        <span className="text-xs font-mono font-bold text-[#F5F5F5]">2D Verified Schematic Canvas</span>
        <span className="text-[10px] text-[#B4B4B4] font-mono">
          ({circuit.components.length} parts, {circuit.wires.length} nets)
        </span>
      </div>

      {/* Top Right Tool Action Bar */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <button
          onClick={() => setShowPalette(p => !p)}
          className="px-3 py-1.5 rounded-[12px] bg-[#FFFFFF]/20 border border-[#8F8F8F] hover:bg-[#FFFFFF]/30 text-xs font-mono font-bold text-[#FFFFFF] flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Component</span>
        </button>
      </div>

      {/* Component Palette Modal Dropdown */}
      {showPalette && (
        <div className="absolute top-16 right-4 w-80 bg-[#141415]/95 border border-[#8F8F8F] rounded-[12px] backdrop-blur-md z-40 p-3">
          <div className="flex items-center gap-2 pb-2 border-b border-[#353536]">
            <Search className="w-3.5 h-3.5 text-[#FFFFFF]" />
            <input
              type="text"
              placeholder="Search components, sensors..."
              value={paletteSearch}
              onChange={e => setPaletteSearch(e.target.value)}
              className="w-full bg-transparent text-xs font-mono text-[#F5F5F5] outline-none"
            />
          </div>
          <div className="max-h-60 overflow-y-auto space-y-1.5 mt-2">
            {filteredRegistry.map(item => (
              <div
                key={item.catalogKey}
                onClick={() => {
                  if (onAddComponent) onAddComponent(item.catalogKey);
                  setShowPalette(false);
                }}
                className="p-2 rounded-[12px] bg-white/5 hover:bg-[#FFFFFF]/20 border border-transparent hover:border-[#353536] cursor-pointer transition-colors"
              >
                <div className="text-xs font-bold text-[#F5F5F5] font-mono">{item.displayName}</div>
                <div className="text-[10px] text-[#B4B4B4] font-mono">{item.partNumber} • {item.package}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
