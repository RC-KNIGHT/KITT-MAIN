import React from 'react';
import { X, Check, Zap, Sparkles, Crown, ShieldCheck } from 'lucide-react';
import { ECOSYSTEM_TIERS } from '../../../utils/ecosystemStore';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-100 font-sans">
      <div 
        className="w-full max-w-3xl bg-[#0c161d] border border-[#A58D66]/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#A58D66]/20 bg-[#080f14]/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#A58D66]/20 border border-[#A58D66]/30 flex items-center justify-center text-[#DFCCA8]">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold font-mono text-[#E5E1DD]">KITT Engineering Tiers</h2>
              <p className="text-xs text-slate-400">Unlock autonomous copilot reasoning, unlimited SPICE runs, and KiCad exports</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tiers Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#080f14]/50">
          {ECOSYSTEM_TIERS.slice(0, 3).map((tier, idx) => {
            const isPro = tier.name === 'Pro Engineer';
            return (
              <div
                key={tier.name}
                className={`rounded-xl p-4 border flex flex-col justify-between transition-all relative ${
                  isPro
                    ? 'bg-[#A58D66]/15 border-[#A58D66] shadow-[0_0_25px_rgba(165,141,102,0.2)] ring-1 ring-[#A58D66]'
                    : 'bg-[#0c161d] border-white/10'
                }`}
              >
                {isPro && (
                  <span className="absolute -top-2.5 right-4 text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#A58D66] text-[#080f14]">
                    MOST POPULAR
                  </span>
                )}

                <div>
                  <h3 className="text-sm font-bold font-mono text-[#E5E1DD]">{tier.name}</h3>
                  <div className="mt-2 mb-3">
                    <span className="text-2xl font-bold font-mono text-[#E5E1DD]">${tier.monthlyPrice}</span>
                    <span className="text-xs text-slate-400 font-mono"> / month</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug mb-4">{tier.desc}</p>

                  <ul className="space-y-2 text-xs font-mono text-slate-300">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#10b981]" />
                      <span>{tier.credits} AI Synthesis Credits</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#10b981]" />
                      <span>{tier.storageGb} GB Cloud Storage</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#10b981]" />
                      <span>{isPro ? 'Priority 4-ch SPICE Solver' : 'Basic 2-ch SPICE Solver'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#10b981]" />
                      <span>{isPro ? 'Direct KiCad & Gerber Zip' : 'PNG & SVG Export'}</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-5">
                  <button
                    onClick={() => {
                      alert(`Selected ${tier.name}! Your workspace credits have been upgraded.`);
                      onClose();
                    }}
                    className={`w-full py-2 px-3 rounded-lg font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isPro
                        ? 'bg-gradient-to-r from-[#A58D66] to-[#8C7654] text-[#080f14] shadow-[0_0_12px_rgba(165,141,102,0.3)]'
                        : 'bg-white/10 hover:bg-white/20 text-[#E5E1DD]'
                    }`}
                  >
                    <span>{idx === 0 ? 'Current Plan' : 'Select Plan'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#080f14] border-t border-white/5 flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2 text-[#10b981]">
            <ShieldCheck className="w-4 h-4" />
            <span>Academic verification instant discounts available</span>
          </div>
          <span className="text-[10px] text-slate-500">Cancel anytime. 100% money back guarantee.</span>
        </div>
      </div>
    </div>
  );
};
