import React, { useRef } from 'react';
import { 
  Plus, 
  Upload, 
  BookOpen, 
  ArrowRight, 
  Sparkles, 
  Layers, 
  Clock, 
  MoreVertical, 
  Trash2, 
  Copy, 
  ExternalLink,
  Cpu,
  Zap,
  Play
} from 'lucide-react';
import { KittProject } from '../state/projectStore';
import { CircuitTemplateInfo, KITT_EXAMPLE_TEMPLATES } from '../data/exampleTemplates';

interface HomeDashboardProps {
  projects: KittProject[];
  onOpenProject: (projectId: string) => void;
  onOpenExample: (template: CircuitTemplateInfo) => void;
  onNewProject: () => void;
  onBrowseExamples: () => void;
  onDuplicateProject: (projectId: string) => void;
  onTrashProject: (projectId: string) => void;
  onImportProject: (jsonData: string) => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  projects,
  onOpenProject,
  onOpenExample,
  onNewProject,
  onBrowseExamples,
  onDuplicateProject,
  onTrashProject,
  onImportProject
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const featuredTemplates = KITT_EXAMPLE_TEMPLATES.filter(t => t.featured).slice(0, 3);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      if (content) onImportProject(content);
    };
    reader.readAsText(file);
  };

  const formatRelativeTime = (timestamp: number) => {
    const diffMs = Date.now() - timestamp;
    const diffMins = Math.floor(diffMs / (60 * 1000));
    const diffHours = Math.floor(diffMs / (3600 * 1000));
    const diffDays = Math.floor(diffMs / (86400 * 1000));

    if (diffMins < 5) return 'Edited just now';
    if (diffMins < 60) return `Edited ${diffMins} mins ago`;
    if (diffHours < 24) return `Edited ${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    return `Edited ${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 font-sans max-w-7xl mx-auto w-full">
      {/* 1. HERO BANNER (Matching Antika layout with dark theme & technical circuit art) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0c161d] via-[#111f29] to-[#0c161d] border border-[#A58D66]/35 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#A58D66]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-[#407E8C]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
          {/* Left Hero Content */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#A58D66]/15 border border-[#A58D66]/30 text-xs font-mono text-[#DFCCA8]">
              <Sparkles className="w-3.5 h-3.5 text-[#A58D66]" />
              <span>KITT Electronics & Hardware Studio</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#E5E1DD] font-mono leading-tight">
              Let's build something amazing
            </h1>

            <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
              Design, simulate, and export circuits with AI assistance or browse our template library. High-precision SPICE simulation and KiCad integration in one seamless workspace.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onNewProject}
                className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#A58D66] to-[#8C7654] hover:from-[#bfa378] hover:to-[#A58D66] text-[#080f14] font-mono font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(165,141,102,0.35)] transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ New project</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 rounded-lg bg-[#0c161d] hover:bg-white/10 border border-[#A58D66]/30 text-slate-300 hover:text-white font-mono text-xs flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-[#A58D66]" />
                <span>Import circuit</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.kicad_sch"
                className="hidden"
                onChange={handleFileChange}
              />

              <button
                onClick={onBrowseExamples}
                className="px-3.5 py-2.5 rounded-lg text-slate-400 hover:text-[#DFCCA8] font-mono text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Template Library</span>
              </button>
            </div>
          </div>

          {/* Right Hero Abstract Circuit Artwork */}
          <div className="lg:col-span-5 hidden lg:flex justify-end">
            <div className="relative w-full max-w-sm h-52 rounded-xl bg-black/40 border border-[#A58D66]/25 p-4 overflow-hidden flex items-center justify-center shadow-inner">
              {/* Circuit Grid Background */}
              <div 
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: 'radial-gradient(#A58D66 1px, transparent 1px)',
                  backgroundSize: '16px 16px'
                }}
              />

              {/* Dynamic SVG Circuit Illustration */}
              <svg className="w-full h-full text-[#A58D66]" viewBox="0 0 320 180" fill="none">
                {/* Copper Traces */}
                <path d="M 20 90 L 80 90 L 100 50 L 170 50 L 190 90 L 290 90" stroke="#A58D66" strokeWidth="2" strokeDasharray="6 3" />
                <path d="M 80 90 L 100 130 L 160 130 L 180 90" stroke="#407E8C" strokeWidth="2" opacity="0.8" />
                <path d="M 130 50 L 130 20 L 220 20 L 220 50" stroke="#DFCCA8" strokeWidth="1.5" strokeOpacity="0.6" />

                {/* Microcontroller Silicon Die */}
                <rect x="110" y="70" width="70" height="40" rx="4" fill="#0c161d" stroke="#A58D66" strokeWidth="2" />
                <text x="145" y="94" fill="#DFCCA8" fontSize="9" fontFamily="monospace" textAnchor="middle" fontWeight="bold">KITT MCU</text>

                {/* IC Pins */}
                <circle cx="104" cy="78" r="2" fill="#DFCCA8" />
                <circle cx="104" cy="90" r="2" fill="#DFCCA8" />
                <circle cx="104" cy="102" r="2" fill="#DFCCA8" />
                <circle cx="186" cy="78" r="2" fill="#407E8C" />
                <circle cx="186" cy="90" r="2" fill="#407E8C" />
                <circle cx="186" cy="102" r="2" fill="#407E8C" />

                {/* Pulse Nodes */}
                <circle cx="80" cy="90" r="4" fill="#10b981" className="animate-ping" />
                <circle cx="80" cy="90" r="3" fill="#10b981" />

                <circle cx="190" cy="90" r="4" fill="#A58D66" />
                <circle cx="290" cy="90" r="5" fill="#22d3ee" />
              </svg>

              <div className="absolute bottom-2 right-3 flex items-center gap-1.5 text-[10px] font-mono text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                <span>Deterministic SPICE Live</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. START FROM AN EXAMPLE (3-column cards matching Antika) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold font-mono text-[#E5E1DD]">Start from an example</h2>
            <span className="text-xs text-slate-500 font-mono">10 templates</span>
          </div>

          <button
            onClick={onBrowseExamples}
            className="text-xs font-mono text-[#DFCCA8] hover:text-white flex items-center gap-1 transition-colors cursor-pointer group"
          >
            <span>Browse templates</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {featuredTemplates.map((tpl) => (
            <div
              key={tpl.id}
              onClick={() => onOpenExample(tpl)}
              className="group rounded-xl bg-[#0c161d] hover:bg-[#111d24] border border-[#A58D66]/25 hover:border-[#A58D66]/60 p-4 transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-lg hover:shadow-[0_4px_20px_rgba(165,141,102,0.12)]"
            >
              <div>
                {/* SVG Mini Circuit Schematic Preview */}
                <div className="w-full h-28 rounded-lg bg-[#080f14] border border-white/5 mb-3 flex items-center justify-center p-3 relative overflow-hidden group-hover:border-[#A58D66]/30 transition-colors">
                  <div 
                    className="absolute inset-0 opacity-15"
                    style={{
                      backgroundImage: 'radial-gradient(#A58D66 1px, transparent 1px)',
                      backgroundSize: '12px 12px'
                    }}
                  />

                  {/* Representative circuit icon */}
                  <div className="relative z-10 text-center">
                    <div className="w-10 h-10 mx-auto rounded-lg bg-[#A58D66]/10 border border-[#A58D66]/30 flex items-center justify-center text-[#DFCCA8] group-hover:scale-110 transition-transform">
                      {tpl.svgIconType === 'timer' && <Clock className="w-5 h-5" />}
                      {tpl.svgIconType === 'radar' && <Zap className="w-5 h-5" />}
                      {tpl.svgIconType === 'irrigation' && <Cpu className="w-5 h-5" />}
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 mt-2 block">
                      {tpl.componentCount} components • {tpl.supplyVoltage}
                    </span>
                  </div>
                </div>

                {/* Category Badge */}
                <div className="mb-1.5">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#A58D66]/15 text-[#DFCCA8] border border-[#A58D66]/25">
                    {tpl.category}
                  </span>
                </div>

                {/* Title & Description */}
                <h3 className="text-sm font-bold font-mono text-[#E5E1DD] group-hover:text-[#DFCCA8] transition-colors">
                  {tpl.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-snug line-clamp-2">
                  {tpl.shortDesc}
                </p>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenExample(tpl);
                }}
                className="w-full pt-3 mt-2 border-t border-white/5 flex items-center justify-between text-xs font-mono text-slate-500 group-hover:text-[#A58D66] transition-colors cursor-pointer text-left"
              >
                <span>Open in Studio</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 3. RECENT PROJECTS SECTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold font-mono text-[#E5E1DD]">Recent projects</h2>
            <span className="text-xs text-slate-500 font-mono">({projects.length})</span>
          </div>

          <button
            onClick={onNewProject}
            className="text-xs font-mono text-[#DFCCA8] hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ New project</span>
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 bg-[#0c161d]/50 p-12 text-center">
            <Layers className="w-8 h-8 text-slate-500 mx-auto mb-3" />
            <p className="text-sm font-mono text-slate-300 font-bold">No projects yet</p>
            <p className="text-xs text-slate-500 mt-1 mb-4">Create your first circuit schematic or physical breadboard.</p>
            <button
              onClick={onNewProject}
              className="px-4 py-2 rounded-lg bg-[#A58D66] text-[#080f14] text-xs font-mono font-bold cursor-pointer hover:bg-[#bfa378] transition-colors"
            >
              + Create project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className="group rounded-xl bg-[#0c161d] hover:bg-[#111d24] border border-[#A58D66]/20 hover:border-[#A58D66]/50 p-4 transition-all duration-200 flex flex-col justify-between shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div 
                      onClick={() => onOpenProject(proj.id)}
                      className="cursor-pointer flex-1 min-w-0"
                    >
                      <h3 className="text-sm font-bold font-mono text-[#E5E1DD] group-hover:text-[#DFCCA8] transition-colors truncate">
                        {proj.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded uppercase font-semibold ${
                          proj.mode === 'schematic' ? 'bg-[#A58D66]/20 text-[#DFCCA8]' : 'bg-[#407E8C]/20 text-[#22d3ee]'
                        }`}>
                          {proj.mode}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {formatRelativeTime(proj.updatedAt)}
                        </span>
                      </div>
                    </div>

                    {/* Quick Context Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => onDuplicateProject(proj.id)}
                        className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                        title="Duplicate Project"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onTrashProject(proj.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        title="Move to Trash"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mt-1">
                    {proj.description || 'Circuit project created with KITT Studio.'}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono text-slate-500">
                  <span>{proj.circuit.components.length} components • {proj.circuit.wires.length} wires</span>
                  <button
                    onClick={() => onOpenProject(proj.id)}
                    className="text-[#DFCCA8] hover:text-white flex items-center gap-1 font-bold cursor-pointer"
                  >
                    <span>Open</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
