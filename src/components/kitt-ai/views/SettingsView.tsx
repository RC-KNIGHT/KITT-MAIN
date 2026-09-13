import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Sliders, 
  Cpu, 
  Users, 
  CreditCard, 
  Keyboard, 
  Check, 
  Save, 
  Zap, 
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { KittSettings } from '../state/projectStore';

interface SettingsViewProps {
  settings: KittSettings;
  onUpdateSettings: (updates: Partial<KittSettings>) => void;
  onOpenUpgradeModal: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onOpenUpgradeModal
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'editor' | 'simulation' | 'team' | 'account' | 'shortcuts'>('general');
  const [localSettings, setLocalSettings] = useState<KittSettings>(settings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    onUpdateSettings(localSettings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'editor', label: 'Editor & Canvas', icon: Sliders },
    { id: 'simulation', label: 'Simulation Engine', icon: Cpu },
    { id: 'team', label: 'Team & Workspace', icon: Users },
    { id: 'account', label: 'Account & Plan', icon: CreditCard },
    { id: 'shortcuts', label: 'Keyboard Shortcuts', icon: Keyboard },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 font-sans max-w-5xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-mono text-[#E5E1DD]">Settings</h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure your electronics CAD preferences, SPICE numerical engine, and workspace settings.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#A58D66] to-[#8C7654] hover:from-[#bfa378] hover:to-[#A58D66] text-[#080f14] font-mono font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(165,141,102,0.3)] transition-all cursor-pointer self-start sm:self-auto"
        >
          {savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{savedSuccess ? 'Preferences Saved' : 'Save Changes'}</span>
        </button>
      </div>

      {/* Tabs Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Tab Buttons */}
        <div className="md:col-span-3 space-y-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-mono text-left transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#A58D66]/15 text-[#DFCCA8] border border-[#A58D66]/35 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#A58D66]' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Content Panel */}
        <div className="md:col-span-9 bg-[#0c161d] border border-[#A58D66]/20 rounded-2xl p-6 shadow-xl">
          {/* 1. General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-5 font-mono text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Workspace Name</label>
                <input
                  type="text"
                  value={localSettings.workspaceName}
                  onChange={e => setLocalSettings({ ...localSettings, workspaceName: e.target.value })}
                  className="w-full max-w-md px-3.5 py-2 rounded-lg bg-[#080f14] border border-white/10 text-[#E5E1DD] focus:outline-none focus:border-[#A58D66]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Default Starting Mode</label>
                <div className="flex gap-3">
                  {(['schematic', 'breadboard'] as const).map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setLocalSettings({ ...localSettings, defaultMode: m })}
                      className={`px-4 py-2 rounded-lg border capitalize cursor-pointer transition-colors ${
                        localSettings.defaultMode === m
                          ? 'bg-[#A58D66]/20 border-[#A58D66] text-[#DFCCA8] font-bold'
                          : 'bg-[#080f14] border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.autoSave}
                    onChange={e => setLocalSettings({ ...localSettings, autoSave: e.target.checked })}
                    className="w-4 h-4 rounded accent-[#A58D66]"
                  />
                  <div>
                    <span className="text-slate-300 font-bold">Auto-save circuits</span>
                    <p className="text-[11px] text-slate-500 font-sans mt-0.5">Continuously preserve circuit nets and schematic layout changes.</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.soundEffects}
                    onChange={e => setLocalSettings({ ...localSettings, soundEffects: e.target.checked })}
                    className="w-4 h-4 rounded accent-[#A58D66]"
                  />
                  <div>
                    <span className="text-slate-300 font-bold">Audio buzzer & relays simulation</span>
                    <p className="text-[11px] text-slate-500 font-sans mt-0.5">Synthesize acoustic clicks for relays, solenoids, and 555 piezo buzzers.</p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* 2. Editor Tab */}
          {activeTab === 'editor' && (
            <div className="space-y-5 font-mono text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Canvas Grid Style</label>
                <div className="flex gap-2">
                  {(['dots', 'lines', 'none'] as const).map(style => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => setLocalSettings({ ...localSettings, gridStyle: style })}
                      className={`px-4 py-2 rounded-lg border capitalize cursor-pointer transition-colors ${
                        localSettings.gridStyle === style
                          ? 'bg-[#A58D66]/20 border-[#A58D66] text-[#DFCCA8] font-bold'
                          : 'bg-[#080f14] border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Wire Auto-Routing</label>
                <div className="flex gap-2">
                  {(['orthogonal', 'direct'] as const).map(w => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => setLocalSettings({ ...localSettings, wireRouting: w })}
                      className={`px-4 py-2 rounded-lg border capitalize cursor-pointer transition-colors ${
                        localSettings.wireRouting === w
                          ? 'bg-[#A58D66]/20 border-[#A58D66] text-[#DFCCA8] font-bold'
                          : 'bg-[#080f14] border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {w === 'orthogonal' ? 'Orthogonal (Manhattan 90°)' : 'Direct Point-to-Point'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-white/5 space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.snapToGrid}
                    onChange={e => setLocalSettings({ ...localSettings, snapToGrid: e.target.checked })}
                    className="w-4 h-4 rounded accent-[#A58D66]"
                  />
                  <div>
                    <span className="text-slate-300 font-bold">Snap to Grid (20px standard)</span>
                    <p className="text-[11px] text-slate-500 font-sans mt-0.5">Automatically align pins and junction nodes to the standard engineering grid.</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localSettings.showComponentLabels}
                    onChange={e => setLocalSettings({ ...localSettings, showComponentLabels: e.target.checked })}
                    className="w-4 h-4 rounded accent-[#A58D66]"
                  />
                  <div>
                    <span className="text-slate-300 font-bold">Show Component Designators & Values</span>
                    <p className="text-[11px] text-slate-500 font-sans mt-0.5">Render text labels (e.g. R1: 220Ω, C1: 10µF) above symbols.</p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* 3. Simulation Engine Tab */}
          {activeTab === 'simulation' && (
            <div className="space-y-5 font-mono text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Numerical Integration Step (dt)</label>
                <select
                  value={localSettings.simStepMs}
                  onChange={e => setLocalSettings({ ...localSettings, simStepMs: Number(e.target.value) })}
                  className="px-3 py-2 rounded-lg bg-[#080f14] border border-white/10 text-slate-300 focus:outline-none focus:border-[#A58D66]"
                >
                  <option value={0.1}>0.1 ms (10kHz High-Resolution Audio/RF)</option>
                  <option value={1.0}>1.0 ms (1kHz Balanced General Purpose)</option>
                  <option value={10.0}>10.0 ms (100Hz Low CPU / Power Systems)</option>
                </select>
              </div>

              <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 space-y-2">
                <div className="text-xs font-bold text-[#10b981] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Mixed-Signal SPICE Kernel Status: Calibrated</span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                  The numerical kernel evaluates nodal admittance matrices using Newton-Raphson iterations with dynamic gear-stepping for non-linear diodes and BJTs.
                </p>
              </div>

              <label className="flex items-center gap-3 cursor-pointer pt-2 border-t border-white/5">
                <input
                  type="checkbox"
                  checked={localSettings.autoOpenCopilotOnDrcFailure}
                  onChange={e => setLocalSettings({ ...localSettings, autoOpenCopilotOnDrcFailure: e.target.checked })}
                  className="w-4 h-4 rounded accent-[#A58D66]"
                />
                <div>
                  <span className="text-slate-300 font-bold">Auto-trigger AI Copilot on Design Rule Check (DRC) violation</span>
                  <p className="text-[11px] text-slate-500 font-sans mt-0.5">Let KITT inspect short circuits, over-current, and back-EMF spikes automatically.</p>
                </div>
              </label>
            </div>
          )}

          {/* 4. Team & Workspace Tab */}
          {activeTab === 'team' && (
            <div className="space-y-5 font-mono text-xs">
              <div>
                <h3 className="text-sm font-bold text-[#E5E1DD] mb-1">Collaborators & Permissions</h3>
                <p className="text-[11px] text-slate-400 font-sans">1 active member in this sovereign lab workspace.</p>
              </div>

              <div className="divide-y divide-white/5 border border-white/10 rounded-xl overflow-hidden">
                <div className="p-3.5 flex items-center justify-between bg-black/40">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#A58D66] text-[#080f14] font-bold flex items-center justify-center">
                      OP
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#E5E1DD]">Om Prakash</span>
                      <span className="text-[11px] text-slate-500 block">om@kitt-engineering.io</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#A58D66]/20 text-[#DFCCA8] border border-[#A58D66]/30">
                    OWNER
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => alert('Invite link copied to clipboard!')}
                  className="px-3.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
                >
                  + Generate Invite Link
                </button>
              </div>
            </div>
          )}

          {/* 5. Account & Plan Tab */}
          {activeTab === 'account' && (
            <div className="space-y-5 font-mono text-xs">
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#A58D66]/15 to-transparent border border-[#A58D66]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#A58D66] font-bold">Active Subscription</span>
                  <h3 className="text-base font-bold text-[#E5E1DD] mt-0.5">Student Explorer Tier</h3>
                  <p className="text-[11px] text-slate-400 font-sans mt-1">8 of 10 daily AI autonomous hardware generation credits available.</p>
                </div>
                <button
                  onClick={onOpenUpgradeModal}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#A58D66] to-[#8C7654] hover:from-[#bfa378] hover:to-[#A58D66] text-[#080f14] font-bold text-xs shadow-md transition-all cursor-pointer self-start sm:self-auto"
                >
                  Upgrade to Pro
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-slate-300">
                <div className="p-3 bg-black/40 rounded-lg border border-white/5">
                  <span className="text-slate-500 text-[10px] block">SPICE SOLVER</span>
                  <span className="font-bold text-sm text-[#10b981]">Standard Dual-Channel</span>
                </div>
                <div className="p-3 bg-black/40 rounded-lg border border-white/5">
                  <span className="text-slate-500 text-[10px] block">KICAD / GERBER EXPORTS</span>
                  <span className="font-bold text-sm text-[#DFCCA8]">Enabled (Free)</span>
                </div>
              </div>
            </div>
          )}

          {/* 6. Keyboard Shortcuts Cheatsheet Tab */}
          {activeTab === 'shortcuts' && (
            <div className="space-y-4 font-mono text-xs">
              <h3 className="text-sm font-bold text-[#E5E1DD] mb-2">IDE & Laboratory Shortcuts</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: '⌘K / Ctrl+K', desc: 'Open Command Palette & search' },
                  { key: 'Space', desc: 'Run / Pause simulation clock' },
                  { key: 'R', desc: 'Rotate selected component 90°' },
                  { key: 'Delete / Backspace', desc: 'Delete selected component' },
                  { key: 'Ctrl+S', desc: 'Save circuit state' },
                  { key: 'Ctrl+E', desc: 'Export circuit (KiCad/Gerber/BOM)' },
                  { key: 'Tab', desc: 'Toggle KITT AI Copilot drawer' },
                  { key: 'Esc', desc: 'Clear selection / Close modals' },
                  { key: '+ / -', desc: 'Zoom in / out on canvas' },
                  { key: '0', desc: 'Reset zoom & center canvas' },
                ].map(sc => (
                  <div key={sc.key} className="p-2.5 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between">
                    <span className="text-slate-400 font-sans text-[11px]">{sc.desc}</span>
                    <kbd className="px-2 py-0.5 rounded bg-white/10 text-[#DFCCA8] border border-white/10 text-[10px] font-bold">
                      {sc.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
