/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Activity,
  Award,
  BookOpen,
  Box,
  Copy,
  Database,
  Download,
  FileCode2,
  FlipHorizontal,
  Grid,
  Maximize2,
  Minus,
  Pause,
  Play,
  Redo2,
  RotateCcw,
  RotateCw,
  Sliders,
  Sparkles,
  Spline,
  StepForward,
  Table,
  Trash2,
  Undo2,
  Upload,
  Users,
  Volume2,
  ZoomIn,
  ZoomOut,
  Keyboard,
} from 'lucide-react';

interface ActionItem {
  id: string;
  name: string;
  category: 'simulation' | 'wiring' | 'editing' | 'analysis' | 'project';
  icon: React.ElementType;
  iconColor: string;
  shortcut?: string;
  description: string;
  detailedNotes: string;
}

export const ToolbarActionsGuide: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('all');

  const actions: ActionItem[] = [
    // Simulation Engine Controls
    {
      id: 'play-pause',
      name: 'Run / Pause Engine',
      category: 'simulation',
      icon: Play,
      iconColor: 'text-[#DFCCA8]',
      shortcut: 'Spacebar',
      description: 'Toggles active continuous clock simulation on and off.',
      detailedNotes: 'When active, clock oscillators tick automatically and signals propagate continuously through all gates.',
    },
    {
      id: 'step-forward',
      name: 'Single Clock Step',
      category: 'simulation',
      icon: StepForward,
      iconColor: 'text-[#76B4C2]',
      shortcut: 'Period (.)',
      description: 'Advances the simulation by exactly one clock cycle.',
      detailedNotes: 'Allows micro-stepping through state machines, registers, and flip-flops to inspect race conditions.',
    },
    {
      id: 'reset-signals',
      name: 'Reset Signals',
      category: 'simulation',
      icon: RotateCcw,
      iconColor: 'text-[#DFCCA8]',
      shortcut: 'R (with no selection)',
      description: 'Resets all active circuit wire voltages and flip-flop registers to Low (0V / 0).',
      detailedNotes: 'Instantly discharges all signals without deleting components or wires.',
    },
    {
      id: 'speed-hz',
      name: 'Clock Speed (Hz)',
      category: 'simulation',
      icon: Sliders,
      iconColor: 'text-[#DFCCA8]',
      shortcut: '1 - 5',
      description: 'Adjusts simulation clock frequency between 1Hz, 5Hz, 10Hz, 20Hz, 30Hz, and 60Hz.',
      detailedNotes: 'Lower speeds (1Hz) are perfect for teaching and visual signal tracking; higher speeds (60Hz) simulate fast microcode.',
    },

    // Wiring & Canvas Modes
    {
      id: 'wire-orthogonal',
      name: 'Orthogonal Wire Routing',
      category: 'wiring',
      icon: Spline,
      iconColor: 'text-[#76B4C2]',
      shortcut: 'W',
      description: '90-degree Manhattan auto-routing for clean, professional schematics.',
      detailedNotes: 'Automatically calculates right-angle path corridors avoiding component collision overlap.',
    },
    {
      id: 'wire-curved',
      name: 'Curved Bezier Routing',
      category: 'wiring',
      icon: Sparkles,
      iconColor: 'text-[#76B4C2]',
      description: 'Smooth cubic Bezier curve wire routing.',
      detailedNotes: 'Renders organic curved wires reminiscent of analog patch cords.',
    },
    {
      id: 'wire-straight',
      name: 'Straight Line Routing',
      category: 'wiring',
      icon: Minus,
      iconColor: 'text-[#76B4C2]',
      description: 'Direct point-to-point straight line wiring.',
      detailedNotes: 'Minimalist direct connection style for high-density bus diagrams.',
    },
    {
      id: 'grid-snap',
      name: 'Snap to Grid',
      category: 'wiring',
      icon: Grid,
      iconColor: 'text-[#76B4C2]',
      shortcut: 'G',
      description: 'Snaps components and wire vertices to the 10px / 20px vector grid.',
      detailedNotes: 'Maintains pixel-perfect alignment across pins, wires, and bus lines.',
    },
    {
      id: 'fit-screen',
      name: 'Fit to Screen',
      category: 'wiring',
      icon: Maximize2,
      iconColor: 'text-[#76B4C2]',
      shortcut: 'Home / 0',
      description: 'Automatically pans and zooms the canvas to frame all drawn components.',
      detailedNotes: 'Instantly recovers your circuit viewport if you get lost on the infinite canvas.',
    },

    // Editing & History Operations
    {
      id: 'undo',
      name: 'Undo Action',
      category: 'editing',
      icon: Undo2,
      iconColor: 'text-[#DFCCA8]',
      shortcut: 'Ctrl + Z (Cmd + Z)',
      description: 'Reverses the last component placement, wire connection, deletion, or movement.',
      detailedNotes: 'Supports multi-level undo stack with zero memory degradation.',
    },
    {
      id: 'redo',
      name: 'Redo Action',
      category: 'editing',
      icon: Redo2,
      iconColor: 'text-[#DFCCA8]',
      shortcut: 'Ctrl + Y (Cmd + Shift + Z)',
      description: 'Re-applies the previously undone action.',
      detailedNotes: 'Restores the exact previous canvas state.',
    },
    {
      id: 'duplicate',
      name: 'Duplicate Selection',
      category: 'editing',
      icon: Copy,
      iconColor: 'text-[#76B4C2]',
      shortcut: 'Ctrl + D (Cmd + D)',
      description: 'Duplicates all selected gates, pins, and inter-connected wires.',
      detailedNotes: 'Offsets cloned elements cleanly for rapid circuit expansion.',
    },
    {
      id: 'rotate',
      name: 'Rotate Gate 90°',
      category: 'editing',
      icon: RotateCw,
      iconColor: 'text-[#76B4C2]',
      shortcut: 'R (with selection)',
      description: 'Rotates selected component orientation clockwise by 90 degrees.',
      detailedNotes: 'Adapts pin positions seamlessly for vertical or reverse bus routing.',
    },
    {
      id: 'flip',
      name: 'Flip Horizontal',
      category: 'editing',
      icon: FlipHorizontal,
      iconColor: 'text-[#76B4C2]',
      shortcut: 'F',
      description: 'Flips input and output terminal orientations horizontally.',
      detailedNotes: 'Enables reverse right-to-left signal flow and feedback loops.',
    },
    {
      id: 'delete',
      name: 'Delete Selection',
      category: 'editing',
      icon: Trash2,
      iconColor: 'text-[#DFCCA8]',
      shortcut: 'Delete / Backspace',
      description: 'Deletes selected components and removes attached wire links safely.',
      detailedNotes: 'Supports bulk multi-selection deletion with clean orphan wire pruning.',
    },

    // Advanced Analysis Instruments
    {
      id: 'truth-table',
      name: 'Truth Table Solver',
      category: 'analysis',
      icon: Table,
      iconColor: 'text-[#76B4C2]',
      shortcut: 'T',
      description: 'Automatically analyzes all input permutations (2^N) and generates the complete truth table.',
      detailedNotes: 'Extracts canonical minterms, maxterms, and highlights active state combinations.',
    },
    {
      id: 'boolean-tool',
      name: 'Boolean Algebra Minimizer',
      category: 'analysis',
      icon: FileCode2,
      iconColor: 'text-[#76B4C2]',
      shortcut: 'B',
      description: 'Extracts Sum-of-Products (SOP) and Product-of-Sums (POS) algebraic equations.',
      detailedNotes: 'Provides step-by-step simplification applying De Morgan’s laws and Boolean theorems.',
    },
    {
      id: 'kmap-solver',
      name: 'Karnaugh Map (K-Map)',
      category: 'analysis',
      icon: Sparkles,
      iconColor: 'text-[#76B4C2]',
      shortcut: 'K',
      description: 'Visual 2, 3, and 4-variable Gray code Karnaugh map with colored prime implicant loop overlays.',
      detailedNotes: 'Generates minimal non-redundant SOP equations with don’t-care (X) term optimization.',
    },
    {
      id: 'oscilloscope',
      name: 'Digital Oscilloscope',
      category: 'analysis',
      icon: Activity,
      iconColor: 'text-[#DFCCA8]',
      shortcut: 'O',
      description: 'Multi-channel digital logic analyzer recording signal transitions across time.',
      detailedNotes: 'Live timing diagram showing clock synchronization, propagation delays, and glitch spikes.',
    },
    {
      id: 'custom-gate',
      name: 'Custom IC Builder',
      category: 'analysis',
      icon: Box,
      iconColor: 'text-[#76B4C2]',
      description: 'Packages any selected schematic into a reusable modular IC black-box chip.',
      detailedNotes: 'Define custom pin names, chip label, and reuse inside larger parent circuits.',
    },

    // Project & Social Operations
    {
      id: 'saved-circuits',
      name: 'Saved Circuits Manager',
      category: 'project',
      icon: Database,
      iconColor: 'text-[#76B4C2]',
      shortcut: 'Ctrl + S',
      description: 'Save, load, and manage your circuits locally with automatic version timestamps.',
      detailedNotes: 'Stores circuits with thumbnail metadata for instant offline recovery.',
    },
    {
      id: 'import-export',
      name: 'Import & Export JSON',
      category: 'project',
      icon: Upload,
      iconColor: 'text-[#76B4C2]',
      description: 'Export circuits as portable, human-readable JSON files or import shared schematics.',
      detailedNotes: 'Fully interoperable format containing component positions, wire maps, and custom gates.',
    },
    {
      id: 'challenges',
      name: 'Challenge & Puzzle Arena',
      category: 'project',
      icon: Award,
      iconColor: 'text-[#DFCCA8]',
      description: '20+ graded interactive digital logic puzzles ranging from basic gate challenges to ALU design.',
      detailedNotes: 'Automated test suite tests your circuit against all truth table vectors for verification.',
    },
    {
      id: 'education-wiki',
      name: 'Educational Logic Wiki',
      category: 'project',
      icon: BookOpen,
      iconColor: 'text-[#76B4C2]',
      description: 'Interactive educational reference guide explaining Boolean theorems, gates, and sequential circuits.',
      detailedNotes: 'Built-in theory notes, formula sheets, and circuit design principles.',
    },
    {
      id: 'collaborate',
      name: 'Multiplayer Real-Time Room',
      category: 'project',
      icon: Users,
      iconColor: 'text-[#76B4C2]',
      description: 'Synchronous live room sharing with peer cursor tracking and collaborative editing.',
      detailedNotes: 'Join or host rooms with 6-character room codes for lab team projects.',
    },
  ];

  const categories = [
    { id: 'all', label: 'All Toolbar Actions' },
    { id: 'simulation', label: 'Simulation Controls' },
    { id: 'wiring', label: 'Wiring & Canvas Modes' },
    { id: 'editing', label: 'Editing & History' },
    { id: 'analysis', label: 'Logic & Math Tools' },
    { id: 'project', label: 'Project & Social' },
  ];

  const filteredActions = activeTab === 'all' ? actions : actions.filter((a) => a.category === activeTab);

  return (
    <section id="toolbar" className="py-12 sm:py-16 border-b border-[#A58D66]/20 bg-[#080f14]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#76B4C2]/10 border border-[#76B4C2]/30 text-[#76B4C2] text-xs font-mono mb-4">
            <Sliders className="w-3.5 h-3.5" />
            <span>Toolbar & Function Directory</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#E5E1DD] tracking-tight leading-tight mb-4">
            Every Button & Feature <span className="text-[#76B4C2]">Demystified</span>
          </h2>
          <p className="text-sm sm:text-base text-[#E5E1DD]/60 leading-relaxed">
            A comprehensive reference for every button, keyboard shortcut, wire mode, and analytical instrument accessible across the DigiLogic Studio.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {categories.map((cat) => {
            const isSelected = activeTab === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveTab(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  isSelected
                    ? 'bg-[#A58D66] text-[#080f14] font-bold shadow-lg shadow-[#A58D66]/20 scale-105'
                    : 'bg-[#080f14] hover:bg-[#0d171f] text-[#DFCCA8] border border-[#A58D66]/20'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredActions.map((action) => {
            const Icon = action.icon;
            return (
              <div
                key={action.id}
                className="bg-[#0d171f] border border-[#A58D66]/20 hover:border-[#A58D66]/50 rounded-2xl p-5 flex flex-col justify-between group hover:bg-[#0d171f]/80 transition-all shadow-lg"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-[#080f14] border border-[#A58D66]/20 flex items-center justify-center ${action.iconColor} group-hover:scale-110 transition-transform shadow-inner`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-[#E5E1DD] group-hover:text-[#DFCCA8] transition-colors">
                          {action.name}
                        </h4>
                        <span className="text-[10px] font-mono text-[#E5E1DD]/60 uppercase tracking-wider">
                          {action.category}
                        </span>
                      </div>
                    </div>
                    {action.shortcut && (
                      <span className="flex items-center gap-1 text-[10px] font-mono text-[#76B4C2] bg-[#76B4C2]/10 border border-[#76B4C2]/30 px-2 py-0.5 rounded-md shrink-0">
                        <Keyboard className="w-3 h-3" />
                        <span>{action.shortcut}</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#DFCCA8] font-medium leading-relaxed mb-3">
                    {action.description}
                  </p>
                </div>
                <div className="pt-3 border-t border-[#A58D66]/15 text-[11px] text-[#E5E1DD]/60 leading-relaxed font-sans">
                  {action.detailedNotes}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
