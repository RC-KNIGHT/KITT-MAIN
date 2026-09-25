/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { THEME_PRESETS, THEME_FAMILIES } from '../../theme/themes';
import { ThemePreset } from '../../types/circuit';
import { Palette, Check, Sparkles, Eye, Zap, Moon, Sun } from 'lucide-react';

export const ThemesSection: React.FC = () => {
  const [selectedThemeId, setSelectedThemeId] = useState<ThemePreset>('kitt_sovereign');

  const themeList = (Object.keys(THEME_PRESETS) as ThemePreset[]).filter((id) => id !== 'light');
  const currentTheme = THEME_PRESETS[selectedThemeId] || THEME_PRESETS.kitt_sovereign;

  return (
    <section id="themes" className="py-12 sm:py-16 border-b border-[#A58D66]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#A58D66]/10 border border-[#A58D66]/30 text-[#DFCCA8] text-xs font-mono mb-4">
            <Palette className="w-3.5 h-3.5" />
            <span>Theme & Styling Engine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#E5E1DD] tracking-tight leading-tight mb-4">
            Aesthetic Themes for <span className="text-[#DFCCA8]">Every Environment</span>
          </h2>
          <p className="text-sm sm:text-base text-[#E5E1DD]/60 leading-relaxed">
            Switch between 7 meticulously tuned color schemes engineered for optical contrast, eye comfort during long lab sessions, and classroom projector clarity.
          </p>
        </div>

        {/* Theme Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 mb-10">
          {themeList.map((id) => {
            const t = THEME_PRESETS[id];
            const isSelected = selectedThemeId === id;
            return (
              <button
                key={id}
                onClick={() => setSelectedThemeId(id)}
                className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden group active:scale-95 cursor-pointer ${
                  isSelected
                    ? 'border-[#A58D66] ring-2 ring-[#A58D66]/30 shadow-xl shadow-[#A58D66]/10'
                    : 'border-[#A58D66]/15 hover:border-[#A58D66]/20 bg-[#080f14]/60 hover:bg-[#080f14]'
                }`}
                style={{
                  backgroundColor: isSelected ? t.panelBg : undefined,
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-4 h-4 rounded-full border border-white/20 shadow-md"
                      style={{ backgroundColor: t.primaryColor }}
                    />
                    <span
                      className="w-4 h-4 rounded-full border border-white/20 shadow-md -ml-2"
                      style={{ backgroundColor: t.wireHighColor }}
                    />
                  </div>
                  {isSelected && (
                    <span className="w-5 h-5 rounded-full bg-[#A58D66] text-[#080f14] flex items-center justify-center shadow">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-sm text-[#E5E1DD] mb-1 group-hover:text-[#DFCCA8] transition-colors">
                  {t.name.split(' (')[0]}
                </h4>
                <p className="text-[11px] text-[#E5E1DD]/60 line-clamp-2 leading-relaxed">
                  {t.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Live Interactive Preview Box of Selected Theme */}
        <div
          className="border rounded-3xl p-6 sm:p-8 transition-all duration-300 shadow-2xl relative overflow-hidden"
          style={{
            backgroundColor: currentTheme.canvasBg,
            borderColor: currentTheme.panelBorder || currentTheme.borderTone,
          }}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
            <div>
              <div className="text-xs font-mono font-bold tracking-wider" style={{ color: currentTheme.primaryColor }}>
                LIVE PREVIEW: {currentTheme.name.toUpperCase()}
              </div>
              <p className="text-sm text-[#DFCCA8] mt-0.5">
                {currentTheme.description}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="px-3 py-1 rounded-xl text-xs font-mono font-bold border"
                style={{
                  backgroundColor: currentTheme.badgeActiveBg,
                  borderColor: currentTheme.badgeActiveBorder,
                  color: currentTheme.badgeActiveText,
                }}
              >
                High Signal (1): {currentTheme.wireHighColor}
              </span>
            </div>
          </div>

          {/* SVG Logic Circuit Schematic rendered with active theme CSS values */}
          <div className="h-56 sm:h-64 w-full flex items-center justify-center">
            <svg className="w-full h-full max-w-[620px]" viewBox="0 0 520 180" fill="none">
              {/* Background Grid Dots */}
              <pattern id={`theme-dots-${selectedThemeId}`} width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill={currentTheme.gridDotColor} />
              </pattern>
              <rect width="520" height="180" fill={`url(#theme-dots-${selectedThemeId})`} rx="16" />

              {/* Wire Active 1 */}
              <path
                d="M 60 50 L 170 50"
                stroke={currentTheme.wireHighColor}
                strokeWidth="3"
                strokeLinecap="round"
                filter={`drop-shadow(0 0 6px ${currentTheme.wireGlowColor})`}
              />
              <path
                d="M 60 90 L 170 90"
                stroke={currentTheme.wireLowColor}
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M 250 70 L 330 70"
                stroke={currentTheme.wireHighColor}
                strokeWidth="3"
                strokeLinecap="round"
                filter={`drop-shadow(0 0 6px ${currentTheme.wireGlowColor})`}
              />
              <path
                d="M 60 140 L 330 140"
                stroke={currentTheme.wireHighColor}
                strokeWidth="3"
                strokeLinecap="round"
                filter={`drop-shadow(0 0 6px ${currentTheme.wireGlowColor})`}
              />
              <path
                d="M 410 105 L 470 105"
                stroke={currentTheme.wireHighColor}
                strokeWidth="3.5"
                strokeLinecap="round"
                filter={`drop-shadow(0 0 8px ${currentTheme.wireGlowColor})`}
              />

              {/* Electron Pulses */}
              <circle cx="115" cy="50" r="3.5" fill={currentTheme.signalPulseColor} />
              <circle cx="290" cy="70" r="3.5" fill={currentTheme.signalPulseColor} />
              <circle cx="195" cy="140" r="3.5" fill={currentTheme.signalPulseColor} />
              <circle cx="440" cy="105" r="4" fill={currentTheme.signalPulseColor} />

              {/* Input Switch 1 (Active High) */}
              <rect
                x="20"
                y="35"
                width="35"
                height="30"
                rx="8"
                fill={currentTheme.inputActiveFill}
                stroke={currentTheme.inputActiveStroke}
                strokeWidth="2"
              />
              <circle cx="37" cy="50" r="7" fill={currentTheme.inputKnobActive} />

              {/* Input Switch 2 (Low 0) */}
              <rect
                x="20"
                y="75"
                width="35"
                height="30"
                rx="8"
                fill={currentTheme.gateInactiveFill}
                stroke={currentTheme.gateInactiveStroke}
                strokeWidth="1.5"
              />
              <circle cx="37" cy="90" r="6" fill={currentTheme.portInactiveColor} />

              {/* Input Switch 3 (Active High) */}
              <rect
                x="20"
                y="125"
                width="35"
                height="30"
                rx="8"
                fill={currentTheme.inputActiveFill}
                stroke={currentTheme.inputActiveStroke}
                strokeWidth="2"
              />
              <circle cx="37" cy="140" r="7" fill={currentTheme.inputKnobActive} />

              {/* Gate 1: AND Gate */}
              <g transform="translate(170, 35)">
                <rect
                  x="0"
                  y="0"
                  width="80"
                  height="70"
                  rx="10"
                  fill={currentTheme.gateActiveFill}
                  stroke={currentTheme.gateActiveStroke}
                  strokeWidth="2"
                />
                <text x="40" y="42" fill={currentTheme.primaryColor} fontSize="14" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  AND
                </text>
              </g>

              {/* Gate 2: OR Gate */}
              <g transform="translate(330, 70)">
                <rect
                  x="0"
                  y="0"
                  width="80"
                  height="70"
                  rx="10"
                  fill={currentTheme.gateActiveFill}
                  stroke={currentTheme.gateActiveStroke}
                  strokeWidth="2"
                />
                <text x="40" y="42" fill={currentTheme.secondaryColor} fontSize="14" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
                  OR
                </text>
              </g>

              {/* Output Glowing LED Lamp */}
              <g transform="translate(470, 90)">
                <circle
                  cx="15"
                  cy="15"
                  r="16"
                  fill={currentTheme.ledActiveFill}
                  stroke={currentTheme.ledActiveStroke}
                  strokeWidth="2.5"
                  filter={`drop-shadow(0 0 12px ${currentTheme.ledGlowColor})`}
                />
                <circle cx="15" cy="15" r="7" fill="#ffffff" opacity="0.9" />
              </g>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
};
