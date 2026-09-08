import React, { useState } from 'react';
import { 
  Activity, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Sliders,
  ExternalLink
} from 'lucide-react';
import { circuitAudio } from '../utils/audio';

type CircuitPreset = '555-astable' | 'soil-pump' | 'logic-adder';

export const InteractiveSimulation: React.FC = () => {
  const [selectedCircuit, setSelectedCircuit] = useState<CircuitPreset>('555-astable');
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);

  // 555 Timer Circuit State
  const [frequency, setFrequency] = useState(880); // Hz
  const [dutyCycle, setDutyCycle] = useState(50); // %

  // Plant Irrigation Circuit State
  const [soilMoisture, setSoilMoisture] = useState(25); // % (Below 35% triggers pump)
  const isPumpActive = soilMoisture < 35;

  // Digital Logic Half-Adder State
  const [inputA, setInputA] = useState<boolean>(true);
  const [inputB, setInputB] = useState<boolean>(false);
  const sumOut = (inputA && !inputB) || (!inputA && inputB); // XOR
  const carryOut = inputA && inputB; // AND

  // Simulation Running State
  const [isSimRunning, setIsSimRunning] = useState(true);

  // Audio trigger on button / parameter change
  const handleToggleAudio = () => {
    const isNowMuted = circuitAudio.toggleMute();
    setIsAudioEnabled(!isNowMuted);
    if (!isNowMuted) {
      circuitAudio.playTone(frequency, 0.1);
    }
  };

  const handleMoistureChange = (val: number) => {
    const prevPump = soilMoisture < 35;
    const nextPump = val < 35;
    setSoilMoisture(val);

    if (!prevPump && nextPump) {
      circuitAudio.playRelayClick();
    }
  };

  const handleToggleGate = (gate: 'A' | 'B') => {
    circuitAudio.playRelayClick();
    if (gate === 'A') setInputA(!inputA);
    else setInputB(!inputB);
  };

  return (
    <section id="simulation" className="py-24 px-4 sm:px-6 lg:px-8 bg-transparent relative z-20 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>Deterministic Mixed-Signal Simulation</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Live Interactive Simulator. <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-purple-400 bg-clip-text text-transparent">
              Test Real Physical Behavior.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-slate-400">
            Click switches, slide potentiometers, and see true voltage, current, and circuit states respond deterministically without burning real silicon.
          </p>
        </div>

        {/* Circuit Preset Selection Bar (The Tests Just Above It) */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          <button
            onClick={() => setSelectedCircuit('555-astable')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              selectedCircuit === '555-astable'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950 border border-emerald-400'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
            }`}
          >
            1. 555 Astable Pulser & Frequency Pot
          </button>

          <button
            onClick={() => setSelectedCircuit('soil-pump')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              selectedCircuit === 'soil-pump'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-950 border border-blue-400'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
            }`}
          >
            2. ESP32 Moisture Sensor & MOSFET Pump
          </button>

          <button
            onClick={() => setSelectedCircuit('logic-adder')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              selectedCircuit === 'logic-adder'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-950 border border-purple-400'
                : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
            }`}
          >
            3. DigiLogic Digital Half-Adder (XOR & AND)
          </button>
        </div>

        {/* Interactive Controls & Circuit Breadboard Component (Full Width Workbench) */}
        <div className="max-w-4xl mx-auto rounded-2xl bg-[#11141e] border border-white/10 p-6 flex flex-col justify-between shadow-2xl space-y-6">
          
          {/* Top Interactive Controls based on preset */}
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs uppercase font-bold text-purple-400 tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" />
                <span>Physical Bench Controls</span>
              </span>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsSimRunning(!isSimRunning)}
                  className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 text-xs flex items-center gap-1"
                  title="Run / Pause Simulation"
                >
                  {isSimRunning ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                  <span className="text-[10px] font-mono">{isSimRunning ? 'RUNNING' : 'PAUSED'}</span>
                </button>

                <button
                  onClick={handleToggleAudio}
                  className={`p-1.5 rounded text-xs flex items-center gap-1 transition-colors ${
                    isAudioEnabled ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30' : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                  title="Audio Synthesizer Tone"
                >
                  {isAudioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                  <span className="text-[10px] font-mono">{isAudioEnabled ? 'AUDIO ON' : 'MUTED'}</span>
                </button>
              </div>
            </div>

            {/* PRESET 1: 555 ASTABLE */}
            {selectedCircuit === '555-astable' && (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-300">Potentiometer Frequency:</span>
                    <span className="text-emerald-400 font-bold">{frequency} Hz</span>
                  </div>
                  <input
                    type="range"
                    min={100}
                    max={2000}
                    step={20}
                    value={frequency}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setFrequency(val);
                      if (isAudioEnabled) circuitAudio.playTone(val, 0.05);
                    }}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-300">Duty Cycle:</span>
                    <span className="text-emerald-400 font-bold">{dutyCycle}%</span>
                  </div>
                  <input
                    type="range"
                    min={10}
                    max={90}
                    step={5}
                    value={dutyCycle}
                    onChange={(e) => setDutyCycle(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                </div>

                {/* Pulsing Visual LED */}
                <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className={`w-6 h-6 rounded-full border border-emerald-400/50 transition-all ${
                        isSimRunning ? 'bg-emerald-400 shadow-lg shadow-emerald-500/80 animate-ping' : 'bg-emerald-950'
                      }`}
                      style={{ animationDuration: `${Math.max(0.1, 1000 / frequency)}s` }}
                    />
                    <span className="text-xs font-mono text-slate-200">Indicator LED D1</span>
                  </div>
                  <span className="text-xs font-mono text-emerald-400">Pulsing at {frequency}Hz</span>
                </div>
              </div>
            )}

            {/* PRESET 2: SOIL MOISTURE PUMP */}
            {selectedCircuit === 'soil-pump' && (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-300">Simulated Soil Moisture Level:</span>
                    <span className={`font-bold ${soilMoisture < 35 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {soilMoisture}% ({soilMoisture < 35 ? 'DRY - PUMP ON' : 'SATISFIED - PUMP OFF'})
                    </span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={95}
                    value={soilMoisture}
                    onChange={(e) => handleMoistureChange(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
                    <span>0% (Bone Dry)</span>
                    <span className="text-red-400 font-bold">Threshold: 35%</span>
                    <span>100% (Wet)</span>
                  </div>
                </div>

                {/* Actuator State Graphic */}
                <div className="p-4 rounded-xl bg-black/40 border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">Submersible Pump Motor:</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                      isPumpActive ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {isPumpActive ? 'RUNNING (5V, 238mA)' : 'IDLE (0mA)'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">IRLZ44N Gate State:</span>
                    <span className="font-mono text-purple-300 font-bold">
                      {isPumpActive ? 'V_GS = 3.30V (SATURATED)' : 'V_GS = 0.00V (CUT-OFF)'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* PRESET 3: DIGITAL LOGIC HALF-ADDER */}
            {selectedCircuit === 'logic-adder' && (
              <div className="space-y-4">
                <span className="text-xs text-slate-300 block">
                  Toggle input logic switches to observe live gate propagation and truth table:
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleToggleGate('A')}
                    className={`p-3 rounded-xl border text-xs font-mono font-bold transition-all ${
                      inputA
                        ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-900'
                        : 'bg-slate-800 text-slate-400 border-white/10'
                    }`}
                  >
                    Input A: {inputA ? '1 (HIGH)' : '0 (LOW)'}
                  </button>

                  <button
                    onClick={() => handleToggleGate('B')}
                    className={`p-3 rounded-xl border text-xs font-mono font-bold transition-all ${
                      inputB
                        ? 'bg-purple-600 text-white border-purple-400 shadow-md shadow-purple-900'
                        : 'bg-slate-800 text-slate-400 border-white/10'
                    }`}
                  >
                    Input B: {inputB ? '1 (HIGH)' : '0 (LOW)'}
                  </button>
                </div>

                {/* Truth Table Visualization */}
                <div className="bg-black/50 p-3 rounded-xl border border-white/5 font-mono text-xs">
                  <div className="grid grid-cols-4 text-[10px] text-slate-400 border-b border-white/10 pb-1 uppercase">
                    <span>IN A</span>
                    <span>IN B</span>
                    <span>SUM (XOR)</span>
                    <span>CARRY (AND)</span>
                  </div>
                  <div className="grid grid-cols-4 py-1 text-white font-bold">
                    <span>{inputA ? '1' : '0'}</span>
                    <span>{inputB ? '1' : '0'}</span>
                    <span className={sumOut ? 'text-emerald-400' : 'text-slate-500'}>{sumOut ? '1' : '0'}</span>
                    <span className={carryOut ? 'text-emerald-400' : 'text-slate-500'}>{carryOut ? '1' : '0'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Workspace CTA */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs text-slate-400">Simulate complex multi-IC circuits</span>
            <a
              href="https://kitt-ai-ravi.ai.studio"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
            >
              <span>Launch in Workspace</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>
      </div>
    </section>
  );
};
