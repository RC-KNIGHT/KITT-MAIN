import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Cpu, 
  Layers, 
  Binary, 
  Sliders, 
  CheckCircle2, 
  ArrowRight, 
  Zap, 
  RefreshCw, 
  Check, 
  Terminal, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import { circuitAudio } from '../utils/audio';
import { Tilt3DCard } from './Tilt3DCard';

type GenerationMode = '3d' | '2d';

interface GenerationStep {
  title: string;
  detail: string;
  status: 'pending' | 'active' | 'completed';
}

const PROMPT_PRESETS = [
  {
    id: 'plant',
    label: '🌿 Plant Watering System',
    prompt: 'Build an automatic plant watering system with an ESP32, capacitive soil moisture sensor, IRLZ44N MOSFET, and 5V pump.',
    mcu: 'ESP32-WROOM',
    components: ['ESP32', 'Capacitive Soil Sensor', 'IRLZ44N MOSFET', '5V Mini Pump', '1N4007 Diode', '220Ω Resistor'],
    targetHash: '#/kitt-ai'
  },
  {
    id: 'traffic',
    label: '🚦 Traffic Light Controller',
    prompt: 'Build a traffic light controller using an Arduino Uno, Red, Yellow, and Green LEDs, three 220 ohm resistors, and a pedestrian push button.',
    mcu: 'Arduino Uno R3',
    components: ['Arduino Uno', 'Red LED', 'Yellow LED', 'Green LED', '3x 220Ω Resistors', 'Push Button', 'Pull-down Resistor'],
    targetHash: '#/workspace'
  },
  {
    id: 'tone',
    label: '⚡ 555 Audio Synthesizer',
    prompt: 'Build a 555 timer astable multivibrator tone generator that produces an 880 Hz square wave for an 8 ohm mini speaker.',
    mcu: 'NE555 Timer IC',
    components: ['NE555 Timer', '10kΩ Resistor', '4.7kΩ Resistor', '100nF Ceramic Cap', '10µF Electrolytic', '8Ω Speaker'],
    targetHash: '#/digilogic'
  },
  {
    id: 'solar',
    label: '☀️ Solar Battery Charger',
    prompt: 'Build a solar lithium-ion battery charging circuit with a TP4056 charge controller, 18650 cell, and voltage telemetry monitor.',
    mcu: 'RP2040 Pico',
    components: ['TP4056 Module', '18650 Li-Ion Cell', 'Solar Mini Panel (6V)', 'INA219 Current Sensor', 'SSD1306 OLED'],
    targetHash: '#/number-trainer'
  }
];

