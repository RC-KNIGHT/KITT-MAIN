/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  MoreHorizontal,
  Cpu,
  FlipHorizontal,
  RotateCw,
  Sliders,
  Play,
  Table,
  Activity,
  Users,
  Box,
  Palette,
  Settings,
  Zap,
  Save,
  Split,
  Eye,
  Copy,
  Lock,
  Spline,
  Sparkles,
  Tag,
} from 'lucide-react';

interface ZoneGuide {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  badge: string;
  description: string;
  tools: {
    name: string;
    icon: React.ElementType;
    badge?: string;
    detail: string;
  }[];
}

export const StudioVisualGuide: React.FC = () => {
  const [activeZone, setActiveZone] = useState<string>('top-toolbar');

  const zones: ZoneGuide[] = [
    {
      id: 'top-toolbar',
      title: 'Top Simulation Toolbar & All Tools (...) Menu',
      subtitle: 'Clock engine, truth tables, K-maps, timing oscilloscope, and the permanent (...) menu',
      icon: MoreHorizontal,
      color: 'emerald',
      badge: 'Menu 1: Top Bar & (...)',
      description:
        'The main command bar at the top of the canvas hosts the simulation clock controls (Play/Step/Reset), wire style toggles, circuit name, and the permanent three dots (...) All Tools menu containing all analytical instruments, multiplayer rooms, and cloud export.',
      tools: [
        {
          name: 'Three Dots (...) All Features & Tools Menu',
          icon: MoreHorizontal,
          badge: '...',
          detail: 'Permanent quick-access menu in the top toolbar opening Truth Tables, K-Maps, Oscilloscope, Multiplayer Rooms, Settings, and Schematics.',
        },
        {
          name: 'Clock Engine (Play / Step / Reset)',
          icon: Play,
          detail: 'Start continuous clock oscillation (1Hz–60Hz), single-step execution for micro-timing debugging, or reset all logic signals to 0V.',
        },
        {
          name: 'Analytical Math Suite (Truth Table & K-Map)',
          icon: Table,
          badge: 'Math',
          detail: 'Instant Truth Table extraction of all 2^N states, Boolean SOP/POS minimization, and visual Karnaugh Map loop grouping.',
        },
        {
          name: 'Digital Oscilloscope & Waveforms',
          icon: Activity,
          badge: 'Scope',
          detail: 'Multi-channel digital logic timing diagram capturing signal transitions, clock pulses, and race conditions over time.',
        },
        {
          name: 'Multiplayer Collaboration Room',
          icon: Users,
          badge: 'Multiplayer',
          detail: 'Create or join live multiplayer rooms with 6-character room codes for synchronized circuit editing and remote classroom labs.',
        },
        {
          name: 'Schematic Storage & Export',
          icon: Save,
          detail: 'Save circuits locally, export clean JSON schematics, import shared projects, or render high-resolution PNG circuit diagrams.',
        },
      ],
    },
    {
      id: 'components-drawer',
      title: 'Left Component & IC Palette Drawer',
      subtitle: '35+ logic gates, arithmetic ICs, sequential flip-flops & custom chips',
      icon: Cpu,
      color: 'cyan',
      badge: 'Menu 2: Component Drawer',
      description:
        'The left component drawer organizes digital logic building blocks into searchable categories. Simply tap or drag any component onto the canvas to wire it instantly.',
      tools: [
        {
          name: 'Fundamental Logic Gates',
          icon: Zap,
          detail: 'AND, OR, NOT, NAND, NOR, XOR, XNOR, Buffer, and Tri-State High-Z gates with configurable 2 to 8 input pins.',
        },
        {
          name: 'Interactive Input Sources',
          icon: Box,
          detail: 'Toggle Switches, Push Buttons, Clock Generators, VCC (+5V 1), GND (0V 0), Pulse Generators, and PRNG Noise generators.',
        },
        {
          name: 'Output Probes & Displays',
          icon: Eye,
          detail: 'Live Voltage Probes, Color LEDs, 7-Segment Displays, Hex Displays (0-F), Decimal Displays, and 4-Bit Binary Bars.',
        },
        {
          name: 'MSI & Arithmetic ICs',
          icon: Cpu,
          detail: 'Half/Full Adders, Subtractors, 2:1 & 4:1 Multiplexers, Demuxes, 2:4 & 3:8 Decoders, Priority Encoders, and 4-Bit ALUs.',
        },
        {
          name: 'Sequential Memory & Latches',
          icon: Activity,
          detail: 'SR Latches, D Flip-Flops, JK Flip-Flops, T Flip-Flops, 4-Bit Synchronous Counters, and 4-Bit Shift/Parallel Registers.',
        },
        {
          name: 'Subcircuit IC Builder',
          icon: Sparkles,
          badge: 'Custom IC',
          detail: 'Package any wired circuit into a reusable custom IC chip with labeled input/output pins for hierarchical computer design.',
        },
      ],
    },
    {
      id: 'properties-hud',
      title: 'Component Operations Menu (Flip, Inputs & HUD)',
      subtitle: 'Flip horizontally/vertically, change input counts (2-8), custom names & live pin voltages',
      icon: FlipHorizontal,
      color: 'purple',
      badge: 'Menu 3: Flip & Operations',
      description:
        'The contextual right inspector and operations menu activates whenever you select any gate or wire. It provides instant Flip Horizontal, Rotate 90°, variable pin counts (2, 3, 4, 8 inputs), custom component naming, and live pin voltage HUD readouts.',
      tools: [
        {
          name: 'Flip & Rotate Operations (Flip / Rotate 90°)',
          icon: FlipHorizontal,
          badge: 'Flip',
          detail: 'Flip gates horizontally/vertically [F key] and rotate 90° clockwise [R key] for clean schematic wire alignment.',
        },
        {
          name: 'Change Number of Inputs (2, 3, 4, 8 Pins)',
          icon: Sliders,
          badge: 'Inputs',
          detail: 'Instantly reconfigure AND, OR, NAND, NOR, XOR, XNOR gates from 2 up to 8 inputs with automatic pin redistribution.',
        },
        {
          name: 'Component Name & Custom Labels',
          icon: Tag,
          detail: 'Assign custom signal names, net labels (e.g. Carry In, Data Enable), and descriptions directly to components.',
        },
        {
          name: 'Duplicate, Clone & Lock Position',
          icon: Copy,
          detail: 'Clone components with their configured settings [Ctrl+D] or lock their positions to prevent accidental drag on touchscreens.',
        },
        {
          name: 'Live Pin States & Voltage HUD',
          icon: Eye,
          badge: 'Voltages',
          detail: 'Real-time voltage readout on each individual input/output pin (HIGH 1, LOW 0, High-Z) during active simulation.',
        },
        {
          name: 'Wire Routing & Simulator Preferences',
          icon: Spline,
          badge: 'Routing',
          detail: 'Toggle between fluid curved bezier and orthogonal Manhattan wire styles, adjust touch sensitivity, and audio cues.',
        },
      ],
    },
  ];

  const currentZone = zones.find((z) => z.id === activeZone) || zones[0];

  return (
    <section id="studio-guide" className="py-12 sm:py-16 border-b border-[#A58D66]/20 bg-[#080f14]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#A58D66]/10 border border-[#A58D66]/30 text-[#DFCCA8] text-xs font-mono mb-4">
            <MoreHorizontal className="w-3.5 h-3.5" />
            <span>Workspace & Menus Architecture</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#E5E1DD] tracking-tight leading-tight mb-4">
            The 3 Core Menus & <span className="text-[#DFCCA8]">Toolbar Systems</span>
          </h2>
          <p className="text-sm sm:text-base text-[#E5E1DD]/60 leading-relaxed">
            DigiLogic Lab is organized into three unified control systems designed for maximum productivity on desktop, touchscreens, and tablets.
          </p>
        </div>

        {/* 3 Core Menu Selector Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {zones.map((zone) => {
            const Icon = zone.icon;
            const isSelected = activeZone === zone.id;
            return (
              <button
                key={zone.id}
                onClick={() => setActiveZone(zone.id)}
                className={`text-left p-5 rounded-2xl border transition-all duration-200 ${
                  isSelected
                    ? 'bg-[#0d171f] border-[#A58D66]/60 shadow-lg shadow-[#A58D66]/10 ring-1 ring-[#A58D66]/40'
                    : 'bg-[#080f14] border-[#A58D66]/20 hover:border-[#A58D66]/40 text-[#DFCCA8]'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                      isSelected
                        ? 'bg-[#A58D66]/20 text-[#DFCCA8] border border-[#A58D66]/40'
                        : 'bg-[#0d171f] text-[#E5E1DD]/60'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                      isSelected
                        ? 'bg-[#A58D66]/20 text-[#DFCCA8] border-[#A58D66]/40'
                        : 'bg-[#0d171f] text-[#E5E1DD]/60 border-[#A58D66]/20'
                    }`}
                  >
                    {zone.badge}
                  </span>
                </div>
                <h3 className="font-bold text-base text-[#E5E1DD] mb-1">{zone.title}</h3>
                <p className="text-xs text-[#E5E1DD]/60 line-clamp-2 leading-relaxed">{zone.subtitle}</p>
              </button>
            );
          })}
        </div>

        {/* Active Zone Detail Showcase Card */}
        <div className="bg-[#0d171f] border border-[#A58D66]/20 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-[#A58D66]/20">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold text-[#DFCCA8] px-2 py-0.5 rounded bg-[#A58D66]/10 border border-[#A58D66]/30">
                  {currentZone.badge}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-[#E5E1DD]">{currentZone.title}</h3>
              </div>
              <p className="text-sm text-[#DFCCA8] leading-relaxed max-w-3xl mt-1">
                {currentZone.description}
              </p>
            </div>
          </div>

          {/* Tools Grid inside this Zone */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentZone.tools.map((tool, idx) => {
              const ToolIcon = tool.icon;
              return (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-[#080f14] border border-[#A58D66]/20 hover:border-[#A58D66]/50 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#0d171f] text-[#DFCCA8] flex items-center justify-center">
                        <ToolIcon className="w-4 h-4" />
                      </div>
                      {tool.badge && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#A58D66]/10 text-[#DFCCA8] border border-[#A58D66]/30 font-semibold">
                          {tool.badge}
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-sm text-[#E5E1DD] mb-1.5">{tool.name}</h4>
                    <p className="text-xs text-[#E5E1DD]/60 leading-relaxed">{tool.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
