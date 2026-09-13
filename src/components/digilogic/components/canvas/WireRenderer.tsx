/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CircuitComponent, LogicState, Wire } from '../../types/circuit';
import { THEME_PRESETS } from '../../theme/themes';
import { CollaboratorUser } from '../../types/collaboration';
import {
  generateOrthogonalPathWithJumpers,
  getEffectiveWireStartPos,
  getPortCanvasPos,
} from '../../engine/wireRouting';

export interface WireRendererProps {
  wire: Wire;
  fromComponent: CircuitComponent;
  toComponent: CircuitComponent;
  state: LogicState;
  isSelected: boolean;
  routingMode: 'orthogonal' | 'curved' | 'straight';
  signalAnimation: boolean;
  theme?: string;
  colorMode?: 'dark' | 'light';
  selectingUsers?: CollaboratorUser[];
  isDraftingWire?: boolean;
  hasBranches?: boolean;
  wireJumpers?: { [segIndex: number]: number[] };
  allWires?: Wire[];
  allComponents?: CircuitComponent[];
  onSelect: (e: React.MouseEvent) => void;
  onDelete: () => void;
  onBranchWire?: (pos: { x: number; y: number }) => void;
  onStartWireBranch?: (e: React.MouseEvent | React.TouchEvent, pos: { x: number; y: number }) => void;
}

