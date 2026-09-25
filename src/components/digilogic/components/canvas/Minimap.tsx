/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useCircuit } from '../../context/CircuitContext';
import { ChevronDown, ChevronUp, MapPin } from 'lucide-react';

export const Minimap: React.FC = () => {
  const { components, camera, setCamera, colorMode } = useCircuit();
  const [collapsed, setCollapsed] = useState(false);
  const isLight = colorMode === 'light';

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className={`absolute bottom-4 right-4 z-20 p-2 rounded-lg shadow-xl backdrop-blur-sm transition-colors border ${
          isLight
            ? 'bg-white/95 border-slate-300 text-slate-600 hover:text-[#A58D66] shadow-[0_4px_20px_rgba(0,0,0,0.1)]'
            : 'bg-[#0d171f]/95 border-[#A58D66]/25 text-[#DFCCA8] hover:text-[#E5E1DD]'
        }`}
        title="Open Minimap"
      >
        <MapPin className="w-4 h-4 text-[#A58D66]" />
      </button>
    );
  }

  // Calculate bounding box of all components
  const minX = components.length > 0 ? Math.min(...components.map((c) => c.x)) - 100 : -500;
  const maxX = components.length > 0 ? Math.max(...components.map((c) => c.x + 100)) + 100 : 500;
  const minY = components.length > 0 ? Math.min(...components.map((c) => c.y)) - 100 : -500;
  const maxY = components.length > 0 ? Math.max(...components.map((c) => c.y + 100)) + 100 : 500;

  const worldWidth = Math.max(800, maxX - minX);
  const worldHeight = Math.max(600, maxY - minY);

  const mapWidth = 160;
  const mapHeight = 110;
  const scale = Math.min(mapWidth / worldWidth, mapHeight / worldHeight);

  // Viewport rectangle in minimap space
  const vpX = (-camera.x - minX) * scale;
  const vpY = (-camera.y - minY) * scale;
  const vpWidth = (window.innerWidth / camera.zoom) * scale;
  const vpHeight = (window.innerHeight / camera.zoom) * scale;

  const handleMinimapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const targetWorldX = clickX / scale + minX;
    const targetWorldY = clickY / scale + minY;

    setCamera((prev) => ({
      ...prev,
      x: -(targetWorldX - window.innerWidth / 2 / prev.zoom),
      y: -(targetWorldY - window.innerHeight / 2 / prev.zoom),
    }));
  };

  return (
    <div
      className={`absolute bottom-4 right-4 z-20 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md border transition-colors ${
        isLight
          ? 'bg-white/95 border-slate-300 shadow-[0_8px_30px_rgba(0,0,0,0.12)]'
          : 'bg-[#0d171f]/95 border-[#A58D66]/25'
      }`}
    >
      <div
        className={`flex items-center justify-between px-2.5 py-1 border-b text-[11px] font-medium transition-colors ${
          isLight
            ? 'bg-slate-100 border-slate-200 text-slate-700'
            : 'bg-[#080f14] border-[#A58D66]/20 text-[#DFCCA8]'
        }`}
      >
        <span>Minimap ({components.length} gates)</span>
        <button
          onClick={() => setCollapsed(true)}
          className={`p-0.5 transition-colors ${
            isLight ? 'text-slate-500 hover:text-slate-700' : 'text-[#DFCCA8] hover:text-[#E5E1DD]'
          }`}
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      <svg
        width={mapWidth}
        height={mapHeight}
        className={`cursor-crosshair transition-colors ${
          isLight ? 'bg-slate-50' : 'bg-[#080f14]'
        }`}
        onClick={handleMinimapClick}
      >
        {/* Render component mini rectangles */}
        {components.map((c) => {
          const cx = (c.x - minX) * scale;
          const cy = (c.y - minY) * scale;
          return (
            <rect
              key={c.id}
              x={cx}
              y={cy}
              width={Math.max(4, 30 * scale)}
              height={Math.max(3, 20 * scale)}
              rx={1}
              fill="#A58D66"
              opacity={0.85}
            />
          );
        })}

        {/* Viewport Frame */}
        <rect
          x={vpX}
          y={vpY}
          width={vpWidth}
          height={vpHeight}
          fill="rgba(165, 141, 102, 0.15)"
          stroke="#A58D66"
          strokeWidth={1.5}
        />
      </svg>
    </div>
  );
};
