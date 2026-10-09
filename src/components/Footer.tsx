import React, { useState } from 'react';
import { 
  Sparkles, 
  Layers, 
  Cpu, 
  Calculator, 
  Activity,
  Heart,
  Mail,
  Copy,
  Check
} from 'lucide-react';
import { KittLogo } from './KittLogo';
import { circuitAudio } from '../utils/audio';

export const Footer: React.FC = () => {
  const [copiedEmail, setCopiedEmail] = useState(false);

  const handleCopyEmail = () => {
    circuitAudio.playClick();
    navigator.clipboard.writeText('kitt.ai.team@gmail.com');
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const SOCIAL_CHANNELS = [
    {
      id: 'instagram',
      name: 'Instagram',
      url: 'https://www.instagram.com/kitt.ai.team/',
      icon: (
        <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
      )
    },
    {
      id: 'x',
      name: 'X (Twitter)',
      url: 'https://x.com/kittaiteam',
      icon: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      )
    },
    {
      id: 'youtube',
      name: 'YouTube',
      url: 'https://www.youtube.com/@kittaiteam',
      icon: (
        <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
          <polygon points="10 15 15 12 10 9" fill="currentColor" />
        </svg>
      )
    },
    {
      id: 'email',
      name: 'Email (Direct)',
      url: 'mailto:kitt.ai.team@gmail.com',
      icon: (
        <Mail className="w-4 h-4 text-current" />
      )
    }
  ];

  return (
    <footer className="bg-transparent border-t border-[#FFFFFF]/20 text-[#F5F5F5]/70 text-xs relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Col 1 & 2: Brand & Tagline */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <KittLogo size={36} showGlow={true} />
              <span className="text-xl font-bold tracking-widest text-[#F5F5F5] font-mono">
                KITT <span className="text-[#FFFFFF] font-serif italic">ECOSYSTEM</span>
              </span>
            </div>

            <p className="text-sm font-serif italic max-w-sm animate-text-shimmer font-semibold">
              "Where Ideas Become Inventions."
            </p>

            <p className="text-xs text-[#F5F5F5]/65 max-w-sm leading-relaxed">
              The premier AI-native hardware creation sanctuary. Turn conversational thought into working silicon.
            </p>

            <div className="flex flex-col gap-2.5 pt-2">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[#8F8F8F] animate-pulse shadow-[0_0_8px_#8F8F8F]" />
                <span className="text-[11px] font-mono text-[#8F8F8F]">
                  All Ecosystem Portals Synchronized
                </span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <a
                  href="mailto:kitt.ai.team@gmail.com"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#141415] border border-[#FFFFFF]/30 hover:border-[#FFFFFF] text-[11px] font-mono text-[#E8E8E8] hover:text-[#F5F5F5] transition-all group shadow-sm"
                  title="Official Team KITT Email"
                >
                  <Mail className="w-3.5 h-3.5 text-[#FFFFFF] group-hover:scale-110 transition-transform" />
                  <span>kitt.ai.team@gmail.com</span>
                </a>
              </div>
            </div>
          </div>

          {/* Col 3: Engineering Resources */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-[#FFFFFF]">
              Synthesis & Docs
            </h4>
            <ul className="space-y-2">
              <li>
                <a 
                  href="#/workspace" 
                  className="hover:text-[#F5F5F5] transition-colors"
                >
                  3D Component Library
                </a>
              </li>
              <li>
                <a href="#ai-agent" className="hover:text-[#F5F5F5] transition-colors">
                  Autonomous Synthesis Engine
                </a>
              </li>
              <li>
                <a href="#journey" className="hover:text-[#F5F5F5] transition-colors">
                  Student to Pro Learning Path
                </a>
              </li>
              <li>
                <a href="#community" className="hover:text-[#F5F5F5] transition-colors">
                  Salon of Open Hardware
                </a>
              </li>
            </ul>
          </div>

          {/* Col 5: Company & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-[#FFFFFF]">
              Collective & Governance
            </h4>
            <ul className="space-y-2">
              <li>
                <a href="#team" className="hover:text-[#F5F5F5] text-[#FFFFFF] font-medium transition-colors flex items-center gap-1">
                  <span>Core Team & Architects</span>
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-[#F5F5F5] transition-colors">
                  Pricing & Synthesis Units
                </a>
              </li>
              <li>
                <a href="#journey" className="hover:text-[#F5F5F5] transition-colors">
                  Academic Classrooms
                </a>
              </li>
              <li>
                <span className="text-[#F5F5F5]/40">Security & DRC Sandbox</span>
              </li>
              <li>
                <span className="text-[#F5F5F5]/40">Privacy & Sovereign IP Terms</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Official Social Media Channels Dock & Direct Email Action */}
        <div className="mt-12 pt-6 border-t border-[#FFFFFF]/20 flex flex-col lg:flex-row items-center justify-between gap-5">
          <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
            <span className="text-xs font-mono font-bold tracking-widest uppercase text-[#FFFFFF]">
              Official Channels
            </span>
            <span className="text-[11px] font-mono text-[#F5F5F5]/50 italic hidden sm:inline">
              — Connect with the vanguard
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3.5">
            {/* Direct Visible Email Button & One-Click Copy */}
            <div className="flex items-center rounded-xl bg-[#141415]/90 border border-[#FFFFFF]/35 p-1 shadow-lg hover:border-[#FFFFFF] transition-all">
              <a
                href="mailto:kitt.ai.team@gmail.com"
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono font-semibold text-[#E8E8E8] hover:text-[#F5F5F5] transition-colors"
                title="Send email to Team KITT"
              >
                <Mail className="w-4 h-4 text-[#FFFFFF] shrink-0" />
                <span className="tracking-tight">kitt.ai.team@gmail.com</span>
              </a>
              <button
                onClick={handleCopyEmail}
                className="p-1.5 px-2 rounded-lg hover:bg-[#FFFFFF]/20 text-[#F5F5F5]/70 hover:text-[#E8E8E8] transition-colors cursor-pointer border-l border-[#FFFFFF]/20 flex items-center gap-1 text-[11px] font-mono"
                title="Copy email to clipboard"
              >
                {copiedEmail ? (
                  <span className="flex items-center gap-1 text-zinc-400 font-bold">
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Copy className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Copy</span>
                  </span>
                )}
              </button>
            </div>

            {/* Social Icons Dock */}
            <div className="flex items-center gap-2.5">
              {SOCIAL_CHANNELS.map((item) => (
                <a
                  key={item.id}
                  href={item.url}
                  target={item.url.startsWith('mailto:') ? undefined : "_blank"}
                  rel={item.url.startsWith('mailto:') ? undefined : "noopener noreferrer"}
                  title={`${item.name} (Official Channel)`}
                  onClick={() => circuitAudio.playClick()}
                  className="w-9 h-9 rounded-xl bg-[#141415]/85 border border-[#FFFFFF]/30 hover:border-[#FFFFFF] hover:bg-[#8F8F8F]/20 flex items-center justify-center text-[#F5F5F5]/80 hover:text-[#FFFFFF] transition-all hover:scale-110 active:scale-95 shadow-lg hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] cursor-pointer"
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Copyright Strip */}
        <div className="mt-8 pt-6 border-t border-[#FFFFFF]/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#F5F5F5]/50 font-mono">
          <div>
            © {new Date().getFullYear()} KITT ECOSYSTEM. Synthesized for innovators, electrical engineers, and students of creation.
          </div>
          <div className="flex items-center gap-2 text-right">
            <span className="text-[#FFFFFF] animate-pulse">✦</span>
            <span className="text-[#F5F5F5]/80 font-serif italic text-xs tracking-wide">
              Engineered for the vanguard of builders who forge hardware that endures.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
