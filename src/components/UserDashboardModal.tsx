import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  Sparkles, 
  Check, 
  Copy, 
  Database, 
  RefreshCw, 
  CreditCard, 
  History, 
  FolderGit2,
  Cpu, 
  Binary, 
  Calculator, 
  ExternalLink,
  ShieldCheck,
  ArrowUpRight,
  Download,
  KeyRound,
  Radio,
  Clock,
  Layers
} from 'lucide-react';
import { 
  ecosystemStore, 
  EcosystemUser, 
  EcosystemTier, 
  ECOSYSTEM_TIERS, 
  SyncedProject, 
  EcosystemActivity, 
  PortalConnectionStatus,
  DEFAULT_ECOSYSTEM_USER 
} from '../utils/ecosystemStore';
import { KittLogo } from './KittLogo';

// Re-export for consuming components (e.g. Navbar)
export type { EcosystemUser };
export { DEFAULT_ECOSYSTEM_USER };

interface UserDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: EcosystemUser;
  onUpdateUser?: (updated: EcosystemUser) => void;
}

export const UserDashboardModal: React.FC<UserDashboardModalProps> = ({
  isOpen,
  onClose,
  user: initialUser,
  onUpdateUser
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'history' | 'databases'>('overview');
  const [historyFilter, setHistoryFilter] = useState<string>('all');
  const [copiedKey, setCopiedKey] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [keyRotated, setKeyRotated] = useState(false);
  const [downloadedNetlistId, setDownloadedNetlistId] = useState<string | null>(null);

  // Reactive State directly powered by ecosystemStore
  const [currentUser, setCurrentUser] = useState<EcosystemUser>(() => initialUser || ecosystemStore.getUser());
  const [projects, setProjects] = useState<SyncedProject[]>(() => ecosystemStore.getProjects());
  const [activities, setActivities] = useState<EcosystemActivity[]>(() => ecosystemStore.getActivities());
  const [portalStatuses, setPortalStatuses] = useState<PortalConnectionStatus[]>(() => ecosystemStore.getPortalStatuses());

  useEffect(() => {
    if (!isOpen) return;

    const refreshFromStore = () => {
      const u = ecosystemStore.getUser();
      setCurrentUser(u);
      setProjects(ecosystemStore.getProjects());
      setActivities(ecosystemStore.getActivities());
      setPortalStatuses(ecosystemStore.getPortalStatuses());
      if (onUpdateUser) onUpdateUser(u);
    };

    refreshFromStore();
    const unsub = ecosystemStore.subscribe(refreshFromStore);
    return () => unsub();
  }, [isOpen, onUpdateUser]);

  // Close modal on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(currentUser.apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleRegenerateKey = () => {
    const newKey = ecosystemStore.regenerateApiKey();
    setKeyRotated(true);
    setTimeout(() => setKeyRotated(false), 3000);
  };

  const handleSyncDatabases = () => {
    setIsSyncing(true);
    setSyncSuccess(false);
    setTimeout(() => {
      ecosystemStore.syncAcrossPortals();
      setIsSyncing(false);
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3500);
    }, 1200);
  };

  const handleSelectPlan = (tierName: EcosystemTier) => {
    const targetConfig = ECOSYSTEM_TIERS.find(t => t.name === tierName);
    if (!targetConfig) return;

    ecosystemStore.updateUser({
      plan: tierName,
      creditsTotal: targetConfig.credits,
      creditsRemaining: Math.min(currentUser.creditsRemaining, targetConfig.credits) || targetConfig.credits,
      storageTotalGb: targetConfig.storageGb
    });

    ecosystemStore.addActivity({
      title: `Ecosystem Membership Upgraded`,
      platform: 'KITT 1.0 Autonomous Agent',
      platformIcon: 'Bot',
      action: `Plan adjusted to ${tierName} (${targetConfig.credits} Compute Credits)`,
      status: 'synthesized'
    });
  };

  const handleDownloadNetlist = (project: SyncedProject) => {
    const netlistContent = ecosystemStore.exportProjectNetlist(project.id);
    const blob = new Blob([netlistContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_netlist.cir`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadedNetlistId(project.id);
    setTimeout(() => setDownloadedNetlistId(null), 2500);
  };

  const handleOpenPortal = (route: string) => {
    onClose();
    if (route.startsWith('#')) {
      window.location.hash = route;
    } else {
      window.open(route, '_blank', 'noopener,noreferrer');
    }
  };

  const filteredHistory = activities.filter((item) => {
    if (historyFilter === 'all') return true;
    return item.platform.toLowerCase().includes(historyFilter.toLowerCase());
  });

  const getPlatformIcon = (iconName: string) => {
    switch (iconName) {
      case 'Bot': return <KittLogo size={16} showGlow={false} className="shrink-0" />;
      case 'Cpu': return <Cpu className="w-3.5 h-3.5 text-[#A58D66]" />;
      case 'Binary': return <Binary className="w-3.5 h-3.5 text-[#E5E1DD]" />;
      case 'Calculator': return <Calculator className="w-3.5 h-3.5 text-[#A58D66]" />;
      default: return <Layers className="w-3.5 h-3.5 text-[#A58D66]" />;
    }
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="surreal-card rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-[#A58D66]/35 bg-[#080f14]/95 overflow-hidden">
        {/* Top Header Strip */}
        <div className="px-5 py-4 border-b border-[#A58D66]/20 bg-[#091116] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name} 
                className="w-11 h-11 rounded-full object-cover border-2 border-[#A58D66] shadow-[0_0_12px_rgba(165,141,102,0.35)]" 
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-[#080f14]" title="4 Portals Online & Synced" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold font-cinzel text-[#E5E1DD] flex items-center gap-1.5">
                  <span>{currentUser.name}</span>
                  <KittLogo size={16} showGlow={false} />
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#A58D66]/20 text-[#A58D66] font-mono uppercase tracking-wider font-semibold border border-[#A58D66]/35">
                  {currentUser.plan}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#E5E1DD]/60 font-mono mt-0.5">
                <span>{currentUser.email}</span>
                <span>•</span>
                <span className="text-[#A58D66] font-medium truncate max-w-[240px] sm:max-w-none">
                  {currentUser.institution}
                </span>
                <span>•</span>
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <Radio className="w-3 h-3" />
                  <span>4/4 Portals Synced</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncDatabases}
              disabled={isSyncing}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#407E8C]/15 hover:bg-[#407E8C]/25 text-[#E5E1DD] border border-[#407E8C]/35 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
              title="Replicate state across all 4 platforms"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#76B4C2] ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : syncSuccess ? '4 Portals Synced!' : 'Sync Portals'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#E5E1DD]/60 hover:text-[#E5E1DD] hover:bg-white/10 transition-colors cursor-pointer"
              title="Close Dashboard"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 pt-3 border-b border-[#A58D66]/15 bg-[#080f14] flex items-center gap-4 sm:gap-6 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 text-xs sm:text-sm font-semibold transition-colors relative cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'overview' ? 'text-[#A58D66]' : 'text-[#E5E1DD]/60 hover:text-[#E5E1DD]'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Plan & Compute</span>
            {activeTab === 'overview' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#A58D66] rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('projects')}
            className={`pb-3 text-xs sm:text-sm font-semibold transition-colors relative cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'projects' ? 'text-[#A58D66]' : 'text-[#E5E1DD]/60 hover:text-[#E5E1DD]'
            }`}
          >
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>Synced Projects</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#A58D66]/20 text-[#A58D66] font-mono">
              {projects.length}
            </span>
            {activeTab === 'projects' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#A58D66] rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 text-xs sm:text-sm font-semibold transition-colors relative cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'history' ? 'text-[#A58D66]' : 'text-[#E5E1DD]/60 hover:text-[#E5E1DD]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Activity Log</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#407E8C]/20 text-[#76B4C2] font-mono">
              {activities.length}
            </span>
            {activeTab === 'history' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#A58D66] rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('databases')}
            className={`pb-3 text-xs sm:text-sm font-semibold transition-colors relative cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'databases' ? 'text-[#A58D66]' : 'text-[#E5E1DD]/60 hover:text-[#E5E1DD]'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Connected Portals (4)</span>
            {activeTab === 'databases' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#A58D66] rounded-full" />
            )}
          </button>
        </div>

        {/* Modal Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* TAB 1: OVERVIEW & SUBSCRIPTION PLANS */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Active Plan & Resource Meters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Current Active Plan Card */}
                <div className="surreal-card-gold rounded-xl p-4 border border-[#A58D66]/40 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono text-[#A58D66]">
                      <span>CURRENT MEMBERSHIP</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    </div>
                    <h4 className="text-lg font-bold font-cinzel text-[#E5E1DD] mt-1">{currentUser.plan}</h4>
                    <p className="text-xs text-[#E5E1DD]/60 mt-0.5">Active across all 4 portals • Auto-renews</p>
                  </div>
                  <div className="pt-3 mt-3 border-t border-[#A58D66]/20 flex items-center justify-between">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xs font-mono font-bold text-[#A58D66]">
                        {currentUser.plan === 'Free Explorer' ? '$0 / free' : currentUser.plan === 'Pioneer Maker' ? '$6 / mo' : currentUser.plan === 'Pro Engineer' ? '$15 / mo' : '$39 / mo'}
                      </span>
                      {currentUser.plan !== 'Free Explorer' && (
                        <span className="text-[10px] text-[#E5E1DD]/40 line-through font-mono">
                          {currentUser.plan === 'Pioneer Maker' ? '$19' : currentUser.plan === 'Pro Engineer' ? '$49' : '$129'}
                        </span>
                      )}
                      {currentUser.plan !== 'Free Explorer' && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-400/20 text-emerald-400 font-mono font-bold">
                          70% OFF
                        </span>
                      )}
                    </div>
                    <a
                      href="#pricing"
                      onClick={onClose}
                      className="text-xs text-[#E5E1DD] hover:text-[#A58D66] flex items-center gap-1 font-medium transition-colors"
                    >
                      <span>Explore Pricing</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* AI Compute Credits Meter */}
                <div className="surreal-card rounded-xl p-4 border border-[#A58D66]/20 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono text-[#E5E1DD]/60">
                      <span>COMPUTE CREDITS</span>
                      <span className="text-[#A58D66] font-bold">
                        {Math.round((currentUser.creditsRemaining / currentUser.creditsTotal) * 100)}%
                      </span>
                    </div>
                    <div className="text-lg font-bold font-mono text-[#E5E1DD] mt-1">
                      {currentUser.creditsRemaining} <span className="text-xs text-[#E5E1DD]/50 font-normal">/ {currentUser.creditsTotal} cr</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/10 mt-2 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#A58D66] to-[#76B4C2] rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min(100, (currentUser.creditsRemaining / currentUser.creditsTotal) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-[#E5E1DD]/50 pt-2 font-mono">Shared seamlessly across all 4 portals</p>
                </div>

                {/* Cloud Schematics Storage Meter */}
                <div className="surreal-card rounded-xl p-4 border border-[#A58D66]/20 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono text-[#E5E1DD]/60">
                      <span>CLOUD SCHEMATICS & RTL</span>
                      <span className="text-[#76B4C2] font-bold">
                        {Math.round((currentUser.storageUsedGb / currentUser.storageTotalGb) * 100)}%
                      </span>
                    </div>
                    <div className="text-lg font-bold font-mono text-[#E5E1DD] mt-1">
                      {currentUser.storageUsedGb} GB <span className="text-xs text-[#E5E1DD]/50 font-normal">/ {currentUser.storageTotalGb} GB</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/10 mt-2 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#407E8C] to-[#76B4C2] rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min(100, (currentUser.storageUsedGb / currentUser.storageTotalGb) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-[#E5E1DD]/50 pt-2 font-mono">Gerbers, Verilog RTL & C++ firmware repositories</p>
                </div>
              </div>

              {/* Unified Database API Token & Credentials */}
              <div className="rounded-xl surreal-card p-4 border border-[#A58D66]/25 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-[#A58D66]" />
                    <span className="text-xs font-bold font-cinzel text-[#E5E1DD]">Unified Ecosystem Security Token</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">
                    Active Across 4 Portals
                  </span>
                </div>

                <p className="text-xs text-[#E5E1DD]/70">
                  This cryptographically verified token binds your session, netlists, and compute credits between KITT AI, KITT Workspace, DigiLogic, and Number Trainer.
                </p>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="password"
                    readOnly
                    value={currentUser.apiKey}
                    className="flex-1 bg-[#050b0f] border border-[#A58D66]/30 rounded-lg px-3 py-2 text-xs font-mono text-[#E5E1DD] focus:outline-none select-all"
                  />
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handleCopyApiKey}
                      className="flex-1 sm:flex-initial px-3 py-2 rounded-lg bg-[#A58D66]/20 hover:bg-[#A58D66]/30 border border-[#A58D66]/40 text-xs text-[#E5E1DD] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#A58D66]" />}
                      <span>{copiedKey ? 'Copied' : 'Copy Key'}</span>
                    </button>
                    <button
                      onClick={handleRegenerateKey}
                      className="flex-1 sm:flex-initial px-3 py-2 rounded-lg bg-[#407E8C]/20 hover:bg-[#407E8C]/30 border border-[#407E8C]/40 text-xs text-[#76B4C2] font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      title="Rotate and regenerate your API token"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-[#76B4C2]" />
                      <span>{keyRotated ? 'Key Rotated!' : 'Rotate Token'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Unified 4 Ecosystem Tiers */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-widest font-mono text-[#A58D66]">
                    Ecosystem Membership Tiers
                  </h4>
                  <a href="#pricing" onClick={onClose} className="text-xs text-[#76B4C2] hover:text-[#E5E1DD] flex items-center gap-1">
                    <span>Full Feature Matrix</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </a>
                </div>

                {/* Special Offer Alert Banner */}
                <div className="p-3 rounded-xl bg-gradient-to-r from-[#A58D66]/15 via-[#407E8C]/15 to-[#A58D66]/15 border border-[#A58D66]/35 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#A58D66] shrink-0" />
                    <span className="text-[#E5E1DD]">
                      <strong className="text-[#A58D66]">70% Welcome Subsidy Active:</strong> Promotional rates unlocked for all new registrations.
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-400/20 text-emerald-400 font-mono font-bold shrink-0">
                    70% OFF
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {ECOSYSTEM_TIERS.map((tier) => {
                    const isCurrent = currentUser.plan === tier.name;
                    return (
                      <div 
                        key={tier.name}
                        className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                          isCurrent 
                            ? 'bg-[#A58D66]/15 border-[#A58D66] shadow-[0_0_15px_rgba(165,141,102,0.2)]' 
                            : 'bg-[#0a1217] border-[#A58D66]/20 hover:border-[#A58D66]/40'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold font-cinzel text-[#E5E1DD]">{tier.name}</span>
                            {isCurrent && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#A58D66] text-[#080f14] font-bold font-mono">
                                ACTIVE
                              </span>
                            )}
                            {tier.badge && !isCurrent && (
                              <span className="text-[8.5px] px-1.5 py-0.2 rounded bg-[#407E8C]/20 text-[#76B4C2] font-mono border border-[#407E8C]/30">
                                {tier.badge}
                              </span>
                            )}
                          </div>
                          <div className="flex items-baseline gap-1.5 mt-1 flex-wrap">
                            <span className="text-base font-bold font-mono text-[#A58D66]">
                              {tier.monthlyPrice === 0 ? '$0' : `$${tier.monthlyPrice}/mo`}
                            </span>
                            {tier.originalMonthlyPrice > 0 && (
                              <span className="text-xs text-[#E5E1DD]/40 line-through font-mono">
                                ${tier.originalMonthlyPrice}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#E5E1DD]/60 mt-1 line-clamp-2">{tier.desc}</p>
                        </div>

                        <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between">
                          <span className="text-[10px] font-mono text-[#76B4C2]">{tier.credits} cr • {tier.storageGb} GB</span>
                          {!isCurrent ? (
                            <button
                              onClick={() => handleSelectPlan(tier.name)}
                              className="text-[11px] px-2 py-1 rounded bg-white/10 hover:bg-[#A58D66]/20 text-[#E5E1DD] hover:text-[#A58D66] font-medium transition-colors cursor-pointer"
                            >
                              Switch Tier
                            </button>
                          ) : (
                            <span className="text-[10px] font-mono text-emerald-400">Current</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SYNCED PROJECTS ACROSS ALL 4 PORTALS */}
          {activeTab === 'projects' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-[#407E8C]/10 border border-[#407E8C]/25 text-xs text-[#E5E1DD]/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <FolderGit2 className="w-4 h-4 text-[#76B4C2] shrink-0" />
                  <span>
                    Your active hardware designs are canonically mapped and shared across all 4 portals. Export netlists or launch any circuit directly.
                  </span>
                </div>
                <span className="hidden sm:inline text-[11px] font-mono text-[#A58D66]">
                  {projects.length} Synced
                </span>
              </div>

              <div className="space-y-3">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="p-4 rounded-xl bg-[#0a1217] border border-[#A58D66]/20 hover:border-[#A58D66]/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="p-2.5 rounded-lg bg-[#407E8C]/15 border border-[#407E8C]/30 text-[#A58D66] mt-0.5 shrink-0 group-hover:bg-[#A58D66]/20 transition-colors">
                        {getPlatformIcon(project.platformIcon)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h5 className="text-sm font-bold text-[#E5E1DD] font-cinzel group-hover:text-[#A58D66] transition-colors truncate">
                            {project.title}
                          </h5>
                          <span className="text-[9.5px] font-mono px-2 py-0.2 rounded-full bg-emerald-400/10 text-emerald-400 border border-emerald-400/25 uppercase">
                            {project.status}
                          </span>
                        </div>
                        <p className="text-xs text-[#E5E1DD]/70 mt-1 line-clamp-2 leading-relaxed">
                          {project.summary}
                        </p>
                        <div className="flex items-center gap-3 text-[11px] font-mono text-[#E5E1DD]/40 mt-1.5 flex-wrap">
                          <span className="text-[#76B4C2] font-semibold">{project.platform}</span>
                          <span>•</span>
                          <span>{project.componentsCount} Components</span>
                          <span>•</span>
                          <span>{project.netsCount} Verified Nets</span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-[#A58D66]">
                            <Clock className="w-3 h-3" />
                            <span>{project.lastSynced}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                      <button
                        onClick={() => handleDownloadNetlist(project)}
                        className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#E5E1DD] border border-white/15 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        title="Download standard SPICE .cir netlist"
                      >
                        <Download className="w-3.5 h-3.5 text-[#76B4C2]" />
                        <span>{downloadedNetlistId === project.id ? 'Exported!' : 'Netlist'}</span>
                      </button>

                      <button
                        onClick={() => handleOpenPortal(project.route)}
                        className="flex-1 sm:flex-initial px-3 py-1.5 rounded-lg bg-[#A58D66]/20 hover:bg-[#A58D66]/30 text-[#DFCCA8] border border-[#A58D66]/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                      >
                        <span>Open Studio</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-[#A58D66]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: CROSS-PLATFORM HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              {/* Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
                {['all', 'KITT 1.0', 'Ravi Synthesis', 'DigiLogic', 'Hardware Fabrication'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setHistoryFilter(filter)}
                    className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer whitespace-nowrap capitalize ${
                      historyFilter === filter
                        ? 'bg-[#A58D66] text-[#080f14] font-bold border-[#A58D66]'
                        : 'bg-[#121c22] text-[#E5E1DD]/70 border-[#A58D66]/20 hover:border-[#A58D66]/40 hover:text-[#E5E1DD]'
                    }`}
                  >
                    {filter === 'all' ? 'All Platforms' : filter}
                  </button>
                ))}
              </div>

              {/* History List */}
              <div className="space-y-2.5">
                {filteredHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-[#0b1318] border border-[#A58D66]/20 hover:border-[#A58D66]/40 transition-colors flex items-start justify-between gap-4 group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-[#407E8C]/15 border border-[#407E8C]/30 text-[#A58D66] mt-0.5 group-hover:bg-[#A58D66]/20 transition-colors">
                        {getPlatformIcon(item.platformIcon)}
                      </div>
                      <div>
                        <h5 className="text-xs sm:text-sm font-semibold text-[#E5E1DD] group-hover:text-[#A58D66] transition-colors">
                          {item.title}
                        </h5>
                        <p className="text-xs text-[#E5E1DD]/60 mt-0.5">
                          {item.action}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] font-mono text-[#E5E1DD]/40 mt-1">
                          <span className="text-[#76B4C2] font-medium">{item.platform}</span>
                          <span>•</span>
                          <span>{item.timestamp}</span>
                        </div>
                        {item.route && (
                          <div className="mt-2">
                            <button
                              onClick={() => handleOpenPortal(item.route!)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#A58D66]/15 hover:bg-[#A58D66]/25 border border-[#A58D66]/30 text-[#DFCCA8] text-[11px] font-medium transition-all cursor-pointer"
                            >
                              <span>Open in Portal</span>
                              <ArrowUpRight className="w-3 h-3 text-[#A58D66]" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded uppercase tracking-wider bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 shrink-0">
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: CONNECTED PORTALS (THE 4 NODES) */}
          {activeTab === 'databases' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#407E8C]/10 border border-[#407E8C]/30 text-xs text-[#E5E1DD]/80 leading-relaxed flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>
                  All 4 ecosystem platforms share the canonical KITT netlist schema. Circuit modifications, simulation telemetry, and digital logic testbenches replicate across every portal in real time.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {portalStatuses.map((portal) => (
                  <div
                    key={portal.id}
                    className="p-4 rounded-xl bg-[#0a1217] border border-[#A58D66]/25 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded bg-[#A58D66]/15 text-[#A58D66]">
                          {getPlatformIcon(portal.icon)}
                        </div>
                        <span className="text-xs font-bold font-cinzel text-[#E5E1DD]">{portal.name}</span>
                      </div>
                      <span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Online</span>
                      </span>
                    </div>

                    <div className="space-y-1 text-xs font-mono text-[#E5E1DD]/60">
                      <div className="flex justify-between">
                        <span>Node Latency:</span>
                        <span className="text-emerald-400 font-semibold">{portal.latencyMs} ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Active Projects:</span>
                        <span className="text-[#E5E1DD] font-semibold">{portal.activeProjectsCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Replication Mode:</span>
                        <span className="text-[#A58D66] truncate max-w-[160px]">{portal.lastSync}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                      <button
                        onClick={() => handleOpenPortal(portal.route)}
                        className="text-xs text-[#76B4C2] hover:text-[#E5E1DD] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span>Launch Portal</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                      <button
                        onClick={handleSyncDatabases}
                        className="text-xs text-[#A58D66] hover:text-[#E5E1DD] font-medium transition-colors cursor-pointer"
                      >
                        Ping Node
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleSyncDatabases}
                  disabled={isSyncing}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#A58D66] to-[#8C7654] hover:from-[#BFA378] hover:to-[#A58D66] text-[#080f14] font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(165,141,102,0.35)] transition-all cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Replicating All 4 Portal Nodes...' : 'Force Global Database Sync'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Action Footer */}
        <div className="px-5 py-3.5 bg-[#091116] border-t border-[#A58D66]/20 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-[#E5E1DD]/50 font-mono">
            <span>Unified User ID:</span>
            <span className="text-[#A58D66]">{currentUser.id}</span>
            <span className="hidden sm:inline text-[#E5E1DD]/30">•</span>
            <span className="hidden sm:inline text-emerald-400 font-medium">Session Verified</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl border border-[#A58D66]/35 bg-[#121c22] hover:bg-[#1a2730] text-xs font-semibold text-[#E5E1DD] hover:text-[#A58D66] transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <X className="w-3.5 h-3.5" />
            <span>Close & Return</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
