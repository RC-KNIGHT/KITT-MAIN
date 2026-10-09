import React, { useRef } from 'react';
import {
  Plus,
  Upload,
  BookOpen,
  ArrowRight,
  Layers,
  Clock,
  Trash2,
  Copy,
  Cpu,
  Zap
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
    if (diffMins < 60) return `Edited ${diffMins}m ago`;
    if (diffHours < 24) return `Edited ${diffHours}h ago`;
    return `Edited ${diffDays}d ago`;
  };

  const templateIcon = (type: string) => {
    if (type === 'timer') return Clock;
    if (type === 'radar') return Zap;
    return Cpu;
  };

  return (
    <div className="flex-1 overflow-y-auto w-full">
      <div className="max-w-5xl mx-auto w-full px-6 md:px-8 py-16 md:py-24 space-y-24">
        {/* Hero */}
        <section className="text-center space-y-6">
          <h1 className="kds-display-xl text-[#F5F5F5]">What are we building today?</h1>
          <p className="kds-body-md text-[#9E9E9E] max-w-xl mx-auto">
            Describe a system in plain language, then inspect the schematic, breadboard, and
            simulation side by side.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button onClick={onNewProject} className="kds-btn kds-btn-primary kds-focusable">
              <Plus className="w-4 h-4" />
              <span>New project</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="kds-btn kds-btn-secondary kds-focusable"
            >
              <Upload className="w-4 h-4" />
              <span>Import circuit</span>
            </button>
            <button onClick={onBrowseExamples} className="kds-btn kds-btn-ghost kds-focusable">
              <BookOpen className="w-4 h-4" />
              <span>Template library</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.kicad_sch"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </section>

        {/* Templates */}
        <section className="space-y-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="kds-heading-md text-[#F5F5F5]">Start from an example</h2>
              <p className="kds-caption mt-1">{KITT_EXAMPLE_TEMPLATES.length} verified reference designs</p>
            </div>
            <button
              onClick={onBrowseExamples}
              className="kds-btn kds-btn-ghost kds-focusable group"
            >
              <span>Browse all</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featuredTemplates.map((tpl) => {
              const Icon = templateIcon(tpl.svgIconType);
              return (
                <button
                  key={tpl.id}
                  onClick={() => onOpenExample(tpl)}
                  className="kds-card-interactive p-5 text-left flex flex-col justify-between gap-6 cursor-pointer kds-focusable"
                >
                  <div className="space-y-4">
                    <span className="w-10 h-10 rounded-[10px] bg-[#29292A] border border-[#353536] flex items-center justify-center text-[#F5F5F5]">
                      <Icon className="w-5 h-5" />
                    </span>

                    <div className="space-y-1.5">
                      <span className="kds-caption uppercase tracking-wide">{tpl.category}</span>
                      <h3 className="kds-heading-sm text-[#F5F5F5]">{tpl.title}</h3>
                      <p className="kds-caption leading-relaxed line-clamp-2">{tpl.shortDesc}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full pt-4 border-t border-[#353536]">
                    <span className="kds-caption">
                      {tpl.componentCount} parts · {tpl.supplyVoltage}
                    </span>
                    <span className="kds-caption text-[#F5F5F5] flex items-center gap-1">
                      Open
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Recent projects */}
        <section className="space-y-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="kds-heading-md text-[#F5F5F5]">Recent projects</h2>
              <p className="kds-caption mt-1">{projects.length} in your workspace</p>
            </div>
            <button onClick={onNewProject} className="kds-btn kds-btn-ghost kds-focusable">
              <Plus className="w-4 h-4" />
              <span>New project</span>
            </button>
          </div>

          {projects.length === 0 ? (
            <div className="kds-card p-12 text-center space-y-4">
              <Layers className="w-6 h-6 text-[#9E9E9E] mx-auto" />
              <div className="space-y-1">
                <p className="kds-body-md text-[#F5F5F5]">No projects yet</p>
                <p className="kds-caption">Create your first schematic or breadboard project.</p>
              </div>
              <button onClick={onNewProject} className="kds-btn kds-btn-primary kds-focusable">
                <Plus className="w-4 h-4" />
                <span>Create project</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((proj) => (
                <div key={proj.id} className="kds-card p-5 flex flex-col justify-between gap-5">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <button
                        onClick={() => onOpenProject(proj.id)}
                        className="text-left flex-1 min-w-0 cursor-pointer kds-focusable rounded-[8px]"
                      >
                        <h3 className="kds-body-md text-[#F5F5F5] truncate">{proj.name}</h3>
                        <p className="kds-caption mt-1">{formatRelativeTime(proj.updatedAt)}</p>
                      </button>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => onDuplicateProject(proj.id)}
                          className="p-2 rounded-full text-[#9E9E9E] hover:text-[#F5F5F5] hover:bg-white/[0.06] transition-colors cursor-pointer kds-focusable"
                          title="Duplicate project"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onTrashProject(proj.id)}
                          className="p-2 rounded-full text-[#9E9E9E] hover:text-[#F5F5F5] hover:bg-white/[0.06] transition-colors cursor-pointer kds-focusable"
                          title="Move to trash"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <span className="kds-badge">{proj.mode}</span>

                    <p className="kds-caption leading-relaxed line-clamp-2">
                      {proj.description || 'Circuit project created in KITT Studio.'}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#353536] flex items-center justify-between">
                    <span className="kds-caption">
                      {proj.circuit.components.length} parts · {proj.circuit.wires.length} wires
                    </span>
                    <button
                      onClick={() => onOpenProject(proj.id)}
                      className="kds-caption text-[#F5F5F5] flex items-center gap-1 cursor-pointer hover:underline kds-focusable"
                    >
                      <span>Open</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
