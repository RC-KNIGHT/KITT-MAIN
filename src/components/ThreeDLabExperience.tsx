import React, { useState } from 'react';
import { 
  Layers, 
  Crosshair, 
  Info 
} from 'lucide-react';
import { circuitAudio } from '../utils/audio';

interface LabComponent {
  id: string;
  name: string;
  category: string;
  value: string;
  quantity: number;
  unitCost: string;
  purpose: string;
  pinout: string;
  ratings: string;
  liveVoltage: string;
  x: number; // percentage coordinates on 3D breadboard
  y: number;
  schematicX: number; // schematic coordinate
  schematicY: number;
  color: string;
}

const BENCH_COMPONENTS: LabComponent[] = [
  {
    id: 'esp32',
    name: 'ESP32-WROOM-32 DevKit',
    category: 'Microcontroller SoC',
    value: 'Dual-core 240MHz, 4MB Flash',
    quantity: 1,
    unitCost: '$4.20',
    purpose: 'Core brain executing moisture reading loop, Wi-Fi MQTT telemetry, and PWM gate signal.',
    pinout: 'GPIO34 (ADC1), GPIO26 (Gate Output), 3V3, GND',
    ratings: '3.0V - 3.6V Operating, 80mA active',
    liveVoltage: '3.31 V (Active)',
    x: 28,
    y: 42,
    schematicX: 180,
    schematicY: 130,
    color: '#3b82f6'
  },
  {
    id: 'sensor',
    name: 'Capacitive Soil Moisture Sensor v1.2',
    category: 'Analog Sensor',
    value: 'Analog V_out (1.2V - 2.8V)',
    quantity: 1,
    unitCost: '$1.80',
    purpose: 'Corrosion-resistant capacitive dielectric probe for measuring soil volumetric water content.',
    pinout: 'VCC (3.3V), GND, AOUT → ESP32 GPIO34',
    ratings: '3.3V - 5.5V DC, < 5mA',
    liveVoltage: '1.84 V (68% Moisture)',
    x: 74,
    y: 35,
    schematicX: 60,
    schematicY: 120,
    color: '#10b981'
  },
  {
    id: 'mosfet',
    name: 'IRLZ44N Logic-Level N-Ch MOSFET',
    category: 'Power Semiconductor',
    value: 'Vds=55V, Id=47A, Rds(on)=0.022Ω',
    quantity: 1,
    unitCost: '$0.85',
    purpose: 'Low-side electronic switch allowing 3.3V GPIO to safely control the high-current 5V pump motor.',
    pinout: 'Pin 1: Gate (GPIO26), Pin 2: Drain (Pump -), Pin 3: Source (GND)',
    ratings: 'Gate Threshold Vgs(th) = 1.0V - 2.0V',
    liveVoltage: 'Vgs = 3.29 V (Saturated ON)',
    x: 52,
    y: 62,
    schematicX: 370,
    schematicY: 200,
    color: '#f59e0b'
  },
  {
    id: 'diode',
    name: '1N4007 Flyback Suppression Diode',
    category: 'Rectifier Diode',
    value: '1000V Vrrm, 1A If',
    quantity: 1,
    unitCost: '$0.10',
    purpose: 'Snubs inductive kickback voltage spikes when the motor coil turns off, protecting the MOSFET.',
    pinout: 'Cathode (Silver Band) to +5V, Anode to MOSFET Drain',
    ratings: 'Vf = 1.1V @ 1A, Reverse Recovery = Standard',
    liveVoltage: 'Reverse Biased (0.00 V)',
    x: 63,
    y: 66,
    schematicX: 470,
    schematicY: 110,
    color: '#94a3b8'
  },
  {
    id: 'pump',
    name: 'Submersible 5V DC Mini Pump',
    category: 'Actuator / Motor',
    value: '120 L/H, 5V DC',
    quantity: 1,
    unitCost: '$3.50',
    purpose: 'Miniature brushless centrifugal pump for delivering water to plant roots.',
    pinout: 'Red (+5V Rail), Black (MOSFET Drain)',
    ratings: '5V DC, 250mA, Head: 0.5m',
    liveVoltage: '5.02 V @ 248 mA',
    x: 82,
    y: 72,
    schematicX: 470,
    schematicY: 170,
    color: '#06b6d4'
  },
  {
    id: 'resistor',
    name: '220Ω Gate Protection Resistor',
    category: 'Passive Resistor',
    value: '220Ω ±5%, 0.25W',
    quantity: 1,
    unitCost: '$0.02',
    purpose: 'Limits inrush gate charging current to protect the ESP32 GPIO pin during high-speed switching.',
    pinout: 'In series between GPIO26 and MOSFET Gate',
    ratings: 'Carbon Film, 250V Max Working',
    liveVoltage: 'ΔV = 0.02 V (Gate Charged)',
    x: 42,
    y: 58,
    schematicX: 290,
    schematicY: 200,
    color: '#a855f7'
  }
];

