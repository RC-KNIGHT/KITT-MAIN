/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { KittLogo } from '../../../KittLogo';
import {
  ArrowLeft,
  Cpu,
  Mail,
  Star,
  Layers,
  Sparkles,
  Sliders,
  Users,
  Menu,
  X,
  LogIn,
  User,
  LogOut,
  ShieldCheck,
  ChevronDown,
  Compass,
} from 'lucide-react';

interface AboutNavbarProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
  onBackToStudio?: () => void;
}

export const AboutNavbar: React.FC<AboutNavbarProps> = ({ activeSection, onNavigate, onBackToStudio }) => {
  const { currentUser, userProfile, logout, setLoginViewOpen } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { id: 'founders', label: 'Team KITT & Lab', icon: Users },
    { id: 'studio-guide', label: 'Menus & Toolbars', icon: Sliders },
    { id: 'components', label: 'Component Catalog', icon: Cpu },
    { id: 'toolbar', label: 'Tools Reference', icon: Layers },
  ];

  // Close dropdown on click outside
  useEffect(() => {
    const handlePointerDown = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  const handleNavClick = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  const handleBackToStudio = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onBackToStudio) {
      onBackToStudio();
    } else {
      window.location.hash = '#/digilogic';
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#080f14]/95 backdrop-blur-xl border-b border-[#A58D66]/20 shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Back Button & Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleBackToStudio}
            className="group flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#080f14] hover:bg-[#A58D66]/15 text-[#E5E1DD] hover:text-[#DFCCA8] border border-[#A58D66]/25 hover:border-[#A58D66]/50 transition-all font-semibold text-xs sm:text-sm active:scale-95 shadow-sm whitespace-nowrap shrink-0 h-9 cursor-pointer"
            title="Return to Interactive Circuit Simulator"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 shrink-0 text-[#A58D66]" />
            <span>Back to Studio</span>
          </button>

          <div className="h-5 w-px bg-[#A58D66]/20 hidden sm:block shrink-0" />

          <div className="flex items-center gap-2.5 whitespace-nowrap shrink-0">
            <KittLogo size={32} showGlow={true} />
            <div className="hidden sm:flex items-center gap-2 whitespace-nowrap">
              <span className="font-bold text-sm tracking-tight text-[#E5E1DD] font-mono whitespace-nowrap">
                DigiLogic Lab
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#A58D66]/15 text-[#DFCCA8] border border-[#A58D66]/35 whitespace-nowrap">
                Guide
              </span>
            </div>
          </div>
        </div>

        {/* Center / Right: Desktop Navigation links - Uniform height and alignment */}
        <nav className="hidden lg:flex items-center gap-1.5 shrink-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 h-9 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#A58D66]/25 text-[#DFCCA8] border border-[#A58D66]/50 shadow-sm'
                    : 'text-[#DFCCA8]/75 hover:text-[#E5E1DD] hover:bg-[#0d171f]'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0 text-[#A58D66]" />
                <span className="whitespace-nowrap">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Actions: Google Auth Profile / Sign In + Email */}
        <div className="flex items-center gap-2.5 shrink-0">
          {currentUser && userProfile ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-[#080f14]/90 hover:bg-[#0d171f] text-[#E5E1DD] border border-[#A58D66]/20 hover:border-[#A58D66]/50 transition-all text-xs font-mono cursor-pointer"
              >
                {userProfile.photoURL ? (
                  <img
                    src={userProfile.photoURL}
                    alt={userProfile.displayName}
                    className="w-6 h-6 rounded-lg object-cover"
                  />
                ) : userProfile.uid.startsWith('guest-') ? (
                  <div className="w-6 h-6 rounded-lg bg-[#76B4C2]/20 text-[#76B4C2] font-bold flex items-center justify-center text-[10px]">
                    <Compass className="w-3.5 h-3.5" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-lg bg-[#A58D66]/20 text-[#DFCCA8] font-bold flex items-center justify-center text-[10px]">
                    {userProfile.displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="hidden sm:inline font-bold truncate max-w-[110px]">
                  {userProfile.displayName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#E5E1DD]/60" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#0d171f] border border-[#A58D66]/30 shadow-2xl p-2 z-50 text-xs font-sans animate-fadeIn">
                  <div className="p-2.5 border-b border-[#A58D66]/15">
                    <div className="font-bold text-[#E5E1DD] font-mono truncate">{userProfile.displayName}</div>
                    <div className="text-[11px] text-[#E5E1DD]/60 truncate">
                      {currentUser.email || 'Guest Explorer Sandbox'}
                    </div>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-[#A58D66]/10 border border-[#A58D66]/30 text-[#DFCCA8] text-[10px] font-mono">
                        {userProfile.role}
                      </span>
                      {userProfile.uid.startsWith('guest-') && (
                        <span className="inline-block px-2 py-0.5 rounded-md bg-[#76B4C2]/10 border border-[#76B4C2]/30 text-[#76B4C2] text-[10px] font-mono">
                          Guest
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="py-1 space-y-0.5">
                    {userProfile.uid.startsWith('guest-') && (
                      <button
                        onClick={() => {
                          setLoginViewOpen(true);
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[#A58D66] hover:bg-[#A58D66]/10 text-left font-semibold cursor-pointer"
                      >
                        <LogIn className="w-4 h-4 text-[#A58D66]" />
                        <span>Sign In</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[#DFCCA8] hover:bg-[#A58D66]/20 text-left cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{userProfile.uid.startsWith('guest-') ? 'Exit Guest Mode' : 'Sign Out'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setLoginViewOpen(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#080f14] hover:bg-[#0d171f] text-[#E5E1DD] hover:text-[#DFCCA8] border border-[#A58D66]/30 hover:border-[#A58D66] text-xs font-semibold shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <div className="w-4 h-4 rounded bg-[#0d171f] flex items-center justify-center">
                <LogIn className="w-3 h-3 text-[#A58D66]" />
              </div>
              <span>Sign In</span>
            </button>
          )}

          <a
            href="mailto:kitt.ai.team@gmail.com"
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#080f14]/90 hover:bg-[#0d171f] text-[#DFCCA8] hover:text-[#E5E1DD] border border-[#A58D66]/20 hover:border-[#A58D66] text-xs font-mono transition-all"
            title="Email Team KITT for engineering inquiries"
          >
            <Mail className="w-3.5 h-3.5 text-[#A58D66]" />
            <span className="truncate max-w-[160px]">kitt.ai.team@gmail.com</span>
          </a>

          {/* Mobile hamburger menu */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-2 rounded-xl bg-[#080f14] border border-[#A58D66]/15 text-[#DFCCA8] hover:text-[#E5E1DD] cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile / Tablet Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-[#0d171f] border-b border-[#A58D66]/20 p-4 animate-fadeIn">
          <div className="grid grid-cols-2 gap-2 mb-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-[#080f14]/90 border border-[#A58D66]/15 text-[#E5E1DD] text-xs font-semibold hover:border-[#A58D66]/50 text-left"
                >
                  <Icon className="w-4 h-4 text-[#DFCCA8] shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-2 pt-2 border-t border-[#A58D66]/20">
            {currentUser && userProfile ? (
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-[#080f14] border border-[#A58D66]/30 text-[#DFCCA8] text-xs font-mono font-semibold"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out ({userProfile.displayName})</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setLoginViewOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-[#A58D66] text-[#080f14] text-xs font-bold font-mono"
              >
                <LogIn className="w-4 h-4 text-[#080f14]" />
                <span>Sign In with Google</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
