import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Cpu, 
  Binary, 
  Calculator, 
  ExternalLink, 
  ChevronDown, 
  Menu, 
  X, 
  User, 
  Sparkles,
  Zap
} from 'lucide-react';
import { ECOSYSTEM_PRODUCTS } from '../data/ecosystem';
import { UserAccount } from '../types';
import { KittLogo } from './KittLogo';
import { UserDashboardModal, EcosystemUser, DEFAULT_ECOSYSTEM_USER } from './UserDashboardModal';

interface NavbarProps {
  user?: UserAccount | EcosystemUser | null;
  onOpenAuth?: () => void;
  onOpenProfile?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  user = null, 
  onOpenAuth, 
  onOpenProfile 
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isUserDashboardOpen, setIsUserDashboardOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<EcosystemUser>(DEFAULT_ECOSYSTEM_USER);

  const handleProfileClick = () => {
    if (onOpenProfile) {
      onOpenProfile();
    } else {
      window.open('https://kitt-1-0-agent.ai.studio', '_blank', 'noopener,noreferrer');
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getProductIcon = (iconName: string) => {
    switch (iconName) {
      case 'Bot': return <Bot className="w-4 h-4 text-[#76B4C2]" />;
      case 'Cpu': return <Cpu className="w-4 h-4 text-[#A58D66]" />;
      case 'Binary': return <Binary className="w-4 h-4 text-[#E5E1DD]" />;
      case 'Calculator': return <Calculator className="w-4 h-4 text-[#A58D66]" />;
      default: return <Sparkles className="w-4 h-4 text-[#E5E1DD]" />;
    }
  };

  return (
    <nav 
      id="navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-[#080f14]/90 backdrop-blur-xl border-b border-[#A58D66]/25 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.7)]' 
          : 'bg-transparent py-5 border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <a href="#" className="flex items-center gap-3 group">
          <KittLogo size={42} showGlow={true} />
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-[0.2em] font-cinzel text-[#E5E1DD]">KITT</span>
              <span className="text-xs font-semibold tracking-widest text-[#A58D66] uppercase font-mono">
                ECOSYSTEM
              </span>
            </div>
            <span className="text-[11px] text-[#E5E1DD]/60 tracking-wide font-serif italic hidden sm:block">
              Where Ideas Become Inventions
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#E5E1DD]/80">
          <a href="#ecosystem-launchpad" className="text-[#A58D66] hover:text-[#E5E1DD] transition-colors flex items-center gap-1.5 font-semibold">
            <Zap className="w-3.5 h-3.5 text-[#A58D66]" />
            <span>Launch Portals</span>
          </a>

          {/* Direct Ecosystem Switcher Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setIsToolsOpen(!isToolsOpen)}
              onBlur={() => setTimeout(() => setIsToolsOpen(false), 200)}
              className="flex items-center gap-1 hover:text-[#E5E1DD] transition-colors cursor-pointer py-1"
            >
              <span>Platforms</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isToolsOpen ? 'rotate-180 text-[#A58D66]' : ''}`} />
            </button>

            {isToolsOpen && (
              <div className="absolute top-full left-0 mt-2 w-80 surreal-card rounded-xl shadow-2xl p-2 z-50 border border-[#A58D66]/30 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-3 py-2 text-[10px] uppercase font-bold text-[#A58D66] tracking-widest border-b border-[#A58D66]/15 font-mono">
                  Direct Ecosystem Portals
                </div>
                <div className="space-y-1 mt-1">
                  {ECOSYSTEM_PRODUCTS.map((prod) => (
                    <a
                      key={prod.id}
                      href={prod.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-[#407E8C]/15 transition-colors group"
                    >
                      <div className="mt-0.5 p-1.5 rounded-md bg-[#407E8C]/10 border border-[#407E8C]/25 group-hover:bg-[#A58D66]/20 group-hover:border-[#A58D66]/40 transition-colors">
                        {getProductIcon(prod.iconName)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-[#E5E1DD] group-hover:text-[#A58D66] transition-colors">
                            {prod.name}
                          </span>
                          <ExternalLink className="w-3 h-3 text-[#A58D66]/60 group-hover:text-[#A58D66] transition-colors" />
                        </div>
                        <p className="text-[11px] text-[#E5E1DD]/60 line-clamp-1 mt-0.5 font-light">
                          {prod.tagline}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <a href="#ai-agent" className="text-[#76B4C2] hover:text-[#E5E1DD] transition-colors flex items-center gap-1.5 font-medium">
            <Bot className="w-3.5 h-3.5 text-[#76B4C2]" />
            <span>Org AI 2.0</span>
          </a>
          <a href="#journey" className="hover:text-[#A58D66] transition-colors">Roadmap</a>
          <a href="#community" className="hover:text-[#A58D66] transition-colors">Exhibition</a>
          <a href="#pricing" className="hover:text-[#A58D66] transition-colors">Editions</a>
          <a href="#team" className="hover:text-[#A58D66] transition-colors">Innovators</a>
        </div>

        {/* User Account / Unified Database Hub */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            onClick={() => setIsUserDashboardOpen(true)}
            className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-[#121c22]/90 border border-[#A58D66]/40 hover:border-[#A58D66] text-[#E5E1DD] text-xs font-medium transition-all shadow-[0_0_15px_rgba(165,141,102,0.15)] hover:shadow-[0_0_20px_rgba(165,141,102,0.3)] hover:scale-[1.02] active:scale-[0.98] group cursor-pointer"
            title="Open User Dashboard & Multi-Platform Database Sync"
          >
            <div className="relative">
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name} 
                className="w-6 h-6 rounded-full object-cover border border-[#A58D66]/60 group-hover:border-[#A58D66] transition-colors" 
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#080f14]" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-semibold text-xs text-[#E5E1DD] group-hover:text-[#A58D66] transition-colors flex items-center gap-1.5">
                <span>{currentUser.name}</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#A58D66]/20 text-[#A58D66] font-mono uppercase tracking-wider font-bold border border-[#A58D66]/30">
                  {currentUser.plan.split(' ')[0]}
                </span>
              </span>
              <span className="text-[10px] text-[#E5E1DD]/60 font-mono">
                {currentUser.creditsRemaining} credits
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#A58D66]/70 group-hover:text-[#A58D66] transition-transform duration-200" />
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            onClick={() => setIsUserDashboardOpen(true)}
            className="p-1 rounded-lg bg-[#121c22] border border-[#A58D66]/40 text-[#E5E1DD] flex items-center gap-1.5 px-2 cursor-pointer"
            title="User Dashboard"
          >
            <div className="relative">
              <img src={currentUser.avatar} alt="User" className="w-5 h-5 rounded-full object-cover" />
              <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </div>
            <span className="text-[11px] font-mono text-[#A58D66] font-semibold">{currentUser.creditsRemaining}cr</span>
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-[#121c22] border border-[#A58D66]/25 text-[#E5E1DD] hover:text-[#A58D66] cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Comprehensive Cross-Platform User Dashboard Modal */}
      <UserDashboardModal
        isOpen={isUserDashboardOpen}
        onClose={() => setIsUserDashboardOpen(false)}
        user={currentUser}
        onUpdateUser={setCurrentUser}
      />

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#091116] border-b border-[#A58D66]/25 px-4 py-6 space-y-4">
          <div className="space-y-1">
            <div className="text-[10px] uppercase font-bold text-[#A58D66] tracking-widest px-2 py-1 font-mono">
              Direct Platforms
            </div>
            {ECOSYSTEM_PRODUCTS.map((prod) => (
              <a
                key={prod.id}
                href={prod.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2 rounded-lg hover:bg-[#407E8C]/15 text-sm text-[#E5E1DD]"
              >
                <div className="flex items-center gap-2.5">
                  {getProductIcon(prod.iconName)}
                  <span>{prod.name}</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-[#A58D66]" />
              </a>
            ))}
          </div>

          <div className="border-t border-[#A58D66]/15 pt-3 space-y-2 text-sm text-[#E5E1DD]/80">
            <a 
              href="#ecosystem-launchpad" 
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2 rounded-lg hover:bg-white/5 font-semibold text-[#A58D66]"
            >
              ⚡ Launch All Portals
            </a>
            <a 
              href="#ai-agent" 
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2 rounded-lg hover:bg-white/5 font-medium text-[#76B4C2] flex items-center gap-2"
            >
              <Bot className="w-4 h-4 text-[#76B4C2]" />
              <span>KITT Org AI 2.0 (Project Intel)</span>
            </a>
            <a 
              href="#journey" 
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2 rounded-lg hover:bg-white/5"
            >
              Roadmap (Student to Pro)
            </a>
            <a 
              href="#community" 
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2 rounded-lg hover:bg-white/5"
            >
              Exhibition Projects
            </a>
            <a 
              href="#pricing" 
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2 rounded-lg hover:bg-white/5"
            >
              Editions & Pricing
            </a>
            <a 
              href="#team" 
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2 rounded-lg hover:bg-white/5 font-medium text-[#A58D66]"
            >
              Core Team & Innovators
            </a>
          </div>

          <div className="border-t border-[#A58D66]/15 pt-4">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setIsUserDashboardOpen(true);
              }}
              className="w-full py-2.5 rounded-xl bg-[#121c22] border border-[#A58D66]/40 text-[#E5E1DD] hover:border-[#A58D66] text-xs font-semibold flex items-center justify-between px-3.5 shadow-md cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-7 h-7 rounded-full object-cover border border-[#A58D66]/50" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-[#E5E1DD]">{currentUser.name}</div>
                  <div className="text-[10px] text-[#A58D66] font-mono">{currentUser.plan} • {currentUser.creditsRemaining} cr</div>
                </div>
              </div>
              <span className="text-[10px] px-2.5 py-1 rounded bg-[#A58D66]/20 text-[#A58D66] font-mono font-bold">
                Dashboard →
              </span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
