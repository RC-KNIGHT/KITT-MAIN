import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  User, 
  Sparkles, 
  Check, 
  Copy, 
  Database, 
  RefreshCw, 
  CreditCard, 
  History, 
  Layers, 
  Cpu, 
  Bot, 
  Binary, 
  Calculator, 
  ExternalLink,
  ShieldCheck,
  HardDrive,
  Zap,
  ArrowUpRight,
  LogOut
} from 'lucide-react';

export interface EcosystemUser {
  id: string;
  name: string;
  email: string;
  handle: string;
  avatar: string;
  apiKey: string;
  plan: 'Free Explorer' | 'Pioneer' | 'Pro Engineer' | 'Autonomous Studio';
  billingCycle: 'monthly' | 'annual';
  creditsRemaining: number;
  creditsTotal: number;
  storageUsedGb: number;
  storageTotalGb: number;
  connectedPlatforms: {
    name: string;
    id: string;
    status: 'connected' | 'syncing' | 'idle';
    lastSync: string;
  }[];
  history: {
    id: string;
    title: string;
    platform: string;
    platformIcon: string;
    action: string;
    timestamp: string;
    status: 'completed' | 'synthesized' | 'compiled' | 'exported';
  }[];
}

export const DEFAULT_ECOSYSTEM_USER: EcosystemUser = {
  id: 'kitt_usr_94820_live',
  name: 'Alex Rivera',
  email: 'alex.rivera@inventor.io',
  handle: '@arivera_circuit',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  apiKey: 'kitt_live_9f82d10a9c8b74e2a101f',
  plan: 'Pro Engineer',
  billingCycle: 'monthly',
  creditsRemaining: 840,
  creditsTotal: 1000,
  storageUsedGb: 2.4,
  storageTotalGb: 10.0,
  connectedPlatforms: [
    { name: 'KITT 1.0 Autonomous Agent', id: 'kitt-agent', status: 'connected', lastSync: '12m ago' },
    { name: 'Ravi Synthesis Workspace', id: 'ravi-workspace', status: 'connected', lastSync: '8m ago' },
    { name: 'DigiLogic Circuit Studio', id: 'digilogic', status: 'connected', lastSync: '22m ago' },
    { name: 'Hardware Fabrication Labs', id: 'hardware-labs', status: 'connected', lastSync: 'Just now' },
  ],
  history: [
    {
      id: 'act-1',
      title: 'Dual-Motor Drone Flight Controller & Telemetry PCB',
      platform: 'Hardware Fabrication Labs',
      platformIcon: 'Cpu',
      action: 'Schematic Routed & Gerber Exported',
      timestamp: '2 hours ago',
      status: 'synthesized'
    },
    {
      id: 'act-2',
      title: 'Real-Time Edge Sensor Driver & C++ Testbench',
      platform: 'Ravi Synthesis Workspace',
      platformIcon: 'Bot',
      action: 'HAL Firmware Verified in Sandbox',
      timestamp: 'Yesterday at 4:18 PM',
      status: 'compiled'
    },
    {
      id: 'act-3',
      title: '555 Precision Astable Frequency Oscillator',
      platform: 'DigiLogic Circuit Studio',
      platformIcon: 'Calculator',
      action: 'AC Waveform FFT Simulated',
      timestamp: '3 days ago',
      status: 'completed'
    },
    {
      id: 'act-4',
      title: 'Verilog 32-Bit Pipelined MAC Processor Core',
      platform: 'KITT 1.0 Autonomous Agent',
      platformIcon: 'Binary',
      action: 'RTL Architecture Synthesized',
      timestamp: '5 days ago',
      status: 'exported'
    },
    {
      id: 'act-5',
      title: 'Autonomous Rover Obstacle Avoidance LIDAR Pipeline',
      platform: 'Ravi Synthesis Workspace',
      platformIcon: 'Bot',
      action: 'Point Cloud Algorithm Optimized',
      timestamp: 'Last week',
      status: 'compiled'
    }
  ]
};

