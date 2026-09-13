import React, { useState } from 'react';
import { 
  Search, 
  ChevronDown, 
  ChevronRight, 
  Radio, 
  Gauge, 
  Activity, 
  ShieldCheck, 
  Plus, 
  Minus,
  Sparkles,
  SlidersHorizontal,
  Layers,
  HelpCircle
} from 'lucide-react';
import { CanonicalCircuitModel } from '../cir/cirTypes';
import { computeMultimeterReading, generateScopeWaveformData } from '../simulation/virtualInstruments';

interface ComponentLibrarySidebarProps {
  onAddComponent: (partKey: string) => void;
  circuit: CanonicalCircuitModel;
  simTime: number;
}

export const ComponentLibrarySidebar: React.FC<ComponentLibrarySidebarProps> = React.memo(({
  onAddComponent,
  circuit,
  simTime
}) => {
  const [activeTab, setActiveTab] = useState<'components' | 'instruments'>('components');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInstrument, setSelectedInstrument] = useState<'scope' | 'multimeter' | 'dcpoint'>('scope');

  // Component catalog grouped into tile grids (matching Antika media_1789194335648.png)
  const categories = [
    {
      id: 'sources',
      title: 'SOURCES',
      dotColor: '#f59e0b', // Amber
      items: [
        {
          key: 'DC_SOURCE',
          name: 'DC Source',
          svg: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <line x1="3" y1="12" x2="8" y2="12" />
              <line x1="8" y1="7" x2="8" y2="17" />
              <line x1="12" y1="9" x2="12" y2="15" />
              <line x1="16" y1="7" x2="16" y2="17" />
              <line x1="20" y1="9" x2="20" y2="15" />
              <line x1="20" y1="12" x2="23" y2="12" />
            </svg>
          )
        },
        {
          key: 'AC_SOURCE',
          name: 'AC Source',
          svg: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="12" cy="12" r="8" />
              <path d="M8 12c1-2 2-2 3 0s2 2 3 0" strokeLinecap="round" />
            </svg>
          )
        },
        {
          key: 'CURRENT_SRC',
          name: 'Current Src',
          svg: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="12" cy="12" r="8" />
              <line x1="8" y1="12" x2="16" y2="12" />
              <polyline points="13 9 16 12 13 15" />
            </svg>
          )
        },
        {
          key: 'GND',
          name: 'Ground',
          svg: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <line x1="12" y1="4" x2="12" y2="12" />
              <line x1="6" y1="12" x2="18" y2="12" />
              <line x1="8.5" y1="15" x2="15.5" y2="15" />
              <line x1="10.5" y1="18" x2="13.5" y2="18" />
            </svg>
          )
        },
        {
          key: 'CLOCK',
          name: 'Clock',
          svg: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M4 16h4V8h6v8h6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )
        },
        {
          key: 'VOLTAGE_REG',
          name: 'Voltage Reg',
          svg: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <rect x="4" y="6" width="16" height="12" rx="2" />
              <line x1="8" y1="6" x2="8" y2="3" />
              <line x1="12" y1="18" x2="12" y2="21" />
              <line x1="16" y1="6" x2="16" y2="3" />
            </svg>
          )
        }
      ]
    },
    {
      id: 'passives',
      title: 'PASSIVES',
      dotColor: '#06b6d4', // Cyan
      items: [
        {
          key: 'RESISTOR_220R',
          name: 'Resistor',
          svg: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M3 12h3l2-5 3 10 3-10 3 10 2-5h3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )
        },
        {
          key: 'CAPACITOR_100NF',
          name: 'Capacitor',
          svg: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <line x1="3" y1="12" x2="10" y2="12" />
              <line x1="10" y1="6" x2="10" y2="18" />
              <line x1="14" y1="6" x2="14" y2="18" />
              <line x1="14" y1="12" x2="21" y2="12" />
            </svg>
          )
        },
        {
          key: 'INDUCTOR',
          name: 'Inductor',
          svg: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M3 12h2a3 3 0 0 1 3-3 3 3 0 0 1 3 3 3 3 0 0 1 3-3 3 3 0 0 1 3 3 3 3 0 0 1 3-3 3 3 0 0 1 3 3h2" />
            </svg>
          )
        },
        {
          key: 'PUSH_BUTTON',
          name: 'Push Button',
          svg: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="6" cy="14" r="1.5" />
              <circle cx="18" cy="14" r="1.5" />
              <line x1="8" y1="10" x2="16" y2="10" />
              <line x1="12" y1="10" x2="12" y2="6" />
            </svg>
          )
        },
        {
          key: 'SWITCH',
          name: 'Switch',
          svg: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="5" cy="12" r="1.5" />
              <circle cx="19" cy="12" r="1.5" />
              <line x1="6.5" y1="12" x2="17" y2="7" />
            </svg>
          )
        },
        {
          key: 'POTENTIOMETER',
          name: 'Potentiometer',
          svg: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M3 12h3l2-4 3 8 3-8 2 4h3" />
              <line x1="12" y1="5" x2="12" y2="10" />
              <polyline points="10 8 12 10 14 8" />
            </svg>
          )
        },
        {
          key: 'LDR',
          name: 'LDR',
          svg: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="12" cy="12" r="8" />
              <path d="M7 12h2l1-3 2 6 2-6 1 3h2" />
            </svg>
          )
        },
        {
          key: 'THERMISTOR',
          name: 'Thermistor',
          svg: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <rect x="6" y="9" width="12" height="6" rx="1" />
              <line x1="4" y1="18" x2="20" y2="6" />
              <line x1="4" y1="18" x2="6" y2="18" />
            </svg>
          )
        },
        {
          key: 'BUZZER',
          name: 'Buzzer',
          svg: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <rect x="8" y="7" width="8" height="10" rx="1" />
              <path d="M8 9H5v6h3" />
              <line x1="16" y1="10" x2="19" y2="7" />
              <line x1="16" y1="14" x2="19" y2="17" />
            </svg>
          )
        },
        {
          key: 'DC_MOTOR',
          name: 'DC Motor',
          svg: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="12" cy="12" r="8" />
              <text x="12" y="15" fontSize="8" fontWeight="bold" textAnchor="middle" fill="currentColor">M</text>
            </svg>
          )
        },
        {
          key: 'TRANSFORMER',
          name: 'Transformer',
          svg: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M6 6a3 3 0 0 1 0 6 3 3 0 0 1 0 6" />
              <path d="M18 6a3 3 0 0 0 0 6 3 3 0 0 0 0 6" />
              <line x1="11" y1="5" x2="11" y2="19" />
              <line x1="13" y1="5" x2="13" y2="19" />
            </svg>
          )
        },
        {
          key: 'RELAY',
          name: 'Relay',
          svg: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <rect x="5" y="5" width="14" height="14" rx="2" />
              <path d="M9 14a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" />
            </svg>
          )
        }
      ]
    },
    {
      id: 'semiconductors',
      title: 'SEMICONDUCTORS',
      dotColor: '#10b981', // Emerald
      items: [
        {
          key: 'DIODE_1N4007',
          name: 'Diode',
          svg: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <line x1="3" y1="12" x2="8" y2="12" />
              <polygon points="8,7 16,12 8,17" fill="currentColor" fillOpacity="0.2" />
              <line x1="16" y1="7" x2="16" y2="17" />
              <line x1="16" y1="12" x2="21" y2="12" />
            </svg>
          )
        },
        {
          key: 'ZENER_5V1',
          name: 'Zener',
          svg: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <polygon points="8,7 16,12 8,17" fill="currentColor" fillOpacity="0.2" />
              <path d="M14 7h2v10h2" />
            </svg>
          )
        },
        {
          key: 'TRANSISTOR_2N2222',
          name: 'NPN BJT',
          svg: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="12" cy="12" r="8" />
              <line x1="9" y1="7" x2="9" y2="17" strokeWidth="2" />
              <line x1="9" y1="10" x2="16" y2="6" />
              <line x1="9" y1="14" x2="16" y2="18" />
              <polyline points="14 16 16 18 13 18" />
            </svg>
          )
        },
        {
          key: 'TRANSISTOR_2N2907',
          name: 'PNP BJT',
          svg: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="12" cy="12" r="8" />
              <line x1="9" y1="7" x2="9" y2="17" strokeWidth="2" />
              <line x1="9" y1="10" x2="16" y2="6" />
              <line x1="9" y1="14" x2="16" y2="18" />
              <polyline points="12 11 9 10 11 8" />
            </svg>
          )
        },
        {
          key: 'MOSFET_IRLZ44N',
          name: 'N-MOSFET',
          svg: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <line x1="5" y1="12" x2="9" y2="12" />
              <line x1="9" y1="7" x2="9" y2="17" strokeWidth="2" />
              <line x1="12" y1="7" x2="12" y2="17" />
              <line x1="12" y1="8" x2="18" y2="8" />
              <line x1="12" y1="16" x2="18" y2="16" />
            </svg>
          )
        },
        {
          key: 'LED_RED',
          name: 'LED',
          svg: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <polygon points="7,7 15,12 7,17" fill="currentColor" fillOpacity="0.2" />
              <line x1="15" y1="7" x2="15" y2="17" />
              <line x1="14" y1="6" x2="18" y2="2" />
              <polyline points="15 2 18 2 18 5" />
            </svg>
          )
        }
      ]
    },
    {
      id: 'ics',
      title: 'INTEGRATED CIRCUITS',
      dotColor: '#a855f7', // Purple
      items: [
        {
          key: 'IC_555_TIMER',
          name: '555 Timer',
          svg: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <rect x="6" y="5" width="12" height="14" rx="2" />
              <circle cx="12" cy="7" r="1" fill="currentColor" />
              <text x="12" y="14" fontSize="6" fontWeight="bold" textAnchor="middle" fill="currentColor">555</text>
            </svg>
          )
        },
        {
          key: 'IC_LM741',
          name: 'Op-Amp',
          svg: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <polygon points="5,5 19,12 5,19" fill="currentColor" fillOpacity="0.1" />
              <text x="9" y="10" fontSize="7" textAnchor="middle" fill="currentColor">-</text>
              <text x="9" y="16" fontSize="7" textAnchor="middle" fill="currentColor">+</text>
            </svg>
          )
        },
        {
          key: 'MCU_ESP32',
          name: 'ESP32 MCU',
          svg: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <rect x="5" y="4" width="14" height="16" rx="2" />
              <text x="12" y="14" fontSize="5" fontWeight="bold" textAnchor="middle" fill="currentColor">ESP32</text>
            </svg>
          )
        },
        {
          key: 'MCU_ARDUINO',
          name: 'Arduino Uno',
          svg: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <rect x="4" y="5" width="16" height="14" rx="2" />
              <circle cx="8" cy="12" r="1.5" />
              <circle cx="16" cy="12" r="1.5" />
            </svg>
          )
        }
      ]
    }
  ];

  const meterReading = activeTab === 'instruments' 
    ? computeMultimeterReading(circuit, 'V_DC', 'mcu_esp32_gpio26', 'mcu_esp32_gnd_1') 
    : { formatted: '3.30', unit: 'V' };
  const scopePoints = activeTab === 'instruments' 
    ? generateScopeWaveformData('FLYBACK_SPIKE', simTime, 48) 
    : [];

  return (
    <aside className="w-72 h-full bg-[#0a1117] border-r border-white/10 flex flex-col shrink-0 font-sans select-none z-20">
      {/* Top Tabs: Components | Instruments (Antika exact tabs layout) */}
      <div className="h-12 px-3 border-b border-white/10 flex items-center bg-[#070d12]">
        <div className="w-full flex items-center border-b border-transparent gap-4 text-xs font-mono">
          <button
            onClick={() => setActiveTab('components')}
            className={`pb-2 pt-1 transition-all cursor-pointer font-bold relative ${
              activeTab === 'components'
                ? 'text-[#2dd4bf]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Components
            {activeTab === 'components' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2dd4bf] rounded-full shadow-[0_0_8px_#2dd4bf]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('instruments')}
            className={`pb-2 pt-1 transition-all cursor-pointer font-bold relative ${
              activeTab === 'instruments'
                ? 'text-[#2dd4bf]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Instruments
            {activeTab === 'instruments' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2dd4bf] rounded-full shadow-[0_0_8px_#2dd4bf]" />
            )}
          </button>
        </div>
      </div>

      {/* Search Input Box */}
      <div className="p-2.5 border-b border-white/5">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder={activeTab === 'components' ? "Search components..." : "Search instruments..."}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#070d12] border border-white/10 text-xs font-mono text-[#E5E1DD] placeholder:text-slate-500 focus:outline-none focus:border-[#2dd4bf]"
          />
        </div>
      </div>

      {/* TAB 1: COMPONENTS (Tile grid matching Antika media_1789194335648.png) */}
      {activeTab === 'components' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {categories.map(cat => {
            const filteredItems = cat.items.filter(it => 
              !searchTerm || it.name.toLowerCase().includes(searchTerm.toLowerCase())
            );

            if (filteredItems.length === 0 && searchTerm) return null;

            return (
              <div key={cat.id} className="space-y-2">
                {/* Category Header with dot indicator */}
                <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.dotColor }} />
                  <span>{cat.title}</span>
                </div>

                {/* 3-Column Tile Grid */}
                <div className="grid grid-cols-3 gap-1.5">
                  {filteredItems.map(item => (
                    <button
                      key={item.key}
                      onClick={() => onAddComponent(item.key)}
                      className="group flex flex-col items-center justify-center p-2 rounded-xl bg-[#0e171f] hover:bg-[#15232e] border border-white/5 hover:border-[#2dd4bf]/50 text-slate-400 hover:text-white transition-all cursor-pointer shadow-sm hover:shadow-[0_0_12px_rgba(45,212,191,0.15)] h-18"
                      title={`Add ${item.name}`}
                    >
                      <div className="text-slate-300 group-hover:text-[#2dd4bf] transition-colors mb-1.5">
                        {item.svg}
                      </div>
                      <span className="text-[10px] font-mono text-center leading-tight truncate w-full group-hover:text-[#E5E1DD]">
                        {item.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: INSTRUMENTS (matching Antika media_1789194377551.png) */}
      {activeTab === 'instruments' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-4 font-mono text-xs">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
            INSTRUMENT • EXPERIMENTAL
          </div>

          {/* 1. Oscilloscope Card */}
          <div
            onClick={() => setSelectedInstrument('scope')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              selectedInstrument === 'scope'
                ? 'bg-[#2dd4bf]/10 border-[#2dd4bf] shadow-[0_0_15px_rgba(45,212,191,0.15)]'
                : 'bg-[#0e171f] border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center gap-2.5 mb-1.5">
              <Radio className={`w-4 h-4 ${selectedInstrument === 'scope' ? 'text-[#2dd4bf]' : 'text-slate-400'}`} />
              <span className="font-bold text-sm text-[#E5E1DD]">Oscilloscope</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug font-sans">
              Experimental plot of selected pin voltages and signal transients.
            </p>

            {selectedInstrument === 'scope' && (
              <div className="mt-3 pt-2 border-t border-white/10">
                <div className="h-20 bg-black/60 rounded-lg p-1 border border-white/5 relative overflow-hidden">
                  <svg className="w-full h-full">
                    <polyline
                      fill="none"
                      stroke="#2dd4bf"
                      strokeWidth="2"
                      points={scopePoints.map((p, i) => `${i * 6},${40 - p.voltageV * 6}`).join(' ')}
                    />
                  </svg>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>CH1: GPIO Signal</span>
                  <span className="text-[#2dd4bf]">1.5kHz 5.2Vpp</span>
                </div>
              </div>
            )}
          </div>

          {/* 2. Multimeter Card */}
          <div
            onClick={() => setSelectedInstrument('multimeter')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              selectedInstrument === 'multimeter'
                ? 'bg-[#2dd4bf]/10 border-[#2dd4bf] shadow-[0_0_15px_rgba(45,212,191,0.15)]'
                : 'bg-[#0e171f] border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center gap-2.5 mb-1.5">
              <Gauge className={`w-4 h-4 ${selectedInstrument === 'multimeter' ? 'text-[#2dd4bf]' : 'text-slate-400'}`} />
              <span className="font-bold text-sm text-[#E5E1DD]">Multimeter</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug font-sans">
              Experimental live readings for selected pins (V, I, R, Continuity).
            </p>

            {selectedInstrument === 'multimeter' && (
              <div className="mt-3 pt-2 border-t border-white/10 text-center">
                <div className="text-xl font-bold text-[#2dd4bf] bg-black/60 py-2 rounded-lg border border-white/5">
                  {meterReading.formatted} {meterReading.unit}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Node: GPIO26 vs GND</div>
              </div>
            )}
          </div>

          {/* 3. DC Operating Point Card */}
          <div
            onClick={() => setSelectedInstrument('dcpoint')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              selectedInstrument === 'dcpoint'
                ? 'bg-[#2dd4bf]/10 border-[#2dd4bf] shadow-[0_0_15px_rgba(45,212,191,0.15)]'
                : 'bg-[#0e171f] border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center gap-2.5 mb-1.5">
              <Activity className={`w-4 h-4 ${selectedInstrument === 'dcpoint' ? 'text-[#2dd4bf]' : 'text-slate-400'}`} />
              <span className="font-bold text-sm text-[#E5E1DD]">DC operating point</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug font-sans">
              Static node voltages and branch currents solver.
            </p>

            {selectedInstrument === 'dcpoint' && (
              <div className="mt-3 pt-2 border-t border-white/10 space-y-1 text-[11px]">
                <div className="flex justify-between text-slate-300">
                  <span>Supply VCC:</span>
                  <span className="text-[#2dd4bf]">{circuit.telemetry.supplyVoltage}V</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Loop Current:</span>
                  <span className="text-[#2dd4bf]">{circuit.telemetry.totalCurrentDraw_mA} mA</span>
                </div>
              </div>
            )}
          </div>

          {/* PROBES (0) SECTION (matching Antika media_1789194377551.png) */}
          <div className="pt-3 border-t border-white/10 space-y-2">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
              PROBES (0)
            </div>
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 text-center text-[11px] text-slate-400 font-sans leading-relaxed">
              Open the waveform view and use its component and pin selectors to add a probe. Direct canvas probing is not available yet.
            </div>
          </div>
        </div>
      )}
    </aside>
  );
});

ComponentLibrarySidebar.displayName = 'ComponentLibrarySidebar';
