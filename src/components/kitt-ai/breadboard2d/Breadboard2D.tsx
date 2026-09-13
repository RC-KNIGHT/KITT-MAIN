import React, { useState, useRef } from 'react';
import { CanonicalCircuitModel, CIRComponent } from '../cir/cirTypes';

interface Breadboard2DProps {
  circuit: CanonicalCircuitModel;
  onSelectComponent?: (comp: CIRComponent | null) => void;
  onAddComponent?: (partKey: string) => void;
  onDeleteComponent?: (compId: string) => void;
  onRotateComponent?: (compId: string) => void;
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
  wireColor?: string;
  selectedComponentId?: string | null;
  breadboardSize?: 'mini' | 'medium' | 'large';
}

export const Breadboard2D: React.FC<Breadboard2DProps> = ({
  circuit,
  onSelectComponent,
  onAddComponent,
  onDeleteComponent,
  onRotateComponent,
  zoom: externalZoom,
  onZoomChange,
  wireColor = '#10b981',
  selectedComponentId,
  breadboardSize = 'medium'
}) => {
  const [internalZoom, setInternalZoom] = useState(0.85);
  const zoom = externalZoom !== undefined ? externalZoom : internalZoom;

  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredHole, setHoveredHole] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Sizing specs
  const rows = breadboardSize === 'mini' ? 17 : breadboardSize === 'medium' ? 30 : 63;
  const hasRails = breadboardSize !== 'mini';

  // Breadboard Geometry Dimensions (Vertical orientation matching screenshot media_1789195367408.png)
  const boardWidth = 340;
  const rowSpacing = 16;
  const boardHeight = Math.max(540, (rows + 4) * rowSpacing);

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

  // Column X Coordinates on the breadboard
  // Rails: Left -, Left + | a b c d e | Center Groove | f g h i j | Right + , Right -
  const colCoords: Record<string, number> = {
    rail_left_neg: 24,
    rail_left_pos: 42,
    a: 80,
    b: 98,
    c: 116,
    d: 134,
    e: 152,
    f: 188,
    g: 206,
    h: 224,
    i: 242,
    j: 260,
    rail_right_pos: 298,
    rail_right_neg: 316
  };

  const getHoleY = (row: number) => 40 + (row - 1) * rowSpacing;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-[#080f14] overflow-hidden select-none cursor-grab active:cursor-grabbing flex items-center justify-center"
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
            radial-gradient(circle at 1px 1px, #A58D66 1px, transparent 0),
            linear-gradient(to right, rgba(64,126,140,0.06) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(64,126,140,0.06) 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px, 120px 120px, 120px 120px'
        }}
      />

      {/* 2D Solderless Breadboard Viewport */}
      <div 
        className={`origin-center ${isDragging ? '' : 'transition-transform duration-100 ease-out'}`}
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`
        }}
      >
        <svg 
          width={boardWidth} 
          height={boardHeight} 
          viewBox={`0 0 ${boardWidth} ${boardHeight}`}
          className="overflow-visible filter drop-shadow-[0_15px_35px_rgba(0,0,0,0.85)]"
        >
          {/* Breadboard Base Shell (Off-White ABS Plastic) */}
          <rect
            x="0"
            y="0"
            width={boardWidth}
            height={boardHeight}
            rx="12"
            fill="#f8fafc"
            stroke="#cbd5e1"
            strokeWidth="1.5"
          />

          {/* Center Divider Trough Groove */}
          <rect
            x="166"
            y="14"
            width="8"
            height={boardHeight - 28}
            rx="3"
            fill="#e2e8f0"
            stroke="#cbd5e1"
            strokeWidth="0.5"
          />

          {/* Power Rails (Left & Right) */}
          {hasRails && (
            <>
              {/* Left Blue (-) Rail */}
              <line x1="24" y1="30" x2="24" y2={boardHeight - 30} stroke="#3b82f6" strokeWidth="1.5" />
              <text x="24" y="24" fill="#3b82f6" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">-</text>
              <text x="24" y={boardHeight - 16} fill="#3b82f6" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">-</text>

              {/* Left Red (+) Rail */}
              <line x1="42" y1="30" x2="42" y2={boardHeight - 30} stroke="#ef4444" strokeWidth="1.5" />
              <text x="42" y="24" fill="#ef4444" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">+</text>
              <text x="42" y={boardHeight - 16} fill="#ef4444" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">+</text>

              {/* Right Red (+) Rail */}
              <line x1="298" y1="30" x2="298" y2={boardHeight - 30} stroke="#ef4444" strokeWidth="1.5" />
              <text x="298" y="24" fill="#ef4444" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">+</text>
              <text x="298" y={boardHeight - 16} fill="#ef4444" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">+</text>

              {/* Right Blue (-) Rail */}
              <line x1="316" y1="30" x2="316" y2={boardHeight - 30} stroke="#3b82f6" strokeWidth="1.5" />
              <text x="316" y="24" fill="#3b82f6" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">-</text>
              <text x="316" y={boardHeight - 16} fill="#3b82f6" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">-</text>
            </>
          )}

          {/* Column Letter Labels (a b c d e | f g h i j) */}
          {['a', 'b', 'c', 'd', 'e'].map(col => (
            <React.Fragment key={col}>
              <text x={colCoords[col]} y="28" fill="#64748b" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                {col}
              </text>
              <text x={colCoords[col]} y={boardHeight - 20} fill="#64748b" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                {col}
              </text>
            </React.Fragment>
          ))}

          {['f', 'g', 'h', 'i', 'j'].map(col => (
            <React.Fragment key={col}>
              <text x={colCoords[col]} y="28" fill="#64748b" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                {col}
              </text>
              <text x={colCoords[col]} y={boardHeight - 20} fill="#64748b" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                {col}
              </text>
            </React.Fragment>
          ))}

          {/* Pin Tie-Points Holes & Row Numbers */}
          {Array.from({ length: rows }).map((_, idx) => {
            const rowNum = idx + 1;
            const y = getHoleY(rowNum);
            const showRowLabel = rowNum === 1 || rowNum % 5 === 0;

            return (
              <g key={rowNum}>
                {/* Row Number (left & right of columns) */}
                {showRowLabel && (
                  <>
                    <text x="64" y={y + 3} fill="#64748b" fontSize="8" fontWeight="bold" textAnchor="end" fontFamily="monospace">
                      {rowNum}
                    </text>
                    <text x="276" y={y + 3} fill="#64748b" fontSize="8" fontWeight="bold" textAnchor="start" fontFamily="monospace">
                      {rowNum}
                    </text>
                  </>
                )}

                {/* Left Rails Holes */}
                {hasRails && (
                  <>
                    <circle cx="24" cy={y} r="2.2" fill="#0f172a" stroke="#cbd5e1" strokeWidth="0.8" />
                    <circle cx="42" cy={y} r="2.2" fill="#0f172a" stroke="#cbd5e1" strokeWidth="0.8" />
                  </>
                )}

                {/* Columns a-e */}
                {['a', 'b', 'c', 'd', 'e'].map(col => (
                  <circle
                    key={col}
                    cx={colCoords[col]}
                    cy={y}
                    r="2.4"
                    fill="#0f172a"
                    stroke="#94a3b8"
                    strokeWidth="0.8"
                    className="hover:fill-[#2dd4bf] hover:r-[3.2] transition-all cursor-crosshair"
                    onMouseEnter={() => setHoveredHole(`${col}${rowNum}`)}
                    onMouseLeave={() => setHoveredHole(null)}
                  />
                ))}

                {/* Columns f-j */}
                {['f', 'g', 'h', 'i', 'j'].map(col => (
                  <circle
                    key={col}
                    cx={colCoords[col]}
                    cy={y}
                    r="2.4"
                    fill="#0f172a"
                    stroke="#94a3b8"
                    strokeWidth="0.8"
                    className="hover:fill-[#2dd4bf] hover:r-[3.2] transition-all cursor-crosshair"
                    onMouseEnter={() => setHoveredHole(`${col}${rowNum}`)}
                    onMouseLeave={() => setHoveredHole(null)}
                  />
                ))}

                {/* Right Rails Holes */}
                {hasRails && (
                  <>
                    <circle cx="298" cy={y} r="2.2" fill="#0f172a" stroke="#cbd5e1" strokeWidth="0.8" />
                    <circle cx="316" cy={y} r="2.2" fill="#0f172a" stroke="#cbd5e1" strokeWidth="0.8" />
                  </>
                )}
              </g>
            );
          })}

          {/* 1. Jumper Wires */}
          {circuit.wires.map(wire => {
            const fromComp = circuit.components.find(c => c.id === wire.fromComponentId);
            const toComp = circuit.components.find(c => c.id === wire.toComponentId);
            if (!fromComp || !toComp) return null;

            const fromRow = Math.min(rows, Math.max(1, fromComp.physical.anchorRow));
            const toRow = Math.min(rows, Math.max(1, toComp.physical.anchorRow));
            const fromCol = fromComp.physical.anchorCol in colCoords ? fromComp.physical.anchorCol : 'c';
            const toCol = toComp.physical.anchorCol in colCoords ? toComp.physical.anchorCol : 'g';

            const startX = colCoords[fromCol] || 100;
            const startY = getHoleY(fromRow);
            const endX = colCoords[toCol] || 200;
            const endY = getHoleY(toRow);

            const dx = endX - startX;
            const dy = endY - startY;
            const cx1 = startX + dx * 0.2 - 25;
            const cy1 = startY + dy * 0.5 - 20;
            const cx2 = startX + dx * 0.8 - 25;
            const cy2 = startY + dy * 0.5 - 20;

            const wColor = wire.color || wireColor || '#10b981';

            return (
              <g key={wire.id} className="cursor-pointer group/wire">
                {/* Wire Shadow */}
                <path
                  d={`M ${startX} ${startY} C ${cx1} ${cy1 + 6}, ${cx2} ${cy2 + 6}, ${endX} ${endY}`}
                  fill="none"
                  stroke="rgba(0,0,0,0.35)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                {/* Wire Body */}
                <path
                  d={`M ${startX} ${startY} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${endX} ${endY}`}
                  fill="none"
                  stroke={wColor}
                  strokeWidth="3.0"
                  strokeLinecap="round"
                  className="group-hover/wire:stroke-[#DFCCA8] transition-colors"
                />
                {/* Terminal Pins */}
                <circle cx={startX} cy={startY} r="3" fill="#1e293b" stroke={wColor} strokeWidth="1.5" />
                <circle cx={endX} cy={endY} r="3" fill="#1e293b" stroke={wColor} strokeWidth="1.5" />
              </g>
            );
          })}

          {/* 2. Placed Components */}
          {circuit.components.map(comp => {
            const isSelected = selectedComponentId === comp.id;
            const row = Math.min(rows, Math.max(1, comp.physical.anchorRow));
            const col = comp.physical.anchorCol in colCoords ? comp.physical.anchorCol : 'c';
            const x = colCoords[col] || 116;
            const y = getHoleY(row);

            return (
              <g
                key={comp.id}
                transform={`translate(${x}, ${y})`}
                className="cursor-pointer"
                onClick={e => {
                  e.stopPropagation();
                  if (onSelectComponent) onSelectComponent(comp);
                }}
              >
                {/* Component Graphic Representation */}
                {comp.category === 'passive' ? (
                  // Axial Resistor with color bands
                  <g>
                    {/* Metal leads */}
                    <line x1="0" y1="0" x2="0" y2="48" stroke="#94a3b8" strokeWidth="1.8" />
                    {/* Ceramic body */}
                    <rect
                      x="-6"
                      y="12"
                      width="12"
                      height="24"
                      rx="3"
                      fill="#d97706"
                      stroke={isSelected ? '#2dd4bf' : '#78350f'}
                      strokeWidth={isSelected ? '2' : '1'}
                      className="filter drop-shadow-md"
                    />
                    {/* Color Bands */}
                    <rect x="-6" y="16" width="12" height="2.5" fill="#ef4444" />
                    <rect x="-6" y="21" width="12" height="2.5" fill="#10b981" />
                    <rect x="-6" y="26" width="12" height="2.5" fill="#f59e0b" />
                    <rect x="-6" y="31" width="12" height="2.5" fill="#eab308" />
                  </g>
                ) : comp.category === 'semiconductor' || comp.category === 'ic' ? (
                  // DIP IC straddling the center trough
                  <g transform="translate(-16, -10)">
                    <rect
                      x="0"
                      y="0"
                      width="32"
                      height="48"
                      rx="3"
                      fill="#1e293b"
                      stroke={isSelected ? '#2dd4bf' : '#475569'}
                      strokeWidth={isSelected ? '2' : '1'}
                      className="filter drop-shadow-lg"
                    />
                    {/* Notch */}
                    <circle cx="16" cy="4" r="3" fill="#0f172a" />
                    <text x="16" y="26" fill="#94a3b8" fontSize="7" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                      {comp.displayName.slice(0, 6)}
                    </text>
                    {/* Pins */}
                    {[-1, 1].map((side, sIdx) =>
                      [6, 18, 30, 42].map((py, pIdx) => (
                        <rect
                          key={`${sIdx}-${pIdx}`}
                          x={side === -1 ? -4 : 32}
                          y={py}
                          width="4"
                          height="2"
                          fill="#94a3b8"
                        />
                      ))
                    )}
                  </g>
                ) : (
                  // General module / sensor
                  <g transform="translate(-20, -12)">
                    <rect
                      x="0"
                      y="0"
                      width="40"
                      height="24"
                      rx="4"
                      fill="#0f172a"
                      stroke={isSelected ? '#2dd4bf' : '#334155'}
                      strokeWidth={isSelected ? '2' : '1'}
                      className="filter drop-shadow-md"
                    />
                    <text x="20" y="15" fill="#E5E1DD" fontSize="7" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                      {comp.displayName.slice(0, 7)}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Hovered Hole Tooltip */}
      {hoveredHole && (
        <div className="absolute bottom-4 left-4 z-20 px-2 py-1 rounded bg-[#0c161d]/90 border border-white/10 text-[11px] font-mono text-[#2dd4bf] pointer-events-none shadow-md">
          Hole: {hoveredHole.toUpperCase()}
        </div>
      )}
    </div>
  );
};
