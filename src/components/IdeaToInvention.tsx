import React, { useState } from 'react';
import { 
  Sparkles, 
  Brain, 
  Search, 
  DraftingCompass, 
  Layers, 
  Activity, 
  Sliders, 
  Bug, 
  Cpu, 
  Box,
  CheckCircle2,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { JOURNEY_STEPS } from '../data/ecosystem';

export const IdeaToInvention: React.FC = () => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const activeStep = JOURNEY_STEPS[activeStepIndex];

  const getStepIcon = (index: number) => {
    switch (index) {
      case 0: return <Sparkles className="w-4 h-4" />;
      case 1: return <Brain className="w-4 h-4" />;
      case 2: return <Search className="w-4 h-4" />;
      case 3: return <DraftingCompass className="w-4 h-4" />;
      case 4: return <Layers className="w-4 h-4" />;
      case 5: return <Cpu className="w-4 h-4" />;
      case 6: return <Activity className="w-4 h-4" />;
      case 7: return <Sliders className="w-4 h-4" />;
      case 8: return <DraftingCompass className="w-4 h-4" />;
      case 9: return <Box className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  return (
    <section id="idea-to-invention" className="py-24 px-4 sm:px-6 lg:px-8 bg-transparent relative overflow-hidden border-t border-white/5">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-purple-900/10 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span>The KITT Lifecycle</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            From Idea to Physical Invention. <br />
            <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">
              One Continuous Engineering Flow.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-slate-400">
            No broken handoffs between CAD tools, code editors, and simulators. Every stage transforms seamlessly from the same canonical project netlist.
          </p>
        </div>

        {/* 10-Step Interactive Navigation Pill Track */}
        <div className="overflow-x-auto pb-4 mb-10 no-scrollbar">
          <div className="flex items-center gap-2 min-w-max px-2">
            {JOURNEY_STEPS.map((step, idx) => {
              const isSelected = activeStepIndex === idx;
              const isPast = activeStepIndex > idx;

              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStepIndex(idx)}
                  className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-purple-600 border-purple-400 text-white shadow-lg shadow-purple-900/50 scale-105'
                      : isPast
                      ? 'bg-purple-950/30 border-purple-500/20 text-purple-300 hover:bg-purple-900/40'
                      : 'bg-[#12151e] border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <span className="font-mono opacity-60 text-[10px]">{step.step}</span>
                  <span className="shrink-0">{getStepIcon(idx)}</span>
                  <span className="font-semibold">{step.shortTitle}</span>
                  {idx < JOURNEY_STEPS.length - 1 && (
                    <ChevronRight className="w-3 h-3 text-slate-600 shrink-0 ml-1" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Stage Interactive Showcase Card */}
        <div className="rounded-3xl bg-[#11141d] border border-white/10 p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Stage Details */}
            <div className="lg:col-span-5 space-y-5">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-purple-950/80 border border-purple-500/30 text-purple-300 font-mono text-xs font-semibold">
                  Stage {activeStep.step} / 10
                </span>
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  {activeStep.badge}
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                {activeStep.title}
              </h3>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                {activeStep.description}
              </p>

              {/* Concrete Example Box */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-1.5">
                <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider block font-bold">
                  Live Project Model State:
                </span>
                <p className="text-xs font-mono text-slate-200 leading-relaxed">
                  {activeStep.example}
                </p>
              </div>

              {/* Navigation Steppers */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  disabled={activeStepIndex === 0}
                  onClick={() => setActiveStepIndex((prev) => Math.max(0, prev - 1))}
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-30 text-xs font-semibold text-slate-300 transition-colors"
                >
                  Previous Step
                </button>

                <button
                  disabled={activeStepIndex === JOURNEY_STEPS.length - 1}
                  onClick={() => setActiveStepIndex((prev) => Math.min(JOURNEY_STEPS.length - 1, prev + 1))}
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-30 text-xs font-semibold text-white transition-colors flex items-center gap-1.5"
                >
                  <span>Next: {JOURNEY_STEPS[Math.min(JOURNEY_STEPS.length - 1, activeStepIndex + 1)].shortTitle}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right Interactive Visual Artifact */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl bg-[#08090d] border border-white/10 p-6 min-h-[340px] flex flex-col justify-center relative overflow-hidden">
                {/* Visual Representation based on stage */}
                {activeStepIndex === 0 && (
                  <div className="space-y-4">
                    <div className="p-3 bg-purple-950/40 border border-purple-500/30 rounded-xl text-xs font-mono text-purple-300">
                      User Prompt: "I need an automated plant watering system with moisture sensor and ESP32."
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                        <span className="text-[10px] text-slate-400 block font-mono">Entity Extraction</span>
                        <span className="text-xs text-white font-semibold">Sensor + MCU + Driver</span>
                      </div>
                      <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                        <span className="text-[10px] text-slate-400 block font-mono">Confidence</span>
                        <span className="text-xs text-emerald-400 font-semibold">99.2% (Deterministic)</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeStepIndex === 1 && (
                  <div className="space-y-3 font-mono text-xs">
                    <div className="text-purple-400 text-sm font-bold">// Requirements Rule Engine</div>
                    <div className="text-slate-300 pl-2 border-l-2 border-purple-500">
                      • Operating Voltage: 3.3V Logic / 5.0V Pump Rail<br/>
                      • Continuous Motor Load: 240mA @ 5V DC<br/>
                      • Sensor Output: 0.0V - 3.0V Analog (Capacitive)<br/>
                      • Safety Clamp: Flyback diode required to suppress -45V back-EMF spike
                    </div>
                  </div>
                )}

                {activeStepIndex === 2 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {['ESP32 DevKit', 'Capacitive Sensor', 'IRLZ44N MOSFET', '1N4007 Diode', '5V Pump', '18650 Battery'].map((c, i) => (
                      <div key={i} className="p-3 rounded-xl bg-white/5 border border-purple-500/20 text-center">
                        <Cpu className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                        <span className="text-xs font-semibold text-white block">{c}</span>
                        <span className="text-[10px] text-emerald-400 font-mono">In Stock & Verified</span>
                      </div>
                    ))}
                  </div>
                )}

                {activeStepIndex === 3 && (
                  <div className="space-y-2 font-mono text-xs">
                    <div className="p-3 bg-slate-900 rounded-lg border border-white/10 text-emerald-400">
                      NET "PUMP_GATE": ESP32:GPIO26 → R1:1 → R1:2 → Q1:GATE<br/>
                      NET "ANALOG_SENSE": SENSOR:VOUT → ESP32:GPIO34<br/>
                      NET "FLYBACK_CLAMP": MOTOR:POS → D1:CATHODE | MOTOR:NEG → D1:ANODE
                    </div>
                    <div className="text-[11px] text-slate-400 text-center">
                      ✓ Electrical Rules Check: 0 floating pins, 0 short circuits
                    </div>
                  </div>
                )}

                {activeStepIndex === 4 && (
                  <div className="text-center space-y-4">
                    <div className="p-4 bg-slate-950 border border-purple-500/40 rounded-xl">
                      <Layers className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                      <div className="text-sm font-bold text-white">3D Breadboard Synchronized</div>
                      <p className="text-xs text-slate-400 mt-1">
                        All 14 component leads positioned into breadboard rows with sub-millimeter snap precision.
                      </p>
                    </div>
                  </div>
                )}

                {activeStepIndex === 5 && (
                  <div className="bg-[#050608] p-4 rounded-xl border border-white/10 font-mono text-xs text-emerald-300">
                    <div className="text-slate-500">// Generated C++ Firmware for ESP32</div>
                    <div>#define PIN_ADC 34</div>
                    <div>#define PIN_GATE 26</div>
                    <div className="text-purple-400">void loop() &#123;</div>
                    <div className="pl-4">int v = analogRead(PIN_ADC);</div>
                    <div className="pl-4">if (v &lt; 1800) digitalWrite(PIN_GATE, HIGH);</div>
                    <div className="text-purple-400">&#125;</div>
                  </div>
                )}

                {activeStepIndex === 6 && (
                  <div className="space-y-3 font-mono text-xs">
                    <div className="flex items-center justify-between bg-black/60 p-3 rounded-lg border border-emerald-500/30">
                      <span className="text-slate-300">V_gate:</span>
                      <span className="text-emerald-400 font-bold">3.30 V</span>
                      <span className="text-slate-300">I_drain:</span>
                      <span className="text-emerald-400 font-bold">238.4 mA</span>
                      <span className="text-slate-300">MOSFET Rds(on):</span>
                      <span className="text-emerald-400 font-bold">0.022 Ω</span>
                    </div>
                    <div className="text-[11px] text-emerald-400 text-center">
                      Deterministic transient simulation validated without hardware destruction.
                    </div>
                  </div>
                )}

                {activeStepIndex === 7 && (
                  <div className="space-y-3 text-center">
                    <Sliders className="w-8 h-8 text-amber-400 mx-auto" />
                    <div className="text-sm font-bold text-white">Live What-If Slider Enabled</div>
                    <p className="text-xs text-slate-300">
                      Tweak moisture from 0% to 100% or change 220Ω to 1kΩ. The virtual oscilloscope updates its live waveform instantly.
                    </p>
                  </div>
                )}

                {activeStepIndex === 8 && (
                  <div className="space-y-3 text-center">
                    <DraftingCompass className="w-8 h-8 text-indigo-400 mx-auto" />
                    <div className="text-sm font-bold text-white">Dual-Layer PCB Layout Generated</div>
                    <p className="text-xs text-slate-400">
                      Ground plane copper pour (Bottom Layer), 12mil signal traces, 24mil power bus, standard 0.3mm vias.
                    </p>
                  </div>
                )}

                {activeStepIndex === 9 && (
                  <div className="space-y-3 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div className="text-base font-bold text-white">Working Physical Invention</div>
                    <p className="text-xs text-slate-300 max-w-md mx-auto">
                      From an initial prompt to a fabricated, working electronic device running live in the real world.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
