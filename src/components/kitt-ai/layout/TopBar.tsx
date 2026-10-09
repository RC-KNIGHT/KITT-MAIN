import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  ChevronDown,
  Sparkles,
  LogOut,
  Settings,
  ExternalLink
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
      title: 'Component library synced',
      desc: 'Loaded 45,000+ verified IPC-7351 surface-mount and through-hole components.',
      time: '12m ago'
    },
    {
      id: 'n2',
      title: 'Simulation solver calibrated',
      desc: 'Deterministic matrix solver configured for a 100ns transient timebase.',
      time: '1h ago'
    }
  ];

  return (
    <header className="h-14 px-6 border-b border-[#353536] bg-black flex items-center justify-between shrink-0 z-10">
      {/* Command palette trigger */}
      <button
        onClick={onOpenCommandPalette}
        className="flex items-center gap-3 px-4 min-h-[36px] rounded-full border border-[#353536] hover:border-[#8F8F8F] bg-transparent hover:bg-white/[0.06] text-[#9E9E9E] hover:text-[#F5F5F5] transition-colors cursor-pointer w-64 md:w-80 text-left kds-focusable"
      >
        <Search className="w-4 h-4 shrink-0" />
        <span className="kds-body-sm truncate flex-1">Search projects, templates, docs</span>
        <kbd className="hidden sm:inline-flex items-center kds-caption border border-[#353536] rounded-[10px] px-1.5 py-0.5">
          ⌘K
        </kbd>
      </button>

      <div className="flex items-center gap-2">
        {/* Sync status */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full border border-[#353536]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F5F5F5]" />
          <span className="kds-caption text-[#F5F5F5]">Synced</span>
        </div>

        {/* Plan */}
        <div className="relative" ref={planRef}>
          <button
            onClick={() => setShowPlanMenu(m => !m)}
            aria-expanded={showPlanMenu}
            className="flex items-center gap-2 px-3 min-h-[36px] rounded-full border border-[#353536] hover:border-[#8F8F8F] kds-body-sm text-[#F5F5F5] transition-colors cursor-pointer kds-focusable"
          >
            <span>Student</span>
            <span className="kds-caption">8 credits left</span>
            <ChevronDown className={`w-4 h-4 text-[#9E9E9E] transition-transform ${showPlanMenu ? 'rotate-180' : ''}`} />
          </button>

          {showPlanMenu && (
            <div className="absolute top-full mt-2 right-0 w-72 kds-popover p-4 z-50">
              <div className="flex items-center justify-between mb-3">
                <span className="kds-caption uppercase tracking-wide">Current plan</span>
                <span className="kds-badge text-[#F5F5F5]">STUDENT</span>
              </div>

              <div className="mb-4">
                <div className="flex justify-between kds-caption mb-2">
                  <span>Daily AI credits</span>
                  <span className="text-[#F5F5F5]">8 / 10 remaining</span>
                </div>
                <div className="w-full h-1 bg-[#353536] overflow-hidden">
                  <div className="w-4/5 h-full bg-[#F5F5F5]" />
                </div>
              </div>

              <div className="flex justify-between items-center kds-caption py-3 border-t border-[#353536] mb-3">
                <span>Active cloud projects</span>
                <span className="text-[#F5F5F5]">3 / 5 max</span>
              </div>

              <button
                onClick={() => {
                  setShowPlanMenu(false);
                  onOpenUpgradeModal();
                }}
                className="kds-btn kds-btn-primary w-full kds-focusable"
              >
                Upgrade to Pro
              </button>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(n => !n)}
            aria-expanded={showNotifications}
            className="relative p-2.5 rounded-full border border-[#353536] hover:border-[#8F8F8F] text-[#9E9E9E] hover:text-[#F5F5F5] transition-colors cursor-pointer kds-focusable"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2.5 w-1.5 h-1.5 rounded-full bg-[#F5F5F5]" />
          </button>

          {showNotifications && (
            <div className="absolute top-full mt-2 right-0 w-80 kds-popover p-3 z-50">
              <div className="flex items-center justify-between pb-3 border-b border-[#353536] mb-2 px-1">
                <span className="kds-heading-xs text-[#F5F5F5]">Notifications</span>
                <span className="kds-caption">Mark all read</span>
              </div>

              <div className="space-y-1">
                {notifications.map(item => (
                  <div key={item.id} className="p-3 rounded-[10px] hover:bg-white/[0.06] transition-colors">
                    <div className="flex items-center justify-between gap-2">
                      <span className="kds-body-sm text-[#F5F5F5] truncate">{item.title}</span>
                      <span className="kds-caption shrink-0">{item.time}</span>
                    </div>
                    <p className="kds-caption mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setShowUserMenu(u => !u)}
            aria-expanded={showUserMenu}
            className="flex items-center gap-2 p-1 rounded-full border border-[#353536] hover:border-[#8F8F8F] transition-colors cursor-pointer kds-focusable"
          >
            <span className="w-7 h-7 rounded-full bg-[#F5F5F5] text-[#0D0D0D] flex items-center justify-center text-xs font-semibold">
              OM
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#9E9E9E] hidden sm:inline mr-1" />
          </button>

          {showUserMenu && (
            <div className="absolute top-full mt-2 right-0 w-56 kds-popover p-2 z-50">
              <div className="px-3 py-2 border-b border-[#353536] mb-1">
                <p className="kds-body-sm text-[#F5F5F5]">OM PRAKASH</p>
                <p className="kds-caption truncate">om@kitt-engineering.io</p>
              </div>

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  onNavigate('settings');
                }}
                className="kds-nav-item kds-focusable"
              >
                <span className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  <span>Workspace settings</span>
                </span>
              </button>

              <a href="#/" className="kds-nav-item kds-focusable">
                <span className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  <span>Ecosystem landing</span>
                </span>
              </a>

              <div className="border-t border-[#353536] my-1" />

              <button
                onClick={() => {
                  setShowUserMenu(false);
                  window.location.hash = '#/';
                }}
                className="kds-nav-item kds-focusable"
              >
                <span className="flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
