import React, { useState } from 'react';
import { 
  CreditCard, 
  Check, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  HelpCircle,
  Cpu,
  ExternalLink
} from 'lucide-react';
import { PRICING_PLANS } from '../data/ecosystem';

export const PricingSection: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-transparent relative border-t border-[#A58D66]/15">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#A58D66]/20 border border-[#A58D66]/40 text-[#A58D66] text-xs font-mono uppercase tracking-widest animate-ambition shadow-lg shadow-[#A58D66]/10">
            <Zap className="w-3.5 h-3.5 text-[#A58D66]" />
            <span>POWER MATRIX</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold font-cinzel text-[#E5E1DD] tracking-tight leading-tight animate-title-breathe">
            Stop Playing. <br />
            <span className="animate-text-shimmer italic font-cormorant font-normal block mt-1 text-4xl sm:text-6xl lg:text-7xl animate-text-glow">
              Command Silicon.
            </span>
          </h2>

          <p className="text-base sm:text-lg text-[#E5E1DD] max-w-xl mx-auto font-serif italic leading-relaxed pt-2 animate-gold-radiance font-medium">
            "Buy and become what you are capable of. The free tier is for spectators — Pro Lab is where you dominate."
          </p>
        </div>

        {/* Billing Cycle Toggle */}
        <div className="flex items-center justify-center gap-3 mb-14 font-mono">
          <span className={`text-xs font-semibold ${!isAnnual ? 'text-[#E5E1DD]' : 'text-[#E5E1DD]/50'}`}>
            Monthly Cycle
          </span>

          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className="w-13 h-7 rounded-full bg-[#0c141a] border border-[#A58D66]/35 p-1 relative transition-colors cursor-pointer"
          >
            <div
              className={`w-5 h-5 rounded-full bg-gradient-to-r from-[#A58D66] to-[#BFA378] transition-transform ${
                isAnnual ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>

          <span className={`text-xs font-semibold flex items-center gap-1.5 ${isAnnual ? 'text-[#E5E1DD]' : 'text-[#E5E1DD]/50'}`}>
            <span>Annual Cycle</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#407E8C]/25 text-[#76B4C2] border border-[#407E8C]/35 font-bold">
              SAVE 20%
            </span>
          </span>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRICING_PLANS.map((plan) => {
            const numPrice = isAnnual ? plan.yearlyPrice : plan.monthlyPrice;
            const priceStr = numPrice === 0 ? '$0' : `$${numPrice}`;

            return (
              <div
                key={plan.id}
                className={`rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 relative transparent-glass-card backdrop-blur-[3px] ${
                  plan.isPopular
                    ? 'border-2 border-[#A58D66] shadow-[0_20px_50px_rgba(165,141,102,0.25)] scale-[1.03] bg-[#0c161d]/40'
                    : 'border border-[#A58D66]/25 hover:border-[#A58D66]/60 bg-[#080f14]/30 hover:scale-[1.01]'
                }`}
              >
                {/* Popular Badge */}
                {plan.isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#A58D66] text-[#080f14] text-[10px] font-mono font-bold tracking-wider uppercase shadow-md">
                    Signature Edition
                  </div>
                )}

                <div className="space-y-4">
                  {/* Title & Tagline */}
                  <div>
                    <h3 className="text-xl font-bold font-cinzel text-[#E5E1DD]">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-[#E5E1DD]/60 mt-1 min-h-[32px] font-light">
                      {plan.description}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="pt-2 border-t border-[#A58D66]/15">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-bold font-cinzel text-[#E5E1DD]">
                        {priceStr}
                      </span>
                      {plan.id !== 'free' && (
                        <span className="text-xs text-[#A58D66] font-mono">
                          / month
                        </span>
                      )}
                    </div>
                    {isAnnual && plan.id !== 'free' && (
                      <span className="text-[11px] text-[#76B4C2] font-mono block mt-1">
                        Billed annually (20% savings)
                      </span>
                    )}
                  </div>

                  {/* AI Credits Meter indicator */}
                  <div className="p-3 bg-[#080f14]/60 rounded-xl border border-[#A58D66]/15 space-y-1">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-[#E5E1DD]/60">Synthesis Units:</span>
                      <span className="text-[#A58D66] font-bold">{plan.aiCredits}</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#121c22] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#407E8C] to-[#A58D66] rounded-full"
                        style={{
                          width:
                            plan.id === 'free'
                              ? '15%'
                              : plan.id === 'pro'
                              ? '50%'
                              : plan.id === 'engineer'
                              ? '80%'
                              : '100%'
                        }}
                      />
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-2.5 pt-2">
                    <span className="text-[11px] font-semibold text-[#A58D66] uppercase tracking-wider block font-mono">
                      Capabilities:
                    </span>
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-[#E5E1DD]/80 font-light">
                        <Check className="w-4 h-4 text-[#A58D66] shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Plan CTA Button */}
                <div className="pt-6 mt-6 border-t border-[#A58D66]/15">
                  <a
                    href="https://kitt-1-0-agent.ai.studio"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full py-3 rounded-xl font-semibold text-xs text-center transition-all flex items-center justify-center gap-1.5 ${
                      plan.isPopular
                        ? 'bg-gradient-to-r from-[#A58D66] to-[#8C7654] hover:from-[#BFA378] hover:to-[#A58D66] text-[#080f14] font-bold shadow-[0_0_20px_rgba(165,141,102,0.35)]'
                        : 'bg-[#407E8C]/15 hover:bg-[#407E8C]/25 text-[#E5E1DD] border border-[#407E8C]/35'
                    }`}
                  >
                    <span>{plan.ctaText}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Enterprise & Education Banner */}
        <div className="mt-12 rounded-2xl surreal-card-gold p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 border border-[#A58D66]/30">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-lg font-bold font-cinzel text-[#E5E1DD]">
              Universities, Academies & Hardware Labs
            </h4>
            <p className="text-xs text-[#E5E1DD]/70 max-w-xl font-light">
              We provide complimentary educational licenses for engineering faculties, research labs, and student design teams.
            </p>
          </div>

          <a
            href="mailto:education@kitt.ai"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#A58D66] to-[#8C7654] hover:from-[#BFA378] hover:to-[#A58D66] text-[#080f14] font-bold text-xs transition-all whitespace-nowrap shadow-[0_0_15px_rgba(165,141,102,0.3)]"
          >
            Apply for Academic Grants
          </a>
        </div>
      </div>
    </section>
  );
};
