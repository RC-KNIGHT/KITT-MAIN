import React, { useState } from 'react';
import { motion } from 'motion/react';
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
import { Tilt3DCard } from './Tilt3DCard';
import { circuitAudio } from '../utils/audio';

export const PricingSection: React.FC = () => {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-transparent relative border-t border-[#A58D66]/15">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto space-y-4 mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#A58D66]/20 border border-[#A58D66]/40 text-[#A58D66] text-xs font-mono uppercase tracking-widest animate-ambition shadow-lg shadow-[#A58D66]/10">
            <Zap className="w-3.5 h-3.5 text-[#A58D66]" />
            <span>POWER MATRIX • 70% OFF PROMO</span>
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

        {/* Special Offer Alert Banner for New Registrations */}
        <div className="mb-10 max-w-3xl mx-auto p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#A58D66]/20 via-[#407E8C]/20 to-[#A58D66]/20 border-2 border-[#A58D66]/60 shadow-[0_0_30px_rgba(165,141,102,0.25)] backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#A58D66] to-[#76B4C2] flex flex-col items-center justify-center shrink-0 shadow-lg text-[#080f14] font-black leading-none">
              <span className="text-base font-extrabold">70%</span>
              <span className="text-[9px] uppercase tracking-tighter font-mono">OFF</span>
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <span className="text-xs font-bold font-mono tracking-widest text-[#A58D66] uppercase">
                  SPECIAL OFFER FOR NEW REGISTRATIONS
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-400 font-mono border border-emerald-400/30 animate-pulse font-bold">
                  LIMITED INAUGURAL SUBSIDY
                </span>
              </div>
              <p className="text-sm font-cinzel font-bold text-[#E5E1DD] mt-1">
                70% Price Slash Auto-Applied for All New Hardware Engineers
              </p>
              <p className="text-xs text-[#E5E1DD]/70 font-light mt-0.5">
                Inaugural national subsidy empowering Indian electronics students, VLSI researchers, and maker labs with enterprise EDA power at a fraction of the cost.
              </p>
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-1.5 bg-[#080f14]/80 px-3.5 py-1.5 rounded-xl border border-[#A58D66]/40 text-xs font-mono text-[#DFCCA8]">
            <Sparkles className="w-3.5 h-3.5 text-[#A58D66]" />
            <span>Auto-Applied</span>
          </div>
        </div>

        {/* Billing Cycle Toggle */}
        <div className="flex items-center justify-center gap-3 mb-14 font-mono">
          <span className={`text-xs font-semibold ${!isAnnual ? 'text-[#E5E1DD]' : 'text-[#E5E1DD]/50'}`}>
            Monthly Cycle
          </span>

          <button
            onClick={() => {
              circuitAudio.playClick();
              setIsAnnual(!isAnnual);
            }}
            className="w-13 h-7 rounded-full bg-[#0c141a] border border-[#A58D66]/35 p-1 relative transition-colors cursor-pointer"
          >
            <motion.div
              animate={{ x: isAnnual ? 24 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="w-5 h-5 rounded-full bg-gradient-to-r from-[#A58D66] to-[#BFA378]"
            />
          </button>

          <span className={`text-xs font-semibold flex items-center gap-1.5 ${isAnnual ? 'text-[#E5E1DD]' : 'text-[#E5E1DD]/50'}`}>
            <span>Annual Cycle</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#407E8C]/25 text-[#76B4C2] border border-[#407E8C]/35 font-bold">
              EXTRA 20% OFF
            </span>
          </span>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PRICING_PLANS.map((plan, idx) => {
            const numPrice = isAnnual ? plan.yearlyPrice : plan.monthlyPrice;
            const originalPrice = isAnnual ? plan.originalYearlyPrice : plan.originalMonthlyPrice;
            const priceStr = numPrice === 0 ? '$0' : `$${numPrice}`;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 28, rotateX: 6 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.55, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="h-full"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <Tilt3DCard
                  tiltMaxAngle={3.5}
                  scale={1.01}
                  glareOpacity={0.16}
                  className={`h-full rounded-2xl p-6 flex flex-col justify-between transition-colors duration-300 relative transparent-glass-card backdrop-blur-[3px] ${
                    plan.isPopular
                      ? 'border-2 border-[#A58D66] shadow-[0_20px_50px_rgba(165,141,102,0.25)] bg-[#0c161d]/40'
                      : 'border border-[#A58D66]/25 hover:border-[#A58D66]/60 bg-[#080f14]/30'
                  }`}
                >
                {/* Promo or Popular Badge */}
                {plan.isPopular ? (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#A58D66] text-[#080f14] text-[10px] font-mono font-bold tracking-wider uppercase shadow-md flex items-center gap-1 whitespace-nowrap">
                    <Sparkles className="w-3 h-3" />
                    <span>Signature Edition • 70% OFF</span>
                  </div>
                ) : plan.promoBadge ? (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-[#407E8C] text-[#080f14] text-[9.5px] font-mono font-bold tracking-wider uppercase shadow-md whitespace-nowrap">
                    70% OFF PROMO
                  </div>
                ) : null}

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
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-3xl sm:text-4xl font-bold font-cinzel text-[#E5E1DD]">
                        {priceStr}
                      </span>
                      {plan.id !== 'free' && (
                        <>
                          {originalPrice && originalPrice > 0 && (
                            <span className="text-base sm:text-lg text-[#E5E1DD]/40 line-through font-mono">
                              ${originalPrice}
                            </span>
                          )}
                          <span className="text-xs text-[#A58D66] font-mono">
                            / month
                          </span>
                        </>
                      )}
                    </div>
                    {plan.id !== 'free' && (
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-400/15 text-emerald-400 border border-emerald-400/30 font-bold">
                          70% OFF
                        </span>
                        <span className="text-[11px] text-[#76B4C2] font-mono">
                          New Registrations Special
                        </span>
                      </div>
                    )}
                    {isAnnual && plan.id !== 'free' && (
                      <span className="text-[10.5px] text-[#A58D66] font-mono block mt-1">
                        Billed annually (extra savings applied)
                      </span>
                    )}
                  </div>

                  {/* AI Credits Meter indicator */}
                  {/* AI Credits Meter indicator */}
                  <div className="p-3 bg-[#080f14]/60 rounded-xl border border-[#A58D66]/15 space-y-1">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-[#E5E1DD]/60">Synthesis Units:</span>
                      <span className="text-[#A58D66] font-bold">{plan.aiCredits}</span>
                    </div>
                    <div className="w-full h-1.5 bg-[#121c22] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#407E8C] to-[#A58D66] rounded-full transition-all duration-500"
                        style={{
                          width:
                            plan.id === 'free'
                              ? '20%'
                              : plan.id === 'pioneer'
                              ? '45%'
                              : plan.id === 'pro'
                              ? '75%'
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
                    href="#/kitt-ai"
                    onClick={() => circuitAudio.playClick()}
                    className={`w-full py-3 rounded-xl font-semibold text-xs text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98] ${
                      plan.isPopular
                        ? 'bg-gradient-to-r from-[#A58D66] to-[#8C7654] hover:from-[#BFA378] hover:to-[#A58D66] text-[#080f14] font-bold shadow-[0_0_20px_rgba(165,141,102,0.35)]'
                        : 'bg-[#407E8C]/15 hover:bg-[#407E8C]/25 text-[#E5E1DD] border border-[#407E8C]/35'
                    }`}
                  >
                    <span>{plan.ctaText}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                </Tilt3DCard>
              </motion.div>
            );
          })}
        </div>

        {/* Enterprise & Education Banner */}
        <div className="mt-12 rounded-2xl surreal-card-gold p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 border border-[#A58D66]/30">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-lg font-bold font-cinzel text-[#E5E1DD]">
              IITs, NITs, BITS & AICTE Research Laboratories
            </h4>
            <p className="text-xs text-[#E5E1DD]/70 max-w-xl font-light">
              We provide complimentary institutional lab licenses, hardware testbench compute, and curriculum kits for Indian engineering faculties, robotics teams, and student deep-tech incubators.
            </p>
          </div>

          <a
            href="mailto:kitt.ai.team@gmail.com?subject=Indian%20Institutional%20Hardware%20Grant%20Application"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#A58D66] to-[#8C7654] hover:from-[#BFA378] hover:to-[#A58D66] text-[#080f14] font-bold text-xs transition-all whitespace-nowrap shadow-[0_0_15px_rgba(165,141,102,0.3)]"
          >
            Apply for Indian Academic Grants
          </a>
        </div>
      </div>
    </section>
  );
};