interface UserDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: EcosystemUser;
  onUpdateUser?: (updated: EcosystemUser) => void;
}

export const UserDashboardModal: React.FC<UserDashboardModalProps> = ({
  isOpen,
  onClose,
  user = DEFAULT_ECOSYSTEM_USER,
  onUpdateUser
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'databases'>('overview');
  const [historyFilter, setHistoryFilter] = useState<string>('all');
  const [copiedKey, setCopiedKey] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  // Close on Escape key press
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
    navigator.clipboard.writeText(user.apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleSyncDatabases = () => {
    setIsSyncing(true);
    setSyncSuccess(false);
    setTimeout(() => {
      setIsSyncing(false);
      setSyncSuccess(true);
      if (onUpdateUser) {
        onUpdateUser({
          ...user,
          connectedPlatforms: user.connectedPlatforms.map((p) => ({
            ...p,
            lastSync: 'Just now',
            status: 'connected'
          }))
        });
      }
      setTimeout(() => setSyncSuccess(false), 3000);
    }, 1200);
  };

  const handleSelectPlan = (planName: EcosystemUser['plan']) => {
    if (onUpdateUser) {
      onUpdateUser({
        ...user,
        plan: planName,
        creditsTotal: planName === 'Free Explorer' ? 100 : planName === 'Pioneer' ? 500 : planName === 'Pro Engineer' ? 1000 : 5000,
        creditsRemaining: planName === 'Free Explorer' ? 75 : planName === 'Pioneer' ? 420 : planName === 'Pro Engineer' ? 840 : 4850
      });
    }
  };

  const filteredHistory = user.history.filter((item) => {
    if (historyFilter === 'all') return true;
    return item.platform.toLowerCase().includes(historyFilter.toLowerCase());
  });

  const getPlatformIcon = (iconName: string) => {
    switch (iconName) {
      case 'Bot': return <Bot className="w-3.5 h-3.5 text-[#76B4C2]" />;
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
      <div className="surreal-card rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl border border-[#A58D66]/35 bg-[#080f14]/95 overflow-hidden">
        {/* Top Header Strip */}
        <div className="px-5 py-4 border-b border-[#A58D66]/20 bg-[#091116] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="w-11 h-11 rounded-full object-cover border-2 border-[#A58D66] shadow-[0_0_12px_rgba(165,141,102,0.35)]" 
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-[#080f14]" title="4 Databases Online & Synced" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold font-cinzel text-[#E5E1DD]">{user.name}</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#A58D66]/20 text-[#A58D66] font-mono uppercase tracking-wider font-semibold border border-[#A58D66]/35">
                  {user.plan}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#E5E1DD]/60 font-mono mt-0.5">
                <span>{user.email}</span>
                <span>•</span>
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <Database className="w-3 h-3" />
                  <span>4/4 Platforms Synced</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncDatabases}
              disabled={isSyncing}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#407E8C]/15 hover:bg-[#407E8C]/25 text-[#E5E1DD] border border-[#407E8C]/35 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
              title="Sync All 4 Platform Databases"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#76B4C2] ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : syncSuccess ? 'Synced!' : 'Sync Databases'}</span>
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
        <div className="px-5 pt-3 border-b border-[#A58D66]/15 bg-[#080f14] flex items-center gap-6 shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-3 text-xs sm:text-sm font-semibold transition-colors relative cursor-pointer flex items-center gap-1.5 ${
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
            onClick={() => setActiveTab('history')}
            className={`pb-3 text-xs sm:text-sm font-semibold transition-colors relative cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'history' ? 'text-[#A58D66]' : 'text-[#E5E1DD]/60 hover:text-[#E5E1DD]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Cross-Platform History</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#A58D66]/20 text-[#A58D66] font-mono">
              {user.history.length}
            </span>
            {activeTab === 'history' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#A58D66] rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('databases')}
            className={`pb-3 text-xs sm:text-sm font-semibold transition-colors relative cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'databases' ? 'text-[#A58D66]' : 'text-[#E5E1DD]/60 hover:text-[#E5E1DD]'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Connected Databases (4)</span>
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
                    <h4 className="text-lg font-bold font-cinzel text-[#E5E1DD] mt-1">{user.plan}</h4>
                    <p className="text-xs text-[#E5E1DD]/60 mt-0.5">Active on 4 Platforms • Renews Oct 2026</p>
                  </div>
                  <div className="pt-3 mt-3 border-t border-[#A58D66]/20 flex items-center justify-between">
                    <span className="text-xs font-mono text-[#A58D66]">$29 / month</span>
                    <a
                      href="#pricing"
                      onClick={onClose}
                      className="text-xs text-[#E5E1DD] hover:text-[#A58D66] flex items-center gap-1 font-medium transition-colors"
                    >
                      <span>Upgrade Plan</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* AI Compute Credits Meter */}
                <div className="surreal-card rounded-xl p-4 border border-[#A58D66]/20 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono text-[#E5E1DD]/60">
                      <span>COMPUTE CREDITS</span>
                      <span className="text-[#A58D66] font-bold">{Math.round((user.creditsRemaining / user.creditsTotal) * 100)}%</span>
                    </div>
                    <div className="text-lg font-bold font-mono text-[#E5E1DD] mt-1">
                      {user.creditsRemaining} <span className="text-xs text-[#E5E1DD]/50 font-normal">/ {user.creditsTotal} cr</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-1.5 rounded-full bg-white/10 mt-2 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#A58D66] to-[#76B4C2] rounded-full transition-all duration-500" 
                        style={{ width: `${(user.creditsRemaining / user.creditsTotal) * 100}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-[#E5E1DD]/50 pt-2 font-mono">Shared seamlessly across all 4 platforms</p>
                </div>

                {/* Cloud Schematics Storage Meter */}
                <div className="surreal-card rounded-xl p-4 border border-[#A58D66]/20 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono text-[#E5E1DD]/60">
                      <span>CLOUD STORAGE</span>
                      <span className="text-[#76B4C2] font-bold">{Math.round((user.storageUsedGb / user.storageTotalGb) * 100)}%</span>
                    </div>
                    <div className="text-lg font-bold font-mono text-[#E5E1DD] mt-1">
                      {user.storageUsedGb} GB <span className="text-xs text-[#E5E1DD]/50 font-normal">/ {user.storageTotalGb} GB</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-1.5 rounded-full bg-white/10 mt-2 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#407E8C] to-[#76B4C2] rounded-full transition-all duration-500" 
                        style={{ width: `${(user.storageUsedGb / user.storageTotalGb) * 100}%` }}
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-[#E5E1DD]/50 pt-2 font-mono">Gerbers, Verilog RTL & C++ repositories</p>
                </div>
              </div>

              {/* Unified Database API Token & Credentials */}
              <div className="rounded-xl surreal-card p-4 border border-[#A58D66]/25 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-[#A58D66]" />
                    <span className="text-xs font-bold font-cinzel text-[#E5E1DD]">Unified Ecosystem Database Token</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">
                    Live Across 4 Platforms
                  </span>
                </div>

                <p className="text-xs text-[#E5E1DD]/70">
                  Use this unified secret token to authenticate and bridge databases between KITT 1.0, Ravi Workspace, DigiLogic, and Hardware Labs.
                </p>

                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    readOnly
                    value={user.apiKey}
                    className="flex-1 bg-[#050b0f] border border-[#A58D66]/30 rounded-lg px-3 py-2 text-xs font-mono text-[#E5E1DD] focus:outline-none select-all"
                  />
                  <button
                    onClick={handleCopyApiKey}
                    className="px-3 py-2 rounded-lg bg-[#A58D66]/20 hover:bg-[#A58D66]/30 border border-[#A58D66]/40 text-xs text-[#E5E1DD] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#A58D66]" />}
                    <span>{copiedKey ? 'Copied' : 'Copy Key'}</span>
                  </button>
                </div>
              </div>

              {/* Other Available Plans (Quick Switch / Explore) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-widest font-mono text-[#A58D66]">
                    Available Ecosystem Tiers
                  </h4>
                  <a href="#pricing" onClick={onClose} className="text-xs text-[#76B4C2] hover:text-[#E5E1DD] flex items-center gap-1">
                    <span>Full Plan Breakdown</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </a>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { name: 'Free Explorer', price: '$0', credits: '100 cr', desc: 'Basic logic simulation & public repos' },
                    { name: 'Pioneer', price: '$15/mo', credits: '500 cr', desc: '5 concurrent agents & Gerber exports' },
                    { name: 'Pro Engineer', price: '$29/mo', credits: '1000 cr', desc: 'Unlimited sync across all 4 platforms' },
                    { name: 'Autonomous Studio', price: '$79/mo', credits: '5000 cr', desc: 'Hardware lab queues & dedicated GPU' }
                  ].map((tier) => {
                    const isCurrent = user.plan === tier.name;
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
                          </div>
                          <div className="text-base font-bold font-mono text-[#A58D66] mt-1">{tier.price}</div>
                          <p className="text-[11px] text-[#E5E1DD]/60 mt-1 line-clamp-2">{tier.desc}</p>
                        </div>

                        <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between">
                          <span className="text-[10px] font-mono text-[#76B4C2]">{tier.credits}</span>
                          {!isCurrent ? (
                            <button
                              onClick={() => handleSelectPlan(tier.name as EcosystemUser['plan'])}
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

          {/* TAB 2: CROSS-PLATFORM HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              {/* Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
                {['all', 'Hardware Labs', 'Ravi Workspace', 'DigiLogic', 'KITT 1.0'].map((filter) => (
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
                        <div className="flex items-center gap-2">
                          <h5 className="text-xs sm:text-sm font-semibold text-[#E5E1DD] group-hover:text-[#A58D66] transition-colors">
                            {item.title}
                          </h5>
                        </div>
                        <p className="text-xs text-[#E5E1DD]/60 mt-0.5">
                          {item.action}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] font-mono text-[#E5E1DD]/40 mt-1">
                          <span className="text-[#76B4C2] font-medium">{item.platform}</span>
                          <span>•</span>
                          <span>{item.timestamp}</span>
                        </div>
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

          {/* TAB 3: CONNECTED DATABASES (THE 4 PLATFORMS) */}
          {activeTab === 'databases' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#407E8C]/10 border border-[#407E8C]/30 text-xs text-[#E5E1DD]/80 leading-relaxed flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>
                  All 4 ecosystem databases are synchronized via our unified schema. Creational state, telemetry data, and custom schematics persist across all portals automatically.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {user.connectedPlatforms.map((platform) => (
                  <div
                    key={platform.id}
                    className="p-4 rounded-xl bg-[#0a1217] border border-[#A58D66]/25 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-cinzel text-[#E5E1DD]">{platform.name}</span>
                      <span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Online</span>
                      </span>
                    </div>

                    <div className="space-y-1 text-xs font-mono text-[#E5E1DD]/60">
                      <div className="flex justify-between">
                        <span>Database Node:</span>
                        <span className="text-[#E5E1DD] font-semibold">{platform.id}-primary</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Synced:</span>
                        <span className="text-[#A58D66]">{platform.lastSync}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-emerald-400 font-mono">Auto-Sync Active</span>
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
                  <span>{isSyncing ? 'Synchronizing All 4 Nodes...' : 'Force Global Database Sync'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Action Footer */}
        <div className="px-5 py-3.5 bg-[#091116] border-t border-[#A58D66]/20 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-[#E5E1DD]/50 font-mono">
            <span>Unified User ID:</span>
            <span className="text-[#A58D66]">{user.id}</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl border border-[#A58D66]/35 bg-[#121c22] hover:bg-[#1a2730] text-xs font-semibold text-[#E5E1DD] hover:text-[#A58D66] transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <X className="w-3.5 h-3.5" />
            <span>Close & Return to Page</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
