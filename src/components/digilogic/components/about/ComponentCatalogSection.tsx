/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  Activity,
  ArrowRight,
  BarChart3,
  Binary,
  Box,
  CheckCircle2,
  Clock,
  Cpu,
  Database,
  GitMerge,
  Grid,
  Layers,
  Lightbulb,
  Minus,
  Radio,
  Search,
  Sliders,
  Sparkles,
  ToggleRight,
  Zap,
} from 'lucide-react';

interface ComponentDetail {
  id: string;
  name: string;
  category: 'gates' | 'inputs' | 'outputs' | 'arithmetic' | 'sequential';
  icon: React.ElementType;
  iconColor: string;
  equation?: string;
  summary: string;
  pinouts: { label: string; type: 'input' | 'output' }[];
  behavior: string;
  applications: string[];
}

export const ComponentCatalogSection: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedCompId, setSelectedCompId] = useState<string>('and-gate');

  const componentsList: ComponentDetail[] = useMemo(
    () => [
      // Basic Logic Gates
      {
        id: 'and-gate',
        name: 'AND Gate',
        category: 'gates',
        icon: GitMerge,
        iconColor: 'text-[#B4B4B4]',
        equation: 'Y = A · B',
        summary: 'Produces a High (1) output only when ALL connected inputs are High (1).',
        pinouts: [
          { label: 'Input A', type: 'input' },
          { label: 'Input B', type: 'input' },
          { label: 'Output Y', type: 'output' },
        ],
        behavior: 'Logical conjunction. If any input is 0, the output immediately falls to 0.',
        applications: ['Safety interlocks', 'Address decoding', 'Enable control circuits', 'Carry generation in adders'],
      },
      {
        id: 'or-gate',
        name: 'OR Gate',
        category: 'gates',
        icon: GitMerge,
        iconColor: 'text-[#B4B4B4]',
        equation: 'Y = A + B',
        summary: 'Produces a High (1) output when ANY of its inputs are High (1).',
        pinouts: [
          { label: 'Input A', type: 'input' },
          { label: 'Input B', type: 'input' },
          { label: 'Output Y', type: 'output' },
        ],
        behavior: 'Logical disjunction. Output is Low (0) only when all inputs are 0.',
        applications: ['Alarm triggers', 'Parallel data buses', 'Carry propagation', 'Multi-source enable lines'],
      },
      {
        id: 'not-gate',
        name: 'NOT Gate (Inverter)',
        category: 'gates',
        icon: Zap,
        iconColor: 'text-[#B4B4B4]',
        equation: "Y = A'",
        summary: 'Inverts the incoming signal: converts 0 to 1 and 1 to 0.',
        pinouts: [
          { label: 'Input A', type: 'input' },
          { label: 'Output Y', type: 'output' },
        ],
        behavior: 'Logical complementation. Single-input fundamental logic element.',
        applications: ['Active-low signal inversion', 'Clock generators (ring oscillators)', 'Complement arithmetic'],
      },
      {
        id: 'nand-gate',
        name: 'NAND Gate',
        category: 'gates',
        icon: GitMerge,
        iconColor: 'text-[#B4B4B4]',
        equation: "Y = (A · B)'",
        summary: 'Universal Gate: Output is 0 only when all inputs are 1; otherwise 1.',
        pinouts: [
          { label: 'Input A', type: 'input' },
          { label: 'Input B', type: 'input' },
          { label: 'Output Y', type: 'output' },
        ],
        behavior: 'Functionally complete. Any digital logic circuit can be built entirely with NAND gates.',
        applications: ['Flash memory cell arrays', 'Universal digital IC design', 'CMOS logic minimization'],
      },
      {
        id: 'nor-gate',
        name: 'NOR Gate',
        category: 'gates',
        icon: GitMerge,
        iconColor: 'text-[#E8E8E8]',
        equation: "Y = (A + B)'",
        summary: 'Universal Gate: Output is 1 only when all inputs are 0; otherwise 0.',
        pinouts: [
          { label: 'Input A', type: 'input' },
          { label: 'Input B', type: 'input' },
          { label: 'Output Y', type: 'output' },
        ],
        behavior: 'Functionally complete. Inverted OR logic with universal synthesis capabilities.',
        applications: ['SR latch cross-coupling', 'High-speed address decoders', 'Universal logic'],
      },
      {
        id: 'xor-gate',
        name: 'XOR Gate (Exclusive-OR)',
        category: 'gates',
        icon: GitMerge,
        iconColor: 'text-[#E8E8E8]',
        equation: 'Y = A ⊕ B',
        summary: 'Outputs 1 when an odd number of inputs are High. Detects inequality.',
        pinouts: [
          { label: 'Input A', type: 'input' },
          { label: 'Input B', type: 'input' },
          { label: 'Output Y', type: 'output' },
        ],
        behavior: 'Modulo-2 addition without carry. Outputs 1 when inputs differ.',
        applications: ['Binary addition (Sum bit in Adders)', 'Parity bit generators', 'Pseudorandom LFSR counters'],
      },
      {
        id: 'xnor-gate',
        name: 'XNOR Gate (Equivalence)',
        category: 'gates',
        icon: GitMerge,
        iconColor: 'text-[#B4B4B4]',
        equation: 'Y = A ⊙ B',
        summary: 'Outputs 1 when inputs are identical (both 0 or both 1).',
        pinouts: [
          { label: 'Input A', type: 'input' },
          { label: 'Input B', type: 'input' },
          { label: 'Output Y', type: 'output' },
        ],
        behavior: 'Equality comparator. Detects identical binary values.',
        applications: ['Magnitude comparison', 'Bit parity verification', 'Data equivalence checkers'],
      },
      {
        id: 'tri-state',
        name: 'Tri-State Buffer',
        category: 'gates',
        icon: Sliders,
        iconColor: 'text-[#B4B4B4]',
        equation: 'Y = En ? A : High-Z',
        summary: 'Outputs signal A when Enable=1; enters high-impedance (Floating Z) when Enable=0.',
        pinouts: [
          { label: 'Data In (A)', type: 'input' },
          { label: 'Enable (En)', type: 'input' },
          { label: 'Output (Y)', type: 'output' },
        ],
        behavior: 'Allows multiple chips to share a single bidirectional bus without electrical contention.',
        applications: ['Shared microprocessor buses', 'Bidirectional memory I/O', 'Multiplexed communications'],
      },

      // Input Sources
      {
        id: 'toggle-switch',
        name: 'Toggle Switch',
        category: 'inputs',
        icon: ToggleRight,
        iconColor: 'text-[#B4B4B4]',
        summary: 'Latching interactive binary input switch (toggles between 0 and 1 on click/touch).',
        pinouts: [{ label: 'Output State', type: 'output' }],
        behavior: 'Retains output logic level until tapped again. Tactile click feedback.',
        applications: ['Circuit inputs', 'Configuration DIP switches', 'Test vector injection'],
      },
      {
        id: 'push-button',
        name: 'Push Button',
        category: 'inputs',
        icon: Radio,
        iconColor: 'text-[#B4B4B4]',
        summary: 'Momentary contact pushbutton. High (1) while pressed; Low (0) when released.',
        pinouts: [{ label: 'Pulse Out', type: 'output' }],
        behavior: 'Manual clock pulses, manual reset triggers, and test step inputs.',
        applications: ['Manual reset lines', 'Single-cycle trigger', 'Interactive user inputs'],
      },
      {
        id: 'clock-gen',
        name: 'Clock Generator',
        category: 'inputs',
        icon: Clock,
        iconColor: 'text-[#E8E8E8]',
        summary: 'Continuous square wave oscillation pulse generator at variable frequency.',
        pinouts: [{ label: 'Clock Signal (CLK)', type: 'output' }],
        behavior: 'Oscillates symmetrically between 0 and 1 according to the simulation Hz setting.',
        applications: ['Synchronous counters', 'Flip-flop timing', 'CPU microcode stepping', 'Shift registers'],
      },
      {
        id: 'vcc-constant',
        name: 'VCC (+5V / High 1)',
        category: 'inputs',
        icon: Zap,
        iconColor: 'text-[#B4B4B4]',
        summary: 'Hardwired Logic High (+5V / 1) power rail.',
        pinouts: [{ label: 'Constant 1', type: 'output' }],
        behavior: 'Always outputs 1. Never changes state.',
        applications: ['Pull-up resistors', 'Active-high enable pins', 'Preset inputs'],
      },
      {
        id: 'gnd-constant',
        name: 'GND (0V / Low 0)',
        category: 'inputs',
        icon: Minus,
        iconColor: 'text-[#F5F5F5]/60',
        summary: 'Hardwired Ground reference (0V / 0) logic low rail.',
        pinouts: [{ label: 'Constant 0', type: 'output' }],
        behavior: 'Always outputs 0.',
        applications: ['Active-low ground reference', 'Zero tie-down lines', 'Unused pin termination'],
      },

      // Output Displays
      {
        id: 'probe-meter',
        name: 'Logic Voltage Probe',
        category: 'outputs',
        icon: Activity,
        iconColor: 'text-[#B4B4B4]',
        summary: 'Displays exact real-time digital logic level (0, 1, High-Z floating, or Error X).',
        pinouts: [{ label: 'Probe In', type: 'input' }],
        behavior: 'Instantaneous logic inspector that illuminates emerald on 1 and slate on 0.',
        applications: ['Diagnostic debugging', 'Pin voltage measurement', 'Truth verification'],
      },
      {
        id: 'led-lamp',
        name: 'LED Indicator',
        category: 'outputs',
        icon: Lightbulb,
        iconColor: 'text-[#B4B4B4]',
        summary: 'Vibrant glowing digital lamp with realistic optical glow bloom when energized.',
        pinouts: [{ label: 'Anode In', type: 'input' }],
        behavior: 'Lights up bright glowing emerald when input is 1; dims when input is 0.',
        applications: ['Status indicators', 'Binary output lights', 'Visual alarms'],
      },
      {
        id: 'hex-display',
        name: 'Hexadecimal Display',
        category: 'outputs',
        icon: Binary,
        iconColor: 'text-[#B4B4B4]',
        summary: 'Decodes 4-bit binary inputs (D3, D2, D1, D0) directly into Hex characters (0-9, A-F).',
        pinouts: [
          { label: 'D0 (LSB)', type: 'input' },
          { label: 'D1', type: 'input' },
          { label: 'D2', type: 'input' },
          { label: 'D3 (MSB)', type: 'input' },
        ],
        behavior: 'Internal BCD-to-Hex decoder with crisp 7-segment digital rendering.',
        applications: ['ALU result readout', 'Memory address monitoring', '4-bit counter values'],
      },
      {
        id: 'segment-7',
        name: '7-Segment Display (Raw)',
        category: 'outputs',
        icon: Grid,
        iconColor: 'text-[#E8E8E8]',
        summary: 'Raw 7-segment LED array with individual pins for segments a, b, c, d, e, f, g, and DP.',
        pinouts: [
          { label: 'Seg A', type: 'input' },
          { label: 'Seg B', type: 'input' },
          { label: 'Seg C', type: 'input' },
          { label: 'Seg D', type: 'input' },
          { label: 'Seg E', type: 'input' },
          { label: 'Seg F', type: 'input' },
          { label: 'Seg G', type: 'input' },
          { label: 'Decimal Pt', type: 'input' },
        ],
        behavior: 'Enables custom decoder design and character pattern generation.',
        applications: ['Digital clocks', 'Custom segment drivers', 'Educational display labs'],
      },

      // Arithmetic & Complex MSI
      {
        id: 'half-adder',
        name: 'Half Adder (HA)',
        category: 'arithmetic',
        icon: Cpu,
        iconColor: 'text-[#B4B4B4]',
        equation: 'Sum = A ⊕ B, Carry = A · B',
        summary: 'Fundamental 1-bit binary adder producing Sum and Carry-out.',
        pinouts: [
          { label: 'Input A', type: 'input' },
          { label: 'Input B', type: 'input' },
          { label: 'Sum (S)', type: 'output' },
          { label: 'Carry (C)', type: 'output' },
        ],
        behavior: 'Combines an XOR gate for Sum and an AND gate for Carry.',
        applications: ['Arithmetic logic units', 'Multiplier matrices', 'Incrementers'],
      },
      {
        id: 'full-adder',
        name: 'Full Adder (FA)',
        category: 'arithmetic',
        icon: Cpu,
        iconColor: 'text-[#B4B4B4]',
        equation: 'Sum = A ⊕ B ⊕ Cin, Cout = (A·B) + Cin(A⊕B)',
        summary: 'Complete 1-bit binary adder that handles Carry-In from preceding lower-order stages.',
        pinouts: [
          { label: 'Input A', type: 'input' },
          { label: 'Input B', type: 'input' },
          { label: 'Carry In (Cin)', type: 'input' },
          { label: 'Sum (S)', type: 'output' },
          { label: 'Carry Out (Cout)', type: 'output' },
        ],
        behavior: 'Cascadable to build N-bit parallel binary adders and subtractors.',
        applications: ['N-bit ripple carry adders', 'Arithmetic processors', 'Calculators'],
      },
      {
        id: 'mux-4-1',
        name: '4:1 Multiplexer (Data Selector)',
        category: 'arithmetic',
        icon: Sliders,
        iconColor: 'text-[#B4B4B4]',
        equation: 'Y = D0·S1\'S0\' + D1·S1\'S0 + D2·S1S0\' + D3·S1S0',
        summary: 'Routes one of four data inputs (D0..D3) to a single output line based on 2 select bits.',
        pinouts: [
          { label: 'D0..D3 Inputs', type: 'input' },
          { label: 'S0, S1 Selects', type: 'input' },
          { label: 'Output Y', type: 'output' },
        ],
        behavior: 'Digital switch matrix for routing multiple data streams through a shared channel.',
        applications: ['CPU register selection', 'Parallel-to-serial conversion', 'Boolean function synthesis'],
      },
      {
        id: 'alu-4bit',
        name: '4-Bit Parallel ALU (Adder)',
        category: 'arithmetic',
        icon: Cpu,
        iconColor: 'text-[#E8E8E8]',
        summary: 'Parallel 4-bit binary adder with carry-in and carry-out pins.',
        pinouts: [
          { label: 'A[3..0] 4-Bit Bus', type: 'input' },
          { label: 'B[3..0] 4-Bit Bus', type: 'input' },
          { label: 'Cin', type: 'input' },
          { label: 'Sum[3..0]', type: 'output' },
          { label: 'Cout', type: 'output' },
        ],
        behavior: 'Adds two 4-bit binary words simultaneously with fast ripple-carry propagation.',
        applications: ['Microprocessor ALU core', 'Binary calculators', 'DSP units'],
      },

      // Sequential Logic & Memory
      {
        id: 'd-flip-flop',
        name: 'D Flip-Flop (Edge-Triggered)',
        category: 'sequential',
        icon: Database,
        iconColor: 'text-[#B4B4B4]',
        summary: 'Captures input data D on the rising clock edge and holds it at output Q.',
        pinouts: [
          { label: 'Data (D)', type: 'input' },
          { label: 'Clock (CLK)', type: 'input' },
          { label: 'Reset (RST)', type: 'input' },
          { label: 'Output (Q)', type: 'output' },
          { label: 'Inverted (Q\')', type: 'output' },
        ],
        behavior: 'Fundamental building block of synchronous digital registers and computer memory.',
        applications: ['Pipeline registers', 'Data synchronizers', 'Shift registers', 'State machines'],
      },
      {
        id: 'jk-flip-flop',
        name: 'JK Flip-Flop (Universal)',
        category: 'sequential',
        icon: Database,
        iconColor: 'text-[#B4B4B4]',
        summary: 'Universal flip-flop with Set (J=1, K=0), Reset (J=0, K=1), Hold, and Toggle (J=1, K=1).',
        pinouts: [
          { label: 'J (Set)', type: 'input' },
          { label: 'K (Reset)', type: 'input' },
          { label: 'Clock (CLK)', type: 'input' },
          { label: 'Output (Q)', type: 'output' },
          { label: 'Inverted (Q\')', type: 'output' },
        ],
        behavior: 'Eliminates invalid state of SR latches with a dependable toggle function.',
        applications: ['Synchronous counters', 'Frequency division', 'State sequence generators'],
      },
      {
        id: 'counter-4bit',
        name: '4-Bit Binary Counter',
        category: 'sequential',
        icon: Database,
        iconColor: 'text-[#E8E8E8]',
        summary: 'Modulo-16 synchronous binary up-counter (counts 0 to 15 on clock pulses).',
        pinouts: [
          { label: 'Clock (CLK)', type: 'input' },
          { label: 'Enable (EN)', type: 'input' },
          { label: 'Reset (RST)', type: 'input' },
          { label: 'Q0..Q3 Count', type: 'output' },
          { label: 'Terminal Count', type: 'output' },
        ],
        behavior: 'Advances binary output by +1 on each clock rising edge when enabled.',
        applications: ['Program counters (PC)', 'Frequency divider', 'Event timers', 'Address sequencers'],
      },
      {
        id: 'custom-ic',
        name: 'Custom IC Subcircuit',
        category: 'sequential',
        icon: Box,
        iconColor: 'text-[#B4B4B4]',
        summary: 'Modular custom integrated circuit packaged from any subcircuit schematic.',
        pinouts: [
          { label: 'Custom Inputs', type: 'input' },
          { label: 'Custom Outputs', type: 'output' },
        ],
        behavior: 'Encapsulates complex logic into a reusable black-box chip with custom pin names.',
        applications: ['Hierarchical system design', 'Custom 8-bit ALUs', 'Complex microarchitecture'],
      },
    ],
    []
  );

  const categories = [
    { id: 'all', label: 'All Components' },
    { id: 'gates', label: 'Logic Gates (AND/OR/XOR)' },
    { id: 'inputs', label: 'Inputs & Clocks' },
    { id: 'outputs', label: 'Displays & Meters' },
    { id: 'arithmetic', label: 'Arithmetic & ALUs' },
    { id: 'sequential', label: 'Memory & Flip-Flops' },
  ];

  const filteredComponents = useMemo(() => {
    return componentsList.filter((comp) => {
      const matchesCat = activeCategory === 'all' || comp.category === activeCategory;
      const matchesQuery =
        !searchQuery ||
        comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (comp.equation && comp.equation.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCat && matchesQuery;
    });
  }, [componentsList, activeCategory, searchQuery]);

  const selectedComp = componentsList.find((c) => c.id === selectedCompId) || componentsList[0];
  const SelectedIcon = selectedComp.icon;

  return (
    <section id="components" className="py-12 sm:py-16 border-b border-[#FFFFFF]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFFFFF]/10 border border-[#FFFFFF]/30 text-[#E8E8E8] text-xs font-mono mb-4">
            <Cpu className="w-3.5 h-3.5" />
            <span>Component & IC Catalog</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#F5F5F5] tracking-tight leading-tight mb-4">
            Comprehensive Digital <span className="text-[#E8E8E8]">Component Encyclopedia</span>
          </h2>
          <p className="text-sm sm:text-base text-[#F5F5F5]/60 leading-relaxed">
            Every gate, input source, display output, arithmetic unit, and sequential memory IC in the simulator is documented below with equations, pinouts, and use cases.
          </p>
        </div>

        {/* Search & Category Filter Controls */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-2 md:pb-0">
            {categories.map((cat) => {
              const isSelected = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-[#FFFFFF] text-[#000000] font-bold shadow-lg shadow-[#FFFFFF]/20'
                      : 'bg-[#000000] hover:bg-[#141415] text-[#E8E8E8] border border-[#FFFFFF]/20'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-[#F5F5F5]/60 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search components or equations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[#000000] border border-[#FFFFFF]/20 rounded-xl text-xs text-[#F5F5F5] placeholder:text-[#F5F5F5]/45 focus:outline-none focus:border-[#FFFFFF] font-mono"
            />
          </div>
        </div>

        {/* Main Grid: Left Component Cards + Right Selected Inspector Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Grid: Component Thumbnails */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[620px] overflow-y-auto pr-1">
            {filteredComponents.map((comp) => {
              const CompIcon = comp.icon;
              const isSelected = comp.id === selectedCompId;
              return (
                <button
                  key={comp.id}
                  onClick={() => setSelectedCompId(comp.id)}
                  className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between group active:scale-98 ${
                    isSelected
                      ? 'bg-[#141415] border-[#FFFFFF] ring-2 ring-[#FFFFFF]/40 shadow-xl'
                      : 'bg-[#000000] border-[#FFFFFF]/20 hover:border-[#FFFFFF]/50 hover:bg-[#141415]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-[#000000] border border-[#FFFFFF]/20 flex items-center justify-center ${comp.iconColor} group-hover:scale-110 transition-transform`}>
                        <CompIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-[#F5F5F5] group-hover:text-[#E8E8E8] transition-colors">{comp.name}</h4>
                        {comp.equation && (
                          <span className="text-[11px] font-mono text-[#E8E8E8] bg-[#FFFFFF]/10 px-1.5 py-0.5 rounded">
                            {comp.equation}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-[#F5F5F5]/60 line-clamp-2 leading-relaxed">
                    {comp.summary}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Right Column: In-Depth Component Deep Dive HUD */}
          <div className="lg:col-span-5 bg-[#141415] border border-[#FFFFFF]/30 rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col justify-between">
            <div>
              {/* Header with Large Icon */}
              <div className="flex items-center gap-4 mb-6 pb-4 border-b border-[#FFFFFF]/20">
                <div className="w-16 h-16 rounded-2xl bg-[#FFFFFF]/20 border border-[#FFFFFF]/40 text-[#E8E8E8] flex items-center justify-center shadow-lg shadow-[#FFFFFF]/20 shrink-0">
                  <SelectedIcon className="w-9 h-9" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#E8E8E8] bg-[#FFFFFF]/10 px-2 py-0.5 rounded-full border border-[#FFFFFF]/30">
                    {selectedComp.category.toUpperCase()}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#F5F5F5] mt-1">
                    {selectedComp.name}
                  </h3>
                  {selectedComp.equation && (
                    <div className="text-xs font-mono font-bold text-[#E8E8E8] mt-0.5">
                      Boolean Expression: {selectedComp.equation}
                    </div>
                  )}
                </div>
              </div>

              {/* Summary Description */}
              <div className="mb-5">
                <h5 className="text-xs font-bold font-mono text-[#F5F5F5]/60 uppercase tracking-wider mb-1.5">Overview</h5>
                <p className="text-sm text-[#F5F5F5] leading-relaxed">
                  {selectedComp.summary}
                </p>
              </div>

              {/* Behavior & Logic Rules */}
              <div className="mb-5 bg-[#000000] border border-[#FFFFFF]/20 rounded-2xl p-3.5">
                <h5 className="text-xs font-bold font-mono text-[#E8E8E8] uppercase tracking-wider mb-1">Operational Logic</h5>
                <p className="text-xs text-[#E8E8E8] leading-relaxed">
                  {selectedComp.behavior}
                </p>
              </div>

              {/* Pinouts */}
              <div className="mb-5">
                <h5 className="text-xs font-bold font-mono text-[#F5F5F5]/60 uppercase tracking-wider mb-2">Pin Connections</h5>
                <div className="flex flex-wrap gap-2">
                  {selectedComp.pinouts.map((pin, i) => (
                    <span
                      key={i}
                      className={`px-2.5 py-1 rounded-lg text-xs font-mono border ${
                        pin.type === 'input'
                          ? 'bg-[#FFFFFF]/10 border-[#FFFFFF]/30 text-[#E8E8E8]'
                          : 'bg-[#B4B4B4]/10 border-[#B4B4B4]/30 text-[#B4B4B4]'
                      }`}
                    >
                      {pin.type === 'input' ? '▼ IN: ' : '▲ OUT: '}{pin.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Applications */}
            <div className="pt-4 border-t border-[#FFFFFF]/20">
              <h5 className="text-xs font-bold font-mono text-[#F5F5F5]/60 uppercase tracking-wider mb-2">Real-World Engineering Applications</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {selectedComp.applications.map((app, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-[#E8E8E8]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#E8E8E8] shrink-0" />
                    <span>{app}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
