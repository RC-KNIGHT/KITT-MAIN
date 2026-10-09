/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CircuitComponent, LogicState, Port, ThemePreset } from '../../types/circuit';
import { COMPONENT_METADATA } from '../../engine/componentFactory';
import { THEME_PRESETS } from '../../theme/themes';
import { CollaboratorUser } from '../../types/collaboration';

export interface ComponentRendererProps {
  component: CircuitComponent;
  portValues: Record<string, LogicState>;
  isSelected: boolean;
  theme?: string;
  colorMode?: 'dark' | 'light';
  wireDraftFromCompId?: string | null;
  selectingUsers?: CollaboratorUser[];
  onMouseDown: (e: React.MouseEvent) => void;
  onTouchStart?: (e: React.TouchEvent) => void;
  onPortMouseDown: (e: React.MouseEvent, port: Port) => void;
  onPortMouseUp?: (e: React.MouseEvent, port: Port) => void;
  onPortTouchStart?: (e: React.TouchEvent, port: Port) => void;
  onToggleSwitch?: (e: React.MouseEvent | React.TouchEvent) => void;
  onPressButton?: (pressed: boolean) => void;
  onTriggerPulse?: (e: React.MouseEvent | React.TouchEvent) => void;
}

export const ComponentRenderer: React.FC<ComponentRendererProps> = React.memo(({
  component,
  portValues,
  isSelected,
  theme = 'kitt_sovereign',
  colorMode,
  wireDraftFromCompId = null,
  selectingUsers = [],
  onMouseDown,
  onTouchStart,
  onPortMouseDown,
  onPortMouseUp,
  onPortTouchStart,
  onToggleSwitch,
  onPressButton,
  onTriggerPulse,
}) => {
  const activeTheme = THEME_PRESETS[theme as keyof typeof THEME_PRESETS] || THEME_PRESETS.kitt_sovereign;
  const isLight = activeTheme.id.endsWith('_light') || activeTheme.id === 'light' || colorMode === 'light';
  const primarySelectingUser = selectingUsers[0];
  const selectionStroke = activeTheme.secondaryColor || '#FFFFFF';
  const selectionText = activeTheme.signalPulseColor || '#E8E8E8';

  const meta = COMPONENT_METADATA[component.type] || COMPONENT_METADATA.AND;
  const width = meta.width;
  const height = Math.max(meta.height, component.inputCount > 2 ? component.inputCount * 22 + 16 : meta.height);

  const isFlipped = component.flipped;
  const rotation = component.rotation || 0;

  // Determine if this gate or asset is actively asserting / outputting a TRUE (1) value
  const isInputComp = ['SWITCH', 'BUTTON', 'CLOCK', 'CONST_1', 'CONST_0', 'PULSE', 'RANDOM'].includes(component.type);
  const isAnyOutputHigh = Array.isArray(component.ports) && component.ports.some((p) => p && p.type === 'output' && portValues[p.id] === 1);
  const isSelfActive = isInputComp
    ? component.internalState?.value === 1 ||
      component.internalState?.pressed === true ||
      component.internalState?.clockState === true ||
      component.type === 'CONST_1' ||
      isAnyOutputHigh
    : isAnyOutputHigh;

  // Dynamic visual feedback based on active theme
  const gateFill = isSelfActive ? activeTheme.gateActiveFill : activeTheme.gateInactiveFill;
  const gateStroke = isSelected
    ? selectionStroke
    : isSelfActive
    ? activeTheme.gateActiveStroke
    : activeTheme.gateInactiveStroke;
  const gateStrokeWidth = isSelected ? 2.5 : isSelfActive ? 2 : 1.75;

  // Render gate SVG graphic according to component type
  const renderGateShape = () => {
    switch (component.type) {
      case 'AND':
        return (
          <path
            d={`M 10 5 L ${width - 30} 5 C ${width - 5} 5 ${width - 5} ${height - 5} ${width - 30} ${height - 5} L 10 ${height - 5} Z`}
            fill={gateFill}
            stroke={gateStroke}
            strokeWidth={gateStrokeWidth}
            className="transition-colors duration-150"
          />
        );

      case 'OR':
        return (
          <path
            d={`M 10 5 C 22 ${height * 0.35} 22 ${height * 0.65} 10 ${height - 5} L 25 ${height - 5} C ${width - 20} ${height - 5} ${width - 10} ${height * 0.6} ${width - 5} ${height / 2} C ${width - 10} ${height * 0.4} ${width - 20} 5 25 5 Z`}
            fill={gateFill}
            stroke={gateStroke}
            strokeWidth={gateStrokeWidth}
            className="transition-colors duration-150"
          />
        );

      case 'NOT':
        return (
          <g>
            <polygon
              points={`10,5 ${width - 18},${height / 2} 10,${height - 5}`}
              fill={gateFill}
              stroke={gateStroke}
              strokeWidth={gateStrokeWidth}
              className="transition-colors duration-150"
            />
            {/* Inversion Bubble */}
            <circle
              cx={width - 10}
              cy={height / 2}
              r={6.5}
              fill={gateFill}
              stroke={gateStroke}
              strokeWidth={gateStrokeWidth}
              className="transition-colors duration-150"
            />
          </g>
        );

      case 'NAND':
        return (
          <g>
            <path
              d={`M 10 5 L ${width - 36} 5 C ${width - 12} 5 ${width - 12} ${height - 5} ${width - 36} ${height - 5} L 10 ${height - 5} Z`}
              fill={gateFill}
              stroke={gateStroke}
              strokeWidth={gateStrokeWidth}
              className="transition-colors duration-150"
            />
            <circle
              cx={width - 10}
              cy={height / 2}
              r={6.5}
              fill={gateFill}
              stroke={gateStroke}
              strokeWidth={gateStrokeWidth}
              className="transition-colors duration-150"
            />
          </g>
        );

      case 'NOR':
        return (
          <g>
            <path
              d={`M 10 5 C 22 ${height * 0.35} 22 ${height * 0.65} 10 ${height - 5} L 25 ${height - 5} C ${width - 26} ${height - 5} ${width - 16} ${height * 0.6} ${width - 12} ${height / 2} C ${width - 16} ${height * 0.4} ${width - 26} 5 25 5 Z`}
              fill={gateFill}
              stroke={gateStroke}
              strokeWidth={gateStrokeWidth}
              className="transition-colors duration-150"
            />
            <circle
              cx={width - 10}
              cy={height / 2}
              r={6.5}
              fill={gateFill}
              stroke={gateStroke}
              strokeWidth={gateStrokeWidth}
              className="transition-colors duration-150"
            />
          </g>
        );

      case 'XOR':
        return (
          <g>
            {/* Back curved arc */}
            <path
              d={`M 4 5 C 16 ${height * 0.35} 16 ${height * 0.65} 4 ${height - 5}`}
              fill="none"
              stroke={gateStroke}
              strokeWidth={gateStrokeWidth}
              className="transition-colors duration-150"
            />
            {/* Main OR shape */}
            <path
              d={`M 12 5 C 24 ${height * 0.35} 24 ${height * 0.65} 12 ${height - 5} L 25 ${height - 5} C ${width - 20} ${height - 5} ${width - 10} ${height * 0.6} ${width - 5} ${height / 2} C ${width - 10} ${height * 0.4} ${width - 20} 5 25 5 Z`}
              fill={gateFill}
              stroke={gateStroke}
              strokeWidth={gateStrokeWidth}
              className="transition-colors duration-150"
            />
          </g>
        );

      case 'XNOR':
        return (
          <g>
            <path
              d={`M 4 5 C 16 ${height * 0.35} 16 ${height * 0.65} 4 ${height - 5}`}
              fill="none"
              stroke={gateStroke}
              strokeWidth={gateStrokeWidth}
              className="transition-colors duration-150"
            />
            <path
              d={`M 12 5 C 24 ${height * 0.35} 24 ${height * 0.65} 12 ${height - 5} L 25 ${height - 5} C ${width - 26} ${height - 5} ${width - 16} ${height * 0.6} ${width - 12} ${height / 2} C ${width - 16} ${height * 0.4} ${width - 26} 5 25 5 Z`}
              fill={gateFill}
              stroke={gateStroke}
              strokeWidth={gateStrokeWidth}
              className="transition-colors duration-150"
            />
            <circle
              cx={width - 10}
              cy={height / 2}
              r={6.5}
              fill={gateFill}
              stroke={gateStroke}
              strokeWidth={gateStrokeWidth}
              className="transition-colors duration-150"
            />
          </g>
        );

      case 'BUFFER':
        return (
          <polygon
            points={`10,5 ${width - 10},${height / 2} 10,${height - 5}`}
            fill={gateFill}
            stroke={gateStroke}
            strokeWidth={gateStrokeWidth}
            className="transition-colors duration-150"
          />
        );

      case 'TRI_STATE_BUFFER':
        return (
          <g>
            <polygon
              points={`10,5 ${width - 10},${height / 2} 10,${height - 5}`}
              fill={gateFill}
              stroke={gateStroke}
              strokeWidth={gateStrokeWidth}
              className="transition-colors duration-150"
            />
            {/* Control line from top EN pin */}
            <line x1={width / 2} y1={0} x2={width / 2} y2={height / 2 - 8} stroke={gateStroke} strokeWidth={2} />
          </g>
        );

      case 'SWITCH': {
        const val = component.internalState?.value ?? 0;
        const isOn = val === 1;
        return (
          <g
            className="cursor-pointer select-none group/switch"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSwitch?.(e as any);
            }}
          >
            {/* Outer Sleek Matte Bezel Chassis */}
            <rect
              x={3}
              y={6}
              width={width - 6}
              height={height - 12}
              rx={12}
              fill={isLight ? '#F1F5F9' : '#000000'}
              stroke={isSelected ? selectionStroke : isOn ? activeTheme.inputActiveStroke : isLight ? '#CBD5E1' : 'rgba(255, 255, 255, 0.3)'}
              strokeWidth={isSelected ? 2 : 1.5}
            />
            {/* Inner Recessed Switch Track */}
            <rect
              x={6}
              y={9}
              width={width - 12}
              height={height - 18}
              rx={9}
              fill={isOn ? activeTheme.inputActiveFill : isLight ? '#E2E8F0' : '#000000'}
              stroke={isOn ? activeTheme.inputActiveStroke : isLight ? '#CBD5E1' : '#29292A'}
              strokeWidth={1}
            />
            {/* Binary State Text (0 / 1) cleanly positioned on non-knob side */}
            <text
              x={isOn ? 16 : width - 16}
              y={height / 2}
              dominantBaseline="central"
              textAnchor="middle"
              fill={isOn ? activeTheme.secondaryColor : isLight ? '#334155' : '#E8E8E8'}
              fontSize={11}
              fontWeight="bold"
              fontFamily="monospace"
              className="pointer-events-none select-none opacity-90"
            >
              {isOn ? '1' : '0'}
            </text>
            {/* Ergonomic Switch Slider Knob with Tactile Grips */}
            <g
              transform={`translate(${isOn ? width - 23 : 9}, ${11})`}
            >
              <rect
                x={0}
                y={0}
                width={14}
                height={height - 22}
                rx={6}
                fill={isOn ? activeTheme.inputKnobActive : isLight ? '#FFFFFF' : '#FFFFFF'}
                stroke={isLight ? '#94A3B8' : '#E8E8E8'}
                strokeWidth={1.5}
                className="shadow-md"
              />
              {/* Tactile Grip Lines */}
              <line x1={4.5} y1={6} x2={4.5} y2={height - 28} stroke={isOn ? '#000000' : isLight ? '#94A3B8' : '#000000'} strokeWidth={1} strokeLinecap="round" />
              <line x1={8.5} y1={6} x2={8.5} y2={height - 28} stroke={isOn ? '#000000' : isLight ? '#94A3B8' : '#000000'} strokeWidth={1} strokeLinecap="round" />
            </g>
          </g>
        );
      }

      case 'BUTTON': {
        const pressed = component.internalState?.pressed ?? false;
        return (
          <g
            className="cursor-pointer select-none group/btn"
            onPointerDown={(e) => {
              (e.target as Element).setPointerCapture(e.pointerId);
              onPressButton?.(true);
            }}
            onPointerUp={(e) => {
              (e.target as Element).releasePointerCapture(e.pointerId);
              onPressButton?.(false);
            }}
            onPointerCancel={() => {
              onPressButton?.(false);
            }}
          >
            {/* Outer Chassis */}
            <rect
              x={3}
              y={5}
              width={width - 6}
              height={height - 10}
              rx={12}
              fill={isLight ? '#F1F5F9' : '#000000'}
              stroke={isSelected ? selectionStroke : pressed ? activeTheme.inputActiveStroke : isLight ? '#CBD5E1' : 'rgba(255, 255, 255, 0.3)'}
              strokeWidth={isSelected ? 2 : 1.5}
              className="transition-colors duration-150"
            />
            {/* Outer Chamfer Ring */}
            <circle
              cx={width / 2}
              cy={height / 2}
              r={17}
              fill={isLight ? '#E2E8F0' : '#000000'}
              stroke={isLight ? '#CBD5E1' : '#29292A'}
              strokeWidth={1.5}
            />
            {/* Push Button Center Actuator with Tactile Feedback */}
            <circle
              cx={width / 2}
              cy={height / 2}
              r={pressed ? 12 : 14}
              fill={pressed ? activeTheme.inputKnobActive : '#FFFFFF'}
              stroke={pressed ? activeTheme.inputActiveStroke : '#E8E8E8'}
              strokeWidth={2}
              className="transition-all duration-75 shadow-lg"
            />
            {/* Crisp Push Button Label */}
            <text
              x={width / 2}
              y={height / 2}
              dominantBaseline="central"
              textAnchor="middle"
              fill="#ffffff"
              fontSize={8.5}
              fontWeight="800"
              fontFamily="sans-serif"
              className="pointer-events-none select-none tracking-wider"
            >
              {pressed ? '1' : 'PUSH'}
            </text>
          </g>
        );
      }

      case 'CLOCK': {
        const clkVal = component.internalState?.value ?? 0;
        return (
          <g>
            <rect
              x={5}
              y={5}
              width={width - 10}
              height={height - 10}
              rx={8}
              fill={activeTheme.gateInactiveFill}
              stroke={clkVal === 1 ? activeTheme.inputActiveStroke : isSelected ? selectionStroke : activeTheme.gateInactiveStroke}
              strokeWidth={2}
            />
            {/* Square wave icon */}
            <path
              d={`M 14 ${height / 2 + 8} L 22 ${height / 2 + 8} L 22 ${height / 2 - 8} L 32 ${height / 2 - 8} L 32 ${height / 2 + 8} L 40 ${height / 2 + 8}`}
              fill="none"
              stroke={clkVal === 1 ? activeTheme.clockTraceActive : isLight ? '#475569' : '#94a3b8'}
              strokeWidth={2.5}
            />
            <circle
              cx={width - 16}
              cy={14}
              r={3.5}
              fill={clkVal === 1 ? activeTheme.clockTraceActive : activeTheme.portInactiveColor}
            />
          </g>
        );
      }

      case 'CONST_1':
        return (
          <g>
            <rect
              x={5}
              y={5}
              width={width - 10}
              height={height - 10}
              rx={8}
              fill={activeTheme.inputActiveFill}
              stroke={activeTheme.inputActiveStroke}
              strokeWidth={2}
            />
            <text
              x={width / 2}
              y={height / 2 + 5}
              textAnchor="middle"
              fill={activeTheme.inputKnobActive}
              fontSize={14}
              fontWeight="bold"
              className="font-mono"
            >
              VCC (+1)
            </text>
          </g>
        );

      case 'CONST_0':
        return (
          <g>
            <rect
              x={5}
              y={5}
              width={width - 10}
              height={height - 10}
              rx={8}
              fill={activeTheme.gateInactiveFill}
              stroke={isSelected ? selectionStroke : activeTheme.gateInactiveStroke}
              strokeWidth={2}
            />
            <text
              x={width / 2}
              y={height / 2 + 5}
              textAnchor="middle"
              fill={isLight ? '#334155' : '#94a3b8'}
              fontSize={14}
              fontWeight="bold"
              className="font-mono"
            >
              GND (0)
            </text>
          </g>
        );

      case 'LED': {
        const inPort = component.ports[0]?.id || 'in_0';
        const inVal = portValues[inPort] ?? component.internalState?.currentValue ?? 0;
        const isOn = inVal === 1 || inVal === '1';
        return (
          <g>
            {/* Glow halo when ON */}
            {isOn && (
              <circle
                cx={width / 2}
                cy={height / 2}
                r={24}
                fill={activeTheme.ledGlowColor}
                className="animate-pulse"
              />
            )}
            
            {/* LED Base / Socket */}
            <circle
              cx={width / 2}
              cy={height / 2}
              r={18}
              fill={isLight ? '#F1F5F9' : '#000000'}
              stroke={isSelected ? selectionStroke : activeTheme.gateInactiveStroke}
              strokeWidth={2}
            />

            {/* LED Bulb Glass */}
            <circle
              cx={width / 2}
              cy={height / 2}
              r={14}
              fill={isOn ? activeTheme.ledActiveFill : activeTheme.gateInactiveFill}
              stroke={isOn ? activeTheme.ledActiveStroke : isLight ? '#CBD5E1' : '#29292A'}
              strokeWidth={1.5}
              className="transition-colors duration-200"
            />
            
            {/* Inner Light Core */}
            <circle
              cx={width / 2}
              cy={height / 2}
              r={8}
              fill={isOn ? activeTheme.inputKnobActive : isLight ? '#CBD5E1' : '#29292A'}
              className="transition-colors duration-200"
              opacity={isOn ? 1 : 0.4}
            />

            {/* Specular Highlight */}
            <path
              d={`M ${width / 2 - 8} ${height / 2 - 8} Q ${width / 2} ${height / 2 - 12} ${width / 2 + 8} ${height / 2 - 8}`}
              fill="none"
              stroke="#ffffff"
              strokeWidth={2}
              strokeLinecap="round"
              opacity={isOn ? 0.8 : 0.15}
            />
          </g>
        );
      }

      case 'PROBE': {
        const inPort = component.ports[0]?.id || 'in_0';
        const inVal = portValues[inPort] ?? component.internalState?.currentValue ?? 0;
        let badgeColor = activeTheme.gateInactiveFill;
        let textColor = isLight ? '#334155' : '#E8E8E8';
        let strokeColor = activeTheme.gateInactiveStroke;
        
        if (inVal === 1 || inVal === '1') {
          badgeColor = activeTheme.probeActiveBg;
          textColor = activeTheme.probeActiveText;
          strokeColor = activeTheme.inputActiveStroke;
        } else if (inVal === 'Z') {
          badgeColor = isLight ? '#FEF3C7' : 'rgba(255, 255, 255, 0.15)';
          textColor = isLight ? '#B45309' : '#E8E8E8';
          strokeColor = '#FFFFFF';
        } else if (inVal === 'X') {
          badgeColor = 'rgba(255, 255, 255, 0.25)';
          textColor = '#E8E8E8';
          strokeColor = '#FFFFFF';
        } else {
          badgeColor = isLight ? '#F1F5F9' : '#141415';
          textColor = isLight ? '#334155' : '#F5F5F5';
          strokeColor = isLight ? '#CBD5E1' : 'rgba(255, 255, 255, 0.3)';
        }

        return (
          <g>
            {/* Glowing active outline */}
            {(inVal === 1 || inVal === '1') && (
              <rect
                x={3}
                y={3}
                width={width - 6}
                height={height - 6}
                rx={10}
                fill={activeTheme.ledGlowColor}
                className="animate-pulse opacity-60"
              />
            )}
            <rect
              x={5}
              y={5}
              width={width - 10}
              height={height - 10}
              rx={8}
              fill={badgeColor}
              stroke={isSelected ? selectionStroke : strokeColor}
              strokeWidth={isSelected ? 2.5 : 2}
            />
            <text
              x={width / 2}
              y={height / 2 + 6}
              textAnchor="middle"
              fill={textColor}
              fontSize={20}
              fontWeight="bold"
              className="font-mono select-none"
            >
              {inVal}
            </text>
          </g>
        );
      }

      case 'SEGMENT_7': {
        const segInputs: Record<string, boolean> = {
          a: (portValues['in_a'] ?? component.internalState?.segments?.a) === 1,
          b: (portValues['in_b'] ?? component.internalState?.segments?.b) === 1,
          c: (portValues['in_c'] ?? component.internalState?.segments?.c) === 1,
          d: (portValues['in_d'] ?? component.internalState?.segments?.d) === 1,
          e: (portValues['in_e'] ?? component.internalState?.segments?.e) === 1,
          f: (portValues['in_f'] ?? component.internalState?.segments?.f) === 1,
          g: (portValues['in_g'] ?? component.internalState?.segments?.g) === 1,
          dp: (portValues['in_dp'] ?? component.internalState?.segments?.dp) === 1,
        };

        const onFill = activeTheme.inputKnobActive || '#B4B4B4';
        const offFill = '#29292A';
        const offStroke = '#000000';

        return (
          <g>
            {/* Display Enclosure */}
            <rect
              x={16}
              y={5}
              width={width - 20}
              height={height - 10}
              rx={6}
              fill="#000000"
              stroke={isSelected ? selectionStroke : 'rgba(255, 255, 255, 0.3)'}
              strokeWidth={2}
            />

            {/* 7 Segments (a, b, c, d, e, f, g) */}
            {/* Segment a (top) */}
            <polygon
              points="34,14 58,14 54,19 38,19"
              fill={segInputs.a ? onFill : offFill}
              stroke={segInputs.a ? onFill : offStroke}
              strokeWidth={1}
            />
            {/* Segment b (top-right) */}
            <polygon
              points="59,16 63,20 59,45 55,42"
              fill={segInputs.b ? onFill : offFill}
              stroke={segInputs.b ? onFill : offStroke}
              strokeWidth={1}
            />
            {/* Segment c (bottom-right) */}
            <polygon
              points="58,52 62,55 58,80 54,76"
              fill={segInputs.c ? onFill : offFill}
              stroke={segInputs.c ? onFill : offStroke}
              strokeWidth={1}
            />
            {/* Segment d (bottom) */}
            <polygon
              points="34,82 54,82 50,77 38,77"
              fill={segInputs.d ? onFill : offFill}
              stroke={segInputs.d ? onFill : offStroke}
              strokeWidth={1}
            />
            {/* Segment e (bottom-left) */}
            <polygon
              points="33,52 37,55 33,80 29,76"
              fill={segInputs.e ? onFill : offFill}
              stroke={segInputs.e ? onFill : offStroke}
              strokeWidth={1}
            />
            {/* Segment f (top-left) */}
            <polygon
              points="34,16 38,20 34,45 30,42"
              fill={segInputs.f ? onFill : offFill}
              stroke={segInputs.f ? onFill : offStroke}
              strokeWidth={1}
            />
            {/* Segment g (middle) */}
            <polygon
              points="35,48 57,48 53,51 39,51"
              fill={segInputs.g ? onFill : offFill}
              stroke={segInputs.g ? onFill : offStroke}
              strokeWidth={1}
            />

            {/* Decimal Point (dp) */}
            <circle
              cx={67}
              cy={80}
              r={3}
              fill={segInputs.dp ? onFill : offFill}
              stroke={segInputs.dp ? onFill : offStroke}
              strokeWidth={1}
            />
          </g>
        );
      }

      case 'HEX_DISPLAY': {
        const d3 = portValues['in_3'] === 1 ? 1 : 0;
        const d2 = portValues['in_2'] === 1 ? 1 : 0;
        const d1 = portValues['in_1'] === 1 ? 1 : 0;
        const d0 = portValues['in_0'] === 1 ? 1 : 0;
        const calcVal = (d3 << 3) | (d2 << 2) | (d1 << 1) | d0;
        const hexChar = component.internalState?.hexValue ?? calcVal.toString(16).toUpperCase();

        return (
          <g>
            <rect
              x={16}
              y={5}
              width={width - 20}
              height={height - 10}
              rx={8}
              fill="#000000"
              stroke={isSelected ? selectionStroke : 'rgba(255, 255, 255, 0.3)'}
              strokeWidth={2}
            />
            <text
              x={(width + 12) / 2}
              y={height / 2 + 10}
              textAnchor="middle"
              fill={activeTheme.displayDigitColor || '#B4B4B4'}
              fontSize={32}
              fontFamily="monospace"
              fontWeight="bold"
              className={activeTheme.displayDigitGlow}
            >
              {hexChar}
            </text>
            <text
              x={(width + 12) / 2}
              y={height - 8}
              textAnchor="middle"
              fill="#E8E8E8"
              fontSize={7.5}
              fontWeight="bold"
              fontFamily="monospace"
            >
              HEX
            </text>
          </g>
        );
      }

      case 'DECIMAL_DISPLAY': {
        const d3 = portValues['in_3'] === 1 ? 1 : 0;
        const d2 = portValues['in_2'] === 1 ? 1 : 0;
        const d1 = portValues['in_1'] === 1 ? 1 : 0;
        const d0 = portValues['in_0'] === 1 ? 1 : 0;
        const calcVal = (d3 << 3) | (d2 << 2) | (d1 << 1) | d0;
        const decStr = component.internalState?.decValue ?? calcVal.toString(10);

        return (
          <g>
            <rect
              x={16}
              y={5}
              width={width - 20}
              height={height - 10}
              rx={8}
              fill="#000000"
              stroke={isSelected ? selectionStroke : 'rgba(255, 255, 255, 0.3)'}
              strokeWidth={2}
            />
            <text
              x={(width + 12) / 2}
              y={height / 2 + 10}
              textAnchor="middle"
              fill={activeTheme.displayDigitColor || '#B4B4B4'}
              fontSize={decStr.length > 1 ? 26 : 32}
              fontFamily="monospace"
              fontWeight="bold"
              className={activeTheme.displayDigitGlow}
            >
              {decStr}
            </text>
            <text
              x={(width + 12) / 2}
              y={height - 8}
              textAnchor="middle"
              fill="#E8E8E8"
              fontSize={7.5}
              fontWeight="bold"
              fontFamily="monospace"
            >
              DEC
            </text>
          </g>
        );
      }

      case 'BINARY_DISPLAY': {
        const bits = [
          portValues['in_3'] === 1 ? 1 : 0,
          portValues['in_2'] === 1 ? 1 : 0,
          portValues['in_1'] === 1 ? 1 : 0,
          portValues['in_0'] === 1 ? 1 : 0,
        ];
        const onFill = activeTheme.inputKnobActive || '#B4B4B4';

        return (
          <g>
            <rect
              x={16}
              y={5}
              width={width - 20}
              height={height - 10}
              rx={6}
              fill="#000000"
              stroke={isSelected ? selectionStroke : 'rgba(255, 255, 255, 0.3)'}
              strokeWidth={2}
            />
            {bits.map((bit, idx) => {
              const cx = 26 + idx * 12;
              return (
                <g key={idx}>
                  <circle
                    cx={cx}
                    cy={height / 2 - 4}
                    r={4.5}
                    fill={bit === 1 ? onFill : '#29292A'}
                    stroke={bit === 1 ? '#ffffff' : '#000000'}
                    strokeWidth={1}
                  />
                  <text
                    x={cx}
                    y={height / 2 + 14}
                    textAnchor="middle"
                    fill={bit === 1 ? '#ffffff' : '#64748b'}
                    fontSize={8.5}
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {bit}
                  </text>
                </g>
              );
            })}
          </g>
        );
      }

      default: {
        // Generic IC Chip Representation (Adders, Multiplexers, Latches, Registers)
        const boxFill = isSelfActive ? activeTheme.boxActiveFill : activeTheme.boxInactiveFill;
        const boxStroke = isSelected
          ? selectionStroke
          : isSelfActive
          ? activeTheme.boxActiveStroke
          : activeTheme.boxInactiveStroke;

        return (
          <g>
            <rect
              x={8}
              y={5}
              width={width - 16}
              height={height - 10}
              rx={6}
              fill={boxFill}
              stroke={boxStroke}
              strokeWidth={gateStrokeWidth}
              className="transition-colors duration-150"
            />
            {/* IC Orientation Notch at top */}
            <path
              d={`M ${width / 2 - 8} 5 C ${width / 2 - 8} 10 ${width / 2 + 8} 10 ${width / 2 + 8} 5`}
              fill={isLight ? '#F1F5F9' : activeTheme.panelBg}
              stroke={activeTheme.boxInactiveStroke}
              strokeWidth={1.25}
            />
            {/* IC Chip Label */}
            <text
              x={width / 2}
              y={height / 2 + 4}
              textAnchor="middle"
              fill={isSelfActive ? activeTheme.primaryColor : isLight ? '#000000' : '#F5F5F5'}
              fontSize={10}
              fontWeight="bold"
              fontFamily="monospace"
              className="pointer-events-none"
            >
              {component.label || component.name || component.type}
            </text>
          </g>
        );
      }
    }
  };

  const labelText = component.label?.trim() || '';
  const showLabelBadge = !!labelText;

  // Only complex ICs, MSI, ALU, and multi-pin devices need internal pin labels (prevents collision on standard 2-input gates and switches)
  const showInternalPinLabels = [
    'D_FLIP_FLOP',
    'JK_FLIP_FLOP',
    'T_FLIP_FLOP',
    'SR_LATCH',
    'FULL_ADDER',
    'HALF_ADDER',
    'HALF_SUBTRACTOR',
    'FULL_SUBTRACTOR',
    'MUX_2_1',
    'MUX_4_1',
    'MUX_4TO1',
    'DEMUX_1_2',
    'DEMUX_1_4',
    'DEMUX_1TO4',
    'DECODER_2_4',
    'DECODER_3_8',
    'ENCODER_4_2',
    'COMPARATOR_1BIT',
    'COMPARATOR_2BIT',
    'RIPPLE_ADDER_4BIT',
    'ALU_4BIT',
    'PARITY_GEN',
    'PARITY_CHECK',
    'COUNTER_4BIT',
    'REGISTER_4BIT',
    'CUSTOM_IC',
    'SEGMENT_7',
    'TRI_STATE_BUFFER',
  ].includes(component.type);

  return (
    <g
      id={component.id}
      transform={`translate(${component.x}, ${component.y}) rotate(${rotation}, ${width / 2}, ${height / 2}) scale(${isFlipped ? -1 : 1}, 1)`}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      className="cursor-move select-none group touch-none"
    >
      {/* Generous Draggable Hit Area backdrop across component bounding area (prevents click fall-through on triangular NOT / BUFFER gates) */}
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill="transparent"
        style={{ pointerEvents: 'all' }}
      />

      {/* Component Outer Body */}
      {renderGateShape()}

      {/* Remote Collaborator Selection Outline Halo */}
      {primarySelectingUser && (
        <rect
          x={-4}
          y={-4}
          width={width + 8}
          height={height + 8}
          rx={8}
          fill="none"
          stroke={primarySelectingUser.color}
          strokeWidth={2.2}
          strokeDasharray="4 3"
          className="pointer-events-none transition-all duration-150 animate-pulse"
        />
      )}

      {/* Remote Collaborators Selection Initial Badges */}
      {selectingUsers.length > 0 && (
        <g transform={`translate(${width - 2}, ${-10})`} className="pointer-events-none select-none">
          {selectingUsers.map((user, idx) => (
            <g key={user.id} transform={`translate(${idx * 20}, 0)`}>
              {/* Badge Background Circle */}
              <circle
                cx={0}
                cy={0}
                r={10}
                fill={user.color}
                stroke="#000000"
                strokeWidth={1.8}
                className="shadow-lg"
              />
              {/* First Letter of Collaborator's Name */}
              <text
                x={0}
                y={0}
                dominantBaseline="central"
                textAnchor="middle"
                fill="#ffffff"
                fontSize={10}
                fontWeight="900"
                fontFamily="sans-serif"
              >
                {user.initial || user.name.charAt(0).toUpperCase()}
              </text>
              {/* User Name Tooltip Pill */}
              <g transform="translate(0, -16)" className="opacity-90">
                <rect
                  x={-Math.max(16, user.name.length * 3.4 + 6)}
                  y={-7}
                  width={Math.max(32, user.name.length * 6.8 + 12)}
                  height={14}
                  rx={4}
                  fill="#000000"
                  stroke={user.color}
                  strokeWidth={1}
                />
                <text
                  x={0}
                  y={0}
                  dominantBaseline="central"
                  textAnchor="middle"
                  fill="#f1f5f9"
                  fontSize={8}
                  fontWeight="bold"
                >
                  {user.name}
                </text>
              </g>
            </g>
          ))}
        </g>
      )}

      {/* Dynamic Custom Label Badge (cleanly centered, crisp typography) */}
      {showLabelBadge && (
        <g transform={`translate(${width / 2}, ${-13})`}>
          <rect
            x={-Math.max(14, labelText.length * 3.6 + 7)}
            y={-9}
            width={Math.max(28, labelText.length * 7.2 + 14)}
            height={18}
            rx={5}
            fill={isSelfActive ? activeTheme.badgeActiveBg : isLight ? '#FFFFFF' : activeTheme.panelBg}
            stroke={isSelfActive ? activeTheme.badgeActiveBorder : isSelected ? selectionStroke : isLight ? '#CBD5E1' : activeTheme.panelBorder || '#334155'}
            strokeWidth={1.2}
            className="shadow-md"
          />
          <text
            x={0}
            y={0}
            dominantBaseline="central"
            textAnchor="middle"
            fill={isSelfActive ? activeTheme.badgeActiveText : isLight ? '#000000' : '#F5F5F5'}
            fontSize={9.5}
            fontWeight="600"
            fontFamily="sans-serif"
            className="pointer-events-none select-none tracking-wide"
          >
            {labelText}
          </text>
        </g>
      )}

      {/* Connection Ports (Pins) - Rendered with orientation-aware leads and magnetic hitboxes */}
      {Array.isArray(component.ports) && component.ports.filter(Boolean).map((port) => {
        const val = portValues[port.id];
        let portColor = activeTheme.portInactiveColor;
        if (val === 1) portColor = activeTheme.portActiveColor;
        else if (val === 'Z') portColor = '#d97706';
        else if (val === 'X') portColor = '#FFFFFF';

        const px = port.relativePosition?.x ?? (port.type === 'output' ? width : 0);
        const py = port.relativePosition?.y ?? (height / 2);
        const isOutput = port.type === 'output';
        const isInput = port.type === 'input';
        const isTargetCandidate = Boolean(wireDraftFromCompId) && isInput && wireDraftFromCompId !== component.id;

        const isTopPort = py === 0 && px > 0 && px < width;
        const isBottomPort = py >= height && px > 0 && px < width;

        return (
          <g
            key={port.id}
            data-comp-id={component.id}
            data-port-id={port.id}
            data-port-type={port.type}
            className={`${isOutput ? 'cursor-crosshair' : isTargetCandidate ? 'cursor-crosshair' : 'cursor-default'} group/port`}
            onMouseDown={(e) => {
              e.stopPropagation();
              onPortMouseDown(e, port);
            }}
            onMouseUp={(e) => {
              e.stopPropagation();
              onPortMouseUp?.(e, port);
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
              onPortTouchStart?.(e, port);
            }}
          >
            {/* Native SVG Tooltip for Instant Educational Signal Inspection */}
            <title>{`${port.name} (${isInput ? 'Input' : 'Output'}): ${port.description || (isInput ? 'Binary logic signal input (0 or 1)' : 'Binary logic signal output')} | Current Value: ${val ?? 0}`}</title>

            {/* Magnetic Touch & Click Area (Generous touch target for phones, tablets and desktop) */}
            <rect
              x={isTopPort || isBottomPort ? px - 18 : isInput ? px - 24 : px - 4}
              y={isTopPort ? py - 20 : isBottomPort ? py - 8 : py - 18}
              width={36}
              height={36}
              fill="transparent"
              style={{ pointerEvents: 'all' }}
            />

            {/* Hover / Drop Target Indicator Pill */}
            <rect
              x={isTopPort || isBottomPort ? px - 8 : isInput ? px - 14 : px - 2}
              y={isTopPort ? py - 14 : isBottomPort ? py : py - 7}
              width={16}
              height={14}
              rx={3}
              fill={isTargetCandidate ? 'rgba(229, 9, 47, 0.20)' : 'rgba(229, 9, 47, 0.10)'}
              stroke={selectionStroke}
              strokeWidth={isTargetCandidate ? 1.5 : 1}
              className={
                isTargetCandidate
                  ? 'opacity-100'
                  : 'opacity-0 group-hover/port:opacity-100 transition-opacity hidden md:block'
              }
            />

            {/* Terminal Pin Leads & Contact Bars */}
            {isTopPort ? (
              <g className="transition-colors duration-150">
                {/* Vertical Pin Lead Line from Top */}
                <line
                  x1={px}
                  y1={py - 10}
                  x2={px}
                  y2={py}
                  stroke={portColor}
                  strokeWidth={2.5}
                  strokeLinecap="square"
                />
                {/* Horizontal Terminal Contact Bar */}
                <line
                  x1={px - 4}
                  y1={py - 10}
                  x2={px + 4}
                  y2={py - 10}
                  stroke={portColor}
                  strokeWidth={2.2}
                  strokeLinecap="round"
                />
              </g>
            ) : isBottomPort ? (
              <g className="transition-colors duration-150">
                {/* Vertical Pin Lead Line to Bottom */}
                <line
                  x1={px}
                  y1={py}
                  x2={px}
                  y2={py + 10}
                  stroke={portColor}
                  strokeWidth={2.5}
                  strokeLinecap="square"
                />
                {/* Horizontal Terminal Contact Bar */}
                <line
                  x1={px - 4}
                  y1={py + 10}
                  x2={px + 4}
                  y2={py + 10}
                  stroke={portColor}
                  strokeWidth={2.2}
                  strokeLinecap="round"
                />
              </g>
            ) : isInput ? (
              <g className="transition-colors duration-150">
                {/* Horizontal Pin Lead Line */}
                <line
                  x1={px - 10}
                  y1={py}
                  x2={px}
                  y2={py}
                  stroke={portColor}
                  strokeWidth={2.5}
                  strokeLinecap="square"
                />
                {/* Vertical Terminal Contact Bar */}
                <line
                  x1={px - 10}
                  y1={py - 4}
                  x2={px - 10}
                  y2={py + 4}
                  stroke={portColor}
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              </g>
            ) : (
              <g className="transition-colors duration-150">
                {/* Horizontal Pin Lead Line (Output source) */}
                <line
                  x1={px}
                  y1={py}
                  x2={px + 10}
                  y2={py}
                  stroke={portColor}
                  strokeWidth={2.5}
                  strokeLinecap="square"
                />
                {/* Vertical Terminal Contact Bar / Source Tab */}
                <line
                  x1={px + 10}
                  y1={py - 4}
                  x2={px + 10}
                  y2={py + 4}
                  stroke={portColor}
                  strokeWidth={2.2}
                  strokeLinecap="round"
                />
              </g>
            )}

            {/* Clean, Non-Intrusive Port Name Label */}
            {showInternalPinLabels && (
              <text
                x={isTopPort ? px : isBottomPort ? px : isInput ? px + 12 : px - 12}
                y={isTopPort ? py + 12 : isBottomPort ? py - 8 : py}
                dominantBaseline="central"
                textAnchor={isTopPort || isBottomPort ? 'middle' : isInput ? 'start' : 'end'}
                fill={
                  val === 1
                    ? activeTheme.portActiveColor
                    : isTargetCandidate
                    ? selectionStroke
                    : isSelected
                    ? selectionText
                    : isLight
                    ? '#334155'
                    : '#94a3b8'
                }
                fontSize={8.5}
                fontWeight="700"
                fontFamily="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
                className="pointer-events-none select-none transition-colors duration-150 opacity-95"
              >
                {port.name}
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
});
