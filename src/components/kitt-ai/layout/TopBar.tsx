import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  ChevronDown, 
  CheckCircle2, 
  Sparkles, 
  Zap, 
  Layers, 
  LogOut, 
  Settings, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { KittStudioView } from './Sidebar';

interface TopBarProps {
  onOpenCommandPalette: () => void;
  onOpenUpgradeModal: () => void;
  onNavigate: (view: KittStudioView) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenCommandPalette,
  onOpenUpgradeModal,
  onNavigate
}) => {
  const [showPlanMenu, setShowPlanMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const planRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (planRef.current && !planRef.current.contains(e.target as Node)) setShowPlanMenu(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifications(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const notifications = [
    {
      id: 'n1',
      title: 'KiCad Footprint Library Synced',
      desc: 'Loaded 45,000+ verified IPC-7351 surface-mount & through-hole components.',
      time: '12m ago',
      icon: ShieldCheck,
      unread: true
    },
    {
      id: 'n2',
      title: 'SPICE Mixed-Signal Solver Calibrated',
      desc: 'Deterministic matrix solver configured for 100ns transient timebase.',
      time: '1h ago',
      icon: Zap,
      unread: false
    }
  ];

  return (
    <header className="h-14 px-6 border-b border-[#A58D66]/20 bg-[#080f14]/80 backdrop-blur-md flex items-center justify-between shrink-0 font-sans z-10">
      {/* Left: Quick Search / Command Palette Trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-3 px-3.5 py-1.5 rounded-lg bg-[#0c161d] hover:bg-[#121c22] border border-[#A58D66]/25 hover:border-[#A58D66]/50 text-slate-400 hover:text-[#E5E1DD] transition-all cursor-pointer shadow-inner w-64 md:w-80 group text-left"
        >
          <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#A58D66] transition-colors" />
          <span className="text-xs font-mono truncate flex-1">Search circuits, templates, docs...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-slate-400 border border-white/5">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Synced Status, Plan, Notifications, User Avatar */}
      <div className="flex items-center gap-3">
        {/* Synced Status Badge */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#10b981]/10 border border-[#10b981]/25 text-[11px] font-mono text-[#10b981]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
          <span>Synced</span>
        </div>

        {/* Current Plan Badge Dropdown (matching Antika's Student / Credits button) */}
        <div className="relative" ref={planRef}>
          <button
            onClick={() => setShowPlanMenu(m => !m)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#0c161d] hover:bg-[#121c22] border border-[#A58D66]/30 text-xs font-mono text-[#E5E1DD] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-[#DFCCA8]">Student</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">8 credits left</span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showPlanMenu ? 'rotate-180' : ''}`} />
          </button>

          {/* Plan Popover */}
          {showPlanMenu && (
            <div className="absolute top-full mt-2 right-0 w-72 rounded-xl bg-[#0c161d] border border-[#A58D66]/35 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-100 font-sans">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono uppercase text-slate-400 font-bold">Current Plan</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#A58D66]/20 text-[#DFCCA8] border border-[#A58D66]/30">
                  STUDENT
                </span>
              </div>

              {/* Credits Usage Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-slate-400">Daily AI Credits</span>
                  <span className="text-[#E5E1DD] font-bold">8 / 10 remaining</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className="w-4/5 h-full bg-gradient-to-r from-[#A58D66] to-[#407E8C] rounded-full" />
                </div>
              </div>

              {/* Projects Usage */}
              <div className="flex justify-between items-center text-xs font-mono text-slate-400 py-2 border-t border-white/5 mb-3">
                <span>Active Cloud Projects</span>
                <span className="text-[#E5E1DD]">3 / 5 max</span>
              </div>

              <button
                onClick={() => {
                  setShowPlanMenu(false);
                  onOpenUpgradeModal();
                }}
                className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-[#A58D66] to-[#8C7654] hover:from-[#bfa378] hover:to-[#A58D66] text-[#080f14] font-mono font-bold text-xs flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(165,141,102,0.25)] transition-all cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Upgrade to Pro Plan</span>
              </button>
            </div>
          )}
        </div>

        {/* Notifications Button */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(n => !n)}
            className="p-2 rounded-lg bg-[#0c161d] hover:bg-[#121c22] border border-[#A58D66]/20 text-slate-300 hover:text-white transition-colors relative cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#A58D66]" />
          </button>

          {showNotifications && (
            <div className="absolute top-full mt-2 right-0 w-80 rounded-xl bg-[#0c161d] border border-[#A58D66]/35 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between pb-2 border-b border-white/5 mb-2 px-1">
                <span className="text-xs font-mono font-bold text-[#E5E1DD]">Notifications</span>
                <span className="text-[10px] font-mono text-[#A58D66] cursor-pointer hover:underline">Mark all read</span>
              </div>

              <div className="space-y-2">
                {notifications.map(item => {
                  const Icon = item.icon;
                  return (
                    <div key={item.id} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors flex items-start gap-2.5">
                      <div className="p-1.5 rounded bg-[#A58D66]/20 text-[#A58D66] shrink-0 mt-0.5">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-[#E5E1DD] truncate">{item.title}</span>
                          <span className="text-[10px] text-slate-500 font-mono shrink-0">{item.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug line-clamp-2">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setShowUserMenu(u => !u)}
            className="flex items-center gap-2 p-1 pl-1.5 rounded-lg bg-[#0c161d] hover:bg-[#121c22] border border-[#A58D66]/30 transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 rounded-md bg-gradient-to-tr from-[#A58D66] to-[#407E8C] flex items-center justify-center text-xs font-bold text-[#080f14] font-mono">
              OM
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:inline" />
          </button>

          {showUserMenu && (
            <div className="absolute top-full mt-2 right-0 w-52 rounded-xl bg-[#0c161d] border border-[#A58D66]/35 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100 font-sans">
              <div className="px-3 py-2 border-b border-white/5 mb-1">
                <p className="text-xs font-bold text-[#E5E1DD]">OM PRAKASH</p>
                <p className="text-[11px] text-slate-400 truncate">om@kitt-engineering.io</p>
              </div>

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  onNavigate('settings');
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono text-slate-300 hover:text-white hover:bg-white/5 transition-colors text-left cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5 text-slate-400" />
                <span>Workspace Settings</span>
              </button>

              <a
                href="#/"
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono text-slate-300 hover:text-white hover:bg-white/5 transition-colors text-left"
              >
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                <span>Ecosystem Landing</span>
              </a>

              <div className="border-t border-white/5 my-1" />

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  window.location.hash = '#/';
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono text-rose-400 hover:bg-rose-500/10 transition-colors text-left cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
