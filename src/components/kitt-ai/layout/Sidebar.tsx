import React from 'react';
import { 
  Home, 
  Layers, 
  Sparkles, 
  Trash2, 
  Settings, 
  Zap, 
  ArrowUpRight,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { KittLogo } from '../../KittLogo';

export type KittStudioView = 'home' | 'projects' | 'examples' | 'trash' | 'settings' | 'editor';

interface SidebarProps {
  currentView: KittStudioView;
  onNavigate: (view: KittStudioView) => void;
  projectCount: number;
  exampleCount: number;
  trashCount: number;
  onOpenUpgradeModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  projectCount,
  exampleCount,
  trashCount,
  onOpenUpgradeModal
}) => {
  const navItems = [
    {
      id: 'home' as KittStudioView,
      label: 'Home',
      icon: Home,
      badge: null
    },
    {
      id: 'projects' as KittStudioView,
      label: 'Projects',
      icon: Layers,
      badge: projectCount > 0 ? String(projectCount) : null
    },
    {
      id: 'examples' as KittStudioView,
      label: 'Examples',
      icon: Sparkles,
      badge: String(exampleCount)
    },
    {
      id: 'trash' as KittStudioView,
      label: 'Trash',
      icon: Trash2,
      badge: trashCount > 0 ? String(trashCount) : null
    }
  ];

  return (
    <aside className="w-64 h-full bg-[#080f14] border-r border-[#A58D66]/20 flex flex-col justify-between shrink-0 font-sans select-none z-20">
      {/* Top Brand Header & Navigation */}
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="h-14 px-5 border-b border-[#A58D66]/15 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#A58D66]/15 border border-[#A58D66]/30 flex items-center justify-center shadow-[0_0_15px_rgba(165,141,102,0.2)]">
              <KittLogo size={20} showGlow={true} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-[#E5E1DD] font-mono flex items-center gap-1.5">
                KITT
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#A58D66]/20 text-[#A58D66] font-semibold">LAB</span>
              </span>
              <span className="text-[10px] tracking-wider text-slate-400 uppercase font-mono">
                Circuit Workshop
              </span>
            </div>
          </div>

          <a 
            href="#/"
            className="text-[11px] font-mono text-slate-400 hover:text-[#A58D66] transition-colors p-1.5 rounded hover:bg-white/5"
            title="Return to Main Ecosystem Hub"
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#A58D66]/15 text-[#DFCCA8] border border-[#A58D66]/35 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
                    : 'text-slate-400 hover:text-[#E5E1DD] hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#A58D66]' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                      isActive
                        ? 'bg-[#A58D66]/30 text-[#DFCCA8]'
                        : 'bg-white/10 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Pro Upgrade Card & Settings */}
      <div className="p-3 space-y-3">
        {/* Pro Upgrade Card (matching Antika screenshot layout) */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-b from-[#16222b] to-[#0c161d] border border-[#A58D66]/30 p-3.5 shadow-lg">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#A58D66]/10 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-5 h-5 rounded-md bg-[#A58D66]/20 flex items-center justify-center text-[#A58D66]">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold font-mono text-[#E5E1DD]">Upgrade to Pro</span>
          </div>

          <p className="text-[11px] leading-relaxed text-slate-400 mb-3 font-sans">
            Unlimited circuits, SPICE simulation, KiCad export, and autonomous AI copilot.
          </p>

          <button
            onClick={onOpenUpgradeModal}
            className="w-full py-1.5 px-3 rounded-lg bg-gradient-to-r from-[#A58D66] to-[#8C7654] hover:from-[#bfa378] hover:to-[#A58D66] text-[#080f14] font-mono font-bold text-xs flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(165,141,102,0.25)] transition-all cursor-pointer"
          >
            <span>Upgrade plan</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Pinned Settings Button */}
        <button
          onClick={() => onNavigate('settings')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
            currentView === 'settings'
              ? 'bg-[#A58D66]/15 text-[#DFCCA8] border border-[#A58D66]/35'
              : 'text-slate-400 hover:text-[#E5E1DD] hover:bg-white/5 border border-transparent'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Settings</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">v2.4</span>
        </button>
      </div>
    </aside>
  );
};
