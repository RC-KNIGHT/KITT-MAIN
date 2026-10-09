import React from 'react';
import {
  Home,
  Layers,
  Sparkles,
  Trash2,
  Settings,
  Plus,
  ArrowUpRight,
  ChevronRight
} from 'lucide-react';
import { KittLogo } from '../../KittLogo';

export type KittStudioView = 'home' | 'projects' | 'examples' | 'trash' | 'settings' | 'editor';

interface SidebarProps {
  currentView: KittStudioView;
  onNavigate: (view: KittStudioView) => void;
  onNewProject: () => void;
  projectCount: number;
  exampleCount: number;
  trashCount: number;
  onOpenUpgradeModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  onNewProject,
  projectCount,
  exampleCount,
  trashCount,
  onOpenUpgradeModal
}) => {
  const navItems = [
    { id: 'home' as KittStudioView, label: 'Home', icon: Home, badge: null },
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
    <aside className="w-[260px] h-full flex flex-col justify-between shrink-0 bg-black border-r border-[#353536] select-none z-20">
      <div className="flex flex-col">
        {/* Brand header */}
        <div className="h-14 px-5 flex items-center justify-between border-b border-[#353536]">
          <div className="flex items-center gap-2.5 min-w-0">
            <KittLogo size={22} showGlow={false} />
            <span className="kds-heading-sm text-[#F5F5F5] truncate">KITT AI</span>
          </div>

          <a
            href="#/"
            className="p-2 rounded-full text-[#9E9E9E] hover:text-[#F5F5F5] hover:bg-white/[0.06] transition-colors kds-focusable"
            title="Return to ecosystem hub"
          >
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>

        {/* Primary action */}
        <div className="px-3 pt-4">
          <button onClick={onNewProject} className="kds-btn kds-btn-primary w-full">
            <Plus className="w-4 h-4" />
            <span>New project</span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="px-3 pt-6 space-y-1">
          <p className="kds-caption px-3 pb-2 uppercase tracking-wide">Workspace</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                data-active={isActive}
                aria-current={isActive ? 'page' : undefined}
                className="kds-nav-item kds-focusable"
              >
                <span className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </span>
                {item.badge && <span className="kds-caption">{item.badge}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer: plan + settings */}
      <div className="px-3 pb-4 space-y-3">
        <div className="kds-card p-4">
          <p className="kds-heading-xs text-[#F5F5F5] mb-1">KITT Pro</p>
          <p className="kds-caption mb-3 leading-relaxed">
            500 credits a month, SPICE simulation, and KiCad export.
          </p>
          <button onClick={onOpenUpgradeModal} className="kds-btn kds-btn-primary w-full">
            <span>Upgrade plan</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={() => onNavigate('settings')}
          data-active={currentView === 'settings'}
          aria-current={currentView === 'settings' ? 'page' : undefined}
          className="kds-nav-item kds-focusable"
        >
          <span className="flex items-center gap-2.5">
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </span>
          <span className="kds-caption">v2.4</span>
        </button>
      </div>
    </aside>
  );
};