export const ThreeDLabExperience: React.FC = () => {
  const [selectedComponent, setSelectedComponent] = useState<LabComponent>(BENCH_COMPONENTS[0]);
  const isPowered = true;
  const zoomLevel = 1;

  return (
    <section id="3d-lab" className="py-24 px-4 sm:px-6 lg:px-8 bg-transparent relative z-20">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold uppercase tracking-wider">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>Synchronized Physical 3D Prototype Assembly</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Realistic Prototype Assembly. <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              One Project. Many Views.
            </span>
          </h2>

          <p className="text-sm sm:text-base text-slate-400">
            KITT does not generate cartoon approximations. The exact same canonical netlist drives the 3D physical breadboard assembly with real components and wiring.
          </p>
        </div>

        {/* 3D Lab Interactive Breadboard Canvas (Full Width) */}
        <div className="w-full max-w-5xl mx-auto rounded-2xl bg-[#0d0f17] border border-white/10 overflow-hidden shadow-2xl flex flex-col">
          {/* Interactive Scene Graphic */}
          <div className="relative aspect-[16/10] bg-[#07080d] p-4 sm:p-8 flex items-center justify-center overflow-hidden select-none">
            {/* 3D ISOMETRIC BREADBOARD */}
                <div 
                  className="relative w-full max-w-2xl bg-[#f1f5f9] rounded-2xl border-4 border-[#94a3b8] shadow-2xl p-6 transition-transform duration-500"
                  style={{
                    transform: `scale(${zoomLevel}) perspective(900px) rotateX(24deg) rotateZ(-3deg)`,
                    boxShadow: isPowered 
                      ? '0 25px 60px -12px rgba(168, 85, 247, 0.25), 0 0 40px rgba(16, 185, 129, 0.15)' 
                      : '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
                  }}
                >
                  {/* Breadboard Center Trough */}
                  <div className="absolute top-1/2 left-4 right-4 -translate-y-1/2 h-2.5 bg-[#64748b] rounded-sm" />

                  {/* Top Power Rails (Red & Blue) */}
                  <div className={`h-1 mb-2 rounded transition-colors ${isPowered ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : 'bg-red-900/50'}`} />
                  <div className={`h-1 mb-4 rounded transition-colors ${isPowered ? 'bg-blue-500 shadow-[0_0_8px_#3b82f6]' : 'bg-blue-900/50'}`} />

                  {/* Grid of Holes */}
                  <div className="grid grid-rows-10 grid-flow-col gap-1.5 sm:gap-2 justify-between py-2">
                    {Array.from({ length: 220 }).map((_, i) => (
                      <div 
                        key={i} 
                        className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#475569] shadow-inner"
                      />
                    ))}
                  </div>

                  {/* Bottom Power Rails */}
                  <div className={`h-1 mt-4 rounded transition-colors ${isPowered ? 'bg-blue-500 shadow-[0_0_8px_#3b82f6]' : 'bg-blue-900/50'}`} />
                  <div className={`h-1 mt-2 rounded transition-colors ${isPowered ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : 'bg-red-900/50'}`} />

                  {/* Simulated Color-Coded Wires */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                    {/* Wire 1: Orange ESP32 GPIO26 to 220R Resistor */}
                    <path
                      d="M 160 90 Q 210 40, 240 115"
                      fill="none"
                      stroke={isPowered ? "#f97316" : "#7c2d12"}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                    {/* Wire 2: Cyan Soil Sensor to ESP32 ADC34 */}
                    <path
                      d="M 380 70 Q 290 15, 160 75"
                      fill="none"
                      stroke={isPowered ? "#06b6d4" : "#164e63"}
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    {/* Wire 3: Blue GND Common Bus */}
                    <path
                      d="M 270 130 Q 340 175, 420 135"
                      fill="none"
                      stroke={isPowered ? "#3b82f6" : "#1e3a8a"}
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    {/* Wire 4: Red +5V Power to Mini Pump */}
                    <path
                      d="M 420 120 Q 470 50, 480 135"
                      fill="none"
                      stroke={isPowered ? "#ef4444" : "#7f1d1d"}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                  </svg>

                  {/* Interactive Hotspot Pins for Components */}
                  {BENCH_COMPONENTS.map((comp) => {
                    const isSelected = selectedComponent.id === comp.id;

                    return (
                      <button
                        key={comp.id}
                        onClick={() => {
                          setSelectedComponent(comp);
                          circuitAudio.playTone(440, 0.04, 'sine');
                        }}
                        style={{ left: `${comp.x}%`, top: `${comp.y}%` }}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 group cursor-pointer transition-all duration-300 ${
                          isSelected ? 'scale-125' : 'hover:scale-110'
                        }`}
                      >
                        {/* Outer pulse when selected */}
                        {isSelected && (
                          <span className="absolute -inset-2 rounded-xl bg-purple-500/30 animate-ping pointer-events-none" />
                        )}

                        <div 
                          className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 shadow-xl transition-all ${
                            isSelected
                              ? 'bg-[#12141e] border-purple-400 text-purple-300 ring-2 ring-purple-500/50'
                              : 'bg-[#0b0d14]/90 border-white/20 text-slate-200 hover:border-white/50'
                          }`}
                        >
                          <Crosshair className={`w-3.5 h-3.5 ${isSelected ? 'text-purple-400 animate-spin' : 'text-slate-400'}`} style={{ animationDuration: '6s' }} />
                          <span className="text-[10px] font-mono font-bold whitespace-nowrap">
                            {comp.name.split(' ')[0]}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Instructions Badge */}
                <div className="absolute bottom-3 left-4 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-[10px] font-mono text-slate-300 flex items-center gap-1.5">
                  <Info className="w-3 h-3 text-purple-400" />
                  <span>Interactive 3D Breadboard Prototype</span>
                </div>
              </div>
          </div>
      </div>
    </section>
  );
};