export const WireRenderer: React.FC<WireRendererProps> = React.memo(({
  wire,
  fromComponent,
  toComponent,
  state,
  isSelected,
  routingMode,
  signalAnimation,
  theme = 'kitt_sovereign',
  colorMode = 'dark',
  selectingUsers = [],
  isDraftingWire = false,
  hasBranches,
  wireJumpers,
  allWires,
  allComponents,
  onSelect,
  onDelete,
  onBranchWire,
  onStartWireBranch,
}) => {
  const activeTheme = THEME_PRESETS[theme as keyof typeof THEME_PRESETS] || THEME_PRESETS.kitt_sovereign;
  const isLight = colorMode === 'light' || theme === 'light';
  const primarySelectingUser = selectingUsers[0];

  // Defensive check for components and ports
  if (!fromComponent || !toComponent || !Array.isArray(fromComponent.ports) || !Array.isArray(toComponent.ports)) {
    return null;
  }

  // Find ports
  const fromPort = fromComponent.ports.find((p) => p && p.id === wire.fromPortId);
  const toPort = toComponent.ports.find((p) => p && p.id === wire.toPortId);

  if (!fromPort || !toPort) return null;

  // Calculate start and end coordinates
  const comps = allComponents && allComponents.length > 0 ? allComponents : [fromComponent, toComponent];
  const start = getEffectiveWireStartPos(wire, comps, allWires || []);
  const end = getPortCanvasPos(toComponent, toPort);
  const midPoint = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };

  // Generate SVG path string based on routing mode
  const generatePath = (): string => {
    if (routingMode === 'straight') {
      return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;
    }

    if (routingMode === 'curved') {
      if (end.x > start.x + 15) {
        // Forward stylish cubic bezier curve
        const dx = Math.max(Math.abs(end.x - start.x) * 0.52, 35);
        return `M ${start.x} ${start.y} C ${start.x + dx} ${start.y}, ${end.x - dx} ${end.y}, ${end.x} ${end.y}`;
      } else {
        // Smooth loop-back bezier curve
        const dy = end.y - start.y;
        const loopRadius = Math.max(Math.abs(dy) * 0.35, 45);
        const loopY = dy >= 0 ? start.y - loopRadius : start.y + loopRadius;
        return `M ${start.x} ${start.y} C ${start.x + 50} ${start.y}, ${start.x + 50} ${loopY}, ${(start.x + end.x) / 2} ${loopY} C ${end.x - 50} ${loopY}, ${end.x - 50} ${end.y}, ${end.x} ${end.y}`;
      }
    }

    // Default Orthogonal routing with textbook jumpers at crossing intersections
    return generateOrthogonalPathWithJumpers(wire.id, start, end, wireJumpers);
  };

  const pathD = generatePath();

  // Color coding based on digital state and active theme
  let strokeColor = activeTheme.wireLowColor || '#1d2c38'; // 0 / Low: theme low color
  let glowColor = 'none';

  // Determine base colors from logical wire types
  const customColorType = wire.color || 'default';
  
  if (customColorType === 'power') {
    strokeColor = state === 1 ? '#A58D66' : '#1d2c38';
    glowColor = state === 1 ? 'rgba(165, 141, 102, 0.45)' : 'none';
  } else if (customColorType === 'ground') {
    strokeColor = state === 1 ? (isLight ? '#334155' : '#76B4C2') : (isLight ? '#64748b' : '#1d2c38'); // Sovereign ground
    glowColor = state === 1 ? (isLight ? 'rgba(51, 65, 85, 0.25)' : 'rgba(118, 180, 194, 0.3)') : 'none';
  } else if (customColorType === 'signal') {
    strokeColor = state === 1 ? activeTheme.secondaryColor : activeTheme.wireLowColor;
    glowColor = state === 1 ? activeTheme.wireGlowColor : 'none';
  } else {
    // default
    if (state === 1) {
      strokeColor = activeTheme.wireHighColor; // Vibrant theme high color
      glowColor = activeTheme.wireGlowColor;
    }
  }

  if (state === 'Z') {
    strokeColor = '#DFCCA8'; // High-Z: soft sand gold
  } else if (state === 'X') {
    strokeColor = '#A58D66'; // Error / Conflict: antique gold
    glowColor = 'rgba(165, 141, 102, 0.5)';
  }

  if (isSelected) {
    strokeColor = activeTheme.secondaryColor || '#DFCCA8'; // Light Gold selection
    glowColor = activeTheme.wireGlowColor || 'rgba(165, 141, 102, 0.4)';
  } else if (primarySelectingUser) {
    strokeColor = primarySelectingUser.color; // Collaborator selection color
  }

  return (
    <g className="cursor-pointer group">
      {/* Invisible thick stroke for easy wire selecting, hovering, dragging, and branching */}
      <path
        d={pathD}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        className="pointer-events-auto"
        onClick={onSelect}
        onMouseDown={(e) => {
          if (!isDraftingWire && e.button === 0 && onStartWireBranch) {
            onStartWireBranch(e, midPoint);
          }
        }}
        onTouchStart={(e) => {
          if (!isDraftingWire && onStartWireBranch) {
            onStartWireBranch(e, midPoint);
          }
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          onBranchWire?.(midPoint);
        }}
      />

      {/* Glow shadow for HIGH state */}
      {state === 1 && (
        <path
          d={pathD}
          fill="none"
          stroke={glowColor}
          strokeWidth={6.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="pointer-events-none"
        />
      )}

      {/* Base wire stroke */}
      <path
        d={pathD}
        fill="none"
        stroke={strokeColor}
        strokeWidth={isSelected ? 3.8 : 2.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-colors duration-150 pointer-events-none"
      />

      {/* Flowing animated signal dashes for HIGH state */}
      {state === 1 && signalAnimation && (
        <path
          d={pathD}
          fill="none"
          stroke={activeTheme.secondaryColor}
          strokeWidth={2}
          strokeDasharray="6, 8"
          strokeLinecap="round"
          className="animate-wire-flow pointer-events-none"
        />
      )}

      {/* Electrical Schematic Branch Slanting Line Marker (rendered at branch connection point) */}
      {wire.branchStartPos && (
        <g className="pointer-events-none transition-colors duration-150">
          <line
            x1={start.x - 4.5}
            y1={start.y + 4.5}
            x2={start.x + 4.5}
            y2={start.y - 4.5}
            stroke={strokeColor}
            strokeWidth={1.5}
            strokeLinecap="round"
          />
        </g>
      )}

      {/* Multi-branch fan-out slanting line marker from source port */}
      {!wire.branchStartPos && hasBranches && (
        <g className="pointer-events-none transition-colors duration-150">
          <line
            x1={start.x + 10 - 4.5}
            y1={start.y + 4.5}
            x2={start.x + 10 + 4.5}
            y2={start.y - 4.5}
            stroke={strokeColor}
            strokeWidth={1.5}
            strokeLinecap="round"
          />
        </g>
      )}

      {/* Remote Collaborators Selection Initial Badges on Wire */}
      {selectingUsers.length > 0 && (
        <g transform={`translate(${midPoint.x}, ${midPoint.y})`} className="pointer-events-none select-none">
          {selectingUsers.map((user, idx) => (
            <g key={user.id} transform={`translate(${idx * 20}, 0)`}>
              <circle
                cx={0}
                cy={0}
                r={9}
                fill={user.color}
                stroke={isLight ? '#ffffff' : '#080f14'}
                strokeWidth={1.8}
                className="shadow-lg"
              />
              <text
                x={0}
                y={0}
                dominantBaseline="central"
                textAnchor="middle"
                fill="#ffffff"
                fontSize={9}
                fontWeight="900"
                fontFamily="sans-serif"
              >
                {user.initial || user.name.charAt(0).toUpperCase()}
              </text>
              {/* Tooltip */}
              <g transform="translate(0, -15)" className="opacity-90">
                <rect
                  x={-Math.max(14, user.name.length * 3.2 + 5)}
                  y={-6}
                  width={Math.max(28, user.name.length * 6.4 + 10)}
                  height={12}
                  rx={3}
                  fill={isLight ? '#ffffff' : '#080f14'}
                  stroke={user.color}
                  strokeWidth={0.8}
                />
                <text
                  x={0}
                  y={0}
                  dominantBaseline="central"
                  textAnchor="middle"
                  fill={isLight ? '#0d171f' : '#E5E1DD'}
                  fontSize={7.5}
                  fontWeight="bold"
                >
                  {user.name}
                </text>
              </g>
            </g>
          ))}
        </g>
      )}

      {/* Wire Branch Hover Node Indicator (allows visual tapping into wire) */}
      <g className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none hidden md:block">
        <circle
          cx={midPoint.x}
          cy={midPoint.y}
          r={5}
          fill={activeTheme.primaryColor || '#A58D66'}
          stroke="#ffffff"
          strokeWidth={1.5}
        />
      </g>
    </g>
  );
});
