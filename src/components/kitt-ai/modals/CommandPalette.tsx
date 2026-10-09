import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Layers, 
  Sparkles, 
  Plus, 
  Play, 
  Square, 
  Download, 
  Settings, 
  Cpu, 
  ArrowRight,
  RotateCcw,
  Zap
} from 'lucide-react';
import { KittProject } from '../state/projectStore';
import { CircuitTemplateInfo, KITT_EXAMPLE_TEMPLATES } from '../data/exampleTemplates';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  projects: KittProject[];
  onOpenProject: (projectId: string) => void;
  onOpenExample: (template: CircuitTemplateInfo) => void;
  onNewProject: () => void;
  onOpenSettings: () => void;
  onToggleSimulation?: () => void;
  isSimulating?: boolean;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  projects,
  onOpenProject,
  onOpenExample,
  onNewProject,
  onOpenSettings,
  onToggleSimulation,
  isSimulating
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global keydown for Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filter items
  const q = query.toLowerCase().trim();

  const actions = [
    {
      id: 'act-new',
      type: 'action',
      title: 'Create New Project',
      subtitle: 'Start a blank schematic or physical breadboard',
      icon: Plus,
      action: () => { onClose(); onNewProject(); }
    },
    {
      id: 'act-settings',
      type: 'action',
      title: 'Open Settings',
      subtitle: 'Workspace, simulation engine & shortcuts',
      icon: Settings,
      action: () => { onClose(); onOpenSettings(); }
    },
    ...(onToggleSimulation ? [{
      id: 'act-sim',
      type: 'action',
      title: isSimulating ? 'Pause Simulation' : 'Start Simulation',
      subtitle: 'Run mixed-signal electrical physics solver',
      icon: isSimulating ? Square : Play,
      action: () => { onClose(); onToggleSimulation(); }
    }] : [])
  ].filter(a => !q || a.title.toLowerCase().includes(q) || a.subtitle.toLowerCase().includes(q));

  const filteredProjects = projects
    .filter(p => !q || p.name.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q)))
    .slice(0, 5);

  const filteredExamples = KITT_EXAMPLE_TEMPLATES
    .filter(e => !q || e.title.toLowerCase().includes(q) || e.category.toLowerCase().includes(q) || e.shortDesc.toLowerCase().includes(q))
    .slice(0, 5);

  const allItems = [
    ...actions.map(a => ({ ...a, category: 'Actions' })),
    ...filteredProjects.map(p => ({
      id: p.id,
      type: 'project',
      title: p.name,
      subtitle: `${p.mode.toUpperCase()} • ${p.circuit.components.length} components`,
      icon: Layers,
      category: 'Projects',
      action: () => { onClose(); onOpenProject(p.id); }
    })),
    ...filteredExamples.map(e => ({
      id: e.id,
      type: 'example',
      title: e.title,
      subtitle: `${e.category} • ${e.supplyVoltage}`,
      icon: Sparkles,
      category: 'Examples & Templates',
      action: () => { onClose(); onOpenExample(e); }
    }))
  ];

  const handleKeyDownList = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(idx => (idx + 1) % Math.max(1, allItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(idx => (idx - 1 + allItems.length) % Math.max(1, allItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (allItems[selectedIndex]) {
        allItems[selectedIndex].action();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-100">
      <div 
        className="w-full max-w-2xl bg-[#141415] border border-[#8F8F8F] rounded-[24px] overflow-hidden flex flex-col font-sans"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#353536] bg-[#000000]/80">
          <Search className="w-5 h-5 text-[#FFFFFF] shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDownList}
            placeholder="Type a command or search circuits, components, templates..."
            className="flex-1 bg-transparent text-[#F5F5F5] text-sm font-mono placeholder:text-slate-500 focus:outline-none"
          />
          <kbd className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-slate-400 border border-white/5">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-white/5">
          {allItems.length === 0 ? (
            <div className="py-12 text-center text-slate-500 font-mono text-xs">
              No matching circuits, templates, or commands found.
            </div>
          ) : (
            allItems.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-[12px] text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#FFFFFF]/15 text-[#E8E8E8] border border-[#353536]'
                      : 'text-slate-300 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-2 rounded-[12px] shrink-0 ${isSelected ? 'bg-[#FFFFFF]/25 text-[#FFFFFF]' : 'bg-white/5 text-slate-400'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-mono font-bold truncate text-[#F5F5F5]">{item.title}</div>
                      <div className="text-[11px] text-slate-400 truncate">{item.subtitle}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-2 py-0.5 rounded bg-white/5">
                      {item.category}
                    </span>
                    {isSelected && <ArrowRight className="w-3.5 h-3.5 text-[#FFFFFF]" />}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 bg-[#000000] border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <div className="text-[#FFFFFF]">KITT Copilot Engine</div>
        </div>
      </div>
    </div>
  );
};
