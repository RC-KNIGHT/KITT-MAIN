import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Layers, 
  Trash2, 
  Copy, 
  ArrowRight, 
  Clock, 
  Filter, 
  SlidersHorizontal,
  FolderKanban,
  Download
} from 'lucide-react';
import { KittProject } from '../state/projectStore';

interface ProjectsViewProps {
  projects: KittProject[];
  onOpenProject: (projectId: string) => void;
  onNewProject: () => void;
  onDuplicateProject: (projectId: string) => void;
  onTrashProject: (projectId: string) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  onOpenProject,
  onNewProject,
  onDuplicateProject,
  onTrashProject
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [modeFilter, setModeFilter] = useState<'all' | 'schematic' | 'breadboard'>('all');
  const [sortBy, setSortBy] = useState<'updated' | 'name' | 'components'>('updated');

  const filteredProjects = projects
    .filter(p => {
      const matchesSearch = !searchTerm || 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesMode = modeFilter === 'all' || p.mode === modeFilter;
      return matchesSearch && matchesMode;
    })
    .sort((a, b) => {
      if (sortBy === 'updated') return b.updatedAt - a.updatedAt;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'components') return b.circuit.components.length - a.circuit.components.length;
      return 0;
    });

  const formatRelativeTime = (timestamp: number) => {
    const diffMs = Date.now() - timestamp;
    const diffHours = Math.floor(diffMs / (3600 * 1000));
    const diffDays = Math.floor(diffMs / (86400 * 1000));
    if (diffHours < 1) return 'Edited recently';
    if (diffHours < 24) return `Edited ${diffHours}h ago`;
    return `Edited ${diffDays}d ago`;
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 font-sans max-w-7xl mx-auto w-full">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold font-mono text-[#E5E1DD]">Projects</h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#A58D66]/20 text-[#DFCCA8] border border-[#A58D66]/30">
              {projects.length} Total
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage your hardware prototypes, schematics, and simulation runs.
          </p>
        </div>

        <button
          onClick={onNewProject}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#A58D66] to-[#8C7654] hover:from-[#bfa378] hover:to-[#A58D66] text-[#080f14] font-mono font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(165,141,102,0.3)] transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New project</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#0c161d] p-3 rounded-xl border border-[#A58D66]/20">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search projects by name, MCU, or tag..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#080f14] border border-white/10 text-xs font-mono text-[#E5E1DD] placeholder:text-slate-500 focus:outline-none focus:border-[#A58D66]"
          />
        </div>

        {/* Mode Filter Pills */}
        <div className="flex items-center gap-1 bg-[#080f14] p-1 rounded-lg border border-white/5 text-xs font-mono">
          {(['all', 'schematic', 'breadboard'] as const).map(m => (
            <button
              key={m}
              onClick={() => setModeFilter(m)}
              className={`px-3 py-1 rounded capitalize transition-colors cursor-pointer ${
                modeFilter === m ? 'bg-[#A58D66] text-[#080f14] font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Sort dropdown */}
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Sort:</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="bg-[#080f14] border border-white/10 rounded px-2 py-1 text-slate-300 text-xs font-mono focus:outline-none focus:border-[#A58D66]"
          >
            <option value="updated">Recently Updated</option>
            <option value="name">Name (A-Z)</option>
            <option value="components">Component Count</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 bg-[#0c161d]/30 p-16 text-center">
          <FolderKanban className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-sm font-mono text-slate-300 font-bold">No projects match your filter</p>
          <p className="text-xs text-slate-500 mt-1 mb-4">Try adjusting your search or create a new project.</p>
          <button
            onClick={onNewProject}
            className="px-4 py-2 rounded-lg bg-[#A58D66] text-[#080f14] text-xs font-mono font-bold cursor-pointer hover:bg-[#bfa378]"
          >
            + Create project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map(proj => (
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

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onDuplicateProject(proj.id)}
                      className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                      title="Duplicate"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onTrashProject(proj.id)}
                      className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Move to Trash"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mt-1">
                  {proj.description || 'Circuit project created with KITT Studio.'}
                </p>

                {/* Tags */}
                {proj.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {proj.tags.map(t => (
                      <span key={t} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 mt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono text-slate-500">
                <span>{proj.circuit.components.length} components • {proj.circuit.wires.length} nets</span>
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
  );
};
