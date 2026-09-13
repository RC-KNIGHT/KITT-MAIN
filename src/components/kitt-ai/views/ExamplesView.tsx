import React, { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  ArrowRight, 
  Cpu, 
  Zap, 
  Clock, 
  Activity, 
  Radio, 
  Layers, 
  SlidersHorizontal,
  Plus
} from 'lucide-react';
import { CircuitTemplateInfo, KITT_EXAMPLE_TEMPLATES } from '../data/exampleTemplates';

interface ExamplesViewProps {
  onOpenExample: (template: CircuitTemplateInfo) => void;
  onCloneExample: (template: CircuitTemplateInfo) => void;
}

export const ExamplesView: React.FC<ExamplesViewProps> = ({
  onOpenExample,
  onCloneExample
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Templates' },
    { id: 'TIMERS & ANALOG', label: 'Timers & Oscillators' },
    { id: 'MICROCONTROLLERS', label: 'Microcontrollers' },
    { id: 'IOT & SENSORS', label: 'IoT & Sensors' },
    { id: 'AMPLIFIERS & ANALOG', label: 'Amplifiers & Filters' },
    { id: 'POWER MANAGEMENT', label: 'Power & Regulators' },
    { id: 'LOGIC & STATE MACHINES', label: 'Logic & Digital' }
  ];

  const filteredTemplates = KITT_EXAMPLE_TEMPLATES.filter(tpl => {
    const matchesSearch = !searchTerm ||
      tpl.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tpl.shortDesc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tpl.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tpl.targetMcu && tpl.targetMcu.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCat = selectedCategory === 'all' || 
      tpl.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      (selectedCategory === 'AMPLIFIERS & ANALOG' && (tpl.category.includes('AMPLIFIERS') || tpl.category.includes('SIGNAL')));

    return matchesSearch && matchesCat;
  });

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 font-sans max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="pb-4 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl sm:text-2xl font-bold font-mono text-[#E5E1DD]">Example Circuits</h1>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#A58D66]/20 text-[#DFCCA8] border border-[#A58D66]/30">
            {KITT_EXAMPLE_TEMPLATES.length} Verified Presets
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1 max-w-2xl">
          Pre-wired, DRC-verified canonical circuit models ready to simulate, modify, and export to KiCad.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="space-y-3 bg-[#0c161d] p-3 rounded-xl border border-[#A58D66]/20">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search input */}
          <div className="relative w-full sm:max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search templates by name, IC, or function..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#080f14] border border-white/10 text-xs font-mono text-[#E5E1DD] placeholder:text-slate-500 focus:outline-none focus:border-[#A58D66]"
            />
          </div>

          <span className="text-xs font-mono text-slate-400 self-start sm:self-auto">
            Showing {filteredTemplates.length} of {KITT_EXAMPLE_TEMPLATES.length}
          </span>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#A58D66] text-[#080f14] font-bold shadow-sm'
                  : 'bg-[#080f14] text-slate-400 hover:text-white border border-white/5 hover:border-white/15'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTemplates.map(tpl => (
          <div
            key={tpl.id}
            className="group rounded-xl bg-[#0c161d] hover:bg-[#111d24] border border-[#A58D66]/25 hover:border-[#A58D66]/60 p-5 transition-all duration-200 flex flex-col justify-between shadow-lg"
          >
            <div>
              {/* Circuit Preview Visual */}
              <div 
                onClick={() => onOpenExample(tpl)}
                className="w-full h-32 rounded-lg bg-[#080f14] border border-white/5 mb-3.5 flex items-center justify-center p-3 relative overflow-hidden group-hover:border-[#A58D66]/30 transition-colors cursor-pointer"
              >
                <div 
                  className="absolute inset-0 opacity-15"
                  style={{
                    backgroundImage: 'radial-gradient(#A58D66 1px, transparent 1px)',
                    backgroundSize: '12px 12px'
                  }}
                />

                <div className="relative z-10 text-center">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-[#A58D66]/15 border border-[#A58D66]/30 flex items-center justify-center text-[#DFCCA8] group-hover:scale-110 transition-transform shadow-inner">
                    {tpl.svgIconType === 'timer' && <Clock className="w-6 h-6" />}
                    {tpl.svgIconType === 'radar' && <Radio className="w-6 h-6" />}
                    {tpl.svgIconType === 'irrigation' && <Cpu className="w-6 h-6" />}
                    {tpl.svgIconType === 'weather' && <Activity className="w-6 h-6" />}
                    {tpl.svgIconType === 'traffic' && <Layers className="w-6 h-6" />}
                    {tpl.svgIconType === 'opamp' && <Zap className="w-6 h-6" />}
                    {tpl.svgIconType === 'flipflop' && <SlidersHorizontal className="w-6 h-6" />}
                    {tpl.svgIconType === 'regulator' && <Zap className="w-6 h-6 text-[#10b981]" />}
                    {tpl.svgIconType === 'hbridge' && <Activity className="w-6 h-6 text-[#22d3ee]" />}
                    {tpl.svgIconType === 'filter' && <Radio className="w-6 h-6 text-[#DFCCA8]" />}
                  </div>

                  <span className="text-[11px] font-mono text-slate-400 mt-2 block font-medium">
                    {tpl.componentCount} parts • {tpl.supplyVoltage}
                  </span>
                </div>
              </div>

              {/* Category & Difficulty Badge */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#A58D66]/15 text-[#DFCCA8] border border-[#A58D66]/25">
                  {tpl.category}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {tpl.difficulty}
                </span>
              </div>

              {/* Title & Short Description */}
              <h3 
                onClick={() => onOpenExample(tpl)}
                className="text-sm font-bold font-mono text-[#E5E1DD] group-hover:text-[#DFCCA8] transition-colors cursor-pointer"
              >
                {tpl.title}
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {tpl.shortDesc}
              </p>
            </div>

            {/* Actions */}
            <div className="pt-4 mt-3 border-t border-white/5 flex items-center justify-between gap-2">
              <button
                onClick={() => onCloneExample(tpl)}
                className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Create a copy in your workspace"
              >
                <Plus className="w-3.5 h-3.5 text-[#A58D66]" />
                <span>Clone</span>
              </button>

              <button
                onClick={() => onOpenExample(tpl)}
                className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#A58D66] to-[#8C7654] hover:from-[#bfa378] hover:to-[#A58D66] text-[#080f14] text-xs font-mono font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(165,141,102,0.2)] transition-all cursor-pointer"
              >
                <span>Open in Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
