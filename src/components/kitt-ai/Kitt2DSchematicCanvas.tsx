import React, { useState, useRef } from 'react';
import { CanonicalCircuit, CircuitComponent, CircuitConnection } from './types';
import { ZoomIn, ZoomOut, RotateCcw, Crosshair, Zap, Activity } from 'lucide-react';

interface Kitt2DSchematicCanvasProps {
  circuit: CanonicalCircuit;
  onSelectComponent?: (comp: CircuitComponent | null) => void;
}

export const Kitt2DSchematicCanvas: React.FC<Kitt2DSchematicCanvasProps> = ({
  circuit,
  onSelectComponent
}) => {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 40, y: 30 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<{ id: string; name: string; voltage: number; x: number; y: number } | null>(null);
  const [selectedCompId, setSelectedCompId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'BUTTON' || (e.target as HTMLElement).closest('button')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => setZoom(z => Math.min(2.0, Number((z + 0.15).toFixed(2))));
  const handleZoomOut = () => setZoom(z => Math.max(0.5, Number((z - 0.15).toFixed(2))));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 40, y: 30 });
  };

  // Helper: Find absolute pin coordinates for orthogonal wire routing
  const getPinAbsolutePos = (componentId: string, pinId: string) => {
    const comp = circuit.components.find(c => c.id === componentId);
    if (!comp) return { x: 0, y: 0 };
    const pin = comp.pins.find(p => p.id === pinId);
    if (!pin) return { x: comp.schematic.x, y: comp.schematic.y };

    return {
      x: comp.schematic.x + pin.relativeX,
      y: comp.schematic.y + pin.relativeY
    };
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full bg-[#080f14] overflow-hidden select-none cursor-grab active:cursor-grabbing border border-[#A58D66]/20 rounded-xl"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Background Engineering Grid (Dot & Accent Grid) */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-25"
        style={{
          backgroundImage: `
            radial-gradient(circle at 1px 1px, #A58D66 1px, transparent 0),
            linear-gradient(to right, rgba(64,126,140,0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(64,126,140,0.08) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px, 120px 120px, 120px 120px'
        }}
      />

      {/* Viewport Transform Layer */}
      <div 
        className="absolute inset-0 origin-top-left transition-transform duration-75"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`
        }}
      >
        <svg className="w-[1800px] h-[1200px] overflow-visible pointer-events-auto">
          <defs>
            {/* Glow Filter for Active Wires */}
            <filter id="wire-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            
            {/* Ground Symbol Pattern */}
            <marker id="dot-junction" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6">
              <circle cx="5" cy="5" r="4" fill="#A58D66" />
            </marker>
          </defs>

          {/* 1. ORTHOGONAL SCHEMATIC WIRES */}
          {circuit.connections.map(conn => {
            const start = getPinAbsolutePos(conn.fromComponentId, conn.fromPinId);
            const end = getPinAbsolutePos(conn.toComponentId, conn.toPinId);

            // Compute Manhattan (Orthogonal) routing path with midpoint bend
            const midX = start.x + (end.x - start.x) * 0.5;
            const pathData = `M ${start.x} ${start.y} L ${midX} ${start.y} L ${midX} ${end.y} L ${end.x} ${end.y}`;

            const isPower = conn.signalType === 'POWER_VCC';
            const isGnd = conn.signalType === 'GROUND';

            return (
              <g key={conn.id} className="group/wire cursor-pointer">
                {/* Wide invisible hit-target for hover */}
                <path
                  d={pathData}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="14"
                  onMouseEnter={() => {
                    setHoveredNode({
                      id: conn.id,
                      name: conn.label || `${conn.fromPinId} ➔ ${conn.toPinId}`,
                      voltage: conn.liveVoltage ?? (isPower ? circuit.telemetry.supplyVoltage : 0),
                      x: midX,
                      y: (start.y + end.y) / 2
                    });
                  }}
                  onMouseLeave={() => setHoveredNode(null)}
                />

                {/* Wire Path */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={conn.wireColor}
                  strokeWidth={isPower ? "2.5" : "1.75"}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-all duration-200 group-hover/wire:stroke-[#76B4C2] group-hover/wire:stroke-[3.5]"
                  filter="url(#wire-glow)"
                  opacity={0.9}
                />

                {/* Start & End Terminal Dots */}
                <circle cx={start.x} cy={start.y} r="3" fill={conn.wireColor} />
                <circle cx={end.x} cy={end.y} r="3" fill={conn.wireColor} />
                
                {/* Mid-route Junction Node */}
                <circle cx={midX} cy={start.y} r="2.5" fill="#A58D66" opacity={0.7} />
              </g>
            );
          })}

          {/* 2. SCHEMATIC COMPONENTS */}
          {circuit.components.map(comp => {
            const isSelected = selectedCompId === comp.id;
            const width = 160;
            const height = 180;

            return (
              <g 
                key={comp.id}
                transform={`translate(${comp.schematic.x}, ${comp.schematic.y})`}
                className="cursor-pointer"
                onClick={() => {
                  setSelectedCompId(comp.id);
                  if (onSelectComponent) onSelectComponent(comp);
                }}
              >
                {/* Component Body Box */}
                <rect
                  x="0"
                  y="0"
                  width={width}
                  height={height}
                  rx="8"
                  fill="#0c161c"
                  stroke={isSelected ? '#A58D66' : '#407E8C'}
                  strokeWidth={isSelected ? "2.5" : "1.25"}
                  className="transition-all duration-200 hover:stroke-[#76B4C2] shadow-2xl"
                />

                {/* Header Strip */}
                <rect
                  x="0"
                  y="0"
                  width={width}
                  height="26"
                  rx="8"
                  fill="#12222b"
                />
                <rect
                  x="0"
                  y="20"
                  width={width}
                  height="6"
                  fill="#12222b"
                />

                {/* Component Name */}
                <text
                  x="10"
                  y="17"
                  fill="#E5E1DD"
                  fontSize="11"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {comp.name.length > 18 ? comp.name.slice(0, 16) + '..' : comp.name}
                </text>

                {/* Package / Value Badge */}
                {comp.value && (
                  <text
                    x={width - 10}
                    y="17"
                    textAnchor="end"
                    fill="#A58D66"
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {comp.value}
                  </text>
                )}

                {/* Pins and Labels */}
                {comp.pins.map(pin => {
                  const isLeft = pin.relativeX <= width / 2;
                  const nodeKey = `${comp.id}_${pin.id}`;
                  const voltage = circuit.telemetry.nodeVoltages[nodeKey] ?? (pin.voltage || 0);

                  return (
                    <g key={pin.id} className="group/pin">
                      {/* Pin stub line */}
                      <line
                        x1={pin.relativeX}
                        y1={pin.relativeY}
                        x2={isLeft ? pin.relativeX + 10 : pin.relativeX - 10}
                        y2={pin.relativeY}
                        stroke="#407E8C"
                        strokeWidth="1.5"
                      />

                      {/* Pin Terminal Circle */}
                      <circle
                        cx={pin.relativeX}
                        cy={pin.relativeY}
                        r="3.5"
                        fill={pin.type === 'ground' ? '#1e293b' : pin.type === 'power' ? '#ef4444' : '#A58D66'}
                        stroke="#080f14"
                        strokeWidth="1.5"
                        className="group-hover/pin:scale-150 transition-transform"
                      />

                      {/* Pin Name Label */}
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

                      {/* Voltage Display on Hover */}
                      <title>{`${pin.name}: ${voltage.toFixed(2)}V`}</title>
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Floating Voltage Probe Tooltip */}
      {hoveredNode && (
        <div 
          className="absolute z-30 pointer-events-none bg-[#0c161c]/95 border border-[#A58D66]/60 rounded-lg p-2.5 shadow-2xl backdrop-blur-md transform -translate-x-1/2 -translate-y-full"
          style={{
            left: `${pan.x + hoveredNode.x * zoom}px`,
            top: `${pan.y + hoveredNode.y * zoom - 10}px`
          }}
        >
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#A58D66] font-bold">
            <Activity className="w-3 h-3 text-[#76B4C2] animate-pulse" />
            <span>NODE TELEMETRY</span>
          </div>
          <div className="text-xs text-[#E5E1DD] font-medium mt-0.5">{hoveredNode.name}</div>
          <div className="text-sm font-bold text-[#10b981] font-mono mt-1">
            {hoveredNode.voltage.toFixed(2)} V
          </div>
        </div>
      )}

      {/* Navigation Controls Bar (Zoom In, Zoom Out, Reset) */}
      <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-[#0c161c]/90 border border-[#A58D66]/30 p-1.5 rounded-lg shadow-xl backdrop-blur-md z-20">
        <button
          onClick={handleZoomIn}
          className="p-1.5 text-[#E5E1DD]/80 hover:text-[#E5E1DD] hover:bg-[#A58D66]/20 rounded transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-1.5 text-[#E5E1DD]/80 hover:text-[#E5E1DD] hover:bg-[#A58D66]/20 rounded transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleResetView}
          className="p-1.5 text-[#E5E1DD]/80 hover:text-[#E5E1DD] hover:bg-[#A58D66]/20 rounded transition-colors"
          title="Reset View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <span className="text-[11px] font-mono text-[#A58D66] px-1 font-bold">
          {Math.round(zoom * 100)}%
        </span>
      </div>

      {/* Canvas Mode Stamp */}
      <div className="absolute top-4 left-4 flex items-center gap-2 bg-[#0c161c]/80 border border-[#407E8C]/30 px-3 py-1.5 rounded-lg backdrop-blur-md">
        <Zap className="w-3.5 h-3.5 text-[#A58D66]" />
        <span className="text-xs font-mono font-bold text-[#E5E1DD]">2D IEEE Canonical Schematic</span>
        <span className="text-[10px] text-[#76B4C2] font-mono">({circuit.components.length} components, {circuit.connections.length} nets)</span>
      </div>
    </div>
  );
};
