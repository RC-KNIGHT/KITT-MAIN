/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useCircuit } from '../../context/CircuitContext';
import { THEME_PRESETS } from '../../theme/themes';
import { createComponent } from '../../engine/componentFactory';
import {
  Compass,
  MousePointer,
  Hand,
  Sparkles,
  Cpu,
  Table,
  FileCode2,
  Download,
  Palette,
  Check,
  ChevronRight,
  ChevronLeft,
  X,
  Play,
  Zap,
  Sliders,
  Spline,
  CheckCircle2,
  Monitor,
  Tablet,
  RotateCcw,
  ArrowRight,
  HelpCircle,
  FolderOpen,
  Keyboard,
  Info,
} from 'lucide-react';

interface TutorialStep {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  pcTips: string[];
  tabletTips: string[];
  highlightFeatures: { label: string; desc: string; icon?: React.ComponentType<{ className?: string }> }[];
  demoAction?: {
    label: string;
    description: string;
  };
}

export const TutorialModal: React.FC = () => {
  const {
    activeModal,
    setActiveModal,
    theme,
    colorMode,
    loadCircuitData,
    setSidebarOpen,
    setInspectorOpen,
  } = useCircuit();

  const isLight = colorMode === 'light';
  const currentTheme = THEME_PRESETS[theme] || THEME_PRESETS.kitt_sovereign;
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [dontShowAgain, setDontShowAgain] = useState<boolean>(true);
  const [activeDeviceView, setActiveDeviceView] = useState<'all' | 'pc' | 'tablet'>('all');
  const [demoLoadedMessage, setDemoLoadedMessage] = useState<string | null>(null);

  // Tutorial Steps Definition
  const tutorialSteps: TutorialStep[] = [
    {
      id: 'navigation',
      badge: 'Step 1 of 7',
      title: 'Controls & Device Gestures (PC & Tablet)',
      subtitle: 'Seamless navigation designed for high-precision mouse and multi-touch tablets',
      icon: Compass,
      pcTips: [
        'Left-Click & Drag: Select, move components, or box-select multiple items.',
        'Right-Click or Del Key: Instantly delete or perform quick actions on selection.',
        'Mouse Wheel: Smoothly zoom in and out of the infinite circuit canvas.',
        'Spacebar + Drag or Middle Mouse Button: Pan the canvas in any direction.',
      ],
      tabletTips: [
        '1-Finger Tap: Select gates or toggle switches between ON (1) and OFF (0).',
        '1-Finger Drag: Move components smoothly across the grid.',
        '2-Finger Pinch: Zoom in for fine terminal wiring and zoom out for overview.',
        '2-Finger Drag: Pan the infinite canvas effortlessly without misplacing components.',
      ],
      highlightFeatures: [
        {
          label: 'Infinite Canvas Grid',
          desc: 'Pan & zoom freely with auto-snapping to an optimal 20px orthogonal layout grid.',
          icon: Sliders,
        },
        {
          label: 'Touch-First Precision',
          desc: 'Large 44px+ hit targets on ports and switches prevent accidental gestures on touchscreens.',
          icon: Hand,
        },
      ],
    },
    {
      id: 'placing',
      badge: 'Step 2 of 7',
      title: 'Placing Logic Gates, Inputs & Displays',
      subtitle: 'Access 20+ standard IEEE logic gates, clock generators, and digital readouts',
      icon: Cpu,
      pcTips: [
        'Open the left Component Library (or press "/" to quick search).',
        'Drag and drop any gate (AND, OR, NOT, XOR, NAND, NOR, XNOR) directly onto the canvas.',
        'Or click any component in the palette to spawn it in the workspace.',
      ],
      tabletTips: [
        'Tap the 📚 Library icon in the top toolbar to reveal the collapsible component drawer.',
        'Tap any gate, switch, or LED — it automatically spawns at the exact center of your screen!',
        'The library drawer auto-collapses on tap to keep your canvas unobstructed.',
      ],
      highlightFeatures: [
        {
          label: 'Inputs',
          desc: 'Toggle Switches, Push Buttons, Clock Generators (1-30Hz), Pulse & Random noise sources.',
        },
        {
          label: 'Outputs',
          desc: 'Probes, Glowing Neon LEDs, 7-Segment Displays, Hex & Binary Numeric Readouts.',
        },
        {
          label: 'Arithmetic & Sequential',
          desc: 'Half Adders, Full Adders, Multiplexers, D Flip-Flops, JK Flip-Flops, and SR Latches.',
        },
      ],
    },
    {
      id: 'wiring',
      badge: 'Step 3 of 7',
      title: 'Placing, Locking & Deleting Wires (PC & Tablets)',
      subtitle: 'Complete guide to routing, locking terminals, right-click abort, and deleting wires',
      icon: Spline,
      pcTips: [
        'START WIRE: Left-Click on any gate\'s output terminal (the right-side circle). A blue dashed line follows your cursor.',
        'LOCK & PLACE: Move your cursor to the destination input terminal and Left-Click to lock and place the wire permanently.',
        'CANCEL / UNLOCK: Right-Click anywhere or press Esc to immediately abort the wire drafting and unlock your cursor.',
        'DELETE WIRE: Click on any wire to select it (turns bright blue with action buttons), then press Delete / Backspace, or click the red "✕" button directly on the wire.',
        'BRANCH WIRE: Double-click an existing wire or tap to create a multi-drop branch point.',
      ],
      tabletTips: [
        '1-TAP ROUTING: Tap the source output port — it illuminates with an active glowing circle.',
        'LOCK CONNECTION: Tap the destination input port — the wire snaps and locks into place with automatic orthogonal Manhattan routing!',
        'DRAG-TO-CONNECT: Alternatively, drag your finger from output terminal to input terminal and release — it auto-snaps within a 45px touch radius.',
        'DELETE ON TOUCH: Simply tap the wire on your screen to reveal the floating red "✕" button, then tap "✕" to delete it instantly without needing a keyboard.',
        'CANCEL DRAFT: Tap any empty spot on the canvas to cancel an in-progress wire.',
      ],
      highlightFeatures: [
        {
          label: 'Left-Click to Lock',
          desc: 'Click start terminal, click target terminal to snap & lock into place.',
          icon: MousePointer,
        },
        {
          label: 'Right-Click to Abort',
          desc: 'Right-click or press Esc anytime during drafting to cancel the wire.',
          icon: X,
        },
        {
          label: '1-Tap Delete (✕)',
          desc: 'Selected wires display an on-screen red ✕ button for instant touch deletion.',
          icon: Zap,
        },
        {
          label: 'Orthogonal vs. Curved',
          desc: 'Switch between crisp 90° lines and aesthetic Bezier spline curves in the toolbar.',
          icon: Spline,
        },
      ],
      demoAction: {
        label: 'Load Basic AND Gate Circuit',
        description: 'Place a working AND Gate with 2 Switches and an LED to test wiring and deleting right now.',
      },
    },
    {
      id: 'simulation',
      badge: 'Step 4 of 7',
      title: 'Live Interactive Simulation & Signal Flow',
      subtitle: 'Real-time multi-pass convergence engine with pulse visualization',
      icon: Play,
      pcTips: [
        'Click any Toggle Switch to flip logic between 0 (LOW, dim slate) and 1 (HIGH, neon glow).',
        'Press Spacebar to toggle simulation RUN/PAUSE instantly.',
        'Use Step Forward (⏭️) to advance single clock cycles for sequential flip-flops.',
      ],
      tabletTips: [
        'Tap any switch on screen to toggle logic states with instantaneous responsive feedback.',
        'Tap the RUN / PAUSE button in the top toolbar to freeze signals for circuit inspection.',
        'Inspect live binary levels directly on probes and seven-segment displays.',
      ],
      highlightFeatures: [
        {
          label: 'Real-Time Propagation',
          desc: 'Active HIGH (1) wires illuminate in bright neon colors with animated energetic pulses.',
          icon: Zap,
        },
        {
          label: 'Clock Rate Slider',
          desc: 'Adjust oscillation speed from 1Hz (slow-motion clock) up to 30Hz for high-speed counters.',
          icon: RotateCcw,
        },
      ],
    },
    {
      id: 'truth-table',
      badge: 'Step 5 of 7',
      title: 'Truth Table & Real-Time Variable Testing',
      subtitle: 'Automatic multi-variable state analysis with live canvas synchronization',
      icon: Table,
      pcTips: [
        'Click "Truth Table" in the top bar to inspect all 2ⁿ binary input combinations.',
        'Variable Unification: Multiple switches with the same label (e.g., "A", "B") sync under one column.',
        'Click "Test State" on any table row to drive your live canvas switches to that combination!',
      ],
      tabletTips: [
        'Tap Truth Table in the toolbar to inspect complete inputs/outputs matrices.',
        'Filter rows easily by Minterms (Output = 1) or Maxterms (Output = 0).',
        'Export complete truth table data to CSV or copy clean Markdown tables with 1 tap.',
      ],
      highlightFeatures: [
        {
          label: 'Live Row Highlighting',
          desc: 'The table highlights the active canvas state row in real time as you flip switches.',
          icon: CheckCircle2,
        },
        {
          label: 'Canonical Forms',
          desc: 'Automatically computes Canonical Sum-of-Products (Σm) and Product-of-Sums (ΠM).',
          icon: FileCode2,
        },
      ],
    },
    {
      id: 'boolean-solver',
      badge: 'Step 6 of 7',
      title: 'Boolean Expression Solver & AI Synthesis',
      subtitle: 'Convert algebraic logic expressions directly into working gate schematics',
      icon: FileCode2,
      pcTips: [
        'Click "Boolean Solver" in the top bar or toolbar menu.',
        'Type any boolean formula, e.g. "A B + C\'" or "(A + B) (C + D)" or "A XOR B".',
        'Inspect step-by-step simplification, truth table breakdown, and AST syntax trees.',
      ],
      tabletTips: [
        'Use on-screen boolean operator buttons (AND, OR, NOT, XOR, NAND, NOR) for effortless formula entry.',
        'Tap "Synthesize to Canvas" — the engine auto-generates the entire circuit onto your workspace!',
      ],
      highlightFeatures: [
        {
          label: 'Instant Circuit Synthesis',
          desc: 'Translates boolean expressions into cleanly wired AND, OR, and NOT gates automatically.',
          icon: Sparkles,
        },
        {
          label: 'Karnaugh Map Minimizer',
          desc: '2D Gray-code matrices compute the absolute minimum SOP with optimal prime implicants.',
          icon: Table,
        },
      ],
    },
    {
      id: 'save-export-presets',
      badge: 'Step 7 of 7',
      title: 'Saving, JSON Export & Circuit Presets',
      subtitle: 'Keep your circuits secure, share with others, and load built-in reference designs',
      icon: Download,
      pcTips: [
        'Saved Circuits Manager: Click "Saved Circuits" to store named versions locally in your browser.',
        'Export JSON: Download portable circuit files (.json) to share or submit for assignments.',
        'Import JSON: Drag and drop or browse circuit files to resume work on any computer.',
      ],
      tabletTips: [
        'Auto-save protects your work automatically every few seconds.',
        'Explore 15+ built-in presets: Full Adders, Multiplexers, SR Latches, 4-bit Binary Counters.',
        'Customize wire routing and simulation preferences in the Settings panel.',
      ],
      highlightFeatures: [
        {
          label: 'Circuit Presets',
          desc: 'Learn combinational and sequential logic with ready-to-simulate reference designs.',
          icon: FolderOpen,
        },
        {
          label: 'Theme Customization',
          desc: 'Switch color palettes and customize grid intensity, wire glow, and high-contrast modes.',
          icon: Palette,
        },
      ],
    },
  ];

  const currentStep = tutorialSteps[currentStepIndex];

  // Close tutorial and save preference
  const handleClose = useCallback(() => {
    try {
      if (dontShowAgain) {
        localStorage.setItem('digilogic_tutorial_seen', 'true');
      }
    } catch {
      // ignore
    }
    setActiveModal('none');
  }, [dontShowAgain, setActiveModal]);

  // Keyboard navigation for tutorial
  useEffect(() => {
    if (activeModal !== 'tutorial') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      } else if (e.key === 'ArrowRight') {
        if (currentStepIndex < tutorialSteps.length - 1) {
          setCurrentStepIndex((prev) => prev + 1);
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentStepIndex > 0) {
          setCurrentStepIndex((prev) => prev - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModal, currentStepIndex, tutorialSteps.length, handleClose]);

  // Demo Circuit Loader: Places a simple working AND gate circuit to try right away
  const handleLoadDemoCircuit = () => {
    const switchA = createComponent('SWITCH', 140, 180, { label: 'A', name: 'Switch A' });
    switchA.internalState = { value: 1, pressed: false };

    const switchB = createComponent('SWITCH', 140, 280, { label: 'B', name: 'Switch B' });
    switchB.internalState = { value: 1, pressed: false };

    const andGate = createComponent('AND', 340, 230, { label: 'AND', name: 'AND Gate' });
    const ledOut = createComponent('LED', 520, 230, { label: 'Y', name: 'Output LED' });

    const demoComps = [switchA, switchB, andGate, ledOut];

    const demoWires = [
      {
        id: 'wire_1',
        fromComponentId: switchA.id,
        fromPortId: 'out',
        toComponentId: andGate.id,
        toPortId: 'in_0',
      },
      {
        id: 'wire_2',
        fromComponentId: switchB.id,
        fromPortId: 'out',
        toComponentId: andGate.id,
        toPortId: 'in_1',
      },
      {
        id: 'wire_3',
        fromComponentId: andGate.id,
        fromPortId: 'out',
        toComponentId: ledOut.id,
        toPortId: 'in_0',
      },
    ];

    loadCircuitData(demoComps, demoWires, 'Tutorial Demo: Basic AND Gate Circuit');
    setDemoLoadedMessage('Demo circuit loaded onto canvas! You can click the switches to test it.');
    setTimeout(() => {
      setDemoLoadedMessage(null);
      handleClose();
    }, 1500);
  };

  if (activeModal !== 'tutorial') return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 select-none animate-fade-in ${
      isLight ? 'bg-[#000000]/40 backdrop-blur-xs' : 'bg-[#000000]/85 backdrop-blur-md'
    }`}>
      <div
        style={{
          backgroundColor: isLight ? '#ffffff' : currentTheme.panelBg,
          borderColor: isLight ? '#cbd5e1' : currentTheme.borderTone,
        }}
        className={`border rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden transition-all duration-200 ${
          isLight ? 'text-slate-800' : 'text-[#F5F5F5]'
        }`}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: isLight ? '#f8fafc' : currentTheme.navBg,
            borderColor: isLight ? '#e2e8f0' : currentTheme.borderTone,
          }}
          className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b shrink-0"
        >
          <div className="flex items-center gap-3">
            <div
              style={{
                backgroundColor: `${currentTheme.primaryColor}22`,
                borderColor: `${currentTheme.primaryColor}55`,
                color: currentTheme.primaryColor,
              }}
              className="p-2 sm:p-2.5 rounded-xl border shadow-xs flex items-center justify-center"
            >
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`font-bold text-sm sm:text-base tracking-wide ${
                  isLight ? 'text-slate-900' : 'text-[#F5F5F5]'
                }`}>
                  Welcome to DigiLogic Studio
                </h2>
                <span
                  style={{
                    backgroundColor: `${currentTheme.primaryColor}18`,
                    color: currentTheme.primaryColor,
                    borderColor: `${currentTheme.primaryColor}40`,
                  }}
                  className="text-[10px] px-2 py-0.5 rounded-full border font-mono font-bold"
                >
                  Quick Start Guide
                </span>
              </div>
              <p className={`text-xs ${isLight ? 'text-[#F5F5F5]/45' : 'text-[#F5F5F5]/60'}`}>
                Master circuit design on PC, Tablet touchscreens, and mobile devices
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveModal('about')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-colors cursor-pointer ${
                isLight
                  ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700 hover:text-slate-900 shadow-2xs'
                  : 'bg-[#000000]/80 hover:bg-[#141415] border-[#FFFFFF]/20/80 text-[#E8E8E8] hover:text-[#F5F5F5]'
              }`}
              title="About Founders & Lab Guide"
            >
              <Info className={`w-3.5 h-3.5 ${isLight ? 'text-[#F5F5F5]/45' : 'text-[#F5F5F5]/60'}`} />
              <span>About</span>
            </button>
            <button
              onClick={handleClose}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isLight
                  ? 'text-[#F5F5F5]/60 hover:text-slate-700 hover:bg-slate-100'
                  : 'text-[#F5F5F5]/60 hover:text-[#F5F5F5] hover:bg-[#141415]'
              }`}
              title="Close Tutorial (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Step Progression Bar */}
        <div
          style={{ borderColor: isLight ? '#e2e8f0' : currentTheme.borderTone }}
          className={`px-4 sm:px-6 py-2.5 border-b flex items-center justify-between gap-2 overflow-x-auto shrink-0 ${
            isLight ? 'bg-slate-50' : 'bg-[#000000]'
          }`}
        >
          <div className="flex items-center gap-1 sm:gap-2">
            {tutorialSteps.map((step, idx) => (
              <button
                key={step.id}
                onClick={() => setCurrentStepIndex(idx)}
                style={
                  currentStepIndex === idx
                    ? {
                        backgroundColor: `${currentTheme.primaryColor}25`,
                        borderColor: currentTheme.primaryColor,
                        color: currentTheme.primaryColor,
                      }
                    : idx < currentStepIndex
                    ? {
                        backgroundColor: isLight ? '#ecfdf5' : '#8F8F8F20',
                        borderColor: isLight ? '#a7f3d0' : '#8F8F8F50',
                        color: isLight ? '#E8E8E8' : '#B4B4B4',
                      }
                    : {}
                }
                className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all shrink-0 cursor-pointer ${
                  currentStepIndex === idx
                    ? 'shadow-xs font-bold'
                    : idx < currentStepIndex
                    ? 'border'
                    : isLight
                    ? 'bg-white border-slate-200 text-[#F5F5F5]/45 hover:text-slate-800 hover:bg-slate-100 shadow-2xs'
                    : 'bg-[#000000]/60 border-[#FFFFFF]/20 text-[#F5F5F5]/60 hover:text-[#F5F5F5]'
                }`}
              >
                {idx < currentStepIndex ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <span className="w-3.5 text-center font-mono">{idx + 1}</span>
                )}
                <span className="hidden md:inline">{step.title.split(' ')[0]}</span>
              </button>
            ))}
          </div>

          {/* Device Perspective Switcher */}
          <div className={`flex items-center gap-1 p-0.5 rounded-lg border text-[11px] shrink-0 ${
            isLight ? 'bg-slate-200/80 border-slate-300' : 'bg-[#000000]/90 border-[#FFFFFF]/20'
          }`}>
            <button
              onClick={() => setActiveDeviceView('all')}
              className={`px-2 py-0.5 rounded font-semibold transition-colors cursor-pointer ${
                activeDeviceView === 'all'
                  ? isLight
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'bg-[#000000] text-[#F5F5F5]'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-[#F5F5F5]/60 hover:text-[#F5F5F5]'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveDeviceView('pc')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded font-semibold transition-colors cursor-pointer ${
                activeDeviceView === 'pc'
                  ? isLight
                    ? 'bg-white text-zinc-700 shadow-2xs'
                    : 'bg-[#000000] text-[#B4B4B4]'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-[#F5F5F5]/60 hover:text-[#F5F5F5]'
              }`}
            >
              <Monitor className="w-3 h-3" /> PC
            </button>
            <button
              onClick={() => setActiveDeviceView('tablet')}
              className={`flex items-center gap-1 px-2 py-0.5 rounded font-semibold transition-colors cursor-pointer ${
                activeDeviceView === 'tablet'
                  ? isLight
                    ? 'bg-white text-zinc-700 shadow-2xs'
                    : 'bg-[#000000] text-[#B4B4B4]'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-[#F5F5F5]/60 hover:text-[#F5F5F5]'
              }`}
            >
              <Tablet className="w-3 h-3" /> Touch
            </button>
          </div>
        </div>

        {/* Step Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs">
          {/* Active Step Card Header */}
          <div
            style={{
              backgroundColor: isLight ? '#f8fafc' : `${currentTheme.canvasBg}dd`,
              borderColor: isLight ? '#e2e8f0' : currentTheme.borderTone,
            }}
            className="p-4 rounded-xl border shadow-xs space-y-2"
          >
            <div className="flex items-center justify-between">
              <span
                style={{
                  backgroundColor: `${currentTheme.primaryColor}20`,
                  color: currentTheme.primaryColor,
                  borderColor: `${currentTheme.primaryColor}40`,
                }}
                className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border"
              >
                {currentStep.badge}
              </span>
              <span className={`text-[11px] font-mono ${isLight ? 'text-[#F5F5F5]/45' : 'text-[#F5F5F5]/60'}`}>
                {currentStepIndex + 1} / {tutorialSteps.length}
              </span>
            </div>

            <div className="flex items-start gap-3 pt-1">
              <div
                style={{
                  backgroundColor: `${currentTheme.primaryColor}15`,
                  color: currentTheme.primaryColor,
                }}
                className="p-2.5 rounded-xl shrink-0"
              >
                <currentStep.icon className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <h3 className={`font-bold text-sm sm:text-base ${isLight ? 'text-slate-900' : 'text-[#F5F5F5]'}`}>
                  {currentStep.title}
                </h3>
                <p className={`text-xs leading-relaxed ${isLight ? 'text-slate-600' : 'text-[#F5F5F5]/60'}`}>
                  {currentStep.subtitle}
                </p>
              </div>
            </div>
          </div>

          {/* PC vs. Tablet / Touch Operation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {/* PC Instructions */}
            {(activeDeviceView === 'all' || activeDeviceView === 'pc') && (
              <div className={`p-3.5 rounded-xl space-y-2.5 border ${
                isLight ? 'bg-white border-slate-200 shadow-2xs' : 'bg-[#000000]/80 border-[#FFFFFF]/20'
              }`}>
                <div className={`flex items-center gap-2 font-bold text-xs pb-1 border-b ${
                  isLight ? 'text-zinc-700 border-slate-200' : 'text-[#B4B4B4] border-[#FFFFFF]/20'
                }`}>
                  <Monitor className="w-4 h-4" />
                  <span>On Desktop & Laptop (Mouse / Keyboard)</span>
                </div>
                <ul className={`space-y-2 ${isLight ? 'text-slate-700' : 'text-[#E8E8E8]'}`}>
                  {currentStep.pcTips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#B4B4B4] shrink-0 mt-1.5" />
                      <span className="leading-relaxed">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tablet & Touch Instructions */}
            {(activeDeviceView === 'all' || activeDeviceView === 'tablet') && (
              <div className={`p-3.5 rounded-xl space-y-2.5 border ${
                isLight ? 'bg-white border-slate-200 shadow-2xs' : 'bg-[#000000]/80 border-[#FFFFFF]/20'
              }`}>
                <div className={`flex items-center gap-2 font-bold text-xs pb-1 border-b ${
                  isLight ? 'text-zinc-700 border-slate-200' : 'text-[#B4B4B4] border-[#FFFFFF]/20'
                }`}>
                  <Tablet className="w-4 h-4" />
                  <span>On Tablets & Mobile (Touchscreens)</span>
                </div>
                <ul className={`space-y-2 ${isLight ? 'text-slate-700' : 'text-[#E8E8E8]'}`}>
                  {currentStep.tabletTips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#B4B4B4] shrink-0 mt-1.5" />
                      <span className="leading-relaxed">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Feature Highlights Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {currentStep.highlightFeatures.map((hf, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl space-y-1 border ${
                  isLight ? 'bg-slate-50 border-slate-200 shadow-2xs' : 'bg-[#000000]/80 border-[#FFFFFF]/20'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    style={{ color: currentTheme.primaryColor }}
                    className="font-bold text-xs"
                  >
                    {hf.label}
                  </span>
                </div>
                <p className={`text-[11px] leading-normal ${isLight ? 'text-slate-600' : 'text-[#F5F5F5]/60'}`}>
                  {hf.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Optional Interactive Demo Button */}
          {currentStep.demoAction && (
            <div className={`p-3 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs border ${
              isLight
                ? 'bg-amber-50/70 border-amber-200 text-slate-800'
                : 'bg-[#FFFFFF]/15 border-[#FFFFFF]/30'
            }`}>
              <div className="space-y-0.5">
                <span className="font-bold text-[#FFFFFF]">Try Interactive Demo:</span>
                <p className={`text-[11px] ${isLight ? 'text-slate-600' : 'text-[#E8E8E8]'}`}>{currentStep.demoAction.description}</p>
              </div>
              <button
                onClick={handleLoadDemoCircuit}
                className="px-3 py-1.5 bg-[#FFFFFF] hover:bg-[#E8E8E8] text-[#000000] font-bold rounded-lg transition-colors shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 fill-[#000000]" />
                <span>{currentStep.demoAction.label}</span>
              </button>
            </div>
          )}

          {demoLoadedMessage && (
            <div className="p-2.5 rounded-lg bg-[#FFFFFF]/20 border border-[#FFFFFF]/50 text-[#E8E8E8] font-semibold text-center flex items-center justify-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-[#FFFFFF]" />
              <span>{demoLoadedMessage}</span>
            </div>
          )}
        </div>

        {/* Footer Controls */}
        <div
          style={{
            backgroundColor: isLight ? '#f8fafc' : currentTheme.navBg,
            borderColor: isLight ? '#e2e8f0' : currentTheme.borderTone,
          }}
          className="px-4 sm:px-6 py-3 border-t flex items-center justify-between gap-2 shrink-0"
        >
          {/* Don't show again toggle */}
          <label className={`flex items-center gap-2 cursor-pointer text-xs ${
            isLight ? 'text-slate-600 hover:text-slate-900' : 'text-[#F5F5F5]/60 hover:text-[#F5F5F5]'
          }`}>
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className={`rounded text-[#FFFFFF] focus:ring-0 cursor-pointer ${
                isLight ? 'bg-white border-slate-300' : 'bg-[#000000] border-[#FFFFFF]/20'
              }`}
            />
            <span>Don't auto-open on startup</span>
          </label>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentStepIndex === 0}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg disabled:opacity-30 text-xs font-semibold border transition-colors cursor-pointer ${
                isLight
                  ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-2xs'
                  : 'bg-[#000000] hover:bg-[#141415] text-[#F5F5F5] border-[#FFFFFF]/20'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Prev</span>
            </button>

            {currentStepIndex < tutorialSteps.length - 1 ? (
              <button
                onClick={() => setCurrentStepIndex((prev) => prev + 1)}
                style={{
                  backgroundColor: currentTheme.primaryColor,
                  color: '#000000',
                }}
                className="flex items-center gap-1 px-4 py-1.5 rounded-lg font-bold text-xs transition-all shadow-xs active:scale-95 cursor-pointer"
              >
                <span>Next Step</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleClose}
                style={{
                  backgroundColor: currentTheme.primaryColor,
                  color: '#000000',
                }}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-bold text-xs transition-all shadow-xs active:scale-95 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Start Designing!</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