export const HeroPromptBuilder: React.FC = () => {
  const [promptText, setPromptText] = useState(
    'Build an automatic plant watering system with an ESP32, soil moisture sensor, and pump.'
  );
  const [generationMode, setGenerationMode] = useState<GenerationMode>('3d');
  const [selectedMcu, setSelectedMcu] = useState('ESP32-WROOM');
  const [powerDomain, setPowerDomain] = useState('Dual Rail 3.3V / 5.0V');
  const [showComponents, setShowComponents] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Generation Sequence State
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);

  const GENERATION_STEPS: GenerationStep[] = [
    {
      title: 'Understanding Requirements',
      detail: 'Extracting threshold (moisture < 35%), duty cycle, and hysteresis specifications.',
      status: currentStepIndex > 0 ? 'completed' : currentStepIndex === 0 && isGenerating ? 'active' : 'pending'
    },
    {
      title: 'Component Selection & Pinout Matching',
      detail: `Matching ${selectedMcu} GPIOs with low-side MOSFET gate drive and analog ADC input.`,
      status: currentStepIndex > 1 ? 'completed' : currentStepIndex === 1 ? 'active' : 'pending'
    },
    {
      title: 'Generating Circuit Topology & Netlist',
      detail: 'Connecting VCC, GND, flyback protection diode, and current limiting resistors. Zero floating nets.',
      status: currentStepIndex > 2 ? 'completed' : currentStepIndex === 2 ? 'active' : 'pending'
    },
    {
      title: generationMode === '3d' ? 'Synthesizing 3D Breadboard Prototype' : 'Synthesizing 2D Engineering Schematic',
      detail: generationMode === '3d' ? 'Placing ICs on solderless rows with color-coded jumper routing.' : 'Rendering IEEE standard logic symbols and net identifiers.',
      status: currentStepIndex > 3 ? 'completed' : currentStepIndex === 3 ? 'active' : 'pending'
    },
    {
      title: 'Generating Firmware & MCU Synchronization',
      detail: 'Writing non-blocking C++ state machine with 12-bit ADC filtering.',
      status: currentStepIndex > 4 ? 'completed' : currentStepIndex === 4 ? 'active' : 'pending'
    },
    {
      title: 'Running Mixed-Signal Simulation & DRC Check',
      detail: 'Testing DC operating points, voltage drop across MOSFET, and ground loop integrity.',
      status: currentStepIndex > 5 ? 'completed' : currentStepIndex === 5 ? 'active' : 'pending'
    },
    {
      title: 'Engineering Project Ready',
      detail: 'Synchronized across 2D, 3D, simulation, firmware, and bill of materials.',
      status: isCompleted ? 'completed' : 'pending'
    }
  ];

  // Generation Sequence Animation Effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isGenerating && currentStepIndex < 6) {
      timer = setTimeout(() => {
        circuitAudio.playRelayClick();
        setCurrentStepIndex((prev) => prev + 1);
        setProgressPercent(Math.round(((currentStepIndex + 1) / 6) * 100));
      }, 700);
    } else if (isGenerating && currentStepIndex >= 6) {
      circuitAudio.playBeepSuccess();
      setIsGenerating(false);
      setIsCompleted(true);
      setProgressPercent(100);
    }
    return () => clearTimeout(timer);
  }, [isGenerating, currentStepIndex]);

  const handleStartBuild = () => {
    if (!promptText.trim()) return;
    setIsGenerating(true);
    setIsCompleted(false);
    setCurrentStepIndex(0);
    setProgressPercent(10);
    circuitAudio.playTone(523.25, 0.1, 'sine');
  };

  const handleSelectPreset = (preset: typeof PROMPT_PRESETS[0]) => {
    setPromptText(preset.prompt);
    setSelectedMcu(preset.mcu);
    setIsCompleted(false);
    circuitAudio.playTone(659.25, 0.08, 'triangle');
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-6 relative z-20">
      <Tilt3DCard tiltMaxAngle={3.5} scale={1.01} glareOpacity={0.22} className="w-full">
        {/* Container with Crystal Clear Transparent Glass so the K shows behind it */}
        <div className="transparent-glass-card rounded-2xl bg-black/20 border border-[#FFFFFF]/30 p-5 sm:p-7 relative overflow-hidden transition-colors duration-300 hover:border-[#8F8F8F]/60 backdrop-blur-[2px] shadow-[0_16px_40px_rgba(0,0,0,0.6),0_0_25px_rgba(143,143,143,0.12)]">
        
        {/* Precision Reticle Corner Brackets */}
        <div className="absolute top-2.5 left-2.5 w-3 h-3 border-t-2 border-l-2 border-[#FFFFFF]/50 rounded-tl pointer-events-none z-10" />
        <div className="absolute top-2.5 right-2.5 w-3 h-3 border-t-2 border-r-2 border-[#FFFFFF]/50 rounded-tr pointer-events-none z-10" />
        <div className="absolute bottom-2.5 left-2.5 w-3 h-3 border-b-2 border-l-2 border-[#FFFFFF]/50 rounded-bl pointer-events-none z-10" />
        <div className="absolute bottom-2.5 right-2.5 w-3 h-3 border-b-2 border-r-2 border-[#FFFFFF]/50 rounded-br pointer-events-none z-10" />

        {/* Subtle Engineering Grid Background */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-15"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #FFFFFF 1px, transparent 0)',
            backgroundSize: '24px 24px'
          }}
        />

        {/* Top Control Bar: Prompt Question & 2D/3D Mode Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#FFFFFF]/20 pb-4 mb-4 relative z-10">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8F8F8F] animate-pulse shadow-[0_0_8px_#8F8F8F]" />
            <h2 className="text-base sm:text-lg font-serif font-bold text-[#F5F5F5] tracking-wide">
              What Will You Force Into Existence?
            </h2>
            <span className="hidden md:inline text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#FFFFFF]/20 text-[#FFFFFF] border border-[#FFFFFF]/30 animate-ambition">
              AUTONOMOUS SYNTHESIS
            </span>
          </div>

          {/* 2D / 3D Mode Selector Pills */}
          <div className="flex items-center gap-1 p-1 bg-black/40 rounded-xl border border-[#FFFFFF]/20 self-start sm:self-auto backdrop-blur-[2px]">
            <button
              type="button"
              onClick={() => {
                setGenerationMode('2d');
                circuitAudio.playTone(440, 0.05, 'triangle');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                generationMode === '2d'
                  ? 'bg-gradient-to-r from-[#FFFFFF] to-[#737373] text-[#000000] shadow-md font-bold'
                  : 'text-[#F5F5F5]/60 hover:text-[#F5F5F5]'
              }`}
            >
              <Binary className="w-3.5 h-3.5" />
              <span>2D Schematic</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setGenerationMode('3d');
                circuitAudio.playTone(550, 0.05, 'triangle');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                generationMode === '3d'
                  ? 'bg-gradient-to-r from-[#FFFFFF] to-[#737373] text-[#000000] shadow-md font-bold'
                  : 'text-[#F5F5F5]/60 hover:text-[#F5F5F5]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>3D Breadboard</span>
            </button>
          </div>
        </div>

        {/* Large Prompt Input Console */}
        <div className="relative mb-3 z-10">
          <textarea
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            disabled={isGenerating}
            placeholder="Describe your electronic system (e.g. Build an automatic plant watering system with ESP32, soil moisture probe, and 5V pump)..."
            rows={2}
            className="w-full bg-black/35 border border-[#FFFFFF]/25 focus:border-[#FFFFFF] rounded-xl p-3.5 sm:p-4 text-sm sm:text-base text-[#F5F5F5] placeholder:text-[#F5F5F5]/40 focus:outline-none focus:ring-2 focus:ring-[#FFFFFF]/20 font-sans resize-none transition-all font-light backdrop-blur-[2px]"
          />
          {promptText && (
            <button
              onClick={() => setPromptText('')}
              className="absolute top-3 right-3 text-[#F5F5F5]/40 hover:text-[#F5F5F5] p-1"
              title="Clear prompt"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Preset Idea Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-4 relative z-10">
          <span className="text-[11px] font-mono text-[#FFFFFF] uppercase tracking-wider">
            Quick Ideas:
          </span>
          {PROMPT_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleSelectPreset(preset)}
              className="px-2.5 py-1 rounded-lg bg-black/30 hover:bg-[#8F8F8F]/25 border border-[#FFFFFF]/20 hover:border-[#FFFFFF]/50 text-xs text-[#F5F5F5]/80 hover:text-[#F5F5F5] transition-all cursor-pointer font-medium backdrop-blur-[2px]"
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Expandable Options: [Choose Components] & [Advanced Settings] */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#FFFFFF]/15 pt-3 mb-4 relative z-10 text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowComponents(!showComponents)}
              className="flex items-center gap-1 text-[#F5F5F5]/80 hover:text-[#F5F5F5] px-2.5 py-1 rounded-md bg-[#8F8F8F]/15 hover:bg-[#8F8F8F]/25 border border-[#8F8F8F]/35 transition-colors"
            >
              <Cpu className="w-3.5 h-3.5 text-[#FFFFFF]" />
              <span>Target: {selectedMcu}</span>
              {showComponents ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-1 text-[#F5F5F5]/80 hover:text-[#F5F5F5] px-2.5 py-1 rounded-md bg-[#8F8F8F]/15 hover:bg-[#8F8F8F]/25 border border-[#8F8F8F]/35 transition-colors"
            >
              <Sliders className="w-3.5 h-3.5 text-[#B4B4B4]" />
              <span>Power: {powerDomain}</span>
              {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          {/* Primary Action Button: BUILD WITH KITT */}
          <button
            type="button"
            onClick={handleStartBuild}
            disabled={isGenerating || !promptText.trim()}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#FFFFFF] to-[#737373] hover:from-[#CCCCCC] hover:to-[#FFFFFF] disabled:opacity-50 text-[#000000] font-bold text-sm shadow-[0_0_20px_rgba(255,255,255,0.35)] transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-[#000000]" />
                <span>Synthesizing Project ({progressPercent}%)...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-[#000000] fill-[#000000]" />
                <span>SYNTHESIZE WITH KITT</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#000000]/20 font-mono font-normal">
                  ↵ Enter
                </span>
              </>
            )}
          </button>
        </div>

        {/* Expandable Component Selector Drawer */}
        <AnimatePresence>
          {showComponents && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -6 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -6 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <div className="mt-3 p-3.5 rounded-xl bg-[#0b141a] border border-[#FFFFFF]/20 space-y-2 relative z-10 text-xs">
                <span className="text-[11px] font-mono text-[#FFFFFF] uppercase tracking-wider font-semibold">
                  Select Microcontroller Architecture:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {['ESP32-WROOM', 'Arduino Uno R3', 'RP2040 Pico', 'STM32 BluePill'].map((mcu) => (
                    <button
                      key={mcu}
                      onClick={() => {
                        setSelectedMcu(mcu);
                        circuitAudio.playTone(330, 0.04, 'sine');
                      }}
                      className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                        selectedMcu === mcu
                          ? 'bg-[#FFFFFF]/20 border-[#FFFFFF]/60 text-[#F5F5F5] font-semibold shadow-sm'
                          : 'bg-white/5 border-white/10 text-[#F5F5F5]/70 hover:bg-white/10'
                      }`}
                    >
                      {mcu}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Expandable Advanced Settings Drawer */}
        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -6 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -6 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <div className="mt-3 p-3.5 rounded-xl bg-[#0b141a] border border-[#FFFFFF]/20 space-y-2 relative z-10 text-xs">
                <span className="text-[11px] font-mono text-[#8F8F8F] uppercase tracking-wider font-semibold">
                  Power Supply Rails & Protection:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  {[
                    { name: 'Dual Rail 3.3V / 5.0V', desc: 'Separate logic & motor supplies' },
                    { name: 'Single 3.3V Ultra-Low', desc: 'Optimized for battery & RTC deep-sleep' },
                    { name: '12.0V High Torque', desc: 'Optoisolated relay/FET industrial rail' }
                  ].map((p) => (
                    <button
                      key={p.name}
                      onClick={() => {
                        setPowerDomain(p.name);
                        circuitAudio.playTone(392, 0.04, 'sine');
                      }}
                      className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                        powerDomain === p.name
                          ? 'bg-[#8F8F8F]/25 border-[#8F8F8F] text-[#F5F5F5] font-semibold shadow-sm'
                          : 'bg-white/5 border-white/10 text-[#F5F5F5]/70 hover:bg-white/10'
                      }`}
                    >
                      <div className="font-semibold">{p.name}</div>
                      <div className="text-[10px] text-[#F5F5F5]/50">{p.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* REAL-TIME GENERATION PROGRESS WINDOW */}
        <AnimatePresence>
          {(isGenerating || isCompleted) && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.98 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="mt-4 p-4 sm:p-5 rounded-xl bg-[#000000] border border-[#FFFFFF]/30 space-y-4 relative z-10 shadow-xl"
            >
              {/* Header with Progress Bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[#FFFFFF]" />
                  <span className="text-xs font-mono font-bold text-[#F5F5F5] uppercase tracking-wider">
                    Oracle Synthesis Pipeline
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-[#FFFFFF]">
                  {isCompleted ? '✓ COMPLETED 100%' : `${progressPercent}%`}
                </span>
              </div>

              {/* Progress Bar Track */}
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-gradient-to-r from-[#FFFFFF] via-[#F5F5F5] to-[#8F8F8F]"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                />
              </div>

              {/* Step Checkpoints List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {GENERATION_STEPS.slice(0, 6).map((step, idx) => {
                  const isActive = step.status === 'active';
                  const isDone = step.status === 'completed';

                  return (
                    <div 
                      key={step.title}
                      className={`p-2 rounded-lg border flex items-start gap-2.5 transition-all ${
                        isDone 
                          ? 'bg-[#8F8F8F]/20 border-[#8F8F8F]/40 text-[#F5F5F5]' 
                          : isActive 
                          ? 'bg-[#FFFFFF]/20 border-[#FFFFFF]/60 text-[#F5F5F5] animate-pulse' 
                          : 'bg-white/5 border-white/5 text-[#F5F5F5]/40 opacity-60'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {isDone ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#8F8F8F]" />
                        ) : isActive ? (
                          <RefreshCw className="w-3.5 h-3.5 text-[#FFFFFF] animate-spin" />
                        ) : (
                          <span className="w-3.5 h-3.5 rounded-full border border-[#FFFFFF]/30 block text-[9px] text-center font-mono leading-3 text-[#F5F5F5]/50">
                            {idx + 1}
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-[11px] leading-tight">{step.title}</div>
                        <div className="text-[10px] text-[#F5F5F5]/60 line-clamp-1">{step.detail}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Bar when Complete */}
              {isCompleted && (
                <div className="pt-2 border-t border-[#FFFFFF]/20 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-[#8F8F8F] font-medium">
                    <Check className="w-4 h-4" />
                    <span>0 Violations detected • 8 Nets synchronized • Ready for manifestation</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href="#/workspace"
                      onClick={() => circuitAudio.playClick()}
                      className="px-3.5 py-1.5 rounded-lg bg-[#FFFFFF] hover:bg-[#b89f76] active:scale-95 text-[#000000] font-semibold transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:shadow-[0_0_20px_rgba(255,255,255,0.5)] cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Launch 3D Lab</span>
                    </a>

                    <a
                      href="#/kitt-ai"
                      onClick={() => circuitAudio.playClick()}
                      className="px-3.5 py-1.5 rounded-lg bg-[#8F8F8F]/20 hover:bg-[#8F8F8F]/30 active:scale-95 text-[#F5F5F5] border border-[#8F8F8F]/40 hover:border-[#8F8F8F]/80 font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(143,143,143,0.2)]"
                    >
                      <Zap className="w-3.5 h-3.5 text-[#FFFFFF]" />
                      <span>KITT AI Studio</span>
                    </a>

                    <a
                      href="#/digilogic"
                      onClick={() => circuitAudio.playClick()}
                      className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 active:scale-95 text-[#FFFFFF] hover:text-[#F5F5F5] border border-[#FFFFFF]/20 hover:border-[#FFFFFF]/50 font-medium transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span>DigiLogic EDA</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        </div>
      </Tilt3DCard>
    </div>
  );
};
