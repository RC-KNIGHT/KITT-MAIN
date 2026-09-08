import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Bot, 
  Cpu, 
  Binary, 
  Calculator, 
  ExternalLink, 
  Check, 
  Copy, 
  Sparkles, 
  Activity, 
  ArrowUpRight,
  ShieldCheck,
  Maximize2,
  X
} from 'lucide-react';
import { ECOSYSTEM_PRODUCTS } from '../data/ecosystem';

export const DirectEcosystemAccess: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!previewUrl) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPreviewUrl(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewUrl]);

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getProductIcon = (iconName: string) => {
    switch (iconName) {
      case 'Bot': return <Bot className="w-6 h-6 text-[#76B4C2]" />;
      case 'Cpu': return <Cpu className="w-6 h-6 text-[#A58D66]" />;
      case 'Binary': return <Binary className="w-6 h-6 text-[#E5E1DD]" />;
      case 'Calculator': return <Calculator className="w-6 h-6 text-[#A58D66]" />;
      default: return <Sparkles className="w-6 h-6 text-[#E5E1DD]" />;
    }
  };

  return (
    <section id="ecosystem-launchpad" className="py-24 px-4 sm:px-6 lg:px-8 bg-transparent relative border-y border-[#A58D66]/15">
      {/* Subtle Ambient Glow */}
      <div className="absolute inset-0 bg-surreal-grid opacity-30 pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-[#407E8C]/15 blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#A58D66]/15 border border-[#A58D66]/35 text-[#A58D66] text-xs font-mono uppercase tracking-widest animate-ambition">
            <span className="w-2 h-2 rounded-full bg-[#407E8C] animate-pulse shadow-[0_0_8px_#407E8C]" />
            <span>THE SOVEREIGN ARSENAL</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-[#E5E1DD] font-cinzel tracking-tight leading-tight animate-title-breathe">
            Four Portals. <br />
            <span className="animate-text-shimmer italic font-cormorant font-normal block mt-1 animate-text-glow">
              One Sovereign Truth.
            </span>
          </h2>

          <p className="text-base sm:text-lg text-[#E5E1DD] font-serif italic max-w-xl mx-auto leading-relaxed">
            "Spoken intent directly into verified silicon."
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {ECOSYSTEM_PRODUCTS.map((product, idx) => {
            const romanNumerals = ['I', 'II', 'III', 'IV'];
            return (
              <div
                key={product.id}
                className="relative rounded-2xl surreal-card p-6 sm:p-7 flex flex-col justify-between group shadow-xl hover:shadow-2xl"
              >
                {/* Top Badge & Operational Status */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-[#407E8C]/10 border border-[#407E8C]/30 group-hover:border-[#A58D66]/50 transition-colors">
                        {getProductIcon(product.iconName)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold text-[#A58D66] tracking-widest">
                            PORTAL {romanNumerals[idx] || 'I'}
                          </span>
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#407E8C]/20 text-[#76B4C2] border border-[#407E8C]/35">
                            {product.badge}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[#A58D66] font-mono">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#A58D66]" />
                          <span>Operational & Resonant</span>
                        </div>
                      </div>
                    </div>

                    {/* Copy Link Button */}
                    <button
                      onClick={() => handleCopyLink(product.url, product.id)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-[#A58D66]/20 text-[#E5E1DD]/60 hover:text-[#E5E1DD] transition-colors flex items-center gap-1 text-xs"
                      title="Copy URL"
                    >
                      {copiedId === product.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#A58D66]" />
                          <span className="text-[#A58D66] font-mono text-[10px]">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span className="text-[10px] hidden sm:inline">Copy Link</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Title & Tagline */}
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold font-cinzel text-[#E5E1DD] group-hover:text-[#A58D66] transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-xs font-mono text-[#76B4C2] mt-1">
                      {product.tagline}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-[#E5E1DD]/80 leading-relaxed font-light">
                    {product.shortDescription}
                  </p>

                  {/* Key Capabilities Pills */}
                  <div className="space-y-2 pt-1">
                    <span className="text-[11px] font-semibold text-[#A58D66] uppercase tracking-wider block font-mono">
                      Core Strengths:
                    </span>
                    <ul className="space-y-1.5">
                      {product.capabilities.slice(0, 3).map((cap, i) => (
                        <li key={i} className="text-xs text-[#E5E1DD]/85 flex items-center gap-2">
                          <ShieldCheck className="w-3.5 h-3.5 text-[#A58D66] shrink-0" />
                          <span>{cap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Metrics Bar */}
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#A58D66]/15">
                    {product.demoMetrics.map((metric, i) => (
                      <div key={i} className="bg-[#080f14]/60 p-2 rounded-lg text-center border border-[#A58D66]/15">
                        <div className="text-xs font-bold text-[#E5E1DD] font-mono">{metric.value}</div>
                        <div className="text-[10px] text-[#A58D66] mt-0.5 truncate">{metric.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Launch Actions */}
                <div className="pt-6 mt-4 border-t border-[#A58D66]/15 flex flex-col sm:flex-row items-center gap-3">
                  <a
                    href={product.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#A58D66] to-[#8C7654] hover:from-[#BFA378] hover:to-[#A58D66] text-[#080f14] font-bold text-xs sm:text-sm text-center shadow-[0_0_20px_rgba(165,141,102,0.35)] transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <span>Launch {product.name}</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </a>

                  <button
                    onClick={() => setPreviewUrl(product.url)}
                    className="w-full sm:w-auto py-3 px-3.5 rounded-xl bg-[#407E8C]/15 hover:bg-[#407E8C]/25 text-[#E5E1DD] border border-[#407E8C]/35 text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                    title="Inline Preview"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-[#76B4C2]" />
                    <span>Inline Peek</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Launchpad Strip */}
        <div className="mt-12 rounded-2xl surreal-card-gold p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-[#A58D66]/20 border border-[#A58D66]/40 text-[#A58D66]">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold font-cinzel text-[#E5E1DD]">Continuous Ecosystem Interoperability</h4>
              <p className="text-xs text-[#E5E1DD]/75 mt-0.5 font-light">
                Creations synthesized in DigiLogic or KITT AI synchronize in real-time with the 3D Breadboard Lab netlist.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href="https://kitt-1-0-agent.ai.studio"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 text-[#E5E1DD] border border-white/15 transition-all flex items-center gap-1.5"
            >
              <span>Visit KITT AI</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#A58D66]" />
            </a>

            <a
              href="https://kitt-ai-ravi.ai.studio"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#A58D66] to-[#8C7654] text-[#080f14] transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(165,141,102,0.3)]"
            >
              <span>Visit Workspace</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Inline Preview Modal for quick inspection - Portaled to document.body */}
      {previewUrl && typeof document !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-[9999] flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setPreviewUrl(null);
            }
          }}
        >
          <div className="surreal-card rounded-2xl w-full max-w-6xl h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-[#A58D66]/30 bg-[#080f14]">
            {/* Modal Header */}
            <div className="px-4 py-3 bg-[#080f14] border-b border-[#A58D66]/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-[#A58D66]">Previewing Portal:</span>
                <span className="text-xs font-mono text-[#E5E1DD] truncate max-w-md">{previewUrl}</span>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#E5E1DD] hover:text-[#A58D66] flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded"
                >
                  <span>Open Full Screen</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>

                <button
                  type="button"
                  onClick={() => setPreviewUrl(null)}
                  className="p-1 rounded text-[#E5E1DD]/60 hover:text-[#E5E1DD] hover:bg-white/10 transition-colors"
                  title="Close preview"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Iframe View */}
            <div className="flex-1 bg-black relative">
              <iframe
                src={previewUrl}
                title="KITT Platform Preview"
                className="w-full h-full border-none"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />
            </div>

            {/* Bottom Bar with Close Button */}
            <div className="px-4 py-2 bg-[#091116] border-t border-[#A58D66]/15 flex items-center justify-between">
              <span className="text-[11px] text-[#E5E1DD]/50 font-mono">Press ESC or click outside to dismiss</span>
              <button
                type="button"
                onClick={() => setPreviewUrl(null)}
                className="px-3 py-1.5 rounded-lg bg-[#121c22] border border-[#A58D66]/30 hover:border-[#A58D66] text-xs font-medium text-[#E5E1DD] hover:text-[#A58D66] transition-colors flex items-center gap-1.5"
              >
                <X className="w-3.5 h-3.5" />
                <span>Close Preview</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </section>
  );
};
