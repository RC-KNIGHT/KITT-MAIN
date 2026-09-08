import React, { useState } from 'react';
import { 
  Sliders, 
  HelpCircle, 
  Sparkles, 
  BatteryCharging, 
  Calculator, 
  Check, 
  AlertTriangle,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { circuitAudio } from '../utils/audio';

export const ExperimentsSection: React.FC = () => {
  // Experiment 1: Resistor & Current
  const [resistorVal, setResistorVal] = useState<number>(220); // Ohms
  const supplyV = 5.0;
  const ledVf = 2.0; // Red LED forward voltage
  const currentMa = Math.max(0, ((supplyV - ledVf) / resistorVal) * 1000);
  const powerMw = (currentMa / 1000) * (currentMa / 1000) * resistorVal * 1000;

  // Experiment 2: Battery Voltage Sag
  const [batteryVoltage, setBatteryVoltage] = useState<number>(3.7);
  const isBrownout = batteryVoltage < 3.0;

  // Experiment 3: Interactive Number Trainer Mini-Drill
  const [userGuess, setUserGuess] = useState('');
  const [drillSuccess, setDrillSuccess] = useState<boolean | null>(null);

  const handleCheckBinary = (e: React.FormEvent) => {
    e.preventDefault();
    if (userGuess.trim() === '11') {
      setDrillSuccess(true);
      circuitAudio.playBeepSuccess();
    } else {
      setDrillSuccess(false);
    }
  };

  return (
    <section id="experiments" className="py-24 px-4 sm:px-6 lg:px-8 bg-transparent relative border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        {/* Header - Transparent background allows ambient particle movement behind titles */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider">
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>Interactive Experiments & Learning</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-[#E5E1DD] tracking-tight font-cinzel animate-title-breathe">
            "What Happens If...?" <br />
            <span className="animate-text-shimmer italic font-cormorant font-normal block mt-1 animate-text-glow">
              Experiment to Truly Understand.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-slate-400">
            KITT is not just for producing schematics. It is an intuitive discovery engine where you test physical hypotheses safely.
          </p>
        </div>

        {/* 3 Experiment Cards Grid: Each card has solid opaque background and z-10 to block particles inside */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 relative z-10">
          
          {/* Experiment 1: Resistor vs Current (Ohm's Law Experiment Box) */}
          <div className="rounded-2xl bg-[#11131b] border border-white/10 p-6 flex flex-col justify-between shadow-2xl space-y-6 relative z-10">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/30 font-bold">
                  Ohm's Law Experiment
                </span>
                <span className="text-xs font-mono text-slate-400">V_cc = 5.0V</span>
              </div>

              <h3 className="text-lg font-bold text-white">
                "What if I increase the series resistor?"
              </h3>

              {/* Interactive Resistor Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">Resistor Value:</span>
                  <span className="text-amber-400 font-bold">{resistorVal} Ω</span>
                </div>
                <input
                  type="range"
                  min={100}
                  max={4700}
                  step={50}
                  value={resistorVal}
                  onChange={(e) => setResistorVal(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>100Ω (High Load)</span>
                  <span>1kΩ</span>
                  <span>4.7kΩ (Dim)</span>
                </div>
              </div>

              {/* Reactive Visual LED Bulb */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full border border-red-500/40 transition-all duration-300 flex items-center justify-center"
                    style={{
                      backgroundColor: `rgba(239, 68, 68, ${Math.min(1, Math.max(0.1, currentMa / 25))})`,
                      boxShadow: currentMa > 20 ? '0 0 20px rgba(239, 68, 68, 0.8)' : 'none'
                    }}
                  />
                  <div>
                    <span className="text-xs font-semibold text-white block">LED Brightness</span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {currentMa > 25 ? '⚠️ Overcurrent warning' : currentMa < 2 ? 'Barely visible' : 'Optimal conduction'}
                    </span>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <div className="text-sm font-bold text-amber-400">{currentMa.toFixed(1)} mA</div>
                  <div className="text-[10px] text-slate-400">{powerMw.toFixed(1)} mW</div>
                </div>
              </div>

              {/* KITT Explanation */}
              <div className="p-3 rounded-lg bg-[#0e1017] border border-purple-500/20 text-xs text-slate-300 leading-relaxed">
                <div className="text-[10px] font-mono text-purple-300 font-bold mb-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  <span>KITT Engineering Note:</span>
                </div>
                I = (5.0V - 2.0V) / {resistorVal}Ω. Increasing resistance reduces the diode's forward current, keeping the junction temperature cool and saving battery.
              </div>
            </div>
          </div>

          {/* Experiment 2: Battery Sag & Brownout */}
          <div className="rounded-2xl bg-[#11131b] border border-white/10 p-6 flex flex-col justify-between shadow-2xl space-y-6 relative z-10">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-500/30 font-bold">
                  Power Electronics
                </span>
                <span className="text-xs font-mono text-slate-400">Li-ion 18650</span>
              </div>

              <h3 className="text-lg font-bold text-white">
                "What if the battery drops below 3.0V?"
              </h3>

              {/* Battery Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">Cell Voltage:</span>
                  <span className={`font-bold ${isBrownout ? 'text-red-400' : 'text-emerald-400'}`}>
                    {batteryVoltage.toFixed(2)} V
                  </span>
                </div>
                <input
                  type="range"
                  min={2.6}
                  max={4.2}
                  step={0.05}
                  value={batteryVoltage}
                  onChange={(e) => setBatteryVoltage(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span className="text-red-400">2.6V (Cut-off)</span>
                  <span className="text-blue-400">3.7V (Nominal)</span>
                  <span className="text-emerald-400">4.2V (Full)</span>
                </div>
              </div>

              {/* Status Graphic */}
              <div className={`p-4 rounded-xl border transition-all ${
                isBrownout 
                  ? 'bg-red-950/30 border-red-500/40 text-red-200' 
                  : 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
              }`}>
                <div className="flex items-center gap-3">
                  {isBrownout ? (
                    <AlertTriangle className="w-6 h-6 text-red-400 shrink-0" />
                  ) : (
                    <BatteryCharging className="w-6 h-6 text-emerald-400 shrink-0" />
                  )}
                  <div>
                    <span className="text-xs font-bold block">
                      {isBrownout ? 'BROWNOUT RESET (BOR) TRIPPED' : 'REGULATOR IN REGULATION'}
                    </span>
                    <span className="text-[10px] text-slate-300">
                      {isBrownout 
                        ? 'MCU resets in infinite reboot loop due to LDO dropout' 
                        : 'LDO maintains clean 3.30V rail for CPU & Wi-Fi'}
                    </span>
                  </div>
                </div>
              </div>

              {/* KITT Explanation */}
              <div className="p-3 rounded-lg bg-[#0e1017] border border-purple-500/20 text-xs text-slate-300 leading-relaxed">
                <div className="text-[10px] font-mono text-purple-300 font-bold mb-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  <span>KITT Engineering Note:</span>
                </div>
                The AMS1117-3.3 regulator requires ~1.1V dropout. When cell voltage falls below 3.0V, V_out sags to 2.5V, triggering the ESP32 internal brownout detector.
              </div>
            </div>
          </div>

          {/* Experiment 3: Number Trainer Bridge */}
          <div className="rounded-2xl bg-[#11131b] border border-white/10 p-6 flex flex-col justify-between shadow-2xl space-y-6 relative z-10">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 font-bold">
                  Number Trainer Practice
                </span>
                <span className="text-xs font-mono text-slate-400">Foundation Drill</span>
              </div>

              <h3 className="text-lg font-bold text-white">
                Convert Binary to Decimal
              </h3>

              <div className="p-4 bg-black/50 rounded-xl border border-white/10 text-center space-y-2">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                  Evaluate Binary Nibble:
                </span>
                <div className="text-2xl font-mono font-extrabold tracking-widest text-emerald-400">
                  1011₂
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  (8×1 + 4×0 + 2×1 + 1×1)
                </span>
              </div>

              {/* Interactive Submit Form */}
              <form onSubmit={handleCheckBinary} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter decimal (e.g. 11)"
                  value={userGuess}
                  onChange={(e) => {
                    setUserGuess(e.target.value);
                    setDrillSuccess(null);
                  }}
                  className="flex-1 px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 font-mono"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white cursor-pointer"
                >
                  Verify
                </button>
              </form>

              {drillSuccess === true && (
                <div className="p-2.5 rounded-lg bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5" />
                  <span>Correct! 1011₂ = 11 in decimal.</span>
                </div>
              )}

              {drillSuccess === false && (
                <div className="p-2.5 rounded-lg bg-red-950/50 border border-red-500/40 text-red-300 text-xs font-mono">
                  Try again! Hint: 8 + 0 + 2 + 1 = 11.
                </div>
              )}

              <a
                href="https://sriyansraj.github.io/Number_Trainer/index1.html"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold text-center transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Launch Full Number Trainer</span>
                <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
